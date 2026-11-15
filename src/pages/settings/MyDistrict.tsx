// @ts-nocheck
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import { notify } from '@/lib/api';
import { districtsApi } from '@/lib/backendService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Save,
  Globe2,
  AlertTriangle,
  Plus,
  Users2,
  UserPlus,
  Send,
  Lock,
  Layers,
  MapPin,
  CheckCircle2,
  FileCheck2
} from 'lucide-react';

export default function MyDistrict() {
  const { id } = useParams<{ id?: string }>();
  const user = useUserStore();
  const settings = useSettingsStore();

  const districtName = id ? `District ${id}` : user.districtName || 'District 306 A1';
  const targetDistrictId = user.districtId || '306 A1';

  // Configurable Deadlines Local State
  const [districtDay, setDistrictDay] = useState(settings.districtDeadlineDay);
  const [intlDay, setIntlDay] = useState(settings.internationalDeadlineDay);

  // Create Club Modal State
  const [createClubOpen, setCreateClubOpen] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubRegion, setNewClubRegion] = useState('1');
  const [newClubZone, setNewClubZone] = useState('1');
  const [newClubSponsor, setNewClubSponsor] = useState('');
  const [newClubPresident, setNewClubPresident] = useState('');

  // Appointment Modal State
  const [appointModalOpen, setAppointModalOpen] = useState(false);
  const [appointRole, setAppointRole] = useState('Leo Club President');
  const [appointOfficerName, setAppointOfficerName] = useState('');
  const [appointOfficerLeoId, setAppointOfficerLeoId] = useState('');
  const [appointTargetEntity, setAppointTargetEntity] = useState('Colombo Millennium');

  const handleSaveDeadlines = (e: React.FormEvent) => {
    e.preventDefault();
    const dDay = parseInt(districtDay, 10);
    const iDay = parseInt(intlDay, 10);

    if (isNaN(dDay) || dDay < 1 || dDay > 31) {
      notify('Please enter a valid district deadline day between 1 and 31', 'error');
      return;
    }
    if (isNaN(iDay) || iDay < 1 || iDay > 31) {
      notify('Please enter a valid international deadline day between 1 and 31', 'error');
      return;
    }

    settings.setDistrictDeadlineDay(dDay);
    settings.setInternationalDeadlineDay(iDay);
    notify('District and International reporting deadlines updated successfully!', 'success');
  };

  // Preference Toggle: Route via Region Chairperson
  const handleToggleRCPreference = async (checked: boolean) => {
    settings.setEnableRegionChairpersonApproval(checked);
    // Real Laravel backend call: PUT api/districts/:district_id
    await districtsApi.updateDistrict(targetDistrictId, {
      is_report_region_chairman_review_required: checked,
    });
    notify(
      checked
        ? 'Reporting flow updated: Club reports will route to Region Chairpersons (RC) for initial review.'
        : 'Reporting flow updated: Region Chairperson review disabled. Club reports will route directly to the District President.',
      'info'
    );
  };

  const handleToggleContestDirector = (checked: boolean) => {
    settings.setRdInactiveFallbackContestDirector(checked);
    notify(
      checked
        ? 'Contest Director fallback approval enabled for inactive Region Chairpersons'
        : 'Contest Director fallback disabled',
      'info'
    );
  };

  const handleToggleRDActiveStatus = (active: boolean) => {
    settings.setIsRDActive(active);
    notify(
      active
        ? 'Region Chairperson status marked as ACTIVE'
        : 'Region Chairperson status marked as INACTIVE (Contest Director fallback activated)',
      'warning'
    );
  };

  // Handle Create Club (District President Permission)
  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) {
      notify('Please enter a valid Club Name', 'warning');
      return;
    }

    // Real Laravel backend call: POST api/districts/:district_id/clubs
    await districtsApi.createClub(targetDistrictId, {
      name: newClubName.trim(),
      club_region: `Region ${newClubRegion}`,
      club_type: 'Omega',
      is_active: true,
      districts_id: Number(targetDistrictId) || 1,
    });

    const created = settings.addClub({
      name: newClubName.trim(),
      districtId: targetDistrictId,
      districtName: districtName,
      regionId: newClubRegion,
      zoneId: newClubZone,
      sponsorLionsClub: newClubSponsor || 'Sponsoring Lions Club',
      presidentName: newClubPresident || 'Charter President',
      activeMembers: 20,
    });

    setCreateClubOpen(false);
    setNewClubName('');
    setNewClubSponsor('');
    setNewClubPresident('');
    notify(`Leo Club of ${created.name} successfully chartered and added to ${districtName}!`, 'success');
  };

  // Handle Leader Appointment (District President Permission)
  const handleAppointLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointOfficerName.trim()) {
      notify('Please enter officer name', 'warning');
      return;
    }

    // Real Laravel backend call: POST api/districts/:district_id/assign-role
    await districtsApi.assignRole(targetDistrictId, {
      user_id: parseInt(appointOfficerLeoId, 10) || 5,
      role_name: appointRole.replace(/^Leo\s+|Club\s+|District\s+/i, '').trim() || appointRole,
    });

    settings.appointOfficer({
      level: 'District',
      targetEntityId: targetDistrictId,
      targetEntityName: appointTargetEntity,
      role: appointRole,
      officerName: appointOfficerName.trim(),
      officerLeoId: appointOfficerLeoId.trim() || '306000',
      appointedBy: `Leo District President (${districtName})`,
    });

    setAppointModalOpen(false);
    setAppointOfficerName('');
    setAppointOfficerLeoId('');
    notify(`Officially appointed ${appointOfficerName} as ${appointRole}!`, 'success');
  };

  // Filter clubs belonging strictly to this district jurisdiction
  const districtClubs = settings.clubs.filter(
    (c) => (c.districtId || '306 A1') === targetDistrictId
  );

  // Filter appointments for this district
  const districtAppointments = settings.officerAppointments.filter(
    (a) => a.level === 'District' || a.targetEntityId === targetDistrictId
  );

  return (
    <AppLayout pageTitle={`Leo District ${districtName}`} subtitle="District Administration, Leadership & Jurisdiction">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* District Banner Card */}
        <Card className="overflow-hidden shadow-sm">
          <div className="h-32 bg-gradient-to-r from-slate-900 via-brand-800 to-brand-600" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-2 flex items-center justify-center text-3xl -mt-12">
                  🦁
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">{districtName}</h1>
                  <p className="text-xs text-slate-500">Under Lions Multiple District 306 Sri Lanka & Maldives</p>
                </div>
              </div>

              {user.isDp && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="brand"
                    size="sm"
                    onClick={() => setCreateClubOpen(true)}
                    className="gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Create New Leo Club
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAppointModalOpen(true)}
                    className="gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Appoint Officers
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Constituent Clubs</span>
                <span className="font-bold text-slate-800 text-sm">{districtClubs.length} Active Clubs</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Jurisdiction</span>
                <span className="font-bold text-slate-800 text-sm">District 306 A1 (Isolated)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Affiliation</span>
                <span className="font-bold text-slate-800 text-sm">Leo Multiple District 306</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. REPORTING FLOW & REGION CHAIRPERSON SETTING */}
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Reporting Flow: Region Chairperson (RC) Approval Setting
                </CardTitle>
              </div>
              <Badge
                variant={settings.enableRegionChairpersonApproval ? 'success' : 'secondary'}
                className="text-xs font-semibold"
              >
                {settings.enableRegionChairpersonApproval ? 'RC Approval Required (Active)' : 'Direct DP Review (RC Bypassed)'}
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              District President preference: Decide whether club project and activity reports route through Region Chairpersons before reaching the District President.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {/* Visual Flow Indicator */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <p className="font-bold text-slate-800 mb-2">Active Hierarchy Flow:</p>
              <div className="flex flex-wrap items-center gap-2 text-slate-700">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold">Leo Club</span>
                <span>→</span>
                {settings.enableRegionChairpersonApproval ? (
                  <>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                      Region Chairperson (RC)
                    </span>
                    <span>→</span>
                  </>
                ) : (
                  <span className="text-slate-400 line-through text-[11px]">(RC Bypassed)</span>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-800 font-bold">
                  Leo District President (DP)
                </span>
                <span>→</span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-bold">
                  Leo Multiple District President (MDP)
                </span>
              </div>
            </div>

            {/* Toggle 1: Route through Region Chairperson */}
            <div className="flex items-start justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1 pr-4">
                <p className="text-sm font-bold text-slate-800">
                  Route Club Reports through Region Chairperson (RC)
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Giving project and activity report evaluation to the Region Chairperson is optional. When enabled, club reports are submitted to Region Chairpersons for regional verification before forwarding to the District President.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={settings.enableRegionChairpersonApproval}
                  onChange={(e) => handleToggleRCPreference(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>

            {/* Fallback to Contest Director */}
            <div className="flex items-start justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1 pr-4">
                <p className="text-sm font-bold text-slate-800">
                  Contest Director Fallback if Region Chairperson is Inactive
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  If an assigned Region Chairperson is inactive or unavailable, Contest Director automatically receives review permissions to prevent club submission delays.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={settings.rdInactiveFallbackContestDirector}
                  onChange={(e) => handleToggleContestDirector(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>

            {/* Region Chairperson Status Simulator */}
            <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-amber-900">Region Chairperson Status Simulator</p>
                <p className="text-amber-800 text-[11px]">Test fallback routing when Region Chairperson is inactive.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={settings.isRDActive ? 'success' : 'outline'}
                  onClick={() => handleToggleRDActiveStatus(true)}
                  className="text-xs h-8"
                >
                  <UserCheck className="w-3.5 h-3.5 mr-1" /> RC Active
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!settings.isRDActive ? 'destructive' : 'outline'}
                  onClick={() => handleToggleRDActiveStatus(false)}
                  className="text-xs h-8"
                >
                  <UserX className="w-3.5 h-3.5 mr-1" /> RC Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. CONSTITUENT CLUBS UNDER JURISDICTION (DATA ISOLATION) */}
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Clubs within Jurisdiction ({districtClubs.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Clubs outside {districtName} cannot be viewed or accessed under Data Isolation bylaws.
              </CardDescription>
            </div>
            {user.isDp && (
              <Button size="sm" variant="outline" onClick={() => setCreateClubOpen(true)} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Charter Club
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {districtClubs.map((club) => (
                <div key={club.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{club.name}</span>
                    <Badge variant="brand" className="text-[10px]">Region {club.regionId}</Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Sponsor: <strong className="text-slate-700">{club.sponsorLionsClub}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    President: <strong className="text-slate-700">{club.presidentName}</strong>
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                    <span>👥 {club.activeMembers} Members</span>
                    <span>Zone {club.zoneId}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. APPOINTED LEADERS BY DISTRICT PRESIDENT */}
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Official Appointments by District President
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                District President appoints Club Presidents, District VP, Secretary, Treasurer, Region Heads, Zone Heads, and District Chairperson.
              </CardDescription>
            </div>
            {user.isDp && (
              <Button size="sm" variant="brand" onClick={() => setAppointModalOpen(true)} className="gap-1.5 text-xs">
                <UserPlus className="w-3.5 h-3.5" /> Appoint Leader
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {districtAppointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No official appointments recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {districtAppointments.map((apt) => (
                  <div key={apt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{apt.officerName}</span>
                        <Badge variant="outline" className="text-[10px]">{apt.role}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Assigned to: <strong className="text-slate-600">{apt.targetEntityName}</strong> • MyLCI: {apt.officerLeoId}
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

        {/* 4. CONFIGURABLE DEADLINES SETTINGS */}
        <Card className="border-slate-200/90 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Configurable Reporting Deadlines
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Configure dynamic district and international submission deadlines without hard-coded calendar dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSaveDeadlines} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    District Report Deadline (Day of Month)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={districtDay}
                    onChange={(e) => setDistrictDay(e.target.value)}
                    placeholder="e.g. 15"
                  />
                  <p className="text-[11px] text-slate-400">
                    Standard is the <strong>15th</strong> of the following calendar month (e.g. Month 1 July due August 15).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
                    International MyLion Deadline (Day of Month)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={intlDay}
                    onChange={(e) => setIntlDay(e.target.value)}
                    placeholder="e.g. 28"
                  />
                  <p className="text-[11px] text-slate-400">
                    Lions Clubs International (LCI) portal deadline, typically the <strong>28th</strong> of each month.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="brand" size="sm" className="gap-2">
                  <Save className="w-4 h-4" /> Save Deadlines
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* CREATE NEW LEO CLUB MODAL (District President Permission) */}
      <Dialog open={createClubOpen} onOpenChange={setCreateClubOpen}>
        <DialogHeader>
          <DialogTitle>Charter New Leo Club</DialogTitle>
          <DialogDescription>
            As Leo District President, you have authorization to charter and register new Leo Clubs within {districtName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateClub} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Club Name</label>
            <Input
              placeholder="e.g. Colombo Metro Apex"
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase">Region</label>
              <select
                value={newClubRegion}
                onChange={(e) => setNewClubRegion(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs"
              >
                <option value="1">Region 1</option>
                <option value="2">Region 2</option>
                <option value="3">Region 3</option>
                <option value="4">Region 4</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase">Zone</label>
              <select
                value={newClubZone}
                onChange={(e) => setNewClubZone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs"
              >
                <option value="1">Zone 1</option>
                <option value="2">Zone 2</option>
                <option value="3">Zone 3</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Sponsoring Lions Club</label>
            <Input
              placeholder="e.g. Lions Club of Colombo Central"
              value={newClubSponsor}
              onChange={(e) => setNewClubSponsor(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Charter Club President</label>
            <Input
              placeholder="e.g. Leo Kavishka Weerasinghe"
              value={newClubPresident}
              onChange={(e) => setNewClubPresident(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button variant="outline" type="button" onClick={() => setCreateClubOpen(false)}>Cancel</Button>
            <Button variant="brand" type="submit">Charter Leo Club</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* APPOINT OFFICER MODAL (District President Permission) */}
      <Dialog open={appointModalOpen} onOpenChange={setAppointModalOpen}>
        <DialogHeader>
          <DialogTitle>Appoint District / Club Leader</DialogTitle>
          <DialogDescription>
            Appoint a qualified Leo to serve as Club President, District Officer, Region Head, or Zone Head.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAppointLeader} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Select Role</label>
            <select
              value={appointRole}
              onChange={(e) => setAppointRole(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
            >
              <option value="Leo Club President">Leo Club President</option>
              <option value="Region Chairperson">Region Chairperson / Head</option>
              <option value="Zone Head">Zone Head</option>
              <option value="District Vice President">District Vice President</option>
              <option value="District Secretary">District Secretary</option>
              <option value="District Treasurer">District Treasurer</option>
              <option value="District Leo Chairperson">District Leo Chairperson</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Target Club / Region</label>
            <Input
              placeholder="e.g. Colombo Millennium or Region 1"
              value={appointTargetEntity}
              onChange={(e) => setAppointTargetEntity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Appointee Officer Full Name</label>
            <Input
              placeholder="e.g. Leo Devin Perera"
              value={appointOfficerName}
              onChange={(e) => setAppointOfficerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Leo ID / MyLCI Number</label>
            <Input
              placeholder="e.g. 4892012"
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
