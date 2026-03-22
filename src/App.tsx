import React, { useState, useEffect, useMemo } from 'react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Pokemon, UserPokemonData, UserProfile, Generation, PokedexMeta } from './types';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { PokemonCard } from './components/PokemonCard';
import { FilterBar } from './components/FilterBar';
import { AdminModal } from './components/AdminModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Loader2, Trophy, Star, Clover, Award, Sparkles, Search, Zap, Moon, Sun, Image as ImageIcon, ImageOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [userPokemonData, setUserPokemonData] = useState<Record<string, UserPokemonData>>({});
  const [meta, setMeta] = useState<PokedexMeta | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filters
  const [search, setSearch] = useState('');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [generation, setGeneration] = useState<Generation | 'All'>('All');
  const [status, setStatus] = useState<'All' | 'Completed' | 'Incomplete'>('All');
  const [variantFilters, setVariantFilters] = useState<Record<keyof Omit<UserPokemonData, 'updatedAt'>, 'all' | 'owned' | 'missing'>>({
    normal: 'all',
    shiny: 'all',
    lucky: 'all',
    perfect: 'all',
    luckyShiny: 'all',
    maxLevel: 'all'
  });

  // Settings
  const [darkMode, setDarkMode] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const paginationLimit = parseInt(import.meta.env.VITE_PAGINATION_LIMIT || '60', 10);
  const [displayLimit, setDisplayLimit] = useState(paginationLimit);

  // Reset limit when filters change
  useEffect(() => {
    setDisplayLimit(paginationLimit);
    setSelectedIds(new Set());
  }, [search, fromId, toId, generation, status, variantFilters, paginationLimit]);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const existingProfile = userDoc.data() as UserProfile;
          const isAdminEmail = currentUser.email === 'oriol.parcerisa@gmail.com';

          if (isAdminEmail && existingProfile.role !== 'admin') {
            await updateDoc(userDocRef, { role: 'admin' });
            setUserProfile({ ...existingProfile, role: 'admin', uid: currentUser.uid });
          } else {
            setUserProfile({ uid: currentUser.uid, ...existingProfile });
          }
        } else {
          const isAdminEmail = currentUser.email === 'oriol.parcerisa@gmail.com';
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            role: isAdminEmail ? 'admin' : 'user',
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          };
          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!isAuthReady || !user) return;

    // 1. Master Pokemon List
    const pokemonQuery = query(collection(db, 'pokemon'), orderBy('id', 'asc'));
    const unsubPokemon = onSnapshot(pokemonQuery, (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data() as Pokemon);
      setPokemonList(list);
      setIsLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pokemon'));

    // 2. User Checklist Data
    const userPokemonQuery = collection(db, 'users', user.uid, 'pokemon');
    const unsubUserData = onSnapshot(userPokemonQuery, (snapshot) => {
      const data: Record<string, UserPokemonData> = {};
      snapshot.docs.forEach(doc => {
        data[doc.id] = doc.data() as UserPokemonData;
      });
      setUserPokemonData(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/pokemon`));

    // 3. Pokedex Meta
    const unsubMeta = onSnapshot(doc(db, 'meta', 'pokedex'), (doc) => {
      if (doc.exists()) setMeta(doc.data() as PokedexMeta);
    });

    return () => {
      unsubPokemon();
      unsubUserData();
      unsubMeta();
    };
  }, [isAuthReady, user]);

  // Filtered List
  const filteredPokemon = useMemo(() => {
    return pokemonList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesFrom = fromId === '' || p.id >= parseInt(fromId);
      const matchesTo = toId === '' || p.id <= parseInt(toId);
      const matchesGen = generation === 'All' || p.generation === generation;

      const userData = userPokemonData[p.id.toString()];
      const isCompleted = userData?.normal && userData?.shiny && userData?.lucky && userData?.perfect && userData?.luckyShiny && userData?.maxLevel;
      const matchesStatus = status === 'All' || (status === 'Completed' ? isCompleted : !isCompleted);

      // Variant Filters
      const matchesVariants = Object.entries(variantFilters).every(([field, filter]) => {
        if (filter === 'all') return true;
        const isOwned = !!(userData as any)?.[field];
        return filter === 'owned' ? isOwned : !isOwned;
      });

      return matchesSearch && matchesFrom && matchesTo && matchesGen && matchesStatus && matchesVariants;
    });
  }, [pokemonList, search, fromId, toId, generation, status, userPokemonData, variantFilters]);

  // Stats
  const stats = useMemo(() => {
    const totals = { normal: 0, shiny: 0, lucky: 0, perfect: 0, luckyShiny: 0, maxLevel: 0 };
    Object.values(userPokemonData).forEach((d: UserPokemonData) => {
      if (d.normal) totals.normal++;
      if (d.shiny) totals.shiny++;
      if (d.lucky) totals.lucky++;
      if (d.perfect) totals.perfect++;
      if (d.luckyShiny) totals.luckyShiny++;
      if (d.maxLevel) totals.maxLevel++;
    });
    return totals;
  }, [userPokemonData]);

  const visiblePokemon = useMemo(() => {
    return filteredPokemon.slice(0, displayLimit);
  }, [filteredPokemon, displayLimit]);

  const handleToggle = (pokemonId: number, field: keyof UserPokemonData) => {
    if (!user) return;
    const idStr = pokemonId.toString();
    const currentData = userPokemonData[idStr] || {
      normal: false, shiny: false, lucky: false, perfect: false, luckyShiny: false, maxLevel: false
    };

    const newData = { ...currentData, [field]: !currentData[field], updatedAt: serverTimestamp() };

    // Optimistic Update
    setUserPokemonData(prev => ({ ...prev, [idStr]: newData as any }));

    const updateFirestore = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'pokemon', idStr);
        await setDoc(docRef, newData);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/pokemon/${idStr}`);
      }
    };

    updateFirestore();
  };

  const handleBulkToggle = async (field: keyof UserPokemonData) => {
    if (!user || selectedIds.size === 0) return;

    const idsToUpdate = Array.from(selectedIds);
    const now = serverTimestamp();

    // Optimistic Update
    setUserPokemonData(prev => {
      const next = { ...prev };
      idsToUpdate.forEach(id => {
        const idStr = id.toString();
        const current = next[idStr] || {
          normal: false, shiny: false, lucky: false, perfect: false, luckyShiny: false, maxLevel: false
        };
        next[idStr] = { ...current, [field]: true, updatedAt: now as any };
      });
      return next;
    });

    // Firestore Update
    try {
      await Promise.all(idsToUpdate.map(async (id) => {
        const idStr = id.toString();
        const docRef = doc(db, 'users', user.uid, 'pokemon', idStr);
        const currentData = userPokemonData[idStr] || {
          normal: false, shiny: false, lucky: false, perfect: false, luckyShiny: false, maxLevel: false
        };
        await setDoc(docRef, { ...currentData, [field]: true, updatedAt: now });
      }));
      setSelectedIds(new Set());
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/pokemon/bulk`);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(visiblePokemon.map(p => p.id)));
  };

  const clearFilters = () => {
    setSearch('');
    setFromId('');
    setToId('');
    setGeneration('All');
    setStatus('All');
    setVariantFilters({
      normal: 'all',
      shiny: 'all',
      lucky: 'all',
      perfect: 'all',
      luckyShiny: 'all',
      maxLevel: 'all'
    });
  };

  if (!isAuthReady) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        </div>
    );
  }

  if (!user) return <Login />;

  return (
      <ErrorBoundary>
        <div className={cn(
            "min-h-screen transition-colors duration-300 font-sans selection:bg-emerald-500/30",
            darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
        )}>
          <Navbar
              userProfile={userProfile}
              onOpenAdmin={() => setIsAdminModalOpen(true)}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              showImages={showImages}
              setShowImages={setShowImages}
          />

          <FilterBar
              search={search} setSearch={setSearch}
              fromId={fromId} setFromId={setFromId}
              toId={toId} setToId={setToId}
              generation={generation} setGeneration={setGeneration}
              status={status} setStatus={setStatus}
              variantFilters={variantFilters} setVariantFilters={setVariantFilters}
              onClear={clearFilters}
              darkMode={darkMode}
          />

          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Stats Header */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
              {[
                { label: 'Normal', value: stats.normal, icon: Trophy, color: 'text-blue-400' },
                { label: 'Shiny', value: stats.shiny, icon: Star, color: 'text-amber-400' },
                { label: 'Lucky', value: stats.lucky, icon: Clover, color: 'text-yellow-500' },
                { label: 'Perfect', value: stats.perfect, icon: Award, color: 'text-red-500' },
                { label: 'L.Shiny', value: stats.luckyShiny, icon: Sparkles, color: 'text-purple-400' },
                { label: 'Max Lvl', value: stats.maxLevel, icon: Zap, color: 'text-orange-500' },
              ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/50 border border-white/5 p-4 rounded-3xl flex items-center gap-4 shadow-lg">
                    <div className={`p-2 rounded-2xl bg-white/5 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{stat.label}</p>
                      <p className="text-xl font-bold text-white">
                        {stat.value} <span className="text-xs text-slate-600 font-medium">/ {meta?.totalCount || 0}</span>
                      </p>
                    </div>
                  </div>
              ))}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {[...Array(12)].map((_, i) => (
                      <div key={i} className="h-80 bg-slate-900/50 rounded-3xl animate-pulse border border-white/5" />
                  ))}
                </div>
            ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Showing {filteredPokemon.length} Pokémon
                    </h2>
                    <div className="flex gap-2">
                      {selectedIds.size > 0 ? (
                          <button
                              onClick={() => setSelectedIds(new Set())}
                              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
                          >
                            Deselect All ({selectedIds.size})
                          </button>
                      ) : (
                          <button
                              onClick={selectAllVisible}
                              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
                          >
                            Select All Visible
                          </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {visiblePokemon.map((pokemon) => (
                          <PokemonCard
                              key={pokemon.id}
                              pokemon={pokemon}
                              userData={userPokemonData[pokemon.id.toString()]}
                              onToggle={(field: keyof UserPokemonData) => handleToggle(pokemon.id, field)}
                              showImages={showImages}
                              darkMode={darkMode}
                              isSelected={selectedIds.has(pokemon.id)}
                              onSelect={() => toggleSelect(pokemon.id)}
                          />
                      ))}
                    </AnimatePresence>
                  </div>

                  {displayLimit < filteredPokemon.length && (
                      <div className="mt-12 flex justify-center">
                        <button
                            onClick={() => setDisplayLimit(prev => prev + paginationLimit)}
                            className={cn(
                                "px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95",
                                darkMode
                                    ? "bg-slate-900 border border-white/10 text-emerald-400 hover:bg-slate-800 hover:border-emerald-500/30"
                                    : "bg-white border border-slate-200 text-emerald-600 hover:bg-slate-50 hover:border-emerald-500"
                            )}
                        >
                          Load More Pokémon ({filteredPokemon.length - displayLimit} remaining)
                        </button>
                      </div>
                  )}

                  {filteredPokemon.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Search className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No Pokémon found matching your filters.</p>
                        <button onClick={clearFilters} className="mt-4 text-emerald-400 font-bold hover:underline">
                          Clear all filters
                        </button>
                      </div>
                  )}
                </>
            )}
          </main>

          <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />

          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6"
                >
                  <div className={cn(
                      "p-4 rounded-3xl shadow-2xl border flex items-center justify-between gap-4",
                      darkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
                  )}>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Bulk Actions</span>
                      <span className="text-sm font-bold">{selectedIds.size} Selected</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {[
                        { field: 'normal', icon: Check, color: 'bg-sky-400', label: 'Normal' },
                        { field: 'shiny', icon: Star, color: 'bg-rose-500', label: 'Shiny' },
                        { field: 'lucky', icon: Clover, color: 'bg-amber-400', label: 'Lucky' },
                        { field: 'perfect', icon: Award, color: 'bg-red-600', label: 'Perfect' },
                        { field: 'luckyShiny', icon: Sparkles, color: 'bg-gradient-to-br from-rose-400 to-amber-400', label: 'L.Shiny' },
                        { field: 'maxLevel', icon: Zap, color: 'bg-indigo-600', label: 'Max Lvl' },
                      ].map((action) => (
                          <button
                              key={action.field}
                              onClick={() => handleBulkToggle(action.field as keyof UserPokemonData)}
                              title={`Mark all as ${action.label}`}
                              className={cn(
                                  "p-3 rounded-xl text-white transition-all hover:scale-110 active:scale-90 shadow-lg",
                                  action.color
                              )}
                          >
                            <action.icon className="w-5 h-5" />
                          </button>
                      ))}
                    </div>

                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <Loader2 className="w-5 h-5 rotate-45" /> {/* Using Loader2 as a cross for now or Lucide X if available */}
                    </button>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ErrorBoundary>
  );
}
