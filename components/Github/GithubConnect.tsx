"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  GitBranch,
  RefreshCw,
  CheckCircle2,
  FolderSync,
  ChevronDown,
} from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";
import axios from "axios";
import Image from "next/image";

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
  const {
    selectedRepo,
    targetDir,
    autoPush,
    branch,
    extension,
    setGithubConfig,
  } = useConfigStore();

  // 목록 데이터 상태
  const [repos, setRepos] = useState<{ id: number; name: string }[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // 임시 대기 상태
  const [pendingRepo, setPendingRepo] = useState(selectedRepo);
  const [pendingDir, setPendingDir] = useState(targetDir);
  const [pendingAutoPush, setPendingAutoPush] = useState(autoPush);
  const [pendingBranch, setPendingBranch] = useState(branch || "main");
  const [pendingExt, setPendingExt] = useState(extension || ".md");
  const [isSaving, setIsSaving] = useState(false);

  // 레포 목록 가져오기
  useEffect(() => {
    if (session) {
      const fetchRepos = async () => {
        setIsLoadingRepos(true);
        try {
          const response = await axios.get("/api/github-repos");
          if (Array.isArray(response.data)) setRepos(response.data);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Repos load failed:",
              error.response?.data || error.message,
            );
          } else {
            console.error("예상치 못한 문제가 발생했습니다:", error);
          }
        } finally {
          setIsLoadingRepos(false);
        }
      };
      fetchRepos();
    }
  }, [session]);

  // 선택된 레포에 따른 브랜치 목록 가져오기
  useEffect(() => {
    if (session && pendingRepo) {
      const fetchBranches = async () => {
        setIsLoadingBranches(true);
        try {
          const response = await axios.get("/api/github-branches", {
            params: {
              owner: session.user.username,
              repo: pendingRepo,
            },
          });
          setBranches(response.data);
          // 현재 선택된 브랜치가 목록에 없으면 기본값 설정
          if (!response.data.includes(pendingBranch)) {
            setPendingBranch(response.data[0] || "main");
          }
        } catch (error) {
          console.error("Branches load failed:", error);
        } finally {
          setIsLoadingBranches(false);
        }
      };
      fetchBranches();
    }
  }, [pendingRepo, session]);

  // 설정 저장
  const handleSaveConfig = () => {
    setIsSaving(true);
    setGithubConfig({
      selectedRepo: pendingRepo,
      targetDir: pendingDir,
      autoPush: pendingAutoPush,
      branch: pendingBranch,
      extension: pendingExt,
    });

    setTimeout(() => {
      setIsSaving(false);
      alert("모든 설정이 안전하게 저장되었습니다.");
    }, 600);
  };

  const isConnected = !!session;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* 계정 연결 섹션 */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-5">
          {isConnected && session.user.image ? (
            <Image
              src={session.user.image}
              alt="profile"
              width={56}
              height={56}
              className="rounded-2xl border border-slate-100"
            />
          ) : (
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
              <GithubLogo size={32} />
            </div>
          )}
          <div>
            <h3 className="font-bold text-xl text-slate-900">
              GitHub 계정 연결
            </h3>
            <p className="text-slate-500 text-sm">
              {isConnected
                ? `${session.user.name} (@${session.user.username}) 계정과 연결됨`
                : "문서를 푸시할 GitHub 계정을 연결하세요."}
            </p>
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 저장소 선택 섹션 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <GitBranch size={20} />
                <span>저장소 및 브랜치</span>
              </div>

              {/* 레포 선택 */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                  Repository
                </label>
                <select
                  value={pendingRepo}
                  onChange={(e) => setPendingRepo(e.target.value)}
                  disabled={isLoadingRepos}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50 appearance-none"
                >
                  {isLoadingRepos ? (
                    <option>불러오는 중...</option>
                  ) : (
                    <>
                      <option value="">레포지토리를 선택하세요</option>
                      {repos.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* 브랜치 선택 (추가된 부분) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                  Target Branch
                </label>
                <div className="relative">
                  <select
                    value={pendingBranch}
                    onChange={(e) => setPendingBranch(e.target.value)}
                    disabled={isLoadingBranches || !pendingRepo}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50 appearance-none"
                  >
                    {isLoadingBranches ? (
                      <option>브랜치 확인 중...</option>
                    ) : (
                      branches.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* 동기화 및 확장자 설정 섹션 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-orange-500 font-bold">
                <FolderSync size={20} />
                <span>상세 동기화 설정</span>
              </div>

              {/* 대상 디렉토리 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                  Target Directory
                </label>
                <input
                  type="text"
                  value={pendingDir}
                  onChange={(e) => setPendingDir(e.target.value)}
                  placeholder="/docs/api-specs"
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* 확장자 선택 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                  File Extension
                </label>
                <div className="flex gap-2">
                  {[".md", ".mdx"].map((ext) => (
                    <button
                      key={ext}
                      onClick={() => setPendingExt(ext)}
                      className={`flex-1 p-3 rounded-xl border text-sm font-bold transition-all ${
                        pendingExt === ext
                          ? "bg-orange-50 border-orange-200 text-orange-600"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      {ext}
                    </button>
                  ))}
                </div>
              </div>

              {/* 오토 푸시 토글 */}
              <div
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl cursor-pointer mt-2"
                onClick={() => setPendingAutoPush(!pendingAutoPush)}
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Auto-Push On Save
                </span>
                <div
                  className={`w-10 h-5 rounded-full relative transition-colors ${pendingAutoPush ? "bg-blue-600" : "bg-slate-300"}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${pendingAutoPush ? "right-1" : "left-1"}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 하단 저장 바 */}
          {pendingRepo && (
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-blue-600" size={24} />
                <div>
                  <p className="font-bold text-blue-900 text-sm">
                    연동 준비 완료
                  </p>
                  <p className="text-blue-700 text-xs">
                    설정을 저장하면 즉시 에디터에 적용됩니다.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSaveConfig}
                disabled={isSaving || isLoadingBranches}
                className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
              >
                {isSaving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  "모든 설정 저장"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
