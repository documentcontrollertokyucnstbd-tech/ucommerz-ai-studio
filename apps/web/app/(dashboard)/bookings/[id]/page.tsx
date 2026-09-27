import React, { useState } from 'react';
import { Calendar, Clock, DollarSign, User as UserIcon, ShieldAlert, ChevronLeft, Check, X, Star } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { MockDatabase } from '@/src/lib/mockStore';
import { Booking, BookingStatus, UserRole } from '@/src/types';

interface BookingDetailPageProps {
  bookingId: string;
  onBack: () => void;
  onStatusUpdated: () => void;
}

export default function BookingDetailPage({ bookingId, onBack, onStatusUpdated }: BookingDetailPageProps) {
  const currentUser = MockDatabase.getCurrentUser();
  const booking = MockDatabase.getBookings().find(b => b.id === bookingId);

  const [cancelReason, setCancelReason] = useState('');
  const [showCancelArea, setShowCancelArea] = useState(false);

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-rose-500 font-bold">Booking reservation record not found.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const handleUpdateStatus = (nextStatus: BookingStatus, extra: Partial<Booking> = {}) => {
    if (!currentUser) return;
    const allBookings = MockDatabase.getBookings();
    const updated = allBookings.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: nextStatus,
          updated_at: new Date().toISOString(),
          ...extra
        };
      }
      return b;
    });

    MockDatabase.saveBookings(updated);
    MockDatabase.logActivity(currentUser.id, `BOOKING_${nextStatus}`, 'BOOKING', bookingId, `Updated status to ${nextStatus}`);
    onStatusUpdated();
  };

  const isProvider = currentUser && (currentUser.id === booking.provider_id);

  return (
    <div className="space-y-6 text-left">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-bold cursor-pointer">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Bookings</span>
      </button>

      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/40 pb-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Job Booking Details</span>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">{booking.service_title}</CardTitle>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {booking.status}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Appointment Date</span>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {new Date(booking.booking_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Time & Duration</span>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {new Date(booking.booking_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({booking.duration} minutes)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Total Price Surcharge</span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                    ${booking.total_price}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">
                    {isProvider ? 'Client Recipient' : 'Service Provider'}
                  </span>
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    {isProvider ? booking.seeker_name : booking.provider_name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Service Request Notes</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">"{booking.notes}"</p>
            </div>
          )}

          {/* Action buttons based on state */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 flex flex-wrap gap-2.5 justify-end">
            {booking.status === BookingStatus.PENDING && isProvider && (
              <>
                <Button onClick={() => handleUpdateStatus(BookingStatus.CONFIRMED)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  <Check className="w-4 h-4" />
                  Accept Reservation
                </Button>
                <Button onClick={() => handleUpdateStatus(BookingStatus.CANCELLED)} variant="destructive">
                  <X className="w-4 h-4" />
                  Decline Job
                </Button>
              </>
            )}

            {booking.status === BookingStatus.CONFIRMED && isProvider && (
              <Button onClick={() => handleUpdateStatus(BookingStatus.IN_PROGRESS)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                Start Service Session
              </Button>
            )}

            {booking.status === BookingStatus.IN_PROGRESS && isProvider && (
              <Button onClick={() => handleUpdateStatus(BookingStatus.COMPLETED)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Mark Job Completed
              </Button>
            )}

            {booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.COMPLETED && (
              <div className="w-full flex flex-col gap-2 mt-4 items-end">
                {!showCancelArea ? (
                  <Button onClick={() => setShowCancelArea(true)} variant="outline" className="text-xs">
                    Cancel This Booking
                  </Button>
                ) : (
                  <div className="w-full max-w-md space-y-2 text-right">
                    <textarea
                      placeholder="Reason for cancellation..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => setShowCancelArea(false)} variant="ghost" className="text-xs h-7">Discard</Button>
                      <Button onClick={() => handleUpdateStatus(BookingStatus.CANCELLED, { cancellation_reason: cancelReason })} variant="destructive" className="text-xs h-7">
                        Confirm Cancellation
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
