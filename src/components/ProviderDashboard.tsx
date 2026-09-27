import React, { useState } from 'react';
import { Booking, BookingStatus, Service, User } from '../types';
import { MockDatabase } from '../lib/mockStore';
import ReviewStars from './ReviewStars';
import { 
  DollarSign, Calendar, Star, Users, TrendingUp, Sparkles, Check, X, Play, 
  CheckCircle2, ArrowRight, ToggleLeft, ToggleRight, PlusCircle, LayoutDashboard, Settings
} from 'lucide-react';

interface ProviderDashboardProps {
  onNavigateToView: (view: string) => void;
}

export default function ProviderDashboard({ onNavigateToView }: ProviderDashboardProps) {
  const currentUser = MockDatabase.getCurrentUser();

  const [services, setServices] = useState<Service[]>(() => {
    if (!currentUser) return [];
    return MockDatabase.getServices().filter(s => s.provider_id === currentUser.id);
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (!currentUser) return [];
    return MockDatabase.getBookings().filter(b => b.provider_id === currentUser.id);
  });

  // Calculate stats
  const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED);
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_price, 0);
  const averageRating = currentUser ? currentUser.rating : 5.0;
  const uniqueCustomers = new Set(bookings.map(b => b.seeker_id)).size;

  // Handle active status toggle for service
  const handleToggleServiceStatus = (serviceId: string) => {
    const allServices = MockDatabase.getServices();
    const updated = allServices.map(s => {
      if (s.id === serviceId) {
        const nextStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...s, status: nextStatus as any };
      }
      return s;
    });
    MockDatabase.saveServices(updated);
    if (currentUser) {
      setServices(updated.filter(s => s.provider_id === currentUser.id));
    }
  };

  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus) => {
    if (!currentUser) return;
    const allBookings = MockDatabase.getBookings();
    const updated = allBookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status, updated_at: new Date().toISOString() };
      }
      return b;
    });
    MockDatabase.saveBookings(updated);
    setBookings(updated.filter(b => b.provider_id === currentUser.id));

    // Log & notify
    MockDatabase.logActivity(currentUser.id, `BOOKING_${status}`, 'BOOKING', bookingId, `Updated booking state to ${status.toLowerCase()}`);
  };

  const pendingRequests = bookings.filter(b => b.status === BookingStatus.PENDING);

  // SVG Chart: Revenue over past 5 months (Simulated)
  const chartData = [
    { label: 'Mar', value: 340 },
    { label: 'Apr', value: 450 },
    { label: 'May', value: 720 },
    { label: 'Jun', value: 610 },
    { label: 'Jul', value: totalRevenue }
  ];
  const maxChartValue = Math.max(...chartData.map(d => d.value)) || 1000;

  if (!currentUser) {
    return <div className="text-center py-12 text-rose-500 font-bold">Please log in to view the dashboard.</div>;
  }

  return (
    <div className="space-y-6 text-left">
      {/* Upper Brand panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Provider Management Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Welcome back, {currentUser.full_name}!
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-md">
            Review your client bookings, analytics charts, services, and check active reservations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigateToView('provider-profile-setup')}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/5 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Profile & Skills</span>
          </button>
          <button
            onClick={() => onNavigateToView('service-create')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List New Service</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left transition-colors">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Total Revenue</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">${totalRevenue}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left transition-colors">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Total Orders</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">{bookings.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left transition-colors">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
            <Star className="w-5 h-5 fill-amber-500/10" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Average Rating</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">{averageRating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left transition-colors">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Total Clients</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">{uniqueCustomers}</span>
          </div>
        </div>
      </div>

      {/* Double columns graphs & reservations layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Analytics Chart Column */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Monthly Revenue Trends</h3>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Income tracking from completed works</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          {/* SVG representation of Bar Chart */}
          <div className="flex items-end justify-between h-40 pt-4 px-2">
            {chartData.map((d, i) => {
              const heightPercent = maxChartValue > 0 ? (d.value / maxChartValue) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center flex-1 space-y-2">
                  <div className="w-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-t-sm transition-all relative group" style={{ height: `${heightPercent}px`, minHeight: '4px' }}>
                    {/* Tooltip */}
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-950 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono whitespace-nowrap shadow-md">
                      ${d.value}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold font-mono">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Requests Column (Col span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Pending Customer Orders ({pendingRequests.length})</h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Accept or reject newly created appointments</p>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
              No pending service orders requests. All caught up!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {pendingRequests.map((req) => (
                <div key={req.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">${req.total_price} • {req.duration} mins</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{req.service_title}</h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">Date: {new Date(req.booking_date).toLocaleDateString()} • Client: {req.seeker_name}</p>
                  </div>
                  <div className="flex gap-1.5 self-end">
                    <button
                      onClick={() => handleUpdateBookingStatus(req.id, BookingStatus.CONFIRMED)}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateBookingStatus(req.id, BookingStatus.CANCELLED)}
                      className="px-2 py-1 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Services Listings Management list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">My Service Listings ({services.length})</h3>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Activate, deactivate, or edit your service directories</p>
        </div>

        {services.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            No service listings found. Click "List New Service" above to start earning!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((srv) => (
              <div key={srv.id} className="p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl flex flex-col justify-between text-left space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${srv.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                      {srv.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono">${srv.price}/{srv.price_unit}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate max-w-full">{srv.title}</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 line-clamp-1">{srv.description}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-800/40">
                  <button
                    onClick={() => handleToggleServiceStatus(srv.id)}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {srv.status === 'ACTIVE' ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-500" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
