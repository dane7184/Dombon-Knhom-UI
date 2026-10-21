import OtpForm from "@/components/auth/OtpForm";
import OtpFormMobile from "@/components/auth/mobile/OtpFormMobile";
import { Suspense } from "react";
import { redirect } from "next/navigation";

type VerifyOtpPageProps = { searchParams: Promise<{ sessionToken?: string }> };

export default async function VerifyOtpPage({
  searchParams,
}: VerifyOtpPageProps) {
  const { sessionToken } = await searchParams;

  if (!sessionToken) redirect("/login");

  return (
    <Suspense>
      {/* Mobile (below md) */}
      <OtpFormMobile sessionToken={sessionToken} />
      {/* Desktop (md+) — unchanged */}
      <div className="hidden md:block">
        <OtpForm sessionToken={sessionToken} />
      </div>
    </Suspense>
  );
}
