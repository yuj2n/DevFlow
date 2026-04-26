"use client";
import { useDocStore } from "@/store/useDocStore";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function EditorPage() {
  const { title, setTitle } = useDocStore();

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: `<h1>DevFlow 문서 작성을 시작합니다</h1>...`,
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
      <nav className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-black text-xl text-blue-600">DevFlow.</span>
          <span className="text-slate-300">|</span>
          {/* 제목 수정 가능하도록 input으로 변경 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-slate-600 font-medium focus:outline-none bg-transparent border-b border-transparent focus:border-blue-300"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() =>
              alert("현재 문서 내용이 브라우저에 임시 저장되었습니다.")
            }
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            임시저장
          </button>
          <button
            onClick={() =>
              alert(
                "GitHub API 연동을 통해 레포지토리에 푸시될 예정입니다 (9주차 구현 목표)",
              )
            }
            className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
          >
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
