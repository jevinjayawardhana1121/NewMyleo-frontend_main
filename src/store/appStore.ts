import { create } from 'zustand';
import { type AlertNotification, setAlertListener, setLoadingListener } from '@/lib/api';

interface AppState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  globalLoading: boolean;
  notifications: AlertNotification[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
  addNotification: (n: AlertNotification) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => {
  // Wire up api listener
  setAlertListener((n) => {
    set((state) => ({
      notifications: [...state.notifications.slice(-4), n],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((item) => item.id !== n.id),
      }));
    }, 4500);
  });

  setLoadingListener((loading) => {
    set({ globalLoading: loading });
  });

  return {
    sidebarOpen: true,
    mobileMenuOpen: false,
    globalLoading: false,
    notifications: [],

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
    setGlobalLoading: (loading) => set({ globalLoading: loading }),

    addNotification: (n) =>
      set((state) => ({
        notifications: [...state.notifications.slice(-4), n],
      })),

    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
  };
});

