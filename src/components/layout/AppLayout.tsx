import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '@/components/ui/toast';
import { useAppStore } from '@/store/appStore';
import { useUserStore } from '@/store/userStore';
import { motion } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AppLayout({ children, pageTitle, subtitle, actions }: AppLayoutProps) {
  const { globalLoading } = useAppStore();
  const { initFromCookies } = useUserStore();

  useEffect(() => {
    initFromCookies();
  }, [initFromCookies]);

  return (
    <div className="relative flex min-h-screen bg-canvas font-sans text-slate-800 overflow-x-hidden">
      {/* Subtle Ambient Background Lighting Elements (Same color palette: brand blue & gold) */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-brand-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-10 w-[450px] h-[450px] bg-amber-400/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Global Loading Bar */}
      {globalLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-brand-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-600 via-brand-400 to-amber-400 animate-[shimmer_1.5s_infinite_linear] origin-left" />
        </div>
      )}

      {/* Main Persistent Sidebar */}
      <Sidebar />

      {/* Primary Content Stream */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar pageTitle={pageTitle} subtitle={subtitle} actions={actions} />

        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>

        <footer className="py-6 px-8 text-xs text-slate-400 border-t border-slate-200/60 mt-auto bg-white/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-600">MYLEO Cloud Systems</span>
              <span className="text-slate-300">•</span>
              <span>Leo Multiple District 306 Sri Lanka & Republic of Maldives</span>
            </div>
            <p className="text-slate-400">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Floating System Toasts */}
      <ToastContainer />
    </div>
  );
}
