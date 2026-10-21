import { ReactivateConfirmForm } from "@/components/auth/ReactivateConfirmForm";
import ReactivateConfirmFormMobile from "@/components/auth/mobile/ReactivateConfirmFormMobile";
import { redirect } from "next/navigation";

type ReactivatePageProps = {
  searchParams: Promise<{ sessionToken?: string }>;
};

export default async function ReactivatePage({
  searchParams,
}: ReactivatePageProps) {
  const { sessionToken } = await searchParams;

  if (!sessionToken) redirect("/login");

  return (
    <>
      {/* Mobile (below md) */}
      <ReactivateConfirmFormMobile sessionToken={sessionToken} />
      {/* Desktop (md+) — unchanged */}
      <div className="hidden md:block">
        <ReactivateConfirmForm sessionToken={sessionToken} />
      </div>
    </>
  );
}
