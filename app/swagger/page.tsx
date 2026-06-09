import SwaggerImport from "@/components/Swagger/SwaggerImport";

export default function SwaggerPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 제목 영역 */}
      <header className="py-20 px-16 border-b border-slate-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-black text-slate-900">Swagger 공유</h1>
          <p className="text-slate-500 mt-6">
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
