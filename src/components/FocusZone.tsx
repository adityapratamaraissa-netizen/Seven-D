/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  Flame, Clock, Play, Pause, RotateCw, Volume2, 
  Compass, Maximize2, Minimize2, Music, Sparkles, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FocusZone: React.FC = () => {
  const { addXP } = useClassHub();

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pomodoro States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');

  // Lofi audio simulated streams states
  const [isPlayingLofi, setIsPlayingLofi] = useState(false);
  const [lofiTrackIdx, setLofiTrackIdx] = useState(0);

  const timerRef = useRef<any>(null);

  const LOFI_TRACKS = [
    { title: "Tokyo Rain Ambient (Lofi)", artist: "ChillHop Skuad", icon: "🌧️" },
    { title: "Smart Study Beats 2026", artist: "Mascot Records", icon: "☕" },
    { title: "Synthwave Homework Loop", artist: "Beta Wave Synth", icon: "🌌" }
  ];

  // Pomodoro timer core loop
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(s => s - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Timer concluded! Reward corresponding XP
            handleTimerConclude();
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, minutes, seconds]);

  const handleTimerConclude = () => {
    setIsActive(false);
    clearInterval(timerRef.current);

    if (mode === 'work') {
      alert("🎉 Sesi Fokus Selesai! Kamu memenangkan +150 XP.");
      addXP(150, "Selesai Sesi Pomodoro 25 Menit");
      setMinutes(5);
      setMode('shortBreak');
    } else {
      alert("⏱️ Istirahat selesai! Mari kembali mulai belajar.");
      setMinutes(25);
      setMode('work');
    }
    setSeconds(0);
  };

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);

  const resetTimer = (newWorkMinutes: number = 25) => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setMinutes(newWorkMinutes);
    setSeconds(0);
  };

  const toggleFullscreenFocus = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto px-4 py-6 font-sans transition-all duration-500 ${
      isFullscreen ? 'fixed inset-0 bg-[#0E131F] text-white z-50 overflow-y-auto pt-16 pb-8' : 'text-slate-700'
    }`}>
      
      {/* HEADER SECTION (HIDDEN ON DEEP FULLSCREEN IF WANTED, but let's show an clean toggle) */}
      <div className={`p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
        isFullscreen ? 'bg-white/5 border border-white/10 text-white' : 'bg-white/70 backdrop-blur-md border border-slate-200/50'
      }`}>
        <div className="flex items-center space-x-3.5 text-left">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isFullscreen ? 'bg-cyan-500/15 text-cyan-400' : 'bg-amber-100 text-amber-600'}`}>
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Zone Fokus Pomodoro</h1>
            <p className={`text-xs ${isFullscreen ? 'text-slate-400' : 'text-slate-500'}`}>
              Kosongkan pikiran, dengarkan lofi, dan selesaikan tantangan belajarmu tanpa gangguan.
            </p>
          </div>
        </div>

        {/* Fullscreen Toggle controller */}
        <button
          onClick={toggleFullscreenFocus}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
            isFullscreen 
              ? 'bg-white/10 hover:bg-white/25 border-white/20 text-white' 
              : 'bg-slate-800 hover:bg-slate-900 border-transparent text-white shadow-md shadow-slate-800/10'
          }`}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4" />
              <span>Keluar Mode Estetik</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4" />
              <span>Mode Imersif Gelap</span>
            </>
          )}
        </button>
      </div>

      {/* CORE TIMER INTERACTION MAIN PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: THE POMODORO TIMER CIRCLE (Main interaction widget) */}
        <div className="lg:col-span-2">
          <div className={`rounded-3xl p-8 flex flex-col items-center justify-center transition-all h-[420px] ${
            isFullscreen ? 'bg-white/5 border border-white/10' : 'bg-white/80 backdrop-blur-md border border-slate-200/50'
          }`}>
            
            {/* Custom Mode selector tablets */}
            <div className={`flex p-1 rounded-2xl border ${isFullscreen ? 'bg-white/5 border-white/10' : 'bg-slate-100/80 border-slate-200/20'}`}>
              <button
                onClick={() => {
                  setMode('work');
                  resetTimer(25);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'work' 
                    ? (isFullscreen ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-white') 
                    : (isFullscreen ? 'text-slate-400' : 'text-slate-500')
                }`}
              >
                Fokus Belajar (25m)
              </button>
              <button
                onClick={() => {
                  setMode('shortBreak');
                  resetTimer(5);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'shortBreak' 
                    ? (isFullscreen ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-white') 
                    : (isFullscreen ? 'text-slate-400' : 'text-slate-500')
                }`}
              >
                Istirahat Pendek (5m)
              </button>
            </div>

            {/* Simulated Ring Chrono Clock */}
            <div className="relative w-48 h-48 my-8 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="78" stroke={isFullscreen ? '#1F2937' : '#f1f5f9'} strokeWidth="8" fill="transparent" />
                <circle 
                  cx="96" 
                  cy="96" 
                  r="78" 
                  stroke={isFullscreen ? '#06b6d4' : '#F59E0B'} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="490.08" 
                  strokeDashoffset={490.08 - (490.08 * ((minutes * 60 + seconds) / (mode === 'work' ? 1500 : 300)))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold font-mono tracking-tight leading-none">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isFullscreen ? 'text-cyan-400' : 'text-slate-400'}`}>
                  {mode === 'work' ? 'Fokus Aktif' : 'Pita Istirahat'}
                </span>
              </div>
            </div>

            {/* Navigation keys for Timer */}
            <div className="flex space-x-3">
              {isActive ? (
                <button
                  onClick={pauseTimer}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
                >
                  Pause Sesi
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-md shadow-emerald-500/15"
                >
                  Mulai Fokus
                </button>
              )}

              <button
                onClick={() => resetTimer(mode === 'work' ? 25 : 5)}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isFullscreen ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-600'
                }`}
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: MUSIC STREAM MEDIA CENTER */}
        <div className="lg:col-span-1">
          <div className={`rounded-3xl p-6 shadow-xs h-full flex flex-col justify-between ${
            isFullscreen ? 'bg-white/5 border border-white/10' : 'bg-white/80 backdrop-blur-md border border-slate-200/50'
          }`}>
            <div>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">Audio Space</span>
              <h3 className="text-sm font-bold flex items-center gap-1.5 mt-1">
                <Music className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
                <span>Simulasi Aliran Lofi Beats</span>
              </h3>
              <p className={`text-[11px] mt-0.5 ${isFullscreen ? 'text-slate-400' : 'text-slate-400'}`}>
                Putar lofi ambient untuk meredam kebisingan dari luar ruangan kelas.
              </p>
            </div>

            {/* Waveforms visual jumping nodes */}
            <div className="my-6 p-4 bg-black/20 rounded-2xl flex items-center justify-center gap-1 h-20 overflow-hidden relative">
              {isPlayingLofi ? (
                <>
                  <p className="absolute text-[10px] uppercase font-mono tracking-wider font-extrabold text-cyan-400 animate-pulse z-10">
                    Live Streaming Active 📻
                  </p>
                  {/* Decorative Jumping Nodes visualizer */}
                  {[1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 1, 2, 3, 4, 3, 2, 1, 2, 3, 2, 1, 4, 3, 2, 1].map((v, i) => (
                    <motion.span 
                      key={i} 
                      animate={{ height: [`${v * 6}px`, `${v * 16}px`, `${v * 4}px`] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
                      className="w-1 bg-cyan-400/60 rounded"
                    />
                  ))}
                </>
              ) : (
                <p className="text-xs text-slate-400 font-medium">Lofi sedang dihentikan sementara</p>
              )}
            </div>

            {/* Active album details and player buttons */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-2xl p-2.5 bg-slate-100 rounded-xl shrink-0">
                  {LOFI_TRACKS[lofiTrackIdx].icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black truncate">{LOFI_TRACKS[lofiTrackIdx].title}</p>
                  <p className="text-[10px] opacity-60 truncate">{LOFI_TRACKS[lofiTrackIdx].artist}</p>
                </div>
              </div>

              {/* Lofi tracks checklist slider */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {LOFI_TRACKS.map((t, idx) => {
                  const isActiveTrack = lofiTrackIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setLofiTrackIdx(idx);
                        setIsPlayingLofi(true);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center space-x-2.5 transition-colors ${
                        isActiveTrack 
                          ? (isFullscreen ? 'bg-white/10 border-cyan-400/40' : 'bg-blue-50 border-blue-200 text-blue-900') 
                          : (isFullscreen ? 'bg-transparent border-white/5 hover:bg-white/5' : 'bg-[#FCFCFC] border-slate-200/50 hover:bg-slate-50')
                      }`}
                    >
                      <span className="text-sm shrink-0">{t.icon}</span>
                      <div className="truncate text-left flex-grow">
                        <p className="truncate font-bold leading-none">{t.title}</p>
                        <span className="text-[9px] opacity-65 font-mono">{t.artist}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action play controllers */}
              <button
                onClick={() => setIsPlayingLofi(!isPlayingLofi)}
                className={`w-full py-2.5 text-xs font-bold rounded-xl active:scale-95 transition-all text-center ${
                  isPlayingLofi 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                    : (isFullscreen ? 'bg-cyan-500 text-slate-900 shadow-md shadow-cyan-400/10' : 'bg-blue-500 text-white shadow-md shadow-blue-500/10')
                }`}
              >
                {isPlayingLofi ? 'Stop Music Ambient' : 'Mulai Lofi Stream'}
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
