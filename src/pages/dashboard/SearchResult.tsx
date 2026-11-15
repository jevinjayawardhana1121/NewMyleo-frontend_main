// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { getData } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, User, Building, FolderKanban, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchResult() {
  const { keyword } = useParams<{ keyword: string }>();
  const cleanKeyword = (keyword || '').replace(/^keyword=/, '');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'leos');
  const [loading, setLoading] = useState(true);
  const [leos, setLeos] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [duration, setDuration] = useState('0.00');

  useEffect(() => {
    const runSearch = async () => {
      if (!cleanKeyword) return;
      setLoading(true);
      const start = Date.now();
      const res = await getData(`search/${cleanKeyword}`);
      const end = Date.now();
      setDuration(((end - start) / 1000).toFixed(2));

      if (res && res.data) {
        setLeos(res.data.leos || []);
        setClubs(res.data.clubs || []);
        setProjects(res.data.projects || []);

        if (res.data.leos?.length > 0) {
          setActiveTab('leos');
        } else if (res.data.projects?.length > 0) {
          setActiveTab('projects');
        } else if (res.data.clubs?.length > 0) {
          setActiveTab('clubs');
        }
      }
      setLoading(false);
    };

    runSearch();
  }, [keyword]);

  const totalCount = leos.length + clubs.length + projects.length;

  const tabs = [
    { id: 'leos', label: `Leos (${leos.length})` },
    { id: 'projects', label: `Projects (${projects.length})` },
    { id: 'clubs', label: `Clubs (${clubs.length})` },
  ];

  const handleTabChange = (id: string | number) => {
    setActiveTab(String(id));
    setSearchParams({ tab: String(id) });
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 3:
        return <Badge variant="success">Approved</Badge>;
      case 2:
        return <Badge variant="warning">Pending</Badge>;
      case 1:
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <AppLayout
      pageTitle={`Search: "${cleanKeyword || ''}"`}
      subtitle={
        loading
          ? 'Searching across directory...'
          : `${totalCount} results retrieved in ${duration} seconds`
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
          </div>
        ) : totalCount === 0 ? (
          <Card className="text-center p-12">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Matching Results</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              We couldn't find any Leos, clubs, or projects matching &quot;{cleanKeyword}&quot;. Try a different spelling or keyword.
            </p>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'leos' && (
              <motion.div
                key="leos"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {leos.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-6 text-center">No Leos found matching this keyword.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {leos.map((leo) => (
                      <Card key={leo.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-base">
                              {leo.fName ? leo.fName[0] : 'L'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm">
                                {leo.fName} {leo.lName}
                              </h4>
                              <p className="text-xs text-slate-500">{leo.clubName || 'Leo Member'}</p>
                              {leo.mylci && (
                                <span className="text-[11px] font-mono text-slate-400">MyLCI: {leo.mylci}</span>
                              )}
                            </div>
                          </div>
                          <Link to={`/viewLeo/userID=${leo.id}`}>
                            <Button variant="ghost" size="sm" className="text-brand-600 gap-1">
                              <span>Profile</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {projects.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-6 text-center">No projects found matching this keyword.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {projects.map((proj) => (
                      <Card key={proj.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                              <FolderKanban className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-slate-800 text-sm">{proj.name}</h4>
                                {getStatusBadge(Number(proj.status))}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {proj.category} • {proj.clubName || 'Club Project'}
                              </p>
                            </div>
                          </div>
                          <Link to={`/viewProject/projectID=${proj.id}`}>
                            <Button variant="ghost" size="sm" className="text-brand-600 gap-1">
                              <span>View</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'clubs' && (
              <motion.div
                key="clubs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {clubs.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-6 text-center">No clubs found matching this keyword.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clubs.map((c) => (
                      <Card key={c.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                              <Building className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm">Leo Club of {c.name}</h4>
                              <p className="text-xs text-slate-500">District {c.districtName || 'MD 306'}</p>
                            </div>
                          </div>
                          <Link to={`/viewClub/Id=${c.id}`}>
                            <Button variant="ghost" size="sm" className="text-brand-600 gap-1">
                              <span>Club Profile</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </AppLayout>
  );
}

