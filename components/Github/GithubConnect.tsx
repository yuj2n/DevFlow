"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { GitBranch, CheckCircle2, FolderSync, ChevronDown } from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";
import axios from "axios";
import Image from "next/image";
import { useMounted } from "@/hooks/useMounted";

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

  // Zustand 스토어 상태를 바로 바인딩합니다.
  const { selectedRepo, targetDir, branch, extension, setGithubConfig } =
    useConfigStore();

  const [repos, setRepos] = useState<{ id: number; name: string }[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const mounted = useMounted();

  // 사용자가 변경 시 스토어를 실시간으로 즉시 동기화합니다.
  const handleRepoChange = (repo: string) => {
    setGithubConfig({ selectedRepo: repo });
  };

  const handleDirChange = (dir: string) => {
    setGithubConfig({ targetDir: dir });
  };

  const handleBranchChange = (targetBranch: string) => {
    setGithubConfig({ branch: targetBranch });
  };

  const handleExtChange = (ext: string) => {
    setGithubConfig({ extension: ext });
  };

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
            console.error("An unexpected error occurred:", error);
          }
        } finally {
          setIsLoadingRepos(false);
        }
      };
      fetchRepos();
    }
  }, [session]);

  // 스토어의 selectedRepo 변경에 반응하여 브랜치 로드
  useEffect(() => {
    if (session?.user?.username && selectedRepo) {
      const fetchBranches = async () => {
        setIsLoadingBranches(true);
        try {
          const response = await axios.get("/api/github-branches", {
            params: {
              owner: session.user.username,
              repo: selectedRepo,
            },
          });
          setBranches(response.data);

          if (!response.data.includes(branch)) {
            setGithubConfig({ branch: response.data[0] || "main" });
          }
        } catch (error) {
          console.error("Branches load failed:", error);
        } finally {
          setIsLoadingBranches(false);
        }
      };
      fetchBranches();
    }
  }, [selectedRepo, session, branch, setGithubConfig]);

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 bg-white dark:bg-slate-950" />
    );
  }

  const isConnected = !!session;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 계정 연결 섹션 카드 */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
        <div className="flex items-center gap-5">
          {isConnected && session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="profile"
              width={56}
              height={56}
              className="rounded-2xl border border-slate-100 dark:border-slate-800"
            />
          ) : (
            <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center transition-colors">
              <GithubLogo size={32} />
            </div>
          )}
          <div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 transition-colors">
              GitHub 계정 연결
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
              {isConnected
                ? `${session?.user?.name} (@${session?.user?.username}) 계정과 연결됨`
                : "문서를 푸시할 GitHub 계정을 연결하세요."}
            </p>
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 왼쪽: 저장소 및 브랜치 설정 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold transition-colors">
                <GitBranch size={20} />
                <span>저장소 및 브랜치</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase transition-colors">
                  Repository
                </label>
                <div className="relative">
                  <select
                    value={selectedRepo || ""}
                    onChange={(e) => handleRepoChange(e.target.value)}
                    disabled={isLoadingRepos}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50 appearance-none text-slate-800 dark:text-slate-200 transition-all"
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
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase transition-colors">
                  Target Branch
                </label>
                <div className="relative">
                  <select
                    value={branch || "main"}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    disabled={isLoadingBranches || !selectedRepo}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium disabled:opacity-50 appearance-none text-slate-800 dark:text-slate-200 transition-all"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* 오른쪽: 상세 동기화 설정 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <div className="flex items-center gap-2 text-orange-500 dark:text-orange-400 font-bold transition-colors">
                <FolderSync size={20} />
                <span>상세 동기화 설정</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase transition-colors">
                  Target Directory
                </label>
                <input
                  type="text"
                  value={targetDir || ""}
                  onChange={(e) => handleDirChange(e.target.value)}
                  placeholder="예: /docs/api-specs (빈칸은 최상위)"
                  className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-slate-200 font-medium transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 uppercase transition-colors">
                  File Extension
                </label>
                <div className="flex gap-2">
                  {[".md", ".mdx"].map((ext) => (
                    <button
                      key={ext}
                      type="button"
                      onClick={() => handleExtChange(ext)}
                      className={`flex-1 p-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        extension === ext
                          ? "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      {ext}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 저장 상태 알림 인디케이터 구역 */}
          {selectedRepo && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-5 rounded-3xl flex items-center transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  className="text-blue-600 dark:text-blue-400 flex-shrink-0"
                  size={22}
                />
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-200 text-xs transition-colors">
                    실시간 자동 저장 활성화 완료
                  </p>
                  <p className="text-blue-700 dark:text-blue-400/80 text-[11px] transition-colors">
                    입력 항목이 스토리지에 상시 고정되며 에디터 파이프라인과
                    디스코드 웹훅에 연동됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
