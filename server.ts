/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
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
      console.warn("WARN: GEMINI_API_KEY is not defined in the environment. AI features will try alternative or fallbacks.");
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

// Function to check which AI provider is configured
function getAIProvider(): 'gemini' | 'openai' | 'none' {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
    return 'gemini';
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0) {
    return 'openai';
  }
  return 'none';
}

// REST APIs FIRST

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Status check endpoint
app.get('/api/ai/status', (req, res) => {
  const provider = getAIProvider();
  res.json({
    online: provider !== 'none',
    provider,
    message: provider !== 'none' ? `AI siap digunakan via ${provider.toUpperCase()}` : "AI sedang offline"
  });
});

// AI Study Assistant (General Tutor Chat)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const provider = getAIProvider();

    // Prepare system prompt for class assistant
    const systemInstruction = `Anda adalah "AI Study Buddy Seven D" — seorang asisten belajar yang gaul, suportif, interaktif, cerdas, dan menyenangkan untuk siswa kelas 7D SMPN 2 Lamongan.
Wali kelas mereka adalah Pak M. Wahyudin, S.Pd. 
Gaya bahasa Anda harus santai, menyemangati, ramah khas anak sekolah (gunakan panggilan 'teman-teman', 'kamu', 'absen', dll.), tidak kaku, namun tetap sopan, edukatif dan solutif. Anda harus bersedia menerangkan materi sekolah (IPS, IPA, Matematika, PKN, Coding & AI, dll.) dengan cara yang asyik dan mudah dipahami. Sesekali berikan candaan sains atau kata-kata motivasi belajar.`;

    if (provider === 'gemini') {
      const ai = getAIClient();
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
    } else if (provider === 'openai') {
      const openAIHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            ...openAIHistory,
            { role: 'user', content: message }
          ],
          temperature: 0.7
        })
      });

      if (!openAIResponse.ok) {
        const errText = await openAIResponse.text();
        throw new Error(`OpenAI API error: ${errText}`);
      }

      const openAIData = await openAIResponse.json();
      const replyText = openAIData.choices?.[0]?.message?.content;
      res.json({ text: replyText });
    } else {
      console.warn("[SEVEN_D_SERVER] AI is offline (no API key). Providing friendly fallback response.");
      res.json({
        text: `🤖 AI sedang offline (Layanan asisten tidak mendeteksi GEMINI_API_KEY atau OPENAI_API_KEY).\n\nSebagai asisten cadangan kelas 7D, aku tetap ingin menyemangatimu! Pelajari bab pelajaran ini di buku paket atau berdiskusilah langsung dengan teman sekelasmu atau Wali Kelas Pak M. Wahyudin, S.Pd ya! Semangat terus belajarnya! 📚✨`,
        offline: true
      });
    }
  } catch (error: any) {
    console.error("AI Chat Route Error:", error);
    res.json({
      text: `🤖 AI sedang mengalami gangguan teknis sementara (${error.message || "Layanan sibuk"}).\n\nJangan khawatir, mari tetap fokus belajar secara mandiri, mengulang materi, dan menyelesaikan misi harian kelas 7D! Jika masalah berlangsung lama, hubungi admin untuk memeriksa koneksi API key.`,
      offline: true,
      error: error.message
    });
  }
});

// AI Document Summarizer (Notes / Text Rangkuman)
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { text, fileData, fileName } = req.body;
    const provider = getAIProvider();
    const systemInstruction = "Anda adalah master perangkum catatan sekolah. Buat rangkuman sesederhana mungkin, estetik dengan pembagian emoji yang tepat, mengelompokkan rumus atau definisi kunci secara menonjol.";

    if (provider === 'gemini') {
      const ai = getAIClient();
      let contents: any[] = [];

      if (fileData) {
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
          systemInstruction,
        }
      });

      res.json({ summary: response.text });
    } else if (provider === 'openai') {
      let messages: any[] = [
        { role: 'system', content: systemInstruction }
      ];

      if (fileData) {
        messages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Rangkumlah gambar/catatan materi berikut dengan format Markdown yang keren. Nama file: ${fileName || 'catatan.png'}`
            },
            {
              type: 'image_url',
              image_url: {
                url: fileData
              }
            }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: `Berikut materi pelajaran yang perlu dirangkum: \n\n${text}\n\nBuatlah dalam format ringkasan markdown estetik.`
        });
      }

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.5
        })
      });

      if (!openAIResponse.ok) {
        const errText = await openAIResponse.text();
        throw new Error(`OpenAI API error: ${errText}`);
      }

      const openAIData = await openAIResponse.json();
      const summary = openAIData.choices?.[0]?.message?.content;
      res.json({ summary });
    } else {
      let summaryText = `⚠️ **AI sedang offline (Tidak ada API key)**\n\n*Sebagai cadangan, berikut adalah draf rangkuman otomatis berdasarkan teks input Anda:*\n\n`;
      if (text) {
        const lines = text.split('\n').filter((l: string) => l.trim().length > 0);
        summaryText += `### 📌 Poin-Poin Penting Pelajaran (Otomatis)\n`;
        lines.slice(0, 5).forEach((line: string) => {
          summaryText += `- ${line}\n`;
        });
        summaryText += `\n### 📖 Glosarium & Istilah Pelajaran 7D\n`;
        summaryText += `- **Materi Pelajaran**: Membahas konsep terkait secara ringkas.\n`;
        summaryText += `\n*Tips Belajar 7D: Hubungi guru atau administrator untuk menyalakan GEMINI_API_KEY atau OPENAI_API_KEY agar mendapatkan rangkuman lengkap bertenaga AI.*`;
      } else {
        summaryText += `### ❌ Tidak ada teks yang dapat dirangkum.\n\nSilakan ketik atau tempel materi pelajaran di sebelah kiri atau unggah catatan materi sekolah terlebih dahulu.`;
      }
      res.json({ summary: summaryText, offline: true });
    }
  } catch (error: any) {
    console.error("AI Summarizer Error:", error);
    let summaryText = `⚠️ **Umpan Balik Darurat (AI mengalami gangguan teknis)**\n\n*Gagal menghubungi model AI: ${error.message || "Layanan sibuk"}. Berikut draf ringkasan parsial:*\n\n`;
    if (req.body.text) {
      const lines = req.body.text.split('\n').filter((l: string) => l.trim().length > 0);
      summaryText += `### 📌 Poin-Poin Instan\n`;
      lines.slice(0, 3).forEach((line: string) => {
        summaryText += `- ${line}\n`;
      });
    } else {
      summaryText += `Silakan coba beberapa saat lagi atau periksa konfigurasi API key Anda.`;
    }
    res.json({ summary: summaryText, offline: true, error: error.message });
  }
});

// AI Quiz Generator (creates 5 interactive quiz questions for a topic)
app.post('/api/ai/quiz', async (req, res) => {
  const fallbackQuiz = [
    {
      question: `[AI sedang offline] Fotosintesis pada tumbuhan hijau terjadi terutama di organ...`,
      options: [
        "Akar Serabut",
        "Batang Kayu",
        "Daun (Kloroplas)",
        "Bunga Mahkota"
      ],
      answerIndex: 2,
      explanation: "Daun mengandung klorofil dalam kloroplas yang menyerap foton matahari untuk proses fotosintesis."
    },
    {
      question: `[AI sedang offline] Persamaan linear x + 5 = 12. Berapakah nilai x yang tepat?`,
      options: [
        "x = 5",
        "x = 7",
        "x = 12",
        "x = 17"
      ],
      answerIndex: 1,
      explanation: "Jika kita kurangkan 5 dari kedua ruas, didapatkan x = 12 - 5, sehingga x = 7."
    },
    {
      question: `[AI sedang offline] Siapa nama Wali Kelas tercinta dari kelas 7D SMPN 2 Lamongan?`,
      options: [
        "Pak M. Wahyudin, S.Pd",
        "Bu Rini Sulastri",
        "Pak Stamford Raffles",
        "Ki Hajar Dewantara"
      ],
      answerIndex: 0,
      explanation: "Wali Kelas 7D SMPN 2 Lamongan yang tercinta adalah Pak M. Wahyudin, S.Pd."
    },
    {
      question: `[AI sedang offline] Manakah contoh energi terbarukan di bumi yang bersih dan melimpah?`,
      options: [
        "Batu bara",
        "Bensin dan solar",
        "Gas bumi cair",
        "Panas sinar matahari"
      ],
      answerIndex: 3,
      explanation: "Sinar matahari tidak akan pernah habis digunakan dan sangat bersih, dikategorikan sebagai energi terbarukan."
    },
    {
      question: `[AI sedang offline] Candi Borobudur didirikan oleh wangsa Syailendra aliran Buddha Mahayana sekitar tahun...`,
      options: [
        "1200 Masehi",
        "1500 Masehi",
        "800-an Masehi",
        "200 SM"
      ],
      answerIndex: 2,
      explanation: "Candi Agung Borobudur didirikan oleh para penganut dinasti Syailendra sekitar tahun 800-an Masehi."
    }
  ];

  try {
    const { topic } = req.body;
    const provider = getAIProvider();

    const systemInstruction = "Buat kuis interaktif anak sekolah SMP Kelas 7. Pertanyaan harus menyenangkan tapi berbobot.";

    if (provider === 'gemini') {
      const ai = getAIClient();

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Buatlah 5 kuiz pilihan ganda seputar topik: "${topic || 'Pelajaran Umum SMP Kelas 7'}". Harus ada 4 opsi per pertanyaan (A, B, C, D) dalam format JSON yang tepat.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "Teks pertanyaan kuiz." },
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
    } else if (provider === 'openai') {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: "Anda adalah master pembuat kuis interaktif kelas 7D SMP. Pastikan output Anda SELALU berupa valid JSON array dari 5 objek kuis. Setiap objek harus memiliki key exact: 'question' (string), 'options' (array dari 4 string), 'answerIndex' (integer 0-3), 'explanation' (string). Hanya kembalikan array JSON tersebut langsung tanpa code fence markdown."
            },
            {
              role: 'user',
              content: `Buatlah 5 kuis dengan 4 opsi pilihan ganda seputar topik: "${topic || 'Pelajaran Umum SMP Kelas 7'}"`
            }
          ]
        })
      });

      if (!openAIResponse.ok) {
        const errText = await openAIResponse.text();
        throw new Error(`OpenAI API error: ${errText}`);
      }

      const openAIData = await openAIResponse.json();
      let text = openAIData.choices?.[0]?.message?.content || "";
      if (text.includes("```json")) {
        text = text.split("```json")[1].split("```")[0];
      } else if (text.includes("```")) {
        text = text.split("```")[1].split("```")[0];
      }
      const parsed = JSON.parse(text.trim());
      const quizData = Array.isArray(parsed) ? parsed : (parsed.quiz || parsed.questions || fallbackQuiz);
      res.json({ quiz: quizData });
    } else {
      let quizTopicCopy = topic || 'Pelajaran Umum SMP Kelas 7';
      const augmentedQuiz = fallbackQuiz.map(q => {
        if (q.question.includes('Fotosintesis') || q.question.includes('Persamaan')) {
          return {
            ...q,
            question: q.question.replace('[AI sedang offline]', `[AI sedang offline] (Topik: ${quizTopicCopy})`)
          };
        }
        return q;
      });
      res.json({ quiz: augmentedQuiz, offline: true });
    }
  } catch (error: any) {
    console.error("AI Quiz Route Error:", error);
    res.json({ quiz: fallbackQuiz, offline: true, error: error.message });
  }
});

// ==========================================
// REAL-TIME DATABASING & PERSISTENCE SECTION
// ==========================================

const isVercel = !!process.env.VERCEL;
const DB_PATH = isVercel
  ? path.join('/tmp', 'classhub_db.json')
  : path.join(process.cwd(), 'classhub_db.json');

// If running in Vercel, copy the pre-packaged db to /tmp if it doesn't exist yet
if (isVercel) {
  try {
    const originalDbPath = path.join(process.cwd(), 'classhub_db.json');
    if (!fs.existsSync(DB_PATH) && fs.existsSync(originalDbPath)) {
      fs.copyFileSync(originalDbPath, DB_PATH);
      console.log("[SEVEN_D_SERVER] Copied initial database to /tmp successfully.");
    }
  } catch (err) {
    console.error("[SEVEN_D_SERVER] Failed to copy fallback database to /tmp:", err);
  }
}

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
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
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

  // Only run standard server listener if not inside Vercel serverless environment
  if (!process.env.VERCEL) {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`[SEVEN_D_SERVER] Full stack app running on http://localhost:${PORT}`);
    });

    // Dynamic upgrade on connection
    server.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  } else {
    console.log("[SEVEN_D_SERVER] Running in Vercel Serverless mode. Skipping .listen()");
  }
}

start().catch((err) => {
  console.error("[SEVEN_D_SERVER] Fatal error during async server startup:", err);
});

export default app;
