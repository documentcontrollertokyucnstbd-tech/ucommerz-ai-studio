import React, { useState } from 'react';
import { Notification } from '../types';
import { MockDatabase } from '../lib/mockStore';
import { Bell, Check, Inbox, Calendar, MessageSquare, Star, Info, ShieldAlert } from 'lucide-react';

interface NotificationsProps {
  userId: string;
  onNavigateToView?: (view: string) => void;
}

export default function Notifications({ userId, onNavigateToView }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = MockDatabase.getNotifications().filter(n => n.user_id === userId);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    const allNotifs = MockDatabase.getNotifications();
    const updated = allNotifs.map(n => {
      if (n.id === id) {
        return { ...n, is_read: true, read_at: new Date().toISOString() };
      }
      return n;
    });
    MockDatabase.saveNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const allNotifs = MockDatabase.getNotifications();
    const updated = allNotifs.map(n => {
      if (n.user_id === userId) {
        return { ...n, is_read: true, read_at: new Date().toISOString() };
      }
      return n;
    });
    MockDatabase.saveNotifications(updated);
  };

  const handleNotificationClick = (notif: Notification) => {
    handleMarkAsRead(notif.id);
    setIsOpen(false);

    if (onNavigateToView) {
      if (notif.type === 'MESSAGE') {
        onNavigateToView('messages');
      } else if (notif.type === 'BOOKING') {
        onNavigateToView('bookings');
      } else if (notif.type === 'REVIEW') {
        onNavigateToView('provider-dashboard'); // Or service review log
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'BOOKING':
        return <Calendar className="w-3.5 h-3.5 text-emerald-500" />;
      case 'MESSAGE':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case 'REVIEW':
        return <Star className="w-3.5 h-3.5 text-amber-500" />;
      case 'SYSTEM':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center border border-slate-200/50"
          id="notifications-bell"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2.5 w-80 origin-top-right rounded-xl bg-white border border-slate-200 shadow-xl ring-1 ring-black/5 z-30 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                  <Inbox className="w-6 h-6 text-slate-300 mb-1" />
                  <p className="text-xs text-slate-400">All caught up! No notifications.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors text-left flex items-start gap-2.5 ${
                      !notif.is_read ? 'bg-blue-50/20 font-medium' : ''
                    }`}
                  >
                    <div className="p-1.5 bg-slate-100 rounded-lg flex-shrink-0 mt-0.5 border border-slate-200/50">
                      {getIcon(notif.type)}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-800 truncate">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed break-words">{notif.message}</p>
                      <span className="block text-[8px] text-slate-400 font-mono">
                        {new Date(notif.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
