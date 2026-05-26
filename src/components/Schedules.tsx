/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  LESSON_SCHEDULE, PIKET_SCHEDULE 
} from '../data/students';
import { 
  Calendar, Users, CheckSquare, Sparkles, BookOpen, Clock, 
  MapPin, UserCheck, Shield, Check, Trash2, Camera, Compass
} from 'lucide-react';
import { motion } from 'motion/react';

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

  // Check if current logged student is in today's Piket roster
  // Get current day name in Indonesian fuzzily or based on selectedDay for demo testing
  const isSiswaPiketToday = PIKET_SCHEDULE[selectedDay as keyof typeof PIKET_SCHEDULE]?.some(
    name => name.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(name.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 font-sans">
      
      {/* 1. SELECTION HEADER AND SUB TABS MAP */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Jadwal Sekolah & Piket</h1>
            <p className="text-xs text-slate-500">Akses jadwal pelajaran 7D serta koordinasi piket kebersihan harian.</p>
          </div>
        </div>

        {/* Horizontal Tabbing */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/30">
          <button
            onClick={() => setActiveSubTab('lessons')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'lessons' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Jadwal Pelajaran
          </button>
          <button
            onClick={() => setActiveSubTab('piket')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'piket' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Jadwal Piket
          </button>
        </div>
      </div>

      {/* 2. DAY SELECTOR BUTTONS */}
      <div className="flex space-x-2 overflow-x-auto py-1">
        {daysList.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 ${
              selectedDay === day 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-white/80 border border-slate-200/50 text-slate-500 hover:bg-slate-55 hover:text-slate-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 3. DYNAMICS VIEW CHANNELS */}
      <div className="w-full">
        {activeSubTab === 'lessons' ? (
          // LESSONS TAB CONTAINER
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LESSON_SCHEDULE[selectedDay as keyof typeof LESSON_SCHEDULE]?.map((lesson, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-5 shadow-xs hover:shadow-md hover:border-blue-200/50 transition-all flex flex-col justify-between h-40 group text-left"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{lesson.time}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">Slot {idx + 1}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 leading-tight mt-3.5 group-hover:text-blue-600 transition-colors">
                    {lesson.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold border-t border-slate-100/50 pt-2.5 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-350" />
                    <span>{lesson.room}</span>
                  </span>
                  {lesson.teacher && (
                    <span className="truncate max-w-[120px] text-slate-500">
                      👨‍🏫 {lesson.teacher.split(',')[0]}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // PIKET SQUADS TAB CONTAINER
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Roster list side block */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">Roster Piket</span>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                  <Users className="w-4.5 h-4.5 text-emerald-500" />
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
                          <span className="text-[9px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5">
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
              <div className="bg-amber-50/50 border border-amber-200/20 rounded-2xl p-4 space-y-1">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono">🧹 Insentif Kebersihan</p>
                <p className="text-[11px] text-amber-700 leading-relaxed font-sans">
                  Selesaikan piket kelas dan upload foto bukti untuk memperoleh bonus **+250 XP** profil serta bonus kebahagiaan Virtual Pet!
                </p>
              </div>
            </div>

            {/* Checklists submission form */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs h-full">
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
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl py-3 text-xs transition-transform transform active:scale-[0.98] flex items-center justify-center space-x-1"
                    >
                      {isSubmittingPiket ? 'Mengunggah Laporan Lanjutan...' : 'Kirim Bukti Piket & Ambil +250 XP 🧼'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center text-xs text-slate-400 mt-6 leading-relaxed">
                    🔒 Laporan piket ditutup. <br />
                    Misi piket hanya dapat diisi oleh siswa yang terjadwal piket di hari **{selectedDay}** saja.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
