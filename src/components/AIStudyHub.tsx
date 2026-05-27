/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  Bot, Send, FileText, Sparkles, BookOpen, Brain, RefreshCw, 
  HelpCircle, ArrowRight, CheckCircle2, XCircle, FileImage, Clipboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Simple regex-based markdown parser to ensure 100% reliable rendering without react-markdown bugs
const parseMarkdownToHtml = (text: string) => {
  if (!text) return '';
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h4 class="text-sm font-bold text-slate-800 mt-3 mb-1">$1</h4>');
  html = html.replace(/^## (.*?)$/gm, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-2">$1</h3>');
  html = html.replace(/^# (.*?)$/gm, '<h2 class="text-lg font-extrabold text-slate-900 mt-5 mb-3 border-b pb-1">$1</h2>');
  // Lists
  html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-slate-600 my-0.5">$1</li>');
  html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-slate-600 my-0.5">$1</li>');
  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-indigo-500 bg-indigo-50/50 p-2 italic text-slate-600 rounded-r-lg my-2">$1</blockquote>');
  // Br lines
  html = html.replace(/\n/g, '<br/>');

  return html;
};

export const AIStudyHub: React.FC = () => {
  const { currentUser, solveAIQuizComplete } = useClassHub();

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'summarize' | 'quiz'>('chat');
  const [isAiOnline, setIsAiOnline] = useState<boolean | null>(null);
  const [aiProvider, setAiProvider] = useState<string>('');

  React.useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => {
        setIsAiOnline(data.online);
        setAiProvider(data.provider);
      })
      .catch(err => {
        console.error("Gagal memeriksa status AI:", err);
        setIsAiOnline(false);
      });
  }, []);

  // --- 1. AI Assistant Chat States ---
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Halo! Aku AI Study Buddy Seven D. Kamu ingin berdiskusi pelajaran apa hari ini? Aku menguasai Matematika, IPS, IPA, hingga Coding & AI! 📐🤖' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- 2. Rangkum States ---
  const [materiText, setMateriText] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [isSummLoding, setIsSummLoding] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [fileBase64, setFileBase64] = useState('');

  // Pre-configured Demo Materi to avoid tedious manual input
  const DEMO_MATERI = [
    {
      title: "IPA: Proses Fotosintesis",
      body: "Fotosintesis adalah suatu proses pembuatan makanan oleh tumbuhan hijau dengan bantuan cahaya matahari. Bahan fotosintesis terdiri atas air (H2O) yang diserap akar dari tanah, serta karbon dioksida (CO2) yang diisap daun melalui stomata. Di sel daun terdapat klorofil (zat hijau daun) di dalam kloroplas yang menangkap foton sinar matahari. Melalui reaksi kimia, energi matahari mengonversi air dan karbon dioksida menjadi glukosa (energy kimiawi) dan melepaskan gas oksigen (O2) ke atmosfer."
    },
    {
      title: "IPS: Sejarah Candi Borobudur",
      body: "Candi Borobudur didirikan oleh para penganut agama Buddha Mahayana sekitar tahun 800-an Masehi pada masa pemerintahan wangsa Syailendra di Jawa Tengah. Candi ini berbentuk mandala besar, yang menggambarkan perjalanan spiritual dari Kamadhatu (ranah nafsu duniawi), Rupadhatu (ranah wujud), hingga Arupadhatu (ranah tak berwujud). Sebagai candi Buddha terbesar di dunia, Borobudur sempat tertimbun abu vulkanik Gunung Merapi sebelum diketemukan kembali oleh Sir Thomas Stamford Raffles pada tahun 1814."
    },
    {
      title: "Matematika: Aljabar Linear Satu Variabel",
      body: "Persamaan linear satu variabel adalah kalimat terbuka yang dihubungkan oleh tanda sama dengan (=) dan hanya mempunyai satu variabel berpangkat satu. Bentuk umumnya adalah ax + b = c, dengan a, b, c konstanta, dan a ≠ 0. Langkah penyelesaiannya bertujuan memisahkan variabel di satu ruas dangan cara menambahkan, mengurangkan, mengalikan, atau membagi kedua ruas dengan bilangan yang sama hingga mendapatkan x = nilai tertentu."
    }
  ];

  // --- 3. AI Quiz States ---
  const [quizTopic, setQuizTopic] = useState('Matematika Aljabar');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [lastQuizScore, setLastQuizScore] = useState(0);

  // --- HANDLERS ---

  // Chat Submission handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      const formattedHistory = chatHistory.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        content: h.content
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: formattedHistory })
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Failed to response');
      }

      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.text }]);
      if (data.offline) {
        setIsAiOnline(false);
      }
    } catch (err: any) {
      console.error(err);
      setIsAiOnline(false);
      setChatHistory(prev => [...prev, { role: 'assistant', content: `⚠️ Gagal menghubungi asisten AI: ${err.message}. Layanan beralih ke mode offline.` }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Summarize Handler
  const handleSummarize = async () => {
    if (!materiText && !fileBase64) return;
    setIsSummLoding(true);
    setSummaryResult('');

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: materiText,
          fileData: fileBase64 || undefined,
          fileName: uploadedFileName || undefined
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setSummaryResult(data.summary);
      if (data.offline) {
        setIsAiOnline(false);
      }
    } catch (err: any) {
      setIsAiOnline(false);
      setSummaryResult(`⚠️ **ERROR**: Kegagalan sistem merangkum materi. ${err.message}. Layanan beralih ke mode offline.`);
    } finally {
      setIsSummLoding(false);
    }
  };

  // Drag and drop photo proxy helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Generate Quiz Handler
  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim() || isQuizLoading) return;
    setIsQuizLoading(true);
    setQuizCompleted(false);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);

    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: quizTopic })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.quiz && data.quiz.length > 0) {
        setQuizQuestions(data.quiz);
        if (data.offline) {
          setIsAiOnline(false);
        }
      } else {
        throw new Error("Format kuiz yang dihasilkan tidak valid.");
      }
    } catch (err: any) {
      setIsAiOnline(false);
      alert(`Gagal membuat kuis otomatis: ${err.message}. Menggunakan kuis cadangan.`);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleSelectQuizOption = (optionIdx: number) => {
    const copy = [...selectedAnswers];
    copy[currentQuestionIndex] = optionIdx;
    setSelectedAnswers(copy);
  };

  const handleNextQuizQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(curr => curr + 1);
    } else {
      // Finished quiz! Calculate score
      let correctCount = 0;
      quizQuestions.forEach((q, i) => {
        if (selectedAnswers[i] === q.answerIndex) {
          correctCount++;
        }
      });
      const score = Math.floor((correctCount / quizQuestions.length) * 100);
      setLastQuizScore(score);
      setQuizCompleted(true);

      // Reward XP based on score
      solveAIQuizComplete(score);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/50 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">AI Study Hub 7D</h1>
            <p className="text-xs text-slate-500">Kombinasi AI canggih untuk menyederhanakan aktivitas belajarmu secara instan.</p>
          </div>
        </div>

        {/* Sub tabs selectors */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/30">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'chat' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Study Buddy
          </button>
          <button
            onClick={() => setActiveSubTab('summarize')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'summarize' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Rangkum Materi
          </button>
          <button
            onClick={() => setActiveSubTab('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'quiz' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            AI Quiz Generator
          </button>
        </div>
      </div>

      {/* AI STATUS WARNING BAR */}
      {isAiOnline === false && (
        <div className="bg-amber-50 border border-amber-250/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100/70 rounded-xl text-amber-700 font-bold text-[10px] shrink-0 font-mono">
              OFFLINE
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">AI sedang offline</h4>
              <p className="text-[11px] text-slate-500">API key tidak terdeteksi. Fitur chat, rangkuman, dan kuis berjalan dalam mode fallback offline secara otomatis.</p>
            </div>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold bg-amber-100/50 px-2.5 py-1 rounded-lg">
            Mode Fallback Aktif
          </span>
        </div>
      )}

      {/* SUB PANELS */}
      <div className="w-full">
        {/* TAB 1: AI STUDY COMPANION */}
        {activeSubTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl flex flex-col h-[520px]">
              
              {/* Chat room messages view */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40 rounded-t-3xl text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Bot className="w-4 h-4 text-indigo-500" /> Sesi Belajar Online</span>
                {isAiOnline === false ? (
                  <span className="text-[10px] text-amber-500 font-mono flex items-center gap-1">● AI sedang offline (Fallback)</span>
                ) : (
                  <span className="text-[10px] text-emerald-500 font-mono">● Active Tutor ({aiProvider ? aiProvider.toUpperCase() : 'GEMINI'})</span>
                )}
              </div>

              <div className="flex-grow p-4 overflow-y-auto space-y-4 pr-2">
                {chatHistory.map((h, i) => (
                  <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-4.5 text-xs leading-relaxed ${
                      h.role === 'user' 
                        ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 border border-slate-200/30 text-slate-700 rounded-tl-none'
                    }`}>
                      <p className="font-semibold text-[10px] opacity-75 uppercase tracking-wider mb-1 font-mono">
                        {h.role === 'user' ? (currentUser ? currentUser.name.split(' ')[0] : 'Siswa') : 'AI Buddy'}
                      </p>
                      <div className="whitespace-pre-line font-medium leading-relaxed font-sans mt-1">
                        {h.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-2.5 text-xs text-slate-400 font-semibold rounded-tl-none">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span>Buddy sedang mengetik penjelasannya...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input message form */}
              <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tanyakan materi (Contoh: Apa arti metabolisme?)..."
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:border-blue-400/50 outline-none transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isChatLoading}
                  className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors shadow-sm disabled:bg-indigo-400 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Side column: quick topics */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800">Topik Pelajaran Rekomendasi</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Ajukan bahasan cepat berikut untuk berdiskusi bersama AI:</p>

                <div className="space-y-2 mt-4">
                  {[
                    "Kapan kemerdekaan Indonesia terjadi dan mengapa?",
                    "Jelaskan hukum gravitasi Newton secara ringkas",
                    "Ajarin cara bikin struktur dasar HTML & CSS",
                    "Gimana cara operasi hitung pecahan berpangkat?"
                  ].map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => setChatInput(topic)}
                      className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs text-slate-600 font-medium transition-colors hover:text-slate-800"
                    >
                      💡 "{topic}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI SUMMARY & DOCUMENT */}
        {activeSubTab === 'summarize' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input area */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800">Input Materi</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Tempel teks materi, gunakan demo materi di bawah, atau upload gambar catatanmu.</p>

                {/* File input (simulation) */}
                <div className="mt-4 border border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileImage className="w-6 h-6 text-indigo-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 mt-1">
                    {uploadedFileName ? 'Ganti Catatan' : 'Pilih Foto Catatan'}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono italic block mt-0.5">
                    {uploadedFileName || 'format image PNG/JPG (Maks 5MB)'}
                  </span>
                </div>

                <textarea
                  placeholder="Ketik materi sekolah yang ingin dirangkum..."
                  rows={8}
                  value={materiText}
                  onChange={(e) => setMateriText(e.target.value)}
                  className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs placeholder-slate-400 text-slate-700 focus:bg-white outline-none focus:border-indigo-400/50 transition-colors resize-none"
                />

                <button
                  onClick={handleSummarize}
                  disabled={isSummLoding || (!materiText && !fileBase64)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-semibold mt-4 transition-all shadow-md shadow-indigo-500/10 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {isSummLoding ? 'Menganalisis & Merangkum...' : 'Buat Ringkasan Premium'}
                </button>
              </div>

              {/* Click preset demo materies */}
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Demo Materi Siap Pakai</h3>
                <div className="space-y-2.5 mt-3">
                  {DEMO_MATERI.map((d, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setMateriText(d.body);
                        setUploadedFileName('');
                        setFileBase64('');
                      }}
                      className="w-full text-left p-3 border border-indigo-100 rounded-xl bg-indigo-50/20 hover:bg-indigo-50/50 transition-all text-xs text-indigo-800 font-medium"
                    >
                      📘 Contoh {d.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Rangkuman Output screen */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs min-h-[400px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Hasil Rangkuman AI</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold">Markdown Standard</span>
              </div>

              {/* Output Content */}
              <div className="mt-4 prose bg-slate-50/30 p-4 border border-slate-100 border-dashed rounded-2xl max-h-[500px] overflow-y-auto">
                {isSummLoding ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-xs text-slate-400 font-semibold">Gemini 3.5 sedang merangkum poin-poin terbaik...</p>
                  </div>
                ) : summaryResult ? (
                  <div 
                    className="text-xs text-slate-700 leading-relaxed space-y-3 font-sans"
                    dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(summaryResult) }}
                  />
                ) : (
                  <div className="py-24 text-center text-slate-400">
                    <Sparkles className="w-8 h-8 text-slate-300 mx-auto opacity-70 mb-2" />
                    <p className="text-xs">Hasil rangkuman akan muncul di sini secara estetik.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC QUIZ GENERATOR */}
        {activeSubTab === 'quiz' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input & Create quiz config */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase block font-semibold">EVALUATION</span>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                  <Brain className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Quiz Topic</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Ketik silabus materi (Matematika, IPA, PKn, IPA dll) untuk digenerated kuis pilihan ganda.</p>

                <div className="space-y-4 mt-4">
                  <div>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold focus:bg-white focus:border-indigo-400/50 outline-none"
                      placeholder="Contoh: Peredaran Darah Manusia"
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleGenerateQuiz}
                    disabled={isQuizLoading || !quizTopic.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center space-x-1 transition-all shadow-md shadow-indigo-500/10 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {isQuizLoading ? 'Mengonstruksi Koding Kuis...' : 'Bangun Lembar Kuis AI'}
                  </button>
                </div>

                {/* Info rewards footer */}
                <div className="bg-amber-50/50 border border-amber-200/20 rounded-2xl p-3.5 mt-4 space-y-1">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono">🏆 XP Rewards</p>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Selesaikan kuis dengan akurasi <strong>minimal 80%</strong> untuk mendapatkan <strong>+200 XP</strong> dan menyelesaikan misi harian!
                  </p>
                </div>
              </div>
            </div>

            {/* Quiz Sheet Board */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 shadow-xs">
              
              {isQuizLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-600">AI sedang memformulasikan 5 pertanyaan kognitif & kunci jawaban...</p>
                </div>
              ) : quizCompleted ? (
                // QUIZ COMPLETED STATS PANEL
                <div className="text-center py-12 space-y-6">
                  <CheckCircle2 className={`w-16 h-16 mx-auto ${lastQuizScore >= 80 ? 'text-emerald-500' : 'text-blue-500 animate-bounce'}`} />
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 leading-none">Skuad Quiz Selesai!</h2>
                    <p className="text-slate-500 text-xs mt-2">Skor Kognitif Anda pada materi <strong>{quizTopic}</strong>:</p>
                  </div>

                  {/* Score Indicator */}
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-black text-slate-800 font-mono">{lastQuizScore}%</span>
                    <span className="text-[11px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase mt-2">
                      {lastQuizScore >= 80 ? '🔥 SANGAT MEMUASKAN' : '👍 USAHA YANG BAGUS'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {lastQuizScore >= 80 
                      ? "Reward sebesar +200 XP telah ditambahkan ke data profil, serta bonus ikatan Virtual Pet telah ditingkatkan!" 
                      : "Semangat! Dapatkan di atas 80% lain kompetensi untuk menuntaskan misi kuis harian."}
                  </p>

                  <button
                    onClick={handleGenerateQuiz}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl"
                  >
                    Main Lagi Topik Ini
                  </button>
                </div>

              ) : quizQuestions.length > 0 ? (
                // ACTIVE QUIZ QUESTIONS SCREEN
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Tantangan Kuis {currentQuestionIndex + 1} / {quizQuestions.length}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">{quizTopic}</span>
                  </div>

                  {/* Active Question Text */}
                  <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                    <h3 className="text-sm font-bold text-slate-800 leading-relaxed">
                      {quizQuestions[currentQuestionIndex].question}
                    </h3>
                  </div>

                  {/* Multiple Choice Options List */}
                  <div className="space-y-2.5">
                    {quizQuestions[currentQuestionIndex].options.map((opt: string, idx: number) => {
                      const letters = ['A', 'B', 'C', 'D'];
                      const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectQuizOption(idx)}
                          className={`w-full text-left p-4.5 rounded-2xl border transition-all text-xs font-semibold flex items-center space-x-3 4 hover:bg-slate-50/50 ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs' 
                              : 'bg-white border-slate-200/50 text-slate-700'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-[10px] font-bold font-mono flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {letters[idx]}
                          </span>
                          <span className="flex-grow">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Navigation */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuizQuestion}
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 active:scale-95"
                    >
                      <span>{currentQuestionIndex === quizQuestions.length - 1 ? 'Selesaikan Kuis' : 'Pertanyaan Berikutnya'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              ) : (
                // LANDING QUIZ PLACEHOLDER
                <div className="text-center py-24 space-y-4">
                  <Brain className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">Tidak Ada Kuis Aktif</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      Masukkan pokok pelajaran lalu klik tombol di sebelah kiri untuk menghasilkan lembar kuis AI interaktif.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
