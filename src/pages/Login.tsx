import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ROLE_HOME } from '@/lib/roleAccess';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const REMEMBER_EMAIL_KEY = 'mithela_last_email';
const BG_VIDEO_URL = 'https://res.cloudinary.com/dklipv4th/video/upload/v1781950055/bg-video_wunomy.mp4';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ name: string; role: string } | null>(null);

  // Prefill remembered email on mount
  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const authUser = await login(email.trim(), password);

      if (!authUser) {
        setError('Invalid email or password. Please try again.');
        setPassword('');
        return;
      }

      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      setSuccessInfo({ name: authUser.name, role: authUser.role });
      toast.success('Access granted', {
        description: `Welcome back, ${authUser.name}.`,
      });

      setTimeout(() => {
        navigate(ROLE_HOME[authUser.role]);
      }, 1800);
    } catch {
      setError('The sign-in service is currently unavailable. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.MouseEvent) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Enter your email first, then click "Forgot password?" again.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setError('The sign-in service is currently unavailable. Please try again shortly.');
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      toast.success('Reset email sent', {
        description: 'Check your inbox for a password reset link.',
      });
    } catch {
      setError('Could not send reset email. Please try again or contact your administrator.');
    }
  };

  return (
    <div className="login-page flex min-h-screen overflow-hidden bg-[#0c0c0c]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

        .login-page { font-family: 'Inter', sans-serif; }

        .login-serif { font-family: 'DM Serif Display', serif; }
        .login-garamond { font-family: 'Cormorant Garamond', serif; }

        @keyframes loginFadeInDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loginFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes loginFadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loginSlideInRight { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes loginSpin { to { transform: rotate(360deg); } }
        @keyframes loginPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes loginFadeInOverlay { from { opacity: 0; } to { opacity: 1; } }

        .anim-fade-down { opacity: 0; animation: loginFadeInDown 0.7s ease 0.1s forwards; }
        .anim-fade { opacity: 0; animation: loginFadeIn 0.6s ease 0.4s forwards; }
        .anim-fade-up { opacity: 0; animation: loginFadeInUp 0.6s ease 0.5s forwards; }
        .anim-tagline { opacity: 0; animation: loginFadeIn 0.6s ease 0.7s forwards; }
        .anim-slide-1 { opacity: 0; animation: loginSlideInRight 0.6s ease 0.2s forwards; }
        .anim-slide-2 { opacity: 0; animation: loginSlideInRight 0.6s ease 0.3s forwards; }
        .anim-slide-3 { opacity: 0; animation: loginSlideInRight 0.6s ease 0.4s forwards; }
        .anim-slide-4 { opacity: 0; animation: loginSlideInRight 0.6s ease 0.45s forwards; }
        .anim-slide-5 { opacity: 0; animation: loginSlideInRight 0.6s ease 0.5s forwards; }
        .anim-fade-late { opacity: 0; animation: loginFadeIn 0.5s ease 0.7s forwards; }
        .anim-fade-latest { opacity: 0; animation: loginFadeIn 0.5s ease 0.75s forwards; }

        .login-spinner { animation: loginSpin 0.8s linear infinite; }
        .login-spinner-lg { animation: loginSpin 1s linear infinite; }
        .login-security-dot { animation: loginPulse 2s ease-in-out infinite; }
        .login-overlay-in { animation: loginFadeInOverlay 0.3s ease; }

        .login-input::placeholder { color: #525252; }
        .login-input:focus { border-color: #404040; background: #1f1f1f; }
      `}</style>

      {/* Success overlay */}
      {successInfo ? (
        <div className="login-overlay-in fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#0c0c0c]">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a96e] text-2xl text-[#c9a96e]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="login-serif mb-2 text-2xl text-[#f5f5f5]">Authentication Successful</div>
          <div className="mb-1 text-sm text-[#a3a3a3]">Welcome back, {successInfo.name}</div>
          <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#c9a96e]">
            Role: {successInfo.role.toUpperCase()} | Redirecting to your dashboard...
          </div>
          <div className="login-spinner-lg mt-6 h-8 w-8 rounded-full border-2 border-[#262626] border-t-[#c9a96e]" />
        </div>
      ) : null}

      {/* Left panel - branding with video background */}
      <div className="relative hidden min-w-0 flex-1 flex-col justify-center overflow-hidden px-[8%] lg:flex">
        <div className="absolute inset-0 z-[-1] overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            style={{ filter: 'brightness(0.75) saturate(0.9)' }}
          >
            <source src={BG_VIDEO_URL} type="video/mp4" />
          </video>
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(90deg, rgba(12,12,12,0.45) 0%, rgba(12,12,12,0.25) 50%, rgba(12,12,12,0.15) 100%)',
            }}
          />
        </div>

        <div className="relative z-[3] max-w-[520px] text-white">
          <div className="anim-fade-down mb-12 flex items-center gap-5">
            <img src="/mithela-logo.png" alt="Mithela Group" className="h-16 w-16 flex-shrink-0 opacity-90" />
            <div className="flex flex-col">
              <div className="login-serif text-[38px] leading-[1.1] tracking-tight text-[#f5f5f5]">
                Mithela<span className="login-serif italic text-[#c9a96e]">Group</span>
              </div>
              <div className="login-serif mt-1 text-lg uppercase tracking-[6px] text-[#737373]">ERP</div>
            </div>
          </div>

          <div className="anim-fade my-8 h-px w-12 bg-[#c9a96e]" />

          <div className="login-garamond anim-fade-up max-w-[420px] text-xl leading-relaxed text-[#a3a3a3]">
            Production tracking and costing management system for export-oriented textile manufacturing.
          </div>

          <div className="anim-tagline mt-8 text-xs font-medium uppercase tracking-[2px] text-[#737373]">
            Committed With Client | 100% Export Oriented
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="relative z-[2] flex max-h-screen w-full min-w-0 flex-col justify-center overflow-y-auto border-l border-[#262626] bg-[#141414] px-7 py-9 sm:px-11 sm:py-12 lg:w-[420px] lg:min-w-[420px]">
        <div className="anim-slide-1 mb-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded border border-[#262626] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-[#737373]">
            <span className="h-[5px] w-[5px] rounded-full bg-[#16a34a]" />
            Secure ERP Login
          </div>
          <div className="login-serif mb-1.5 text-[30px] tracking-tight text-[#f5f5f5]">Welcome Back</div>
          <div className="text-sm text-[#737373]">Sign in to access your dashboard</div>
        </div>

        {error ? (
          <div className="mb-5 flex items-center gap-2.5 rounded-md border border-[rgba(220,38,38,0.15)] bg-[rgba(220,38,38,0.06)] px-4 py-3 text-sm text-[#ef4444]">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-0">
          <div className="anim-slide-2 mb-5">
            <label htmlFor="email" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="login-input w-full rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-3.5 text-sm text-[#f5f5f5] outline-none transition-all"
            />
          </div>

          <div className="anim-slide-3 mb-5">
            <label htmlFor="password" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="login-input w-full rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-3.5 pr-11 text-sm text-[#f5f5f5] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center p-1.5 text-[#525252] transition-colors hover:text-[#a3a3a3]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          <div className="anim-slide-4 mb-6 flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] text-[#a3a3a3]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 cursor-pointer accent-[#c9a96e]"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-[13px] font-medium text-[#a3a3a3] transition-colors hover:text-[#c9a96e]"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="anim-slide-5 flex w-full items-center justify-center rounded-lg bg-[#c9a96e] py-3.5 text-sm font-bold tracking-wide text-[#0c0c0c] transition-colors hover:bg-[#b8945f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="login-spinner mr-2 inline-block h-4 w-4 rounded-full border-2 border-[rgba(20,20,20,0.3)] border-t-[#0c0c0c]" />
                Signing in...
              </>
            ) : (
              'Sign In to ERP'
            )}
          </button>
        </form>

        <div className="anim-fade-late mt-6 text-center">
          <p className="text-xs text-[#737373]">
            Need access?{' '}
            <a
              href="mailto:admin@mithela-textile.com"
              className="font-semibold text-[#a3a3a3] transition-colors hover:text-[#c9a96e]"
            >
              Contact System Administrator
            </a>
          </p>
        </div>

        <div className="anim-fade-latest mt-5 flex items-center justify-center gap-2 border-t border-[#262626] pt-5">
          <span className="login-security-dot h-[5px] w-[5px] rounded-full bg-[#16a34a]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737373]">
            256-bit SSL Encryption | Session Secured
          </span>
        </div>
      </div>
    </div>
  );
}
