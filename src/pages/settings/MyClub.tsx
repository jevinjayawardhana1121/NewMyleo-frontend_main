// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getData, notify } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Building, Users, Calendar, MapPin, Mail, Award, Shield, UserPlus, ShieldCheck } from 'lucide-react';

export default function MyClub() {
  const { id } = useParams<{ id?: string }>();
  const user = useUserStore();
  const settings = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'info' | 'officers' | 'stats'>('info');
  const [clubData, setClubData] = useState<any | null>(null);

  // Appoint Officer Modal
  const [appointOpen, setAppointOpen] = useState(false);
  const [officerRole, setOfficerRole] = useState('Vice President');
  const [officerName, setOfficerName] = useState('');
  const [officerLeoId, setOfficerLeoId] = useState('');

  const targetClubId = id || user.clubId || '1';

  useEffect(() => {
    if (targetClubId) {
      getData(`club/${targetClubId}`).then((res) => {
        if (res) setClubData(res.data || res);
      });
    }
  }, [targetClubId]);

  const displayClubName = clubData?.name || (id ? 'Club Profile' : user.clubName || 'Colombo Millennium');

  const handleAppointOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName.trim()) {
      notify('Please enter the officer name', 'warning');
      return;
    }

    settings.appointOfficer({
      level: 'Club',
      targetEntityId: targetClubId,
      targetEntityName: displayClubName,
      role: officerRole,
      officerName: officerName.trim(),
      officerLeoId: officerLeoId.trim() || '4892099',
      appointedBy: `${user.currentRole} (${user.firstName} ${user.lastName})`,
    });

    setAppointOpen(false);
    setOfficerName('');
    setOfficerLeoId('');
    notify(`Appointed ${officerName} as ${officerRole} for Leo Club of ${displayClubName}!`, 'success');
  };

  // Appointments for this club
  const clubAppointments = settings.officerAppointments.filter(
    (a) => a.level === 'Club' && (a.targetEntityId === targetClubId || a.targetEntityName === displayClubName)
  );

  // Allowed appointment roles based on user role
  const isPresident = user.currentRole === 'Club President';
  const isSecretary = user.currentRole === 'Club Secretary';
  const canAppoint = user.canAppointClubOfficers;

  return (
    <AppLayout pageTitle={`Leo Club of ${displayClubName}`} subtitle="Official Club Profile, Council & Leadership">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner */}
        <Card className="overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-brand-700 via-brand-500 to-amber-500 relative" />
          <CardContent className="px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-4 gap-4">
              <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-2xl bg-brand-50 text-brand-700 font-extrabold flex items-center justify-center text-3xl">
                  🦁
                </div>
              </div>
              <div className="text-center sm:text-right flex items-center gap-2">
                <Badge variant="brand" className="text-xs">
                  Region {clubData?.region || '1'} • {user.districtName || 'District 306 A1'}
                </Badge>
                {canAppoint && (
                  <Button size="sm" variant="brand" onClick={() => setAppointOpen(true)} className="gap-1.5 shadow-sm text-xs">
                    <UserPlus className="w-3.5 h-3.5" /> Appoint Club Officer
                  </Button>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">Leo Club of {displayClubName}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Chartered under Lions Clubs International • Multiple District 306 Sri Lanka & Maldives
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          tabs={[
            { id: 'info', label: 'Club Information' },
            { id: 'officers', label: 'Club Officers & Appointments' },
            { id: 'stats', label: 'Administration Statistics' },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800">Charter & Jurisdiction</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Club ID</span>
                  <span className="font-mono font-bold text-slate-800">{targetClubId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Leo District</span>
                  <span className="font-semibold text-slate-800">{user.districtName || 'District 306 A1'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Region & Zone</span>
                  <span className="font-semibold text-slate-800">Region {clubData?.region || '1'} • Zone {clubData?.zone || '1'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Charter Date</span>
                  <span className="font-semibold text-slate-800">{clubData?.charter_date || '2015-06-20'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800">Sponsoring Lions Club & Advisory</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Sponsoring Club</span>
                  <span className="font-semibold text-slate-800">{clubData?.sponsor_lions_club || 'Lions Club of Colombo Millennium'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Leo Advisor</span>
                  <span className="font-semibold text-slate-800">{clubData?.leo_advisor || 'Lion Sunethra Perera, PMJF'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Consultation Channel</span>
                  <span className="font-semibold text-slate-800">Email & Formal Advisory Meetings</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'officers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { role: 'President', name: 'Jevin Jayawardhana', mylci: '4892011', level: 'Club Executive' },
                { role: 'Vice President', name: 'Devin Perera', mylci: '4892012', level: 'Appointed Officer' },
                { role: 'Secretary', name: 'Kavindi Silva', mylci: '4892015', level: 'Appointed Officer' },
                { role: 'Treasurer', name: 'Sachin Fernando', mylci: '4892020', level: 'Appointed Officer' },
              ].map((off) => (
                <Card key={off.role} className="p-5 text-center space-y-2">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{off.role}</span>
                  <div className="w-14 h-14 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-lg font-bold">
                    🦁
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{off.name}</h4>
                  <p className="text-[11px] text-slate-400">MyLCI: {off.mylci}</p>
                  <Badge variant="outline" className="text-[10px]">{off.level}</Badge>
                </Card>
              ))}
            </div>

            {/* Recent Officer Appointments Log */}
            <Card className="border-slate-200/90 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Official Appointment Records
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    {isPresident && 'As President, you can appoint Vice President, Secretary, Treasurer, and Leo Advisor.'}
                    {isSecretary && 'As Secretary, you can appoint Vice President, Treasurer, and Leo Advisor.'}
                    {!canAppoint && 'Viewing official appointments made by the club executive.'}
                  </CardDescription>
                </div>
                {canAppoint && (
                  <Button size="sm" variant="brand" onClick={() => setAppointOpen(true)} className="gap-1.5 text-xs">
                    <UserPlus className="w-3.5 h-3.5" /> Appoint Officer
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6">
                <div className="divide-y divide-slate-100 text-xs">
                  {clubAppointments.map((apt) => (
                    <div key={apt.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-bold text-slate-900 mr-2">{apt.officerName}</span>
                        <Badge variant="outline" className="text-[10px]">{apt.role}</Badge>
                        <span className="text-slate-400 ml-2">MyLCI: {apt.officerLeoId}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Appointed by: <strong className="text-slate-600">{apt.appointedBy}</strong> on {apt.appointedDate}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Members</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{clubData?.activeMembers ?? 28}</div>
            </Card>
            <Card className="p-5">
              <span className="text-xs font-bold text-slate-400 uppercase">Projects Completed</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{clubData?.projects_count ?? 12}</div>
            </Card>
            <Card className="p-5">
              <span className="text-xs font-bold text-slate-400 uppercase">Activity Reports Submitted</span>
              <div className="text-2xl font-black text-brand-600 mt-1">{clubData?.reports_count ?? 8}</div>
            </Card>
          </div>
        )}
      </div>

      {/* APPOINT CLUB OFFICER MODAL */}
      <Dialog open={appointOpen} onOpenChange={setAppointOpen}>
        <DialogHeader>
          <DialogTitle>Appoint Leo Club Officer</DialogTitle>
          <DialogDescription>
            {isPresident && 'As Club President, appoint your Vice President, Secretary, Treasurer, or Leo Advisor.'}
            {isSecretary && 'As Club Secretary, appoint the Vice President, Treasurer, or Leo Advisor.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAppointOfficer} className="space-y-3 py-2 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Select Role</label>
            <select
              value={officerRole}
              onChange={(e) => setOfficerRole(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
            >
              <option value="Vice President">Club Vice President</option>
              {isPresident && <option value="Club Secretary">Club Secretary</option>}
              <option value="Club Treasurer">Club Treasurer</option>
              <option value="Leo Advisor">Leo Advisor</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Appointee Full Name</label>
            <Input
              placeholder="e.g. Leo Devin Perera"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Leo ID / MyLCI Number</label>
            <Input
              placeholder="e.g. 4892012"
              value={officerLeoId}
              onChange={(e) => setOfficerLeoId(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button variant="outline" type="button" onClick={() => setAppointOpen(false)}>Cancel</Button>
            <Button variant="brand" type="submit">Confirm Appointment</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </AppLayout>
  );
}
