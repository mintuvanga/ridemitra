import { getCurrentUser } from "@/lib/auth";
export async function requireAdmin() {
  const user=await getCurrentUser();
  if(!user) throw new Error("AUTH_REQUIRED");
  const configured=process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if(!configured) throw new Error("ADMIN_NOT_CONFIGURED");
  if(user.email.toLowerCase()!==configured) throw new Error("ADMIN_FORBIDDEN");
  return user;
}
