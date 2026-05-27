/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  sendTypingNotice: (isTyping: boolean) => void;
  updateCustomStatus: (status: string) => void;
  updateProfile: (name: string, bio: string, customStatus: string, avatar?: string, banner?: string) => void;
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

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!currentUser) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${protocol}${window.location.host}`;
    console.log("[WS-CLIENT] Connecting to:", wsUrl);

    let active = true;
    let ws: WebSocket;
    let pingInterval: any;

    const connect = () => {
      if (!active) return;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!active) return;
        console.log("[WS-CLIENT] Authenticated connected as StudentID:", currentUser.id);
        ws.send(JSON.stringify({ type: 'auth', studentId: currentUser.id }));

        // Send keep-alive ping to maintain connection in reverse proxy layers
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        if (!active) return;
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'sync') {
            console.log("[WS-CLIENT] Fully Synced Database Frame:", data);
            if (data.studentState) {
              const ss = data.studentState;
              setCurrentUser(ss);
              setMissions(ss.missions || []);
              setAchievements(ss.achievements || []);
              setAttendanceRecords(ss.attendanceRecords || []);
              if (ss.streak !== undefined) {
                setDailyStreak(ss.streak);
              }
            }
            if (data.students) setStudents(data.students);
            if (data.chatMessages) setChatMessages(data.chatMessages);
            if (data.announcements) setAnnouncements(data.announcements);
            if (data.kasRecords) setKasRecords(data.kasRecords);
          }

          else if (data.type === 'self_sync') {
            if (data.studentState) {
              const ss = data.studentState;
              setCurrentUser(ss);
              setMissions(ss.missions || []);
              setAchievements(ss.achievements || []);
              setAttendanceRecords(ss.attendanceRecords || []);
              if (ss.streak !== undefined) {
                setDailyStreak(ss.streak);
              }
            }
          }

          else if (data.type === 'student_updated') {
            const updated = data.student;
            setStudents(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
            if (currentUser && currentUser.id === updated.id) {
              setCurrentUser(prev => prev ? {
                ...prev,
                isOnline: updated.isOnline,
                onlineStatus: updated.onlineStatus,
                lastSeen: updated.lastSeen,
                avatar: updated.avatar,
                banner: updated.banner,
                bio: updated.bio,
                customStatus: updated.customStatus,
                badges: updated.badges,
                xp: updated.xp,
                level: updated.level,
                streak: updated.streak
              } : null);
            }
          }

          else if (data.type === 'new_chat_message') {
            setChatMessages(prev => {
              if (prev.some(m => m.id === data.message.id)) return prev;
              return [...prev, data.message];
            });
          }

          else if (data.type === 'chat_updated') {
            setChatMessages(data.chatMessages);
          }

          else if (data.type === 'announcements_updated') {
            setAnnouncements(data.announcements);
          }

          else if (data.type === 'kas_updated') {
            setKasRecords(data.kasRecords);
          }

        } catch (e) {
          console.error("[WS-CLIENT] Parse error message:", e);
        }
      };

      ws.onclose = () => {
        clearInterval(pingInterval);
        if (active) {
          console.log("[WS-CLIENT] Closed status, reconnecting in 3 seconds...");
          setTimeout(connect, 3000);
        }
      };

      ws.onerror = (e) => {
        console.error("[WS-CLIENT] Error details:", e);
      };
    };

    connect();

    return () => {
      active = false;
      clearInterval(pingInterval);
      if (ws) ws.close();
      wsRef.current = null;
    };
  }, [currentUser?.id]);

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


  // --- TYPE ANCILLARY HELPER & SETTERS FOR PRESENCE OR STATUS ---
  const sendTypingNotice = (isTyping: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', isTyping }));
    }
  };

  const updateCustomStatus = (status: string) => {
    if (!currentUser) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'update_student', customStatus: status }));
    } else {
      const u = { ...currentUser, customStatus: status };
      setCurrentUser(u);
      setStudents(prev => prev.map(s => s.id === currentUser.id ? u : s));
    }
  };

  const updateProfile = (name: string, bio: string, customStatus: string, avatar?: string, banner?: string) => {
    if (!currentUser) return;
    const u = {
      ...currentUser,
      name,
      bio,
      customStatus,
      ...(avatar !== undefined && { avatar }),
      ...(banner !== undefined && { banner })
    };
    setCurrentUser(u);
    setStudents(prev => prev.map(s => s.id === currentUser.id ? u : s));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update_student',
        name,
        bio,
        customStatus,
        avatar,
        banner
      }));
    }
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

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update_student',
        xp: newXp,
        level: newLevel
      }));
    } else {
      setCurrentUser(updatedUser);
      setStudents(prev => prev.map(s => s.id === currentUser.id ? updatedUser : s));
    }

    // 2. Spawning companion effects on pet
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
  };

  const levelingStatus = (curr: VirtualPet['status']): VirtualPet['status'] => {
    const list: VirtualPet['status'][] = ["Happy", "Studying", "Sleepy", "Energetic"];
    return list[Math.floor(Math.random() * list.length)];
  };

  const incrementStreak = () => {
    if (!currentUser) return;
    const updated = (currentUser.streak || 0) + 1;
    setDailyStreak(updated);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update_student',
        streak: updated
      }));
    } else {
      const u = { ...currentUser, streak: updated };
      setCurrentUser(u);
      setStudents(sList => sList.map(s => s.id === currentUser.id ? u : s));
    }
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
    if (!currentUser) return;
    
    const targetMission = missions.find(m => m.id === id);
    if (!targetMission || targetMission.completed) return;

    // Calculate new XP
    const newXp = (currentUser.xp || 0) + targetMission.xpReward;
    const levelThreshold = 200;
    const newLevel = Math.floor(newXp / levelThreshold) + 1;

    const nextMissions = missions.map(m => m.id === id ? { ...m, completed: true } : m);
    setMissions(nextMissions);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update_student',
        xp: newXp,
        level: newLevel,
        missions: nextMissions
      }));
    } else {
      const u = { ...currentUser, xp: newXp, level: newLevel };
      setCurrentUser(u);
      setStudents(prev => prev.map(s => s.id === currentUser.id ? u : s));
    }
  };


  // --- CLASS ACTIONS ---

  // ANNOUNCEMENTS
  const addAnnouncement = (title: string, content: string, category: Announcement['category'], dueDate?: string) => {
    if (!currentUser) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'add_announcement',
        title,
        content,
        category,
        dueDate
      }));
    } else {
      // Offline fallback
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
    }
    
    addXP(100, "Memposting Pengumuman Kelas");
  };

  const deleteAnnouncement = (id: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'delete_announcement',
        id
      }));
    } else {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  // KAS KELAS (FINANCE)
  const addKas = (type: 'income' | 'expense', amount: number, description: string, category: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'add_kas',
        kasType: type,
        amount,
        description,
        category
      }));
    } else {
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
    }

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

    const updatedRecords = [...attendanceRecords, fresh];
    setAttendanceRecords(updatedRecords);

    const newXp = (currentUser.xp || 0) + 150;
    const levelThreshold = 200;
    const newLevel = Math.floor(newXp / levelThreshold) + 1;

    // Complete Daily Mission absensi if type is checked
    const nextMissions = missions.map(m => {
      if (m.type === 'absensi' && !m.completed) {
        return { ...m, completed: true };
      }
      return m;
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update_student',
        xp: newXp,
        level: newLevel,
        attendanceRecords: updatedRecords,
        missions: nextMissions
      }));
    } else {
      const u = { ...currentUser, xp: newXp, level: newLevel };
      setCurrentUser(u);
      setStudents(prev => prev.map(s => s.id === currentUser.id ? u : s));
      setMissions(nextMissions);
    }
  };

  // CHAT (DISCORD-STYLE)
  const sendChatMessage = (content: string, attachment?: ChatMessage['attachment'], replyTo?: ChatMessage['replyTo']) => {
    if (!currentUser) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        content,
        attachment,
        replyTo
      }));

      // Award XP for participation
      addXP(15, "Aktif Berdiskusi di Chat Kelas");
    } else {
      // Offline implementation
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
    }
  };

  const reactToMessage = (msgId: string, emoji: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'react_message',
        msgId,
        emoji
      }));
    } else {
      // Offline react simulation
      if (!currentUser) return;
      setChatMessages(prev => prev.map(msg => {
        if (msg.id === msgId) {
          const index = msg.reactions.findIndex(r => r.emoji === emoji);
          if (index > -1) {
            const rx = msg.reactions[index];
            const userIdx = rx.users.indexOf(currentUser.id);
            if (userIdx > -1) {
              const updatedUsers = rx.users.filter(id => id !== currentUser.id);
              if (updatedUsers.length === 0) {
                return { ...msg, reactions: msg.reactions.filter((_, i) => i !== index) };
              }
              return {
                ...msg,
                reactions: msg.reactions.map((r, i) => i === index ? { ...r, count: r.count - 1, users: updatedUsers } : r)
              };
            } else {
              return {
                ...msg,
                reactions: msg.reactions.map((r, i) => i === index ? { ...r, count: r.count + 1, users: [...r.users, currentUser.id] } : r)
              };
            }
          } else {
            return {
              ...msg,
              reactions: [...msg.reactions, { emoji, count: 1, users: [currentUser.id] }]
            };
          }
        }
        return msg;
      }));
    }
  };

  const deleteMessage = (msgId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'delete_message',
        msgId
      }));
    } else {
      setChatMessages(prev => prev.filter(m => m.id !== msgId));
    }
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
      const updatedXp = target.xp + 250;
      const levelThreshold = 200;
      const updatedLevel = Math.floor(updatedXp / levelThreshold) + 1;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentUser && currentUser.id === target.id) {
        // Real-time update if logged-in user completes their own piket
        wsRef.current.send(JSON.stringify({
          type: 'update_student',
          xp: updatedXp,
          level: updatedLevel
        }));
      } else {
        const updated = {
          ...target,
          xp: updatedXp,
          level: updatedLevel
        };
        setStudents(prev => prev.map(s => s.id === target.id ? updated : s));
      }
    }

    // Post system alert to chat
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

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        content: alertMsg.content,
        attachment: alertMsg.attachment
      }));
    } else {
      setChatMessages(prev => [...prev, alertMsg]);
    }
  };

  // VIRTUAL PET ADVENTURE
  const updatePetName = (name: string) => {
    setCurrentPet(prev => ({ ...prev, name }));
  };

  const evolvePet = () => {
    setCurrentPet(prev => {
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
    const nextMissions = missions.map(m => {
      if (m.type === 'quiz' && !m.completed && isSuccess) {
        return { ...m, completed: true };
      }
      return m;
    });

    if (isSuccess) {
      setMissions(nextMissions);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const newXp = (currentUser.xp || 0) + gainedXp;
        const levelThreshold = 200;
        const newLevel = Math.floor(newXp / levelThreshold) + 1;
        
        wsRef.current.send(JSON.stringify({
          type: 'update_student',
          xp: newXp,
          level: newLevel,
          missions: nextMissions
        }));
      }
    }
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
      resetStudentCode,
      sendTypingNotice,
      updateCustomStatus,
      updateProfile
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
