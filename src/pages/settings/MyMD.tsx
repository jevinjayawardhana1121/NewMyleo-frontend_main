// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import { notify } from '@/lib/api';
import { multipleDistrictApi } from '@/lib/backendService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Globe2,
  Building2,
  ShieldCheck,
  Plus,
  UserPlus,
  Users2,
  FileSpreadsheet,
  FolderKanban,
  Wallet2,
  Eye,
  CheckCircle2,
  Share2
} from 'lucide-react';

export default function MyMD() {
  const user = useUserStore();
  const settings = useSettingsStore();

  // Create District Modal State
  const [createDistrictOpen, setCreateDistrictOpen] = useState(false);
  const [newDistrictId, setNewDistrictId] = useState('');
  const [newDistrictArea, setNewDistrictArea] = useState('');
  const [newDistrictPresident, setNewDistrictPresident] = useState('');

  // Appoint MD Officer Modal State
  const [appointModalOpen, setAppointModalOpen] = useState(false);
  const [appointRole, setAppointRole] = useState('Leo District President');
  const [appointOfficerName, setAppointOfficerName] = useState('');
  const [appointOfficerLeoId, setAppointOfficerLeoId] = useState('');
  const [appointTargetDistrict, setAppointTargetDistrict] = useState('District 306 A1');

  // Handle Create District (MDP Permission)
  const handleCreateDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictId.trim()) {
      notify('Please enter a district identifier (e.g. 306 D1)', 'warning');
      return;
    }

    const cleanId = newDistrictId.trim();
    const sortOrder = parseInt(cleanId.replace(/\D/g, ''), 10) || 7;

    // Real Laravel backend call: POST api/districts
    await multipleDistrictApi.createDistrict({
      name: `District ${cleanId}`,
      sort_order: sortOrder,
      email: `d${cleanId.replace(/\s+/g, '').toLowerCase()}@leomd306.org`,
      website: `https://${cleanId.replace(/\s+/g, '').toLowerCase()}.leomd306.org`,
      dcl_name: newDistrictPresident.trim() || 'Charter District Chairperson',
    });

    const created = settings.addDistrict({
      id: cleanId,
      name: `District ${cleanId}`,
      geographicArea: newDistrictArea.trim() || 'Territorial Jurisdiction',
      districtPresidentName: newDistrictPresident.trim() || 'Charter District President',
    });

    setCreateDistrictOpen(false);
    setNewDistrictId('');
    setNewDistrictArea('');
    setNewDistrictPresident('');
    notify(`Leo District ${created.id} chartered successfully under Multiple District 306!`, 'success');
  };

  // Handle Appoint MD Officer (MDP Permission)
  const handleAppointMDOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointOfficerName.trim()) {
      notify('Please enter officer name', 'warning');
      return;
    }

    // Real Laravel backend call: POST api/multiple-district/assign-role
    await multipleDistrictApi.assignRole({
      user_id: parseInt(appointOfficerLeoId, 10) || 4,
      role_name: appointRole.replace(/^Leo\s+|Club\s+|District\s+|Multiple\s+/i, '').trim() || appointRole,
    });

    settings.appointOfficer({
      level: 'Multiple',
      targetEntityId: 'MD 306',
      targetEntityName: appointTargetDistrict,
      role: appointRole,
      officerName: appointOfficerName.trim(),
      officerLeoId: appointOfficerLeoId.trim() || '306900',
      appointedBy: 'Leo Multiple District President',
    });

    setAppointModalOpen(false);
    setAppointOfficerName('');
    setAppointOfficerLeoId('');
    notify(`Officially appointed ${appointOfficerName} as ${appointRole}!`, 'success');
  };

  const mdAppointments = settings.officerAppointments.filter((a) => a.level === 'Multiple');

  return (
    <AppLayout
      pageTitle="Multiple District 306"
      subtitle="Leo Multiple District 306 Council • Sri Lanka & Republic of Maldives"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner Card */}
        <Card className="overflow-hidden shadow-sm">
          <div className="h-36 bg-gradient-to-r from-purple-950 via-brand-800 to-amber-600" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-2 flex items-center justify-center text-3xl -mt-12">
                  🦁
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">Leo Multiple District 306</h1>
                  <p className="text-xs text-slate-500">Apex Council of Leos in Sri Lanka & Maldives</p>
                </div>
              </div>

              {user.isMdp && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="brand"
                    size="sm"
                    onClick={() => setCreateDistrictOpen(true)}
                    className="gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Create New District
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppointModalOpen(true)}
                    className="gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Appoint District Leaders
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Constituent Districts</span>
                <span className="font-bold text-slate-800 text-sm">{settings.districts.length} Leo Districts</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Total Clubs Enrolled</span>
                <span className="font-bold text-slate-800 text-sm">{settings.clubs.length}+ Clubs</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Shared Reports Forwarded</span>
                <span className="font-bold text-slate-800 text-sm">{settings.forwardedReportsToMD.length} Reports</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multiple District President Overview & Delegation Notice */}
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-purple-900">
          <div className="flex items-start gap-3">
            <Share2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Multiple District Governance & Cross-District Transparency</p>
              <p className="mt-0.5 text-purple-700 leading-relaxed">
                The Leo Multiple District President holds constitutional authority to review all shared Project Reports, Activity Reports, and Wallet data reported by Leo District Presidents across constituent districts, and grant viewing permissions to designated multiple officers.
              </p>
            </div>
          </div>
          <Link to="/shared-reports">
            <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0 border-purple-300 text-purple-900 hover:bg-purple-100">
              <Eye className="w-4 h-4" /> Review Shared Reports
            </Button>
          </Link>
        </div>

        {/* 1. CONSTITUENT DISTRICTS LIST (MDP PERMISSION TO CREATE NEW DISTRICTS) */}
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Constituent Leo Districts ({settings.districts.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Multiple District President holds authorization to create new districts and appoint District Presidents.
              </CardDescription>
            </div>
            {user.isMdp && (
              <Button size="sm" variant="brand" onClick={() => setCreateDistrictOpen(true)} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> New District
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.districts.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                    <Badge variant="brand" className="text-[10px] bg-purple-100 text-purple-800 border-purple-200">
                      Constituent
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Territory: <strong className="text-slate-700">{d.geographicArea}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Leader: <strong className="text-slate-700">{d.districtPresidentName}</strong>
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                    <span>Charter: {d.charterDate}</span>
                    <span>{d.totalClubs || 15}+ Clubs</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2. OFFICIAL APPOINTMENTS BY MULTIPLE DISTRICT PRESIDENT */}
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Multiple District Council Appointments
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Multiple District President appoints Leo District Presidents, MD VP, Secretary, Treasurer, and Chairperson.
              </CardDescription>
            </div>
            {user.isMdp && (
              <Button size="sm" variant="outline" onClick={() => setAppointModalOpen(true)} className="gap-1.5 text-xs">
                <UserPlus className="w-3.5 h-3.5" /> Appoint Leader
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {mdAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No Multiple District appointments recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {mdAppointments.map((apt) => (
                  <div key={apt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{apt.officerName}</span>
                        <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-800 bg-purple-50">
                          {apt.role}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Jurisdiction: <strong className="text-slate-600">{apt.targetEntityName}</strong> • MyLCI: {apt.officerLeoId}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-400">
                      <span>Appointed by: {apt.appointedBy}</span>
                      <span className="block">{apt.appointedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CREATE NEW LEO DISTRICT MODAL (Multiple District President Permission) */}
      <Dialog open={createDistrictOpen} onOpenChange={setCreateDistrictOpen}>
        <DialogHeader>
          <DialogTitle>Charter New Leo District</DialogTitle>
          <DialogDescription>
            As Leo Multiple District President, you hold authority to charter new constituent Leo Districts under MD 306.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateDistrict} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">District Identifier</label>
            <Input
              placeholder="e.g. 306 D1 or 306 A3"
              value={newDistrictId}
              onChange={(e) => setNewDistrictId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Geographic Territory / Area</label>
            <Input
              placeholder="e.g. Northern Province & Jaffna Peninsula"
              value={newDistrictArea}
              onChange={(e) => setNewDistrictArea(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Charter District President Appointee</label>
            <Input
              placeholder="e.g. Leo Thilshan Ramanathan"
              value={newDistrictPresident}
              onChange={(e) => setNewDistrictPresident(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button variant="outline" type="button" onClick={() => setCreateDistrictOpen(false)}>Cancel</Button>
            <Button variant="brand" type="submit">Charter Leo District</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* APPOINT MD LEADER MODAL (Multiple District President Permission) */}
      <Dialog open={appointModalOpen} onOpenChange={setAppointModalOpen}>
        <DialogHeader>
          <DialogTitle>Appoint Multiple District Leader</DialogTitle>
          <DialogDescription>
            Multiple District President can appoint Leo District Presidents and executive cabinet officers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAppointMDOfficer} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Select Role</label>
            <select
              value={appointRole}
              onChange={(e) => setAppointRole(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
            >
              <option value="Leo District President">Leo District President</option>
              <option value="Multiple District Vice President">Multiple District Vice President</option>
              <option value="Multiple District Secretary">Multiple District Secretary</option>
              <option value="Multiple District Treasurer">Multiple District Treasurer</option>
              <option value="Multiple District Leo Chairperson">Multiple District Leo Chairperson</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Target District / Council</label>
            <Input
              placeholder="e.g. District 306 A1 or Multiple District Cabinet"
              value={appointTargetDistrict}
              onChange={(e) => setAppointTargetDistrict(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Appointee Officer Full Name</label>
            <Input
              placeholder="e.g. Leo Janith Bandara"
              value={appointOfficerName}
              onChange={(e) => setAppointOfficerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Leo ID / MyLCI Number</label>
            <Input
              placeholder="e.g. 4892999"
              value={appointOfficerLeoId}
              onChange={(e) => setAppointOfficerLeoId(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button variant="outline" type="button" onClick={() => setAppointModalOpen(false)}>Cancel</Button>
            <Button variant="brand" type="submit">Confirm Appointment</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </AppLayout>
  );
}
