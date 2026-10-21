import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import ForgotPasswordFormMobile from "@/components/auth/mobile/ForgotPasswordFormMobile";

export default function ForgotPasswordPage() {
  return (
    <>
      {/* Mobile (below md) */}
      <ForgotPasswordFormMobile />
      {/* Desktop (md+) — unchanged */}
      <div className="hidden md:block">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
