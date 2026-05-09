"use client";

import { useState } from "react";
import {
  GitBranch,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  FolderSync,
} from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";
import { useSession } from "next-auth/react";

const GithubLogo = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function GithubConnect() {
  const { data: session } = useSession();
  const { selectedRepo, targetDir, autoPush, setGithubConfig } =
    useConfigStore();

  // 임시 로컬 상태 (저장 버튼 누르기 전까지 유지)
  const [localRepo, setLocalRepo] = useState(selectedRepo);
  const [localDir, setLocalDir] = useState(targetDir);
  const [localAutoPush, setLocalAutoPush] = useState(autoPush);
  const [isSyncing, setIsSyncing] = useState(false);

  const isConnected = !!session;

  const handleSaveConfig = () => {
    setIsSyncing(true);
    // Zustand 스토어에 저장
    setGithubConfig({
      selectedRepo: localRepo,
      targetDir: localDir,
      autoPush: localAutoPush,
    });

    setTimeout(() => {
      setIsSyncing(false);
      alert("설정이 저장되었습니다! 이제 에디터에서 바로 푸시가 가능합니다.");
    }, 800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* 1. 계정 연결 섹션 (세션 데이터 기반으로 변경) */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
            <GithubLogo size={32} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-900">
              GitHub 계정 연결
            </h3>
            <p className="text-slate-500 text-sm">
              {isConnected
                ? `${session.user?.name} 계정과 연결되었습니다.`
                : "문서를 푸시할 GitHub 계정을 연결하세요."}
            </p>
          </div>
        </div>
        {/* 로그인 버튼은 기존 NextAuth signIn 활용 권장 */}
      </div>

      {isConnected && (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4">
          {/* 2. 레포지토리 선택 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <GitBranch size={20} />
              <span className="font-bold">저장소 선택</span>
            </div>
            <select
              value={localRepo}
              onChange={(e) => setLocalRepo(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium mb-4"
            >
              <option value="">레포지토리를 선택하세요</option>
              <option value="capstone-design">capstone-design</option>
              {/* 실제 데이터 연동 시에는 API로 긁어온 목록을 map으로 돌립니다 */}
            </select>
          </div>

          {/* 3. 동기화 설정 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-orange-500">
              <FolderSync size={20} />
              <span className="font-bold">동기화 설정</span>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  TARGET DIRECTORY
                </label>
                <input
                  type="text"
                  value={localDir}
                  onChange={(e) => setLocalDir(e.target.value)}
                  placeholder="/docs/api-specs"
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                />
              </div>
              <div
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer"
                onClick={() => setLocalAutoPush(!localAutoPush)}
              >
                <span className="text-xs font-bold text-slate-500">
                  AUTO-PUSH
                </span>
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors ${localAutoPush ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${localAutoPush ? "right-1" : "left-1"}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConnected && localRepo && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-blue-600" size={24} />
            <div>
              <p className="font-bold text-blue-900">연동 준비 완료!</p>
              <p className="text-blue-700 text-sm">
                이제 에디터에서 설정한 경로로 즉시 푸시가 가능합니다.
              </p>
            </div>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={isSyncing}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {isSyncing && <RefreshCw size={14} className="animate-spin" />}
            설정 저장
          </button>
        </div>
      )}
    </div>
  );
}
