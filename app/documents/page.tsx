"use client";

import { useState, useEffect } from "react";
import { useDocStore } from "@/store/useDocStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trash2,
  FileText,
  Users,
  Calendar,
  RefreshCw,
  Plus,
} from "lucide-react";
import axios from "axios";

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  download_url: string;
  type: string;
}

interface LocalOrRemoteDoc {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  isRemote?: boolean;
  downloadUrl?: string;
}

export default function DocumentListPage() {
  const { documents, addDocument, deleteDocument } = useDocStore(); // addDocument 추가
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"All" | "Personal" | "Shared">(
    "All",
  );
  const [githubDocs, setGithubDocs] = useState<LocalOrRemoteDoc[]>([]);
  const [isRepoLoading, setIsRepoLoading] = useState(false);

  const fetchGitHubDocuments = async () => {
    setIsRepoLoading(true);
    try {
      // 실제 사용하시는 깃허브 목록 조회 API 엔드포인트
      const response = await axios.get<GitHubFile[]>("/api/github-repos");

      const formattedGitDocs = response.data
        .filter(
          (file) =>
            file.type === "file" &&
            (file.name.endsWith(".md") || file.name.endsWith(".json")),
        )
        .map((file, index) => ({
          id: `github-${file.sha || index}`,
          title: file.name.replace(".md", "").replace(".json", ""),
          content: "",
          category: "Shared",
          updatedAt: new Date().toLocaleDateString(),
          isRemote: true,
          downloadUrl: file.download_url,
        }));

      setGithubDocs(formattedGitDocs);
    } catch (error) {
      console.error(
        "깃허브 원격 저장소 데이터를 가져오는데 실패했습니다:",
        error,
      );
    } finally {
      setIsRepoLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Shared" || activeTab === "All") {
      const timer = setTimeout(() => {
        fetchGitHubDocuments();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // 새 문서 만들기 핸들러 (Personal 카테고리로 생성 후 에디터로 이동)
  const handleCreateNewDoc = () => {
    const newId = addDocument({
      title: "제목 없는 문서",
      content: "<h3>새로운 문서를 작성해 보세요.</h3>",
      category: "Personal",
    });
    router.push(`/editor/${newId}`);
  };

  const getFilteredDocuments = (): LocalOrRemoteDoc[] => {
    const localPersonal = documents.filter(
      (doc) => (doc.category || "Personal") === "Personal",
    );
    const localShared = documents.filter((doc) => doc.category === "Shared");

    if (activeTab === "Personal") return localPersonal;

    if (activeTab === "Shared") {
      return [...localShared, ...githubDocs].filter(
        (doc, index, self) =>
          self.findIndex((d) => d.title === doc.title) === index,
      );
    }

    return [...localPersonal, ...localShared, ...githubDocs].filter(
      (doc, index, self) =>
        self.findIndex((d) => d.title === doc.title) === index,
    );
  };

  const filteredDocuments = getFilteredDocuments();

  const handleDelete = (e: React.MouseEvent, doc: LocalOrRemoteDoc) => {
    e.preventDefault();
    e.stopPropagation();

    if (doc.isRemote) {
      alert(
        "깃허브 저장소의 공유 문서는 에디터 내부 푸시나 레포지토리에서 관리할 수 있습니다.",
      );
      return;
    }

    if (confirm(`'${doc.title}' 문서를 정말 삭제하시겠습니까?`)) {
      deleteDocument(doc.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 max-w-6xl mx-auto">
      {/* 상단 헤더 섹션 */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            문서 보관함
          </h2>
          <p className="text-slate-500 text-sm mt-3">
            개인 로컬 보관함 및 원격 팀 GitHub 저장소와 실시간 동기화된 명세를
            관리합니다.
          </p>
        </div>

        {/* 상단 우측에 완전히 부활한 [새 문서 생성] 버튼 크루 */}
        <button
          onClick={handleCreateNewDoc}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/10 transition-all flex items-center gap-1.5"
        >
          <Plus size={16} />새 문서
        </button>
      </header>

      {/* 카테고리 탭 인터페이스 */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-px mb-8">
        <div className="flex gap-2 overflow-x-auto">
          {(["All", "Personal", "Shared"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "All"
                ? "전체 문서"
                : tab === "Personal"
                  ? "개인 문서"
                  : "팀 공유 문서"}
            </button>
          ))}
        </div>

        {/* 원격 동기화 새로고침 아이콘 */}
        {(activeTab === "Shared" || activeTab === "All") && (
          <button
            onClick={fetchGitHubDocuments}
            disabled={isRepoLoading}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-semibold"
            title="원격 저장소 동기화"
          >
            <RefreshCw
              size={14}
              className={isRepoLoading ? "animate-spin" : ""}
            />
            <span>원격 동기화</span>
          </button>
        )}
      </div>

      {/* 격자형 문서 보드 */}
      {isRepoLoading && filteredDocuments.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2">
          <RefreshCw size={20} className="animate-spin text-blue-500" />
          <p className="text-slate-400 text-sm">
            GitHub 저장소 명세를 불러오는 중...
          </p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-slate-400 text-sm">
            해당 범주에 작성된 문서 사양이 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => {
            const isShared = doc.category === "Shared";
            const targetHref = doc.isRemote
              ? `/editor/new?repoFile=${encodeURIComponent(doc.downloadUrl || "")}`
              : `/editor/${doc.id}`;

            return (
              <Link
                href={targetHref}
                key={doc.id}
                className={`p-5 border rounded-2xl bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between h-48 group relative ${
                  isShared
                    ? "border-emerald-100/80 hover:border-emerald-300"
                    : "border-blue-100/70 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isShared
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {isShared ? <Users size={20} /> : <FileText size={20} />}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {doc.isRemote && (
                      <span className="text-[8px] bg-slate-800 text-slate-100 font-bold px-1.5 py-0.5 rounded">
                        GitHub
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        isShared
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {doc.category}
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, doc)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex-1 flex flex-col justify-start">
                  <h4 className="font-bold text-slate-700 text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs border-t border-slate-50 pt-2 mt-auto">
                    <Calendar size={12} />
                    <span>{doc.updatedAt}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
