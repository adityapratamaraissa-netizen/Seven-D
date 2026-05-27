/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles, Flame, Users, CalendarCheck, Shield, ChevronRight } from 'lucide-react';
import { useClassHub } from '../context/ClassHubContext';
import { SCHOOL_NAME, HOMEROOM_TEACHER } from '../data/students';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const { classLogo } = useClassHub();

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] overflow-y-auto flex flex-col justify-between selection:bg-purple-100 selection:text-purple-900 font-sans">
      {/* Cinematic Glowing Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-200/40 to-blue-300/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-200/40 to-pink-300/30 blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[350px] h-[350px] rounded-full bg-indigo-200/20 blur-[90px] pointer-events-none" />

      {/* Decorative Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -30, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-400 rounded-full blur-xs"
        />
        <motion.div
          animate={{ y: [0, -40, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-1/4 w-4 h-4 bg-purple-400 rounded-full blur-xs"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 left-1/5 w-2 h-2 bg-pink-400 rounded-full"
        />
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-md shadow-blue-500/10 bg-white border border-slate-100">
            <img 
              src={classLogo} 
              alt="Logo SEVEN D" 
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.className = "w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/10 text-white font-bold text-lg tracking-wider font-mono";
                  parent.innerHTML = '7D';
                }
              }}
            />
          </div>
          <div>
            <span className="text-slate-800 font-semibold text-base tracking-tight font-sans">PORTAL SEVEN D</span>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{SCHOOL_NAME}</p>
          </div>
        </div>

        <div className="invisible sm:visible flex items-center space-x-3 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200/50 text-xs text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Sistem Aktif 2026</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-grow flex flex-col lg:flex-row items-center justify-between gap-12 z-10">
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100/60 to-purple-100/60 border border-blue-200/30 px-3 py-1.5 rounded-full text-xs text-blue-800 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Platform Komunitas & Belajar Kelas Super Premium</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-3"
          >
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Satu Aplikasi <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Masa Depan 7D
              </span>
            </h1>
            <p className="text-slate-600 text-lg sm:text-lg max-w-xl mx-auto lg:mx-0 font-sans font-light leading-relaxed">
              Teknologi terintegrasi untuk kelas <strong className="font-semibold text-slate-800">SEVEN D - SMPN 2 Lamongan</strong>. 
              Gamer-friendly XP, rekap kas modern, log kehadiran QR, dan Asisten Belajar AI pribadi.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <button
              onClick={onStart}
              id="start-btn-landing"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 group active:scale-95"
            >
              <span>Masuk Portal Kelas</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-left py-1.5 pl-3 border-l-2 border-slate-300">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Homeroom Teacher</span>
              <p className="text-xs font-semibold text-slate-700">{HOMEROOM_TEACHER}</p>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid Panel Visual Mockup */}
        <div className="flex-1 w-full max-w-md lg:max-w-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4"
          >
            {/* AI Assistant card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-xs flex flex-col justify-between h-44"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">AI Study Tutor</h3>
                <p className="text-[11px] text-slate-500 mt-1">Interaksi belajar mapel, kuis kustom, & rangkuman otomatis.</p>
              </div>
            </motion.div>

            {/* XP and Levels card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-xs flex flex-col justify-between h-44"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Sistem XP & Streak</h3>
                <p className="text-[11px] text-slate-500 mt-1">Belajar makin seru dengan XP, Level harian, dan pet interaktif.</p>
              </div>
            </motion.div>

            {/* Chat Discord Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-xs flex flex-col justify-between h-44"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Real-time Discord Chat</h3>
                <p className="text-[11px] text-slate-500 mt-1">Eratkan kebersamaan kelas lewat ruang diskusi instan.</p>
              </div>
            </motion.div>

            {/* Absensi & Piket */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 shadow-xs flex flex-col justify-between h-44"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Kas & Absensi Digital</h3>
                <p className="text-[11px] text-slate-500 mt-1">Catat transaksi kas, upload bukti piket, & data absensi terekap.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/40 text-center z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 SEVEN D SMPN 2 LAMONGAN. Made with Precision UI Design.</p>
        <div className="flex items-center space-x-4">
          <span className="hover:text-slate-600 transition-colors">Clean Minimalist</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="hover:text-slate-600 transition-colors">Smart AI Learning Portal</span>
        </div>
      </footer>
    </div>
  );
};
