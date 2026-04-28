import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Shield, ArrowRight, Loader2, Disc, Chrome, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_EMAIL = 'jkyunger@gmail.com';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [restricted, setRestricted] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setRestricted(false);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
        await auth.signOut();
        setRestricted(true);
        toast.error("Account not authorized for this workspace.");
      } else {
        toast.success(`Welcome back, ${user.displayName?.split(' ')[0] || 'Member'}.`);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-[40px] p-12 border border-zinc-200 shadow-2xl shadow-indigo-100/50 relative overflow-hidden">
          <div className="flex flex-col items-center mb-12">
            <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200">
              <Zap className="text-white h-10 w-10" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">GrowthFlow</h1>
              <p className="text-zinc-500 text-sm font-medium">Professional Lead Management Workspace</p>
            </div>
          </div>

          <div className="space-y-8">
            <AnimatePresence>
              {restricted && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-600 font-bold uppercase tracking-widest text-center"
                >
                  Workspace Access Denied
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98] disabled:opacity-50 group"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Chrome className="h-5 w-5" />
                    Sign in with Google
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center">
                Requires authorized workspace credentials
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center justify-center gap-2 text-emerald-500">
                  <div className="w-1.5 h-1.5 bg-current rounded-full" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Verified</span>
                </div>
              </div>
              <div className="w-px h-6 bg-zinc-100" />
              <div className="text-center">
                <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest mb-1">Region</p>
                <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Global</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em]">© 2026 GrowthFlow Inc.</span>
        </div>
      </motion.div>
    </div>
  );
}

