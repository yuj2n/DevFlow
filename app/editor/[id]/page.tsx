"use client";

import { useState } from "react";
import { useDocStore } from "@/store/useDocStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import TiptapEditor from "@/components/Editor/TiptapEditor";
import { requestGithubPush } from "@/lib/github";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { documents, updateDocument } = useDocStore();

  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const { selectedRepo, targetDir, extension } = useConfigStore();
  const [isPushing, setIsPushing] = useState(false);

  const doc = documents.find((d) => d.id === id);

  const handleGithubPush = async () => {
    if (!doc) return;

    const owner = session?.user?.username;

    if (!owner) {
      alert("GitHub 계정 정보가 없습니다. 다시 연동해 주세요.");
      router.push("/settings/github");
      return;
    }

    if (!selectedRepo) {
      if (
        confirm(
          "GitHub 연동 설정이 되어있지 않습니다. 설정 페이지로 이동하시겠습니까?",
        )
      ) {
        router.push("/settings/github");
      }
      return;
    }

    setIsPushing(true);

    try {
      let content = doc.content;

      // 코드 블록들을 순서대로 추출
      const savedCodeBlocks: string[] = [];

      // <pre><code> 태그 영역을 찾아서 알맹이만 복원한 뒤 배열에 격리하고, 본문에는 임시 치환자(##CODE_BLOCK_PLACEHOLDER_0##)만 남깁니다.
      content = content.replace(
        /<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
        (match, p1) => {
          const decodedCode = p1
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");

          // 깃허브 하이라이팅 문법을 입힌 마크다운 조각 생성
          const formattedMarkdownCode = `\n\`\`\`typescript\n${decodedCode.trim()}\n\`\`\`\n`;

          savedCodeBlocks.push(formattedMarkdownCode);
          return `##CODE_BLOCK_PLACEHOLDER_${savedCodeBlocks.length - 1}##`;
        },
      );

      // 일반 HTML 레이아웃 태그들을 마크다운으로
      content = content
        .replace(/<h1>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
        .replace(/<h2>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
        .replace(/<h3>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
        .replace(/<li>([\s\S]*?)<\/li>/gi, "\n* $1")
        .replace(/<ul>([\s\S]*?)<\/ul>/gi, "\n$1\n")
        .replace(/<ol>([\s\S]*?)<\/ol>/gi, "\n$1\n")
        .replace(/<p>([\s\S]*?)<\/p>/gi, "\n$1\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "");

      // 원본 코드 블록들을 원래 자리에 차례대로 다시 심어줌
      savedCodeBlocks.forEach((codeMarkdown, index) => {
        content = content.replace(
          `##CODE_BLOCK_PLACEHOLDER_${index}##`,
          codeMarkdown,
        );
      });

      // 저장된 설정값을 사용하여 푸시 실행
      await requestGithubPush({
        owner,
        repo: selectedRepo,
        path: (() => {
          const normalizedDir = (targetDir ?? "").replace(/^\/+|\/+$/g, "");
          const safeTitle = (doc.title?.trim() || "untitled")
            .replace(/[\\/]+/g, "_")
            .replace(/\s+/g, "_");
          const ext = extension || ".md";
          return normalizedDir
            ? `${normalizedDir}/${safeTitle}${ext}`
            : `${safeTitle}${ext}`;
        })(),
        content: content.trim(),
        message: `DevFlow: ${doc.title} 문서 업데이트`,
      });

      alert("🎉 GitHub 푸시가 성공적으로 완료되었습니다!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`❌ 푸시 실패: ${errorMessage}`);
    } finally {
      setIsPushing(false);
    }
  };

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
      {/* 네비게이션 바 */}
      <nav className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 flex justify-between items-center overflow-hidden">
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

        {/* 중간 구역: 제목 입력창 */}
        <div className="flex-1 min-w-0 mx-2 md:mx-4">
          <input
            type="text"
            value={doc.title}
            onChange={(e) => updateDocument(id, e.target.value, doc.content)}
            className="w-full text-slate-700 font-bold focus:outline-none bg-transparent 
              border-b border-transparent hover:border-slate-200 focus:border-blue-300
              text-sm md:text-base truncate transition-all"
            placeholder="제목 없는 문서"
          />
        </div>

        {/* 오른쪽 구역: GitHub 푸시 버튼 */}
        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          <button
            onClick={handleGithubPush}
            disabled={isPushing}
            className={`px-3 md:px-5 py-1.5 md:py-2 text-white text-xs md:text-sm font-bold rounded-lg shadow-lg transition-all active:scale-95 whitespace-nowrap
              ${isPushing ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"}
            `}
          >
            {isPushing ? "푸시 중..." : "GitHub로 푸시"}
          </button>
        </div>
      </nav>

      {/* 에디터 메인 영역 */}
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
          key={id}
          content={doc.content}
          onChange={(html) => updateDocument(id, doc.title, html)}
        />
      </main>
    </div>
  );
}
