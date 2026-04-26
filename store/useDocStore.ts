import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DocState {
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
}

export const useDocStore = create<DocState>()(
  persist(
    (set) => ({
      title: "Untitled Document",
      content: "<h1>DevFlow 문서 작성을 시작합니다</h1>", // 초기값
      setTitle: (title) => set({ title }),
      setContent: (content) => set({ content }),
    }),
    {
      name: "devflow-storage", // 브라우저 저장소에 저장될 키 이름
    },
  ),
);
