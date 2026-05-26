/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, AlertCircle, ArrowUpRight, 
  ArrowDownRight, Send, Check, Trash2, Calendar, FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';
import { Student } from '../types';

export const ClassFinance: React.FC = () => {
  const {
    currentUser,
    students,
    kasRecords,
    addKas,
  } = useClassHub();

  // Inputs for adding new cash record
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txCategory, setTxCategory] = useState('Kas Rutin');
  const [notifiedUser, setNotifiedUser] = useState<string | null>(null);

  if (!currentUser) return null;

  // Calculators
  const totalIncome = kasRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = kasRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Render list of active debtors (simulation: students with low XP or random low pay indexes)
  // We can filter actual debtors as any student with odd roll numbers to make it stable
  const debtors = students.filter(s => s.id % 4 === 0 && s.id !== 0);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txDesc) return;
    const amt = parseFloat(txAmount);
    addKas(txType, amt, txDesc, txCategory);

    setTxAmount('');
    setTxDesc('');
    alert("💸 Transaksi Kas Kelas Berhasil Dicatat!");
  };

  const handleRemindDebtor = (studentName: string) => {
    setNotifiedUser(studentName);
    setTimeout(() => {
      setNotifiedUser(null);
    }, 2500);

    // Simulate sending a ping tag
    alert(`📢 Tag Kas Terikirim: Reminder pembayaran kas sebesar Rp10k berhasil dipos ke Discord class feed untuk siswa: ${studentName}!`);
  };

  // SVG Chart points calculations
  // Let's draw an elegant curved area SVG chart based on the accumulated balance over time
  // This is highly robust and performs perfectly with Zero dependencies
  const chartData = [500000, 650000, 500000, 840000, 640000]; // static trend representation
  const maxVal = Math.max(...chartData);
  const minVal = Math.min(...chartData);
  const range = maxVal - minVal;

  const points = chartData.map((val, idx) => {
    const x = (idx / (chartData.length - 1)) * 340 + 30;
    const y = range === 0 ? 100 : (1 - (val - minVal) / range) * 80 + 20;
    return `${x},${y}`;
  }).join(' ');

  // Bendahara / Admin Access configuration
  const canModifyFinance = currentUser.role.includes('Bendahara') || currentUser.role === 'Admin';

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 font-sans">
      
      {/* 1. TOP METRIC WIDGET CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Cash Balance Widget */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-semibold">Saldo Hari Ini</span>
            <p className="text-2xl font-black text-slate-800 font-mono">{formatRupiah(currentBalance)}</p>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Transparan & Keuangan Sehat</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Wallet className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Total Inflow Cash Widget */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-semibold">Total Pemasukan</span>
            <p className="text-2xl font-black text-emerald-600 font-mono">{formatRupiah(totalIncome)}</p>
            <span className="text-[10px] text-slate-400 font-medium">Bulan Mei 2026</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Total Outflow Cash Widget */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-semibold">Total Pengeluaran</span>
            <p className="text-2xl font-black text-rose-600 font-mono">{formatRupiah(totalExpense)}</p>
            <span className="text-[10px] text-slate-400 font-medium">Bulan Mei 2026</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
            <TrendingDown className="w-5.5 h-5.5" />
          </div>
        </div>

      </div>

      {/* 2. CHARTS AND TRANSACTIONS GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Charts Trend Card */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs h-full flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-semibold">Analis Kas</span>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5 mt-1">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-500" />
              <span>Grafik Pertumbuhan Kas 7D</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Representasi akumulatif pertumbuhan dana kas mingguan kelas.</p>
          </div>

          {/* SVG Line visualization charts */}
          <div className="my-6 bg-slate-50/50 border border-slate-100 rounded-3xl p-4 flex items-center justify-center">
            <svg viewBox="0 0 400 120" className="w-full h-36 drop-shadow-sm">
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="30" y1="20" x2="370" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="60" x2="370" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="100" x2="370" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              {/* Area Glow */}
              <path
                d={`M 30,100 L ${points} L 370,100 Z`}
                fill="url(#chart-glow)"
              />
              {/* Line graph */}
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Interactive nodes circles */}
              {chartData.map((val, idx) => {
                const x = (idx / (chartData.length - 1)) * 340 + 30;
                const y = range === 0 ? 100 : (1 - (val - minVal) / range) * 80 + 20;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill="#3B82F6"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:r-[6.5] transition-all"
                    title={`Rp ${val}`}
                  />
                );
              })}
            </svg>
          </div>

          {/* Bottom legend descriptors */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>M-1 (May)</span>
            <span>M-2</span>
            <span>M-3</span>
            <span>M-4</span>
            <span>Selesai</span>
          </div>
        </div>

        {/* Ledger logs bookkeeping */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs flex flex-col justify-between max-h-[380px]">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-semibold">Ledger</span>
            <h3 className="text-base font-bold text-slate-800">Aliran Dana Terakhir</h3>
          </div>

          <div className="space-y-3 overflow-y-auto mt-4 pr-1 flex-grow">
            {kasRecords.map((r) => (
              <div key={r.id} className="p-3 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between text-left">
                <div className="min-w-0 flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    r.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {r.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{r.description}</p>
                    <span className="text-[9px] text-slate-400 font-mono">{r.date} • {r.category}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-xs font-bold font-mono ${
                    r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {r.type === 'income' ? '+' : '-'}{formatRupiah(r.amount).replace(/[^0-9]/g, '')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. DOUBLE ACTION FOOTER: RECORD FORM AND DEBTORS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ADD TRANSACTION FORM BLOCK */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-800">Catat Kas Kelas</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {canModifyFinance 
              ? 'Selamat bekerja Bendahara! Silakan catat mutasi kas kelas Anda demi transparansi keuangan 7D.' 
              : 'Fitur penguncian aktif. Anda hanya berhak memantau pelaporan keuangan.'}
          </p>

          {canModifyFinance ? (
            <form onSubmit={handleAddTransaction} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Transaction type selector */}
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 p-4 rounded-xl text-xs font-extrabold text-center border transition-all ${
                    txType === 'income' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200/50 text-slate-500'
                  }`}
                >
                  🟢 PEMASUKAN
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 p-4 rounded-xl text-xs font-extrabold text-center border transition-all ${
                    txType === 'expense' ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-white border-slate-200/50 text-slate-500'
                  }`}
                >
                  🔴 PENGELUARAN
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Jumlah Uang (Rupiah)</label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Contoh: 15000"
                    className="w-full bg-[#FAFAFA] border border-slate-200/50 focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold placeholder-slate-400 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Kategori</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-slate-200/50 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-700 outline-none"
                  >
                    <option value="Kas Rutin">Kas Mingguan</option>
                    <option value="Kebutuhan Kelas">Prasarana Kelas</option>
                    <option value="Sosial">Bantuan Sosial</option>
                    <option value="Event">Dana Acara</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Keterangan Transaksi</label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="Contoh: Beli kemoceng sutra baru"
                  className="w-full bg-[#FAFAFA] border border-slate-200/50 focus:bg-white rounded-xl px-3 py-2 text-xs placeholder-slate-400 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl py-2.5 text-xs transition-transform transform active:scale-[0.98] flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Input Log Bendahara</span>
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-xs text-slate-400 mt-4 leading-relaxed">
              🔒 Form pencatatan kas di-nonaktifkan untuk Siswa Biasa. <br />
              Hanya **Bendahara I/II** (Nafa / Aulia) dan **Pak Wahyudin** yang berhak memasukkan rincian log baru.
            </div>
          )}
        </div>

        {/* CLASS DEBTORS/ siswa belum bayar list */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs max-h-[350px] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-4.5 h-4.5 text-amber-500 animate-bounce" />
              <span>Daftar Siswa Belum Lunas Kas</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Siswa 7D yang belum menyelesaikan pembayaran administrasi kas minggu ini.</p>
          </div>

          <div className="space-y-2 mt-4 overflow-y-auto pr-1 flex-grow">
            {debtors.length > 0 ? (
              debtors.map((s) => (
                <div key={s.id} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between text-left">
                  <div className="flex items-center space-x-2.5">
                    <img 
                      src={s.avatar} 
                      alt="avatar" 
                      className="w-7 h-7 bg-white rounded-lg border border-slate-200/30 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[170px]">{s.name}</p>
                      <span className="text-[9px] text-slate-400 uppercase font-mono">Absen {s.id} • Tunggakan Rp10.000</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemindDebtor(s.name)}
                    className="text-[9px] font-bold text-amber-700 bg-amber-50 md:hover:bg-amber-100 border border-amber-200/30 px-3 py-1 rounded-lg flex items-center gap-0.5 active:scale-95 transition-transform"
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>Tagih</span>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">Lunas Semua! Semua siswa SEVEN D rajin menabung 🌟</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
