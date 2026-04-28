"use client";

import { useState } from "react";
import {
  ChevronRight,
  FileText,
  Settings,
  Share2,
  GitBranch,
} from "lucide-react";
import { useSidebarStore } from "@/store/useSidebarStore";

export default function SideTabBar() {
  // 클릭해서 고정할 수 있는 상태값
  const { isExpanded, toggleSidebar } = useSidebarStore();

  return (
    <aside
      // 1. 핵심: group 설정으로 내부 요소들이 부모의 호버 상태를 감지하게 함
      // 2. w-16에서 hover 시 w-64로 부드럽게 확장 (transition-all)
      className={`sticky left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 ease-in-out z-50 group shadow-xl
        ${isExpanded ? "w-64" : "w-16 hover:w-64"}
      `}
    >
      {/* 확장/축소 고정 버튼 */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-15 bg-blue-600 rounded-full p-1 border-2 border-slate-900 hover:scale-110 transition-transform"
      >
        <ChevronRight
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div className="flex flex-col h-full py-6">
        {/* 로고 영역 */}
        <div className="px-4 mb-10 flex items-center overflow-hidden">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold">
            D
          </div>
          <span className="ml-4 font-black text-xl tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Dev<span className="text-blue-400">Flow</span>
          </span>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="flex-1 px-3 space-y-2">
          <NavItem icon={<FileText size={20} />} label="문서 관리" />
          <NavItem icon={<Share2 size={20} />} label="Swagger 공유" />
          <NavItem icon={<GitBranch size={20} />} label="GitHub 연동" />
          <NavItem icon={<Settings size={20} />} label="설정" />
        </nav>
      </div>
    </aside>
  );
}

// 메뉴 아이템 컴포넌트
function NavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center p-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors overflow-hidden group/item">
      <div className="flex-shrink-0 text-slate-400 group-hover/item:text-blue-400 transition-colors">
        {icon}
      </div>
      {/* 부모가 hover 되었을 때만 텍스트가 서서히 나타남 */}
      <span className="ml-4 text-slate-300 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {label}
      </span>
    </div>
  );
}
