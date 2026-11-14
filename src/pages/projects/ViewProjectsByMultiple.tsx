// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Globe2 } from 'lucide-react';

export default function ViewProjectsByMultiple() {
  const { sharedProjects, fetchSharedProjects } = useProjectStore();

  useEffect(() => {
    fetchSharedProjects();
  }, [fetchSharedProjects]);

  return (
    <AppLayout pageTitle="Shared Reports (Multiple District 306)" subtitle="Cross-district collaborative service initiatives">
      <div className="space-y-6">
        {/* MULTIPLE DISTRICT OVERSIGHT BANNER */}
        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900">
          <div className="flex items-start gap-3">
            <Globe2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Multiple District 306 Shared Reports Console</p>
              <p className="mt-0.5 text-purple-700 leading-relaxed">
                Reviewing flagship projects reported by Leo District Presidents across constituent districts (306 A1, 306 A2, 306 B1, 306 B2, 306 C1, 306 C2).
              </p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit text-xs bg-white text-purple-800 border-purple-200">
            {sharedProjects.length} Forwarded Projects
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sharedProjects.map((p, idx) => (
            <Card key={p.id || idx} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Globe2 className="w-3.5 h-3.5 text-purple-500" /> District {p.district_name || '306'}
                  </span>
                  <Badge variant="brand">{p.category || 'Shared'}</Badge>
                </div>
                <h3 className="font-bold text-base text-slate-900 line-clamp-2">{p.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Date: {p.date || 'N/A'}
                </p>
                <div className="pt-2">
                  <Link to={`/viewProject/projectID=${p.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <Eye className="w-3.5 h-3.5" /> Inspect Report
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

