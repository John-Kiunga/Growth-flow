import React, { useState } from 'react';
import { 
  Mail, 
  ExternalLink, 
  MoreHorizontal, 
  Globe, 
  Linkedin,
  ArrowUpRight,
  ChevronDown,
  Target
} from 'lucide-react';
import { Lead, LeadStatus } from '../lib/types';
import { formatDate } from '../lib/utils';
import { getScoreColor } from '../lib/scoring';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LeadTableProps {
  leads: Lead[];
  onStatusUpdate: (id: string, status: LeadStatus) => void;
  onSelectLead: (lead: Lead) => void;
}

export function LeadTable({ leads, onStatusUpdate, onSelectLead }: LeadTableProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const statusOptions: LeadStatus[] = ['New', 'Prospect', 'Engaged', 'Outreach', 'Meeting', 'Closed', 'Lost'];

  return (
    <div className="w-full flex flex-col bg-white">
      <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_100px_140px_80px] px-8 py-5 border-b border-zinc-100 bg-zinc-50/50 select-none font-bold text-[10px] uppercase tracking-[0.2em] text-zinc-400">
        <div>Client Contact</div>
        <div>Company & Website</div>
        <div>Service Required</div>
        <div>Industry</div>
        <div className="text-center">Lead Score</div>
        <div>Status</div>
        <div className="text-right">Action</div>
      </div>

      <div className="divide-y divide-zinc-50">
        {leads.length === 0 ? (
          <div className="p-24 text-center text-zinc-300 font-bold text-[10px] uppercase tracking-[0.3em] flex flex-col items-center gap-4">
            <Target className="h-10 w-10 text-zinc-100" />
            No leads identified in your current pipeline
          </div>
        ) : (
          leads.map((lead) => (
            <div 
              key={lead.id} 
              className="grid grid-cols-[1fr_1.5fr_1fr_1fr_100px_140px_80px] px-8 py-5 items-center transition-all hover:bg-zinc-50/50 group border-b border-zinc-50 last:border-0"
            >
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm tracking-tight text-zinc-900">{lead.name}</span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{formatDate(lead.created_at)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-700">{lead.company}</span>
                  {lead.website && (
                    <a 
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-400 hover:text-indigo-600 transition-colors flex items-center gap-1 font-bold tracking-tight"
                    >
                      {lead.website.replace('https://', '').replace('www.', '')}
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                    {lead.opportunity_type || 'Full Stack'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
                {lead.industry || '—'}
              </div>

              <div className="flex justify-center">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all",
                  lead.score >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm shadow-emerald-100/50" : 
                  lead.score >= 50 ? "bg-amber-50 text-amber-700 border-amber-100 shadow-sm shadow-amber-100/50" : 
                  "bg-zinc-50 text-zinc-400 border-zinc-100"
                )}>
                  {lead.score}
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === lead.id ? null : lead.id);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all uppercase tracking-widest shadow-sm min-w-[100px]",
                    lead.status === 'New' && "bg-zinc-50 border-zinc-200 text-zinc-500",
                    lead.status === 'Prospect' && "bg-sky-50 border-sky-100 text-sky-600",
                    lead.status === 'Engaged' && "bg-indigo-50 border-indigo-100 text-indigo-600",
                    lead.status === 'Outreach' && "bg-amber-50 border-amber-100 text-amber-600",
                    lead.status === 'Meeting' && "bg-purple-50 border-purple-100 text-purple-600",
                    lead.status === 'Closed' && "bg-emerald-50 border-emerald-100 text-emerald-600",
                    lead.status === 'Lost' && "bg-rose-50 border-rose-100 text-rose-600"
                  )}
                >
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    lead.status === 'New' && "bg-zinc-400",
                    lead.status === 'Prospect' && "bg-sky-600",
                    lead.status === 'Engaged' && "bg-indigo-600",
                    lead.status === 'Outreach' && "bg-amber-600",
                    lead.status === 'Meeting' && "bg-purple-600",
                    lead.status === 'Closed' && "bg-emerald-600",
                    lead.status === 'Lost' && "bg-rose-600"
                  )} />
                  {lead.status}
                  <ChevronDown className="h-3 w-3 opacity-40 ml-1" />
                </button>

                <AnimatePresence>
                  {activeDropdown === lead.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute left-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden p-2"
                    >
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            onStatusUpdate(lead.id, status);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                          Mark as {status}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => onSelectLead(lead)}
                  className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-900 hover:bg-white hover:shadow-md transition-all"
                  title="Generate Outreach"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
