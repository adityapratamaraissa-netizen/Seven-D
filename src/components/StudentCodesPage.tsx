/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  Shield, Key, Copy, Check, RotateCcw, QrCode, Search, 
  Sparkles, Download, ArrowRight, Eye, EyeOff, Edit3, X, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Deterministic high-fidelity stylized QR Canvas Generator
const QuickQrCode: React.FC<{ value: string; size?: number }> = ({ value, size = 120 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw with customized eyes & dots
    ctx.clearRect(0, 0, size, size);
    
    // Background fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Seed-based calculation to make the QR represent the passcode deterministically
    let seed = 0;
    for (let i = 0; i < value.length; i++) {
      seed = (seed << 5) - seed + value.charCodeAt(i);
      seed |= 0;
    }
    const pseudoRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Draw QR Finder Patterns (eyes at corners)
    const drawFinderPattern = (cx: number, cy: number) => {
      ctx.fillStyle = '#2563EB'; // Blue-600
      ctx.fillRect(cx, cy, 28, 28);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cx + 4, cy + 4, 20, 20);
      ctx.fillStyle = '#1E293B'; // Slate-800
      ctx.fillRect(cx + 8, cy + 8, 12, 12);
    };

    drawFinderPattern(6, 6); // Top-left
    drawFinderPattern(size - 34, 6); // Top-right
    drawFinderPattern(6, size - 34); // Bottom-left

    // Draw small alignment helper
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(size - 22, size - 22, 10, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(size - 18, size - 18, 4, 4);

    // Fill the rest with pseudo-random dots
    const moduleSize = 4;
    const cols = Math.floor(size / moduleSize);
    ctx.fillStyle = '#334155'; // slate-700 dots

    for (let r = 0; r < cols; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip Finder patterns
        const isTopLeftFinder = r < 9 && c < 9;
        const isTopRightFinder = r < 9 && c >= cols - 9;
        const isBottomLeftFinder = r >= cols - 9 && c < 9;
        const isBottomRightAlignment = r >= cols - 6 && c >= cols - 6;

        if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder || isBottomRightAlignment) {
          continue;
        }

        // Draw round modules
        if (pseudoRandom() > 0.45) {
          ctx.beginPath();
          ctx.arc(c * moduleSize + moduleSize / 2, r * moduleSize + moduleSize / 2, moduleSize / 2 * 0.9, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }, [value, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className="rounded-2xl border border-slate-200/50 shadow-sm p-1.5 bg-white" 
    />
  );
};

export const StudentCodesPage: React.FC = () => {
  const { students, generateAllCodes, resetStudentCode, currentUser, isTeacherMode } = useClassHub();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [revealedIds, setRevealedIds] = useState<{ [id: number]: boolean }>({});
  
  // Custom manual edit student ID states
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [customCodeInput, setCustomCodeInput] = useState('');

  // Selected Student for QR Card display modal
  const [selectedQRStudent, setSelectedQRStudent] = useState<typeof students[0] | null>(null);

  // Trigger copy to clipboard with click feedback 
  const handleCopyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const toggleRevealCode = (id: number) => {
    setRevealedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleStartEdit = (student: typeof students[0]) => {
    setEditingStudentId(student.id);
    setCustomCodeInput(student.loginCode || `${String(student.id).padStart(2, '0')}2026`);
  };

  const handleSaveCustomCode = (id: number) => {
    if (!customCodeInput.trim()) return;
    resetStudentCode(id, customCodeInput.trim());
    setEditingStudentId(null);
  };

  const handleResetToDefault = (id: number) => {
    const paddedId = String(id).padStart(2, '0');
    const defaultCode = `${paddedId}2026`;
    resetStudentCode(id, defaultCode);
    setEditingStudentId(null);
  };

  const handleBatchGenerate = () => {
    if (window.confirm("⚠️ Apakah Anda yakin ingin me-reset SEMUA kode login siswa ke format default [nomor_absen]2026? Kode kustom individu sebelumnya akan diganti.")) {
      generateAllCodes();
      alert("✨ Semua kode login siswa berhasil di-generate ulang ke format standar!");
    }
  };

  // Filter student lists
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(s.id).includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6 font-sans">
      
      {/* 1. MAIN HEADER & STATS BAR */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Shield className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Panel Admin Privilese</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none mt-1">
            Administrasi Kredensial Siswa
          </h1>
          <p className="text-slate-500 text-xs font-sans">
            Konfigurasi kode login kustom, generate QR Card otomatis, serta pembagian kunci kelas digital.
          </p>
        </div>

        {/* Batch buttons action */}
        <div className="flex self-start md:self-center gap-2">
          <button
            onClick={handleBatchGenerate}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold active:scale-[0.98] transition-all shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Batch Auto-Generate</span>
          </button>
        </div>
      </div>

      {/* 2. CORE GRID MATRIX */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl overflow-hidden shadow-xs">
        
        {/* Table Filter Input bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau no absen..."
              className="w-full bg-[#FAFAFA]/70 border border-slate-200/50 rounded-xl px-3.5 py-2 pl-9 text-xs placeholder-slate-400 text-slate-800 outline-none focus:bg-white focus:border-blue-400/50 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5" />
          </div>

          <div className="text-[10px] text-slate-400 font-mono font-bold uppercase">
            Terfilter: {filteredStudents.length} / {students.length} Siswa 7D
          </div>
        </div>

        {/* List of students tables */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold font-mono">
                <th className="py-3 px-6 w-16 text-center">No Absen</th>
                <th className="py-3 px-6">Siswa & Jabatan</th>
                <th className="py-3 px-6">Kredensial Kode Login</th>
                <th className="py-3 px-6 text-center">QR Login Card</th>
                <th className="py-3 px-6 text-right">Opsi Pengaturan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const code = student.loginCode || `${String(student.id).padStart(2, '0')}2026`;
                  const isRevealed = !!revealedIds[student.id];
                  const isEditing = editingStudentId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* No Absen */}
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 border border-slate-200/50 text-xs font-bold text-slate-600 font-mono">
                          {student.id}
                        </span>
                      </td>

                      {/* Name Details */}
                      <td className="py-3 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.avatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/30"
                          />
                          <div>
                            <p className="text-xs font-extrabold text-slate-800 tracking-tight leading-none">
                              {student.name}
                            </p>
                            <span className="text-[9px] font-mono uppercase font-bold text-indigo-600 mt-0.5 inline-block bg-indigo-50 px-1.5 py-0.2 rounded-md">
                              {student.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Login Code representation */}
                      <td className="py-3 px-6">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 max-w-[200px]">
                            <input
                              type="text"
                              value={customCodeInput}
                              onChange={(e) => setCustomCodeInput(e.target.value)}
                              className="w-full bg-[#FAFAFA] border border-blue-200 focus:bg-white rounded-lg px-2 py-1 text-xs font-bold font-mono text-slate-700 outline-none"
                            />
                            <button
                              onClick={() => handleSaveCustomCode(student.id)}
                              className="p-1 px-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-[10px] font-bold"
                              title="Simpan"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                              title="Batal"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center bg-slate-100 font-mono text-xs font-bold text-slate-700 rounded-lg px-2.5 py-1 select-all hover:bg-slate-100/80">
                              {isRevealed ? code : '••••••'}
                            </span>
                            <button 
                              onClick={() => toggleRevealCode(student.id)}
                              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                              title={isRevealed ? "Hide code" : "Show code"}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopyCode(student.id, code)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Copy code"
                            >
                              {copiedId === student.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* QR Trigger Badge */}
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setSelectedQRStudent(student)}
                          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100/70 border border-blue-200/20 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:scale-105 active:scale-95 transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Melihat kartu QR</span>
                        </button>
                      </td>

                      {/* Customize and Reset Settings */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEdit(student)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                            title="Edit Code"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleResetToDefault(student.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                            title="Reset to default format"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                    Siswa tidak ditemukan untuk query "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. DIAGRAM/NOTICE PETUNJUK ADMINISTRASI KODE */}
      <div className="bg-[#FAFAFA]/70 border border-slate-200/50 rounded-2xl p-4.5 text-xs text-slate-500 leading-relaxed text-left space-y-1 sm:grid sm:grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold text-slate-800 flex items-center gap-1">
            <Shield className="w-4 h-4 text-indigo-500" /> Keamanan & Regulasi
          </h4>
          <p className="mt-1 text-[11px]">
            Sistem kognitif 7D mengandalkan proteksi kredensial login unik per siswa. Format standar adalah <code>[DuaDigitNoAbsen]2026</code>. Pastikan siswa menjaga kerahasiaan kode unik masing-masing demi keabsahan data kognitif dan pembukuan kas kelas.
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <h4 className="font-bold text-slate-800 flex items-center gap-1">
            <QrCode className="w-4 h-4 text-blue-500" /> Cara Kerja Log Masuk QR
          </h4>
          <p className="mt-1 text-[11px]">
            Siswa dapat mengunduh QR Card login kustom mereka. Pada gerbang login portal, mereka cukup mengunggah kartu QR tersebut atau menunjukkannya ke asisten login untuk mendeteksi identitas instan tanpa mengetik kode khusus manual.
          </p>
        </div>
      </div>

      {/* 4. MODAL DRAWER SIMULATED QR KARTU BELAJAR SISWA */}
      <AnimatePresence>
        {selectedQRStudent && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-sm bg-white rounded-3xl border border-slate-200/50 overflow-hidden shadow-2xl relative"
            >
              {/* Card visual colored gradient banner */}
              <div className="h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 relative overflow-hidden flex items-center px-6">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 blur-md translate-x-4 -translate-y-4" />
                <div className="space-y-0.5 text-left text-white">
                  <span className="text-[8px] bg-white/20 uppercase font-black px-2 py-0.5 rounded-full font-mono tracking-widest leading-none">ID Kredensial 7D</span>
                  <h3 className="text-sm font-extrabold tracking-tight mt-1 truncate max-w-[200px]">{selectedQRStudent.name}</h3>
                </div>
                {/* Close Button floating top-right */}
                <button
                  onClick={() => setSelectedQRStudent(null)}
                  className="absolute right-4 top-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/25 rounded-lg p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Card Body */}
              <div className="p-6 flex flex-col items-center">
                
                {/* Student visual Presets */}
                <div className="flex items-center gap-4 w-full bg-slate-50 border border-slate-100/60 p-3 rounded-2xl mb-5">
                  <img
                    src={selectedQRStudent.avatar}
                    alt="student avatar"
                    className="w-12 h-12 bg-white border border-slate-200/50 rounded-xl shrink-0"
                  />
                  <div className="text-left min-w-0">
                    <p className="text-xs font-black truncate text-slate-800">{selectedQRStudent.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Absen: #{selectedQRStudent.id} • {selectedQRStudent.role}</p>
                  </div>
                </div>

                {/* Simulated dynamic matrix QR code */}
                <div className="relative p-2.5 bg-slate-50 border border-slate-200/30 rounded-3xl shrink-0">
                  <QuickQrCode value={selectedQRStudent.loginCode || `${String(selectedQRStudent.id).padStart(2, '0')}2026`} size={135} />
                  <div className="absolute inset-x-0 bottom-2 bg-slate-800 text-white font-mono font-bold text-[8px] tracking-wide text-center uppercase py-0.5 max-w-[80px] mx-auto rounded-full shadow-xs">
                    {selectedQRStudent.loginCode || `${String(selectedQRStudent.id).padStart(2, '0')}2026`}
                  </div>
                </div>

                {/* Card footer description */}
                <p className="text-[10px] text-slate-400 mt-5 leading-relaxed text-center">
                  Gunakan kartu QR ini untuk masuk otomatis ke gerbang masuk digital kelas SEVEN D. <br/>
                  <span className="text-slate-500 font-semibold">Tunjukkan atau upload saat melapor di gerbang masuk.</span>
                </p>

                {/* Simulated download helper */}
                <button
                  onClick={() => {
                    alert(`📦 Modul Unduh Dipicu: Berhasil mensimulasikan unduhan Kartu Log QR untuk ${selectedQRStudent.name}!`);
                    setSelectedQRStudent(null);
                  }}
                  className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 text-xs font-bold transition-all hover:scale-[1.02] flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Simpan Kartu QR Siswa</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
