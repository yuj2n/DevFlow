"use client";

import { useState } from "react";
import { Link, FileJson, ArrowRight, RefreshCw } from "lucide-react";
import axios from "axios";
import { parseSwaggerToHtml } from "@/lib/swagger-parser";
import { useDocStore } from "@/store/useDocStore"; // 기존에 쓰던 문서 스토어

export default function SwaggerImport() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addDocument } = useDocStore(); // 새 문서를 추가하는 함수

  const handleImport = async () => {
    if (!url) return;
    setIsLoading(true);

    try {
      // 1. 프록시 API를 통해 데이터 가져오기
      const response = await axios.get(
        `/api/proxy-swagger?url=${encodeURIComponent(url)}`,
      );

      // 2. HTML로 파싱
      const convertedHtml = parseSwaggerToHtml(response.data);

      // 3. 새 문서로 저장 (제목은 Swagger 제목으로)
      addDocument({
        title: response.data.info.title || "가져온 API 문서",
        content: convertedHtml,
        category: "Shared", // 팀 문서로 기본 설정
      });

      alert("API 명세를 성공적으로 가져왔습니다!");
    } catch (error) {
      alert("데이터를 불러오는데 실패했습니다. URL을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-6 p-6 bg-slate-50 rounded-3xl">
      {/* URL 입력 카드 */}
      <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
          <Link size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Swagger URL로 연결</h3>
          <p className="text-slate-500 text-sm">
            배포된 Swagger UI의 JSON 엔드포인트를 입력하세요.
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/v1/swagger.json"
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 pl-10"
          />
          <Link
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
        <button
          onClick={handleImport}
          disabled={isLoading}
          className="w-full bg-slate-500 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-600 transition-all"
        >
          {isLoading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <>
              <FileJson size={18} /> API 불러오기 <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* 파일 업로드 카드 (UI만 구현) */}
      <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 bg-white/50 space-y-4">
        <div className="w-10 h-10 text-slate-300">
          <FileJson size={40} />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-700">JSON / YAML 파일 업로드</h3>
          <p className="text-slate-400 text-xs">
            파일을 드래그하거나 클릭하여 선택하세요.
          </p>
        </div>
        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">
          Local File Only
        </span>
      </div>
    </div>
  );
}
