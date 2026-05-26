/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Key, Search, User, Compass, HelpCircle, QrCode, Upload, RefreshCw, AlertCircle, Camera, Check } from 'lucide-react';
import { useClassHub } from '../context/ClassHubContext';
import { CLASS_NAME, SCHOOL_NAME, CLASS_PASSCODE_DEFAULT, SPECIAL_WALI_KELAS_CODE } from '../data/students';

interface LoginPageProps {
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const { loginSiswa, loginWaliKelas, students } = useClassHub();

  const [loginMode, setLoginMode] = useState<'code' | 'qr'>('code');
  const [searchName, setSearchName] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isScanningMode, setIsScanningMode] = useState(false);

  // Anti-Spam state rules
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSecs, setCooldownSecs] = useState(0);

  // Decrement anti-spam locking cooldown every second
  useEffect(() => {
    if (cooldownSecs > 0) {
      const timer = setTimeout(() => {
        setCooldownSecs(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSecs]);

  // Filter student lists by search input
  const filteredStudents = searchName.trim().length > 0
    ? students.filter(s => s.name.toLowerCase().includes(searchName.toLowerCase()))
    : [];

  const handleSelectStudent = (student: typeof students[0]) => {
    setSearchName(student.name);
    setSelectedStudentId(student.id);
    setIsSearching(false);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const resolvedAvatar = selectedStudent 
    ? selectedStudent.avatar 
    : `https://api.dicebear.com/7.x/bottts/svg?seed=${searchName || 'General'}&backgroundColor=b6e3f4`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Safety anti-spam lock check
    if (cooldownSecs > 0) {
      setErrorMsg(`Keamanan Spam Aktif! Silakan tunggu ${cooldownSecs} detik sebelum mencoba lagi.`);
      return;
    }

    // Checking teacher special login
    if (passcode === SPECIAL_WALI_KELAS_CODE) {
      const res = loginWaliKelas(passcode);
      if (res) return;
    }

    // Checking normal student login
    if (!selectedStudentId) {
      const match = students.find(s => s.name.toLowerCase() === searchName.trim().toLowerCase());
      if (match) {
        const success = loginSiswa(match.name, match.id, passcode);
        if (success) {
          setFailedAttempts(0);
          return;
        }
      }
      handleLoginFailure();
      return;
    }

    const success = loginSiswa(searchName, selectedStudentId, passcode);
    if (success) {
      setFailedAttempts(0);
      // Login succeeded context triggers re-render automatically
    } else {
      handleLoginFailure();
    }
  };

  const handleLoginFailure = () => {
    const nextFailed = failedAttempts + 1;
    setFailedAttempts(nextFailed);
    if (nextFailed >= 3) {
      setCooldownSecs(15);
      setFailedAttempts(0);
      setErrorMsg('🔒 Proteksi Spam Aktif! Kode salah 3 kali berturut-turut. Log masuk terkunci 15 detik.');
    } else {
      setErrorMsg(`Sandi atau Kode salah! Percobaan gagal: ${nextFailed}/3.`);
    }
  };

  // Automated QR file decoder simulation 
  const handleQrUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsScanningMode(true);

    setTimeout(() => {
      setIsScanningMode(false);
      const nameOfFile = file.name.toLowerCase();
      
      // Try resolving student by checking filename string matches
      const match = students.find(s => {
        const firstName = s.name.split(' ')[0].toLowerCase();
        return nameOfFile.includes(firstName) || nameOfFile.includes(s.name.toLowerCase());
      });

      if (match) {
        const targetCode = match.loginCode || `${String(match.id).padStart(2, '0')}2026`;
        const ok = loginSiswa(match.name, match.id, targetCode);
        if (ok) {
          return;
        }
      }

      // Default fallback if upload dummy but no direct name matches (e.g., logs in Raissa as organizer)
      const adminMatch = students.find(s => s.role === 'Admin') || students[0];
      const adminCode = adminMatch.loginCode || `${String(adminMatch.id).padStart(2, '0')}2026`;
      loginSiswa(adminMatch.name, adminMatch.id, adminCode);
    }, 1800);
  };

  // Instant simulator select
  const handleInstantQRScanSimulate = (student: typeof students[0]) => {
    setErrorMsg('');
    setIsScanningMode(true);
    setTimeout(() => {
      setIsScanningMode(false);
      const targetCode = student.loginCode || `${String(student.id).padStart(2, '0')}2026`;
      loginSiswa(student.name, student.id, targetCode);
    }, 1400);
  };

  return (
    <div className="relative min-h-screen bg-[#F0F2F6] flex items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
      {/* Animated Aesthetic Background Core Ellipse Elements */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-cyan-300/35 to-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300/35 to-purple-400/20 blur-[110px] pointer-events-none" />

      {/* Main Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden z-20 flex flex-col justify-between"
      >
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Logo Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/15">
              <span className="text-white font-extrabold text-xl font-mono">7D</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Portal Premium SEVEN D</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{SCHOOL_NAME}</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-slate-100/70 p-1.5 rounded-2xl flex border border-slate-200/30">
            <button
              onClick={() => { setLoginMode('code'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'code' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Kode Login</span>
            </button>
            <button
              onClick={() => { setLoginMode('qr'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'qr' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Login Card</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loginMode === 'code' ? (
              // OPTION A: STANDARD KODE lOGIN
              <motion.form
                key="code-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Search / Student name autocomplete list */}
                <div className="space-y-1 relative">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Pilih Nama Siswa 7D
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchName}
                      onChange={(e) => {
                        setSearchName(e.target.value);
                        setSelectedStudentId(null);
                        setIsSearching(true);
                      }}
                      onFocus={() => setIsSearching(true)}
                      className="w-full bg-[#FAFAFA]/70 hover:bg-[#FAF9F6] focus:bg-white border border-slate-200/50 rounded-xl px-4 py-3 pl-10 text-sm placeholder-slate-400 text-slate-800 tracking-tight transition-all focus:border-blue-400/60 outline-none"
                      placeholder="Ketik nama Anda di sini..."
                      required
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>

                  {/* Dropdown overlay */}
                  {isSearching && searchName.trim().length > 0 && (
                    <div id="search-dropdown-menu" className="absolute left-0 right-0 top-[102%] mt-1 bg-white/95 backdrop-blur-md max-h-44 overflow-y-auto rounded-xl border border-slate-200/50 shadow-xl z-50 divide-y divide-slate-100">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleSelectStudent(s)}
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors text-xs text-slate-700 font-medium flex items-center justify-between"
                          >
                            <span className="truncate pr-2">{s.name}</span>
                            <span className="text-[9px] text-blue-500 bg-blue-50/70 px-1.5 py-0.2 rounded-md uppercase shrink-0 font-bold">
                              Absen {s.id}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-slate-400 text-center">Nama tidak terdaftar di 7D</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Absen & Password field Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-semibold text-slate-600">No Absen</label>
                    <input
                      type="number"
                      disabled={selectedStudentId !== null}
                      value={selectedStudentId !== null ? selectedStudentId : ''}
                      onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                      className="w-full bg-[#FAFAFA]/70 border border-slate-200/50 rounded-xl py-3 text-sm placeholder-slate-400 text-slate-800 outline-none transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-bold font-mono"
                      placeholder="1-35"
                      required
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      Kode Login Unik
                    </label>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full bg-[#FAFAFA]/70 hover:bg-[#FAF9F6] focus:bg-white border border-slate-200/50 rounded-xl px-4 py-3 text-sm placeholder-slate-400 text-slate-800 outline-none focus:border-blue-400/60 transition-all font-mono tracking-wider"
                      placeholder="Masukkan kode unik"
                      required
                    />
                  </div>
                </div>

                {/* Selected user preview block */}
                {selectedStudentId && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-blue-50/50 border border-blue-200/20 rounded-2xl p-3.5 flex items-center gap-3.5 text-xs text-blue-700"
                  >
                    <img
                      src={resolvedAvatar}
                      alt="avatar"
                      className="w-9 h-9 rounded-full bg-white border border-blue-200/30 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 text-left">
                      <p className="font-extrabold text-blue-900 truncate">{searchName}</p>
                      <p className="text-[10px] text-blue-500 font-mono mt-0.5">
                        Absen #{selectedStudentId} • {selectedStudent?.role || 'Siswa'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Cooldown loading block */}
                {cooldownSecs > 0 && (
                  <div className="bg-amber-50 border border-amber-200/45 rounded-xl p-3 flex items-center gap-2 text-amber-700 text-xs text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Log masuk dikunci sementara. Silakan tunggu <strong>{cooldownSecs} detik</strong>.</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={cooldownSecs > 0}
                  className={`w-full py-3 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2 active:scale-[0.98] ${
                    cooldownSecs > 0 
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/10'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Portal Premium</span>
                </button>
              </motion.form>
            ) : (
              // OPTION B: QR LOGIN CARD AUTOMATIC FLOW
              <motion.div
                key="qr-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 text-center"
              >
                {/* Visual Scanner Layout */}
                <div className="relative border border-slate-200 bg-slate-50/40 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[170px] overflow-hidden">
                  
                  {isScanningMode ? (
                    // Lasers scanning sweep simulator
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-50/90 z-10">
                      <div className="relative w-24 h-24 border-2 border-dashed border-blue-400 rounded-2xl flex items-center justify-center">
                        <Camera className="w-8 h-8 text-blue-500 animate-pulse" />
                        <span className="absolute inset-x-2 top-1/2 h-0.5 bg-red-500 shadow-md shadow-red-500/50 animate-[bounce_1.5s_infinite]" />
                      </div>
                      <span className="text-xs text-slate-500 font-bold font-mono animate-pulse uppercase tracking-wider">Mencegat Matrix QR...</span>
                    </div>
                  ) : null}

                  {/* QR Scan instruction info container */}
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center mx-auto">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-extrabold text-slate-800 leading-none">Unggah / Pindai Kartu QR</h3>
                    <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                      Unduh ID Kartu QR dari menu <strong className="text-slate-500">Kelola Kode</strong> Admin, masukkan gambarnya ke sini untuk masuk instan.
                    </p>
                  </div>

                  {/* File Upload Zone */}
                  <label className="mt-4 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold px-4 py-2 rounded-xl cursor-pointer active:scale-95 transition-all shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Kartu ID QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUploadSimulated}
                      className="hidden"
                    />
                  </label>
                </div>


              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback error badge messages */}
          {errorMsg && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-red-50 border border-red-200/50 rounded-2xl p-3 flex items-center gap-2 text-[11px] text-red-600 font-sans font-medium text-left"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}



        </div>

        {/* Back link */}
        <div className="bg-slate-50/40 border-t border-slate-100 p-4 text-center">
          <button
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-semibold hover:underline"
          >
            ← Kembali ke Beranda Utama
          </button>
        </div>
      </motion.div>
    </div>
  );
};
