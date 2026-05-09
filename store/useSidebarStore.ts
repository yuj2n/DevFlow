import { create } from "zustand";

interface SidebarState {
  isExpanded: boolean;
  toggleSidebar: () => void;
  setExpanded: (val: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: false, // 기본값은 닫힘
  toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (val) => set({ isExpanded: val }),
}));
