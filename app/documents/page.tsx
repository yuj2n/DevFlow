"use client";

import Link from "next/link";
import { useDocStore } from "@/store/useDocStore";
import { useRouter } from "next/navigation";

export default function DocumentListPage() {
  const { documents, addDocument, deleteDocument } = useDocStore();
  const router = useRouter();

  const handleCreate = () => {
    const id = addDocument();
    router.push(`/editor/${id}`); // 생성 후 바로 해당 에디터로 이동
  };

  return (
    <main className="min-h-screen bg-[#fafafa] p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">문서함</h1>
            <p className="text-slate-500 font-medium">
              작성하신 프로젝트 명세서 목록입니다.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
          >
            + 새 문서 만들기
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="group relative bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
            >
              <Link href={`/editor/${doc.id}`} className="block">
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors truncate">
                  {doc.title}
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  최종 수정: {doc.updatedAt}
                </p>
              </Link>
              <button
                onClick={() => {
                  if (confirm("삭제하시겠습니까?")) deleteDocument(doc.id);
                }}
                className="text-slate-300 hover:text-red-500 text-sm transition-colors"
              >
                삭제하기
              </button>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-medium">
                아직 작성된 문서가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
