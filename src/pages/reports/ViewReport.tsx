// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useReportStore } from '@/store/reportStore';
import { useProjectStore } from '@/store/projectStore';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import { notify } from '@/lib/api';
import { getMonth, getLeoMonthFromDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Check,
  X,
  FileText,
  Download,
  FolderKanban,
  ShieldCheck,
  Mail,
  FileCheck2,
  AlertTriangle,
  Globe,
  Layers,
  Edit,
  ExternalLink
} from 'lucide-react';

export default function ViewReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReport, approveReport, rejectReport } = useReportStore();
  const { hosted, fetchHosted } = useProjectStore();
  const user = useUserStore();
  const settings = useSettingsStore();

  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchHosted();
    if (id) {
      loadReport(id);
    }
  }, [id, fetchHosted]);

  const loadReport = async (repId: string) => {
    setLoading(true);
    const data = await getReport(repId);
    setLoading(false);
    if (data) {
      setReport(data.data || data);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    const res = await approveReport(id);
    if (res) {
      notify('Activity Report successfully approved!', 'success');
      loadReport(id);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      notify('Please enter an explanation for returning this report', 'warning');
      return;
    }
    const res = await rejectReport(id, rejectReason);
    setRejectModalOpen(false);
    if (res) {
      notify('Report returned to club officers with amendment notes', 'info');
      loadReport(id);
    }
  };

  // Auto-Fetched projects for this report's month
  const autoFetchedProjects = useMemo(() => {
    if (!report || !report.month) return [];
    const targetMonth = parseInt(report.month, 10);
    return hosted.filter((p) => {
      if (!p.date) return false;
      return getLeoMonthFromDate(p.date) === targetMonth;
    });
  }, [hosted, report]);

  const totalBeneficiaries = useMemo(() => {
    return autoFetchedProjects.reduce((sum, p) => sum + (parseInt(p.beneficiaries || 0, 10) || 0), 0);
  }, [autoFetchedProjects]);

  const totalVolunteerHours = useMemo(() => {
    return autoFetchedProjects.reduce((sum, p) => sum + (parseInt(p.volunteerHours || 0, 10) || 0), 0);
  }, [autoFetchedProjects]);

  // Submission Timeliness & Late Submission Tracking
  const submissionStatus = useMemo(() => {
    if (!report) return null;
    return settings.calculateSubmissionStatus(report.submit_on || '2026-08-12', report.month || 1);
  }, [report, settings]);

  if (loading) {
    return (
      <AppLayout pageTitle="Loading Activity Report...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </AppLayout>
    );
  }

  if (!report) {
    return (
      <AppLayout pageTitle="Report Not Found">
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <p className="text-slate-500">Could not retrieve the requested activity report.</p>
            <Button variant="outline" onClick={() => navigate('/activityReports')}>Back</Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const status = report.approval ?? report.status ?? 0;
  const monthName = getMonth(report.month);
  const clubName = report.club_name || report.clubInfo?.club_name || user.clubName || 'MyLeo Club';

  return (
    <AppLayout pageTitle={`${monthName} Activity Report`} subtitle={`Leo Club of ${clubName}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back and Action bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/activityReports')}
            className="gap-2 text-slate-500 w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Activity Reports
          </Button>

          {/* Tri-fold Quick Links */}
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/editReport/reportID=${id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-700">
                <Edit className="w-3.5 h-3.5" /> Edit Report
              </Button>
            </Link>

            <Link to={`/viewReport/reportID=${id}/membershipReport/month=${monthName}/cName=${encodeURIComponent(clubName)}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-brand-600 border-brand-200 bg-brand-50/50">
                <Users className="w-3.5 h-3.5" /> Membership Report
              </Button>
            </Link>

            <Link to={`/viewReport/reportID=${id}/financialReport/month=${monthName}/cName=${encodeURIComponent(clubName)}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-emerald-600 border-emerald-200 bg-emerald-50/50">
                <DollarSign className="w-3.5 h-3.5" /> Financial Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Header Overview Card */}
        <Card className="border-slate-200/90 shadow-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Month: {monthName} (Month {report.month})
                  </span>
                  {status === 3 && <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>}
                  {status === 2 && <Badge variant="warning" className="gap-1"><Clock className="w-3 h-3" /> Approval Pending</Badge>}
                  {status === 1 && <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> Amendment Required</Badge>}
                  {status === 0 && <Badge variant="secondary">Draft</Badge>}

                  {/* LATE SUBMISSION TRACKING BADGE */}
                  {submissionStatus && (
                    submissionStatus.isLate ? (
                      <Badge variant="destructive" className="gap-1 text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Late Submission ({submissionStatus.daysLate} {submissionStatus.daysLate === 1 ? 'day' : 'days'} past District Deadline)
                      </Badge>
                    ) : (
                      <Badge variant="success" className="gap-1 text-xs font-semibold bg-emerald-100 text-emerald-800 border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        On-Time Submission (Submitted before {submissionStatus.formattedDeadline})
                      </Badge>
                    )
                  )}
                </div>

                <h1 className="text-2xl font-black text-slate-900">{monthName} Activity Report</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted by <strong className="text-slate-700">Leo Club of {clubName}</strong> on {report.submit_on || 'N/A'}
                </p>
              </div>

              {/* District Approver Controls */}
              {user.canApproveReports && status === 2 && (
                <div className="flex items-center gap-2">
                  <Button variant="success" size="sm" onClick={handleApprove} className="gap-1.5 shadow-sm">
                    <Check className="w-4 h-4" /> Approve Report
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setRejectModalOpen(true)} className="gap-1.5">
                    <X className="w-4 h-4" /> Reject / Return
                  </Button>
                </div>
              )}
            </div>

            {/* Timelines and Deadlines Info Strip */}
            <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>
                  District Deadline: <strong>{submissionStatus?.formattedDeadline} (Day {settings.districtDeadlineDay})</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>
                  International MyLion Push Deadline: <strong>{settings.internationalDeadlineDay}th of month</strong>
                </span>
              </div>
            </div>

            {/* Rejection / Amendment Alert */}
            {status === 1 && report.reject_note && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Reviewer's Feedback:
                </div>
                <p className="leading-relaxed">{report.reject_note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AUTO-FETCHED PROJECTS LINKED TO THIS MONTH */}
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-brand-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Completed Club Projects in {monthName} ({autoFetchedProjects.length})
              </CardTitle>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Auto-Fetched from 1st to 31st {monthName}
            </span>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-brand-50/60 border border-brand-100 text-xs">
                <span className="text-brand-600 font-semibold uppercase text-[10px] block">Projects Completed</span>
                <span className="text-xl font-black text-slate-800">{autoFetchedProjects.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                <span className="text-emerald-700 font-semibold uppercase text-[10px] block">Community Beneficiaries</span>
                <span className="text-xl font-black text-emerald-800">{totalBeneficiaries.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                <span className="text-amber-700 font-semibold uppercase text-[10px] block">Volunteer Service Hours</span>
                <span className="text-xl font-black text-amber-800">{totalVolunteerHours.toLocaleString()} hrs</span>
              </div>
            </div>

            {autoFetchedProjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No projects recorded with completion dates in {monthName}.</p>
            ) : (
              <div className="space-y-2.5">
                {autoFetchedProjects.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                        {p.is_phase_project && (
                          <Badge variant="outline" className="text-[10px] border-amber-300 bg-amber-50 text-amber-800 gap-1">
                            <Layers className="w-2.5 h-2.5" /> {p.phase_name || 'Phased Project'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-500">
                        Date: <strong className="text-slate-700">{p.date}</strong> • Category: <strong className="text-slate-700">{p.category}</strong> • Venue: {p.venue}
                      </p>
                      {p.parent_project_name && (
                        <p className="text-[11px] text-amber-700">
                          Part of Umbrella Program: <strong>{p.parent_project_name}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right text-xs">
                        <span className="font-bold text-slate-800 block">👥 {p.beneficiaries || 0} served</span>
                        <span className="text-slate-500 text-[11px]">⏱️ {p.volunteerHours || 0} hrs</span>
                      </div>
                      <Link to={`/viewProject/projectID=${p.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* General Meeting Card */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
              <span>General Meeting</span>
              <span className="text-xs font-normal text-slate-400">
                {report.general_meeting?.date || report.meeting_date ? `Held: ${report.general_meeting?.date || report.meeting_date}` : 'Not held'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Venue</span>
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {report.general_meeting?.place || report.place || 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Members Present</span>
                <span className="font-bold text-slate-700">
                  {report.general_meeting?.members_present || report.members_present || 0}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Guests / Dignitaries</span>
                <span className="font-bold text-slate-700">
                  {report.general_meeting?.guests || report.guests || 'None'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Minutes & Proceedings</h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {report.general_meeting?.minutes || report.minutes || 'No minutes documented.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Board Meeting Card */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
              <span>Board of Directors Meeting</span>
              <span className="text-xs font-normal text-slate-400">
                {report.board_meeting?.date || report.bm_date ? `Held: ${report.board_meeting?.date || report.bm_date}` : 'Not held'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Directors Present</span>
                <span className="font-bold text-slate-700">{report.board_meeting?.attendance || report.bm_attendance || 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block mb-1">Venue</span>
                <span className="font-bold text-slate-700">{report.board_meeting?.place || report.bm_place || 'N/A'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Board Resolutions</h4>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {report.board_meeting?.minutes || report.bm_minutes || 'No minutes documented.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* LION ADVISOR CONSULTATION PROOF CARD */}
        {report.advisor_proof && (
          <Card className="border-amber-200/80 bg-gradient-to-br from-amber-50/40 to-white">
            <CardHeader className="border-b border-amber-100 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Lion Advisor Consultation Confirmation
                </CardTitle>
              </div>
              <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 gap-1 text-xs">
                {report.advisor_proof.type === 'email_screenshot' ? <Mail className="w-3 h-3" /> : <FileCheck2 className="w-3 h-3" />}
                {report.advisor_proof.type === 'email_screenshot' ? 'Email Consultation Screenshot' : 'Signed Document'}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white border border-amber-100">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Lion Advisor</span>
                  <span className="font-bold text-slate-800 text-sm">{report.advisor_proof.advisor_name || 'Lion Advisor'}</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-amber-100">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Consultation Date</span>
                  <span className="font-bold text-slate-800 text-sm">{report.advisor_proof.consultation_date || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-amber-100">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Method</span>
                  <span className="font-bold text-slate-800 text-sm">{report.advisor_proof.consultation_method || 'Email Verification'}</span>
                </div>
              </div>

              {report.advisor_proof.notes && (
                <div className="p-3.5 rounded-xl bg-white border border-amber-100 text-slate-700">
                  <span className="font-bold text-slate-800 block mb-1">Advisor Notes / Excerpt:</span>
                  <p className="leading-relaxed">{report.advisor_proof.notes}</p>
                </div>
              )}

              {report.advisor_proof.proof_file_name && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span className="font-semibold text-slate-800">{report.advisor_proof.proof_file_name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Verified Advisor Proof</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Attachments / Documentation */}
        {report.support_doc && (
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Attached Official Minutes / Attendance Sheet</h4>
                  <p className="text-[11px] text-slate-400">PDF Document attached to this submission</p>
                </div>
              </div>
              <a href={report.support_doc} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rejection / Amendment Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogHeader>
          <DialogTitle>Return Activity Report for Amendments</DialogTitle>
          <DialogDescription>
            Specify the required amendments so the club officers can update and resubmit.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain reason for return/amendment..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleReject}>Return Report</Button>
        </DialogFooter>
      </Dialog>
    </AppLayout>
  );
}
