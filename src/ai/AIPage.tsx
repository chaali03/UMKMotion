import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateResponse } from '../lib/gemini';

import { 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Send, 
  User,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Menu,
  Plus,
  Trash2,
  MessageSquare,
  Edit2,
  Check,
  Clock,
  ChevronLeft,
  Zap,
  Search,
  LogIn
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'dina';
  timestamp: Date;
  type: 'text' | 'image';
  imageData?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'saskia_chat_sessions';

const AIPage: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    return [{ id: '1', title: 'Percakapan Baru', messages: [], createdAt: new Date(), updatedAt: new Date() }];
  });

  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<{ uid: string; email?: string | null; photoURL?: string | null } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const autoStopTimerRef = useRef<number | null>(null);
  const [interimText, setInterimText] = useState<string>('');
  const [voiceSupported, setVoiceSupported] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string>('');

  const placeholders = [
    "Tanya Dina tentang produk UMKM...",
    "Cari makanan lokal terdekat...",
    "Rekomendasi oleh-oleh khas daerah...",
    "Tips berkembangnya UMKM...",
    "Produk handmade unik..."
  ];

  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const SR = (typeof window !== 'undefined') && (((window as any).SpeechRecognition) || ((window as any).webkitSpeechRecognition));
    setVoiceSupported(!!SR);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    try {
      const key = `${STORAGE_KEY}:${currentUser.uid}`;
      window.localStorage.setItem(key, JSON.stringify(chatSessions));
    } catch {}
  }, [chatSessions, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    try {
      const key = `${STORAGE_KEY}:${currentUser.uid}`;
      const saved = window.localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored: ChatSession[] = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: (session.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setChatSessions(restored.length ? restored : [{ id: '1', title: 'Percakapan Baru', messages: [], createdAt: new Date(), updatedAt: new Date() }]);
        if (restored.length) setCurrentSessionId(restored[0].id);
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user ? { uid: user.uid, email: user.email, photoURL: user.photoURL } : null);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          const data = snap.exists() ? snap.data() as any : null;
          const nick = data?.nickname || data?.fullName || user.displayName || (user.email ? user.email.split('@')[0] : 'Pengguna');
          setDisplayName(nick);
        } catch {
          const nick = user.displayName || (user.email ? user.email.split('@')[0] : 'Pengguna');
          setDisplayName(nick);
        }
      } else {
        setDisplayName('');
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAuthed = !!currentUser;

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Percakapan Baru',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSearchQuery('');
  };

  const deleteChat = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (currentSessionId === sessionId) {
      const remaining = chatSessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    setChatSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title: newTitle, updatedAt: new Date() } : s
    ));
  };

  const startEditingTitle = (sessionId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const saveTitle = () => {
    if (editingSessionId && editingTitle.trim()) {
      updateSessionTitle(editingSessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthed) {
      window.location.href = '/login';
      return;
    }
    if (!inputValue.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || 'Gambar dikirim',
      sender: 'user',
      timestamp: new Date(),
      type: selectedImage ? 'image' : 'text',
      imageData: selectedImage || undefined
    };

    setChatSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { 
            ...session, 
            messages: [...session.messages, userMessage],
            updatedAt: new Date()
          }
        : session
    ));

    setInputValue('');
    setIsLoading(true);

    try {
      const response = await generateResponse(inputValue, selectedImage || undefined);
      
      const saskiaMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'dina',
        timestamp: new Date(),
        type: 'text'
      };

      setChatSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              messages: [...session.messages, saskiaMessage],
              updatedAt: new Date()
            }
          : session
      ));
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        sender: 'dina',
        timestamp: new Date(),
        type: 'text'
      };
      
      setChatSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [...session.messages, errorMessage] }
          : session
      ));
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
    }
  };

  const startRecording = async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        recognitionRef.current = rec;
        rec.lang = 'id-ID';
        rec.interimResults = true;
        rec.continuous = false;
        rec.onstart = () => setIsRecording(true);
        rec.onresult = (e: any) => {
          let finalText = '';
          let interim = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const res = e.results[i];
            if (res.isFinal) {
              finalText += res[0].transcript;
            } else {
              interim += res[0].transcript;
            }
          }
          if (interim) setInterimText(interim);
          if (finalText) {
            setInterimText('');
            setInputValue(finalText.trim());
            try {
              handleSubmit({ preventDefault: () => {} } as any);
            } catch {}
          }
        };
        rec.onerror = (e: any) => {
          setIsRecording(false);
          setInterimText('');
          setVoiceError(String(e?.error || 'Speech recognition error'));
        };
        rec.onend = () => {
          setIsRecording(false);
          setInterimText('');
        };
        setVoiceError('');
        rec.start();
        if (autoStopTimerRef.current) window.clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = window.setTimeout(() => {
          try { rec.stop(); } catch {}
        }, 12000);
      }
    } catch (error) {
      console.error('Error accessing microphone or speech recognition:', error);
      setVoiceError('Tidak bisa mengakses mikrofon. Pastikan izin microphone diijinkan.');
    }
  };

  const stopRecording = () => {
    if (autoStopTimerRef.current) {
      window.clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (recognitionRef.current && isRecording) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsRecording(false);
    setInterimText('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Generate initials from name
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Generate color based on name for consistent avatar color
  const getAvatarColor = (name: string): string => {
    if (!name) return 'bg-orange-500';
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-green-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500',
      'bg-amber-500',
      'bg-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden" style={{ minHeight: '100svh' }}>
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {mounted && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Chat History */}
      <AnimatePresence>
        {mounted && isSidebarOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:relative w-80 max-w-[85vw] h-full bg-white border-r border-slate-200 flex flex-col z-50 shadow-xl lg:shadow-none"
          >
            {/* Sidebar Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base sm:text-lg">Riwayat Chat</h2>
                    <p className="text-xs sm:text-sm text-slate-500">{chatSessions.length} percakapan</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors lg:hidden"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </motion.button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari percakapan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm placeholder:text-slate-400 transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-lg transition-all text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Mulai Chat Baru
              </motion.button>
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredSessions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 sm:py-16 px-4"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Tidak ada percakapan</p>
                    <p className="text-xs text-slate-400">Coba kata kunci lain atau buat chat baru</p>
                  </motion.div>
                ) : (
                  filteredSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      transition={{ 
                        delay: index * 0.03,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                      }}
                      className="group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setCurrentSessionId(session.id);
                          if (window.innerWidth < 1024) {
                            setIsSidebarOpen(false);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setCurrentSessionId(session.id);
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                          }
                        }}
                        className={`w-full text-left p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          currentSessionId === session.id
                            ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            {editingSessionId === session.id ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editingTitle}
                                  onChange={(e) => setEditingTitle(e.target.value)}
                                  onBlur={saveTitle}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveTitle();
                                    if (e.key === 'Escape') {
                                      setEditingSessionId(null);
                                      setEditingTitle('');
                                    }
                                  }}
                                  className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium bg-white text-slate-900 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  autoFocus
                                />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={saveTitle}
                                  className="p-1.5 sm:p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </motion.button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                                  <h3 className={`text-xs sm:text-sm font-semibold truncate pr-2 ${
                                    currentSessionId === session.id ? 'text-white' : 'text-slate-800'
                                  }`}>
                                    {session.title}
                                  </h3>
                                  <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0 ${
                                    currentSessionId === session.id 
                                      ? 'bg-white/20 text-orange-100' 
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {session.messages.length} pesan
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
                                  <Clock className={`w-3 h-3 flex-shrink-0 ${
                                    currentSessionId === session.id ? 'text-orange-100' : 'text-slate-400'
                                  }`} />
                                  <span className={currentSessionId === session.id ? 'text-orange-100' : 'text-slate-500'}>
                                    {mounted ? formatDate(session.updatedAt) : 'Baru saja'}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          {currentSessionId === session.id && editingSessionId !== session.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-1"
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={(e) => startEditingTitle(session.id, session.title, e)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                title="Edit nama"
                              >
                                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              </motion.button>
                              {chatSessions.length > 1 && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={(e) => deleteChat(session.id, e)}
                                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                  title="Hapus chat"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </motion.button>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm">Dina AI Assistant</p>
                  <p className="text-xs text-slate-500">Powered by Gemini</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
              </motion.button>

              <div className="flex items-center gap-3 sm:gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                    <img src="/asset/Dina/ProfileDina.webp" alt="Dina" className="w-full h-full object-cover" />
                  </div>
                </motion.div>
                
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">Dina AI Assistant</h1>
                  <p className="text-xs sm:text-sm text-slate-500">Siap membantu UMKM Indonesia</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.a
                whileHover={{ scale: 1.02, x: -2 }}
                whileTap={{ scale: 0.98 }}
                href={isAuthed ? '/etalase' : '/'}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors text-sm"
                aria-label="Kembali ke beranda"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Kembali</span>
              </motion.a>

              {authReady && (
                !isAuthed ? (
                  <motion.a
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    href="/login"
                    className="shimmer-effect group relative bg-gradient-to-r from-[#ff7a1a] to-[#ff4d00] hover:from-[#ff8534] hover:to-[#ff6914] text-white h-9 sm:h-11 items-center flex justify-center px-3 sm:px-5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 font-semibold text-xs sm:text-sm gap-2 hover:scale-[1.02]"
                  >
                    <LogIn size={16} className="sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
                    <span className="hidden xs:inline">Masuk</span>
                  </motion.a>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="hidden sm:flex flex-col items-end leading-none">
                      <span className="text-sm font-semibold text-slate-900 truncate max-w-[120px] lg:max-w-[160px]">{displayName}</span>
                      <span className="text-[11px] text-slate-500">Masuk</span>
                    </div>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ring-2 ring-white shadow-lg ${getAvatarColor(displayName)}`}>
                      {getInitials(displayName)}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </motion.header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 bg-slate-50 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSessionId}
              className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Empty State */}
              {messages.length === 0 && !isLoading && (
                <div className="py-8 sm:py-12 md:py-20 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-orange-500 rounded-3xl flex items-center justify-center shadow-2xl"
                  >
                    <img 
                      src="/asset/Dina/ProfileDina.webp" 
                      alt="Dina" 
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl object-cover"
                    />
                  </motion.div>
                  
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6"
                  >
                    Hai! Saya Dina
                  </motion.h1>
                  
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
                  >
                    Siap Menjadi Pengertian Untuk Anda!
                    dan merekomendasikan UMKM terdekat. Saya siap menjadi pengertian untuk Anda.
                  </motion.p>

                  {/* Main Input */}
                  {isAuthed ? (
                    <motion.form
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      onSubmit={handleSubmit}
                      className="mx-auto w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
                    >
                      <div className="p-1">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Tanya Dina tentang produk UMKM..."
                          className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-transparent outline-none placeholder:text-slate-400 text-base sm:text-lg"
                        />
                      </div>
                      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 sm:p-3 text-slate-600 hover:bg-white rounded-xl transition-colors border border-slate-200"
                            title="Upload gambar"
                          >
                            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </motion.button>
                          
                          {voiceSupported && (
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onMouseDown={startRecording}
                              onMouseUp={stopRecording}
                              onTouchStart={startRecording}
                              onTouchEnd={stopRecording}
                              className={`p-2 sm:p-3 rounded-xl transition-colors border ${
                                isRecording 
                                  ? 'bg-red-500 text-white border-red-500' 
                                  : 'text-slate-600 hover:bg-white border-slate-200'
                              }`}
                              title="Tekan untuk merekam"
                            >
                              {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </motion.button>
                          )}
                        </div>
                        
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={!inputValue.trim()}
                          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm sm:text-base"
                        >
                          <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Kirim</span>
                        </motion.button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mx-auto w-full max-w-sm sm:max-w-md"
                    >
                      <a
                        href="/login"
                        className="inline-flex items-center justify-center w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-semibold shadow-lg text-sm sm:text-base"
                      >
                        Masuk untuk mulai chat
                      </a>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Messages */}
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.03
                    }}
                    className={`flex gap-3 sm:gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'dina' && (
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-white"
                      >
                        <img src="/asset/Dina/ProfileDina.webp" alt="Dina" className="w-full h-full object-cover" />
                      </motion.div>
                    )}

                    <div className={`flex flex-col max-w-[85%] xs:max-w-[80%] sm:max-w-[70%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className={`px-4 py-3 sm:px-6 sm:py-4 rounded-3xl shadow-lg ${
                          message.sender === 'user'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-slate-800 border border-slate-200'
                        } ${message.type === 'image' ? 'p-3 sm:p-4' : ''}`}
                      >
                        {message.type === 'image' && message.imageData && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mb-2 sm:mb-3"
                          >
                            <img 
                              src={message.imageData} 
                              alt="Uploaded" 
                              className="w-full max-w-[200px] xs:max-w-xs sm:max-w-sm rounded-2xl shadow-md border border-slate-200"
                            />
                          </motion.div>
                        )}
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </motion.div>
                      
                      <div className={`flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 px-1 sm:px-2 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs text-slate-500 font-medium">
                          {mounted ? message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '00:00'}
                        </span>
                        {message.sender === 'dina' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => isSpeaking ? stopSpeaking() : speakText(message.content)}
                            className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            title={isSpeaking ? 'Stop' : 'Dengarkan'}
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                            ) : (
                              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {message.sender === 'user' && (
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base shadow-lg border-2 border-white ${getAvatarColor(displayName)}`}
                      >
                        {isAuthed ? getInitials(displayName) : 'U'}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 sm:gap-4 justify-start"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                    <img src="/asset/Dina/ProfileDina.webp" alt="Dina" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-3xl shadow-lg border border-slate-200">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex gap-1 sm:gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-500 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600 font-medium">Dina sedang mengetik...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Input Area */}
        {messages.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t border-slate-200 bg-white px-3 sm:px-4 md:px-6 py-4 sm:py-6 shadow-lg"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
          >
            <div className="max-w-4xl mx-auto">
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-3 sm:mb-4 relative inline-block"
                >
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl shadow-lg border-2 border-slate-200" 
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.button>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3 w-full max-w-4xl mx-auto">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={mounted ? placeholders[Math.floor(Math.random() * placeholders.length)] : placeholders[0]}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-100 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                    {interimText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl p-2 sm:p-3 shadow-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse" />
                          <span className="font-medium">Mendengarkan:</span>
                          <span className="text-slate-700 truncate">{interimText}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Image Upload */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 sm:p-3 md:p-4 bg-slate-100 hover:bg-white text-slate-700 rounded-2xl transition-all shadow-sm border border-slate-200"
                    title="Upload Gambar"
                  >
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>

                  {/* Voice Recording */}
                  {voiceSupported && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`p-2.5 sm:p-3 md:p-4 rounded-2xl transition-all shadow-sm border ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                          : 'bg-slate-100 hover:bg-white text-slate-700 border-slate-200'
                      }`}
                      title={isRecording ? 'Stop Recording' : 'Hold to Talk'}
                    >
                      {isRecording ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </motion.button>
                  )}

                  {/* Send Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                    className="p-2.5 sm:p-3 md:p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2"
                    title="Kirim Pesan"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </form>

              {voiceError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 sm:mt-3 text-xs text-red-500 flex items-center gap-2"
                >
                  <X className="w-3 h-3" />
                  {voiceError}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 text-center"
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                <span className="text-xs">Dina dapat membantu mencari produk UMKM dan memberikan tips bisnis</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default AIPage;