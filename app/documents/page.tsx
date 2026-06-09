"use client";

import { useState } from "react";
import { useDocStore } from "@/store/useDocStore";
import Link from "next/link";
import { Trash2, FileText, Users } from "lucide-react";

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
    e.preventDefault(); // 카드를 클릭해 에디터로 이동하는 이벤트 전파 차단
    e.stopPropagation();

    if (confirm(`'${title}' 문서를 정말 삭제하시겠습니까?`)) {
      deleteDocument(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 max-w-5xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
          문서 보관함
        </h2>
        <p className="text-slate-500 text-sm mt-3">
          작성된 문서들을 카테고리별로 분기하여 체계적으로 관리합니다.
        </p>
      </header>

      {/* 카테고리 필터링 탭 바 */}
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

      {/* 문서 피드 리스트 */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-slate-400 text-sm">
              해당 카테고리에 누적된 문서가 없습니다.
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const isShared = doc.category === "Shared";

            return (
              <Link
                href={`/editor/${doc.id}`}
                key={doc.id}
                // 공유/개인 문서에 따라 카드의 테두리와 배경색을 완전히 다르게 렌더링
                className={`p-5 border rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.005] transition-all flex justify-between items-center gap-4 ${
                  isShared
                    ? "bg-emerald-50/30 border-emerald-100/80 hover:border-emerald-300"
                    : "bg-blue-50/20 border-blue-100/70 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isShared
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {isShared ? <Users size={18} /> : <FileText size={18} />}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-700 truncate">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      최종 수정일: {doc.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* 카테고리 텍스트 뱃지 */}
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isShared
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {doc.category}
                  </span>

                  <button
                    onClick={(e) => handleDelete(e, doc.id, doc.title)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="문서 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
