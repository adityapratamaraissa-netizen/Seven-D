/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  UserCheck, AlertCircle, Calendar, Users, CheckCircle2, 
  Clock, Heart, Camera, Compass, RefreshCw, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Attendance: React.FC = () => {
  const {
    currentUser,
    students,
    markAttendance,
    addXP
  } = useClassHub();

  const [attendanceStatus, setAttendanceStatus] = useState<'Hadir' | 'Terlambat' | 'Izin' | 'Sakit'>('Hadir');
  const [remarks, setRemarks] = useState('');
  const [excuseDoc, setExcuseDoc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Holographic QR simulation states
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isQRScanning, setIsQRScanning] = useState(false);
  const [qrSuccessMsg, setQrSuccessMsg] = useState('');

  if (!currentUser) return null;

  const handleManualAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      // Register status into Context
      markAttendance(currentUser.id, attendanceStatus, remarks || undefined);
      setIsSubmitting(false);

      // Reward XP if present early
      if (attendanceStatus === 'Hadir') {
        addXP(100, "Menghadiri kelas tepat waktu");
      } else {
        addXP(20, "Melakukan konfirmasi presensi kelas");
      }

      alert(`✅ Presensi terdaftar sebagai: ${attendanceStatus}!`);
    }, 1200);
  };

  // QR Code futuristic scanner stimulation
  const startQRScanningSim = () => {
    setIsQRScanning(true);
    setQrSuccessMsg('');
    setTimeout(() => {
      setIsQRScanning(false);
      setQrSuccessMsg('HOLOGRAPHIC QR CODE TERVERIFIKASI ✅');
      markAttendance(currentUser.id, 'Hadir', 'Melalui pemindaian QR Smart-Gate SEVEN D');
      addXP(150, "Auto-Attend Smart QR Gate");
    }, 3000);
  };

  const currentStudentStatus = students.find(s => s.id === currentUser.id)?.attendance;

  // Aggregate totals
  const totalStudents = students.filter(s => s.id !== 0).length;
  const countPresent = students.filter(s => s.attendance === 'Hadir' || s.attendance === 'Terlambat').length;
  const countExcused = students.filter(s => s.attendance === 'Izin' || s.attendance === 'Sakit').length;
  const countAbsent = totalStudents - countPresent - countExcused;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 font-sans">
      
      {/* HEADER HERO ELEMENT */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Presensi Kehadiran</h1>
            <p className="text-xs text-slate-500">Konfirmasi status kehadiran Anda pagi ini dengan asisten presensi lunas.</p>
          </div>
        </div>

        {/* Present state overview */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-150 p-2 px-4 rounded-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-705">
            Presensi Hari Ini: <strong className="text-blue-600 font-extrabold">{countPresent} / {totalStudents} Siswa</strong>
          </span>
        </div>
      </div>

      {/* CORE SPLIT WORKSPACE COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: VISUAL COMPASS STATS AND QR SIMULATOR */}
        <div className="lg:col-span-1 space-y-6">
          {/* Static Attendance Recap Circle Progress bar */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-slate-800 text-left w-full">Statistik Kehadiran 7D</h3>
            <p className="text-[11px] text-slate-400 text-left w-full mt-0.5">Persentase kepatuhan masuk kelas pagi ini.</p>

            <div className="relative w-36 h-36 my-6 flex items-center justify-center">
              {/* Animated donut representation */}
              <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="54" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="54" 
                  stroke="#3B82F6" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray="339.29" 
                  strokeDashoffset={339.29 - (339.29 * (countPresent / Math.max(1, totalStudents)))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 font-mono">
                  {Math.floor((countPresent / Math.max(1, totalStudents)) * 100)}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Absen Berhasil</span>
              </div>
            </div>

            {/* Legend categories */}
            <div className="w-full grid grid-cols-3 gap-2.5 border-t border-slate-100 pt-4 text-center">
              <div>
                <span className="text-xs font-black text-slate-800 font-mono">{countPresent}</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Hadir</p>
              </div>
              <div>
                <span className="text-xs font-black text-slate-800 font-mono">{countExcused}</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Izin/Sakit</p>
              </div>
              <div>
                <span className="text-xs font-black text-slate-800 font-mono">{countAbsent}</span>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Bolos</p>
              </div>
            </div>
          </div>

          {/* FUTURISTIC QR ATTAINMENT CAMERA BOX MOCK */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs relative overflow-hidden group">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">Scanner Gate</span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <Smartphone className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
              <span>Smart QR Gate Scan</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Scan kode QR yang terpampang di depan pintu kelas menggunakan kamera gawai.</p>

            {showQRScanner ? (
              <div className="mt-4 space-y-4">
                {/* Simulated Camera Window */}
                <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                  
                  {isQRScanning ? (
                    <>
                      {/* Laser holographic scanner animation */}
                      <motion.div 
                        animate={{ y: [0, 100, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-md shadow-cyan-400/50 z-20"
                      />
                      <div className="text-center z-10 space-y-1">
                        <Camera className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
                        <p className="text-[9px] font-mono tracking-widest text-cyan-400/80 font-semibold animation-pulse uppercase">
                          Mencari Pola QR-Gate...
                        </p>
                      </div>
                    </>
                  ) : qrSuccessMsg ? (
                    <div className="text-center z-10 p-3">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-1 animate-bounce" />
                      <p className="text-[10px] text-emerald-400 font-extrabold uppercase font-mono">{qrSuccessMsg}</p>
                    </div>
                  ) : (
                    <button 
                      onClick={startQRScanningSim}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-wider"
                    >
                      Hubungkan Pemindai
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => {
                    setShowQRScanner(false);
                    setQrSuccessMsg('');
                  }}
                  className="w-full border border-slate-200 rounded-xl py-2 text-xs text-slate-500 font-semibold"
                >
                  Tutup Kamera
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowQRScanner(true)}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Buka Scan QR Mode
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MANUAL REGISTRATION AND ACTION CHECKS */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs h-full flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Manifes Presensi Pelajar</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Silakan lakukan pendaftaran kehadiran manual jika tidak menggunakan pintu pemindaian QR.</p>
            </div>

            {/* Current user's registration feedback */}
            <div className="my-6 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3.5 text-left">
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-xl border border-slate-200/40 bg-slate-50 flex items-center justify-center overflow-hidden shadow-xs">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Small online indicator on the corner */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">{currentUser.name}</h4>
                  <p className="text-[10px] text-slate-450 uppercase font-mono">MEMBER ABSEN #{currentUser.id}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold mb-1">Status Kehadiran:</span>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                  currentStudentStatus === 'Hadir' ? 'bg-emerald-100 text-emerald-800' :
                  currentStudentStatus === 'Terlambat' ? 'bg-amber-100 text-amber-800' :
                  currentStudentStatus === 'Izin' || currentStudentStatus === 'Sakit' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-150 text-red-600'
                }`}>
                  {currentStudentStatus || 'BELUM ABSEN'}
                </span>
              </div>
            </div>

            {/* Registration Form sheet if they haven't submitted or would like to revise */}
            <form onSubmit={handleManualAttendance} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { value: 'Hadir', label: '🟢 HADIR', desc: 'Hadir Tepat Waktu' },
                  { value: 'Terlambat', label: '🟡 TELAT', desc: 'Hadiri Terlambat' },
                  { value: 'Izin', label: '🔵 IZIN', desc: 'Keperluan Mendesak' },
                  { value: 'Sakit', label: '🔴 SAKIT', desc: 'Sedang Istirahat' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setAttendanceStatus(item.value as any)}
                    className={`p-3.5 border rounded-2xl text-xs font-black flex flex-col items-center justify-center transition-all ${
                      attendanceStatus === item.value 
                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs' 
                        : 'bg-white border-slate-200/50 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[9px] font-normal text-slate-400 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Optional description notes details */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Keterangan / Alasan</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Contoh: Sakit demam tinggi, dsb..."
                    className="w-full bg-[#FAFAFA] border border-slate-200/50 focus:bg-white rounded-xl px-3 py-2 text-xs placeholder-slate-450 outline-none"
                  />
                </div>

                {/* Simulated file upload letter (Sakit / Izin) */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Foto Surat Dokter / Izin (Jika Ada)</label>
                  <div className="border border-dashed border-slate-200/50 p-1.5 px-3 rounded-xl flex items-center justify-between text-xs font-semibold bg-[#FAFAFA]/70">
                    <span className="truncate max-w-[150px] text-slate-400 text-[11px] font-normal">
                      {excuseDoc ? "Surat_Dokter_Terlampir.jpg" : "Tidak ada file bukti lunas"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExcuseDoc("SURAT_SAKIT_MOCK_BASE64")}
                      className="text-[10px] text-indigo-600 border border-indigo-200 bg-indigo-50 px-2.5 py-1 rounded-lg"
                    >
                      Upload Mock Image
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl py-2.5 text-xs transition-transform transform active:scale-[0.98] flex items-center justify-center space-x-1"
              >
                {isSubmitting ? 'Mengirim Data Presensi...' : 'Daftarkan Kehadiran manual'}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
