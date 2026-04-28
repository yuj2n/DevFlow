"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Navigation/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div className="h-full flex overflow-hidden">
      {/* 메인이 아닐 때만 사이드바 표시 */}
      {!isLandingPage && (
        <aside className="w-64 border-r border-slate-100 flex-shrink-0 bg-[#f9fafb] hidden md:flex flex-col">
          <Sidebar />
        </aside>
      )}

      {/* 메인 영역 */}
      <main className={`flex-1 min-w-0 h-full overflow-y-auto bg-white`}>
        {children}
      </main>
    </div>
  );
}
