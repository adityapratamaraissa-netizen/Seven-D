/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Announcement, KasRecord, DailyMission, Achievement } from '../types';

export const CLASS_NAME = "SEVEN D";
export const SCHOOL_NAME = "SMPN 2 Lamongan";
export const HOMEROOM_TEACHER = "M. WAHYUDIN, S.Pd";
export const SPECIAL_WALI_KELAS_CODE = "WAHYUDIN7D";
export const CLASS_PASSCODE_DEFAULT = "7D-PREMIUM-2026";

// Elegant gradient backgrounds for profile banners
export const PREMIUM_GRADIENTS = [
  "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)",
  "linear-gradient(135deg, #A78BFA 0%, #EC4899 100%)",
  "linear-gradient(135deg, #FDBA74 0%, #EEF2F6 100%)",
  "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
  "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  "linear-gradient(135deg, #F43F5E 0%, #D946EF 100%)",
  "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
];

// Aesthetic SVG avatars as fallback and profile selection options
export const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/bottts/svg?seed=Neko&backgroundColor=c0aede",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Shiba&backgroundColor=b6e3f4",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Dino&backgroundColor=d1f4ff",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aoki&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Kiki&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Zia&backgroundColor=d5ffd9",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Pixel&backgroundColor=f0f0f0"
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 1,
    name: "DACHMAD FERNANDO FEBRIANSYAH",
    role: "Member",
    xp: 2450,
    level: 12,
    streak: 8,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Fernando&backgroundColor=c0aede",
    banner: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
    bio: "Siswa mandiri kelas Seven D. Selalu kompak dan semangat! ⚡",
    customStatus: "Mengatur kedamaian kelas 🛡️",
    badges: ["📌 Pemimpin", "🔥 Streak Master", "💎 Premium Member"]
  },
  {
    id: 2,
    name: "ADLIAN ROMADHON PRADIPTA PRATAMA",
    role: "Member",
    xp: 2200,
    level: 11,
    streak: 6,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Adlian&backgroundColor=b6e3f4",
    banner: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)",
    bio: "Wakil ketua kelas. Selalu siap membantu jalannya kegiatan kelas! 😊",
    customStatus: "Online & Fast Response 💻",
    badges: ["⚙️ Co-Pilot", "⭐ Teladan"]
  },
  {
    id: 3,
    name: "AHMAD FADHIL ARIFANSYAH",
    role: "Member",
    xp: 1350,
    level: 7,
    streak: 4,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Fadhil&backgroundColor=ffdfbf",
    banner: "linear-gradient(135deg, #FDBA74 0%, #EEF2F6 100%)",
    bio: "Siswa SEVEN D yang hobi coding tipis-tipis.",
    badges: ["💻 Code Cadet"]
  },
  {
    id: 4,
    name: "AHMAD HAFIZ MAULANA",
    role: "Member",
    xp: 1500,
    level: 8,
    streak: 5,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Hafiz&backgroundColor=d5ffd9",
    banner: "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)",
    bio: "Pecinta kedamaian, mari belajar bersama. ✨",
    customStatus: "Fokus belajar matematika 📐",
    badges: ["✨ Zen Master"]
  },
  {
    id: 5,
    name: "AHMAD YUSUF HAMDANI",
    role: "Member",
    xp: 1100,
    level: 6,
    streak: 3,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Yusuf&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #F43F5E 0%, #D946EF 100%)",
    bio: "Keep moving forward.",
    badges: ["🚀 Explorer"]
  },
  {
    id: 6,
    name: "AKMAL REIHAN SYAPUTRA",
    role: "Member",
    xp: 1400,
    level: 7,
    streak: 5,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Akmal&backgroundColor=f0f0f0",
    banner: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    bio: "Belajar terus sampai ahli!",
    badges: ["⚡ Swift Learner"]
  },
  {
    id: 7,
    name: "ALDEBARAN NABHAN AFANDI",
    role: "Member",
    xp: 1650,
    level: 9,
    streak: 4,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aldebaran&backgroundColor=c0aede",
    banner: "linear-gradient(135deg, #A78BFA 0%, #EC4899 100%)",
    bio: "Starboy di kelas Seven D 🌌",
    customStatus: "Melihat bintang ☄️",
    badges: ["🌟 Starboy"]
  },
  {
    id: 8,
    name: "ALIFAHRIZA SENOAJI",
    role: "Member",
    xp: 1250,
    level: 6,
    streak: 3,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alifahriza&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #3B82F6 0%, #A78BFA 100%)",
    bio: "Belajar adalah petualangan.",
    badges: ["🧭 Adventurer"]
  },
  {
    id: 9,
    name: "AULIA HADI ANANDITA",
    role: "Bendahara 2",
    xp: 1950,
    level: 10,
    streak: 7,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aulia&backgroundColor=b6e3f4",
    banner: "linear-gradient(135deg, #06B6D4 0%, #10B981 100%)",
    bio: "Bendahara II Seven D. Mari kelola keuangan praktis demi bazzar harian kita! 🪙💵",
    customStatus: "Menyelesaikan PR 📝",
    badges: ["🏆 Scholar", "🌸 Perfect Score"]
  },
  {
    id: 10,
    name: "CALLISTA FIDELLA JESSE",
    role: "Member",
    xp: 1800,
    level: 9,
    streak: 6,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Callista&backgroundColor=ffdfbf",
    banner: "linear-gradient(135deg, #A78BFA 0%, #F43F5E 100%)",
    bio: "Enjoy every second of this school year!",
    badges: ["🎨 Creative Mind"]
  },
  {
    id: 11,
    name: "DINDA RAHMAWATI",
    role: "Member",
    xp: 1150,
    level: 6,
    streak: 2,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Dinda&backgroundColor=f0f0f0",
    banner: "linear-gradient(135deg, #6EE7B7 0%, #06B6D4 100%)",
    bio: "Keep smiling, stay positive.",
    badges: ["☀️ Bright Star"]
  },
  {
    id: 12,
    name: "FAILA QURROTA A’YUN",
    role: "Member",
    xp: 1750,
    level: 9,
    streak: 5,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Faila&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #F43F5E 0%, #FDBA74 100%)",
    bio: "Pecinta seni dan matematika 🎨📉",
    customStatus: "Melukis ide 🎨",
    badges: ["🎨 Artist", "⭐ Teladan"]
  },
  {
    id: 13,
    name: "FARAMIR AIOLIA KAZARINE ILMIAWAN",
    role: "Member",
    xp: 1600,
    level: 8,
    streak: 4,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Faramir&backgroundColor=c0aede",
    banner: "linear-gradient(135deg, #059669 0%, #3B82F6 100%)",
    bio: "Name is a mouthful, but my goals are simple.",
    customStatus: "Fokus mendengarkan musik lofi 🎵",
    badges: ["🎮 Gamer", "🧠 Tech Enthusiast"]
  },
  {
    id: 14,
    name: "HANIFATUSH SHAFIRA",
    role: "Member",
    xp: 1450,
    level: 7,
    streak: 4,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Hanifatush&backgroundColor=b6e3f4",
    banner: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
    bio: "Let your light shine.",
    badges: ["🌱 Keen Learner"]
  },
  {
    id: 15,
    name: "KAYLA AGUSTINA RAMADHANI",
    role: "Member",
    xp: 1300,
    level: 7,
    streak: 3,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Kayla&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #FDBA74 0%, #F43F5E 100%)",
    bio: "Tetap tenang dan terus belajar.",
    badges: ["🌸 Calm Mind"]
  },
  {
    id: 16,
    name: "KEYSHA NOUREN ALFARIZQI MANDA PUTRA",
    role: "Member",
    xp: 1420,
    level: 7,
    streak: 4,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Keysha&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
    bio: "Dream big, study hard.",
    badges: ["🏅 Competitor"]
  },
  {
    id: 17,
    name: "LAIRE ARUNA CIPTA BATARI",
    role: "Member",
    xp: 2150,
    level: 11,
    streak: 7,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Laire&backgroundColor=c0aede",
    banner: "linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%)",
    bio: "Bagian dari barisan siswa berprestasi kelas SEVEN D! 🌟📚",
    customStatus: "Merapikan draf materi 📂",
    badges: ["✒️ Sekretaris Handal", "📋 Organizer", "🔥 Streak Master"]
  },
  {
    id: 18,
    name: "LAQUEENTA KHALISHA PUTRI",
    role: "Member",
    xp: 1250,
    level: 6,
    streak: 3,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Laqueenta&backgroundColor=ffdfbf",
    banner: "linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)",
    bio: "Setinggi bintang di langit.",
    badges: ["🌟 dreamer"]
  },
  {
    id: 19,
    name: "LUNA AURELIA AGATHA",
    role: "Member",
    xp: 1980,
    level: 10,
    streak: 6,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Luna&backgroundColor=b6e3f4",
    banner: "linear-gradient(135deg, #EEF2F6 0%, #A78BFA 100%)",
    bio: "Siswa kreatif Seven D. Senang berkolaborasi dan belajar hal baru! 🌸",
    customStatus: "Update rekap absensi 📅",
    badges: ["📚 Recorder", "✨ Harmony"]
  },
  {
    id: 20,
    name: "MARISCHA NAURA HAYYANI",
    role: "Member",
    xp: 1300,
    level: 7,
    streak: 3,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Marischa&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #A78BFA 0%, #EEF2F6 100%)",
    bio: "Never stop learning because life never stops teaching.",
    badges: ["🍃 Mindful"]
  },
  {
    id: 21,
    name: "NADIA NOOR ANGGRAINI",
    role: "Member",
    xp: 1100,
    level: 6,
    streak: 2,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Nadia&backgroundColor=f0f0f0",
    banner: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)",
    bio: "Hari yang baik untuk belajar hal baru.",
    badges: ["🌸 Gentle Soul"]
  },
  {
    id: 22,
    name: "NAFA SEPTIA",
    role: "Bendahara 1",
    xp: 1380,
    level: 7,
    streak: 4,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Nafa&backgroundColor=d5ffd9",
    banner: "linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)",
    bio: "Bendahara I Seven D. Kelola keuangan kelas kognitif kita secara transparan! 📊💸",
    customStatus: "LatihanCoding 🦾",
    badges: ["🏅 Runner"]
  },
  {
    id: 23,
    name: "NATASYAH ANDIVA PUTRI WINATA",
    role: "Member",
    xp: 1240,
    level: 6,
    streak: 3,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Natasyah&backgroundColor=ffdfbf",
    banner: "linear-gradient(135deg, #F43F5E 0%, #06B6D4 100%)",
    bio: "Aesthetic vibes only 🌻",
    badges: ["🌻 Aesthetic"]
  },
  {
    id: 24,
    name: "NOVIANDRA DWI ALVINA PUTRA",
    role: "Wakil Ketua",
    xp: 1350,
    level: 7,
    streak: 4,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Noviandra&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #A78BFA 0%, #059669 100%)",
    bio: "Wakil Ketua Kelas Seven D. Selalu siap mengayomi dan menyukseskan belajar tuntas! 🤝🔥",
    badges: ["🛡️ Warrior"]
  },
  {
    id: 25,
    name: "RAIHAN FADLUR ROHMAN",
    role: "Member",
    xp: 1470,
    level: 7,
    streak: 5,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Raihan&backgroundColor=c0aede",
    banner: "linear-gradient(135deg, #6EE7B7 0%, #EEF2F6 100%)",
    bio: "Fokus, tenang, dan selesaikan tantangan.",
    customStatus: "Mengerjakan kuis belajar 🧠",
    badges: ["🏁 Challenger"]
  },
  {
    id: 26,
    name: "RAISSA ADITYA PRATAMA",
    role: "Admin",
    xp: 1980,
    level: 10,
    streak: 7,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Raissa&backgroundColor=b6e3f4",
    banner: "all-gradient-custom", // Custom beautiful gradient assigned later
    bio: "Pecinta teknologi masa depan. Let's make learning super interactive! 🤖🎮",
    customStatus: "Developing virtual pet 🐾",
    badges: ["🤖 AI Guru", "🔥 Streak Master", "💎 Backer"]
  },
  {
    id: 27,
    name: "RALLEN DASHA NATHAN ISLAMY",
    role: "Member",
    xp: 1180,
    level: 6,
    streak: 2,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rallen&backgroundColor=ffdfbf",
    banner: "linear-gradient(135deg, #FDBA74 0%, #8B5CF6 100%)",
    bio: "Siswa mandiri yang menyukai teknologi.",
    badges: ["🏎️ Speedster"]
  },
  {
    id: 28,
    name: "ROBIN DWI YUDISTIRA",
    role: "Member",
    xp: 1390,
    level: 7,
    streak: 4,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Robin&backgroundColor=d5ffd9",
    banner: "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
    bio: "Just keep swammering.",
    badges: ["🏹 Ranger"]
  },
  {
    id: 29,
    name: "ROEL ARON FAHAR",
    role: "Member",
    xp: 1300,
    level: 7,
    streak: 3,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Roel&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #F43F5E 0%, #3B82F6 100%)",
    bio: "Setiap hari adalah kesempatan baru.",
    customStatus: "Misi harian piket ✅",
    badges: ["🛡️ Guard"]
  },
  {
    id: 30,
    name: "SALSABILAH RAMADHANI MURTADHO",
    role: "Sekretaris 1",
    xp: 2300,
    level: 11,
    streak: 8,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Salsabilah&backgroundColor=c0aede",
    banner: "linear-gradient(135deg, #6EE7B7 0%, #A78BFA 100%)",
    bio: "Sekretaris I SEVEN D. Rajin mencatat, menata persuratan & absensi kelas! 📑🖊️",
    customStatus: "Menyusun pembukuan kas 🪙",
    badges: ["💰 Finance Lead", "📊 Visualizer", "✨ Amanah"]
  },
  {
    id: 31,
    name: "SITI NAGIA CIKA OKTAVIANI",
    role: "Ketua Kelas",
    xp: 1200,
    level: 6,
    streak: 3,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SitiN&backgroundColor=ffdfbf",
    banner: "linear-gradient(135deg, #D946EF 0%, #FDBA74 100%)",
    bio: "Ketua Kelas Seven D. Bersama memimpin perjuangan, kekompakan, dan prestasi! 👑⚡",
    badges: ["🌸 Kind Heart"]
  },
  {
    id: 32,
    name: "SITI ROHMA",
    role: "Sekretaris 2",
    xp: 1250,
    level: 6,
    streak: 3,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SitiR&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
    bio: "Sekretaris II Seven D. Rapi merangkum agenda & modul belajar digital kita! 📚📝",
    badges: ["⭐ Diligent"]
  },
  {
    id: 33,
    name: "VELLANEA SELLISHA PUTRI",
    role: "Member",
    xp: 2100,
    level: 10,
    streak: 7,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Vellanea&backgroundColor=b6e3f4",
    banner: "linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)",
    bio: "Siswa bersemangat tinggi kelas Seven D. Selalu menebarkan kebahagiaan! 😉",
    customStatus: "Cek rekap kas kelas 💵",
    badges: ["🪙 Ledger Wizard", "🌸 Friendly Counselor"]
  },
  {
    id: 34,
    name: "YUSUF BAYU SAPUTRA",
    role: "Member",
    xp: 1550,
    level: 8,
    streak: 5,
    isOnline: true,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=YusufB&backgroundColor=ffd5dc",
    banner: "linear-gradient(135deg, #10B981 0%, #A78BFA 100%)",
    bio: "Pecinta kedisiplinan dan olahraga. ⚽💨",
    customStatus: "Latihan fisik 🏃",
    badges: ["⚽ Athlete"]
  },
  {
    id: 35,
    name: "ZAHROTUL ATIYYAH FIRDAUS",
    role: "Member",
    xp: 1480,
    level: 7,
    streak: 4,
    isOnline: false,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Zahrotul&backgroundColor=c0aede",
    banner: "linear-gradient(135deg, #EC4899 0%, #A78BFA 100%)",
    bio: "Selalu ceria menyambut mentari pagi.",
    badges: ["☀️ Joyful"]
  }
];

// Detailed registry of school teachers for Seven D
export interface TeacherDetails {
  id: string;
  name: string;
  subject: string;
  avatar: string;
  bio: string;
  phone: string;
  room: string;
}

export const TEACHERS: Record<string, TeacherDetails> = {
  "Bu Hnik": {
    id: "t-hnik",
    name: "Bu Hnik, S.Pd",
    subject: "Pendidikan Kewarganegaraan (PKN)",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Hnik&backgroundColor=ffdfbf",
    bio: "Menginspirasi nilai bela negara, nasionalisme, dan kedewasaan kepemimpinan siswa SEVEN D.",
    phone: "+62 821-4190-7711",
    room: "Kantor Guru"
  },
  "Bu Atik": {
    id: "t-atik",
    name: "Bu Atik, S.Pd",
    subject: "Ilmu Pengetahuan Sosial (IPS)",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Atik&backgroundColor=ffd5dc",
    bio: "Pecinta sejarah dan sosiologi, siap membimbing generasi muda memahami dunia sosial.",
    phone: "+62 857-3023-9988",
    room: "Kantor Guru"
  },
  "Bu Eka": {
    id: "t-eka",
    name: "Bu Eka, S.Psi",
    subject: "Bimbingan Konseling (BK)",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Eka&backgroundColor=d5ffd9",
    bio: "Pendengar yang bijaksana, siap mendampingi tumbuh kembang mental dan emosional siswa.",
    phone: "+62 813-1122-3344",
    room: "Kantor Guru"
  },
  "Pak Al": {
    id: "t-al",
    name: "Pak Al, S.Kom",
    subject: "TI, Coding, dan AI",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=PakAl&backgroundColor=b6e3f4",
    bio: "Instruktur Teknologi Modern & AI. Menjadikan pemrograman terasa mudah, seru, dan kreatif.",
    phone: "+62 856-4211-1925",
    room: "Kantor Guru"
  },
  "Bu Wiwin": {
    id: "t-wiwin",
    name: "Bu Wiwin, S.Pd",
    subject: "Seni Budaya dan Prakarya (SBdP)",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Wiwin&backgroundColor=c0aede",
    bio: "Mengajar kreasi rupa, seni kriya, musik, dan keindahan estetika budaya lokal.",
    phone: "+62 812-7489-0123",
    room: "Kantor Guru"
  },
  "Bu Sri": {
    id: "t-sri",
    name: "Bu Sri, M.Pd",
    subject: "Bahasa Inggris",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sri&backgroundColor=f0f0f0",
    bio: "Bilingual enthusiast! Melatih kefasihan berkomunikasi global secara aktif dan interaktif.",
    phone: "+62 813-8990-2521",
    room: "Kantor Guru"
  },
  "Pak Rizal": {
    id: "t-rizal",
    name: "Pak Rizal, S.Ag",
    subject: "Bahasa Arab",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rizal&backgroundColor=d1f4ff",
    bio: "Menggali asimilasi budaya ketimuran dan kaidah sastra nahwu shorof secara intensif.",
    phone: "+62 822-4589-9110",
    room: "Kantor Guru"
  },
  "Bu Dita": {
    id: "t-dita",
    name: "Bu Dita, S.S",
    subject: "Bahasa Indonesia",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dita&backgroundColor=ffdfbf",
    bio: "Ahli tata bahasa, jurnalisme sekolah, dan pengasah bakat sastra kepenulisan kreatif.",
    phone: "+62 899-7001-1122",
    room: "Kantor Guru"
  },
  "Bu Tya": {
    id: "t-tya",
    name: "Bu Tya, S.Pd",
    subject: "Bahasa Jawa",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Tya&backgroundColor=ffd5dc",
    bio: "Menanamkan nilai unggah-unggih bekti luhur serta melestarikan keindahan budaya aksara Jawa.",
    phone: "+62 878-1234-5678",
    room: "Kantor Guru"
  },
  "Pak Daffa": {
    id: "t-daffa",
    name: "Pak Daffa, M.Si",
    subject: "Ilmu Pengetahuan Alam (IPA)",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Daffa&backgroundColor=d5ffd9",
    bio: "Pecinta riset eksperimental, siap meledakkan rasa penasaran ilmiah dalam fisika dan biologi.",
    phone: "+62 812-2525-4646",
    room: "Kantor Guru"
  },
  "Pak Wahyudin": {
    id: "t-wahyudin",
    name: "M. Wahyudin, S.Pd",
    subject: "Penjas Orkes & Pembina Wali Kelas 7D",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Wahyudin&backgroundColor=b6e3f4",
    bio: "Wali Kelas kebanggaan 7D! Mengolahragakan masyarakat dan memasyarakatkan olahraga sehat.",
    phone: "+62 821-6543-2101",
    room: "Kantor Guru"
  },
  "Bu Wiwik": {
    id: "t-wiwik",
    name: "Bu Wiwik, S.Pd",
    subject: "Matematika",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Wiwik&backgroundColor=ffd5dc",
    bio: "Pakar kalkulus dan geometri yang mengubah matematika menjadi sains angka yang menantang.",
    phone: "+62 811-9293-9495",
    room: "Kantor Guru"
  },
  "Bu Nimas": {
    id: "t-nimas",
    name: "Bu Nimas, S.Pd.I",
    subject: "Pendidikan Agama Islam (PAI)",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Nimas&backgroundColor=c0aede",
    bio: "Pembimbing spiritual, menanamkan akhlakul karimah serta kebajikan beragama sehari-hari.",
    phone: "+62 856-9122-3838",
    room: "Kantor Guru"
  }
};

// Lesson schedules structured elegantly with colors and categorized tags
export const LESSON_SCHEDULE = {
  "Senin": [
    { time: "07:00 - 07:45", name: "Upacara Bendera", room: "Lapangan Utama", icon: "Flag", color: "bg-slate-50 border-slate-300 text-slate-700" },
    { time: "07:45 - 09:15", name: "Pendidikan Kewarganegaraan (PKN)", room: "Ruang Kelas 7D", teacher: "Bu Hnik", icon: "Shield", color: "bg-blue-50/70 border-blue-200 text-blue-700" },
    { time: "09:15 - 09:30", name: "Istirahat Ke-1", room: "Kantin / Selasar", icon: "Coffee", color: "bg-amber-50/50 border-amber-200 text-amber-700" },
    { time: "09:30 - 11:00", name: "Ilmu Pengetahuan Sosial (IPS)", room: "Ruang Kelas 7D", teacher: "Bu Atik", icon: "Globe", color: "bg-orange-50/70 border-orange-200 text-orange-700" },
    { time: "11:00 - 11:45", name: "Bimbingan Konseling (BK)", room: "Ruang BK", teacher: "Bu Eka", icon: "Heart", color: "bg-purple-50/70 border-purple-200 text-purple-700" },
    { time: "11:45 - 12:15", name: "Istirahat Ke-2 / Dzuhur", room: "Masjid / Selasar", icon: "Coffee", color: "bg-amber-50/50 border-amber-200 text-amber-700" },
    { time: "12:15 - 13:45", name: "Teknologi Informatika (TI)", room: "Lab Komputer 02", teacher: "Pak Al", icon: "Cpu", color: "bg-indigo-50/70 border-indigo-200 text-indigo-700" }
  ],
  "Selasa": [
    { time: "07:00 - 08:30", name: "Seni Budaya dan Prakarya (SBdP)", room: "Selasar Seni / Kelas", teacher: "Bu Wiwin", icon: "Palette", color: "bg-pink-50/70 border-pink-200 text-pink-700" },
    { time: "08:30 - 10:00", name: "Bahasa Inggris", room: "Ruang Kelas 7D", teacher: "Bu Sri", icon: "Languages", color: "bg-sky-50/70 border-sky-200 text-sky-700" },
    { time: "10:00 - 10:15", name: "Istirahat Ke-1", room: "Kantin / Selasar", icon: "Coffee", color: "bg-amber-50/50 border-amber-200 text-amber-700" },
    { time: "10:15 - 11:45", name: "Bahasa Arab", room: "Ruang Kelas 7D", teacher: "Pak Rizal", icon: "BookOpen", color: "bg-emerald-50/70 border-emerald-200 text-emerald-700" },
    { time: "11:45 - 13:15", name: "Bahasa Indonesia", room: "Ruang Kelas 7D", teacher: "Bu Dita", icon: "PenTool", color: "bg-teal-50/70 border-teal-200 text-teal-700" }
  ],
  "Rabu": [
    { time: "07:00 - 08:30", name: "Bahasa Indonesia", room: "Ruang Kelas 7D", teacher: "Bu Dita", icon: "PenTool", color: "bg-teal-50/70 border-teal-200 text-teal-700" },
    { time: "08:30 - 10:00", name: "Coding dan AI", room: "Lab Komputer 01", teacher: "Pak Al", icon: "Bot", color: "bg-violet-50/70 border-violet-200 text-violet-700" },
    { time: "10:00 - 10:15", name: "Istirahat Ke-1", room: "Kantin / Selasar", icon: "Coffee", color: "bg-amber-50/50 border-amber-200 text-amber-700" },
    { time: "10:15 - 11:00", name: "Bahasa Jawa", room: "Ruang Kelas 7D", teacher: "Bu Tya", icon: "Library", color: "bg-rose-50/70 border-rose-200 text-rose-700" },
    { time: "11:00 - 11:50", name: "Ilmu Pengetahuan Sosial (IPS)", room: "Ruang Kelas 7D", teacher: "Bu Atik", icon: "Globe", color: "bg-orange-50/70 border-orange-200 text-orange-700" },
    { time: "11:50 - 12:20", name: "Istirahat Ke-2 / Dzuhur", room: "Masjid / Kantin", icon: "Coffee", color: "bg-amber-50/50 border-amber-200 text-amber-700" },
    { time: "12:20 - 13:55", name: "Ilmu Pengetahuan Alam (IPA)", room: "Laboratorium Fisika", teacher: "Pak Daffa", icon: "Atom", color: "bg-cyan-50/70 border-cyan-200 text-cyan-700" }
  ],
  "Kamis": [
    { time: "07:00 - 08:30", name: "Penjas Orkes", room: "Lapangan Olahraga", teacher: "Pak Wahyudin", icon: "Activity", color: "bg-lime-50/70 border-lime-200 text-lime-700" },
    { time: "08:30 - 10:00", name: "Bahasa Inggris", room: "Ruang Kelas 7D", teacher: "Bu Sri", icon: "Languages", color: "bg-sky-50/70 border-sky-200 text-sky-700" },
    { time: "10:00 - 10:15", name: "Istirahat Ke-1", room: "Kantin", icon: "Coffee", color: "bg-amber-50/50 border-amber-200 text-amber-700" },
    { time: "10:15 - 11:45", name: "Matematika", room: "Ruang Kelas 7D", teacher: "Bu Wiwik", icon: "Binary", color: "bg-red-50/70 border-red-200 text-red-700" },
    { time: "11:45 - 12:15", name: "Istirahat Ke-2 / Luhur", room: "Masjid / Selasar", icon: "Coffee", color: "bg-amber-50/50 border-amber-200 text-amber-700" },
    { time: "12:15 - 13:45", name: "Bahasa Indonesia", room: "Ruang Kelas 7D", teacher: "Bu Dita", icon: "PenTool", color: "bg-teal-50/70 border-teal-200 text-teal-700" }
  ],
  "Jumat": [
    { time: "07:00 - 08:15", name: "Ilmu Pengetahuan Alam (IPA)", room: "Laboratorium Biologi", teacher: "Pak Daffa", icon: "Atom", color: "bg-cyan-50/70 border-cyan-200 text-cyan-700" },
    { time: "08:15 - 09:30", name: "Matematika", room: "Ruang Kelas 7D", teacher: "Bu Wiwik", icon: "Binary", color: "bg-red-50/70 border-red-200 text-red-700" },
    { time: "09:30 - 09:45", name: "Istirahat Ke-1", room: "Selasar Kelas", icon: "Coffee", color: "bg-amber-50/50 border-amber-200 text-amber-700" },
    { time: "09:45 - 11:15", name: "Pendidikan Agama Islam (PAI)", room: "Masjid Al-Azhar", teacher: "Bu Nimas", icon: "Moon", color: "bg-indigo-50/70 border-indigo-200 text-indigo-700" }
  ]
};

// Cleaning schedules mapped strictly to requested names of students
export const PIKET_SCHEDULE = {
  "Senin": ["Yusuf Bayu Saputra", "AHMAD YUSUF HAMDANI", "KEYSHA NOUREN ALFARIZQI MANDA PUTRA", "RAISSA ADITYA PRATAMA", "CALLISTA FIDELLA JESSE", "LAIRE ARUNA CIPTA BATARI", "HANIFATUSH SHAFIRA"], // Mapped correctly by nicknames: Bayu, Dani, Noren, Raissa, Della, Aruna, Hani
  "Selasa": ["NATASYAH ANDIVA PUTRI WINATA", "FAILA QURROTA A’YUN", "MARISCHA NAURA HAYYANI", "ROEL ARON FAHAR", "AHMAD HAFIZ MAULANA", "AKMAL REIHAN SYAPUTRA", "FARAMIR AIOLIA KAZARINE ILMIAWAN"], // Nicknames: Natasya, Faila, Rara, Roel, Hafidz, Akmal, Zarin
  "Rabu": ["AHMAD FADHIL ARIFANSYAH", "ALDEBARAN NABHAN AFANDI", "NOVIANDRA DWI ALVINA PUTRA", "DINDA RAHMAWATI", "SITI ROHMA", "NADIA NOOR ANGGRAINI", "SITI NAGIA CIKA OKTAVIANI"], // Nicknames: Fadil, Al, Vian, Dinda, Rohma, Nadia, Tata (Cika is Tata/Nagia)
  "Kamis": ["ALIFAHRIZA SENOAJI", "DACHMAD FERNANDO FEBRIANSYAH", "ZAHROTUL ATIYYAH FIRDAUS", "NAFA SEPTIA", "SITI NAGIA CIKA OKTAVIANI", "SALSABILAH RAMADHANI MURTADHO", "KAYLA AGUSTINA RAMADHANI"], // Nicknames: Eno (Alifahriza Senoaji), Nando, Zahra, Nafa, Cika, Salsa, Kayla
  "Jumat": ["LUNA AURELIA AGATHA", "AULIA HADI ANANDITA", "VELLANEA SELLISHA PUTRI", "ADLIAN ROMADHON PRADIPTA PRATAMA", "AKMAL REIHAN SYAPUTRA", "ROBIN DWI YUDISTIRA", "RALLEN DASHA NATHAN ISLAMY"] // Nicknames: Luna, Aulia, Vella, Tama (Adlian / Tama), Rehan (Akmal Rehan), Robin, Ralen
};

// Initial announcements
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "Tugas Proyek Prakarya Pengolahan Bahan Pangan",
    content: "Diharapkan setiap kelompok mengumpulkan draf proposal pengerjaan proyek prakarya di Hari Selasa minggu depan. Pastikan bahan dan alat ditulis dengan lengkap & jelas. Rincian format proposal ada di grup atau langsung hubungi Ibu Dewi.",
    author: "M. WAHYUDIN, S.Pd",
    role: "Admin",
    date: "2026-05-24",
    category: "PR",
    dueDate: "2026-06-01"
  },
  {
    id: "ann-2",
    title: "Penilaian Akhir Semester (PAS) Berbasis Computer & AI",
    content: "Persiapkan diri kalian untuk simulasi ujian berbasis AI besok Kamis di Lab Komputer. Semua siswa diharap mengaktifkan akun belajar masing-masing dan membawa headset. Semoga sukses tim SEVEN D!",
    author: "M. WAHYUDIN, S.Pd",
    role: "Admin",
    date: "2026-05-23",
    category: "Ujian",
    dueDate: "2026-05-28"
  },
  {
    id: "ann-3",
    title: "Pembayaran Kas Kelas Akhir Bulan Mei",
    content: "Diingatkan bagi teman-teman yang belum melunasi kas kelas bulan Mei (Rp 10.000/minggu) untuk segera melakukan transfer ke bendahara atau membayar tunai ke Salsabilah atau Vellanea. Dana kas akan digunakan untuk sewa kostum bazzar sekolah.",
    author: "SALSABILAH RAMADHANI MURTADHO",
    role: "Bendahara 1",
    date: "2026-05-22",
    category: "Info",
    dueDate: "2026-05-30"
  }
];

// Initial classroom cash flow entries
export const INITIAL_KAS: KasRecord[] = [
  { id: "kas-1", date: "2026-05-01", type: "income", amount: 350000, description: "Kas Mingguan I Mei (Seluruh Siswa)", category: "Kas Rutin", recordedBy: "SALSABILAH RAMADHANI MURTADHO" },
  { id: "kas-2", date: "2026-05-08", type: "income", amount: 330000, description: "Kas Mingguan II Mei", category: "Kas Rutin", recordedBy: "VELLANEA SELLISHA PUTRI" },
  { id: "kas-3", date: "2026-05-12", type: "expense", amount: 150000, description: "Pembelian Penghapus & Sapu Serat Baru kelas", category: "Kebutuhan Kelas", recordedBy: "SALSABILAH RAMADHANI MURTADHO" },
  { id: "kas-4", date: "2026-05-15", type: "income", amount: 340000, description: "Kas Mingguan III Mei", category: "Kas Rutin", recordedBy: "VELLANEA SELLISHA PUTRI" },
  { id: "kas-5", date: "2026-05-20", type: "expense", amount: 200000, description: "Sumbangan Sosial Musibah (Keluarga Siswa)", category: "Sosial", recordedBy: "SALSABILAH RAMADHANI MURTADHO" }
];

// Daily Missions available to students
export const INITIAL_MISSIONS: DailyMission[] = [
  { id: "mis-1", title: "Presensi Pagi Tepat Waktu", description: "Klik tombol hadir di aplikasi absensi sebelum pukul 07.15 WIB.", xpReward: 150, completed: false, type: "absensi" },
  { id: "mis-2", title: "Pomodoro Streak Belajar", description: "Selesaikan 1 sesi fokus belajar (25 menit) di Focus Zone.", xpReward: 200, completed: false, type: "focus" },
  { id: "mis-3", title: "Tantangan AI Study Quiz", description: "Generate kuiz materi kesukaanmu dan jawab dengan akurasi min 80%.", xpReward: 250, completed: false, type: "quiz" },
  { id: "mis-4", title: "Patungan Kas Bulan Ini", description: "Bayar kas bulanan lunas dan konfirmasi pembayaran ke Bendahara.", xpReward: 150, completed: false, type: "kas" }
];

// Aesthetic achievements
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "ach-1", title: "Pahlawan Piket", description: "Menyelesaikan tugasan piket dan mengunggah foto bukti kebersihan.", icon: "Sparkles", xpReward: 300, category: "social" },
  { id: "ach-2", title: "Rajin Pangkal Pandai", description: "Mencapai 100% tingkat kehadiran bulanan.", icon: "CalendarCheck", xpReward: 400, category: "attendance" },
  { id: "ach-3", title: "Sultan Kas Kelas", description: "Selalu membayar kas kelas tepat waktu selama 3 bulan berturut-turut.", icon: "Wallet", xpReward: 300, category: "finance" },
  { id: "ach-4", title: "Brainiac 7D", description: "Menyelesaikan 10 AI quiz dengan nilai sempurna.", icon: "Award", xpReward: 500, category: "learning" },
  { id: "ach-5", title: "Streak Champion", description: "Mencapai streak belajar harian konsisten selama lebih dari 7 hari.", icon: "Flame", xpReward: 500, category: "learning" }
];

// Daily Motivation Quotes
export const DAILY_QUOTES = [
  { text: "Pendidikan adalah senjata paling mematikan di dunia, karena dengan itu Anda bisa mengubah dunia.", author: "Nelson Mandela" },
  { text: "Jangan biarkan apa yang tidak bisa kamu lakukan mengganggu apa yang bisa kamu lakukan.", author: "John Wooden" },
  { text: "Masa depan adalah milik mereka yang percaya pada keindahan mimpi mereka.", author: "Eleanor Roosevelt" },
  { text: "Sukses bukanlah kunci kebahagian. Kebahagiaanlah kunci kesuksesan.", author: "Albert Schweitzer" },
  { text: "Hiduplah seolah-olah kamu akan mati besok. Belajarlah seolah-olah kamu akan hidup selamanya.", author: "Mahatma Gandhi" },
  { text: "Teknologi bukanlah apa-apa. Hal yang penting adalah kamu memiliki kepercayaan pada orang-orang.", author: "Steve Jobs" }
];
