// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjectStore } from '@/store/projectStore';
import { useUserStore } from '@/store/userStore';
import { notify, postData, getData } from '@/lib/api';
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
  Layers,
  Image as ImageIcon,
  Share2,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  category: 'Cover' | 'Participation' | 'Attendance' | 'Banner' | 'Action' | 'Other';
  caption: string;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const { createProject, updateStep, hosted, fetchHosted } = useProjectStore();
  const user = useUserStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [projectId, setProjectId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Basics & Multi-Phase Linking
  const [name, setName] = useState('');
  const [onBehalfDistrict, setOnBehalfDistrict] = useState(false);
  const [onBehalfMD, setOnBehalfMD] = useState(false);
  const [projectType, setProjectType] = useState<'club' | 'joint' | 'sponsored'>('club');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');

  // Multi-phase project linking
  const [isPhased, setIsPhased] = useState(false);
  const [parentProjectId, setParentProjectId] = useState<string>('');
  const [phaseName, setPhaseName] = useState<string>('');

  // Step 2: Organizers
  const [chairmenLci, setChairmenLci] = useState('');
  const [chairmenList, setChairmenList] = useState<any[]>([]);
  const [committeeLci, setCommitteeLci] = useState('');
  const [committeeList, setCommitteeList] = useState<any[]>([]);

  // Step 3: Project Narrative & Objectives (Need Assessment Removed!)
  const [objectives, setObjectives] = useState('');
  const [description, setDescription] = useState('');

  // Step 4: Service Contest Form
  const [beneficiaries, setBeneficiaries] = useState('');
  const [volunteerHours, setVolunteerHours] = useState('');
  const [contestMetrics, setContestMetrics] = useState('');

  // Step 5: Budget
  const [incomes, setIncomes] = useState<{ desc: string; amount: string }[]>([{ desc: '', amount: '' }]);
  const [expenses, setExpenses] = useState<{ desc: string; amount: string }[]>([{ desc: '', amount: '' }]);

  // Step 6: Media, Captions, Bulk Upload (5-10 max) & PR Links
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

  // Real-time word count calculation for description
  const wordCount = useMemo(() => {
    const trimmed = description.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [description]);

  // Step 1 Handler (Supports both creation and non-destructive updating!)
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notify('Please enter a project name', 'warning');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('name', name);
    fd.append('onBehalfD', onBehalfDistrict ? '1' : '0');
    fd.append('onBehalfMD', onBehalfMD ? '1' : '0');
    fd.append('project_type', projectType);
    fd.append('category', category);
    fd.append('date', date);

    if (isPhased) {
      fd.append('is_phased', '1');
      fd.append('parent_project_id', parentProjectId);
      fd.append('phase_name', phaseName);
    } else {
      fd.append('is_phased', '0');
    }

    if (projectId) {
      // Non-destructive update for returning users
      await updateStep(projectId, 1, {
        name,
        category,
        date,
        project_type: projectType,
        is_phased: isPhased,
        parent_project_id: parentProjectId,
        phase_name: phaseName,
      });
      setLoading(false);
      notify('Step 1 details saved', 'success');
      setCurrentStep(2);
    } else {
      // First-time creation
      const res = await createProject(fd);
      setLoading(false);
      if (res && (res.id || res.data?.id)) {
        setProjectId(res.id || res.data?.id);
        setCurrentStep(2);
      }
    }
  };

  // Step 2 Lookup & Handler
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
      notify(`Added ${res.data.name || res.data.fName} to organizers`, 'success');
    } else {
      notify('No member found with that MyLCI number', 'warning');
    }
  };

  const handleStep2 = async () => {
    if (!projectId) return;
    setLoading(true);
    await updateStep(projectId, 2, {
      chairmen: chairmenList.map((c) => c.id || c.leoId),
      committee: committeeList.map((c) => c.id || c.leoId),
    });
    setLoading(false);
    setCurrentStep(3);
  };

  // Step 3 Handler (Need Assessment removed, Narrative with word count!)
  const handleStep3 = async () => {
    if (!projectId) return;
    if (wordCount < 20) {
      notify('Please provide a more descriptive narrative (at least 20 words recommended).', 'warning');
    }
    setLoading(true);
    await updateStep(projectId, 3, {
      objectives,
      description,
      word_count: wordCount,
    });
    setLoading(false);
    setCurrentStep(4);
  };

  // Step 4 Handler
  const handleStep4 = async () => {
    if (!projectId) return;
    setLoading(true);
    await updateStep(projectId, 4, {
      beneficiaries,
      volunteer_hours: volunteerHours,
      contest_metrics: contestMetrics,
    });
    setLoading(false);
    setCurrentStep(5);
  };

  // Step 5 Handler
  const handleStep5 = async () => {
    if (!projectId) return;
    setLoading(true);
    await updateStep(projectId, 5, {
      incomes: incomes.filter((i) => i.desc && i.amount),
      expenses: expenses.filter((e) => e.desc && e.amount),
    });
    setLoading(false);
    setCurrentStep(6);
  };

  // Step 6 Bulk Upload (5–10 photos max with captions & categorization)
  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 10 - photoList.length;
    if (remainingSlots <= 0) {
      notify('Maximum of 10 photos reached. Please remove some before adding more.', 'warning');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      notify(`Only adding ${remainingSlots} photo(s) to stay within the 10 photo maximum limit.`, 'info');
    }

    notify(`Compressing ${filesToProcess.length} photo(s)...`, 'info');

    const newItems: PhotoItem[] = [];
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const compressed = await compressImage(file, `img_${Date.now()}_${i}`);
      const effectiveFile = compressed || file;
      const previewUrl = URL.createObjectURL(effectiveFile);

      newItems.push({
        id: `${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        file: effectiveFile,
        previewUrl,
        category: photoList.length === 0 && i === 0 ? 'Cover' : 'Participation',
        caption: '',
      });
    }

    setPhotoList((prev) => [...prev, ...newItems]);
    notify(`${newItems.length} photo(s) added successfully!`, 'success');
    e.target.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotoList((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePhotoCategory = (id: string, category: PhotoItem['category']) => {
    setPhotoList((prev) => prev.map((p) => (p.id === id ? { ...p, category } : p)));
  };

  const updatePhotoCaption = (id: string, caption: string) => {
    setPhotoList((prev) => prev.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  const handleStep6 = async () => {
    if (!projectId) return;

    if (photoList.length < 1) {
      notify('Please upload at least 1 photo for district verification (recommended: 5–10 photos).', 'warning');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('external_album_link', externalAlbumLink);
    fd.append('facebook_album_link', facebookAlbumLink);
    fd.append('facebook_post_link', facebookPostLink);
    fd.append('instagram_link', instagramLink);
    fd.append('linkedin_link', linkedinLink);
    fd.append('youtube_link', youtubeLink);

    photoList.forEach((photo, idx) => {
      fd.append(`images[${idx}]`, photo.file);
      fd.append(`captions[${idx}]`, photo.caption || '');
      fd.append(`categories[${idx}]`, photo.category);
    });

    await updateStep(projectId, 6, fd);
    setLoading(false);
    notify('Project creation and standardized report submitted successfully!', 'success');
    navigate('/projects');
  };

  return (
    <AppLayout
      pageTitle="Create Service Project"
      subtitle="Standardized Reporting Wizard • Leo Multiple District 306"
      actions={
        <Link to="/workflow-guide">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs text-brand-700 border-brand-200">
            <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
            <span>Reporting Guidelines</span>
          </Button>
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/projects')}
            className="gap-2 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel & Exit
          </Button>
          <span className="text-xs font-semibold text-slate-400">
            Host: Leo Club of {user.clubName || 'My Club'}
          </span>
        </div>

        {/* Wizard Progress (Clickable backward navigation to return to previous pages anytime) */}
        <Card className="p-6">
          <StepProgress
            steps={steps}
            currentStep={currentStep}
            onStepClick={(step) => {
              // Full navigation freedom: users can return to any previous or initiated step to edit
              setCurrentStep(step);
            }}
          />
        </Card>

        {/* Dynamic Step Content */}
        <Card className="border-slate-200/90 shadow-md">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center justify-between">
              <span>Step 0{currentStep}: {steps[currentStep - 1].label}</span>
              {isPhased && (
                <Badge variant="brand" className="gap-1 text-xs">
                  <Layers className="w-3 h-3" /> Phased Program
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Define project fundamentals and link parent-phase relationships.'}
              {currentStep === 2 && 'Assign project chairpersons and committee members via MyLCI lookup.'}
              {currentStep === 3 && 'Document objectives and project narrative (word count monitored).'}
              {currentStep === 4 && 'Input verified beneficiary counts and community volunteer hours.'}
              {currentStep === 5 && 'Maintain double-entry balanced project income and expenditure accounts.'}
              {currentStep === 6 && 'Bulk upload 5–10 categorized photos with captions, plus PR links.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Basics & Multi-Phase Linking */}
              {currentStep === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleStep1}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Project Name *
                    </label>
                    <Input
                      placeholder="e.g. Hope for Sight - Vision Camp"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Category *
                      </label>
                      <Input
                        placeholder="e.g. Vision, Environment, Youth"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Execution Date *
                      </label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Multi-Phase Project Linking Feature */}
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
                    <p className="text-xs text-slate-500">
                      Enable this if your club is conducting a multi-phase program (e.g., Phase 1 Screening, Phase 2 Distribution). You can link this report to a main umbrella project.
                    </p>

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

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="brand" disabled={loading} className="gap-2">
                      <span>{projectId ? 'Save Changes & Next' : 'Next: Organizers'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* Step 2: Organizers */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {/* Chairpersons */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Project Chairperson(s)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search Chairperson by MyLCI number..."
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

                    <div className="flex flex-wrap gap-2 pt-1">
                      {chairmenList.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full text-xs font-medium border border-brand-200"
                        >
                          <span>{m.fName ? `${m.fName} ${m.lName}` : m.name || m}</span>
                          <button
                            type="button"
                            onClick={() => setChairmenList(chairmenList.filter((_, i) => i !== idx))}
                            className="text-brand-500 hover:text-brand-800 font-bold ml-1"
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
                        placeholder="Search Committee Member by MyLCI number..."
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

                    <div className="flex flex-wrap gap-2 pt-1">
                      {committeeList.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200"
                        >
                          <span>{m.fName ? `${m.fName} ${m.lName}` : m.name || m}</span>
                          <button
                            type="button"
                            onClick={() => setCommitteeList(committeeList.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-slate-800 font-bold ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Basics
                    </Button>
                    <Button variant="brand" onClick={handleStep2} disabled={loading} className="gap-2">
                      <span>Next: Narrative</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Project Narrative & Word Count (Need Assessment Removed!) */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Key Objectives & Planned Goals *
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={objectives}
                      onChange={(e) => setObjectives(e.target.value)}
                      placeholder="Outline 2–4 measurable target goals for this service activity..."
                      required
                    />
                  </div>

                  {/* Description with Real-time Word Count Feature */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Detailed Activity Description & Execution *
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
                      placeholder="Provide a thorough, standardized summary of project execution, beneficiary demographics, venue setup, partner organizations, and impact created..."
                      required
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Total characters: {description.length}</span>
                      {wordCount < 50 && (
                        <span className="text-amber-600 font-medium">
                          Tip: Detailed descriptions assist evaluators in grading contest entries faster.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button variant="brand" onClick={handleStep3} disabled={loading} className="gap-2">
                      <span>Next: Contest Metrics</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Service Contest Metrics */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Direct Beneficiaries Served *
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 250"
                        value={beneficiaries}
                        onChange={(e) => setBeneficiaries(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Volunteer Hours Served *
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g. 48"
                        value={volunteerHours}
                        onChange={(e) => setVolunteerHours(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Contest & Special Award Notes
                    </label>
                    <textarea
                      rows={4}
                      className="w-full p-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={contestMetrics}
                      onChange={(e) => setContestMetrics(e.target.value)}
                      placeholder="Special recognition notes, joint club contributions, sustainability criteria..."
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button variant="brand" onClick={handleStep4} disabled={loading} className="gap-2">
                      <span>Next: Budget</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Financial Budget */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {/* Incomes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        Project Income (LKR)
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setIncomes([...incomes, { desc: '', amount: '' }])}
                        className="text-emerald-600 text-xs gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Income Row
                      </Button>
                    </div>

                    {incomes.map((inc, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="Description (e.g. Club fund, Sponsor, Donation)"
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
                        className="text-rose-600 text-xs gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Expense Row
                      </Button>
                    </div>

                    {expenses.map((exp, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="Description (e.g. Medical supplies, Venue, Refreshments)"
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
                    <Button variant="outline" onClick={() => setCurrentStep(4)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button variant="brand" onClick={handleStep5} disabled={loading} className="gap-2">
                      <span>Next: Media & PR</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Bulk Upload, 5–10 Photos with Captions, Categories & PR Links */}
              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
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
                        <p className="text-xs text-slate-400 mt-1">
                          PNG, JPG, JPEG up to 10 photos total (Client-side automatic compression enabled)
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

                  {/* External Album Links (Google Drive / Facebook) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        External Photo Album Links (Optional)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      If your club captured more than 10 photos, link the full Google Drive or Facebook album below for evaluators.
                    </p>
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

                  {/* PR & Social Media Tracking Links */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Social Media PR Tracking Links
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Track your club’s public relations and reach by submitting post URLs across district channels:
                    </p>
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
                    <Button variant="outline" onClick={() => setCurrentStep(5)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back to Budget
                    </Button>
                    <Button
                      variant="success"
                      onClick={handleStep6}
                      disabled={loading}
                      className="gap-2 shadow-sm font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Submitting...' : 'Finalize & Submit Project'}</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
