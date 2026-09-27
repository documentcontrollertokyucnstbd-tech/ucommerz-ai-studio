import React, { useState } from 'react';
import { User, MessageTemplate, ReminderSettings } from '../types';
import { MockDatabase } from '../lib/mockStore';
import { Clock, HelpCircle, FileText, Calendar, Plus, Trash, Check, ShieldCheck, Mail, Sparkles, MessageSquare } from 'lucide-react';

export default function ProviderSettings() {
  const currentUser = MockDatabase.getCurrentUser();

  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => {
    if (!currentUser) return { id: '', provider_id: '', enabled: false, reminder_hours: 24, send_email: false, send_sms: false, created_at: '', updated_at: '' };
    const all = MockDatabase.getReminderSettings();
    let userSettings = all.find(s => s.provider_id === currentUser.id);
    if (!userSettings) {
      userSettings = {
        id: `set-${currentUser.id}`,
        provider_id: currentUser.id,
        enabled: true,
        reminder_hours: 24,
        send_email: true,
        send_sms: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      MockDatabase.saveReminderSettings([...all, userSettings]);
    }
    return userSettings;
  });

  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    if (!currentUser) return [];
    return MockDatabase.getMessageTemplates().filter(t => t.provider_id === currentUser.id);
  });

  // Template Form states
  const [tplName, setTplName] = useState('');
  const [tplSubject, setTplSubject] = useState('');
  const [tplContent, setTplContent] = useState('');
  const [tplCategory, setTplCategory] = useState('BOOKING_CONFIRMATION');

  // Business Hours state
  const [bizHours, setBizHours] = useState(() => {
    if (!currentUser) return [];
    return MockDatabase.getBusinessHours().filter(b => b.provider_id === currentUser.id);
  });

  const handleToggleReminder = () => {
    const nextVal = !reminderSettings.enabled;
    const updated = {
      ...reminderSettings,
      enabled: nextVal,
      updated_at: new Date().toISOString()
    };
    setReminderSettings(updated);
    
    const allSettings = MockDatabase.getReminderSettings().map(s => s.id === reminderSettings.id ? updated : s);
    MockDatabase.saveReminderSettings(allSettings);

    if (currentUser) {
      MockDatabase.logActivity(currentUser.id, 'SETTINGS_UPDATE', 'PROVIDER', currentUser.id, `Toggled automated client reminders to ${nextVal ? 'enabled' : 'disabled'}`);
    }
  };

  const handleUpdateReminderHours = (hours: number) => {
    const updated = {
      ...reminderSettings,
      reminder_hours: hours,
      updated_at: new Date().toISOString()
    };
    setReminderSettings(updated);
    const allSettings = MockDatabase.getReminderSettings().map(s => s.id === reminderSettings.id ? updated : s);
    MockDatabase.saveReminderSettings(allSettings);
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplName.trim() || !tplContent.trim()) return;

    const allTpl = MockDatabase.getMessageTemplates();
    const newTpl: MessageTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      provider_id: currentUser?.id || '',
      name: tplName,
      subject: tplSubject || undefined,
      content: tplContent,
      category: tplCategory,
      variables: ['seeker_name', 'service_title', 'booking_date', 'provider_name'],
      is_active: true,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    MockDatabase.saveMessageTemplates([...allTpl, newTpl]);
    setTemplates([...templates, newTpl]);
    setTplName('');
    setTplSubject('');
    setTplContent('');

    if (currentUser) {
      MockDatabase.logActivity(currentUser.id, 'TEMPLATE_CREATE', 'PROVIDER', currentUser.id, `Configured message template: "${tplName}"`);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    const allTpl = MockDatabase.getMessageTemplates();
    const updated = allTpl.filter(t => t.id !== id);
    MockDatabase.saveMessageTemplates(updated);
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleToggleDayOpen = (id: string) => {
    const allHours = MockDatabase.getBusinessHours();
    const updated = allHours.map(bh => {
      if (bh.id === id) {
        return { ...bh, is_open: !bh.is_open, updated_at: new Date().toISOString() };
      }
      return bh;
    });
    MockDatabase.saveBusinessHours(updated);
    if (currentUser) {
      setBizHours(updated.filter(b => b.provider_id === currentUser.id));
    }
  };

  if (!currentUser) {
    return <div className="text-center py-12 text-rose-500 font-bold">Please log in to manage configurations.</div>;
  }

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">Provider Workflow Settings</h1>
        <p className="text-xs text-slate-500 font-medium">Control automatic reminders, client message templates, and weekly availability calendars.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AUTOMATED REMINDERS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-indigo-600">
            <Clock className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Automated Reminders Setup</h3>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-800 block">Enable Automated Reminders</span>
                <p className="text-[9px] text-slate-400">Send automatic emails to clients prior to sessions</p>
              </div>
              <button
                onClick={handleToggleReminder}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none ${
                  reminderSettings.enabled ? 'bg-indigo-600 flex justify-end' : 'bg-slate-300 flex justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {reminderSettings.enabled && (
              <div className="space-y-3 pt-2 border-t border-slate-200/50 animate-fade-in">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-600">Reminder Timing Window</label>
                  <select
                    value={reminderSettings.reminder_hours}
                    onChange={(e) => handleUpdateReminderHours(Number(e.target.value))}
                    className="w-full text-xs border border-slate-200 rounded-md p-1.5 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value={1}>1 hour prior</option>
                    <option value={3}>3 hours prior</option>
                    <option value={12}>12 hours prior</option>
                    <option value={24}>24 hours prior (Recommended)</option>
                    <option value={48}>48 hours prior</option>
                  </select>
                </div>

                <div className="p-2 bg-indigo-50 rounded text-[9px] text-indigo-700 font-semibold leading-relaxed">
                  💡 Reminders are queued automatically inside our chron logs and dispatched via Resend templates.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BUSINESS HOURS SCHEDULING */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-indigo-600">
            <Calendar className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Weekly Business Hours</h3>
          </div>

          <div className="space-y-2">
            {bizHours.map((bh) => (
              <div key={bh.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="font-extrabold text-slate-700">{weekdays[bh.day_of_week]}</span>
                
                <div className="flex items-center gap-2">
                  {bh.is_open ? (
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{bh.open_time} - {bh.close_time}</span>
                  ) : (
                    <span className="text-[9px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Closed</span>
                  )}
                  <button
                    onClick={() => handleToggleDayOpen(bh.id)}
                    className="px-2 py-0.5 text-[9px] font-semibold border rounded bg-white hover:bg-slate-100 cursor-pointer text-slate-600"
                  >
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK RESPONSE TEMPLATES CRUD */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-indigo-600">
          <FileText className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Quick Response Message Templates</h3>
        </div>

        <form onSubmit={handleAddTemplate} className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-600">Template Title Name</label>
            <input
              type="text"
              required
              value={tplName}
              onChange={(e) => setTplName(e.target.value)}
              placeholder="e.g. Booking confirmation details"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-600">Category Action</label>
            <select
              value={tplCategory}
              onChange={(e) => setTplCategory(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-md p-1.5 bg-white text-slate-800 focus:outline-none"
            >
              <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
              <option value="BOOKING_COMPLETION">Booking Completion Request</option>
              <option value="GENERAL">General Discussion</option>
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-[10px] font-bold text-slate-600">Template Body Content</label>
            <textarea
              required
              value={tplContent}
              onChange={(e) => setTplContent(e.target.value)}
              placeholder="Compose template. Use tags like {{seeker_name}}, {{service_title}}, {{booking_date}}, or {{provider_name}} for automatic substitution..."
              rows={4}
              className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" /> Save Quick Response Template
          </button>
        </form>

        {/* Templates list display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div key={tpl.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                    {tpl.category}
                  </span>
                  <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-1 hover:bg-rose-50 text-rose-500 rounded cursor-pointer">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-extrabold text-slate-800 text-xs">{tpl.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed bg-white border border-slate-100 rounded p-2 overflow-x-auto whitespace-pre-line">
                  {tpl.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
