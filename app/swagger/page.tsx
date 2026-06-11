"use client";

import { useState, useEffect } from "react";
import SwaggerImport from "@/components/Swagger/SwaggerImport";

export default function SwaggerPage() {
  const [mounted, setMounted] = useState(false);

  // 하이드레이션 에러 방지를 위한 마운트 상태 제어
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 제목 영역 */}
      <header className="py-20 px-16 border-b border-slate-50 dark:border-slate-900 transition-colors">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            Swagger 공유
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-6">
            API 명세를 불러와서 DevFlow 문서로 자동 변환합니다.
          </p>
        </div>
      </header>

      {/* 실제 기능 컴포넌트 */}
      <main>
        <SwaggerImport />
      </main>
    </div>
  );
}
