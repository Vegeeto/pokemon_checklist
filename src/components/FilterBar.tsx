import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Trophy, Star, Clover, Award, Sparkles, Zap } from 'lucide-react';
import { Generation, GENERATIONS, UserPokemonData } from '../types';

interface FilterBarProps {
  search: string;
  setSearch: (s: string) => void;
  fromId: string;
  setFromId: (id: string) => void;
  toId: string;
  setToId: (id: string) => void;
  generation: Generation | 'All';
  setGeneration: (g: Generation | 'All') => void;
  status: 'All' | 'Completed' | 'Incomplete';
  setStatus: (s: 'All' | 'Completed' | 'Incomplete') => void;
  variantFilters: Record<keyof Omit<UserPokemonData, 'updatedAt'>, 'all' | 'owned' | 'missing'>;
  setVariantFilters: (v: any) => void;
  onClear: () => void;
  darkMode: boolean;
}

export function FilterBar({
  search, setSearch,
  fromId, setFromId,
  toId, setToId,
  generation, setGeneration,
  status, setStatus,
  variantFilters, setVariantFilters,
  onClear,
  darkMode
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleVariantFilter = (field: keyof Omit<UserPokemonData, 'updatedAt'>) => {
    const current = variantFilters[field];
    const next = current === 'all' ? 'owned' : current === 'owned' ? 'missing' : 'all';
    setVariantFilters((prev: any) => ({ ...prev, [field]: next }));
  };

  const variantIcons = [
    { field: 'normal', icon: Trophy, label: 'Normal' },
    { field: 'shiny', icon: Star, label: 'Shiny' },
    { field: 'suerte', icon: Clover, label: 'Lucky' },
    { field: 'perfect', icon: Award, label: 'Perfect' },
    { field: 'luckyShiny', icon: Sparkles, label: 'L.Shiny' },
    { field: 'maxLevel', icon: Zap, label: 'Max Lvl' },
  ];

  return (
    <div className={`sticky top-[73px] z-40 backdrop-blur-md border-b p-4 shadow-xl transition-colors duration-300 ${
      darkMode ? "bg-slate-950/90 border-white/10" : "bg-white/90 border-slate-200"
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Mobile Header with Search and Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
              darkMode ? "text-slate-500 group-focus-within:text-emerald-400" : "text-slate-400 group-focus-within:text-emerald-600"
            }`} />
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-11 pr-4 py-2.5 border rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 ${
                darkMode 
                  ? "bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-emerald-500/50 focus:border-emerald-500/50" 
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-emerald-500/30 focus:border-emerald-500"
              }`}
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`sm:hidden p-2.5 border rounded-2xl transition-all ${
              darkMode 
                ? "bg-slate-900/50 border-white/10 text-slate-400 hover:text-white" 
                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900"
            }`}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
          </button>

          <button
            onClick={onClear}
            className={`hidden sm:block p-2.5 border rounded-2xl transition-all ${
              darkMode 
                ? "bg-slate-900/50 border-white/10 text-slate-400 hover:text-white" 
                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900"
            }`}
            title="Clear Filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Content - Collapsible on Mobile */}
        <div className={`${isExpanded ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-4`}>
          {/* ID Range */}
          <div className={`flex items-center gap-2 border rounded-2xl px-3 py-1 ${
            darkMode ? "bg-slate-900/50 border-white/10" : "bg-slate-50 border-slate-200"
          }`}>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dex</span>
            <input
              type="number"
              placeholder="From"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className={`w-16 bg-transparent text-sm focus:outline-none text-center ${darkMode ? "text-white" : "text-slate-900"}`}
            />
            <span className="text-slate-700">/</span>
            <input
              type="number"
              placeholder="To"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className={`w-16 bg-transparent text-sm focus:outline-none text-center ${darkMode ? "text-white" : "text-slate-900"}`}
            />
          </div>

          {/* Generation */}
          <div className="relative group flex-1 sm:flex-none">
            <select
              value={generation}
              onChange={(e) => setGeneration(e.target.value as any)}
              className={`w-full appearance-none pl-4 pr-10 py-2.5 border rounded-2xl text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 ${
                darkMode 
                  ? "bg-slate-900/50 border-white/10 text-white focus:ring-emerald-500/50" 
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-emerald-500/30"
              }`}
            >
              <option value="All">All Regions</option>
              {GENERATIONS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Status */}
          <div className="relative group flex-1 sm:flex-none">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className={`w-full appearance-none pl-4 pr-10 py-2.5 border rounded-2xl text-sm transition-all cursor-pointer focus:outline-none focus:ring-2 ${
                darkMode 
                  ? "bg-slate-900/50 border-white/10 text-white focus:ring-emerald-500/50" 
                  : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-emerald-500/30"
              }`}
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Incomplete">Incomplete</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <button
            onClick={onClear}
            className={`sm:hidden flex-1 py-2.5 border rounded-2xl text-sm font-bold transition-all ${
              darkMode 
                ? "bg-slate-900/50 border-white/10 text-slate-400 hover:text-white" 
                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900"
            }`}
          >
            Clear All Filters
          </button>
        </div>

        {/* Variant Filters */}
        <div className={`${isExpanded ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-2 pt-2 border-t ${
          darkMode ? "border-white/5" : "border-slate-200"
        }`}>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Variants:</span>
          <div className="flex flex-wrap gap-2">
            {variantIcons.map(({ field, icon: Icon, label }) => {
              const state = variantFilters[field as keyof typeof variantFilters];
              return (
                <button
                  key={field}
                  onClick={() => toggleVariantFilter(field as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    state === 'all' 
                      ? darkMode 
                        ? 'bg-slate-900/30 border-white/5 text-slate-500 hover:border-white/20' 
                        : 'bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300'
                      : state === 'owned'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-red-500/20 border-red-500/50 text-red-400'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}: {state === 'all' ? 'All' : state === 'owned' ? 'Owned' : 'Missing'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
