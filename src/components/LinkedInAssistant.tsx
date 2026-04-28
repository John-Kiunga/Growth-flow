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
import { generateLinkedInComment, analyzePostForLeads } from '../lib/ai';
import toast from 'react-hot-toast';

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

  const copyToClipboard = (text: string) => {
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
                  onClick={handleGenerateComment}
                  disabled={generatingComment}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 text-white rounded-2xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                >
                  {generatingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                  {generatedComment ? 'Re-craft Comment' : 'Generate Expert Response'}
                </button>
              </div>
            </div>

            {/* Response Card */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {generatedComment ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full bg-indigo-600 text-white rounded-3xl p-10 space-y-8 shadow-2xl shadow-indigo-200 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                      <selectedTone.icon className="h-32 w-32" />
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Generated Draft</span>
                        <div className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold uppercase tracking-widest border border-white/10">
                          {selectedTone.label} Tone
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(generatedComment)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="relative z-10 group">
                      <p className="text-xl md:text-2xl font-semibold leading-snug tracking-tight">
                        {generatedComment}
                      </p>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Quality Check Passed</p>
                          <p className="text-xs font-medium">Ready for deployment on LinkedIn</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => copyToClipboard(generatedComment)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-zinc-100 transition-all shadow-lg"
                      >
                        Copy Response
                      </button>
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
