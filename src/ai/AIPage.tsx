import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateResponse } from '../lib/gemini';
import { 
  Bot, 
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
  ChevronLeft
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'saskia';
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
    // SSR-safe: localStorage hanya ada di browser
    if (typeof window === 'undefined') {
      return [
        {
          id: '1',
          title: 'Chat Baru',
          messages: [
            {
              id: '1',
              content: 'Halo! Saya Saskia, asisten AI UMKMotion. Saya siap membantu Anda dengan segala hal tentang UMKM dan bisnis kecil. Ada yang bisa saya bantu hari ini? 😊',
              sender: 'saskia',
              timestamp: new Date(),
              type: 'text'
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
    } catch {}
    return [
      {
        id: '1',
        title: 'Chat Baru',
        messages: [
          {
            id: '1',
            content: 'Halo! Saya Saskia, asisten AI UMKMotion. Saya siap membantu Anda dengan segala hal tentang UMKM dan bisnis kecil. Ada yang bisa saya bantu hari ini? 😊',
            sender: 'saskia',
            timestamp: new Date(),
            type: 'text'
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const placeholders = [
    "Tanya apa saja tentang UMKM...",
    "Bagaimana cara memulai bisnis?",
    "Strategi marketing yang efektif?",
    "Tips kelola keuangan UMKM...",
    "Cara tingkatkan penjualan online..."
  ];

  const currentSession = chatSessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // Save to localStorage whenever chatSessions change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  // Keep sidebar state consistent; do not auto-close when switching chats
  useEffect(() => {
    // no-op to preserve user-toggled sidebar state
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // After mount, sync sidebar visibility by screen size and mark mounted
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Auto-update chat title based on first user message
  useEffect(() => {
    if (currentSession && currentSession.messages.length > 1 && currentSession.title === 'Chat Baru') {
      const firstUserMessage = currentSession.messages.find(m => m.sender === 'user');
      if (firstUserMessage) {
        const newTitle = firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? '...' : '');
        updateSessionTitle(currentSessionId, newTitle);
      }
    }
  }, [currentSession?.messages]);

  const scrollToBottom = (options?: ScrollToOptions) => {
    messagesEndRef.current?.scrollIntoView(options);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Chat Baru',
      messages: [
        {
          id: '1',
          content: 'Halo! Saya Saskia, asisten AI UMKMotion. Ada yang bisa saya bantu hari ini? 😊',
          sender: 'saskia',
          timestamp: new Date(),
          type: 'text'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
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
      s.id === sessionId ? { ...s, title: newTitle } : s
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
        sender: 'saskia',
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
        sender: 'saskia',
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setInputValue('Pesan suara direkam (fitur speech-to-text akan segera hadir)');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {mounted && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
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
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            className="fixed lg:relative w-80 h-full bg-white border-r border-slate-200 flex flex-col z-50 shadow-2xl lg:shadow-none"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-orange-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Riwayat Chat</h2>
                    <p className="text-xs text-slate-500">{chatSessions.length} percakapan</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-white rounded-lg transition-colors lg:hidden"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Chat Baru
              </motion.button>
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <AnimatePresence mode="popLayout">
                {chatSessions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 px-4"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500">Belum ada riwayat chat</p>
                  </motion.div>
                ) : (
                  chatSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <div
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
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                          currentSessionId === session.id
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 border-transparent ring-2 ring-orange-300'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {editingSessionId === session.id ? (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                                  className="flex-1 px-2 py-1 text-sm font-medium bg-white text-slate-900 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  autoFocus
                                />
                                <button
                                  onClick={saveTitle}
                                  className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <h3 className={`text-sm font-semibold truncate mb-1 ${
                                  currentSessionId === session.id ? 'text-white' : 'text-slate-800'
                                }`}>
                                  {session.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs">
                                  <Clock className={`w-3 h-3 ${
                                    currentSessionId === session.id ? 'text-orange-100' : 'text-slate-400'
                                  }`} />
                                  <span className={currentSessionId === session.id ? 'text-orange-100' : 'text-slate-500'}>
                                    {mounted ? formatDate(session.updatedAt) : 'Baru saja'}
                                  </span>
                                  <span className={currentSessionId === session.id ? 'text-orange-200' : 'text-slate-400'}>
                                    • {session.messages.length} pesan
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Actions */}
                          {currentSessionId === session.id && editingSessionId !== session.id && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button"
                                onClick={(e) => startEditingTitle(session.id, session.title, e)}
                                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                title="Edit nama"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {chatSessions.length > 1 && (
                                <button type="button"
                                  onClick={(e) => deleteChat(session.id, e)}
                                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                  title="Hapus chat"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Powered by Gemini AI</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>

              <div className="relative">
                <motion.div
                  initial={{ scale: 0.9, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 160, damping: 22 }}
                  className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20"
                >
                  <Bot className="w-6 h-6 text-white" />
                </motion.div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Saksya <span className="text-orange-600">AI</span>
                </h1>
                <p className="text-xs text-green-600 font-medium">● Aktif sekarang</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-700">Online</span>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSessionId}
              className="max-w-4xl mx-auto space-y-6"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.35, type: "spring", stiffness: 160, damping: 24 }}
                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'saskia' && (
                      <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                  <div className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-white text-slate-800 shadow-md border border-slate-200'
                      } ${message.type === 'image' ? 'p-2' : ''}`}
                    >
                      {message.type === 'image' && message.imageData && (
                        <img 
                          src={message.imageData} 
                          alt="Uploaded" 
                          className="w-full max-w-sm rounded-xl mb-2"
                        />
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    <div className={`flex items-center gap-2 mt-1.5 px-1 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs text-slate-400">
                        {mounted ? message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '00:00'}
                      </span>
                      {message.sender === 'saskia' && (
                        <button
                          onClick={() => isSpeaking ? stopSpeaking() : speakText(message.content)}
                          className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                          title={isSpeaking ? 'Stop' : 'Dengarkan'}
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white px-5 py-3 rounded-2xl shadow-md border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    <span className="text-sm text-slate-600 ml-1">Saksya mengetik</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white/90 backdrop-blur-xl px-4 py-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-3 relative inline-block"
              >
                <img src={selectedImage} alt="Selected" className="w-24 h-24 object-cover rounded-xl shadow-lg border-2 border-orange-200" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={mounted ? placeholders[Math.floor(Math.random() * placeholders.length)] : placeholders[0]}
                  className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-100 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm focus:outline-none transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Recording */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-3 sm:p-3.5 rounded-xl transition-all shadow-md ${
                    isRecording 
                      ? 'bg-red-500 text-white shadow-red-500/30' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Voice Recording'}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </motion.button>

                {/* Image Upload */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 sm:p-3.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all shadow-md"
                  title="Upload Image"
                >
                  <ImageIcon className="w-5 h-5" />
                </motion.button>

                {/* Send Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                  className="p-3 sm:p-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send Message"
                >
                  <Send className="w-5 h-5" />
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

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Saskia dapat membantu dengan pertanyaan seputar UMKM dan bisnis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPage;