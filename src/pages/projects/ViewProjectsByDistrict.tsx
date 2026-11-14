// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjectStore } from '@/store/projectStore';
import { useUserStore } from '@/store/userStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Building, ShieldCheck } from 'lucide-react';

export default function ViewProjectsByDistrict() {
  const { districtProjects, fetchDistrictProjects } = useProjectStore();
  const user = useUserStore();
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchDistrictProjects();
  }, [fetchDistrictProjects]);

  // DISTRICT JURISDICTION DATA ISOLATION:
  // Leo Districts cannot access or view Project Reports belonging to clubs outside their jurisdiction
  const districtIsolated = districtProjects.filter((p) => {
    if (user.isMdp) return true;
    return (p.district_id || '306 A1') === user.districtId;
  });

  const categories = Array.from(new Set(districtIsolated.map((p) => p.category).filter(Boolean)));

  const filtered = selectedCategory === 'all'
    ? districtIsolated
    : districtIsolated.filter((p) => p.category === selectedCategory);

  return (
    <AppLayout pageTitle="District Club Reports" subtitle="Overview of all submitted project reports across the district">
      <div className="space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'brand' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              variant={selectedCategory === c ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, idx) => (
            <Card key={p.id || idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Building className="w-3.5 h-3.5 text-brand-500" /> L/C {p.club_name}
                  </span>
                  <Badge variant="outline">{p.category}</Badge>
                </div>
                <h3 className="font-bold text-base text-slate-900 line-clamp-2">{p.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date: {p.date || 'N/A'}
                </p>
                <div className="pt-2">
                  <Link to={`/viewProject/projectID=${p.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <Eye className="w-3.5 h-3.5" /> View Project
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

