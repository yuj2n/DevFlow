"use client";

import { useDocStore } from "@/store/useDocStore";
import { useParams } from "next/navigation";
import Link from "next/link";
import TiptapEditor from "@/components/Editor/TiptapEditor";

export default function EditorPage() {
  const { id } = useParams();
  const { documents, updateDocument } = useDocStore();

  // 현재 URL의 id와 일치하는 문서 찾기
  const doc = documents.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">
            문서를 찾을 수 없거나 불러오는 중입니다.
          </p>
          <Link
            href="/documents"
            className="text-blue-600 hover:underline font-bold"
          >
            문서함으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 1. 상단 네비게이션 바 (제목 설정 및 버튼 복구) */}
      <nav className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/documents"
            className="text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            ← 목록
          </Link>
          <span className="text-slate-200">|</span>
          <span className="font-black text-xl  tracking-tighter">
            Dev<span className="text-blue-600">Flow</span>
          </span>

          <span className="text-slate-200">|</span>
          {/* 제목 수정 Input: 여기서 제목을 바꾸면 Zustand에 즉시 반영됩니다 */}
          <input
            type="text"
            value={doc.title}
            onChange={(e) =>
              updateDocument(doc.id as string, e.target.value, doc.content)
            }
            className="text-slate-700 font-semibold focus:outline-none bg-transparent 
             w-72 px-1 transition-all
             border-b border-transparent 
             hover:border-slate-200
             hover:text-slate-800
             focus:border-blue-300"
            placeholder="제목 없는 문서"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => alert(`${doc.title} 저장 완료`)}
            className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-lg transition-colors"
          >
            저장
          </button>

          {/* GitHub 푸시 버튼 복구 */}
          <button
            onClick={() =>
              alert(
                "GitHub API 연동을 통해 레포지토리에 푸시될 예정입니다 (9주차 구현 목표)",
              )
            }
            className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            GitHub로 푸시
          </button>
        </div>
      </nav>

      {/* 2. 에디터 메인 영역 */}
      <main className="max-w-5xl mx-auto py-12 px-8">
        <header className="mb-10 border-l-4 border-blue-600 pl-6">
          <p className="text-blue-600 font-bold mb-1 text-sm tracking-widest uppercase">
            Prototype V0.1
          </p>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            API Documentation Editor
          </h2>
        </header>

        {/* 분리한 TiptapEditor 컴포넌트 호출 */}
        <TiptapEditor
          content={doc.content}
          onChange={(html) => updateDocument(doc.id as string, doc.title, html)}
        />
      </main>
    </div>
  );
}
