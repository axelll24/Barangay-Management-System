import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  MoreVertical, 
  Search, 
  Phone, 
  Video, 
  Info,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  User,
  MessageSquare,
  Smile,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, UserRole } from '../types';

const ProfileIcon = ({ gender, photoURL, className }: { gender?: string, photoURL?: string, className?: string }) => {
  if (photoURL) {
    return <img src={photoURL} alt="Profile" className={`object-cover ${className}`} />;
  }
  
  if (gender === 'female') {
    return (
      <div className={`bg-pink-100 text-pink-600 flex items-center justify-center ${className}`}>
        <User className="w-1/2 h-1/2" />
      </div>
    );
  }
  
  return (
    <div className={`bg-blue-100 text-blue-600 flex items-center justify-center ${className}`}>
      <User className="w-1/2 h-1/2" />
    </div>
  );
};

interface MessageModuleProps {
  messages: Message[];
  onSendMessage: (text: string, receiverId: string, imageUrl?: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onStartCall: (receiverId: string, type: 'audio' | 'video') => void;
  role: UserRole;
  currentUserId: string;
  currentUserName: string;
  residents: { id: string, name: string, photoURL?: string, gender?: string }[];
  t: (key: string) => string;
}

export default function MessageModule({ 
  messages, 
  onSendMessage, 
  onMarkAsRead,
  onStartCall,
  role, 
  currentUserId,
  currentUserName,
  residents,
  t 
}: MessageModuleProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by chat partner
  const chats = messages.reduce((acc, msg) => {
    const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
    if (!acc[partnerId]) {
      acc[partnerId] = [];
    }
    acc[partnerId].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  // Sort chats by latest message
  const sortedChatPartners = Object.keys(chats).sort((a, b) => {
    const latestA = chats[a][chats[a].length - 1].timestamp;
    const latestB = chats[b][chats[b].length - 1].timestamp;
    return new Date(latestB).getTime() - new Date(latestA).getTime();
  });

  const getPartnerInfo = (partnerId: string) => {
    if (partnerId === 'admin') return { id: 'admin', name: t('Barangay Hall') };
    
    // Prioritize residents array as it has the most up-to-date info
    const resident = residents.find(r => r.id === partnerId);
    if (resident) {
      return resident;
    }

    // Fallback to the latest message from this partner to get their profile
    const partnerMessages = chats[partnerId] || [];
    const msgWithProfile = [...partnerMessages].reverse().find(m => m.senderId === partnerId && m.senderProfile);
    
    if (msgWithProfile && msgWithProfile.senderProfile) {
      return {
        id: partnerId,
        name: msgWithProfile.senderName || msgWithProfile.senderProfile.fullName || partnerId,
        photoURL: msgWithProfile.senderProfile.photoURL,
        gender: msgWithProfile.senderProfile.gender
      };
    }
    
    return { id: partnerId, name: t('User') };
  };

  const selectedPartner = selectedChatId ? getPartnerInfo(selectedChatId) : null;

  const selectedMessages = selectedChatId ? chats[selectedChatId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark unread messages as read
    if (selectedChatId) {
      selectedMessages.forEach(msg => {
        if (msg.receiverId === currentUserId && msg.status === 'unread') {
          onMarkAsRead(msg.id);
        }
      });
    }
  }, [selectedMessages, selectedChatId]);

  const handleSend = () => {
    if (messageInput.trim() && selectedChatId) {
      onSendMessage(messageInput.trim(), selectedChatId);
      setMessageInput('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white border-4 border-[#141414] rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 border-r-4 border-[#141414] flex flex-col ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b-4 border-[#141414] bg-slate-50">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">{t('Messages')}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder={t('Search chats...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border-2 border-[#141414] rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {sortedChatPartners.length > 0 ? (
            sortedChatPartners.map(partnerId => {
              const partner = getPartnerInfo(partnerId);
              const lastMsg = chats[partnerId][chats[partnerId].length - 1];
              const unreadCount = chats[partnerId].filter(m => m.receiverId === currentUserId && m.status === 'unread').length;

              return (
                <button
                  key={partnerId}
                  onClick={() => setSelectedChatId(partnerId)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${
                    selectedChatId === partnerId 
                      ? 'bg-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl border-2 border-[#141414] bg-white overflow-hidden flex items-center justify-center">
                      <ProfileIcon gender={partner?.gender} photoURL={partner?.photoURL} className="w-full h-full" />
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-[#141414] flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-black uppercase tracking-tight truncate text-sm">{partner?.name}</p>
                      <span className={`text-[10px] font-bold ${selectedChatId === partnerId ? 'text-blue-100' : 'text-slate-400'}`}>
                        {formatTime(lastMsg.timestamp)}
                      </span>
                    </div>
                    <p className={`text-xs truncate font-medium ${selectedChatId === partnerId ? 'text-blue-100' : 'text-slate-500'}`}>
                      {lastMsg.senderId === currentUserId && <span className="mr-1">{t('You')}:</span>}
                      {lastMsg.text}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('No messages yet')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        {selectedChatId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b-4 border-[#141414] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedChatId(null)}
                  className="md:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-xl border-2 border-[#141414] bg-slate-50 overflow-hidden flex items-center justify-center">
                  <ProfileIcon gender={selectedPartner?.gender} photoURL={selectedPartner?.photoURL} className="w-full h-full" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm">{selectedPartner?.name}</h3>
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">{t('Online')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onStartCall(selectedChatId, 'audio')}
                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {selectedMessages.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
                const showAvatar = idx === 0 || selectedMessages[idx - 1].senderId !== msg.senderId;

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && showAvatar && (
                        <div className="w-8 h-8 rounded-lg border-2 border-[#141414] bg-white overflow-hidden flex-shrink-0 flex items-center justify-center mt-auto">
                          <ProfileIcon gender={selectedPartner?.gender} photoURL={selectedPartner?.photoURL} className="w-full h-full" />
                        </div>
                      )}
                      {!isMe && !showAvatar && <div className="w-8" />}
                      
                      <div className="space-y-1">
                        <div className={`p-4 rounded-2xl border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${
                          isMe ? 'bg-blue-600 text-white' : 'bg-white text-[#141414]'
                        }`}>
                          <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="" className="mt-2 rounded-xl border-2 border-[#141414] max-w-full" />
                          )}
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${isMe ? 'justify-end text-slate-400' : 'justify-start text-slate-400'}`}>
                          {formatTime(msg.timestamp)}
                          {isMe && (
                            msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t-4 border-[#141414]">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-slate-50 border-2 border-[#141414] rounded-2xl p-2 flex items-end gap-2">
                  <button className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                    <Smile className="w-5 h-5" />
                  </button>
                  <textarea 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder={t('Type a message...')}
                    className="flex-1 bg-transparent border-none outline-none p-2 text-sm font-bold resize-none max-h-32"
                    rows={1}
                  />
                  <button className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className="p-4 bg-blue-600 text-white rounded-2xl border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-blue-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-white border-4 border-[#141414] rounded-[2rem] flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] mb-6">
              <MessageSquare className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{t('Select a chat to start messaging')}</h3>
            <p className="text-slate-400 font-bold max-w-xs">{t('Choose from your existing conversations or start a new one with the barangay hall.')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
