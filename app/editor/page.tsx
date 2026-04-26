"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function EditorPage() {
  const editor = useEditor({
    extensions: [StarterKit],
    // Next.js 14의 App Router는 기본적으로 SSR을 수행하는데, Tiptap 에디터는 클라이언트의 DOM이 필요 -> 서버와 클라이언트 간의 Hydration 불일치를 막기 위해 immediatelyRender:false로 클라이언트에서만 렌더링되도록 조치
    immediatelyRender: false,
    content: `
      <h1>DevFlow 문서 작성을 시작합니다</h1>
      <p>이곳은 <strong>Tiptap 에디터</strong>가 적용된 문서 작성 공간입니다.</p>
      <blockquote>
        8주차 현재, 에디터 기초 UI와 라이브러리 연동이 완료되었습니다.
      </blockquote>
      <ul>
        <li>사용자는 이곳에 Swagger 명세를 붙여넣을 수 있습니다.</li>
        <li>10주차에는 AI 보안 진단 블록이 추가될 예정입니다.</li>
      </ul>
    `,
    editorProps: {
      attributes: {
        class:
          "prose prose-blue prose-lg max-w-none focus:outline-none min-h-[500px] p-4",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* 고정 상단바 */}
      <nav className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-black text-xl text-blue-600">DevFlow.</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">Untitled Document</span>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
            임시저장
          </button>
          <button className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
            GitHub로 푸시
          </button>
        </div>
      </nav>

      {/* 에디터 메인 영역 */}
      <main className="max-w-5xl mx-auto py-16 px-8">
        <header className="mb-12 border-l-4 border-blue-600 pl-6">
          <p className="text-blue-600 font-bold mb-2">PROTOTYPE V0.1</p>
          <h2 className="text-3xl font-extrabold text-slate-800">
            API Documentation Editor
          </h2>
        </header>

        <div className="bg-white rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 border-b px-4 py-2 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="p-8">
            <EditorContent editor={editor} />
          </div>
        </div>
      </main>
    </div>
  );
}
