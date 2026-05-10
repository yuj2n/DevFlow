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
      // 기본 StarterKit을 불러오되...
      StarterKit.configure({
        // 기본 코드 블록 기능은 off(충돌 방지)
        codeBlock: false,
      }),
      Table.configure({
        resizable: true, // 마우스로 크기 조절 가능하게 하려면 true
      }),
      TableRow,
      TableHeader,
      TableCell,

      // 대신 하이라이팅 기능 사용
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    immediatelyRender: false,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    // components/Editor/TiptapEditor.tsx

    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[500px] p-10",
        spellcheck: "false",
      },
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="bg-slate-50/50 border-b border-slate-100 px-4 py-3 flex gap-2">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
