// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjectStore } from '@/store/projectStore';
import { useUserStore } from '@/store/userStore';
import { notify, postData } from '@/lib/api';
import { compressImage } from '@/lib/imageCompressor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StepProgress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  Plus,
  Trash2,
  Search,
  Check,
  Eye,
  Layers,
  Image as ImageIcon,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PhotoItem {
  id: string;
  file?: File;
  previewUrl: string;
  category: 'Cover' | 'Participation' | 'Attendance' | 'Banner' | 'Action' | 'Other';
  caption: string;
}

export default function EditProject() {
  const { id, step } = useParams<{ id: string; step: string }>();
  const navigate = useNavigate();
  const { getProject, updateStep, hosted, fetchHosted } = useProjectStore();
  const user = useUserStore();

  const currentStep = parseInt(step || '1', 10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>({});

  // Step 1: Basics & Multi-phase linking
  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState<'club' | 'joint' | 'sponsored'>('club');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [isPhased, setIsPhased] = useState(false);
  const [parentProjectId, setParentProjectId] = useState<string>('');
  const [phaseName, setPhaseName] = useState<string>('');

  // Step 2: Organizers
  const [chairmenLci, setChairmenLci] = useState('');
  const [chairmenList, setChairmenList] = useState<any[]>([]);
  const [committeeLci, setCommitteeLci] = useState('');
  const [committeeList, setCommitteeList] = useState<any[]>([]);

  // Step 3: Project Narrative & Objectives (Need Assessment removed!)
  const [objectives, setObjectives] = useState('');
  const [description, setDescription] = useState('');

  // Step 4: Service Contest Form
  const [beneficiaries, setBeneficiaries] = useState('');
  const [volunteerHours, setVolunteerHours] = useState('');
  const [contestMetrics, setContestMetrics] = useState('');

  // Step 5: Budget
  const [incomes, setIncomes] = useState<{ desc: string; amount: string }[]>([{ desc: '', amount: '' }]);
  const [expenses, setExpenses] = useState<{ desc: string; amount: string }[]>([{ desc: '', amount: '' }]);

  // Step 6: Media, Captions & PR Links
  const [photoList, setPhotoList] = useState<PhotoItem[]>([]);
  const [externalAlbumLink, setExternalAlbumLink] = useState('');
  const [facebookAlbumLink, setFacebookAlbumLink] = useState('');
  const [facebookPostLink, setFacebookPostLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  const steps = [
    { number: 1, label: 'Basics & Phase' },
    { number: 2, label: 'Organizers' },
    { number: 3, label: 'Narrative' },
    { number: 4, label: 'Contest' },
    { number: 5, label: 'Budget' },
    { number: 6, label: 'Media & PR' },
  ];

  useEffect(() => {
    fetchHosted();
  }, [fetchHosted]);

  useEffect(() => {
    const fetchExistingProject = async () => {
      if (!id) return;
      setLoading(true);
      const res = await getProject(id);
      if (res && res.data) {
        const d = res.data;
        setProject(d);
        setName(d.name || '');
        setProjectType(d.project_type || 'club');
        setCategory(d.category || '');
        setDate(d.date || '');

        setIsPhased(Boolean(d.is_phased || d.parent_project_id));
        setParentProjectId(d.parent_project_id || '');
        setPhaseName(d.phase_name || '');

        setChairmenList(d.chairpersons || []);
        setCommitteeList(d.committee || []);

        setObjectives(d.objectives || '');
        setDescription(d.description || '');

        setBeneficiaries(d.beneficiaries || '');
        setVolunteerHours(d.volunteerHours || d.volunteer_hours || '');
        setContestMetrics(d.contestMetrics || d.contest_metrics || '');

        if (d.incomes && d.incomes.length > 0) setIncomes(d.incomes);
        if (d.expenses && d.expenses.length > 0) setExpenses(d.expenses);

        setExternalAlbumLink(d.external_album_link || d.externalAlbumLink || '');
        setFacebookAlbumLink(d.facebook_album_link || d.facebookAlbumLink || '');
        setFacebookPostLink(d.facebook_post_link || d.publicityLink || '');
        setInstagramLink(d.instagram_link || '');
        setLinkedinLink(d.linkedin_link || '');
        setYoutubeLink(d.youtube_link || '');

        if (d.images && Array.isArray(d.images)) {
          setPhotoList(
            d.images.map((img: any, i: number) => ({
              id: `existing_${i}`,
              previewUrl: typeof img === 'string' ? img : img.url || '/logo.png',
              category: img.category || (i === 0 ? 'Cover' : 'Participation'),
              caption: img.caption || '',
            }))
          );
        }
      }
      setLoading(false);
    };

    fetchExistingProject();
  }, [id, getProject]);

  const wordCount = useMemo(() => {
    const trimmed = description.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [description]);

  const changeStep = (stepNum: number) => {
    navigate(`/editProject/projectID=${id}/step=${stepNum}`);
  };

  const searchMember = async (mylci: string, type: 'chair' | 'committee') => {
    if (!mylci) return;
    const res = await postData(`member/search`, { mylci });
    if (res && res.data) {
      if (type === 'chair') {
        setChairmenList((prev) => [...prev, res.data]);
        setChairmenLci('');
      } else {
        setCommitteeList((prev) => [...prev, res.data]);
        setCommitteeLci('');
      }
      notify('Member identified and added', 'success');
    }
  };

  // Step 1 Save
  const handleSaveStep1 = async () => {
    setSaving(true);
    await updateStep(id!, 1, {
      name,
      category,
      date,
      project_type: projectType,
      is_phased: isPhased,
      parent_project_id: parentProjectId,
      phase_name: phaseName,
    });
    setSaving(false);
    changeStep(2);
  };

  // Step 2 Save
  const handleSaveStep2 = async () => {
    setSaving(true);
    await updateStep(id!, 2, {
      chairpersons: chairmenList.map((m) => m.id || m.mylci),
      committee: committeeList.map((m) => m.id || m.mylci),
    });
    setSaving(false);
    changeStep(3);
  };

  // Step 3 Save (Narrative with word count)
  const handleSaveStep3 = async () => {
    setSaving(true);
    await updateStep(id!, 3, {
      objectives,
      description,
      word_count: wordCount,
    });
    setSaving(false);
    changeStep(4);
  };

  // Step 4 Save
  const handleSaveStep4 = async () => {
    setSaving(true);
    await updateStep(id!, 4, {
      beneficiaries,
      volunteer_hours: volunteerHours,
      contest_metrics: contestMetrics,
    });
    setSaving(false);
    changeStep(5);
  };

  // Step 5 Save
  const handleSaveStep5 = async () => {
    setSaving(true);
    await updateStep(id!, 5, {
      incomes: incomes.filter((i) => i.desc && i.amount),
      expenses: expenses.filter((e) => e.desc && e.amount),
    });
    setSaving(false);
    changeStep(6);
  };

  // Step 6 Bulk Image Upload & Captions
  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 10 - photoList.length;
    if (remainingSlots <= 0) {
      notify('Maximum of 10 photos reached. Please remove some before adding more.', 'warning');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newItems: PhotoItem[] = [];
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const compressed = await compressImage(file, `edit_img_${Date.now()}_${i}`);
      const effectiveFile = compressed || file;
      newItems.push({
        id: `${Date.now()}_${i}`,
        file: effectiveFile,
        previewUrl: URL.createObjectURL(effectiveFile),
        category: photoList.length === 0 && i === 0 ? 'Cover' : 'Participation',
        caption: '',
      });
    }

    setPhotoList((prev) => [...prev, ...newItems]);
    notify(`${newItems.length} photo(s) added!`, 'success');
  };

  const removePhoto = (photoId: string) => {
    setPhotoList((prev) => prev.filter((p) => p.id !== photoId));
  };

  const updatePhotoCategory = (photoId: string, category: PhotoItem['category']) => {
    setPhotoList((prev) => prev.map((p) => (p.id === photoId ? { ...p, category } : p)));
  };

  const updatePhotoCaption = (photoId: string, caption: string) => {
    setPhotoList((prev) => prev.map((p) => (p.id === photoId ? { ...p, caption } : p)));
  };

  const handleSaveStep6 = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.append('external_album_link', externalAlbumLink);
    fd.append('facebook_album_link', facebookAlbumLink);
    fd.append('facebook_post_link', facebookPostLink);
    fd.append('instagram_link', instagramLink);
    fd.append('linkedin_link', linkedinLink);
    fd.append('youtube_link', youtubeLink);

    photoList.forEach((photo, idx) => {
      if (photo.file) {
        fd.append(`images[${idx}]`, photo.file);
      }
      fd.append(`captions[${idx}]`, photo.caption || '');
      fd.append(`categories[${idx}]`, photo.category);
    });

    await updateStep(id!, 6, fd);
    setSaving(false);
    notify('Project report successfully updated!', 'success');
    navigate(`/viewProject/projectID=${id}`);
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Loading Project Data...">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      pageTitle={`Edit Project: ${name || 'Report'}`}
      subtitle={`Revise project details and service submission for Leo Club of ${user.clubName || 'My Club'}`}
      actions={
        <div className="flex items-center gap-2">
          <Link to={`/viewProject/projectID=${id}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <Eye className="w-4 h-4" />
              <span>View Report</span>
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
              <ArrowLeft className="w-4 h-4" />
              <span>Projects</span>
            </Button>
          </Link>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Step Progress bar with non-destructive navigation */}
        <StepProgress steps={steps} currentStep={currentStep} onStepClick={changeStep} />

        <AnimatePresence mode="wait">
          {/* Step 1: Basics & Multi-Phase */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Project Basics & Multi-Phase Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Project Name *
                    </label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Category *
                      </label>
                      <Input value={category} onChange={(e) => setCategory(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Execution Date *
                      </label>
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                  </div>

                  {/* Multi-Phase Program Linking */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-brand-600" />
                        <span className="text-sm font-bold text-slate-800">
                          Is this project executed in phases?
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isPhased}
                        onChange={(e) => setIsPhased(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded"
                      />
                    </div>

                    {isPhased && (
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Select Parent / Umbrella Project
                          </label>
                          <select
                            value={parentProjectId}
                            onChange={(e) => setParentProjectId(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          >
                            <option value="">-- Choose Existing Main Project --</option>
                            {hosted.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.date || 'Project'})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Phase Number / Title
                          </label>
                          <Input
                            placeholder="e.g. Phase 2: Spectacle Handover"
                            value={phaseName}
                            onChange={(e) => setPhaseName(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => navigate(`/viewProject/projectID=${id}`)}>
                      Cancel
                    </Button>
                    <Button variant="brand" onClick={handleSaveStep1} disabled={saving} className="gap-2">
                      <span>{saving ? 'Saving...' : 'Save & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Organizers */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Project Organizers & Committee</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Chairpersons */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Project Chairperson(s)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter MyLCI number..."
                        value={chairmenLci}
                        onChange={(e) => setChairmenLci(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => searchMember(chairmenLci, 'chair')}
                        className="gap-2"
                      >
                        <Search className="w-4 h-4" /> Lookup
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {chairmenList.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full text-xs font-medium border border-brand-200"
                        >
                          <span>{m.fName ? `${m.fName} ${m.lName}` : m.name || m}</span>
                          <button
                            type="button"
                            onClick={() => setChairmenList(chairmenList.filter((_, i) => i !== idx))}
                            className="text-brand-500 hover:text-brand-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Committee */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Committee Members
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter MyLCI number..."
                        value={committeeLci}
                        onChange={(e) => setCommitteeLci(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => searchMember(committeeLci, 'committee')}
                        className="gap-2"
                      >
                        <Search className="w-4 h-4" /> Lookup
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {committeeList.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200"
                        >
                          <span>{m.fName ? `${m.fName} ${m.lName}` : m.name || m}</span>
                          <button
                            type="button"
                            onClick={() => setCommitteeList(committeeList.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-slate-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => changeStep(1)}>
                      Back
                    </Button>
                    <Button variant="brand" onClick={handleSaveStep2} disabled={saving} className="gap-2">
                      <span>{saving ? 'Saving...' : 'Save & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Project Narrative & Word Count (Need Assessment Removed!) */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Step 3: Objectives & Narrative (Word Count Monitored)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Key Objectives
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={objectives}
                      onChange={(e) => setObjectives(e.target.value)}
                      placeholder="What were the planned measurable goals?"
                    />
                  </div>

                  {/* Description with Word Count */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Detailed Activity Description
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={wordCount >= 50 && wordCount <= 350 ? 'success' : wordCount < 50 ? 'warning' : 'outline'}
                          className="font-mono text-xs"
                        >
                          {wordCount} words
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          (Recommended: 50–300 words)
                        </span>
                      </div>
                    </div>

                    <textarea
                      rows={6}
                      className="w-full p-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Step-by-step summary of project execution, beneficiary demographics, venue setup, and impact created..."
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => changeStep(2)}>
                      Back
                    </Button>
                    <Button variant="brand" onClick={handleSaveStep3} disabled={saving} className="gap-2">
                      <span>{saving ? 'Saving...' : 'Save & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Contest Metrics */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Step 4: Service Contest Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Total Direct Beneficiaries
                      </label>
                      <Input
                        type="number"
                        value={beneficiaries}
                        onChange={(e) => setBeneficiaries(e.target.value)}
                        placeholder="e.g. 150"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Total Volunteer Hours Served
                      </label>
                      <Input
                        type="number"
                        value={volunteerHours}
                        onChange={(e) => setVolunteerHours(e.target.value)}
                        placeholder="e.g. 48"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Contest & Award Criteria Notes
                    </label>
                    <textarea
                      rows={4}
                      className="w-full p-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={contestMetrics}
                      onChange={(e) => setContestMetrics(e.target.value)}
                      placeholder="Special recognition notes, partner organizations, sustainability points..."
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => changeStep(3)}>
                      Back
                    </Button>
                    <Button variant="brand" onClick={handleSaveStep4} disabled={saving} className="gap-2">
                      <span>{saving ? 'Saving...' : 'Save & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 5: Budget */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Step 5: Financial Statement & Project Budget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Incomes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        Project Income Sources (LKR)
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setIncomes([...incomes, { desc: '', amount: '' }])}
                        className="gap-1 text-emerald-600 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Income Row
                      </Button>
                    </div>

                    {incomes.map((inc, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="Income Description (e.g. Club funds, Sponsor)"
                          value={inc.desc}
                          onChange={(e) => {
                            const next = [...incomes];
                            next[i].desc = e.target.value;
                            setIncomes(next);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          className="w-36"
                          value={inc.amount}
                          onChange={(e) => {
                            const next = [...incomes];
                            next[i].amount = e.target.value;
                            setIncomes(next);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setIncomes(incomes.filter((_, idx) => idx !== i))}
                          className="text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Expenses */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                        Project Expenses (LKR)
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpenses([...expenses, { desc: '', amount: '' }])}
                        className="gap-1 text-rose-600 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Expense Row
                      </Button>
                    </div>

                    {expenses.map((exp, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="Expense Description (e.g. Venue, Refreshments)"
                          value={exp.desc}
                          onChange={(e) => {
                            const next = [...expenses];
                            next[i].desc = e.target.value;
                            setExpenses(next);
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          className="w-36"
                          value={exp.amount}
                          onChange={(e) => {
                            const next = [...expenses];
                            next[i].amount = e.target.value;
                            setExpenses(next);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setExpenses(expenses.filter((_, idx) => idx !== i))}
                          className="text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => changeStep(4)}>
                      Back
                    </Button>
                    <Button variant="brand" onClick={handleSaveStep5} disabled={saving} className="gap-2">
                      <span>{saving ? 'Saving...' : 'Save & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 6: Bulk Upload 5-10 Photos, Captions, Categories & PR Links */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Step 6: Media Proof (5–10 Photos) & PR Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo Upload Zone */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                          Upload Activity Photographs
                        </label>
                        <span className="text-xs text-slate-500">
                          Bulk select photos (Limit: 5 to 10 photos max per project)
                        </span>
                      </div>
                      <Badge variant={photoList.length >= 5 && photoList.length <= 10 ? 'success' : 'outline'}>
                        {photoList.length} / 10 Photos
                      </Badge>
                    </div>

                    {photoList.length < 10 && (
                      <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 p-6 rounded-2xl text-center transition-colors bg-slate-50/50">
                        <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">
                          Click to bulk upload or drag and drop photos
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleBulkImageUpload}
                          className="mt-3 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Uploaded Photo Cards with Category & Caption Inputs */}
                  {photoList.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Categorize Photos & Add Captions
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {photoList.map((photo, idx) => (
                          <div
                            key={photo.id}
                            className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2.5 relative group"
                          >
                            <div className="relative h-40 bg-slate-100 rounded-lg overflow-hidden">
                              <img
                                src={photo.previewUrl}
                                alt={`Project photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(photo.id)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white transition-colors"
                                title="Remove photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <Badge className="absolute bottom-2 left-2 text-[10px] bg-slate-900/70 text-white">
                                Photo {idx + 1}
                              </Badge>
                            </div>

                            {/* Category Selector */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600 uppercase">
                                Photo Category *
                              </label>
                              <select
                                value={photo.category}
                                onChange={(e) => updatePhotoCategory(photo.id, e.target.value as any)}
                                className="w-full h-8 px-2.5 rounded-md border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                              >
                                <option value="Cover">Cover Photo (Featured banner)</option>
                                <option value="Participation">Participation & Beneficiaries</option>
                                <option value="Attendance">Attendance Sheet / Signatures</option>
                                <option value="Banner">Project Banner / Signage</option>
                                <option value="Action">Action & Hands-on Work</option>
                                <option value="Other">Other Auxiliary Photo</option>
                              </select>
                            </div>

                            {/* Caption Input */}
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-600 uppercase">
                                Caption / Description
                              </label>
                              <Input
                                placeholder="e.g. Spectacle handover with Chief Guest"
                                value={photo.caption}
                                onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Album Links */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        External Photo Album Links
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Google Drive / Cloud Album URL"
                        value={externalAlbumLink}
                        onChange={(e) => setExternalAlbumLink(e.target.value)}
                      />
                      <Input
                        placeholder="Facebook Album URL"
                        value={facebookAlbumLink}
                        onChange={(e) => setFacebookAlbumLink(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* PR & Social Media Links */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Social Media PR Tracking Links
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Facebook Post URL"
                        value={facebookPostLink}
                        onChange={(e) => setFacebookPostLink(e.target.value)}
                      />
                      <Input
                        placeholder="Instagram Post / Reel URL"
                        value={instagramLink}
                        onChange={(e) => setInstagramLink(e.target.value)}
                      />
                      <Input
                        placeholder="LinkedIn Post URL"
                        value={linkedinLink}
                        onChange={(e) => setLinkedinLink(e.target.value)}
                      />
                      <Input
                        placeholder="TikTok / YouTube Video URL"
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => changeStep(5)}>
                      Back
                    </Button>
                    <Button
                      variant="success"
                      onClick={handleSaveStep6}
                      disabled={saving}
                      className="gap-2 shadow-sm font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving Changes...' : 'Save All Changes'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
