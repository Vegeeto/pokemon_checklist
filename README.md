# Pokémon GO Checklist

A comprehensive web application to track your Pokémon collection in Pokémon GO.

## Features
- **Google Sign-In**: Securely log in with your Google account.
- **Master Pokédex**: Access all Pokémon available in Pokémon GO (900+).
- **Checklist Tracking**: Track Normal, Shiny, Lucky, Perfect, and Lucky Shiny variants for each Pokémon.
- **Real-time Sync**: Your data is saved instantly to Firestore and synced across devices.
- **Advanced Filtering**: Filter by name, Pokédex number, region/generation, and completion status.
- **Admin Sync System**: Admins can sync the master Pokédex with PokéAPI to add new Pokémon.
- **Responsive Design**: Mobile-first UI inspired by Pokémon GO's dark aesthetic.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Firebase Authentication, Cloud Firestore.
- **Data Source**: PokéAPI.

## Setup
1. Configure Firebase in the AI Studio settings.
2. Add your Google Sign-In credentials in the Firebase Console.
3. Set your email as an admin in the `isAdmin` function in `firestore.rules` (already done for the current user).
4. Run the app and use the "Update Pokédex" button to populate the database.
