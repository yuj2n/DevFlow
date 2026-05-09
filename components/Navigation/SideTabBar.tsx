"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
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

export default function SideTabBar() {
  // 클릭해서 고정할 수 있는 상태값
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <aside
      className={`sticky left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 ease-in-out z-50 group shadow-xl flex flex-col
        ${isExpanded ? "w-64" : "w-16 hover:w-64"}
      `}
    >
      {/* 화살표 버튼 */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 bg-blue-600 rounded-full p-1 border-2 border-slate-900 hover:scale-110 transition-transform z-[60]"
      >
        <ChevronRight
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* 1. 상단 로고 및 메뉴 (중간 영역을 꽉 채우도록 flex-1 부여) */}
      <div className="flex-1 flex flex-col py-6 overflow-hidden">
        <div className="px-4 mb-10 flex items-center flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold">
            D
          </div>
          <span className="ml-4 font-black text-xl tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Dev<span className="text-blue-400">Flow</span>
          </span>
        </div>

        <nav className="px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          <Link href="/documents">
            <NavItem
              icon={<FileText size={20} />}
              label="문서 관리"
              active={pathname === "/documents"} // 3. 활성화 여부 전달
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

      {/* 2. 하단 유저 섹션 (flex-col의 맨 아래에 고정) */}
      <div className="p-3 border-t border-slate-800 bg-slate-900 flex-shrink-0">
        {session ? (
          <div className="flex flex-col gap-1 overflow-hidden">
            {/* 이름과 이미지를 감싸는 위쪽 라인 */}
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <div className="w-6 h-6 relative flex-shrink-0">
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  </div>
                )}
                <span className="text-xs text-slate-300 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {session.user?.name}
                </span>
              </div>

              {/* 로그아웃 버튼을 우측 끝으로! */}
              <button
                onClick={() => signOut()}
                className="text-[10px] text-slate-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap"
              >
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn("github")}
            className="w-full flex items-center justify-center h-10 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all overflow-hidden"
          >
            <span className="whitespace-nowrap px-2">
              {/* 접혀있을 때는 아이콘 대용으로 'G'만, 펼쳐지면 전체 문구 */}
              <span className="group-hover:hidden">
                {isExpanded ? "GitHub 로그인" : "G"}
              </span>
              <span className="hidden group-hover:inline">GitHub 로그인</span>
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}

// 메뉴 아이템 컴포넌트
function NavItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`
      flex items-center p-2 rounded-xl cursor-pointer transition-all duration-200 group/item
      ${
        active
          ? "bg-blue-600/20 text-blue-400" // 활성화 상태: 배경 살짝 파랗고 글자색 강조
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-300" // 기본 상태: 호버시에만 변경
      }
    `}
    >
      <div
        className={`flex-shrink-0 ${active ? "text-blue-400" : "group-hover/item:text-blue-400"}`}
      >
        {icon}
      </div>
      <span
        className={`ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${active ? "text-white" : ""}`}
      >
        {label}
      </span>
    </div>
  );
}
