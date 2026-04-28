import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  ArrowRight,
  Database,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  LogOut,
  Zap,
  Disc,
  Shield,
  Target,
  Loader2
} from 'lucide-react';
import { LeadTable } from '../components/LeadTable';
import { AddLeadModal } from '../components/AddLeadModal';
import { OutreachModal } from '../components/OutreachModal';
import { LinkedInAssistant } from '../components/LinkedInAssistant';
import { ProspectingTool } from '../components/ProspectingTool';
import { Lead, LeadStatus } from '../lib/types';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { enrichLead } from '../lib/enrichment';
import { calculateLeadScore } from '../lib/scoring';
import { generateLeadAudit } from '../lib/audit';
import { cn } from '../lib/utils';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'linkedin'>('pipeline');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'leads'),
      where('owner_id', '==', auth.currentUser.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      setLeads(leadsList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching leads:', error);
      toast.error('Session Error: Failed to sync your pipeline.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Stats calculation
  const totalLeads = leads.length;
  const highQualityLeads = leads.filter(l => l.score >= 80).length;
  const designLeads = leads.filter(l => l.opportunity_type === 'Design').length;
  const seoLeads = leads.filter(l => l.opportunity_type === 'SEO').length;

  const handleAddLead = async (leadData: Omit<Lead, 'id' | 'created_at'>) => {
    if (!auth.currentUser) return;

    try {
      const completeLead = {
        ...leadData,
        owner_id: auth.currentUser.uid,
        created_at: serverTimestamp(),
      };

      await addDoc(collection(db, 'leads'), completeLead);
      toast.success('Lead added to your pipeline');
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Error adding lead:', error);
      toast.error('Error: Write operation failed.');
    }
  };

  const handleStatusUpdate = async (id: string, status: LeadStatus) => {
    try {
      const leadRef = doc(db, 'leads', id);
      await updateDoc(leadRef, { status });
      toast.success(`Status updated: ${status}`);
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    const userId = auth.currentUser.uid;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedLeads = results.data as any[];
        const loadingToast = toast.loading(`Processing ${parsedLeads.length} records...`);
        
        try {
          for (const row of parsedLeads) {
            const base = {
              name: row.name || row.Name || 'Unknown',
              company: row.company || row.Company || 'Unknown',
              website: row.website || row.Website || '',
              linkedin_url: row.linkedin_url || row.LinkedIn || '',
              opportunity_type: row.type || 'Design',
            };
            
            const enriched = await enrichLead(base.website);
            const complete = { 
              ...base, 
              ...enriched, 
              status: 'New' as LeadStatus,
              owner_id: userId,
              created_at: serverTimestamp()
            };
            
            const processed = {
              ...complete,
              score: calculateLeadScore(complete),
              audit: generateLeadAudit(complete),
            };

            await addDoc(collection(db, 'leads'), processed);
          }
          toast.dismiss(loadingToast);
          toast.success(`${parsedLeads.length} Records Imported`);
        } catch (error: any) {
          console.error('Import error:', error);
          toast.dismiss(loadingToast);
          toast.error('Import failed');
        }
      }
    });
  };

  const seedMockData = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    const mockData = [
      { name: 'Alex Rivera', company: 'DesignFlow', website: 'designflow.studio', industry: 'Agency', score: 85, status: 'New' as LeadStatus, opportunity_type: 'Design' },
      { name: 'Sarah Chen', company: 'Lumina SaaS', website: 'lumina.so', industry: 'SaaS', score: 65, status: 'Engaged' as LeadStatus, opportunity_type: 'SEO' },
      { name: 'Marcus Thorne', company: 'BuildWise', website: 'buildwise.io', industry: 'Fintech', score: 95, status: 'Meeting' as LeadStatus, opportunity_type: 'Maintenance' },
      { name: 'Elena Vance', company: 'Pure Logistics', website: 'purelogistics.com', industry: 'Logistics', score: 45, status: 'Prospect' as LeadStatus, opportunity_type: 'Marketing' },
    ];

    try {
      for (const m of mockData) {
        const lead = { 
          ...m, 
          audit: generateLeadAudit(m as any),
          owner_id: userId,
          created_at: serverTimestamp()
        };
        await addDoc(collection(db, 'leads'), lead as any);
      }
      toast.success('Sample data generated');
    } catch (error: any) {
      toast.error('Failed to seed data');
    }
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Optimizing Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 selection:bg-indigo-600/10 pb-20">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center shadow-sm">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Growth Dashboard</h1>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Client Campaign: {auth.currentUser?.displayName || auth.currentUser?.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-zinc-200/50 border border-zinc-200/50 rounded-xl">
              <button 
                onClick={() => setActiveTab('pipeline')}
                className={cn(
                  "px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all",
                  activeTab === 'pipeline' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                Lead Pipeline
              </button>
              <button 
                onClick={() => setActiveTab('prospecting')}
                className={cn(
                  "px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all",
                  activeTab === 'prospecting' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                Smart Prospecting
              </button>
              <button 
                onClick={() => setActiveTab('linkedin')}
                className={cn(
                  "px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all",
                  activeTab === 'linkedin' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                LinkedIn Assistant
              </button>
            </div>

            <div className="w-px h-6 bg-zinc-200" />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleCsvUpload} 
              accept=".csv" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-zinc-400 hover:text-zinc-600 bg-white border border-zinc-200 rounded-xl transition-all shadow-sm"
              title="Bulk Import Leads"
            >
              <Upload className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
            >
              <Plus className="h-4 w-4" />
              Add New Lead
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'pipeline' ? (
            <motion.div 
              key="pipeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Leads', value: totalLeads, unit: 'Portfolio', trend: 'STABLE', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Active Prospects', value: leads.filter(l => l.status === 'Prospect').length, unit: 'Identified', trend: 'GROWING', color: 'text-sky-600', bg: 'bg-sky-50' },
                  { label: 'High Intent', value: highQualityLeads, unit: 'Hot Leads', trend: 'URGENT', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Meetings Booked', value: leads.filter(l => l.status === 'Meeting').length, unit: 'Scheduled', trend: 'ACTIVE', color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="bg-white border border-zinc-200 p-8 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-3xl font-extrabold tracking-tight", stat.color)}>{stat.value}</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{stat.unit}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className={cn("h-1.5 w-1.5 rounded-full bg-current", stat.color, "animate-pulse")} />
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pipeline Interface */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative w-full max-w-xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                    <input 
                      type="text"
                      placeholder="Search pipeline, companies, or industries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-white border border-zinc-200 rounded-3xl text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all placeholder:text-zinc-300"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={seedMockData}
                      className="px-4 py-2 text-[10px] font-bold text-indigo-600/60 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] border border-indigo-200 rounded-lg"
                    >
                      Seed Demo Data
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
                  {leads.length > 0 ? (
                    <LeadTable 
                      leads={filteredLeads} 
                      onStatusUpdate={handleStatusUpdate}
                      onSelectLead={(lead) => setSelectedLead(lead)}
                    />
                  ) : (
                    <div className="p-24 flex flex-col items-center text-center space-y-6">
                      <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                        <Database className="h-10 w-10 text-zinc-300" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-zinc-900">Your pipeline is empty</h3>
                        <p className="text-sm text-zinc-500 max-w-sm">No leads identified yet. Start by adding a lead manually or importing your CSV file.</p>
                      </div>
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-10 py-4 bg-zinc-900 text-white font-bold text-sm rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-zinc-200"
                      >
                        Add Your First Lead
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'prospecting' ? (
            <motion.div
              key="prospecting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProspectingTool />
            </motion.div>
          ) : (
            <motion.div
              key="linkedin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LinkedInAssistant />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AddLeadModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddLead}
        />

        <OutreachModal 
          isOpen={!!selectedLead} 
          onClose={() => setSelectedLead(null)} 
          lead={selectedLead}
        />
      </div>
    </div>
  );
}
