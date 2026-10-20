import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSchema, getSql } from "@/lib/db";
import { assertR2Configured, deleteR2Object, putR2Object } from "@/lib/r2";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const types=["licence","rc","insurance","selfie"] as const;
function mimeOf(b:Buffer):string|null {
 if(b.length>=5&&b.subarray(0,5).toString("ascii")==="%PDF-")return "application/pdf";
 if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)return "image/jpeg";
 if(b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return "image/png";
 if(b.length>=12&&b.subarray(0,4).toString("ascii")==="RIFF"&&b.subarray(8,12).toString("ascii")==="WEBP")return "image/webp";
 return null;
}
function ext(m:string){return m==="application/pdf"?"pdf":m==="image/png"?"png":m==="image/webp"?"webp":"jpg";}
function fail(e:unknown){
 const m=e instanceof Error?e.message:"";
 const known:Record<string,[number,string]>={AUTH_REQUIRED:[401,"Please sign in before submitting documents."],R2_NOT_CONFIGURED:[503,"Private Cloudflare R2 storage is not configured. No files were saved."],R2_REQUEST_FAILED:[502,"Private storage could not accept the upload. Please try again later."],SUBMISSION_PENDING:[409,"Your submission is already waiting for review."],ALREADY_APPROVED:[409,"This driver is already approved. Contact support for changes."],INVALID_DOCUMENTS:[400,"Upload all four required files: licence, RC, insurance and selfie."],FILE_TOO_LARGE:[413,"Each file must be 10 MB or smaller and total upload must be 25 MB or smaller."],INVALID_FILE_TYPE:[400,"A file type is unsupported or does not match its contents. Selfie must be an image."]};
 if(known[m])return NextResponse.json({error:known[m][1]},{status:known[m][0]});
 console.error("[RideMitra] document upload failed",e);return NextResponse.json({error:"Unable to submit documents right now."},{status:500});
}
export async function POST(request:NextRequest){
 const uploaded:string[]=[];
 try{
  const user=await getCurrentUser();if(!user)throw new Error("AUTH_REQUIRED");
  assertR2Configured();await ensureSchema();const form=await request.formData();
  const files:{type:string;bytes:Buffer;mime:string;name:string}[]=[];let total=0;
  for(const type of types){
   const file=form.get(type);if(!(file instanceof File)||!file.size)throw new Error("INVALID_DOCUMENTS");
   if(file.size>10*1024*1024)throw new Error("FILE_TOO_LARGE");
   const bytes=Buffer.from(await file.arrayBuffer());total+=bytes.length;const mime=mimeOf(bytes);
   if(!mime||(type==="selfie"&&mime==="application/pdf")||(file.type&&file.type!==mime))throw new Error("INVALID_FILE_TYPE");
   files.push({type,bytes,mime,name:file.name.replace(/[\\/\u0000-\u001f\u007f]/g,"_").slice(0,180)||"document"});
  }
  if(total>25*1024*1024)throw new Error("FILE_TOO_LARGE");
  const sql=getSql(), check=await sql`select status from public.driver_verifications where user_id=${user.id} limit 1`;
  if(check[0]?.status==="approved")throw new Error("ALREADY_APPROVED");
  if(check[0]?.status==="pending")throw new Error("SUBMISSION_PENDING");
  const saved:{type:string;key:string;name:string;mime:string;size:number}[]=[];
  for(const f of files){const key="drivers/"+user.id+"/"+f.type+"/"+randomUUID()+"."+ext(f.mime);await putR2Object(key,f.bytes,f.mime);uploaded.push(key);saved.push({type:f.type,key,name:f.name,mime:f.mime,size:f.bytes.length});}
  const old:string[]=[];
  await sql.begin(async tx=>{
   const existing=await tx`select status from public.driver_verifications where user_id=${user.id} for update`;
   if(existing[0]?.status==="approved")throw new Error("ALREADY_APPROVED");
   if(existing[0]?.status==="pending")throw new Error("SUBMISSION_PENDING");
   const previous=await tx`select object_key from public.driver_documents where user_id=${user.id}`;old.push(...previous.map(r=>(r as {object_key:string}).object_key));
   await tx`insert into public.driver_verifications(user_id,status,rejection_reason,reviewed_by,reviewed_at,submitted_at,updated_at) values(${user.id},'pending',null,null,null,now(),now()) on conflict(user_id) do update set status='pending',rejection_reason=null,reviewed_by=null,reviewed_at=null,submitted_at=now(),updated_at=now()`;
   for(const f of saved)await tx`insert into public.driver_documents(user_id,document_type,object_key,original_name,content_type,size_bytes,status) values(${user.id},${f.type},${f.key},${f.name},${f.mime},${f.size},'pending') on conflict(user_id,document_type) do update set object_key=excluded.object_key,original_name=excluded.original_name,content_type=excluded.content_type,size_bytes=excluded.size_bytes,status='pending',created_at=now()`;
  });
  for(const key of old)if(!uploaded.includes(key))await deleteR2Object(key).catch(()=>undefined);
  return NextResponse.json({success:true,status:"pending",message:"Files uploaded privately and submitted for manual review. You are not approved yet."},{status:201});
 }catch(e){await Promise.all(uploaded.map(k=>deleteR2Object(k).catch(()=>undefined)));return fail(e);}
}
