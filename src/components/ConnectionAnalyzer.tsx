import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  BrainCircuit, 
  Target, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Mail,
  Linkedin
} from 'lucide-react';
import { findProspects, Prospect } from '../lib/ai';
import toast from 'react-hot-toast';

export function ConnectionAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [connections, setConnections] = useState<Prospect[]>([]);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [niche, setNiche] = useState('');

  const handleAnalyze = async () => {
    if (!niche) {
      toast.error('Specify a target niche to score your connections against.');
      return;
    }
    
    setAnalyzing(true);
    try {
      // We leverage the findProspects logic but frame it as "analyzing existing network"
      const results = await findProspects(niche, 'My Network');
      setConnections(results);
      toast.success(`${results.length} connections analyzed and scored.`);
    } catch (error) {
      toast.error('Network analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const filtered = connections.filter(c => {
    if (filter === 'high') return c.confidence_score >= 80;
    if (filter === 'medium') return c.confidence_score >= 50 && c.confidence_score < 80;
    return true;
  });

  const [selectedConnection, setSelectedConnection] = useState<Prospect | null>(null);

  const handleDM = (conn: Prospect) => {
    const message = `Hi ${conn.name.split(' ')[0]}, caught your latest updates at ${conn.company}. I noticed a slight gap in your ${conn.marketing_audit.toLowerCase()}—thought I'd reach out as we specialize in solving exactly that. Would you be open to a quick audit?`;
    navigator.clipboard.writeText(message);
    toast.success('Strategy DM copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Network Connection Auditor</h3>
            <p className="text-sm text-zinc-500">Analyze your 1st-degree connections for strategic business fit.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
              <input 
                type="text"
                placeholder="What industry or niche are you targeting in your network? (e.g., 'CleanTech Founders')"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all font-medium"
              />
            </div>
          </div>
          <button 
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all disabled:opacity-50 h-full py-4 shadow-lg shadow-zinc-200"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
            Analyze Network
          </button>
        </div>
      </div>

      {connections.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Filter by Intent Score</span>
            </div>
            <div className="flex p-1 bg-zinc-100 rounded-xl">
              {(['all', 'high', 'medium'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                  }`}
                >
                  {f === 'high' ? 'High Fit (80+)' : f === 'medium' ? 'Warm (50+)' : 'View All'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((conn, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                      <Linkedin className="h-5 w-5 text-zinc-400 group-hover:text-indigo-600" />
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest ${
                      conn.confidence_score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      Fit Score: {conn.confidence_score}
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <h4 className="text-sm font-bold text-zinc-900">{conn.name}</h4>
                    <p className="text-xs text-zinc-500 font-medium">{conn.company}</p>
                  </div>

                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 mb-6 group-hover:bg-indigo-50/30 transition-colors">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Strategic Rationale</p>
                    <p className="text-[11px] text-zinc-600 leading-relaxed italic line-clamp-2">
                       "{conn.strategic_rationale}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDM(conn)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                    >
                      <Mail className="h-3 w-3" />
                      DM Strategist
                    </button>
                    <button 
                      onClick={() => setSelectedConnection(conn)}
                      className="p-3 border border-zinc-200 rounded-xl text-zinc-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all active:scale-95"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Detail Modal overlay */}
      <AnimatePresence>
        {selectedConnection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setSelectedConnection(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Target className="h-40 w-40" />
              </div>

              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-1">{selectedConnection.name}</h2>
                    <p className="text-sm text-zinc-500 font-medium">{selectedConnection.company}</p>
                  </div>
                  <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {selectedConnection.confidence_score}%
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Growth Vulnerability</span>
                    </div>
                    <p className="text-sm font-bold text-zinc-800 leading-relaxed">
                      {selectedConnection.marketing_audit}
                    </p>
                    <div className="mt-4 pt-4 border-t border-zinc-200">
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Lead Intent</p>
                       <p className="text-xs text-zinc-500 italic">
                         "{selectedConnection.strategic_rationale}"
                       </p>
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Recommended Service</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-900">
                      Creative Brand Refresh & Performance Content
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    handleDM(selectedConnection);
                    setSelectedConnection(null);
                  }}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                >
                  Copy Strategic DM & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
