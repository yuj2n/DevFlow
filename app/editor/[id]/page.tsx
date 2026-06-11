"use client";

import { useState, useEffect } from "react";
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

  // 하이드레이션 에러 방지를 위한 마운트 상태 관리
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
      const savedCodeBlocks: { language: string; code: string }[] = [];

      // 코드 블록 스캔 및 언어 추출 격리
      content = content.replace(
        /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
        (match, attributes, p1) => {
          const langMatch = attributes.match(/class=["']?language-(\w+)["']?/i);
          const language = langMatch ? langMatch[1] : "typescript";

          const decodedCode = p1
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");

          savedCodeBlocks.push({ language, code: decodedCode.trim() });
          return `\n\n##CODE_BLOCK_PLACEHOLDER_${savedCodeBlocks.length - 1}##\n\n`;
        },
      );

      // Swagger 테이블 변환
      content = content.replace(
        /<table[^>]*>([\s\S]*?)<\/table>/gi,
        (match) => {
          const theadMatch = match.match(/<thead>([\s\S]*?)<\/thead>/i);
          const tbodyMatch = match.match(/<tbody>([\s\S]*?)<\/tbody>/i);

          let tableMarkdown = "\n";

          if (theadMatch) {
            const headers =
              theadMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/gi) || [];
            const headerTexts = headers.map((h) =>
              h.replace(/<[^>]+>/g, "").trim(),
            );
            tableMarkdown += "| " + headerTexts.join(" | ") + " |\n";
            tableMarkdown +=
              "| " + headerTexts.map(() => "---").join(" | ") + " |\n";
          }

          if (tbodyMatch) {
            const rows =
              tbodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
            rows.forEach((row) => {
              const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
              const cellTexts = cells.map((c) =>
                c.replace(/<[^>]+>/g, "").trim(),
              );
              tableMarkdown += "| " + cellTexts.join(" | ") + " |\n";
            });
          }

          return tableMarkdown + "\n";
        },
      );

      // 일반 HTML 태그 및 리스트 서식 변환
      content = content
        .replace(/<h1>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
        .replace(/<h2>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
        .replace(/<h3>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
        .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
        .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`")
        .replace(/<p>([\s\S]*?)<\/p>/gi, "\n$1\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<ul>([\s\S]*?)<\/ul>/gi, (match) => {
          return match.replace(/<li>([\s\S]*?)<\/li>/gi, "\n* $1");
        })
        .replace(/<ol>([\s\S]*?)<\/ol>/gi, (match) => {
          let index = 1;
          return match.replace(
            /<li>([\s\S]*?)<\/li>/gi,
            (liMatch, liContent) => {
              return `\n${index++}. ${liContent}`;
            },
          );
        })
        .replace(/<li>([\s\S]*?)<\/li>/gi, "\n* $1");

      // 잔여 태그 소거
      content = content.replace(/<\/?[^>]+(>|$)/g, "");

      // 코드 블록 원본 복원
      savedCodeBlocks.forEach((block, index) => {
        content = content.replace(
          `##CODE_BLOCK_PLACEHOLDER_${index}##`,
          `\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`,
        );
      });

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

      updateDocument(doc.id, doc.title, doc.content, "Shared");

      alert("GitHub 푸시가 성공적으로 완료되었습니다.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`푸시 실패: ${errorMessage}`);
    } finally {
      setIsPushing(false);
    }
  };

  // 마운트 로드 전 임시 렌더링 방어
  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-slate-950 transition-colors">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm font-medium">
            문서를 찾을 수 없거나 불러오는 중입니다.
          </p>
          <Link
            href="/documents"
            className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-sm"
          >
            문서함으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 네비게이션 바 */}
      <nav className="sticky top-0 z-10 border-b border-slate-100 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 flex justify-between items-center overflow-hidden transition-colors">
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <Link
            href="/documents"
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors whitespace-nowrap text-xs md:text-sm"
          >
            ← <span className="hidden sm:inline">목록</span>
          </Link>
          <span className="text-slate-200 dark:text-slate-800 flex-shrink-0">
            |
          </span>
          <span className="font-black text-base md:text-xl tracking-tighter whitespace-nowrap flex-shrink-0 text-slate-900 dark:text-slate-50">
            Dev<span className="text-blue-600 dark:text-blue-500">Flow</span>
          </span>
        </div>

        {/* 제목 입력창 */}
        <div className="flex-1 min-w-0 mx-2 md:mx-4">
          <input
            type="text"
            value={doc.title}
            onChange={(e) => updateDocument(id, e.target.value, doc.content)}
            className="w-full text-slate-700 dark:text-slate-200 font-semibold focus:outline-none bg-transparent 
              border-b border-transparent hover:border-slate-100 dark:hover:border-slate-800 focus:border-blue-300 dark:focus:border-blue-500
              text-xs md:text-sm truncate transition-all py-1"
            placeholder="제목 없는 문서"
          />
        </div>

        {/* GitHub 푸시 버튼 제어 영역 */}
        <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
          <button
            onClick={handleGithubPush}
            disabled={isPushing}
            className={`px-3 md:px-5 py-1.5 md:py-2 text-white text-xs md:text-sm font-bold rounded-lg shadow-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer
              ${isPushing ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"}
            `}
          >
            {isPushing ? "푸시 중..." : "GitHub로 푸시"}
          </button>
        </div>
      </nav>

      {/* 에디터 본문 및 타이틀 구역 */}
      <main className="max-w-5xl mx-auto py-8 md:py-12 px-6 md:px-8">
        <header className="mb-8 md:mb-10 border-l-4 border-blue-600 pl-5 md:pl-6">
          <p className="text-blue-600 dark:text-blue-400 font-bold mb-1 text-xs md:text-sm tracking-widest uppercase">
            Prototype V0.1
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
            API Documentation Editor
          </h2>
        </header>

        {/* Tiptap 에디터 본체 컴포넌트 */}
        <TiptapEditor
          key={id}
          content={doc.content}
          onChange={(html) => updateDocument(id, doc.title, html)}
        />
      </main>
    </div>
  );
}
