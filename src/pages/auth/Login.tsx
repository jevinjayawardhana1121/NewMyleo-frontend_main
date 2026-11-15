import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserStore, UserRole } from '@/store/userStore';
import { notify } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Info,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('jevinjayawardhana1121@gmail.com');
  const [password, setPassword] = useState('Jevin@2001');
  const [loading, setLoading] = useState(false);
  const { login, loginAsSample } = useUserStore();
  const navigate = useNavigate();

  const handleFillSample = () => {
    setEmail('jevinjayawardhana1121@gmail.com');
    setPassword('Jevin@2001');
    notify('Sample user credentials autofilled!', 'info');
  };

  const handleFillAdminSample = () => {
    setEmail('admin@leomd306.org');
    setPassword('password123');
    notify('Backend API sample credentials autofilled!', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      notify('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    const success = await login({ email, password });
    setLoading(false);

    if (success) {
      notify('Welcome back to MYLEO!', 'success');
      navigate('/projects');
    } else {
      notify('Invalid credentials. Please verify your email and password.', 'error');
    }
  };

  const handleInstantRoleSignIn = (role: UserRole) => {
    loginAsSample('jevinjayawardhana1121@gmail.com', role);
    notify(`Signed in instantly as ${role}!`, 'success');
    navigate('/projects');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient Radial Lights (Exact brand colors) */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-brand-500/12 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-400/12 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-amber-500 flex items-center justify-center shadow-soft-md text-white font-black text-2xl shadow-brand-500/20">
            🦁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">MYLEO</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                MD 306
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sri Lanka & Maldives</span>
          </div>
        </div>

        <Link
          to="/about-system"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-soft-xs hover:shadow-soft-sm"
        >
          <Info className="w-4 h-4 text-brand-500" />
          <span>About MYLEO</span>
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-xl mx-auto my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="border-slate-200/90 shadow-soft-lg backdrop-blur-2xl bg-white/90 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-brand-600 via-brand-400 to-amber-400" />
            <CardContent className="p-7 sm:p-8 space-y-6">
              {/* Header Title */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Portal Access</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Welcome to MYLEO
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Official administration, double-entry financial ledger, and activity reporting portal for Leo Clubs
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      type="email"
                      placeholder="name@leomd306.org"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                      Password
                    </label>
                    <a href="#reset" onClick={(e) => { e.preventDefault(); notify('Please contact your Club Secretary or District President to reset credentials.', 'info'); }} className="text-[11px] text-brand-600 font-semibold hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 font-mono"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="brand-gradient"
                  className="w-full h-11 text-sm font-bold shadow-soft-sm"
                  loading={loading}
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              {/* Instant Role Testing Grid */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    1-Click Direct Role Testing
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleFillAdminSample}
                      className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" /> Backend Admin
                    </button>
                    <button
                      type="button"
                      onClick={handleFillSample}
                      className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" /> Jevin Demo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstantRoleSignIn('Club President')}
                    className="h-9 text-[11px] font-bold justify-start px-2.5 truncate"
                  >
                    👑 President
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstantRoleSignIn('Club Secretary')}
                    className="h-9 text-[11px] font-bold justify-start px-2.5 truncate"
                  >
                    📝 Secretary
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstantRoleSignIn('Club Treasurer')}
                    className="h-9 text-[11px] font-bold justify-start px-2.5 truncate"
                  >
                    💰 Treasurer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstantRoleSignIn('Region Chairperson')}
                    className="h-9 text-[11px] font-bold justify-start px-2.5 truncate text-amber-800 border-amber-200 hover:bg-amber-50"
                  >
                    🗺️ Region Chair
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstantRoleSignIn('Leo District President')}
                    className="h-9 text-[11px] font-bold justify-start px-2.5 truncate text-brand-700 border-brand-200 hover:bg-brand-50"
                  >
                    🦁 District Pres
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInstantRoleSignIn('Leo Multiple District President')}
                    className="h-9 text-[11px] font-bold justify-start px-2.5 truncate text-purple-700 border-purple-200 hover:bg-purple-50"
                  >
                    🌐 Multiple Pres
                  </Button>
                </div>
              </div>

              {/* Verified Credentials Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Demo Access Credentials:</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">Active</span>
                </div>
                <div className="font-mono text-slate-600 flex flex-wrap gap-x-4">
                  <span>email: <strong>jevinjayawardhana1121@gmail.com</strong></span>
                  <span>pass: <strong>Jevin@2001</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl w-full mx-auto text-center text-xs text-slate-400 py-3">
        <p>Leo Multiple District 306 Sri Lanka & Maldives • MyLion Portal API Synchronized</p>
      </div>
    </div>
  );
}
