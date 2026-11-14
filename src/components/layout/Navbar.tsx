import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useUserStore, UserRole } from '@/store/userStore';
import { notify } from '@/lib/api';
import {
  Menu,
  Search,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

interface NavbarProps {
  pageTitle?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Navbar({ pageTitle, subtitle, actions }: NavbarProps) {
  const { setMobileMenuOpen } = useAppStore();
  const user = useUserStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectRole = (newRole: UserRole) => {
    user.switchRole(newRole);
    setRoleModalOpen(false);
    notify(`Active role updated: ${newRole}`, 'success');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Leo Multiple District President':
        return '🌐';
      case 'Leo District President':
        return '🦁';
      case 'Region Chairperson':
        return '🗺️';
      case 'Club President':
        return '👑';
      case 'Club Secretary':
        return '📝';
      case 'Club Treasurer':
        return '💰';
      default:
        return '👤';
    }
  };

  const rolesList: { role: UserRole; title: string; desc: string; icon: string; tier: string }[] = [
    {
      role: 'Club President',
      title: 'Club President',
      desc: 'Full administrative authority (Projects, Activity Reports, Members, Wallet). Can appoint VP, Secretary, Treasurer, Leo Advisor.',
      icon: '👑',
      tier: 'Club Tier',
    },
    {
      role: 'Club Secretary',
      title: 'Club Secretary',
      desc: 'Manages Projects, Activity Reports, and Member records. Can appoint VP, Treasurer, Leo Advisor. (Wallet is restricted).',
      icon: '📝',
      tier: 'Club Tier',
    },
    {
      role: 'Club Treasurer',
      title: 'Club Treasurer',
      desc: 'Manages Projects and Club Wallet finances. (Member records and officer appointments are restricted).',
      icon: '💰',
      tier: 'Club Tier',
    },
    {
      role: 'Region Chairperson',
      title: 'Region Chairperson (RC)',
      desc: 'Oversees clubs within assigned region. Reviews, approves, or returns reports (approved reports forward to DP).',
      icon: '🗺️',
      tier: 'Regional Tier (Optional)',
    },
    {
      role: 'Leo District President',
      title: 'Leo District President (DP)',
      desc: 'Appoints club presidents & district cabinet. Charters new Leo Clubs. Reviews approved reports & reports to MDP.',
      icon: '🦁',
      tier: 'District Tier',
    },
    {
      role: 'Leo Multiple District President',
      title: 'Leo Multiple District President (MDP)',
      desc: 'Appoints district presidents & multiple cabinet. Charters new Leo Districts. Reviews all shared reports across districts.',
      icon: '🌐',
      tier: 'Multiple District Tier',
    },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-5 sm:px-8 py-3.5 transition-all shadow-soft-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Header */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-slate-600 rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="min-w-0">
            {pageTitle && (
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 truncate">
                {pageTitle}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 truncate hidden sm:block font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Middle: Global Spotlight Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="w-full relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              placeholder="Search projects, members, records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-12 rounded-xl bg-slate-100/80 border border-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-300 focus:bg-white transition-all shadow-soft-xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white rounded border border-slate-200 shadow-soft-xs">
                ↵
              </kbd>
            </div>
          </form>
        </div>

        {/* Right: Actions, Role Selector & User pill */}
        <div className="flex items-center gap-2.5">
          {actions}

          {/* Interactive Role Switcher Pill */}
          <button
            type="button"
            onClick={() => setRoleModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-brand-300 hover:shadow-soft-sm transition-all duration-200 group text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
              {getRoleIcon(user.currentRole)}
            </div>
            <div className="hidden xl:block min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block leading-tight">
                Role View
              </span>
              <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
                {user.currentRole || 'Club President'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* ROLE SWITCHER DIALOG */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <DialogTitle>Switch Governance Role</DialogTitle>
              <DialogDescription>
                Simulate permission levels and data boundaries across the MD 306 hierarchy
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2.5 py-2 max-h-[60vh] overflow-y-auto pr-1">
          {rolesList.map((item, idx) => {
            const isCurrent = (user.currentRole || 'Club President') === item.role;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelectRole(item.role)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isCurrent
                    ? 'border-brand-500 bg-brand-50/60 shadow-soft-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-soft-xs">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {item.tier}
                      </span>
                    </div>
                    {isCurrent && (
                      <Badge variant="brand" className="gap-1 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </header>
  );
}
