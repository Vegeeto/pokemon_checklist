# Agent Instructions

This application is a Pokémon GO Checklist built with React and Firebase.

## Key Components
- `src/App.tsx`: Main application logic, including auth state, data listeners, and filtering.
- `src/firebase.ts`: Firebase initialization and custom error handling for Firestore operations.
- `src/components/AdminModal.tsx`: Admin-only feature to sync the master Pokémon list from PokéAPI.
- `src/components/PokemonCard.tsx`: Individual Pokémon card with checklist toggles and optimistic UI updates.
- `src/components/FilterBar.tsx`: Sticky filter bar for searching and filtering the list.

## Data Model
- `/pokemon/{id}`: Master Pokémon list.
- `/users/{userId}/pokemon/{id}`: User-specific checklist data.
- `/meta/pokedex`: Global metadata for the Pokédex.

## Security Rules
- `firestore.rules`: Implements role-based access control (RBAC). Admins can write to the master list, while users can only write to their own checklist data.

## Syncing
- The admin sync flow fetches data from `https://pokeapi.co/api/v2/pokemon?limit=2000` and identifies new Pokémon to add to Firestore.
- Generation detection is based on National Dex ID ranges.
