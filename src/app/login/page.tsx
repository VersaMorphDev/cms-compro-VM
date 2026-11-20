import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { sanitizeNextPath } from "@/features/auth/schema";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    reason?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const safeNext = sanitizeNextPath(params.next);

  const hdrs = await headers();
  const isActionRequest = hdrs.has("next-action");
  const session = await getCurrentSession();

  if (session && !isActionRequest) {
    redirect(safeNext);
  }

  return (
    <LoginClient
      nextPath={safeNext}
      reason={params.reason === "expired" || params.reason === "logout" ? params.reason : undefined}
    />
  );
}
