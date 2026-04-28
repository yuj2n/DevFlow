import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Document {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface DocState {
  documents: Document[];
  addDocument: () => string; // 새 문서 만들고 ID 반환
  updateDocument: (id: string, title: string, content: string) => void;
  deleteDocument: (id: string) => void;
}

export const useDocStore = create<DocState>()(
  persist(
    (set, get) => ({
      documents: [],
      addDocument: () => {
        const newId = Date.now().toString();
        const newDoc = {
          id: newId,
          title: "제목 없는 문서",
          content: "<h3>새로운 문서를 작성해 보세요.</h3>",
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
