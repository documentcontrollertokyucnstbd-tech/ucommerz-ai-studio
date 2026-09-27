import React, { useState, useEffect } from 'react';
import { MockDatabase } from './lib/mockStore';
import { User, UserRole } from './types';
import Navigation from './components/Navigation';
import AuthPages from './components/AuthPages';
import BrowseView from './components/BrowseView';
import ServiceDetail from './components/ServiceDetail';
import BookingsView from './components/BookingsView';
import CalendarView from './components/CalendarView';
import MessagesView from './components/MessagesView';
import ProviderDashboard from './components/ProviderDashboard';
import SeekerDashboard from './components/SeekerDashboard';
import AdminPanel from './components/AdminPanel';
import ServiceCreate from './components/ServiceCreate';
import ProviderProfileSetup from './components/ProviderProfileSetup';
import ProviderSettings from './components/ProviderSettings';
import ProviderApplications from './components/ProviderApplications';
import Notifications from './components/Notifications';
import { 
  Compass, Calendar, ShieldAlert, Sparkles, MessageSquare, LayoutDashboard, Settings, Award,
  Terminal, Home, Heart, GraduationCap, Palette
} from 'lucide-react';

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Terminal': return Terminal;
    case 'Home': return Home;
    case 'Heart': return Heart;
    case 'GraduationCap': return GraduationCap;
    case 'Palette': return Palette;
    default: return Compass;
  }
};

const PREDEFINED_SUBCATEGORIES: Record<string, string[]> = {
  'cat-1': ['Web Development', 'Consulting', 'Mobile Apps', 'DevOps & Cloud'],
  'cat-2': ['Cleaning', 'Handyman', 'Gardening', 'Interior Design'],
  'cat-3': ['Yoga', 'Personal Training', 'Meditation', 'Nutrition coaching'],
  'cat-4': ['Math & Science', 'Languages', 'Test Prep', 'Coding for Kids'],
  'cat-5': ['Graphic Design', 'Photography', 'Video Editing', 'UX/UI Design']
};

export default function App() {
  const [currentView, setCurrentView] = useState<string>('browse');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  // Lifted category & subcategory state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  
  // Track current logged in user
  const [currentUser, setCurrentUser] = useState<User | null>(() => MockDatabase.getCurrentUser());

  // Find subcategories for the selected category
  const subCategories = React.useMemo(() => {
    if (selectedCategory === 'all') return [];
    const defaults = PREDEFINED_SUBCATEGORIES[selectedCategory] || [];
    const uniqueFromServices = MockDatabase.getServices()
      .filter(s => s.status === 'ACTIVE' && s.category === selectedCategory && s.sub_category)
      .map(s => s.sub_category);
    
    const merged = new Set([...defaults, ...uniqueFromServices]);
    return Array.from(merged);
  }, [selectedCategory]);

  // Theme state supporting Elegant Light / Elegant Dark
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ucommerz_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('ucommerz_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen for user/auth updates triggered from inside subcomponents
  useEffect(() => {
    const handleStoreUpdate = () => {
      setCurrentUser(MockDatabase.getCurrentUser());
    };

    window.addEventListener('ucommerz_store_update', handleStoreUpdate);
    return () => {
      window.removeEventListener('ucommerz_store_update', handleStoreUpdate);
    };
  }, []);

  const handleLogout = () => {
    MockDatabase.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentView('browse');
    alert('Logged out successfully.');
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCurrentView('service-detail');
  };

  // Render correct panel based on current routing state
  const renderView = () => {
    switch (currentView) {
      case 'login':
      case 'register':
      case 'forgot-password':
        return (
          <div className="max-w-md mx-auto py-10">
            <AuthPages 
              initialMode={currentView === 'login' ? 'login' : 'register'} 
              onAuthSuccess={(user) => {
                setCurrentUser(user);
                if (user?.role === UserRole.ADMIN) {
                  setCurrentView('admin');
                } else if (user?.role === UserRole.PROVIDER || user?.role === UserRole.BOTH) {
                  setCurrentView('provider-dashboard');
                } else {
                  setCurrentView('browse');
                }
              }}
              onClose={() => setCurrentView('browse')}
            />
          </div>
        );

      case 'browse':
        return (
          <BrowseView 
            onServiceSelect={handleServiceSelect} 
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedSubCategory('all');
            }}
            selectedSubCategory={selectedSubCategory}
            setSelectedSubCategory={setSelectedSubCategory}
          />
        );

      case 'service-detail':
        if (!selectedServiceId) {
          setCurrentView('browse');
          return null;
        }
        return (
          <ServiceDetail 
            serviceId={selectedServiceId} 
            onBack={() => setCurrentView('browse')} 
            onNavigateToView={(view) => setCurrentView(view)}
          />
        );

      case 'bookings':
        return <BookingsView onNavigateToView={(view) => setCurrentView(view)} />;

      case 'calendar':
        return <CalendarView />;

      case 'messages':
        return <MessagesView />;

      case 'provider-dashboard':
        return <ProviderDashboard onNavigateToView={(view) => setCurrentView(view)} />;

      case 'seeker-dashboard':
        return (
          <SeekerDashboard 
            onServiceSelect={handleServiceSelect} 
            onNavigateToView={(view) => setCurrentView(view)}
          />
        );

      case 'admin':
        return <AdminPanel />;

      case 'service-create':
        return (
          <ServiceCreate 
            onSuccess={() => {
              setCurrentView('provider-dashboard');
            }} 
          />
        );

      case 'provider-profile-setup':
        return <ProviderProfileSetup />;

      case 'provider-settings':
        return <ProviderSettings />;

      case 'provider-applications':
        return (
          <ProviderApplications 
            onSuccess={() => {
              setCurrentView('provider-dashboard');
            }} 
          />
        );

      default:
        return (
          <BrowseView 
            onServiceSelect={handleServiceSelect} 
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedSubCategory('all');
            }}
            selectedSubCategory={selectedSubCategory}
            setSelectedSubCategory={setSelectedSubCategory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Platform Navigation */}
      <Navigation 
        currentUser={currentUser}
        currentView={currentView} 
        onNavigateToView={setCurrentView} 
        onLogout={handleLogout} 
        onOpenLogin={() => setCurrentView('login')}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubCategory('all');
        }}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        subCategories={subCategories}
      />

      {/* Main Container Stage */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row min-h-0">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shrink-0 justify-between transition-all duration-200">
          <div className="space-y-6">
            
            {/* Service Categories (Sidebar Main Categories Navigation) */}
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-3">
                Service Categories
              </p>
              
              <button 
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubCategory('all');
                  setCurrentView('browse');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  currentView === 'browse' && selectedCategory === 'all'
                    ? 'bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>All Categories</span>
              </button>

              {MockDatabase.getCategories().filter(c => c.is_active).map(cat => {
                const IconComponent = getCategoryIcon(cat.icon);
                const isSelected = currentView === 'browse' && selectedCategory === cat.id;
                return (
                  <button 
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubCategory('all');
                      setCurrentView('browse');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Customer Workspace / Personal Hub */}
            {currentUser && (
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-3">
                  My Workspace
                </p>
                <button 
                  onClick={() => setCurrentView('bookings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    currentView === 'bookings'
                      ? 'bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>My Bookings</span>
                </button>

                <button 
                  onClick={() => setCurrentView('messages')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    currentView === 'messages'
                      ? 'bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Direct Inbox</span>
                </button>
              </div>
            )}

            {/* Provider Tools Group */}
            {currentUser && (currentUser.role === UserRole.PROVIDER || currentUser.role === UserRole.BOTH) && (
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-3">
                  Business Operations
                </p>
                
                <button 
                  onClick={() => setCurrentView('provider-dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    currentView === 'provider-dashboard'
                      ? 'bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-violet-500" />
                  <span>Provider Hub</span>
                </button>

                <button 
                  onClick={() => setCurrentView('calendar')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    currentView === 'calendar'
                      ? 'bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>Work Calendar</span>
                </button>

                <button 
                  onClick={() => setCurrentView('provider-settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    currentView === 'provider-settings'
                      ? 'bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Settings className="w-4 h-4 text-rose-500" />
                  <span>Business Settings</span>
                </button>
              </div>
            )}

            {/* Admin Tools Group */}
            {currentUser && currentUser.role === UserRole.ADMIN && (
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-3">
                  Control Room
                </p>
                <button 
                  onClick={() => setCurrentView('admin')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    currentView === 'admin'
                      ? 'bg-indigo-600/10 dark:bg-indigo-600/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/10 dark:border-indigo-500/20 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-pink-500" />
                  <span>Admin Shield</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Card & Status Anchor */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Brokerage-free Promotion Card (Slimmer and more compact) */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-850 text-left transition-colors">
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Brokerage Free</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Direct peer deals mean zero commission cuts. Keep 100% of your earnings.
              </p>
            </div>

            {/* Interactive Current User Anchor Card */}
            {currentUser && (
              <div className="flex items-center gap-2.5 px-1 py-0.5">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                  alt={currentUser.full_name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 truncate leading-tight">
                    {currentUser.full_name}
                  </p>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    {currentUser.role} Account
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="space-y-6">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Footer Details */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 py-6 text-center text-xs text-slate-400 font-semibold mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight text-sm">UCOMMERZ</span>
            <span className="text-[10px] text-slate-500 font-medium">© 2026 Direct Service Marketplace platform</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <a href="#privacy" className="hover:text-indigo-400 transition-colors">Privacy Principles</a>
            <a href="#terms" className="hover:text-indigo-400 transition-colors">Brokerage-Free Terms</a>
            <a href="#trust" className="hover:text-indigo-400 transition-colors">Trust Audits</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
