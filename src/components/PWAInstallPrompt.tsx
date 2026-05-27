import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone, ArrowBigDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detect if the app is already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      console.log('[PWA] Already running in standalone (installed). Prompt omitted.');
      return;
    }

    // 2. Check if the user has dismissed it recently (cooldown)
    const dismissedTime = localStorage.getItem('7d_pwa_dismissed_time');
    if (dismissedTime) {
      const parsedTime = parseInt(dismissedTime, 10);
      const now = Date.now();
      // Cooldown of 2 hours to avoid spamming
      if (now - parsedTime < 2 * 60 * 60 * 1000) {
        return;
      }
    }

    // 3. Listen for the native Android/Chrome install triggers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Give a slight delay before popping up smoothly for a premium feel
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. iOS Detection (iOS Safari doesn't support beforeinstallprompt)
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      setTimeout(() => {
        setIsVisible(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native browser prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install choice outcome: ${outcome}`);

    // We no longer need the prompt
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Persist dismiss cooldown
    localStorage.setItem('7d_pwa_dismissed_time', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="pwa-install-prompt"
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:w-[400px] bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_20px_50px_rgba(59,130,246,0.12)] z-100 backdrop-blur-xl bg-white/95"
        >
          {/* Top light bar accent */}
          <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-b-md" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            {/* Beautiful App Icon Preview */}
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <span className="text-white font-black text-base font-mono">7D</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">Instal SEVEN D App</h4>
                <div className="flex items-center gap-0.5 text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                  <Sparkles className="w-2 md:w-2.5 h-2 md:h-2.5 shrink-0" />
                  <span>PREMIUM</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                {isIOS 
                  ? 'Mudah diakses! Klik ikon Bagikan (Share) lalu pilih "Tambahkan ke Layar Utama" pada ponsel Anda.' 
                  : 'Unduh portal kelas ke layar utama HP Anda dengan satu klik. Akses instan, super lancar, dan support offline mode.'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2.5">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 text-xs text-slate-400 font-semibold hover:text-slate-600"
            >
              Nanti Saja
            </button>
            
            {!isIOS ? (
              <button
                onClick={handleInstallClick}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-500/25 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pasang Sekarang</span>
              </button>
            ) : (
              <div className="text-[10px] text-neutral-500 flex items-center gap-1 font-medium bg-neutral-50 px-2.5 py-1.5 rounded-xl border border-neutral-100">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Lihat Safari Share Menu</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
