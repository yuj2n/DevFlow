"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SideTabBar from "@/components/Navigation/SideTabBar";
import { useConfigStore } from "@/store/useConfigStore";
import { useMounted } from "@/hooks/useMounted";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const { theme } = useConfigStore();
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <div className="h-full bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="h-full flex overflow-hidden dark:text-slate-100 transition-colors duration-300">
      {/* 메인이 아닐 때만 사이드바 표시 */}
      {!isLandingPage && <SideTabBar />}

      {/* 메인 영역 */}
      <main
        className={`flex-1 min-w-0 h-full overflow-y-auto bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out max-md:pl-0`}
      >
        {children}
      </main>
    </div>
  );
}
