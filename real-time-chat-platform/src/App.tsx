import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Check, CheckCheck, Send, User, Circle, MessageSquare, Clock, Edit2, ChevronLeft, Volume2, VolumeX, Settings, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from './lib/utils';

interface User {
  id: string;
  username: string;
  status: 'online' | 'offline';
  custom_status?: string;
  last_seen: number;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  timestamp: number;
  delivered_status: string;
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 max-w-lg w-full">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-sm text-zinc-600 mb-4">The application encountered an unexpected error.</p>
            <pre className="bg-zinc-100 p-4 rounded-lg text-xs overflow-auto text-zinc-800 border border-zinc-200">
              {String(this.state.error)}
            </pre>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800">
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ChatApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [customStatusInput, setCustomStatusInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [presenceSoundEnabled, setPresenceSoundEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const typingState = useRef({
    isTyping: false,
    firstKeystroke: 0,
    lastKeystroke: 0,
    checkInterval: null as NodeJS.Timeout | null
  });

  // Audio Notification
  const playSound = (type: 'message' | 'presence') => {
    if (type === 'message' && !soundEnabled) return;
    if (type === 'presence' && !presenceSoundEnabled) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'message') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
      }
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput })
      });
      const user = await res.json();
      setCurrentUser(user);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  // Initialize Socket & Fetch Data
  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io({
      query: { userId: currentUser.id }
    });

    setSocket(newSocket);

    // Fetch initial data
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch(`/api/conversations/${currentUser.id}`).then(r => r.json())
    ]).then(([usersData, convosData]) => {
      setUsers(Array.isArray(usersData) ? usersData.filter((u: User) => u.id !== currentUser.id) : []);
      setConversations(Array.isArray(convosData) ? convosData : []);
    }).catch(err => console.error('Failed to fetch initial data', err));

    // Socket Events
    newSocket.on('receive_message', (msg: Message) => {
      setMessages(prev => ({
        ...prev,
        [msg.conversation_id]: [...(prev[msg.conversation_id] || []), msg]
      }));
      
      // Update conversation last message
      setConversations(prev => prev.map(c => 
        c.id === msg.conversation_id ? { ...c, lastMessage: msg } : c
      ));

      if (msg.sender_id !== currentUser.id) {
        playSound('message');
      }
    });

    newSocket.on('presence_update', ({ userId, status, last_seen }) => {
      setUsers(prev => prev.map(u => {
        if (u.id === userId && u.status !== status && status === 'online') {
          playSound('presence');
        }
        return u.id === userId ? { ...u, status, last_seen: last_seen || u.last_seen } : u;
      }));
    });

    newSocket.on('typing_update', ({ userId, conversationId, isTyping }) => {
      setTypingUsers(prev => {
        const convTyping = new Set(prev[conversationId] || []);
        if (isTyping) {
          convTyping.add(userId);
        } else {
          convTyping.delete(userId);
        }
        return { ...prev, [conversationId]: convTyping };
      });
    });

    newSocket.on('messages_read', ({ conversationId, messageIds }) => {
      setMessages(prev => {
        const convMsgs = prev[conversationId];
        if (!convMsgs) return prev;
        return {
          ...prev,
          [conversationId]: convMsgs.map(m => 
            messageIds.includes(m.id) ? { ...m, delivered_status: 'read' } : m
          )
        };
      });
      setConversations(prev => prev.map(c => 
        c.id === conversationId && c.lastMessage && messageIds.includes(c.lastMessage.id)
          ? { ...c, lastMessage: { ...c.lastMessage, delivered_status: 'read' } }
          : c
      ));
    });

    newSocket.on('custom_status_update', ({ userId, customStatus }) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, custom_status: customStatus } : u
      ));
      if (currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, custom_status: customStatus } : prev);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  // Fetch messages when conversation changes and mark as read
  useEffect(() => {
    if (!activeConversation || !currentUser || !socket) return;
    
    if (!messages[activeConversation]) {
      fetch(`/api/messages/${activeConversation}`)
        .then(r => r.json())
        .then(data => {
          setMessages(prev => ({ ...prev, [activeConversation]: Array.isArray(data) ? data : [] }));
        })
        .catch(err => console.error('Failed to fetch messages', err));
    }

    socket.emit('join_conversation', activeConversation);
  }, [activeConversation, currentUser, socket]);

  // Mark messages as read when viewing them
  useEffect(() => {
    if (!activeConversation || !currentUser || !socket) return;
    
    const convMsgs = messages[activeConversation] || [];
    const unreadIds = convMsgs
      .filter(m => m.sender_id !== currentUser.id && m.delivered_status !== 'read')
      .map(m => m.id);
    
    if (unreadIds.length > 0) {
      socket.emit('mark_read', { conversationId: activeConversation, messageIds: unreadIds });
      // Optimistically update
      setMessages(prev => ({
        ...prev,
        [activeConversation]: prev[activeConversation].map(m => 
          unreadIds.includes(m.id) ? { ...m, delivered_status: 'read' } : m
        )
      }));
    }
  }, [activeConversation, messages, currentUser, socket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversation, typingUsers]);

  const startConversation = async (otherUserId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: [currentUser.id, otherUserId] })
      });
      const convo = await res.json();
      
      if (!conversations.find(c => c.id === convo.id)) {
        setConversations(prev => [...prev, convo]);
      }
      setActiveConversation(convo.id);
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation || !socket || !currentUser) return;

    const content = messageInput.trim();
    setMessageInput('');
    
    // Stop typing indicator immediately
    if (typingState.current.isTyping) {
      socket.emit('typing', { conversationId: activeConversation, isTyping: false });
      typingState.current.isTyping = false;
    }
    if (typingState.current.checkInterval) {
      clearInterval(typingState.current.checkInterval);
      typingState.current.checkInterval = null;
    }
    typingState.current.firstKeystroke = 0;

    socket.emit('send_message', {
      conversationId: activeConversation,
      content
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!activeConversation || !socket) return;

    const now = Date.now();
    typingState.current.lastKeystroke = now;

    if (!typingState.current.firstKeystroke) {
      typingState.current.firstKeystroke = now;
    }

    if (!typingState.current.checkInterval) {
      typingState.current.checkInterval = setInterval(() => {
        const currentTime = Date.now();
        const inactiveTime = currentTime - typingState.current.lastKeystroke;
        const activeTime = currentTime - typingState.current.firstKeystroke;

        if (inactiveTime > 3000) {
          // Inactive for 3 seconds -> stop typing
          if (typingState.current.isTyping) {
            socket.emit('typing', { conversationId: activeConversation, isTyping: false });
            typingState.current.isTyping = false;
          }
          typingState.current.firstKeystroke = 0;
          if (typingState.current.checkInterval) {
            clearInterval(typingState.current.checkInterval);
            typingState.current.checkInterval = null;
          }
        } else if (activeTime > 2000 && !typingState.current.isTyping) {
          // Actively typing for > 2 seconds -> start typing
          socket.emit('typing', { conversationId: activeConversation, isTyping: true });
          typingState.current.isTyping = true;
        }
      }, 500);
    }
  };

  const saveCustomStatus = () => {
    if (socket && currentUser) {
      socket.emit('update_custom_status', customStatusInput);
    }
    setIsEditingStatus(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900">Welcome to Chat</h1>
            <p className="text-zinc-500 mt-2">Enter a username to get started</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. alice"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeMessages = activeConversation ? messages[activeConversation] || [] : [];
  const activeTyping = activeConversation ? Array.from(typingUsers[activeConversation] || []) : [];
  
  const getOtherUser = (convo: Conversation) => {
    if (!convo || !Array.isArray(convo.participants)) return null;
    const otherId = convo.participants.find(id => id !== currentUser.id);
    return users.find(u => u.id === otherId);
  };

  return (
    <div className="flex h-[100dvh] bg-zinc-50 overflow-hidden relative">
      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Preferences
              </h3>
              <button onClick={() => setShowSettings(false)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-zinc-900">Message Sounds</div>
                  <div className="text-xs text-zinc-500">Play a sound for new messages</div>
                </div>
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", soundEnabled ? "bg-indigo-500" : "bg-zinc-200")}
                >
                  <span className={cn("inline-block h-3 w-3 transform rounded-full bg-white transition-transform", soundEnabled ? "translate-x-5" : "translate-x-1")} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-zinc-900">Presence Sounds</div>
                  <div className="text-xs text-zinc-500">Play a sound when users come online</div>
                </div>
                <button 
                  onClick={() => setPresenceSoundEnabled(!presenceSoundEnabled)}
                  className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", presenceSoundEnabled ? "bg-indigo-500" : "bg-zinc-200")}
                >
                  <span className={cn("inline-block h-3 w-3 transform rounded-full bg-white transition-transform", presenceSoundEnabled ? "translate-x-5" : "translate-x-1")} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 bg-white border-r border-zinc-200 flex-col flex-shrink-0 transition-transform duration-300",
        activeConversation ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold flex-shrink-0">
              {currentUser.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-zinc-900 truncate">{currentUser.username}</h2>
              {isEditingStatus ? (
                <input
                  autoFocus
                  value={customStatusInput}
                  onChange={e => setCustomStatusInput(e.target.value)}
                  onBlur={saveCustomStatus}
                  onKeyDown={e => e.key === 'Enter' && saveCustomStatus()}
                  className="w-full text-xs px-1.5 py-0.5 border border-indigo-300 rounded outline-none focus:ring-1 focus:ring-indigo-500 mt-0.5"
                  placeholder="Set a status..."
                />
              ) : (
                <div 
                  onClick={() => {
                    setCustomStatusInput(currentUser.custom_status || '');
                    setIsEditingStatus(true);
                  }} 
                  className="group flex items-center gap-1.5 cursor-pointer mt-0.5"
                >
                  <div className="flex items-center gap-1.5 text-sm text-emerald-600 flex-shrink-0">
                    <Circle className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-xs text-zinc-500 truncate hover:text-zinc-700 transition-colors">
                    {currentUser.custom_status || 'Set a status...'}
                  </span>
                  <Edit2 className="w-3 h-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors flex-shrink-0 ml-2"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Users List */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Available Users
            </h3>
            <div className="space-y-1">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => startConversation(user.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors text-left"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div className={cn(
                      "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white",
                      user.status === 'online' ? "bg-emerald-500" : "bg-zinc-300"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 truncate">{user.username}</div>
                    {user.custom_status && (
                      <div className="text-xs text-zinc-500 truncate mt-0.5">{user.custom_status}</div>
                    )}
                    {user.status === 'offline' && user.last_seen && !user.custom_status && (
                      <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {user.last_seen ? format(new Date(user.last_seen), 'MMM d, h:mm a') : 'Unknown'}
                      </div>
                    )}
                  </div>
                </button>
              ))}
              {users.length === 0 && (
                <div className="text-sm text-zinc-500 text-center py-4">
                  No other users online
                </div>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div className="p-4 border-t border-zinc-100">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Recent Conversations
            </h3>
            <div className="space-y-1">
              {conversations.map(convo => {
                const otherUser = getOtherUser(convo);
                if (!otherUser) return null;
                
                return (
                  <button
                    key={convo.id}
                    onClick={() => setActiveConversation(convo.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                      activeConversation === convo.id 
                        ? "bg-indigo-50 border border-indigo-100" 
                        : "hover:bg-zinc-50 border border-transparent"
                    )}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-600 font-medium">
                        {otherUser.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                        otherUser.status === 'online' ? "bg-emerald-500" : "bg-zinc-300"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div className="font-medium text-zinc-900 truncate">
                          {otherUser.username}
                        </div>
                        {convo.lastMessage && (
                          <div className="text-xs text-zinc-500">
                            {format(new Date(convo.lastMessage.timestamp), 'h:mm a')}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-zinc-500 truncate flex items-center gap-1">
                        {convo.lastMessage?.sender_id === currentUser.id && (
                          convo.lastMessage.delivered_status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-zinc-400" />
                          )
                        )}
                        {convo.lastMessage ? convo.lastMessage.content : 'Start a conversation'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex-col bg-white min-w-0",
        !activeConversation ? "hidden md:flex" : "flex"
      )}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-zinc-200 flex items-center px-4 md:px-6 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <button 
                onClick={() => setActiveConversation(null)} 
                className="md:hidden mr-3 p-2 -ml-2 rounded-lg hover:bg-zinc-100 text-zinc-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {(() => {
                const convo = conversations.find(c => c.id === activeConversation);
                const otherUser = convo ? getOtherUser(convo) : null;
                return otherUser ? (
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-zinc-900">{otherUser.username}</div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      otherUser.status === 'online' 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-zinc-100 text-zinc-600"
                    )}>
                      {otherUser.status === 'online' ? 'Online' : 'Offline'}
                    </div>
                  </div>
                ) : (
                  <div className="font-semibold text-zinc-900">Chat</div>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeMessages.map((msg, idx) => {
                const isMe = msg.sender_id === currentUser.id;
                const showAvatar = idx === 0 || activeMessages[idx - 1].sender_id !== msg.sender_id;
                
                return (
                  <div key={msg.id} className={cn("flex gap-3", isMe ? "justify-end" : "justify-start")}>
                    {!isMe && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="w-4 h-4 text-zinc-500" />
                      </div>
                    )}
                    {!isMe && !showAvatar && <div className="w-8 flex-shrink-0" />}
                    
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2.5",
                      isMe 
                        ? "bg-indigo-600 text-white rounded-br-sm" 
                        : "bg-zinc-100 text-zinc-900 rounded-bl-sm"
                    )}>
                      <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      <div className={cn(
                        "text-[11px] mt-1 flex items-center gap-1",
                        isMe ? "justify-end text-indigo-200" : "justify-start text-zinc-500"
                      )}>
                        {msg.timestamp ? format(new Date(msg.timestamp), 'h:mm a') : ''}
                        {isMe && (
                          msg.delivered_status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-indigo-300" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {activeTyping.length > 0 && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="bg-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 md:p-4 bg-white border-t border-zinc-200 pb-safe">
              <form onSubmit={sendMessage} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-2.5 md:py-3 outline-none transition-all text-[15px]"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 md:py-3 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-6 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-lg font-medium text-zinc-900">No conversation selected</p>
            <p className="text-sm mt-1">Choose a user from the sidebar to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ChatApp />
    </ErrorBoundary>
  );
}

