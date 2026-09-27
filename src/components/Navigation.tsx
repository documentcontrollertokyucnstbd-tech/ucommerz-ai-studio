import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MockDatabase } from '../lib/mockStore';
import Notifications from './Notifications';
import { 
  Briefcase, Search, Calendar, MessageSquare, Heart, Shield, Settings, 
  LogOut, LogIn, UserCheck, Menu, X, LayoutDashboard, History, Bell, MailOpen,
  Sun, Moon, Sparkles
} from 'lucide-react';

interface NavigationProps {
  currentUser: User | null;
  onNavigateToView: (view: string) => void;
  currentView: string;
  onLogout: () => void;
  onOpenLogin: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (subCat: string) => void;
  subCategories: string[];
}

export default function Navigation({
  currentUser,
  onNavigateToView,
  currentView,
  onLogout,
  onOpenLogin,
  theme,
  onToggleTheme,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  subCategories
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isProvider = currentUser && (currentUser.role === UserRole.PROVIDER || currentUser.role === UserRole.BOTH);
  const isSeeker = currentUser && (currentUser.role === UserRole.SEEKER || currentUser.role === UserRole.BOTH);
  const isAdmin = currentUser && currentUser.role === UserRole.ADMIN;

  const handleNavClick = (view: string) => {
    onNavigateToView(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo Brand */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('browse')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
                U
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                U<span className="text-indigo-600 dark:text-indigo-400">COMMERZ</span>
              </span>
            </button>
          </div>

          {/* Desktop Nav Subcategories (or Default Badge) */}
          <div className="hidden md:flex items-center max-w-[50%] lg:max-w-[60%] shrink-0 px-4 min-w-0">
            {currentView === 'browse' && selectedCategory !== 'all' && subCategories.length > 0 ? (
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none select-none">
                <button
                  onClick={() => setSelectedSubCategory('all')}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                    selectedSubCategory === 'all'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  ALL SPECIALTIES
                </button>
                {subCategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-3 py-1 text-[11px] font-extrabold rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                      selectedSubCategory === sub
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sub.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Direct Peer Marketplace &bull; Commission-Free</span>
              </div>
            )}
          </div>

          {/* Action Profile Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme switcher */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus:outline-none"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2.5">
                {/* Notifications Icon dropdown */}
                <Notifications userId={currentUser.id} onNavigateToView={handleNavClick} />

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 rounded-full p-0.5 cursor-pointer"
                  >
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                      alt={currentUser.full_name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hidden lg:inline max-w-[100px] truncate">
                      {currentUser.full_name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-30 overflow-hidden animate-fade-in text-left">
                        <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.full_name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{currentUser.email}</p>
                          <span className="inline-block bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold px-1 rounded-sm mt-1">
                            {currentUser.role}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleNavClick('history')}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:dark:text-slate-100 flex items-center gap-2"
                        >
                          <History className="w-3.5 h-3.5 text-slate-500" />
                          <span>Activity Log</span>
                        </button>

                        {isProvider && (
                          <button
                            onClick={() => handleNavClick('provider-settings')}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:dark:text-slate-100 flex items-center gap-2"
                          >
                            <Settings className="w-3.5 h-3.5 text-slate-500" />
                            <span>Provider Settings</span>
                          </button>
                        )}

                        <button
                          onClick={onLogout}
                          className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:dark:text-rose-300 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Join Platform</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors focus:outline-none"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {currentUser && (
              <Notifications userId={currentUser.id} onNavigateToView={handleNavClick} />
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-4 shadow-inner space-y-1">
          <button
            onClick={() => handleNavClick('browse')}
            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${
              currentView === 'browse'
                ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Explore Services</span>
          </button>

          {currentUser && isSeeker && (
            <>
              <button
                onClick={() => handleNavClick('bookings')}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${
                  currentView === 'bookings'
                    ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>My Bookings</span>
              </button>
              <button
                onClick={() => handleNavClick('favorites')}
                className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${
                  currentView === 'favorites'
                    ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Favorites</span>
              </button>
            </>
          )}

          {currentUser && isProvider && (
            <button
              onClick={() => handleNavClick('provider-dashboard')}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${
                currentView.startsWith('provider')
                  ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Provider Hub</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => handleNavClick('messages')}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${
                currentView === 'messages'
                  ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2 ${
                currentView === 'admin'
                  ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Platform Admin</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => handleNavClick('history')}
              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              <span>Activity Log</span>
            </button>
          )}

          {currentUser ? (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2 text-left">
              <div className="flex items-center gap-3 px-3 py-1.5">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                  alt={currentUser.full_name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.full_name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[180px]">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg flex items-center gap-2 mt-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow"
              >
                <LogIn className="w-4 h-4" />
                <span>Join Platform</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
