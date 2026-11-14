// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useReportStore } from '@/store/reportStore';
import { useProjectStore } from '@/store/projectStore';
import { useUserStore } from '@/store/userStore';
import { notify } from '@/lib/api';
import { getMonth, getLeoMonthFromDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StepProgress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Plus,
  Trash2,
  FolderKanban,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  Mail,
  FileCheck2,
  Eye,
  Save,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReport, updateStep } = useReportStore();
  const { hosted, fetchHosted } = useProjectStore();
  const user = useUserStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState('1');

  // Step 2: General Meeting
  const [gmDate, setGmDate] = useState('');
  const [gmPlace, setGmPlace] = useState('');
  const [gmMembersCount, setGmMembersCount] = useState('');
  const [gmGuests, setGmGuests] = useState('');
  const [gmMinutes, setGmMinutes] = useState('');

  // Step 3: Board Meeting
  const [bmDate, setBmDate] = useState('');
  const [bmPlace, setBmPlace] = useState('');
  const [bmAttendance, setBmAttendance] = useState('');
  const [bmMinutes, setBmMinutes] = useState('');

  // Step 4: Special Meetings
  const [specialMeetings, setSpecialMeetings] = useState<any[]>([]);
  const [smDesc, setSmDesc] = useState('');
  const [smDate, setSmDate] = useState('');

  // Step 5: Events
  const [eventsAttended, setEventsAttended] = useState<any[]>([]);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [attendeeCount, setAttendeeCount] = useState('');

  // Step 6: Documentation & Lion Advisor Confirmation Proof
  const [docFile, setDocFile] = useState<File | null>(null);
  const [advisorProofType, setAdvisorProofType] = useState<'physical_signature' | 'email_screenshot'>('email_screenshot');
  const [advisorName, setAdvisorName] = useState('Lion Advisor');
  const [advisorDate, setAdvisorDate] = useState('');
  const [advisorMethod, setAdvisorMethod] = useState('Email Consultation');
  const [advisorNotes, setAdvisorNotes] = useState('');
  const [advisorProofFile, setAdvisorProofFile] = useState<File | null>(null);
  const [advisorProofPreview, setAdvisorProofPreview] = useState<string | null>(null);

  const steps = [
    { number: 1, label: 'Month & Projects' },
    { number: 2, label: 'General Meeting' },
    { number: 3, label: 'Board Meeting' },
    { number: 4, label: 'Special Meetings' },
    { number: 5, label: 'Events Attended' },
    { number: 6, label: 'Advisor & Submit' },
  ];

  useEffect(() => {
    fetchHosted();
    const loadReport = async () => {
      if (!id) return;
      setLoading(true);
      const res = await getReport(id);
      if (res) {
        const d = res.data || res;
        setReport(d);
        if (d.month) setSelectedMonth(String(d.month));

        // Step 2
        setGmDate(d.meeting_date || d.general_meeting?.date || '');
        setGmPlace(d.place || d.general_meeting?.place || '');
        setGmMembersCount(d.members_present || d.general_meeting?.members_present || '');
        setGmGuests(d.guests || d.general_meeting?.guests || '');
        setGmMinutes(d.minutes || d.general_meeting?.minutes || '');

        // Step 3
        setBmDate(d.bm_date || d.board_meeting?.date || '');
        setBmPlace(d.bm_place || d.board_meeting?.place || '');
        setBmAttendance(d.bm_attendance || d.board_meeting?.attendance || '');
        setBmMinutes(d.bm_minutes || d.board_meeting?.minutes || '');

        // Step 4
        if (d.special_meetings) {
          setSpecialMeetings(Array.isArray(d.special_meetings) ? d.special_meetings : []);
        }

        // Step 5
        if (d.events_attended) {
          setEventsAttended(Array.isArray(d.events_attended) ? d.events_attended : []);
        }

        // Step 6: Advisor Proof
        if (d.advisor_proof) {
          setAdvisorProofType(d.advisor_proof.type || 'email_screenshot');
          setAdvisorName(d.advisor_proof.advisor_name || 'Lion Advisor');
          setAdvisorDate(d.advisor_proof.consultation_date || '');
          setAdvisorMethod(d.advisor_proof.consultation_method || 'Email Consultation');
          setAdvisorNotes(d.advisor_proof.notes || '');
        }
      }
      setLoading(false);
    };
    loadReport();
  }, [id, getReport, fetchHosted]);

  // Handle Advisor Proof File Upload Preview
  const handleAdvisorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAdvisorProofFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setAdvisorProofPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setAdvisorProofPreview(null);
      }
    }
  };

  // Automatic Project Fetching for Selected Month
  const autoFetchedProjects = useMemo(() => {
    const targetMonth = parseInt(selectedMonth, 10);
    return hosted.filter((p) => {
      if (!p.date) return false;
      const projectLeoMonth = getLeoMonthFromDate(p.date);
      return projectLeoMonth === targetMonth;
    });
  }, [hosted, selectedMonth]);

  const totalBeneficiaries = useMemo(() => {
    return autoFetchedProjects.reduce((sum, p) => sum + (parseInt(p.beneficiaries || 0, 10) || 0), 0);
  }, [autoFetchedProjects]);

  const totalVolunteerHours = useMemo(() => {
    return autoFetchedProjects.reduce((sum, p) => sum + (parseInt(p.volunteerHours || 0, 10) || 0), 0);
  }, [autoFetchedProjects]);

  // Non-destructive intermediate saves
  const handleStepSave = async (stepNum: number, nextStep?: number) => {
    if (!id) return;
    setSaving(true);
    let payload = {};

    if (stepNum === 2) {
      payload = {
        meeting_date: gmDate,
        place: gmPlace,
        members_present: gmMembersCount,
        guests: gmGuests,
        minutes: gmMinutes,
      };
    } else if (stepNum === 3) {
      payload = {
        bm_date: bmDate,
        bm_place: bmPlace,
        bm_attendance: bmAttendance,
        bm_minutes: bmMinutes,
      };
    } else if (stepNum === 4) {
      payload = { special_meetings: specialMeetings };
    } else if (stepNum === 5) {
      payload = { events: eventsAttended };
    }

    await updateStep(id, stepNum, payload);
    setSaving(false);
    if (nextStep) setCurrentStep(nextStep);
  };

  // Final Step 6 Submit
  const handleFinalSubmit = async () => {
    if (!id) return;
    setSaving(true);
    const fd = new FormData();
    if (docFile) fd.append('support_doc', docFile);
    if (advisorProofFile) fd.append('advisor_proof_file', advisorProofFile);
    fd.append('advisor_proof_type', advisorProofType);
    fd.append('advisor_name', advisorName);
    fd.append('advisor_date', advisorDate);
    fd.append('advisor_method', advisorMethod);
    fd.append('advisor_notes', advisorNotes);
    fd.append('auto_projects_count', String(autoFetchedProjects.length));

    await updateStep(id, 6, fd);
    setSaving(false);
    notify('Activity Report successfully updated and resubmitted to district!', 'success');
    navigate('/activityReports');
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Loading Activity Report...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={`Edit ${getMonth(selectedMonth)} Activity Report`} subtitle="Modify or Add Documentation Non-Destructively">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/activityReports')}
            className="gap-2 text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Without Saving
          </Button>

          <Link to={`/viewReport/reportID=${id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-brand-600">
              <Eye className="w-3.5 h-3.5" /> View Current Report
            </Button>
          </Link>
        </div>

        {/* Wizard Progress (Allows non-destructive navigation back to any step, including Step 1) */}
        <Card className="p-6">
          <StepProgress
            steps={steps}
            currentStep={currentStep}
            onStepClick={(step) => {
              setCurrentStep(step);
            }}
          />
        </Card>

        {/* Step Panels */}
        <Card className="border-slate-200/90 shadow-md">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center justify-between">
              <span>Step 0{currentStep}: {steps[currentStep - 1].label}</span>
              <span className="text-xs font-normal text-slate-400">
                L/C {user.clubName || 'MyLeo Club'} • {getMonth(selectedMonth)}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: MONTH & AUTO-FETCHED PROJECTS */}
              {currentStep === 1 && (
                <motion.div
                  key="edit-step1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Reporting Month (Leoistic Calendar)
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                        <option key={m} value={m}>
                          Month {m}: {getMonth(m)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400">
                      You can return to this step anytime to verify the projects linked with this monthly report.
                    </p>
                  </div>

                  {/* AUTO-FETCHED PROJECTS */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        <h3 className="text-sm font-bold text-slate-800">
                          Auto-Fetched Projects for {getMonth(selectedMonth)}
                        </h3>
                      </div>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {autoFetchedProjects.length} Projects Completed in Month
                      </Badge>
                    </div>

                    {/* Metric Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                          <FolderKanban className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Projects</p>
                          <p className="text-base font-extrabold text-slate-800">{autoFetchedProjects.length}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Total Beneficiaries</p>
                          <p className="text-base font-extrabold text-emerald-700">{totalBeneficiaries.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Volunteer Hours</p>
                          <p className="text-base font-extrabold text-amber-700">{totalVolunteerHours.toLocaleString()} hrs</p>
                        </div>
                      </div>
                    </div>

                    {/* Project List */}
                    {autoFetchedProjects.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-center space-y-1.5 text-xs text-slate-400">
                        <p className="font-semibold text-slate-600">No completed projects found for {getMonth(selectedMonth)}.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {autoFetchedProjects.map((p, idx) => (
                          <div
                            key={p.id || idx}
                            className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-brand-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{p.name}</span>
                                {p.is_phase_project && (
                                  <Badge variant="outline" className="text-[10px] border-amber-300 bg-amber-50 text-amber-800 gap-1">
                                    <Layers className="w-2.5 h-2.5" /> {p.phase_name || 'Phased Project'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-500">
                                Date: <strong className="text-slate-700">{p.date}</strong> • Category: <strong className="text-slate-700">{p.category}</strong>
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 font-medium">
                              <span>👥 {p.beneficiaries || 0}</span>
                              <span>⏱️ {p.volunteerHours || 0} hrs</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button type="button" variant="brand" onClick={() => setCurrentStep(2)} className="gap-2">
                      <span>Next: General Meeting</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: GENERAL MEETING */}
              {currentStep === 2 && (
                <motion.div
                  key="edit-step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">General Meeting Date</label>
                      <Input type="date" value={gmDate} onChange={(e) => setGmDate(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Location / Venue</label>
                      <Input placeholder="e.g. Royal College Hall or Zoom" value={gmPlace} onChange={(e) => setGmPlace(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Members Present</label>
                      <Input type="number" placeholder="Count" value={gmMembersCount} onChange={(e) => setGmMembersCount(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Visiting Dignitaries / Guests</label>
                      <Input placeholder="Guest names and designations" value={gmGuests} onChange={(e) => setGmGuests(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">General Meeting Minutes / Highlights</label>
                    <textarea
                      rows={5}
                      value={gmMinutes}
                      onChange={(e) => setGmMinutes(e.target.value)}
                      placeholder="Record resolutions, agenda discussions, new member inductions..."
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-brand-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                    <Button variant="brand" onClick={() => handleStepSave(2, 3)} loading={saving} className="gap-2">
                      <span>Save & Next: Board Meeting</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: BOARD MEETING */}
              {currentStep === 3 && (
                <motion.div
                  key="edit-step3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Board Meeting Date</label>
                      <Input type="date" value={bmDate} onChange={(e) => setBmDate(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Board Attendance Count</label>
                      <Input type="number" placeholder="Directors present" value={bmAttendance} onChange={(e) => setBmAttendance(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Venue / Platform</label>
                    <Input placeholder="e.g. Club House or Google Meet" value={bmPlace} onChange={(e) => setBmPlace(e.target.value)} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Board Meeting Minutes</label>
                    <textarea
                      rows={5}
                      value={bmMinutes}
                      onChange={(e) => setBmMinutes(e.target.value)}
                      placeholder="Board decisions, financial approvals, project approvals..."
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-brand-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                    <Button variant="brand" onClick={() => handleStepSave(3, 4)} loading={saving} className="gap-2">
                      <span>Save & Next: Special Meetings</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: SPECIAL MEETINGS */}
              {currentStep === 4 && (
                <motion.div
                  key="edit-step4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase block">Add Committee / Special Meeting</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Meeting topic (e.g. Finance Committee)"
                        value={smDesc}
                        onChange={(e) => setSmDesc(e.target.value)}
                        className="sm:col-span-2"
                      />
                      <Input
                        type="date"
                        value={smDate}
                        onChange={(e) => setSmDate(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (smDesc.trim()) {
                          setSpecialMeetings([...specialMeetings, { desc: smDesc, date: smDate }]);
                          setSmDesc('');
                          setSmDate('');
                        }
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Special Meeting
                    </Button>

                    {specialMeetings.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {specialMeetings.map((sm, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-800">{sm.desc}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500">{sm.date}</span>
                              <button
                                onClick={() => setSpecialMeetings(specialMeetings.filter((_, idx) => idx !== i))}
                                className="text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-6 border-t border-slate-100">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
                    <Button variant="brand" onClick={() => handleStepSave(4, 5)} loading={saving} className="gap-2">
                      <span>Save & Next: Event Participation</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: EVENTS ATTENDED */}
              {currentStep === 5 && (
                <motion.div
                  key="edit-step5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase block">Participation in District & External Events</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Event name (e.g. Leo District Conference)"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                      <Input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Leos attended"
                        value={attendeeCount}
                        onChange={(e) => setAttendeeCount(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (eventName.trim()) {
                          setEventsAttended([...eventsAttended, { name: eventName, date: eventDate, count: attendeeCount }]);
                          setEventName('');
                          setEventDate('');
                          setAttendeeCount('');
                        }
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <Plus className="w-4 h-4" /> Add Event Record
                    </Button>

                    {eventsAttended.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {eventsAttended.map((ev, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-800">{ev.name} ({ev.count} attendees)</span>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500">{ev.date}</span>
                              <button
                                onClick={() => setEventsAttended(eventsAttended.filter((_, idx) => idx !== i))}
                                className="text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-6 border-t border-slate-100">
                    <Button variant="outline" onClick={() => setCurrentStep(4)}>Back</Button>
                    <Button variant="brand" onClick={() => handleStepSave(5, 6)} loading={saving} className="gap-2">
                      <span>Save & Next: Advisor Confirmation</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: ADVISOR CONFIRMATION & RESUBMISSION */}
              {currentStep === 6 && (
                <motion.div
                  key="edit-step6"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {/* LION ADVISOR CONSULTATION PROOF */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-brand-50/40 border border-amber-200/80 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Lion Advisor Consultation Confirmation
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      For clubs unable to obtain a physical signature from their Sponsoring Lions Club Advisor, you can upload a <strong>screenshot of the email or messaging consultation sent to your Advisor</strong> as official proof.
                    </p>

                    {/* Method Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setAdvisorProofType('email_screenshot')}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          advisorProofType === 'email_screenshot'
                            ? 'border-brand-500 bg-white shadow-sm ring-2 ring-brand-200'
                            : 'border-slate-200 bg-slate-50/80 hover:bg-white'
                        }`}
                      >
                        <Mail className={`w-5 h-5 mt-0.5 ${advisorProofType === 'email_screenshot' ? 'text-brand-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Email / Messaging Screenshot</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Upload screenshot of advisor consultation email</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdvisorProofType('physical_signature')}
                        className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          advisorProofType === 'physical_signature'
                            ? 'border-brand-500 bg-white shadow-sm ring-2 ring-brand-200'
                            : 'border-slate-200 bg-slate-50/80 hover:bg-white'
                        }`}
                      >
                        <FileCheck2 className={`w-5 h-5 mt-0.5 ${advisorProofType === 'physical_signature' ? 'text-brand-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Physical Signed Document</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Scanned document with Advisor's signature</p>
                        </div>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Lion Advisor Name & Title</label>
                        <Input
                          value={advisorName}
                          onChange={(e) => setAdvisorName(e.target.value)}
                          placeholder="e.g. Lion Sunethra Perera, PMJF"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Consultation Date</label>
                        <Input
                          type="date"
                          value={advisorDate}
                          onChange={(e) => setAdvisorDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">
                        {advisorProofType === 'email_screenshot' ? 'Upload Email Consultation Screenshot (PNG / JPG / PDF)' : 'Upload Signed PDF Document'}
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleAdvisorFileChange}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800"
                      />
                    </div>

                    {advisorProofPreview && (
                      <div className="p-3 bg-white rounded-xl border border-amber-200">
                        <p className="text-[11px] font-bold text-slate-500 mb-2">Screenshot Preview:</p>
                        <img
                          src={advisorProofPreview}
                          alt="Advisor Consultation Screenshot Preview"
                          className="max-h-44 rounded-lg object-contain border border-slate-200"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Advisor Feedback / Excerpt Notes</label>
                      <Input
                        value={advisorNotes}
                        onChange={(e) => setAdvisorNotes(e.target.value)}
                        placeholder="e.g. Reviewed minutes via email on Aug 10, approval granted."
                      />
                    </div>
                  </div>

                  {/* PDF MINUTES & ATTENDANCE DOCUMENT */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase block">Supporting Documents (PDF Minutes & Attendance)</label>
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
                      <Upload className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Attach Official Minutes or Signed Attendance PDF</p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => e.target.files && setDocFile(e.target.files[0])}
                        className="mt-3 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => setCurrentStep(5)}>Back</Button>
                    <Button variant="success" onClick={handleFinalSubmit} loading={saving} className="gap-2">
                      <Save className="w-4 h-4" />
                      <span>Save & Resubmit Activity Report</span>
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
