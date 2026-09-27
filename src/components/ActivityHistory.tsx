import React from 'react';
import { ActivityLog } from '../types';
import { 
  Calendar, CheckCircle, MessageSquare, Star, Settings, Shield, AlertTriangle, AlertCircle, ShoppingBag, Eye 
} from 'lucide-react';

interface ActivityHistoryProps {
  logs: ActivityLog[];
}

export default function ActivityHistory({ logs }: ActivityHistoryProps) {
  const getIcon = (actionType: string) => {
    switch (actionType.toUpperCase()) {
      case 'BOOKING_CREATE':
      case 'BOOKING_ACCEPT':
      case 'BOOKING_COMPLETE':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'BOOKING_CANCEL':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'MESSAGE_SEND':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'REVIEW_CREATE':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />;
      case 'PROFILE_UPDATE':
      case 'SETTINGS_UPDATE':
        return <Settings className="w-4 h-4 text-slate-500" />;
      case 'ADMIN_ACTION':
        return <Shield className="w-4 h-4 text-indigo-500" />;
      case 'SERVICE_CREATE':
      case 'SERVICE_UPDATE':
        return <ShoppingBag className="w-4 h-4 text-teal-500" />;
      case 'REPORT_CREATE':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Eye className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return isoString;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity records found</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, logIdx) => (
          <li key={log.id || logIdx}>
            <div className="relative pb-8">
              {logIdx !== logs.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center ring-8 ring-white">
                    {getIcon(log.action_type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-xs text-slate-800 font-medium">
                      {log.description}
                    </p>
                    {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-1 bg-slate-50 rounded border border-slate-100 p-1.5 text-[10px] font-mono text-slate-500">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-[10px] whitespace-nowrap text-slate-400 font-medium font-mono">
                    {formatTime(log.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
