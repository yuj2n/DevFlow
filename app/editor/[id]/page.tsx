"use client";

import { useDocStore } from "@/store/useDocStore";
import { useParams } from "next/navigation";
import Link from "next/link";
import TiptapEditor from "@/components/Editor/TiptapEditor";

export default function EditorPage() {
  const { id } = useParams();
  const { documents, updateDocument } = useDocStore();

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
      {/* 1. 상단 네비게이션 바: overflow-hidden으로 스크롤바 원천 차단 */}
      <nav className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 flex justify-between items-center overflow-hidden">
        {/* 왼쪽 구역: 목록 가기 및 로고 (크기 고정) */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <Link
            href="/documents"
            className="text-slate-400 hover:text-slate-600 font-medium transition-colors whitespace-nowrap text-xs md:text-sm"
          >
            ← <span className="hidden sm:inline">목록</span>
          </Link>
          <span className="text-slate-200 flex-shrink-0">|</span>
          <span className="font-black text-base md:text-xl tracking-tighter whitespace-nowrap flex-shrink-0">
            Dev<span className="text-blue-600">Flow</span>
          </span>
          <span className="text-slate-200 flex-shrink-0 hidden xs:inline">
            |
          </span>
        </div>

        {/* 중간 구역: 제목 입력창 (flex-1과 min-w-0으로 화면 작아지면 가장 먼저 줄어듦) */}
        <div className="flex-1 min-w-0 mx-2 md:mx-4">
          <input
            type="text"
            value={doc.title}
            onChange={(e) =>
              updateDocument(doc.id as string, e.target.value, doc.content)
            }
            className="w-full text-slate-700 font-bold focus:outline-none bg-transparent 
              border-b border-transparent hover:border-slate-200 focus:border-blue-300
              text-sm md:text-base truncate transition-all"
            placeholder="제목 없는 문서"
          />
        </div>

        {/* 오른쪽 구역: 저장 및 푸시 버튼 (글자 크기도 반응형으로 작아짐) */}
        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          <button
            onClick={() => alert(`${doc.title} 저장 완료`)}
            className="px-2 md:px-4 py-2 text-slate-500 text-xs md:text-sm font-medium hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            저장
          </button>

          <button
            onClick={() =>
              alert(
                "GitHub API 연동을 통해 레포지토리에 푸시될 예정입니다 (9주차 구현 목표)",
              )
            }
            className="px-3 md:px-5 py-1.5 md:py-2 bg-blue-600 text-white text-xs md:text-sm font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <span className="hidden sm:inline">GitHub로 </span>푸시
          </button>
        </div>
      </nav>

      {/* 2. 에디터 메인 영역 */}
      <main className="max-w-5xl mx-auto py-8 md:py-12 px-6 md:px-8">
        <header className="mb-8 md:mb-10 border-l-4 border-blue-600 pl-5 md:pl-6">
          <p className="text-blue-600 font-bold mb-1 text-xs md:text-sm tracking-widest uppercase">
            Prototype V0.1
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            API Documentation Editor
          </h2>
        </header>

        <TiptapEditor
          content={doc.content}
          onChange={(html) => updateDocument(doc.id as string, doc.title, html)}
        />
      </main>
    </div>
  );
}
