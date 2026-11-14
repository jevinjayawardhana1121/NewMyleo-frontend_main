import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Sparkles, Building2, Users } from 'lucide-react';

export default function About() {
  const leaders = [
    {
      name: "Leo Lion Dilshan Peiris PFLM",
      district: "Leo District 306 A1",
      role: "Past Multiple District President (2021/2022)",
      desc: "Introduced the MYLEO portal to Multiple District 306, establishing the first unified administration across Sri Lanka.",
    },
    {
      name: "Leo Lion Champaka Dammage PFLM",
      district: "Leo District 306 C2",
      role: "Past Multiple District President",
      desc: "Architected the technical infrastructure and established the official MYLEO brand and identity.",
    },
    {
      name: "Leo Lion Malinda Ganewatte PFLM",
      district: "Leo District 306 A1",
      role: "Past District President (2020/2021)",
      desc: "Pioneered the very first version of the portal in Leo District 306 A1.",
    },
    {
      name: "Leo Lion Rahul Attanayake PFLM",
      district: "Leo District 306 C1",
      role: "Past Multiple District President (2022/2023)",
      desc: "Completed full implementation across all six Leo Districts in Sri Lanka & Maldives.",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Button>
        </Link>

        {/* Hero Card */}
        <Card className="border-slate-200/90 shadow-xl overflow-hidden relative">
          <div className="h-3 bg-gradient-to-r from-brand-500 via-amber-400 to-brand-600" />
          <CardContent className="p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-3xl shadow-inner">
                🦁
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">About MYLEO Portal</h1>
                <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
                  Leo Multiple District 306, Sri Lanka & Maldives
                </p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-base">
              The <strong>MYLEO</strong> administration and reporting portal was first conceptualized in <strong>Leo District 306 A1</strong> in the Leoistic year 2020/2021 under the guidance of Past District President <strong>Leo Lion Malinda Ganewatte PFLM</strong>. Recognizing its tremendous value in standardizing club governance, Past Multiple District President <strong>Leo Lion Dilshan Peiris PFLM</strong> introduced the system to <strong>Leo Multiple District 306</strong> in 2021/2022.
            </p>

            <p className="text-slate-600 leading-relaxed text-base">
              Today, MYLEO is actively utilized by all Leo clubs across Sri Lanka & Maldives for comprehensive project lifecycle tracking, activity reporting, member registries, and double-entry bookkeeping governance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-brand-500 flex-shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-800">6 Districts</div>
                  <div className="text-xs text-slate-500">Unified under MD 306</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-800">100+ Clubs</div>
                  <div className="text-xs text-slate-500">Active Reporting</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <div className="text-lg font-bold text-slate-800">100% Digital</div>
                  <div className="text-xs text-slate-500">Auditable Governance</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Contributors */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Leadership & Architectural Heritage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {leaders.map((leader, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700">
                      {leader.district}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">{leader.name}</h3>
                  <p className="text-xs font-medium text-amber-700">{leader.role}</p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{leader.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

