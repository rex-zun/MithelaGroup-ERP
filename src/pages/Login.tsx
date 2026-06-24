import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME } from '@/lib/roleAccess';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authUser = await login(identifier.trim(), password);
      if (!authUser) {
        setError('Invalid credentials. Please check your username/email and password.');
        return;
      }

      toast.success('Access granted', {
        description: `Welcome back, ${authUser.name}.`,
      });
      navigate(ROLE_HOME[authUser.role]);
    } catch {
      setError('The sign-in service is currently unavailable. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_38%),linear-gradient(135deg,_#07130f_0%,_#0f172a_100%)] p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-white/95 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-10 text-white lg:flex">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
                <img src="/mithela-logo.svg" alt="Mithela Group logo" className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Production Intelligence</p>
                <h1 className="text-2xl font-semibold">Mithela ERP</h1>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-100">
                <Sparkles className="h-4 w-4" />
                Secure role-based operations
              </div>
              <h2 className="max-w-xl text-4xl font-semibold leading-tight">Modern control for textile production, costing, and reporting.</h2>
              <p className="max-w-xl text-sm leading-7 text-emerald-50/80">
                Monitor orders, machines, dyes, and reports from one secure workspace built for fast factory decisions.
              </p>
            </div>

            <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-inner backdrop-blur-sm sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">Real-time oversight</p>
                <p className="mt-2 text-sm text-emerald-50/70">Live dashboards for directors and admins.</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Task-focused access</p>
                <p className="mt-2 text-sm text-emerald-50/70">Operators see only the entry and export modules they need.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-emerald-50/70">
            <ShieldCheck className="h-4 w-4" />
            Protected by Supabase-ready authentication and RBAC.
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-slate-50/80 px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-300/40">
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950">
                <img src="/mithela-logo.svg" alt="Mithela Group logo" className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in to continue</p>
            </div>

            <div className="mb-8 hidden lg:block">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Secure login</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Access your ERP workspace</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium text-slate-700">Username or Email</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Enter username or email"
                  className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    className="h-11 border-slate-200 pr-10 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full bg-emerald-700 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}
