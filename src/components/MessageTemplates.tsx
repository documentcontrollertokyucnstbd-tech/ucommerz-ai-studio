import React, { useState } from 'react';
import { MessageTemplate, Booking } from '../types';
import { MockDatabase } from '../lib/mockStore';
import { FileText, Clipboard, ChevronDown, Check } from 'lucide-react';

interface MessageTemplatesProps {
  providerId: string;
  booking?: Booking;
  onTemplateSelected: (processedText: string) => void;
}

export default function MessageTemplates({ providerId, booking, onTemplateSelected }: MessageTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const templates = MockDatabase.getMessageTemplates().filter(t => t.provider_id === providerId && t.is_active);

  const processTemplate = (template: MessageTemplate) => {
    let content = template.content;

    // Substitute template tags with booking details or mock defaults
    const replacementMap: { [key: string]: string } = {
      seeker_name: booking?.seeker_name || 'Client',
      service_title: booking?.service_title || 'Service',
      booking_date: booking ? new Date(booking.booking_date).toLocaleDateString() : 'scheduled date',
      provider_name: MockDatabase.getUsers().find(u => u.id === providerId)?.full_name || 'Provider',
      review_link: booking ? `/bookings/${booking.id}/review` : '/reviews'
    };

    Object.keys(replacementMap).forEach(key => {
      const value = replacementMap[key];
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(regex, value);
    });

    onTemplateSelected(content);
    setIsOpen(false);

    // Track template usage
    const allTemplates = MockDatabase.getMessageTemplates();
    const updated = allTemplates.map(t => {
      if (t.id === template.id) {
        return { ...t, usage_count: t.usage_count + 1 };
      }
      return t;
    });
    MockDatabase.saveMessageTemplates(updated);
  };

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          id="menu-button-templates"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Use Template</span>
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
        </button>
      </div>

      {isOpen && (
        <>
          {/* Click outside backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          <div className="absolute left-0 mt-1 w-64 origin-top-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl ring-1 ring-black/5 z-20 focus:outline-none overflow-hidden animate-fade-in">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quick Response Templates</span>
              <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="py-1 divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto" role="none">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => processTemplate(template)}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors flex flex-col gap-0.5 cursor-pointer"
                  role="menuitem"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{template.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-full">
                    {template.content.substring(0, 50)}...
                  </span>
                  <span className="text-[8px] text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 self-start px-1 rounded-sm mt-0.5">
                    Used {template.usage_count}x
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
