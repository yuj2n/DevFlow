"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import {
  Settings,
  User,
  LogOut,
  Bell,
  Moon,
  Sun,
  Globe,
  LogIn,
  FileText,
  Calendar,
  Heading,
} from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";
import Image from "next/image";
import { useMounted } from "@/hooks/useMounted";

export default function SettingsPage() {
  const { data: session } = useSession();
  const {
    webhookUrl,
    theme,
    namingPattern,
    setGithubConfig,
    setNamingPattern,
  } = useConfigStore();

  const mounted = useMounted();

  const handleThemeChange = (nextTheme: "light" | "dark") => {
    setGithubConfig({ theme: nextTheme });
    useConfigStore.setState({ theme: nextTheme });

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handlePatternChange = (
    nextPattern: "title_time" | "date_title" | "title_only",
  ) => {
    setNamingPattern(nextPattern);
  };

  // 컴포넌트 내부 State를 아예 거치지 않고 Zustand 스토어에 직접 주입하여 연쇄 반응 차단
  const handleWebhookChange = (nextUrl: string) => {
    setGithubConfig({ webhookUrl: nextUrl });
  };

  const patterns = [
    {
      id: "title_time",
      title: "[제목] + [타임스탬프]",
      example: "새_API_SPEC_명세서_194405",
      description: "제목 뒤에 생성 시분초를 붙여 보관함 내 중복을 방지합니다.",
      icon: FileText,
    },
    {
      id: "date_title",
      title: "[현재 날짜] + [제목]",
      example: "20260611_새_API_SPEC_명세서",
      description: "날짜별로 문서가 정렬되어 히스토리 관리가 용이합니다.",
      icon: Calendar,
    },
    {
      id: "title_only",
      title: "[제목] 만 사용",
      example: "새_API_SPEC_명세서",
      description: "추가 정보 없이 깔끔한 기본 제목으로 문서를 생성합니다.",
      icon: Heading,
    },
  ] as const;

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 pb-20 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              환경 설정
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              변경한 설정은 실시간으로 저장 스토어와 시스템 환경에 반영됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-10">
        {/* 계정 관리 섹션 */}
        <section className="space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 px-1 flex items-center gap-2 tracking-widest">
            <User size={14} /> ACCOUNT
          </h3>

          {session ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex items-center justify-between shadow-sm border-l-4 border-l-blue-500">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="profile"
                      width={56}
                      height={56}
                      className="rounded-2xl border-2 border-white dark:border-slate-800 shadow-md object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-white dark:border-slate-800 shadow-md">
                      <User size={28} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">
                    {session.user?.name}
                  </h4>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                    @{session.user.username || "User"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 dark:text-slate-500 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all text-xs font-bold cursor-pointer"
              >
                <LogOut size={16} /> 로그아웃
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-300">
                <User size={32} />
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 font-bold">
                  로그인이 필요합니다
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  GitHub와 연동하여 문서를 자동으로 관리해 보세요.
                </p>
              </div>
              <button
                onClick={() => signIn("github")}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-2.5 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
              >
                <LogIn size={16} className="text-blue-500" /> GitHub로 시작하기
              </button>
            </div>
          )}
        </section>

        {/* 하단 설정 구역 */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 px-1 flex items-center gap-2 tracking-widest">
              <FileText size={14} /> NAMING CONVENTION
            </h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-black leading-relaxed uppercase tracking-wider mb-1">
                Default File Name Format
              </p>

              {patterns.map((pattern) => {
                const IconComponent = pattern.icon;
                const isSelected = namingPattern === pattern.id;

                return (
                  <button
                    key={pattern.id}
                    onClick={() => handlePatternChange(pattern.id)}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 group cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/20 text-slate-900 dark:text-slate-100"
                        : "border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-white dark:bg-slate-800 text-blue-600 border-blue-200 dark:border-blue-700"
                          : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700"
                      }`}
                    >
                      <IconComponent size={14} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-xs font-bold ${isSelected ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-300"}`}
                        >
                          {pattern.title}
                        </span>
                        <div
                          className={`w-3 h-3 rounded-full border transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-500 scale-110"
                              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 leading-tight">
                        {pattern.description}
                      </p>

                      <div className="mt-2 text-[9px] font-mono bg-white dark:bg-slate-950 border border-blue-200 dark:border-blue-900/60 px-2 py-1 rounded-md inline-block font-bold shadow-sm">
                        ex: {pattern.example}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 우측 설정 구역 (테마 및 알림) */}
          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 px-1 flex items-center gap-2 tracking-widest">
                <Settings size={14} /> PREFERENCES
              </h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Appearance
                  </span>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${theme === "light" ? "bg-white dark:bg-slate-600 text-orange-500 shadow-sm" : "text-slate-400"}`}
                    >
                      <Sun size={16} />
                    </button>
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${theme === "dark" ? "bg-white dark:bg-slate-600 text-blue-500 shadow-sm" : "text-slate-400"}`}
                    >
                      <Moon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 px-1 flex items-center gap-2 tracking-widest">
                <Bell size={14} /> NOTIFICATIONS
              </h3>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 ml-1 uppercase">
                    Webhook Endpoint
                  </label>
                  <div className="relative">
                    {/* value를 전역 스토어 상태인 webhookUrl로 다이렉트 맵핑 */}
                    <input
                      type="text"
                      value={webhookUrl || ""}
                      onChange={(e) => handleWebhookChange(e.target.value)}
                      placeholder="https://hooks.slack.com/..."
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10 text-slate-800 dark:text-slate-100"
                    />
                    <Globe
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
