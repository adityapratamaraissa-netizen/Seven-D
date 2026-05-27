/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  User, Award, Edit, Check, Star, Shield, 
  Sparkles, Compass, Flame, ArrowRight, Heart,
  Camera, Image as ImageIcon, Loader2, Upload, AlertCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    achievements,
    updateProfile,
    addXP,
    classLogo,
    changeClassLogo
  } = useClassHub();

  const [isEditing, setIsEditing] = useState(false);
  const [nickName, setNickName] = useState(currentUser?.name || '');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || 'Siswa tangguh Seven D SMPN 2 Lamongan 🌟');
  const [profileStatus, setProfileStatus] = useState(currentUser?.customStatus || 'Ready to Learn 🔥');
  
  // High fidelity image selection and crop-processing states
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(currentUser?.avatar || null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(currentUser?.banner || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Hanya mendukung format JPG, PNG, WEBP, atau SVG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file logo terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setUploadError('Kesalahan memproses berkas gambar.');
    };

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => {
        if (file.type === 'image/svg+xml') {
          const rawSvgData = readerEvent.target?.result as string;
          changeClassLogo(rawSvgData);
          addXP(40, "Menyesuaikan Logo Kelas dengan SVG kustom");
        } else {
          setUploadError('Berkas gambar rusak atau tidak dapat disajikan.');
        }
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Canvas Context Not Found');
          }

          const targetSize = 256;
          canvas.width = targetSize;
          canvas.height = targetSize;

          const minDimension = Math.min(img.width, img.height);
          const sourceX = (img.width - minDimension) / 2;
          const sourceY = (img.height - minDimension) / 2;

          ctx.drawImage(img, sourceX, sourceY, minDimension, minDimension, 0, 0, targetSize, targetSize);
          const base64Data = canvas.toDataURL('image/png', 0.9);
          changeClassLogo(base64Data);
          addXP(40, "Menampilkan foto kustom sebagai Logo Kelas");
        } catch (err) {
          changeClassLogo(readerEvent.target?.result as string);
        }
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Constants for banner color gradient fallbacks
  const BANNER_PRESETS = [
    { name: "Cosmic Sky", val: "from-blue-500 via-indigo-500 to-purple-600" },
    { name: "Cyber Violet", val: "from-purple-600 via-pink-500 to-rose-500" },
    { name: "Neo Emerald", val: "from-teal-400 via-emerald-500 to-green-600" },
    { name: "Sunset Gold", val: "from-amber-400 via-orange-500 to-rose-500" }
  ];

  if (!currentUser) return null;

  // Process image compression, center crop, and resize client-side inside canvas
  const handleImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Support JPG, PNG, WEBP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Hanya mendukung file gambar dengan format JPG, PNG, atau WEBP.');
      return;
    }

    // Limit maximum file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimal ukuran file adalah 5MB.');
      return;
    }

    if (type === 'avatar') {
      setIsUploadingAvatar(true);
    } else {
      setIsUploadingBanner(true);
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setUploadError('Terjadi kesalahan saat membaca file gambar.');
      setIsUploadingAvatar(false);
      setIsUploadingBanner(false);
    };

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => {
        setUploadError('File gambar rusak atau tidak dapat di-parse.');
        setIsUploadingAvatar(false);
        setIsUploadingBanner(false);
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Canvas context has failed.');
          }

          if (type === 'avatar') {
            // Cropping to a perfect aspect ratio square - resized to 300x300 pixels
            const targetSize = 300;
            canvas.width = targetSize;
            canvas.height = targetSize;

            const minDimension = Math.min(img.width, img.height);
            const sourceX = (img.width - minDimension) / 2;
            const sourceY = (img.height - minDimension) / 2;

            ctx.drawImage(img, sourceX, sourceY, minDimension, minDimension, 0, 0, targetSize, targetSize);
            const base64Data = canvas.toDataURL('image/jpeg', 0.85);
            setPreviewAvatar(base64Data);
          } else {
            // Cropping to widescreen banner ratio - resized to 800x300 pixels
            const targetWidth = 800;
            const targetHeight = 300;
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const targetAspect = targetWidth / targetHeight;
            const currentAspect = img.width / img.height;

            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = img.width;
            let sourceHeight = img.height;

            if (currentAspect > targetAspect) {
              sourceWidth = img.height * targetAspect;
              sourceX = (img.width - sourceWidth) / 2;
            } else {
              sourceHeight = img.width / targetAspect;
              sourceY = (img.height - sourceHeight) / 2;
            }

            ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
            const base64Data = canvas.toDataURL('image/jpeg', 0.82);
            setPreviewBanner(base64Data);
          }
        } catch (err) {
          setUploadError('Gagal memproses crop otomatis gambar.');
        } finally {
          setIsUploadingAvatar(false);
          setIsUploadingBanner(false);
        }
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save nickname, bio, custom status, and cropped image string assets directly in server persistent db
    updateProfile(
      nickName, 
      profileBio, 
      profileStatus, 
      previewAvatar || currentUser.avatar, 
      previewBanner || currentUser.banner
    );
    
    setIsEditing(false);
    
    // Reward XP for visual adjustments
    addXP(50, "Memodifikasi profil kustom dengan sukses");
  };

  const renderBannerBg = (bannerVal: string) => {
    if (bannerVal.startsWith('data:image') || bannerVal.startsWith('http')) {
      return { backgroundImage: `url(${bannerVal})`, backgroundPosition: 'center', backgroundSize: 'cover' };
    }
    return {};
  };

  const getBannerClassName = (bannerVal: string) => {
    if (bannerVal.startsWith('data:image') || bannerVal.startsWith('http')) {
      return "h-36 sm:h-44 relative overflow-hidden transition-all duration-500 rounded-t-3xl";
    }
    return `h-36 sm:h-44 bg-gradient-to-r ${bannerVal} relative overflow-hidden transition-all duration-500 rounded-t-3xl`;
  };

  const unlockedBadges = achievements.filter(a => a.unlocked);

  const currentLevelThreshold = 200;
  const currentLeveXp = currentUser.xp % currentLevelThreshold;
  const progressPercent = Math.min(100, Math.floor((currentLeveXp / currentLevelThreshold) * 100));

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6 font-sans">
      
      {/* Hidden File Inputs for Interactive Camera Prompts */}
      <input 
        id="avatar-hidden-upload"
        type="file" 
        ref={avatarInputRef}
        onChange={(e) => handleImageFileChange(e, 'avatar')}
        accept="image/png, image/jpeg, image/webp"
        className="hidden" 
      />
      
      <input 
        id="banner-hidden-upload"
        type="file" 
        ref={bannerInputRef}
        onChange={(e) => handleImageFileChange(e, 'banner')}
        accept="image/png, image/jpeg, image/webp"
        className="hidden" 
      />

      {/* ERROR FEEDBACK BAR */}
      {uploadError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/90 border border-red-200 text-red-750 text-xs px-4 py-3 rounded-2xl flex items-center space-x-2 text-left"
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{uploadError}</span>
        </motion.div>
      )}

      {/* 1. VISUAL IDENTIFY GLASS CARD */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 overflow-hidden shadow-xs relative">
        
        {/* Dynamic picked Banner background with fallback presets */}
        <div 
          className={getBannerClassName(previewBanner || currentUser.banner || 'from-blue-500 via-indigo-500 to-purple-600')} 
          style={renderBannerBg(previewBanner || currentUser.banner || 'from-blue-500 via-indigo-500 to-purple-600')}
        >
          {/* Subtle sparkles ambient circles */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-black/10 blur-xl" />

          {/* Banner camera trigger overlay */}
          <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 text-white z-10">
            <button 
              id="upload-banner-btn"
              onClick={() => bannerInputRef.current?.click()}
              className="flex items-center space-x-1.5 hover:text-indigo-200 transition-colors text-[10px] font-black uppercase tracking-wider px-1.5"
              title="Ganti Foto Banner"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Unggah Banner</span>
            </button>
            {isUploadingBanner && <Loader2 className="w-3.5 h-3.5 text-white animate-spin ml-1" />}
          </div>

          {/* Quick preset selector buttons floating at top right */}
          <div className="absolute right-3.5 top-3.5 flex items-center gap-1.5 bg-black/25 backdrop-blur-md p-1.5 rounded-xl border border-white/10 z-10">
            <span className="text-[8px] text-white/70 uppercase font-bold tracking-wider mr-1 hidden xs:inline">Presets:</span>
            {BANNER_PRESETS.map((bp) => (
              <button
                key={bp.name}
                id={`preset-banner-${bp.name.toLowerCase().replace(' ', '-')}`}
                onClick={() => setPreviewBanner(bp.val)}
                className={`w-4 h-4 rounded-full bg-gradient-to-r ${bp.val} border transition-all duration-300 hover:scale-125 ${
                  (previewBanner || currentUser.banner || 'from-blue-500 via-indigo-500 to-purple-600') === bp.val ? 'border-white scale-110' : 'border-transparent'
                }`}
                title={bp.name}
              />
            ))}
          </div>
        </div>

        {/* Main profile items detail alignment */}
        <div className="px-6 pb-6 pt-1 flex flex-col sm:flex-row items-center sm:items-end gap-5 -translate-y-8 sm:-translate-y-12">
          
          {/* Avatar Canvas with modern camera hover overlays and pulsing online indicator */}
          <div className="relative shrink-0 group/avatar">
            <div 
              id="avatar-frame-clickable"
              onClick={() => avatarInputRef.current?.click()}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white bg-slate-50 shadow-md flex items-center justify-center overflow-hidden cursor-pointer relative"
              title="Klik untuk Ganti Foto Profil"
            >
              <img
                src={previewAvatar || currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover transition-transform group-hover/avatar:scale-105 duration-300"
                referrerPolicy="no-referrer"
              />
              
              {/* Instagram & Discord-Style Hover Camera overlay */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                <Camera className="w-5 h-5 text-white mb-0.5 drop-shadow-sm" />
                <span className="text-[9px] text-white font-extrabold uppercase tracking-wider font-sans">Ganti Foto</span>
              </div>
              
              {/* Compressing/Loading Spinner overlay */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10">
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Glowing online indicator beacon */}
            <div className="absolute top-1 right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </div>

            {/* Level Bubble index badge */}
            <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white border-2 border-white rounded-xl text-[10px] font-black font-mono px-2 py-0.5 shadow-sm">
              Lv {currentUser.level}
            </span>
          </div>

          {/* Details header */}
          <div className="text-center sm:text-left flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pt-6 sm:pt-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-none truncate">
                {currentUser.name}
              </h1>
              {/* Role Indicator label */}
              <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/30 px-2.5 py-0.5 rounded-full uppercase inline-block font-mono max-w-max mx-auto sm:mx-0">
                {currentUser.role}
              </span>

              {/* Instant status bubble */}
              <div className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-250 py-0.5 px-2 rounded-full text-[9.5px] font-bold mx-auto sm:mx-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 animate-pulse shrink-0" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* Sub headers with Custom Status */}
            <p className="text-xs text-slate-400 font-mono font-medium mt-1 truncate">
              Absen #{currentUser.id} • SMPN 2 Lamongan {profileStatus ? `• Status: "${profileStatus}"` : ''}
            </p>

            {/* Show visual Achievements badges directly in user identification card */}
            {unlockedBadges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5 justify-center sm:justify-start">
                {unlockedBadges.map((badge) => (
                  <span 
                    key={badge.id}
                    className="inline-flex items-center justify-center bg-indigo-50 border border-indigo-150/40 rounded-full w-6.5 h-6.5 text-xs shadow-xs"
                    title={`${badge.title}: ${badge.description}`}
                  >
                    {badge.icon}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Edit togglers and Foto Profile Change Trigger button */}
          <div className="shrink-0 pt-3 sm:pt-0 flex flex-col sm:flex-col gap-2 w-full sm:w-auto">
            {/* Real change photo trigger */}
            <button
              id="ganti-foto-profile-btn"
              onClick={() => avatarInputRef.current?.click()}
              className="flex items-center justify-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/30 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Ganti Foto Profil</span>
            </button>
            
            <button
              id="toggle-edit-profile-btn"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/20 text-slate-700 px-3.5 py-2 rounded-2xl text-xs font-semibold active:scale-[0.97] transition-all"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Batal Mengubah' : 'Ubah Detail Profil'}</span>
            </button>
          </div>
        </div>

        {/* Level XP Progress details summary strip */}
        <div className="px-6 pb-6 -mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-left border-t border-slate-100 pt-5">
          <div className="space-y-1 w-full md:max-w-xs text-center md:text-left">
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-semibold">Tingkat Kemajuan Kognitif</span>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>XP Level {currentUser.level}</span>
              <span className="font-mono text-[10px] text-slate-400">({currentLeveXp}/200 XP)</span>
            </div>
            {/* Outer Progress track */}
            <div className="w-full h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden border">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Core total XP numbers showcase */}
          <div className="flex gap-4 items-center">
            <div className="text-center bg-blue-50/50 border border-blue-200/20 rounded-2xl p-3 px-5">
              <span className="text-xl font-black text-blue-700 font-mono">{currentUser.xp}</span>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Total XP</p>
            </div>
            <div className="text-center bg-amber-50/50 border border-amber-200/20 rounded-2xl p-3 px-5">
              <span className="text-xl font-black text-amber-600 font-mono">{unlockedBadges.length}</span>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-0.5">Badges</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1.5. VISUAL CLASS LOGO MANAGER CARD */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs text-left space-y-4">
        <div>
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">Grafis Identitas Kelas</span>
          <h3 className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <span>Kustomisasi Logo SEVEN D</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
            Ganti logo default "7D" di pojok kiri atas dan tampilan dasar dengan lambang atau logo kelas buatan Anda sendiri!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100/80">
          {/* Logo current preview sphere */}
          <div className="relative group/logo shadow-sm rounded-2xl overflow-hidden border border-slate-100 bg-white">
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden relative">
              <img 
                src={classLogo} 
                alt="Logo Kelas Terpasang" 
                className="w-full h-full object-cover transition-transform group-hover/logo:scale-105 duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.className = "w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl font-mono";
                    parent.innerHTML = '7D';
                  }
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 border-2 border-white shadow-xs">
              <Check className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="flex-1 space-y-3.5 text-center sm:text-left">
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-700">Unggah Logo Kustom Anda</h4>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">Format SVG, PNG, JPG, atau WEBP. Rekomendasi rasio persegi (1:1) agar tampak presisi di seluruh layout dashboard.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <input 
                id="logo-hidden-upload"
                type="file" 
                onChange={handleLogoFileChange}
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => document.getElementById('logo-hidden-upload')?.click()}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-500/15 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Foto Logo</span>
              </button>

              {classLogo !== '/icon.svg' && (
                <button
                  type="button"
                  onClick={() => changeClassLogo('/icon.svg')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kembalikan Default</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDITING FORMS AND REALTIME PREVIEW SAVING SHEET */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs text-left"
          >
            <h3 className="text-sm font-bold text-slate-800">Ubah Identitas Belajar</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sesuaikan panggilan sapaan, tentang diri, serta upload visual profile baru.</p>

            <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
              
              {/* Temporary Visual Previews status row */}
              {(previewAvatar !== currentUser.avatar || previewBanner !== currentUser.banner) && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-700 font-medium flex items-center justify-between">
                  <span>✨ Anda mengunggah berkas visual baru! Tekan "Simpan rincian" di bawah untuk mempublikasikannya ke kelas.</span>
                  <button 
                    type="button"
                    onClick={() => {
                      setPreviewAvatar(currentUser.avatar);
                      setPreviewBanner(currentUser.banner);
                    }}
                    className="text-[10px] text-indigo-800 bg-indigo-100 hover:bg-indigo-150 px-2.5 py-1 rounded-xl transition-colors font-bold"
                  >
                    Reset Visual
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Nama Panggilan / Nickname</label>
                  <input
                    type="text"
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-slate-250 focus:border-indigo-400 focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Status Aktivitas / Custom Status</label>
                  <input
                    type="text"
                    value={profileStatus}
                    onChange={(e) => setProfileStatus(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-slate-250 focus:border-indigo-400 focus:bg-white rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                    placeholder="Contoh: Belajar Sains 🧪"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Profil Bio (Tentang Saya)</label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  rows={2.5}
                  className="w-full bg-[#FAFAFA] border border-slate-250 focus:border-indigo-400 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-700 outline-none resize-none leading-relaxed"
                  placeholder="Ceritakan tentang cita-cita atau hobi belajar Anda harian..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  id="save-profile-btn"
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-transform"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. ACHIEVEMENTS BADGES CAROUSEL SHOWCASE */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs text-left">
        <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block">Galeri Prestasi</span>
        <h3 className="text-base font-bold text-slate-800 mt-1 flex items-center gap-1.5">
          <Award className="w-5 h-5 text-indigo-500" />
          <span>Sertifikat & Badges Unlocked [7D Class Hub]</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">Selesaikan kuis, bayar kas kelas, dan laksanakan piket harian untuk memicu pembukaan otomatis visual lencana prestasi.</p>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {achievements.map((item) => {
            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-3xl border flex items-start gap-4 transition-all duration-300 relative overflow-hidden group/badge ${
                  item.unlocked 
                    ? 'bg-gradient-to-tr from-slate-50 to-white hover:from-slate-100 hover:to-white border-indigo-200/50' 
                    : 'bg-slate-100/30 border-slate-200/20 text-slate-400'
                }`}
              >
                {/* Badge visual icon circles */}
                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  item.unlocked 
                    ? 'bg-indigo-50 border border-indigo-150 text-indigo-600 shadow-sm animate-pulse' 
                    : 'bg-slate-100 text-slate-400 select-none grayscale'
                }`}>
                  {item.icon}
                </span>

                <div className="min-w-0 flex-grow text-left">
                  <h4 className={`text-xs font-black truncate leading-none ${item.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed font-sans">{item.description}</p>
                  
                  {item.unlocked && (
                    <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-2 font-mono">
                      UNLOCKED ✓
                    </span>
                  )}
                </div>

                {/* Subtle shine spark hover effects */}
                {item.unlocked && (
                  <Sparkles className="w-3 h-3 text-indigo-300 absolute top-3.5 right-3.5 opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
