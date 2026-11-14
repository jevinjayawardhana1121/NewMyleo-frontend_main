import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useReportStore } from '@/store/reportStore';
import { useUserStore } from '@/store/userStore';
import { getMonth } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Users,
  DollarSign,
  Edit,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Reports() {
  const { reports, fetchReports } = useReportStore();
  const user = useUserStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // DATA ISOLATION ENFORCEMENT:
  // Leo Clubs cannot access or view Activity Reports belonging to other Leo Clubs
  const clubReports = reports.filter((r) => {
    if (user.isDp || user.isMdp || user.isRegionChairperson) return true;
    return (
      String(r.club_id || '1') === String(user.clubId || '1') ||
      (r.club_name && r.club_name === user.clubName)
    );
  });

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
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <AppLayout
      pageTitle="Monthly Activity Reports"
      subtitle={`Official monthly administration, operations, and membership reporting for Leo Club of ${user.clubName || 'Your Club'}`}
      actions={
        user.canManageActivityReports ? (
          <Link to="/createReport">
            <Button variant="brand-gradient" className="gap-2 shadow-soft-sm font-bold">
              <Plus className="w-4 h-4" />
              <span>Add Activity Report</span>
            </Button>
          </Link>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Role Capability Banner for Treasurer */}
        {!user.canManageActivityReports && user.currentRole === 'Club Treasurer' && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 flex items-center justify-between gap-4 text-xs shadow-soft-xs">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Activity Reporting Authority:</strong> Under Leo MD 306 governance bylaws, Monthly Activity Reports are compiled and managed exclusively by the <strong>Club Secretary</strong> and <strong>Club President</strong>.
              </span>
            </div>
            <Badge variant="outline" className="border-amber-300 text-amber-800 bg-white font-mono shrink-0">
              Role: Club Treasurer (View Only)
            </Badge>
          </div>
        )}

        {clubReports.length === 0 ? (
          <Card className="text-center py-16 bg-white/70 border-dashed">
            <CardContent className="space-y-3">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-base">No Activity Reports Registered</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Submit monthly activity reports to report meetings, project participation, and club operations to the district.
              </p>
              {user.canManageActivityReports && (
                <Link to="/createReport" className="inline-block pt-2">
                  <Button variant="outline" size="sm">
                    Submit First Monthly Report
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {clubReports.map((report, idx) => (
              <motion.div
                key={report.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <Card className="hover:border-brand-300 hover:shadow-soft-md transition-all bg-white/95 overflow-hidden flex flex-col justify-between h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center font-black text-sm">
                          📅
                        </div>
                        <div>
                          <span className="text-lg font-black text-slate-900 block leading-tight">
                            {getMonth(report.month)}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">Activity Filing</span>
                        </div>
                      </div>
                      {getStatusBadge(report.approval ?? 0)}
                    </div>

                    <div className="text-xs text-slate-500 space-y-1.5 pt-3 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jurisdiction:</span>
                        <span className="font-semibold text-slate-800">Leo Club of {report.club_name || user.clubName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Submission Date:</span>
                        <span className="font-medium text-slate-700">{report.submit_on || 'In Draft Status'}</span>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500 uppercase tracking-wider">Approval Stage</span>
                        <span className="text-brand-600">
                          {report.approval === 3 ? 'Final Sanction' : report.approval === 2 ? 'Under Review' : 'Grassroots Draft'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            report.approval === 3 ? 'w-full bg-emerald-500' : report.approval === 2 ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Quick Access to Tri-fold components */}
                    <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-slate-100">
                      <Link to={`/viewReport/reportID=${report.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50">
                          <Eye className="w-3.5 h-3.5" /> Activity
                        </Button>
                      </Link>

                      <div className="flex items-center gap-1">
                        <Link
                          to={`/viewReport/reportID=${report.id}/membershipReport/month=${getMonth(report.month)}/cName=${encodeURIComponent(report.club_name || user.clubName)}`}
                          title="View Membership Report"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-brand-600 hover:bg-brand-50">
                            <Users className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        <Link
                          to={`/viewReport/reportID=${report.id}/financialReport/month=${getMonth(report.month)}/cName=${encodeURIComponent(report.club_name || user.clubName)}`}
                          title="View Financial Statement"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50">
                            <DollarSign className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        {user.canManageActivityReports && report.approval !== 3 && (
                          <Link to={`/editReport/reportID=${report.id}`} title="Edit Report">
                            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
