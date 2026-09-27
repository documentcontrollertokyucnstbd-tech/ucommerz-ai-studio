import React, { useState } from 'react';
import { Users, Search, ChevronRight, DollarSign, Calendar, MessageSquare } from 'lucide-react';
import { MockDatabase } from '@/src/lib/mockStore';
import { Booking, BookingStatus } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';

interface CustomerSummary {
  id: string;
  name: string;
  totalSpend: number;
  jobsCount: number;
  lastJobDate: string;
}

interface CustomersPageProps {
  onSelectCustomer: (customerId: string) => void;
  onNavigateToView: (view: string) => void;
}

export default function CustomersPage({ onSelectCustomer, onNavigateToView }: CustomersPageProps) {
  const currentUser = MockDatabase.getCurrentUser();
  const [search, setSearch] = useState('');

  // Get unique customers (seekers) that have booked with this provider
  const providerBookings = MockDatabase.getBookings().filter(
    b => currentUser ? b.provider_id === currentUser.id : false
  );

  const customerMap: Record<string, CustomerSummary> = {};

  providerBookings.forEach(b => {
    if (!customerMap[b.seeker_id]) {
      customerMap[b.seeker_id] = {
        id: b.seeker_id,
        name: b.seeker_name,
        totalSpend: 0,
        jobsCount: 0,
        lastJobDate: b.booking_date
      };
    }

    const current = customerMap[b.seeker_id];
    current.jobsCount += 1;
    if (b.status === BookingStatus.COMPLETED) {
      current.totalSpend += b.total_price;
    }
    if (new Date(b.booking_date) > new Date(current.lastJobDate)) {
      current.lastJobDate = b.booking_date;
    }
  });

  const customerList = Object.values(customerMap).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="text-center py-12 text-rose-500 font-bold">
        Please log in to view customers list.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">Client Ledger Directory</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review metrics, spend summaries and booking histories of clients who transact with you
        </p>
        <div className="mt-4 relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search client index by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <CardContent className="p-0">
          {customerList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
              No transacting clients found in your directory yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {customerList.map((client) => (
                <div
                  key={client.id}
                  onClick={() => onSelectCustomer(client.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                        {client.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <DollarSign className="w-3 h-3" /> Total Volume: ${client.totalSpend}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Last Job: {new Date(client.lastJobDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold self-end sm:self-center">
                    <span>Client Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
