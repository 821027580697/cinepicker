/**
 * 전역 앱 상태 관리 (Zustand)
 *
 * 애플리케이션 전역에서 공유되는 UI 상태를 관리합니다.
 * - 모바일 사이드바 열기/닫기
 * - 검색 모달 열기/닫기
 *
 * @example
 * const { isSidebarOpen, toggleSidebar } = useAppStore();
 * const { isSearchOpen, openSearch, closeSearch } = useAppStore();
 */

import { create } from "zustand";

/** 앱 전역 상태 인터페이스 */
interface AppState {
  /** 모바일 사이드바 열림 여부 */
  isSidebarOpen: boolean;
  /** 사이드바 열기/닫기 토글 */
  toggleSidebar: () => void;
  /** 사이드바 상태 직접 설정 */
  setSidebarOpen: (open: boolean) => void;

  /** 검색 모달 열림 여부 */
  isSearchOpen: boolean;
  /** 검색 모달 열기 */
  openSearch: () => void;
  /** 검색 모달 닫기 */
  closeSearch: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // ── 사이드바 ──
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  // ── 검색 모달 ──
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
}));
