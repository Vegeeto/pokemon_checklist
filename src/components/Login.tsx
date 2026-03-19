import React from 'react';
import { auth, googleProvider, googleProvider as provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

export function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-sm w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl text-center"
      >
        <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(220,38,38,0.5)] relative">
          <div className="w-full h-1 bg-slate-950 absolute top-1/2 -translate-y-1/2" />
          <div className="w-8 h-8 bg-white rounded-full border-4 border-slate-950 z-10" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-2">Pokémon GO</h1>
        <p className="text-slate-400 text-lg mb-10">Checklist</p>
        
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95 shadow-lg"
        >
          <LogIn className="w-6 h-6" />
          Sign in with Google
        </button>
        
        <p className="mt-8 text-xs text-slate-500">
          Track your collection, shinies, and perfect IVs.
        </p>
      </motion.div>
    </div>
  );
}
