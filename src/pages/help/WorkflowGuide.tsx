// @ts-nocheck
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitCommit,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowUp,
  Shield,
  ShieldCheck,
  FileCheck2,
  Users2,
  Layers,
  Sparkles,
  Camera,
  AlertTriangle,
  Globe2,
  Download,
  Info,
  Building2,
  Landmark,
  Award,
  Check,
  Lock,
  Settings,
  UserCheck,
  Compass,
  Briefcase,
  Wallet,
  FileSpreadsheet,
  Network
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WorkflowGuide() {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'roles' | 'lifecycle' | 'isolation'>('hierarchy');

  const hierarchyLevels = [
    {
      level: 'Leo Multiple District',
      title: 'Leo Multiple District President (MDP)',
      scope: 'All Constituent Leo Districts (e.g. 306 A1, 306 B1, 306 C1)',
      badge: 'Tier 1 • Multiple Council',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Landmark,
      color: 'border-purple-200 bg-purple-50/40',
      responsibilities: [
        'Appoints Leo District Presidents, Multiple District VP, Secretary, Treasurer, and MD Chairperson',
        'Holds authority to create and charter new Leo Districts',
        'Reviews consolidated Project Reports, Activity Reports, and Wallet data across all Districts',
        'Grants access permissions to designated council officers and oversees MyLion international bridge',
      ],
    },
    {
      level: 'Leo District',
      title: 'Leo District President (DP)',
      scope: 'All Clubs within District Jurisdiction (e.g. District 306 A1)',
      badge: 'Tier 2 • District Cabinet',
      badgeColor: 'bg-brand-100 text-brand-800 border-brand-200',
      icon: Building2,
      color: 'border-brand-200 bg-brand-50/40',
      responsibilities: [
        'Appoints Leo Club Presidents, District VP, Secretary, Treasurer, Region Heads, Zone Heads, and District Chairperson',
        'Possesses permissions to create and charter new Leo Clubs',
        'Reviews approved Club Project Reports, Activity Reports, and Wallet data within district jurisdiction',
        'Configures whether Club Reports route through Region Chairpersons (Optional DP Preference)',
        'Formally reports approved reports and wallet data to the Leo Multiple District President',
      ],
    },
    {
      level: 'Region Chairperson / Coordinator',
      title: 'Region Chairperson (RC) / Coordinator',
      scope: 'Assigned Regional Clubs within District (e.g. Region 1: Millennium, Nawala Metro)',
      badge: 'Tier 3 • Regional Oversight (Optional)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Award,
      color: 'border-amber-200 bg-amber-50/40',
      isOptional: true,
      responsibilities: [
        'Appointed by the Leo District President to oversee a region comprising multiple Leo Clubs',
        'Reviews, approves, or rejects Project Reports and Activity Reports submitted by clubs in their region',
        'Approved reports are automatically forwarded to the Leo District President and designated officers',
        'Configurable: District President can toggle whether reports require RC review or route directly to DP',
        'Fallback: If RC is inactive or disabled, the Contest Director / DP handles direct approvals',
      ],
    },
    {
      level: 'Leo Club',
      title: 'Leo Club Executive & General Membership',
      scope: 'Individual Club Jurisdiction (e.g. Leo Club of Colombo Millennium)',
      badge: 'Tier 4 • Grassroots Execution',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Users2,
      color: 'border-emerald-200 bg-emerald-50/40',
      responsibilities: [
        'President: Full administrative authority over Projects, Activity Reports, Members, and Wallet; appoints officers',
        'Secretary: Creates and manages Project Reports, Activity Reports, and Member records; appoints VP, Treasurer, Advisor',
        'Treasurer: Creates and manages Project Reports; manages Club Wallet finances and double-entry ledger',
        'Leo Advisor: Provides constitutional consultation and validation proof (Signature or Email Screenshot)',
      ],
    },
  ];

  const roles = [
    {
      name: 'President (Club)',
      badge: 'Full Club Authority',
      variant: 'brand',
      icon: Briefcase,
      summary: 'Chief executive officer of the Leo Club with complete administrative oversight.',
      capabilities: [
        'Full administrative authority to create and manage Project Reports and Activity Reports',
        'Full management of Club Members and directory records',
        'Full authority to manage Club Wallet finances, bank balances, and double-entry ledger',
        'Authorized to appoint Club Vice President, Secretary, Treasurer, and Leo Advisor',
      ],
      restrictions: 'Restricted to home club jurisdiction; cannot access or modify other clubs.',
    },
    {
      name: 'Secretary (Club)',
      badge: 'Reports & Records Authority',
      variant: 'secondary',
      icon: FileSpreadsheet,
      summary: 'Chief communications and records officer responsible for projects, reports, and membership.',
      capabilities: [
        'Authorized to create, edit, and compile Project Reports and monthly Activity Reports',
        'Authorized to maintain and update Club Member records and membership statuses',
        'Has permission to appoint the Leo Club Vice President, Treasurer, and Leo Advisor',
      ],
      restrictions: 'Zero Wallet financial management authority. Wallet access is strictly restricted to President and Treasurer under MD 306 bylaws.',
    },
    {
      name: 'Treasurer (Club)',
      badge: 'Finance & Project Authority',
      variant: 'warning',
      icon: Wallet,
      summary: 'Chief financial officer managing the club treasury, bank balances, and project budgets.',
      capabilities: [
        'Authorized to create and manage Project Reports and project budget breakdowns',
        'Full administrative authority to manage Club Wallet, receipts, payments, and double-entry accounting',
        'Manages bank account balances (Service Account & Admin Account) and auto-reconciliation',
      ],
      restrictions: 'Cannot manage member records, cannot compile general activity reports, and cannot appoint club officers.',
    },
    {
      name: 'Region Chairperson / Coordinator',
      badge: 'Regional Evaluator (Optional)',
      variant: 'outline',
      icon: Award,
      summary: 'District cabinet officer overseeing clubs within an assigned geographic region.',
      capabilities: [
        'Appointed by Leo District President to oversee clubs in their assigned Region ID',
        'Reviews, approves, or rejects Project Reports and Activity Reports submitted by regional clubs',
        'Approved reports automatically forward to the Leo District President and designated evaluators',
        'Inspects beneficiary counts, volunteer hours, and categorized photographic evidence',
      ],
      restrictions: 'Data Isolation: Can only view and evaluate clubs in their assigned Region. Activation is at the discretion of the District President.',
    },
    {
      name: 'Leo District President (DP)',
      badge: 'District Governance',
      variant: 'success',
      icon: Building2,
      summary: 'Chief executive of the Leo District responsible for district administration and reporting to Multiple.',
      capabilities: [
        'Authorized to appoint Club Presidents, District VP, District Secretary, District Treasurer, Region Heads, Zone Heads, and District Chairperson',
        'Possesses full permissions to create and charter new Leo Clubs',
        'Reviews approved Club Project Reports, Activity Reports, and Wallet data across all district clubs',
        'Configures District Settings: Toggles whether reports route through Region Chairpersons (Optional)',
        'Responsible for formally reporting approved District data to the Leo Multiple District President',
      ],
      restrictions: 'Data Isolation: Cannot access or view clubs or reports belonging to other Leo Districts outside their jurisdiction.',
    },
    {
      name: 'Leo Multiple District President (MDP)',
      badge: 'Constitutional Head',
      variant: 'brand',
      icon: Landmark,
      summary: 'Supreme executive across all Leo Districts within Multiple District 306.',
      capabilities: [
        'Authorized to appoint Leo District Presidents, Multiple District VP, Secretary, Treasurer, and Chairperson',
        'Holds constitutional authority to create and charter new Leo Districts',
        'Reviews all shared and forwarded Project Reports, Activity Reports, and Wallet data across all Districts',
        'Grants access permissions to designated council users and triggers international MyLion sync',
      ],
      restrictions: 'Constitutional oversight; delegates operational district administration to respective District Presidents.',
    },
  ];

  const lifecycleStages = [
    {
      role: 'Club Secretary / President / Treasurer',
      stage: 'Phase 1: Club Project Compilation & Submission',
      badge: 'Draft / Submitted (Status 0/2)',
      badgeVariant: 'secondary',
      color: 'border-slate-300 bg-white',
      desc: 'Club organizers fill out the 6-step project wizard (Basics, Organizers with MyLCI validation, Objectives with Live Word Count, Contest Metrics, Dual-entry Budget, and 5–10 Categorized Photos with Captions). If the project is executed in stages, link to the Parent/Umbrella Project.',
      actions: [
        'Select Project Category, Date & Phase Link',
        'Enter Description (50–300 words recommended with live word count)',
        'Upload 5–10 Photos categorized into Cover, Beneficiaries, Attendance, Banner',
        'Add External Album (Google Drive/FB) & Social Media PR Links',
      ],
    },
    {
      role: 'Lion Advisor / Club Executive',
      stage: 'Phase 2: Consultation & Advisor Endorsement',
      badge: 'Endorsement',
      badgeVariant: 'outline',
      color: 'border-brand-200 bg-brand-50/30',
      desc: 'Verify that the activity was conducted in adherence to Lions/Leo constitutional bylaws. If a physical signature is unavailable, upload a clear screenshot of the consultation email sent to the Lion Club Advisor as valid proof of consultation.',
      actions: [
        'Attach Physical Signature or Email Screenshot Proof',
        'Confirm balanced income and expenditure budget breakdown',
        'Verify adherence to community service code of conduct',
      ],
    },
    {
      role: 'Region Chairperson (Optional: DP Preference)',
      stage: 'Phase 3: Regional Review & Evaluation',
      badge: 'Regional Review (Status 2)',
      badgeVariant: 'warning',
      color: 'border-amber-200 bg-amber-50/30',
      desc: 'When enabled by the District President, Region Chairpersons review, approve, or reject reports submitted by clubs within their assigned Region. Approved reports automatically forward to the Leo District President.',
      actions: [
        'Inspect photo categories: Cover, Beneficiary participation, Attendance',
        'Check submission timestamp against 15th District Deadline',
        'Approve or return with mandatory feedback notes if revisions are needed',
        'Bypass Note: If disabled by DP or if RC is inactive, Contest Director / DP conducts direct review',
      ],
    },
    {
      role: 'Leo District President (DP) & Cabinet',
      stage: 'Phase 4: District Sanction & Reporting to Multiple',
      badge: 'Approved (Status 3)',
      badgeVariant: 'success',
      color: 'border-emerald-200 bg-emerald-50/30',
      desc: 'The District President conducts final sanction for club project reports, activity reports, and wallet figures. Once sanctioned, reports are locked into the District Ledger and reported to the Leo Multiple District President.',
      actions: [
        'Final inclusion in District Monthly Activity Report',
        '1-Click reporting and forwarding to Leo Multiple District President',
        'Permanent inclusion in Club Wallet and Annual District Audit',
      ],
    },
    {
      role: 'Leo Multiple District President & MyLion Sync',
      stage: 'Phase 5: Multiple Oversight & International Bridge',
      badge: 'MyLion Sync',
      badgeVariant: 'brand',
      color: 'border-purple-200 bg-purple-50/30',
      desc: 'Multiple District President reviews cross-district consolidated reports and wallet data. Approved projects automatically bridge into the international Lions Clubs International (MyLion) platform as verified drafts for finalization.',
      actions: [
        'Cross-district evaluation for Multiple District Awards',
        'Auto-bridge report metrics to MyLion (LCI) Portal via technical integration',
        'Multi-district audit and transparency archiving',
      ],
    },
  ];

  return (
    <AppLayout
      pageTitle="Standardized Reporting & Governance Guide"
      subtitle="Official Leo Multiple District 306 Reporting Hierarchy, Role Capabilities, and Data Isolation Architecture"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-brand-800 via-brand-700 to-amber-600 text-white">
          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <Badge variant="warning" className="text-xs bg-amber-400 text-slate-900 border-none font-bold">
                  Constitutional Governance • MD 306
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Reporting Hierarchy, Roles & Data Isolation
                </h1>
                <p className="text-brand-100 text-sm leading-relaxed">
                  MYLEO implements a 4-tier reporting structure: <strong>Multiple District ↑ District ↑ Region Chairperson (Optional) ↑ Club</strong>.
                  Data Isolation is strictly enforced: clubs cannot view other clubs, and districts cannot inspect outside jurisdictions.
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0">
                🧭
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <Button
            variant={activeTab === 'hierarchy' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('hierarchy')}
            className="gap-2"
          >
            <Network className="w-4 h-4" />
            <span>Reporting Hierarchy</span>
          </Button>
          <Button
            variant={activeTab === 'roles' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('roles')}
            className="gap-2"
          >
            <Users2 className="w-4 h-4" />
            <span>Role Capabilities</span>
          </Button>
          <Button
            variant={activeTab === 'lifecycle' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('lifecycle')}
            className="gap-2"
          >
            <GitCommit className="w-4 h-4" />
            <span>5-Stage Approval Flow</span>
          </Button>
          <Button
            variant={activeTab === 'isolation' ? 'brand' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('isolation')}
            className="gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Data Isolation Policy</span>
          </Button>
        </div>

        {/* TAB 1: REPORTING HIERARCHY */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">4-Tier Governance & Reporting Hierarchy</h2>
                <p className="text-xs text-slate-500">Official chain of command and escalation flow within Leo Multiple District 306</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                MD ↑ District ↑ RC (Optional) ↑ Club
              </Badge>
            </div>

            <div className="space-y-4">
              {hierarchyLevels.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="relative">
                    {idx < hierarchyLevels.length - 1 && (
                      <div className="absolute left-6 -bottom-5 z-0 flex items-center justify-center">
                        <div className="w-0.5 h-6 bg-slate-300" />
                        <ArrowUp className="w-3.5 h-3.5 text-slate-400 absolute -top-1" />
                      </div>
                    )}
                    <Card className={`border shadow-xs ${item.color} relative z-10`}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-700 shadow-xs shrink-0">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-bold text-slate-900">{item.level}</CardTitle>
                              <CardDescription className="text-xs font-semibold text-slate-600">
                                {item.title} &bull; <span className="font-normal text-slate-500">{item.scope}</span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.isOptional && (
                              <Badge variant="warning" className="text-[11px] font-bold">
                                Optional: DP Preference
                              </Badge>
                            )}
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                          {item.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Optional RC Flow Note */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3.5 text-xs">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm">Key Architectural Rule: Region Chairperson Routing is Optional</p>
                <p className="leading-relaxed text-amber-800">
                  Routing reports to the Region Chairperson (RC) is <strong>optional and depends on the District President&apos;s preference</strong>.
                  The District President can toggle this in <em>District Settings</em>. If enabled, club reports route through the RC before reaching the District President. If disabled or if the RC is inactive, reports route directly to the Leo District President / Contest Director.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROLE CAPABILITIES */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Role Responsibilities & Capabilities</h2>
              <p className="text-xs text-slate-500">Explicit authority matrix across Club, Regional, District, and Multiple levels</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {roles.map((r, idx) => {
                const Icon = r.icon;
                return (
                  <Card key={idx} className="flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-base font-bold text-slate-900">{r.name}</CardTitle>
                          </div>
                          <Badge variant={r.variant as any}>{r.badge}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{r.summary}</p>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Authorized Capabilities:
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {r.capabilities.map((cap, cIdx) => (
                              <li key={cIdx} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{cap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-3 m-6 mt-0 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Boundary:</strong> {r.restrictions}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: 5-STAGE APPROVAL LIFECYCLE */}
        {activeTab === 'lifecycle' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">5-Stage Project Approval Workflow</h2>
                <p className="text-xs text-slate-500">Visual mapping of report progression from grassroots compilation to international MyLion push</p>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                5 Standardized Phases
              </Badge>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {lifecycleStages.map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className="relative"
                >
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center text-brand-600 font-bold text-xs shadow-xs">
                    {idx + 1}
                  </div>

                  <Card className={`border shadow-xs ${s.color}`}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            {s.role}
                          </span>
                          <CardTitle className="text-base font-bold text-slate-900">{s.stage}</CardTitle>
                        </div>
                        <Badge variant={s.badgeVariant as any}>{s.badge}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100/80">
                        {s.actions.map((act, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DATA ISOLATION POLICY */}
        {activeTab === 'isolation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Constitutional Data Isolation Architecture</h2>
              <p className="text-xs text-slate-500">Security and privacy boundaries enforced across clubs, regions, and districts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Club Data Isolation */}
              <Card className="border-emerald-200 bg-emerald-50/20">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">Leo Club Isolation</CardTitle>
                      <CardDescription>Strict peer-to-peer data segregation</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    <strong>Rule:</strong> Leo Clubs cannot access or view Project Reports, Activity Reports, Member records, or Wallet financial data belonging to other Leo Clubs.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Zero Peer Club Visibility</span>
                    </div>
                    <p className="text-slate-600">
                      When a Club President or Secretary logs in, all query scopes are locked to <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-700 font-mono">user.clubId</code>. No club can inspect another club&apos;s financial ledger, member contact info, or unpublished project drafts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* District Jurisdiction Isolation */}
              <Card className="border-brand-200 bg-brand-50/20">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-800 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">District Jurisdiction Isolation</CardTitle>
                      <CardDescription>Territorial autonomy across districts</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    <strong>Rule:</strong> Leo Districts cannot access or view Project Reports, Activity Reports, Member records, or Wallet data belonging to Leo Clubs outside their jurisdiction.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-brand-100 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Check className="w-4 h-4 text-brand-600" />
                      <span>Strict Boundary Enforcement</span>
                    </div>
                    <p className="text-slate-600">
                      A Leo District President for District 306 A1 can only review clubs whose <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-700 font-mono">district_id === &apos;306 A1&apos;</code>. Clubs belonging to District 306 B1 or 306 C1 are strictly isolated.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Regional Scope Isolation */}
              <Card className="border-amber-200 bg-amber-50/20">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">Region Chairperson Scoping</CardTitle>
                      <CardDescription>Zone and region constrained evaluations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    <strong>Rule:</strong> Region Chairpersons only have review authority over clubs assigned to their specific Region ID within their District.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-amber-100 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Check className="w-4 h-4 text-amber-600" />
                      <span>Regional Containment</span>
                    </div>
                    <p className="text-slate-600">
                      Region 1 Chairperson sees Colombo Millennium and Nawala Metro, but is isolated from Region 2 (Negombo Orient) and external districts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Multiple District Transparency */}
              <Card className="border-purple-200 bg-purple-50/20">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">Multiple District Oversight</CardTitle>
                      <CardDescription>Consolidated reporting from sanctioned District submissions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    <strong>Rule:</strong> Leo Multiple District President reviews reports and wallet data explicitly reported and forwarded by Leo District Presidents.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-purple-100 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Check className="w-4 h-4 text-purple-600" />
                      <span>Sanctioned Upward Pipeline</span>
                    </div>
                    <p className="text-slate-600">
                      District Presidents review and formally forward vetted project reports and wallet summaries upward to the Multiple District Council for multiple awards and international MyLion synchronization.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Standardized Rules & Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
          {/* Card 1: Deadlines & Late Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Clock className="w-5 h-5 text-amber-500" />
                Deadlines & Late Submission Policy
              </CardTitle>
              <CardDescription>Strict compliance rules for Leoistic monthly reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs">District Deadline</span>
                  <Badge variant="warning">15th of following month</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Configurable in District Settings: July activities must be submitted by August 15th at 23:59.
                </p>
              </div>

              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs">MyLion International Deadline</span>
                  <Badge variant="brand">28th of following month</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Global portal batch synchronization window.
                </p>
              </div>

              <div className="flex items-start gap-2 pt-1 text-xs text-slate-500">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Reports received after the 15th will automatically be stamped with a <strong>&quot;Late Submission (X days)&quot;</strong> badge visible to District Evaluators and the Contest Director.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Photo & PR Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Camera className="w-5 h-5 text-brand-500" />
                Media & PR Quality Standards
              </CardTitle>
              <CardDescription>Guidelines to expedite district verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span><strong>Limit 5–10 Photos per Project:</strong> Bulk selection implemented; prevents server bloat and keeps evaluation turnaround fast.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span><strong>Categorization Required:</strong> Designate photos as Cover, Beneficiaries, Attendance Sheet, or Banner.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span><strong>Descriptive Captions:</strong> Each uploaded photo allows a brief explanatory caption before saving.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span><strong>External Cloud & Social Links:</strong> Fields for Google Drive/Facebook albums and PR handles (Instagram, LinkedIn).</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Multi-Phase & MyLion Sync Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Multi-Phase Project Linking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Layers className="w-5 h-5 text-emerald-600" />
                Multi-Phase Project Linking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p>
                When conducting large service programs executed across multiple installments (e.g. <em>Project Heal the Nation - Phase 1, 2 & 3</em>):
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-700">
                <li>Create the <strong>Main Project</strong> first (or choose an existing parent activity).</li>
                <li>When submitting subsequent installments, check <strong>&quot;Is this part of a multi-phase project?&quot;</strong>.</li>
                <li>Select the parent project and input the phase title.</li>
                <li>All linked phase reports will automatically aggregate beneficiaries and budgets under the umbrella initiative!</li>
              </ol>
            </CardContent>
          </Card>

          {/* MyLion Integration Bridge */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                <Globe2 className="w-5 h-5 text-brand-600" />
                MyLion (International Portal) Sync
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p>
                In alignment with Lions Clubs International (via technical coordination with Akshaya & the LCI leads), MYLEO connects district activities directly to MyLion:
              </p>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                  <span>Approved club projects trigger a push to MyLion API endpoints.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                  <span>Activities initially populate as <strong>MyLion Drafts</strong>, allowing two-step validation.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
                  <span>Eliminates dual-reporting burden for club secretaries.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
