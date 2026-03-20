import React from 'react';
import { auth, signOut } from '../firebase';
import { UserProfile } from '../types';
import { LogOut, ShieldCheck, Moon, Sun, Image as ImageIcon, ImageOff } from 'lucide-react';

interface NavbarProps {
  userProfile: UserProfile | null;
  onOpenAdmin: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  showImages: boolean;
  setShowImages: (v: boolean) => void;
}

export function Navbar({ 
  userProfile, 
  onOpenAdmin, 
  darkMode, 
  setDarkMode, 
  showImages, 
  setShowImages 
}: NavbarProps) {
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between shadow-lg transition-colors duration-300 ${
      darkMode ? "bg-slate-950/80 border-white/10" : "bg-white/80 border-slate-200"
    }`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center relative shadow-lg">
          <div className={`w-full h-0.5 absolute top-1/2 -translate-y-1/2 ${darkMode ? "bg-slate-950" : "bg-white"}`} />
          <div className={`w-3 h-3 bg-white rounded-full border-2 z-10 ${darkMode ? "border-slate-950" : "border-red-600"}`} />
        </div>
        <div className="flex flex-col">
          <h1 className={`text-xl font-bold tracking-tight leading-none ${darkMode ? "text-white" : "text-slate-900"}`}>Pokémon GO</h1>
          <span className={`text-xs font-medium uppercase tracking-widest ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Checklist</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-1 sm:gap-2 pr-3 sm:pr-6 border-r border-white/10">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              darkMode ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowImages(!showImages)}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              darkMode ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title={showImages ? "Hide Images" : "Show Images"}
          >
            {showImages ? <ImageIcon className="w-5 h-5" /> : <ImageOff className="w-5 h-5" />}
          </button>
        </div>

        {userProfile?.role === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-full hover:bg-emerald-600/30 transition-all text-sm font-bold cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Update Pokédex</span>
            <span className="sm:hidden">Admin</span>
          </button>
        )}

        {userProfile && (
          <div className={`flex items-center gap-4 pl-3 sm:pl-6 border-l ${darkMode ? "border-white/10" : "border-slate-200"}`}>
            <div className="flex flex-col items-end hidden md:flex">
              <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>{userProfile.displayName}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{userProfile.role}</span>
            </div>
            <img
              src={userProfile.photoURL || `https://ui-avatars.com/api/?name=${userProfile.displayName}`}
              alt={userProfile.displayName || 'User'}
              className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={handleLogout}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                darkMode ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
