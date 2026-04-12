import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  User,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Call } from '../types';

const ProfileIcon = ({ gender, photoURL, className }: { gender?: string, photoURL?: string, className?: string }) => {
  if (photoURL) {
    return <img src={photoURL} alt="Profile" className={`object-cover ${className}`} referrerPolicy="no-referrer" />;
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

interface CallModuleProps {
  activeCall: Call;
  isIncoming: boolean;
  onAnswer: () => void;
  onDecline: () => void;
  onEnd: () => void;
  currentUserId: string;
  t: (key: string) => string;
  partnerGender?: string;
  partnerPhotoURL?: string;
  isMuted: boolean;
  isSpeakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
}

export default function CallModule({ 
  activeCall, 
  isIncoming, 
  onAnswer, 
  onDecline, 
  onEnd,
  currentUserId,
  t,
  partnerGender,
  partnerPhotoURL,
  isMuted,
  isSpeakerOn,
  onToggleMute,
  onToggleSpeaker
}: CallModuleProps) {
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: any;
    if (activeCall.status === 'answered') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall.status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const partnerName = activeCall.callerId === currentUserId ? activeCall.receiverName : activeCall.callerName;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-[#1a1a1a] border-4 border-white/10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center p-12 text-center"
      >
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full -z-10" />

        {/* Avatar Area */}
        <div className="relative mb-8">
          <div className={`w-32 h-32 rounded-[2.5rem] border-4 border-white/20 bg-white/5 flex items-center justify-center overflow-hidden ${activeCall.status === 'ringing' ? 'animate-pulse' : ''}`}>
            <ProfileIcon gender={partnerGender} photoURL={partnerPhotoURL} className="w-full h-full" />
          </div>
          {activeCall.status === 'ringing' && (
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 border-2 border-blue-500/50 rounded-[2.5rem] animate-ping" />
              <div className="absolute inset-0 border-2 border-blue-500/30 rounded-[2.5rem] animate-ping [animation-delay:0.5s]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2 mb-12">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{partnerName}</h2>
          <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-xs">
            {activeCall.status === 'ringing' 
              ? (isIncoming ? t('Incoming Call...') : t('Calling...'))
              : formatDuration(callDuration)}
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-8 w-full">
          {activeCall.status === 'ringing' && isIncoming ? (
            <div className="flex gap-6 justify-center">
              <button 
                onClick={onDecline}
                className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(244,63,94,0.5)] hover:scale-110 transition-transform active:scale-95"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
              <button 
                onClick={onAnswer}
                className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(16,185,129,0.5)] hover:scale-110 transition-transform active:scale-95"
              >
                <Phone className="w-8 h-8" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={onToggleMute}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    isMuted ? 'bg-white text-[#141414] border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <button 
                  onClick={onToggleSpeaker}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    !isSpeakerOn ? 'bg-white text-[#141414] border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                  }`}
                >
                  {!isSpeakerOn ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </div>

              <button 
                onClick={onEnd}
                className="w-full py-5 bg-rose-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_8px_24px_-4px_rgba(244,63,94,0.5)] hover:bg-rose-600 transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
              >
                <PhoneOff className="w-6 h-6" />
                {t('End Call')}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 w-full flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('Secure Connection')}</span>
          </div>
          <button className="p-2 text-white/20 hover:text-white/40 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
