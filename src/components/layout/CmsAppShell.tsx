"use client";

import { usePathname } from "next/navigation";
import TopPillNavbar from "@/components/layout/TopPillNavbar";
import type { AuthUser } from "@/lib/auth";

interface CmsAppShellProps {
  currentUser: AuthUser | null;
  children: React.ReactNode;
}

export default function CmsAppShell({
  currentUser,
  children,
}: CmsAppShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <TopPillNavbar currentUser={currentUser} />
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}
