/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClassHubProvider, useClassHub } from './context/ClassHubContext';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';

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
  const { currentUser } = useClassHub();

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
    <div className="min-h-screen bg-[#F4F6FA] select-none text-slate-800 antialiased flex flex-col justify-between">
      
      {/* 1. OUT-OF-PORTAL ROUTING PANEL */}
      {currentScreen === 'landing' && (
        <LandingPage onStart={handleStartLogin} />
      )}

      {currentScreen === 'login' && (
        <LoginPage onBack={handleBackToLanding} />
      )}

      {/* 2. MAIN HUB PORTAL ENCLOSING */}
      {currentScreen === 'portal' && currentUser && (
        <div className="flex-grow flex flex-col min-h-screen">
          {/* Glassy dynamic responsive top navbar */}
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Core content switch section */}
          <main className="flex-grow pb-16">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'study_hub' && <AIStudyHub />}
            {activeTab === 'discord_chat' && <ChatDiscord />}
            {activeTab === 'finance' && <ClassFinance />}
            {activeTab === 'schedules' && <Schedules />}
            {activeTab === 'attendance' && <Attendance />}
            {activeTab === 'focus_zone' && <FocusZone />}
            {activeTab === 'profile' && <ProfilePage />}
            {activeTab === 'student_codes' && <StudentCodesPage />}
          </main>

          {/* Floating dynamic aesthetic watermark credit lines (minimalist human labels) */}
          <footer className="py-6 border-t border-slate-200/40 text-center select-none bg-white/20 backdrop-blur-md">
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              SEVEN D PREMIUM PORTAL • KELAS UNGGULAN SMPN 2 LAMONGAN
            </p>
          </footer>
        </div>
      )}

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
