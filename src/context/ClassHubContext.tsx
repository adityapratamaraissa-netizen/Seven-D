/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  Announcement,
  KasRecord,
  AttendanceRecord,
  ChatMessage,
  DailyMission,
  Achievement,
  VirtualPet
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_KAS,
  INITIAL_MISSIONS,
  INITIAL_ACHIEVEMENTS,
  DAILY_QUOTES,
  CLASS_PASSCODE_DEFAULT,
  SPECIAL_WALI_KELAS_CODE
} from '../data/students';

interface ClassHubContextType {
  currentUser: Student | null;
  isTeacherMode: boolean;
  students: Student[];
  announcements: Announcement[];
  kasRecords: KasRecord[];
  attendanceRecords: AttendanceRecord[];
  missions: DailyMission[];
  achievements: Achievement[];
  chatMessages: ChatMessage[];
  currentPet: VirtualPet;
  dailyStreak: number;
  hasSpunToday: boolean;
  activeQuote: { text: string; author: string };
  piketStatusCurrentDay: { [studentName: string]: boolean };
  activeLofiTrack: string;
  isFocusModeActive: boolean;

  // Actions
  loginSiswa: (name: string, id: number, code: string) => boolean;
  loginWaliKelas: (code: string) => boolean;
  logout: () => void;
  addXP: (amount: number, reason: string) => void;
  incrementStreak: () => void;
  claimSpinReward: () => { label: string; xp: number };
  toggleMission: (id: string) => void;
  addAnnouncement: (title: string, content: string, category: Announcement['category'], dueDate?: string) => void;
  deleteAnnouncement: (id: string) => void;
  addKas: (type: 'income' | 'expense', amount: number, description: string, category: string) => void;
  markAttendance: (status: AttendanceRecord['status']) => void;
  sendChatMessage: (content: string, attachment?: ChatMessage['attachment'], replyTo?: ChatMessage['replyTo']) => void;
  reactToMessage: (msgId: string, emoji: string) => void;
  deleteMessage: (msgId: string) => void;
  completePiket: (studentName: string, notes: string, imageBase64?: string) => void;
  updatePetName: (name: string) => void;
  evolvePet: () => void;
  solveAIQuizComplete: (scorePercentage: number) => void;
  generateAllCodes: () => void;
  resetStudentCode: (id: number, code?: string) => void;
}

const ClassHubContext = createContext<ClassHubContextType | undefined>(undefined);

export const ClassHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Helper to get default unique code [nomor absen][tahun kelas] ---
  const getDefaultLoginCode = (id: number): string => {
    const paddedId = String(id).padStart(2, '0');
    return `${paddedId}2026`;
  };

  // --- Persistent LocalState ---
  const [currentUser, setCurrentUser] = useState<Student | null>(() => {
    const cached = localStorage.getItem('7d_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Student;
        if (parsed.id > 0) {
          const match = INITIAL_STUDENTS.find(s => s.id === parsed.id);
          if (match) {
            const loginCodeVal = parsed.loginCode || match.loginCode || getDefaultLoginCode(match.id);
            return {
              ...parsed,
              name: match.name,
              role: match.role,
              bio: match.bio,
              loginCode: loginCodeVal
            };
          }
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(() => {
    return localStorage.getItem('7d_teacher') === 'true';
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const cached = localStorage.getItem('7d_students');
    let loaded: Student[] = INITIAL_STUDENTS;
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Student[];
        loaded = parsed.map(cachedStudent => {
          const match = INITIAL_STUDENTS.find(s => s.id === cachedStudent.id);
          if (match) {
            return {
              ...cachedStudent,
              name: match.name,
              role: match.role,
              bio: match.bio,
              loginCode: cachedStudent.loginCode || match.loginCode || getDefaultLoginCode(match.id)
            };
          }
          return cachedStudent;
        });
      } catch (e) {
        loaded = INITIAL_STUDENTS;
      }
    }
    return loaded.map(s => ({
      ...s,
      loginCode: s.loginCode || getDefaultLoginCode(s.id)
    }));
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const cached = localStorage.getItem('7d_announcements');
    return cached ? JSON.parse(cached) : INITIAL_ANNOUNCEMENTS;
  });

  const [kasRecords, setKasRecords] = useState<KasRecord[]>(() => {
    const cached = localStorage.getItem('7d_kas');
    return cached ? JSON.parse(cached) : INITIAL_KAS;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const cached = localStorage.getItem('7d_attendance');
    return cached ? JSON.parse(cached) : [];
  });

  const [missions, setMissions] = useState<DailyMission[]>(() => {
    const cached = localStorage.getItem('7d_missions');
    return cached ? JSON.parse(cached) : INITIAL_MISSIONS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const cached = localStorage.getItem('7d_achievements');
    return cached ? JSON.parse(cached) : INITIAL_ACHIEVEMENTS;
  });

  // Comprehensive chat starter simulating live conversation history
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const cached = localStorage.getItem('7d_chats');
    if (cached) return JSON.parse(cached);

    return [
      {
        id: "msg-1",
        studentId: 31,
        studentName: "SITI NAGIA CIKA OKTAVIANI",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SitiN&backgroundColor=ffdfbf",
        role: "Ketua Kelas" as const,
        content: "Halo guys! Selamat datang di Portal Premium SEVEN D. Jangan lupa absensi pagi ya! 👑⚡",
        timestamp: "06:45",
        reactions: [{ emoji: "🔥", count: 4, users: [24, 30, 22, 26] }]
      },
      {
        id: "msg-2",
        studentId: 30,
        studentName: "SALSABILAH RAMADHANI MURTADHO",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Salsabilah&backgroundColor=c0aede",
        role: "Sekretaris 1" as const,
        content: "Bener banget cika! Semua rekap absen & agenda piket per minggu depan sudah aku & Rohma rekap di tab Jadwal ya guys. Silakan dicek!",
        timestamp: "06:50",
        reactions: [{ emoji: "👍", count: 3, users: [24, 31, 26] }]
      },
      {
        id: "msg-3",
        studentId: 22,
        studentName: "NAFA SEPTIA",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Nafa&backgroundColor=d5ffd9",
        role: "Bendahara 1" as const,
        content: "Bagi yang belum mencicil kas kelas bulan Mei (Rp 10.000/minggu), tolong segera setor ke aku atau Aulia ya. Biar pembukuan kita mulus 📊💸",
        timestamp: "06:55",
        reactions: [{ emoji: "💵", count: 2, users: [31, 9] }]
      },
      {
        id: "msg-4",
        studentId: 26,
        studentName: "RAISSA ADITYA PRATAMA",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Raissa&backgroundColor=b6e3f4",
        role: "Admin" as const,
        content: "Portalnya sudah live guys! Fitur AI Study Assistant dibekali model Gemini terbaru untuk membantu jawab PR & kuis kognitif harian. Selamat belajar! 🤖🚀",
        timestamp: "07:05",
        reactions: [{ emoji: "❤️", count: 5, users: [31, 24, 30, 22, 9] }]
      }
    ];
  });

  const [currentPet, setCurrentPet] = useState<VirtualPet>(() => {
    const cached = localStorage.getItem('7d_pet');
    return cached ? JSON.parse(cached) : {
      name: "Chibi Nano",
      type: "Neko" as const,
      level: 1,
      xp: 20,
      status: "Happy" as const,
      streakRequiredForNextLevel: 5
    };
  });

  const [hasSpunToday, setHasSpunToday] = useState<boolean>(() => {
    return localStorage.getItem('7d_has_spun') === 'true';
  });

  const [dailyStreak, setDailyStreak] = useState<number>(() => {
    return Number(localStorage.getItem('7d_global_streak') || '3');
  });

  const [piketStatusCurrentDay, setPiketStatusCurrentDay] = useState<{ [studentName: string]: boolean }>(() => {
    const cached = localStorage.getItem('7d_piket_status');
    return cached ? JSON.parse(cached) : {};
  });

  const [activeQuote] = useState<{ text: string; author: string }>(() => {
    const todayIndex = new Date().getDate() % DAILY_QUOTES.length;
    return DAILY_QUOTES[todayIndex];
  });

  const [activeLofiTrack] = useState<string>("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
  const [isFocusModeActive] = useState<boolean>(false);

  // Sync state with local storage on updates
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('7d_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('7d_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('7d_teacher', String(isTeacherMode));
  }, [isTeacherMode]);

  useEffect(() => {
    localStorage.setItem('7d_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('7d_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('7d_kas', JSON.stringify(kasRecords));
  }, [kasRecords]);

  useEffect(() => {
    localStorage.setItem('7d_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('7d_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('7d_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('7d_chats', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('7d_pet', JSON.stringify(currentPet));
  }, [currentPet]);

  useEffect(() => {
    localStorage.setItem('7d_has_spun', String(hasSpunToday));
  }, [hasSpunToday]);

  useEffect(() => {
    localStorage.setItem('7d_global_streak', String(dailyStreak));
  }, [dailyStreak]);

  useEffect(() => {
    localStorage.setItem('7d_piket_status', JSON.stringify(piketStatusCurrentDay));
  }, [piketStatusCurrentDay]);


  // --- AUTH ACTIONS ---
  const loginSiswa = (name: string, id: number, code: string): boolean => {
    // Strict verification: find student by matching id
    const candidate = students.find(s => s.id === id);
    if (!candidate) return false;

    // Direct exact name matches / validation
    const candidateNameLower = candidate.name.toLowerCase().trim();
    const inputNameLower = name.toLowerCase().trim();
    if (candidateNameLower !== inputNameLower && !candidateNameLower.includes(inputNameLower) && !inputNameLower.includes(candidateNameLower)) {
      return false;
    }

    const correctCode = candidate.loginCode || getDefaultLoginCode(id);
    if (code === correctCode) {
      const updated = { ...candidate, isOnline: true, loginCode: correctCode };
      setCurrentUser(updated);
      setIsTeacherMode(false);
      setStudents(prev => prev.map(s => s.id === id ? updated : s));
      return true;
    }
    return false;
  };

  const generateAllCodes = () => {
    setStudents(prev => prev.map(s => ({
      ...s,
      loginCode: getDefaultLoginCode(s.id)
    })));
  };

  const resetStudentCode = (id: number, customCode?: string) => {
    const targetCode = customCode || getDefaultLoginCode(id);
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, loginCode: targetCode };
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return s;
    }));
  };

  const loginWaliKelas = (code: string): boolean => {
    if (code === SPECIAL_WALI_KELAS_CODE) {
      const teacherProfile: Student = {
        id: 0,
        name: "M. WAHYUDIN, S.Pd",
        role: "Admin",
        xp: 9999,
        level: 99,
        streak: 30,
        isOnline: true,
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Wahyudin&backgroundColor=b6e3f4",
        banner: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
        bio: "Wali Kelas SEVEN D. Selalu mendidik dengan hati, inovasi, dan teknologi. 📘✨",
        badges: ["👑 Wali Kelas", "📐 Math Expert", "🛡️ Admin"]
      };
      setCurrentUser(teacherProfile);
      setIsTeacherMode(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser && currentUser.id !== 0) {
      setStudents(prev => prev.map(s => s.id === currentUser.id ? { ...s, isOnline: false } : s));
    }
    setCurrentUser(null);
    setIsTeacherMode(false);
    localStorage.removeItem('7d_user');
    localStorage.setItem('7d_teacher', 'false');
  };


  // --- GAME SYSTEM ACTIONS (XP, LEVEL, STREAK) ---
  const addXP = (amount: number, reason: string) => {
    if (!currentUser) return;

    // 1. Update Current User XP
    const newXp = (currentUser.xp || 0) + amount;
    const levelThreshold = 200; // 200 XP per level
    const newLevel = Math.floor(newXp / levelThreshold) + 1;
    const leveledUp = newLevel > currentUser.level;

    const updatedUser = {
      ...currentUser,
      xp: newXp,
      level: newLevel
    };

    setCurrentUser(updatedUser);

    // 2. Sync to students list
    setStudents(prev => prev.map(s => s.id === currentUser.id ? updatedUser : s));

    // 3. Spawning companion effects on pet
    setCurrentPet(prev => {
      const petNewXp = prev.xp + Math.floor(amount * 0.5);
      const petThreshold = prev.level * 150;
      const petLeveledUp = petNewXp >= petThreshold;

      return {
        ...prev,
        xp: petLeveledUp ? petNewXp - petThreshold : petNewXp,
        level: petLeveledUp ? prev.level + 1 : prev.level,
        status: levelingStatus(prev.status)
      };
    });

    // Provide immediate notification inside chat as notification alert log
    const systemNotice: ChatMessage = {
      id: "sys-" + Date.now(),
      studentId: 647,
      studentName: "SYSTEM REWARD",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=system&backgroundColor=ffb3b3",
      role: "Admin",
      content: `🎉 **${currentUser.name}** mendapatkan **+${amount} XP** (${reason})! ${leveledUp ? ` Naik ke Level **${newLevel}**! 🚀` : ''}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: []
    };
    setChatMessages(prev => [...prev, systemNotice]);
  };

  const levelingStatus = (curr: VirtualPet['status']): VirtualPet['status'] => {
    const list: VirtualPet['status'][] = ["Happy", "Studying", "Sleepy", "Energetic"];
    return list[Math.floor(Math.random() * list.length)];
  };

  const incrementStreak = () => {
    setDailyStreak(prev => {
      const updated = prev + 1;
      if (currentUser) {
        const u = { ...currentUser, streak: updated };
        setCurrentUser(u);
        setStudents(sList => sList.map(s => s.id === currentUser.id ? u : s));
      }
      return updated;
    });
  };

  const claimSpinReward = () => {
    setHasSpunToday(true);
    const rewards = [
      { label: "Book of Knowledge (+100 XP)", xp: 100 },
      { label: "Class Helper Bonus (+150 XP)", xp: 150 },
      { label: "Aesthetic Star Sparkles (+50 XP)", xp: 50 },
      { label: "Double Streak Modifier (+200 XP)", xp: 200 },
      { label: "Virtuoso Badge Boost (+80 XP)", xp: 80 }
    ];
    const item = rewards[Math.floor(Math.random() * rewards.length)];
    addXP(item.xp, "Reward Daily Spin");
    return item;
  };

  const toggleMission = (id: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === id && !m.completed) {
        addXP(m.xpReward, `Daily Mission: ${m.title}`);
        return { ...m, completed: true };
      }
      return m;
    }));
  };


  // --- CLASS ACTIONS ---

  // ANNOUNCEMENTS
  const addAnnouncement = (title: string, content: string, category: Announcement['category'], dueDate?: string) => {
    if (!currentUser) return;
    const fresh: Announcement = {
      id: "ann-" + Date.now(),
      title,
      content,
      author: currentUser.name,
      role: currentUser.role,
      date: new Date().toISOString().split('T')[0],
      category,
      dueDate
    };
    setAnnouncements(prev => [fresh, ...prev]);
    addXP(100, "Memposting Pengumuman Kelas");

    // Chat notify classmate
    const notice: ChatMessage = {
      id: "notice-" + Date.now(),
      studentId: currentUser.id,
      studentName: currentUser.name,
      avatar: currentUser.avatar,
      role: currentUser.role,
      content: `📢 **PENGUMUMAN BARU**: **${title}**\n\n"${content}" ${dueDate ? `\n\n⚠️ Deadline: ${dueDate}` : ''}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [{ emoji: "📌", count: 1, users: [currentUser.id] }]
    };
    setChatMessages(prev => [...prev, notice]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // KAS KELAS (FINANCE)
  const addKas = (type: 'income' | 'expense', amount: number, description: string, category: string) => {
    const fresh: KasRecord = {
      id: "kas-" + Date.now(),
      date: new Date().toISOString().split('T')[0],
      type,
      amount,
      description,
      category,
      recordedBy: currentUser ? currentUser.name : "Wali Kelas"
    };
    setKasRecords(prev => [fresh, ...prev]);

    if (currentUser) {
      addXP(120, `Mencatat Kas Kelas: ${description}`);
    }
  };

  // ATTENDANCE (ABSENSI)
  const markAttendance = (status: AttendanceRecord['status']) => {
    if (!currentUser) return;
    const today = new Date().toISOString().split('T')[0];

    // Check if entered already
    const exists = attendanceRecords.some(r => r.studentId === currentUser.id && r.date === today);
    if (exists) return;

    const fresh: AttendanceRecord = {
      studentId: currentUser.id,
      date: today,
      status,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setAttendanceRecords(prev => [...prev, fresh]);
    addXP(150, "Kehadiran Harian Terdata");

    // Complete Daily Mission absensi if type is checked
    setMissions(prev => prev.map(m => {
      if (m.type === 'absensi' && !m.completed) {
        addXP(m.xpReward, `Misi Selesai: ${m.title}`);
        return { ...m, completed: true };
      }
      return m;
    }));
  };

  // CHAT (DISCORD-STYLE)
  const sendChatMessage = (content: string, attachment?: ChatMessage['attachment'], replyTo?: ChatMessage['replyTo']) => {
    if (!currentUser) return;
    const fresh: ChatMessage = {
      id: "msg-" + Date.now(),
      studentId: currentUser.id,
      studentName: currentUser.name,
      avatar: currentUser.avatar,
      role: currentUser.role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment,
      reactions: [],
      replyTo
    };

    setChatMessages(prev => [...prev, fresh]);
    addXP(15, "Aktif Berdiskusi di Chat Kelas");

    // --- Interactive simulated classmates chatbot ---
    // If user posts a specific prompt or chat, other students react!
    const classmates = students.filter(s => s.id !== currentUser.id && s.id !== 0);
    const speaker = classmates[Math.floor(Math.random() * classmates.length)];

    setTimeout(() => {
      // Simulate typing indicator
      const replies = [
        "Wah setuju tuh keren banget portalnya! 😎",
        "Keren banget, Seven D kelas inovatif modern 2026. 🚀",
        "Siap laksanakan ketua! Gas pol belajar.",
        "Sudah kelar PR nya? Mau liat dong heheh 😆",
        "Pak Wahyudin emang wali kelas terbaik dah! Programmer pula 💻⚡",
        "Hari ini piket siapa aja ya? Jangan lupa sapu kolong meja!",
        "Mantap pol, kuis AI tadi asyik juga buat dicoba loh.",
      ];
      const randomContent = replies[Math.floor(Math.random() * replies.length)];

      const repliesMessage: ChatMessage = {
        id: "msg-" + (Date.now() + 100),
        studentId: speaker.id,
        studentName: speaker.name,
        avatar: speaker.avatar,
        role: speaker.role,
        content: randomContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: [{ emoji: "😆", count: 1, users: [currentUser.id] }],
        replyTo: {
          id: fresh.id,
          name: currentUser.name,
          content: fresh.content.length > 40 ? fresh.content.slice(0, 40) + "..." : fresh.content
        }
      };

      setChatMessages(prev => [...prev, repliesMessage]);
    }, 3000);
  };

  const reactToMessage = (msgId: string, emoji: string) => {
    if (!currentUser) return;
    setChatMessages(prev => prev.map(msg => {
      if (msg.id === msgId) {
        // Look for existing reaction
        const index = msg.reactions.findIndex(r => r.emoji === emoji);
        if (index > -1) {
          const rx = msg.reactions[index];
          const userIdx = rx.users.indexOf(currentUser.id);
          if (userIdx > -1) {
            // Remove user reaction
            const updatedUsers = rx.users.filter(id => id !== currentUser.id);
            if (updatedUsers.length === 0) {
              return { ...msg, reactions: msg.reactions.filter((_, i) => i !== index) };
            }
            return {
              ...msg,
              reactions: msg.reactions.map((r, i) => i === index ? { ...r, count: r.count - 1, users: updatedUsers } : r)
            };
          } else {
            // Add user reaction
            return {
              ...msg,
              reactions: msg.reactions.map((r, i) => i === index ? { ...r, count: r.count + 1, users: [...r.users, currentUser.id] } : r)
            };
          }
        } else {
          // Add brand new reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, users: [currentUser.id] }]
          };
        }
      }
      return msg;
    }));
  };

  const deleteMessage = (msgId: string) => {
    setChatMessages(prev => prev.filter(m => m.id !== msgId));
  };

  // PIKET (CLEANING CHECKLIST)
  const completePiket = (studentName: string, notes: string, imageBase64?: string) => {
    setPiketStatusCurrentDay(prev => ({
      ...prev,
      [studentName]: true
    }));

    // Find custom student to reward XP
    const target = students.find(s => s.name.toLowerCase().includes(studentName.toLowerCase()) || studentName.toLowerCase().includes(s.name.toLowerCase()));
    if (target) {
      const updated = {
        ...target,
        xp: target.xp + 250
      };
      setStudents(prev => prev.map(s => s.id === target.id ? updated : s));
      if (currentUser && currentUser.id === target.id) {
        setCurrentUser(updated);
      }
    }

    // Post to chat
    const alertMsg: ChatMessage = {
      id: "piket-" + Date.now(),
      studentId: 0,
      studentName: "ADMIN CHRONICLES",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=system_logs&backgroundColor=e2e8f0",
      role: "Admin",
      content: `🧹 **Piket Selesai**: **${studentName}** telah menyelesaikan tugas piket hari ini! 🎉\n📝 Catatan: *${notes}*\nXP Tambahan **+250 XP** diberikan!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: imageBase64 ? { type: 'image', url: imageBase64, name: 'bukti_piket.png' } : undefined,
      reactions: [{ emoji: "✨", count: 3, users: [1, 2, target ? target.id : 30] }]
    };
    setChatMessages(prev => [...prev, alertMsg]);
  };

  // VIRTUAL PET ADVENTURE
  const updatePetName = (name: string) => {
    setCurrentPet(prev => ({ ...prev, name }));
  };

  const evolvePet = () => {
    setCurrentPet(prev => {
      const names = { Neko: 'Aero Cat', Shiba: 'Cyber Doggo', Dino: 'Rex Neon' };
      const nextType = prev.type === 'Neko' ? 'Shiba' : prev.type === 'Shiba' ? 'Dino' : 'Neko';
      return {
        ...prev,
        type: nextType,
        level: prev.level + 1,
        xp: 0
      };
    });
  };

  const solveAIQuizComplete = (scorePercentage: number) => {
    if (!currentUser) return;
    const isSuccess = scorePercentage >= 80;
    const gainedXp = isSuccess ? 200 : 50;

    addXP(gainedXp, `Mengerjakan Kuiz AI (Skor ${scorePercentage}%)`);

    // Toggle daily mission quiz if applicable
    setMissions(prev => prev.map(m => {
      if (m.type === 'quiz' && !m.completed && isSuccess) {
        addXP(m.xpReward, `Misi Selesai: ${m.title}`);
        return { ...m, completed: true };
      }
      return m;
    }));
  };

  return (
    <ClassHubContext.Provider value={{
      currentUser,
      isTeacherMode,
      students,
      announcements,
      kasRecords,
      attendanceRecords,
      missions,
      achievements,
      chatMessages,
      currentPet,
      dailyStreak,
      hasSpunToday,
      activeQuote,
      piketStatusCurrentDay,
      activeLofiTrack,
      isFocusModeActive,

      loginSiswa,
      loginWaliKelas,
      logout,
      addXP,
      incrementStreak,
      claimSpinReward,
      toggleMission,
      addAnnouncement,
      deleteAnnouncement,
      addKas,
      markAttendance,
      sendChatMessage,
      reactToMessage,
      deleteMessage,
      completePiket,
      updatePetName,
      evolvePet,
      solveAIQuizComplete,
      generateAllCodes,
      resetStudentCode
    }}>
      {children}
    </ClassHubContext.Provider>
  );
};

export const useClassHub = () => {
  const context = useContext(ClassHubContext);
  if (context === undefined) {
    throw new Error('useClassHub must be used within a ClassHubProvider');
  }
  return context;
};
