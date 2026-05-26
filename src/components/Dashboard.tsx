/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  Flame, Award, BookOpen, Clock, Users, Send, Pin, Trash2, 
  Sparkles, Gift, Play, Dumbbell, Compass, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HOMEROOM_TEACHER, CLASS_NAME } from '../data/students';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    students,
    announcements,
    missions,
    achievements,
    currentPet,
    dailyStreak,
    hasSpunToday,
    activeQuote,
    isTeacherMode,
    addAnnouncement,
    deleteAnnouncement,
    toggleMission,
    claimSpinReward,
    updatePetName,
    evolvePet,
    addXP
  } = useClassHub();

  // Dialog & input state
  const [spinResult, setSpinResult] = useState<{ label: string; xp: number } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [newPetName, setNewPetName] = useState(currentPet.name);
  const [isEditingPet, setIsEditingPet] = useState(false);

  // Form for posting announcement
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState<'PR' | 'Info' | 'Event' | 'Ujian'>('Info');
  const [newAnnDueDate, setNewAnnDueDate] = useState('');

  if (!currentUser) return null;

  // Sorting students for leaderboards
  const leaderboard = [...students].sort((a, b) => b.xp - a.xp).slice(0, 5);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    addAnnouncement(newAnnTitle, newAnnContent, newAnnCategory, newAnnDueDate || undefined);
    setNewAnnTitle('');
    setNewAnnContent('');
    setNewAnnDueDate('');
  };

  const handleSpinClick = () => {
    if (hasSpunToday || isSpinning) return;
    setIsSpinning(true);
    // Simulate premium spinning delay
    setTimeout(() => {
      const reward = claimSpinReward();
      setSpinResult(reward);
      setIsSpinning(false);
    }, 2500);
  };

  const handleSavePetName = () => {
    updatePetName(newPetName);
    setIsEditingPet(false);
    addXP(30, "Mengevolusi identitas virtual pet");
  };

  // Check absolute authority (Admin or Class management pengurus)
  const hasAccessPrivilege = currentUser.role !== 'Member';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* 1. HERO GREETING BANNER */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider font-mono">Beranda Belajar</span>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none mt-2">
            Selamat Datang, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-sans font-medium">
            Kelas <strong className="text-slate-800">{CLASS_NAME}</strong> • Wali Kelas: <strong className="text-slate-700">{HOMEROOM_TEACHER}</strong>
          </p>
          {/* Streak indicator badge */}
          <div className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-200/30 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold mt-3">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>Belajar Beruntun: {dailyStreak} Hari!</span>
          </div>
        </div>

        {/* Dynamic motivation quote box */}
        <div className="md:max-w-xs bg-[#FBFBFA] border border-slate-100 rounded-2xl p-4 text-xs italic text-slate-500 leading-relaxed shadow-sm relative">
          <p className="font-medium">"{activeQuote.text}"</p>
          <span className="block text-right text-[10px] text-slate-400 font-semibold not-italic mt-2">— {activeQuote.author}</span>
          <Sparkles className="w-3.5 h-3.5 text-blue-300 absolute -top-1.5 -right-1.5" />
        </div>
      </div>

      {/* 2. CORE INTERACTIVE DASHBOARD SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PET & SPIN WIDGET */}
        <div className="lg:col-span-1 space-y-6">
          {/* PET Virtual Companion Widget */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs relative">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-semibold">Virtual Companion</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span>{currentPet.name}</span>
                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-mono">Lv.{currentPet.level}</span>
              </h3>
              <button 
                onClick={() => setIsEditingPet(!isEditingPet)}
                className="text-xs text-slate-400 hover:text-blue-500 transition-colors"
              >
                Ubah Nama
              </button>
            </div>

            {/* Editing State */}
            {isEditingPet && (
              <div className="flex gap-2 mt-3 items-center">
                <input 
                  type="text" 
                  value={newPetName} 
                  onChange={(e) => setNewPetName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium"
                />
                <button 
                  onClick={handleSavePetName}
                  className="bg-blue-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-semibold"
                >
                  Simpan
                </button>
              </div>
            )}

            {/* Interactive Pet Visual Canvas Render */}
            <div className="flex flex-col items-center justify-center my-6 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl relative overflow-hidden group">
              <motion.img 
                animate={{ 
                  y: [0, -8, 0], 
                  rotate: [0, 2, -2, 0] 
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentPet.type}&backgroundColor=b6e3f4`}
                alt="Companion mascot"
                className="w-28 h-28 object-contain cursor-pointer filter hover:brightness-105"
                referrerPolicy="no-referrer"
              />

              {/* Status bubble */}
              <div className="mt-3 bg-white border border-slate-200/30 px-3 py-1 rounded-full text-xs text-slate-500 font-medium flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Status: <strong>{currentPet.status}</strong></span>
              </div>

              {/* Interaction Quick actions */}
              <div className="absolute right-3 top-3 flex flex-col gap-1.5">
                <button 
                  onClick={() => addXP(20, `Memberi makan ${currentPet.name}`)}
                  className="p-1.5 bg-white border border-slate-200/50 rounded-lg text-slate-500 hover:text-amber-500 hover:border-amber-200 transition-all shadow-xs"
                  title="Beri Makan Pet"
                >
                  🐾
                </button>
                <button 
                  onClick={evolvePet}
                  className="p-1.5 bg-white border border-slate-200/50 rounded-lg text-slate-500 hover:text-purple-500 hover:border-purple-200 transition-all shadow-xs"
                  title="Evolusi Spesies"
                >
                  🧬
                </button>
              </div>
            </div>

            {/* Companion XP details */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Eksplorasi Bond</span>
                <span className="font-mono text-[10px] text-slate-400">{currentPet.xp} / {currentPet.level * 150} XP</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                  style={{ width: `${Math.min(100, (currentPet.xp / (currentPet.level * 150)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Premium DAILY SPIN Reward mini game */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs group relative overflow-hidden">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-semibold">Daily Fortune</span>
            <h3 className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-blue-500" />
              <span>Spin Harian Berhadiah</span>
            </h3>

            {/* Spinner Container visualization */}
            <div className="my-6 flex flex-col items-center justify-center">
              <motion.div
                animate={isSpinning ? { rotate: 360 * 3 } : { rotate: 0 }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
                className={`w-28 h-28 rounded-full border-4 border-slate-100 flex items-center justify-center relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 ${hasSpunToday ? 'opacity-50' : ''}`}
              >
                {/* Decorative Spin slices */}
                <div className="absolute inset-0 bg-linear-gradient border-r border-[#FFF] divide-x select-none pointer-events-none" />
                <span className="text-2xl z-10 select-none">💎</span>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-5 bg-blue-500 clip-triangle" />
              </motion.div>

              {/* Status or reward panel */}
              {spinResult ? (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200/40 rounded-xl text-center">
                  <p className="text-xs font-bold text-emerald-800">🎉 Spin Berhasil!</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">{spinResult.label}</p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  {hasSpunToday ? 'Claimed! Besok kembali lagi untuk menguji hoki.' : 'Spin roda harian ini dan dapatkan XP instan!'}
                </p>
              )}
            </div>

            <button
              onClick={handleSpinClick}
              disabled={hasSpunToday || isSpinning}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                hasSpunToday 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10 active:scale-95'
              }`}
            >
              {isSpinning ? 'Sedang Berputar...' : hasSpunToday ? 'Selesai Diklaim' : 'Mulai Sekarang'}
            </button>
          </div>
        </div>

        {/* MIDDLE COLUMN: MISSIONS & POST ANNOUNCEMENT */}
        <div className="lg:col-span-1 space-y-6">
          {/* Daily Missions Widget */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-semibold">Tantangan Kelas</span>
            <h3 className="text-base font-bold text-slate-800 mt-1">Misi Pembelajaran</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Selesaikan setiap misi di bawah untuk memacu peringkat kognitif harianmu.</p>

            {/* Mission Checkboxes list */}
            <div className="space-y-3 mt-4">
              {missions.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                    m.completed 
                      ? 'bg-slate-50/50 border-slate-200/40 text-slate-400' 
                      : 'bg-[#FCFCFC] border-slate-200/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={m.completed}
                    disabled={m.completed}
                    onChange={() => toggleMission(m.id)}
                    className="mt-0.5 w-4 h-4 text-blue-500 rounded border-slate-300 focus:ring-blue-100 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold leading-none ${m.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                        {m.title}
                      </h4>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${m.completed ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-700 font-bold'}`}>
                        +{m.xpReward} XP
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mystery premium bonus button */}
            <button 
              onClick={() => {
                alert("✨ Misteri Misi Terbuka: Cari & gunakan AI Quiz generator kami dengan materi Bahasa Inggris!");
                addXP(50, "Membuka Peti Misteri");
              }}
              className="mt-4 w-full border border-slate-200 border-dashed rounded-xl py-2 px-3 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium"
            >
              <span>🔓 Hubungi Portal Misteri (+50 XP)</span>
            </button>
          </div>

          {/* Post announcement (Admin & Wali Kelas Privilege restricted) */}
          {hasAccessPrivilege && (
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-800">Buat Pengumuman Baru</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Posting info penting, deadline tugas, maupun pengumuman ujian secara instan.</p>

              <form onSubmit={handlePostAnnouncement} className="space-y-3 mt-4">
                <div>
                  <input
                    type="text"
                    placeholder="Judul Pengumuman..."
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    className="w-full bg-[#FAFAFA]/70 border border-slate-200/50 rounded-xl px-3 py-2 text-xs placeholder-slate-400 text-slate-800 focus:bg-white outline-none focus:border-blue-400/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Tulis pesan pengumuman kelas di sini..."
                    rows={3}
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    className="w-full bg-[#FAFAFA]/70 border border-slate-200/50 rounded-xl px-3 py-2 text-xs placeholder-slate-400 text-slate-800 focus:bg-white outline-none focus:border-blue-400/50 transition-colors resize-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newAnnCategory}
                    onChange={(e) => setNewAnnCategory(e.target.value as any)}
                    className="w-full bg-[#FAFAFA]/70 border border-slate-200/50 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white outline-none"
                  >
                    <option value="Info">Kategori: Info</option>
                    <option value="PR">Kategori: PR</option>
                    <option value="Event">Kategori: Event</option>
                    <option value="Ujian">Kategori: Ujian</option>
                  </select>
                  <input
                    type="date"
                    value={newAnnDueDate}
                    onChange={(e) => setNewAnnDueDate(e.target.value)}
                    className="w-full bg-[#FAFAFA]/70 border border-slate-200/50 rounded-xl px-2 py-2 text-xs text-slate-700 focus:bg-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs transition-transform transform active:scale-[0.98] flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Informasi</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ANNOUNCEMENTS & LEADERBOARD */}
        <div className="lg:col-span-1 space-y-6">
          {/* Class Announcements list */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs flex flex-col justify-between max-h-[420px]">
            <div>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-semibold">Feed Akademik</span>
              <h3 className="text-base font-bold text-slate-800 mt-1">Pengumuman & Reminder</h3>
            </div>

            <div className="space-y-3 overflow-y-auto mt-4 pr-1 flex-grow">
              {announcements.length > 0 ? (
                announcements.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl relative group">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        a.category === 'PR' ? 'bg-amber-100 text-amber-800' :
                        a.category === 'Ujian' ? 'bg-red-100 text-red-800' :
                        a.category === 'Event' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {a.category}
                      </span>
                      <span className="text-[8px] font-mono text-slate-400">{a.date}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-700 mt-2">{a.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{a.content}</p>

                    {a.dueDate && (
                      <div className="mt-2 text-[9px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg font-medium inline-block flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Deadline: {a.dueDate}</span>
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t border-slate-100/50 flex justify-between items-center text-[9px] text-slate-400 font-semibold">
                      <span>By: {a.author.split(' ')[0]} ({a.role})</span>
                      {isTeacherMode && (
                        <button 
                          onClick={() => deleteAnnouncement(a.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 rounded p-1 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">Belum ada pengumuman kelas.</p>
              )}
            </div>
          </div>

          {/* XP Class leaderboards */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-semibold">Rankings</span>
            <h3 className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-blue-500" />
              <span>Leaderboard XP</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Siswa telfaktor dengan perolehan skor XP kelas Seven D tertinggi.</p>

            {/* List */}
            <div className="space-y-2 mt-4">
              {leaderboard.map((s, index) => {
                const isRankOne = index === 0;
                return (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className={`w-5 text-center text-xs font-extrabold font-mono ${
                        index === 0 ? 'text-amber-500' :
                        index === 1 ? 'text-slate-400' :
                        index === 2 ? 'text-amber-700' : 
                        'text-slate-300'
                      }`}>
                        #{index + 1}
                      </span>
                      <img 
                        src={s.avatar} 
                        alt="student profile"
                        className="w-7 h-7 rounded-lg border border-slate-200/30 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="max-w-[130px] sm:max-w-none">
                        <p className="text-xs font-bold text-slate-700 truncate">{s.name}</p>
                        <span className="text-[9px] text-slate-400 uppercase font-mono">{s.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-extrabold text-slate-800 font-mono">{s.xp}</span>
                      <span className="text-[9px] text-slate-400 font-mono">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
