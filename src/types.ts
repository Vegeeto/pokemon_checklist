import { Timestamp } from 'firebase/firestore';

export interface Pokemon {
  id: number;
  name: string;
  generation: string;
  sprite: string;
  addedAt?: Timestamp;
  lastSyncedAt?: Timestamp;
}

export interface UserPokemonData {
  normal: boolean;
  shiny: boolean;
  suerte: boolean;
  perfect: boolean;
  luckyShiny: boolean;
  maxLevel: boolean;
  updatedAt?: Timestamp;
}

export interface UserProfile {
  uid: string;
  role: 'admin' | 'user';
  displayName: string | null;
  photoURL: string | null;
}

export interface PokedexMeta {
  totalCount: number;
  lastUpdatedAt: Timestamp;
  lastUpdatedBy: string;
  newPokemonAdded: number;
}

export interface SyncHistory {
  timestamp: Timestamp;
  userId: string;
  newCount: number;
  totalCount: number;
}

export type Generation = 'Kanto' | 'Johto' | 'Hoenn' | 'Sinnoh' | 'Unova' | 'Kalos' | 'Alola' | 'Galar' | 'Paldea' | 'Future Generations';

export const GENERATIONS: Generation[] = [
  'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'
];

export function getGenerationFromId(id: number): Generation {
  if (id <= 151) return 'Kanto';
  if (id <= 251) return 'Johto';
  if (id <= 386) return 'Hoenn';
  if (id <= 493) return 'Sinnoh';
  if (id <= 649) return 'Unova';
  if (id <= 721) return 'Kalos';
  if (id <= 809) return 'Alola';
  if (id <= 905) return 'Galar';
  if (id <= 1025) return 'Paldea';
  return 'Future Generations';
}
