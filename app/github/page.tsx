import GithubConnect from "@/components/Github/GithubConnect";

export default function GithubPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 페이지 헤더 */}
      <div className="py-12 px-8 border-b border-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <span className="text-xs font-bold uppercase tracking-widest">
              Integrations
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            GitHub 연동
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            문서를 깃허브 저장소와 연결하여 코드와 함께 관리하세요.
          </p>
        </div>
      </div>

      {/* 연동 컴포넌트 */}
      <div className="py-12">
        <GithubConnect />
      </div>
    </div>
  );
}
