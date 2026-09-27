import React, { useState } from 'react';
import { Booking, BookingStatus, UserRole } from '../types';
import { MockDatabase } from '../lib/mockStore';
import ReviewForm from './ReviewForm';
import { 
  Calendar, Check, X, Clock, DollarSign, User as UserIcon, ShieldAlert, 
  ChevronRight, Play, CheckCircle2, Star, RefreshCw, AlertTriangle, MessageSquare, CornerDownRight 
} from 'lucide-react';

interface BookingsViewProps {
  onNavigateToView: (view: string) => void;
}

export default function BookingsView({ onNavigateToView }: BookingsViewProps) {
  const currentUser = MockDatabase.getCurrentUser();

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (!currentUser) return [];
    const isProv = currentUser.role === UserRole.PROVIDER || currentUser.role === UserRole.BOTH;
    return MockDatabase.getBookings().filter(b => 
      isProv ? b.provider_id === currentUser.id : b.seeker_id === currentUser.id
    );
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  // Sync back state
  const reloadBookings = () => {
    if (!currentUser) return;
    const isProv = currentUser.role === UserRole.PROVIDER || currentUser.role === UserRole.BOTH;
    const updated = MockDatabase.getBookings().filter(b => 
      isProv ? b.provider_id === currentUser.id : b.seeker_id === currentUser.id
    );
    setBookings(updated);
    if (selectedBooking) {
      const reselected = updated.find(b => b.id === selectedBooking.id);
      setSelectedBooking(reselected || null);
    }
  };

  const updateStatus = (bookingId: string, nextStatus: BookingStatus, extra: Partial<Booking> = {}) => {
    if (!currentUser) return;

    const allBookings = MockDatabase.getBookings();
    const target = allBookings.find(b => b.id === bookingId);
    if (!target) return;

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

    // Write audit log
    MockDatabase.logActivity(
      currentUser.id,
      `BOOKING_${nextStatus}`,
      'BOOKING',
      bookingId,
      `Updated booking state of "${target.service_title}" to ${nextStatus.toLowerCase()}`
    );

    // Send notifications
    const targetNotificationRecipient = currentUser.id === target.seeker_id ? target.provider_id : target.seeker_id;
    MockDatabase.sendNotification(
      targetNotificationRecipient,
      'BOOKING',
      'Booking Status Updated',
      `Your booking for "${target.service_title}" is now ${nextStatus.toLowerCase()}`,
      `/bookings/${bookingId}`
    );

    reloadBookings();
  };

  const handleCancelBooking = (bookingId: string) => {
    updateStatus(bookingId, BookingStatus.CANCELLED, { cancellation_reason: cancelReason });
    setShowCancelModal(null);
    setCancelReason('');
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">PENDING</span>;
      case BookingStatus.CONFIRMED:
        return <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200/50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">CONFIRMED</span>;
      case BookingStatus.IN_PROGRESS:
        return <span className="inline-flex items-center gap-1 bg-purple-50 border border-purple-200/50 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">IN PROGRESS</span>;
      case BookingStatus.COMPLETED:
        return <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200/50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">COMPLETED</span>;
      case BookingStatus.CANCELLED:
        return <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200/50 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">CANCELLED</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">DISPUTED</span>;
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
      <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm mx-auto p-6">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Join Platform to Track Bookings</h3>
        <button
          onClick={() => onNavigateToView('browse')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
        >
          Browse Services
        </button>
      </div>
    );
  }

  const isProviderPerspective = currentUser.role === UserRole.PROVIDER || currentUser.role === UserRole.BOTH;

  return (
    <div className="space-y-6 text-left">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {isProviderPerspective ? 'Provider Service Orders' : 'My Service Bookings'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage your scheduled works, status milestones, and booking records.
          </p>
        </div>
        <button onClick={reloadBookings} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Bookings List col span 2 */}
        <div className="lg:col-span-2 space-y-3">
          {bookings.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">No Active Bookings</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                {isProviderPerspective 
                  ? "You haven't received any service orders yet. Complete your profile set-up and certification verifications to build customer trust."
                  : "You haven't created any service reservations yet. Start browsing now to book professional providers."
                }
              </p>
              <button
                onClick={() => onNavigateToView('browse')}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowReviewForm(false);
                }}
                className={`p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-sm hover:border-indigo-450/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left ${
                  selectedBooking?.id === booking.id 
                    ? 'border-indigo-600 dark:border-indigo-500 ring-1 ring-indigo-600/10 dark:ring-indigo-500/25' 
                    : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(booking.status)}
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">Order ID: {booking.id}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs tracking-tight truncate">
                    {booking.service_title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {formatDate(booking.booking_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {isProviderPerspective ? `Client: ${booking.seeker_name}` : `Provider: ${booking.provider_name}`}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block sm:hidden">Total Rate</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 font-mono">${booking.total_price}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 hidden sm:block" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detailed Booking Sidebar col */}
        <div className="space-y-4">
          {selectedBooking ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-left animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Milestone Details</span>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm tracking-tight">{selectedBooking.service_title}</h3>
                <div className="mt-2">{getStatusBadge(selectedBooking.status)}</div>
              </div>

              {/* Scope details */}
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Order Reference:</span>
                  <span className="font-mono font-bold text-slate-880 dark:text-slate-200">{selectedBooking.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Scheduled Time:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-right max-w-[150px]">{formatDate(selectedBooking.booking_date)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Duration:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{selectedBooking.duration} mins</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Client Name:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{selectedBooking.seeker_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Provider Name:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{selectedBooking.provider_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/50 text-indigo-650 dark:text-indigo-400 font-bold">
                  <span>Grand Total:</span>
                  <span className="font-mono text-sm">${selectedBooking.total_price}</span>
                </div>

                {selectedBooking.notes && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-lg space-y-1 mt-1">
                    <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Client Work scope:</span>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 italic">"{selectedBooking.notes}"</p>
                  </div>
                )}

                {selectedBooking.cancellation_reason && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg space-y-1 mt-1">
                    <span className="block text-[9px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Cancellation Reason:
                    </span>
                    <p className="text-[10px] text-rose-600 dark:text-rose-300 italic">"{selectedBooking.cancellation_reason}"</p>
                  </div>
                )}
              </div>

              {/* Status workflow triggers */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {/* 1. PROVIDER WORKFLOW */}
                {isProviderPerspective && selectedBooking.status === BookingStatus.PENDING && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateStatus(selectedBooking.id, BookingStatus.CONFIRMED)}
                      className="py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-4.5 h-4.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => updateStatus(selectedBooking.id, BookingStatus.CANCELLED, { cancellation_reason: 'Rejected by service provider' })}
                      className="py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-4.5 h-4.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {isProviderPerspective && selectedBooking.status === BookingStatus.CONFIRMED && (
                  <button
                    onClick={() => updateStatus(selectedBooking.id, BookingStatus.IN_PROGRESS)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Appointment Session</span>
                  </button>
                )}

                {isProviderPerspective && selectedBooking.status === BookingStatus.IN_PROGRESS && (
                  <button
                    onClick={() => updateStatus(selectedBooking.id, BookingStatus.COMPLETED, { completed_at: new Date().toISOString() })}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Appointment Completed</span>
                  </button>
                )}

                {/* 2. SEEKER WORKFLOW */}
                {!isProviderPerspective && selectedBooking.status === BookingStatus.PENDING && (
                  <button
                    onClick={() => setShowCancelModal(selectedBooking.id)}
                    className="w-full py-1.5 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel Reservation</span>
                  </button>
                )}

                {/* Reviews writing for Seeker once completed */}
                {!isProviderPerspective && selectedBooking.status === BookingStatus.COMPLETED && (
                  <>
                    {!MockDatabase.getReviews().some(r => r.booking_id === selectedBooking.id) ? (
                      showReviewForm ? (
                        <ReviewForm
                          booking={selectedBooking}
                          onReviewSubmitted={() => {
                            setShowReviewForm(false);
                            reloadBookings();
                          }}
                          onCancel={() => setShowReviewForm(false)}
                        />
                      ) : (
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                        >
                          <Star className="w-4 h-4 fill-white" />
                          <span>Leave Star Review</span>
                        </button>
                      )
                    ) : (
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-lg text-center flex flex-col items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Thank you! Your feedback has been published.</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-slate-400 dark:text-slate-500">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400 dark:text-slate-600" />
              <p className="text-xs">Select a booking from the list to view milestones, cancellation reports, or leave reviews.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-sm w-full space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Cancel Booking Confirmation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to cancel this booking? This action is irreversible. Please provide a reason:
            </p>
            <textarea
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Change of plans, conflict in scheduling..."
              rows={3}
              className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCancelModal(null)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={() => handleCancelBooking(showCancelModal)}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
