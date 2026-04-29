import React, { useState } from 'react';
import { X, Globe, Linkedin, Building2, User, Loader2, Target, Cpu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { enrichLead } from '../lib/enrichment';
import { calculateLeadScore } from '../lib/scoring';
import { generateLeadAudit } from '../lib/audit';
import { Lead, OpportunityType } from '../lib/types';
import toast from 'react-hot-toast';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (lead: Omit<Lead, 'id' | 'created_at'>) => void;
}

export function AddLeadModal({ isOpen, onClose, onAdd }: AddLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    website: '',
    linkedin_url: '',
    opportunity_type: 'Design' as OpportunityType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) return;

    setLoading(true);
    try {
      const enrichedData = await enrichLead(formData.website);
      
      const newLead: Omit<Lead, 'id' | 'created_at'> = {
        ...formData,
        ...enrichedData,
        score: 0,
        audit: '',
        status: 'New',
      };

      newLead.score = calculateLeadScore(newLead);
      newLead.audit = generateLeadAudit(newLead);

      onAdd(newLead);
      toast.success('Lead added and analyzed');
      onClose();
      setFormData({ 
        name: '', 
        company: '', 
        website: '', 
        linkedin_url: '',
        opportunity_type: 'Design'
      });
    } catch (error) {
      toast.error('Failed to add lead');
    } finally {
      setLoading(false);
    }
  };

  const opportunities: OpportunityType[] = ['Design', 'SEO', 'Maintenance', 'Graphic Design'];

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-full max-w-lg bg-white border border-zinc-200 rounded-3xl md:rounded-[32px] p-6 md:p-10 z-[101] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 md:mb-10">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 bg-indigo-50 border border-indigo-100 rounded-xl md:rounded-2xl flex items-center justify-center">
                  <Target className="h-5 w-5 md:h-6 md:w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-zinc-900">New Growth Record</h3>
                  <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Growth Acquisition Protocol</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 md:p-3 rounded-xl hover:bg-zinc-50 transition-all text-zinc-300 hover:text-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Contact Person</label>
                  <div className="relative">
                    <User className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-zinc-300" />
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 md:pl-12 pr-6 py-3 md:py-4 bg-zinc-50 border border-zinc-200 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all font-bold text-sm text-zinc-900 placeholder:text-zinc-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Company</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-zinc-300" />
                    <input
                      type="text"
                      placeholder="e.g. Studio Flow"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full pl-10 md:pl-12 pr-6 py-3 md:py-4 bg-zinc-50 border border-zinc-200 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all font-bold text-sm text-zinc-900 placeholder:text-zinc-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Primary Goal</label>
                  <select
                    value={formData.opportunity_type}
                    onChange={(e) => setFormData({ ...formData, opportunity_type: e.target.value as OpportunityType })}
                    className="w-full px-4 md:px-5 py-3 md:py-4 bg-zinc-50 border border-zinc-200 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all font-bold text-sm text-zinc-900 appearance-none cursor-pointer"
                  >
                    {opportunities.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Digital Domain</label>
                  <div className="relative">
                    <Globe className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-zinc-300" />
                    <input
                      type="text"
                      placeholder="e.g. studioflow.io"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full pl-10 md:pl-12 pr-6 py-3 md:py-4 bg-zinc-50 border border-zinc-200 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all font-bold text-sm text-zinc-900 placeholder:text-zinc-300"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-100"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Record & Analyze
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest text-center">
                    AI Insight Engine Active
                  </p>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
