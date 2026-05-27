/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  LESSON_SCHEDULE, PIKET_SCHEDULE, TEACHERS, TeacherDetails
} from '../data/students';
import { 
  Calendar, Users, CheckSquare, Sparkles, BookOpen, Clock, 
  MapPin, UserCheck, Shield, Check, Trash2, Camera, Compass,
  Bell, AlertCircle, Info, Phone, User, X, Landmark, Play, Pause,
  CornerDownRight, RefreshCw, Trophy, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Schedules: React.FC = () => {
  const {
    currentUser,
    piketStatusCurrentDay,
    completePiket,
    addXP
  } = useClassHub();

  const [activeSubTab, setActiveSubTab] = useState<'lessons' | 'piket'>('lessons');
  const [selectedDay, setSelectedDay] = useState<string>('Senin');

  // Piket Checkboxes States
  const [sapuCheck, setSapuCheck] = useState(false);
  const [papanCheck, setPapanCheck] = useState(false);
  const [sampahCheck, setSampahCheck] = useState(false);
  const [jendelaCheck, setJendelaCheck] = useState(false);
  const [piketNotes, setPiketNotes] = useState('');
  const [piketImg, setPiketImg] = useState('');
  const [isSubmittingPiket, setIsSubmittingPiket] = useState(false);

  // High fidelity states
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetails | null>(null);

  // TIME TRAVEL SIMULATOR STATES
  const [isSimulating, setIsSimulating] = useState(false);
  const [simDay, setSimDay] = useState<string>('Senin');
  const [simTime, setSimTime] = useState<string>('08:00');

  // Real-time Indonesian day and HH:MM
  const parseIndonesianDay = (dayIndex: number): string => {
    const indonesianDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return indonesianDays[dayIndex];
  };

  const getSystemTimeHHMM = (): string => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${hrs}:${hrs === '12' && mins === '00' ? '01' : mins}`; // guard any zero ticks
  };

  const [realDay, setRealDay] = useState<string>('Senin');
  const [realTime, setRealTime] = useState<string>('08:00');

  useEffect(() => {
    const updateRealClock = () => {
      const now = new Date();
      setRealDay(parseIndonesianDay(now.getDay()));
      setRealTime(getSystemTimeHHMM());
    };
    updateRealClock();
    const interval = setInterval(updateRealClock, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync selected day to simulated day when simulation is turned on initially
  const handleToggleSimulation = () => {
    if (!isSimulating) {
      setSimDay(selectedDay);
    }
    setIsSimulating(!isSimulating);
  };

  const currentActiveDay = isSimulating ? simDay : realDay;
  const currentActiveTime = isSimulating ? simTime : realTime;

  // Sync selected day view automatically if not simulating
  useEffect(() => {
    if (!isSimulating && ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].includes(realDay)) {
      setSelectedDay(realDay);
    }
  }, [realDay, isSimulating]);

  if (!currentUser) return null;

  const daysList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  // Handle mock proof screenshot of piket
  const handlePiketPhotoSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPiketImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPiketProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sapuCheck || !papanCheck || !sampahCheck || !jendelaCheck) {
      alert("⚠️ Tolong selesaikan seluruh checklist piket kelas terlebih dahulu!");
      return;
    }

    setIsSubmittingPiket(true);
    setTimeout(() => {
      completePiket(currentUser.name, piketNotes || "Semua bagian kelas telah disapu, dipel, dan dirapikan kembali.", piketImg || undefined);
      setIsSubmittingPiket(false);

      // Reset
      setSapuCheck(false);
      setPapanCheck(false);
      setSampahCheck(false);
      setJendelaCheck(false);
      setPiketNotes('');
      setPiketImg('');
      alert("🧹 Laporan sapu & piket terkirim! +250 XP ditambahkan ke data profil.");
    }, 1500);
  };

  // Convert HH:MM to total minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hrs, mins] = timeStr.split(":").map(Number);
    return hrs * 60 + mins;
  };

  // Extract schedule items for Active Simulation Day
  const todaySchedules = LESSON_SCHEDULE[currentActiveDay as keyof typeof LESSON_SCHEDULE] || [];

  const matchedLessons = todaySchedules.map((lesson) => {
    const [startStr, endStr] = lesson.time.split(" - ");
    const startMin = parseTimeToMinutes(startStr);
    const endMin = parseTimeToMinutes(endStr);
    return {
      ...lesson,
      startMin,
      endMin,
      startStr,
      endStr
    };
  });

  const parsedCurrentMinutes = parseTimeToMinutes(currentActiveTime);

  // Find exact active lesson
  const currentActiveLesson = matchedLessons.find(
    (lesson) => parsedCurrentMinutes >= lesson.startMin && parsedCurrentMinutes < lesson.endMin
  );

  // Find upcoming lesson
  const upcomingLesson = matchedLessons.find(
    (lesson) => lesson.startMin > parsedCurrentMinutes
  );

  // Check if current user is in today's Piket roster
  const isSiswaPiketToday = PIKET_SCHEDULE[selectedDay as keyof typeof PIKET_SCHEDULE]?.some(
    name => name.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(name.toLowerCase())
  );

  // Custom Icon Rendering helper
  const renderLessonIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flag': return <Trophy className="w-4 h-4 text-slate-500" />;
      case 'Shield': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'Coffee': return <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />;
      case 'Globe': return <Compass className="w-4 h-4 text-orange-600" />;
      case 'Heart': return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'Cpu': return <Clock className="w-4 h-4 text-indigo-600" />;
      case 'Palette': return <Sparkles className="w-4 h-4 text-pink-600" />;
      case 'Languages': return <BookOpen className="w-4 h-4 text-sky-600" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'PenTool': return <BookOpen className="w-4 h-4 text-teal-600" />;
      case 'Bot': return <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />;
      case 'Library': return <BookOpen className="w-4 h-4 text-rose-500" />;
      case 'Atom': return <Sparkles className="w-4 h-4 text-cyan-600" />;
      case 'Activity': return <Trophy className="w-4 h-4 text-lime-600" />;
      case 'Binary': return <CheckSquare className="w-4 h-4 text-red-600" />;
      case 'Moon': return <CheckSquare className="w-4 h-4 text-indigo-600" />;
      default: return <BookOpen className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleTeacherClick = (teacherName?: string) => {
    if (!teacherName) return;
    const details = TEACHERS[teacherName as keyof typeof TEACHERS];
    if (details) {
      setSelectedTeacher(details);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 font-sans select-none text-left">
      
      {/* 1. SELECTION HEADER AND SUB TABS MAP */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">Portal Jadwal SEVEN D</h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">SMPN 2 Lamongan • Jadwal Pelajaran Realtime Beserta Deskripsi Guru Pengajar.</p>
          </div>
        </div>

        {/* Horizontal Tabbing */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/40">
          <button
            onClick={() => setActiveSubTab('lessons')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'lessons' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-805'
            }`}
          >
            Jadwal Pelajaran
          </button>
          <button
            onClick={() => setActiveSubTab('piket')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'piket' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-805'
            }`}
          >
            Jadwal Piket 🧹
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME CLASS ALERTS AND SIMULATOR ACTION PANEL */}
      {activeSubTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* REALTIME SYSTEM MONITOR & NOTIFICATION BANNER */}
          <div className="lg:col-span-2 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Notifikasi Bel Belajar Aktif</span>
                </span>
                
                <span className="text-[11px] font-mono text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-xl font-bold flex items-center space-x-1">
                  <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{currentActiveDay}, {currentActiveTime}</span>
                </span>
              </div>

              {/* AUTOMATIC NOTIFICATION LOGIC BLOCK */}
              {currentActiveLesson ? (
                <div className="space-y-3.5 text-left">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <span className="text-[9px] bg-emerald-550/20 text-emerald-300 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md font-mono">
                      🔴 Sedang Berlangsung ({currentActiveLesson.time})
                    </span>
                    <h2 className="text-lg font-black text-white mt-1.5">{currentActiveLesson.name}</h2>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-350">
                      <span className="flex items-center space-x-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{currentActiveLesson.room}</span>
                      </span>
                      {currentActiveLesson.teacher && (
                        <button 
                          onClick={() => handleTeacherClick(currentActiveLesson.teacher)}
                          className="flex items-center space-x-1 font-bold text-indigo-300 hover:text-indigo-200 hover:underline transition-colors decoration-dashed"
                          title="Lihat detail guru"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Presenter: {TEACHERS[currentActiveLesson.teacher]?.name || currentActiveLesson.teacher}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dynamic countdown slider calculations */}
                  {(() => {
                    const totalDuration = currentActiveLesson.endMin - currentActiveLesson.startMin;
                    const elapsed = parsedCurrentMinutes - currentActiveLesson.startMin;
                    const remaining = currentActiveLesson.endMin - parsedCurrentMinutes;
                    const percent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

                    return (
                      <div className="space-y-1.5 bg-white/5 p-3.5 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                          <span>Kemajuan Pelajaran harian</span>
                          <span className="font-mono text-xs text-emerald-400 font-bold">
                            Tersisa {remaining} Menit ({Math.floor(100 - percent)}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="py-4 text-left">
                  {["Sabtu", "Minggu"].includes(currentActiveDay) ? (
                    <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl text-slate-300 flex items-start gap-3">
                      <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Hore, Libur Akhir Pekan! 🎉</h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Tidak ada kelas SEVEN D hari ini. Nikmati istirahat Anda, luangkan waktu berkumpul bersama keluarga, dan kumpulkan energi baru.
                        </p>
                      </div>
                    </div>
                  ) : parsedCurrentMinutes < 420 ? (
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl text-slate-300 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pintu Gerbang Belum Dibuka</h4>
                        <p className="text-[11px] text-slate-450 leading-normal">
                          Sekolah akan dimulai pukul 07:00 pagi. Siapkan seragam bersih, buku pegangan utama, dan perlengkapan piket pagi ini.
                        </p>
                      </div>
                    </div>
                  ) : parsedCurrentMinutes >= 840 ? (
                    <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl text-slate-300 flex items-start gap-3">
                      <CheckSquare className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bel Pulang Berbunyi! 🏠</h4>
                        <p className="text-[11px] text-slate-450 leading-normal">
                          Seluruh sesi pelajaran hari {currentActiveDay} telah tuntas. Cek barang bawaan serta bersihkan laci meja belajar sebelum pulang.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl text-slate-300 flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Jam Istirahat / Sela Mapel sedang berlangsung</h4>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Silakan mengonsumsi jajan sehat di kantin, beribadah, atau sekadar berbincang santai dengan teman sekelas.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REMINDER FOR UPCOMING TEACHER WHO WILL TEACH NEXT */}
              {upcomingLesson ? (
                <div className="p-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl text-left flex items-start space-x-3 mt-4">
                  <Bell className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wide">Reminder Guru Mengajar Berikutnya</p>
                    <h4 className="text-xs font-bold text-white truncate mt-1">
                      {upcomingLesson.name} oleh {upcomingLesson.teacher ? (TEACHERS[upcomingLesson.teacher]?.name || upcomingLesson.teacher) : "Wali Pengawas"}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Pelajaran dimulai pukul <span className="font-mono text-[10px] font-bold text-white text-emerald-400">{upcomingLesson.startStr}</span> (dalam {upcomingLesson.startMin - parsedCurrentMinutes} Menit). {upcomingLesson.teacher && TEACHERS[upcomingLesson.teacher] ? `Catatan: ${TEACHERS[upcomingLesson.teacher].bio.slice(0, 75)}...` : 'Persiapkan materi buku catatan terkait.'}
                    </p>
                  </div>
                </div>
              ) : !["Sabtu", "Minggu"].includes(currentActiveDay) && parsedCurrentMinutes < 835 ? (
                <div className="p-3.5 bg-indigo-950/40 border border-indigo-900/40 rounded-2xl text-left flex items-start space-x-3 mt-4">
                  <Check className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white mt-1">Semua Jadwal Hari {currentActiveDay} Selesai</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tidak ada pelajaran berikutnya yang terjadwal. Lanjutkan aktivitas istirahat Anda dengan aman dan tertib.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* ADVANCED SCHOOL PORTAL TIME-TRAVEL SIMULATOR CONTROLLER */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-6 shadow-xs text-left relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase font-bold">Simulator Admin Control</span>
                <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full ${isSimulating ? 'bg-amber-100 text-amber-700' : 'bg-green-150 text-green-700'}`}>
                  {isSimulating ? 'SIMULATION MODE' : 'REAL TIME MODE'}
                </span>
              </div>

              <h3 className="text-sm font-black text-slate-800 mt-2.5 flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-indigo-600" />
                <span>Simulasi Alur Bel Belajar</span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Atur hari dan jam buatan untuk menguji alur pergantian jadwal pelajaran, reminder guru, serta notifikasi visual otomatis.
              </p>

              {/* Toggle Engine */}
              <button
                onClick={handleToggleSimulation}
                className={`w-full py-2 px-3 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 mt-4 transition-all duration-300 ${
                  isSimulating 
                    ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100' 
                    : 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1" />
                    <span>Hentikan Mode Simulasi</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1" />
                    <span>Luncurkan Simulator Waktu</span>
                  </>
                )}
              </button>

              {isSimulating && (
                <div className="space-y-3.5 mt-4 border-t border-slate-100 pt-3">
                  {/* Select Simulated Day of School */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Pilih Hari Eksperimen</label>
                    <div className="grid grid-cols-5 gap-1">
                      {daysList.map((d) => (
                        <button
                          key={d}
                          onClick={() => setSimDay(d)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                            simDay === d 
                              ? 'bg-slate-800 text-white font-black' 
                              : 'bg-slate-50 border border-slate-200/50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {d.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pick Simulated Time with Easy Presets */}
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Atur Jam Sekolah (Input / Presets)</label>
                    
                    <div className="flex gap-2 items-center">
                      <input
                        type="time"
                        value={simTime}
                        onChange={(e) => setSimTime(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-slate-250 focus:border-indigo-400 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                      />
                    </div>

                    {/* Presets buttons */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {["07:15", "08:15", "09:35", "10:30", "11:50", "12:30", "14:15"].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setSimTime(preset)}
                          className="bg-slate-50 hover:bg-slate-100 text-[9.5px] text-slate-600 border border-slate-150 rounded-lg px-2 py-0.5 font-bold font-mono transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100/60 flex items-center justify-between text-[11px] text-slate-450">
              <span className="flex items-center gap-1 font-semibold">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Tekan lencana mapel untuk guru detail.</span>
              </span>
              <button 
                onClick={() => {
                  if (confirm("Reset ulang simulasi waktu ke real-time seutuhnya?")) {
                    setIsSimulating(false);
                  }
                }}
                className="text-[10px] font-black text-indigo-650 hover:underline"
              >
                Reset Live
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 3. DAY SELECTOR BUTTONS OF ACADEMICS */}
      <div className="flex space-x-1.5 overflow-x-auto py-1">
        {daysList.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 relative flex items-center gap-1.5 shrink-0 ${
              selectedDay === day 
                ? 'bg-slate-800 border border-slate-800 text-white font-black shadow-md scale-102' 
                : 'bg-white/85 border border-slate-200/50 text-slate-500 hover:bg-slate-55 hover:text-slate-805'
            }`}
          >
            {selectedDay === day && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            )}
            <span>{day}</span>
            {currentActiveDay === day && (
              <span className="text-[8px] bg-emerald-100 text-emerald-700 font-extrabold rounded-md px-1 ml-0.5 line-none">HARI INI</span>
            )}
          </button>
        ))}
      </div>

      {/* 4. DYNAMICS VIEW CHANNELS */}
      <div className="w-full">
        {activeSubTab === 'lessons' ? (
          // LESSONS TAB CONTAINER
          <div className="space-y-4">
            <div className="bg-amber-50/50 border border-amber-200/30 p-4 rounded-2xl text-xs text-amber-700 leading-relaxed font-semibold flex items-start gap-2 max-w-3xl">
              <Info className="w-4.5 h-4.5 text-amber-500 shrink-0" />
              <span>
                💡 Setiap siswa 7D direkomendasikan melihat lencana guru dengan cara mengeklik nama pelajaran. Anda berhak mendapatkan tambahan sapaan istimewa saat simulasi jam belajar aktif diaktifkan.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LESSON_SCHEDULE[selectedDay as keyof typeof LESSON_SCHEDULE]?.map((lesson: any, idx) => {
                const colors = lesson.color || 'bg-white/80 border-slate-200';
                
                // Compare if this specific lesson is active under the simulation/current clock
                const parsedStart = parseTimeToMinutes(lesson.time.split(" - ")[0]);
                const parsedEnd = parseTimeToMinutes(lesson.time.split(" - ")[1]);
                const isThisLessonActive = 
                  currentActiveDay === selectedDay && 
                  parsedCurrentMinutes >= parsedStart && 
                  parsedCurrentMinutes < parsedEnd;

                return (
                  <motion.div
                    key={idx}
                    id={`lesson-card-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.04 }}
                    className={`rounded-3xl border-2 p-5.5 shadow-xs relative transition-all duration-300 flex flex-col justify-between h-44 group cursor-pointer ${
                      isThisLessonActive 
                        ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-400/20 scale-[1.01] shadow-md' 
                        : 'border-slate-200/40 bg-white hover:border-slate-300 hover:shadow-md'
                    }`}
                    onClick={() => handleTeacherClick(lesson.teacher)}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[9.5px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 font-mono uppercase tracking-wider ${
                          isThisLessonActive 
                            ? 'bg-indigo-650 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{lesson.time}</span>
                        </span>

                        {isThisLessonActive ? (
                          <span className="text-[8px] bg-red-500 text-white font-mono font-black rounded-lg px-2 py-0.5 animate-pulse uppercase">
                            🔴 KELAS AKTIF
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Slot {idx + 1}</span>
                        )}
                      </div>

                      {/* Subject Name and soft colored border left */}
                      <div className="mt-4 flex items-start gap-2.5">
                        <div className={`p-2 rounded-xl shrink-0 ${colors.split(' ')[0]} border ${colors.split(' ')[1]}`}>
                          {renderLessonIcon(lesson.icon)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors truncate">
                            {lesson.name}
                          </h3>
                          <span className="text-[10px] font-semibold text-slate-400 block mt-1 font-mono">SMPN 2 LAMONGAN</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom strip displaying teacher initials / picture option */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-t border-slate-100 pt-3 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-350" />
                        <span>{lesson.room}</span>
                      </span>

                      {lesson.teacher ? (
                        <div className="flex items-center space-x-1.5 text-indigo-700 font-black hover:underline">
                          <img 
                            src={TEACHERS[lesson.teacher]?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${lesson.teacher}`}
                            alt="guru" 
                            className="w-5.5 h-5.5 rounded-full object-cover border bg-slate-50"
                            referrerPolicy="no-referrer"
                          />
                          <span className="truncate max-w-[130px]" title="Klik untuk data profil guru">
                            {lesson.teacher}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-350">Non-KBM</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          // PIKET SQUADS TAB CONTAINER
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Roster list side block */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">Roster Piket</span>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                  <Users className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Petugas Piket {selectedDay}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Seluruh petugas berkewajiban hadir lebih awal demi menata bangku belajar kelas.</p>

                {/* Team listings */}
                <div className="space-y-2 mt-4">
                  {PIKET_SCHEDULE[selectedDay as keyof typeof PIKET_SCHEDULE]?.map((name, i) => {
                    const cleaningClaimed = piketStatusCurrentDay[name] === true;
                    return (
                      <div key={i} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between text-left">
                        <div className="flex items-center space-x-2.5">
                          <img 
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${name}&backgroundColor=c0aede`}
                            alt="avatar" 
                            className="w-7 h-7 bg-white rounded-lg border border-slate-200/30 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{name}</span>
                        </div>

                        {cleaningClaimed ? (
                          <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5 animate-pulse">
                            <Check className="w-3 h-3" /> Selesai
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reward info */}
              <div className="bg-amber-50/50 border border-amber-200/20 rounded-2xl p-4 space-y-1 text-left">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono">🧹 Insentif Kebersihan</p>
                <p className="text-[11px] text-amber-700 leading-relaxed font-sans">
                  Selesaikan piket kelas dan upload foto bukti untuk memperoleh bonus **+250 XP** profil serta bonus kebahagiaan Virtual Pet!
                </p>
              </div>
            </div>

            {/* Checklists submission form */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs h-full text-left">
                <h3 className="text-base font-bold text-slate-800">Form Laporan Piket Kelas</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isSiswaPiketToday 
                    ? `Halo ${currentUser.name.split(' ')[0]}! Selesaikan checklist pekerjaan di bawah lalu kirim bukti laporannya.` 
                    : `Hanya petugas piket hari ${selectedDay} yang berkewajiban mengirimkan bukti laporan.`}
                </p>

                {isSiswaPiketToday ? (
                  <form onSubmit={handleSubmitPiketProof} className="space-y-4 mt-5">
                    
                    {/* Checkbox columns */}
                    <div className="grid grid-cols-2 gap-3 text-left">
                      <label className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                        sapuCheck ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200/50'
                      }`}>
                        <input 
                          type="checkbox" 
                          checked={sapuCheck} 
                          onChange={(e) => setSapuCheck(e.target.checked)}
                          className="w-4.5 h-4.5 text-emerald-500 rounded border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-700">Sapu & Pel Lantai</span>
                      </label>

                      <label className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                        papanCheck ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200/50'
                      }`}>
                        <input 
                          type="checkbox" 
                          checked={papanCheck} 
                          onChange={(e) => setPapanCheck(e.target.checked)}
                          className="w-4.5 h-4.5 text-emerald-500 rounded border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-700">Bersihkan Papan Tulis</span>
                      </label>

                      <label className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                        sampahCheck ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200/50'
                      }`}>
                        <input 
                          type="checkbox" 
                          checked={sampahCheck} 
                          onChange={(e) => setSampahCheck(e.target.checked)}
                          className="w-4.5 h-4.5 text-emerald-500 rounded border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-700">Buang Sampah Kelas</span>
                      </label>

                      <label className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                        jendelaCheck ? 'bg-emerald-50/50 border-emerald-300' : 'bg-white border-slate-200/50'
                      }`}>
                        <input 
                          type="checkbox" 
                          checked={jendelaCheck} 
                          onChange={(e) => setJendelaCheck(e.target.checked)}
                          className="w-4.5 h-4.5 text-emerald-500 rounded border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-700">Kemoceng Jendela & Meja</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Photo upload camera mock */}
                      <div className="border border-dashed border-slate-200 p-4 rounded-2xl text-center relative hover:bg-slate-50 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePiketPhotoSim}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Camera className="w-5 h-5 text-emerald-500 mx-auto" />
                        <span className="text-[11px] font-bold text-slate-700 block mt-1">Foto Bukti Piket (Mock)</span>
                        <span className="text-[9px] text-slate-400 font-mono italic block truncate">
                          {piketImg ? 'Gambar bukti terpilih ✅' : 'format image JPG/PNG'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="Keterangan tambahan (Kondisi kelas, dll)..."
                          value={piketNotes}
                          onChange={(e) => setPiketNotes(e.target.value)}
                          className="w-full h-full bg-slate-50 border border-slate-200/50 rounded-2xl px-3 py-2 text-xs placeholder-slate-400 text-slate-700 outline-none focus:bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingPiket}
                      className="w-full bg-slate-850 hover:bg-slate-900 text-white font-semibold rounded-2xl py-3 text-xs transition-transform transform active:scale-[0.98] flex items-center justify-center space-x-1"
                    >
                      {isSubmittingPiket ? 'Mengunggah Laporan Lanjutan...' : 'Kirim Bukti Piket & Ambil +250 XP 🧼'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-12 text-center text-xs text-slate-400 mt-6 leading-relaxed">
                    🔒 Laporan piket ditutup. <br />
                    Misi piket hanya dapat diisi oleh siswa yang terjadwal piket di hari **{selectedDay}** saja.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 5. PORTAL PREMIUM TEACHER DETAILS DRAWER OVERLAY */}
      <AnimatePresence>
        {selectedTeacher && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-md w-full relative flex flex-col"
            >
              {/* Header colored banner */}
              <div className="h-28 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 relative p-6">
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="absolute top-4 right-4 text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="text-[10px] font-bold text-white/80 uppercase font-mono tracking-wider">PROFIL DETAIL GURU</span>
              </div>

              {/* Avatar picture with overlapping offset */}
              <div className="px-6 pb-6 relative flex flex-col items-center text-center -translate-y-11">
                <div className="w-22 h-22 rounded-2xl border-4 border-white bg-slate-50 overflow-hidden shadow-md">
                  <img
                    src={selectedTeacher.avatar}
                    alt={selectedTeacher.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="mt-3">
                  <h3 className="text-base font-black text-slate-800 leading-none">{selectedTeacher.name}</h3>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block mt-2 font-mono">
                    {selectedTeacher.subject}
                  </span>
                </div>

                {/* Status indicator line */}
                <div className="mt-5 w-full bg-slate-50 border border-slate-150 p-3.5 rounded-2xl text-left space-y-2.5 text-xs">
                  {/* Active classroom check status */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold font-sans">Status Saat Ini:</span>
                    {currentActiveLesson && currentActiveLesson.teacher && 
                     TEACHERS[currentActiveLesson.teacher]?.id === selectedTeacher.id ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-pulse shrink-0" />
                        <span>MENGAJAR 7D</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">
                        <span>DI RUANG GURU</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-150/45 pt-2.5">
                    <span className="text-slate-400 font-semibold">Ruang Dinas:</span>
                    <span className="text-slate-700 font-extrabold flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedTeacher.room}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-5 text-left w-full space-y-1">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Bio & Filosofi Mengajar</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-[#FAFAFA] border p-3.5 rounded-2xl italic">
                    "{selectedTeacher.bio}"
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-900 border text-white font-bold rounded-xl text-xs transition-transform transform active:scale-[0.98]"
                >
                  Selesai Membaca Rincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
