import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon } from 'lucide-react';
import { MockDatabase } from '@/src/lib/mockStore';
import { Booking, UserRole } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

export default function CalendarPage() {
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
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-950/20" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      const dayBookings = bookings.filter(b => b.booking_date.split('T')[0] === dateStr);

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className="h-20 border border-slate-100 dark:border-slate-800/60 p-1 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 cursor-pointer transition-colors text-left flex flex-col justify-between"
        >
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">{day}</span>
          <div className="space-y-0.5 max-h-12 overflow-hidden">
            {dayBookings.slice(0, 2).map((b) => (
              <div
                key={b.id}
                className={`text-[8px] px-1 py-0.5 rounded truncate font-semibold border ${
                  b.status === 'COMPLETED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                    : b.status === 'CANCELLED'
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                    : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
                }`}
              >
                {b.service_title}
              </div>
            ))}
            {dayBookings.length > 2 && (
              <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold font-mono">+{dayBookings.length - 2} more</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border-t border-l border-slate-200 dark:border-slate-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((wd, idx) => (
          <div key={idx} className="bg-slate-50 dark:bg-slate-950 border-r border-b border-slate-200 dark:border-slate-800 py-1.5 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Daily Timeline View
          </span>
          <Button variant="ghost" size="xs" onClick={() => setViewMode('month')}>
            Back to Calendar
          </Button>
        </div>

        {selectedDayBookings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            No active appointments scheduled for this day.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDayBookings.map((b) => (
              <div key={b.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3.5 text-left transition-colors">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.service_title}</h4>
                    <span className="text-[10px] font-mono font-extrabold text-indigo-600 dark:text-indigo-400">${b.total_price}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Time Slot: {b.booking_time} ({b.duration} mins)
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Partner: {currentUser?.role === UserRole.PROVIDER ? b.seeker_name : b.provider_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12 text-rose-500 font-bold">
        Please log in to view calendar schedule.
      </div>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors text-left">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">Schedule Agenda</CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Appointments, active jobs and pending consultations
          </CardDescription>
        </div>

        {viewMode === 'month' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-xs" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 min-w-[100px] text-center">
              {monthNames[month]} {year}
            </span>
            <Button variant="outline" size="icon-xs" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {viewMode === 'month' ? renderMonthView() : renderDayView()}
      </CardContent>
    </Card>
  );
}
