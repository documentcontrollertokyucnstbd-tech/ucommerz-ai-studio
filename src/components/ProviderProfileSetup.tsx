import React, { useState } from 'react';
import { User, ProviderSkill, SkillLevel, ProviderCertification, ProviderPortfolio } from '../types';
import { MockDatabase } from '../lib/mockStore';
import { Briefcase, Award, FolderHeart, Plus, Trash, Check, ShieldCheck, Sparkles, Mail, Lock } from 'lucide-react';

export default function ProviderProfileSetup() {
  const currentUser = MockDatabase.getCurrentUser();

  const [skills, setSkills] = useState<ProviderSkill[]>(() => {
    if (!currentUser) return [];
    return MockDatabase.getSkills().filter(s => s.provider_id === currentUser.id);
  });

  const [certs, setCerts] = useState<ProviderCertification[]>(() => {
    if (!currentUser) return [];
    return MockDatabase.getCertifications().filter(c => c.provider_id === currentUser.id);
  });

  const [portfolio, setPortfolio] = useState<ProviderPortfolio[]>(() => {
    if (!currentUser) return [];
    return MockDatabase.getPortfolio().filter(p => p.provider_id === currentUser.id);
  });

  // Skills additions states
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.INTERMEDIATE);
  const [yearsExp, setYearsExp] = useState(3);

  // Certifications states
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certDate, setCertDate] = useState('');

  // Portfolio addition states
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portUrl, setPortUrl] = useState('');

  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return <div className="text-center py-12 text-rose-500 font-bold">Please sign in to configure provider profile details.</div>;
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    const allSkills = MockDatabase.getSkills();
    const newSkill: ProviderSkill = {
      id: Math.random().toString(36).substr(2, 9),
      provider_id: currentUser.id,
      skill_name: skillName,
      skill_level: skillLevel,
      years_experience: yearsExp,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    MockDatabase.saveSkills([...allSkills, newSkill]);
    setSkills([...skills, newSkill]);
    setSkillName('');
    
    MockDatabase.logActivity(currentUser.id, 'SKILL_ADD', 'PROVIDER', currentUser.id, `Added professional skill: "${skillName}"`);
  };

  const handleDeleteSkill = (skillId: string) => {
    const allSkills = MockDatabase.getSkills();
    const updated = allSkills.filter(s => s.id !== skillId);
    MockDatabase.saveSkills(updated);
    setSkills(skills.filter(s => s.id !== skillId));
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certOrg.trim()) return;

    const allCerts = MockDatabase.getCertifications();
    const newCert: ProviderCertification = {
      id: Math.random().toString(36).substr(2, 9),
      provider_id: currentUser.id,
      name: certName,
      issuing_organization: certOrg,
      issue_date: certDate || new Date().toISOString().substring(0, 10),
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    MockDatabase.saveCertifications([...allCerts, newCert]);
    setCerts([...certs, newCert]);
    setCertName('');
    setCertOrg('');
    setCertDate('');

    MockDatabase.logActivity(currentUser.id, 'CERT_ADD', 'PROVIDER', currentUser.id, `Uploaded certification: "${certName}" for validation`);
  };

  const handleAddPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim() || !portDesc.trim()) return;

    const allPortfolio = MockDatabase.getPortfolio();
    const newPortfolio: ProviderPortfolio = {
      id: Math.random().toString(36).substr(2, 9),
      provider_id: currentUser.id,
      title: portTitle,
      description: portDesc,
      image_urls: [portUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    MockDatabase.savePortfolio([...allPortfolio, newPortfolio]);
    setPortfolio([...portfolio, newPortfolio]);
    setPortTitle('');
    setPortDesc('');
    setPortUrl('');

    MockDatabase.logActivity(currentUser.id, 'PORTFOLIO_ADD', 'PROVIDER', currentUser.id, `Added project: "${portTitle}" to profile showcase`);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-extrabold text-slate-950">Professional Qualifications Setup</h1>
        <p className="text-xs text-slate-500 font-medium">Build credentials trust. Add skills, verifications, and portfolios to stand out from lists.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SKILLS FORM & LIST */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-indigo-600">
            <Briefcase className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">My Expertise Skills</h3>
          </div>

          <form onSubmit={handleAddSkill} className="space-y-3.5 bg-slate-50 p-3 rounded-lg border border-slate-100/55">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600">Skill or Specialization</label>
              <input
                type="text"
                required
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. React Native, Deep Clean, Somatic Therapy"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600">Expertise Level</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                  className="w-full text-xs border border-slate-200 rounded-md p-1.5 bg-white text-slate-800 focus:outline-none"
                >
                  <option value={SkillLevel.BEGINNER}>Beginner</option>
                  <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
                  <option value={SkillLevel.ADVANCED}>Advanced</option>
                  <option value={SkillLevel.EXPERT}>Expert</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600">Years Exp</label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={yearsExp}
                  onChange={(e) => setYearsExp(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </form>

          {/* List display */}
          <div className="space-y-2">
            {skills.length === 0 ? (
              <p className="text-[10px] text-slate-400 py-4 text-center">No skills logged yet</p>
            ) : (
              skills.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2 rounded-lg text-xs">
                  <div>
                    <span className="font-extrabold text-slate-800">{s.skill_name}</span>
                    <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded ml-2 px-1 py-0.5">{s.skill_level} • {s.years_experience} yrs</span>
                  </div>
                  <button onClick={() => handleDeleteSkill(s.id)} className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CERTIFICATIONS VERIFICATION */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-indigo-600">
            <Award className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Verifiable Certifications</h3>
          </div>

          <form onSubmit={handleAddCert} className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100/55">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600">Certification Name</label>
              <input
                type="text"
                required
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
                placeholder="Google Architect, Yoga Alliance Alliance"
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600">Issuing Org</label>
                <input
                  type="text"
                  required
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                  placeholder="AWS, Google, Alliance"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-600">Issue Date</label>
                <input
                  type="date"
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                  className="w-full text-xs px-2 py-1 border border-slate-200 rounded-md bg-white focus:outline-none text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Submit Cert for Verification
            </button>
          </form>

          {/* Cert list */}
          <div className="space-y-2">
            {certs.map((c) => (
              <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-left text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-slate-800">{c.name}</h4>
                  {c.verified ? (
                    <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-100">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded border">
                      PENDING VERIFICATION
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Issued by: {c.issuing_organization} on {c.issue_date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PORTFOLIO WORKS SHOWCASE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-2 flex items-center gap-2 text-indigo-600">
          <FolderHeart className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Project Portfolio Showcase</h3>
        </div>

        <form onSubmit={handleAddPortfolio} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-600">Project Title</label>
            <input
              type="text"
              required
              value={portTitle}
              onChange={(e) => setPortTitle(e.target.value)}
              placeholder="E-Commerce Redesign"
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-600">Project Highlight URL Image</label>
            <input
              type="url"
              value={portUrl}
              onChange={(e) => setPortUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md bg-white focus:outline-none"
            />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <label className="block text-[10px] font-bold text-slate-600">Brief project achievements scope</label>
            <textarea
              required
              value={portDesc}
              onChange={(e) => setPortDesc(e.target.value)}
              placeholder="Detail the metrics achieved, your exact tools and role, and the final client outcomes..."
              rows={2}
              className="w-full text-xs border border-slate-200 rounded-md p-2 bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" /> Save Portfolio Entry
          </button>
        </form>

        {/* Portfolio gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {portfolio.map((p) => (
            <div key={p.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm flex bg-slate-50">
              <img src={p.image_urls[0]} alt={p.title} className="w-24 h-24 object-cover flex-shrink-0" />
              <div className="p-3 text-left space-y-1 flex-1 min-w-0">
                <h4 className="font-extrabold text-slate-800 text-xs truncate">{p.title}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
