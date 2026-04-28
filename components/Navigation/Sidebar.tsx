"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDocStore } from "@/store/useDocStore";

export default function Sidebar() {
  const { documents } = useDocStore();
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* 로고 영역 */}
      <div className="p-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          D<span className="text-blue-600">F</span>
        </Link>
      </div>

      {/* 문서 목록 네비게이션 */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase mb-2">
          Documents
        </p>
        {documents.map((doc) => {
          const isActive = pathname === `/editor/${doc.id}`;
          return (
            <Link
              key={doc.id}
              href={`/editor/${doc.id}`}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all ${
                isActive
                  ? "bg-white shadow-sm text-blue-600 font-semibold ring-1 ring-slate-200"
                  : "text-slate-600 hover:bg-slate-200/50"
              }`}
            >
              <span className="truncate">{doc.title || "Untitled"}</span>
            </Link>
          );
        })}
      </nav>

      {/* 하단 유저/설정 영역 */}
      <div className="p-4 border-t border-slate-200">
        <button className="w-full py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          Settings
        </button>
      </div>
    </div>
  );
}
