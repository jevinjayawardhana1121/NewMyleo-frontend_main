import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { clubsApi, CreateMemberPayload } from '@/lib/backendService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function AddMember() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mylci, setMylci] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [civilStatus, setCivilStatus] = useState('Single');
  const [dob, setDob] = useState('2001-08-15');
  const [memberType, setMemberType] = useState<'Member' | 'Prospect'>('Member');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: CreateMemberPayload = {
      member_type: memberType,
      first_name: fName.trim(),
      last_name: lName.trim(),
      email: email.trim(),
      contact_number: phone.trim(),
      gender,
      civil_status: civilStatus,
      birthday: dob,
      joined_date: new Date().toISOString().split('T')[0],
    };

    const res = await clubsApi.createMember(payload);
    setLoading(false);

    if (res) {
      navigate('/membership');
    }
  };

  return (
    <AppLayout pageTitle="Add Club Member" subtitle="Register a new Leo to your club roster via Laravel Backend API">
      <div className="max-w-xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/membership')} className="gap-2 text-slate-500">
          <ArrowLeft className="w-4 h-4" /> Back to Members
        </Button>

        <Card>
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Member Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Membership Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMemberType('Member')}
                    className={`h-9 rounded-xl border text-xs font-bold transition-all ${
                      memberType === 'Member'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Official Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberType('Prospect')}
                    className={`h-9 rounded-xl border text-xs font-bold transition-all ${
                      memberType === 'Prospect'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    Prospect / Candidate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">First Name *</label>
                  <Input value={fName} onChange={(e) => setFName(e.target.value)} required placeholder="e.g. Kasun" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Last Name *</label>
                  <Input value={lName} onChange={(e) => setLName(e.target.value)} required placeholder="e.g. Perera" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Email Address *</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="kasun.perera@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Contact Number</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94771234567" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">MyLCI Number</label>
                  <Input value={mylci} onChange={(e) => setMylci(e.target.value)} placeholder="e.g. 4892011" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Civil Status</label>
                  <select
                    value={civilStatus}
                    onChange={(e) => setCivilStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Date of Birth</label>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/membership')}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" disabled={loading} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Creating Member...' : 'Register Member'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
