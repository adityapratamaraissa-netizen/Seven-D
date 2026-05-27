import React, { useState } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import {
  LayoutDashboard,
  Bot,
  MessageCircle,
  Wallet,
  Menu,
  Clock,
  Calendar,
  Flame,
  User,
  Shield,
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BottomNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, isTeacherMode } = useClassHub();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (!currentUser) return null;

  const canManageCodes = currentUser && (currentUser.role === 'Admin' || isTeacherMode);

  // Core 4 items showing directly on mobile navbar
  const primaryItems = [
    { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'study_hub', label: 'Study Hub', icon: Bot },
    { id: 'discord_chat', label: 'Chat', icon: MessageCircle },
    { id: 'finance', label: 'Kas 7D', icon: Wallet },
  ];

  // Secondary items placed inside the sliding sheet
  const secondaryItems = [
    { id: 'attendance', label: 'Absensi Kehadiran', description: 'Ambil presensi kelas otomatis', icon: Clock },
    { id: 'schedules', label: 'Jadwal & Piket Kelas', description: 'Agenda belajar & piket harian', icon: Calendar },
    { id: 'focus_zone', label: 'Focus Zone', description: 'Belajar fokus bareng Lofi', icon: Flame },
    { id: 'profile', label: 'Profil Saya', description: 'Ganti avatar, bio & cek XP', icon: User },
  ];

  if (canManageCodes) {
    // Inject manage codes into secondary items list
    secondaryItems.push({
      id: 'student_codes',
      label: 'Kelola Kode Kredensial',
      description: 'Reset password unik murid',
      icon: Shield,
    });
  }

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsSheetOpen(false);
  };

  return (
    <>
      {/* 1. STICKY GLASSMORPHIC BOTTOM NAV BAR */}
      <div 
        id="mobile-bottom-navbar" 
        className="fixed bottom-0 left-0 right-0 z-45 bg-white/75 backdrop-blur-lg border-t border-slate-200/40 px-3 pb-safe-bottom lg:hidden shadow-[0_-5px_25px_rgba(0,0,0,0.03)]"
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="flex flex-col items-center justify-center w-14 h-full relative"
              >
                <div className="relative">
                  <Icon className={`w-5.5 h-5.5 transition-all duration-300 ${
                    isActive ? 'text-blue-500 scale-110' : 'text-slate-400 hover:text-slate-600'
                  }`} />
                  {isActive && (
                    <motion.div 
                      layoutId="activeDot"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"
                    />
                  )}
                </div>
                <span className={`text-[9.5px] mt-1 font-medium tracking-tight ${
                  isActive ? 'text-blue-500 font-bold' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More menu action button */}
          <button
            onClick={() => setIsSheetOpen(true)}
            className="flex flex-col items-center justify-center w-14 h-full relative"
          >
            <Menu className="w-5.5 h-5.5 text-slate-400 hover:text-slate-650" />
            <span className="text-[9.5px] mt-1 font-medium tracking-tight text-slate-400">
              Lainnya
            </span>
          </button>
        </div>
      </div>

      {/* 2. SLIDING BOTTOM SHEET MENU */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-200 lg:hidden"
            />

            {/* iOS style sheet drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-15px_35px_rgba(0,0,0,0.1)] z-210 px-6 pt-3 pb-8 lg:hidden max-h-[85vh] overflow-y-auto"
            >
              {/* Top Drag Handle */}
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

              {/* Title Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Kategori Menu Kelas</h3>
                  <p className="text-[11px] text-slate-450">Akomodir semua fitur portal premium Anda</p>
                </div>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Sheet Navigation Grid / List */}
              <div className="space-y-1.5 divide-y divide-slate-100/50">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className="w-full text-left py-4 px-1 flex items-center justify-between group active:bg-slate-50 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-2xl transition-all ${
                          isActive ? 'bg-blue-100/60 text-blue-600' : 'bg-slate-50 text-slate-500'
                        }`}>
                          <Icon className="w-5 h-5 shrink-0" />
                        </div>
                        <div className="space-y-0.5">
                          <p className={`text-xs font-bold leading-none ${
                            isActive ? 'text-blue-600' : 'text-slate-800'
                          }`}>
                            {item.label}
                          </p>
                          <p className="text-[10px] text-slate-400">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-all" />
                    </button>
                  );
                })}
              </div>

              {/* Logout Block */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsSheetOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 hover:bg-red-100 border border-red-200/40 text-red-600 rounded-2xl text-xs font-bold transition-all"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span>Keluar Sesi Akun</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
