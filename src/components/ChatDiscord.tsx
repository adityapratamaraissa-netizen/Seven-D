/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useClassHub } from '../context/ClassHubContext';
import { 
  Smile, Image as ImageIcon, File, Mic, CornerUpLeft, Trash2, 
  Send, Users, Shield, Circle, HelpCircle, Bot, X, Paperclip, Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ChatDiscord: React.FC = () => {
  const {
    currentUser,
    students,
    chatMessages,
    sendChatMessage,
    reactToMessage,
    deleteMessage,
    sendTypingNotice
  } = useClassHub();

  const [messageText, setMessageText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ id: string; name: string; content: string } | null>(null);

  // Attachment controls
  const [attachment, setAttachment] = useState<{ type: 'image' | 'file'; url: string; name: string } | null>(null);
  const [showEmojis, setShowEmojis] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const recordingInterval = useRef<any>(null);

  // Typing notice tracker
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (messageText.trim().length > 0) {
      sendTypingNotice(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingNotice(false);
      }, 2000);
    } else {
      sendTypingNotice(false);
    }
  }, [messageText]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      sendTypingNotice(false);
    };
  }, []);

  // Auto scroll to chat bottom
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!currentUser) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !attachment) return;

    sendChatMessage(
      messageText,
      attachment || undefined,
      replyTarget ? { id: replyTarget.id, name: replyTarget.name, content: replyTarget.content } : undefined
    );

    setMessageText('');
    setReplyTarget(null);
    setAttachment(null);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTypingNotice(false);
  };

  // Simulated Voice Note recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordTimer(0);
    recordingInterval.current = setInterval(() => {
      setRecordTimer(t => t + 1);
    }, 1000);
  };

  const stopRecordingAndSend = () => {
    clearInterval(recordingInterval.current);
    setIsRecording(false);

    // Create a mock premium voice note audio message
    const duration = `${Math.floor(recordTimer / 60)}:${(recordTimer % 60).toString().padStart(2, '0')}`;
    sendChatMessage(
      `🎙️ Mengirim Voice Note (${duration}) — *“Halo teman-teman! Jangan lupa ya bimbingan besok pagi di Ruang BK.”*`,
      {
        type: 'file',
        url: '#voice-note',
        name: `Voice_Note_${Date.now()}.wav`,
        size: `${Math.floor(recordTimer * 12)} KB`
      }
    );
  };

  // Simulation upload proxies
  const triggerImageMock = () => {
    setAttachment({
      type: 'image',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80',
      name: 'Pekerjaan_Rumah_Matematika.png'
    });
  };

  const triggerFileMock = () => {
    setAttachment({
      type: 'file',
      url: '#mock-pdf',
      name: 'Rangkuman_Bab_Sains_Fisika.pdf'
    });
  };

  const currentStudentsOnline = students.filter(s => s.id !== 0);
  const typingStudents = students.filter(s => s.isOnline && s.onlineStatus === 'typing' && s.id !== currentUser.id);

  // Quick react emoji list
  const QUICK_EMOJIS = ["👍", "🔥", "❤️", "💵", "📌", "😆", "✨", "👀"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-sans">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/50 shadow-xs grid grid-cols-1 lg:grid-cols-4 overflow-hidden h-[540px]">
        
        {/* SIDEBAR: ACTIVE MEMBERS DESKTOP */}
        <div className="hidden lg:flex flex-col border-r border-slate-100 bg-slate-50/40 p-4 justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase block">Grup Diskusi</span>
            <h2 className="text-base font-extrabold text-slate-800 mt-1 flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-blue-500" />
              <span>Siswa SEVEN D</span>
            </h2>

            {/* Total Counters */}
            <div className="flex gap-2.5 mt-3 text-[10px] font-bold">
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ● {students.filter(s => s.isOnline).length} Online
              </span>
              <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {students.length} Terdaftar
              </span>
            </div>

            {/* Scrollable Members List */}
            <div className="mt-4 space-y-2 overflow-y-auto max-h-[340px] pr-1">
              {currentStudentsOnline.map((s) => (
                <div 
                  key={s.id} 
                  className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200/20"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="relative">
                      <img 
                        src={s.avatar} 
                        alt={s.name} 
                        className="w-7.5 h-7.5 bg-slate-100 rounded-full object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <Circle className={`w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 ${
                        s.isOnline ? 'bg-green-500 fill-green-500 border border-white' : 'bg-slate-300'
                      }`} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[11px] font-bold text-slate-700 truncate">{s.name.split(' ')[0]} {s.name.split(' ')[1] || ''}</p>
                      <span className="text-[8px] font-mono text-slate-400 capitalize block truncate">
                        {s.role} • Absen {s.id}
                      </span>
                    </div>
                  </div>

                  {s.customStatus && (
                    <span 
                      className="text-[9px] text-slate-400 select-none cursor-help shrink-0 max-w-[50px] truncate"
                      title={s.customStatus}
                    >
                      {s.customStatus}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-white border border-slate-100 rounded-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">Pintu gerbang enkripsi aman 2026 aktif</p>
          </div>
        </div>

        {/* CHAT CHANNELS PANEL */}
        <div className="lg:col-span-3 flex flex-col justify-between h-full bg-white relative">
          
          {/* Top Info Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40 text-xs font-semibold text-slate-700">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-black">#</span>
              <span className="text-slate-800 font-extrabold">diskusi-utama-internal</span>
              <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">| Forum belajar, ngobrol & piket</span>
            </div>

            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100/40">
              Role: <strong>{currentUser.role}</strong>
            </span>
          </div>

          {/* Messages Grid Stream */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 pr-3">
            {chatMessages.map((msg) => {
              const matchesUser = msg.studentId === currentUser.id;
              // Admin/pengurus or own message can delete
              const canDelete = currentUser.role !== 'Member' || currentUser.id === msg.studentId;

              // Query modern live avatar & author metadata dynamically from active synced classroom list
              const senderStudent = students.find(s => s.id === msg.studentId);
              const displayMessageAvatar = senderStudent ? senderStudent.avatar : msg.avatar;
              const displayMessageName = senderStudent ? senderStudent.name : msg.studentName;
              const displayMessageRole = senderStudent ? senderStudent.role : msg.role;

              return (
                <div key={msg.id} className="flex flex-col border border-transparent hover:border-slate-50 hover:bg-slate-50/20 p-2.5 rounded-2xl transition-all relative group/item">
                  
                  {/* Quoted target details mapping (if relies exists) */}
                  {msg.replyTo && (
                    <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 mb-1.5 bg-slate-100/50 py-1 px-2.5 rounded-lg inline-flex max-w-fit border border-slate-200/10 mb-2">
                      <CornerUpLeft className="w-3 h-3 text-slate-400" />
                      <span className="font-bold">{msg.replyTo.name}:</span>
                      <span className="italic truncate max-w-[300px]">"{msg.replyTo.content}"</span>
                    </div>
                  )}

                  <div className="flex items-start space-x-3 text-left">
                    <img 
                      src={displayMessageAvatar} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full border border-slate-200/30 object-cover mt-0.5 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xs font-black text-slate-800">{displayMessageName}</span>
                        {/* Custom role badge */}
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full font-sans truncate ${
                          displayMessageRole === 'Admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                          displayMessageRole.includes('Bendahara') ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          displayMessageRole.includes('Sekretaris') ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          displayMessageRole.includes('Ketua') ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {displayMessageRole}
                        </span>
                        <span className="text-[8px] text-slate-400 font-mono font-medium">{msg.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-sans mt-1.5 select-text font-medium whitespace-pre-line">
                        {msg.content}
                      </p>

                      {/* Display Rich Attachment preview */}
                      {msg.attachment && (
                        <div className="mt-3">
                          {msg.attachment.type === 'image' ? (
                            <div className="border border-slate-200 rounded-2xl overflow-hidden max-w-[240px] shadow-sm bg-slate-50">
                              <img 
                                src={msg.attachment.url} 
                                alt={msg.attachment.name} 
                                className="w-full h-auto object-cover max-h-[160px]"
                                referrerPolicy="no-referrer"
                              />
                              <div className="p-2 border-t border-slate-100 text-[9px] font-semibold text-slate-500 truncate flex items-center justify-between">
                                <span className="truncate">{msg.attachment.name}</span>
                                <span className="text-slate-400 shrink-0">PNG Image</span>
                              </div>
                            </div>
                          ) : (
                            <div className="border border-slate-200 bg-[#FAF9F6] p-3 rounded-2xl max-w-sm flex items-center justify-between text-xs font-semibold text-slate-600 gap-4 shadow-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-red-50 border border-red-100 text-red-500 rounded-lg flex items-center justify-center font-bold">
                                  📄
                                </div>
                                <div className="min-w-0 text-left">
                                  <p className="text-xs font-bold text-slate-700 truncate max-w-[170px]">{msg.attachment.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{msg.attachment.size || '380 KB'}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => alert("Membuka / Mengunduh File Dokumen ...")}
                                className="text-[10px] font-bold text-blue-600 border border-blue-200/50 bg-blue-50 px-2.5 py-1 rounded-lg"
                              >
                                Buka
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Emoji active Reactions pill list */}
                      {msg.reactions.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2.5">
                          {msg.reactions.map((rx, idx) => {
                            const activeUserReacted = rx.users.includes(currentUser.id);
                            return (
                              <button
                                key={idx}
                                onClick={() => reactToMessage(msg.id, rx.emoji)}
                                className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono font-bold flex items-center space-x-1 transition-all hover:bg-slate-50 ${
                                  activeUserReacted 
                                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                                    : 'bg-white border-slate-100 text-slate-400'
                                }`}
                              >
                                <span>{rx.emoji}</span>
                                <span className="text-[9px] font-black">{rx.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Micro hover interaction action tabs (Reply, React emoji, Delete) */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover/item:opacity-100 transition-opacity bg-white border border-slate-200/50 shadow-md rounded-xl p-1 flex items-center gap-1 z-20">
                    <button
                      onClick={() => setReplyTarget({ id: msg.id, name: msg.studentName, content: msg.content })}
                      className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
                      title="Balas pesan"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setShowEmojis(showEmojis === msg.id ? null : msg.id)}
                      className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-orange-500 rounded-lg transition-colors"
                      title="Beri reaksi"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1.5 hover:bg-gradient border-rose-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Hapus pesan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Quick Emojis Drawer popup */}
                    {showEmojis === msg.id && (
                      <div className="absolute right-0 bottom-[105%] bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl shadow-xl p-2.5 flex items-center gap-1.5 z-50">
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              reactToMessage(msg.id, emoji);
                              setShowEmojis(null);
                            }}
                            className="hover:scale-125 transition-transform text-sm p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* ACTIVE ATTACHMENTS REVELATION DRAWER */}
          {attachment && (
            <div className="p-3 bg-slate-50/80 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold text-slate-600">
              <div className="flex items-center space-x-2 truncate">
                <span>📎 Terlampir:</span>
                <span className="text-blue-600 truncate max-w-[260px]">{attachment.name} ({attachment.type === 'image' ? 'Image' : 'PDF'})</span>
              </div>
              <button 
                onClick={() => setAttachment(null)} 
                className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TARGET REPLY SPECIFICATION BAR */}
          {replyTarget && (
            <div className="px-4 py-2 bg-indigo-50/50 border-t border-indigo-200/20 flex items-center justify-between text-[11px] text-indigo-800 font-semibold font-sans">
              <div className="flex items-center space-x-2 truncate">
                <CornerUpLeft className="w-3.5 h-3.5 text-indigo-500" />
                <span>Membalas <strong className="text-indigo-900">{replyTarget.name}</strong>:</span>
                <span className="italic truncate text-indigo-700/80 max-w-[400px]">"{replyTarget.content}"</span>
              </div>
              <button 
                onClick={() => setReplyTarget(null)} 
                className="text-indigo-500 hover:bg-indigo-100 p-1 rounded"
              >
                Batal
              </button>
            </div>
          )}

          {/* Typing Indicator Bar */}
          {typingStudents.length > 0 && (
            <div className="px-5 py-1.5 text-[10px] text-slate-500 font-medium flex items-center gap-2 bg-slate-50/10 border-t border-slate-100">
              <span className="flex space-x-0.5 shrink-0 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span>
                <strong>{typingStudents.map(s => s.name.split(' ')[0]).join(', ')}</strong> sedang mengetik...
              </span>
            </div>
          )}

          {/* Chat Interactive input bar */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/20">
            <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center bg-[#FAFAFA]/80 rounded-2xl border border-slate-200/50 p-2.5">
              
              {/* Voice note record loop button */}
              {isRecording ? (
                <div className="flex items-center space-x-2.5 flex-grow font-sans px-2 py-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  <span className="text-xs text-red-600 font-bold font-mono">Pita Rekam VN: {recordTimer} detik</span>
                  <div className="flex-grow h-4 flex items-center space-x-0.5 px-3">
                    {/* Animated sound waves */}
                    {[1, 2, 3, 2, 1, 3, 4, 2, 1, 2, 3, 4, 3, 2].map((v, i) => (
                      <span key={i} className="w-0.5 bg-red-400 animate-pulse rounded" style={{ height: `${v * 4}px` }} />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={stopRecordingAndSend}
                    className="bg-red-500 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase active:scale-95 transition-transform"
                  >
                    Kirim VN
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={triggerImageMock}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-500 rounded-xl transition-colors"
                      title="Lampirkan Gambar"
                    >
                      <ImageIcon className="w-4.5 h-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={triggerFileMock}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-emerald-500 rounded-xl transition-colors"
                      title="Lampirkan File PDF"
                    >
                      <File className="w-4.5 h-4.5" />
                    </button>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-colors shrink-0"
                      title="Kirim VN"
                    >
                      <Mic className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Tulis pesan Anda sebagai ${currentUser.name.split(' ')[0]} ...`}
                    className="flex-grow bg-white border border-slate-200/50 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-400/50 transition-colors"
                    required={attachment === null}
                  />

                  <button
                    type="submit"
                    className="p-2.5 bg-gradient-to-tr from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
