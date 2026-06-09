"use client";

import { useState } from "react";
import { useDocStore } from "@/store/useDocStore";
import Link from "next/link";
import { Trash2, FileText, Users, Calendar } from "lucide-react";

export default function DocumentListPage() {
  const { documents, deleteDocument } = useDocStore();
  const [activeTab, setActiveTab] = useState<"All" | "Personal" | "Shared">(
    "All",
  );

  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === "All") return true;
    return doc.category === activeTab;
  });

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm(`'${title}' 문서를 정말 삭제하시겠습니까?`)) {
      deleteDocument(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
          문서 보관함
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          작성된 문서들을 카테고리별로 분기하여 체계적으로 관리합니다.
        </p>
      </header>

      {/* 카테고리 필터링 탭 바 */}
      <div className="flex gap-2 border-b border-slate-200 pb-px mb-8 overflow-x-auto">
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

      {/* 반응형 2D 격자(Grid) 배치로 변경 */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm">
            해당 카테고리에 누적된 문서가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => {
            const isShared = doc.category === "Shared";

            return (
              <Link
                href={`/editor/${doc.id}`}
                key={doc.id}
                className={`p-5 border rounded-2xl bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between h-48 group relative ${
                  isShared
                    ? "border-emerald-100/80 hover:border-emerald-300"
                    : "border-blue-100/70 hover:border-blue-300"
                }`}
              >
                {/* 상단 레이아웃: 아이콘 및 범주 뱃지, 삭제 버튼 */}
                <div className="flex justify-between items-start">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isShared
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {isShared ? <Users size={20} /> : <FileText size={20} />}
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isShared
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {doc.category}
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, doc.id, doc.title)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="문서 삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* 중간-하단 레이아웃: 본문 제목 및 하단 메타 데이터 정렬 */}
                <div className="mt-4 flex-1 flex flex-col justify-end">
                  <h4 className="font-bold text-slate-700 text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs border-t border-slate-50 pt-2">
                    <Calendar size={12} />
                    <span>{doc.updatedAt}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
