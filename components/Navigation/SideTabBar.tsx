"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import {
  ChevronRight,
  FileText,
  Settings,
  Share2,
  GitBranch,
} from "lucide-react";
import { useSidebarStore } from "@/store/useSidebarStore";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function SideTabBar() {
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <aside
      className={`sticky left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 ease-in-out z-50 flex flex-col shadow-xl group
        ${isExpanded ? "w-64" : "w-16 hover:w-64"}
      `}
    >
      {/* 사이드바 고정/해제 화살표 버튼 */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 bg-blue-600 rounded-full p-1 border-2 border-slate-900 hover:scale-110 transition-transform z-[60]"
      >
        <ChevronRight
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* 1. 상단 로고 및 메뉴 영역 */}
      <div className="flex-1 flex flex-col py-6 w-full overflow-hidden">
        {/* 로고 섹션 */}
        <div className="px-4 mb-10 flex items-center w-full flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold">
            D
          </div>
          <span
            className={`
              ml-4 font-black text-xl tracking-tighter whitespace-nowrap transition-opacity duration-300
              ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            `}
          >
            Dev<span className="text-blue-400">Flow</span>
          </span>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="px-3 space-y-2 w-full overflow-y-auto overflow-x-hidden">
          <Link href="/documents">
            <NavItem
              icon={<FileText size={20} />}
              label="문서 관리"
              active={pathname === "/documents"}
            />
          </Link>
          <Link href="/swagger">
            <NavItem
              icon={<Share2 size={20} />}
              label="Swagger 공유"
              active={pathname === "/swagger"}
            />
          </Link>
          <Link href="/github">
            <NavItem
              icon={<GitBranch size={20} />}
              label="GitHub 연동"
              active={pathname === "/github"}
            />
          </Link>
          <Link href="/settings">
            <NavItem
              icon={<Settings size={20} />}
              label="설정"
              active={pathname === "/settings"}
            />
          </Link>
        </nav>
      </div>

      {/* 2. 하단 유저 섹션 */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex-shrink-0 w-full">
        {session ? (
          <div className="flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 min-w-0">
                {session.user?.image && (
                  <div className="w-7 h-7 relative flex-shrink-0">
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      fill
                      className="rounded-full border border-slate-700"
                    />
                  </div>
                )}
                <span
                  className={`
                    text-sm text-slate-200 font-medium truncate transition-opacity duration-300
                    ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                  `}
                >
                  {session.user?.name}
                </span>
              </div>

              <button
                onClick={() => signOut()}
                className={`
                  text-xs text-slate-500 hover:text-red-400 transition-opacity duration-300 whitespace-nowrap ml-2
                  ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `}
              >
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="w-full flex items-center justify-center h-10 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all"
          >
            <span className="whitespace-nowrap px-2">
              {isExpanded ? "GitHub 로그인" : "G"}
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  const { isExpanded } = useSidebarStore();

  return (
    <div
      className={`
        flex items-center p-2 rounded-xl cursor-pointer transition-all duration-200 group/item w-full
        ${active ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:bg-slate-800"}
      `}
    >
      <div
        className={`flex-shrink-0 ${active ? "text-blue-400" : "group-hover/item:text-blue-400"}`}
      >
        {icon}
      </div>

      <span
        className={`
          ml-4 font-medium whitespace-nowrap transition-opacity duration-300
          ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
        `}
      >
        {label}
      </span>
    </div>
  );
}
