"use client";

import { useState, useEffect } from "react";
import { useDocStore } from "@/store/useDocStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Trash2,
  FileText,
  Users,
  Calendar,
  RefreshCw,
  Plus,
  FileCode,
  Check,
  X,
} from "lucide-react";
import axios from "axios";
import { useMounted } from "@/hooks/useMounted";

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

const TEMPLATES = [
  {
    id: "template-basic",
    title: "일반 문서 템플릿",
    description: "가장 기본적인 자유 서식의 백지 문서입니다.",
    icon: FileText,
    color:
      "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
    defaultTitle: "제목 없는 일반 문서",
    content:
      "<h3>새로운 자유 문서 작성을 시작해 보세요.</h3><p>여기에 본문 내용을 기입합니다.</p>",
  },
  {
    id: "template-api",
    title: "API SPEC 명세서",
    description:
      "엔드포인트, Request/Response 구조 기술에 최적화된 서식입니다.",
    icon: FileCode,
    color:
      "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    defaultTitle: "새 API SPEC 명세서",
    content: `
      <h2>🚀 API 명세서: [기능 이름]</h2>
      <h3>📌 Endpoint</h3>
      <ul>
        <li><strong>URL:</strong> <code>/api/v1/resource</code></li>
        <li><strong>Method:</strong> <code>GET</code></li>
      </ul>
      <h3>📥 Request Parameters</h3>
      <table border="1">
        <thead>
          <tr><th>이름</th><th>타입</th><th>설명</th></tr>
        </thead>
        <tbody>
          <tr><td>id</td><td>string</td><td>유저 식별 고유키</td></tr>
        </tbody>
      </table>
      <h3>📤 Response Example</h3>
      <pre><code class="language-json">{\n  "status": "success",\n  "data": {}\n}</code></pre>
    `,
  },
  {
    id: "template-meeting",
    title: "MEETING NOTES 명세서",
    description:
      "회의 개요와 핵심 안건, 다음 작업 내용만 깔끔하게 기록하는 표준 회의록 서식입니다.",
    icon: Users,
    color:
      "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
    defaultTitle: "새 회의록 명세서",
    content: `
      <h2>📋 [회의록] 정기 스프린트 및 사양 검토</h2>
      <table border="1" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <tbody>
          <tr>
            <td style="background-color: #f8fafc; font-weight: bold; width: 20%; padding: 6px; text-align: center;">일시</td>
            <td style="padding: 6px;">${new Date().toLocaleDateString()}</td>
            <td style="background-color: #f8fafc; font-weight: bold; width: 20%; padding: 6px; text-align: center;">작성자</td>
            <td style="padding: 6px;">팀원A</td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; font-weight: bold; padding: 6px; text-align: center;">참석자</td>
            <td colspan="3" style="padding: 6px;">팀원A, 팀원B, 팀원C</td>
          </tr>
        </tbody>
      </table>

      <h3>💡 1. 금일 주요 안건 (Agenda)</h3>
      <ul>
        <li><strong>문서 보관함 UI 고도화:</strong> 반응형 2D 그리드 카드 레이아웃 검증 완료</li>
        <li><strong>데이터 동기화 버그 수정:</strong> 고유 ID 기반 중복 제거 로직 적용으로 카드 유실 버그 해결</li>
        <li><strong>GitHub 연동 테스트:</strong> 하위 폴더 경로(/docs/api) 실시간 페칭 상태 점검</li>
      </ul>

      <h3>✅ 2. 향후 조치 사항 (Action Items)</h3>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 6px; width: 60%;">작업 내용 (Task)</th>
            <th style="padding: 6px; width: 20%;">담당자</th>
            <th style="padding: 6px; width: 20%;">마감일</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 6px;">푸시 성공 시 카테고리 'Shared' 자동 승격 로직 연동</td>
            <td style="padding: 6px; text-align: center;">팀원A</td>
            <td style="padding: 6px; text-align: center;">6/12</td>
          </tr>
          <tr>
            <td style="padding: 6px;">하위 디렉토리 마크다운 명세 예외 케이스 테스트</td>
            <td style="padding: 6px; text-align: center;">팀원B</td>
            <td style="padding: 6px; text-align: center;">6/13</td>
          </tr>
        </tbody>
      </table>
    `,
  },
];

export default function DocumentListPage() {
  const { data: session } = useSession();
  const { documents, addDocument, deleteDocument } = useDocStore();
  const { targetDir, namingPattern, selectedRepo } = useConfigStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"All" | "Personal" | "Shared">(
    "All",
  );
  const [githubDocs, setGithubDocs] = useState<LocalOrRemoteDoc[]>([]);
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mounted = useMounted();

  const fetchGitHubDocuments = async () => {
    if (!session || !session.user || !session.user.username) return;

    // 선택된 레포가 아예 없을 시 불필요한 API 호출을 차단하고 격리
    if (!selectedRepo) {
      console.log("선택된 GitHub 저장소가 없어 목록 페칭을 스킵합니다.");
      setGithubDocs([]);
      return;
    }

    setIsRepoLoading(true);
    try {
      const normalizedDir = (targetDir ?? "").replace(/^\/+|\/+$/g, "");

      // 원래 주소를 안정적으로 냅두되,
      // 코드래빗이 요구한 selectedRepo와 path 파라미터를 정확하게 결합하여 송출합니다.
      const response = await axios.get<GitHubFile[]>(
        `/api/github-repos?repo=${encodeURIComponent(selectedRepo)}&path=${encodeURIComponent(normalizedDir)}`,
      );

      const formattedGitDocs = response.data
        .filter(
          (file: GitHubFile) =>
            file.type === "file" &&
            (file.name.endsWith(".md") || file.name.endsWith(".json")),
        )
        .map((file: GitHubFile, index: number) => ({
          id: `github-${file.sha ? file.sha : String(index)}`,
          title: file.name.replace(".md", "").replace(".json", ""),
          content: "",
          category: "Shared",
          updatedAt: new Date().toLocaleDateString(),
          isRemote: true,
          downloadUrl: file.download_url,
        }));

      setGithubDocs(formattedGitDocs);
    } catch (error) {
      console.error("깃허브 원격 데이터를 가져오는데 실패했습니다:", error);
      setGithubDocs([]);
    } finally {
      setIsRepoLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    if (!session || !session.user) return;

    if (activeTab === "Shared" || activeTab === "All") {
      const timer = setTimeout(() => {
        fetchGitHubDocuments();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab, targetDir, selectedRepo, mounted, session]);

  const handleSelectTemplate = (template: (typeof TEMPLATES)[0]) => {
    const now = new Date();
    const timeStamp = now
      .toLocaleTimeString("ko-KR", { hour12: false })
      .replace(/:/g, "");
    const dateStamp = now.toISOString().split("T")[0].replace(/-/g, "");

    let finalTitle = template.defaultTitle;

    if (namingPattern === "title_time") {
      finalTitle = `${template.defaultTitle}_${timeStamp}`;
    } else if (namingPattern === "date_title") {
      finalTitle = `${dateStamp}_${template.defaultTitle}`;
    } else if (namingPattern === "title_only") {
      finalTitle = template.defaultTitle;
    }

    const newId = addDocument({
      title: finalTitle,
      content: template.content,
      category: "Personal",
    });

    setIsModalOpen(false);
    router.push(`/editor/${newId}`);
  };

  const getFilteredDocuments = (): LocalOrRemoteDoc[] => {
    const localPersonal = documents.filter(
      (doc: LocalOrRemoteDoc) => (doc.category || "Personal") === "Personal",
    );
    const localShared = documents.filter(
      (doc: LocalOrRemoteDoc) => doc.category === "Shared",
    );

    const effectiveGithubDocs = session && session.user ? githubDocs : [];

    if (activeTab === "Personal") return localPersonal;
    if (activeTab === "Shared") {
      return [...localShared, ...effectiveGithubDocs].filter(
        (doc: LocalOrRemoteDoc, index: number, self: LocalOrRemoteDoc[]) =>
          self.findIndex((d: LocalOrRemoteDoc) => d.id === doc.id) === index,
      );
    }
    return [...localPersonal, ...localShared, ...effectiveGithubDocs].filter(
      (doc: LocalOrRemoteDoc, index: number, self: LocalOrRemoteDoc[]) =>
        self.findIndex((d: LocalOrRemoteDoc) => d.id === doc.id) === index,
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

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 p-6 md:p-12 max-w-6xl mx-auto relative transition-colors duration-200">
      {/* 상단 헤더 영역 */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
            문서 보관함
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">
            개인 로컬 보관함에서 초안을 작성하고, GitHub 푸시를 통해 팀원과
            실시간 명세를 공유합니다.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/10 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus size={16} />새 문서 작성
        </button>
      </header>

      {/* 탭 레이아웃 */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-px mb-8 transition-colors">
        <div className="flex gap-2 overflow-x-auto">
          {(["All", "Personal", "Shared"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
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

        {!!session && (activeTab === "Shared" || activeTab === "All") && (
          <button
            onClick={fetchGitHubDocuments}
            disabled={isRepoLoading}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <RefreshCw
              size={14}
              className={isRepoLoading ? "animate-spin" : ""}
            />
            <span>원격 동기화</span>
          </button>
        )}
      </div>

      {/* Grid 메인 리스트 */}
      {isRepoLoading && filteredDocuments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-2 transition-colors">
          <RefreshCw size={20} className="animate-spin text-blue-500" />
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            GitHub 저장소 명세를 불러오는 중...
          </p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm transition-colors">
          <p className="text-slate-400 dark:text-slate-500 text-sm">
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
                className={`p-5 border rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between h-48 group relative ${
                  isShared
                    ? "border-emerald-100/80 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700"
                    : "border-blue-100/70 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isShared
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {isShared ? <Users size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {doc.isRemote && (
                      <span className="text-[8px] bg-slate-800 dark:bg-slate-700 text-slate-100 font-bold px-1.5 py-0.5 rounded transition-colors">
                        GitHub
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider transition-colors ${
                        isShared
                          ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                          : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {doc.category}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, doc)}
                      className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex-1 flex flex-col justify-start">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 text-base line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs border-t border-slate-50 dark:border-slate-800/60 pt-2 mt-auto transition-colors">
                    <Calendar size={12} />
                    <span>{doc.updatedAt}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 템플릿 모달 팝업 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 w-full max-w-xl overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40 transition-colors">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 transition-colors">
                  문서 템플릿 선택
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 transition-colors">
                  작성하려는 초안 문서의 기본 서식을 골라주세요.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-3 bg-white dark:bg-slate-900 transition-colors">
              {TEMPLATES.map((template) => {
                const IconComponent = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/10 dark:hover:bg-blue-950/20 p-4 rounded-xl text-left flex gap-4 transition-all hover:translate-x-1 group active:scale-[0.99] shadow-sm"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 transition-colors ${template.color}`}
                    >
                      <IconComponent size={22} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                        {template.title}
                        <Check
                          size={14}
                          className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </h4>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 truncate transition-colors">
                        {template.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
