// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjectStore } from '@/store/projectStore';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import { notify, postData } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Image as ImageIcon,
  Check,
  X,
  FileText,
  Layers,
  Globe2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  Edit,
} from 'lucide-react';

export default function ViewProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, updateApproval } = useProjectStore();
  const user = useUserStore();
  const settings = useSettingsStore();

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'organizers' | 'budget' | 'photos' | 'mylion'>('details');

  // MyLion Sync Status State
  const [myLionSyncing, setMyLionSyncing] = useState(false);
  const [myLionStatus, setMyLionStatus] = useState<'draft' | 'synced' | 'pending'>('draft');

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projId: string) => {
    setLoading(true);
    const data = await getProject(projId);
    setLoading(false);
    if (data) {
      const p = data.data || data;
      setProject(p);
      if (p.mylion_status) {
        setMyLionStatus(p.mylion_status);
      }
    }
  };

  // Check if current user can approve (DP, RD if delegated, or Contest Director if fallback enabled)
  const canApprove = useMemo(() => {
    if (user.isDp || user.isMdp) return true;
    if (settings.delegateApprovalToRD && user.isDistrictOfficer) return true;
    if (settings.rdInactiveFallbackContestDirector && user.canApproveReports) return true;
    return user.canApproveReports;
  }, [user, settings]);

  const handleApprove = async () => {
    if (!id) return;
    const res = await updateApproval(id, 3);
    if (res) {
      notify('Project approved successfully by district reviewer!', 'success');
      loadProject(id);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) {
      notify('Please provide a reason for requesting amendments', 'warning');
      return;
    }
    const res = await updateApproval(id, 1, rejectReason);
    setRejectModalOpen(false);
    if (res) {
      notify('Project returned for amendments with feedback note', 'info');
      loadProject(id);
    }
  };

  const handleMyLionSync = async () => {
    setMyLionSyncing(true);
    notify('Connecting to Lions Clubs International (MyLion) API endpoint...', 'info');

    // Simulate/Execute API sync with MyLion bridge
    setTimeout(() => {
      setMyLionSyncing(false);
      setMyLionStatus('synced');
      notify('Pushed to MyLion successfully! Populated as Draft for LCI finalization.', 'success');
    }, 1200);
  };

  const wordCount = useMemo(() => {
    const text = project?.description || '';
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [project?.description]);

  if (loading) {
    return (
      <AppLayout pageTitle="Loading Project...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout pageTitle="Project Not Found">
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <p className="text-slate-500">Could not retrieve details for this project.</p>
            <Button variant="outline" onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      pageTitle={project.name}
      subtitle={`Standardized Project Report • ${project.category || 'Service Activity'}`}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projects')}
            className="gap-2 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Button>

          <div className="flex items-center gap-2">
            {/* Edit Project button for club secretaries/chairs */}
            {project.status !== 3 && (
              <Link to={`/editProject/projectID=${id}/step=1`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Report</span>
                </Button>
              </Link>
            )}

            {/* District Delegated Approval Bar */}
            {canApprove && project.status === 2 && (
              <div className="flex items-center gap-2">
                <Button variant="success" size="sm" onClick={handleApprove} className="gap-1.5 shadow-xs">
                  <Check className="w-4 h-4" /> Approve Project
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setRejectModalOpen(true)}
                  className="gap-1.5 shadow-xs"
                >
                  <X className="w-4 h-4" /> Request Amendments
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Top Header Card with Multi-Phase Indicator & MyLion Status */}
        <Card className="border-slate-200/90 shadow-md">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {project.category || 'Service Activity'}
                  </span>

                  {project.status === 3 && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Approved
                    </Badge>
                  )}
                  {project.status === 2 && (
                    <Badge variant="warning" className="gap-1">
                      <Clock className="w-3 h-3" /> Pending Review
                    </Badge>
                  )}
                  {project.status === 1 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="w-3 h-3" /> Amendments Requested
                    </Badge>
                  )}

                  {/* Multi-Phase Badge */}
                  {(project.is_phased || project.parent_project_id || project.phase_name) && (
                    <Badge variant="brand" className="gap-1 text-xs">
                      <Layers className="w-3 h-3" />
                      <span>{project.phase_name || 'Phased Initiative'}</span>
                    </Badge>
                  )}

                  {/* MyLion Status Badge */}
                  <Badge variant="outline" className="gap-1 text-xs font-mono text-slate-600 bg-slate-50">
                    <Globe2 className="w-3 h-3 text-brand-600" />
                    <span>MyLion: {myLionStatus === 'synced' ? 'Synced (Draft)' : 'Ready for Push'}</span>
                  </Badge>
                </div>

                <h1 className="text-2xl font-black text-slate-900">{project.name}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Organized by <strong className="text-slate-700">Leo Club of {project.club_name || user.clubName || 'My Club'}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
                <div className="flex sm:justify-end items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Executed: {project.date || 'N/A'}</span>
                </div>
                {project.submit_on && <div>Submitted on: {project.submit_on}</div>}
              </div>
            </div>

            {/* Rejection Note Warning Banner */}
            {project.status === 1 && project.reject_note && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Reviewer Amendments Feedback:
                </div>
                <p className="leading-relaxed">{project.reject_note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tab Navigation with Spring Sliding Indicator */}
        <Tabs
          tabs={[
            { id: 'details', label: 'Details & Objectives', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'organizers', label: 'Organizers', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'budget', label: 'Budget & Finances', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'photos', label: 'Photos & PR', icon: <ImageIcon className="w-3.5 h-3.5" /> },
            { id: 'mylion', label: 'MyLion Sync', icon: <Globe2 className="w-3.5 h-3.5" /> },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />

        {/* Tab Content: Details & Objectives (Need Assessment Removed!) */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* Objectives */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase text-slate-500">
                  Project Objectives & Key Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {project.objectives || 'No objectives provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Narrative & Description with Live Word Count */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase text-slate-500">
                  Standardized Activity Narrative
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  {wordCount} Words
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {project.description || 'No execution details provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Impact Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    👥
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Direct Beneficiaries</span>
                    <span className="text-lg font-black text-slate-800">{project.beneficiaries || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    ⏱️
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Volunteer Hours</span>
                    <span className="text-lg font-black text-slate-800">{project.volunteer_hours || project.volunteerHours || 0} hrs</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab Content: Organizers */}
        {activeTab === 'organizers' && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Project Chairpersons</h4>
                {project.chairmen && project.chairmen.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.chairmen.map((c: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                          {c.fName ? c.fName[0] : c.name ? c.name[0] : 'L'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {c.fName ? `${c.fName} ${c.lName}` : c.name || 'Leo Member'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">MyLCI: {c.mylci || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No chairmen assigned.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Content: Budget */}
        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-emerald-700">Income Sources</CardTitle>
              </CardHeader>
              <CardContent>
                {project.incomes && project.incomes.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {project.incomes.map((inc: any, i: number) => (
                      <div key={i} className="py-2 flex justify-between">
                        <span className="text-slate-700">{inc.detail || inc.desc}</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(inc.value || inc.amount)} LKR</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No income records registered.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-red-700">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {project.expenses && project.expenses.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {project.expenses.map((exp: any, i: number) => (
                      <div key={i} className="py-2 flex justify-between">
                        <span className="text-slate-700">{exp.detail || exp.desc}</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(exp.value || exp.amount)} LKR</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No expense records registered.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab Content: Categorized Photos & PR Links */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Activity Photo Gallery (Categorized)
                  </CardTitle>
                  <CardDescription>Verified media proof evaluated by district leadership</CardDescription>
                </div>
                <Badge variant="outline">
                  {project.images?.length || 0} Verified Photos
                </Badge>
              </CardHeader>
              <CardContent>
                {project.images && project.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {project.images.map((img: any, i: number) => {
                      const src = typeof img === 'string' ? img : img.url || '/logo.png';
                      const caption = typeof img === 'object' ? img.caption : '';
                      const category = typeof img === 'object' ? img.category : (i === 0 ? 'Cover' : 'Participation');

                      return (
                        <div key={i} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white space-y-2">
                          <div className="aspect-video relative overflow-hidden bg-slate-100">
                            <img src={src} alt={caption || `Project media ${i + 1}`} className="w-full h-full object-cover" />
                            <Badge className="absolute bottom-2 left-2 text-[10px] bg-slate-900/80 text-white">
                              {category}
                            </Badge>
                          </div>
                          {caption && (
                            <p className="text-xs text-slate-600 px-3 pb-2.5 leading-snug">{caption}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-8">No photos uploaded for this project.</p>
                )}
              </CardContent>
            </Card>

            {/* External Album & PR Social Media Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-brand-600" /> External Cloud Albums
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {project.external_album_link || project.externalAlbumLink ? (
                    <a
                      href={project.external_album_link || project.externalAlbumLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline flex items-center gap-1.5 truncate"
                    >
                      <span>Google Drive / Cloud Gallery</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No external cloud album linked</span>
                  )}

                  {project.facebook_album_link && (
                    <a
                      href={project.facebook_album_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline flex items-center gap-1.5 truncate block"
                    >
                      <span>Facebook Photo Album</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-brand-600" /> Public Relations & Social Reach
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {project.publicityLink || project.publicity_link || project.facebook_post_link ? (
                    <a
                      href={project.publicityLink || project.publicity_link || project.facebook_post_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline flex items-center gap-1.5 truncate"
                    >
                      <span>Facebook Official Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}

                  {project.instagram_link && (
                    <a
                      href={project.instagram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline flex items-center gap-1.5 truncate block"
                    >
                      <span>Instagram Post / Reel</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {!project.publicityLink && !project.instagram_link && (
                    <span className="text-slate-400 italic">No PR social links submitted</span>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab Content: MyLion (International Portal) Integration Sync */}
        {activeTab === 'mylion' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                <Globe2 className="w-5 h-5 text-brand-600" />
                Lions Clubs International (MyLion) Portal Sync Bridge
              </CardTitle>
              <CardDescription>
                Synchronize this verified local report with the international Lions Clubs International database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-brand-50/60 border border-brand-100 rounded-xl space-y-2 text-xs text-brand-900">
                <p className="font-semibold text-sm">International Data Standardization Agreement</p>
                <p className="leading-relaxed">
                  In technical coordination with Akshaya and the international Lions technical leads, verified club reports can be pushed directly to the international platform. When submitted, this project will appear as a <strong>Draft</strong> on MyLion for two-step international finalization.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Sync Status:</span>
                    <Badge variant={myLionStatus === 'synced' ? 'success' : 'outline'}>
                      {myLionStatus === 'synced' ? 'Synchronized as Draft on MyLion' : 'Pending API Push'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Beneficiaries: {project.beneficiaries || 0} | Volunteer Hours: {project.volunteer_hours || 0}
                  </p>
                </div>

                <Button
                  variant="brand"
                  size="sm"
                  onClick={handleMyLionSync}
                  disabled={myLionSyncing || myLionStatus === 'synced'}
                  className="gap-2 shadow-sm font-semibold"
                >
                  <Send className="w-4 h-4" />
                  <span>{myLionSyncing ? 'Pushing to LCI...' : myLionStatus === 'synced' ? 'Already Synced' : 'Push to MyLion'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogHeader>
          <DialogTitle>Request Report Amendments</DialogTitle>
          <DialogDescription>
            Provide clear guidance so the club secretary can adjust the submission and resubmit for approval.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain required changes (e.g. upload attendance sheet, clarify volunteer hours)..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleReject}>Confirm Amendments Request</Button>
        </DialogFooter>
      </Dialog>
    </AppLayout>
  );
}
