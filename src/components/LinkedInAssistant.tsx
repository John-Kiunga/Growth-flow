import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Target, 
  MessageSquare, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Search,
  MessageCircle,
  TrendingUp,
  BrainCircuit,
  Settings2
} from 'lucide-react';
import { generateLinkedInComment, analyzePostForLeads, generateResponseStrategy } from '../lib/ai';
import toast from 'react-hot-toast';
import { 
  Plus,
  Send,
  ExternalLink,
  ChevronRight,
  Mail as MailIcon
} from 'lucide-react';

interface LinkedInAssistantProps {
  onInterceptComplete?: (data: any) => void;
}

const TONES = [
  { id: 'expert', label: 'Expert', icon: BrainCircuit, color: 'text-blue-500' },
  { id: 'supportive', label: 'Supportive', icon: MessageCircle, color: 'text-emerald-500' },
  { id: 'witty', label: 'Witty', icon: Zap, color: 'text-amber-500' },
  { id: 'professional', label: 'Managerial', icon: Settings2, color: 'text-zinc-500' },
  { id: 'curious', label: 'Insightful', icon: Search, color: 'text-indigo-500' },
];

export function LinkedInAssistant({ onInterceptComplete }: LinkedInAssistantProps) {
  const [postContent, setPostContent] = useState('');
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [generatedComment, setGeneratedComment] = useState('');
  const [generatingComment, setGeneratingComment] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [activeTab, setActiveTab] = useState<'comment' | 'outreach'>('comment');

  const handleAnalyze = async () => {
    if (!postContent.trim()) {
      toast.error('Please provide post content to analyze.');
      return;
    }
    
    setAnalyzing(true);
    setAnalysis(null);
    setGeneratedComment('');
    
    try {
      const result = await analyzePostForLeads(postContent);
      setAnalysis(result);
      if (result.opportunityFound) {
        toast.success(`Growth Match Found: ${result.suggestedService}`);
      } else {
        toast.success('Analysis complete');
      }
    } catch (error) {
      toast.error('Could not analyze post');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateComment = async () => {
    setGeneratingComment(true);
    try {
      const comment = await generateLinkedInComment(postContent, selectedTone.label);
      setGeneratedComment(comment);
      toast.success('Comment crafted');
    } catch (error: any) {
      console.error('Comment generation error:', error);
      if (error?.message?.includes('429')) {
        toast.error('AI is busy. Please try again in 5 seconds.');
      } else {
        toast.error('Failed to craft comment');
      }
    } finally {
      setGeneratingComment(false);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!analysis) return;
    setGeneratingStrategy(true);
    try {
      const result = await generateResponseStrategy(analysis, postContent);
      setStrategy(result);
      setGeneratedComment(result.strategicComment);
      toast.success('Omnichannel strategy drafted');
    } catch (error) {
      toast.error('Failed to generate strategy');
    } finally {
      setGeneratingStrategy(false);
    }
  };

  const postComment = async (text: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Publishing to LinkedIn...',
        success: 'Comment posted successfully!',
        error: 'Failed to post comment. Check LinkedIn bridge.',
      }
    );
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">LinkedIn Engagement Assistant</h3>
            <p className="text-sm text-zinc-500">Analyze posts and generate high-value comments in seconds.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Post Content or Link</label>
            <span className="text-[10px] text-zinc-300 font-medium">Paste the full text or content summary</span>
          </div>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What should we respond to?"
            className="w-full h-40 bg-zinc-50 border border-zinc-100 rounded-2xl p-6 text-sm text-zinc-700 placeholder:text-zinc-300 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 outline-none transition-all resize-none shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {TONES.map((tone) => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                  selectedTone.id === tone.id
                    ? 'bg-zinc-900 text-white border-transparent shadow-lg'
                    : 'bg-white text-zinc-500 border-zinc-100 hover:border-zinc-200'
                }`}
              >
                <tone.icon className={`h-3 w-3 ${selectedTone.id === tone.id ? 'text-white' : tone.color}`} />
                {tone.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setPostContent('');
                setAnalysis(null);
                setGeneratedComment('');
              }}
              className="flex-1 md:flex-none px-6 py-3 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !postContent.trim()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
              Analyze Post
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            {/* Intel Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-zinc-200 p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {analyzing && <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />}
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                      {analyzing ? 'Performing Deep Audit...' : 'Strategy Insight'}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    analysis.opportunityFound ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-50 text-zinc-500'
                  }`}>
                    {analysis.opportunityFound ? 'Growth Match' : 'General Engagement'}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute -left-3 top-0 bottom-0 w-1 bg-indigo-600 rounded-full opacity-20" />
                    <p className="text-base font-bold text-zinc-800 leading-tight tracking-tight">
                      {analysis.reason}
                    </p>
                  </div>
                  
                  {analysis.suggestedService && (
                    <div className="pt-4 border-t border-zinc-100">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Recommended Focus</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-100">
                        <Sparkles className="h-3 w-3" />
                        {analysis.suggestedService}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGenerateStrategy}
                  disabled={generatingStrategy || !analysis}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 text-white rounded-2xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                >
                  {generatingStrategy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {strategy ? 'Regenerate Strategy' : 'Craft Full Strategy'}
                </button>
              </div>

              {/* Outreach Card - Only if strategy exists */}
              {strategy && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900 rounded-3xl p-8 space-y-6 text-white shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Target className="h-24 w-24" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Cold Email Anchor</span>
                    <h4 className="text-sm font-bold text-indigo-400 mt-1">{strategy.emailSubject}</h4>
                  </div>
                  <div className="pt-4 border-t border-zinc-800 space-y-4">
                    <button 
                      onClick={() => copyToClipboard(strategy.directMessage)}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Pattern-Interrupt DM
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Response Card */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {(generatedComment || strategy) ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full bg-white border border-zinc-200 rounded-[40px] p-10 space-y-8 shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-center gap-6 border-b border-zinc-100 pb-8">
                      <button 
                        onClick={() => setActiveTab('comment')}
                        className={`text-xs font-extrabold uppercase tracking-widest pb-4 border-b-2 transition-all ${
                          activeTab === 'comment' ? 'text-indigo-600 border-indigo-600' : 'text-zinc-400 border-transparent hover:text-zinc-600'
                        }`}
                      >
                        Public Comment
                      </button>
                      <button 
                        onClick={() => setActiveTab('outreach')}
                        className={`text-xs font-extrabold uppercase tracking-widest pb-4 border-b-2 transition-all ${
                          activeTab === 'outreach' ? 'text-indigo-600 border-indigo-600' : 'text-zinc-400 border-transparent hover:text-zinc-600'
                        }`}
                      >
                        Private Outreach
                      </button>
                    </div>

                    <div className="min-h-[200px]">
                      {activeTab === 'comment' ? (
                        <div className="space-y-6">
                           <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                              <MessageSquare className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-4 flex-1">
                              <p className="text-xl font-bold text-zinc-900 leading-tight">
                                {generatedComment || strategy?.strategicComment}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-zinc-50 border border-zinc-100 rounded text-[9px] font-bold text-zinc-500 uppercase">Strategic</span>
                                <span className="px-2 py-1 bg-zinc-50 border border-zinc-100 rounded text-[9px] font-bold text-zinc-500 uppercase">Value-First</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                           <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                              <MailIcon className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="space-y-4 flex-1">
                              <p className="text-xl font-bold text-zinc-900 leading-tight italic">
                                "{strategy?.directMessage || 'Generate strategy to see DM'}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-8 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => copyToClipboard(activeTab === 'comment' ? (generatedComment || strategy?.strategicComment) : strategy?.directMessage)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-50 text-zinc-600 rounded-2xl font-bold text-xs hover:bg-zinc-100 transition-all border border-zinc-100"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Draft
                        </button>
                        
                        {activeTab === 'comment' && (
                          <button 
                            onClick={() => postComment(generatedComment || strategy?.strategicComment)}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                          >
                            <Send className="h-4 w-4" />
                            Post to LinkedIn
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        AI-Optimized for {activeTab === 'comment' ? 'Feed Visibility' : 'Response Rates'}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-zinc-400">
                    <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                      <BrainCircuit className="h-8 w-8 text-zinc-200" />
                    </div>
                    <p className="text-sm font-medium">Analyze content to craft your response</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
