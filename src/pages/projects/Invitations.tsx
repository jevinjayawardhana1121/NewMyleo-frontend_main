// @ts-nocheck
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProjectStore } from '@/store/projectStore';
import { useUserStore } from '@/store/userStore';
import { postData, notify } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle2, XCircle, ArrowLeft, Calendar, Building, Eye, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Invitations() {
  const { invitations, fetchInvitations } = useProjectStore();
  const user = useUserStore();
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInvitations().finally(() => setLoading(false));
  }, [fetchInvitations]);

  const handleRespond = async (id: number, accept: boolean) => {
    setProcessingId(id);
    const endpoint = accept ? `project/invitations/${id}/accept` : `project/invitations/${id}/reject`;
    const res = await postData(endpoint, {}, accept ? 'Invitation accepted!' : 'Invitation declined.');
    setProcessingId(null);
    if (res) {
      fetchInvitations();
    }
  };

  return (
    <AppLayout
      pageTitle="Joint Project Invitations"
      subtitle="Review collaboration requests and joint service project invitations sent from other Leo clubs."
      actions={
        <Link to="/projects">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Button>
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
          </div>
        ) : invitations.length === 0 ? (
          <Card className="text-center p-12">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Pending Invitations</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Your club has no pending joint project collaboration invitations at this time.
            </p>
            <Link to="/projects">
              <Button variant="brand" size="sm">
                View Club Projects
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {invitations.map((inv, index) => (
              <motion.div
                key={inv.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="warning" className="gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Invitation</span>
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-800">
                        {inv.projectName || inv.project?.name || 'Joint Service Activity'}
                      </h4>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>Host: Leo Club of {inv.hostClubName || inv.project?.clubName || 'Host Club'}</span>
                        </span>
                        {inv.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{inv.date}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                      {inv.project?.id && (
                        <Link to={`/viewProject/projectID=${inv.project.id}`}>
                          <Button variant="outline" size="sm" className="gap-1 text-slate-600">
                            <Eye className="w-4 h-4" />
                            <span>Details</span>
                          </Button>
                        </Link>
                      )}

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRespond(inv.id, false)}
                        disabled={processingId === inv.id}
                        className="gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </Button>

                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleRespond(inv.id, true)}
                        disabled={processingId === inv.id}
                        className="gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

