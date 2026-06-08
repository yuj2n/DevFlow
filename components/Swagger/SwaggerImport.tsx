"use client";

import { useState, useRef } from "react";
import { Link, FileJson, ArrowRight, RefreshCw } from "lucide-react";
import axios from "axios";
import { parseSwaggerToHtml, type SwaggerData } from "@/lib/swagger-parser";
import { useDocStore } from "@/store/useDocStore";

export default function SwaggerImport() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDocument } = useDocStore();

  // 🛡️ 1. 런타임 타입 검증을 위한 사용자 정의 타입 가드 (Type Guard)
  const isSwaggerData = (data: unknown): data is SwaggerData => {
    if (!data || typeof data !== "object") return false;
    const obj = data as Record<string, unknown>;
    if (obj.info && typeof obj.info !== "object") return false;
    if (obj.paths && typeof obj.paths !== "object") return false;
    return true;
  };

  const processSwaggerJson = (jsonData: SwaggerData) => {
    try {
      const convertedHtml = parseSwaggerToHtml(jsonData);

      addDocument({
        title: jsonData.info?.title || "가져온 API 문서",
        content: convertedHtml,
        category: "Shared",
      });

      alert("API 명세를 성공적으로 가져왔습니다!");
    } catch (parseError) {
      console.error(parseError);
      alert("Swagger 형식이 올바르지 않거나 파싱 중 오류가 발생했습니다.");
    }
  };

  const handleImport = async () => {
    if (!url) return;
    setIsLoading(true);

    try {
      const response = await axios.get<SwaggerData>(
        `/api/proxy-swagger?url=${encodeURIComponent(url)}`,
      );

      // 🛡️ API 응답에 대한 런타임 데이터 구조 검증
      if (!isSwaggerData(response.data)) {
        alert("유효하지 않은 Swagger 형식입니다.");
        return;
      }

      processSwaggerJson(response.data);
    } catch (error) {
      console.error(error);
      alert("데이터를 불러오는데 실패했습니다. URL을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      alert("JSON 형식의 파일만 업로드 가능합니다.");
      return;
    }

    // 🛡️ 2. 브라우저 메모리 고갈 및 크래시 방지를 위한 파일 크기 제한 (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert("파일 크기는 최대 5MB를 초과할 수 없습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        // 🛡️ 업로드된 JSON 데이터 런타임 유효성 체크
        if (!isSwaggerData(json)) {
          alert("유효한 Swagger 형식의 JSON이 아닙니다.");
          return;
        }

        processSwaggerJson(json);
      } catch (err) {
        alert("유효한 JSON 파일이 아닙니다.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-6 p-6 bg-slate-50 rounded-3xl">
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

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".json"
        onChange={handleChange}
      />

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all space-y-4 ${
          isDragActive
            ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
            : "border-slate-200 bg-white/50 hover:bg-white hover:border-slate-300"
        }`}
      >
        <div
          className={`w-10 h-10 transition-colors ${isDragActive ? "text-blue-500" : "text-slate-300"}`}
        >
          <FileJson size={40} />
        </div>
        <div className="text-center select-none">
          <h3 className="font-bold text-slate-700">JSON / YAML 파일 업로드</h3>
          <p className="text-slate-400 text-xs mt-1">
            드래그하거나 클릭하여 선택하세요.
          </p>
        </div>
        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Local File Only
        </span>
      </div>
    </div>
  );
}
