// @ts-nocheck
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useUserStore } from '@/store/userStore';
import { getData, postData, notify } from '@/lib/api';
import { clubsApi } from '@/lib/backendService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Shield,
  KeyRound,
  GraduationCap,
  Briefcase,
  Share2,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  Building,
  Calendar,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyProfile() {
  const user = useUserStore();
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [profile, setProfile] = useState<any>({});
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [mylci, setMylci] = useState('');
  const [gender, setGender] = useState('0');
  const [birthday, setBirthday] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [nic, setNic] = useState('');
  const [address, setAddress] = useState('');

  // Education & Career
  const [school, setSchool] = useState('');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [professionCategory, setProfessionCategory] = useState('');

  // Social
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');

  // Security / Password Change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchMyProfile = async () => {
      setLoading(true);
      const res = await getData('myProfile');
      if (res && res.data) {
        const d = res.data;
        setProfile(d);
        setFname(d.fName || '');
        setLname(d.lName || '');
        setEmail(d.email || '');
        setContact(d.contact || '');
        setMylci(d.mylci || '');
        setGender(String(d.gender ?? '0'));
        setBirthday(d.birthday || '');
        setCivilStatus(d.civilStatus || '');
        setNic(d.nic || '');
        setAddress(d.address || '');
        setSchool(d.school || '');
        setEducation(d.education || '');
        setProfession(d.profession || '');
        setProfessionCategory(d.professionCategry || '');
        setFacebook(d.facebook || '');
        setInstagram(d.instagram || '');
        setLinkedin(d.linkedin || '');
        setTwitter(d.twitter || '');
      }
      setLoading(false);
    };

    fetchMyProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const userId = user.leoId || profile.id || 1;
    // 1. Call Laravel Backend API: PUT api/clubs/update-member/:user_id
    await clubsApi.updateMember(userId, {
      first_name: fname,
      last_name: lname,
      email,
      contact_number: contact,
      gender: gender === '1' || gender === 'Female' ? 'Female' : 'Male',
      civil_status: civilStatus || 'Single',
      birthday,
      member_type: 'Member',
    });

    // 2. Also keep fallback call for older server route
    const fd = new FormData();
    fd.append('fname', fname);
    fd.append('lname', lname);
    fd.append('email', email);
    fd.append('contact', contact);
    fd.append('mylci', mylci);
    fd.append('gender', gender);
    fd.append('birthday', birthday);
    fd.append('civil_status', civilStatus);
    fd.append('nic', nic);
    fd.append('address', address);
    fd.append('school', school);
    fd.append('education', education);
    fd.append('profession', profession);
    fd.append('profession_categry', professionCategory);
    fd.append('fb', facebook);
    fd.append('insta', instagram);
    fd.append('ln', linkedin);
    fd.append('twitter', twitter);

    const res = await postData(`profile/${userId}/update`, fd, 'Profile updated successfully!');
    setSaving(false);
    if (res && res.data) {
      setProfile(res.data);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      notify('Please enter both current and new passwords', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('New passwords do not match', 'destructive');
      return;
    }
    if (newPassword.length < 7) {
      notify('Password must be at least 7 characters long', 'warning');
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append('old_password', oldPassword);
    fd.append('new_password', newPassword);
    if (user.id) {
      fd.append('leo_id', String(user.id));
    }

    const res = await postData(`profile/${user.id || profile.id}/update`, fd, 'Password changed successfully!');
    setSaving(false);
    if (res) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const tabs = [
    { id: 'about', label: 'Personal Info' },
    { id: 'education', label: 'Education & Career' },
    { id: 'social', label: 'Social Links' },
    { id: 'security', label: 'Account Security' },
  ];

  if (loading) {
    return (
      <AppLayout pageTitle="Profile Settings">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      pageTitle="Profile & Account Settings"
      subtitle="Manage your personal information, contact credentials, and security preferences."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card Header */}
        <Card className="overflow-hidden border-none shadow-md">
          <div className="h-28 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500" />
          <CardContent className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-12 mb-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg ring-4 ring-white">
                  <div className="w-full h-full rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-2xl uppercase">
                    {fname ? fname[0] : 'L'}
                    {lname ? lname[0] : 'E'}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {fname} {lname}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="brand">{profile.clubName || user.clubName || 'Leo Multiple District 306'}</Badge>
                    {mylci && (
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        MyLCI: {mylci}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(String(id))} />
          </CardContent>
        </Card>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                    <User className="w-5 h-5 text-brand-500" />
                    Personal & Contact Details
                  </CardTitle>
                  <CardDescription>Keep your profile details up-to-date across the district.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          First Name *
                        </label>
                        <Input value={fname} onChange={(e) => setFname(e.target.value)} required />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Last Name *
                        </label>
                        <Input value={lname} onChange={(e) => setLname(e.target.value)} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Email Address *
                        </label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Contact Phone Number
                        </label>
                        <Input value={contact} onChange={(e) => setContact(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Gender
                        </label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="0">Male</option>
                          <option value="1">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Birthday
                        </label>
                        <Input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Civil Status
                        </label>
                        <Input value={civilStatus} onChange={(e) => setCivilStatus(e.target.value)} placeholder="Single / Married" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          National ID (NIC)
                        </label>
                        <Input value={nic} onChange={(e) => setNic(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Postal Address
                        </label>
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="submit" variant="brand" disabled={saving} className="gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Profile Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'education' && (
            <motion.div
              key="education"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                    <GraduationCap className="w-5 h-5 text-brand-500" />
                    Education & Professional Background
                  </CardTitle>
                  <CardDescription>Share your educational background and career path.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          School Attended
                        </label>
                        <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Secondary school / College" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Higher Education
                        </label>
                        <Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="University / Degree / Diploma" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Profession / Title
                        </label>
                        <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Software Engineer, Accountant" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Industry / Category
                        </label>
                        <Input value={professionCategory} onChange={(e) => setProfessionCategory(e.target.value)} placeholder="e.g. Technology, Finance, Healthcare" />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="submit" variant="brand" disabled={saving} className="gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'social' && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                    <Share2 className="w-5 h-5 text-brand-500" />
                    Social Media Profiles
                  </CardTitle>
                  <CardDescription>Connect your social links so other Leos across the district can network with you.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Facebook URL
                        </label>
                        <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/your.username" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Instagram URL
                        </label>
                        <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/your.username" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          LinkedIn URL
                        </label>
                        <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/your.username" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                          Twitter / X URL
                        </label>
                        <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://twitter.com/your.handle" />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="submit" variant="brand" disabled={saving} className="gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Links'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                    <KeyRound className="w-5 h-5 text-brand-500" />
                    Change Account Password
                  </CardTitle>
                  <CardDescription>
                    Ensure your account is protected with a secure password containing uppercase, lowercase, numbers, and special characters.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Current Password *
                      </label>
                      <Input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        New Password *
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 7 characters"
                        minLength={7}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
                        Confirm New Password *
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        minLength={7}
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" variant="destructive" disabled={saving} className="gap-2">
                        <Lock className="w-4 h-4" />
                        {saving ? 'Updating...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}

