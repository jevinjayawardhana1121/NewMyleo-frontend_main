// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjectStore } from '@/store/projectStore';
import { useReportStore } from '@/store/reportStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUserStore } from '@/store/userStore';
import { notify } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { getMonth } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  Layers,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Share2,
  Send,
  Building,
  Check,
  X,
  Lock
} from 'lucide-react';

export default function ApproveProjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'projects';

  const { districtProjects, fetchDistrictProjects } = useProjectStore();
  const { regionReports, fetchRegionReports } = useReportStore();
  const settings = useSettingsStore();
  const user = useUserStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Local state for interactive approval / forwarding in mock session
  const [approvedItems, setApprovedItems] = useState<Record<string, { approved_by_rc?: boolean; approved_by_dp?: boolean; forwarded_to_md?: boolean }>>({});

  useEffect(() => {
    fetchDistrictProjects();
    fetchRegionReports();
  }, [fetchDistrictProjects, fetchRegionReports]);

  // DATA ISOLATION ENFORCEMENT
  // 1. Region Chairperson can only view clubs belonging to their assigned region and district
  // 2. District President can only view clubs belonging to their district jurisdiction
  const filterByJurisdiction = (list: any[]) => {
    return list.filter((item) => {
      // Multiple District President has global multiple district oversight
      if (user.isMdp) return true;

      // District President: only clubs within user's district jurisdiction
      if (user.isDp) {
        return (item.district_id || '306 A1') === user.districtId;
      }

      // Region Chairperson: only clubs within assigned Region & District
      if (user.isRegionChairperson) {
        const itemDistrict = item.district_id || '306 A1';
        const itemRegion = String(item.region_id || item.region || '1');
        return itemDistrict === user.districtId && itemRegion === String(user.regionId);
      }

      return false;
    });
  };

  const filterByStatus = (list: any[]) => {
    if (statusFilter === 'pending') {
      return list.filter((item) => {
        const override = approvedItems[item.id];
        if (override?.approved_by_dp) return false;
        if (user.isRegionChairperson && override?.approved_by_rc) return false;
        return (item.status ?? item.approval) === 2;
      });
    }
    if (statusFilter === 'approved') {
      return list.filter((item) => {
        const override = approvedItems[item.id];
        if (override?.approved_by_dp) return true;
        return (item.status ?? item.approval) === 3;
      });
    }
    if (statusFilter === 'rejected') {
      return list.filter((item) => (item.status ?? item.approval) === 1);
    }
    return list;
  };

  const isolatedProjects = filterByJurisdiction(districtProjects);
  const isolatedReports = filterByJurisdiction(regionReports);

  const currentProjects = filterByStatus(isolatedProjects);
  const currentReports = filterByStatus(isolatedReports);

  // Region Chairperson Approval Handler
  const handleApproveByRC = (item: any) => {
    setApprovedItems((prev) => ({
      ...prev,
      [item.id]: { ...prev[item.id], approved_by_rc: true },
    }));
    notify(
      `Approved by Region Chairperson! Report from L/C ${item.club_name || item.clubName} automatically forwarded to Leo District President.`,
      'success'
    );
  };

  // District President Approval Handler
  const handleApproveByDP = (item: any) => {
    setApprovedItems((prev) => ({
      ...prev,
      [item.id]: { ...prev[item.id], approved_by_dp: true },
    }));
    notify(
      `Approved by Leo District President! Official District Endorsement granted.`,
      'success'
    );
  };

  // District President: Report / Forward to Multiple District President
  const handleForwardToMDP = (item: any) => {
    settings.forwardReportToMultiple(item.id);
    setApprovedItems((prev) => ({
      ...prev,
      [item.id]: { ...prev[item.id], forwarded_to_md: true },
    }));
    notify(
      `Reported to Leo Multiple District President! Shared across MD 306 council.`,
      'success'
    );
  };

  const handleOpenReject = (item: any) => {
    setSelectedItem(item);
    setRejectNote('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectNote.trim()) {
      notify('Please enter amendment instructions for the club secretary', 'warning');
      return;
    }
    setRejectModalOpen(false);
    notify('Report returned to club officers with amendment notes', 'info');
  };

  const getStatusBadge = (item: any) => {
    const override = approvedItems[item.id];
    const isForwardedToMD = override?.forwarded_to_md || item.forwarded_to_md || settings.forwardedReportsToMD.includes(String(item.id));
    const isApprovedDP = override?.approved_by_dp || (item.status ?? item.approval) === 3;
    const isApprovedRC = override?.approved_by_rc || item.approved_by_rc;

    if (isForwardedToMD) {
      return (
        <Badge variant="brand" className="gap-1 bg-purple-100 text-purple-800 border-purple-200">
          <Share2 className="w-3 h-3" /> Reported to Multiple District President
        </Badge>
      );
    }
    if (isApprovedDP) {
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="w-3 h-3" /> District Approved
        </Badge>
      );
    }
    if (isApprovedRC) {
      return (
        <Badge variant="warning" className="gap-1 bg-amber-100 text-amber-900 border-amber-200">
          <Clock className="w-3 h-3" /> Forwarded to District President (Approved by RC)
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="w-3 h-3" />
        {settings.enableRegionChairpersonApproval ? 'Pending Region Review' : 'Pending District Review'}
      </Badge>
    );
  };

  // Banner describing active role and jurisdiction
  const getJurisdictionBanner = () => {
    if (user.isRegionChairperson) {
      return {
        title: `Region Chairperson Evaluation: Region ${user.regionName || '1'}`,
        desc: `You are reviewing reports from Leo Clubs within your assigned regional jurisdiction under ${user.districtName || 'District 306 A1'}. Approved reports forward automatically to the District President.`,
        icon: <UserCheck className="w-5 h-5 text-emerald-600" />,
        badgeText: `Region ${user.regionId || '1'} Jurisdiction`,
        bgColor: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      };
    }

    if (user.isDp) {
      const isRcEnabled = settings.enableRegionChairpersonApproval;
      return {
        title: `Leo District President Review: ${user.districtName || 'District 306 A1'}`,
        desc: isRcEnabled
          ? 'Routing preference: Region Chairperson review is ENABLED. Reports undergo regional evaluation before final District President endorsement.'
          : 'Routing preference: Region Chairperson review is DISABLED (Direct Review Mode). Reports route directly to the District President.',
        icon: <ShieldCheck className="w-5 h-5 text-brand-600" />,
        badgeText: isRcEnabled ? 'RC Routing Active (DP Preference)' : 'Direct DP Review (RC Bypassed)',
        bgColor: 'bg-brand-50/70 border-brand-200 text-brand-900',
      };
    }

    if (user.isMdp) {
      return {
        title: 'Leo Multiple District President: MD 306 Oversight',
        desc: 'Reviewing shared and forwarded reports submitted by Leo District Presidents across all constituent districts.',
        icon: <Share2 className="w-5 h-5 text-purple-600" />,
        badgeText: 'Multiple District Oversight',
        bgColor: 'bg-purple-50/80 border-purple-200 text-purple-900',
      };
    }

    return {
      title: 'Restricted Access',
      desc: 'You do not have review permissions for this district jurisdiction.',
      icon: <Lock className="w-5 h-5 text-slate-400" />,
      badgeText: 'Unauthorized',
      bgColor: 'bg-slate-100 border-slate-200 text-slate-700',
    };
  };

  const banner = getJurisdictionBanner();

  // If user has no approval role, guard the page
  if (!user.isRegionChairperson && !user.isDp && !user.isMdp && !user.canApproveReports) {
    return (
      <AppLayout pageTitle="Approve Reports & Projects" subtitle="District Council Verification Dashboard">
        <Card className="py-16 text-center max-w-lg mx-auto">
          <CardContent className="space-y-4">
            <Lock className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800">Review Access Restricted</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Under Leo MD 306 Reporting Hierarchy bylaws, report review is reserved for appointed <strong>Region Chairpersons</strong>, the <strong>Leo District President</strong>, or designated authorized district council officers.
            </p>
            <Link to="/projects">
              <Button variant="outline">Back to My Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Approve Reports & Projects" subtitle="Reporting Hierarchy & District Evaluation Dashboard">
      <div className="space-y-6">
        {/* HIERARCHY & JURISDICTION BANNER */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${banner.bgColor}`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{banner.icon}</div>
            <div>
              <p className="font-bold text-sm leading-tight">{banner.title}</p>
              <p className="mt-0.5 opacity-90 leading-relaxed">{banner.desc}</p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit text-xs bg-white font-semibold flex-shrink-0">
            {banner.badgeText}
          </Badge>
        </div>

        {/* Data Isolation Notice */}
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <strong>Data Isolation Enforced:</strong> Clubs outside your designated jurisdiction are isolated.
          </span>
          <span className="font-mono text-slate-400">
            {user.isRegionChairperson ? `Region: ${user.regionName}` : user.districtName}
          </span>
        </div>

        {/* Type Tabs & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: 'projects', label: 'Project Reports', count: isolatedProjects.length },
              { id: 'reports', label: 'Monthly Activity Reports', count: isolatedReports.length },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setSearchParams({ type: String(tab) })}
          />

          <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/60 backdrop-blur-md rounded-2xl border border-slate-300/40 shadow-inner">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-soft-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-3">
            {currentProjects.length === 0 ? (
              <Card className="py-12 text-center text-slate-400">
                <p className="text-sm">No project reports in this category within your jurisdiction.</p>
              </Card>
            ) : (
              currentProjects.map((p, idx) => {
                const override = approvedItems[p.id];
                const isApprovedRC = override?.approved_by_rc || p.approved_by_rc;
                const isApprovedDP = override?.approved_by_dp || (p.status === 3);
                const isForwardedMD = override?.forwarded_to_md || p.forwarded_to_md || settings.forwardedReportsToMD.includes(String(p.id));

                return (
                  <motion.div
                    key={p.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card className="hover:shadow-soft-md hover:border-brand-300 transition-all bg-white/95">
                      <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(p)}
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            L/C {p.club_name || p.clubName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (Region {p.region_id || p.region || '1'} • {p.district_id || '306 A1'})
                          </span>

                          {p.is_phase_project && (
                            <Badge variant="outline" className="text-[10px] border-amber-300 bg-amber-50 text-amber-800 gap-1">
                              <Layers className="w-2.5 h-2.5" /> {p.phase_name || 'Phased Project'}
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-bold text-base text-slate-900 truncate">{p.name}</h3>

                        <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date: {p.date || 'N/A'}
                          </span>
                          <span>•</span>
                          <span>Category: <strong className="text-slate-700">{p.category}</strong></span>
                          {p.beneficiaries && (
                            <>
                              <span>•</span>
                              <span>👥 {p.beneficiaries} served</span>
                            </>
                          )}
                          {p.volunteerHours && (
                            <>
                              <span>•</span>
                              <span>⏱️ {p.volunteerHours} hrs</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {/* Region Chairperson Actions */}
                        {user.isRegionChairperson && !isApprovedRC && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveByRC(p)}
                              className="gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve (RC)
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleOpenReject(p)}
                              className="gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Return
                            </Button>
                          </>
                        )}

                        {/* District President Actions */}
                        {user.isDp && !isApprovedDP && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveByDP(p)}
                              className="gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Endorse (DP)
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleOpenReject(p)}
                              className="gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </>
                        )}

                        {/* District President: Report to Multiple District President */}
                        {user.isDp && isApprovedDP && !isForwardedMD && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleForwardToMDP(p)}
                            className="gap-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200"
                          >
                            <Send className="w-3.5 h-3.5" /> Report to Multiple (MDP)
                          </Button>
                        )}

                        <Link to={`/viewProject/projectID=${p.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="w-4 h-4" /> View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
              })
            )}
          </div>
        )}

        {/* Activity Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            {currentReports.length === 0 ? (
              <Card className="py-12 text-center text-slate-400">
                <p className="text-sm">No monthly activity reports in this category within your jurisdiction.</p>
              </Card>
            ) : (
              currentReports.map((r, idx) => {
                const lateInfo = settings.calculateSubmissionStatus(r.submit_on || '2026-08-12', r.month || 1);
                const override = approvedItems[r.id];
                const isApprovedRC = override?.approved_by_rc || r.approved_by_rc;
                const isApprovedDP = override?.approved_by_dp || (r.approval === 3 || r.status === 3);
                const isForwardedMD = override?.forwarded_to_md || r.forwarded_to_md || settings.forwardedReportsToMD.includes(String(r.id));

                return (
                  <motion.div
                    key={r.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card className="hover:shadow-soft-md hover:border-brand-300 transition-all bg-white/95">
                    <CardContent className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(r)}
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            L/C {r.club_name || r.clubInfo?.club_name || 'Leo Club'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (Region {r.region_id || '1'} • {r.district_id || '306 A1'})
                          </span>

                          {lateInfo && lateInfo.isLate ? (
                            <Badge variant="destructive" className="gap-1 text-[11px]">
                              <AlertTriangle className="w-3 h-3" /> Late ({lateInfo.daysLate}d)
                            </Badge>
                          ) : (
                            <Badge variant="success" className="gap-1 text-[11px] bg-emerald-100 text-emerald-800 border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> On-Time
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-bold text-base text-slate-900 truncate">
                          {getMonth(r.month)} Activity Report
                        </h3>

                        <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                          <span>Submitted On: <strong className="text-slate-700">{r.submit_on || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>District Deadline: <strong>{lateInfo?.formattedDeadline}</strong></span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {/* RC Actions */}
                        {user.isRegionChairperson && !isApprovedRC && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveByRC(r)}
                              className="gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve (RC)
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleOpenReject(r)}
                              className="gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Return
                            </Button>
                          </>
                        )}

                        {/* DP Actions */}
                        {user.isDp && !isApprovedDP && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveByDP(r)}
                              className="gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Endorse (DP)
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleOpenReject(r)}
                              className="gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </>
                        )}

                        {/* DP: Report to Multiple District President */}
                        {user.isDp && isApprovedDP && !isForwardedMD && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleForwardToMDP(r)}
                            className="gap-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200"
                          >
                            <Send className="w-3.5 h-3.5" /> Report to Multiple (MDP)
                          </Button>
                        )}

                        <Link to={`/viewReport/reportID=${r.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="w-4 h-4" /> View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
              })
            )}
          </div>
        )}
      </div>

      {/* Reject / Amendment Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogHeader>
          <DialogTitle>Return Report for Amendments</DialogTitle>
          <DialogDescription>
            Specify necessary revisions for {selectedItem?.name || 'this report'}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <textarea
            rows={4}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Explain required amendments (e.g. upload missing attendance proof, clarify budget entries)..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirmReject}>Confirm Return</Button>
        </DialogFooter>
      </Dialog>
    </AppLayout>
  );
}
