import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjectStore } from '@/store/projectStore';
import { useUserStore } from '@/store/userStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import {
  Plus,
  Eye,
  History,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Users2,
  Hourglass,
  Layers,
  Sparkles,
  MapPin,
  HeartHandshake,
  TrendingUp,
  FolderKanban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'hosted';
  const [filterQuery, setFilterQuery] = useState('');

  const {
    hosted,
    contributed,
    organized,
    fetchHosted,
    fetchContributed,
    fetchOrganized,
  } = useProjectStore();
  const user = useUserStore();

  useEffect(() => {
    fetchHosted();
    fetchContributed();
    fetchOrganized();
  }, [fetchHosted, fetchContributed, fetchOrganized]);

  const handleTabChange = (tabId: string | number) => {
    setSearchParams({ tab: String(tabId) });
  };

  const getActiveList = () => {
    let list: any[] = [];
    if (activeTab === 'hosted') list = hosted;
    else if (activeTab === 'contributed') list = contributed;
    else if (activeTab === 'organized') list = organized;

    // DATA ISOLATION ENFORCEMENT:
    // Leo Clubs cannot access or view Project Reports belonging to other Leo Clubs
    if (!user.isDp && !user.isMdp && !user.isRegionChairperson) {
      list = list.filter(
        (p) =>
          String(p.club_id || '1') === String(user.clubId || '1') ||
          (p.club_name && p.club_name === user.clubName)
      );
    }

    if (!filterQuery.trim()) return list;
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(filterQuery.toLowerCase()) ||
        p.venue?.toLowerCase().includes(filterQuery.toLowerCase())
    );
  };

  const currentList = getActiveList();

  // Aggregate metrics for top highlight ribbon
  const totalBeneficiaries = currentList.reduce((acc, p) => acc + (Number(p.beneficiaries) || 0), 0);
  const totalHours = currentList.reduce((acc, p) => acc + (Number(p.volunteerHours) || 0), 0);
  const totalApproved = currentList.filter((p) => p.status === 3).length;

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 3:
        return (
          <Badge variant="success" dot className="gap-1 font-bold">
            Approved
          </Badge>
        );
      case 2:
        return (
          <Badge variant="warning" dot className="gap-1 font-bold">
            Pending Review
          </Badge>
        );
      case 1:
        return (
          <Badge variant="destructive" dot className="gap-1 font-bold">
            Returned
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            Draft
          </Badge>
        );
    }
  };

  return (
    <AppLayout
      pageTitle="Club Projects"
      subtitle={`Service activities, multi-phase projects, and impact reporting for Leo Club of ${user.clubName || 'Your Club'}`}
      actions={
        user.canManageProjectReports ? (
          <Link to="/createProject">
            <Button variant="brand-gradient" className="gap-2 shadow-soft-sm font-bold">
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </Button>
          </Link>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Top Impact Analytics Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card className="p-4 sm:p-5 flex items-center gap-3.5 bg-white/90">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center shrink-0 shadow-soft-xs">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Projects</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{currentList.length}</span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-4 sm:p-5 flex items-center gap-3.5 bg-white/90">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-soft-xs">
                <Users2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Beneficiaries</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-700 leading-none">{totalBeneficiaries.toLocaleString()}</span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className="p-4 sm:p-5 flex items-center gap-3.5 bg-white/90">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 shadow-soft-xs">
                <Hourglass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Volunteer Hours</span>
                <span className="text-xl sm:text-2xl font-black text-amber-700 leading-none">{totalHours.toLocaleString()} hrs</span>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-4 sm:p-5 flex items-center gap-3.5 bg-white/90">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-soft-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sanctioned</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{totalApproved} Approved</span>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Controls: Tabs & Filter Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: 'hosted', label: 'Hosted Activities', count: hosted.length },
              { id: 'contributed', label: 'Contributed', count: contributed.length },
              { id: 'organized', label: 'Organized', count: organized.length },
            ]}
            activeTab={activeTab}
            onChange={handleTabChange}
          />

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, category, venue..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-300 transition-all shadow-soft-xs"
            />
          </div>
        </div>

        {/* Project Cards Grid */}
        {currentList.length === 0 ? (
          <Card className="text-center py-16 bg-white/70 border-dashed">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                📂
              </div>
              <h3 className="font-bold text-slate-700 text-base">No Projects Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {filterQuery
                  ? "No projects match your filter query. Clear search to view all club activities."
                  : "You haven't added any projects under this category yet."}
              </p>
              {user.canManageProjectReports && !filterQuery && (
                <Link to="/createProject" className="inline-block pt-2">
                  <Button variant="outline" size="sm">
                    Initiate First Project
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {currentList.map((project, idx) => (
                <motion.div
                  key={project.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.3) }}
                  whileHover={{ y: -3 }}
                >
                  <Card className="h-full flex flex-col justify-between hover:border-brand-300 hover:shadow-soft-md transition-all group overflow-hidden bg-white/95">
                    <CardContent className="p-5 space-y-3.5">
                      {/* Top Category Badge & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 truncate max-w-[150px] border border-slate-200/60">
                          {project.category || 'Service Activity'}
                        </span>
                        {getStatusBadge(project.status ?? 0)}
                      </div>

                      {/* Project Title */}
                      <div>
                        <Link
                          to={`/viewProject/projectID=${project.id}`}
                          className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
                        >
                          {project.name}
                        </Link>

                        {/* Multi-Phase Tag */}
                        {project.is_phase_project && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/80 w-fit">
                            <Layers className="w-3 h-3 text-brand-500" />
                            <span className="truncate max-w-[200px]">
                              {project.phase_name || 'Multi-Phase Project'}
                            </span>
                          </div>
                        )}

                        {project.on_behalf_district == 1 && (
                          <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5 border border-amber-200/60">
                            On Behalf of District
                          </span>
                        )}
                        {project.on_behalf_md == 1 && (
                          <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-1.5 ml-1 border border-purple-200/60">
                            On Behalf of MD 306
                          </span>
                        )}
                      </div>

                      {/* Metrics Ribbon: Beneficiaries & Hours */}
                      <div className="grid grid-cols-2 gap-2 py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Users2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-semibold text-slate-800">{project.beneficiaries || 0}</span>
                          <span className="text-[11px] text-slate-400">served</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Hourglass className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold text-slate-800">{project.volunteerHours || 0}</span>
                          <span className="text-[11px] text-slate-400">hours</span>
                        </div>
                      </div>

                      {/* Date & Club */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {project.date || 'Date not set'}
                        </span>
                        <span className="truncate max-w-[120px] font-medium text-slate-600">
                          {project.club_name ? `L/C ${project.club_name}` : ''}
                        </span>
                      </div>
                    </CardContent>

                    {/* Card Actions Footer */}
                    <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link to={`/viewProject/projectID=${project.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </Button>
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/viewEditHistory/projectID=${project.id}/name=${encodeURIComponent(project.name)}`}
                          title="View Revision History"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                            <History className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        {user.canManageProjectReports && (
                          <Link to={`/editProject/projectID=${project.id}/step=1`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                              Edit
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
