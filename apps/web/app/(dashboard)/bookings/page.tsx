import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, DollarSign, User as UserIcon, ShieldAlert, ChevronRight, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { MockDatabase } from '@/src/lib/mockStore';
import { Booking, BookingStatus, UserRole } from '@/src/types';

interface BookingsPageProps {
  onSelectBooking: (bookingId: string) => void;
  onNavigateToView: (view: string) => void;
}

export default function BookingsPage({ onSelectBooking, onNavigateToView }: BookingsPageProps) {
  const currentUser = MockDatabase.getCurrentUser();

  const [bookings] = useState<Booking[]>(() => {
    if (!currentUser) return [];
    const isProv = currentUser.role === UserRole.PROVIDER || currentUser.role === UserRole.BOTH;
    return MockDatabase.getBookings().filter(b => 
      isProv ? b.provider_id === currentUser.id : b.seeker_id === currentUser.id
    );
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">PENDING</span>;
      case BookingStatus.CONFIRMED:
        return <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/30 text-blue-800 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">CONFIRMED</span>;
      case BookingStatus.IN_PROGRESS:
        return <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/30 text-purple-800 dark:text-purple-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">IN PROGRESS</span>;
      case BookingStatus.COMPLETED:
        return <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">COMPLETED</span>;
      case BookingStatus.CANCELLED:
        return <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">CANCELLED</span>;
      default:
        return null;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12 text-rose-500 font-bold">
        Please log in to view bookings.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">Reservations Ledger</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track and manage your upcoming schedule and service history
          </p>
        </div>
        <Button onClick={() => onNavigateToView('browse')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8 rounded-lg cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          Explore Services
        </Button>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
              No reservation logs found. Book your first job above!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40 text-left">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => onSelectBooking(booking.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                          {booking.service_title}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        Date: {formatDate(booking.booking_date)} ({booking.duration} mins)
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        {currentUser.role === UserRole.PROVIDER ? 'Client' : 'Provider'}: {currentUser.role === UserRole.PROVIDER ? booking.seeker_name : booking.provider_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 pb-1">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                      ${booking.total_price}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
