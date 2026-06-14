"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

// 하이라이팅 엔진 설정
const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      // 기본 StarterKit을 불러오되 기본 코드 블록 기능은 오프 처리
      StarterKit.configure({
        codeBlock: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,

      // 구문 강조 하이라이팅 기능 사용
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    immediatelyRender: false,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        // dark:prose-invert 옵션을 추가하여 다크모드 시 에디터 내부 본문 텍스트 색상이 자동 반전되도록 처리
        class:
          "prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-10 text-slate-800 dark:text-slate-200",
        spellcheck: "false",
      },
    },
  });

  return (
    // 외곽 컨테이너 및 상단 바 영역에 다크모드 배경색과 테두리 경계선 색상 동적 매핑
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex gap-2 transition-colors">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
