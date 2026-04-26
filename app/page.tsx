"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-10">
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-slate-900 tracking-tight">
            Dev<span className="text-blue-600">Flow</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium">
            AI 보안 진단과 API 문서화를 결합한 개발자 통합 워크플로우
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <Link
            href="/documents"
            className="group p-10 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                ✍️
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              새 문서 작성
            </h2>
            <p className="text-slate-500 leading-relaxed">
              Tiptap 에디터를 활용하여 API 명세 및 프로젝트 기술 문서를
              작성합니다.
            </p>
          </Link>

          <div
            onClick={() =>
              alert("준비 중인 기능입니다. 10주차에 업데이트될 예정입니다!")
            }
            className="p-10 bg-slate-50 rounded-3xl border border-dashed border-slate-300 text-left opacity-70"
          >
            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-400 mb-3">
              AI 보안 리포트
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Gemini API 기반의 실시간 취약점 분석 기능이 10주차에 업데이트될
              예정입니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
