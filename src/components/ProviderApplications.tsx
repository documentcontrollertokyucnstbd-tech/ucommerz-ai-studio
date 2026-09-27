import React, { useState } from 'react';
import { User, ProviderApplication, ApplicationStatus } from '../types';
import { MockDatabase } from '../lib/mockStore';
import { Sparkles, Clipboard, ShieldAlert, CheckCircle2, ShieldCheck, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

interface ProviderApplicationsProps {
  onSuccess: () => void;
}

export default function ProviderApplications({ onSuccess }: ProviderApplicationsProps) {
  const currentUser = MockDatabase.getCurrentUser();

  const [businessName, setBusinessName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [govIdUrl, setGovIdUrl] = useState('');
  const [insuranceUrl, setInsuranceUrl] = useState('');
  const [verificationStatement, setVerificationStatement] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if they already have an application
  const existingApp = currentUser 
    ? MockDatabase.getProviderApplications().find(a => a.provider_id === currentUser.id)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must log in to submit a verification request.');
      return;
    }

    if (!businessName.trim() || !taxId.trim()) {
      setError('Please provide your legal business name and tax details.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const allApps = MockDatabase.getProviderApplications();
      const newApp: ProviderApplication = {
        id: Math.random().toString(36).substr(2, 9),
        provider_id: currentUser.id,
        business_name: businessName,
        tax_id: taxId,
        gov_id_url: govIdUrl || 'https://mockdocuments.ucommerz.com/id_scan.png',
        insurance_url: insuranceUrl || 'https://mockdocuments.ucommerz.com/insurance.pdf',
        verification_statement: verificationStatement,
        status: ApplicationStatus.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      MockDatabase.saveProviderApplications([...allApps, newApp]);

      // Log Activity
      MockDatabase.logActivity(
        currentUser.id,
        'APPLICATION_SUBMIT',
        'USER',
        currentUser.id,
        `Submitted verification and safety background check application for "${businessName}"`
      );

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 1000);
  };

  if (!currentUser) {
    return <div className="text-center py-12 text-rose-500 font-bold">Please sign in to submit provider applications.</div>;
  }

  if (existingApp) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <Clipboard className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="font-extrabold text-slate-800 text-sm tracking-tight">Certification Request Received</h2>
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
          <div className="flex justify-between font-medium">
            <span className="text-slate-400">Application ID:</span>
            <span className="font-mono font-bold text-slate-800">{existingApp.id}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-400">Current Status:</span>
            <span className="font-bold text-indigo-600 uppercase tracking-wider">{existingApp.status}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-slate-400">Business Registry:</span>
            <span className="font-bold text-slate-700">{existingApp.business_name}</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Our background team is verifying your registration registers, commercial liability insurance certificates, and sovereign identifiers. You will receive notification logs once verified.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-lg mx-auto text-left space-y-5 animate-fade-in">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span>Verified Badge Application & Background Check</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">Provide legal credentials to unlock client trust indices, direct payouts, and premium search boosts.</p>
      </div>

      {success ? (
        <div className="p-4 text-center space-y-3 bg-emerald-50 border border-emerald-100 rounded-xl">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-emerald-800 text-xs">Application Dispatched Safely!</h4>
          <p className="text-[10px] text-emerald-600">Our compliance officers are on it. Your dashboard will receive live status milestones.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[10px] font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Legal Business Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Legal Business or Trade Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Acme Plumbing LLC or Sarah Jenkins Consulting"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tax ID */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Business EIN / Tax ID <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="XX-XXXXXXX"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
              />
            </div>

            {/* Sovereign Govt ID scan */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Government ID Scan URL</label>
              <input
                type="url"
                value={govIdUrl}
                onChange={(e) => setGovIdUrl(e.target.value)}
                placeholder="https://imgur.com/your-id"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none text-slate-600"
              />
            </div>
          </div>

          {/* Insurance */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Liability Insurance Certificate URL (Optional)</label>
            <input
              type="url"
              value={insuranceUrl}
              onChange={(e) => setInsuranceUrl(e.target.value)}
              placeholder="https://mockstorage/coi_doc.pdf"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
            />
          </div>

          {/* Statement */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Verification Statement</label>
            <textarea
              value={verificationStatement}
              onChange={(e) => setVerificationStatement(e.target.value)}
              placeholder="Attest your licensing references, previous trade backgrounds, or state registry certificates..."
              rows={3}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Submitting Application Verification...' : 'Submit Certified Application'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
