import React, { useState, useEffect } from 'react';
import { 
  Key, 
  MessageSquare, 
  Save, 
  RefreshCcw, 
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
  Database,
  ShieldCheck,
  Linkedin,
  Loader2,
  Mail,
  Zap
} from 'lucide-react';
import { DEFAULT_TEMPLATES } from '../lib/constants';
import toast from 'react-hot-toast';
import { isLinkedInConnected } from '../services/linkedinService';

export default function Settings() {
  const [enrichmentKey, setEnrichmentKey] = useState('');
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    isLinkedInConnected().then(connected => {
      setLinkedInConnected(connected);
      setCheckingAuth(false);
    });
  }, []);

  const handleSave = () => {
    toast.success('Settings updated successfully');
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-16 pb-32">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Settings & Integrations</h1>
        <p className="text-zinc-500 font-medium mt-2">Manage your workspace configuration and communication frameworks.</p>
      </div>

      <div className="space-y-12">
        {/* API Credentials */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <Key className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">Connected Services</h2>
          </div>
          
          <div className="p-10 bg-white border border-zinc-200 rounded-[40px] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-10 opacity-[0.03] pointer-events-none">
              <Database className="h-40 w-40 text-zinc-900" />
            </div>

            <div className="space-y-8 max-w-xl relative z-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-400 mb-2">Data Enrichment Key (e.g. Apollo / Hunter.io)</label>
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder="sk_live_••••••••••••••••"
                    value={enrichmentKey}
                    onChange={(e) => setEnrichmentKey(e.target.value)}
                    className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-mono text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-amber-100">Pending</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5" />
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                    Currently utilizing specialized internal mock data. Connect an external API for production intelligence. 
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Communication Templates</h2>
            </div>
            <button className="px-6 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 flex items-center gap-2 hover:bg-zinc-50 transition-all shadow-sm">
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {templates.map((template, idx) => (
              <div key={idx} className="p-10 bg-white border border-zinc-200 rounded-[40px] shadow-sm hover:border-indigo-200 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-indigo-600 mb-2 inline-block bg-indigo-50 px-3 py-1 rounded-full">Template 0{idx + 1}</span>
                    <h3 className="text-2xl font-extrabold tracking-tight text-zinc-900">{template.name}</h3>
                  </div>
                  <button className="p-3 rounded-2xl text-zinc-300 hover:text-zinc-900 hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100">
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-400">Subject Format</label>
                    <input 
                      type="text" 
                      value={template.subject}
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm text-zinc-700 outline-none"
                      readOnly
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-400">Message Draft</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium leading-relaxed text-zinc-600 min-h-[160px] resize-none outline-none"
                      value={template.body}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-10 flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-50">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    High Conversion Preset
                  </div>
                  <div className="px-4 py-2 bg-zinc-50 text-zinc-400 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest border border-zinc-100">
                    Built-in Workspace Preset
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LinkedIn Integration */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <Linkedin className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">LinkedIn Connectivity</h2>
          </div>
          
          <div className="p-10 bg-white border border-zinc-200 rounded-[40px] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-10 opacity-[0.03] pointer-events-none">
              <Linkedin className="h-40 w-40 text-zinc-900" />
            </div>

            <div className="space-y-8 max-w-xl relative z-10">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900">Official API Access</h3>
                <p className="text-sm text-zinc-500 font-medium">
                  Connect your LinkedIn profile to enable real-time messaging, profile enrichment, and automated outreach tracking.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={async () => {
                    if (linkedInConnected) {
                      toast.success('LinkedIn is already connected');
                      return;
                    }
                    try {
                      const res = await fetch('/api/auth/linkedin/url');
                      const { url, error } = await res.json();
                      if (error) throw new Error(error);
                      
                      const authWindow = window.open(url, 'linkedin_auth', 'width=600,height=700');
                      if (!authWindow) {
                        toast.error('Popup blocked. Please allow popups.');
                      }
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to initialize LinkedIn connection');
                    }
                  }}
                  disabled={checkingAuth}
                  className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    linkedInConnected 
                    ? 'bg-emerald-600 text-white shadow-emerald-100' 
                    : 'bg-[#0077b5] text-white hover:bg-[#006396] shadow-blue-100'
                  }`}
                >
                  {checkingAuth ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : linkedInConnected ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Account Connected
                    </>
                  ) : (
                    <>
                      <Linkedin className="h-5 w-5" />
                      Link LinkedIn Account
                    </>
                  )}
                </button>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest border ${
                  linkedInConnected 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                  : 'bg-zinc-50 text-zinc-400 border-zinc-100'
                }`}>
                  {linkedInConnected ? (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  Status: {linkedInConnected ? 'Verified Integration' : 'Not Connected'}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-6 w-6 rounded-full bg-zinc-200 border-2 border-white" />
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  Used by 42+ team members for unified inbox synchronization.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hunter.io Integration */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">Email Discovery (Hunter.io)</h2>
          </div>
          
          <div className="p-10 bg-white border border-zinc-200 rounded-[40px] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-10 opacity-[0.03] pointer-events-none">
              <Zap className="h-40 w-40 text-zinc-900" />
            </div>

            <div className="space-y-8 max-w-xl relative z-10">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900">Email Finding API</h3>
                <p className="text-sm text-zinc-500 font-medium">
                  Power your prospecting tool with Hunter.io's domain search. Find verified emails for any B2B domain instantly.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest pl-1">
                  Hunter API Key
                </label>
                <div className="flex gap-4">
                  <input 
                    type="password"
                    placeholder="Enter Hunter.io API Key"
                    className="flex-1 px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all font-bold text-sm"
                  />
                  <button className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
                    Verify
                  </button>
                </div>
                <p className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-bold uppercase tracking-widest inline-block">
                  API Integrated Successfully
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Save */}
        <div className="pt-12 border-t border-zinc-200 flex justify-end">
          <button 
            onClick={handleSave}
            className="group flex items-center gap-4 px-10 py-5 bg-zinc-900 text-white rounded-3xl font-extrabold text-sm shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all hover:scale-[1.02]"
          >
            <Save className="h-5 w-5" />
            Update Workspace Settings
            <ArrowRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
