import { createHash, createHmac } from "node:crypto";
function config() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID?.trim(), access = process.env.R2_ACCESS_KEY_ID?.trim(), secret = process.env.R2_SECRET_ACCESS_KEY, bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!account || !access || !secret || !bucket) throw new Error("R2_NOT_CONFIGURED");
  return { endpoint: "https://" + account + ".r2.cloudflarestorage.com", access, secret, bucket };
}
const hash = (v: Buffer | string) => createHash("sha256").update(v).digest("hex");
const hmac = (k: Buffer | string, v: string) => createHmac("sha256", k).update(v).digest();
const enc = (s: string) => s.split("/").map(p => encodeURIComponent(p).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase())).join("/");
export function assertR2Configured() { config(); }
async function requestR2(method: "PUT"|"GET"|"DELETE", key: string, body?: Buffer, type?: string) {
  const c=config(), host=new URL(c.endpoint).host, path="/" + enc(c.bucket) + "/" + enc(key), payload=hash(body ?? ""), now=new Date().toISOString().replace(/[:-]|\.\d{3}/g,""), day=now.slice(0,8);
  const headers: Record<string,string>={host,"x-amz-content-sha256":payload,"x-amz-date":now};
  if(type) headers["content-type"]=type;
  const names=Object.keys(headers).sort(), signed=names.join(";"), canonical=names.map(n=>n+":"+headers[n].trim()+"\n").join("");
  const scope=day+"/auto/s3/aws4_request", req=method+"\n"+path+"\n\n"+canonical+signed+"\n"+payload;
  const toSign="AWS4-HMAC-SHA256\n"+now+"\n"+scope+"\n"+hash(req);
  const k=hmac(hmac(hmac(hmac("AWS4"+c.secret,day),"auto"),"s3"),"aws4_request");
  const sig=createHmac("sha256",k).update(toSign).digest("hex");
  const hs=new Headers(); for(const [n,v] of Object.entries(headers)) if(n!=="host") hs.set(n,v);
  hs.set("Authorization","AWS4-HMAC-SHA256 Credential="+c.access+"/"+scope+", SignedHeaders="+signed+", Signature="+sig);
  const res=await fetch(c.endpoint+path,{method,headers:hs,body:method==="PUT" ? body as unknown as BodyInit : undefined,cache:"no-store"});
  if(!res.ok){console.error("[RideMitra] R2 error",method,res.status,(await res.text().catch(()=> "")).slice(0,200));throw new Error("R2_REQUEST_FAILED");}
  return res;
}
export async function putR2Object(key:string,body:Buffer,type:string){await requestR2("PUT",key,body,type);}
export async function getR2Object(key:string){return requestR2("GET",key);}
export async function deleteR2Object(key:string){await requestR2("DELETE",key);}
