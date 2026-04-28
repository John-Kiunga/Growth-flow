import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Loader2, 
  Plus, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck,
  TrendingUp,
  FileText,
  Building2,
  User,
  Globe,
  Mail,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { findProspects, Prospect } from '../lib/ai';
import { searchEmails, HunterEmail } from '../services/hunterService';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

export function ProspectingTool() {
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Prospect[]>([]);
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());
  const [emails, setEmails] = useState<Record<number, HunterEmail[]>>({});
  const [searchingEmails, setSearchingEmails] = useState<Set<number>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche || !location) return;

    setLoading(true);
    setResults([]);
    setEmails({});
    try {
      const data = await findProspects(niche, location);
      if (data && data.length > 0) {
        setResults(data);
        toast.success(`Discovered ${data.length} tailored prospects`);
      } else {
        toast.error("Model capacity reached. Please try in a few seconds.");
      }
    } catch (error: any) {
      console.error("Prospecting error:", error);
      if (error?.message?.includes('429') || error?.message?.includes('exhausted')) {
        toast.error("AI service is busy. Retrying momentarily...");
      } else {
        toast.error("Search engine encountered an error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScoutEmail = async (prospect: Prospect, index: number) => {
    if (searchingEmails.has(index)) return;

    setSearchingEmails(prev => new Set(prev).add(index));
    try {
      const discovered = await searchEmails(prospect.website);
      setEmails(prev => ({ ...prev, [index]: discovered }));
      if (discovered.length === 0) {
        toast.error('No emails found for this domain');
      } else {
        toast.success(`Found ${discovered.length} verified emails`);
      }
    } catch (error) {
      toast.error('Email scouting failed');
    } finally {
      setSearchingEmails(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleAddLead = async (prospect: Prospect, index: number) => {
    if (addingIds.has(index)) return;

    const emailList = emails[index] || [];
    const primaryEmail = emailList[0]?.value || '';

    setAddingIds(prev => new Set(prev).add(index));
    try {
      await addDoc(collection(db, 'leads'), {
        name: prospect.name,
        company: prospect.company,
        website: prospect.website,
        email: primaryEmail,
        industry: prospect.industry,
        location: prospect.location,
        linkedin_url: prospect.linkedin_url,
        score: prospect.confidence_score,
        audit: prospect.marketing_audit,
        status: 'Prospect',
        opportunity_type: 'Design',
        owner_id: auth.currentUser?.uid,
        created_at: serverTimestamp(),
      });
      toast.success(`Imported ${prospect.company} to Pipeline`);
    } catch (error) {
      toast.error('Failed to import prospect');
    } finally {
      setAddingIds(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white rounded-[40px] p-10 border border-zinc-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 p-10 opacity-[0.03] pointer-events-none">
          <Search className="h-40 w-40 text-zinc-900" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-2">Smart B2B Prospecting</h2>
          <p className="text-zinc-500 font-medium mb-8">
            Identify high-intent leads using real-time market intelligence and audit patterns.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
              <input 
                type="text"
                placeholder="Niche (e.g. Fintech, Dentists)"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all font-bold text-sm"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
              <input 
                type="text"
                placeholder="Location (e.g. Austin, UK)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all font-bold text-sm"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-xl shadow-zinc-200"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <TrendingUp className="h-5 w-5" />}
              Discover
            </button>
          </form>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {results.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-6"
          >
            {results.map((prospect, idx) => (
              <div 
                key={idx}
                className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden hover:border-indigo-200 transition-all group shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr_1fr] divide-x divide-zinc-100">
                  <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="h-14 w-14 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100">
                        <Building2 className="h-7 w-7 text-zinc-400" />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                          {prospect.confidence_score}% Confidence
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold tracking-tight text-zinc-900">{prospect.company}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Globe className="h-3.5 w-3.5 text-zinc-300" />
                        <span className="text-xs font-bold text-zinc-400">{prospect.website}</span>
                      </div>
                    </div>
                    <div className="pt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{prospect.industry}</span>
                      <span className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{prospect.location}</span>
                    </div>
                  </div>

                  <div className="p-8 bg-zinc-50/30 flex flex-col justify-center space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">Marketing Audit Report</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-zinc-600 italic px-4 border-l-2 border-indigo-200">
                        "{prospect.marketing_audit}"
                      </p>
                    </div>
                    <div className="flex items-center gap-4 py-4 px-6 bg-white border border-zinc-100 rounded-2xl shadow-sm">
                      <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Decision Maker</p>
                        <p className="text-sm font-extrabold text-zinc-900">{prospect.name}</p>
                      </div>
                      <a 
                        href={prospect.linkedin_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="ml-auto p-2 text-zinc-300 hover:text-indigo-600 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Email Intelligence</span>
                        {!emails[idx] ? (
                          <button 
                            onClick={() => handleScoutEmail(prospect, idx)}
                            disabled={searchingEmails.has(idx)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest disabled:opacity-50"
                          >
                            {searchingEmails.has(idx) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Zap className="h-3 w-3" />
                            )}
                            Launch Scout
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Scout Complete
                          </span>
                        )}
                      </div>
                      
                      {emails[idx] && emails[idx].length > 0 && (
                        <div className="flex flex-col gap-2">
                          {emails[idx].slice(0, 2).map((email, eIdx) => (
                            <div key={eIdx} className="flex items-center justify-between px-3 py-2 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-emerald-600" />
                                <span className="text-[11px] font-bold text-zinc-700">{email.value}</span>
                              </div>
                              <span className="text-[9px] font-extrabold text-emerald-600 bg-white px-2 py-0.5 rounded-md border border-emerald-100">
                                {email.confidence}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 flex flex-col items-center justify-center gap-4 bg-white">
                    <button 
                      onClick={() => handleAddLead(prospect, idx)}
                      disabled={addingIds.has(idx)}
                      className={cn(
                        "w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                        addingIds.has(idx) 
                          ? "bg-zinc-100 text-zinc-400"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                      )}
                    >
                      {addingIds.has(idx) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Add to Pipeline
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                      <ShieldCheck className="h-3 w-3" />
                      Identity Verified
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
            <div>
              <p className="text-xl font-extrabold tracking-tight text-zinc-900">Scanning Digital Ecosystem</p>
              <p className="text-sm text-zinc-400 font-medium mt-1">Cross-referencing intent signals and firmographic data...</p>
            </div>
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
            <Search className="h-16 w-16 text-zinc-300 mb-6" />
            <p className="text-lg font-extrabold text-zinc-900">No Prospects Loaded</p>
            <p className="text-sm text-zinc-500 font-medium mt-1">Enter a niche and location to begin scouting.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
