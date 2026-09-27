import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MockDatabase } from '../lib/mockStore';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Mail, Lock, User as UserIcon, Sparkles, Phone, FileText, X, ChevronLeft, 
  CheckCircle, ArrowRight, Star, MapPin 
} from 'lucide-react';

const countries = [
  { code: '+1', flag: '🇺🇸', label: 'US' },
  { code: '+880', flag: '🇧🇩', label: 'BD' },
  { code: '+44', flag: '🇬🇧', label: 'UK' },
  { code: '+91', flag: '🇮🇳', label: 'IN' },
  { code: '+65', flag: '🇸🇬', label: 'SG' },
  { code: '+81', flag: '🇯🇵', label: 'JP' },
  { code: '+61', flag: '🇦🇺', label: 'AU' },
  { code: '+49', flag: '🇩🇪', label: 'DE' },
];

interface AuthPagesProps {
  onAuthSuccess: (user: User) => void;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthPages({ onAuthSuccess, onClose, initialMode = 'login' }: AuthPagesProps) {
  // Tabs state matching user request
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(
    initialMode === 'login' ? 'signin' : 'signup'
  );

  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [role, setRole] = useState<'seeker' | 'provider' | 'both'>('seeker');
  const [bio, setBio] = useState('');
  
  // Forgot password flow states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // UI status states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter non-digit characters so user only enters numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setPhone(val);
  };

  // Sign in handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const users = MockDatabase.getUsers();
      const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!matchedUser) {
        setError('No account found with this email. Try typing a mock account email or register.');
        setLoading(false);
        return;
      }

      // Automatically sign in successfully for mock environment
      MockDatabase.setCurrentUser(matchedUser);
      MockDatabase.logActivity(matchedUser.id, 'AUTH_LOGIN', 'USER', matchedUser.id, 'Logged in to UCOMMERZ platform');
      onAuthSuccess(matchedUser);
      setLoading(false);
      onClose();
    }, 600);
  };

  // Sign up/Register handler
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const users = MockDatabase.getUsers();
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

      if (exists) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      // Map selector role to UserRole enum
      let mappedRole = UserRole.SEEKER;
      if (role === 'provider') mappedRole = UserRole.PROVIDER;
      else if (role === 'both') mappedRole = UserRole.BOTH;

      const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        full_name: fullName,
        phone: phone ? `${countryCode} ${phone}` : undefined,
        role: mappedRole,
        bio: bio || undefined,
        rating: 5.0,
        total_reviews: 0,
        verified: false,
        is_active: true,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      MockDatabase.saveUsers([...users, newUser]);
      MockDatabase.setCurrentUser(newUser);

      // Setup initial empty reminder settings for providers
      if (mappedRole === UserRole.PROVIDER || mappedRole === UserRole.BOTH) {
        const settings = MockDatabase.getReminderSettings();
        MockDatabase.saveReminderSettings([
          ...settings,
          {
            id: `set-${newUser.id}`,
            provider_id: newUser.id,
            enabled: true,
            reminder_hours: 24,
            send_email: true,
            send_sms: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      }

      MockDatabase.logActivity(newUser.id, 'AUTH_REGISTER', 'USER', newUser.id, `Registered as ${mappedRole.toLowerCase()}`);
      onAuthSuccess(newUser);
      setLoading(false);
      onClose();
    }, 600);
  };

  // Google Sign In handler
  const handleGoogle = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const googleUser: User = {
        id: 'google-user-' + Math.random().toString(36).substr(2, 5),
        email: 'google.demo@example.com',
        full_name: 'Google Demo User',
        role: UserRole.BOTH,
        rating: 5.0,
        total_reviews: 0,
        verified: true,
        is_active: true,
        slug: 'google-demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const users = MockDatabase.getUsers();
      if (!users.some(u => u.email === googleUser.email)) {
        MockDatabase.saveUsers([...users, googleUser]);
      }
      
      MockDatabase.setCurrentUser(googleUser);
      MockDatabase.logActivity(googleUser.id, 'AUTH_LOGIN', 'USER', googleUser.id, 'Logged in via Google Authentication');
      onAuthSuccess(googleUser);
      setLoading(false);
      onClose();
    }, 600);
  };

  // Password recovery reset handler
  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const users = MockDatabase.getUsers();
      const exists = users.some(u => u.email.toLowerCase() === forgotEmail.toLowerCase());

      if (!exists) {
        setError('No account found with this email.');
        setLoading(false);
        return;
      }

      setForgotSuccess(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-md my-8 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <Card className="glass w-full p-6 shadow-elevated border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur max-w-[380px]">
          {/* Logo Brand Brand Area */}
          <div className="flex items-center gap-2 mb-4 justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">UCOMMERZ</span>
          </div>

          {/* Render general error if any */}
          {error && (
            <div className="mb-3 p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex items-center gap-2 animate-shake">
              <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}

          {/* FORGOT PASSWORD FORM PANEL */}
          {tab === 'forgot' ? (
            <div className="space-y-4 min-h-[310px] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 -ml-1">
                  <button 
                    onClick={() => {
                      setTab('signin');
                      setError('');
                    }}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reset Credentials</span>
                </div>

                {forgotSuccess ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">Recovery Email Sent</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      A secure password reset link has been dispatched to <span className="font-semibold text-slate-700 dark:text-slate-200">{forgotEmail}</span>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                      Input your registered email below, and we will send you secure options to restore access to your account.
                    </p>

                    <div className="space-y-1 text-left">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="pl-9 h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {forgotSuccess ? (
                <Button
                  onClick={() => {
                    setTab('signin');
                    setForgotSuccess(false);
                    setForgotEmail('');
                  }}
                  className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs hover:bg-indigo-700 transition-colors"
                >
                  Return to Sign In
                </Button>
              ) : (
                <Button
                  onClick={handleForgot}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors text-xs"
                >
                  {loading ? 'Processing...' : 'Send Recovery Link'}
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Tab Switcher matching exact layout requested by user */}
              <div className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setError('');
                  }}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    tab === 'signin'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setError('');
                  }}
                  className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Create account
                </button>
              </div>

              {/* Card content containing form panels */}
              <CardContent className="p-0">
                {/* Standardized Same-Height content wrapper */}
                <div className="h-[385px] overflow-y-auto scrollbar-none pr-0.5 text-left flex flex-col justify-between">
                  {/* SIGN IN VIEW */}
                  {tab === 'signin' && (
                    <form onSubmit={handleSignIn} className="space-y-4 my-auto">
                      <div className="space-y-1 text-left">
                        <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          <Input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-8 h-8.5 text-[11px]"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <div className="flex justify-between items-center">
                          <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
                          <button
                            type="button"
                            onClick={() => setTab('forgot')}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          <Input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-8 h-8.5 text-[11px]"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-lg transition-all text-xs"
                        >
                          {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* SIGN UP VIEW */}
                  {tab === 'signup' && (
                    <form onSubmit={handleSignUp} className="space-y-2.5">
                      {/* Full Name */}
                      <div className="space-y-1 text-left">
                        <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full name</label>
                        <div className="relative">
                          <UserIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          <Input
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-8 h-8.5 text-[11px]"
                            placeholder="Alex Rivera"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-1 text-left">
                        <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          <Input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-8 h-8.5 text-[11px]"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1 text-left">
                        <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          <Input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-8 h-8.5 text-[11px]"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      {/* Phone with Auto Country Code Selector */}
                      <div className="space-y-1 text-left">
                        <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Phone number</label>
                        <div className="relative flex items-center border border-input rounded-lg bg-transparent focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 overflow-hidden h-8.5 transition-colors dark:bg-input/30">
                          <div className="flex items-center px-2 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full shrink-0">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer py-1"
                            >
                              {countries.map((c) => (
                                <option key={c.code + c.label} value={c.code} className="dark:bg-slate-950 text-slate-800 dark:text-slate-200">
                                  {c.flag} {c.code}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="relative flex-1 h-full flex items-center">
                            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={handlePhoneChange}
                              className="w-full h-full bg-transparent pl-8 pr-2 text-[11px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none border-none focus:outline-none"
                              placeholder="0171234567"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Role selection */}
                      <div className="space-y-1 text-left">
                        <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">I want to</label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['seeker', 'provider', 'both'] as const).map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRole(r)}
                              className={`cursor-pointer rounded-lg border py-1 text-center text-[10px] font-bold transition-all ${
                                role === r 
                                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/40'
                              }`}
                            >
                              {r === 'seeker' ? 'Book' : r === 'provider' ? 'Offer' : 'Both'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bio Field if Provider or Both selected */}
                      {(role === 'provider' || role === 'both') ? (
                        <div className="space-y-1 text-left animate-fade-in">
                          <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Professional Bio</label>
                          <div className="relative">
                            <FileText className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                            <textarea
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Tell clients about your skills..."
                              rows={1}
                              className="w-full text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-2 py-1.5 bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none h-8"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="h-8 shrink-0" /> // Spacer matching the bio field so form height does not jump
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 rounded-lg transition-all text-xs"
                      >
                        {loading ? 'Creating...' : 'Create account'}
                      </Button>
                    </form>
                  )}
                </div>

                {/* Divider */}
                <div className="my-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[9px] font-extrabold text-slate-400 tracking-wider">OR</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Google Authentication Button */}
                <Button
                  variant="outline"
                  className="w-full border-slate-200 dark:border-slate-800 h-9 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  onClick={handleGoogle}
                  disabled={loading}
                >
                  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
                  </svg>
                  <span>Continue with Google</span>
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
