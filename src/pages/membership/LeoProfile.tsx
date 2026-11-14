import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { getData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Building, Calendar, Shield } from 'lucide-react';

export default function LeoProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getData(`profile/${id}`).then((res) => {
        setLoading(false);
        if (res && res.data) {
          setProfile(res.data);
        }
      });
    }
  }, [id]);

  if (loading) {
    return (
      <AppLayout pageTitle="Loading Member Profile...">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={profile ? `${profile.fName} ${profile.lName}` : 'Leo Profile'}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/membership')} className="gap-2 text-slate-500">
          <ArrowLeft className="w-4 h-4" /> Back to Members
        </Button>

        <Card className="overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500" />
          <CardContent className="px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-6 gap-4">
              <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-xl">
                <div className="w-full h-full rounded-2xl bg-brand-50 text-brand-700 font-extrabold flex items-center justify-center text-3xl">
                  {profile?.fName ? profile.fName.charAt(0) : '🦁'}
                </div>
              </div>
              <div className="text-center sm:text-right">
                <Badge variant="brand" className="text-xs">
                  {profile?.designation || 'Leo Club Member'}
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {profile?.fName} {profile?.lName}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <Building className="w-3.5 h-3.5 text-brand-500" />
                  Leo Club of {profile?.club_name || 'N/A'} • District {profile?.district_name || '306'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100">
                <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Leo ID</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{profile?.leoId || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">MyLCI Number</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{profile?.mylci || 'N/A'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Email Address</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile?.email || 'N/A'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">Phone Number</span>
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {profile?.phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

