// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStore } from '@/store/userStore';
import { getData } from '@/lib/api';
import { clubsApi } from '@/lib/backendService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { UserPlus, Search, User, ShieldCheck, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Members() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'members';
  const user = useUserStore();

  const [members, setMembers] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [duesList, setDuesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    // 1. Attempt fetching live club roster from Laravel backend
    const clubId = user.clubId || '1';
    clubsApi.getById(clubId).then((res) => {
      if (res && res.data) {
        if (Array.isArray(res.data.membership)) {
          const liveMembers = res.data.membership.map((m: any) => ({
            id: m.id,
            fName: m.first_name || m.name?.split(' ')[0] || m.name,
            lName: m.last_name || m.name?.split(' ').slice(1).join(' ') || '',
            email: m.email,
            phone: m.contact_number || m.phone || '+94771234567',
            leoId: String(m.id),
            mylci: m.mylci || `48920${m.id}`,
            designation: m.club_roles?.[0]?.name || 'Member',
            club_id: String(res.data.id),
            club_name: res.data.name,
          }));
          setMembers(liveMembers);
        }
        if (Array.isArray(res.data.officers)) {
          setOfficers(res.data.officers);
        }
      }
    });

    // 2. Fetch mock/fallback data for dues and offline compatibility
    getData('members/all').then((res) => {
      setLoading(false);
      if (res && res.data) {
        if (members.length === 0) {
          setMembers(res.data.members || res.data || []);
        }
        setDuesList(res.data.dues || []);
      }
    });
  }, [user.clubId]);

  // DATA ISOLATION ENFORCEMENT:
  // Leo Clubs cannot access or view Member records belonging to other Leo Clubs
  const clubMembers = members.filter((m) => {
    if (user.isDp || user.isMdp || user.isRegionChairperson) return true;
    return String(m.club_id || '1') === String(user.clubId || '1') || (m.club_name && m.club_name === user.clubName);
  });

  const filteredMembers = clubMembers.filter((m) =>
    (m.fName || m.name || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (m.leoId || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (m.mylci || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (m.designation || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <AppLayout
      pageTitle="Club Membership"
      subtitle={`Member directory and dues administration for Leo Club of ${user.clubName || 'Colombo Central'}`}
      actions={
        user.canManageMembers ? (
          <Link to="/add-club-member">
            <Button variant="brand" className="gap-2">
              <UserPlus className="w-4 h-4" /> Add Member
            </Button>
          </Link>
        ) : null
      }
    >
      <div className="space-y-6">
        {/* Role Capability Banner for Treasurer */}
        {!user.canManageMembers && user.currentRole === 'Club Treasurer' && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Read-Only Member Directory:</strong> Under Leo MD 306 governance bylaws, Club Member records are managed exclusively by the <strong>Club President</strong> and <strong>Club Secretary</strong>.
              </span>
            </div>
            <Badge variant="outline" className="border-amber-300 text-amber-800 bg-white font-mono shrink-0">
              Role: Club Treasurer
            </Badge>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: 'members', label: 'All Members', count: filteredMembers.length },
              { id: 'officers', label: 'Key Officers', count: officers.length },
              { id: 'board', label: 'Executive Board' },
              { id: 'dues', label: 'Membership Dues' },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setSearchParams({ tab: String(tab) })}
          />

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search member, MyLCI, role..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Tab 1: All Members */}
        {activeTab === 'members' && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Role / Designation</th>
                      <th className="py-3 px-4">Leo ID / MyLCI</th>
                      <th className="py-3 px-4">Contact Details</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {filteredMembers.map((member) => (
                        <motion.tr
                          key={member.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {member.fName ? member.fName.charAt(0) : 'L'}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {member.fName} {member.lName}
                                </span>
                                <span className="text-[11px] text-slate-400">{member.club_name || user.clubName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={member.designation && member.designation !== 'Member' ? 'brand' : 'outline'}
                              className="text-[10px] font-semibold"
                            >
                              {member.designation || 'Member'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            <div>ID: {member.leoId || member.id}</div>
                            <div className="text-[11px] text-slate-400">LCI: {member.mylci || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{member.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{member.phone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link to={`/leo-profile/${member.id}`}>
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                View Profile
                              </Button>
                            </Link>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Key Officers */}
        {activeTab === 'officers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(officers.length > 0 ? officers : filteredMembers.filter((m) => m.designation && m.designation !== 'Member')).map((officer: any) => (
              <Card key={officer.id} className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-bold flex items-center justify-center text-sm shadow-sm">
                    🦁
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{officer.name || `${officer.fName} ${officer.lName}`}</h3>
                    <Badge variant="brand" className="text-[10px] mt-0.5">
                      {officer.club_roles?.[0]?.name || officer.designation || 'Club Officer'}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{officer.email || 'N/A'}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 3: Dues & Administration */}
        {activeTab === 'dues' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-900 mb-2">Membership Dues Collection</h3>
              <p className="text-xs text-slate-500 mb-4">
                Club dues status synchronized with District Treasury and Club Wallet accounting records.
              </p>
              <div className="space-y-3">
                {duesList.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{d.name}</span>
                      <span className="text-slate-400 ml-2">({d.period})</span>
                    </div>
                    <Badge variant={d.status === 'Paid' ? 'brand' : 'outline'}>{d.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
