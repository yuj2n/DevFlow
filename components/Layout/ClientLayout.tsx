"use client";

import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/useSidebarStore";
import SideTabBar from "@/components/Navigation/SideTabBar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  // Zustand에서 사이드바 상태 가져오기
  const { isExpanded } = useSidebarStore();

  return (
    <div className="h-full flex overflow-hidden">
      {/* 1. 메인이 아닐 때만 사이드바 표시 */}
      {!isLandingPage && <SideTabBar />}

      {/* 2. 메인 영역: 사이드바 너비만큼 왼쪽 여백을 유동적으로 조절 */}
      <main
        className={`flex-1 min-w-0 h-full overflow-y-auto bg-white transition-all duration-300 ease-in-out
          ${
            !isLandingPage
              ? isExpanded
                ? "pl-64" // 사이드바가 열렸을 때 (w-64)
                : "pl-5" // 사이드바가 닫혔을 때 (w-16)
              : "pl-0" // 랜딩 페이지일 때
          }
          /* 모바일 대응: 화면이 아주 작을 때는 사이드바를 숨기거나 패딩을 없애는 설정 */
          max-md:pl-0 
        `}
      >
        {children}
      </main>
    </div>
  );
}
