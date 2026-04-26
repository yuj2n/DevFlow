import { create } from "zustand";

interface DocState {
  title: string;
  setTitle: (title: string) => void;
}

export const useDocStore = create<DocState>((set) => ({
  title: "Untitled Document",
  setTitle: (title) => set({ title }),
}));
