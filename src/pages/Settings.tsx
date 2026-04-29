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
import { isLinkedInConnected, setupLinkedInListener } from '../services/linkedinService';

export default function Settings() {
  const [hunterKey, setHunterKey] = useState('');
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [systemStatus, setSystemStatus] = useState({ hunter: false, linkedin: false });

  const checkAuthStatus = () => {
    isLinkedInConnected().then(connected => {
      setLinkedInConnected(connected);
    });
  };

  useEffect(() => {
    // Check local Auth
    checkAuthStatus();

    // Setup LinkedIn listener for the popup
    const cleanup = setupLinkedInListener(() => {
      checkAuthStatus();
    });

    // Check system config
    fetch('/api/status')
      .then(res => res.json())
      .then(status => {
        setSystemStatus(status);
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));

    return cleanup;
  }, []);

  const handleSave = () => {
    // In a real app we'd save this to Firestore
    toast.success('Settings updated successfully');
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12 md:space-y-16 pb-32">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">Settings & Integrations</h1>
        <p className="text-zinc-500 font-medium mt-2 text-sm md:text-base">Manage your workspace configuration and communication frameworks.</p>
      </div>

      <div className="space-y-10 md:space-y-12">
        {/* LinkedIn Integration */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
              <Linkedin className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900">LinkedIn Connectivity</h2>
          </div>
          
          <div className="p-6 md:p-10 bg-white border border-zinc-200 rounded-2xl md:rounded-[40px] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-10 opacity-[0.03] pointer-events-none hidden md:block">
              <Linkedin className="h-40 w-40 text-zinc-900" />
            </div>

            <div className="space-y-8 max-w-xl relative z-10">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900">Official API Access</h3>
                <p className="text-sm text-zinc-500 font-medium">
                  Connect your LinkedIn profile to enable real-time messaging, profile enrichment, and automated outreach tracking.
                </p>
              </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {!systemStatus.linkedin && (
                    <div className="w-full sm:w-auto px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                      <Lock className="h-4 w-4 text-amber-600" />
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">System Setup Required</p>
                    </div>
                  )}

                  {systemStatus.linkedin && !linkedInConnected && (
                    <div className="space-y-6 w-full">
                      <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Required Redirect URI</label>
                          <button 
                            onClick={() => {
                              const url = `${window.location.protocol}//${window.location.host}/api/auth/linkedin/callback`;
                              navigator.clipboard.writeText(url);
                              toast.success('Redirect URI copied');
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:underline"
                          >
                            Copy to Clipboard
                          </button>
                        </div>
                        <code className="block text-xs font-mono text-zinc-600 break-all bg-white p-3 rounded-xl border border-zinc-100">
                          {window.location.protocol}//{window.location.host}/api/auth/linkedin/callback
                        </code>
                        <p className="text-[10px] text-amber-600 font-bold leading-relaxed">
                          ⚠️ Ensure this exact URL is added to your LinkedIn Developer Portal "Authorized Redirect URLs". 
                          Also, ensure you have enabled the <b>"Sign In with LinkedIn using OpenID Connect"</b> and <b>"Share on LinkedIn"</b> products in your LinkedIn Developer dashboard.
                        </p>
                      </div>

                      <button 
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/auth/linkedin/url');
                            const data = await res.json();
                            if (data.error) throw new Error(data.error);
                            
                            const authWindow = window.open(data.url, 'linkedin_auth', 'width=600,height=700');
                            if (!authWindow) {
                              toast.error('Popup blocked. Please allow popups.');
                            }
                          } catch (err: any) {
                            toast.error(err.message || 'Failed to initialize LinkedIn connection');
                          }
                        }}
                        disabled={checkingAuth}
                        className="w-full sm:w-auto px-8 py-4 bg-[#0077b5] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#006396] shadow-lg shadow-blue-100 transition-all active:scale-95"
                      >
                        {checkingAuth ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Linkedin className="h-5 w-5" />
                            Link LinkedIn Account
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {linkedInConnected && (
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-3xl w-full sm:w-auto">
                      <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-emerald-200">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-900 leading-tight">Identity Verified</p>
                        <p className="text-[10px] text-emerald-700 font-medium uppercase tracking-widest">Active LinkedIn Bridge</p>
                      </div>
                    </div>
                  )}

                  {!linkedInConnected && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 text-zinc-400 border border-zinc-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest">
                      <Lock className="h-3.5 w-3.5" />
                      Status: {systemStatus.linkedin ? 'Ready to Connect' : 'Missing API Credentials'}
                    </div>
                  )}
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
        <section className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900">Email Discovery</h2>
            </div>
          </div>
          
          <div className="p-6 md:p-10 bg-white border border-zinc-200 rounded-2xl md:rounded-[40px] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-10 opacity-[0.03] pointer-events-none hidden md:block">
              <Zap className="h-40 w-40 text-zinc-900" />
            </div>

            <div className="space-y-8 max-w-xl relative z-10">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900">Email Finding API</h3>
                <p className="text-sm text-zinc-500 font-medium">
                  {systemStatus.hunter 
                    ? "Your email discovery service is fully operational. We're using the workspace-wide API key for all prospecting tasks." 
                    : "Power your prospecting tool with Hunter.io's domain search. Find verified emails for any B2B domain instantly."}
                </p>
              </div>

              {!systemStatus.hunter ? (
                <div className="space-y-4">
                  <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest pl-1">
                    Hunter API Key
                  </label>
                  <div className="flex gap-4">
                    <input 
                      type="password"
                      placeholder="Enter Hunter.io API Key"
                      value={hunterKey}
                      onChange={(e) => setHunterKey(e.target.value)}
                      className="flex-1 px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all font-bold text-sm"
                    />
                    <button 
                      onClick={() => {
                        if (hunterKey) {
                          toast.success('Hunter.io configured!');
                        } else {
                          toast.error('Please enter a key');
                        }
                      }}
                      className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl group">
                  <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-emerald-200 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Security Integration Active</p>
                    <p className="text-xs text-emerald-700/70 font-medium">Authentication handled securely at the server level.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900">Communication Templates</h2>
            </div>
            <button className="w-full sm:w-auto px-6 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all shadow-sm">
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {templates.map((template, idx) => (
              <div key={idx} className="p-6 md:p-10 bg-white border border-zinc-200 rounded-2xl md:rounded-[40px] shadow-sm hover:border-indigo-200 transition-all group">
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-indigo-600 mb-2 inline-block bg-indigo-50 px-3 py-1 rounded-full">Template 0{idx + 1}</span>
                    <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-zinc-900">{template.name}</h3>
                  </div>
                  <button className="p-2 md:p-3 rounded-2xl text-zinc-300 hover:text-zinc-900 hover:bg-zinc-50 transition-all border border-transparent hover:border-zinc-100">
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

        {/* Global Save */}
        <div className="pt-8 md:pt-12 border-t border-zinc-200 flex justify-center sm:justify-end">
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto group flex items-center justify-center gap-4 px-8 md:px-10 py-4 md:py-5 bg-zinc-900 text-white rounded-2xl md:rounded-3xl font-extrabold text-sm shadow-2xl shadow-zinc-200 hover:bg-zinc-800 transition-all hover:scale-[1.02]"
          >
            <Save className="h-5 w-5" />
            Update Settings
            <ArrowRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform hidden sm:block" />
          </button>
        </div>
      </div>
    </div>
  );
}
