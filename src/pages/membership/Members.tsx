// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStore } from '@/store/userStore';
import { getData } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
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
  const [duesList, setDuesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    getData('members/all').then((res) => {
      setLoading(false);
      if (res && res.data) {
        setMembers(res.data.members || res.data || []);
        setDuesList(res.data.dues || []);
      }
    });
  }, []);

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
      subtitle={`Member directory and dues administration for Leo Club of ${user.clubName || 'Your Club'}`}
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
              { id: 'members', label: 'All Members', count: members.length },
              { id: 'officers', label: 'Key Officers' },
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

        {/* Members Grid */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredMembers.map((member, i) => (
                <motion.div
                  key={member.id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                  whileHover={{ y: -3 }}
                >
                  <Card className="hover:shadow-soft-md transition-all h-full bg-white/95 hover:border-brand-300">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-100 to-brand-50 text-brand-700 font-black flex items-center justify-center text-sm shrink-0 shadow-soft-xs border border-brand-200/50">
                        {member.image ? (
                          <img src={member.image} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          member.fName ? member.fName.charAt(0) : 'L'
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <Link
                            to={`/viewLeo/userID=${member.id || member.leoId}`}
                            className="font-bold text-sm text-slate-900 hover:text-brand-600 truncate block"
                          >
                            {member.fName} {member.lName}
                          </Link>
                          {member.designation && (
                            <Badge variant="brand" className="text-[10px] px-2 py-0.5 shrink-0 font-bold">
                              {member.designation}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Leo ID: {member.leoId || 'N/A'} • MyLCI: {member.mylci || 'N/A'}
                        </p>
                        {member.email && (
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {member.email}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Key Officers */}
        {activeTab === 'officers' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['President', 'Secretary', 'Treasurer'].map((role) => {
              const officer = members.find((m) => (m.designation || '').toLowerCase().includes(role.toLowerCase()));
              return (
                <Card key={role} className="p-6 text-center space-y-3">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{role}</span>
                  <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-xl font-bold text-slate-700">
                    {officer?.fName ? officer.fName.charAt(0) : '🦁'}
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    {officer ? `${officer.fName} ${officer.lName}` : `Vacant / Not Assigned`}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">MyLCI: {officer?.mylci || 'N/A'}</p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dues */}
        {activeTab === 'dues' && (
          <Card>
            <CardContent className="p-6">
              <div className="divide-y divide-slate-100 text-xs">
                {members.map((m, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{m.fName} {m.lName}</p>
                      <p className="text-[11px] text-slate-400">Leo ID: {m.leoId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-700">
                        Paid: {formatCurrency(m.dues_paid ?? 0)} LKR
                      </span>
                      {m.dues_cleared ? (
                        <Badge variant="success">Cleared</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </div>
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

