/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClassHubProvider, useClassHub } from './context/ClassHubContext';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { BottomNavbar } from './components/BottomNavbar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { motion, AnimatePresence } from 'motion/react';

// Subcomponents pages
import { Dashboard } from './components/Dashboard';
import { AIStudyHub } from './components/AIStudyHub';
import { ChatDiscord } from './components/ChatDiscord';
import { ClassFinance } from './components/ClassFinance';
import { Schedules } from './components/Schedules';
import { Attendance } from './components/Attendance';
import { FocusZone } from './components/FocusZone';
import { ProfilePage } from './components/ProfilePage';
import { StudentCodesPage } from './components/StudentCodesPage';

const AppContent: React.FC = () => {
  const { currentUser, isConnected } = useClassHub();

  // Screen states: 'landing' | 'login' | 'portal'
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'login' | 'portal'>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Trigger login redirect from landing actions
  const handleStartLogin = () => {
    setCurrentScreen('login');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
  };

  // If user is logged, forces portal context instantly
  React.useEffect(() => {
    if (currentUser) {
      setCurrentScreen('portal');
    } else {
      // If manually logged out, return to landing
      if (currentScreen === 'portal') {
        setCurrentScreen('landing');
      }
    }
  }, [currentUser]);

  return (
    <div className="w-full bg-[#F4F6FA] text-slate-800 antialiased flex flex-col justify-between">
      
      {/* 1. OUT-OF-PORTAL ROUTING PANEL */}
      {currentScreen === 'landing' && (
        <LandingPage onStart={handleStartLogin} />
      )}

      {currentScreen === 'login' && (
        <LoginPage onBack={handleBackToLanding} />
      )}

      {/* 2. MAIN HUB PORTAL ENCLOSING */}
      {currentScreen === 'portal' && currentUser && (
        <div className="flex-grow flex flex-col relative pb-16 lg:pb-0 w-full">
          {/* Glassy dynamic responsive top navbar */}
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Elegant top ambient offline indicator badge */}
          {!isConnected && (
            <div className="bg-amber-500/95 text-white text-[11px] font-bold py-1.5 px-4 text-center sticky top-[60px] z-40 backdrop-blur-md shadow-sm flex items-center justify-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white block" />
              <span>Sistem Mode Offline Aktif • Menyimpan Kendali di Klasifikasi Lokal</span>
            </div>
          )}

          {/* Core content switch section with fluid mobile app route translations */}
          <main className="flex-grow pt-4 pb-6 px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'study_hub' && <AIStudyHub />}
                {activeTab === 'discord_chat' && <ChatDiscord />}
                {activeTab === 'finance' && <ClassFinance />}
                {activeTab === 'schedules' && <Schedules />}
                {activeTab === 'attendance' && <Attendance />}
                {activeTab === 'focus_zone' && <FocusZone />}
                {activeTab === 'profile' && <ProfilePage />}
                {activeTab === 'student_codes' && <StudentCodesPage />}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Premium iOS/Android custom style Bottom Dashboard Bar */}
          <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Floating dynamic aesthetic watermark credit lines (minimalist human labels) */}
          <footer className="py-6 border-t border-slate-200/40 text-center select-none bg-white/20 backdrop-blur-md hidden lg:block">
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              SEVEN D PREMIUM PORTAL • KELAS UNGGULAN SMPN 2 LAMONGAN
            </p>
          </footer>
        </div>
      )}

      {/* Global Interactive PWA installer prompt (activates gracefully) */}
      <PWAInstallPrompt />

    </div>
  );
};

export default function App() {
  return (
    <ClassHubProvider>
      <AppContent />
    </ClassHubProvider>
  );
}
