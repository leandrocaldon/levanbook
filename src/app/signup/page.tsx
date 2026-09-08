import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/insforge/server";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/library");
  return (
    <div className="flex flex-1 items-center justify-center py-10">
      <AuthForm mode="signup" />
    </div>
  );
}
