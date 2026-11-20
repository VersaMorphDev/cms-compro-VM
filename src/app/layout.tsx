import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import CmsAppShell from "@/components/layout/CmsAppShell";
import ToastProvider from "@/components/ui/ToastProvider";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Versa Morph CMS Studio",
  description: "Admin Dashboard & Headless Content Management for Versa Morph",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const pathname = hdrs.get("x-cms-pathname");
  const isActionRequest = hdrs.has("next-action");
  const currentUser = await getCurrentSession();

  if (pathname && pathname !== "/login" && !currentUser && !isActionRequest) {
    redirect("/login?reason=expired");
  }

  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#0B0D12] text-white antialiased">
        <ToastProvider>
          <CmsAppShell currentUser={currentUser}>{children}</CmsAppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
