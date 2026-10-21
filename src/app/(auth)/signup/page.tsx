import SignupForm from "@/components/auth/SignUpForm";
import SignUpFormMobile from "@/components/auth/mobile/SignUpFormMobile";

export default async function SignupPage() {
  return (
    <>
      {/* Mobile (below md) */}
      <SignUpFormMobile />
      {/* Desktop (md+) — unchanged */}
      <div className="hidden md:block">
        <SignupForm />
      </div>
    </>
  );
}
