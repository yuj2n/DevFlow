"use client";

import { useState, useEffect } from "react";
import { useDocStore } from "@/store/useDocStore";
import { useConfigStore } from "@/store/useConfigStore";
import { useRouter } from "next/navigation";
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
    color: "bg-blue-50 text-blue-600 border-blue-100",
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
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
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
    color: "bg-purple-50 text-purple-600 border-purple-100",
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
  const { documents, addDocument, deleteDocument } = useDocStore();
  const { targetDir } = useConfigStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"All" | "Personal" | "Shared">(
    "All",
  );
  const [githubDocs, setGithubDocs] = useState<LocalOrRemoteDoc[]>([]);
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGitHubDocuments = async () => {
    setIsRepoLoading(true);
    try {
      const normalizedDir = (targetDir ?? "").replace(/^\/+|\/+$/g, "");
      const response = await axios.get<GitHubFile[]>(
        `/api/github-repos?path=${encodeURIComponent(normalizedDir)}`,
      );

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
      console.error("깃허브 원격 데이터를 가져오는데 실패했습니다:", error);
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
  }, [activeTab, targetDir]);

  // 💡 정석 연동: 새 문서는 무조건 내 로컬(Personal) 임시 초안으로 안전하게 생성됩니다.
  const handleSelectTemplate = (template: (typeof TEMPLATES)[0]) => {
    const timeStamp = new Date()
      .toLocaleTimeString("ko-KR", { hour12: false })
      .replace(/:/g, "");

    const newId = addDocument({
      title: `${template.defaultTitle}_${timeStamp}`,
      content: template.content,
      category: "Personal",
    });

    setIsModalOpen(false);
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
        (doc, index, self) => self.findIndex((d) => d.id === doc.id) === index,
      );
    }
    return [...localPersonal, ...localShared, ...githubDocs].filter(
      (doc, index, self) => self.findIndex((d) => d.id === doc.id) === index,
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
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 max-w-6xl mx-auto relative">
      {/* 상단 헤더 영역 */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            문서 보관함
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            개인 로컬 보관함에서 초안을 작성하고, GitHub 푸시를 통해 팀원과
            실시간 명세를 공유합니다.
          </p>
        </div>

        {/* 💡 단일 진입로 확보: 무조건 새 문서 버튼 하나로 템플릿 유도 */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-600/10 transition-all flex items-center gap-1.5"
        >
          <Plus size={16} />새 문서 작성
        </button>
      </header>

      {/* 탭 레이아웃 */}
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

        {(activeTab === "Shared" || activeTab === "All") && (
          <button
            onClick={fetchGitHubDocuments}
            disabled={isRepoLoading}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-semibold"
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
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${isShared ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}
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
                      className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${isShared ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}
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

      {/* 템플릿 모달 팝업 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">
                  문서 템플릿 선택
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  작성하려는 초안 문서의 기본 서식을 골라주세요.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {TEMPLATES.map((template) => {
                const IconComponent = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full border border-slate-100 bg-white hover:border-blue-400 hover:bg-blue-50/10 p-4 rounded-xl text-left flex gap-4 transition-all hover:translate-x-1 group active:scale-[0.99] shadow-sm"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${template.color}`}
                    >
                      <IconComponent size={22} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-slate-700 text-sm group-hover:text-blue-600 transition-colors flex items-center justify-between">
                        {template.title}
                        <Check
                          size={14}
                          className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5 truncate">
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
