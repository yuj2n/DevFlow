"use client";

import { useState } from "react";
import {
  GitBranch,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  Settings2,
  FolderSync,
} from "lucide-react";

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
  const [isConnected, setIsConnected] = useState(false);
  const [repo, setRepo] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = () => {
    setIsSyncing(true);
    // OAuth 인증 로직이 들어갈 자리
    setTimeout(() => {
      setIsConnected(true);
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* 1. 계정 연결 섹션 */}
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
                ? "yujin-dev 계정과 연결되었습니다."
                : "문서를 푸시할 GitHub 계정을 연결하세요."}
            </p>
          </div>
        </div>
        <button
          onClick={handleConnect}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            isConnected
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          }`}
        >
          {isSyncing ? (
            <RefreshCw className="animate-spin" size={20} />
          ) : isConnected ? (
            "계정 전환"
          ) : (
            "GitHub로 로그인"
          )}
        </button>
      </div>

      {isConnected && (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4">
          {/* 2. 레포지토리 선택 섹션 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <GitBranch size={20} />
              <span className="font-bold">저장소 선택</span>
            </div>
            <select
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium mb-4"
            >
              <option value="">레포지토리를 선택하세요</option>
              <option value="capstone-design">capstone-design</option>
              <option value="devflow-project">devflow-project</option>
              <option value="api-docs-repo">api-docs-repo</option>
            </select>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <ExternalLink size={12} />새 레포지토리는 깃허브에서 생성 후
              불러오세요.
            </p>
          </div>

          {/* 3. 동기화 설정 섹션 */}
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
                  placeholder="/docs/api-specs"
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-500">
                  AUTO-PUSH
                </span>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isConnected && repo && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-blue-600" size={24} />
            <div>
              <p className="font-bold text-blue-900">연동 준비 완료!</p>
              <p className="text-blue-700 text-sm">
                이제 에디터 상단 &apos;GitHub로 푸시&apos; 버튼을 눌러 문서를
                업로드할 수 있습니다.
              </p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors">
            설정 저장
          </button>
        </div>
      )}
    </div>
  );
}
