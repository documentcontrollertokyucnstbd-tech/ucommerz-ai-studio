import React, { useState } from 'react';
import { Booking } from '../types';
import { MockDatabase } from '../lib/mockStore';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon } from 'lucide-react';

export default function CalendarView() {
  const currentUser = MockDatabase.getCurrentUser();
  const bookings = MockDatabase.getBookings().filter(b => 
    currentUser ? (b.provider_id === currentUser.id || b.seeker_id === currentUser.id) : false
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [selectedDayBookings, setSelectedDayBookings] = useState<Booking[]>([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper arrays
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    const clickedDateStr = new Date(year, month, day).toISOString().split('T')[0];
    const dayBookings = bookings.filter(b => b.booking_date.split('T')[0] === clickedDateStr);
    setSelectedDayBookings(dayBookings);
    setViewMode('day');
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderMonthView = () => {
    const days = [];
    // Padding for starting offset week day index
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-slate-100 bg-slate-50/50" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      const dayBookings = bookings.filter(b => b.booking_date.split('T')[0] === dateStr);

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className="h-20 border border-slate-100 p-1 hover:bg-blue-50/20 cursor-pointer transition-colors text-left flex flex-col justify-between"
        >
          <span className="text-[10px] font-bold text-slate-500 font-mono">{day}</span>
          <div className="space-y-0.5 max-h-12 overflow-hidden">
            {dayBookings.slice(0, 2).map((b) => (
              <div
                key={b.id}
                className={`text-[8px] px-1 py-0.5 rounded truncate font-medium border ${
                  b.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : b.status === 'CANCELLED'
                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                    : 'bg-blue-50 text-blue-700 border-blue-100'
                }`}
              >
                {b.service_title}
              </div>
            ))}
            {dayBookings.length > 2 && (
              <span className="text-[7px] text-slate-400 font-bold font-mono">+{dayBookings.length - 2} more</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border-t border-l border-slate-200">
        {/* Header weekdays */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd, idx) => (
          <div key={idx} className="bg-slate-50 border-r border-b border-slate-200 py-1.5 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {wd}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/50">
          <span className="text-xs font-bold text-slate-700">Bookings for Selected Date</span>
          <button
            onClick={() => setViewMode('month')}
            className="px-2.5 py-1 text-[10px] font-bold bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-50"
          >
            Back to Calendar
          </button>
        </div>

        {selectedDayBookings.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-xs">No service bookings scheduled on this date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayBookings.map((b) => (
              <div key={b.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-left flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold font-mono text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">{b.status}</span>
                  <h4 className="font-bold text-slate-800 text-xs mt-1">{b.service_title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(b.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" />
                      {b.seeker_name}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-800 font-mono block">${b.total_price}</span>
                  <span className="text-[9px] text-slate-400 font-semibold">{b.duration} minutes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600 animate-pulse" />
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Appointment Calendar</h2>
        </div>

        {viewMode === 'month' && (
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs font-bold text-slate-800 min-w-[100px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        )}
      </div>

      {viewMode === 'month' ? renderMonthView() : renderDayView()}
    </div>
  );
}
