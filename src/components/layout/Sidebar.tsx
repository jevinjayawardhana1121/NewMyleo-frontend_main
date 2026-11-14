import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { useAppStore } from '@/store/appStore';
import {
  FolderKanban,
  FileSpreadsheet,
  Users2,
  Wallet2,
  Building2,
  FileCheck2,
  CheckCircle,
  Network,
  Layers,
  Globe2,
  LogOut,
  ExternalLink,
  BookOpen,
  X,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserStore();
  const { mobileMenuOpen, setMobileMenuOpen } = useAppStore();

  const handleLogout = async () => {
    await user.logout();
    navigate('/login');
  };

  const navItem = (to: string, label: string, icon: React.ReactNode, badge?: string | number) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none group",
          isActive
            ? "text-brand-700 bg-brand-50/90 shadow-soft-xs font-bold"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "p-2 rounded-xl transition-all duration-200 shrink-0",
              isActive
                ? "bg-brand-500 text-white shadow-soft-sm shadow-brand-500/30 scale-105"
                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800"
            )}
          >
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </div>

        <div className="flex items-center gap-2">
          {badge !== undefined && (
            <span
              className={cn(
                "px-2 py-0.5 text-[11px] font-bold rounded-full",
                isActive
                  ? "bg-brand-100 text-brand-800"
                  : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
              )}
            >
              {badge}
            </span>
          )}
          {isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="w-1.5 h-5 bg-brand-500 rounded-full shrink-0"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </div>
      </Link>
    );
  };

  const content = (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-2xl border-r border-slate-200/80 w-72 select-none shadow-soft-xs">
      {/* Brand & Logo Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <Link to="/projects" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 flex items-center justify-center shadow-soft-sm shadow-brand-500/20 text-white font-black text-xl group-hover:scale-105 transition-transform duration-200">
              🦁
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-900">
              ★
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">MYLEO</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                MD 306
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Sri Lanka & Maldives</p>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button: Youth Centre */}
      <div className="px-4 pt-4">
        <a
          href="https://youthcentre.leomd306.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 text-slate-950 text-xs font-bold shadow-soft-xs shadow-amber-500/20 hover:shadow-amber-glow hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-950 animate-pulse" />
            <span>Book Youth Centre</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-75 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {/* Club Section */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Club Administration</span>
            <span className="text-[10px] text-slate-300">Level 4</span>
          </div>
          {navItem('/projects', 'Projects', <FolderKanban className="w-4 h-4" />)}
          {navItem('/activityReports', 'Activity Reports', <FileSpreadsheet className="w-4 h-4" />)}
          {navItem('/membership', 'Membership', <Users2 className="w-4 h-4" />)}
          {navItem('/club-wallet', 'Club Wallet', <Wallet2 className="w-4 h-4" />)}
          {navItem('/myClubProfile', 'Club Profile', <Building2 className="w-4 h-4" />)}
        </div>

        {/* District Section */}
        {user.isDistrictOfficer && (
          <div className="space-y-1 pt-3 border-t border-slate-100">
            <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>District Governance</span>
              <span className="text-[10px] text-brand-600 font-bold">{user.districtId || '306 A1'}</span>
            </div>
            {(user.canViewClubProjects || user.isDp) &&
              navItem('/view-club-reports', 'Club Reports', <FileCheck2 className="w-4 h-4" />)}
            {user.canApproveReports &&
              navItem('/approve-reports', 'Approve Reports', <CheckCircle className="w-4 h-4" />)}
            {navItem('/myDistrictSettings', 'District Cabinet', <Network className="w-4 h-4" />)}
          </div>
        )}

        {/* Multiple District Section */}
        {user.isMultipleOfficer && (
          <div className="space-y-1 pt-3 border-t border-slate-100">
            <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Multiple Council</span>
              <span className="text-[10px] text-purple-600 font-bold">MD 306</span>
            </div>
            {(user.canViewForwardedReports || user.isMdp) &&
              navItem('/shared-reports', 'Shared Reports', <Globe2 className="w-4 h-4" />)}
            {(user.canAddProjectCategoriesFromMultiple || user.isMdp) &&
              navItem('/project-categories', 'Project Categories', <Layers className="w-4 h-4" />)}
            {navItem('/myMultipleDistrictSettings', 'MD Council Profile', <Building2 className="w-4 h-4" />)}
          </div>
        )}

        {/* Governance & Standards Documentation */}
        <div className="space-y-1 pt-3 border-t border-slate-100">
          <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Standards & Guidance
          </div>
          {navItem('/workflow-guide', 'Workflow Guide', <BookOpen className="w-4 h-4" />)}
        </div>
      </div>

      {/* Footer User Profile Card */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-soft-xs">
          <Link to="/profile-settings" className="flex items-center gap-3 min-w-0 flex-1 group">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-300 text-white font-extrabold flex items-center justify-center text-xs shadow-soft-xs group-hover:scale-105 transition-transform">
                {user.firstName ? user.firstName.charAt(0) : 'L'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-slate-400 truncate font-medium">
                {user.currentRole || user.clubName || 'Leo Member'}
              </p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 max-w-xs w-full shadow-2xl z-50"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
