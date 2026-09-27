'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  Mail, Lock, User, Phone, Eye, EyeOff,
  ChevronDown, Search, Wrench, Star
} from 'lucide-react';
import { AuthCardWrapper } from '@/components/AuthCardWrapper';

const COUNTRIES = [
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [role, setRole] = useState<'seeker' | 'provider' | 'both'>('seeker');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullPhoneNumber = `${selectedCountry.code}${phone.replace(/\D/g, '')}`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: fullPhoneNumber,
            role: role,
            bio: role !== 'seeker' ? bio : undefined,
          },
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;

      toast.success('Registration successful! Please check your email for confirmation.');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardWrapper mode="register">
      <div className="h-[420px] overflow-y-auto scrollbar-none pr-0.5 flex flex-col justify-between">
        <form onSubmit={handleRegister} className="space-y-3 pb-2">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={cn(
                  "pl-8 h-8 text-[11px]",
                  isDark
                    ? "bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                )}
                placeholder="Alex Johnson"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="flex gap-1.5 relative">
              {/* Country Picker Button */}
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className={cn(
                  "h-8 px-2 rounded-lg border flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer shrink-0",
                  isDark
                    ? "bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"
                )}
              >
                <span>{selectedCountry.flag}</span>
                <span className="font-bold text-[10px]">{selectedCountry.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Country Selector Dropdown */}
              {showCountryDropdown && (
                <div className={cn(
                  "absolute top-9 left-0 z-20 w-[180px] rounded-lg border shadow-lg max-h-40 overflow-y-auto p-1 py-1 animate-fade-in",
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
                )}>
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setShowCountryDropdown(false);
                      }}
                      className={cn(
                        "w-full px-2 py-1.5 rounded text-left text-[11px] flex items-center gap-2 cursor-pointer transition-colors",
                        isDark ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span>{country.flag}</span>
                      <span className="font-bold">{country.code}</span>
                      <span className="text-slate-400 text-[10px] truncate">{country.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Phone Input */}
              <div className="relative flex-1">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className={cn(
                    "pl-8 h-8 text-[11px]",
                    isDark
                      ? "bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                      : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                  )}
                  placeholder="0171234567"
                />
              </div>
            </div>
          </div>

          {/* Email */}
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
                  "pl-8 h-8 text-[11px]",
                  isDark
                    ? "bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                )}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "pl-8 pr-8 h-8 text-[11px]",
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

          {/* Role */}
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Select Platform Role
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setRole('seeker')}
                className={cn(
                  "p-1.5 text-center rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-0.5 justify-center",
                  role === 'seeker'
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : isDark
                      ? "bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                )}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Client</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={cn(
                  "p-1.5 text-center rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-0.5 justify-center",
                  role === 'provider'
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : isDark
                      ? "bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                )}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Provider</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('both')}
                className={cn(
                  "p-1.5 text-center rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer flex flex-col items-center gap-0.5 justify-center",
                  role === 'both'
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : isDark
                      ? "bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                )}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Both</span>
              </button>
            </div>
          </div>

          {/* Bio (only shown for Provider or Both) */}
          {(role === 'provider' || role === 'both') && (
            <div className="space-y-1 animate-scale-up">
              <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Professional Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your skills and services..."
                rows={2}
                className={cn(
                  "w-full text-[10px] rounded-lg p-2 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none border",
                  isDark
                    ? "bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                    : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                )}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 rounded-lg transition-all text-xs mt-1"
          >
            {loading ? 'Creating Account...' : 'Complete Sign Up'}
          </Button>
        </form>
      </div>
    </AuthCardWrapper>
  );
}
