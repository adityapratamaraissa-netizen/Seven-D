/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import {
  LayoutDashboard,
  Bot,
  MessageCircle,
  Wallet,
  Calendar,
  Clock,
  User,
  LogOut,
  Flame,
  Award,
  Menu,
  X,
  Shield
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, currentPet, isTeacherMode } = useClassHub();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { id: 'study_hub', label: 'AI Study Hub', icon: Bot },
    { id: 'discord_chat', label: 'Chat Kelas', icon: MessageCircle },
    { id: 'finance', label: 'Kas 7D', icon: Wallet },
    { id: 'schedules', label: 'Jadwal & Piket', icon: Calendar },
    { id: 'attendance', label: 'Absensi', icon: Clock },
    { id: 'focus_zone', label: 'Mulai Fokus', icon: Flame },
    { id: 'profile', label: 'Profil Saya', icon: User },
  ];

  const canManageCodes = currentUser && (currentUser.role === 'Admin' || isTeacherMode);
  const finalNavItems = canManageCodes
    ? [...navItems.slice(0, 7), { id: 'student_codes', label: 'Kelola Kode', icon: Shield }, ...navItems.slice(7)]
    : navItems;

  // Helper calculation for Level Progress bar
  const levelThreshold = 200;
  const currentLevelXp = currentUser.xp % levelThreshold;
  const progressPercent = Math.min(100, Math.floor((currentLevelXp / levelThreshold) * 100));

  return (
    <nav className="sticky top-0 w-full z-50 px-4 py-3 sm:py-4 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/10">
            <span className="text-white font-extrabold text-sm font-mono">7D</span>
          </div>
          <div className="hidden md:block">
            <span className="text-slate-800 font-bold text-sm tracking-tight">Portal SEVEN D</span>
            <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">SMPN 2 LAMONGAN</p>
          </div>
        </div>

        {/* Center: Scrollable Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-1.5 overflow-x-auto px-2">
          {finalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Premium Level details & profile mini badge */}
        <div className="flex items-center space-x-4 shrink-0">
          <div className="hidden sm:flex flex-col items-end text-right">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Lv. {currentUser.level}</span>
              <span className="text-[10px] text-slate-400 font-mono">({currentLevelXp}/{levelThreshold} XP)</span>
            </div>
            {/* Progress bar */}
            <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 border border-slate-200/20">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* User Profile Mini dropdown trigger */}
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-slate-100 rounded-full border border-slate-200/50 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={currentUser.avatar}
                alt="user avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="hidden xs:block max-w-[90px] text-left">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name.split(' ')[0]}</p>
              <p className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.2 rounded-full font-medium inline-block truncate uppercase">
                {currentUser.role}
              </p>
            </div>

            <button
              onClick={logout}
              id="logout-btn-navbar"
              className="p-2 hover:bg-slate-100/80 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
              title="Logout session"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Mobile menu open toggler */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-slate-100 lg:hidden rounded-xl text-slate-600"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu list */}
      {isMobileMenuOpen && (
        <div id="mobile-nav-panel" className="lg:hidden mt-3 bg-white border border-slate-200/50 rounded-2xl p-3 flex flex-col gap-1 shadow-lg">
          {finalNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
