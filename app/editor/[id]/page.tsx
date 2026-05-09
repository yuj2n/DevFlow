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
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { documents, updateDocument } = useDocStore();

  // 전역 설정값 가져오기
  const { selectedRepo, targetDir, extension } = useConfigStore();

  const [isPushing, setIsPushing] = useState(false);

  const doc = documents.find((d) => d.id === id);

  const handleGithubPush = async () => {
    if (!doc) return;

    // 가드 로직: 설정이 없으면 설정 페이지로 유도
    if (!selectedRepo) {
      if (
        confirm(
          "GitHub 연동 설정이 되어있지 않습니다. 설정 페이지로 이동하시겠습니까?",
        )
      ) {
        router.push("/settings/github"); // 실제 설정 페이지 경로로 수정하세요
      }
      return;
    }

    setIsPushing(true);

    try {
      // 저장된 설정값을 사용하여 푸시 실행
      await requestGithubPush({
        owner: session?.user?.username || "user-dev", // 세션 닉네임 사용
        repo: selectedRepo, // 실제 레포 이름
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
        content: doc.content,
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
      {/* 네비게이션 바 및 에디터 UI 생략 */}
      <nav className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 flex justify-between items-center overflow-hidden">
        {/* 왼쪽 구역 */}
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
            onChange={(e) =>
              updateDocument(doc.id as string, e.target.value, doc.content)
            }
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
          key={id as string}
          content={doc.content}
          onChange={(html) => updateDocument(doc.id as string, doc.title, html)}
        />
      </main>
    </div>
  );
}
