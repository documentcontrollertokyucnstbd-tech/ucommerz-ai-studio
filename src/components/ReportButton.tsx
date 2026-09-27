import React, { useState } from 'react';
import { AlertCircle, ShieldAlert, Check } from 'lucide-react';
import { ReportTargetType, ReportStatus } from '../types';
import { MockDatabase } from '../lib/mockStore';

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
  className?: string;
}

export default function ReportButton({ targetType, targetId, targetName, className = '' }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('Inappropriate Content');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = MockDatabase.getCurrentUser();

  const reasons = [
    'Inappropriate Content',
    'Spam or Misleading',
    'Harassment or Abuse',
    'Fraud or Scam',
    'Quality Issues',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to report content.');
      return;
    }

    setLoading(true);

    // Simulate database insert
    setTimeout(() => {
      const reports = MockDatabase.getReports();
      const newReport = {
        id: Math.random().toString(36).substr(2, 9),
        reporter_id: currentUser.id,
        target_type: targetType,
        target_id: targetId,
        reason,
        description,
        status: ReportStatus.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reporter_name: currentUser.full_name
      };

      MockDatabase.saveReports([newReport, ...reports]);

      // Log action
      MockDatabase.logActivity(
        currentUser.id,
        'REPORT_CREATE',
        targetType,
        targetId,
        `Reported ${targetType.toLowerCase()} "${targetName}" for "${reason}"`
      );

      // Notify Admins
      MockDatabase.sendNotification(
        'usr-admin',
        'SYSTEM',
        'New Content Report Submitted',
        `A report was created for ${targetType.toLowerCase()} "${targetName}". Reason: ${reason}`
      );

      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setDescription('');
      }, 1500);
    }, 600);
  };

  return (
    <>
      <button
        id={`btn-report-${targetId}`}
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1 text-slate-400 hover:text-rose-500 text-xs font-medium transition-colors ${className}`}
        title={`Flag or report this ${targetType.toLowerCase()}`}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Report</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Report Inappropriate Content</h3>
            </div>

            {submitted ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 mb-3">
                  <Check className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="font-semibold text-slate-800 text-sm mb-1">Report Submitted</h4>
                <p className="text-xs text-slate-500">
                  Thank you. Platform administrators will review your report and take appropriate actions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <p className="text-xs text-slate-500">
                  You are reporting the {targetType.toLowerCase()} <span className="font-semibold text-slate-700">"{targetName}"</span>. Please provide details below.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Reason for reporting</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {reasons.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Detailed Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific details about why you are flagging this content..."
                    rows={4}
                    className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
