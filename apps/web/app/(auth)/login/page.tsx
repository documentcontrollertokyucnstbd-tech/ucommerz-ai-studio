'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthCardWrapper } from '@/components/AuthCardWrapper';

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast.success('Welcome back to UCOMMERZ!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'OAuth error occurred.');
    }
  };

  return (
    <AuthCardWrapper mode="login">
      <div className="h-[280px] flex flex-col justify-between">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "pl-8 h-8.5 text-[11px]",
                  isDark
                    ? "bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                )}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "pl-8 pr-8 h-8.5 text-[11px]",
                  isDark
                    ? "bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                )}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors",
                  isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-lg transition-all text-xs"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-2">
          <div className={cn(
            "h-px flex-1",
            isDark ? "bg-slate-800" : "bg-slate-200"
          )} />
          <span className="text-[9px] font-extrabold text-slate-400 tracking-wider">OR</span>
          <div className={cn(
            "h-px flex-1",
            isDark ? "bg-slate-800" : "bg-slate-200"
          )} />
        </div>

        {/* Google Sign In */}
        <Button
          variant="outline"
          className={cn(
            "w-full h-9 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all",
            isDark
              ? "border-slate-700 hover:bg-slate-800 text-slate-300"
              : "border-slate-200 hover:bg-slate-50 text-slate-700"
          )}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          <span>Continue with Google</span>
        </Button>
      </div>
    </AuthCardWrapper>
  );
}
