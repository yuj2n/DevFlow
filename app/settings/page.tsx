"use client";

import { useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
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
  LogIn,
} from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { webhookUrl, theme, setGithubConfig } = useConfigStore();

  const [pendingWebhook, setPendingWebhook] = useState(webhookUrl || "");
  const [pendingTheme, setPendingTheme] = useState(theme || "light");
  const [pendingTemplate, setPendingTemplate] = useState("standard");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setGithubConfig({
      webhookUrl: pendingWebhook,
      theme: pendingTheme,
    });

    setTimeout(() => {
      setIsSaving(false);
      alert("설정이 안전하게 저장되었습니다.");
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 pb-20">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-100">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">환경 설정</h1>
            <p className="text-slate-500 text-sm font-medium">
              작업 환경과 협업 도구를 구성합니다.
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 disabled:bg-slate-400"
        >
          {isSaving ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          설정 저장
        </button>
      </div>

      <div className="grid gap-10">
        <section className="space-y-4">
          <h3 className="text-[11px] font-black text-slate-400 px-1 flex items-center gap-2 tracking-widest">
            <User size={14} /> ACCOUNT
          </h3>

          {session ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm border-l-4 border-l-blue-500">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="profile"
                      width={56}
                      height={56}
                      className="rounded-2xl border-2 border-white shadow-md object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border-2 border-white shadow-md">
                      <User size={28} />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    {session.user?.name}
                  </h4>
                  <p className="text-slate-400 text-xs font-semibold">
                    @{session.user.username || "User"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-xs font-bold"
              >
                <LogOut size={16} /> 로그아웃
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-white rounded-full shadow-sm text-slate-300">
                <User size={32} />
              </div>
              <div>
                <p className="text-slate-900 font-bold">로그인이 필요합니다</p>
                <p className="text-slate-500 text-xs mt-1">
                  GitHub와 연동하여 문서를 자동으로 관리해 보세요.
                </p>
              </div>
              <button
                onClick={() => signIn("github")}
                className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-2.5 rounded-2xl text-sm font-bold text-slate-900 hover:bg-slate-100 transition-all shadow-sm"
              >
                <LogIn size={16} className="text-blue-500" /> GitHub로 시작하기
              </button>
            </div>
          )}
        </section>

        {/* 하단 설정 섹션들 (템플릿, 테마, 웹훅) */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 px-1 flex items-center gap-2 tracking-widest">
              <LayoutTemplate size={14} /> DOCUMENT TEMPLATE
            </h3>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase">
                Default Layout Selection
              </p>
              <div className="space-y-2">
                {["Standard", "API Spec", "Meeting Notes"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setPendingTemplate(item.toLowerCase())}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                      pendingTemplate === item.toLowerCase()
                        ? "border-blue-500 bg-blue-50/30 text-blue-500"
                        : "border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    <span className="text-sm font-bold">{item}</span>
                    <div
                      className={`w-2 h-2 rounded-full transition-all ${pendingTemplate === item.toLowerCase() ? "bg-blue-500 scale-125" : "bg-slate-200 group-hover:bg-slate-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 px-1 flex items-center gap-2 tracking-widest">
                <Settings size={14} /> PREFERENCES
              </h3>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Appearance
                  </span>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setPendingTheme("light")}
                      className={`p-2 rounded-lg transition-all ${pendingTheme === "light" ? "bg-white text-orange-500 shadow-sm" : "text-slate-400"}`}
                    >
                      <Sun size={16} />
                    </button>
                    <button
                      onClick={() => setPendingTheme("dark")}
                      className={`p-2 rounded-lg transition-all ${pendingTheme === "dark" ? "bg-white text-blue-500 shadow-sm" : "text-slate-400"}`}
                    >
                      <Moon size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-400 px-1 flex items-center gap-2 tracking-widest">
                <Bell size={14} /> NOTIFICATIONS
              </h3>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">
                    Webhook Endpoint
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pendingWebhook}
                      onChange={(e) => setPendingWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-10"
                    />
                    <Globe
                      size={14}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
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
