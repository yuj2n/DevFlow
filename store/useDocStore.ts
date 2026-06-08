import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  category: string;
}

interface DocState {
  documents: Document[];
  addDocument: (
    data?: Partial<Pick<Document, "title" | "content" | "category">>,
  ) => string;
  // 선택적 카테고리 파라미터 추가
  updateDocument: (
    id: string,
    title: string,
    content: string,
    category?: string,
  ) => void;
  deleteDocument: (id: string) => void;
}

export const useDocStore = create<DocState>()(
  persist(
    (set) => ({
      documents: [],
      addDocument: (data) => {
        const newId = crypto.randomUUID();
        const newDoc: Document = {
          id: newId,
          title: data?.title || "제목 없는 문서",
          content: data?.content || "<h3>새로운 문서를 작성해 보세요.</h3>",
          category: data?.category || "Personal",
          updatedAt: new Date().toLocaleDateString(),
        };
        set((state) => ({ documents: [newDoc, ...state.documents] }));
        return newId;
      },
      // 🛡️ category 파라미터 반영 및 조건부 병합 알고리즘 주입
      updateDocument: (id, title, content, category) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  title,
                  content,
                  // category 인자가 넘어왔을 때만 안전하게 덮어쓰기 처리
                  ...(category !== undefined && { category }),
                  updatedAt: new Date().toLocaleDateString(),
                }
              : doc,
          ),
        }));
      },
      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        }));
      },
    }),
    { name: "devflow-storage" },
  ),
);
