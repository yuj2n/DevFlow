"use client";

import { useState } from "react";
import { useDocStore } from "@/store/useDocStore";
import Link from "next/link";

export default function DocumentListPage() {
  const { documents } = useDocStore();

  // 1. 현재 선택된 카테고리 탭 상태 ('All' | 'Personal' | 'Shared')
  const [activeTab, setActiveTab] = useState<"All" | "Personal" | "Shared">(
    "All",
  );

  // 2. 선택된 탭에 맞춰 문서 데이터 필터링 연산
  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === "All") return true;
    return doc.category === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 max-w-5xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
          문서 보관함
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          작성된 문서들을 카테고리별로 관리하고 추적합니다.
        </p>
      </header>

      {/* 3. 팀/개인화 구분을 위한 카테고리 탭 인터페이스 */}
      <div className="flex gap-2 border-b border-slate-200 pb-px mb-6 overflow-x-auto">
        {(["All", "Personal", "Shared"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab === "All"
              ? "전체 문서"
              : tab === "Personal"
                ? "개인 문서"
                : "팀 공유 문서"}
          </button>
        ))}
      </div>

      {/* 4. 필터링된 문서 리스트 출력 피드 */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-slate-400 text-sm">
              해당 카테고리에 누적된 문서가 없습니다.
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <Link
              href={`/editor/${doc.id}`}
              key={doc.id}
              className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm hover:border-blue-200 hover:shadow-md hover:scale-[1.005] transition-all flex justify-between items-center gap-4"
            >
              <div className="min-w-0">
                <h4 className="font-bold text-slate-700 truncate">
                  {doc.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5">
                  최종 수정일: {doc.updatedAt}
                </p>
              </div>

              {/* 카테고리 인덱싱 분기 뱃지 */}
              <span
                className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${
                  doc.category === "Shared"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-blue-50 text-blue-600 border border-blue-100"
                }`}
              >
                {doc.category === "Shared" ? "Shared" : "Personal"}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
