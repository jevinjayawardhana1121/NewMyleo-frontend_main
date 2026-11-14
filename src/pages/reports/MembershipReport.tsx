// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { getData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, UserPlus, UserMinus, Shield } from 'lucide-react';

export default function MembershipReport() {
  const { id, month, cName } = useParams<{ id: string; month: string; cName: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData(`report/membership/${id}`).then((res) => {
      setLoading(false);
      if (res) setData(res.data || res);
    });
  }, [id]);

  return (
    <AppLayout pageTitle={`${month} Membership Overview`} subtitle={`L/C ${cName ? decodeURIComponent(cName) : ''}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to={`/viewReport/reportID=${id}`}>
          <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
            <ArrowLeft className="w-4 h-4" /> Back to Activity Report
          </Button>
        </Link>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Total Active Members</span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{data?.active_count ?? 0}</div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Inducted This Month</span>
              <div className="text-2xl font-black text-emerald-600 mt-0.5">{data?.inductions_count ?? 0}</div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Good Standing</span>
              <div className="text-2xl font-black text-amber-600 mt-0.5">{data?.good_standing_count ?? 0}</div>
            </div>
          </Card>
        </div>

        {/* Member Registry for that period */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base font-bold text-slate-800">Roster & Dues Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-xs text-slate-500">
              Official membership roster and dues records synchronized with the district directory for {month}.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

