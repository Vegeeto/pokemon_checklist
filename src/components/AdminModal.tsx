import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, writeBatch, serverTimestamp, onSnapshot, addDoc } from 'firebase/firestore';
import { Pokemon, PokedexMeta, getGenerationFromId } from '../types';
import { X, RefreshCw, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const [meta, setMeta] = useState<PokedexMeta | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{ added: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = onSnapshot(doc(db, 'meta', 'pokedex'), (doc) => {
      if (doc.exists()) setMeta(doc.data() as PokedexMeta);
    });
    return () => unsub();
  }, [isOpen]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: 0 });

    try {
      // 1. Fetch all pokemon from PokeAPI
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
      const data = await response.json();
      const allResults = data.results;
      setProgress({ current: 0, total: allResults.length });

      // 2. Get existing IDs from Firestore (to avoid duplicates)
      // For simplicity in this demo, we'll just check each one or batch them.
      // In a real app, you'd fetch all IDs first.
      
      let addedCount = 0;
      const batchSize = 100;
      
      for (let i = 0; i < allResults.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = allResults.slice(i, i + batchSize);
        
        for (const item of chunk) {
          const id = parseInt(item.url.split('/').filter(Boolean).pop()!);
          if (isNaN(id)) continue;

          const pokemonDocRef = doc(db, 'pokemon', id.toString());
          const pokemonDoc = await getDoc(pokemonDocRef);

          if (!pokemonDoc.exists()) {
            // Fetch details for new pokemon
            const detailRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const detailData = await detailRes.json();
            
            const newPokemon: Pokemon = {
              id,
              name: detailData.name,
              generation: getGenerationFromId(id),
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
              addedAt: serverTimestamp() as any,
              lastSyncedAt: serverTimestamp() as any
            };
            
            batch.set(pokemonDocRef, newPokemon);
            addedCount++;
          }
          setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
        
        await batch.commit();
      }

      // 3. Update Meta
      const newTotal = (meta?.totalCount || 0) + addedCount;
      await setDoc(doc(db, 'meta', 'pokedex'), {
        totalCount: newTotal,
        lastUpdatedAt: serverTimestamp(),
        lastUpdatedBy: auth.currentUser?.uid || 'unknown',
        newPokemonAdded: addedCount
      });

      // 4. Log History
      await addDoc(collection(db, 'meta', 'pokedex', 'syncHistory'), {
        timestamp: serverTimestamp(),
        userId: auth.currentUser?.uid || 'unknown',
        newCount: addedCount,
        totalCount: newTotal
      });

      setResult({ added: addedCount });
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync with PokéAPI. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Pokédex Admin</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Pokémon</span>
                <p className="text-2xl font-bold text-white mt-1">{meta?.totalCount || 0}</p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Last Updated</span>
                <p className="text-sm font-bold text-white mt-1">
                  {meta?.lastUpdatedAt ? new Date(meta.lastUpdatedAt.toDate()).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>

            {isSyncing ? (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Syncing with PokéAPI...</span>
                  <span className="text-emerald-400 font-bold">{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-center text-xs text-slate-500 font-mono">
                  Processed {progress.current} / {progress.total} Pokémon
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {result && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">Sync complete! Added {result.added} new Pokémon.</p>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                <button
                  onClick={handleSync}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95"
                >
                  <RefreshCw className="w-5 h-5" />
                  Sync Pokédex Now
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
