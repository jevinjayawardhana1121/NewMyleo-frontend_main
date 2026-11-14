import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-6 shadow-sm">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-700 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-8 leading-relaxed">
        The page you are looking for doesn't exist, has been moved, or is temporarily unavailable on the MYLEO Portal.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link to="/projects">
          <Button variant="brand" className="gap-2 shadow-sm">
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Login Page</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

