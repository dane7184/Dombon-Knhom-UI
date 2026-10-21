import LoginForm from "@/components/auth/LoginForm";
import LoginFormMobile from "@/components/auth/mobile/LoginFormMobile";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session !== null) {
    redirect("/home");
  }
  return (
    <>
      {/* Mobile (below md) — dedicated iOS-clean screen */}
      <LoginFormMobile />
      {/* Desktop (md+) — unchanged */}
      <div className="hidden md:block">
        <LoginForm />
      </div>
    </>
  );
}
