import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useUserStore, UserRole } from '@/store/userStore';
import { notify, subscribeBackendHealth, checkBackendHealth, BackendHealth } from '@/lib/api';
import {
  Menu,
  Search,
  ChevronDown,
  CheckCircle2,
  RefreshCw,
  User as UserIcon
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
  const [health, setHealth] = useState<BackendHealth>({ connected: false, checkedAt: 0 });
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    checkBackendHealth();
    const unsub = subscribeBackendHealth(setHealth);
    return unsub;
  }, []);

  const handleRefreshHealth = async () => {
    setCheckingHealth(true);
    const res = await checkBackendHealth();
    setCheckingHealth(false);
    if (res.connected) {
      notify('Connected to Laravel Sanctum Backend (http://localhost:8000)!', 'success');
    } else {
      notify('Backend server offline. Running in Standalone / Demo Mode.', 'info');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
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
      case 'Zone Head':
        return '📍';
      case 'Club President':
        return '👑';
      case 'Club Vice President':
        return '🤝';
      case 'Club Secretary':
        return '📝';
      case 'Club Treasurer':
        return '💰';
      case 'Leo Advisor':
        return '🎓';
      case 'Member':
      default:
        return '👤';
    }
  };

  const rolesList: { role: UserRole; title: string; desc: string; icon: string; tier: string }[] = [
    {
      role: 'Club President',
      title: 'Club President',
      desc: 'Full administrative authority (Projects, Activity Reports, Members, Wallet). Can appoint Club VP, Secretary, Treasurer, and Leo Advisor.',
      icon: '👑',
      tier: 'Club Tier',
    },
    {
      role: 'Club Vice President',
      title: 'Club Vice President',
      desc: 'Assists President in club operations. Can view club projects, activity reports, and member directory.',
      icon: '🤝',
      tier: 'Club Tier',
    },
    {
      role: 'Club Secretary',
      title: 'Club Secretary',
      desc: 'Manages Projects, Activity Reports, and Member records. Can appoint Club VP, Treasurer, and Leo Advisor. (Wallet is restricted).',
      icon: '📝',
      tier: 'Club Tier',
    },
    {
      role: 'Club Treasurer',
      title: 'Club Treasurer',
      desc: 'Manages Project budgets and Club Wallet finances. (Member records and officer appointments are restricted).',
      icon: '💰',
      tier: 'Club Tier',
    },
    {
      role: 'Leo Advisor',
      title: 'Leo Advisor (Lions Club)',
      desc: 'Provides adult sponsor guidance. Reviews club activity reports and projects as required for consultation proof.',
      icon: '🎓',
      tier: 'Club Advisory',
    },
    {
      role: 'Zone Head',
      title: 'Zone Head',
      desc: 'Oversees clubs within designated zone under the guidance of Region Chairperson and District Cabinet.',
      icon: '📍',
      tier: 'Zone Tier',
    },
    {
      role: 'Region Chairperson',
      title: 'Region Chairperson (RC)',
      desc: 'Oversees clubs in assigned region. Reviews, approves, or returns reports (approved reports forward to DP).',
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
    {
      role: 'Member',
      title: 'Leo Member',
      desc: 'General club member. Can view club projects, participate in activities, and view own profile.',
      icon: '👤',
      tier: 'General Membership',
    },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-4 sm:px-8 py-3 transition-all shadow-soft-xs">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Toggle & Page Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden text-slate-600 rounded-xl shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="min-w-0">
            {pageTitle && (
              <h1 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 truncate">
                {pageTitle}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 truncate hidden sm:block font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Middle: Global Spotlight Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-2 sm:mx-4">
          <form onSubmit={handleSearch} className="w-full relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors pointer-events-none" />
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

        {/* Right: Actions, Health Status, Role Selector & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {actions}

          {/* Backend Connection Status Badge (Click to Re-probe) */}
          <button
            type="button"
            onClick={handleRefreshHealth}
            title={
              health.connected
                ? 'Laravel Sanctum Backend Online (http://localhost:8000). Click to re-check.'
                : 'Backend server offline (port 8000). Running in Standalone / Demo mode. Click to re-check.'
            }
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-soft-xs transition-all hover:scale-105 active:scale-95 ${
              health.connected
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border border-slate-200 text-slate-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span>{health.connected ? 'API Connected' : 'Demo Mode'}</span>
            <RefreshCw
              className={`w-2.5 h-2.5 ml-0.5 opacity-60 ${
                checkingHealth ? 'animate-spin text-brand-600' : ''
              }`}
            />
          </button>

          {/* Interactive Role Switcher Pill */}
          <button
            type="button"
            onClick={() => setRoleModalOpen(true)}
            aria-label="Switch Governance Role"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 shadow-soft-xs hover:border-brand-300 hover:shadow-soft-sm transition-all duration-200 group text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
              {getRoleIcon(user.currentRole)}
            </div>
            <div className="hidden sm:block min-w-0 max-w-[140px] lg:max-w-[180px]">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block leading-tight">
                Role View
              </span>
              <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
                {user.currentRole || 'Club President'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
          </button>

          {/* Direct Profile Shortcut Avatar */}
          <Link
            to="/profile-settings"
            aria-label="View My Profile"
            title={`${user.firstName} ${user.lastName} (My Profile)`}
            className="flex items-center gap-2 p-0.5 rounded-xl hover:ring-2 hover:ring-brand-400/30 transition-all shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-black flex items-center justify-center text-xs shadow-soft-xs">
              {user.firstName ? user.firstName.charAt(0) : <UserIcon className="w-4 h-4" />}
            </div>
          </Link>
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {item.tier}
                      </span>
                    </div>
                    {isCurrent && (
                      <Badge variant="brand" className="gap-1 text-[11px] font-bold shrink-0">
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
