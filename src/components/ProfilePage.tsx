/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  User, Award, Edit, Check, Star, Shield, 
  Sparkles, Compass, Flame, ArrowRight, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    achievements,
    updateProfile,
    addXP
  } = useClassHub();

  const [isEditing, setIsEditing] = useState(false);
  const [nickName, setNickName] = useState(currentUser?.name || '');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || 'Siswa tangguh Seven D SMPN 2 Lamongan 🌟');
  const [profileStatus, setProfileStatus] = useState(currentUser?.customStatus || 'Ready to Learn 🔥');
  
  // Custom Banner Presets
  const [bannerColor, setBannerColor] = useState<string>('from-blue-500 via-indigo-500 to-purple-600');

  const BANNER_PRESETS = [
    { name: "Cosmic Sky", val: "from-blue-500 via-indigo-500 to-purple-600" },
    { name: "Cyber Violet", val: "from-purple-600 via-pink-500 to-rose-500" },
    { name: "Neo Emerald", val: "from-teal-400 via-emerald-500 to-green-600" },
    { name: "Sunset Gold", val: "from-amber-400 via-orange-500 to-rose-500" }
  ];

  if (!currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(nickName, profileBio, profileStatus);
    setIsEditing(false);
    
    // Reward small XP for custom setups
    addXP(40, "Memodifikasi profil visual kustom");
    alert("✨ Profil Anda berhasil diperbarui!");
  };

  const currentLevelThreshold = 200;
  const currentLeveXp = currentUser.xp % currentLevelThreshold;
  const progressPercent = Math.min(100, Math.floor((currentLeveXp / currentLevelThreshold) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6 font-sans">
      
      {/* 1. VISUAL IDENTIFY GLASS CARD */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 overflow-hidden shadow-xs relative">
        
        {/* Dynamic picked Banner gradient */}
        <div className={`h-36 sm:h-44 bg-gradient-to-r ${bannerColor} relative overflow-hidden transition-all duration-500`}>
          {/* Subtle sparkles ambient circles */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-black/10 blur-xl" />

          {/* Quick banner selector buttons floating at top right */}
          <div className="absolute right-3.5 top-3.5 flex gap-1 bg-black/25 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
            {BANNER_PRESETS.map((bp) => (
              <button
                key={bp.name}
                onClick={() => setBannerColor(bp.val)}
                className={`w-4.5 h-4.5 rounded-full bg-gradient-to-r ${bp.val} border transition-transform hover:scale-125 ${
                  bannerColor === bp.val ? 'border-white scale-110' : 'border-transparent'
                }`}
                title={bp.name}
              />
            ))}
          </div>
        </div>

        {/* Main profile items detail alignment */}
        <div className="px-6 pb-6 pt-1 flex flex-col sm:flex-row items-center sm:items-end gap-5 -translate-y-8 sm:-translate-y-12">
          {/* Avatar Canvas */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white bg-slate-50 shadow-md flex items-center justify-center overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Level Bubble index badge */}
            <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white border-2 border-white rounded-xl text-[10px] font-black font-mono px-2 py-0.5 shadow-sm">
              Lv {currentUser.level}
            </span>
          </div>

          {/* Details header */}
          <div className="text-center sm:text-left flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pt-6 sm:pt-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-none truncate">
                {currentUser.name}
              </h1>
              {/* Role Indicator label */}
              <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/30 px-2.5 py-0.5 rounded-full uppercase inline-block font-mono max-w-max mx-auto sm:mx-0">
                {currentUser.role}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono font-medium mt-1 truncate">
              Absen #{currentUser.id} • SMPN 2 Lamongan {currentUser.customStatus ? `• Status: "${currentUser.customStatus}"` : ''}
            </p>
          </div>

          {/* Edit toggler */}
          <div className="shrink-0 pt-3 sm:pt-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/20 text-slate-700 px-4 py-2 rounded-2xl text-xs font-semibold active:scale-[0.97] transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>{isEditing ? 'Batal Mengubah' : 'Ubah Profil'}</span>
            </button>
          </div>
        </div>

        {/* Level XP Progress details summary strip */}
        <div className="px-6 pb-6 -mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-left border-t border-slate-100 pt-5">
          <div className="space-y-1 w-full md:max-w-xs text-center md:text-left">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-semibold">Tingkat Kemajuan Kognitif</span>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>XP Level {currentUser.level}</span>
              <span className="font-mono text-[10px] text-slate-400">({currentLeveXp}/200 XP)</span>
            </div>
            {/* Outer Progress track */}
            <div className="w-full h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden border">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Core total XP numbers showcase */}
          <div className="flex gap-4 items-center">
            <div className="text-center bg-blue-50/50 border border-blue-200/20 rounded-2xl p-3 px-5">
              <span className="text-xl font-black text-blue-700 font-mono">{currentUser.xp}</span>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Total XP</p>
            </div>
            <div className="text-center bg-amber-50/50 border border-amber-200/20 rounded-2xl p-3 px-5">
              <span className="text-xl font-black text-amber-600 font-mono">{achievements.filter(a=>a.unlocked).length}</span>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Badges</p>
            </div>
          </div>
        </div>
      </div>

      {/* EDITING FORM SECTION IF toggled */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs text-left"
          >
            <h3 className="text-sm font-bold text-slate-800">Ubah Identitas Belajar</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sesuaikan panggilan sapaan, mutasi, maupun status aktivitas belajar harian Anda.</p>

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Nama Panggilan / Nickname</label>
                  <input
                    type="text"
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Status Aktivitas / Custom Status</label>
                  <input
                    type="text"
                    value={profileStatus}
                    onChange={(e) => setProfileStatus(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Profil Bio (Tentang Saya)</label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  rows={2}
                  className="w-full bg-[#FAFAFA] border border-slate-200 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-700 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-transform"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ACHIEVEMENTS BADGES CAROUSEL SHOWCASE */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs text-left">
        <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">Galeri Prestasi</span>
        <h3 className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
          <Award className="w-5 h-5 text-indigo-500" />
          <span>Sertifikat & Badges Unlocked [7D Class Hub]</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Selesaikan misi kelas, kuis asisten AI, dan piket kebersihan untuk memicu pembukaan visual badge ini.</p>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {achievements.map((item) => {
            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-3xl border flex items-start gap-4 transition-all duration-300 relative overflow-hidden group/badge ${
                  item.unlocked 
                    ? 'bg-gradient-to-tr from-slate-50 to-white hover:from-slate-100 hover:to-white border-indigo-200/50' 
                    : 'bg-slate-100/30 border-slate-200/20 text-slate-400'
                }`}
              >
                {/* Badge visual icon circles */}
                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  item.unlocked 
                    ? 'bg-indigo-50 border border-indigo-150 text-indigo-600 shadow-sm animate-pulse' 
                    : 'bg-slate-100 text-slate-400 select-none grayscale'
                }`}>
                  {item.icon}
                </span>

                <div className="min-w-0 flex-grow text-left">
                  <h4 className={`text-xs font-blackLeading truncate ${item.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                  
                  {item.unlocked && (
                    <span className="text-[8px] font-bold text-indigo-605 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1 font-mono">
                      UNLOCKED ✓
                    </span>
                  )}
                </div>

                {/* Subtle shine spark hover effects */}
                {item.unlocked && (
                  <Sparkles className="w-3 h-3 text-indigo-300 absolute top-3.5 right-3.5 opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
