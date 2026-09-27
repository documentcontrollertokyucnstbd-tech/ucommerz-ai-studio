import React from 'react';
import { Users, ChevronLeft, Calendar, DollarSign, Clock, MessageSquare } from 'lucide-react';
import { MockDatabase } from '@/src/lib/mockStore';
import { BookingStatus } from '@/src/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';

interface CustomerDetailPageProps {
  customerId: string;
  onBack: () => void;
  onNavigateToView: (view: string) => void;
}

export default function CustomerDetailPage({ customerId, onBack, onNavigateToView }: CustomerDetailPageProps) {
  const currentUser = MockDatabase.getCurrentUser();
  const customer = MockDatabase.getUsers().find(u => u.id === customerId);

  const bookingsWithThisCustomer = MockDatabase.getBookings().filter(
    b => currentUser ? (b.provider_id === currentUser.id && b.seeker_id === customerId) : false
  );

  const totalSpent = bookingsWithThisCustomer
    .filter(b => b.status === BookingStatus.COMPLETED)
    .reduce((sum, b) => sum + b.total_price, 0);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-rose-500 font-bold">Client record not found.</p>
        <Button onClick={onBack} className="mt-4">Back to List</Button>
      </div>
    );
  }

  const handleMessageClient = () => {
    if (!currentUser) return;
    const messages = MockDatabase.getMessages();
    const threadExists = messages.some(
      m => (m.sender_id === currentUser.id && m.receiver_id === customerId) ||
           (m.sender_id === customerId && m.receiver_id === currentUser.id)
    );

    if (!threadExists) {
      const initMsg = {
        id: Math.random().toString(36).substr(2, 9),
        sender_id: currentUser.id,
        receiver_id: customerId,
        content: `Hello ${customer.full_name}, I am your service provider. Let's align on upcoming works!`,
        is_read: false,
        message_type: 'TEXT' as any,
        created_at: new Date().toISOString()
      };
      MockDatabase.saveMessages([...messages, initMsg]);
    }

    onNavigateToView('messages');
  };

  return (
    <div className="space-y-6 text-left">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-bold cursor-pointer">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Client Directory</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Column */}
        <Card className="md:col-span-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto text-xl font-extrabold shadow-sm">
            {customer.full_name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{customer.full_name}</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Registered Customer</p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 grid grid-cols-2 gap-2 text-left">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Jobs</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-mono">{bookingsWithThisCustomer.length} Jobs</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Volume</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-mono">${totalSpent}</span>
            </div>
          </div>

          <Button onClick={handleMessageClient} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 rounded-lg">
            <MessageSquare className="w-3.5 h-3.5" />
            Send Client Message
          </Button>
        </Card>

        {/* Client History Column */}
        <Card className="md:col-span-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/40 pb-4">
            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Job History Log</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Historical appointments booked by {customer.full_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {bookingsWithThisCustomer.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                No historic bookings with this client.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {bookingsWithThisCustomer.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.service_title}</h4>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                        Date: {new Date(b.booking_date).toLocaleDateString()} • {new Date(b.booking_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block font-mono">${b.total_price}</span>
                      <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
