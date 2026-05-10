import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  category: string; // 팀/개인 구분
}

interface DocState {
  documents: Document[];
  // 인자를 선택적으로 받도록 수정 (Partial 사용)
  addDocument: (
    data?: Partial<Pick<Document, "title" | "content" | "category">>,
  ) => string;
  updateDocument: (id: string, title: string, content: string) => void;
  deleteDocument: (id: string) => void;
}

export const useDocStore = create<DocState>()(
  persist(
    (set, get) => ({
      documents: [],
      addDocument: (data) => {
        const newId = crypto.randomUUID();
        const newDoc: Document = {
          id: newId,
          // 인자로 들어온 값이 있으면 쓰고, 없으면 기본값 사용
          title: data?.title || "제목 없는 문서",
          content: data?.content || "<h3>새로운 문서를 작성해 보세요.</h3>",
          category: data?.category || "Personal",
          updatedAt: new Date().toLocaleDateString(),
        };
        set((state) => ({ documents: [newDoc, ...state.documents] }));
        return newId;
      },
      updateDocument: (id, title, content) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  title,
                  content,
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
