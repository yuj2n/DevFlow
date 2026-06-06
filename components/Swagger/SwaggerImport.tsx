"use client";

import { useState, useRef } from "react";
import { Link, FileJson, ArrowRight, RefreshCw } from "lucide-react";
import axios from "axios";
import { parseSwaggerToHtml, type SwaggerData } from "@/lib/swagger-parser";
import { useDocStore } from "@/store/useDocStore";

export default function SwaggerImport() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false); // 드래그 활성화 상태 관리
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDocument } = useDocStore();

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

  // 2. URL로 가져오기 핸들러
  const handleImport = async () => {
    if (!url) return;
    setIsLoading(true);

    try {
      // 💡 3. axios 응답 데이터도 any가 남지 않도록 제네릭을 지정합니다.
      const response = await axios.get<SwaggerData>(
        `/api/proxy-swagger?url=${encodeURIComponent(url)}`,
      );
      processSwaggerJson(response.data);
    } catch (error) {
      console.error(error);
      alert("데이터를 불러오는데 실패했습니다. URL을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 파일 읽기 처리 핸들러
  const handleFile = (file: File) => {
    if (!file) return;

    // JSON 파일 확장자 검증 (필요 시 확장)
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      alert("JSON 형식의 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // 💡 4. JSON 파싱 결과물을 SwaggerData 타입으로 안전하게 단언합니다.
        const json = JSON.parse(e.target?.result as string) as SwaggerData;
        processSwaggerJson(json);
      } catch (err) {
        alert("유효한 JSON 파일이 아닙니다.");
      }
    };
    reader.readAsText(file);
  };

  // 4. 드래그 앤 드롭 이벤트 핸들러들
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

  // 5. 클릭 시 파일 탐색기 열기 핸들러
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

      {/* 숨겨진 실제 파일 Input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".json"
        onChange={handleChange}
      />

      {/* 파일 업로드 카드 (드래그 앤 드롭 완벽 구현) */}
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
            파일을 드래그하거나 클릭하여 선택하세요.
          </p>
        </div>
        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Local File Only
        </span>
      </div>
    </div>
  );
}
