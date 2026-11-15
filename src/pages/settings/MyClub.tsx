// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStore } from '@/store/userStore';
import { useSettingsStore } from '@/store/settingsStore';
import { clubsApi } from '@/lib/backendService';
import { notify } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Building, Users, Calendar, MapPin, Mail, Award, Shield, UserPlus, ShieldCheck, Save, Globe2 } from 'lucide-react';

export default function MyClub() {
  const { id } = useParams<{ id?: string }>();
  const user = useUserStore();
  const settings = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'info' | 'officers' | 'stats'>('info');
  const [clubData, setClubData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Appoint Officer Modal
  const [appointOpen, setAppointOpen] = useState(false);
  const [officerRole, setOfficerRole] = useState('Vice President');
  const [officerName, setOfficerName] = useState('');
  const [officerUserId, setOfficerUserId] = useState('16');

  // Edit Club Info State
  const [editClubEmail, setEditClubEmail] = useState('');
  const [editClubWebsite, setEditClubWebsite] = useState('');
  const [editAdvisorName, setEditAdvisorName] = useState('');
  const [editAdvisorEmail, setEditAdvisorEmail] = useState('');

  const targetClubId = id || user.clubId || '1';

  useEffect(() => {
    if (targetClubId) {
      clubsApi.getById(targetClubId).then((res) => {
        if (res && res.data) {
          setClubData(res.data);
          setEditClubEmail(res.data.email || 'colombocentral@leomd306.org');
          setEditClubWebsite(res.data.website || 'https://colombocentral.leomd306.org');
          setEditAdvisorName(res.data.advisor_name || 'Lion Jane Perera');
          setEditAdvisorEmail(res.data.advisor_email || 'advisor.central@leomd306.org');
        }
      });
    }
  }, [targetClubId]);

  const displayClubName = clubData?.name || (id ? 'Club Profile' : user.clubName || 'Leo Club of Colombo Central');

  const handleAppointOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName.trim()) {
      notify('Please enter the officer name', 'warning');
      return;
    }

    setLoading(true);
    // 1. Call Laravel Backend API: POST api/clubs/assign-role
    const res = await clubsApi.assignRole({
      user_id: parseInt(officerUserId, 10) || 16,
      role_name: officerRole,
    });
    setLoading(false);

    // 2. Also register in local settingsStore for offline and immediate reactive rendering
    settings.appointOfficer({
      level: 'Club',
      targetEntityId: targetClubId,
      targetEntityName: displayClubName,
      role: officerRole,
      officerName: officerName.trim(),
      officerLeoId: officerUserId.trim() || '16',
      appointedBy: `${user.currentRole} (${user.firstName} ${user.lastName})`,
    });

    setAppointOpen(false);
    setOfficerName('');
    notify(`Appointed ${officerName} as ${officerRole} for ${displayClubName}!`, 'success');
  };

  const handleSaveClubInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Call Laravel Backend API: PUT api/clubs/:club_id
    await clubsApi.updateClub(targetClubId, {
      name: displayClubName,
      email: editClubEmail,
      website: editClubWebsite,
      advisor_name: editAdvisorName,
      advisor_email: editAdvisorEmail,
    });
    setLoading(false);
    notify('Club profile details saved successfully to backend!', 'success');
  };

  // Appointments for this club
  const clubAppointments = settings.officerAppointments.filter(
    (a) => a.level === 'Club' && (a.targetEntityId === targetClubId || a.targetEntityName === displayClubName)
  );

  const canAppoint = user.canAppointClubOfficers;
  const isSecretary = user.currentRole === 'Club Secretary';

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
                  Region {clubData?.club_region || '1'} • {user.districtName || 'District 306 A1'}
                </Badge>
                {canAppoint && (
                  <Button size="sm" variant="brand" onClick={() => setAppointOpen(true)} className="gap-1.5 shadow-sm text-xs">
                    <UserPlus className="w-3.5 h-3.5" /> Appoint Club Officer
                  </Button>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">{displayClubName}</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-sm font-bold text-slate-900">Club Profile & Contact Information</CardTitle>
                  <CardDescription className="text-xs">
                    Official club contact details synchronized with the District and International directory.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSaveClubInfo} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Club Email</label>
                        <Input
                          type="email"
                          value={editClubEmail}
                          onChange={(e) => setEditClubEmail(e.target.value)}
                          disabled={!user.canUpdateClubProfile}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Website URL</label>
                        <Input
                          value={editClubWebsite}
                          onChange={(e) => setEditClubWebsite(e.target.value)}
                          disabled={!user.canUpdateClubProfile}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Lions Leo Advisor</label>
                        <Input
                          value={editAdvisorName}
                          onChange={(e) => setEditAdvisorName(e.target.value)}
                          disabled={!user.canUpdateClubProfile}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Advisor Email</label>
                        <Input
                          type="email"
                          value={editAdvisorEmail}
                          onChange={(e) => setEditAdvisorEmail(e.target.value)}
                          disabled={!user.canUpdateClubProfile}
                        />
                      </div>
                    </div>

                    {user.canUpdateClubProfile && (
                      <div className="pt-2 flex justify-end">
                        <Button type="submit" variant="brand" size="sm" disabled={loading} className="gap-2">
                          <Save className="w-4 h-4" />
                          {loading ? 'Saving...' : 'Save Profile Changes'}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-5 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Parent Jurisdiction</h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-brand-500" />
                    <span>{user.districtName || 'District 306 A1'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-500" />
                    <span>Region {clubData?.club_region || '1'} • Zone 1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-brand-500" />
                    <span>Multiple District 306</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'officers' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-sm font-bold text-slate-900">Current Executive Officers</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(clubData?.officers && clubData.officers.length > 0 ? clubData.officers : [
                    { name: 'Leo John Doe', role: 'Club President' },
                    { name: 'Leo Jane Smith', role: 'Club Secretary' },
                    { name: 'Leo Mark Silva', role: 'Club Treasurer' },
                  ]).map((off: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                          🦁
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{off.name}</span>
                          <span className="text-[10px] text-brand-600 font-semibold">{off.club_roles?.[0]?.name || off.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {clubAppointments.length > 0 && (
              <Card>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-sm font-bold text-slate-900">Recent Council Appointments</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {clubAppointments.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{app.officerName}</span>
                          <span className="text-slate-500 ml-2">appointed as <strong>{app.role}</strong></span>
                        </div>
                        <span className="text-[11px] text-slate-400">{app.date}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Club Members</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{clubData?.membership_count || 18}</div>
            </Card>
            <Card className="p-5">
              <span className="text-xs text-slate-400 font-bold uppercase">Executive Officers</span>
              <div className="text-2xl font-black text-brand-600 mt-1">{clubData?.officers_count || 3}</div>
            </Card>
            <Card className="p-5">
              <span className="text-xs text-slate-400 font-bold uppercase">Status</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">Active</div>
            </Card>
          </div>
        )}

        {/* Modal: Appoint Club Officer */}
        <Dialog open={appointOpen} onOpenChange={setAppointOpen}>
          <DialogHeader>
            <DialogTitle>Appoint Club Officer</DialogTitle>
            <DialogDescription>
              Assign an executive officer role for Leo Club of {displayClubName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAppointOfficer} className="space-y-4 py-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Select Role</label>
              <select
                value={officerRole}
                onChange={(e) => setOfficerRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-brand-400"
              >
                {!isSecretary && <option value="President">President</option>}
                <option value="Vice President">Vice President</option>
                <option value="Secretary">Secretary</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Leo Advisor">Leo Advisor</option>
                <option value="Director">Director</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Officer Name *</label>
              <Input
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                placeholder="e.g. Kasun Perera"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">User / Member ID *</label>
              <Input
                value={officerUserId}
                onChange={(e) => setOfficerUserId(e.target.value)}
                placeholder="e.g. 16"
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setAppointOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={loading}>
                {loading ? 'Assigning...' : 'Confirm Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </div>
    </AppLayout>
  );
}
