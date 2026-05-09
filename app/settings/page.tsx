"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Settings,
  User,
  LogOut,
  Save,
  RefreshCw,
  Bell,
  Moon,
  Sun,
  LayoutTemplate,
  Globe,
} from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session } = useSession();

  // Zustand 스토어 상태 추출
  const { extension, webhookUrl, theme, setGithubConfig } = useConfigStore();

  // 설정 임시 상태
  const [pendingExt, setPendingExt] = useState(extension || ".md");
  const [pendingWebhook, setPendingWebhook] = useState(webhookUrl || "");
  const [pendingTheme, setPendingTheme] = useState(theme || "light");
  const [pendingTemplate, setPendingTemplate] = useState("standard"); // 기본 템플릿 예시
  const [isSaving, setIsSaving] = useState(false);

  // 설정 저장 함수
  const handleSaveSettings = () => {
    setIsSaving(true);

    setGithubConfig({
      extension: pendingExt,
      webhookUrl: pendingWebhook,
      theme: pendingTheme,
    });

    setTimeout(() => {
      setIsSaving(false);
      alert("설정이 안전하게 저장되었습니다.");
    }, 600);
  };

  if (!session) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 pb-20">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">환경 설정</h1>
            <p className="text-slate-500 text-sm">
              작업 환경과 협업 도구를 구성합니다.
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
        >
          {isSaving ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          설정 저장
        </button>
      </div>

      <div className="grid gap-8">
        {/* 1. 계정 정보 섹션 */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 px-1 flex items-center gap-2">
            <User size={14} /> ACCOUNT
          </h3>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <Image
                src={session.user?.image || ""}
                alt="profile"
                width={56}
                height={56}
                className="rounded-2xl border border-slate-100"
              />
              <div>
                <h4 className="font-bold text-slate-900">
                  {session.user?.name}
                </h4>
                <p className="text-slate-500 text-sm">
                  계정이 활성화되어 있습니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
            >
              <LogOut size={16} /> 로그아웃
            </button>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 2. 문서 템플릿 설정 */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 px-1 flex items-center gap-2">
              <LayoutTemplate size={14} /> DOCUMENT TEMPLATE
            </h3>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm h-full">
              <p className="text-xs text-slate-500 leading-relaxed">
                새 문서를 생성할 때 적용될 기본 레이아웃을 선택합니다. 팀 공통
                양식을 사용하여 문서의 일관성을 유지하세요.
              </p>
              <div className="space-y-2">
                {["Standard", "API Spec", "Meeting Notes"].map((item) => (
                  <div
                    key={item}
                    onClick={() => setPendingTemplate(item.toLowerCase())}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      pendingTemplate === item.toLowerCase()
                        ? "border-indigo-500 bg-indigo-50/30"
                        : "border-slate-50 bg-slate-50 hover:border-slate-200"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${pendingTemplate === item.toLowerCase() ? "text-indigo-600" : "text-slate-600"}`}
                    >
                      {item}
                    </span>
                    {pendingTemplate === item.toLowerCase() && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. 알림 및 환경 설정 */}
          <div className="space-y-8">
            {/* 알림 서비스 연동 */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 px-1 flex items-center gap-2">
                <Bell size={14} /> NOTIFICATIONS
              </h3>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase">
                    Webhook URL (Discord/Slack)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pendingWebhook}
                      onChange={(e) => setPendingWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                    />
                    <Globe
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 ml-1">
                    푸시 성공 시 설정된 채널로 실시간 알림을 전송합니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 테마 및 앱 설정 */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 px-1 flex items-center gap-2">
                <Settings size={14} /> PREFERENCES
              </h3>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
                {/* 다크모드 설정 */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      화면 테마
                    </p>
                    <p className="text-[11px] text-slate-500">
                      에디터 시각 모드를 변경합니다.
                    </p>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setPendingTheme("light")}
                      className={`p-2.5 rounded-lg transition-all ${pendingTheme === "light" ? "bg-white text-orange-500 shadow-sm" : "text-slate-400"}`}
                    >
                      <Sun size={18} />
                    </button>
                    <button
                      onClick={() => setPendingTheme("dark")}
                      className={`p-2.5 rounded-lg transition-all ${pendingTheme === "dark" ? "bg-white text-indigo-500 shadow-sm" : "text-slate-400"}`}
                    >
                      <Moon size={18} />
                    </button>
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
