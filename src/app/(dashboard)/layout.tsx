"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { PriceProvider } from "@/components/PriceProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/transactions", label: "거래내역" },
  { href: "/leaderboard", label: "랭킹" },
  { href: "/alerts", label: "알림" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <PriceProvider>
      <div className="min-h-screen">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-lg font-bold">
                CryptoSim
              </Link>
              <nav className="hidden items-center gap-1 md:flex">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/")
                        ? "bg-card text-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">
                {session?.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
          {/* Mobile nav */}
          <nav className="flex overflow-x-auto border-t border-border px-4 md:hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/")
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl p-4">{children}</main>
      </div>
    </PriceProvider>
  );
}
