"use client";

import { useState } from "react";
import {
  Link2,
  FileCode,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SwaggerImportPage() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleImport = () => {
    setStatus("loading");
    // 여기에 실제 파싱 로직이 들어갈 예정입니다 (9주차 목표!)
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 섹션 */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Swagger API 가져오기
          </h1>
          <p className="text-slate-500">
            Swagger URL이나 JSON 파일을 통해 API 명세를 자동으로 문서화합니다.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 왼쪽: URL 입력 방식 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Link2 size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Swagger URL로 연결</h3>
            <p className="text-slate-500 text-sm mb-6">
              배포된 Swagger UI의 JSON/YAML 엔드포인트를 입력하세요.
            </p>

            <div className="relative mb-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/swagger.json"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              />
              <Search
                className="absolute left-3 top-3.5 text-slate-400"
                size={18}
              />
            </div>

            <button
              onClick={handleImport}
              disabled={!url || status === "loading"}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              {status === "loading" ? "데이터 분석 중..." : "API 불러오기"}
              <ArrowRight size={18} />
            </button>
          </div>

          {/* 오른쪽: 파일 업로드 방식 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-dashed hover:border-blue-400 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
              <FileCode size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">JSON / YAML 파일 업로드</h3>
            <p className="text-slate-500 text-sm mb-4">
              파일을 드래그하거나 클릭하여 선택하세요.
            </p>
            <span className="text-xs text-blue-600 font-semibold px-3 py-1 bg-blue-50 rounded-full">
              Local File Only
            </span>
          </div>
        </div>

        {/* 안내 메시지 (상태에 따라 표시) */}
        {status === "success" && (
          <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={20} />
            <span className="text-sm font-medium">
              데이터를 성공적으로 불러왔습니다! 이제 에디터로 변환할 수
              있습니다.
            </span>
          </div>
        )}

        {/* 하단: 도움말 섹션 */}
        <section className="mt-16 border-t border-slate-200 pt-10">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-blue-500" />
            Swagger 연동 팁
          </h4>
          <ul className="grid gap-4 md:grid-cols-3 text-sm text-slate-500">
            <li className="bg-slate-100/50 p-4 rounded-lg">
              <strong>자동 업데이트:</strong> 한 번 연결하면 Swagger 내용이
              변경될 때마다 DevFlow 문서에도 알림이 뜹니다.
            </li>
            <li className="bg-slate-100/50 p-4 rounded-lg">
              <strong>Response Mockup:</strong> API 응답 예시 데이터를 기반으로
              프론트엔드용 목업 코드를 자동 생성합니다.
            </li>
            <li className="bg-slate-100/50 p-4 rounded-lg">
              <strong>GitHub Sync:</strong> 변환된 문서는 깃허브 레포지토리의
              docs 폴더와 실시간 동기화가 가능합니다.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
