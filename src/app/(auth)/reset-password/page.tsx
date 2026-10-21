import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import ResetPasswordFormMobile from "@/components/auth/mobile/ResetPasswordFormMobile";
import { redirect } from "next/navigation";

type ResetPasswordPageProps = {
  searchParams: Promise<{ sessionToken?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { sessionToken } = await searchParams;

  if (!sessionToken) redirect("/login");

  return (
    <>
      {/* Mobile (below md) */}
      <ResetPasswordFormMobile sessionToken={sessionToken} />
      {/* Desktop (md+) — unchanged */}
      <div className="hidden md:block">
        <ResetPasswordForm sessionToken={sessionToken} />
      </div>
    </>
  );
}
