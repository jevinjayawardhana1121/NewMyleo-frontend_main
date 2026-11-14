import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, History, User } from 'lucide-react';

export default function EditHistory() {
  const { id, name } = useParams<{ id: string; name: string }>();
  const { getEditHistory } = useProjectStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadHistory(id);
    }
  }, [id]);

  const loadHistory = async (projId: string) => {
    setLoading(true);
    const res = await getEditHistory(projId);
    setLoading(false);
    if (res && res.data) {
      setHistory(res.data);
    }
  };

  return (
    <AppLayout pageTitle="Project Edit History" subtitle={name ? decodeURIComponent(name) : 'Revision Changelog'}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to={`/viewProject/projectID=${id}`}>
          <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
            <ArrowLeft className="w-4 h-4" /> Back to Project
          </Button>
        </Link>

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <History className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-sm">No recorded modifications for this project.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                {history.map((record, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-500 border-2 border-white shadow-sm" />
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5" /> {record.editor_name || 'Officer'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {record.created_at || record.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{record.action || 'Project details updated'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

