/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SEVEN_D_SERVER] Full stack app running on http://localhost:${PORT}`);
  });
}

start();
