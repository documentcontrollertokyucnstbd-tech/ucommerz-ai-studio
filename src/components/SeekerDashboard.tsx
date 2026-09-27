import React, { useState } from 'react';
import { Booking, BookingStatus, Service, User } from '../types';
import { MockDatabase } from '../lib/mockStore';
import ReviewStars from './ReviewStars';
import ActivityHistory from './ActivityHistory';
import { 
  Heart, Calendar, CreditCard, Sparkles, AlertCircle, ArrowRight, User as UserIcon, MapPin 
} from 'lucide-react';

interface SeekerDashboardProps {
  onServiceSelect: (serviceId: string) => void;
  onNavigateToView: (view: string) => void;
}

export default function SeekerDashboard({ onServiceSelect, onNavigateToView }: SeekerDashboardProps) {
  const currentUser = MockDatabase.getCurrentUser();

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (!currentUser) return [];
    return MockDatabase.getBookings().filter(b => b.seeker_id === currentUser.id);
  });

  const [favorites, setFavorites] = useState<Service[]>(() => {
    if (!currentUser) return [];
    const favIds = MockDatabase.getFavorites()
      .filter(f => f.user_id === currentUser.id)
      .map(f => f.service_id);
    return MockDatabase.getServices().filter(s => favIds.includes(s.id));
  });

  // Profile forms fields
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const allUsers = MockDatabase.getUsers();
    const updatedUser = {
      ...currentUser,
      full_name: fullName,
      phone,
      bio,
      location,
      updated_at: new Date().toISOString()
    };

    const updatedList = allUsers.map(u => u.id === currentUser.id ? updatedUser : u);
    MockDatabase.saveUsers(updatedList);
    MockDatabase.setCurrentUser(updatedUser);

    // Write audit activity log
    MockDatabase.logActivity(
      currentUser.id,
      'PROFILE_UPDATE',
      'USER',
      currentUser.id,
      `Updated user profile metadata information`
    );

    setSuccess('Personal credentials saved successfully!');
    setTimeout(() => {
      setSuccess('');
    }, 2000);
  };

  const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED);
  const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price, 0);

  if (!currentUser) {
    return <div className="text-center py-12 text-rose-500 font-bold">Please log in to view dashboard.</div>;
  }

  return (
    <div className="space-y-6 text-left">
      {/* Seeker Greeting Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Seeker Account Panel</span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Howdy, {currentUser.full_name}!</h1>
          <p className="text-slate-300 text-xs">Track active bookings, favorite listings, and review logs from one direct dashboard.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Double Columns: Bookings & Favorites */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Bookings Status panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Active Booking Reservations ({bookings.length})</h3>
              <button onClick={() => onNavigateToView('bookings')} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {bookings.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center font-medium">No bookings yet. Start browsing professional services listings!</p>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                {bookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs gap-3">
                    <div>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        b.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {b.status}
                      </span>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mt-1">{b.service_title}</h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">Date: {new Date(b.booking_date).toLocaleDateString()} • Provider: {b.provider_name}</p>
                    </div>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">${b.total_price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Favorites list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">My Saved Favorites ({favorites.length})</h3>
            
            {favorites.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center font-medium">No favorite listings saved. Click bookmarks on search lists to add!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => onServiceSelect(fav.id)}
                    className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-400/50 transition-colors flex gap-3 cursor-pointer text-left"
                  >
                    <img src={fav.images[0]} alt={fav.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate leading-snug">{fav.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold mt-1">${fav.price}/{fav.price_unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity audit history logs logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Audit Activity Logs</h3>
            <ActivityHistory logs={MockDatabase.getActivityLogs().filter(log => log.user_id === currentUser.id)} />
          </div>
        </div>

        {/* Right Sidebar: Profiles management form & analytics */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">Spending Ledger</h3>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-100 dark:border-slate-800 rounded-xl">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Total Outflow Spent</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">${totalSpent}</span>
              </div>
            </div>
          </div>

          {/* Seeker Profile forms */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">Personal Information</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              {success && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold rounded-lg">
                  {success}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">Full Display Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">Contact Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">Physical Address Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">Biographical Description</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
