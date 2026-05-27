/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import { INITIAL_STUDENTS, INITIAL_MISSIONS, INITIAL_ACHIEVEMENTS } from './src/data/students';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for the Google Gen AI client
let aiInstance: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return a dummy client if missing so server doesn't crash, but error on route calls
      console.warn("WARN: GEMINI_API_KEY is not defined in the environment. AI features will require config.");
      throw new Error("GEMINI_API_KEY has not been provided. Please configure it in your Secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// REST APIs FIRST

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Study Assistant (General Tutor Chat)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const ai = getAIClient();

    // Prepare system prompt for class assistant
    const systemInstruction = `Anda adalah "AI Study Buddy Seven D" — seorang asisten belajar yang gaul, suportif, interaktif, cerdas, dan menyenangkan untuk siswa kelas 7D SMPN 2 Lamongan.
Wali kelas mereka adalah Pak M. Wahyudin, S.Pd. 
Gaya bahasa Anda harus santai, menyemangati, ramah khas anak sekolah (gunakan panggilan 'teman-teman', 'kamu', 'absen', dll.), tidak kaku, namun tetap sopan, edukatif dan solutif. Anda harus bersedia menerangkan materi sekolah (IPS, IPA, Matematika, PKN, Coding & AI, dll.) dengan cara yang asyik dan mudah dipahami. Sesekali berikan candaan sains atau kata-kata motivasi belajar.`;

    // Process using direct generation or chat
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Chat Route Error:", error);
    res.status(500).json({ error: error.message || "Gagal memproses permintaan AI." });
  }
});

// AI Document Summarizer (Notes / Text Rangkuman)
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { text, fileData, fileName } = req.body;
    const ai = getAIClient();

    let textPart = { text: "Rangkumlah materi ini menjadi poin-poin yang modern, clean, dan sangat mudah diingat oleh anak SMP. Berikan subjudul, glosarium singkat, dan tips cepat belajar!" };
    let contents: any[] = [];

    if (fileData) {
      // Visual file analysis or PDF simulation (image/png-jpeg)
      const matches = fileData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        contents.push({
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: `Rangkumlah gambar/catatan materi berikut dengan format Markdown yang keren. Nama file: ${fileName || 'catatan.png'}` }
          ]
        });
      } else {
        contents.push({ text: `Rangkumlah teks berikut: ${text}` });
      }
    } else {
      contents.push({ text: `Berikut materi pelajaran yang perlu dirangkum: \n\n${text}\n\nBuatlah dalam format ringkasan markdown estetik.` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents.length === 1 ? contents[0] : contents,
      config: {
        systemInstruction: "Anda adalah master perangkum catatan sekolah. Buat rangkuman sesederhana mungkin, estetik dengan pembagian emoji yang tepat, mengelompokkan rumus atau definisi kunci secara menonjol.",
      }
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("AI Summarizer Error:", error);
    res.status(500).json({ error: error.message || "Gagal merangkum catatan pelajaran." });
  }
});

// AI Quiz Generator (creates 5 interactive quiz questions for a topic)
app.post('/api/ai/quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Buatlah 5 kuiz pilihan ganda seputar topik: "${topic || 'Pelajaran Umum SMP Kelas 7'}". Harus ada 4 opsi per pertanyaan (A, B, C, D) dalam format JSON yang tepat.`,
      config: {
        systemInstruction: "Buat kuis interaktif anak sekolah SMP Kelas 7. Pertanyaan harus menyenangkan tapi berbobot.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "Teks pertanyaan kuiz."
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array berisi 4 pilihan jawaban."
              },
              answerIndex: {
                type: Type.INTEGER,
                description: "Index jawaban yang benar (0 untuk pilihan ke-1, sampai 3 untuk pilihan ke-4)."
              },
              explanation: {
                type: Type.STRING,
                description: "Penjelasan ringkas mengapa jawaban tersebut benar."
              }
            },
            required: ["question", "options", "answerIndex", "explanation"]
          }
        }
      }
    });

    let quizData = [];
    if (response.text) {
      quizData = JSON.parse(response.text.trim());
    }

    res.json({ quiz: quizData });
  } catch (error: any) {
    console.error("AI Quiz Route Error:", error);
    res.status(500).json({ error: error.message || "Gagal membuat kuiz AI." });
  }
});

// ==========================================
// REAL-TIME DATABASING & PERSISTENCE SECTION
// ==========================================

const DB_PATH = path.join(process.cwd(), 'classhub_db.json');

// Initialize default students records with their personal progression context
const defaultStudents: { [idKey: string]: any } = {};

INITIAL_STUDENTS.forEach((student) => {
  const paddedId = String(student.id).padStart(2, '0');
  defaultStudents[String(student.id)] = {
    ...student,
    isOnline: false,
    onlineStatus: 'offline',
    lastSeen: new Date().toISOString(),
    loginCode: student.loginCode || `${paddedId}2026`,
    // Truly individual instances of progression
    missions: JSON.parse(JSON.stringify(INITIAL_MISSIONS)),
    achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
    attendanceRecords: []
  };
});

// Add Wali Kelas explicitly with ID 0
defaultStudents["0"] = {
  id: 0,
  name: "M. WAHYUDIN, S.Pd",
  role: "Admin",
  xp: 9999,
  level: 99,
  streak: 30,
  isOnline: false,
  onlineStatus: 'offline',
  lastSeen: new Date().toISOString(),
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Wahyudin&backgroundColor=b6e3f4",
  banner: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
  bio: "Wali Kelas SEVEN D. Selalu mendidik dengan hati, inovasi, dan teknologi. 📘✨",
  badges: ["👑 Wali Kelas", "📐 Math Expert", "🛡️ Admin"],
  loginCode: "WAHYUDIN7D",
  missions: JSON.parse(JSON.stringify(INITIAL_MISSIONS)),
  achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
  attendanceRecords: []
};

// Database state variable
let db: {
  students: { [key: string]: any };
  chatMessages: any[];
  announcements: any[];
  kasRecords: any[];
} = {
  students: defaultStudents,
  chatMessages: [],
  announcements: [],
  kasRecords: []
};

function loadDb() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      if (parsed && parsed.students) {
        db = parsed;
        console.log("[SEVEN_D_SERVER] Loaded database successfully.");
        return;
      }
    } catch (e) {
      console.error("[SEVEN_D_SERVER] Error parsing classhub_db.json. Resetting on start.", e);
    }
  }
  
  // Save base defaults
  console.log("[SEVEN_D_SERVER] Creating clean database state classhub_db.json.");
  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error("[SEVEN_D_SERVER] Failed to save database to disk:", e);
  }
}

// Initial invocation
loadDb();


// ==========================================
// WEBSOCKET BROADCASTING & REAL-TIME SYSTEM
// ==========================================

const wss = new WebSocketServer({ noServer: true });
const clientSockets = new Map<WebSocket, number>(); // Map connection -> studentId

const broadcast = (payloadObj: any) => {
  const text = JSON.stringify(payloadObj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(text);
    }
  });
};

wss.on('connection', (ws) => {
  console.log("[WS] New client upgraded and connected.");

  ws.on('message', (messageStr: string) => {
    try {
      const data = JSON.parse(messageStr);
      
      if (data.type === 'auth') {
        const studentId = Number(data.studentId);
        const idKey = String(studentId);
        
        if (db.students[idKey]) {
          clientSockets.set(ws, studentId);
          
          // Mark as online
          db.students[idKey].isOnline = true;
          db.students[idKey].onlineStatus = 'online';
          db.students[idKey].lastSeen = new Date().toISOString();
          saveDb();
          
          // Send back isolated sync response so client updates themselves
          ws.send(JSON.stringify({
            type: 'sync',
            studentState: db.students[idKey],
            students: Object.values(db.students).map((s: any) => ({
              id: s.id,
              name: s.name,
              role: s.role,
              isOnline: s.isOnline,
              onlineStatus: s.onlineStatus || 'offline',
              lastSeen: s.lastSeen,
              avatar: s.avatar,
              banner: s.banner,
              bio: s.bio,
              customStatus: s.customStatus,
              badges: s.badges,
              xp: s.xp,
              level: s.level,
              streak: s.streak
            })),
            chatMessages: db.chatMessages || [],
            announcements: db.announcements || [],
            kasRecords: db.kasRecords || []
          }));
          
          // Broadcast presence presence list state to others
          broadcast({
            type: 'student_updated',
            student: {
              id: db.students[idKey].id,
              name: db.students[idKey].name,
              role: db.students[idKey].role,
              isOnline: true,
              onlineStatus: 'online',
              lastSeen: db.students[idKey].lastSeen,
              avatar: db.students[idKey].avatar,
              banner: db.students[idKey].banner,
              bio: db.students[idKey].bio,
              customStatus: db.students[idKey].customStatus,
              badges: db.students[idKey].badges,
              xp: db.students[idKey].xp,
              level: db.students[idKey].level,
              streak: db.students[idKey].streak
            }
          });
        }
      }
      
      else if (data.type === 'typing') {
        const studentId = clientSockets.get(ws);
        if (studentId !== undefined) {
          const idKey = String(studentId);
          if (db.students[idKey]) {
            const status = data.isTyping ? 'typing' : 'online';
            db.students[idKey].onlineStatus = status;
            
            broadcast({
              type: 'student_updated',
              student: {
                ...db.students[idKey],
                onlineStatus: status
              }
            });
          }
        }
      }
      
      else if (data.type === 'status_update') {
        const studentId = clientSockets.get(ws);
        if (studentId !== undefined) {
          const idKey = String(studentId);
          if (db.students[idKey]) {
            const newStatus = data.status || 'online';
            db.students[idKey].onlineStatus = newStatus;
            saveDb();
            
            broadcast({
              type: 'student_updated',
              student: {
                ...db.students[idKey],
                onlineStatus: newStatus
              }
            });
          }
        }
      }
      
      else if (data.type === 'chat_message') {
        const studentId = clientSockets.get(ws);
        if (studentId !== undefined) {
          const idKey = String(studentId);
          const sender = db.students[idKey];
          if (sender) {
            const newMessage = {
              id: 'msg-' + Date.now(),
              studentId: sender.id,
              studentName: sender.name,
              avatar: sender.avatar,
              role: sender.role,
              content: data.content,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              attachment: data.attachment,
              reactions: [],
              replyTo: data.replyTo
            };
            
            db.chatMessages = db.chatMessages || [];
            db.chatMessages.push(newMessage);
            saveDb();
            
            broadcast({
              type: 'new_chat_message',
              message: newMessage
            });
          }
        }
      }
      
      else if (data.type === 'react_message') {
        const studentId = clientSockets.get(ws);
        if (studentId !== undefined) {
          const { msgId, emoji } = data;
          db.chatMessages = db.chatMessages || [];
          const msg = db.chatMessages.find((m: any) => m.id === msgId);
          if (msg) {
            msg.reactions = msg.reactions || [];
            const idx = msg.reactions.findIndex((r: any) => r.emoji === emoji);
            if (idx > -1) {
              const rx = msg.reactions[idx];
              const userIdx = rx.users.indexOf(studentId);
              if (userIdx > -1) {
                rx.users.splice(userIdx, 1);
                rx.count--;
                if (rx.count === 0) {
                  msg.reactions.splice(idx, 1);
                }
              } else {
                rx.users.push(studentId);
                rx.count++;
              }
            } else {
              msg.reactions.push({ emoji, count: 1, users: [studentId] });
            }
            saveDb();
            
            broadcast({
              type: 'chat_updated',
              chatMessages: db.chatMessages
            });
          }
        }
      }
      
      else if (data.type === 'delete_message') {
        const studentId = clientSockets.get(ws);
        if (studentId !== undefined) {
          const { msgId } = data;
          db.chatMessages = db.chatMessages || [];
          db.chatMessages = db.chatMessages.filter((m: any) => m.id !== msgId);
          saveDb();
          
          broadcast({
            type: 'chat_updated',
            chatMessages: db.chatMessages
          });
        }
      }
      
      else if (data.type === 'update_student') {
        const studentId = clientSockets.get(ws);
        if (studentId !== undefined) {
          const idKey = String(studentId);
          if (db.students[idKey]) {
            // Update stats
            if (data.name !== undefined) db.students[idKey].name = data.name;
            if (data.xp !== undefined) db.students[idKey].xp = data.xp;
            if (data.level !== undefined) db.students[idKey].level = data.level;
            if (data.streak !== undefined) db.students[idKey].streak = data.streak;
            if (data.bio !== undefined) db.students[idKey].bio = data.bio;
            if (data.customStatus !== undefined) db.students[idKey].customStatus = data.customStatus;
            if (data.avatar !== undefined) db.students[idKey].avatar = data.avatar;
            if (data.banner !== undefined) db.students[idKey].banner = data.banner;
            
            if (data.missions) db.students[idKey].missions = data.missions;
            if (data.achievements) db.students[idKey].achievements = data.achievements;
            if (data.attendanceRecords) db.students[idKey].attendanceRecords = data.attendanceRecords;
            
            saveDb();
            
            // Broadcast generalized profile updates to others
            broadcast({
              type: 'student_updated',
              student: {
                id: db.students[idKey].id,
                name: db.students[idKey].name,
                role: db.students[idKey].role,
                isOnline: db.students[idKey].isOnline,
                onlineStatus: db.students[idKey].onlineStatus,
                lastSeen: db.students[idKey].lastSeen,
                avatar: db.students[idKey].avatar,
                banner: db.students[idKey].banner,
                bio: db.students[idKey].bio,
                customStatus: db.students[idKey].customStatus,
                badges: db.students[idKey].badges,
                xp: db.students[idKey].xp,
                level: db.students[idKey].level,
                streak: db.students[idKey].streak
              }
            });
            
            // Re-sync progress context privately to self
            ws.send(JSON.stringify({
              type: 'self_sync',
              studentState: db.students[idKey]
            }));
          }
        }
      }
      
      else if (data.type === 'add_announcement') {
        const studentId = clientSockets.get(ws);
        if (studentId !== undefined) {
          const sender = db.students[String(studentId)];
          if (sender) {
            const { title, content, category, dueDate } = data;
            const fresh = {
              id: "ann-" + Date.now(),
              title,
              content,
              author: sender.name,
              role: sender.role,
              date: new Date().toISOString().split('T')[0],
              category,
              dueDate
            };
            
            db.announcements = db.announcements || [];
            db.announcements.unshift(fresh);
            saveDb();
            
            broadcast({
              type: 'announcements_updated',
              announcements: db.announcements
            });
          }
        }
      }
      
      else if (data.type === 'delete_announcement') {
        const { id } = data;
        db.announcements = db.announcements || [];
        db.announcements = db.announcements.filter((a: any) => a.id !== id);
        saveDb();
        
        broadcast({
          type: 'announcements_updated',
          announcements: db.announcements
        });
      }
      
      else if (data.type === 'add_kas') {
        const studentId = clientSockets.get(ws);
        if (studentId !== undefined) {
          const sender = db.students[String(studentId)];
          if (sender) {
            const { kasType, amount, description, category } = data;
            const fresh = {
              id: "kas-" + Date.now(),
              date: new Date().toISOString().split('T')[0],
              type: kasType || 'income',
              amount,
              description,
              category,
              recordedBy: sender.name
            };
            
            db.kasRecords = db.kasRecords || [];
            db.kasRecords.unshift(fresh);
            saveDb();
            
            broadcast({
              type: 'kas_updated',
              kasRecords: db.kasRecords
            });
          }
        }
      }
      
    } catch (err) {
      console.error("[WS] Parse / dispatch error:", err);
    }
  });

  ws.on('close', () => {
    const studentId = clientSockets.get(ws);
    if (studentId !== undefined) {
      clientSockets.delete(ws);
      
      const hasOtherSockets = Array.from(clientSockets.values()).includes(studentId);
      if (!hasOtherSockets) {
        const idKey = String(studentId);
        if (db.students[idKey]) {
          db.students[idKey].isOnline = false;
          db.students[idKey].onlineStatus = 'offline';
          db.students[idKey].lastSeen = new Date().toISOString();
          saveDb();
          
          broadcast({
            type: 'student_updated',
            student: {
              id: db.students[idKey].id,
              name: db.students[idKey].name,
              role: db.students[idKey].role,
              isOnline: false,
              onlineStatus: 'offline',
              lastSeen: db.students[idKey].lastSeen,
              avatar: db.students[idKey].avatar,
              banner: db.students[idKey].banner,
              bio: db.students[idKey].bio,
              customStatus: db.students[idKey].customStatus,
              badges: db.students[idKey].badges,
              xp: db.students[idKey].xp,
              level: db.students[idKey].level,
              streak: db.students[idKey].streak
            }
          });
        }
      }
    }
  });
});


// VITE MIDDLEWARE SETUP FOR DEV/PROD

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SEVEN_D_SERVER] Full stack app running on http://localhost:${PORT}`);
  });

  // Dynamic upgrade on connection
  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });
}

start();
