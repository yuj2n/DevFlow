"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDocStore } from "@/store/useDocStore";
import Link from "next/link";

export default function EditorPage() {
  const { title, setTitle, content, setContent } = useDocStore();

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: content, // 스토어에 저장된 내용을 불러옴
    onUpdate: ({ editor }) => {
      // 글을 쓸 때마다 Zustand 스토어(localStorage)에 자동 저장
      setContent(editor.getHTML());
    },
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
      <nav className="sticky top-0 z-10 border-b border-slate-300 bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-black text-xl text-blue-600">
            DevFlow.
          </Link>
          <span className="text-slate-300">|</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-slate-600 font-medium focus:outline-none bg-transparent border-b border-transparent focus:border-blue-300 w-64"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              // 저장 버튼을 눌렀을 때만 명시적으로 알림을 줌
              alert(`'${title}' 문서 저장`);
            }}
            className="px-4 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
          >
            저장
          </button>
          <button
            onClick={() => alert("GitHub API 연동 예정입니다.")}
            className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
          >
            GitHub로 푸시
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-12 px-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-300 px-4 py-3 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="p-10">
            <EditorContent editor={editor} />
          </div>
        </div>
      </main>
    </div>
  );
}
