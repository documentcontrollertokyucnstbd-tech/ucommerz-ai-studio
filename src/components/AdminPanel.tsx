import React, { useState } from 'react';
import { User, ProviderApplication, Report, Booking, Service, ApplicationStatus, ReportStatus, UserRole } from '../types';
import { MockDatabase } from '../lib/mockStore';
import { 
  ShieldAlert, UserCheck, AlertTriangle, Trash, FileText, Check, X, Users, 
  Layers, CheckCircle2, ShieldCheck, Mail, ArrowRight, Activity 
} from 'lucide-react';

export default function AdminPanel() {
  const currentUser = MockDatabase.getCurrentUser();

  const [applications, setApplications] = useState<ProviderApplication[]>(() => MockDatabase.getProviderApplications());
  const [reports, setReports] = useState<Report[]>(() => MockDatabase.getReports());
  const [users, setUsers] = useState<User[]>(() => MockDatabase.getUsers());
  const [services, setServices] = useState<Service[]>(() => MockDatabase.getServices());
  const [bookings, setBookings] = useState<Booking[]>(() => MockDatabase.getBookings());

  // Reload lists
  const syncDatabaseState = () => {
    setApplications(MockDatabase.getProviderApplications());
    setReports(MockDatabase.getReports());
    setUsers(MockDatabase.getUsers());
    setServices(MockDatabase.getServices());
    setBookings(MockDatabase.getBookings());
  };

  const handleApproveApplication = (appId: string, providerId: string) => {
    const allApps = MockDatabase.getProviderApplications();
    const updatedApps = allApps.map(a => {
      if (a.id === appId) {
        return { ...a, status: ApplicationStatus.APPROVED, updated_at: new Date().toISOString() };
      }
      return a;
    });
    MockDatabase.saveProviderApplications(updatedApps);

    // Update user verified flag to true
    const allUsers = MockDatabase.getUsers();
    const updatedUsers = allUsers.map(u => {
      if (u.id === providerId) {
        return { ...u, verified: true, updated_at: new Date().toISOString() };
      }
      return u;
    });
    MockDatabase.saveUsers(updatedUsers);

    // Write Activity Log
    if (currentUser) {
      MockDatabase.logActivity(
        currentUser.id,
        'ADMIN_ACTION',
        'PROVIDER',
        providerId,
        `Approved certified provider background check application`
      );
    }

    // Send notifications
    MockDatabase.sendNotification(
      providerId,
      'SYSTEM',
      'Verification Application Approved!',
      'Congratulations! Your provider background credentials have been verified. Your verified trust badge is now live.',
      '/dashboard'
    );

    syncDatabaseState();
  };

  const handleRejectApplication = (appId: string, providerId: string) => {
    const allApps = MockDatabase.getProviderApplications();
    const updatedApps = allApps.map(a => {
      if (a.id === appId) {
        return { ...a, status: ApplicationStatus.REJECTED, updated_at: new Date().toISOString() };
      }
      return a;
    });
    MockDatabase.saveProviderApplications(updatedApps);

    // Send notification
    MockDatabase.sendNotification(
      providerId,
      'SYSTEM',
      'Verification Request Rejected',
      'Your background check credentials could not be fully verified at this stage. Please re-upload your valid government ID.',
      '/dashboard'
    );

    syncDatabaseState();
  };

  const handleResolveReport = (reportId: string) => {
    const allReports = MockDatabase.getReports();
    const updated = allReports.map(r => {
      if (r.id === reportId) {
        return { ...r, status: ReportStatus.RESOLVED, updated_at: new Date().toISOString() };
      }
      return r;
    });
    MockDatabase.saveReports(updated);
    syncDatabaseState();
  };

  const handleDeleteMaliciousService = (serviceId: string, reportId: string) => {
    const allServices = MockDatabase.getServices();
    const filtered = allServices.filter(s => s.id !== serviceId);
    MockDatabase.saveServices(filtered);

    // Resolve report
    handleResolveReport(reportId);

    if (currentUser) {
      MockDatabase.logActivity(
        currentUser.id,
        'ADMIN_ACTION',
        'SERVICE',
        serviceId,
        `Deleted malicious/flagged service listing: "${serviceId}"`
      );
    }

    alert('Listing removed successfully and associated flag resolved.');
    syncDatabaseState();
  };

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="py-16 text-center space-y-3 bg-white border border-slate-200 rounded-2xl max-w-sm mx-auto p-6">
        <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-sm">Restricted Directory Entry</h3>
        <p className="text-xs text-slate-400">Admin credentials required to view global safety audits, background check portfolios, and review moderation logs.</p>
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === ApplicationStatus.PENDING);
  const pendingReports = reports.filter(r => r.status === ReportStatus.PENDING);

  return (
    <div className="space-y-6 text-left">
      {/* Brand Header block */}
      <div className="bg-gradient-to-r from-red-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1 bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Sovereign Admin Panel
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">System Moderation Engine</h1>
          <p className="text-slate-300 text-xs max-w-md">Global safety background verification gates, flagging controls, and trade registry listings controls.</p>
        </div>
        <ShieldAlert className="w-10 h-10 text-red-500 opacity-80 animate-pulse hidden sm:block" />
      </div>

      {/* Overview metric boards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Global Registrations</span>
            <span className="text-sm font-extrabold text-slate-800 font-mono">{users.length} users</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Total Active Catalogs</span>
            <span className="text-sm font-extrabold text-slate-800 font-mono">{services.length} listings</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-yellow-50 border border-yellow-100 text-yellow-600 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Active Escaped Flags</span>
            <span className="text-sm font-extrabold text-yellow-600 font-mono">{pendingReports.length} pending</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block">Background Queue</span>
            <span className="text-sm font-extrabold text-indigo-600 font-mono">{pendingApps.length} pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PENDING PROVIDER VERIFICATIONS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-indigo-600">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Pending Safety Verifications ({pendingApps.length})</h3>
          </div>

          {pendingApps.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center">All background applications validated safely.</p>
          ) : (
            <div className="space-y-3.5">
              {pendingApps.map((app) => {
                const applicant = users.find(u => u.id === app.provider_id);

                return (
                  <div key={app.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs">{app.business_name}</h4>
                        <span className="text-[9px] text-slate-400 font-mono">Tax ID: {app.tax_id} • Applicant: {applicant?.full_name}</span>
                      </div>
                      <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">PENDING AUDIT</span>
                    </div>

                    {app.verification_statement && (
                      <p className="text-[10px] text-slate-500 italic bg-white p-2 border rounded">"{app.verification_statement}"</p>
                    )}

                    <div className="flex gap-2 text-[10px] font-medium pt-1">
                      <a href={app.gov_id_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Government ID Scan</a>
                      <span className="text-slate-300">•</span>
                      <a href={app.insurance_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View COI Insurance PDF</a>
                    </div>

                    <div className="flex gap-1.5 justify-end border-t border-slate-200/50 pt-2.5">
                      <button
                        onClick={() => handleRejectApplication(app.id, app.provider_id)}
                        className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-600 cursor-pointer"
                      >
                        Reject ID
                      </button>
                      <button
                        onClick={() => handleApproveApplication(app.id, app.provider_id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        Verify & Certify
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FLAG/REPORTS AUDIT CONTROL PANEL */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-1.5 text-yellow-600">
            <ShieldAlert className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Sovereign Flag Logs ({pendingReports.length})</h3>
          </div>

          {pendingReports.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center">No open moderation reviews. Community safe!</p>
          ) : (
            <div className="space-y-3.5">
              {pendingReports.map((report) => (
                <div key={report.id} className="p-4 bg-yellow-50/40 border border-yellow-100 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-extrabold text-yellow-700 bg-yellow-100/50 px-1.5 py-0.5 rounded uppercase tracking-wider">{report.reason}</span>
                      <h4 className="font-extrabold text-slate-800 text-xs mt-1">Target Name: {report.target_name}</h4>
                      <p className="text-[9px] text-slate-400 font-mono">Report Reference ID: {report.id} • Target ID: {report.target_id}</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 bg-white p-2 border rounded font-medium">"{report.details}"</p>

                  <div className="flex gap-1.5 justify-end border-t border-slate-200/50 pt-2.5">
                    <button
                      onClick={() => handleResolveReport(report.id)}
                      className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-600 cursor-pointer"
                    >
                      Dismiss Flag
                    </button>
                    <button
                      onClick={() => handleDeleteMaliciousService(report.target_id, report.id)}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      Remove Target Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
