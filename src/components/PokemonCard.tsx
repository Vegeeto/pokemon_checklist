import React from 'react';
import { Pokemon, UserPokemonData } from '../types';
import { Check, Star, Clover, Award, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PokemonCardProps {
  pokemon: Pokemon;
  userData: UserPokemonData | undefined;
  onToggle: (field: keyof UserPokemonData) => void;
  showImages: boolean;
  darkMode: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
                                                          pokemon,
                                                          userData,
                                                          onToggle,
                                                          showImages,
                                                          darkMode,
                                                          isSelected,
                                                          onSelect
                                                        }) => {
  const isCompleted = userData?.normal && userData?.shiny && userData?.lucky && userData?.perfect && userData?.luckyShiny && userData?.maxLevel;

  const Checkbox = ({
                      field,
                      label,
                      icon: Icon,
                      activeColor,
                      checked
                    }: {
    field: keyof UserPokemonData,
    label: string,
    icon: React.ElementType,
    activeColor: string,
    checked: boolean
  }) => (
      <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(field);
          }}
          title={label}
          aria-label={label}
          className={cn(
              "flex items-center justify-center p-3 rounded-xl border transition-all active:scale-90 group",
              checked
                  ? `${activeColor} border-transparent shadow-lg`
                  : darkMode
                      ? "bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/20 hover:bg-slate-800"
                      : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-200"
          )}
      >
        <Icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", checked ? "text-white" : darkMode ? "text-slate-600" : "text-slate-400")} />
      </button>
  );

  return (
      <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onSelect}
          className={cn(
              "relative flex flex-col backdrop-blur-sm border rounded-3xl p-4 sm:p-5 transition-all hover:shadow-2xl group min-w-0 cursor-pointer",
              darkMode
                  ? "bg-slate-900/40 border-white/10 hover:border-white/20"
                  : "bg-white border-slate-200 hover:border-slate-300 shadow-sm",
              isSelected && (darkMode
                  ? "ring-2 ring-emerald-500 border-emerald-500/50 bg-emerald-500/10"
                  : "ring-2 ring-emerald-500 border-emerald-500/50 bg-emerald-50"),
              !isSelected && isCompleted && (darkMode
                  ? "bg-emerald-900/20 border-emerald-500/30 ring-1 ring-emerald-500/20"
                  : "bg-emerald-50/50 border-emerald-200 ring-1 ring-emerald-200")
          )}
      >
        {/* Selection Indicator */}
        <div className={cn(
            "absolute top-4 left-4 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center z-20",
            isSelected
                ? "bg-emerald-500 border-emerald-500"
                : darkMode
                    ? "border-white/10 bg-slate-950/50"
                    : "border-slate-200 bg-white"
        )}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
        {showImages && (
            <div className={cn(
                "absolute top-4 right-4 text-[10px] font-mono px-2 py-1 rounded-full border z-20",
                darkMode
                    ? "text-slate-500 bg-slate-950/50 border-white/5"
                    : "text-slate-400 bg-slate-50 border-slate-200"
            )}>
              #{pokemon.id.toString().padStart(3, '0')}
            </div>
        )}

        <div className="flex flex-col items-center mb-4 min-w-0">
          {!showImages && (
              <div className={cn(
                  "text-[10px] font-mono px-2 py-1 rounded-full border mb-3",
                  darkMode
                      ? "text-slate-500 bg-slate-950/50 border-white/5"
                      : "text-slate-400 bg-slate-50 border-slate-200"
              )}>
                #{pokemon.id.toString().padStart(3, '0')}
              </div>
          )}

          {showImages && (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center mb-2">
                <div className={cn(
                    "absolute inset-0 rounded-full blur-2xl transition-colors",
                    darkMode ? "bg-white/5 group-hover:bg-white/10" : "bg-slate-200/50 group-hover:bg-slate-300/50"
                )} />
                <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="w-20 h-20 sm:w-28 sm:h-28 object-contain relative z-10 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                />
              </div>
          )}
          <h3 className={cn(
              "text-base sm:text-lg font-bold capitalize tracking-tight text-center truncate w-full px-2",
              darkMode ? "text-white" : "text-slate-900"
          )} title={pokemon.name}>{pokemon.name}</h3>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1 text-center truncate w-full">{pokemon.generation}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-auto">
          <Checkbox
              field="normal"
              label="Normal"
              icon={Check}
              activeColor="bg-sky-400"
              checked={!!userData?.normal}
          />
          <Checkbox
              field="shiny"
              label="Shiny"
              icon={Star}
              activeColor="bg-rose-500"
              checked={!!userData?.shiny}
          />
          <Checkbox
              field="lucky"
              label="Lucky"
              icon={Clover}
              activeColor="bg-amber-400"
              checked={!!userData?.lucky}
          />
          <Checkbox
              field="perfect"
              label="Perfect"
              icon={Award}
              activeColor="bg-red-600"
              checked={!!userData?.perfect}
          />
          <Checkbox
              field="luckyShiny"
              label="Lucky Shiny"
              icon={Sparkles}
              activeColor="bg-gradient-to-br from-rose-400 to-amber-400"
              checked={!!userData?.luckyShiny}
          />
          <Checkbox
              field="maxLevel"
              label="Max Level"
              icon={Zap}
              activeColor="bg-indigo-600"
              checked={!!userData?.maxLevel}
          />
        </div>

        {isCompleted && (
            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-slate-950">
              <Check className="w-3 h-3" />
            </div>
        )}
      </motion.div>
  );
}
