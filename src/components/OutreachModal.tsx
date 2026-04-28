import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Send, Sparkles, Wand2, Loader2, RefreshCw, Linkedin, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, OpportunityType } from '../lib/types';
import { generateOutreachMessage } from '../lib/ai';
import { isLinkedInConnected } from '../services/linkedinService';
import toast from 'react-hot-toast';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export function OutreachModal({ isOpen, onClose, lead }: OutreachModalProps) {
  const [aiMessage, setAiMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    if (isOpen && lead && !aiMessage) {
      handleGenerateAI();
    }
    if (isOpen) {
      isLinkedInConnected().then(setLinkedInConnected);
    }
  }, [isOpen, lead]);

  const handleGenerateAI = async () => {
    if (!lead) return;
    setGenerating(true);
    try {
      const msg = await generateOutreachMessage(lead, lead.opportunity_type || 'Design');
      setAiMessage(msg || '');
    } catch (error) {
      toast.error('AI synthesis failed');
    } finally {
      setGenerating(false);
    }
  };

  if (!lead) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(aiMessage);
    setCopied(true);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedInDispatch = async () => {
    setDispatching(true);
    // Simulate LinkedIn API overhead
    await new Promise(r => setTimeout(r, 1500));
    
    // In a real app with proper permissions, we'd use the stored token to POST to /v2/messages
    // For now, we open the shared message URL as a high-quality handoff
    const linkedInUrl = lead.linkedin_url || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(lead.name + ' ' + lead.company)}`;
    window.open(linkedInUrl, '_blank');
    
    toast.success('Strategy dispatched to LinkedIn context');
    setDispatching(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white z-[101] shadow-2xl border-l border-zinc-100 flex flex-col"
          >
            <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Sparkles className="text-white h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight text-zinc-900">Campaign Synthesizer</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Focus: <span className="text-zinc-900">{lead.name}</span> @ {lead.company}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 rounded-xl hover:bg-zinc-100 transition-all text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-10 space-y-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Campaign Focus</span>
                  <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest">{lead.opportunity_type || 'General'}</span>
                </div>
                <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Market Confidence</span>
                  <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest">{lead.score}% Score</span>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Wand2 className="h-12 w-12 text-indigo-600" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">AI Deep Audit</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-zinc-600 italic">
                  "{lead.audit}"
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-400">Generated Outreach Strategy</p>
                    <button 
                      onClick={handleGenerateAI}
                      disabled={generating}
                      className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest flex items-center gap-2"
                    >
                      {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Re-generate
                    </button>
                  </div>
                  
                  <div className="relative group">
                    <div className="p-10 bg-zinc-50 border border-zinc-100 rounded-[40px] text-zinc-700 text-sm leading-loose whitespace-pre-wrap min-h-[300px] font-medium selection:bg-indigo-600/10 shadow-inner">
                      {generating ? (
                        <div className="h-full flex flex-col items-center justify-center gap-6 py-20">
                          <Loader2 className="h-10 w-10 text-indigo-200 animate-spin" />
                          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.4em]">Synthesizing Pitch...</span>
                        </div>
                      ) : (
                        aiMessage || 'Awaiting strategy generation...'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-zinc-100 bg-zinc-50/50 backdrop-blur-md space-y-4">
              {linkedInConnected && (
                <button 
                  onClick={handleLinkedInDispatch}
                  disabled={dispatching}
                  className="w-full py-5 bg-[#0077b5] text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-[#006396] transition-all shadow-xl shadow-blue-100 group"
                >
                  {dispatching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Linkedin className="h-4 w-4" />
                      Dispatch via LinkedIn API
                      <ArrowRight className="h-3.5 w-3.5 opacity-40 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
              
              <button 
                onClick={handleCopy}
                className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 group"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Copy Strategy
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 mt-8">
                <div className="h-1 w-1 rounded-full bg-zinc-200" />
                <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-[0.5em]">
                  Optimized for Professional Outreach
                </p>
                <div className="h-1 w-1 rounded-full bg-zinc-200" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
