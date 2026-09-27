import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageType, User, UserRole } from '../types';
import { MockDatabase } from '../lib/mockStore';
import MessageTemplates from './MessageTemplates';
import { Send, Search, Sparkles, MessageSquare, ShieldAlert, CheckCheck, Clock, UserCheck } from 'lucide-react';

export default function MessagesView() {
  const currentUser = MockDatabase.getCurrentUser();

  const [threads, setThreads] = useState<User[]>([]);
  const [activeRecipient, setActiveRecipient] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load threads
  const loadThreads = () => {
    if (!currentUser) return;
    const allMessages = MockDatabase.getMessages();
    const allUsers = MockDatabase.getUsers();

    // Find all users who have exchanged messages with currentUser
    const participantIds = new Set<string>();
    allMessages.forEach(m => {
      if (m.sender_id === currentUser.id) participantIds.add(m.receiver_id);
      if (m.receiver_id === currentUser.id) participantIds.add(m.sender_id);
    });

    const activeParticipants = allUsers.filter(u => participantIds.has(u.id));
    setThreads(activeParticipants);

    if (activeParticipants.length > 0 && !activeRecipient) {
      setActiveRecipient(activeParticipants[0]);
    }
  };

  // Load messages for active thread
  const loadMessages = () => {
    if (!currentUser || !activeRecipient) return;
    const allMessages = MockDatabase.getMessages();
    const threadMsgs = allMessages.filter(
      m => (m.sender_id === currentUser.id && m.receiver_id === activeRecipient.id) ||
           (m.sender_id === activeRecipient.id && m.receiver_id === currentUser.id)
    );
    setMessages(threadMsgs);

    // Mark as read
    const updated = allMessages.map(m => {
      if (m.sender_id === activeRecipient.id && m.receiver_id === currentUser.id && !m.is_read) {
        return { ...m, is_read: true, read_at: new Date().toISOString() };
      }
      return m;
    });
    MockDatabase.saveMessages(updated);
  };

  useEffect(() => {
    loadThreads();
  }, [currentUser]);

  useEffect(() => {
    loadMessages();
  }, [activeRecipient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Search users to start new chat
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim() || !currentUser) {
      setSearchResults([]);
      return;
    }
    const allUsers = MockDatabase.getUsers().filter(
      u => u.id !== currentUser.id && u.full_name.toLowerCase().includes(val.toLowerCase())
    );
    setSearchResults(allUsers);
  };

  const handleSelectSearchedUser = (user: User) => {
    setActiveRecipient(user);
    setSearchQuery('');
    setSearchResults([]);
    
    // Add to threads list if not already there
    setThreads(prev => {
      if (prev.some(t => t.id === user.id)) return prev;
      return [user, ...prev];
    });
  };

  const handleSend = (textToSend = inputText) => {
    if (!currentUser || !activeRecipient || !textToSend.trim()) return;

    const allMessages = MockDatabase.getMessages();
    const newMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender_id: currentUser.id,
      receiver_id: activeRecipient.id,
      content: textToSend,
      is_read: false,
      message_type: MessageType.TEXT,
      created_at: new Date().toISOString()
    };

    const updatedMessages = [...allMessages, newMsg];
    MockDatabase.saveMessages(updatedMessages);
    setInputText('');
    loadMessages();

    // Log Activity
    MockDatabase.logActivity(
      currentUser.id,
      'MESSAGE_SEND',
      'USER',
      activeRecipient.id,
      `Sent a direct chat message to ${activeRecipient.full_name}`
    );

    // Send Notification trigger to Receiver
    MockDatabase.sendNotification(
      activeRecipient.id,
      'MESSAGE',
      `New Chat Message from ${currentUser.full_name}`,
      textToSend.substring(0, 80),
      '/messages'
    );

    // Simulate immediate automatic smart response for amazing preview engagement!
    setTimeout(() => {
      const currentMsgs = MockDatabase.getMessages();
      const mockAutoResponseText = getAutoResponse(textToSend, activeRecipient.full_name);
      const autoMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender_id: activeRecipient.id,
        receiver_id: currentUser.id,
        content: mockAutoResponseText,
        is_read: false,
        message_type: MessageType.TEXT,
        created_at: new Date().toISOString()
      };
      MockDatabase.saveMessages([...currentMsgs, autoMsg]);
      
      // Update local state if thread remains active
      loadMessages();
    }, 2000);
  };

  const getAutoResponse = (incomingText: string, responderName: string) => {
    const text = incomingText.toLowerCase();
    if (text.includes('hello') || text.includes('hi')) {
      return `Hello! Thanks for reaching out. I am currently available to discuss your service requirements. What can I help you with today?`;
    }
    if (text.includes('price') || text.includes('cost') || text.includes('rate')) {
      return `My service pricing listed on the card represents the baseline rate. For customized contracts, complex integrations, or prolongeddeep sessions, let's map out details and I will offer a custom discount package!`;
    }
    if (text.includes('when') || text.includes('available') || text.includes('schedule')) {
      return `My availability calendar is fully up to date. Feel free to book directly through my service card page. Let me know if you face scheduling overlaps!`;
    }
    return `Got it! That sounds good. Let's schedule a brief discussion soon to detail this project and secure the appointment.`;
  };

  const getUnreadCount = (threadUser: User) => {
    if (!currentUser) return 0;
    return MockDatabase.getMessages().filter(
      m => m.sender_id === threadUser.id && m.receiver_id === currentUser.id && !m.is_read
    ).length;
  };

  const getLastMessage = (threadUser: User) => {
    if (!currentUser) return '';
    const all = MockDatabase.getMessages();
    const threadMsgs = all.filter(
      m => (m.sender_id === currentUser.id && m.receiver_id === threadUser.id) ||
           (m.sender_id === threadUser.id && m.receiver_id === currentUser.id)
    );
    if (threadMsgs.length === 0) return '';
    const last = threadMsgs[threadMsgs.length - 1];
    return last.content;
  };

  if (!currentUser) {
    return (
      <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm mx-auto p-6">
        <ShieldAlert className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Sign In to Open Chat Inbox</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">Collaborate directly with service providers, send attachments, and secure custom offers.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row h-[500px] text-left">
      {/* Threads column */}
      <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/40">
        {/* Thread search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative space-y-3 text-left">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Direct Inbox Channel</span>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Start new chat with provider..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Search suggestions dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 overflow-hidden divide-y divide-slate-50 dark:divide-slate-800 max-h-48 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectSearchedUser(user)}
                  className="w-full text-left px-4 py-2.5 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                    alt={user.full_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>{user.full_name} ({user.role})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List of active threads */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-550 flex flex-col items-center justify-center h-full">
              <MessageSquare className="w-8 h-8 mb-1.5 opacity-40 text-slate-400 dark:text-slate-500" />
              <p className="text-xs font-medium">No conversation logs yet.</p>
            </div>
          ) : (
            threads.map((user) => {
              const unread = getUnreadCount(user);
              const lastMsg = getLastMessage(user);
              const isActive = activeRecipient?.id === user.id;

              return (
                <div
                  key={user.id}
                  onClick={() => setActiveRecipient(user)}
                  className={`p-3.5 hover:bg-white dark:hover:bg-slate-900/40 cursor-pointer transition-colors flex items-start gap-3 text-left ${
                    isActive ? 'bg-white dark:bg-slate-900 border-l-4 border-indigo-600 dark:border-indigo-500' : ''
                  }`}
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                    alt={user.full_name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.full_name}</span>
                      {unread > 0 && (
                        <span className="bg-indigo-600 text-white text-[8px] font-extrabold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] truncate max-w-full leading-none ${unread > 0 ? 'text-slate-800 dark:text-slate-200 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {lastMsg || 'No chat messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message Chat Room column */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 relative">
        {activeRecipient ? (
          <>
            {/* Header info */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={activeRecipient.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                  alt={activeRecipient.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{activeRecipient.full_name}</h4>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">{activeRecipient.role}</span>
                </div>
              </div>

              {/* Template quick inject buttons for providers */}
              {currentUser.role !== UserRole.SEEKER && (
                <MessageTemplates 
                  providerId={currentUser.id} 
                  onTemplateSelected={(processed) => handleSend(processed)} 
                />
              )}
            </div>

            {/* Chats stream container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/20 dark:bg-slate-950/20">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <p className="text-xs font-medium">Say hello to start the conversation!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isOwn = m.sender_id === currentUser.id;

                  return (
                    <div
                      key={m.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[70%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed space-y-1 shadow-sm ${
                          isOwn
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="break-words font-medium">{m.content}</p>
                        <span className={`block text-[8px] font-mono text-right ${isOwn ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input message footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 text-xs border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8">
            <MessageSquare className="w-12 h-12 mb-2 opacity-35" />
            <p className="text-xs font-semibold">Select a conversation block from the left panel to begin chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
