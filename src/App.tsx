/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, useRef, useMemo } from 'react';
import { 
  Heart, 
  ShieldAlert, 
  Users, 
  Lightbulb, 
  Megaphone, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ArrowLeft,
  Plus,
  BarChart3,
  UserCircle,
  CheckCircle2,
  XCircle,
  Clock,
  LogIn,
  UserPlus,
  HandHelping,
  Gift,
  MessageCircle,
  Send,
  Settings,
  Trophy,
  Edit2,
  Trash2,
  LogOut,
  LayoutDashboard,
  UserSquare2,
  Monitor,
  Calendar,
  Info,
  Bell,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  Phone,
  ShieldCheck,
  Home,
  Check,
  Star,
  Loader2,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  Headphones,
  Speaker,
  ChevronUp,
  X,
  Image,
  Paperclip,
  FileText,
  Camera,
  Shield,
  Smartphone,
  Edit3,
  AtSign,
  AlertCircle,
  Save,
  Search,
  Sliders,
  Filter,
  Menu,
  Key,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from "socket.io-client";
import AppointmentModule from './components/AppointmentModule';
import BarangayServiceModule from './components/BarangayServiceModule';
import MessageModule from './components/MessageModule';
import CallModule from './components/CallModule';
import PopulationBreakdownModule from './components/PopulationBreakdownModule';
import { UserRole, ResidentMode, Donation, Official, Announcement, Budget, Project, AuditRequest, AuditReport, Message, Notification, Call, Achievement, Appointment, BarangayService, OfficialAvailability } from './types';
import { db, auth } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  setDoc,
  getDoc,
  or,
  and,
  writeBatch,
  getDocs,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { GoogleGenAI, Type } from '@google/genai';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

import BARANGAY_LOGO from './logo.png'; // Imported logo for Vite bundled handling

const STREET_OPTIONS = [
  "ACACIA ST.",
  "ANOBING ST.",
  "ANTIPOLO COMP.",
  "ANTIPOLO ST.",
  "APITONG ST.",
  "ARANGAN ST.",
  "BAGONG SIBOL",
  "BAKAWAN ST.",
  "BALAYONG ST.",
  "BANSALANGIN ST.",
  "BARANGAY HALL",
  "BATINO ST.",
  "BITAOG ST.",
  "BOBADILLA COMP.",
  "BUNCAYO SUBD. (INCLUDING BANGKAL ST.)",
  "CHRISTIAN VILLAGE",
  "DAO ST.",
  "DITA ST.",
  "DUNGON ST.",
  "GUIHO - MALIGAYA SITE",
  "HONESTA ST.",
  "IPIL-IPIL ST.",
  "IPIT ST.",
  "ISRAEL VILLAGE",
  "JATOBA ST.",
  "KAGAYAWAN ST.",
  "KAKAWATI ST. BUROL AVE.",
  "KALANTAS ST.",
  "KAMAGONG ST.",
  "KAPATIRAN SUBD.",
  "KASTANYAS ST.",
  "LANITE ST. (INCLUDING ST. PETER SUBD.)",
  "LAUAN ST.",
  "MAGARILAO ST.",
  "MAHOGANY ST.",
  "MANGACHUPOY ST.",
  "MANGGAHAN ST.",
  "MANIEBO COMPOUND",
  "MAULAWIN ST.",
  "MAULAWIN ST. TO IPIL ST. RIVERSIDE",
  "MERANTI ST.",
  "MOLAVE ST.",
  "NARRA ST.",
  "NATO ST.",
  "PAG-ASA ST.",
  "PALAPI ST.",
  "PALOTSINA ST.",
  "PART OF SITIO BROTHERS & SISTERS (UNTIL TOOG ST.)",
  "PETER PAUL SUBD.",
  "PINAGPALA SUBD. (PHASE 1,2,3)",
  "PUBLIC MARKET",
  "PUBLIC MARKET TO BANSALANGIN ST. RIVERSIDE",
  "QPLC",
  "REST OF RIVERSIDE",
  "REST OF SITIO BROTHERS & SISTERS",
  "SANGGALAN SUBD.",
  "SAPLUNGAN ST.",
  "SCHOOL SITE",
  "SITIO BOUNDARY (INCLUDING GMELINA ST.)",
  "SITIO LANZONESAN",
  "SITIO RIVERSIDE",
  "TANGGUALAN ST.",
  "TANGUILE ST.",
  "TINDALO ST.",
  "VILLA KATRINA SUBD.",
  "VNH SUBD.",
  "YAKAL ST.",
  "YAKAL ST. TO ANTIPOLO ST. RIVERSIDE"
];

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if ((this as any).state.hasError) {
      let message = "Something went wrong.";
      let isConnectionError = false;
      
      try {
        const errInfo = JSON.parse((this as any).state.error.message);
        if (errInfo.error.includes('insufficient permissions')) {
          message = "You don't have permission to perform this action.";
        } else if (errInfo.error.includes('unavailable') || errInfo.error.includes('offline')) {
          message = "Could not connect to the database. This usually means the Firebase backend needs to be set up or re-provisioned.";
          isConnectionError = true;
        }
      } catch (e) {}
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-900 mb-4">Application Error</h2>
            <p className="text-slate-600 mb-8 font-medium">{message}</p>
            
            {isConnectionError && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-left">
                <p className="text-xs text-amber-800 font-bold uppercase tracking-wider mb-2">Troubleshooting Tip:</p>
                <p className="text-sm text-amber-700 font-medium">
                  If you recently remixed this app, you need to click the **"Set up Firebase"** button in the chat to create a new database for your version.
                </p>
              </div>
            )}

            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// Mock Data
const MOCK_DONATIONS: Donation[] = [
  { id: '1', donorName: 'Juan Dela Cruz', item: 'Rice Sacks', quantity: 10, status: 'available', date: '2024-03-10' },
  { id: '2', donorName: 'Maria Clara', item: 'Canned Goods', quantity: 50, status: 'pending_donation', date: '2024-03-12' },
];

const MOCK_PROJECTS: Project[] = [
  { id: '1', title: 'Solar Street Lights', desc: 'Installation of solar-powered lights along Main St.', votes: 142, status: 'approved', suggestedBy: 'Admin', date: '2024-03-01' },
  { id: '2', title: 'Community Garden', desc: 'Converting the vacant lot in Zone 4 into a vegetable garden.', votes: 89, status: 'approved', suggestedBy: 'Admin', date: '2024-03-05' },
];

const MOCK_BUDGET: Budget[] = [
  { category: 'Health Services', allocated: 500000, spent: 320000 },
  { category: 'Infrastructure', allocated: 1200000, spent: 850000 },
  { category: 'Education', allocated: 300000, spent: 150000 },
];

const MOCK_OFFICIALS: Official[] = [
  { id: '1', name: 'Hon. Manuel S. Ebora', position: 'Barangay Chairman', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400', email: 'manuel.ebora@pahinganorte.gov', phone: '09123456789' },
  { id: '2', name: 'Kag. Marvin Flores Raymundo', position: 'Barangay Councilor', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400', email: 'marvin.raymundo@pahinganorte.gov', phone: '09123456780', streets: ['KASTANYAS ST.', 'MANIEBO COMPOUND', 'PUBLIC MARKET', 'HONESTA ST.', 'LAUAN ST.', 'SAPLUNGAN ST.', 'KAKAWATI ST. BUROL AVE.', 'TANGGUALAN ST.', 'PALOTSINA ST.', 'MAHOGANY ST.', 'BANSALANGIN ST.', 'PUBLIC MARKET TO BANSALANGIN ST.', 'RIVERSIDE'] },
  { id: '3', name: 'Kag. Felimon De Gala Mayuga', position: 'Barangay Councilor', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400', email: 'felimon.mayuga@pahinganorte.gov', phone: '09123456781', streets: ['IPIL-IPIL ST.', 'BAKAWAN ST.', 'APITONG ST.', 'LANITE ST. (INCLUDING ST. PETER SUBD.)', 'BAGONG SIBOL', 'ISRAEL VILLAGE'] },
  { id: '4', name: 'Kag. Alfred Kevin Sebollena Petiza', position: 'Barangay Councilor', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400', email: 'alfred.petiza@pahinganorte.gov', phone: '09123456782', streets: ['YAKAL ST.', 'ACACIA ST.', 'MANGACHUPOY ST.', 'KAMAGONG ST.', 'BALAYONG ST.', 'GUIHO - MALIGAYA SITE', 'YAKAL ST. TO ANTIPOLO ST.', 'RIVERSIDE'] },
  { id: '5', name: 'Kag. Ronan Magnaye Caballero', position: 'Barangay Councilor', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400', email: 'ronan.caballero@pahinganorte.gov', phone: '09123456783', streets: ['ANTIPOLO ST.', 'MAULAWIN ST.', 'MOLAVE ST.', 'TANGUILE ST.', 'BOBADILLA COMP.', 'MANGGAHAN ST.', 'MAULAWIN ST. TO IPIL ST.', 'RIVERSIDE', 'IPIT ST.', 'SCHOOL SITE'] },
  { id: '6', name: 'Kag. Teodoro Capalad Brucal', position: 'Barangay Councilor', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400', email: 'teodoro.bucal@pahinganorte.gov', phone: '09123456784', streets: ['Pag-asa St.', 'Magarilao St.', 'Arangan St.', 'Buncayo Subdivision (including Bangkal St.)', 'Rest of Riverside', 'Narra St.', 'Tindalo St.', 'Dita St.', 'Anobing St.', 'Kagayawan St.'] },
  { id: '7', name: 'Kag. Leo Rosales Ayala', position: 'Barangay Councilor', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400', email: 'leo.ayala@pahinganorte.gov', phone: '09123456785', streets: ['MERANTI ST.', 'VNH SUBD.', 'PALAPI ST.', 'JATOBA ST.', 'SITIO LANZONESAN', 'ANTIPOLO COMP.', 'QPLC', 'SANGGALAN SUBD.', 'BITAOG ST.', 'KALANTAS ST.', 'NATO ST.', 'PART OF SITIO BROTHERS & SISTERS (UNTIL TOOG ST.)', 'SITIO RIVERSIDE', 'BARANGAY HALL', 'BATINO ST.'] },
  { id: '8', name: 'Kag. Jonathan Platon Mercado', position: 'Barangay Councilor', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=400', email: 'jonathan.mercado@pahinganorte.gov', phone: '09123456786', streets: ['PINAGPALA SUBD. (PHASE 1,2,3)', 'KAPATIRAN SUBD.', 'PETER PAUL SUBD.', 'CHRISTIAN VILLAGE', 'VILLA KATRINA SUBD.', 'SITIO BOUNDARY (INCLUDING GMELINA ST.)', 'REST OF SITIO BROTHERS & SISTERS', 'DUNGON ST.', 'DAO ST.'] },
  { id: '9', name: 'Hon. Makmak Makunatan', position: 'SK Chairman', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400', email: 'makmak.makunatan@pahinganorte.gov', phone: '09123456787' },
  { id: '10', name: 'Ms. Glen Corpuz', position: 'Barangay Secretary', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400', email: 'glen.corpuz@pahinganorte.gov', phone: '09123456788' },
  { id: '11', name: 'Mr. Rigor Dimaguiba', position: 'Barangay Treasurer', term: '2023-2026', photo: 'https://images.unsplash.com/photo-1552058544-1271d75d4c9b?auto=format&fit=crop&q=80&w=400&h=400', email: 'rigor.dimaguiba@pahinganorte.gov', phone: '09123456789' },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Barangay General Assembly', content: 'Annual meeting for all residents to discuss community plans.', type: 'event', date: '2024-03-25', color: 'bg-blue-500' },
  { id: '2', title: 'Free Vaccination Drive', content: 'Health center will provide free flu shots for seniors.', type: 'event', date: '2024-03-15', color: 'bg-emerald-500' },
  { id: '3', title: 'Clean-up Drive', content: 'Community-wide cleaning of drainage systems.', type: 'event', date: '2024-03-20', color: 'bg-amber-500' },
];

type AuthStep = 'landing' | 'signin_type' | 'signin_form' | 'create_account' | 'id_verification';

const isValidFullName = (name: string) => {
  const trimmed = name.trim();
  return trimmed.split(/\s+/).filter(word => word.length > 0).length >= 2;
};

const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

const ProfileIcon = ({ gender, photoURL, className }: { gender?: string, photoURL?: string, className?: string }) => {
  if (photoURL) {
    return <img src={photoURL} alt="Profile" className={`${className} object-cover rounded-[2.5rem]`} referrerPolicy="no-referrer" />;
  }
  if (gender === 'female') {
    return <UserCircle className={`${className} text-pink-500`} />;
  }
  if (gender === 'male') {
    return <UserCircle className={`${className} text-blue-500`} />;
  }
  return <UserCircle className={`${className} text-slate-300`} />;
};

const IncomingCallModal = ({ call, onAnswer, onDecline }: { call: Call, onAnswer: (id: string) => void, onDecline: (id: string) => void }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-4 border-[#141414] rounded-3xl p-8 max-w-sm w-full shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] text-center"
      >
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Phone className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-2xl font-black uppercase mb-2">Incoming Call</h3>
        <p className="text-slate-500 font-bold mb-1">From: <span className="text-[#141414]">{call.callerName}</span></p>
        <p className="text-slate-400 text-sm mb-8 italic">Calling for: {call.receiverName}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => onDecline(call.id)}
            className="p-4 bg-rose-500 text-white border-3 border-[#141414] rounded-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" /> Decline
          </button>
          <button 
            onClick={() => onAnswer(call.id)}
            className="p-4 bg-emerald-500 text-white border-3 border-[#141414] rounded-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" /> Answer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ActiveCallModal = ({ 
  call, 
  onEnd, 
  isOfficial,
  isMuted,
  onToggleMute,
  isSpeakerOn,
  onToggleSpeaker
}: { 
  call: Call, 
  onEnd: (id: string) => void, 
  isOfficial: boolean,
  isMuted: boolean,
  onToggleMute: () => void,
  isSpeakerOn: boolean,
  onToggleSpeaker: () => void
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#141414] text-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
        
        <div className="mb-8">
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping"></div>
            <Phone className="w-16 h-16 text-blue-400" />
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">
            {call.status === 'ringing' ? 'Calling...' : 'On Call'}
          </h3>
          <p className="text-slate-400 font-bold">
            {isOfficial ? `With: ${call.callerName}` : `Calling: ${call.receiverName}`}
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-8">
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={onToggleMute}
              className={`p-4 rounded-2xl transition-colors ${isMuted ? 'bg-rose-600/20 text-rose-500' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{isMuted ? 'Muted' : 'Mute'}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button 
              onClick={onToggleSpeaker}
              className={`p-4 rounded-2xl transition-colors ${isSpeakerOn ? 'bg-blue-600/20 text-blue-500' : 'bg-white/10 hover:bg-white/20'}`}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <Speaker className="w-6 h-6" />}
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{isSpeakerOn ? 'Speaker' : 'Headset'}</span>
          </div>
        </div>

        <button 
          onClick={() => onEnd(call.id)}
          className="w-full p-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-3 shadow-lg"
        >
          <X className="w-6 h-6" /> End Call
        </button>
      </motion.div>
    </div>
  );
};

const FullNameReminder = ({ name }: { name: string }) => {
  if (!name.trim() || isValidFullName(name)) return null;
  return (
    <motion.p 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="text-[11px] text-rose-500 font-bold mt-2 flex items-center gap-1.5 bg-rose-50/50 p-3 rounded-xl border border-rose-100"
    >
      <ShieldAlert className="w-3.5 h-3.5" /> Reminder: Please input your complete name (First and Last Name)
    </motion.p>
  );
};

function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder 
}: { 
  options: string[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus-within:border-blue-600 focus-within:bg-white focus-within:ring-8 focus-within:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] cursor-pointer flex items-center justify-between"
      >
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
          <MapPin className="w-5 h-5" />
        </div>
        <span className={value ? "text-[#0F172A]" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b-2 border-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search street..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={(e) => {
                      e.preventDefault();
                      onChange(opt);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      value === opt 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 text-center font-medium">
                  No streets found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const languages = [
  { code: 'en', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'tl', name: 'Tagalog (Filipino)', flag: '🇵🇭' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese (Português)', flag: '🇵🇹' },
];

const translations: Record<string, Record<string, string>> = {
  'Dashboard': { en: 'Dashboard', tl: 'Dashboard', es: 'Tablero', ja: 'ダッシュボード', ko: '대시보드', zh: '仪表板', fr: 'Tableau de bord', de: 'Dashboard', it: 'Dashboard', pt: 'Painel' },
  'Messages': { en: 'Messages', tl: 'Mga Mensahe', es: 'Mensajes', ja: 'メッセージ', ko: '메시지', zh: '消息', fr: 'Messages', de: 'Nachrichten', it: 'Messaggi', pt: 'Mensagens' },
  'Services': { en: 'Services', tl: 'Mga Serbisyo', es: 'Servicios', ja: 'サービス', ko: '서비스', zh: '服务', fr: 'Services', de: 'Dienste', it: 'Servizi', pt: 'Serviços' },
  'Projects': { en: 'Projects', tl: 'Mga Proyekto', es: 'Proyectos', ja: 'プロジェクト', ko: '프로젝트', zh: '项目', fr: 'Projets', de: 'Projekte', it: 'Progetti', pt: 'Projetos' },
  'Budget': { en: 'Budget', tl: 'Badyet', es: 'Presupuesto', ja: '予算', ko: '예산', zh: '预算', fr: 'Budget', de: 'Budget', it: 'Budget', pt: 'Orçamento' },
  'Settings': { en: 'Settings', tl: 'Mga Setting', es: 'Ajustes', ja: '設定', ko: '설정', zh: '设置', fr: 'Paramètres', de: 'Einstellungen', it: 'Impostazioni', pt: 'Configurações' },
  'Language': { en: 'Language', tl: 'Wika', es: 'Idioma', ja: '言語', ko: '언어', zh: '语言', fr: 'Langue', de: 'Sprache', it: 'Lingua', pt: 'Idioma' },
  'English (UK)': { en: 'English (UK)', tl: 'Ingles (UK)', es: 'Inglés (UK)', ja: '英語 (UK)', ko: '영어 (UK)', zh: '英语 (UK)', fr: 'Anglais (UK)', de: 'Englisch (UK)', it: 'Inglese (UK)', pt: 'Inglês (UK)' },
  'Tagalog (Filipino)': { en: 'Tagalog (Filipino)', tl: 'Tagalog (Filipino)', es: 'Tagalo (Filipino)', ja: 'タガログ語 (フィリピン語)', ko: '타갈로그어 (필리핀어)', zh: '他加禄语 (菲律宾语)', fr: 'Tagalog (Philippin)', de: 'Tagalog (Filipino)', it: 'Tagalog (Filippino)', pt: 'Tagalo (Filipino)' },
  'Spanish (Español)': { en: 'Spanish (Español)', tl: 'Kastila (Español)', es: 'Español', ja: 'スペイン語', ko: '스페인어', zh: '西班牙语', fr: 'Espagnol', de: 'Spanisch', it: 'Spagnolo', pt: 'Espanhol' },
  'Japanese (日本語)': { en: 'Japanese (日本語)', tl: 'Hapon (日本語)', es: 'Japonés', ja: '日本語', ko: '일본어', zh: '日语', fr: 'Japonais', de: 'Japanisch', it: 'Giapponese', pt: 'Japonês' },
  'Korean (한국어)': { en: 'Korean (한국어)', tl: 'Koreano (한국어)', es: 'Coreano', ja: '韓国語', ko: '한국어', zh: '韩语', fr: 'Coréen', de: 'Koreanisch', it: 'Coreano', pt: 'Coreano' },
  'Chinese (中文)': { en: 'Chinese (中文)', tl: 'Tsino (中文)', es: 'Chino', ja: '中国語', ko: '중국어', zh: '中文', fr: 'Chinois', de: 'Chinesisch', it: 'Cinese', pt: 'Chinês' },
  'French (Français)': { en: 'French (Français)', tl: 'Pranses (Français)', es: 'Francés', ja: 'フランス語', ko: '프랑스어', zh: '法语', fr: 'Français', de: 'Französisch', it: 'Francese', pt: 'Francês' },
  'German (Deutsch)': { en: 'German (Deutsch)', tl: 'Aleman (Deutsch)', es: 'Alemán', ja: 'ドイツ語', ko: '독일어', zh: '德语', fr: 'Allemand', de: 'Deutsch', it: 'Tedesco', pt: 'Alemão' },
  'Italian (Italiano)': { en: 'Italian (Italiano)', tl: 'Italyano (Italiano)', es: 'Italiano', ja: 'イタリア語', ko: '이탈리아어', zh: '意大利语', fr: 'Italien', de: 'Italienisch', it: 'Italiano', pt: 'Italiano' },
  'Portuguese (Português)': { en: 'Portuguese (Português)', tl: 'Portuges (Português)', es: 'Português', ja: 'ポルトガル語', ko: '포르투갈어', zh: '葡萄牙语', fr: 'Portugais', de: 'Portugiesisch', it: 'Portoghese', pt: 'Português' },
  'Select Gender': { en: 'Select Gender', tl: 'Pumili ng Kasarian', es: 'Seleccionar género', ja: '性別を選択', ko: '성별 선택', zh: '选择性别', fr: 'Sélectionner le genre', de: 'Geschlecht auswählen', it: 'Seleziona genere', pt: 'Selecionar Gênero' },
  'Select your street': { en: 'Select your street', tl: 'Piliin ang iyong kalye', es: 'Selecciona tu calle', ja: '通りを選択してください', ko: '거리를 선택하세요', zh: '选择您的街道', fr: 'Sélectionnez votre rue', de: 'Wählen Sie Ihre Straße', it: 'Seleziona la tua via', pt: 'Selecione sua rua' },
  'Updating...': { en: 'Updating...', tl: 'Ina-update...', es: 'Actualizando...', ja: '更新中...', ko: '업데이트 중...', zh: '更新中...', fr: 'Mise à jour...', de: 'Aktualisierung...', it: 'Aggiornamento...', pt: 'Atualizando...' },
  'Save Changes': { en: 'Save Changes', tl: 'I-save ang mga Pagbabago', es: 'Guardar cambios', ja: '変更を保存', ko: '변경 사항 저장', zh: '保存更改', fr: 'Enregistrer les modifications', de: 'Änderungen speichern', it: 'Salva modifiche', pt: 'Salvar Alterações' },
  'My Profile': { en: 'My Profile', tl: 'Aking Profile', es: 'Mi perfil', ja: 'マイプロフィール', ko: '내 프로필', zh: '我的个人资料', fr: 'Mon profil', de: 'Mein Profil', it: 'Il mio profilo', pt: 'Meu Perfil' },
  'Manage your identity': { en: 'Manage your identity', tl: 'Pamahalaan ang iyong pagkakakilanlan', es: 'Gestiona tu identidad', ja: '身元を管理', ko: '신원 관리', zh: '管理您的身份', fr: 'Gérer votre identité', de: 'Identität verwalten', it: 'Gestisci la tua identità', pt: 'Gerenciar sua identidade' },
  'Display Name': { en: 'Display Name', tl: 'Pangalan sa Display', es: 'Nombre de pantalla', ja: '表示名', ko: '표시 이름', zh: '显示名称', fr: 'Nom d\'affichage', de: 'Anzeigename', it: 'Nome visualizzato', pt: 'Nome de Exibição' },
  'App Preferences': { en: 'App Preferences', tl: 'Mga Kagustuhan sa App', es: 'Preferencias de la aplicación', ja: 'アプリの設定', ko: '앱 기본 설정', zh: '应用偏好', fr: 'Préférences de l\'application', de: 'App-Einstellungen', it: 'Preferenze app', pt: 'Preferências do App' },
  'System & Appearance': { en: 'System & Appearance', tl: 'Sistema at Anyo', es: 'Sistema y apariencia', ja: 'システムと外観', ko: '시스템 및 모양', zh: '系统与外观', fr: 'Système et apparence', de: 'System & Aussehen', it: 'Sistema e aspetto', pt: 'Sistema e Aparência' },
  'Official List': { en: 'Official List', tl: 'Listahan ng Opisyal', es: 'Lista oficial', ja: '公式リスト', ko: '공식 명단', zh: '官方名单', fr: 'Liste officielle', de: 'Offizielle Liste', it: 'Elenco ufficiale', pt: 'Lista Oficial' },
  'Achievements': { en: 'Achievements', tl: 'Mga Nakamit', es: 'Logros', ja: '実績', ko: '업적', zh: '成就', fr: 'Réalisations', de: 'Erfolge', it: 'Traguardi', pt: 'Conquistas' },
  'Log-out': { en: 'Log-out', tl: 'Mag-log Out', es: 'Cerrar sesión', ja: 'ログアウト', ko: '로그아웃', zh: '登出', fr: 'Déconnexion', de: 'Abmelden', it: 'Disconnetti', pt: 'Sair' },
  'Donation': { en: 'Donation', tl: 'Donasyon', es: 'Donación', ja: '寄付', ko: '기부', zh: '捐赠', fr: 'Don', de: 'Spende', it: 'Donazione', pt: 'Doação' },
  'Community sharing': { en: 'Community sharing', tl: 'Pagbabahagi sa komunidad', es: 'Compartir en comunidad', ja: 'コミュニティ共有', ko: '커뮤니티 공유', zh: '社区共享', fr: 'Partage communautaire', de: 'Gemeinschaftliches Teilen', it: 'Condivisione comunitaria', pt: 'Compartilhamento Comunitário' },
  'Kontra Corrupt': { en: 'Kontra Corrupt', tl: 'Kontra Korapsyon', es: 'Contra la corrupción', ja: '腐敗防止', ko: '부패 방지', zh: '反腐败', fr: 'Contre la corruption', de: 'Gegen Korruption', it: 'Contro la corruzione', pt: 'Contra a Corrupção' },
  'Transparency portal': { en: 'Transparency portal', tl: 'Portal ng transparency', es: 'Portal de transparencia', ja: '透明性ポータル', ko: '투명성 포털', zh: '透明度门户', fr: 'Portail de transparence', de: 'Transparenzportal', it: 'Portale trasparenza', pt: 'Portal de Transparência' },
  'Former Officials': { en: 'Former Officials', tl: 'Mga Dating Opisyal', es: 'Ex funcionarios', ja: '元職員', ko: '전직 공무원', zh: '前任官员', fr: 'Anciens officiels', de: 'Ehemalige Beamte', it: 'Ex funzionari', pt: 'Ex-Oficiais' },
  'Meet your local leaders': { en: 'Meet your local leaders', tl: 'Kilalanin ang iyong mga lokal na pinuno', es: 'Conoce a tus líderes locales', ja: '地元のリーダーに会う', ko: '지역 지도자 만나기', zh: '会见您的当地领导人', fr: 'Rencontrez vos dirigeants locaux', de: 'Lernen Sie Ihre lokalen Führungskräfte kennen', it: 'Incontra i tuoi leader locali', pt: 'Conheça seus líderes locais' },
  'Project Suggestion': { en: 'Project Suggestion', tl: 'Mungkahi ng Proyekto', es: 'Sugerencia de proyecto', ja: 'プロジェクトの提案', ko: '프로젝트 제안', zh: '项目建议', fr: 'Suggestion de projet', de: 'Projektvorschlag', it: 'Suggerimento progetto', pt: 'Sugestão de Projeto' },
  'Suggest a Project': { en: 'Suggest a Project', tl: 'Magmungkahi ng Proyekto', es: 'Sugerir un proyecto', ja: 'プロジェクトを提案', ko: '프로젝트 제안하기', zh: '建议一个项目', fr: 'Suggérer un projet', de: 'Projekt vorschlagen', it: 'Suggerisci un progetto', pt: 'Sugerir um Projeto' },
  'Community ideas': { en: 'Community ideas', tl: 'Mga ideya ng komunidad', es: 'Ideas de la comunidad', ja: 'コミュニティのアイデア', ko: '커뮤니티 아이디어', zh: '社区创意', fr: 'Idées de la communauté', de: 'Gemeinschaftsideen', it: 'Idee della comunità', pt: 'Ideias da Comunidade' },
  'Announcements': { en: 'Announcements', tl: 'Mga Anunsyo', es: 'Anuncios', ja: 'お知らせ', ko: '공지사항', zh: '公告', fr: 'Annonces', de: 'Ankündigungen', it: 'Annunci', pt: 'Anúncios' },
  'Latest updates': { en: 'Latest updates', tl: 'Mga pinakabagong update', es: 'Últimas actualizaciones', ja: '最新の更新', ko: '최신 업데이트', zh: '最新动态', fr: 'Dernières mises à jour', de: 'Neueste Updates', it: 'Ultimi aggiornamenti', pt: 'Últimas atualizações' },
  'Manage Appointments': { en: 'Manage Appointments', tl: 'Pamahalaan ang mga Appointment', es: 'Gestionar citas', ja: '予約を管理', ko: '예약 관리', zh: '管理预约', fr: 'Gérer les rendez-vous', de: 'Termine verwalten', it: 'Gestisci appuntamenti', pt: 'Gerenciar Agendamentos' },
  'Set Appointment': { en: 'Set Appointment', tl: 'Magtakda ng Appointment', es: 'Programar cita', ja: '予約を設定', ko: '예약 설정', zh: '设置预约', fr: 'Prendre rendez-vous', de: 'Termin vereinbaren', it: 'Fissa appuntamento', pt: 'Agendar Compromisso' },
  'Review and approve requests': { en: 'Review and approve requests', tl: 'Suriin at aprubahan ang mga kahilingan', es: 'Revisar y aprobar solicitudes', ja: 'リクエストを確認して承認', ko: '요청 검토 및 승인', zh: '审核并批准请求', fr: 'Examiner et approuver les demandes', de: 'Anfragen prüfen und genehmigen', it: 'Rivedi e approva le richieste', pt: 'Revisar e aprovar solicitações' },
  'Schedule your visit': { en: 'Schedule your visit', tl: 'Iskedyul ang iyong pagbisita', es: 'Programa tu visita', ja: '訪問をスケジュール', ko: '방문 일정 예약', zh: '安排您的访问', fr: 'Planifiez votre visite', de: 'Besuch planen', it: 'Pianifica la tua visita', pt: 'Agende sua visita' },
  'System Record Summary': { en: 'System Record Summary', tl: 'Buod ng Rekord ng Sistema', es: 'Resumen de registros del sistema', ja: 'システム記録の概要', ko: '시스템 기록 요약', zh: '系统记录摘要', fr: 'Résumé des dossiers du système', de: 'Systemdatensatz-Zusammenfassung', it: 'Riepilogo record di sistema', pt: 'Resumo de Registros do Sistema' },
  'Pahinga Norte Dashboard': { en: 'Pahinga Norte Dashboard', tl: 'Dashboard ng Pahinga Norte', es: 'Tablero de Pahinga Norte', ja: 'パヒンガ・ノルテ・ダッシュボード', ko: '파힝가 노르테 대시보드', zh: '帕辛加北仪表板', fr: 'Tableau de bord de Pahinga Norte', de: 'Pahinga Norte Dashboard', it: 'Dashboard di Pahinga Norte', pt: 'Painel de Pahinga Norte' },
  'donations': { en: 'Donations', tl: 'Mga Donasyon', es: 'Donaciones', ja: '寄付', ko: '기부', zh: '捐赠', fr: 'Dons', de: 'Spenden', it: 'Donazioni', pt: 'Doações' },
  'transparency': { en: 'Transparency', tl: 'Transparency', es: 'Transparencia', ja: '透明性', ko: '투명성', zh: '透明度', fr: 'Transparence', de: 'Transparenz', it: 'Trasparenza', pt: 'Transparência' },
  'officials': { en: 'Officials', tl: 'Mga Opisyal', es: 'Oficiales', ja: '職員', ko: '공무원', zh: '官员', fr: 'Officiels', de: 'Beamte', it: 'Funzionari', pt: 'Oficiais' },
  'projects': { en: 'Projects', tl: 'Mga Proyekto', es: 'Proyectos', ja: 'プロジェクト', ko: '프로젝트', zh: '项目', fr: 'Projets', de: 'Projekte', it: 'Progetti', pt: 'Projetos' },
  'announcements': { en: 'Announcements', tl: 'Mga Anunsyo', es: 'Anuncios', ja: 'お知らせ', ko: '공지사항', zh: '公告', fr: 'Annonces', de: 'Ankündigungen', it: 'Annunci', pt: 'Anúncios' },
  'appointments': { en: 'Appointments', tl: 'Mga Appointment', es: 'Citas', ja: '予約', ko: '예약', zh: '预约', fr: 'Rendez-vous', de: 'Termine', it: 'Appuntamenti', pt: 'Agendamentos' },
  'officials list': { en: 'Officials List', tl: 'Listahan ng mga Opisyal', es: 'Lista de oficiales', ja: '職員リスト', ko: '공무원 명단', zh: '官员名单', fr: 'Liste des officiels', de: 'Beamtenliste', it: 'Elenco ufficiali', pt: 'Lista de Oficiais' },
  'achievements': { en: 'Achievements', tl: 'Mga Nakamit', es: 'Logros', ja: '実績', ko: '업적', zh: '成就', fr: 'Réalisations', de: 'Erfolge', it: 'Traguardi', pt: 'Conquistas' },
  'settings': { en: 'Settings', tl: 'Mga Setting', es: 'Ajustes', ja: '設定', ko: '설정', zh: '设置', fr: 'Paramètres', de: 'Einstellungen', it: 'Impostazioni', pt: 'Configurações' },
  'Save Preferences': { en: 'Save Preferences', tl: 'I-save ang mga Kagustuhan', es: 'Guardar preferencias', ja: '設定を保存', ko: '기본 설정 저장', zh: '保存偏好', fr: 'Enregistrer les préférences', de: 'Präferenzen speichern', it: 'Salva preferenze', pt: 'Salvar Preferências' },
  'Sound Effects': { en: 'Sound Effects', tl: 'Mga Sound Effect', es: 'Efectos de sonido', ja: '効果音', ko: '음향 효과', zh: '音效', fr: 'Effets sonores', de: 'Soundeffekte', it: 'Effetti sonori', pt: 'Efeitos de Som' },
  'Dark Mode': { en: 'Dark Mode', tl: 'Dark Mode', es: 'Modo oscuro', ja: 'ダークモード', ko: '다크 모드', zh: '深色模式', fr: 'Mode sombre', de: 'Dunkelmodus', it: 'Modalità scura', pt: 'Modo Escuro' },
  'Old Password': { en: 'Old Password', tl: 'Lumang Password', es: 'Contraseña anterior', ja: '旧パスワード', ko: '이전 비밀번호', zh: '旧密码', fr: 'Ancien mot de passe', de: 'Altes Passwort', it: 'Vecchia password', pt: 'Senha antiga' },
  'New Password': { en: 'New Password', tl: 'Bagong Password', es: 'Nueva contraseña', ja: '新しいパスワード', ko: '새 비밀번호', zh: '新密码', fr: 'Nouveau mot de passe', de: 'Neues Passwort', it: 'Nuova password', pt: 'Nova senha' },
  'Confirm New Password': { en: 'Confirm New Password', tl: 'Kumpirmahin ang Bagong Password', es: 'Confirmar nueva contraseña', ja: '新しいパスワードの確認', ko: '새 비밀번호 확인', zh: '确认新密码', fr: 'Confirmer le nouveau mot de passe', de: 'Neues Passwort bestätigen', it: 'Conferma nuova password', pt: 'Confirmar nova senha' },
  'Update Password': { en: 'Update Password', tl: 'I-update ang Password', es: 'Actualizar contraseña', ja: 'パスワードを更新', ko: '비밀번호 업데이트', zh: '更新密码', fr: 'Mettre à jour le mot de passe', de: 'Passwort aktualisieren', it: 'Aggiorna password', pt: 'Atualizar senha' },
  'Incorrect old password. Please try again.': { 
    en: 'Incorrect old password. Please try again.', 
    tl: 'May kailangan ka pang ayusin o i-check. Mali ang inilagay mong lumang password.',
    es: 'Contraseña anterior incorrecta. Por favor, inténtalo de nuevo.',
    ja: '旧パスワードが正しくありません。もう一度お試しください。',
    ko: '이전 비밀번호가 올바르지 않습니다. 다시 시도해 주세요.',
    zh: '旧密码错误。请重试。',
    fr: 'Ancien mot de passe incorrect. Veuillez réessayer.',
    de: 'Altes Passwort falsch. Bitte versuchen Sie es erneut.',
    it: 'Vecchia password errata. Riprova.',
    pt: 'Senha antiga incorreta. Por favor, tente novamente.'
  },
  'Passwords do not match!': { 
    en: 'Passwords do not match!', 
    tl: 'May kailangan ka pang ayusin o i-check. Hindi magkatugma ang iyong bagong password.',
    es: '¡Las contraseñas no coinciden!',
    ja: 'パスワードが一致しません！',
    ko: '비밀번호가 일치하지 않습니다!',
    zh: '密码不匹配！',
    fr: 'Les mots de passe ne correspondent pas !',
    de: 'Passwörter stimmen nicht überein!',
    it: 'Le password non corrispondono!',
    pt: 'As senhas não coincidem!'
  },
  'Your password is incorrect and does not match.': {
    en: 'Your password is incorrect and does not match.',
    tl: 'May kailangan ka pang ayusin o i-check. Mali ang iyong password at hindi ito magkatugma.',
    es: 'Tu contraseña es incorrecta y no coincide.',
    ja: 'パスワードが正しくないか、一致しません。',
    ko: '비밀번호가 올바르지 않거나 일치하지 않습니다.',
    zh: '您的密码错误且不匹配。',
    fr: 'Votre mot de passe est incorrect et ne correspond pas.',
    de: 'Ihr Passwort ist falsch und stimmt nicht überein.',
    it: 'La tua password è errata e non corrisponde.',
    pt: 'Sua senha está incorreta e não coincide.'
  },
  'Application Error': { en: 'Application Error', tl: 'Error sa Application', es: 'Error de la aplicación', ja: 'アプリケーションエラー', ko: '애플리케이션 오류', zh: '应用错误', fr: 'Erreur d\'application', de: 'Anwendungsfehler', it: 'Errore applicazione', pt: 'Erro de Aplicativo' },
  'Incoming Call': { en: 'Incoming Call', tl: 'Papapasok na Tawag', es: 'Llamada entrante', ja: '着信', ko: '수신 전화', zh: '来电', fr: 'Appel entrant', de: 'Eingehender Anruf', it: 'Chiamata in arrivo', pt: 'Chamada Recebida' },
  'Hall of': { en: 'Hall of', tl: 'Bulwagan ng', es: 'Salón de', ja: '殿堂', ko: '명예의 전당', zh: '名人堂', fr: 'Temple de la', de: 'Ruhmeshalle von', it: 'Sala della', pt: 'Galeria de' },
  'Excellence': { en: 'Excellence', tl: 'Kahusayan', es: 'Excelencia', ja: '卓越', ko: '탁월함', zh: '卓越', fr: 'Excellence', de: 'Exzellenz', it: 'Eccellenza', pt: 'Excelência' },
  'Certificate of Recognition': { en: 'Certificate of Recognition', tl: 'Sertipiko ng Pagkilala', es: 'Certificado de reconocimiento', ja: '表彰状', ko: '인정 증서', zh: '表彰证书', fr: 'Certificat de reconnaissance', de: 'Anerkennungsurkunde', it: 'Certificato di riconoscimento', pt: 'Certificado de Reconhecimento' },
  'This certificate is proudly presented to the community for': { en: 'This certificate is proudly presented to the community for', tl: 'Ang sertipikong ito ay buong pagmamalaking ipinapakita sa komunidad para sa', es: 'Este certificado se presenta con orgullo a la comunidad por', ja: 'この証明書は、以下の理由によりコミュニティに誇りを持って授与されます', ko: '이 증서는 지역 사회에 다음과 같은 이유로 자랑스럽게 수여됩니다', zh: '此证书荣幸地颁发给社区，以表彰', fr: 'Ce certificat est fièrement présenté à la communauté pour', de: 'Diese Urkunde wird der Gemeinschaft stolz überreicht für', it: 'Questo certificato è orgogliosamente presentato alla comunità per', pt: 'Este certificado é orgulhosamente apresentado à comunidade por' },
  'Date Awarded': { en: 'Date Awarded', tl: 'Petsa ng Paggawad', es: 'Fecha otorgada', ja: '授与日', ko: '수여일', zh: '颁发日期', fr: 'Date d\'attribution', de: 'Verleihungsdatum', it: 'Data di assegnazione', pt: 'Data de Atribuição' },
  'Authorized By': { en: 'Authorized By', tl: 'Pinahintulutan ni', es: 'Autorizado por', ja: '承認者', ko: '승인자', zh: '授权人', fr: 'Autorisé par', de: 'Autorisiert von', it: 'Autorizzato da', pt: 'Autorizado por' },
  'Local Government Unit': { en: 'Local Government Unit', tl: 'Yunit ng Lokal na Pamahalaan', es: 'Unidad de Gobierno Local', ja: '地方自治体', ko: '지방 정부 기관', zh: '地方政府单位', fr: 'Unité de gouvernement local', de: 'Lokale Regierungseinheit', it: 'Unità di governo locale', pt: 'Unidade de Governo Local' },
  'Title': { en: 'Title', tl: 'Pamagat', es: 'Título', ja: 'タイトル', ko: '제목', zh: '标题', fr: 'Titre', de: 'Titel', it: 'Titolo', pt: 'Título' },
  'Year': { en: 'Year', tl: 'Taon', es: 'Año', ja: '年', ko: '년', zh: '年份', fr: 'Année', de: 'Jahr', it: 'Anno', pt: 'Ano' },
  'Description': { en: 'Description', tl: 'Paglalarawan', es: 'Descripción', ja: '説明', ko: '설명', zh: '描述', fr: 'Description', de: 'Beschreibung', it: 'Descrizione', pt: 'Descrição' },
  'Icon': { en: 'Icon', tl: 'Icon', es: 'Icono', ja: 'アイコン', ko: '아이콘', zh: '图标', fr: 'Icône', de: 'Symbol', it: 'Icona', pt: 'Ícone' },
  'Trophy': { en: 'Trophy', tl: 'Tropeo', es: 'Trofeo', ja: 'トロフィー', ko: '트로피', zh: '奖杯', fr: 'Trophée', de: 'Trophäe', it: 'Trofeo', pt: 'Troféu' },
  'Check Mark': { en: 'Check Mark', tl: 'Check Mark', es: 'Marca de verificación', ja: 'チェックマーク', ko: '체크 표시', zh: '复选标记', fr: 'Coche', de: 'Häkchen', it: 'Segno di spunta', pt: 'Marca de Verificação' },
  'Shield': { en: 'Shield', tl: 'Kalasag', es: 'Escudo', ja: 'シールド', ko: '방패', zh: '盾牌', fr: 'Bouclier', de: 'Schild', it: 'Scudo', pt: 'Escudo' },
  'Lightbulb': { en: 'Lightbulb', tl: 'Bumbilya', es: 'Bombilla', ja: '電球', ko: '전구', zh: '灯泡', fr: 'Ampoule', de: 'Glühbirne', it: 'Lampadina', pt: 'Lâmpada' },
  'Star': { en: 'Star', tl: 'Bituin', es: 'Estrella', ja: '星', ko: '별', zh: '星星', fr: 'Étoile', de: 'Stern', it: 'Stella', pt: 'Estrela' },
  'Heart': { en: 'Heart', tl: 'Puso', es: 'Corazón', ja: 'ハート', ko: '하트', zh: '心形', fr: 'Cœur', de: 'Herz', it: 'Cuore', pt: 'Coração' },
  'Color Theme': { en: 'Color Theme', tl: 'Tema ng Kulay', es: 'Tema de color', ja: 'カラーテーマ', ko: '색상 테마', zh: '颜色主题', fr: 'Thème de couleur', de: 'Farbschema', it: 'Tema colore', pt: 'Tema de Cores' },
  'Blue': { en: 'Blue', tl: 'Asul', es: 'Azul', ja: '青', ko: '파랑', zh: '蓝色', fr: 'Bleu', de: 'Blau', it: 'Blu', pt: 'Azul' },
  'Emerald': { en: 'Emerald', tl: 'Esmeralda', es: 'Esmeralda', ja: 'エメラルド', ko: '에메랄드', zh: '祖母绿', fr: 'Émeraude', de: 'Smaragdgrün', it: 'Smeraldo', pt: 'Esmeralda' },
  'Amber': { en: 'Amber', tl: 'Amber', es: 'Ámbar', ja: 'アンバー', ko: '호박색', zh: '琥珀色', fr: 'Ambre', de: 'Bernstein', it: 'Ambra', pt: 'Âmbar' },
  'Rose': { en: 'Rose', tl: 'Rosas', es: 'Rosa', ja: 'ローズ', ko: '장미색', zh: '玫瑰色', fr: 'Rose', de: 'Rosé', it: 'Rosa', pt: 'Rosa' },
  'Purple': { en: 'Purple', tl: 'Lila', es: 'Púrpura', ja: '紫', ko: '보라', zh: '紫色', fr: 'Violet', de: 'Lila', it: 'Viola', pt: 'Roxo' },
  'Management System': { en: 'Management System', tl: 'Sistema ng Pamamahala', es: 'Sistema de gestión', ja: '管理システム', ko: '관리 시스템', zh: '管理系统', fr: 'Système de gestion', de: 'Managementsystem', it: 'Sistema di gestione', pt: 'Sistema de Gestão' },
  'Nickname': { en: 'Nickname', tl: 'Palayaw', es: 'Apodo', ja: 'ニックネーム', ko: '닉네임', zh: '昵称', fr: 'Surnom', de: 'Spitzname', it: 'Soprannome', pt: 'Apelido' },
  'Notice': { en: 'Notice', tl: 'Paunawa', es: 'Aviso', ja: '通知', ko: '공지', zh: '通知', fr: 'Avis', de: 'Hinweis', it: 'Avviso', pt: 'Aviso' },
  'Confirm Action': { en: 'Confirm Action', tl: 'Kumpirmahin ang Aksyon', es: 'Confirmar acción', ja: 'アクションを確認', ko: '작업 확인', zh: '确认操作', fr: 'Confirmer l\'action', de: 'Aktion bestätigen', it: 'Conferma azione', pt: 'Confirmar Ação' },
  'User Profile': { en: 'User Profile', tl: 'Profile ng User', es: 'Perfil de usuario', ja: 'ユーザープロフィール', ko: '사용자 프로필', zh: '用户资料', fr: 'Profil utilisateur', de: 'Benutzerprofil', it: 'Profilo utente', pt: 'Perfil de Usuário' },
  'Verified Resident': { en: 'Verified Resident', tl: 'Beripikadong Residente', es: 'Residente verificado', ja: '確認済み住民', ko: '인증된 주민', zh: '已验证居民', fr: 'Résident vérifié', de: 'Verifizierter Bewohner', it: 'Residente verificato', pt: 'Residente Verificado' },
  'Contact Number': { en: 'Contact Number', tl: 'Numero ng Kontak', es: 'Número de contacto', ja: '連絡先番号', ko: '연락처 번호', zh: '联系电话', fr: 'Numéro de contact', de: 'Kontaktnummer', it: 'Numero di contatto', pt: 'Número de Contato' },
  'Messenger': { en: 'Messenger', tl: 'Messenger', es: 'Messenger', ja: 'メッセンジャー', ko: '메신저', zh: '信使', fr: 'Messenger', de: 'Messenger', it: 'Messenger', pt: 'Messenger' },
  'Recent Conversations': { en: 'Recent Conversations', tl: 'Mga Kamakailang Pag-uusap', es: 'Conversaciones recientes', ja: '最近の会話', ko: '최근 대화', zh: '近期对话', fr: 'Conversations récentes', de: 'Letzte Unterhaltungen', it: 'Conversazioni recenti', pt: 'Conversas Recentes' },
  'Confirm Logout': { en: 'Confirm Logout', tl: 'Kumpirmahin ang Pag-log Out', es: 'Confirmar cierre de sesión', ja: 'ログアウトを確認', ko: '로그아웃 확인', zh: '确认登出', fr: 'Confirmer la déconnexion', de: 'Abmeldung bestätigen', it: 'Conferma disconnessione', pt: 'Confirmar Saída' },
  'No notifications yet': { en: 'No notifications yet', tl: 'Wala pang mga abiso', es: 'Aún no hay notificaciones', ja: '通知はまだありません', ko: '아직 알림이 없습니다', zh: '暂无通知', fr: 'Pas encore de notifications', de: 'Noch keine Benachrichtigungen', it: 'Ancora nessuna notifica', pt: 'Ainda não há notificações' },
  'Valid Barangay ID': { en: 'Valid Barangay ID', tl: 'Valid na Barangay ID', es: 'Identificación de Barangay válida', ja: '有効なバランガイID', ko: '유효한 바랑가이 ID', zh: '有效的村级身份证', fr: 'ID de quartier valide', de: 'Gültiger Barangay-Ausweis', it: 'ID di quartiere valido', pt: 'ID do Bairro Válido' },
  'Certificate of Indigency': { en: 'Certificate of Indigency', tl: 'Sertipiko ng Indigency', es: 'Certificado de indigencia', ja: '困窮証明書', ko: '빈곤 증명서', zh: '贫困证明', fr: 'Certificat d\'indigence', de: 'Bedürftigkeitsbescheinigung', it: 'Certificato di indigenza', pt: 'Certificado de Indigência' },
  'Proof of Residency': { en: 'Proof of Residency', tl: 'Patunay ng Paninirahan', es: 'Prueba de residencia', ja: '居住証明書', ko: '거주 증명서', zh: '居住证明', fr: 'Preuve de résidence', de: 'Wohnsitznachweis', it: 'Prova di residenza', pt: 'Comprovante de Residência' },
  'Available Items': { en: 'Available Items', tl: 'Mga Magagamit na Item', es: 'Artículos disponibles', ja: '利用可能なアイテム', ko: '이용 가능한 물품', zh: '可用物品', fr: 'Articles disponibles', de: 'Verfügbare Gegenstände', it: 'Articoli disponibili', pt: 'Itens Disponíveis' },
  'Item': { en: 'Item', tl: 'Item', es: 'Artículo', ja: 'アイテム', ko: '물품', zh: '物品', fr: 'Article', de: 'Gegenstand', it: 'Articolo', pt: 'Item' },
  'Quantity': { en: 'Quantity', tl: 'Dami', es: 'Cantidad', ja: '数量', ko: '수량', zh: '数量', fr: 'Quantité', de: 'Menge', it: 'Quantità', pt: 'Quantidade' },
  'Status': { en: 'Status', tl: 'Status', es: 'Estado', ja: 'ステータス', ko: '상태', zh: '状态', fr: 'Statut', de: 'Status', it: 'Stato', pt: 'Status' },
  'Date': { en: 'Date', tl: 'Petsa', es: 'Fecha', ja: '日付', ko: '날짜', zh: '日期', fr: 'Date', de: 'Datum', it: 'Data', pt: 'Data' },
  'Action': { en: 'Action', tl: 'Aksyon', es: 'Acción', ja: 'アクション', ko: '작업', zh: '操作', fr: 'Action', de: 'Aktion', it: 'Azione', pt: 'Ação' },
  'No actions': { en: 'No actions', tl: 'Walang mga aksyon', es: 'Sin acciones', ja: 'アクションなし', ko: '작업 없음', zh: '无操作', fr: 'Aucune action', de: 'Keine Aktionen', it: 'Nessuna azione', pt: 'Sem ações' },
  'Manage alerts': { en: 'Manage alerts', tl: 'Pamahalaan ang mga alerto', es: 'Gestionar alertas', ja: 'アラートを管理', ko: '알림 관리', zh: '管理警报', fr: 'Gérer les alertes', de: 'Warnungen verwalten', it: 'Gestisci avvisi', pt: 'Gerenciar alertas' },
  'Email Notifications': { en: 'Email Notifications', tl: 'Mga Abiso sa Email', es: 'Notificaciones por correo', ja: 'メール通知', ko: '이메일 알림', zh: '电子邮件通知', fr: 'Notifications par e-mail', de: 'E-Mail-Benachrichtigungen', it: 'Notifiche e-mail', pt: 'Notificações por E-mail' },
  'Receive updates via email': { en: 'Receive updates via email', tl: 'Tumanggap ng mga update sa pamamagitan ng email', es: 'Recibir actualizaciones por correo', ja: 'メールで更新を受け取る', ko: '이메일로 업데이트 받기', zh: '通过电子邮件接收更新', fr: 'Recevoir des mises à jour par e-mail', de: 'Updates per E-Mail erhalten', it: 'Ricevi aggiornamenti via e-mail', pt: 'Receber atualizações por e-mail' },
  'Push Notifications': { en: 'Push Notifications', tl: 'Mga Push Notification', es: 'Notificaciones push', ja: 'プッシュ通知', ko: '푸시 알림', zh: '推送通知', fr: 'Notifications push', de: 'Push-Benachrichtigungen', it: 'Notifiche push', pt: 'Notificações Push' },
  'Alerts on your device': { en: 'Alerts on your device', tl: 'Mga alerto sa iyong device', es: 'Alertas en tu dispositivo', ja: 'デバイスへのアラート', ko: '기기 알림', zh: '设备上的警报', fr: 'Alertes sur votre appareil', de: 'Warnungen auf Ihrem Gerät', it: 'Avvisi sul tuo dispositivo', pt: 'Alertas no seu dispositivo' },
  'SMS Notifications': { en: 'SMS Notifications', tl: 'Mga Abiso sa SMS', es: 'Notificaciones por SMS', ja: 'SMS通知', ko: 'SMS 알림', zh: '短信通知', fr: 'Notifications SMS', de: 'SMS-Benachrichtigungen', it: 'Notifiche SMS', pt: 'Notificações SMS' },
  'Updates via text message': { en: 'Updates via text message', tl: 'Mga update sa pamamagitan ng text message', es: 'Actualizaciones por mensaje de texto', ja: 'テキストメッセージによる更新', ko: '문자 메시지로 업데이트 받기', zh: '通过短信接收更新', fr: 'Mises à jour par SMS', de: 'Updates per SMS', it: 'Aggiornamenti via SMS', pt: 'Atualizações por mensagem de texto' },
  'Sound': { en: 'Sound', tl: 'Tunog', es: 'Sonido', ja: 'サウンド', ko: '사운드', zh: '声音', fr: 'Son', de: 'Ton', it: 'Suono', pt: 'Som' },
  'Enable or disable app sounds': { en: 'Enable or disable app sounds', tl: 'I-enable o i-disable ang mga tunog ng app', es: 'Activar o desactivar sonidos de la aplicación', ja: 'アプリの音を有効または無効にする', ko: '앱 사운드 활성화 또는 비활성화', zh: '启用或禁用应用声音', fr: 'Activer ou désactiver les sons de l\'application', de: 'App-Sounds aktivieren oder deaktivieren', it: 'Attiva o disattiva i suoni dell\'app', pt: 'Ativar ou desativar sons do app' },
  'Appearance': { en: 'Appearance', tl: 'Anyo', es: 'Apariencia', ja: '外観', ko: '모양', zh: '外观', fr: 'Apparence', de: 'Aussehen', it: 'Aspetto', pt: 'Aparência' },
  'Customize the look and feel': { en: 'Customize the look and feel', tl: 'I-customize ang anyo at pakiramdam', es: 'Personalizar el aspecto y la sensación', ja: '見た目と感触をカスタマイズ', ko: '모양 및 느낌 사용자 정의', zh: '自定义外观和感觉', fr: 'Personnaliser l\'aspect et la convivialité', de: 'Aussehen und Haptik anpassen', it: 'Personalizza l\'aspetto e l\'atmosfera', pt: 'Personalizar a aparência e a sensação' },
  'Security & Privacy': { en: 'Security & Privacy', tl: 'Seguridad at Privacy', es: 'Seguridad y privacidad', ja: 'セキュリティとプライバシー', ko: '보안 및 개인정보 보호', zh: '安全与隐私', fr: 'Sécurité et confidentialité', de: 'Sicherheit & Datenschutz', it: 'Sicurezza e privacy', pt: 'Segurança e Privacidade' },
  'Manage your account security': { en: 'Manage your account security', tl: 'Pamahalaan ang seguridad ng iyong account', es: 'Gestionar la seguridad de tu cuenta', ja: 'アカウントのセキュリティを管理', ko: '계정 보안 관리', zh: '管理您的账户安全', fr: 'Gérer la sécurité de votre compte', de: 'Kontosicherheit verwalten', it: 'Gestisci la sicurezza del tuo account', pt: 'Gerenciar a segurança da sua conta' },
  'Help & Support': { en: 'Help & Support', tl: 'Tulong at Suporta', es: 'Ayuda y soporte', ja: 'ヘルプとサポート', ko: '도움말 및 지원', zh: '帮助与支持', fr: 'Aide et support', de: 'Hilfe & Support', it: 'Aiuto e supporto', pt: 'Ajuda e Suporte' },
  'Get assistance and view FAQs': { en: 'Get assistance and view FAQs', tl: 'Kumuha ng tulong at tingnan ang mga FAQ', es: 'Obtén asistencia y consulta las preguntas frecuentes', ja: 'サポートを受け、FAQを表示', ko: '지원 받기 및 FAQ 보기', zh: '获取帮助并查看常见问题解答', fr: 'Obtenir de l\'aide et consulter la FAQ', de: 'Unterstützung erhalten und FAQs anzeigen', it: 'Ottieni assistenza e visualizza le FAQ', pt: 'Obtenha assistência e veja as FAQs' },
  'About': { en: 'About', tl: 'Tungkol sa', es: 'Acerca de', ja: '詳細', ko: '정보', zh: '关于', fr: 'À propos', de: 'Über', it: 'Informazioni', pt: 'Sobre' },
  'App version and information': { en: 'App version and information', tl: 'Bersyon at impormasyon ng app', es: 'Versión e información de la aplicación', ja: 'アプリのバージョンと情報', ko: '앱 버전 및 정보', zh: '应用版本和信息', fr: 'Version et informations sur l\'application', de: 'App-Version und Informationen', it: 'Versione e informazioni sull\'app', pt: 'Versão e informações do app' },
  'Barangay Council': { en: 'Barangay Council', tl: 'Konseho ng Barangay', es: 'Consejo del Barangay', ja: 'バランガイ評議会', ko: '바랑가이 의회', zh: '村委会', fr: 'Conseil de quartier', de: 'Barangay-Rat', it: 'Consiglio di quartiere', pt: 'Conselho do Bairro' },
  'Chief Executive': { en: 'Chief Executive', tl: 'Punong Ehekutibo', es: 'Jefe Ejecutivo', ja: '最高責任者', ko: '최고 책임자', zh: '首席执行官', fr: 'Chef de l\'exécutif', de: 'Hauptgeschäftsführer', it: 'Capo dell\'esecutivo', pt: 'Chefe Executivo' },
  'Leading 12 Council Members': { en: 'Leading 12 Council Members', tl: 'Namumuno sa 12 Miyembro ng Konseho', es: 'Liderando a 12 miembros del consejo', ja: '12人の評議会議員を率いる', ko: '12명의 의회 의원을 이끄는', zh: '领导 12 名委员会成员', fr: 'Dirigeant 12 membres du conseil', de: 'Leitet 12 Ratsmitglieder', it: 'Alla guida di 12 membri del consiglio', pt: 'Liderando 12 Membros do Conselho' },
  'Administrative Staff': { en: 'Administrative Staff', tl: 'Kawani ng Administratibo', es: 'Personal administrativo', ja: '事務スタッフ', ko: '행정 직원', zh: '行政人员', fr: 'Personnel administratif', de: 'Verwaltungspersonal', it: 'Personale amministrativo', pt: 'Equipe Administrativa' },
  'Suggest a New Project': { en: 'Suggest a New Project', tl: 'Magmungkahi ng Bagong Proyekto', es: 'Sugerir un nuevo proyecto', ja: '新しいプロジェクトを提案', ko: '새로운 프로젝트 제안', zh: '建议一个新项目', fr: 'Suggérer un nouveau projet', de: 'Neues Projekt vorschlagen', it: 'Suggerisci un nuovo progetto', pt: 'Sugerir um Novo Projeto' },
  'Project Title': { en: 'Project Title', tl: 'Pamagat ng Proyekto', es: 'Título del proyecto', ja: 'プロジェクト名', ko: '프로젝트 제목', zh: '项目标题', fr: 'Titre du projet', de: 'Projekttitel', it: 'Titolo del progetto', pt: 'Título do Projeto' },
  'Specific Location': { en: 'Specific Location', tl: 'Tiyak na Lokasyon', es: 'Ubicación específica', ja: '具体的な場所', ko: '상세 위치', zh: '具体位置', fr: 'Emplacement spécifique', de: 'Spezifischer Standort', it: 'Posizione specifica', pt: 'Localização Específica' },
  'Votes': { en: 'Votes', tl: 'Mga Boto', es: 'Votos', ja: '投票', ko: '투표', zh: '投票', fr: 'Votes', de: 'Stimmen', it: 'Voti', pt: 'Votos' },
  'Barangay Calendar': { en: 'Barangay Calendar', tl: 'Kalendaryo ng Barangay', es: 'Calendario del Barangay', ja: 'バランガイ・カレンダー', ko: '바랑가이 달력', zh: '村级日历', fr: 'Calendrier de quartier', de: 'Barangay-Kalender', it: 'Calendario di quartiere', pt: 'Calendário do Bairro' },
  'Event Title': { en: 'Event Title', tl: 'Pamagat ng Kaganapan', es: 'Título del evento', ja: 'イベント名', ko: '이벤트 제목', zh: '活动标题', fr: 'Titre de l\'événement', de: 'Veranstaltungstitel', it: 'Titolo dell\'evento', pt: 'Título do Evento' },
  'Type': { en: 'Type', tl: 'Uri', es: 'Tipo', ja: 'タイプ', ko: '유형', zh: '类型', fr: 'Type', de: 'Typ', it: 'Tipo', pt: 'Tipo' },
  'Event': { en: 'Event', tl: 'Kaganapan', es: 'Evento', ja: 'イベント', ko: '이벤트', zh: '活动', fr: 'Événement', de: 'Veranstaltung', it: 'Evento', pt: 'Evento' },
  'Update': { en: 'Update', tl: 'Update', es: 'Actualización', ja: '更新', ko: '업데이트', zh: '更新', fr: 'Mise à jour', de: 'Update', it: 'Aggiornamento', pt: 'Atualização' },
  'Legend': { en: 'Legend', tl: 'Legend', es: 'Leyenda', ja: '凡例', ko: '범례', zh: '图例', fr: 'Légende', de: 'Legende', it: 'Legenda', pt: 'Legenda' },
  'Admin Note': { en: 'Admin Note', tl: 'Admin Note', es: 'Nota del administrador', ja: '管理者メモ', ko: '관리자 메모', zh: '管理员备注', fr: 'Note de l\'administrateur', de: 'Admin-Notiz', it: 'Nota amministratore', pt: 'Nota do Administrador' },
  'Back to Dashboard': { en: 'Back to Dashboard', tl: 'Bumalik sa Dashboard', es: 'Volver al tablero', ja: 'ダッシュボードに戻る', ko: '대시보드로 돌아가기', zh: '返回仪表板', fr: 'Retour au tableau de bord', de: 'Zurück zum Dashboard', it: 'Torna alla dashboard', pt: 'Voltar ao Painel' },
  '1-Year Plan and Community Events.': { en: '1-Year Plan and Community Events.', tl: '1-Taong Plano at mga Kaganapan sa Komunidad.', es: 'Plan de 1 año y eventos comunitarios.', ja: '1年間の計画とコミュニティイベント。', ko: '1년 계획 및 커뮤니티 이벤트.', zh: '1 年计划和社区活动。', fr: 'Plan sur 1 an et événements communautaires.', de: '1-Jahres-Plan und Gemeinschaftsveranstaltungen.', it: 'Piano annuale ed eventi comunitari.', pt: 'Plano de 1 ano e eventos comunitários.' },
  'Add Event for': { en: 'Add Event for', tl: 'Magdagdag ng Kaganapan para sa', es: 'Añadir evento para', ja: 'イベントを追加：', ko: '이벤트 추가:', zh: '添加活动：', fr: 'Ajouter un événement pour', de: 'Ereignis hinzufügen für', it: 'Aggiungi evento per', pt: 'Adicionar evento para' },
  'e.g. Community Meeting': { en: 'e.g. Community Meeting', tl: 'hal. Pagpupulong ng Komunidad', es: 'p. ej. Reunión comunitaria', ja: '例：コミュニティ会議', ko: '예: 커뮤니티 회의', zh: '例如：社区会议', fr: 'ex. Réunion communautaire', de: 'z.B. Gemeinschaftstreffen', it: 'es. Riunione comunitaria', pt: 'ex: Reunião Comunitária' },
  'Add to Calendar': { en: 'Add to Calendar', tl: 'Idagdag sa Kalendaryo', es: 'Añadir al calendario', ja: 'カレンダーに追加', ko: '달력에 추가', zh: '添加到日历', fr: 'Ajouter au calendrier', de: 'Zum Kalender hinzufügen', it: 'Aggiungi al calendario', pt: 'Adicionar ao Calendário' },
  'Upcoming This Month': { en: 'Upcoming This Month', tl: 'Paparating Ngayong Buwan', es: 'Próximos este mes', ja: '今月の予定', ko: '이번 달 예정', zh: '本月即将到来', fr: 'À venir ce mois-ci', de: 'Diesen Monat anstehend', it: 'In arrivo questo mese', pt: 'Próximos este mês' },
  'Planning today for a better community tomorrow. All events are subject to change based on barangay council decisions.': { en: 'Planning today for a better community tomorrow. All events are subject to change based on barangay council decisions.', tl: 'Pagpaplano ngayon para sa mas magandang komunidad bukas. Ang lahat ng kaganapan ay maaaring magbago batay sa mga desisyon ng konseho ng barangay.', es: 'Planificando hoy para una mejor comunidad mañana. Todos los eventos están sujetos a cambios basados en las decisiones del consejo del barangay.', ja: '明日のより良いコミュニティのために今日を計画する。すべてのイベントはバランガイ評議会の決定に基づいて変更される場合があります。', ko: '내일의 더 나은 커뮤니티를 위해 오늘을 계획합니다. 모든 이벤트는 바랑가이 의회의 결정에 따라 변경될 수 있습니다.', zh: '今日规划，明日社区更美好。所有活动均可能根据村委会的决定 at 变动。', fr: 'Planifier aujourd\'hui pour une meilleure communauté demain. Tous les événements sont sujets à changement en fonction des décisions du conseil de quartier.', de: 'Heute planen für eine bessere Gemeinschaft morgen. Alle Veranstaltungen können sich aufgrund von Entscheidungen des Barangay-Rats ändern.', it: 'Pianificare oggi per una comunità migliore domani. Tutti gli eventi sono soggetti a modifiche in base alle decisioni del consiglio di quartiere.', pt: 'Planejando hoje para uma comunidade melhor amanhã. Todos os eventos estão sujeitos a alterações com base nas decisões do conselho do bairro.' },
  'Appointment System': { en: 'Appointment System', tl: 'Sistema ng Appointment', es: 'Sistema de citas', ja: '予約システム', ko: '예약 시스템', zh: '预约系统', fr: 'Système de rendez-vous', de: 'Terminsystem', it: 'Sistema di appuntamenti', pt: 'Sistema de Agendamento' },
  'Schedule your visit to the barangay hall': { en: 'Schedule your visit to the barangay hall', tl: 'I-iskedyul ang iyong pagbisita sa barangay hall', es: 'Programa tu visita a la casa consistorial', ja: 'バランガイホールへの訪問を予約する', ko: '바랑가이 홀 방문 일정 예약', zh: '安排您前往村公所的访问', fr: 'Planifiez votre visite à la mairie de quartier', de: 'Planen Sie Ihren Besuch im Barangay-Saal', it: 'Pianifica la tua visita al municipio di quartiere', pt: 'Agende sua visita à sede do bairro' },
  'Availability': { en: 'Availability', tl: 'Availability', es: 'Disponibilidad', ja: '空き状況', ko: '가용성', zh: '可用性', fr: 'Disponibilité', de: 'Verfügbarkeit', it: 'Disponibilità', pt: 'Disponibilidade' },
  'Back to List': { en: 'Back to List', tl: 'Bumalik sa Listahan', es: 'Volver a la lista', ja: 'リストに戻る', ko: '목록으로 돌아가기', zh: '返回列表', fr: 'Retour à la liste', de: 'Zurück zur Liste', it: 'Torna all\'elenco', pt: 'Voltar para a Lista' },
  'Search appointments...': { en: 'Search appointments...', tl: 'Maghanap ng mga appointment...', es: 'Buscar citas...', ja: '予約を検索...', ko: '예약 검색...', zh: '搜索预约...', fr: 'Rechercher des rendez-vous...', de: 'Termine suchen...', it: 'Cerca appuntamenti...', pt: 'Buscar agendamentos...' },
  'All Services': { en: 'All Services', tl: 'Lahat ng Serbisyo', es: 'Todos los servicios', ja: 'すべてのサービス', ko: '모든 서비스', zh: '所有服务', fr: 'Tous les services', de: 'Alle Dienstleistungen', it: 'Tutti i servizi', pt: 'Todos os Serviços' },
  'All Status': { en: 'All Status', tl: 'Lahat ng Katayuan', es: 'Todos los estados', ja: 'すべてのステータス', ko: '모든 상태', zh: '所有状态', fr: 'Tous les statuts', de: 'Alle Status', it: 'Tutti gli stati', pt: 'Todos os Status' },
  'Pending': { en: 'Pending', tl: 'Nakabinbin', es: 'Pendiente', ja: '保留中', ko: '대기 중', zh: '待定', fr: 'En attente', de: 'Ausstehend', it: 'In attesa', pt: 'Pendente' },
  'Approved': { en: 'Approved', tl: 'Inaprubahan', es: 'Aprobado', ja: '承認済み', ko: '승인됨', zh: '已批准', fr: 'Approuvé', de: 'Genehmigt', it: 'Approvato', pt: 'Aprovado' },
  'Completed': { en: 'Completed', tl: 'Nakumpleto', es: 'Completado', ja: '完了', ko: '완료됨', zh: '已完成', fr: 'Terminé', de: 'Abgeschlossen', it: 'Completato', pt: 'Concluído' },
  'Declined': { en: 'Declined', tl: 'Tinanggihan', es: 'Rechazado', ja: '拒否されました', ko: '거절됨', zh: '已拒绝', fr: 'Refusé', de: 'Abgelehnt', it: 'Rifiutato', pt: 'Recusado' },
  'Cancelled': { en: 'Cancelled', tl: 'Kinansela', es: 'Cancelado', ja: 'キャンセルされました', ko: '취소됨', zh: '已取消', fr: 'Annulé', de: 'Abgebrochen', it: 'Annullato', pt: 'Cancelado' },
  'No appointments found': { en: 'No appointments found', tl: 'Walang nahanap na mga appointment', es: 'No se encontraron citas', ja: '予約が見つかりません', ko: '예약을 찾을 수 없습니다', zh: '未找到预约', fr: 'Aucun rendez-vous trouvé', de: 'Keine Termine gefunden', it: 'Nessun appuntamento trovato', pt: 'Nenhum agendamento encontrado' },
  'Schedule New Appointment': { en: 'Schedule New Appointment', tl: 'Mag-iskedyul ng Bagong Appointment', es: 'Programar nueva cita', ja: '新しい予約をスケジュール', ko: '새 예약 일정 잡기', zh: '安排新预约', fr: 'Planifier un nouveau rendez-vous', de: 'Neuen Termin planen', it: 'Pianifica nuovo appuntamento', pt: 'Agendar Novo Agendamento' },
  'Select Service': { en: 'Select Service', tl: 'Pumili ng Serbisyo', es: 'Seleccionar servicio', ja: 'サービスを選択', ko: '서비스 선택', zh: '选择服务', fr: 'Sélectionner le service', de: 'Dienstleistung auswählen', it: 'Seleziona servizio', pt: 'Selecionar Serviço' },
  'Requirements:': { en: 'Requirements:', tl: 'Mga Kinakailangan:', es: 'Requisitos:', ja: '要件：', ko: '요구 사항:', zh: '要求：', fr: 'Exigences :', de: 'Anforderungen:', it: 'Requisiti:', pt: 'Requisitos:' },
  'Preferred Date': { en: 'Preferred Date', tl: 'Gusto na Petsa', es: 'Fecha preferida', ja: '希望日', ko: '선호 날짜', zh: '首选日期', fr: 'Date préférée', de: 'Bevorzugtes Datum', it: 'Data preferita', pt: 'Data de Preferência' },
  'Available Time Slots': { en: 'Available Time Slots', tl: 'Magagamit na mga Time Slot', es: 'Horarios disponibles', ja: '利用可能な時間枠', ko: '사용 가능한 시간대', zh: '可用时间段', fr: 'Créneaux horaires disponibles', de: 'Verfügbare Zeitfenster', it: 'Fasce orarie disponibili', pt: 'Horários Disponíveis' },
  'slots left': { en: 'slots left', tl: 'mga slot na natitira', es: 'espacios restantes', ja: '残りスロット', ko: '남은 슬롯', zh: '剩余名额', fr: 'places restantes', de: 'Plätze übrig', it: 'posti rimasti', pt: 'vagas restantes' },
  'Confirm Appointment': { en: 'Confirm Appointment', tl: 'Kumpirmahin ang Appointment', es: 'Confirmar cita', ja: '予約を確定', ko: '예약 확인', zh: '确认预约', fr: 'Confirmer le rendez-vous', de: 'Termin bestätigen', it: 'Conferma appuntamento', pt: 'Confirmar Agendamento' },
  'Manage Barangay Services': { en: 'Manage Barangay Services', tl: 'Pamahalaan ang mga Serbisyo ng Barangay', es: 'Gestionar servicios del Barangay', ja: 'バランガイサービスを管理', ko: '바랑가이 서비스 관리', zh: '管理村级服务', fr: 'Gérer les services de quartier', de: 'Barangay-Dienstleistungen verwalten', it: 'Gestisci i servizi di quartiere', pt: 'Gerenciar Serviços do Bairro' },
  'Official Availability': { en: 'Official Availability', tl: 'Availability ng Opisyal', es: 'Disponibilidad oficial', ja: '職員の空き状況', ko: '공무원 가용성', zh: '官员可用性', fr: 'Disponibilité officielle', de: 'Offizielle Verfügbarkeit', it: 'Disponibilità ufficiale', pt: 'Disponibilidade Oficial' },
  'Decline Appointment': { en: 'Decline Appointment', tl: 'Tanggihan ang Appointment', es: 'Rechazar cita', ja: '予約を拒否', ko: '예약 거절', zh: '拒绝预约', fr: 'Refuser le rendez-vous', de: 'Termin ablehnen', it: 'Rifiuta appuntamento', pt: 'Recusar Agendamento' },
  'Reason for Declining': { en: 'Reason for Declining', tl: 'Dahilan ng Pagtanggi', es: 'Motivo del rechazo', ja: '拒否の理由', ko: '거절 사유', zh: '拒绝原因', fr: 'Motif du refus', de: 'Ablehnungsgrund', it: 'Motivo del rifiuto', pt: 'Motivo da Recusa' },
  'Please provide a reason...': { en: 'Please provide a reason...', tl: 'Mangyaring magbigay ng dahilan...', es: 'Por favor, proporciona un motivo...', ja: '理由を入力してください...', ko: '사유를 입력해 주세요...', zh: '请提供原因...', fr: 'Veuillez fournir un motif...', de: 'Bitte geben Sie einen Grund an...', it: 'Si prega di fornire un motivo...', pt: 'Por favor, forneça um motivo...' },
  'Reschedule Appointment': { en: 'Reschedule Appointment', tl: 'I-reschedule ang Appointment', es: 'Reprogramar cita', ja: '予約を再スケジュール', ko: '예약 일정 변경', zh: '重新安排预约', fr: 'Reprogrammer le rendez-vous', de: 'Termin verschieben', it: 'Riprogramma appuntamento', pt: 'Reagendar Agendamento' },
  'New Date': { en: 'New Date', tl: 'Bagong Petsa', es: 'Nueva fecha', ja: '新しい日付', ko: '새 날짜', zh: '新日期', fr: 'Nouvelle date', de: 'Neues Datum', it: 'Nuova data', pt: 'Nova Data' },
  'New Time Slot': { en: 'New Time Slot', tl: 'Bagong Time Slot', es: 'Nuevo horario', ja: '新しい時間枠', ko: '새 시간대', zh: '新时间段', fr: 'Nouveau créneau horaire', de: 'Neues Zeitfenster', it: 'Nuova fascia oraria', pt: 'Novo Horário' },
  'Reschedule': { en: 'Reschedule', tl: 'I-reschedule', es: 'Reprogramar', ja: '再スケジュール', ko: '일정 변경', zh: '重新安排', fr: 'Reprogrammer', de: 'Verschieben', it: 'Riprogramma', pt: 'Reagendar' },
  'Mark Completed': { en: 'Mark Completed', tl: 'Markahan bilang Tapos na', es: 'Marcar como completado', ja: '完了としてマーク', ko: '완료로 표시', zh: '标记为已完成', fr: 'Marquer comme terminé', de: 'Als abgeschlossen markieren', it: 'Segna come completato', pt: 'Marcar como Concluído' },
  'Cancel': { en: 'Cancel', tl: 'Kanselahin', es: 'Cancelar', ja: 'キャンセル', ko: '취소', zh: '取消', fr: 'Annuler', de: 'Abbrechen', it: 'Annulla', pt: 'Cancelar' },
  'Digital Governance': { en: 'Digital Governance', tl: 'Digital na Pamamahala', es: 'Gobernanza Digital', ja: 'デジタルガバナンス', ko: '디지털 거버넌스', zh: '数字治理', fr: 'Gouvernance numérique', de: 'Digitale Governance', it: 'Governance digitale', pt: 'Governança Digital' },
  'Pahinga Norte': { en: 'Pahinga Norte', tl: 'Pahinga Norte', es: 'Pahinga Norte', ja: 'パヒンガ・ノルテ', ko: '파힝가 노르테', zh: '帕辛加北', fr: 'Pahinga Norte', de: 'Pahinga Norte', it: 'Pahinga Norte', pt: 'Pahinga Norte' },
  'Empower Your Community.': { en: 'Empower Your Community.', tl: 'Palakasin ang Iyong Komunidad.', es: 'Empodera a tu comunidad.', ja: 'あなたのコミュニティに力を。', ko: '커뮤니티에 힘을 실어주세요.', zh: '赋能您的社区。', fr: 'Donnez du pouvoir à votre communauté.', de: 'Empower Your Community.', it: 'Potenzia la tua comunità.', pt: 'Capacite sua comunidade.' },
  'A platform for digital transparency and seamless barangay governance.': { en: 'A platform for digital transparency and seamless barangay governance.', tl: 'Isang platform para sa digital na transparency at maayos na pamamahala ng barangay.', es: 'Una plataforma para la transparencia digital y la gobernanza fluida del barangay.', ja: 'デジタルの透明性とシームレスなバランガイ統治のためのプラットフォーム。', ko: '디지털 투명성과 원활한 바랑가이 거버넌스를 위한 플랫폼.', zh: '一个旨在实现数字透明和无缝村级治理的平台。', fr: 'Une plateforme pour la transparence numérique et une gouvernance de quartier fluide.', de: 'Eine Plattform für digitale Transparenz und nahtlose Barangay-Governance.', it: 'Una piattaforma per la trasparenza digitale e una governance di quartiere senza interruzioni.', pt: 'Uma plataforma para transparência digital e governança de bairro perfeita.' },
  'Transparency': { en: 'Transparency', tl: 'Transparency', es: 'Transparencia', ja: '透明性', ko: '투명성', zh: '透明度', fr: 'Transparence', de: 'Transparenz', it: 'Trasparenza', pt: 'Transparência' },
  'Efficiency': { en: 'Efficiency', tl: 'Kahusayan', es: 'Eficiencia', ja: '効率性', ko: '효율성', zh: '效率', fr: 'Efficacité', de: 'Effizienz', it: 'Efficienza', pt: 'Eficiência' },
  'Security': { en: 'Security', tl: 'Seguridad', es: 'Seguridad', ja: 'セキュリティ', ko: '보안', zh: '安全', fr: 'Sécurité', de: 'Sicherheit', it: 'Sicurezza', pt: 'Segurança' },
  'Access Portal': { en: 'Access Portal', tl: 'Portal ng Access', es: 'Portal de acceso', ja: 'アクセス・ポータル', ko: '액세스 포털', zh: '访问门户', fr: 'Portail d\'accès', de: 'Zugangsportal', it: 'Portale di accesso', pt: 'Portal de Acesso' },
  'Secure gateway for residents and officials.': { en: 'Secure gateway for residents and officials.', tl: 'Ligtas na gateway para sa mga residente at opisyal.', es: 'Pasarela segura para residentes y funcionarios.', ja: '住民と職員のための安全なゲートウェイ。', ko: '주민과 공무원을 위한 안전한 게이트웨이.', zh: '居民和官员的安全网关。', fr: 'Passerelle sécurisée pour les résidents et les officiels.', de: 'Sicheres Gateway für Bewohner und Beamte.', it: 'Gateway sicuro per residenti e funzionari.', pt: 'Portal seguro para residentes e funcionários.' },
  'Sign In': { en: 'Sign In', tl: 'Mag-sign In', es: 'Iniciar sesión', ja: 'サインイン', ko: '로그인', zh: '登录', fr: 'Se connecter', de: 'Anmelden', it: 'Accedi', pt: 'Entrar' },
  'Create Account': { en: 'Create Account', tl: 'Gumawa ng Account', es: 'Crear cuenta', ja: 'アカウント作成', ko: '계정 생성', zh: '创建账户', fr: 'Créer un compte', de: 'Konto erstellen', it: 'Crea account', pt: 'Criar conta' },
  'Important: Registration required.': { en: 'Important: Registration required.', tl: 'Mahalaga: Kinakailangan ang pagpaparehistro.', es: 'Importante: Se requiere registro.', ja: '重要：登録が必要です。', ko: '중요: 등록이 필요합니다.', zh: '重要提示：需要注册。', fr: 'Important : Inscription requise.', de: 'Wichtig: Registrierung erforderlich.', it: 'Importante: Registrazione richiesta.', pt: 'Importante: Registro necessário.' },
  'Official System': { en: 'Official System', tl: 'Opisyal na Sistema', es: 'Sistema oficial', ja: '公式システム', ko: '공식 시스템', zh: '官方系统', fr: 'Système officiel', de: 'Offizielles System', it: 'Sistema ufficiale', pt: 'Sistema Oficial' },
  'Identify': { en: 'Identify', tl: 'Kilalanin', es: 'Identificar', ja: '識別', ko: '식별', zh: '识别', fr: 'Identifier', de: 'Identifizieren', it: 'Identifica', pt: 'Identificar' },
  'Select your role in the community': { en: 'Select your role in the community', tl: 'Piliin ang iyong papel sa komunidad', es: 'Selecciona tu rol en la comunidad', ja: 'コミュニティでの役割を選択してください', ko: '커뮤니티에서의 역할을 선택하세요', zh: '选择您在社区中的角色', fr: 'Sélectionnez votre rôle dans la communauté', de: 'Wählen Sie Ihre Rolle in der Gemeinschaft', it: 'Seleziona il tuo ruolo nella comunità', pt: 'Selecione seu papel na comunidade' },
  'Official': { en: 'Official', tl: 'Opisyal', es: 'Oficial', ja: '職員', ko: '공무원', zh: '官员', fr: 'Officiel', de: 'Beamter', it: 'Ufficiale', pt: 'Oficial' },
  'Barangay Administration': { en: 'Barangay Administration', tl: 'Administrasyon ng Barangay', es: 'Administración del Barangay', ja: 'バランガイ管理', ko: '바랑가이 행정', zh: '村级管理', fr: 'Administration de quartier', de: 'Barangay-Verwaltung', it: 'Amministrazione di quartiere', pt: 'Administração do Bairro' },
  'Resident': { en: 'Resident', tl: 'Residente', es: 'Residente', ja: '住民', ko: '주민', zh: '居民', fr: 'Résident', de: 'Bewohner', it: 'Residente', pt: 'Residente' },
  'Community Member': { en: 'Community Member', tl: 'Miyembro ng Komunidad', es: 'Miembro de la comunidad', ja: 'コミュニティメンバー', ko: '커뮤니티 회원', zh: '社区成员', fr: 'Membre de la communauté', de: 'Gemeindemitglied', it: 'Membro della comunità', pt: 'Membro da Comunidade' },
  'Back to Home': { en: 'Back to Home', tl: 'Bumalik sa Home', es: 'Volver al inicio', ja: 'ホームに戻る', ko: '홈으로 돌아가기', zh: '回到首页', fr: 'Retour à l\'accueil', de: 'Zurück zur Startseite', it: 'Torna alla Home', pt: 'Voltar ao Início' },
  'Back to Roles': { en: 'Back to Roles', tl: 'Bumalik sa mga Papel', es: 'Volver a roles', ja: '役割選択に戻る', ko: '역할로 돌아가기', zh: '回到角色选择', fr: 'Retour aux rôles', de: 'Zurück zu den Rollen', it: 'Torna ai ruoli', pt: 'Voltar aos Papéis' },
  'Accessing as': { en: 'Accessing as', tl: 'Nag-a-access bilang', es: 'Accediendo como', ja: 'としてアクセス中', ko: '으로 접속 중', zh: '正在以...身份访问', fr: 'Accès en tant que', de: 'Zugriff als', it: 'Accesso come', pt: 'Acessando como' },
  'Email Address': { en: 'Email Address', tl: 'Email Address', es: 'Correo electrónico', ja: 'メールアドレス', ko: '이메일 주소', zh: '电子邮件地址', fr: 'Adresse e-mail', de: 'E-Mail-Adresse', it: 'Indirizzo e-mail', pt: 'Endereço de E-mail' },
  'Full Name': { en: 'Full Name', tl: 'Buong Pangalan', es: 'Nombre completo', ja: '氏名', ko: '성함', zh: '全名', fr: 'Nom complet', de: 'Vollständiger Name', it: 'Nome completo', pt: 'Nome Completo' },
  'Password': { en: 'Password', tl: 'Password', es: 'Contraseña', ja: 'パスワード', ko: '비밀번호', zh: '密码', fr: 'Mot de passe', de: 'Passwort', it: 'Password', pt: 'Senha' },
  'Forgot Password?': { en: 'Forgot Password?', tl: 'Nakalimutan ang Password?', es: '¿Olvidaste tu contraseña?', ja: 'パスワードをお忘れですか？', ko: '비밀번호를 잊으셨나요?', zh: '忘记密码？', fr: 'Mot de passe oublié ?', de: 'Passwort vergessen?', it: 'Password dimenticata?', pt: 'Esqueceu a senha?' },
  'Login to Portal': { en: 'Login to Portal', tl: 'Mag-login sa Portal', es: 'Entrar al portal', ja: 'ポータルにログイン', ko: '포털 로그인', zh: '登录门户', fr: 'Se connecter au portail', de: 'Zum Portal anmelden', it: 'Accedi al portale', pt: 'Entrar no Portal' },
  'Don\'t have an account?': { en: 'Don\'t have an account?', tl: 'Wala pang account?', es: '¿No tienes una cuenta?', ja: 'アカウントをお持ちでないですか？', ko: '계정이 없으신가요?', zh: '还没有账户？', fr: 'Vous n\'avez pas de compte ?', de: 'Haben Sie noch kein Konto?', it: 'Non hai un account?', pt: 'Não tem uma conta?' },
  'Register here': { en: 'Register here', tl: 'Magparehistro dito', es: 'Regístrate aquí', ja: 'こちらから登録', ko: '여기서 등록하세요', zh: '在此注册', fr: 'Inscrivez-vous ici', de: 'Hier registrieren', it: 'Registrati qui', pt: 'Registre-se aqui' },
  'Join Us': { en: 'Join Us', tl: 'Sumali sa Amin', es: 'Únete a nosotros', ja: '参加する', ko: '함께하세요', zh: '加入我们', fr: 'Rejoignez-nous', de: 'Machen Sie mit', it: 'Unisciti a noi', pt: 'Junte-se a nós' },
  'Create your community profile': { en: 'Create your community profile', tl: 'Gumawa ng iyong profile sa komunidad', es: 'Crea tu perfil de comunidad', ja: 'コミュニティ・プロフィールを作成', ko: '커뮤니티 프로필 생성', zh: '创建您的社区资料', fr: 'Créez votre profil de communauté', de: 'Erstellen Sie Ihr Gemeinschaftsprofil', it: 'Crea il tuo profilo della comunità', pt: 'Crie seu perfil de comunidade' },
  'Signing in...': { en: 'Signing in...', tl: 'Nag-sa-sign in...', es: 'Iniciando sesión...', ja: 'サインイン中...', ko: '로그인 중...', zh: '正在登录...', fr: 'Connexion...', de: 'Anmeldung...', it: 'Accesso in corso...', pt: 'Entrando...' },
  'Select Role': { en: 'Select Role', tl: 'Pumili ng Papel', es: 'Seleccionar rol', ja: '役割を選択', ko: '역할 선택', zh: '选择角色', fr: 'Sélectionner le rôle', de: 'Rolle auswählen', it: 'Seleziona ruolo', pt: 'Selecionar Papel' },
  'Official / Admin': { en: 'Official / Admin', tl: 'Opisyal / Admin', es: 'Oficial / Admin', ja: '職員 / 管理者', ko: '공무원 / 관리자', zh: '官员 / 管理员', fr: 'Officiel / Admin', de: 'Beamter / Admin', it: 'Ufficiale / Amministratore', pt: 'Oficial / Admin' },
  'Birth Date': { en: 'Birth Date', tl: 'Petsa ng Kapanganakan', es: 'Fecha de nacimiento', ja: '生年月日', ko: '생년월일', zh: '出生日期', fr: 'Date de naissance', de: 'Geburtsdatum', it: 'Data di nascita', pt: 'Data de Nascimento' },
  'Gender': { en: 'Gender', tl: 'Kasarian', es: 'Género', ja: '性別', ko: '성별', zh: '性别', fr: 'Genre', de: 'Geschlecht', it: 'Genere', pt: 'Gênero' },
  'Male': { en: 'Male', tl: 'Lalaki', es: 'Masculino', ja: '男性', ko: '남성', zh: '男', fr: 'Homme', de: 'Männlich', it: 'Maschio', pt: 'Masculino' },
  'Female': { en: 'Female', tl: 'Babae', es: 'Femenino', ja: '女性', ko: '여성', zh: '女', fr: 'Femme', de: 'Weiblich', it: 'Femmina', pt: 'Feminino' },
  'Other': { en: 'Other', tl: 'Iba pa', es: 'Otro', ja: 'その他', ko: '기타', zh: '其他', fr: 'Autre', de: 'Andere', it: 'Altro', pt: 'Outro' },
  'Address': { en: 'Address', tl: 'Address', es: 'Dirección', ja: '住所', ko: '주소', zh: '地址', fr: 'Adresse', de: 'Adresse', it: 'Indirizzo', pt: 'Endereço' },
  'Street/Purok': { en: 'Street/Purok', tl: 'Kalye/Purok', es: 'Calle/Purok', ja: '通り/プロク', ko: '거리/푸록', zh: '街道/普罗克', fr: 'Rue/Purok', de: 'Straße/Purok', it: 'Via/Purok', pt: 'Rua/Purok' },
  'Barangay': { en: 'Barangay', tl: 'Barangay', es: 'Barangay', ja: 'バランガイ', ko: '바랑가이', zh: '村', fr: 'Quartier', de: 'Barangay', it: 'Quartiere', pt: 'Bairro' },
  'City/Municipality': { en: 'City/Municipality', tl: 'Lungsod/Munisipalidad', es: 'Ciudad/Municipio', ja: '市区町村', ko: '시/군/구', zh: '市/县', fr: 'Ville/Municipalité', de: 'Stadt/Gemeinde', it: 'Città/Comune', pt: 'Cidade/Município' },
  'Province': { en: 'Province', tl: 'Lalawigan', es: 'Provincia', ja: '都道府県', ko: '도', zh: '省', fr: 'Province', de: 'Provinz', it: 'Provincia', pt: 'Província' },
  'Creating account...': { en: 'Creating account...', tl: 'Gumagawa ng account...', es: 'Creando cuenta...', ja: 'アカウントを作成中...', ko: '계정 생성 중...', zh: '正在创建账户...', fr: 'Création du compte...', de: 'Konto wird erstellt...', it: 'Creazione account...', pt: 'Criando conta...' },
  'Already have an account?': { en: 'Already have an account?', tl: 'May account na?', es: '¿Ya tienes una cuenta?', ja: 'すでにアカウントをお持ちですか？', ko: '이미 계정이 있으신가요?', zh: '已有账户？', fr: 'Vous avez déjà un compte ?', de: 'Haben Sie bereits ein Konto?', it: 'Hai già un account?', pt: 'Já tem uma conta?' },
  'Sign in here': { en: 'Sign in here', tl: 'Mag-sign in dito', es: 'Inicia sesión aquí', ja: 'こちらからサインイン', ko: '여기서 로그인하세요', zh: '在此登录', fr: 'Connectez-vous ici', de: 'Hier anmelden', it: 'Accedi qui', pt: 'Entre aqui' },
  'Confirm Password': { en: 'Confirm Password', tl: 'Kumpirmahin ang Password', es: 'Confirmar contraseña', ja: 'パスワードの確認', ko: '비밀번호 확인', zh: '确认密码', fr: 'Confirmer le mot de passe', de: 'Passwort bestätigen', it: 'Conferma password', pt: 'Confirmar Senha' },
  'Passwords do not match.': { en: 'Passwords do not match.', tl: 'Hindi magkatugma ang mga password.', es: 'Las contraseñas no coinciden.', ja: 'パスワードが一致しません。', ko: '비밀번호가 일치하지 않습니다.', zh: '密码不匹配。', fr: 'Les mots de passe ne correspondent pas.', de: 'Passwörter stimmen nicht überein.', it: 'Le password non corrispondono.', pt: 'As senhas não coincidem.' },
  'Select Street/Purok': { en: 'Select Street/Purok', tl: 'Pumili ng Kalye/Purok', es: 'Seleccionar calle/Purok', ja: '通り/プロクを選択', ko: '거리/푸록 선택', zh: '选择街道/普罗克', fr: 'Sélectionner la rue/Purok', de: 'Straße/Purok auswählen', it: 'Seleziona via/Purok', pt: 'Selecionar Rua/Purok' },
  'I agree to the': { en: 'I agree to the', tl: 'Sumasang-ayon ako sa', es: 'Acepto los', ja: 'に同意します', ko: '에 동의합니다', zh: '我同意', fr: 'J\'accepte les', de: 'Ich stimme den', it: 'Accetto i', pt: 'Eu concordo com os' },
  'Terms of Service': { en: 'Terms of Service', tl: 'Mga Tuntunin ng Serbisyo', es: 'Términos de servicio', ja: '利用規約', ko: '서비스 약관', zh: '服务条款', fr: 'Conditions d\'utilisation', de: 'Nutzungsbedingungen', it: 'Termini di servizio', pt: 'Termos de Serviço' },
  'and': { en: 'and', tl: 'at', es: 'y', ja: 'および', ko: '및', zh: '和', fr: 'et', de: 'und', it: 'e', pt: 'e' },
  'Privacy Policy': { en: 'Privacy Policy', tl: 'Patakaran sa Privacy', es: 'Política de privacidad', ja: 'プライバシーポリシー', ko: '개인정보 처리방침', zh: '隐私政策', fr: 'Politique de confidentialité', de: 'Datenschutzrichtlinie', it: 'Informativa sulla privacy', pt: 'Política de Privacidade' },
  'of the Barangay Portal.': { en: 'of the Barangay Portal.', tl: 'ng Barangay Portal.', es: 'del Portal del Barangay.', ja: '（バランガイ・ポータル）', ko: ' (바랑가이 포털)', zh: '（村级门户）', fr: 'du portail de quartier.', de: 'des Barangay-Portals.', it: 'del portale di quartiere.', pt: 'do Portal do Bairro.' },
  'Welcome back,': { en: 'Welcome back,', tl: 'Maligayang pagbabalik,', es: 'Bienvenido de nuevo,', ja: 'おかえりなさい、', ko: '다시 오신 것을 환영합니다,', zh: '欢迎回来，', fr: 'Bon retour,', de: 'Willkommen zurück,', it: 'Bentornato,', pt: 'Bem-vindo de volta,' },
  'Quick Actions': { en: 'Quick Actions', tl: 'Mabilisang Aksyon', es: 'Acciones rápidas', ja: 'クイックアクション', ko: '빠른 작업', zh: '快速操作', fr: 'Actions rapides', de: 'Schnellaktionen', it: 'Azioni rapide', pt: 'Ações Rápidas' },
  'No announcements yet.': { en: 'No announcements yet.', tl: 'Wala pang mga anunsyo.', es: 'Aún no hay anuncios.', ja: 'まだお知らせはありません。', ko: '아직 공지사항이 없습니다.', zh: '暂无公告。', fr: 'Pas d\'annonces pour le moment.', de: 'Noch keine Ankündigungen.', it: 'Ancora nessun annuncio.', pt: 'Ainda não há anúncios.' },
  'Community Stats': { en: 'Community Stats', tl: 'Estadistika ng Komunidad', es: 'Estadísticas de la comunidad', ja: 'コミュニティ統計', ko: '커뮤니티 통계', zh: '社区统计', fr: 'Statistiques de la communauté', de: 'Gemeinschaftsstatistiken', it: 'Statistiche della comunità', pt: 'Estatísticas da Comunidade' },
  'Total Residents': { en: 'Total Residents', tl: 'Kabuuang mga Residente', es: 'Total de residentes', ja: '総住民数', ko: '총 주민 수', zh: '总居民数', fr: 'Total des résidents', de: 'Gesamtbewohner', it: 'Residenti totali', pt: 'Total de Residentes' },
  'Active Projects': { en: 'Active Projects', tl: 'Mga Aktibong Proyekto', es: 'Proyectos activos', ja: '進行中のプロジェクト', ko: '활성 프로젝트', zh: '活跃项目', fr: 'Projets actifs', de: 'Aktive Projekte', it: 'Progetti attivi', pt: 'Projetos Ativos' },
  'Donations': { en: 'Donations', tl: 'Mga Donasyon', es: 'Donaciones', ja: '寄付', ko: '기부', zh: '捐赠', fr: 'Dons', de: 'Spenden', it: 'Donazioni', pt: 'Doações' },
  'Upcoming Events': { en: 'Upcoming Events', tl: 'Mga Paparating na Kaganapan', es: 'Próximos eventos', ja: '今後のイベント', ko: '예정된 이벤트', zh: '即将举行的活动', fr: 'Événements à venir', de: 'Kommende Veranstaltungen', it: 'Prossimi eventi', pt: 'Próximos Eventos' },
  'Recent Activity': { en: 'Recent Activity', tl: 'Kamakailang Aktibidad', es: 'Actividad reciente', ja: '最近の活動', ko: '최근 활동', zh: '近期活动', fr: 'Activité récente', de: 'Kürzliche Aktivitäten', it: 'Attività recente', pt: 'Atividade Recente' },
  'No recent activities.': { en: 'No recent activities.', tl: 'Walang kamakailang mga aktibidad.', es: 'No hay actividades recientes.', ja: '最近の活動はありません。', ko: '최근 활동이 없습니다.', zh: '暂无近期活动。', fr: 'Aucune activité récente.', de: 'Keine letzten Aktivitäten.', it: 'Nessuna attività recente.', pt: 'Nenhuma atividade recente.' },
  'Quick Stats': { en: 'Quick Stats', tl: 'Mabilisang Stats', es: 'Estadísticas rápidas', ja: 'クイック統計', ko: '빠른 통계', zh: '快速统计', fr: 'Stats rapides', de: 'Schnellstatistiken', it: 'Statistiche rapide', pt: 'Statistiche Rápidas' },
  'Register Profile': { en: 'Register Profile', tl: 'I-rehistro ang Profile', es: 'Registrar perfil', ja: 'プロフィールを登録', ko: '프로필 등록', zh: '注册个人资料', fr: 'Enregistrer le profil', de: 'Profil registrieren', it: 'Registra profilo', pt: 'Registrar Perfil' },
  'What would you like to do?': { en: 'What would you like to do?', tl: 'Ano ang gusto mong gawin?', es: '¿Qué te gustaría hacer?', ja: '何をしたいですか？', ko: '무엇을 하고 싶으신가요?', zh: '您想做什么？', fr: 'Que souhaitez-vous faire ?', de: 'Was möchten Sie tun?', it: 'Cosa vorresti fare?', pt: 'O que você gostaria de fazer?' },
  'Login here': { en: 'Login here', tl: 'Mag-login dito', es: 'Inicia sesión aquí', ja: 'こちらからログイン', ko: '여기서 로그인', zh: '在此登录', fr: 'Connectez-vous ici', de: 'Hier anmelden', it: 'Accedi qui', pt: 'Entre aqui' },
  'January': { en: 'January', tl: 'Enero', es: 'Enero', ja: '1月', ko: '1월', zh: '一月', fr: 'Janvier', de: 'Januar', it: 'Gennaio', pt: 'Janeiro' },
  'February': { en: 'February', tl: 'Pebrero', es: 'Febrero', ja: '2月', ko: '2월', zh: '二月', fr: 'Février', de: 'Februar', it: 'Febbraio', pt: 'Fevereiro' },
  'March': { en: 'March', tl: 'Marso', es: 'Marzo', ja: '3月', ko: '3월', zh: '三月', fr: 'Mars', de: 'März', it: 'Marzo', pt: 'Março' },
  'April': { en: 'April', tl: 'Abril', es: 'Abril', ja: '4月', ko: '4월', zh: '四月', fr: 'Avril', de: 'April', it: 'Aprile', pt: 'Abril' },
  'May': { en: 'May', tl: 'Mayo', es: 'Mayo', ja: '5月', ko: '5월', zh: '五月', fr: 'Mai', de: 'Mai', it: 'Maggio', pt: 'Maio' },
  'June': { en: 'June', tl: 'Hunyo', es: 'Junio', ja: '6月', ko: '6월', zh: '六月', fr: 'Juin', de: 'Juni', it: 'Giugno', pt: 'Junho' },
  'July': { en: 'July', tl: 'Hulyo', es: 'Julio', ja: '7月', ko: '7월', zh: '七月', fr: 'Juillet', de: 'Juli', it: 'Luglio', pt: 'Julho' },
  'August': { en: 'August', tl: 'Agosto', es: 'Agosto', ja: '8月', ko: '8월', zh: '八月', fr: 'Août', de: 'August', it: 'Agosto', pt: 'Agosto' },
  'September': { en: 'September', tl: 'Setyembre', es: 'Septiembre', ja: '9月', ko: '9월', zh: '九月', fr: 'Septembre', de: 'September', it: 'Settembre', pt: 'Setembro' },
  'October': { en: 'October', tl: 'Oktubre', es: 'Octubre', ja: '10月', ko: '10월', zh: '十月', fr: 'Octobre', de: 'Oktober', it: 'Ottobre', pt: 'Outubro' },
  'November': { en: 'November', tl: 'Nobyembre', es: 'Noviembre', ja: '11月', ko: '11월', zh: '十一月', fr: 'Novembre', de: 'November', it: 'Novembre', pt: 'Novembro' },
  'December': { en: 'December', tl: 'Disyembre', es: 'Diciembre', ja: '12月', ko: '12월', zh: '十二月', fr: 'Décembre', de: 'Dezember', it: 'Dicembre', pt: 'Dezembro' },
  'Jan': { en: 'Jan', tl: 'Ene', es: 'Ene', ja: '1月', ko: '1월', zh: '一月', fr: 'Janv.', de: 'Jan.', it: 'Gen.', pt: 'Jan.' },
  'Feb': { en: 'Feb', tl: 'Peb', es: 'Feb', ja: '2月', ko: '2월', zh: '二月', fr: 'Févr.', de: 'Feb.', it: 'Febb.', pt: 'Fev.' },
  'Mar': { en: 'Mar', tl: 'Mar', es: 'Mar', ja: '3月', ko: '3월', zh: '三月', fr: 'Mars', de: 'März', it: 'Mar.', pt: 'Mar.' },
  'Apr': { en: 'Apr', tl: 'Abr', es: 'Abr', ja: '4月', ko: '4월', zh: '四月', fr: 'Avr.', de: 'Apr.', it: 'Apr.', pt: 'Abr.' },
  'May_Short': { en: 'May', tl: 'May', es: 'May', ja: '5月', ko: '5월', zh: '五月', fr: 'Mai', de: 'Mai', it: 'Magg.', pt: 'Maio' },
  'Jun': { en: 'Jun', tl: 'Hun', es: 'Jun', ja: '6月', ko: '6월', zh: '六月', fr: 'Juin', de: 'Juni', it: 'Giu.', pt: 'Jun.' },
  'Jul': { en: 'Jul', tl: 'Hul', es: 'Jul', ja: '7月', ko: '7월', zh: '七月', fr: 'Juil.', de: 'Juli', it: 'Lug.', pt: 'Jul.' },
  'Aug': { en: 'Aug', tl: 'Ago', es: 'Ago', ja: '8月', ko: '8월', zh: '八月', fr: 'Août', de: 'Aug.', it: 'Ago.', pt: 'Ago.' },
  'Sep': { en: 'Sep', tl: 'Set', es: 'Sep', ja: '9月', ko: '9월', zh: '九月', fr: 'Sept.', de: 'Sept.', it: 'Sett.', pt: 'Set.' },
  'Oct': { en: 'Oct', tl: 'Okt', es: 'Oct', ja: '10月', ko: '10월', zh: '十月', fr: 'Oct.', de: 'Okt.', it: 'Ott.', pt: 'Out.' },
  'Nov': { en: 'Nov', tl: 'Nob', es: 'Nov', ja: '11月', ko: '11월', zh: '十一月', fr: 'Nov.', de: 'Nov.', it: 'Nov.', pt: 'Nov.' },
  'Dec': { en: 'Dec', tl: 'Dis', es: 'Dic', ja: '12月', ko: '12월', zh: '十二月', fr: 'Déc.', de: 'Dez.', it: 'Dic.', pt: 'Dez.' },
  'Sunday': { en: 'Sunday', tl: 'Linggo', es: 'Domingo', ja: '日曜日', ko: '일요일', zh: '星期日', fr: 'Dimanche', de: 'Sonntag', it: 'Domenica', pt: 'Domingo' },
  'Monday': { en: 'Monday', tl: 'Lunes', es: 'Lunes', ja: '月曜日', ko: '월요일', zh: '星期一', fr: 'Lundi', de: 'Montag', it: 'Lunedì', pt: 'Segunda-feira' },
  'Tuesday': { en: 'Tuesday', tl: 'Martes', es: 'Martes', ja: '火曜日', ko: '화요일', zh: '星期二', fr: 'Mardi', de: 'Dienstag', it: 'Martedì', pt: 'Terça-feira' },
  'Wednesday': { en: 'Wednesday', tl: 'Miyerkules', es: 'Miércoles', ja: '水曜日', ko: '수요일', zh: '星期三', fr: 'Mercredi', de: 'Mittwoch', it: 'Mercoledì', pt: 'Quarta-feira' },
  'Thursday': { en: 'Thursday', tl: 'Huwebes', es: 'Jueves', ja: '木曜日', ko: '목요일', zh: '星期四', fr: 'Jeudi', de: 'Donnerstag', it: 'Giovedì', pt: 'Quinta-feira' },
  'Friday': { en: 'Friday', tl: 'Biyernes', es: 'Viernes', ja: '金曜日', ko: '금요일', zh: '星期五', fr: 'Vendredi', de: 'Freitag', it: 'Venerdì', pt: 'Sexta-feira' },
  'Saturday': { en: 'Saturday', tl: 'Sabado', es: 'Sábado', ja: '土曜日', ko: '토요일', zh: '星期六', fr: 'Samedi', de: 'Samstag', it: 'Sabato', pt: 'Sábado' },
  'S': { en: 'S', tl: 'L', es: 'D', ja: '日', ko: '일', zh: '日', fr: 'D', de: 'S', it: 'D', pt: 'D' },
  'M': { en: 'M', tl: 'L', es: 'L', ja: '月', ko: '월', zh: '一', fr: 'L', de: 'M', it: 'L', pt: 'S' },
  'T': { en: 'T', tl: 'M', es: 'M', ja: '火', ko: '화', zh: '二', fr: 'M', de: 'D', it: 'M', pt: 'T' },
  'W': { en: 'W', tl: 'M', es: 'M', ja: '水', ko: '수', zh: '三', fr: 'M', de: 'M', it: 'M', pt: 'Q' },
  'T_Short': { en: 'T', tl: 'H', es: 'J', ja: '木', ko: '목', zh: '四', fr: 'J', de: 'D', it: 'G', pt: 'Q' },
  'F': { en: 'F', tl: 'B', es: 'V', ja: '金', ko: '금', zh: '五', fr: 'V', de: 'F', it: 'V', pt: 'S' },
  'S_Short': { en: 'S', tl: 'S', es: 'S', ja: '土', ko: '토', zh: '六', fr: 'S', de: 'S', it: 'S', pt: 'S' },
  'Decline Reason:': { en: 'Decline Reason:', tl: 'Dahilan ng Pag-decline:', es: 'Motivo del rechazo:', ja: '却下の理由：', ko: '거절 사유:', zh: '拒绝原因：', fr: 'Motif du refus :', de: 'Ablehnungsgrund:', it: 'Motivo del rifiuto:', pt: 'Motivo da Recusa:' },
  'Meetings & Assemblies': { en: 'Meetings & Assemblies', tl: 'Mga Pagpupulong at Asembleya', es: 'Reuniones y asambleas', ja: '会議と集会', ko: '회의 및 집회', zh: '会议与集会', fr: 'Réunions et assemblées', de: 'Treffen & Versammlungen', it: 'Riunioni e assemblee', pt: 'Reuniões e Assembleias' },
  'Health & Wellness': { en: 'Health & Wellness', tl: 'Kalusugan at Kagalingan', es: 'Salud y bienestar', ja: '健康とウェルネス', ko: '건강 및 웰빙', zh: '健康与保健', fr: 'Santé et bien-être', de: 'Gesundheit & Wellness', it: 'Salute e benessere', pt: 'Saúde e Bem-estar' },
  'Infrastructure & Maintenance': { en: 'Infrastructure & Maintenance', tl: 'Imprastraktura at Pagpapanatili', es: 'Infraestructura y mantenimiento', ja: 'インフラとメンテナンス', ko: '인프라 및 유지 관리', zh: '基础设施与维护', fr: 'Infrastructure et maintenance', de: 'Infrastruktur & Wartung', it: 'Infrastruttura e manutenzione', pt: 'Infraestrutura e Manutenção' },
  'Urgent Notices': { en: 'Urgent Notices', tl: 'Mga Apurahang Paunawa', es: 'Avisos urgentes', ja: '緊急のお知らせ', ko: '긴급 공지', zh: '紧急通知', fr: 'Avis urgents', de: 'Dringende Mitteilungen', it: 'Avvisi urgenti', pt: 'Avisos Urgentes' },
  'Social & Cultural': { en: 'Social & Cultural', tl: 'Sosyal at Kultural', es: 'Social y cultural', ja: '社会・文化', ko: '사회 및 문화', zh: '社会与文化', fr: 'Social et culturel', de: 'Soziales & Kulturelles', it: 'Sociale e culturale', pt: 'Social e Cultural' },
  'Donate Items': { en: 'Donate Items', tl: 'Mag-donate ng mga Item', es: 'Donar artículos', ja: 'アイテムを寄付する', ko: '물품 기부', zh: '捐赠物品', fr: 'Donner des articles', de: 'Gegenstände spenden', it: 'Dona articoli', pt: 'Doar Itens' },
  'Offer resources to help fellow residents in need.': { en: 'Offer resources to help fellow residents in need.', tl: 'Mag-alok ng mga mapagkukunan upang matulungan ang mga kapwa residente na nangangailangan.', es: 'Ofrece recursos para ayudar a otros residentes necesitados.', ja: '困っている住民を助けるためのリソースを提供します。', ko: '도움이 필요한 이웃 주민들을 돕기 위해 자원을 제공하세요.', zh: '提供资源以帮助有需要的社区居民。', fr: 'Offrez des ressources pour aider les résidents dans le besoin.', de: 'Bieten Sie Ressourcen an, um bedürftigen Mitbewohnern zu helfen.', it: 'Offri risorse per aiutare i residenti bisognosi.', pt: 'Ofereça recursos para ajudar outros residentes necessitados.' },
  'Receive Benefits': { en: 'Receive Benefits', tl: 'Tumanggap ng mga Benepisyo', es: 'Recibir beneficios', ja: '特典を受け取る', ko: '혜택 받기', zh: '领取福利', fr: 'Recevoir des prestations', de: 'Leistungen erhalten', it: 'Ricevi benefici', pt: 'Receber Benefícios' },
  'Request assistance or view available community aid.': { en: 'Request assistance or view available community aid.', tl: 'Humingi ng tulong o tingnan ang magagamit na tulong sa komunidad.', es: 'Solicita asistencia o consulta la ayuda comunitaria disponible.', ja: '支援を要請するか、利用可能なコミュニティ援助を確認します。', ko: '지원을 요청하거나 이용 가능한 커뮤니티 지원을 확인하세요.', zh: '申请援助或查看可用的社区援助。', fr: 'Demandez de l\'aide ou consultez l\'aide communautaire disponible.', de: 'Fordern Sie Unterstützung an oder sehen Sie sich die verfügbare Gemeinschaftshilfe an.', it: 'Richiedi assistenza o visualizza gli aiuti comunitari disponibili.', pt: 'Solicite assistência ou veja a ajuda comunitária disponível.' },
  'Back to Selection': { en: 'Back to Selection', tl: 'Bumalik sa Pagpipilian', es: 'Volver a la selección', ja: '選択に戻る', ko: '선택으로 돌아가기', zh: '返回选择', fr: 'Retour à la sélection', de: 'Zurück zur Auswahl', it: 'Torna alla selezione', pt: 'Voltar à Seleção' },
  'Donation Management': { en: 'Donation Management', tl: 'Pamamahala ng Donasyon', es: 'Gestión de donaciones', ja: '寄付管理', ko: '기부 관리', zh: '捐赠管理', fr: 'Gestion des dons', de: 'Spendenverwaltung', it: 'Gestione donazioni', pt: 'Gestão de Doações' },
  'Change Mode': { en: 'Change Mode', tl: 'Baguhin ang Mode', es: 'Cambiar modo', ja: 'モードを変更', ko: '모드 변경', zh: '更改模式', fr: 'Changer de mode', de: 'Modus ändern', it: 'Cambia modalità', pt: 'Alterar Modo' },
  'Thank you for your generosity!': { en: 'Thank you for your generosity!', tl: 'Salamat sa iyong kagandahang-loob!', es: '¡Gracias por tu generosidad!', ja: 'ご協力ありがとうございます！', ko: '관대함에 감사드립니다!', zh: '感谢您的慷慨！', fr: 'Merci pour votre générosité !', de: 'Vielen Dank für Ihre Großzügigkeit!', it: 'Grazie per la tua generosità!', pt: 'Obrigado pela sua generosidade!' },
  'Transparent distribution of community resources.': { en: 'Transparent distribution of community resources.', tl: 'Maayos na pamamahagi ng mga mapagkukunan ng komunidad.', es: 'Distribución transparente de los recursos comunitarios.', ja: 'コミュニティ・リソースの透明な分配。', ko: '커뮤니티 자원의 투명한 분배.', zh: '社区资源的透明分配。', fr: 'Distribution transparente des ressources communautaires.', de: 'Transparente Verteilung von Gemeinschaftsressourcen.', it: 'Distribuzione trasparente delle risorse comunitarie.', pt: 'Distribuição transparente de recursos comunitários.' },
  'Offer Donation': { en: 'Offer Donation', tl: 'Mag-alok ng Donasyon', es: 'Ofrecer donación', ja: '寄付を申し出る', ko: '기부 제안', zh: '提供捐赠', fr: 'Offrir un don', de: 'Spende anbieten', it: 'Offri donazione', pt: 'Oferecer Doação' },
  'Add Record': { en: 'Add Record', tl: 'Magdagdag ng Rekord', es: 'Agregar registro', ja: '記録を追加', ko: '기록 추가', zh: '添加记录', fr: 'Ajouter un enregistrement', de: 'Datensatz hinzufügen', it: 'Aggiungi record', pt: 'Adicionar Registro' },
  'Decline Reason': { en: 'Decline Reason', tl: 'Dahilan ng Pagtanggi', es: 'Motivo del rechazo', ja: '拒否の理由', ko: '거절 사유', zh: '拒绝原因', fr: 'Motif du refus', de: 'Ablehnungsgrund', it: 'Motivo del rifiuto', pt: 'Motivo da Recusa' },
  'Please state why you are declining this request.': { en: 'Please state why you are declining this request.', tl: 'Mangyaring sabihin kung bakit mo tinatanggihan ang kahilingang ito.', es: 'Indica por qué rechazas esta solicitud.', ja: 'このリクエストを拒否する理由を記入してください。', ko: '이 요청을 거절하는 이유를 명시해 주세요.', zh: '请说明您拒绝此请求的原因。', fr: 'Veuillez indiquer pourquoi vous refusez cette demande.', de: 'Bitte geben Sie an, warum Sie diese Anfrage ablehnen.', it: 'Indica il motivo per cui stai rifiutando questa richiesta.', pt: 'Por favor, indique por que você está recusando este pedido.' },
  'Select Reason': { en: 'Select Reason', tl: 'Pumili ng Dahilan', es: 'Seleccionar motivo', ja: '理由を選択', ko: '사유 선택', zh: '选择原因', fr: 'Sélectionner le motif', de: 'Grund auswählen', it: 'Seleziona motivo', pt: 'Selecionar Motivo' },
  'Specify Reason': { en: 'Specify Reason', tl: 'Tukuyin ang Dahilan', es: 'Especificar motivo', ja: '理由を指定', ko: '사유 지정', zh: '指定原因', fr: 'Préciser le motif', de: 'Grund angeben', it: 'Specifica motivo', pt: 'Especificar Motivo' },
  'Confirm Decline': { en: 'Confirm Decline', tl: 'Kumpirmahin ang Pagtanggi', es: 'Confirmar rechazo', ja: '拒否を確認', ko: '거절 확인', zh: '确认拒绝', fr: 'Confirmer le refus', de: 'Ablehnung bestätigen', it: 'Conferma rifiuto', pt: 'Confirmar Recusa' },
  'New Donation Offer': { en: 'New Donation Offer', tl: 'Bagong Alok na Donasyon', es: 'Nueva oferta de donación', ja: '新しい寄付の申し出', ko: '새로운 기부 제안', zh: '新捐赠提议', fr: 'Nouvelle offre de don', de: 'Neues Spendenangebot', it: 'Nuova offerta di donazione', pt: 'Nova Oferta de Doação' },
  'Donor Name (Optional)': { en: 'Donor Name (Optional)', tl: 'Pangalan ng Donor (Opsyonal)', es: 'Nombre del donante (opcional)', ja: '寄付者名（任意）', ko: '기부자 이름 (선택 사항)', zh: '捐赠者姓名（可选）', fr: 'Nom du donateur (facultatif)', de: 'Name des Spenders (optional)', it: 'Nome del donatore (opzionale)', pt: 'Nome do Doador (Opcional)' },
  'Item Type': { en: 'Item Type', tl: 'Uri ng Item', es: 'Tipo de artículo', ja: 'アイテムの種類', ko: '물품 유형', zh: '物品类型', fr: 'Type d\'article', de: 'Gegenstandstyp', it: 'Tipo di articolo', pt: 'Tipo de Item' },
  'Specific Type': { en: 'Specific Type', tl: 'Tiyak na Uri', es: 'Tipo específico', ja: '具体的な種類', ko: '상세 유형', zh: '具体类型', fr: 'Type spécifique', de: 'Spezifischer Typ', it: 'Tipo specifico', pt: 'Tipo Específico' },
  'Specify Item Name': { en: 'Specify Item Name', tl: 'Tukuyin ang Pangalan ng Item', es: 'Especificar nombre del artículo', ja: 'アイテム名を指定', ko: '물품 이름 지정', zh: '指定物品名称', fr: 'Préciser le nom de l\'article', de: 'Gegenstandsnamen angeben', it: 'Specifica il nome dell\'articolo', pt: 'Especificar Nome do Item' },
  'Quantity / Amount': { en: 'Quantity / Amount', tl: 'Dami / Halaga', es: 'Cantidad / Monto', ja: '数量 / 金額', ko: '수량 / 금액', zh: '数量 / 金额', fr: 'Quantité / Montant', de: 'Menge / Betrag', it: 'Quantità / Importo', pt: 'Quantidade / Valor' },
  'Estimated Item Value': { en: 'Estimated Item Value', tl: 'Tinantyang Halaga ng Item', es: 'Valor estimado del artículo', ja: 'アイテムの推定価値', ko: '물품 예상 가치', zh: '物品估计价值', fr: 'Valeur estimée de l\'article', de: 'Geschätzter Gegenstandswert', it: 'Valore stimato dell\'articolo', pt: 'Valor Estimado do Item' },
  'Manage transparency records and financial accountability.': { en: 'Manage transparency records and financial accountability.', tl: 'Pamahalaan ang mga rekord ng transparency at pananagutan sa pananalapi.', es: 'Gestionar registros de transparencia y responsabilidad financiera.', ja: '透明性の記録と財務上の説明責任を管理します。', ko: '투명성 기록 및 재정적 책임을 관리합니다.', zh: '管理透明度记录和财务问责制。', fr: 'Gérer les dossiers de transparence et la responsabilité financière.', de: 'Transparenzaufzeichnungen und finanzielle Rechenschaftspflicht verwalten.', it: 'Gestisci i registri di trasparenza e la responsabilità finanziaria.', pt: 'Gerenciar registros de transparência e responsabilidade financeira.' },
  'Monitor barangay funds, expenditures, and audit findings.': { en: 'Monitor barangay funds, expenditures, and audit findings.', tl: 'Subaybayan ang mga pondo ng barangay, mga gastos, at mga natuklasan sa audit.', es: 'Monitorear fondos del barangay, gastos y hallazgos de auditoría.', ja: 'バランガイの資金、支出、監査結果を監視します。', ko: '바랑가이 자금, 지출 및 감사 결과를 모니터링합니다.', zh: '监控村级资金、支出和审计结果。', fr: 'Surveiller les fonds du quartier, les dépenses et les conclusions d\'audit.', de: 'Überwachen Sie Barangay-Mittel, Ausgaben und Prüfungsergebnisse.', it: 'Monitora i fondi di quartiere, le spese e i risultati degli audit.', pt: 'Monitorar fundos do bairro, despesas e resultados de auditoria.' },
  'Overview': { en: 'Overview', tl: 'Pangkalahatang-ideya', es: 'Resumen', ja: '概要', ko: '개요', zh: '概览', fr: 'Aperçu', de: 'Übersicht', it: 'Panoramica', pt: 'Visão Geral' },
  'Audits': { en: 'Audits', tl: 'Mga Audit', es: 'Auditorías', ja: '監査', ko: '감사', zh: '审计', fr: 'Audits', de: 'Prüfungen', it: 'Audit', pt: 'Auditorias' },
  'Barangay Funds': { en: 'Barangay Funds', tl: 'Mga Pondo ng Barangay', es: 'Fondos del Barangay', ja: 'バランガイ資金', ko: '바랑가이 자금', zh: '村级资金', fr: 'Fonds du quartier', de: 'Barangay-Mittel', it: 'Fondi di quartiere', pt: 'Fundos do Bairro' },
  'Allocated': { en: 'Allocated', tl: 'Inilaan', es: 'Asignado', ja: '割り当て済み', ko: '할당됨', zh: '已分配', fr: 'Alloué', de: 'Zugewiesen', it: 'Allocato', pt: 'Alocado' },
  'Spent': { en: 'Spent', tl: 'Nagastos', es: 'Gastado', ja: '支出済み', ko: '사용됨', zh: '已支出', fr: 'Dépensé', de: 'Ausgegeben', it: 'Speso', pt: 'Gasto' },
  'Audit Requests from Residents': { en: 'Audit Requests from Residents', tl: 'Mga Kahilingan sa Audit mula sa mga Residente', es: 'Solicitudes de auditoría de residentes', ja: '住民からの監査要請', ko: '주민들의 감사 요청', zh: '居民的审计请求', fr: 'Demandes d\'audit des résidents', de: 'Prüfungsanfragen von Bewohnern', it: 'Richieste di audit dai residenti', pt: 'Solicitações de Auditoria dos Residentes' },
  'No audit requests yet.': { en: 'No audit requests yet.', tl: 'Wala pang mga kahilingan sa audit.', es: 'Aún no hay solicitudes de auditoría.', ja: '監査要請はまだありません。', ko: '아직 감사 요청이 없습니다.', zh: '尚无审计请求。', fr: 'Pas encore de demandes d\'audit.', de: 'Noch keine Prüfungsanfragen.', it: 'Ancora nessuna richiesta di audit.', pt: 'Ainda não há solicitações de auditoria.' },
  'Reason for Request:': { en: 'Reason for Request:', tl: 'Dahilan ng Kahilingan:', es: 'Motivo de la solicitud:', ja: '要請の理由：', ko: '요청 사유:', zh: '请求原因：', fr: 'Motif de la demande :', de: 'Anfragegrund:', it: 'Motivo della richiesta:', pt: 'Motivo da Solicitação:' },
  'Report Provided:': { en: 'Report Provided:', tl: 'Ulat na Ibinigay:', es: 'Informe proporcionado:', ja: '提供されたレポート：', ko: '제공된 보고서:', zh: '已提供报告：', fr: 'Rapport fourni :', de: 'Bericht bereitgestellt:', it: 'Rapporto fornito:', pt: 'Relatório Fornecido:' },
  'Provide Report': { en: 'Provide Report', tl: 'Magbigay ng Ulat', es: 'Proporcionar informe', ja: 'レポートを提供', ko: '보고서 제공', zh: '提供报告', fr: 'Fournir le rapport', de: 'Bericht bereitstellen', it: 'Fornisci rapporto', pt: 'Fornecer Relatório' },
  'Your Audit Requests': { en: 'Your Audit Requests', tl: 'Iyong mga Kahilingan sa Audit', es: 'Tus solicitudes de auditoría', ja: 'あなたの監査要請', ko: '귀하의 감사 요청', zh: '您的审计请求', fr: 'Vos demandes d\'audit', de: 'Ihre Prüfungsanfragen', it: 'Le tue richieste di audit', pt: 'Suas Solicitações de Auditoria' },
  'Official Response:': { en: 'Official Response:', tl: 'Opisyal na Tugon:', es: 'Respuesta oficial:', ja: '公式回答：', ko: '공식 답변:', zh: '官方回复：', fr: 'Réponse officielle :', de: 'Offizielle Antwort:', it: 'Risposta ufficiale:', pt: 'Resposta Oficial:' },
  'Waiting for official response...': { en: 'Waiting for official response...', tl: 'Naghihintay para sa opisyal na tugon...', es: 'Esperando respuesta oficial...', ja: '公式回答を待っています...', ko: '공식 답변을 기다리는 중...', zh: '等待官方回复...', fr: 'En attente d\'une réponse officielle...', de: 'Warten auf offizielle Antwort...', it: 'In attesa di risposta ufficiale...', pt: 'Aguardando resposta oficial...' },
  'Official Audit Reports': { en: 'Official Audit Reports', tl: 'Mga Opisyal na Ulat sa Audit', es: 'Informes oficiales de auditoría', ja: '公式監査レポート', ko: '공식 감사 보고서', zh: '官方审计报告', fr: 'Rapports d\'audit officiels', de: 'Offizielle Prüfungsberichte', it: 'Rapporti di audit ufficiali', pt: 'Relatórios de Auditoria Oficiais' },
  'Publish Audit': { en: 'Publish Audit', tl: 'I-publish ang Audit', es: 'Publicar auditoría', ja: '監査を公開', ko: '감사 게시', zh: '发布审计', fr: 'Publier l\'audit', de: 'Prüfung veröffentlichen', it: 'Pubblica audit', pt: 'Publicar Auditoria' },
  'No published audit reports yet.': { en: 'No published audit reports yet.', tl: 'Wala pang nai-publish na mga ulat sa audit.', es: 'Aún no hay informes de auditoría publicados.', ja: '公開された監査レポートはまだありません。', ko: '게시된 감사 보고서가 없습니다.', zh: '尚无已发布的审计报告。', fr: 'Pas encore de rapports d\'audit publiés.', de: 'Noch keine veröffentlichten Prüfungsberichte.', it: 'Ancora nessun rapporto di audit pubblicato.', pt: 'Ainda não há relatórios de auditoria publicados.' },
  'Verified Audit': { en: 'Verified Audit', tl: 'Beripikadong Audit', es: 'Auditoría verificada', ja: '確認済み監査', ko: '확인된 감사', zh: '已验证审计', fr: 'Audit vérifié', de: 'Verifizierte Prüfung', it: 'Audit verificato', pt: 'Auditoria Verificada' },
  'Estimated Income': { en: 'Estimated Income', tl: 'Tinantyang Kita', es: 'Ingresos estimados', ja: '推定収入', ko: '예상 수입', zh: '预计收入', fr: 'Revenu estimé', de: 'Geschätztes Einkommen', it: 'Entrate stimate', pt: 'Renda Estimada' },
  'Budget Year 2026': { en: 'Budget Year 2026', tl: 'Taon ng Badyet 2026', es: 'Año presupuestario 2026', ja: '2026年度予算', ko: '2026년 예산 연도', zh: '2026 预算年度', fr: 'Année budgétaire 2026', de: 'Haushaltsjahr 2026', it: 'Anno di bilancio 2026', pt: 'Ano Orçamentário 2026' },
  'Total Estimated Income': { en: 'Total Estimated Income', tl: 'Kabuuang Tinantyang Kita', es: 'Ingresos totales estimados', ja: '総推定収入', ko: '총 예상 수입', zh: '总预计收入', fr: 'Revenu total estimé', de: 'Geschätztes Gesamteinkommen', it: 'Entrate totali stimate', pt: 'Renda Total Estimada' },
  'Account Code': { en: 'Account Code', tl: 'Code ng Account', es: 'Código de cuenta', ja: '勘定コード', ko: '계정 코드', zh: '账户代码', fr: 'Code de compte', de: 'Kontocode', it: 'Codice conto', pt: 'Código da Conta' },
  'Source of Income': { en: 'Source of Income', tl: 'Pinagmulan ng Kita', es: 'Fuente de ingresos', ja: '収入源', ko: '수입원', zh: '收入来源', fr: 'Source de revenus', de: 'Einkommensquelle', it: 'Fonte di reddito', pt: 'Fonte de Renda' },
  'Amount (₱)': { en: 'Amount (₱)', tl: 'Halaga (₱)', es: 'Monto (₱)', ja: '金額 (₱)', ko: '금액 (₱)', zh: '金额 (₱)', fr: 'Montant (₱)', de: 'Betrag (₱)', it: 'Importo (₱)', pt: 'Valor (₱)' },
  'Barangay Expenditure Program': { en: 'Barangay Expenditure Program', tl: 'Programa ng Gastos ng Barangay', es: 'Programa de gastos del Barangay', ja: 'バランガイ支出プログラム', ko: '바랑가이 지출 프로그램', zh: '村级支出计划', fr: 'Programme de dépenses du quartier', de: 'Barangay-Ausgabenprogramm', it: 'Programma di spesa di quartiere', pt: 'Programa de Despesas do Bairro' },
  'Program/Projects/Activities': { en: 'Program/Projects/Activities', tl: 'Programa/Mga Proyekto/Mga Aktibidad', es: 'Programa/Proyectos/Actividades', ja: 'プログラム/プロジェクト/活動', ko: '프로그램/프로젝트/활동', zh: '计划/项目/活动', fr: 'Programme/Projets/Activités', de: 'Programm/Projekte/Aktivitäten', it: 'Programma/Progetti/Attività', pt: 'Programa/Projetos/Atividades' },
  'Request Audit Report': { en: 'Request Audit Report', tl: 'Humingi ng Ulat sa Audit', es: 'Solicitar informe de auditoría', ja: '監査レポートを要請', ko: '감사 보고서 요청', zh: '请求审计报告', fr: 'Demander un rapport d\'audit', de: 'Prüfungsbericht anfordern', it: 'Richiedi rapporto di audit', pt: 'Solicitar Relatório de Auditoria' },
  'Contact Number (Optional)': { en: 'Contact Number (Optional)', tl: 'Numero ng Telepono (Opsyonal)', es: 'Número de contacto (opcional)', ja: '連絡先番号（任意）', ko: '연락처 (선택 사항)', zh: '联系电话（可选）', fr: 'Numéro de contact (facultatif)', de: 'Kontaktnummer (optional)', it: 'Numero di contatto (opzionale)', pt: 'Número de Contato (Opcional)' },
  'Submit Request': { en: 'Submit Request', tl: 'I-sumite ang Kahilingan', es: 'Enviar solicitud', ja: '要請を送信', ko: '요청 제출', zh: '提交请求', fr: 'Soumettre la demande', de: 'Anfrage einreichen', it: 'Invia richiesta', pt: 'Enviar Solicitação' },
  'Publish Audit Report': { en: 'Publish Audit Report', tl: 'I-publish ang Ulat sa Audit', es: 'Publicar informe de auditoría', ja: '監査レポートを公開', ko: '감사 보고서 게시', zh: '发布审计报告', fr: 'Publier le rapport d\'audit', de: 'Prüfungsbericht veröffentlichen', it: 'Pubblica rapporto di audit', pt: 'Publicar Relatório de Auditoria' },
  'Report Title': { en: 'Report Title', tl: 'Pamagat ng Ulat', es: 'Título del informe', ja: 'レポートのタイトル', ko: '보고서 제목', zh: '报告标题', fr: 'Titre du rapport', de: 'Berichtstitel', it: 'Titolo del rapporto', pt: 'Título do Relatório' },
  'Description / Findings': { en: 'Description / Findings', tl: 'Paglalarawan / Mga Natuklasan', es: 'Descripción / Hallazgos', ja: '説明 / 調査結果', ko: '설명 / 결과', zh: '描述 / 调查结果', fr: 'Description / Conclusions', de: 'Beschreibung / Ergebnisse', it: 'Descrizione / Risultati', pt: 'Descrição / Resultados' },
  'Author / Auditor': { en: 'Author / Auditor', tl: 'May-akda / Auditor', es: 'Autor / Auditor', ja: '著者 / 監査人', ko: '작성자 / 감사인', zh: '作者 / 审计员', fr: 'Auteur / Auditeur', de: 'Autor / Prüfer', it: 'Autore / Revisore', pt: 'Autor / Auditor' },
  'Publish Report': { en: 'Publish Report', tl: 'I-publish ang Ulat', es: 'Publicar informe', ja: 'レポートを公開', ko: '보고서 게시', zh: '发布报告', fr: 'Publier le rapport', de: 'Bericht veröffentlichen', it: 'Pubblica rapporto', pt: 'Publicar Relatório' },
  'Provide Audit Report': { en: 'Provide Audit Report', tl: 'Magbigay ng Ulat sa Audit', es: 'Proporcionar informe de auditoría', ja: '監査レポートを提供', ko: '감사 보고서 제공', zh: '提供审计报告', fr: 'Fournir le rapport d\'audit', de: 'Prüfungsbericht bereitstellen', it: 'Fornisci rapporto di audit', pt: 'Fornecer Relatório de Auditoria' },
  'Report Content / Findings': { en: 'Report Content / Findings', tl: 'Nilalaman ng Ulat / Mga Natuklasan', es: 'Contenido del informe / Hallazgos', ja: 'レポートの内容 / 調査結果', ko: '보고서 내용 / 결과', zh: '报告内容 / 调查结果', fr: 'Contenu du rapport / Conclusions', de: 'Berichtsinhalt / Ergebnisse', it: 'Contenuto del rapporto / Risultati', pt: 'Conteúdo do Relatório / Resultados' },
  'Send Report to Resident': { en: 'Send Report to Resident', tl: 'Ipadala ang Ulat sa Residente', es: 'Enviar informe al residente', ja: '住民にレポートを送信', ko: '주민에게 보고서 전송', zh: '向居民发送报告', fr: 'Envoyer le rapport au résident', de: 'Bericht an Bewohner senden', it: 'Invia rapporto al residente', pt: 'Enviar Relatório ao Residente' },
  'Update Budget': { en: 'Update Budget', tl: 'I-update ang Badyet', es: 'Actualizar presupuesto', ja: '予算を更新', ko: '예산 업데이트', zh: '更新预算', fr: 'Mettre à jour le budget', de: 'Budget aktualisieren', it: 'Aggiorna bilancio', pt: 'Atualizar Orçamento' },
  'Allocated Amount (₱)': { en: 'Allocated Amount (₱)', tl: 'Inilaang Halaga (₱)', es: 'Monto asignado (₱)', ja: '割り当て額 (₱)', ko: '할당 금액 (₱)', zh: '分配金额 (₱)', fr: 'Montant alloué (₱)', de: 'Zugewiesener Betrag (₱)', it: 'Importo allocato (₱)', pt: 'Valor Alocado (₱)' },
  'Spent Amount (₱)': { en: 'Spent Amount (₱)', tl: 'Nagastos na Halaga (₱)', es: 'Monto gastado (₱)', ja: '支出額 (₱)', ko: '사용 금액 (₱)', zh: '支出金额 (₱)', fr: 'Montant dépensé (₱)', de: 'Ausgegebener Betrag (₱)', it: 'Importo speso (₱)', pt: 'Valor Gasto (₱)' },
  'Note on Donations': {
    en: 'The admin will not approve your donation until the item has been delivered to the barangay.',
    tl: 'Hindi aaprubahan ng admin ang iyong donasyon hanggang sa maihatid ang item sa barangay.',
    es: 'El administrador no aprobará su donación hasta que el artículo haya sido entregado al barangay.',
    ja: 'アイテムがバランガイに届けられるまで、管理者はあなたの寄付を承認しません。',
    ko: '물품이 바랑가이에 전달될 때까지 관리자는 귀하의 기부를 승인하지 않습니다.',
    zh: '在物品送到村委会之前，管理员不会批准您的捐赠。',
    fr: 'L\'administrateur n\'approuvera pas votre don tant que l\'article n\'aura pas été livré au barangay.',
    de: 'Der Administrator wird Ihre Spende erst genehmigen, wenn der Artikel an das Barangay geliefert wurde.',
    it: 'L\'amministratore non approverà la tua donasyon finché l\'articolo non sarà stato consegnato al barangay.',
    pt: 'O administrador não aprovará sua doação até que o item tenha sido entregue ao bairro.'
  },
  'Submit Donation Offer': { en: 'Submit Donation Offer', tl: 'I-sumite ang Alok na Donasyon', es: 'Enviar oferta de donación', ja: '寄付の申し出を送信', ko: '기부 제안 제출', zh: '提交捐赠提议', fr: 'Soumettre l\'offre de don', de: 'Spendenangebot einreichen', it: 'Invia offerta di donazione', pt: 'Enviar Oferta de Doação' },
  'Benefit Application': { en: 'Benefit Application', tl: 'Aplikasyon para sa Benepisyo', es: 'Solicitud de beneficio', ja: '特典の申請', ko: '혜택 신청', zh: '福利申请', fr: 'Demande de prestation', de: 'Leistungsantrag', it: 'Domanda di beneficio', pt: 'Solicitação de Benefício' },
  'Reason for Application': { en: 'Reason for Application', tl: 'Dahilan ng Aplikasyon', es: 'Motivo de la solicitud', ja: '申請の理由', ko: '신청 사유', zh: '申请原因', fr: 'Motif de la demande', de: 'Antragsgrund', it: 'Motivo della domanda', pt: 'Motivo da Solicitação' },
  'Detailed Justification & Proof of Need': { en: 'Detailed Justification & Proof of Need', tl: 'Detalyadong Katwiran at Patunay ng Pangangailangan', es: 'Justificación detallada y prueba de necesidad', ja: '詳細な正当化と必要性の証明', ko: '상세한 정당화 및 필요성 증명', zh: '详细理由及需求证明', fr: 'Justification détaillée et preuve de besoin', de: 'Detaillierte Begründung und Bedarfsnachweis', it: 'Giustificazione dettagliata e prova del bisogno', pt: 'Justificativa Detalhada e Prova de Necessidade' },
  'High Value Item - Requirements:': { en: 'High Value Item - Requirements:', tl: 'Mataas na Halaga ng Item - Mga Kinakailangan:', es: 'Artículo de alto valor - Requisitos:', ja: '高価値アイテム - 要件：', ko: '고가 물품 - 요구 사항:', zh: '高价值物品 - 要求：', fr: 'Article de grande valeur - Exigences :', de: 'Hochwertiger Gegenstand - Anforderungen:', it: 'Articolo di alto valore - Requisiti:', pt: 'Item de Alto Valor - Requisitos:' },
  'Standard Requirements:': { en: 'Standard Requirements:', tl: 'Mga Karaniwang Kinakailangan:', es: 'Requisitos estándar:', ja: '標準要件：', ko: '표준 요구 사항:', zh: '标准要求：', fr: 'Exigences standard :', de: 'Standardanforderungen:', it: 'Requisiti standard:', pt: 'Requisitos Padrão:' },
  'Note on Safety & Security:': { en: 'Note on Safety & Security:', tl: 'Paalala sa Kaligtasan at Seguridad:', es: 'Nota sobre seguridad y protección:', ja: '安全性とセキュリティに関する注意：', ko: '안전 및 보안에 관한 주의 사항:', zh: '关于安全与保障的说明：', fr: 'Note sur la sécurité et la sûreté :', de: 'Hinweis zu Sicherheit und Schutz:', it: 'Nota sulla sicurezza e protezione:', pt: 'Nota sobre Segurança e Proteção:' },
  'All applications are reviewed by Barangay Officials. Providing false information may lead to disqualification from future benefits.': { en: 'All applications are reviewed by Barangay Officials. Providing false information may lead to disqualification from future benefits.', tl: 'Ang lahat ng mga aplikasyon ay sinusuri ng mga Opisyal ng Barangay. Ang pagbibigay ng maling impormasyon ay maaaring humantong sa diskwalipikasyon mula sa mga benepisyo sa hinaharap.', es: 'Todas las solicitudes son revisadas por los funcionarios del Barangay. Proporcionar información falsa puede dar lugar a la descalificación de futuros beneficios.', ja: 'すべての申請はバランガイ職員によって審査されます。虚偽の情報を提供した場合、将来の特典から除外される可能性があります。', ko: '모든 신청서는 바랑가이 공무원이 검토합니다. 허위 정보를 제공하면 향후 혜택에서 제외될 수 있습니다.', zh: '所有申请均由村级官员审核。提供虚假信息可能会导致被取消未来领取福利的资格。', fr: 'Toutes les demandes sont examinées par les officiels du quartier. Fournir de fausses informations peut entraîner une disqualification des prestations futures.', de: 'Alle Anträge werden von Barangay-Beamten geprüft. Die Angabe falscher Informationen kann zum Ausschluss von künftigen Leistungen führen.', it: 'Tutte le domande sono esaminate dai funzionari di quartiere. Fornire informazioni false può portare alla squalifica dai benefici futuri.', pt: 'Todas as solicitações são revisadas pelos funcionários do bairro. Fornecer informações falsas pode levar à desqualificação de benefícios futuros.' },
};

export default function App() {
  const [authStep, setAuthStep] = useState<AuthStep>('landing');
  const [role, setRole] = useState<UserRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [residentMode, setResidentMode] = useState<ResidentMode | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barangayServices, setBarangayServices] = useState<BarangayService[]>([]);
  const [officialAvailabilities, setOfficialAvailabilities] = useState<OfficialAvailability[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string, onConfirm: () => void } | null>(null);
  
  const showAlert = (msg: string) => setAlertMessage(msg);
  const showConfirm = (msg: string, onConfirm: () => void) => setConfirmDialog({ message: msg, onConfirm });
  const [projects, setProjects] = useState<Project[]>([]);
  const [auditRequests, setAuditRequests] = useState<AuditRequest[]>([]);
  const [auditReports, setAuditReports] = useState<AuditReport[]>([]);
  const [budget, setBudget] = useState<Budget[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [formerOfficials, setFormerOfficials] = useState<Official[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const hasSyncedOfficials = useRef(false);
  const hasSyncedFormerOfficials = useRef(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [achievementData, setAchievementData] = useState({
    title: '',
    year: '',
    desc: '',
    icon: 'Trophy',
    colorTheme: 'blue'
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [residents, setResidents] = useState<{ id: string, name: string, photoURL?: string, gender?: string }[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Message['senderProfile'] | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [dashboardSubTab, setDashboardSubTab] = useState<string>('system');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [calls, setCalls] = useState<Call[]>([]);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const isRegisteringRef = useRef(false);


  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [canEditEmail, setCanEditEmail] = useState(false);
  const [authContact, setAuthContact] = useState('');
  const [canEditContact, setCanEditContact] = useState(false);
  const [originalContact, setOriginalContact] = useState('');
  const [showContactConfirmModal, setShowContactConfirmModal] = useState(false);
  const [contactError, setContactError] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false);
  const [approvalModalConfig, setApprovalModalConfig] = useState<{
    isOpen: boolean;
    recordId: string;
    featureType: 'appointment' | 'donation' | 'application' | 'request' | 'project' | 'audit';
    title: string;
    residentId: string;
    residentName: string;
    extraData?: any;
  } | null>(null);
  const [approvalFormData, setApprovalFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    requirements: [] as string[],
    instructions: ''
  });
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Normal' | 'Strong' | ''>('');
  const [passwordError, setPasswordError] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showAuthConfirmPassword, setShowAuthConfirmPassword] = useState(false);
  const [authTermsAccepted, setAuthTermsAccepted] = useState(false);
  const [authPurok, setAuthPurok] = useState('');
  const [authPosition, setAuthPosition] = useState('');
  const [authNickname, setAuthNickname] = useState('');
  const [authIdImage, setAuthIdImage] = useState<File | null>(null);
  const [authIdImagePreview, setAuthIdImagePreview] = useState<string | null>(null);
  const [isScanningId, setIsScanningId] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [appLanguage, setAppLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const t = (key: string) => {
    return translations[key]?.[appLanguage] || key;
  };
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileNickname, setEditProfileNickname] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [authGender, setAuthGender] = useState<'male' | 'female' | ''>('');
  const [authPhotoURL, setAuthPhotoURL] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>('resident');
  const [authAdminCode, setAuthAdminCode] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showSettingsOldPassword, setShowSettingsOldPassword] = useState(false);
  const [showSettingsNewPassword, setShowSettingsNewPassword] = useState(false);
  const [showSettingsConfirmPassword, setShowSettingsConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [callingOfficial, setCallingOfficial] = useState<Official | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isRTCReady, setIsRTCReady] = useState(false);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [showPopulationBreakdown, setShowPopulationBreakdown] = useState(false);

  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return '';
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score < 3) return 'Weak';
    if (score < 5) return 'Medium';
    return 'Strong';
  };

  useEffect(() => {
    const strength = getPasswordStrength(newPassword);
    setPasswordStrength(strength.label as any);
    
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      setPasswordError(t('Passwords do not match.'));
    } else {
      setPasswordError('');
    }
  }, [newPassword, confirmNewPassword, appLanguage]);

  const validateContact = (contact: string) => {
    if (!contact) return '';
    const regex = /^09\d{9}$/;
    if (!regex.test(contact)) return 'Invalid PH mobile number (e.g., 09123456789)';
    return '';
  };

  useEffect(() => {
    if (canEditContact) {
      setContactError(validateContact(authContact));
    }
  }, [authContact, canEditContact]);

  const maskContact = (contact: string) => {
    if (!contact || contact.length < 11) return contact;
    return contact.substring(0, 4) + '****' + contact.substring(8);
  };

  const handleSaveContact = async () => {
    if (contactError) return;
    setIsSavingContact(true);
    try {
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          contact: authContact
        });
        setOriginalContact(authContact);
        setCanEditContact(false);
        setShowContactConfirmModal(false);
        showAlert('Contact number updated successfully!');
        
        // Add undo option
        const undoTimeout = setTimeout(() => {
          // Clear undo state if needed, but for now just show alert
        }, 5000);
      }
    } catch (error: any) {
      showAlert('Error saving contact: ' + error.message);
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleUpdatePassword = async () => {
    setIsChangingPassword(true);
    try {
      if (auth.currentUser && auth.currentUser.email) {
        // Re-authenticate first
        const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Then update password
        await updatePassword(auth.currentUser, newPassword);
        setShowPasswordConfirmModal(false);
        showAlert('Password updated successfully! You will be logged out for security.');
        
        // Automatically log out and redirect to login
        setTimeout(async () => {
          await signOut(auth);
          setAuthStep('signin_form');
          setOldPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        }, 2000);
      }
    } catch (error: any) {
      setShowPasswordConfirmModal(false);
      if (error.code === 'auth/wrong-password') {
        showAlert(t('Incorrect old password. Please try again.'));
      } else {
        showAlert(t('Your password is incorrect and does not match.'));
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleGlobalApprove = async () => {
    if (!approvalModalConfig || isApproving) return;
    
    const { recordId, featureType, residentId, residentName, extraData } = approvalModalConfig;
    const { scheduledDate, scheduledTime, requirements, instructions } = approvalFormData;

    const isSimpleApproval = ['project', 'audit'].includes(featureType);

    if (!isSimpleApproval) {
      if (!scheduledDate || !scheduledTime) {
        showAlert('Please provide both scheduled date and time.');
        return;
      }
      if (requirements.length === 0 && !instructions.trim()) {
        showAlert('Please provide either requirements or instructions.');
        return;
      }
    }

    setIsApproving(true);
    const generatedMessage = isSimpleApproval 
      ? `Your ${featureType === 'audit' ? 'transparency request' : 'project suggestion'} has been approved by the admin.`
      : `Your ${featureType} has been approved. Please proceed on ${scheduledDate} at ${scheduledTime}.${requirements.length > 0 ? ` Requirements: ${requirements.join(', ')}.` : ''}${instructions ? ` Additional instructions: ${instructions}.` : ''}`;

    try {
      // 1. Store approval record
      const approvalRecord = {
        record_id: recordId,
        feature_type: featureType,
        approved_by: auth.currentUser?.uid || 'unknown',
        approved_at: new Date().toISOString(),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        message: generatedMessage,
        requirements: requirements,
        instructions: instructions
      };
      console.log('Attempting to save approval record:', approvalRecord);
      await addDoc(collection(db, 'approval_records'), approvalRecord);

      // 2. Send message from Leo Reyes (admin)
      const messageData = {
        text: generatedMessage,
        senderId: 'admin',
        senderName: 'Leo Reyes',
        receiverId: residentId || 'unknown',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'unread',
        senderRole: 'official',
        isAutomated: true,
        createdAt: serverTimestamp(),
        senderProfile: {
          fullName: 'Leo Reyes',
          nickname: 'Admin Leo',
          address: 'Barangay Hall',
          contact: '',
          purok: '',
          gender: 'Male',
          photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400'
        }
      };
      console.log('Attempting to send message:', messageData);
      await addDoc(collection(db, 'messages'), messageData);

      // 3. Update request status to "Approved"
      console.log(`Updating status for ${featureType} with ID ${recordId}`);
      if (featureType === 'appointment') {
        const appRef = doc(db, 'appointments', recordId);
        await updateDoc(appRef, { 
          status: 'approved',
          date: scheduledDate,
          timeSlot: scheduledTime
        });
      } else if (featureType === 'donation') {
        const donationRef = doc(db, 'donations', recordId);
        await updateDoc(donationRef, { 
          status: 'approved', 
          submissionDeadline: scheduledDate,
          adminDeadlineDate: scheduledDate,
          adminDeadlineTime: scheduledTime
        });
      } else if (featureType === 'application') {
        const appRef = doc(db, 'donations', recordId);
        const appSnap = await getDoc(appRef);
        if (appSnap.exists()) {
          const application = appSnap.data() as Donation;
          if (application.isApplication) {
            const availableQuery = query(
              collection(db, 'donations'),
              where('status', '==', 'available'),
              where('item', '==', application.item)
            );
            const availableDocs = await getDocs(availableQuery);
            
            let remainingToDeduct = application.quantity;
            const batch = writeBatch(db);

            for (const d of availableDocs.docs) {
              if (remainingToDeduct <= 0) break;
              const donationData = d.data() as Donation;
              if (donationData.isApplication) continue;
              
              if (application.specificType && donationData.specificType !== application.specificType) {
                continue;
              }

              if (donationData.quantity <= remainingToDeduct) {
                remainingToDeduct -= donationData.quantity;
                batch.update(d.ref, { status: 'released' });
              } else {
                batch.update(d.ref, { quantity: donationData.quantity - remainingToDeduct });
                remainingToDeduct = 0;
              }
            }

            if (remainingToDeduct > 0) {
              showAlert('Not enough available items to fulfill this application.');
              setIsApproving(false);
              return;
            }

            batch.update(appRef, { 
              status: 'approved', 
              pickupDeadline: scheduledDate 
            });
            await batch.commit();
          }
        }
      } else if (featureType === 'project') {
        const projectRef = doc(db, 'projects', recordId);
        await updateDoc(projectRef, { status: 'approved' });
      } else if (featureType === 'audit') {
        const auditRef = doc(db, 'auditRequests', recordId);
        await updateDoc(auditRef, { status: 'responded', responseReport: generatedMessage });
      }

      // 4. Send notification
      if (residentId) {
        console.log('Sending notification to:', residentId);
        await addNotification(residentId, `${featureType.charAt(0).toUpperCase() + featureType.slice(1)} Approved`, generatedMessage, featureType === 'audit' ? 'transparency' : featureType as any);
      }

      setApprovalModalConfig(null);
      setApprovalFormData({ scheduledDate: '', scheduledTime: '', requirements: [], instructions: '' });
      showAlert(`${featureType.charAt(0).toUpperCase() + featureType.slice(1)} approved successfully.`);
    } catch (error) {
      console.error('Approval error details:', error);
      if (error instanceof Error && error.message.includes('permission')) {
        showAlert('Permission denied. Please ensure you are logged in as an authorized official.');
      } else {
        showAlert('Failed to approve. Please try again.');
      }
    } finally {
      setIsApproving(false);
    }
  };

  const clearAuthForm = (keepSuccess = false, keepName = false) => {
    if (!keepName) setAuthName('');
    setAuthEmail('');
    setAuthContact('');
    setAuthPassword('');
    setAuthConfirmPassword('');
    setAuthPurok('');
    setAuthPosition('');
    setAuthNickname('');
    setAuthTermsAccepted(false);
    setAuthError(null);
    setAuthIdImage(null);
    setAuthIdImagePreview(null);
    setIsScanningId(false);
    setScanStatus('idle');
    setScanMessage('');
    if (!keepSuccess) setAuthSuccess(null);
  };

  // Clear auth form when authStep changes
  useEffect(() => {
    if (['signin_type', 'landing'].includes(authStep)) {
      clearAuthForm();
    } else if (authStep === 'signin_form') {
      // Don't clear success message if we just came from registration
      // This is handled manually in handleIdVerification
    }
  }, [authStep]);

  // Auth effect
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection successful");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If we are in the middle of registration, don't auto-login
        if (isRegisteringRef.current) {
          return;
        }
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role || 'resident');
          setAuthName(userData.fullName || '');
          setAuthNickname(userData.nickname || '');
          setAuthContact(userData.contact || '');
          setOriginalContact(userData.contact || '');
          setAuthPurok(userData.purok || '');
          setAuthPosition(userData.position || '');
          setAuthGender(userData.gender || '');
          setAuthPhotoURL(userData.photoURL || '');
          setAuthEmail(userData.email || user.email || '');
          setNotifEmail(userData.notifEmail ?? true);
          setNotifSMS(userData.notifSMS ?? false);
          setSoundEnabled(userData.soundEnabled ?? true);
          setAppLanguage(userData.language ?? 'en');
          setDarkMode(userData.darkMode ?? false);
          setCurrentUser(userData);
        } else {
          // User document doesn't exist, they might need to register
          setRole('resident');
          setCurrentUser(null);
        }
      } else {
        setRole(null);
        setCurrentUser(null);
        clearAuthForm();
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch users for chat
  useEffect(() => {
    if (!isAuthReady || !auth.currentUser) return;

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().fullName || doc.data().name || 'Unknown User',
        photoURL: doc.data().photoURL,
        gender: doc.data().gender
      }));
      setResidents(fetchedUsers);
    }, (error) => {
      console.error("Error fetching users:", error);
    });

    return () => unsubUsers();
  }, [isAuthReady]);

  // Auto-cancellation logic
  useEffect(() => {
    const checkAndCancelExpiredItems = async () => {
      const now = new Date();
      
      // 1. Check Appointments
      for (const app of appointments) {
        if (app.status === 'approved' || app.status === 'pending') {
          const appDate = new Date(app.date);
          const isExpired = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate() + 1) < now;
          
          if (isExpired) {
            await updateDoc(doc(db, 'appointments', app.id), { status: 'cancelled' });
            if (app.residentId) {
              await addNotification(
                app.residentId, 
                'Appointment Cancelled', 
                'Your appointment has been canceled because the scheduled date has passed without completion.', 
                'appointment'
              );
            }
          }
        }
      }

      // 2. Check Donations (Offers and Applications)
      for (const donation of donations) {
        if (donation.isApplication) {
          // Applications
          if (donation.status === 'approved') {
            const deadline = donation.pickupDeadline;
            if (deadline) {
              const deadlineDate = new Date(deadline);
              const isExpired = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate() + 1) < now;
              if (isExpired) {
                await updateDoc(doc(db, 'donations', donation.id), { 
                  status: 'declined', 
                  declineReason: 'Missed pickup deadline (Auto-declined)' 
                });
                if (donation.beneficiaryUid) {
                  await addNotification(donation.beneficiaryUid, 'Application Declined', 'Your application was declined because the pickup deadline has passed.', 'application');
                }
              }
            }
          } else if (donation.status === 'pending_application') {
            // Auto-decline pending applications after 7 days of inactivity
            const createdAt = new Date(donation.date);
            const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
            if (diffDays > 7) {
              await updateDoc(doc(db, 'donations', donation.id), { 
                status: 'declined', 
                declineReason: 'Application expired due to inactivity (7 days)' 
              });
              if (donation.beneficiaryUid) {
                await addNotification(donation.beneficiaryUid, 'Application Expired', 'Your application has expired due to 7 days of inactivity.', 'application');
              }
            }
          }
        } else {
          // Donation Offers
          if (donation.status === 'pending_donation') {
            if (donation.residentDeliveryDate && donation.residentDeliveryTime) {
              const residentDeadline = new Date(`${donation.residentDeliveryDate}T${donation.residentDeliveryTime}`);
              if (residentDeadline < now) {
                await updateDoc(doc(db, 'donations', donation.id), { 
                  status: 'declined', 
                  declineReason: 'Missed delivery schedule (Auto-declined)' 
                });
                if (donation.donorUid) {
                  await addNotification(donation.donorUid, 'Donation Declined', 'Your donation offer was declined because the delivery schedule passed without approval.', 'donation');
                }
              }
            } else {
              // Auto-decline pending donations without schedule after 7 days
              const createdAt = new Date(donation.date);
              const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
              if (diffDays > 7) {
                await updateDoc(doc(db, 'donations', donation.id), { 
                  status: 'declined', 
                  declineReason: 'Donation offer expired due to inactivity (7 days)' 
                });
                if (donation.donorUid) {
                  await addNotification(donation.donorUid, 'Donation Expired', 'Your donation offer has expired due to 7 days of inactivity.', 'donation');
                }
              }
            }
          } else if (donation.status === 'approved' || donation.status === 'available') {
            const deadline = donation.adminDeadlineDate || donation.submissionDeadline;
            if (deadline) {
              const deadlineDate = new Date(deadline);
              const isExpired = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate() + 1) < now;
              if (isExpired) {
                await updateDoc(doc(db, 'donations', donation.id), { 
                  status: 'declined', 
                  declineReason: 'Missed completion deadline (Auto-declined)' 
                });
                if (donation.donorUid) {
                  await addNotification(donation.donorUid, 'Donation Declined', 'Your donation was declined because the completion deadline has passed.', 'donation');
                }
              }
            }
          }
        }
      }
    };

    const interval = setInterval(checkAndCancelExpiredItems, 1000 * 60 * 60); // Check every hour
    checkAndCancelExpiredItems(); // Initial check
    
    return () => clearInterval(interval);
  }, [appointments, donations, isAuthReady]);

  // Firestore Listeners
  useEffect(() => {
    if (!isAuthReady || !auth.currentUser || !role) return;

    const uid = auth.currentUser.uid;

    const unsubDonations = onSnapshot(collection(db, 'donations'), (snapshot) => {
      setDonations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'donations'));

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));

    const unsubBudget = onSnapshot(collection(db, 'budget'), (snapshot) => {
      setBudget(snapshot.docs.map(doc => doc.data() as Budget));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'budget'));

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'announcements'));

    const auditQuery = role === 'official' 
      ? collection(db, 'auditRequests') 
      : query(collection(db, 'auditRequests'), where('requesterUid', '==', uid));

    const unsubAudit = onSnapshot(auditQuery, (snapshot) => {
      setAuditRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditRequest)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'auditRequests'));

    const unsubAuditReports = onSnapshot(collection(db, 'auditReports'), (snapshot) => {
      setAuditReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditReport)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'auditReports'));

    const messagesQuery = role === 'official'
      ? collection(db, 'messages')
      : query(collection(db, 'messages'), or(where('senderId', '==', uid), where('receiverId', '==', uid)));

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      msgs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeA - timeB;
      });
      setMessages(msgs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'messages'));

    const notificationsQuery = role === 'official'
      ? query(collection(db, 'notifications'), where('userId', '==', 'admin'))
      : query(collection(db, 'notifications'), or(where('userId', '==', uid), where('userId', '==', 'resident')));

    const unsubNotifs = onSnapshot(notificationsQuery, (snapshot) => {
      const fetchedNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      fetchedNotifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNotifications(fetchedNotifs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'notifications'));

    const callsQuery = role === 'official'
      ? query(collection(db, 'calls'), and(or(where('callerId', '==', uid), where('receiverId', '==', uid), where('receiverId', '==', 'admin')), where('status', 'in', ['ringing', 'answered', 'declined', 'ended'])))
      : query(collection(db, 'calls'), and(or(where('callerId', '==', uid), where('receiverId', '==', uid)), where('status', 'in', ['ringing', 'answered', 'declined', 'ended'])));

    const unsubCalls = onSnapshot(callsQuery, (snapshot) => {
      const fetchedCalls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Call));
      setCalls(fetchedCalls);
      
      const active = fetchedCalls.find(c => c.status === 'answered' || (c.status === 'ringing' && c.callerId === uid));
      setActiveCall(active || null);
      
      const incoming = fetchedCalls.find(c => c.status === 'ringing' && c.callerId !== uid);
      if (incoming && active && incoming.id !== active.id) {
        // Auto-decline if busy
        updateDoc(doc(db, 'calls', incoming.id), { status: 'declined' }).catch(console.error);
        setIncomingCall(null);
      } else {
        setIncomingCall(incoming || null);
      }
      
      // Cleanup duplicate active calls
      if (active) {
        const duplicates = fetchedCalls.filter(c => c.id !== active.id && (c.status === 'answered' || (c.status === 'ringing' && c.callerId === uid)));
        duplicates.forEach(d => {
          updateDoc(doc(db, 'calls', d.id), { status: 'ended' }).catch(console.error);
        });
      }
      
      // Missed call timeout (45 seconds)
      fetchedCalls.forEach(c => {
        if (c.status === 'ringing') {
          const callTime = new Date(c.timestamp).getTime();
          const now = new Date().getTime();
          if (now - callTime > 45000) {
            updateDoc(doc(db, 'calls', c.id), { status: 'missed' }).catch(console.error);
          }
        }
      });

      const declined = fetchedCalls.find(c => c.status === 'declined' && c.callerId === uid);
      if (declined) {
        addNotification(uid, 'Call Declined', `Your call to ${declined.receiverName} was declined.`, 'system');
        deleteDoc(doc(db, 'calls', declined.id));
      }

      const missed = fetchedCalls.find(c => c.status === 'missed' && c.callerId === uid);
      if (missed) {
        addNotification(uid, 'Call Missed', `Your call to ${missed.receiverName} was not answered.`, 'system');
        deleteDoc(doc(db, 'calls', missed.id));
      }

      const ended = fetchedCalls.find(c => c.status === 'ended' && (c.callerId === uid || c.receiverId === uid));
      if (ended) {
        setTimeout(() => {
          deleteDoc(doc(db, 'calls', ended.id)).catch(console.error);
        }, 2000);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'calls'));

    const unsubOfficials = onSnapshot(collection(db, 'officials'), (snapshot) => {
      const fetchedOfficials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Official));
      // Sort by order if available
      fetchedOfficials.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setOfficials(fetchedOfficials);
      
      // Seed if empty or sync streets if admin
      if (role === 'official' && !hasSyncedOfficials.current) {
        hasSyncedOfficials.current = true;
        seedOfficials();
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'officials'));

    const unsubFormerOfficials = onSnapshot(collection(db, 'former_officials'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Official));
      fetched.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      setFormerOfficials(fetched);
      
      if (role === 'official' && !hasSyncedFormerOfficials.current) {
        hasSyncedFormerOfficials.current = true;
        seedFormerOfficials();
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'former_officials'));

    const unsubAchievements = onSnapshot(collection(db, 'achievements'), (snapshot) => {
      const fetchedAchievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
      setAchievements(fetchedAchievements);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'achievements'));

    const unsubAppointments = onSnapshot(role === 'official' 
      ? collection(db, 'appointments') 
      : query(collection(db, 'appointments'), where('residentId', '==', uid)), (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'appointments'));

    const unsubServices = onSnapshot(collection(db, 'barangayServices'), (snapshot) => {
      setBarangayServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BarangayService)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'barangayServices'));

    const unsubAvailabilities = onSnapshot(collection(db, 'officialAvailability'), (snapshot) => {
      setOfficialAvailabilities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OfficialAvailability)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'officialAvailability'));

    return () => {
      unsubDonations();
      unsubProjects();
      unsubBudget();
      unsubAnnouncements();
      unsubAudit();
      unsubAuditReports();
      unsubMessages();
      unsubNotifs();
      unsubCalls();
      unsubOfficials();
      unsubFormerOfficials();
      unsubAchievements();
      unsubAppointments();
      unsubServices();
      unsubAvailabilities();
    };
  }, [isAuthReady, role]);

  // Auto-deletion logic for expired donations
  useEffect(() => {
    const checkExpiredDonations = async () => {
      const now = new Date().toISOString().split('T')[0];
      const expired = donations.filter(d => {
        const deadline = d.pickupDeadline || d.submissionDeadline;
        return deadline && deadline < now && d.status !== 'released' && d.status !== 'declined';
      });
      
      for (const d of expired) {
        try {
          await deleteDoc(doc(db, 'donations', d.id));
          const targetUid = d.isApplication ? d.beneficiaryUid : d.donorUid;
          if (targetUid) {
            addNotification(targetUid, 'Record Deleted', `Your ${d.isApplication ? 'application' : 'donation offer'} for ${d.item} was automatically deleted because the deadline (${d.pickupDeadline || d.submissionDeadline}) has passed.`, 'system');
          }
        } catch (error) {
          console.error('Error deleting expired donation:', error);
        }
      }
    };

    if (donations.length > 0) {
      checkExpiredDonations();
    }
  }, [donations.length]); // Only run when the number of donations changes to avoid infinite loop

  const socketRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  // WebRTC Signaling with Firestore
  useEffect(() => {
    if (!activeCall || activeCall.status === 'ended' || activeCall.status === 'declined') {
      if (peerConnectionRef.current) {
        stopAudio();
      }
      return;
    }

    const callId = activeCall.id;
    const isCaller = activeCall.callerId === auth.currentUser?.uid;

    // Listen for signaling data
    const unsubCall = onSnapshot(doc(db, 'calls', callId), async (snapshot) => {
      const data = snapshot.data() as Call;
      if (!data || !peerConnectionRef.current) return;

      // Handle Answer (for Caller)
      if (isCaller && data.answer && !peerConnectionRef.current.currentRemoteDescription) {
        const remoteDesc = new RTCSessionDescription(data.answer);
        await peerConnectionRef.current.setRemoteDescription(remoteDesc);
      }

      // Handle Offer (for Receiver)
      if (!isCaller && data.offer && !peerConnectionRef.current.currentRemoteDescription) {
        const remoteDesc = new RTCSessionDescription(data.offer);
        await peerConnectionRef.current.setRemoteDescription(remoteDesc);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        await updateDoc(doc(db, 'calls', callId), { answer });
      }

      // Handle End/Decline
      if (data.status === 'ended' || data.status === 'declined') {
        stopAudio();
      }
    });

    // Listen for ICE candidates
    const candidatesPath = isCaller ? 'receiverCandidates' : 'callerCandidates';
    const unsubCandidates = onSnapshot(collection(db, 'calls', callId, candidatesPath), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added' && peerConnectionRef.current) {
          const data = change.doc.data();
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data));
          } catch (e) {
            console.error("Error adding ICE candidate", e);
          }
        }
      });
    });

    return () => {
      unsubCall();
      unsubCandidates();
    };
  }, [activeCall?.id, activeCall?.status, isRTCReady]);

  const startAudio = async (callId: string, isCaller: boolean) => {
    if (peerConnectionRef.current) return;
    try {
      // 1. Get User Media
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
      }

      // 2. Setup Remote Audio
      if (!remoteAudioRef.current) {
        remoteAudioRef.current = new Audio();
        remoteAudioRef.current.autoplay = true;
      }

      // 3. Create Peer Connection
      const configuration = { 
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ] 
      };
      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;
      setIsRTCReady(true);

      // 4. Add Tracks
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });

      // 5. Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidatesPath = isCaller ? 'callerCandidates' : 'receiverCandidates';
          addDoc(collection(db, 'calls', callId, candidatesPath), event.candidate.toJSON());
        }
      };

      // 6. Handle Remote Stream
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(e => console.log('Remote audio play failed:', e));
        }
      };

      // 7. Create Offer (if Caller)
      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await updateDoc(doc(db, 'calls', callId), { offer });
      }

    } catch (err) {
      console.error("Error starting audio call:", err);
      showAlert("Could not access microphone. Please check permissions.");
      if (activeCall) endCall(activeCall.id);
    }
  };

  const stopAudio = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerConnectionRef.current?.close();
    
    localStreamRef.current = null;
    peerConnectionRef.current = null;
    setIsRTCReady(false);
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };
  useEffect(() => {
    const seedServices = async () => {
      if (barangayServices.length === 0 && role === 'official') {
        const initialServices = [
          { name: 'Barangay Indigency', description: 'For financial assistance, scholarships, etc.', requirements: ['Valid ID', 'Proof of Residency'], estimatedProcessingTime: '15-30 mins' },
          { name: 'Barangay Clearance', description: 'For employment, local transactions, etc.', requirements: ['Valid ID', 'Cedula', 'Recent Photo'], estimatedProcessingTime: '10-20 mins' },
          { name: 'Certificate of Residency', description: 'Proof of living in the barangay.', requirements: ['Valid ID', 'Proof of Address'], estimatedProcessingTime: '10-15 mins' },
          { name: 'Barangay ID', description: 'Official identification card.', requirements: ['Valid ID', '1x1 Photo', 'Application Form'], estimatedProcessingTime: '20-30 mins' },
          { name: 'Business Clearance', description: 'For business permits and operations.', requirements: ['DTI/SEC Registration', 'Lease Contract'], estimatedProcessingTime: '30-45 mins' },
          { name: 'First Time Job Seeker', description: 'Certificate for job application benefits.', requirements: ['Valid ID', 'Oath of Undertaking'], estimatedProcessingTime: '15-20 mins' }
        ];
        for (const s of initialServices) {
          await addDoc(collection(db, 'barangayServices'), s);
        }
      }
    };
    seedServices();
  }, [barangayServices.length, role]);

  // Appointment Reminders (5 hours before)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      appointments.forEach(async (app) => {
        if (app.status === 'approved' && !app.reminderSent) {
          try {
            // Robust parsing of date and timeSlot
            const startTimeStr = app.timeSlot.split(' - ')[0]; // e.g., "09:00 AM"
            const [time, modifier] = startTimeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            
            const appDate = new Date(app.date);
            appDate.setHours(hours, minutes, 0, 0);
            
            const diffInHours = (appDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            
            if (diffInHours > 0 && diffInHours <= 5) {
              addNotification(app.residentId, 'Appointment Reminder', `Reminder: Your appointment for ${app.serviceName} is in less than 5 hours (${app.timeSlot}).`, 'appointment', 'dashboard', 'appointments');
              await updateDoc(doc(db, 'appointments', app.id), { reminderSent: true });
            }
          } catch (e) {
            console.error('Error checking reminders', e);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [appointments]);

  const seedFormerOfficials = async () => {
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'former_officials'));
      const existing = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Official));

      if (existing.length === 0) {
        MOCK_OFFICIALS.forEach((off, index) => {
          const newDocRef = doc(db, 'former_officials', off.id);
          batch.set(newDocRef, {
            name: off.name,
            position: off.position,
            term: off.term,
            photo: off.photo,
            email: off.email,
            phone: off.phone,
            order: index,
            streets: off.streets || []
          });
        });
      } else {
        // Update existing ones if they lack streets
        MOCK_OFFICIALS.forEach((off) => {
          const match = existing.find(e => e.name === off.name);
          if (match && (!match.streets || match.streets.length === 0)) {
            batch.update(doc(db, 'former_officials', match.id), {
              streets: off.streets || []
            });
          }
        });
      }
      await batch.commit();
    } catch (error) {
      console.error('Error seeding former officials:', error);
    }
  };

  const updateFormerOfficial = async (id: string, data: Partial<Official>) => {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.position !== undefined) updateData.position = data.position;
      if (data.term !== undefined) updateData.term = data.term;
      if (data.photo !== undefined) updateData.photo = data.photo;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.streets !== undefined) updateData.streets = data.streets;

      await updateDoc(doc(db, 'former_officials', id), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `former_officials/${id}`);
    }
  };

  const addFormerOfficial = async (data: Omit<Official, 'id'>) => {
    try {
      const newOfficial = {
        name: data.name || '',
        position: data.position || '',
        term: data.term || '',
        photo: data.photo || '',
        email: data.email || '',
        phone: data.phone || '',
        streets: data.streets || [],
        order: formerOfficials.length
      };
      await addDoc(collection(db, 'former_officials'), newOfficial);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'former_officials');
    }
  };

  const deleteFormerOfficial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'former_officials', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `former_officials/${id}`);
    }
  };

  const seedOfficials = async () => {
    try {
      const batch = writeBatch(db);
      const snapshot = await getDocs(collection(db, 'officials'));
      const existing = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Official));

      if (existing.length === 0) {
        MOCK_OFFICIALS.forEach((off, index) => {
          const newDocRef = doc(db, 'officials', off.id);
          batch.set(newDocRef, {
            name: off.name,
            position: off.position,
            term: off.term,
            photo: off.photo,
            email: off.email,
            phone: off.phone,
            order: index,
            streets: off.streets || []
          });
        });
      } else {
        // Update existing ones if they lack streets or have different streets
        MOCK_OFFICIALS.forEach((off) => {
          const match = existing.find(e => e.name === off.name);
          if (match) {
            const currentStreets = match.streets || [];
            const mockStreets = off.streets || [];
            
            // Check if streets are different (simple length and content check)
            const areStreetsDifferent = currentStreets.length !== mockStreets.length || 
                                       !mockStreets.every(s => currentStreets.includes(s));

            if (areStreetsDifferent) {
              batch.update(doc(db, 'officials', match.id), {
                streets: mockStreets
              });
            }
          }
        });
      }
      await batch.commit();
    } catch (error) {
      console.error('Error seeding officials:', error);
    }
  };

  const updateOfficial = async (id: string, data: Partial<Official>) => {
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.position !== undefined) updateData.position = data.position;
      if (data.term !== undefined) updateData.term = data.term;
      if (data.photo !== undefined) updateData.photo = data.photo;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.streets !== undefined) updateData.streets = data.streets;

      await updateDoc(doc(db, 'officials', id), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `officials/${id}`);
    }
  };

  const addOfficial = async (data: Omit<Official, 'id'>) => {
    try {
      const newOfficial = {
        name: data.name || '',
        position: data.position || '',
        term: data.term || '',
        photo: data.photo || '',
        email: data.email || '',
        phone: data.phone || '',
        streets: data.streets || [],
        order: officials.length
      };
      await addDoc(collection(db, 'officials'), newOfficial);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'officials');
    }
  };

  const deleteOfficial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'officials', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `officials/${id}`);
    }
  };

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 1.0 : 0.2;
    }
  }, [isSpeakerOn]);

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio('https://actions.google.com/sounds/v1/alarms/phone_ringing.ogg');
      ringtoneRef.current.loop = true;
    }
    
    if (incomingCall || (activeCall && activeCall.status === 'ringing')) {
      ringtoneRef.current.play().catch(e => console.log('Audio play failed:', e));
    } else {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, [incomingCall, activeCall?.status]);

  useEffect(() => {
    if (activeCall && (activeCall.status === 'answered' || (activeCall.status === 'ringing' && activeCall.callerId === auth.currentUser?.uid))) {
      const isCaller = activeCall.callerId === auth.currentUser?.uid;
      startAudio(activeCall.id, isCaller);
    } else if (!activeCall) {
      stopAudio();
    }
  }, [activeCall?.id, activeCall?.status]);

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: 'Very Weak', color: 'bg-slate-200' };
    
    let score = 0;
    const hasLength = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (hasLength) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Normal', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    
    return { score: 0, label: 'Very Weak', color: 'bg-rose-500' };
  };

  const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const strength = getPasswordStrength(password);
    const hasLength = password.length >= 8;
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const isStrong = hasLength && (hasNumber || hasSymbol);

    return (
      <AnimatePresence>
        {password && !isStrong && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password Strength: <span className={strength.label === 'Strong' ? 'text-emerald-600' : strength.label === 'Normal' ? 'text-amber-600' : 'text-rose-600'}>{strength.label}</span></span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-1">
              <div className={`h-full transition-all duration-500 ${strength.score >= 1 ? strength.color : 'bg-transparent'} flex-1`} />
              <div className={`h-full transition-all duration-500 ${strength.score >= 2 ? strength.color : 'bg-transparent'} flex-1`} />
              <div className={`h-full transition-all duration-500 ${strength.score >= 3 ? strength.color : 'bg-transparent'} flex-1`} />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className={`flex items-center gap-2 text-[10px] font-bold ${hasLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasLength ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                At least 8 characters
              </div>
              <div className={`flex items-center gap-2 text-[10px] font-bold ${hasNumber || hasSymbol ? 'text-emerald-600' : 'text-slate-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasNumber || hasSymbol ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Includes numbers or symbols
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const getAuthErrorMessage = (error: any) => {
    const code = error.code || '';
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect name or password. Please check your credentials and try again.';
      case 'auth/email-already-in-use':
        return 'This name is already registered. Please login instead or add a middle initial if you have a namesake.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later for your security.';
      case 'auth/operation-not-allowed':
        return 'Sign-in is currently disabled. Please contact the Barangay Administrator.';
      case 'auth/network-request-failed':
        return 'Connection error. Please check your internet and try again.';
      default:
        // Remove "Firebase:" prefix if it exists
        const msg = error.message || '';
        return msg.replace(/^Firebase:\s*/, '').replace(/\(auth\/.*\)\.?$/, '').trim() || 'An unexpected error occurred. Please try again.';
    }
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRole(null);
      setAuthStep('landing');
      setResidentMode(null);
      setActiveTab('dashboard');
      setDashboardSubTab('system');
      clearAuthForm();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSystemReset = async () => {
    if (resetConfirmText !== 'CONFIRM') {
      showAlert('Please type CONFIRM to proceed.');
      return;
    }
    
    setIsResetting(true);
    try {
      const collectionsToDelete = [
        'appointments', 'donations', 'messages', 'notifications', 
        'projects', 'auditRequests', 'auditReports', 'calls', 
        'approval_records', 'announcements', 'budget', 'projectVotes'
      ];

      // Helper for chunked deletion (Firestore batches have a limit of 500 operations)
      const deleteInBatches = async (docsToDelete: any[]) => {
        const chunkSize = 500;
        for (let i = 0; i < docsToDelete.length; i += chunkSize) {
          const chunk = docsToDelete.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach((docRef) => batch.delete(docRef));
          await batch.commit();
        }
      };

      // 1. Delete standard collections
      for (const colName of collectionsToDelete) {
        const querySnapshot = await getDocs(collection(db, colName));
        const refsToDelete: any[] = [];
        
        querySnapshot.forEach((docSnap) => {
          refsToDelete.push(docSnap.ref);
        });

        // 1a. Handle orphan subcollections for calls
        if (colName === 'calls') {
          for (const callDoc of querySnapshot.docs) {
            const callerSnaps = await getDocs(collection(db, `calls/${callDoc.id}/callerCandidates`));
            callerSnaps.forEach(cSnap => refsToDelete.push(cSnap.ref));
            const receiverSnaps = await getDocs(collection(db, `calls/${callDoc.id}/receiverCandidates`));
            receiverSnaps.forEach(rSnap => refsToDelete.push(rSnap.ref));
          }
        }

        await deleteInBatches(refsToDelete);
      }

      // 2. Delete users (Preserving ONLY Leo Reyes)
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userRefsToDelete: any[] = [];
      usersSnapshot.forEach((userDoc) => {
        const data = userDoc.data();
        if (data.email !== 'leoreyes@pahinganorte.gov') {
          userRefsToDelete.push(userDoc.ref);
        }
      });
      await deleteInBatches(userRefsToDelete);

      setShowResetConfirm(false);
      setResetConfirmText('');
      showAlert('System records have been successfully reset.');
      
      setActiveTab('dashboard');
      setDashboardSubTab('system');

    } catch (error: any) {
      console.error('Error resetting system:', error);
      showAlert('Error resetting system: ' + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  const addNotification = async (userId: string, title: string, message: string, type: Notification['type'], targetTab?: string, targetSubTab?: string) => {
    const newNotif: any = {
      userId: userId || 'admin',
      title: title || '',
      message: message || '',
      type: type || 'system',
      status: 'unread',
      date: new Date().toLocaleString()
    };
    
    if (targetTab) newNotif.targetTab = targetTab;
    if (targetSubTab) newNotif.targetSubTab = targetSubTab;

    try {
      await addDoc(collection(db, 'notifications'), newNotif);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    }
  };

  const markNotifAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { status: 'read' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const markAllNotifsAsRead = async () => {
    const unreadNotifs = notifications.filter(n => n.userId === (role === 'official' ? 'admin' : auth.currentUser?.uid) && n.status === 'unread');
    if (unreadNotifs.length === 0) return;

    const batch = writeBatch(db);
    unreadNotifs.forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { status: 'read' });
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications/all');
    }
  };

  const addDonation = async (newDonation: Omit<Donation, 'id' | 'status' | 'date'>) => {
    const isAdminDirect = role === 'official' && authName === 'Leo Reyes';
    const donation: any = {
      ...newDonation,
      status: isAdminDirect ? 'available' : 'pending_donation',
      date: new Date().toISOString().split('T')[0],
      donorUid: auth.currentUser?.uid || 'anonymous'
    };
    try {
      await addDoc(collection(db, 'donations'), donation);
      
      if (isAdminDirect) {
        addNotification('admin', 'Inventory Updated', `Admin Leo Reyes added ${newDonation.quantity}x ${newDonation.item} directly to inventory.`, 'donation', 'dashboard', 'donations');
        showAlert('Item added directly to inventory!');
      } else {
        // Notify Admin
        addNotification('admin', 'New Donation Submitted', `${newDonation.donorName} has submitted a new donation: ${newDonation.item}`, 'donation', 'dashboard', 'donations');
        
        // Notify Donor
        if (auth.currentUser?.uid) {
          addNotification(auth.currentUser.uid, 'Donation Offer Submitted', `Your donation offer for ${newDonation.quantity}x ${newDonation.item} has been submitted. Please check your messages for instructions on delivering the items.`, 'donation', 'chat', 'admin');
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'donations');
    }
  };

  const addApplication = async (application: Omit<Donation, 'id' | 'status' | 'date'>) => {
    const newApp: any = {
      ...application,
      status: 'pending_application',
      date: new Date().toISOString().split('T')[0],
      beneficiaryUid: auth.currentUser?.uid || 'anonymous',
      isApplication: true
    };
    try {
      await addDoc(collection(db, 'donations'), newApp);
      addNotification('admin', 'New Beneficiary Application', `${application.beneficiaryName} applied for ${application.quantity}x ${application.item} (${application.specificType}). Reason: ${application.applicationReason}. Requirements: ${application.requirements || 'N/A'}`, 'application', 'dashboard', 'donations');
      
      if (auth.currentUser?.uid) {
        addNotification(auth.currentUser.uid, 'Application Submitted', `Your application for ${application.quantity}x ${application.item} has been submitted. Please check your messages for instructions.`, 'application', 'chat', 'admin');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'donations');
    }
  };

  const updateDonationStatus = async (id: string, status: Donation['status'], extra?: Partial<Donation>) => {
    try {
      const donationRef = doc(db, 'donations', id);
      const donationSnap = await getDoc(donationRef);
      if (!donationSnap.exists()) return;
      const donation = donationSnap.data() as Donation;

      const updateData: any = { status };
      if (status === 'completed') {
        updateData.status = 'available';
      }
      if (extra?.declineReason !== undefined) updateData.declineReason = extra.declineReason;
      if (extra?.donorName !== undefined) updateData.donorName = extra.donorName;
      if (extra?.item !== undefined) updateData.item = extra.item;
      if (extra?.submissionDeadline !== undefined) updateData.submissionDeadline = extra.submissionDeadline;
      if (extra?.pickupDeadline !== undefined) updateData.pickupDeadline = extra.pickupDeadline;
      if (extra?.adminDeadlineDate !== undefined) updateData.adminDeadlineDate = extra.adminDeadlineDate;
      if (extra?.adminDeadlineTime !== undefined) updateData.adminDeadlineTime = extra.adminDeadlineTime;

      await updateDoc(donationRef, updateData);
      
      // Notify Resident about feedback
      const statusText = status.replace('_', ' ').toUpperCase();
      const reasonText = extra?.declineReason ? ` Reason: ${extra.declineReason}` : '';
      
      // Notify Donor
      if (donation.donorUid) {
        addNotification(donation.donorUid, 'Donation Status Update', `Your donation for "${donation.item}" is now ${statusText}.${reasonText}`, 'feedback', 'dashboard', 'donations');
      }
      
      // If someone applied as beneficiary, notify admin
      if (status === 'pending_application') {
        addNotification('admin', 'New Beneficiary Application', `${extra?.beneficiaryName} applied for ${donation.item}.`, 'application', 'dashboard', 'donations');
      }

      // Notify beneficiary if application status changed
      const beneficiaryUid = extra?.beneficiaryUid || donation.beneficiaryUid;
      if (beneficiaryUid) {
        if (status === 'released') {
          addNotification(beneficiaryUid, 'Beneficiary Application Approved', `Your application for "${donation.item}" has been approved.`, 'application', 'dashboard', 'donations');
        } else if (status === 'declined' && donation.status === 'pending_application') {
          addNotification(beneficiaryUid, 'Beneficiary Application Declined', `Your application for "${donation.item}" has been declined.${reasonText}`, 'application', 'dashboard', 'donations');
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `donations/${id}`);
    }
  };

  const deleteDonation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'donations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `donations/${id}`);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  const deleteAuditRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'auditRequests', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `auditRequests/${id}`);
    }
  };

  const addProject = async (title: string, desc: string, purok: string, specificLocation: string) => {
    const project: any = {
      title: title || '',
      desc: desc || '',
      purok: purok || '',
      specificLocation: specificLocation || '',
      votes: 0,
      status: 'pending',
      suggestedBy: authName || 'Resident',
      suggestedByUid: auth.currentUser?.uid || 'anonymous',
      date: new Date().toISOString().split('T')[0]
    };
    try {
      await addDoc(collection(db, 'projects'), project);
      // Notify Admin
      addNotification('admin', 'New Project Suggestion', `A new project has been suggested: ${title} in ${purok}`, 'system', 'dashboard', 'projects');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'status' | 'rescheduleCount' | 'createdAt'>) => {
    try {
      const newAppointment: any = {
        ...appointment,
        status: 'pending',
        rescheduleCount: 0,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'appointments'), newAppointment);
      addNotification('admin', 'New Appointment Request', `A new appointment for ${appointment.serviceName} has been requested by ${appointment.residentName}.`, 'appointment', 'appointments');
      addNotification(appointment.residentId, 'Appointment Request Submitted', `Your appointment request for ${appointment.serviceName} has been submitted and is pending approval.`, 'appointment', 'appointments');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appointments');
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status'], declineReason?: string) => {
    try {
      const appRef = doc(db, 'appointments', id);
      const appSnap = await getDoc(appRef);
      if (!appSnap.exists()) return;
      const app = appSnap.data() as Appointment;

      const updateData: any = { status };
      if (declineReason) updateData.declineReason = declineReason;
      
      await updateDoc(appRef, updateData);
      
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);
      
      if (status === 'approved') {
        addNotification(app.residentId, 'Approved Appointment', `Your appointment request for ${app.serviceName} has been approved.`, 'appointment', 'chat', 'admin');
        addNotification('admin', 'Appointment Approved', `You approved the appointment request for ${app.serviceName} by ${app.residentName}.`, 'appointment', 'appointments');
      } else {
        addNotification(app.residentId, 'Appointment Update', `Your appointment for ${app.serviceName} has been ${statusText}.${declineReason ? ` Reason: ${declineReason}` : ''}`, 'appointment', 'appointments');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const rescheduleAppointment = async (id: string, newDate: string, newTimeSlot: string) => {
    try {
      const appRef = doc(db, 'appointments', id);
      const appSnap = await getDoc(appRef);
      if (!appSnap.exists()) return;
      const app = appSnap.data() as Appointment;

      if (app.rescheduleCount >= 3) {
        showAlert('Maximum reschedule attempts reached (3).');
        return;
      }

      await updateDoc(appRef, {
        date: newDate,
        timeSlot: newTimeSlot,
        rescheduleCount: app.rescheduleCount + 1,
        status: 'pending'
      });
      addNotification('admin', 'Appointment Rescheduled', `${app.residentName} has rescheduled their appointment for ${app.serviceName}.`, 'appointment', 'appointments');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `appointments/${id}`);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'appointments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
    }
  };

  const addBarangayService = async (service: Omit<BarangayService, 'id'>) => {
    try {
      // Check for duplicates
      const isDuplicate = barangayServices.some(s => s.name.toLowerCase() === service.name.toLowerCase());
      if (isDuplicate) {
        showAlert('A service with this name already exists.');
        return;
      }
      await addDoc(collection(db, 'barangayServices'), service);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'barangayServices');
    }
  };

  const deleteBarangayService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'barangayServices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `barangayServices/${id}`);
    }
  };

  const updateBarangayService = async (id: string, service: Partial<BarangayService>) => {
    try {
      await updateDoc(doc(db, 'barangayServices', id), service);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `barangayServices/${id}`);
    }
  };

  const updateOfficialAvailability = async (avail: Omit<OfficialAvailability, 'id'>) => {
    try {
      const q = query(collection(db, 'officialAvailability'), 
                      where('officialId', '==', avail.officialId), 
                      where('dayOfWeek', '==', avail.dayOfWeek));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, avail as any);
      } else {
        await addDoc(collection(db, 'officialAvailability'), avail);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'officialAvailability');
    }
  };

  const deleteOfficialAvailability = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'officialAvailability', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `officialAvailability/${id}`);
    }
  };

  const updateProjectStatus = async (id: string, status: Project['status'], extra?: Partial<Project>) => {
    try {
      const projectRef = doc(db, 'projects', id);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) return;
      const project = projectSnap.data() as Project;

      const updateData: any = { status };
      if (extra?.declineReason !== undefined) updateData.declineReason = extra.declineReason;
      if (extra?.votes !== undefined) updateData.votes = extra.votes;

      await updateDoc(projectRef, updateData);
      
      const reasonText = extra?.declineReason ? ` Reason: ${extra.declineReason}` : '';
      addNotification(project.suggestedByUid || 'admin', 'Project Status Update', `The status of "${project.title}" has been updated to ${status}.${reasonText}`, 'system', 'dashboard', 'projects');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
    }
  };

  const handleVote = async (id: string) => {
    if (!auth.currentUser) {
      showAlert('Please log in to vote.');
      return;
    }

    if (role !== 'resident') {
      showAlert('Only residents can vote for project suggestions.');
      return;
    }

    try {
      const projectRef = doc(db, 'projects', id);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) return;
      const project = projectSnap.data() as Project;

      if (project.suggestedByUid === auth.currentUser.uid) {
        showAlert('You cannot vote for your own project suggestion.');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const voteId = `${auth.currentUser.uid}_${today}`;
      const voteRef = doc(db, 'projectVotes', voteId);
      
      // Check if already voted today
      const voteSnap = await getDoc(voteRef);
      if (voteSnap.exists()) {
        showAlert('You can only vote once per day.');
        return;
      }

      const batch = writeBatch(db);
      batch.set(voteRef, {
        userId: auth.currentUser.uid,
        projectId: id,
        date: today
      });
      batch.update(projectRef, { 
        votes: project.votes + 1,
        date: project.date // Keep existing date to satisfy rules if needed, though rules only check votes
      });

      await batch.commit();
      showAlert('Vote cast successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${id}`);
    }
  };

  const handleCall = async (receiverId: string, receiverName: string) => {
    if (!auth.currentUser) return;
    if (activeCall || incomingCall) {
      addNotification(auth.currentUser.uid, 'Call in Progress', 'You already have an active or incoming call.', 'system');
      return;
    }
    
    try {
      const callData = {
        callerId: auth.currentUser.uid,
        callerName: authNickname || authName || 'Anonymous',
        receiverId: receiverId,
        receiverName: receiverName,
        status: 'ringing',
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'calls'), callData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'calls');
    }
  };

  const answerCall = async (callId: string) => {
    try {
      await updateDoc(doc(db, 'calls', callId), { 
        status: 'answered',
        receiverId: auth.currentUser?.uid,
        receiverName: authNickname || authName || 'Official'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'calls');
    }
  };

  const declineCall = async (callId: string) => {
    try {
      await updateDoc(doc(db, 'calls', callId), { status: 'declined' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'calls');
    }
  };

  const endCall = async (callId: string) => {
    try {
      await updateDoc(doc(db, 'calls', callId), { status: 'ended' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'calls');
    }
  };

  const addAuditRequest = async (data: Omit<AuditRequest, 'id' | 'status' | 'date'>) => {
    const request: any = {
      ...data,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      requesterUid: auth.currentUser?.uid || 'anonymous'
    };
    try {
      await addDoc(collection(db, 'auditRequests'), request);
      // Notify Admin
      addNotification('admin', 'New Transparency Request', `${data.name} has submitted a new transparency request.`, 'transparency', 'dashboard', 'transparency');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'auditRequests');
    }
  };

  const updateAuditRequestStatus = async (id: string, status: AuditRequest['status'], responseReport?: string) => {
    try {
      const requestRef = doc(db, 'auditRequests', id);
      const requestSnap = await getDoc(requestRef);
      if (!requestSnap.exists()) return;
      const request = requestSnap.data() as AuditRequest;

      const updateData: any = { status };
      if (responseReport !== undefined) updateData.responseReport = responseReport;

      await updateDoc(requestRef, updateData);
      
      addNotification(request.requesterUid || 'admin', 'Audit Request Update', `Your audit request has been marked as ${status}.`, 'transparency', 'dashboard', 'transparency');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `auditRequests/${id}`);
    }
  };

  const addAuditReport = async (data: Omit<AuditReport, 'id' | 'date' | 'author'>) => {
    const report: Omit<AuditReport, 'id'> = {
      ...data,
      date: new Date().toISOString().split('T')[0],
      author: authName || 'Barangay Official'
    };
    try {
      await addDoc(collection(db, 'auditReports'), report);
      addNotification('resident', 'New Audit Report Published', `A new transparency audit report "${data.title}" has been published.`, 'transparency', 'dashboard', 'transparency');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'auditReports');
    }
  };

  const deleteAuditReport = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'auditReports', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `auditReports/${id}`);
    }
  };

  const updateBudget = async (category: string, allocated: number, spent: number) => {
    try {
      const q = query(collection(db, 'budget'), where('category', '==', category));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const budgetDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'budget', budgetDoc.id), { 
          allocated: allocated ?? 0, 
          spent: spent ?? 0 
        });
      }
      addNotification('admin', 'Budget Updated', `The budget for ${category} has been updated.`, 'system', 'dashboard', 'transparency');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'budget');
    }
  };

  const addAnnouncement = async (data: Omit<Announcement, 'id'>) => {
    try {
      const newAnnouncement: any = {
        title: data.title || '',
        content: data.content || '',
        date: data.date || new Date().toLocaleString(),
        type: data.type || 'notice'
      };
      if (data.color) newAnnouncement.color = data.color;
      
      await addDoc(collection(db, 'announcements'), newAnnouncement);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'announcements');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
      showAlert('Message unsent successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `messages/${id}`);
    }
  };

  const handleViewProfile = async (uid: string) => {
    if (!uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setViewingProfile({
          fullName: userData.fullName,
          nickname: userData.nickname,
          address: userData.address,
          contact: userData.contact,
          purok: userData.purok,
          gender: userData.gender,
          photoURL: userData.photoURL
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const compressedBase64 = await compressImage(base64String);
      try {
        await updateDoc(doc(db, 'users', auth.currentUser!.uid), {
          photoURL: compressedBase64
        });
        
        // Also update officials collection if the user is an official
        if (role === 'official') {
          const q = query(collection(db, 'officials'), where('name', '==', authName));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            await updateDoc(doc(db, 'officials', querySnapshot.docs[0].id), {
              photo: compressedBase64
            });
          }
        }

        setAuthPhotoURL(compressedBase64);
        showAlert('Profile picture updated successfully!');
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser!.uid}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (text: string, receiverId: string, imageUrl?: string) => {
    const newMessage: any = {
      senderId: auth.currentUser?.uid || 'anonymous',
      senderName: (authNickname || authName || 'Anonymous').trim(),
      senderRole: role || 'resident',
      receiverId: receiverId || 'admin',
      text: text || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp(),
      status: 'unread',
      senderProfile: {
        fullName: authName || '',
        nickname: authNickname || '',
        address: authPurok || '', 
        contact: authContact || '',
        purok: authPurok || '',
        gender: authGender || '',
        photoURL: authPhotoURL || ''
      }
    };
    
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      newMessage.imageUrl = imageUrl;
    }

    try {
      await addDoc(collection(db, 'messages'), newMessage);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    try {
      const unreadMessages = messages.filter(m => {
        if (role === 'official') {
          return m.senderId === senderId && m.receiverId === 'admin' && m.status === 'unread';
        } else {
          return m.senderRole === 'official' && m.receiverId === auth.currentUser?.uid && m.status === 'unread';
        }
      });

      if (unreadMessages.length > 0) {
        const batch = writeBatch(db);
        unreadMessages.forEach(m => {
          batch.update(doc(db, 'messages', m.id), { status: 'read' });
        });
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'messages');
    }
  };

  if (!role) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col lg:flex-row font-sans bg-[#F8FAFC] overflow-hidden">
        {/* Left/Top Creative Branding Side */}
        <div className="lg:w-1/2 bg-[#020617] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden min-h-[45vh] lg:min-h-screen">
          {/* Creative Background Elements */}
          <div className="absolute top-[-15%] left-[-15%] w-[80%] h-[80%] bg-blue-900/40 rounded-full blur-[140px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] bg-indigo-900/30 rounded-full blur-[120px] animate-pulse pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] pointer-events-none" />
          
          {/* Large Subtle Logo in Background */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-[0.03] pointer-events-none">
            <img 
              src={BARANGAY_LOGO} 
              alt="" 
              className="w-[800px] h-[800px] object-contain grayscale invert"
              referrerPolicy="no-referrer"
            />
          </div>
          
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-16 h-16 text-[#020617] rounded-2xl flex items-center justify-center transform -rotate-6 shadow-2xl shadow-blue-500/30 transition-transform hover:rotate-0 duration-500 overflow-hidden border-2 border-[#141414]">
              <img 
                src={BARANGAY_LOGO} 
                alt="Barangay Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="block font-black tracking-[0.4em] uppercase text-[10px] text-blue-500/80 mb-1">{t('Digital Governance')}</span>
              <span className="block font-black text-2xl tracking-tighter">{t('Pahinga Norte')}</span>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-[6.5rem] font-black tracking-tighter leading-[0.8] mb-8">
                {t('Empower Your Community.')}
              </h1>
              <p className="text-slate-400 text-lg sm:text-xl font-medium max-w-md leading-relaxed border-l-2 border-blue-600 pl-6">
                {t('A platform for digital transparency and seamless barangay governance.')}
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 hidden lg:grid grid-cols-3 gap-12 pt-16 border-t border-white/10">
            <div className="group cursor-default">
              <div className="text-blue-500 font-black text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">01</div>
              <div className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 group-hover:text-blue-400 transition-colors">{t('Transparency')}</div>
            </div>
            <div className="group cursor-default">
              <div className="text-blue-500 font-black text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">02</div>
              <div className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 group-hover:text-blue-400 transition-colors">{t('Efficiency')}</div>
            </div>
            <div className="group cursor-default">
              <div className="text-blue-500 font-black text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">03</div>
              <div className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-500 group-hover:text-blue-400 transition-colors">{t('Security')}</div>
            </div>
          </div>
        </div>

        {/* Right/Bottom Form Side */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#F8FAFC]">
          <div className="max-w-[440px] w-full">
            <AnimatePresence mode="wait">
              {authStep === 'landing' && (
                <motion.div 
                  key="landing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div className="space-y-3">
                    <h2 className="text-5xl font-black text-[#0F172A] tracking-tight">{t('Access Portal')}</h2>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">{t('Secure gateway for residents and officials.')}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => { clearAuthForm(); setAuthStep('signin_type'); }}
                      className="group w-full flex items-center justify-between p-6 bg-[#0F172A] text-white rounded-2xl font-bold text-xl shadow-2xl shadow-slate-900/20 hover:bg-[#1E293B] transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-blue-600 rounded-xl group-hover:rotate-6 transition-transform">
                          <LogIn className="w-6 h-6" />
                        </div>
                        <span>{t('Sign In')}</span>
                      </div>
                      <ChevronRight className="w-6 h-6 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                    
                    <button
                      onClick={() => { clearAuthForm(); setAuthStep('create_account'); }}
                      className="group w-full flex items-center justify-between p-6 bg-white text-[#0F172A] border-2 border-slate-200 rounded-2xl font-bold text-xl hover:border-blue-600 hover:text-blue-600 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <UserPlus className="w-6 h-6" />
                        </div>
                        <span>{t('Create Account')}</span>
                      </div>
                      <ChevronRight className="w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>

                  <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <p className="text-sm font-bold text-blue-800 flex items-start gap-3">
                      <Info className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{t('Important: Registration required.')}</span>
                    </p>
                  </div>

                  <div className="pt-8 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('Official System')}</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                </motion.div>
              )}

              {authStep === 'signin_type' && (
                <motion.div 
                  key="signin_type"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div>
                    <button onClick={() => { clearAuthForm(); setAuthStep('landing'); setAuthSuccess(null); }} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 mb-8 transition-colors group uppercase tracking-widest">
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('Back to Home')}
                    </button>
                    <h2 className="text-5xl font-black text-[#0F172A] tracking-tight">{t('Identify')}</h2>
                    <p className="text-slate-500 font-medium mt-3 text-lg">{t('Select your role in the community')}</p>
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={() => { clearAuthForm(); setSelectedRole('official'); setAuthStep('signin_form'); }}
                      className="w-full flex items-center p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-600 transition-all group text-left shadow-sm hover:shadow-xl hover:shadow-blue-900/5"
                    >
                      <div className="p-5 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all mr-6 transform group-hover:scale-110">
                        <ShieldAlert className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-[#0F172A] text-2xl group-hover:text-blue-600 transition-colors">{t('Official')}</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('Barangay Administration')}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </button>
                    
                    <button
                      onClick={() => { clearAuthForm(); setSelectedRole('resident'); setAuthStep('signin_form'); }}
                      className="w-full flex items-center p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-600 transition-all group text-left shadow-sm hover:shadow-xl hover:shadow-blue-900/5"
                    >
                      <div className="p-5 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all mr-6 transform group-hover:scale-110">
                        <Users className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-[#0F172A] text-2xl group-hover:text-blue-600 transition-colors">{t('Resident')}</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('Community Member')}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                </motion.div>
              )}

              {authStep === 'signin_form' && (
                <motion.div 
                  key="signin_form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div>
                    <button onClick={() => { clearAuthForm(); setAuthStep('signin_type'); setSelectedRole(null); setAuthSuccess(null); }} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 mb-8 transition-colors group uppercase tracking-widest">
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('Back to Roles')}
                    </button>
                    <h2 className="text-5xl font-black text-[#0F172A] tracking-tight">{t('Sign In')}</h2>
                    {authSuccess && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-emerald-600 text-sm font-bold flex items-center gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        {authSuccess}
                      </motion.div>
                    )}
                    <p className="text-slate-500 font-medium mt-3 text-lg">
                      {t('Accessing as')} <span className="text-blue-600 font-black uppercase tracking-wider text-base">{selectedRole === 'official' ? t('Official') : t('Resident')}</span>
                    </p>
                  </div>
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setAuthError(null);
                        
                        if (selectedRole === 'resident') {
                          if (!isValidFullName(authName)) {
                            setAuthError('Please enter your complete name (First Name and Last Name).');
                            return;
                          }
                        }
                        
                        setIsAuthLoading(true);
                        try {
                          let email = '';
                          const trimmedName = authName.trim();
                          const normalizedName = trimmedName.toLowerCase();
                          
                          if (selectedRole === 'official' && (normalizedName === 'system admin' || normalizedName === 'admin')) {
                            email = 'axeltiquez22@gmail.com';
                          } else {
                            // Look up email by full name (case-insensitive)
                            const usersRef = collection(db, 'users');
                            const q = query(usersRef, where('normalizedFullName', '==', normalizedName));
                            const querySnapshot = await getDocs(q);
                            
                            if (querySnapshot.empty) {
                              // Try exact match as fallback for older accounts
                              const qFallback = query(usersRef, where('fullName', '==', trimmedName));
                              const querySnapshotFallback = await getDocs(qFallback);
                              
                              if (querySnapshotFallback.empty) {
                                // Fallback for officials who might not have a user record yet but have a standard email
                                if (selectedRole === 'official') {
                                  email = trimmedName.includes('@') ? trimmedName : `${trimmedName.replace(/\s+/g, '').toLowerCase()}@pahinganorte.gov`;
                                } else {
                                  setAuthError('Account not found. Please check your name or register first.');
                                  setIsAuthLoading(false);
                                  return;
                                }
                              } else {
                                const userData = querySnapshotFallback.docs[0].data();
                                if (userData.role && userData.role !== selectedRole) {
                                  setAuthError(`Account not found for the selected role. Please ensure you are logging in to the correct portal.`);
                                  setIsAuthLoading(false);
                                  return;
                                }
                                email = userData.email || `${trimmedName.replace(/\s+/g, '').toLowerCase()}@pahinganorte.gov`;
                              }
                            } else {
                              const userData = querySnapshot.docs[0].data();
                              if (userData.role && userData.role !== selectedRole) {
                                setAuthError(`Account not found for the selected role. Please ensure you are logging in to the correct portal.`);
                                setIsAuthLoading(false);
                                return;
                              }
                              email = userData.email || `${trimmedName.replace(/\s+/g, '').toLowerCase()}@pahinganorte.gov`;
                            }
                          }
                          
                          if (email === 'axeltiquez22@gmail.com') {
                            try {
                              await signInWithEmailAndPassword(auth, email, authPassword);
                            } catch (error: any) {
                              // If login fails, try to create the admin account (first time setup)
                              try {
                                const userCredential = await createUserWithEmailAndPassword(auth, email, authPassword);
                                await setDoc(doc(db, 'users', userCredential.user.uid), {
                                  uid: userCredential.user.uid,
                                  fullName: 'System Admin',
                                  role: 'official',
                                  position: 'Barangay Admin'
                                });
                              } catch (createError: any) {
                                // If creation fails (e.g. already exists but wrong password), show original error
                                setAuthError('Sign in failed: ' + getAuthErrorMessage(error));
                              }
                            }
                          } else {
                            await signInWithEmailAndPassword(auth, email, authPassword);
                          }
                        } catch (error: any) {
                          setAuthError('Sign in failed: ' + getAuthErrorMessage(error));
                        } finally {
                          setIsAuthLoading(false);
                        }
                      }}
                      className="space-y-6"
                    >
                    {authError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3"
                      >
                        <XCircle className="w-5 h-5 shrink-0" />
                        {authError}
                      </motion.div>
                    )}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {t('Full Name')}
                      </label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <input 
                          required 
                          type="text" 
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          autoComplete="new-password"
                          name="auth_name_field"
                          className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                          placeholder="Juan Dela Cruz" 
                        />
                      </div>
                      {selectedRole === 'resident' && <FullNameReminder name={authName} />}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Password')}</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input 
                          required 
                          type={showAuthPassword ? "text" : "password"} 
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          autoComplete="new-password"
                          className="w-full pl-14 pr-12 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                          placeholder="••••••••" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowAuthPassword(!showAuthPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {showAuthPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          type="button"
                          onClick={async () => {
                            if (selectedRole === 'resident') {
                              if (!authName.trim()) {
                                setAuthError('Please enter your Full Name first.');
                                return;
                              }
                              
                              try {
                                const usersRef = collection(db, 'users');
                                const q = query(usersRef, where('fullName', '==', authName.trim()));
                                const querySnapshot = await getDocs(q);
                                
                                if (querySnapshot.empty) {
                                  setAuthError('Account not found. Please check your name.');
                                  return;
                                }
                                
                                const userData = querySnapshot.docs[0].data();
                                if (!userData.email || userData.email.endsWith('@pahinganorte.gov')) {
                                  setAuthError('No valid email associated with this account. Please contact the Admin.');
                                  return;
                                }
                                
                                await sendPasswordResetEmail(auth, userData.email);
                                setResetEmailSent(true);
                                setAuthSuccess('Password reset email sent! Please check your inbox.');
                                setAuthError(null);
                              } catch (error: any) {
                                setAuthError('Failed to send reset email: ' + getAuthErrorMessage(error));
                              }
                              return;
                            }
                            
                            const email = authName.trim();
                            if (!email || !email.includes('@')) {
                              setAuthError('Please enter your email address first.');
                              return;
                            }
                            
                            try {
                              await sendPasswordResetEmail(auth, email);
                              setResetEmailSent(true);
                              setAuthSuccess('Password reset email sent! Please check your inbox.');
                              setAuthError(null);
                            } catch (error: any) {
                              setAuthError('Failed to send reset email: ' + getAuthErrorMessage(error));
                            }
                          }}
                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
                        >
                          {t('Forgot Password?')}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-slate-900/20 hover:bg-[#1E293B] transition-all active:scale-[0.98] mt-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isAuthLoading ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          {t('Signing in...')}
                        </>
                      ) : (
                        t('Login to Portal')
                      )}
                    </button>
                    {(selectedRole === 'resident' || selectedRole === 'official') && (
                      <div className="mt-6 text-center">
                        <button 
                          type="button"
                          onClick={() => {
                            clearAuthForm();
                            setAuthStep('create_account');
                            setAuthRole(selectedRole || 'resident');
                            setAuthError(null);
                            setAuthSuccess(null);
                          }}
                          className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {t('Don\'t have an account?')} <span className="text-blue-600">{t('Register here')}</span>
                        </button>
                      </div>
                    )}
                  </form>
                </motion.div>
              )}

              {authStep === 'create_account' && (
                <motion.div 
                  key="create_account"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  <div>
                    <button onClick={() => { clearAuthForm(); setAuthStep('landing'); setAuthSuccess(null); }} className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 mb-8 transition-colors group uppercase tracking-widest">
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('Back to Home')}
                    </button>
                    <h2 className="text-5xl font-black text-[#0F172A] tracking-tight">{t('Join Us')}</h2>
                    <p className="text-slate-500 font-medium mt-3 text-lg">{t('Create your community profile')}</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Full Name')}</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <input 
                          required
                          type="text" 
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          autoComplete="new-password"
                          name="auth_name_field_register"
                          className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                          placeholder="Juan Dela Cruz" 
                        />
                      </div>
                      <FullNameReminder name={authName} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Email Address')}</label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                            <Mail className="w-5 h-5" />
                          </div>
                          <input 
                            required
                            type="email" 
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            autoComplete="new-password"
                            name="auth_email_field_register"
                            className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                            placeholder="juan@example.com" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Select Role')}</label>
                        <div className="relative">
                          <select 
                            required
                            value={authRole}
                            onChange={(e) => setAuthRole(e.target.value as UserRole)}
                            className="w-full pl-6 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-black text-[#0F172A] appearance-none cursor-pointer"
                          >
                            <option value="resident">{t('Resident')}</option>
                            <option value="official">{t('Official / Admin')}</option>
                          </select>
                          <ChevronDown className="w-5 h-5 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Nickname (Optional)')}</label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                            <UserCircle className="w-5 h-5" />
                          </div>
                          <input 
                            type="text" 
                            value={authNickname}
                            onChange={(e) => setAuthNickname(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                            placeholder="e.g. Cardo" 
                          />
                        </div>
                      </div>
                    </div>

                    {authRole === 'official' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Official Position')}</label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <input 
                              required
                              type="text" 
                              value={authPosition}
                              onChange={(e) => setAuthPosition(e.target.value)}
                              className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                              placeholder="e.g. Barangay Kagawad" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Admin Code</label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                              <Key className="w-5 h-5" />
                            </div>
                            <input 
                              required
                              type="password" 
                              value={authAdminCode}
                              onChange={(e) => setAuthAdminCode(e.target.value)}
                              className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                              placeholder="Enter admin code" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Contact')}</label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                            <Phone className="w-5 h-5" />
                          </div>
                          <input 
                            type="tel" 
                            value={authContact}
                            onChange={(e) => setAuthContact(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                            placeholder="0912..." 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Gender')}</label>
                        <div className="relative">
                          <select 
                            required
                            value={authGender}
                            onChange={(e) => setAuthGender(e.target.value as any)}
                            className="w-full pl-6 pr-12 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-black text-[#0F172A] appearance-none cursor-pointer"
                          >
                            <option value="" disabled>{t('Select Gender')}</option>
                            <option value="male">{t('Male')}</option>
                            <option value="female">{t('Female')}</option>
                          </select>
                          <ChevronDown className="w-5 h-5 text-slate-400 absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Password')}</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input 
                          required
                          type={showAuthPassword ? "text" : "password"} 
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          autoComplete="new-password"
                          className="w-full pl-14 pr-20 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                          placeholder="••••••••" 
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {authPassword && authPassword === authConfirmPassword && (
                            <div className="text-emerald-500">
                              <Check className="w-5 h-5" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {showAuthPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <PasswordStrengthIndicator password={authPassword} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Confirm Password')}</label>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                          <Lock className="w-5 h-5" />
                        </div>
                        <input 
                          required
                          type={showAuthConfirmPassword ? "text" : "password"} 
                          value={authConfirmPassword}
                          onChange={(e) => setAuthConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          className="w-full pl-14 pr-20 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] placeholder:text-slate-300" 
                          placeholder="••••••••" 
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {authConfirmPassword && authPassword === authConfirmPassword && (
                            <div className="text-emerald-500">
                              <Check className="w-5 h-5" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowAuthConfirmPassword(!showAuthConfirmPassword)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            {showAuthConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      {authConfirmPassword && authPassword !== authConfirmPassword && (
                        <motion.p 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-[11px] text-rose-500 font-bold mt-2 flex items-center gap-1.5 bg-rose-50/50 p-3 rounded-xl border border-rose-100"
                        >
                          <XCircle className="w-3.5 h-3.5" /> {t('Passwords do not match.')}
                        </motion.p>
                      )}
                    </div>

                    {authRole === 'resident' && (
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Select Street/Purok')}</label>
                        <SearchableSelect
                          options={STREET_OPTIONS}
                          value={authPurok}
                          onChange={setAuthPurok}
                          placeholder={t('Select your street')}
                        />
                      </div>
                    )}

                    <div className="pt-4">
                      <p className="text-xs text-slate-500 mb-2 italic">
                        {t('Please read the Terms of Service and Privacy Policy before agreeing.')}
                      </p>
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-center mt-1">
                          <input 
                            type="checkbox"
                            checked={authTermsAccepted}
                            onChange={(e) => setAuthTermsAccepted(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all group-hover:border-blue-400" />
                          <Check className="w-4 h-4 text-white absolute left-1 top-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                          {t('I agree to the')} <button type="button" onClick={() => setShowTermsModal(true)} className="text-blue-600 hover:underline">{t('Terms of Service')}</button> {t('and')} <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-blue-600 hover:underline">{t('Privacy Policy')}</button> {t('of the Barangay Portal.')}
                        </span>
                      </label>
                    </div>

                    {authError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 mb-6"
                      >
                        <XCircle className="w-5 h-5 shrink-0" />
                        {authError}
                      </motion.div>
                    )}
                    <button 
                      disabled={isAuthLoading}
                      onClick={() => {
                        setAuthError(null);
                        if (!isValidFullName(authName)) {
                          setAuthError(t('Please enter your complete name (First Name and Last Name).'));
                          return;
                        }
                        if (!authGender) {
                          setAuthError(t('Please select your gender.'));
                          return;
                        }
                        if (!authPassword) {
                          setAuthError(t('Password is required.'));
                          return;
                        }
                        if (authPassword.length < 8) {
                          setAuthError(t('Password must be at least 8 characters long.'));
                          return;
                        }
                        const hasNumber = /[0-9]/.test(authPassword);
                        const hasSymbol = /[^A-Za-z0-9]/.test(authPassword);
                        if (!hasNumber && !hasSymbol) {
                          setAuthError(t('Password must include at least one number or symbol.'));
                          return;
                        }
                        if (authPassword !== authConfirmPassword) {
                          setAuthError(t('Passwords do not match. Please re-type your password.'));
                          return;
                        }
                        if (authRole === 'official' && !authPosition) {
                          setAuthError(t('Please enter your official position.'));
                          return;
                        }
                        if (!authTermsAccepted) {
                          setAuthError(t('You must agree to the Terms of Service and Privacy Policy to continue.'));
                          return;
                        }

                        // Check if name already exists in Firestore before proceeding
                        const checkExistingName = async () => {
                          try {
                            const usersRef = collection(db, 'users');
                            const q = query(usersRef, where('normalizedFullName', '==', authName.trim().toLowerCase()));
                            const querySnapshot = await getDocs(q);
                            if (!querySnapshot.empty) {
                              setAuthError(t('This name is already registered. Please login instead or add a middle initial if you have a namesake.'));
                              return true;
                            }
                            return false;
                          } catch (error) {
                            console.error("Error checking existing name:", error);
                            return false;
                          }
                        };

                        setIsAuthLoading(true);
                        checkExistingName().then((exists) => {
                          setIsAuthLoading(false);
                          if (!exists) {
                            setAuthError(null);
                            setAuthStep('id_verification');
                          }
                        });
                      }}
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3"
                    >
                      {t('Continue to ID Verification')} <ArrowRight className="w-5 h-5" />
                    </button>

                    <div className="mt-6 text-center">
                      <button 
                        type="button"
                        onClick={() => {
                          clearAuthForm();
                          setAuthStep('signin_type');
                          setAuthError(null);
                        }}
                        className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {t('Already have an account?')} <span className="text-blue-600">{t('Login here')}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {authStep === 'id_verification' && (
                <motion.div 
                  key="id_verification"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <button 
                      onClick={() => { 
                        setAuthStep('create_account'); 
                        setAuthError(null); 
                        setAuthIdImage(null);
                        setAuthIdImagePreview(null);
                        setScanStatus('idle');
                        setScanMessage('');
                      }} 
                      className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-blue-600 mb-8 transition-colors group uppercase tracking-widest"
                      disabled={isScanningId}
                    >
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('Back to Profile')}
                    </button>
                    <h2 className="text-4xl font-black text-[#0F172A] tracking-tight">{t('ID Verification')}</h2>
                    <p className="text-slate-500 font-medium mt-3 text-lg">{t('Please upload a valid ID to verify your identity')}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('Valid ID Upload (Required)')}</label>
                      <div className="relative group">
                        <input 
                          required
                          type="file" 
                          accept="image/*"
                          disabled={isScanningId}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setAuthIdImage(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setAuthIdImagePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            } else {
                              setAuthIdImage(null);
                              setAuthIdImagePreview(null);
                            }
                          }}
                          className="w-full pl-4 pr-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-600/5 outline-none transition-all font-bold text-[#0F172A] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                        />
                      </div>
                      
                      {authIdImagePreview && (
                        <div className="mt-4 relative overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 flex justify-center items-center min-h-[200px]">
                          <img src={authIdImagePreview} alt="ID Preview" className="max-h-64 object-contain z-0" />
                          
                          {/* Scanning Animation Overlay */}
                          {isScanningId && (
                            <div className="absolute inset-0 z-10 pointer-events-none">
                              <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[2px]" />
                              <motion.div 
                                className="absolute left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_5px_rgba(96,165,250,0.5)]"
                                initial={{ top: '0%' }}
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
                                  <div className="w-5 h-5 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                  <span className="font-bold text-blue-900">{scanMessage || t('Scanning ID...')}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {scanStatus === 'success' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-emerald-600 text-sm font-bold flex items-center gap-3 mt-4"
                        >
                          <Check className="w-5 h-5 shrink-0" />
                          {scanMessage}
                        </motion.div>
                      )}

                      <p className="text-[11px] text-slate-500 font-medium mt-2">
                        {t('Please upload a clear image of a valid government-issued ID. The name on the ID must exactly match the Full Name entered previously.')}
                      </p>
                    </div>

                    {authError && scanStatus !== 'success' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 mb-6"
                      >
                        <XCircle className="w-5 h-5 shrink-0" />
                        {authError}
                      </motion.div>
                    )}

                    <button 
                      disabled={isScanningId || !authIdImagePreview || scanStatus === 'success'}
                      onClick={async () => {
                        setAuthError(null);
                        if (!authIdImage || !authIdImagePreview) {
                          setAuthError(t('Valid ID image is required.'));
                          return;
                        }

                        setIsScanningId(true);
                        setScanStatus('scanning');
                        setScanMessage(t('Scanning ID... Please wait.'));
                        isRegisteringRef.current = true;

                        let extractedNameFromId = '';

                        try {
                          const rawGeminiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined) || import.meta.env.GEMINI_API_KEY;
                          
                          if (!rawGeminiKey) {
                            setIsScanningId(false);
                            setScanStatus('idle');
                            setAuthError(t('API Key is missing for ID Verification. Please add it to your deployment environment variables.'));
                            return;
                          }

                          const ai = new GoogleGenAI({ apiKey: rawGeminiKey });
                          const base64Data = authIdImagePreview.split(',')[1];
                          const mimeType = authIdImage.type;

                          const response = await ai.models.generateContent({
                            model: "gemini-3-flash-preview",
                            contents: {
                              parts: [
                                {
                                  inlineData: {
                                    mimeType: mimeType,
                                    data: base64Data
                                  }
                                },
                                {
                                  text: `Analyze this ID image for a community portal registration.
1. Is this a valid identification document (e.g., PhilID, Driver's License, Voter's ID, Student ID, Passport, Senior Citizen ID, etc.)? 
2. It MUST have a person's name visible.
3. Extract the FULL NAME exactly as it appears on the ID. If there are multiple names (like "Juan Dela Cruz"), extract all of them.
4. If the name is in "Last Name, First Name" format, extract it as is or normalize it.
5. Be lenient: if the ID is slightly blurry but the name is readable, mark as valid.

Respond in JSON format with the following schema:
{
  "isClearAndValid": boolean,
  "extractedName": string,
  "reason": string
}`
                                }
                              ]
                            },
                            config: {
                              responseMimeType: "application/json",
                              responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                  isClearAndValid: { type: Type.BOOLEAN },
                                  extractedName: { type: Type.STRING },
                                  reason: { type: Type.STRING }
                                },
                                required: ["isClearAndValid", "extractedName", "reason"]
                              }
                            }
                          });

                          const result = JSON.parse(response.text || "{}");
                          console.log("ID Verification Result:", result);
                          console.log("Entered Name:", authName);
                          
                          if (!result.isClearAndValid) {
                            setScanStatus('error');
                            setScanMessage(t('Invalid ID image. Please upload a clear and readable ID. Reason: ') + result.reason);
                            setAuthError(t('Invalid ID image. Please upload a clear and readable ID. Reason: ') + result.reason);
                            setIsScanningId(false);
                            isRegisteringRef.current = false;
                            return;
                          }

                           // Normalize names for comparison
                          const getWords = (name: string) => {
                            if (!name) return [];
                            return name.toLowerCase()
                              .replace(/,/g, ' ')
                              .replace(/\./g, ' ')
                              .replace(/ñ/g, 'n') // Handle Philippine specific character
                              .replace(/[^a-z0-9\s]/g, '')
                              .split(/\s+/)
                              .filter(word => word.length > 0);
                          };

                          const extractedWords = getWords(result.extractedName);
                          const enteredWords = getWords(authName);
                          
                          console.log("Extracted Words:", extractedWords);
                          console.log("Entered Words:", enteredWords);

                          // Check if words from the entered name exist in the extracted name
                          const matchingWords = enteredWords.filter(word => 
                            extractedWords.some(exWord => {
                              // Exact match
                              if (exWord === word) return true;
                              
                              // Handle initials (e.g., "J" matches "Juan" or vice versa)
                              if (word.length === 1 && exWord.startsWith(word)) return true;
                              if (exWord.length === 1 && word.startsWith(exWord)) return true;
                              
                              // Substring match for longer words (e.g., "Dela" in "Dela Cruz")
                              if (word.length > 2 && exWord.includes(word)) return true;
                              if (exWord.length > 2 && word.includes(exWord)) return true;
                              
                              // Handle common variations or typos (Levenshtein distance would be better but simple check for now)
                              if (word.length > 3 && exWord.length > 3) {
                                // If they share a significant prefix
                                if (word.substring(0, 4) === exWord.substring(0, 4)) return true;
                              }
                              
                              return false;
                            })
                          );

                          console.log("Matching Words:", matchingWords);

                          // Require at least 2 matching words, or all words if less than 2 entered
                          // Also allow match if at least 60% of entered words match
                          const matchPercentage = matchingWords.length / enteredWords.length;
                          const isMatch = matchingWords.length >= Math.min(2, enteredWords.length) || matchPercentage >= 0.6;

                          if (!isMatch) {
                            setScanStatus('error');
                            setScanMessage(t('ID verification failed. The name on the ID does not match the entered full name.'));
                            setAuthError(t('ID verification failed. The name on the ID ("') + result.extractedName + t('") does not match your entered name ("') + authName + t('").'));
                            setIsScanningId(false);
                            isRegisteringRef.current = false;
                            return;
                          }
                          
                          extractedNameFromId = result.extractedName;
                          setScanStatus('success');
                          setScanMessage(t('ID scanned successfully! Creating account...'));
                        } catch (error) {
                          console.error("ID Verification Error:", error);
                          setScanStatus('error');
                          setScanMessage(t('Failed to verify ID. Please try again.'));
                          setAuthError(t('Failed to verify ID. Please try again.'));
                          setIsScanningId(false);
                          isRegisteringRef.current = false;
                          return;
                        }

                        try {
                          const email = authEmail.trim().toLowerCase();
                          const userCredential = await createUserWithEmailAndPassword(auth, email, authPassword);
                          const user = userCredential.user;
                          
                          // Save user profile to Firestore
                          await setDoc(doc(db, 'users', user.uid), {
                            uid: user.uid,
                            fullName: authName || '',
                            normalizedFullName: (authName || '').toLowerCase().trim(),
                            email: email,
                            nickname: authNickname || '',
                            contact: authContact || '',
                            purok: authPurok || '',
                            gender: authGender || '',
                            role: authRole || 'resident',
                            position: authPosition || '',
                            idImage: authIdImage.name,
                            extractedNameFromId: extractedNameFromId,
                            verificationStatus: 'Verified',
                            timestamp: new Date().toISOString()
                          });
                          
                          // Sign out so they have to log in manually
                          await signOut(auth);
                          isRegisteringRef.current = false;
                          
                          const registeredRole = authRole;
                          const registeredName = authName;
                          clearAuthForm(true, true); // Keep success and name
                          setSelectedRole(registeredRole);
                          setAuthName(registeredName);
                          setAuthSuccess(t('Account created successfully! Please log in with your new account.'));
                          setAuthStep('signin_form');
                        } catch (error: any) {
                          setScanStatus('error');
                          setScanMessage(t('Registration failed.'));
                          setAuthError(t('Registration failed:') + ' ' + getAuthErrorMessage(error));
                          isRegisteringRef.current = false;
                        } finally {
                          setIsScanningId(false);
                        }
                      }}
                      className="w-full bg-[#0F172A] text-white py-5 rounded-2xl font-black text-xl shadow-2xl shadow-slate-900/20 hover:bg-[#1E293B] transition-all active:scale-[0.98] mt-8 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isScanningId ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          {t('Verifying...')}
                        </>
                      ) : (
                        t('Verify ID & Create Account')
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modals for Terms and Privacy (Rendered outside the main flow but inside the auth screen) */}
      <AnimatePresence>
        {showTermsModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{t('Terms of Service')}</h3>
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border-2 border-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="prose prose-slate max-w-none">
                  <h4 className="text-lg font-bold text-slate-800 mb-2">1. User Responsibilities</h4>
                  <p className="text-slate-600 mb-4">
                    By creating an account, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Proper use of the system is required at all times.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">2. Prohibited Actions</h4>
                  <p className="text-slate-600 mb-4">
                    Users are strictly prohibited from providing fake information, misusing the platform, spamming, or engaging in any activity that disrupts the service or violates local laws and barangay ordinances.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">3. System Usage Rules</h4>
                  <p className="text-slate-600 mb-4">
                    The Barangay Portal is intended solely for barangay-related services, such as requesting documents, scheduling appointments, and receiving official announcements. Any use outside of these purposes is not allowed.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">4. Account Responsibility</h4>
                  <p className="text-slate-600 mb-4">
                    You are solely responsible for your account and any actions taken using it. If you suspect unauthorized access, you must notify the barangay administration immediately.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">5. Admin Rights</h4>
                  <p className="text-slate-600 mb-4">
                    Barangay administrators reserve the right to approve, decline, modify, or remove records, appointments, and user accounts if necessary to maintain system integrity and enforce these terms.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">6. Disclaimer</h4>
                  <p className="text-slate-600">
                    This system is provided for barangay service purposes only. While we strive to ensure the system is available and accurate, the barangay is not liable for any interruptions, errors, or damages arising from the use of the portal.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t-2 border-slate-100 bg-slate-50 shrink-0">
                <button 
                  onClick={() => setShowTermsModal(false)}
                  className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-blue-700 shadow-[4px_4px_0px_0px_rgba(29,78,216,1)] hover:bg-blue-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  {t('Close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{t('Privacy Policy')}</h3>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border-2 border-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="prose prose-slate max-w-none">
                  <h4 className="text-lg font-bold text-slate-800 mb-2">1. What Data is Collected</h4>
                  <p className="text-slate-600 mb-4">
                    We collect personal information necessary to provide barangay services. This may include your full name, address, contact information, identification documents (IDs), and other details required for verification and service processing.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">2. How Data is Used</h4>
                  <p className="text-slate-600 mb-4">
                    Your data is used exclusively for identity verification, processing service requests (e.g., document issuance, appointments), communicating official announcements, and improving barangay services.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">3. Data Protection</h4>
                  <p className="text-slate-600 mb-4">
                    We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Data is stored securely with restricted access limited to authorized barangay personnel.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">4. Data Sharing</h4>
                  <p className="text-slate-600 mb-4">
                    Your personal information will not be shared, sold, or rented to third parties outside the barangay administration unless explicitly required by law or necessary to fulfill a specific service request you have initiated.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">5. User Rights</h4>
                  <p className="text-slate-600 mb-4">
                    You have the right to access, update, or correct your personal information. You may also request the deletion of your data, subject to legal and administrative retention requirements.
                  </p>

                  <h4 className="text-lg font-bold text-slate-800 mb-2">6. Consent</h4>
                  <p className="text-slate-600">
                    By creating an account and using the Barangay Portal, you explicitly consent to the collection, use, and processing of your personal data as described in this Privacy Policy.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t-2 border-slate-100 bg-slate-50 shrink-0">
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-blue-700 shadow-[4px_4px_0px_0px_rgba(29,78,216,1)] hover:bg-blue-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  {t('Close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
    );
  }

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'achievements'), {
        ...achievementData
      });
      setShowAchievementForm(false);
      setAchievementData({ title: '', year: '', desc: '', icon: 'Trophy', colorTheme: 'blue' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'achievements');
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'achievements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `achievements/${id}`);
    }
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'emerald': return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' };
      case 'blue': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' };
      case 'amber': return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' };
      case 'rose': return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' };
      case 'purple': return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' };
      default: return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' };
    }
  };

  const renderAchievementIcon = (iconName: string) => {
    const props = { className: "w-8 h-8" };
    switch (iconName) {
      case 'CheckCircle2': return <CheckCircle2 {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'Lightbulb': return <Lightbulb {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'Heart': return <Heart {...props} />;
      default: return <Trophy {...props} />;
    }
  };

  const renderDashboardContent = () => {
    switch (dashboardSubTab) {
      case 'donations':
        return (
          <DonationModule 
            role={role} 
            residentMode={residentMode} 
            setResidentMode={setResidentMode} 
            donations={donations}
            onAddDonation={addDonation}
            onAddApplication={addApplication}
            onUpdateStatus={updateDonationStatus}
            onApproveDonation={(id, residentId, residentName) => {
              setApprovalModalConfig({
                isOpen: true,
                recordId: id,
                featureType: 'donation',
                title: 'Approve Donation',
                residentId,
                residentName
              });
            }}
            onApproveApplication={(id, residentId, residentName) => {
              setApprovalModalConfig({
                isOpen: true,
                recordId: id,
                featureType: 'application',
                title: 'Approve Application',
                residentId,
                residentName
              });
            }}
            onDeleteDonation={deleteDonation}
            onBack={() => setDashboardSubTab('system')}
            isValidFullName={isValidFullName}
            FullNameReminder={FullNameReminder}
            authName={authName}
            authUid={auth.currentUser?.uid}
            showAlert={showAlert}
            showConfirm={showConfirm}
            onViewProfile={handleViewProfile}
            t={t}
          />
        );
      case 'transparency':
        return (
          <TransparencyModule 
            role={role!} 
            auditRequests={auditRequests} 
            auditReports={auditReports}
            budget={budget}
            onAddAuditRequest={addAuditRequest} 
            onUpdateAuditStatus={updateAuditRequestStatus}
            onApproveAuditRequest={(id, residentId, residentName) => {
              setApprovalModalConfig({
                isOpen: true,
                recordId: id,
                featureType: 'audit',
                title: 'Approve Audit Request',
                residentId,
                residentName
              });
            }}
            onAddAuditReport={addAuditReport}
            onDeleteAuditReport={deleteAuditReport}
            onDeleteAuditRequest={deleteAuditRequest}
            onUpdateBudget={updateBudget}
            onBack={() => setDashboardSubTab('system')} 
            isValidFullName={isValidFullName} 
            FullNameReminder={FullNameReminder} 
            authName={authName}
            showConfirm={showConfirm}
            showAlert={showAlert}
            onViewProfile={handleViewProfile}
          />
        );
      case 'officials':
        return (
          <OfficialsModule 
            role={role!}
            officials={formerOfficials}
            onBack={() => setDashboardSubTab('system')} 
            onCall={(off) => handleCall(off.id, off.name)} 
            onMessage={(official) => {
              setActiveChatId('admin');
              setIsChatOpen(true);
            }}
            onUpdate={updateFormerOfficial}
            onAdd={addFormerOfficial}
            onDelete={deleteFormerOfficial}
            showConfirm={showConfirm}
            title={t('Former Officials')}
            userStreet={authPurok}
          />
        );
      case 'projects':
        return (
          <ProjectsModule 
            role={role!} 
            projects={projects} 
            onAddProject={addProject} 
            onUpdateStatus={updateProjectStatus} 
            onApproveProject={(id, residentId, residentName) => {
              setApprovalModalConfig({
                isOpen: true,
                recordId: id,
                featureType: 'project',
                title: 'Approve Project Suggestion',
                residentId,
                residentName
              });
            }}
            onVote={handleVote} 
            onDeleteProject={deleteProject}
            onBack={() => setDashboardSubTab('system')} 
            authName={authName} 
            showConfirm={showConfirm}
            showAlert={showAlert}
          />
        );
      case 'announcements':
        return (
          <AnnouncementsModule 
            role={role!} 
            announcements={announcements} 
            onAdd={addAnnouncement} 
            onDelete={deleteAnnouncement} 
            onBack={() => setDashboardSubTab('system')} 
            showConfirm={showConfirm}
            t={t}
          />
        );
      case 'services':
        return (
          <BarangayServiceModule 
            role={role!}
            services={barangayServices}
            onAdd={addBarangayService}
            onUpdate={updateBarangayService}
            onDelete={deleteBarangayService}
            onBack={() => setDashboardSubTab('system')}
            showConfirm={showConfirm}
            t={t}
          />
        );
      case 'messages':
        return (
          <MessageModule 
            messages={messages}
            onSendMessage={sendMessage}
            onMarkAsRead={markMessagesAsRead}
            onStartCall={(id, type) => handleCall(id, residents.find(r => r.id === id)?.name || 'Resident')}
            role={role!}
            currentUserId={auth.currentUser?.uid || ''}
            currentUserName={authNickname || authName}
            residents={residents}
            t={t}
          />
        );
      case 'system':
      default:
        return (
          <div className="space-y-6">
            <DashboardGrid 
              role={role} 
              t={t} 
              onSelect={(id) => {
                if (id === 'appointments') {
                  setActiveTab('appointments');
                } else {
                  setDashboardSubTab(id as any);
                }
              }} 
            />
            
            {/* System Stats / Summary (The "System" view) */}
            <div className="bg-white border border-[#141414] p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <div className="flex items-center gap-3 mb-6">
                <Monitor className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold uppercase">{t('System Record Summary')}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setShowPopulationBreakdown(true)}
                  className="p-4 bg-blue-50 border border-[#141414] rounded-lg text-left hover:bg-blue-100 transition-all active:translate-y-1 active:shadow-none group"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-blue-500 uppercase mb-1 group-hover:text-blue-600">{t('Total Population')}</p>
                    <ArrowRight className="w-3 h-3 text-blue-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <p className="text-3xl font-black">19,100</p>
                </button>
                <div className="p-4 bg-blue-50 border border-[#141414] rounded-lg">
                  <p className="text-xs font-bold text-blue-500 uppercase mb-1">{t('Registered Voters')}</p>
                  <p className="text-3xl font-black">12,359</p>
                </div>
                <div className="p-4 bg-blue-50 border border-[#141414] rounded-lg">
                  <p className="text-xs font-bold text-blue-500 uppercase mb-1">{t('Active Projects')}</p>
                  <p className="text-3xl font-black">17</p>
                </div>
                <div className="p-4 bg-blue-50 border border-[#141414] rounded-lg">
                  <p className="text-xs font-bold text-blue-500 uppercase mb-1">{t('Pending Requests')}</p>
                  <p className="text-3xl font-black">{projects.filter(p => p.status === 'pending').length}</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-sm border-b border-[#141414] pb-2">{t('Recent Activity')}</h4>
                  <div className="space-y-2">
                    {announcements
                      .filter(a => new Date(a.date) <= new Date())
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 3)
                      .map(a => (
                      <div key={a.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded transition-colors">
                        <div className={`w-2 h-2 rounded-full ${a.color || 'bg-blue-500'}`} />
                        <p className="text-sm font-medium">{a.title}</p>
                        <span className="text-[10px] text-slate-400 ml-auto">{a.date}</span>
                      </div>
                    ))}
                    {announcements.filter(a => new Date(a.date) <= new Date()).length === 0 && (
                      <p className="text-xs opacity-50 italic py-2">{t('No recent activities.')}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold uppercase text-sm border-b border-[#141414] pb-2">{t('Quick Stats')}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-sky-50 dark:bg-sky-900/30 rounded-lg text-center">
                      <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">{t('Male')}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">8,770</p>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-center">
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">{t('Female')}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">10,330</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardContent();
      case 'officials-list':
        return (
          <OfficialsModule 
            role={role!}
            officials={officials}
            onBack={() => setActiveTab('dashboard')} 
            onCall={(off) => handleCall(off.id, off.name)} 
            onMessage={(official) => {
              setActiveChatId('admin');
              setIsChatOpen(true);
            }}
            onUpdate={updateOfficial}
            onAdd={addOfficial}
            onDelete={deleteOfficial}
            showConfirm={showConfirm}
            userStreet={authPurok}
          />
        );
      case 'appointments':
        return (
          <AppointmentModule 
            appointments={appointments}
            services={barangayServices}
            availabilities={officialAvailabilities}
            role={role!}
            onAdd={(app) => addAppointment({ ...app, residentId: auth.currentUser?.uid || '', residentName: authNickname || authName })}
            onUpdateStatus={updateAppointmentStatus}
            onApproveAppointment={(id, residentId, residentName) => {
              setApprovalModalConfig({
                isOpen: true,
                recordId: id,
                featureType: 'appointment',
                title: 'Approve Appointment',
                residentId,
                residentName
              });
            }}
            onReschedule={rescheduleAppointment}
            onCancel={cancelAppointment}
            onDeleteAppointment={deleteAppointment}
            onBackToDashboard={() => setActiveTab('dashboard')}
            officials={officials}
            onAddService={addBarangayService}
            onDeleteService={deleteBarangayService}
            onUpdateAvailability={updateOfficialAvailability}
            onDeleteAvailability={deleteOfficialAvailability}
            showConfirm={showConfirm}
            t={t}
          />
        );
      case 'settings':
        return (
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-[#141414] pb-8">
              <div>
                <h3 className="text-5xl font-black uppercase tracking-tighter leading-none text-[#141414]">
                  {t('Settings')}
                </h3>
                <p className="text-slate-500 font-bold mt-4 max-w-md leading-relaxed">
                  {t('Manage your account preferences, security, and application settings.')}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <div className="w-full md:w-64 shrink-0 space-y-2">
                {[
                  { id: 'profile', label: t('Profile Info'), icon: <User className="w-5 h-5" /> },
                  { id: 'security', label: t('Security'), icon: <Lock className="w-5 h-5" /> },
                  { id: 'notifications', label: t('Notifications'), icon: <Bell className="w-5 h-5" /> },
                  { id: 'system', label: t('System & Appearance'), icon: <Sliders className="w-5 h-5" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                      settingsTab === tab.id 
                        ? 'bg-[#141414] text-white shadow-[4px_4px_0px_0px_rgba(59,130,246,0.5)]' 
                        : 'bg-white text-slate-500 hover:bg-slate-50 border-2 border-transparent hover:border-slate-200'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 bg-white border-4 border-[#141414] rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
                {settingsTab === 'profile' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-black uppercase tracking-tight text-xl">{t('Profile Information')}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Update your identity')}</p>
                      </div>
                    </div>
                    
                    {/* Profile Picture Section */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-slate-50 border-4 border-[#141414] rounded-2xl flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                          <ProfileIcon gender={authGender} photoURL={authPhotoURL} className="w-full h-full" />
                        </div>
                        <input type="file" id="settings-profile-pic" className="hidden" accept="image/*" onChange={handleProfilePictureChange} />
                        <button onClick={() => document.getElementById('settings-profile-pic')?.click()} className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white border-2 border-[#141414] rounded-lg shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:bg-blue-700">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h6 className="font-black uppercase">{t('Profile Picture')}</h6>
                        <p className="text-xs text-slate-500 font-medium">PNG, JPG up to 5MB</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('Official Full Name')}</label>
                        <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('Display Name / Alias')}</label>
                        <input type="text" value={authNickname} onChange={(e) => setAuthNickname(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('Email Address')}</label>
                          <button 
                            onClick={() => setCanEditEmail(!canEditEmail)}
                            className={`p-1 rounded-lg transition-colors ${canEditEmail ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <input 
                          type="email" 
                          value={authEmail} 
                          onChange={(e) => setAuthEmail(e.target.value)} 
                          disabled={!canEditEmail}
                          className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white ${!canEditEmail ? 'opacity-60 cursor-not-allowed' : ''}`} 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('Contact Number')}</label>
                          <button 
                            onClick={() => {
                              if (canEditContact) {
                                setAuthContact(originalContact);
                                setContactError('');
                              }
                              setCanEditContact(!canEditContact);
                            }}
                            className={`p-1 rounded-lg transition-colors ${canEditContact ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                          >
                            {canEditContact ? <X className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={canEditContact ? authContact : maskContact(authContact)} 
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                              setAuthContact(val);
                            }} 
                            disabled={!canEditContact}
                            className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 ${contactError && canEditContact ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-slate-900 dark:text-white ${!canEditContact ? 'opacity-60 cursor-not-allowed' : ''}`} 
                            placeholder="09123456789"
                          />
                          {canEditContact && authContact !== originalContact && !contactError && (
                            <button
                              onClick={() => setShowContactConfirmModal(true)}
                              disabled={isSavingContact}
                              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {isSavingContact ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                            </button>
                          )}
                        </div>
                        {contactError && canEditContact && (
                          <p className="text-xs text-rose-500 font-bold px-1">{contactError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('Street / Purok')}</label>
                        <SearchableSelect
                          options={STREET_OPTIONS}
                          value={authPurok}
                          onChange={setAuthPurok}
                          placeholder={t('Select your street')}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('Gender')}</label>
                        <select value={authGender} onChange={(e) => setAuthGender(e.target.value as any)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all appearance-none text-slate-900 dark:text-white">
                          <option value="">{t('Select Gender')}</option>
                          <option value="male">{t('Male')}</option>
                          <option value="female">{t('Female')}</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      onClick={async () => {
                        try {
                          if (auth.currentUser) {
                            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                              fullName: authName,
                              nickname: authNickname,
                              contact: authContact,
                              purok: authPurok,
                              gender: authGender,
                              email: authEmail
                            });
                            setCanEditEmail(false);
                            showAlert('Profile updated successfully!');
                          }
                        } catch (error: any) {
                          showAlert('Error saving profile: ' + error.message);
                        }
                      }}
                      className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-blue-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                      {t('Save Profile')}
                    </button>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-6">
                      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-black uppercase tracking-tight text-xl">{t('Security')}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Manage your password')}</p>
                      </div>
                    </div>

                    <div className="space-y-6 max-w-md">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t('Old Password')}</label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600 transition-colors">
                            <Lock className="w-5 h-5" />
                          </div>
                          <input 
                            type={showSettingsOldPassword ? "text" : "password"} 
                            value={oldPassword} 
                            onChange={(e) => setOldPassword(e.target.value)} 
                            className="w-full pl-14 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold focus:border-rose-600 focus:bg-white focus:ring-8 focus:ring-rose-600/5 outline-none transition-all text-[#0F172A]" 
                            placeholder="••••••••"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowSettingsOldPassword(!showSettingsOldPassword)} 
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            {showSettingsOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t('New Password')}</label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600 transition-colors">
                            <Lock className="w-5 h-5" />
                          </div>
                          <input 
                            type={showSettingsNewPassword ? "text" : "password"} 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            autoComplete="new-password"
                            className={`w-full pl-14 pr-20 py-4 bg-slate-50 border-2 ${passwordError && newPassword && newPassword !== confirmNewPassword ? 'border-rose-500' : 'border-slate-200'} rounded-2xl font-bold focus:border-rose-600 focus:bg-white focus:ring-8 focus:ring-rose-600/5 outline-none transition-all text-[#0F172A]`} 
                            placeholder="••••••••"
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {newPassword && confirmNewPassword && newPassword === confirmNewPassword && (
                              <div className="text-emerald-500">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                            <button 
                              type="button"
                              onClick={() => setShowSettingsNewPassword(!showSettingsNewPassword)} 
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              {showSettingsNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        <PasswordStrengthIndicator password={newPassword} />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{t('Confirm New Password')}</label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600 transition-colors">
                            <Lock className="w-5 h-5" />
                          </div>
                          <input 
                            type={showSettingsConfirmPassword ? "text" : "password"} 
                            value={confirmNewPassword} 
                            onChange={(e) => setConfirmNewPassword(e.target.value)} 
                            autoComplete="new-password"
                            className={`w-full pl-14 pr-20 py-4 bg-slate-50 border-2 ${passwordError && confirmNewPassword ? 'border-rose-500' : 'border-slate-200'} rounded-2xl font-bold focus:border-rose-600 focus:bg-white focus:ring-8 focus:ring-rose-600/5 outline-none transition-all text-[#0F172A]`} 
                            placeholder="••••••••"
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {confirmNewPassword && newPassword === confirmNewPassword && (
                              <div className="text-emerald-500">
                                <Check className="w-5 h-5" />
                              </div>
                            )}
                            <button 
                              type="button"
                              onClick={() => setShowSettingsConfirmPassword(!showSettingsConfirmPassword)} 
                              className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              {showSettingsConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        {confirmNewPassword && newPassword !== confirmNewPassword && (
                          <motion.p 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-[11px] text-rose-500 font-bold mt-2 flex items-center gap-1.5 bg-rose-50/50 p-3 rounded-xl border border-rose-100"
                          >
                            <XCircle className="w-3.5 h-3.5" /> {t('Passwords do not match.')}
                          </motion.p>
                        )}
                      </div>

                      <button 
                        disabled={isChangingPassword || !newPassword || !oldPassword || !!passwordError || (newPassword.length < 8) || (!(/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)))}
                        onClick={() => setShowPasswordConfirmModal(true)}
                        className="w-full py-5 bg-rose-600 text-white font-black uppercase tracking-widest rounded-2xl border-2 border-[#141414] shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:bg-rose-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]"
                      >
                        {isChangingPassword ? t('Updating...') : t('Update Password')}
                      </button>
                    </div>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-6">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-black uppercase tracking-tight text-xl">{t('Notifications')}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Manage alerts')}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                        <div>
                          <h6 className="font-black uppercase">{t('Email Notifications')}</h6>
                          <p className="text-xs text-slate-500 font-bold">{t('Receive updates via email')}</p>
                        </div>
                        <button 
                          onClick={() => setNotifEmail(!notifEmail)}
                          className={`w-14 h-8 rounded-full p-1 transition-colors ${notifEmail ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${notifEmail ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <button 
                        onClick={async () => {
                          try {
                            if (auth.currentUser) {
                              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                notifEmail,
                                notifSMS
                              });
                              showAlert('Notification preferences saved!');
                            }
                          } catch (error: any) {
                            showAlert('Error saving preferences: ' + error.message);
                          }
                        }}
                        className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest rounded-xl border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-slate-800 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                      >
                        {t('Save Preferences')}
                      </button>
                    </div>
                  </div>
                )}

                {settingsTab === 'system' && (
                  <div className="p-8 space-y-8">
                    <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-6">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                        <Sliders className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-black uppercase tracking-tight text-xl">{t('System & Appearance')}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Customize your experience')}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                        <div>
                          <h6 className="font-black uppercase">{t('Dark Mode')}</h6>
                          <p className="text-xs text-slate-500 font-bold">{t('Toggle dark theme for the application')}</p>
                        </div>
                        <button 
                          onClick={() => setDarkMode(!darkMode)}
                          className={`w-14 h-8 rounded-full p-1 transition-colors ${darkMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('Language')}</label>
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold flex items-center justify-between hover:border-blue-600 transition-all text-slate-900 dark:text-white"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-lg overflow-hidden">
                                {languages.find(l => l.code === appLanguage)?.flag}
                              </div>
                              <span>{t(languages.find(l => l.code === appLanguage)?.name || '')}</span>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isLangMenuOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-[60]" 
                                onClick={() => setIsLangMenuOpen(false)}
                              />
                              <div className="absolute z-[70] top-full left-0 w-full mt-2 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto">
                                {languages.map((lang) => (
                                  <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => {
                                      setAppLanguage(lang.code);
                                      setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${appLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                                  >
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-lg overflow-hidden">
                                      {lang.flag}
                                    </div>
                                    <span className="font-bold">{t(lang.name)}</span>
                                    {appLanguage === lang.code && <Check className="w-4 h-4 ml-auto" />}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={async () => {
                          try {
                            if (auth.currentUser) {
                              await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                soundEnabled,
                                language: appLanguage,
                                darkMode
                              });
                              showAlert('System preferences saved!');
                            }
                          } catch (error: any) {
                            showAlert('Error saving preferences: ' + error.message);
                          }
                        }}
                        className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest rounded-xl border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-slate-800 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                      >
                        {t('Save Preferences')}
                      </button>

                      {/* System Reset Section */}
                      {(auth.currentUser?.email === 'leoreyes@pahinganorte.gov' || auth.currentUser?.email === 'axeltiquez22@gmail.com') && (
                        <div className="pt-8 mt-8 border-t-2 border-slate-200">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                              <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                              <h5 className="font-black uppercase tracking-tight text-xl text-rose-600">{t('Danger Zone')}</h5>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Irreversible actions')}</p>
                            </div>
                          </div>
                          
                          <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl space-y-4">
                            <h6 className="font-black uppercase text-rose-700">{t('System Reset')}</h6>
                            <p className="text-sm text-rose-600 font-medium">
                              {t('This will delete ALL records from the system including residents, appointments, donations, messages, and notifications. Only the main admin account will be preserved. This action CANNOT be undone.')}
                            </p>
                            
                            {!showResetConfirm ? (
                              <button 
                                onClick={() => setShowResetConfirm(true)}
                                className="px-6 py-3 bg-rose-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-rose-700 shadow-[4px_4px_0px_0px_rgba(190,18,60,1)] hover:bg-rose-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                              >
                                {t('Reset System')}
                              </button>
                            ) : (
                              <div className="space-y-4 pt-4 border-t border-rose-200">
                                <p className="text-sm font-bold text-rose-700">
                                  {t('Are you sure you want to reset all system records? This action cannot be undone.')}
                                </p>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-rose-500 tracking-widest ml-1">
                                    {t('Type CONFIRM to proceed')}
                                  </label>
                                  <input 
                                    type="text" 
                                    value={resetConfirmText}
                                    onChange={(e) => setResetConfirmText(e.target.value)}
                                    placeholder="CONFIRM"
                                    className="w-full p-4 bg-white border-2 border-rose-300 rounded-xl font-bold focus:border-rose-600 outline-none transition-all text-slate-900" 
                                  />
                                </div>
                                <div className="flex gap-4">
                                  <button 
                                    onClick={handleSystemReset}
                                    disabled={isResetting || resetConfirmText !== 'CONFIRM'}
                                    className="flex-1 py-3 bg-rose-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-rose-700 shadow-[4px_4px_0px_0px_rgba(190,18,60,1)] hover:bg-rose-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isResetting ? t('Resetting...') : t('Confirm Reset')}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setShowResetConfirm(false);
                                      setResetConfirmText('');
                                    }}
                                    disabled={isResetting}
                                    className="flex-1 py-3 bg-white text-slate-700 font-black uppercase tracking-widest rounded-xl border-2 border-slate-300 shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] hover:bg-slate-50 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                                  >
                                    {t('Cancel')}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'achievements':
        return (
          <div className="space-y-8">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-[#0F172A] p-12 rounded-3xl border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <Trophy className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">
                      Hall of <span className="text-blue-400">Excellence</span>
                    </h2>
                    <p className="text-slate-400 font-bold mt-4 uppercase tracking-[0.2em] text-sm">
                      Barangay Pahinga Norte • Community Achievements
                    </p>
                  </div>
                </div>
                {role === 'official' && (
                  <button 
                    onClick={() => setShowAchievementForm(true)}
                    className="px-6 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Achievement
                  </button>
                )}
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(achievements.length > 0 ? achievements : [
                { 
                  id: '1',
                  title: 'Cleanest Barangay', 
                  year: '2023', 
                  desc: 'Awarded for maintaining the highest standards of sanitation and waste management.',
                  icon: 'CheckCircle2',
                  colorTheme: 'emerald'
                },
                { 
                  id: '2',
                  title: 'Most Transparent', 
                  year: '2022', 
                  desc: 'Recognition for excellence in local governance and financial accountability.',
                  icon: 'ShieldAlert',
                  colorTheme: 'blue'
                },
                { 
                  id: '3',
                  title: 'Innovation Award', 
                  year: '2023', 
                  desc: 'For implementing digital solutions that improved community service delivery.',
                  icon: 'Lightbulb',
                  colorTheme: 'amber'
                },
              ]).map((ach, i) => {
                const theme = getThemeClasses(ach.colorTheme);
                return (
                <motion.div 
                  key={ach.id || i}
                  whileHover={{ y: -10 }}
                  className={`group relative p-8 bg-white border-4 border-[#141414] rounded-3xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] transition-all`}
                >
                  <div className={`w-16 h-16 ${theme.bg} ${theme.text} rounded-2xl border-2 ${theme.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {renderAchievementIcon(ach.icon)}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{ach.year} Awardee</span>
                      <h4 className="text-2xl font-black text-[#0F172A] uppercase leading-tight mt-1">{ach.title}</h4>
                    </div>
                    
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                      {ach.desc}
                    </p>
                    
                    <div className="pt-4 flex items-center justify-between">
                      <div 
                        onClick={() => setSelectedAchievement(ach)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 cursor-pointer hover:text-blue-700"
                      >
                        View Certificate <ArrowRight className="w-3 h-3" />
                      </div>
                      {role === 'official' && ach.id && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            showConfirm("Are you sure you want to delete this achievement?", () => {
                              handleDeleteAchievement(ach.id!);
                            });
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Achievement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Decorative Badge */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-400 border-4 border-[#141414] rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-4 h-4 text-[#141414] fill-current" />
                  </div>
                </motion.div>
                );
              })}
            </div>

            {/* Certificate Modal */}
            <AnimatePresence>
              {selectedAchievement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedAchievement(null)}
                    className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-4xl bg-white border-8 border-[#141414] rounded-[2rem] overflow-hidden shadow-[24px_24px_0px_0px_rgba(20,20,20,1)]"
                  >
                    {/* Certificate Content */}
                    <div className="p-8 md:p-16 text-center space-y-8 relative">
                      {/* Decorative elements */}
                      <div className="absolute top-0 left-0 w-32 h-32 border-l-8 border-t-8 border-amber-400 m-8" />
                      <div className="absolute top-0 right-0 w-32 h-32 border-r-8 border-t-8 border-amber-400 m-8" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-8 border-b-8 border-amber-400 m-8" />
                      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-8 border-b-8 border-amber-400 m-8" />

                      <div className="space-y-2">
                        <div className="w-24 h-24 border-4 border-[#141414] rounded-full mx-auto mb-4 overflow-hidden shadow-xl">
                          <img 
                            src={BARANGAY_LOGO} 
                            alt="Barangay Seal" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.5em] text-slate-400">Certificate of Recognition</h2>
                        <h3 className="text-4xl md:text-6xl font-black text-[#0F172A] uppercase tracking-tighter">Barangay Pahinga Norte</h3>
                      </div>

                      <div className="w-24 h-1 bg-[#141414] mx-auto" />

                      <div className="space-y-4">
                        <p className="text-xl font-medium text-slate-500 italic">This certificate is proudly presented to the community for</p>
                        <h4 className="text-3xl md:text-5xl font-black text-blue-600 uppercase tracking-tight">{selectedAchievement.title}</h4>
                        <p className="text-lg font-bold text-slate-800 max-w-2xl mx-auto">{selectedAchievement.desc}</p>
                      </div>

                      <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-12">
                        <div className="text-center">
                          <div className="w-48 h-px bg-slate-300 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Awarded</p>
                          <p className="text-lg font-black text-[#0F172A]">{selectedAchievement.year}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-48 h-px bg-slate-300 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized By</p>
                          <p className="text-lg font-black text-[#0F172A]">Local Government Unit</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedAchievement(null)}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <XCircle className="w-8 h-8 text-slate-400" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Add Achievement Modal */}
            <AnimatePresence>
              {showAchievementForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAchievementForm(false)}
                    className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
                  />
                  
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-white rounded-3xl border-4 border-[#141414] shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] overflow-hidden z-10"
                  >
                    <div className="p-8 border-b-4 border-[#141414] bg-blue-50 flex justify-between items-center">
                      <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-blue-600" />
                        Add New Achievement
                      </h3>
                      <button 
                        onClick={() => setShowAchievementForm(false)}
                        className="p-2 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleAddAchievement} className="p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Title</label>
                          <input 
                            type="text" 
                            required
                            value={achievementData.title}
                            onChange={e => setAchievementData({...achievementData, title: e.target.value})}
                            className="w-full p-4 bg-slate-50 border-2 border-[#141414] rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                            placeholder="e.g. Cleanest Barangay"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Year</label>
                          <input 
                            type="text" 
                            required
                            value={achievementData.year}
                            onChange={e => setAchievementData({...achievementData, year: e.target.value})}
                            className="w-full p-4 bg-slate-50 border-2 border-[#141414] rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                            placeholder="e.g. 2024"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</label>
                        <textarea 
                          required
                          value={achievementData.desc}
                          onChange={e => setAchievementData({...achievementData, desc: e.target.value})}
                          className="w-full p-4 bg-slate-50 border-2 border-[#141414] rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 min-h-[100px] resize-none"
                          placeholder="Brief description of the achievement..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Icon</label>
                          <select 
                            value={achievementData.icon}
                            onChange={e => setAchievementData({...achievementData, icon: e.target.value})}
                            className="w-full p-4 bg-slate-50 border-2 border-[#141414] rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 appearance-none"
                          >
                            <option value="Trophy">Trophy</option>
                            <option value="CheckCircle2">Check Mark</option>
                            <option value="ShieldAlert">Shield</option>
                            <option value="Lightbulb">Lightbulb</option>
                            <option value="Star">Star</option>
                            <option value="Heart">Heart</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Color Theme</label>
                          <select 
                            value={achievementData.colorTheme}
                            onChange={e => setAchievementData({...achievementData, colorTheme: e.target.value})}
                            className="w-full p-4 bg-slate-50 border-2 border-[#141414] rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/20 appearance-none"
                          >
                            <option value="blue">Blue</option>
                            <option value="emerald">Emerald</option>
                            <option value="amber">Amber</option>
                            <option value="rose">Rose</option>
                            <option value="purple">Purple</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-5 bg-[#141414] text-white font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,0.3)] active:scale-95 flex items-center justify-center gap-3"
                      >
                        <Plus className="w-5 h-5" /> Save Achievement
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Footer Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Awards', value: '12' },
                { label: 'Years Active', value: '15+' },
                { label: 'Community Rating', value: '4.9/5' },
                { label: 'Projects Completed', value: '150+' },
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-[#0F172A]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans flex relative">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`w-64 bg-[#020617] text-white flex flex-col fixed lg:sticky top-0 h-screen z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10 flex flex-col items-center gap-4 text-center relative">
          <button 
            className="absolute top-4 right-4 lg:hidden text-white/50 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-32 h-32 border-4 border-white/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            <img 
              src={BARANGAY_LOGO} 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase leading-tight">
            Pahinga Norte<br/>
            <span className="text-xs text-white/60 font-bold tracking-widest">Management System</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label={t('Dashboard')} 
            active={activeTab === 'dashboard'} 
            onClick={() => {
              setActiveTab('dashboard');
              setDashboardSubTab('system');
            }} 
          />
          <SidebarItem 
            icon={<UserSquare2 className="w-5 h-5" />} 
            label={t('Official List')} 
            active={activeTab === 'officials-list'} 
            onClick={() => setActiveTab('officials-list')} 
          />
          <SidebarItem 
            icon={<Settings className="w-5 h-5" />} 
            label={t('Settings')} 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <SidebarItem 
            icon={<Trophy className="w-5 h-5" />} 
            label={t('Achievements')} 
            active={activeTab === 'achievements'} 
            onClick={() => setActiveTab('achievements')} 
          />
          <div className="pt-4 mt-4 border-t border-white/10">
            <SidebarItem 
              icon={<LogOut className="w-5 h-5" />} 
              label={t('Log-out')} 
              onClick={() => setShowLogoutConfirm(true)} 
              variant="danger"
            />
          </div>
        </nav>

        {/* Time & Date at bottom of sidebar */}
        <div className="p-6 bg-white/5 border-t border-white/10">
          <p className="text-[10px] font-bold uppercase text-white/40 mb-1">Current Time & Date</p>
          <p className="text-lg font-black tracking-tight">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-[10px] font-bold uppercase text-white/60">
            {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#141414] p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold tracking-tight uppercase truncate max-w-[150px] sm:max-w-none">
                {activeTab === 'dashboard' 
                  ? (dashboardSubTab === 'system' ? t('Pahinga Norte Dashboard') : t(dashboardSubTab.replace('-', ' '))) 
                  : t(activeTab.replace('-', ' '))}
              </h2>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <button 
                onClick={() => setIsNotifOpen(true)}
                className="p-2 border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all relative group"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => (n.userId === (role === 'official' ? 'admin' : auth.currentUser?.uid) || (role === 'resident' && n.userId === 'resident')) && n.status === 'unread').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {notifications.filter(n => (n.userId === (role === 'official' ? 'admin' : auth.currentUser?.uid) || (role === 'resident' && n.userId === 'resident')) && n.status === 'unread').length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => {
                  if (role === 'resident') setActiveChatId('admin');
                  setIsChatOpen(true);
                }}
                className="p-2 border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all relative group"
                title="Messages"
              >
                <MessageCircle className="w-5 h-5" />
                {messages.filter(m => m.receiverId === (role === 'official' ? 'admin' : auth.currentUser?.uid) && m.senderRole === (role === 'official' ? 'resident' : 'official') && m.status === 'unread').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white font-black">
                    {messages.filter(m => m.receiverId === (role === 'official' ? 'admin' : auth.currentUser?.uid) && m.senderRole === (role === 'official' ? 'resident' : 'official') && m.status === 'unread').length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => {
                  setEditProfileName(authName);
                  setEditProfileNickname(authNickname);
                  setShowProfileModal(true);
                }}
                className="flex items-center gap-3 hover:bg-blue-50 p-1.5 pr-2 rounded-xl transition-colors text-left group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase leading-none tracking-tight group-hover:text-blue-900 transition-colors">{authNickname || authName}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest group-hover:text-blue-600 transition-colors">{role}</p>
                </div>
                <div className="w-10 h-10 bg-[#141414] text-white rounded-lg flex items-center justify-center font-black border-2 border-[#141414] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden group-hover:border-blue-600 transition-colors">
                  <ProfileIcon gender={authGender} photoURL={authPhotoURL} className="w-8 h-8" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + dashboardSubTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MessagingOverlay 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        messages={messages} 
        onSend={sendMessage} 
        onMarkAsRead={markMessagesAsRead}
        onDeleteMessage={deleteMessage}
        showConfirm={showConfirm}
        onCall={(id, name) => handleCall(id, name)}
        currentUser={{ id: auth.currentUser?.uid || '', name: authNickname || authName, role: role!, gender: authGender, photoURL: authPhotoURL }} 
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        viewingProfile={viewingProfile}
        setViewingProfile={setViewingProfile}
        onViewProfile={handleViewProfile}
        residents={residents}
      />

      {(activeCall || incomingCall) && (() => {
        const currentCall = (activeCall || incomingCall)!;
        const partnerId = currentCall.callerId === auth.currentUser?.uid 
          ? currentCall.receiverId 
          : currentCall.callerId;
        const partner = residents.find(r => r.id === partnerId);
        
        return (
          <CallModule 
            activeCall={currentCall}
            isIncoming={!!incomingCall}
            onAnswer={() => answerCall(currentCall.id)}
            onDecline={() => declineCall(currentCall.id)}
            onEnd={() => endCall(currentCall.id)}
            currentUserId={auth.currentUser?.uid || ''}
            t={t}
            partnerGender={partner?.gender}
            partnerPhotoURL={partner?.photoURL}
            isMuted={isMuted}
            isSpeakerOn={isSpeakerOn}
            onToggleMute={() => setIsMuted(!isMuted)}
            onToggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
          />
        );
      })()}

      <LogoutConfirmModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogout();
        }} 
      />

      <AnimatePresence>
        {showPopulationBreakdown && (
          <PopulationBreakdownModule 
            isOpen={showPopulationBreakdown}
            onClose={() => setShowPopulationBreakdown(false)}
            t={t}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-3xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#141414]">My Profile</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage your identity</p>
              </div>

              <div className="flex flex-col items-center space-y-6 mb-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-slate-50 border-4 border-[#141414] rounded-[2rem] flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <ProfileIcon gender={authGender} photoURL={authPhotoURL} className="w-20 h-20" />
                  </div>
                  <input 
                    type="file" 
                    id="modal-profile-pic-input" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleProfilePictureChange} 
                  />
                  <button 
                    onClick={() => document.getElementById('modal-profile-pic-input')?.click()}
                    className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white border-2 border-[#141414] rounded-xl shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:translate-y-[-2px] hover:bg-blue-700 transition-all active:scale-90"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Display Name</label>
                  <input 
                    type="text" 
                    value={editProfileName} 
                    onChange={(e) => setEditProfileName(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-blue-600 focus:bg-white outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nickname</label>
                  <input 
                    type="text" 
                    value={editProfileNickname} 
                    onChange={(e) => setEditProfileNickname(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-blue-600 focus:bg-white outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="mt-8">
                <button 
                  disabled={isSavingProfile}
                  onClick={async () => {
                    setIsSavingProfile(true);
                    try {
                      if (auth.currentUser) {
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                          fullName: editProfileName,
                          nickname: editProfileNickname
                        });
                        setAuthName(editProfileName);
                        setAuthNickname(editProfileNickname);
                        setShowProfileModal(false);
                        showAlert('Profile updated successfully!');
                      }
                    } catch (error: any) {
                      showAlert('Error saving profile: ' + error.message);
                    } finally {
                      setIsSavingProfile(false);
                    }
                  }}
                  className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest rounded-xl border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,0.2)] hover:bg-slate-800 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContactConfirmModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-3xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowContactConfirmModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#141414]">{t('Confirm Update')}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('Verify contact number')}</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                  <p className="text-sm text-slate-500 font-bold mb-1">{t('Old Number')}</p>
                  <p className="text-lg font-black text-slate-400 line-through">{maskContact(originalContact)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-blue-600 font-bold mb-1">{t('New Number')}</p>
                  <p className="text-lg font-black text-blue-900">{authContact}</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContactConfirmModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveContact}
                    disabled={isSavingContact}
                    className="flex-1 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSavingContact ? <Loader2 className="w-5 h-5 animate-spin" /> : t('Confirm')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasswordConfirmModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-3xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowPasswordConfirmModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#141414]">{t('Security Check')}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('Verify old password')}</p>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-slate-600 font-medium text-center">
                  {t('Please confirm your old password to proceed with the update. You will be logged out after a successful change.')}
                </p>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={isChangingPassword}
                    className="flex-1 py-4 bg-rose-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : t('Update')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {approvalModalConfig && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-3xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setApprovalModalConfig(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#141414]">{approvalModalConfig.title}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t('Approve for')} {approvalModalConfig.residentName}
                </p>
              </div>

              <div className="space-y-6">
                {!['project', 'audit'].includes(approvalModalConfig.featureType) ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-slate-500">
                          {approvalModalConfig.featureType === 'donation' || approvalModalConfig.featureType === 'application' ? t('Deadline Date') : t('Scheduled Date')} <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="date"
                          value={approvalFormData.scheduledDate}
                          onChange={(e) => setApprovalFormData({...approvalFormData, scheduledDate: e.target.value})}
                          className="w-full p-4 border-2 border-[#141414] rounded-xl font-medium focus:ring-4 focus:ring-slate-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2 text-slate-500">
                          {approvalModalConfig.featureType === 'donation' || approvalModalConfig.featureType === 'application' ? t('Deadline Time') : t('Scheduled Time')} <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          type="time"
                          value={approvalFormData.scheduledTime}
                          onChange={(e) => setApprovalFormData({...approvalFormData, scheduledTime: e.target.value})}
                          className="w-full p-4 border-2 border-[#141414] rounded-xl font-medium focus:ring-4 focus:ring-slate-200 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-slate-500">{t('Requirements (Optional)')}</label>
                      <div className="space-y-2 border-2 border-[#141414] p-4 rounded-xl bg-slate-50">
                        {['Valid ID', 'Barangay Clearance', 'Proof of Residency', 'Authorization Letter'].map(req => (
                          <label key={req} className="flex items-center gap-3 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={approvalFormData.requirements.includes(req)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setApprovalFormData({...approvalFormData, requirements: [...approvalFormData.requirements, req]});
                                } else {
                                  setApprovalFormData({...approvalFormData, requirements: approvalFormData.requirements.filter(r => r !== req)});
                                }
                              }}
                              className="w-5 h-5 rounded border-2 border-[#141414] text-[#141414] focus:ring-[#141414]"
                            />
                            <span className="font-medium text-slate-700">{req}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase mb-2 text-slate-500">{t('Additional Instructions')}</label>
                      <textarea 
                        value={approvalFormData.instructions}
                        onChange={(e) => setApprovalFormData({...approvalFormData, instructions: e.target.value})}
                        placeholder={t('Enter any specific instructions for the resident...')}
                        className="w-full p-4 border-2 border-[#141414] rounded-xl font-medium focus:ring-4 focus:ring-slate-200 outline-none transition-all min-h-[100px]"
                      />
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-slate-600 font-medium">
                      {t('Are you sure you want to approve this record? No additional information is required for this feature.')}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setApprovalModalConfig(null)}
                    className="flex-1 p-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button 
                    onClick={handleGlobalApprove}
                    disabled={isApproving || (!['project', 'audit'].includes(approvalModalConfig.featureType) && (!approvalFormData.scheduledDate || !approvalFormData.scheduledTime || (approvalFormData.requirements.length === 0 && !approvalFormData.instructions.trim())))}
                    className="flex-1 p-4 bg-[#141414] text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isApproving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('Sending...')}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> {t('Send & Approve')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationOverlay 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
        notifications={notifications.filter(n => n.userId === (role === 'official' ? 'admin' : auth.currentUser?.uid) || (role === 'resident' && n.userId === 'resident'))}
        onMarkAsRead={markNotifAsRead}
        onMarkAllAsRead={markAllNotifsAsRead}
        onNavigate={async (tab, subTab, notif) => {
          if (tab === 'chat') {
            setIsChatOpen(true);
            if (subTab) setActiveChatId(subTab);
            
            // Send automated message if it's a donation notification and hasn't been sent yet
            if (notif?.type === 'donation' && notif.title === 'Donation Offer Submitted' && auth.currentUser?.uid) {
              // Check if we already sent this automated message
              const hasSent = messages.some(m => m.isAutomated && m.receiverId === auth.currentUser?.uid && m.text.includes('Kailan mo dadalhin ang item sa barangay?'));
              if (!hasSent) {
                const adminMessage = {
                  senderId: 'admin',
                  senderName: 'Leo Reyes (Admin)',
                  senderRole: 'official',
                  receiverId: auth.currentUser.uid,
                  text: `Hello ${authName}, we received your donation offer. Reminder: Hindi i-aaccept ng barangay ang donation ninyo kapag hindi pa ninyo ito nadadala sa barangay (personal). Mananatiling naka-pending ang donation ninyo hangga't hindi pa ninyo nadadala ang item sa barangay at hangga't hindi pa ito ina-approve ng admin.\n\nKailan mo dadalhin ang item sa barangay?\nPlease upload image of the item.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  createdAt: serverTimestamp(),
                  status: 'unread',
                  isAutomated: true,
                  senderProfile: {
                    fullName: 'Leo Reyes',
                    nickname: 'Admin Leo',
                    address: 'Barangay Hall',
                    contact: '',
                    purok: '',
                    gender: 'Male',
                    photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400'
                  }
                };
                try {
                  await addDoc(collection(db, 'messages'), adminMessage);
                } catch (error) {
                  console.error('Failed to send automated message:', error);
                }
              }
            } else if (notif?.type === 'application' && notif.title === 'Application Submitted' && auth.currentUser?.uid) {
              // Check if we already sent this automated message
              const hasSent = messages.some(m => m.isAutomated && m.receiverId === auth.currentUser?.uid && m.text.includes('Kailan mo kukunin ang item?'));
              if (!hasSent) {
                const adminMessage = {
                  senderId: 'admin',
                  senderName: 'Leo Reyes (Admin)',
                  senderRole: 'official',
                  receiverId: auth.currentUser.uid,
                  text: `Hello ${authName}, we received your application for benefits. Your application is currently pending approval.\n\nKailan mo kukunin ang item kapag na-approve na ito?`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  createdAt: serverTimestamp(),
                  status: 'unread',
                  isAutomated: true,
                  senderProfile: {
                    fullName: 'Leo Reyes',
                    nickname: 'Admin Leo',
                    address: 'Barangay Hall',
                    contact: '',
                    purok: '',
                    gender: 'Male',
                    photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400'
                  }
                };
                try {
                  await addDoc(collection(db, 'messages'), adminMessage);
                } catch (error) {
                  console.error('Failed to send automated message:', error);
                }
              }
            } else if (notif?.type === 'application' && notif.title === 'Application Approved' && auth.currentUser?.uid) {
              // Check if we already sent this automated message
              const hasSent = messages.some(m => m.isAutomated && m.receiverId === auth.currentUser?.uid && m.text.includes('Congratulations! Your application is valid and approved'));
              if (!hasSent) {
                const adminMessage = {
                  senderId: 'admin',
                  senderName: 'Leo Reyes (Admin)',
                  senderRole: 'official',
                  receiverId: auth.currentUser.uid,
                  text: `Congratulations! Your application is valid and approved by admin. Please visit the Barangay Hall during office hours (8 AM - 5 PM, Mon-Fri) to claim your item. Please bring a valid ID and any required documents.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  createdAt: serverTimestamp(),
                  status: 'unread',
                  isAutomated: true,
                  senderProfile: {
                    fullName: 'Leo Reyes',
                    nickname: 'Admin Leo',
                    address: 'Barangay Hall',
                    contact: '',
                    purok: '',
                    gender: 'Male',
                    photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400'
                  }
                };
                try {
                  await addDoc(collection(db, 'messages'), adminMessage);
                } catch (error) {
                  console.error('Failed to send automated message:', error);
                }
              }
            } else if (notif?.title === 'Approved Appointment' && auth.currentUser?.uid) {
              const match = notif.message.match(/Your appointment request for (.*?) has been approved\./);
              const serviceName = match ? match[1] : 'the requested service';
              
              const app = appointments.find(a => a.residentId === auth.currentUser?.uid && a.serviceName === serviceName && a.status === 'approved');
              const timeStr = app ? `on ${new Date(app.date).toLocaleDateString('en-US', { weekday: 'long' })} at ${app.timeSlot}` : 'at your scheduled time';

              const expectedText = `Your appointment request for ${serviceName} has been approved. Your scheduled visit is ${timeStr}.`;
              const hasSent = messages.some(m => m.isAutomated && m.receiverId === auth.currentUser?.uid && m.text.includes(expectedText));
              
              if (!hasSent) {
                const adminMessage = {
                  senderId: 'admin',
                  senderName: 'Leo Reyes (Admin)',
                  senderRole: 'official',
                  receiverId: auth.currentUser.uid,
                  text: `${expectedText} Please arrive on time and bring the required documents.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  createdAt: serverTimestamp(),
                  status: 'unread',
                  isAutomated: true,
                  senderProfile: {
                    fullName: 'Leo Reyes',
                    nickname: 'Admin Leo',
                    address: 'Barangay Hall',
                    contact: '',
                    purok: '',
                    gender: 'Male',
                    photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400'
                  }
                };
                try {
                  await addDoc(collection(db, 'messages'), adminMessage);
                } catch (error) {
                  console.error('Failed to send automated message:', error);
                }
              }
            }
          } else {
            if (tab) setActiveTab(tab);
            if (subTab) setDashboardSubTab(subTab);
          }
          setIsNotifOpen(false);
        }}
        role={role!}
      />

      <AnimatePresence>
        {incomingCall && !activeCall && (
          <IncomingCallModal 
            call={incomingCall} 
            onAnswer={answerCall} 
            onDecline={declineCall} 
          />
        )}

        {activeCall && (
          <ActiveCallModal 
            call={activeCall} 
            onEnd={endCall} 
            isOfficial={role === 'official'} 
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            isSpeakerOn={isSpeakerOn}
            onToggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
          />
        )}

        {alertMessage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-sm text-center"
            >
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
              <h4 className="text-xl font-black uppercase mb-2">Notice</h4>
              <p className="text-sm font-bold mb-6">{alertMessage}</p>
              <button 
                onClick={() => setAlertMessage(null)}
                className="w-full bg-[#141414] text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}

        {confirmDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-sm text-center"
            >
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-rose-500" />
              <h4 className="text-xl font-black uppercase mb-2">Confirm Action</h4>
              <p className="text-sm font-bold mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="flex-1 p-4 border-2 border-[#141414] rounded-xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className="flex-1 bg-rose-500 text-white p-4 border-2 border-[#141414] rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingProfile && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-4 border-[#141414] w-full max-w-md rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col overflow-hidden relative"
            >
              <div className="p-4 border-b-4 border-[#141414] bg-blue-600 text-white flex justify-between items-center">
                <h4 className="font-black uppercase tracking-tight">User Profile</h4>
                <button onClick={() => setViewingProfile(null)} className="p-2 hover:bg-white/10 rounded-lg">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 bg-slate-100 border-4 border-[#141414] rounded-3xl flex items-center justify-center overflow-hidden shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <ProfileIcon gender={viewingProfile.gender} photoURL={viewingProfile.photoURL} className="w-16 h-16" />
                  </div>
                  <div>
                    <h5 className="text-2xl font-black uppercase tracking-tight">{viewingProfile.nickname || viewingProfile.fullName}</h5>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verified Resident</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Full Name</p>
                    <p className="font-bold">{viewingProfile.fullName}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Contact Number</p>
                    <p className="font-bold">{viewingProfile.contact}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Street/Purok</p>
                    <p className="font-bold">{viewingProfile.purok}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}

function MessagingOverlay({ 
  isOpen, 
  onClose, 
  messages, 
  onSend, 
  onMarkAsRead,
  onDeleteMessage,
  showConfirm,
  onCall,
  currentUser,
  activeChatId,
  setActiveChatId,
  viewingProfile,
  setViewingProfile,
  onViewProfile,
  residents
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  messages: Message[], 
  onSend: (text: string, receiverId: string, imageUrl?: string) => void,
  onMarkAsRead: (senderId: string) => void,
  onDeleteMessage: (id: string) => void,
  showConfirm: (msg: string, onConfirm: () => void) => void,
  onCall: (receiverId: string, receiverName: string) => void,
  currentUser: { id: string, name: string, role: UserRole, gender?: string, photoURL?: string },
  activeChatId: string | null,
  setActiveChatId: (id: string | null) => void,
  viewingProfile: Message['senderProfile'] | null,
  setViewingProfile: (profile: Message['senderProfile'] | null) => void,
  onViewProfile: (uid: string) => void,
  residents: { id: string, name: string, photoURL?: string, gender?: string }[]
}) {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (currentUser.role === 'resident') {
        onMarkAsRead('admin');
      } else if (activeChatId) {
        onMarkAsRead(activeChatId);
      }
    }
  }, [isOpen, activeChatId, messages.length]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeChatId, isOpen]);

  const chatMessages = messages.filter(m => {
    if (currentUser.role === 'resident') {
      return (m.senderId === currentUser.id && m.receiverId === 'admin') ||
             (m.senderRole === 'official' && m.receiverId === currentUser.id);
    } else {
      return (m.senderRole === 'official' && m.receiverId === activeChatId) ||
             (m.senderId === activeChatId && m.receiverId === 'admin');
    }
  });

  // For officials: get unique resident IDs from both senders and receivers
  const conversations = Array.from(new Set([
    ...messages.filter(m => m.senderRole === 'resident').map(m => m.senderId),
    ...messages.filter(m => m.senderRole === 'official' && m.receiverId !== 'admin').map(m => m.receiverId)
  ])).map(id => {
    const lastMsg = [...messages].reverse().find(m => (m.senderId === id && m.receiverId === 'admin') || (m.receiverId === id && m.senderRole === 'official'));
    const residentMsg = [...messages].reverse().find(m => m.senderId === id && m.senderProfile);
    const residentInfo = residents.find(r => r.id === id);
    const unreadCount = messages.filter(m => m.senderId === id && m.receiverId === 'admin' && m.status === 'unread').length;
    
    return { 
      id, 
      name: residentMsg?.senderName || residentInfo?.name || id, 
      lastMsg: lastMsg?.text,
      profile: residentMsg?.senderProfile || (residentInfo ? {
        fullName: residentInfo.name,
        photoURL: residentInfo.photoURL || '',
        gender: residentInfo.gender || '',
        nickname: '',
        address: '',
        contact: '',
        purok: ''
      } : undefined),
      unreadCount
    };
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressedBase64 = await compressImage(reader.result as string, 800, 800, 0.6);
        setSelectedImage(compressedBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputText.trim() || selectedImage) && activeChatId) {
      setIsUploading(true);
      try {
        await onSend(inputText, activeChatId, selectedImage || undefined);
        setInputText('');
        setSelectedImage(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-white border-4 border-[#141414] w-full max-w-md h-[600px] rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col pointer-events-auto overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-4 border-b-4 border-[#141414] bg-[#141414] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              <ProfileIcon gender={currentUser.gender} photoURL={currentUser.photoURL} className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-tight">
                {currentUser.role === 'official' 
                  ? (activeChatId ? `Chat with ${activeChatId}` : 'Messages')
                  : 'Barangay Office'}
              </h4>
              <p className="text-[10px] opacity-60 uppercase font-bold">Messenger</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser.role === 'resident' && (
              <button 
                onClick={() => onCall('admin', 'Barangay Chairman')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Call Admin"
              >
                <Phone className="w-5 h-5" />
              </button>
            )}
            {currentUser.role === 'official' && activeChatId && (
              <button 
                onClick={() => {
                  const conv = conversations.find(c => c.id === activeChatId);
                  onCall(activeChatId, conv?.name || activeChatId);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Call Resident"
              >
                <Phone className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar for Officials */}
          {currentUser.role === 'official' && !activeChatId && (
            <div className="w-full overflow-y-auto p-4 space-y-2">
              <h5 className="text-xs font-bold uppercase opacity-40 mb-4">Recent Conversations</h5>
              {conversations.length === 0 ? (
                <div className="text-center py-12 opacity-40 italic">No messages yet.</div>
              ) : (
                conversations.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setActiveChatId(c.id)}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all flex items-center gap-3 relative ${c.unreadCount > 0 ? 'bg-blue-50 border-blue-600 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.2)]' : 'border-[#141414] hover:bg-[#E4E3E0]/30'}`}
                  >
                    <div className="w-12 h-12 bg-[#141414] text-white rounded-full flex items-center justify-center font-bold relative flex-shrink-0">
                      <ProfileIcon gender={c.profile?.gender} photoURL={c.profile?.photoURL} className="w-12 h-12" />
                      {c.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`truncate text-sm ${c.unreadCount > 0 ? 'font-black text-blue-900' : 'font-bold text-slate-900'}`}>{c.name}</p>
                        {c.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm">
                            {c.unreadCount} NEW
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate ${c.unreadCount > 0 ? 'font-black text-blue-800' : 'font-medium text-slate-500'}`}>{c.lastMsg}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Chat Window */}
          {(currentUser.role === 'resident' || activeChatId) && (
            <div className="flex-1 flex flex-col bg-[#E4E3E0]/10">
              <div className="flex items-center justify-between border-b border-[#141414]/10 bg-white/50 backdrop-blur-sm px-2">
                {currentUser.role === 'official' && (
                  <button 
                    onClick={() => setActiveChatId(null)}
                    className="p-2 text-xs font-black uppercase opacity-50 hover:opacity-100 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                )}
                {currentUser.role === 'official' && activeChatId && (
                  <button 
                    onClick={() => onViewProfile(activeChatId)}
                    className="p-2 text-[10px] font-black uppercase text-blue-600 hover:underline"
                  >
                    View Resident Info
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12 opacity-40 italic text-sm">
                    {currentUser.role === 'resident' 
                      ? "Start a conversation with the Barangay Office."
                      : `Send a message to ${activeChatId}.`}
                  </div>
                )}
                {chatMessages.map(m => {
                  const isMe = m.senderId === currentUser.id || (currentUser.role === 'official' && m.senderRole === 'official');
                  return (
                  <div 
                    key={m.id} 
                    className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar for incoming messages */}
                    {!isMe && (
                      <button 
                        onClick={() => {
                          if (currentUser.role === 'official' && m.senderProfile) {
                            setViewingProfile(m.senderProfile);
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-[#141414] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] transition-transform active:scale-90 overflow-hidden ${currentUser.role === 'official' ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default bg-slate-100'}`}
                        title={currentUser.role === 'official' ? "View Profile" : ""}
                      >
                        <ProfileIcon gender={m.senderProfile?.gender} photoURL={m.senderProfile?.photoURL} className="w-6 h-6" />
                      </button>
                    )}
                    
                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Sender Name */}
                      {!isMe && (
                        <span className="text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">
                          {m.senderName}
                        </span>
                      )}
                      
                      <div className={`p-3 rounded-2xl border-2 border-[#141414] ${isMe ? 'bg-[#141414] text-white rounded-tr-none shadow-[-4px_4px_0px_0px_rgba(20,20,20,0.1)]' : 'bg-white rounded-tl-none shadow-[4px_4px_0px_0px_rgba(20,20,20,0.1)]'}`}>
                        {m.imageUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                            <img 
                              src={m.imageUrl} 
                              alt="Attached" 
                              className="max-w-full h-auto"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <p className="text-sm font-bold leading-relaxed">{m.text}</p>
                      </div>
                      <div className={`flex items-center gap-2 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-[9px] opacity-40 font-black uppercase tracking-tighter">{m.timestamp}</span>
                        {isMe && (
                          <button 
                            onClick={() => showConfirm("Are you sure you want to unsend this message? This action cannot be undone.", () => onDeleteMessage(m.id))}
                            className="text-[9px] font-black uppercase text-rose-500 hover:underline tracking-tighter"
                          >
                            Unsend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )})}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t-4 border-[#141414] bg-white flex flex-col gap-2">
                {selectedImage && (
                  <div className="relative w-20 h-20 mb-2 border-2 border-[#141414] rounded-xl overflow-hidden group">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-1 right-1 bg-rose-500 text-white p-0.5 rounded-full shadow-lg"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 border-2 border-[#141414] rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 border-2 border-[#141414] rounded-xl bg-[#E4E3E0]/20 text-sm font-bold outline-none focus:border-blue-600 transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={isUploading || (!inputText.trim() && !selectedImage)}
                    className="p-3 bg-[#141414] text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Helper Components
function SidebarItem({ icon, label, active = false, onClick, variant = 'default' }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, variant?: 'default' | 'danger' }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
        active 
          ? 'bg-white text-[#141414] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]' 
          : variant === 'danger'
            ? 'text-blue-400 hover:bg-blue-500/10'
            : 'text-white/60 hover:bg-white/5 hover:text-white'
      }`}
    >
      {icon}
      <span className="uppercase tracking-wider">{label}</span>
    </button>
  );
}

function DashboardCard({ title, icon, desc, onClick }: { title: string, icon: React.ReactNode, desc: string, onClick: () => void, key?: React.Key }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white border border-[#141414] p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] transition-all flex items-center gap-4 text-left group"
    >
      <div className="p-3 bg-slate-50 rounded-lg border border-[#141414] group-hover:bg-[#141414] group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-black uppercase text-sm leading-none mb-1">{title}</h3>
        <p className="text-[10px] font-bold text-slate-500 uppercase">{desc}</p>
      </div>
    </button>
  );
}

function DashboardGrid({ onSelect, role, t }: { onSelect: (id: string) => void, role: UserRole | null, t: (key: string) => string }) {
  const cards: { id: string, title: string, icon: React.ReactNode, desc: string, tab: string, isMainTab?: boolean }[] = [
    {
      id: 'donations',
      title: t('Donations'),
      icon: <Heart className="w-6 h-6" />,
      desc: t('Give or receive help'),
      tab: 'donations'
    },
    {
      id: 'transparency',
      title: t('Transparency'),
      icon: <BarChart3 className="w-6 h-6" />,
      desc: t('Audit and budget'),
      tab: 'transparency'
    },
    {
      id: 'officials',
      title: t('Barangay Officials'),
      icon: <ShieldCheck className="w-6 h-6" />,
      desc: t('Meet your leaders'),
      tab: 'officials'
    },
    {
      id: 'projects',
      title: t('Project Suggestions'),
      icon: <Lightbulb className="w-6 h-6" />,
      desc: t('Community ideas'),
      tab: 'projects'
    },
    {
      id: 'announcements',
      title: t('Announcements'),
      icon: <Megaphone className="w-6 h-6" />,
      desc: t('Latest updates'),
      tab: 'announcements'
    },
    {
      id: 'appointments',
      title: role === 'official' ? t('Manage Appointments') : t('Set Appointment'),
      icon: <Calendar className="w-6 h-6" />,
      desc: role === 'official' ? t('Review requests') : t('Schedule visit'),
      tab: 'appointments',
      isMainTab: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(card => (
        <DashboardCard
          key={card.id}
          title={card.title}
          icon={card.icon}
          desc={card.desc}
          onClick={() => onSelect(card.id)}
        />
      ))}
    </div>
  );
}

function LogoutConfirmModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] max-w-sm w-full text-center"
          >
            <div className="w-20 h-20 bg-blue-50 border-4 border-[#141414] rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut className="w-10 h-10 text-blue-900" />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2">Confirm Logout</h3>
            <p className="text-[#141414]/60 font-bold uppercase text-xs tracking-widest mb-8">Are you sure you want to log-out of the system?</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={onClose}
                className="py-3 border-2 border-[#141414] rounded-xl font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="py-3 bg-blue-900 text-white border-2 border-[#141414] rounded-xl font-black uppercase tracking-widest hover:bg-blue-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Log-out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function NotificationOverlay({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
  role
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  notifications: Notification[],
  onMarkAsRead: (id: string) => void,
  onMarkAllAsRead: () => void,
  onNavigate: (tab?: string, subTab?: string, notif?: Notification) => void,
  role?: UserRole
}) {
  const [activeFilter, setActiveFilter] = useState('All');

  const getNotifCategory = (notif: Notification) => {
    if (notif.type === 'donation') return 'Donation';
    if (notif.type === 'application' && notif.targetSubTab === 'donations') return 'Application';
    if (notif.targetSubTab === 'projects') return 'Projects';
    if (notif.type === 'audit' || notif.type === 'transparency' || notif.targetSubTab === 'transparency') return 'Audit';
    if (notif.type === 'appointment' || notif.targetSubTab === 'appointments') return 'Appointment';
    return 'Others';
  };

  const filteredNotifications = notifications.filter(notif => {
    if (role !== 'official' || activeFilter === 'All') return true;
    return getNotifCategory(notif) === activeFilter;
  });

  const filters = ['All', 'Donation', 'Application', 'Projects', 'Audit', 'Appointment', 'Others'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white border-l-4 border-[#141414] h-full flex flex-col shadow-[-12px_0px_0px_0px_rgba(20,20,20,0.1)]"
          >
            <div className="p-6 border-b-4 border-[#141414] flex justify-between items-center bg-[#E4E3E0]">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6" />
                <h2 className="text-xl font-black uppercase">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => n.status === 'unread') && (
                  <button 
                    onClick={onMarkAllAsRead}
                    className="px-3 py-1.5 bg-white border-2 border-[#141414] text-[#141414] text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Mark all read
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-[#141414] hover:text-white rounded-lg transition-colors border-2 border-transparent hover:border-[#141414]"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {role === 'official' && (
              <div className="flex flex-wrap gap-2 p-4 bg-white border-b-4 border-[#141414] overflow-x-auto no-scrollbar">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 border-[#141414] transition-all ${
                      activeFilter === filter 
                        ? 'bg-[#141414] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]' 
                        : 'bg-white text-[#141414] hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#141414]/20 gap-4">
                  <Bell className="w-12 h-12 opacity-20" />
                  <p className="font-black uppercase tracking-widest text-xs">No notifications yet</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 border-2 border-[#141414] rounded-xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] ${
                      notif.status === 'unread' ? 'bg-amber-50' : 'bg-white'
                    }`}
                    onClick={() => {
                      onMarkAsRead(notif.id);
                      onNavigate(notif.targetTab, notif.targetSubTab, notif);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black uppercase text-sm">{notif.title}</h3>
                      <span className="text-[10px] font-black uppercase opacity-40">{notif.date}</span>
                    </div>
                    <p className="text-sm font-bold mb-3">{notif.message}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border-2 border-[#141414] ${
                        notif.type === 'donation' ? 'bg-rose-400' :
                        notif.type === 'application' ? 'bg-amber-400' :
                        notif.type === 'feedback' ? 'bg-emerald-400' :
                        notif.type === 'appointment' ? 'bg-blue-400' :
                        notif.type === 'audit' || notif.type === 'transparency' ? 'bg-purple-400' :
                        'bg-[#E4E3E0]'
                      }`}>
                        {notif.type}
                      </span>
                      {notif.status === 'unread' && (
                        <span className="w-2 h-2 bg-rose-500 rounded-full" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DonationModule({ 
  role, 
  residentMode, 
  setResidentMode,
  donations,
  onAddDonation,
  onAddApplication,
  onUpdateStatus,
  onApproveDonation,
  onApproveApplication,
  onDeleteDonation,
  onBack,
  isValidFullName,
  FullNameReminder,
  authName,
  authUid,
  showAlert,
  showConfirm,
  onViewProfile,
  t
}: { 
  role: UserRole, 
  residentMode: ResidentMode | null,
  setResidentMode: (mode: ResidentMode | null) => void,
  donations: Donation[],
  onAddDonation: (donation: Omit<Donation, 'id' | 'status' | 'date'>) => void,
  onAddApplication: (application: Omit<Donation, 'id' | 'status' | 'date'>) => void,
  onUpdateStatus: (id: string, status: Donation['status'], extra?: Partial<Donation>) => void,
  onApproveDonation: (id: string, residentId: string, residentName: string) => void,
  onApproveApplication: (id: string, residentId: string, residentName: string) => void,
  onDeleteDonation: (id: string) => void,
  onBack: () => void,
  isValidFullName: (name: string) => boolean,
  FullNameReminder: React.FC<{ name: string }>,
  authName: string,
  authUid?: string,
  showAlert: (msg: string) => void,
  showConfirm: (msg: string, onConfirm: () => void) => void,
  onViewProfile?: (uid: string) => void,
  t: (key: string) => string
}) {
  const [showForm, setShowForm] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState<{ item: string, specificType: string, maxQuantity: number } | null>(null);
  const [declineItemId, setDeclineItemId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [customDeclineReason, setCustomDeclineReason] = useState('');
  const [formData, setFormData] = useState({
    donorName: authName || '',
    item: 'Food',
    specificType: 'Rice',
    customType: '',
    quantity: 1,
    value: 0,
    residentDeliveryDate: '',
    residentDeliveryTime: ''
  });
  const [applyData, setApplyData] = useState({
    beneficiaryName: authName || '',
    reason: '',
    quantity: 1,
    requirements: ''
  });

  const [activeStatusTab, setActiveStatusTab] = useState<'pending' | 'approved' | 'declined' | 'released'>('pending');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_az' | 'name_za'>('date_desc');
  const [deadlineDate, setDeadlineDate] = useState('');

  const donationCategories: Record<string, { type: 'input' | 'select', options?: string[], placeholder?: string }> = {
    'Medicine': { type: 'input', placeholder: 'Specific Medicine Name (e.g., Paracetamol)' },
    'Clothing': { type: 'select', options: ['T-shirt', 'Pants', 'Dress', 'Jacket', 'Shoes', 'Others'] },
    'Appliances': { type: 'select', options: ['Electric Fan', 'Rice Cooker', 'TV', 'Refrigerator', 'Others'] },
    'Food': { type: 'select', options: ['Canned Goods', 'Noodles', 'Rice', 'Others'] },
    'Cash': { type: 'input', placeholder: 'Specify if needed (e.g., Cash Donation)' },
    'Others': { type: 'input', placeholder: 'Specify Item Name' }
  };
  const declineOptions = [
    'Invalid information provided',
    'Item not needed at this time',
    'Insufficient proof of need',
    'Duplicate request',
    'Others'
  ];

  const filteredDonations = useMemo(() => {
    let filtered = donations.filter(d => {
      // Filter by Mode
      const matchesMode = residentMode === 'donor' ? !d.isApplication : d.isApplication;
      if (!matchesMode) return false;

      if (role === 'official') {
        if (activeStatusTab === 'pending') return d.status === 'pending_donation' || d.status === 'pending_application';
        if (activeStatusTab === 'approved') return d.status === 'available' || d.status === 'approved';
        if (activeStatusTab === 'declined') return d.status === 'declined' || d.status === 'cancelled';
        if (activeStatusTab === 'released') return d.status === 'released' || d.status === 'completed';
        return true;
      }
      
      const isUserRecord = d.isApplication ? d.beneficiaryUid === authUid : d.donorUid === authUid;
      if (!isUserRecord) return false;
      
      if (activeStatusTab === 'pending') return d.status === 'pending_donation' || d.status === 'pending_application';
      if (activeStatusTab === 'approved') return d.status === 'available' || d.status === 'approved';
      if (activeStatusTab === 'declined') return d.status === 'declined' || d.status === 'cancelled';
      if (activeStatusTab === 'released') return d.status === 'released' || d.status === 'completed';
      return true;
    });

    // Apply Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'name_az': return a.item.localeCompare(b.item);
        case 'name_za': return b.item.localeCompare(a.item);
        default: return 0;
      }
    });
  }, [donations, role, residentMode, authUid, activeStatusTab, sortBy]);

  const consolidatedAvailable = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};
    donations.filter(d => d.status === 'available' && !d.isApplication).forEach(d => {
      if (!grouped[d.item]) grouped[d.item] = {};
      const specific = d.specificType || d.item;
      grouped[d.item][specific] = (grouped[d.item][specific] || 0) + d.quantity;
    });
    return grouped;
  }, [donations]);

  const userApplicationsToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const counts: Record<string, Record<string, number>> = {};
    donations.filter(d => d.isApplication && d.beneficiaryUid === authUid && d.date === today).forEach(d => {
      if (!counts[d.item]) counts[d.item] = {};
      const specific = d.specificType || d.item;
      counts[d.item][specific] = (counts[d.item][specific] || 0) + d.quantity;
    });
    return counts;
  }, [donations, authUid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.donorName.trim();
    if (name && !isValidFullName(name)) {
      showAlert('Please enter a complete donor name (First Name and Last Name) or leave it blank for Anonymous.');
      return;
    }
    
    const categoryConfig = donationCategories[formData.item];
    let finalSpecificType = formData.specificType;
    
    if (categoryConfig.type === 'select' && formData.specificType === 'Others') {
      finalSpecificType = formData.customType;
    } else if (categoryConfig.type === 'input') {
      finalSpecificType = formData.customType; // For input type, we use customType to store the value
    }

    if (!finalSpecificType.trim()) {
      showAlert('Please specify the item type.');
      return;
    }

    onAddDonation({
      donorName: name || 'Anonymous',
      item: formData.item,
      specificType: finalSpecificType,
      quantity: Number(formData.quantity),
      value: formData.value,
      residentDeliveryDate: formData.residentDeliveryDate,
      residentDeliveryTime: formData.residentDeliveryTime
    });
    setShowForm(false);
    setFormData({ 
      donorName: authName || '', 
      item: 'Food', 
      specificType: 'Rice', 
      customType: '', 
      quantity: 1, 
      value: 0,
      residentDeliveryDate: '',
      residentDeliveryTime: ''
    });
    showAlert('Donation offer submitted! Please deliver the items on your preferred schedule.');
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'official') {
      showAlert('Admins are not allowed to apply for benefits.');
      return;
    }
    if (!isValidFullName(applyData.beneficiaryName)) {
      showAlert('Please enter your complete name (First Name and Last Name).');
      return;
    }
    if (showApplyForm) {
      const todayCount = userApplicationsToday[showApplyForm.item]?.[showApplyForm.specificType] || 0;
      const dailyLimit = showApplyForm.item === 'Appliances' ? 1 : 5; // 1 for appliances, 5 for others
      
      if (todayCount + applyData.quantity > dailyLimit) {
        showAlert(`You can only apply for up to ${dailyLimit} units of ${showApplyForm.specificType} per day. You have already applied for ${todayCount} today.`);
        return;
      }

      if (applyData.quantity > showApplyForm.maxQuantity) {
        showAlert(`You can only apply for up to ${showApplyForm.maxQuantity} units.`);
        return;
      }

      const itemValue = donations.find(d => d.item === showApplyForm.item && d.specificType === showApplyForm.specificType)?.value || 0;
      const requirements = (showApplyForm.item === 'Appliances' || itemValue > 1000) 
        ? 'Barangay ID, Certificate of Indigency, Proof of Residency' 
        : 'Barangay ID, Proof of Residency';

      onAddApplication({
        item: showApplyForm.item,
        specificType: showApplyForm.specificType,
        quantity: applyData.quantity,
        beneficiaryName: applyData.beneficiaryName,
        applicationReason: applyData.reason,
        requirements: requirements,
        beneficiaryUid: authUid
      });
      setShowApplyForm(null);
      setApplyData({ beneficiaryName: authName || '', reason: '', quantity: 1, requirements: '' });
      showAlert('Application submitted! Please wait for Barangay Official review.');
    }
  };

  const handleDecline = (id: string) => {
    setDeclineItemId(id);
    setDeclineReason(declineOptions[0]);
    setCustomDeclineReason('');
  };

  const handleConfirmDecline = () => {
    if (declineItemId) {
      const finalReason = declineReason === 'Others' ? customDeclineReason : declineReason;
      if (declineReason === 'Others' && !customDeclineReason.trim()) {
        showAlert('Please specify the reason.');
        return;
      }
      onUpdateStatus(declineItemId, 'declined', { declineReason: finalReason });
      setDeclineItemId(null);
      setDeclineReason('');
      setCustomDeclineReason('');
      showAlert('Record declined with reason.');
    }
  };

  if (!residentMode) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-8">
        <div className="w-full max-w-2xl">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold uppercase opacity-50 hover:opacity-100 mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> {t('Back to Dashboard')}
          </button>
          <h3 className="text-3xl font-bold text-center mb-8">{t('What would you like to do?')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => setResidentMode('donor')}
              className="flex flex-col items-center gap-4 p-10 bg-white border-4 border-[#141414] rounded-2xl hover:translate-x-[-4px] hover:translate-y-[-4px] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] transition-all group"
            >
              <div className="p-4 bg-[#E4E3E0] rounded-full border-2 border-[#141414] group-hover:bg-[#141414] group-hover:text-white transition-all">
                <HandHelping className="w-12 h-12 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tight">{t('Donate Items')}</span>
              <p className="text-center text-xs font-bold text-[#141414]/60 uppercase">{t('Offer resources to help fellow residents in need.')}</p>
            </button>
            <button
              onClick={() => setResidentMode('beneficiary')}
              className="flex flex-col items-center gap-4 p-10 bg-white border-4 border-[#141414] rounded-2xl hover:translate-x-[-4px] hover:translate-y-[-4px] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] transition-all group"
            >
              <div className="p-4 bg-[#E4E3E0] rounded-full border-2 border-[#141414] group-hover:bg-[#141414] group-hover:text-white transition-all">
                <Gift className="w-12 h-12 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tight">{t('Receive Benefits')}</span>
              <p className="text-center text-xs font-bold text-[#141414]/60 uppercase">{t('Request assistance or view available community aid.')}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={residentMode ? () => setResidentMode(null) : onBack}
        className="flex items-center gap-2 text-sm font-bold uppercase opacity-50 hover:opacity-100"
      >
        <ArrowLeft className="w-4 h-4" /> {residentMode ? t('Back to Selection') : t('Back to Dashboard')}
      </button>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-bold">{t('Donation Management')}</h3>
            {role === 'resident' && (
              <button 
                onClick={() => setResidentMode(null)}
                className="text-xs font-bold uppercase underline opacity-50 hover:opacity-100"
              >
                {t('Change Mode')}
              </button>
            )}
          </div>
          <p className="text-[#141414]/60">
            {residentMode === 'donor' ? t('Thank you for your generosity!') : t('Transparent distribution of community resources.')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white border-2 border-[#141414] rounded-xl px-3 py-2 shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-[10px] font-black uppercase tracking-widest outline-none bg-transparent"
            >
              <option value="date_desc">{t('Latest First')}</option>
              <option value="date_asc">{t('Oldest First')}</option>
              <option value="name_az">{t('A - Z')}</option>
              <option value="name_za">{t('Z - A')}</option>
            </select>
          </div>
          {(role === 'official' || (role === 'resident' && residentMode === 'donor')) && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-[#141414] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" /> {residentMode === 'donor' ? t('Offer Donation') : t('Add Record')}
            </button>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b-4 border-[#141414] pb-2">
        {[
          { id: 'pending', label: t('Pending'), icon: <Clock className="w-4 h-4" /> },
          { 
            id: 'approved', 
            label: residentMode === 'donor' ? t('Available') : t('Approved'), 
            icon: <CheckCircle2 className="w-4 h-4" /> 
          },
          { 
            id: 'released', 
            label: residentMode === 'donor' ? t('Completed') : t('Released'), 
            icon: <HandHelping className="w-4 h-4" /> 
          },
          { id: 'declined', label: t('Declined'), icon: <XCircle className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveStatusTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-black uppercase tracking-widest transition-all ${
              activeStatusTab === tab.id 
                ? 'bg-[#141414] text-white' 
                : 'bg-white text-slate-400 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {declineItemId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-md"
            >
              <h4 className="text-xl font-black uppercase mb-4">{t('Decline Reason')}</h4>
              <p className="text-xs font-bold text-[#141414]/60 uppercase mb-6">{t('Please state why you are declining this request.')}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">{t('Select Reason')}</label>
                  <select 
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 font-black uppercase tracking-widest outline-none"
                  >
                    {declineOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {declineReason === 'Others' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">{t('Specify Reason')}</label>
                    <textarea 
                      required
                      value={customDeclineReason}
                      onChange={(e) => setCustomDeclineReason(e.target.value)}
                      className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 focus:bg-white outline-none transition-all font-bold min-h-[100px]" 
                      placeholder="Type your reason here..." 
                    />
                  </motion.div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setDeclineItemId(null)}
                    className="flex-1 p-4 border-2 border-[#141414] rounded-xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    {t('Cancel')}
                  </button>
                  <button 
                    onClick={handleConfirmDecline}
                    className="flex-1 bg-rose-500 text-white p-4 border-2 border-[#141414] rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:scale-95 transition-all"
                  >
                    {t('Confirm Decline')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-black uppercase">{t('New Donation Offer')}</h4>
              <button onClick={() => setShowForm(false)} className="text-[#141414] hover:text-rose-500 transition-colors"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">{t('Donor Name (Optional)')}</label>
                  <input 
                    type="text" 
                    value={formData.donorName}
                    onChange={(e) => setFormData({...formData, donorName: e.target.value})}
                    className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 focus:bg-white outline-none transition-all font-bold" 
                    placeholder="Juan Dela Cruz" 
                  />
                  <FullNameReminder name={formData.donorName} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">{t('Item Type')} <span className="text-rose-500">*</span></label>
                  <select 
                    required
                    value={formData.item}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      const config = donationCategories[newCategory];
                      setFormData({
                        ...formData, 
                        item: newCategory, 
                        specificType: config.type === 'select' && config.options ? config.options[0] : '',
                        customType: ''
                      });
                    }}
                    className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 font-black uppercase tracking-widest outline-none"
                  >
                    {Object.keys(donationCategories).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                
                {donationCategories[formData.item].type === 'select' && (
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">{t('Specific Type')} <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.specificType}
                      onChange={(e) => setFormData({...formData, specificType: e.target.value, customType: ''})}
                      className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 font-black uppercase tracking-widest outline-none"
                    >
                      {donationCategories[formData.item].options?.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}

                {(donationCategories[formData.item].type === 'input' || formData.specificType === 'Others') && (
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">{t('Specify Item Name')} <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.customType}
                      onChange={(e) => setFormData({...formData, customType: e.target.value})}
                      className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 focus:bg-white outline-none transition-all font-bold" 
                      placeholder={donationCategories[formData.item].placeholder || t("Specify Item Name")} 
                    />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">{t('Quantity / Amount')} <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 focus:bg-white outline-none transition-all font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">{t('Preferred Delivery Date')} <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.residentDeliveryDate}
                    onChange={(e) => setFormData({...formData, residentDeliveryDate: e.target.value})}
                    className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 focus:bg-white outline-none transition-all font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">{t('Preferred Delivery Time')} <span className="text-rose-500">*</span></label>
                  <input 
                    type="time" 
                    required
                    value={formData.residentDeliveryTime}
                    onChange={(e) => setFormData({...formData, residentDeliveryTime: e.target.value})}
                    className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 focus:bg-white outline-none transition-all font-bold" 
                  />
                </div>
                <div className="pt-6">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded-r-lg">
                    <p className="text-xs font-bold text-amber-800">
                      <span className="font-black uppercase tracking-widest block mb-1">{t('Reminder:')}</span>
                      {t('The admin will not approve your donation until the item has been delivered to the barangay.')}
                    </p>
                  </div>
                  <button type="submit" className="w-full bg-[#141414] text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-all active:scale-[0.98]">
                    {t('Submit Donation Offer')}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}

        {showApplyForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-[#141414] p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-xl font-bold uppercase">{t('Benefit Application')}</h4>
                <p className="text-xs font-bold text-rose-600 uppercase mt-1">
                  {t('Item')}: {showApplyForm.item} ({showApplyForm.specificType})
                  {['Cash', 'Appliances'].includes(showApplyForm.item) ? ' (High Strictness - Proof Required)' : ' (Standard Review)'}
                </p>
              </div>
              <button onClick={() => setShowApplyForm(null)}><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">{t('Full Name')} <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={applyData.beneficiaryName}
                  onChange={(e) => setApplyData({...applyData, beneficiaryName: e.target.value})}
                  className="w-full p-3 border border-[#141414] rounded-lg bg-[#E4E3E0]/20" 
                  placeholder="Juan Dela Cruz" 
                />
                <FullNameReminder name={applyData.beneficiaryName} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">{t('Quantity')} (Max: {Math.min(showApplyForm.maxQuantity, (showApplyForm.item === 'Appliances' ? 1 : 5) - (userApplicationsToday[showApplyForm.item]?.[showApplyForm.specificType] || 0))}) <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={Math.min(showApplyForm.maxQuantity, (showApplyForm.item === 'Appliances' ? 1 : 5) - (userApplicationsToday[showApplyForm.item]?.[showApplyForm.specificType] || 0))}
                  value={applyData.quantity}
                  onChange={(e) => setApplyData({...applyData, quantity: parseInt(e.target.value)})}
                  className="w-full p-3 border border-[#141414] rounded-lg bg-[#E4E3E0]/20" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">
                  {['Cash', 'Appliances'].includes(showApplyForm.item) || (donations.find(d => d.item === showApplyForm.item && d.specificType === showApplyForm.specificType)?.value || 0) > 1000
                    ? t('Detailed Justification & Proof of Need') 
                    : t('Reason for Application')} <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  required
                  value={applyData.reason}
                  onChange={(e) => setApplyData({...applyData, reason: e.target.value})}
                  className="w-full p-3 border border-[#141414] rounded-lg bg-[#E4E3E0]/20 min-h-[100px]" 
                  placeholder={['Cash', 'Appliances'].includes(showApplyForm.item) || (donations.find(d => d.item === showApplyForm.item && d.specificType === showApplyForm.specificType)?.value || 0) > 1000
                    ? "Please provide a detailed explanation and mention any supporting documents you can present to the Barangay Office..." 
                    : "Explain why you need this item..."}
                />
              </div>
              <div className="p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 font-bold text-[10px] uppercase">
                {showApplyForm.item === 'Appliances' || (donations.find(d => d.item === showApplyForm.item && d.specificType === showApplyForm.specificType)?.value || 0) > 1000 ? (
                  <div className="space-y-1">
                    <p className="text-rose-600 font-black">{t('High Value Item - Requirements:')}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Valid Barangay ID</li>
                      <li>Certificate of Indigency</li>
                      <li>Proof of Residency</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-blue-600 font-black">{t('Standard Requirements:')}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Valid Barangay ID</li>
                      <li>Proof of Residency</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-[10px] leading-tight text-amber-900">
                <p className="font-bold uppercase mb-1">{t('Note on Safety & Security:')}</p>
                {t('All applications are reviewed by Barangay Officials. Providing false information may lead to disqualification from future benefits.')}
              </div>
              <button type="submit" className="w-full bg-[#141414] text-white p-4 rounded-xl font-bold hover:opacity-90 transition-opacity">
                Submit Application
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border-4 border-[#141414] rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-6 p-4 border-b-4 border-[#141414] bg-[#E4E3E0] font-sans text-[10px] font-black uppercase tracking-widest">
              <div>{residentMode === 'beneficiary' ? 'Beneficiary' : 'Donor'}</div>
              <div>Item</div>
              <div>Quantity</div>
              <div>Status</div>
              <div>Date</div>
              <div className="text-right">Action</div>
            </div>
            {filteredDonations.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-[#141414]/40 font-black uppercase tracking-widest">No records found.</p>
              </div>
            ) : (
              filteredDonations.map((d) => (
                <div key={d.id} className="border-b-2 border-[#141414] last:border-0">
                  <div className="grid grid-cols-6 p-6 hover:bg-[#E4E3E0]/30 transition-colors items-center">
                <div className="font-black uppercase text-xs">
                  {d.isApplication ? (
                    <span 
                      onClick={() => d.beneficiaryUid && onViewProfile?.(d.beneficiaryUid)}
                      className={`text-sky-600 ${d.beneficiaryUid ? 'cursor-pointer hover:underline' : ''}`}
                    >
                      {d.beneficiaryName}
                    </span>
                  ) : (
                    <span 
                      onClick={() => d.donorUid && onViewProfile?.(d.donorUid)}
                      className={`text-emerald-600 ${d.donorUid ? 'cursor-pointer hover:underline' : ''}`}
                    >
                      {d.donorName}
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs">{d.item} {d.specificType && `(${d.specificType})`}</div>
                <div className="font-black text-xs">{d.quantity} {d.item === 'Cash' ? 'PHP' : 'units'}</div>
                <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 border-[#141414] ${
                      d.status === 'available' || d.status === 'completed' ? 'bg-emerald-400 text-[#141414]' : 
                      d.status === 'approved' ? 'bg-sky-400 text-[#141414]' :
                      d.status === 'pending_donation' ? 'bg-amber-400 text-[#141414]' : 
                      d.status === 'pending_application' ? 'bg-sky-400 text-[#141414]' : 
                      d.status === 'released' ? 'bg-slate-300 text-[#141414]' : 'bg-rose-400 text-[#141414]'
                    }`}>
                      {d.status === 'available' || d.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : 
                       d.status === 'released' ? <HandHelping className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      {d.status.replace('_', ' ')}
                    </span>
                </div>
                  <div className="font-black text-[10px] opacity-40">
                    {d.date}
                    {d.status === 'declined' && d.declineReason && (
                      <div className="mt-1 text-rose-600 font-bold uppercase leading-tight">
                        Reason: {d.declineReason}
                      </div>
                    )}
                    {d.residentDeliveryDate && (
                      <div className="mt-1 text-blue-600 font-bold uppercase leading-tight flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Delivery: {d.residentDeliveryDate} {d.residentDeliveryTime}
                      </div>
                    )}
                    {(d.adminDeadlineDate || d.pickupDeadline || d.submissionDeadline) && (
                      <div className="mt-1 text-amber-600 font-bold uppercase leading-tight flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Deadline: {d.adminDeadlineDate || d.pickupDeadline || d.submissionDeadline} {d.adminDeadlineTime || ''}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex justify-end items-center gap-2">
                    {role === 'official' && d.status === 'approved' && !d.isApplication && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onUpdateStatus(d.id, 'completed')}
                          className="p-2 bg-emerald-500 text-white border-2 border-[#141414] rounded-lg shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]" 
                          title="Mark as Completed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {role === 'official' && d.status === 'pending_donation' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onApproveDonation(d.id, d.donorUid, d.donorName)} className="p-2 bg-emerald-400 border-2 border-[#141414] rounded-lg shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]" title="Approve Donation"><CheckCircle2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDecline(d.id)} className="p-2 bg-rose-400 border-2 border-[#141414] rounded-lg shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]" title="Decline"><XCircle className="w-4 h-4" /></button>
                      </div>
                    )}
                    {role === 'official' && d.status === 'pending_application' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onApproveApplication(d.id, d.beneficiaryUid || '', d.beneficiaryName || '')} className="p-2 bg-sky-400 border-2 border-[#141414] rounded-lg shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]" title="Approve Application"><HandHelping className="w-4 h-4" /></button>
                        <button onClick={() => handleDecline(d.id)} className="p-2 bg-rose-400 border-2 border-[#141414] rounded-lg shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]" title="Decline"><XCircle className="w-4 h-4" /></button>
                      </div>
                    )}
                  {role === 'official' && (
                    <button 
                      onClick={() => {
                        showConfirm(`Are you sure you want to delete this ${d.isApplication ? 'application' : 'donation'} record? This action cannot be undone.`, () => {
                          onDeleteDonation(d.id);
                        });
                      }} 
                      className="p-2 bg-rose-600 text-white border-2 border-[#141414] rounded-lg shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]" 
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {(d.status === 'released' || d.status === 'declined' || (residentMode === 'donor' && d.status === 'available') || (role === 'resident' && residentMode === 'beneficiary' && d.status === 'pending_application')) && role !== 'official' && (
                    <span className="text-[10px] font-black uppercase opacity-20 italic">No actions</span>
                  )}
                </div>
              </div>
              {role === 'official' && d.status === 'pending_application' && (
                <div className="px-6 pb-6 pt-0">
                  <div className="bg-[#E4E3E0] border-2 border-[#141414] p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <p className="text-xs font-black uppercase mb-2">Application Details:</p>
                    <p className="text-sm font-black mb-1">Applicant: {d.beneficiaryName}</p>
                    <p className="text-sm italic font-bold mb-2">"{d.applicationReason}"</p>
                    <p className="text-[10px] font-black uppercase opacity-60">Requirements: {d.requirements || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
          </div>
        </div>

        {(residentMode === 'beneficiary' || role === 'official') && residentMode === 'beneficiary' && (
          <div className="p-6 border-t-4 border-[#141414] bg-[#E4E3E0]/30">
            <h4 className="text-xl font-black uppercase tracking-widest mb-4">
              {role === 'official' ? t('Inventory / Available for Distribution') : t('Available Items for Application')}
            </h4>
            {Object.keys(consolidatedAvailable).length === 0 ? (
              <p className="text-[#141414]/40 font-black uppercase tracking-widest text-center py-8">No items available currently.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(consolidatedAvailable).map(([category, specificItems]) => (
                  <div key={category} className="bg-white border-2 border-[#141414] rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <h5 className="font-black uppercase text-lg border-b-2 border-[#141414] pb-2 mb-3">{category}</h5>
                    <div className="space-y-3">
                      {Object.entries(specificItems).map(([specificType, quantity]) => (
                        <div key={specificType} className="flex justify-between items-center bg-[#E4E3E0]/30 p-2 rounded-lg border border-[#141414]/20">
                          <span className="font-bold text-sm">{specificType}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-xs bg-[#141414] text-white px-2 py-1 rounded-md">{quantity} {category === 'Cash' ? 'PHP' : 'units'}</span>
                            {role === 'resident' && (
                              <button 
                                onClick={() => {
                                  const todayCount = userApplicationsToday[category]?.[specificType] || 0;
                                  const dailyLimit = category === 'Appliances' ? 1 : 5;
                                  if (todayCount >= dailyLimit) {
                                    showAlert(`You have reached the daily limit of ${dailyLimit} applications for ${specificType}.`);
                                    return;
                                  }
                                  setShowApplyForm({ item: category, specificType, maxQuantity: quantity });
                                }}
                                className="bg-emerald-400 text-[#141414] px-3 py-1 rounded-lg font-black uppercase text-[10px] border-2 border-[#141414] hover:translate-x-[-1px] hover:translate-y-[-1px] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] transition-all"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TransparencyModule({ 
  role, 
  auditRequests, 
  auditReports,
  budget,
  onAddAuditRequest, 
  onUpdateAuditStatus,
  onApproveAuditRequest,
  onAddAuditReport,
  onDeleteAuditReport,
  onDeleteAuditRequest,
  onUpdateBudget,
  onBack,
  isValidFullName,
  FullNameReminder,
  authName,
  showConfirm,
  showAlert,
  onViewProfile
}: { 
  role: UserRole, 
  auditRequests: AuditRequest[], 
  auditReports: AuditReport[],
  budget: Budget[],
  onAddAuditRequest: (data: Omit<AuditRequest, 'id' | 'status' | 'date'>) => void, 
  onUpdateAuditStatus: (id: string, status: AuditRequest['status'], responseReport?: string) => void,
  onApproveAuditRequest: (id: string, residentId: string, residentName: string) => void,
  onAddAuditReport: (data: Omit<AuditReport, 'id' | 'date'>) => void,
  onDeleteAuditReport: (id: string) => void,
  onDeleteAuditRequest: (id: string) => void,
  onUpdateBudget: (category: string, allocated: number, spent: number) => void,
  onBack: () => void,
  isValidFullName: (name: string) => boolean,
  FullNameReminder: React.FC<{ name: string }>,
  authName: string,
  showConfirm: (msg: string, onConfirm: () => void) => void,
  showAlert: (msg: string) => void,
  onViewProfile?: (uid: string) => void
}) {
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [showAddReportForm, setShowAddReportForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'audits' | 'funds'>('overview');
  const [activeAuditTab, setActiveAuditTab] = useState<'pending' | 'responded'>('pending');
  const [auditSortBy, setAuditSortBy] = useState<'date_desc' | 'date_asc' | 'name_az' | 'name_za'>('date_desc');
  
  const [auditData, setAuditData] = useState({ name: authName || '', address: '', contact: '', reason: '' });

  const filteredAuditRequests = useMemo(() => {
    let filtered = auditRequests.filter(r => {
      if (role === 'resident') return r.name === authName && r.status === activeAuditTab;
      return r.status === activeAuditTab;
    });

    return filtered.sort((a, b) => {
      switch (auditSortBy) {
        case 'date_desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'name_az': return a.name.localeCompare(b.name);
        case 'name_za': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
  }, [auditRequests, activeAuditTab, auditSortBy, role, authName]);
  const [reportData, setReportData] = useState({ title: '', description: '', author: authName || '' });
  const [responseData, setResponseData] = useState('');
  const [budgetFormData, setBudgetFormData] = useState({ allocated: 0, spent: 0 });

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidFullName(auditData.name)) {
      showAlert('Please enter your complete name (First Name and Last Name).');
      return;
    }
    onAddAuditRequest({
      name: auditData.name,
      address: auditData.address,
      reason: auditData.reason
    });
    showAlert(`Audit request submitted! The Barangay Secretary has been notified and will contact you at your provided address.`);
    setShowAuditForm(false);
    setAuditData({ name: authName || '', address: '', contact: '', reason: '' });
  };

  const handleAddReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAuditReport(reportData);
    setShowAddReportForm(false);
    setReportData({ title: '', description: '', author: authName || '' });
    showAlert('Audit report published successfully.');
  };

  const handleResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showResponseForm) {
      onUpdateAuditStatus(showResponseForm, 'responded', responseData);
      setShowResponseForm(null);
      setResponseData('');
      showAlert('Audit report has been sent to the resident.');
    }
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showBudgetForm) {
      onUpdateBudget(showBudgetForm.category, budgetFormData.allocated, budgetFormData.spent);
      setShowBudgetForm(null);
      showAlert('Budget updated successfully.');
    }
  };

  const fundsData = {
    income: [
      { code: '40102010', item: 'Business Tax', amount: 482713.00 },
      { code: '40101050', item: 'Community Tax Certificate', amount: 250000.00 },
      { code: '40101010', item: 'Real Property Tax', amount: 1900000.00 },
      { code: '40401010', item: 'Clearance and Certification Fees', amount: 250000.00 },
      { code: '40201020', item: 'Subsidy from Other LGUs', amount: 1800.00 },
      { code: '40104990', item: 'Interest Income', amount: 5000.00 },
      { code: '40104010', item: 'National Tax Allocation', amount: 23390487.00 },
    ],
    expenditure: [
      { 
        category: 'A. EXECUTIVE AND LEGISLATIVE SERVICES',
        items: [
          { name: '1. Current Operating Expenditures', amount: 0, isHeader: true },
          { name: '1.1 Personal Services', amount: 3969552.00 },
          { name: 'Salaries and Wages', amount: 26400.00, isSub: true },
          { name: 'PAG-IBIG Contributions', amount: 55000.00, isSub: true },
          { name: 'Cash Gift', amount: 163656.00, isSub: true },
        ]
      }
    ]
  };

  return (
    <div className="space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold uppercase opacity-50 hover:opacity-100"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h3 className="text-4xl font-black uppercase tracking-tighter">Kontra Corrupt</h3>
          <p className="text-[#141414]/60 font-medium">
            {role === 'official' ? 'Manage transparency records and financial accountability.' : 'Monitor barangay funds, expenditures, and audit findings.'}
          </p>
        </div>
        <div className="flex bg-[#E4E3E0] p-1 rounded-xl border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'overview' ? 'bg-[#141414] text-white' : 'hover:bg-white/50'}`}
          >
            Overview
          </button>
          {role === 'official' && (
            <button 
              onClick={() => setActiveTab('audits')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'audits' ? 'bg-[#141414] text-white' : 'hover:bg-white/50'}`}
            >
              Audits
            </button>
          )}
          <button 
            onClick={() => setActiveTab('funds')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'funds' ? 'bg-[#141414] text-white' : 'hover:bg-white/50'}`}
          >
            Barangay Funds
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {budget.map((b) => (
              <div key={b.category} className="bg-white border-4 border-[#141414] rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative group">
                {role === 'official' && (
                  <button 
                    onClick={() => {
                      setShowBudgetForm(b);
                      setBudgetFormData({ allocated: b.allocated, spent: b.spent });
                    }}
                    className="absolute top-4 right-4 p-2 bg-blue-600 text-white border-2 border-[#141414] rounded-lg shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-black uppercase text-lg">{b.category}</h4>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-black opacity-40 tracking-widest mb-1">Allocated</p>
                    <p className="text-2xl font-black">₱{b.allocated.toLocaleString()}</p>
                  </div>
                  <div className="relative h-4 bg-[#E4E3E0] border-2 border-[#141414] rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#141414]" 
                      style={{ width: `${Math.min((b.spent / b.allocated) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-black uppercase">
                    <span className="opacity-40">Spent: ₱{b.spent.toLocaleString()}</span>
                    <span>{Math.round((b.spent / b.allocated) * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h4 className="text-xl font-bold uppercase flex items-center gap-2">
                <Mail className="w-5 h-5" /> {role === 'official' ? 'Audit Requests from Residents' : 'Your Audit Requests'}
              </h4>
              <div className="flex items-center gap-2 bg-white border-2 border-[#141414] rounded-xl px-3 py-2 shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  value={auditSortBy}
                  onChange={(e) => setAuditSortBy(e.target.value as any)}
                  className="text-[10px] font-black uppercase tracking-widest outline-none bg-transparent"
                >
                  <option value="date_desc">Latest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="name_az">A - Z</option>
                  <option value="name_za">Z - A</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b-4 border-[#141414] pb-2">
              {[
                { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
                { id: 'responded', label: 'Responded', icon: <CheckCircle2 className="w-4 h-4" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAuditTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-black uppercase tracking-widest transition-all ${
                    activeAuditTab === tab.id 
                      ? 'bg-[#141414] text-white' 
                      : 'bg-white text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {filteredAuditRequests.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-dashed border-[#141414] rounded-2xl opacity-40">
                <p className="font-bold uppercase">No audit requests found.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAuditRequests.map((r) => (
                  <div key={r.id} className="bg-white border-4 border-[#141414] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start gap-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span 
                          onClick={() => r.requesterUid && onViewProfile?.(r.requesterUid)}
                          className={`font-black uppercase text-lg ${r.requesterUid ? 'cursor-pointer hover:underline' : ''}`}
                        >
                          {r.name}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 border-2 border-[#141414] rounded-full ${r.status === 'pending' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold opacity-60 mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.address}
                      </p>
                      <div className="bg-slate-50 p-4 border-2 border-[#141414] rounded-xl">
                        <p className="text-xs font-black uppercase text-slate-400 mb-1">Reason for Request:</p>
                        <p className="text-sm font-bold italic">"{r.reason}"</p>
                      </div>
                      {r.responseReport && (
                        <div className="mt-4 bg-emerald-50 p-4 border-2 border-emerald-200 rounded-xl">
                          <p className="text-xs font-black uppercase text-emerald-600 mb-1">Report Provided:</p>
                          <p className="text-sm font-bold">{r.responseReport}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex flex-col justify-between h-full min-w-[150px]">
                      <div className="flex justify-end items-center gap-2 mb-2">
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">{r.date}</p>
                        {role === 'official' && (
                          <button 
                            onClick={() => {
                              showConfirm('Are you sure you want to delete this audit request? This action cannot be undone.', () => {
                                onDeleteAuditRequest(r.id);
                              });
                            }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {role === 'official' && r.status === 'pending' && (
                        <button 
                          onClick={() => onApproveAuditRequest(r.id, r.requesterUid || '', r.name)}
                          className="mt-4 px-6 py-3 bg-[#141414] text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,0.2)] active:scale-95"
                        >
                          Approve & Respond
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'audits' && role === 'official' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h4 className="text-2xl font-black uppercase">Official Audit Reports</h4>
            {role === 'official' && (
              <button 
                onClick={() => setShowAddReportForm(true)}
                className="flex items-center gap-2 bg-[#141414] text-white px-6 py-3 rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(20,20,20,0.2)] hover:translate-y-[-2px] transition-all"
              >
                <Plus className="w-4 h-4" /> Publish Audit
              </button>
            )}
          </div>

          {auditReports.length === 0 ? (
            <div className="p-20 text-center bg-white border-4 border-dashed border-[#141414] rounded-3xl opacity-30">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p className="font-black uppercase tracking-widest">No published audit reports yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {auditReports.map((report) => (
                <div key={report.id} className="bg-white border-4 border-[#141414] p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:translate-y-[-4px] transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-[#E4E3E0] border-2 border-[#141414] rounded-xl">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase opacity-40">{report.date}</p>
                      <p className="text-[10px] font-black uppercase text-emerald-600">Verified Audit</p>
                    </div>
                  </div>
                  <h5 className="text-xl font-black uppercase mb-3">{report.title}</h5>
                  <p className="text-sm font-medium text-[#141414]/70 mb-6 line-clamp-3 leading-relaxed">
                    {report.description}
                  </p>
                  <div className="flex justify-between items-center pt-6 border-t-2 border-[#141414]/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#141414] rounded-full flex items-center justify-center text-white text-[10px] font-black">
                        {report.author.charAt(0)}
                      </div>
                      <span className="text-[10px] font-black uppercase opacity-60">{report.author}</span>
                    </div>
                    {role === 'official' && (
                      <button 
                        onClick={() => {
                          showConfirm('Are you sure you want to delete this audit report? This action cannot be undone.', () => {
                            onDeleteAuditReport(report.id);
                          });
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'funds' && (
        <div className="space-y-10">
          <div className="bg-white border-4 border-[#141414] rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
            <div className="bg-[#141414] p-6 text-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h4 className="text-xl font-black uppercase italic">Estimated Income</h4>
                <p className="text-[10px] font-bold uppercase opacity-60 tracking-[0.2em]">Budget Year 2026</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase opacity-60">Total Estimated Income</p>
                <p className="text-3xl font-black tracking-tighter">₱26,280,000.00</p>
              </div>
            </div>
            <div className="p-0 overflow-x-auto">
              <div className="min-w-[600px]">
                <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#E4E3E0] border-b-4 border-[#141414]">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-50">Account Code</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-50">Source of Income</th>
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-50 text-right">Amount (₱)</th>
                  </tr>
                </thead>
                <tbody>
                  {fundsData.income.map((item, idx) => (
                    <tr key={idx} className="border-b-2 border-[#141414]/10 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-xs font-bold">{item.code}</td>
                      <td className="p-4 text-sm font-black uppercase">{item.item}</td>
                      <td className="p-4 text-sm font-black text-right">₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-[#141414] rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
            <div className="bg-[#141414] p-6 text-white">
              <h4 className="text-xl font-black uppercase italic">Barangay Expenditure Program</h4>
              <p className="text-[10px] font-bold uppercase opacity-60 tracking-[0.2em]">Budget Year 2026</p>
            </div>
            <div className="p-0 overflow-x-auto">
              <div className="min-w-[600px]">
                {fundsData.expenditure.map((cat, idx) => (
                <div key={idx}>
                  <div className="bg-[#E4E3E0] p-4 border-b-4 border-[#141414]">
                    <h5 className="font-black uppercase text-sm tracking-tight">{cat.category}</h5>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-[#141414]">
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-50">Program/Projects/Activities</th>
                        <th className="p-4 text-[10px] font-black uppercase tracking-widest opacity-50 text-right">Amount (₱)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map((item, iIdx) => (
                        <tr key={iIdx} className={`border-b border-[#141414]/5 hover:bg-slate-50 transition-colors ${item.isHeader ? 'bg-slate-100 font-black' : ''}`}>
                          <td className={`p-4 text-sm font-bold ${item.isSub ? 'pl-10 opacity-60 italic' : 'uppercase'}`}>
                            {item.name}
                          </td>
                          <td className="p-4 text-sm font-black text-right">
                            {item.amount > 0 ? `₱${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAuditForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-black uppercase">Request Audit Report</h4>
                <button onClick={() => setShowAuditForm(false)} className="text-[#141414] hover:text-rose-500 transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              <form onSubmit={handleAuditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={auditData.name}
                      onChange={(e) => setAuditData({...auditData, name: e.target.value})}
                      className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                    />
                    <FullNameReminder name={auditData.name} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Address <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={auditData.address}
                      onChange={(e) => setAuditData({...auditData, address: e.target.value})}
                      className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={auditData.contact}
                    onChange={(e) => setAuditData({...auditData, contact: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                    placeholder="09123456789"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Reason for Request <span className="text-rose-500">*</span></label>
                  <textarea 
                    required
                    value={auditData.reason}
                    onChange={(e) => setAuditData({...auditData, reason: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold min-h-[120px] resize-none" 
                    placeholder="Why are you requesting this audit?"
                  />
                </div>
                <button type="submit" className="w-full bg-[#141414] text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)] transition-all active:scale-[0.98]">
                  Submit Request
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showAddReportForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-black uppercase">Publish Audit Report</h4>
                <button onClick={() => setShowAddReportForm(false)} className="text-[#141414] hover:text-rose-500 transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              <form onSubmit={handleAddReportSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Report Title <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={reportData.title}
                    onChange={(e) => setReportData({...reportData, title: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                    placeholder="e.g., Annual Financial Audit 2025"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Description / Findings <span className="text-rose-500">*</span></label>
                  <textarea 
                    required
                    value={reportData.description}
                    onChange={(e) => setReportData({...reportData, description: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold min-h-[150px] resize-none" 
                    placeholder="Summarize the audit findings..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Author / Auditor <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={reportData.author}
                    onChange={(e) => setReportData({...reportData, author: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                  />
                </div>
                <button type="submit" className="w-full bg-[#141414] text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)] transition-all active:scale-[0.98]">
                  Publish Report
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showResponseForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-black uppercase">Provide Audit Report</h4>
                <button onClick={() => setShowResponseForm(null)} className="text-[#141414] hover:text-rose-500 transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              <div className="mb-6 p-4 bg-slate-50 border-2 border-[#141414] rounded-xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Request from:</p>
                <p className="font-black">{auditRequests.find(r => r.id === showResponseForm)?.name}</p>
                <p className="text-sm italic mt-2">"{auditRequests.find(r => r.id === showResponseForm)?.reason}"</p>
              </div>
              <form onSubmit={handleResponseSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Report Content / Findings <span className="text-rose-500">*</span></label>
                  <textarea 
                    required
                    value={responseData}
                    onChange={(e) => setResponseData(e.target.value)}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold min-h-[200px] resize-none" 
                    placeholder="Enter the audit findings or link to the full report..."
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)] transition-all active:scale-[0.98]">
                  Send Report to Resident
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showBudgetForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-2xl font-black uppercase">Update Budget</h4>
                <button onClick={() => setShowBudgetForm(null)} className="text-[#141414] hover:text-rose-500 transition-colors">
                  <XCircle className="w-8 h-8" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Category:</p>
                <p className="text-xl font-black">{showBudgetForm.category}</p>
              </div>
              <form onSubmit={handleBudgetSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Allocated Amount (₱) <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    value={budgetFormData.allocated}
                    onChange={(e) => setBudgetFormData({...budgetFormData, allocated: parseInt(e.target.value)})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Spent Amount (₱) <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    value={budgetFormData.spent}
                    onChange={(e) => setBudgetFormData({...budgetFormData, spent: parseInt(e.target.value)})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                  />
                </div>
                <button type="submit" className="w-full bg-[#141414] text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)] transition-all active:scale-[0.98]">
                  Save Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-[#141414] text-white rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h4 className="text-2xl font-black mb-2 italic font-serif">
            {role === 'official' ? '"Integrity in every centavo."' : '"Public funds are for public service."'}
          </h4>
          <p className="opacity-60">
            {role === 'official' 
              ? 'Ensure all financial records are accurate and up-to-date for community transparency.' 
              : 'Report any discrepancies or request a detailed audit report.'}
          </p>
        </div>
        {role === 'resident' ? (
          <button 
            onClick={() => setShowAuditForm(true)}
            className="bg-white text-[#141414] px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#E4E3E0] transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:scale-95"
          >
            Request Audit Report
          </button>
        ) : (
          <div className="flex gap-4">
            <div className="px-6 py-3 bg-blue-600 border-2 border-white rounded-xl font-black uppercase text-xs tracking-widest">
              Official Access
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function OfficialsModule({ 
  onBack, 
  onCall, 
  onMessage,
  role, 
  officials, 
  onUpdate, 
  onAdd, 
  onDelete,
  showConfirm,
  title = "Official List",
  userStreet
}: { 
  onBack: () => void, 
  onCall: (official: Official) => void,
  onMessage: (official: Official) => void,
  role: UserRole,
  officials: Official[],
  onUpdate: (id: string, data: Partial<Official>) => void,
  onAdd: (data: Omit<Official, 'id'>) => void,
  onDelete: (id: string) => void,
  showConfirm: (msg: string, onConfirm: () => void) => void,
  title?: string,
  userStreet?: string
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);
  const [selectedOfficialForDetails, setSelectedOfficialForDetails] = useState<Official | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<Official, 'id'>>({
    name: '',
    position: 'Kagawad',
    term: '2023 - 2026',
    photo: 'https://picsum.photos/seed/official/400/500',
    email: '',
    phone: '',
    streets: []
  });

  const displayOfficials = (officials.length > 0 ? officials : MOCK_OFFICIALS).map(o => {
    const mock = MOCK_OFFICIALS.find(m => m.name === o.name);
    return {
      ...o,
      streets: (o.streets && o.streets.length > 0) ? o.streets : (mock?.streets || [])
    };
  });
  const captain = displayOfficials.find(o => o.position === 'Barangay Chairman' || o.position === 'Barangay Captain');
  const kagawads = displayOfficials.filter(o => o.position === 'Kagawad' || o.position === 'Barangay Councilor');
  const otherStaff = displayOfficials.filter(o => o.position !== 'Barangay Chairman' && o.position !== 'Barangay Captain' && o.position !== 'Kagawad' && o.position !== 'Barangay Councilor');

  const sortOfficials = async () => {
    const batch = writeBatch(db);
    officials.forEach((o, index) => {
      const ref = doc(db, 'officials', o.id);
      if (o.position === 'Barangay Chairman' || o.position === 'Barangay Captain') {
        batch.update(ref, { order: 0 });
      } else {
        batch.update(ref, { order: index + 1 });
      }
    });
    await batch.commit();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOfficial) {
      onUpdate(editingOfficial.id, { ...formData, order: editingOfficial.order });
      setEditingOfficial(null);
    } else {
      onAdd(formData);
      setIsAdding(false);
    }
    setFormData({
      name: '',
      position: 'Kagawad',
      term: '2023 - 2026',
      photo: 'https://picsum.photos/seed/official/400/500',
      email: '',
      phone: '',
      streets: []
    });
  };

  const startEdit = (o: Official) => {
    setEditingOfficial(o);
    setFormData({
      name: o.name,
      position: o.position,
      term: o.term,
      photo: o.photo,
      email: o.email || '',
      phone: o.phone || '',
      streets: o.streets || []
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const compressedBase64 = await compressImage(base64String);
      setFormData(prev => ({ ...prev, photo: compressedBase64 }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-[#0F172A]">{title}</h2>
        </div>
        <div className="flex items-center gap-4">
          {role === 'official' && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Official
            </button>
          )}
          <div className="px-4 py-1.5 bg-blue-50 border-2 border-blue-100 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest">
            Current Term: 2023 - 2026
          </div>
        </div>
      </div>

      <AnimatePresence>
        {(isAdding || editingOfficial) && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-3xl font-black uppercase tracking-tighter">
                  {editingOfficial ? 'Edit Official' : 'Add New Official'}
                </h4>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingOfficial(null);
                  }} 
                  className="text-[#141414] hover:text-rose-500 transition-colors"
                >
                  <XCircle className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex flex-col items-center mb-4">
                  <div className="relative group/photo">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] bg-slate-100">
                      <img 
                        src={formData.photo} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity rounded-2xl"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Click to upload photo</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                    placeholder="Hon. Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Position</label>
                  <input 
                    type="text" 
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold"
                    placeholder="Barangay Captain"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Term</label>
                  <input 
                    type="text" 
                    required
                    value={formData.term}
                    onChange={(e) => setFormData({...formData, term: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                    placeholder="2023 - 2026"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Photo URL (Optional if uploaded)</label>
                  <input 
                    type="url" 
                    value={formData.photo}
                    onChange={(e) => setFormData({...formData, photo: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                    placeholder="official@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold" 
                    placeholder="0912 345 6789"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Streets (One per line)</label>
                  <textarea 
                    value={formData.streets?.join('\n')}
                    onChange={(e) => setFormData({...formData, streets: e.target.value.split('\n').filter(s => s.trim())})}
                    className="w-full p-4 border-2 border-[#141414] rounded-xl bg-slate-50 focus:bg-white outline-none transition-all font-bold min-h-[120px]" 
                    placeholder="STREET 1&#10;STREET 2"
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)] transition-all active:scale-[0.98]">
                    {editingOfficial ? 'Update Official Record' : 'Save Official Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h3 className="text-5xl font-black text-[#0F172A] tracking-tighter">Barangay Council</h3>
        <p className="text-slate-500 font-medium text-lg">Meet your dedicated public servants of Pahinga Norte, committed to transparency and community service.</p>
      </div>

      {/* Featured: Barangay Captain */}
      {captain && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-4 border-[#141414] rounded-[2rem] overflow-hidden shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col md:flex-row relative group">
            {role === 'official' && (
              <div className="absolute top-6 right-6 z-20 flex gap-2">
                <button 
                  onClick={() => startEdit(captain)}
                  className="p-3 bg-white border-2 border-[#141414] rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    showConfirm('Are you sure you want to delete this official record?', () => {
                      onDelete(captain.id);
                    });
                  }}
                  className="p-3 bg-white border-2 border-[#141414] rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div 
              onClick={() => setSelectedOfficialForDetails(captain)}
              className="md:w-2/5 aspect-square md:aspect-auto relative group/img cursor-pointer"
            >
              <img 
                src={captain.photo} 
                alt={captain.name} 
                className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <div className="flex gap-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessage(captain);
                    }}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/40 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-white" />
                  </button>
                  {captain.phone && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onCall(captain);
                      }}
                      className="p-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/40 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center space-y-6 bg-[#F8FAFC]">
              <div className="space-y-2">
                <span className="inline-block px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Chief Executive</span>
                <h4 className="text-4xl font-black text-[#0F172A] tracking-tight">{captain.name}</h4>
                <p className="text-blue-600 font-black uppercase tracking-widest text-sm">{captain.position}</p>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed italic">
                "Serving with integrity and passion to build a stronger, more transparent Pahinga Norte for every resident."
              </p>
              <div className="pt-6 border-t border-slate-200 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leading 12 Council Members</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kagawads & Councilors Grid */}
      <div className="space-y-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {kagawads.map((o) => {
            const isAssignedToUser = userStreet && o.streets?.includes(userStreet);
            return (
              <div key={o.id} className={`group p-4 rounded-[2rem] transition-all ${isAssignedToUser ? 'bg-blue-50 border-4 border-blue-600 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]' : ''}`}>
                <div className="relative mb-4">
                  {isAssignedToUser && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-[#141414] shadow-md whitespace-nowrap">
                      Your Assigned Official
                    </div>
                  )}
                  <div 
                    onClick={() => setSelectedOfficialForDetails(o)}
                    className="aspect-[4/5] rounded-[1.5rem] overflow-hidden border-2 border-[#141414] shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] group-hover:border-blue-600 transition-all duration-300 cursor-pointer"
                  >
                  <img 
                    src={o.photo} 
                    alt={o.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-6">
                    <div className="flex gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onMessage(o);
                        }}
                        className="p-3 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/40 transition-colors"
                      >
                        <Mail className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                {role === 'official' ? (
                  <div className="absolute -top-2 -right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={() => startEdit(o)}
                      className="p-2 bg-white border-2 border-[#141414] rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all shadow-md"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        showConfirm(`Are you sure you want to delete ${o.name}'s record?`, () => {
                          onDelete(o.id);
                        });
                      }}
                      className="p-2 bg-white border-2 border-[#141414] rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-600 border-4 border-[#141414] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all group-hover:scale-110">
                    <ShieldCheck className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <h5 className="font-black text-[#0F172A] text-lg group-hover:text-blue-600 transition-colors">{o.name}</h5>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{o.position}</p>
                {o.streets && o.streets.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded-lg w-fit">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{o.streets.length} Streets</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOfficialForDetails(o);
                      }}
                      className="w-full py-2 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,0.1)] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-3 h-3" /> Handled Streets
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* Support Staff */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Administrative Staff</h4>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {otherStaff.map((o) => (
            <div key={o.id} className="flex items-center gap-5 p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-600 transition-all group shadow-sm hover:shadow-xl hover:shadow-blue-900/5 relative">
              {role === 'official' && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(o)}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => {
                      showConfirm(`Are you sure you want to delete ${o.name}'s record?`, () => {
                        onDelete(o.id);
                      });
                    }}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div 
                onClick={() => setSelectedOfficialForDetails(o)}
                className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex-shrink-0 relative group/img cursor-pointer"
              >
                <img 
                  src={o.photo} 
                  alt={o.name} 
                  className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[#0F172A]/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMessage(o);
                    }} 
                    className="p-1.5 bg-white/20 rounded-lg hover:bg-white/40"
                  >
                    <Mail className="w-3 h-3 text-white" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCall(o);
                    }} 
                    className="p-1.5 bg-white/20 rounded-lg hover:bg-white/40"
                  >
                    <Phone className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
              <div>
                <h5 className="font-black text-[#0F172A] group-hover:text-blue-600 transition-colors">{o.name}</h5>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{o.position}</p>
                {o.streets && o.streets.length > 0 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOfficialForDetails(o);
                    }}
                    className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <MapPin className="w-3 h-3" /> Handled Streets
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Details Modal */}
      <AnimatePresence>
        {selectedOfficialForDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden border-4 border-[#141414]"
            >
              <button 
                onClick={() => setSelectedOfficialForDetails(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
              
              <div className="flex flex-col items-center text-center mb-6 relative">
                <div className="absolute -top-4 -left-4 w-20 h-20 opacity-10 pointer-events-none">
                  <img src={BARANGAY_LOGO} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] mb-4">
                  <img 
                    src={selectedOfficialForDetails.photo} 
                    alt={selectedOfficialForDetails.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-2xl font-black text-[#0F172A]">{selectedOfficialForDetails.name}</h3>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{selectedOfficialForDetails.position}</p>
                <div className="mt-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Barangay Pahinga Norte Official
                </div>
              </div>

              {selectedOfficialForDetails.streets && selectedOfficialForDetails.streets.length > 0 && (
                <div className="bg-blue-50/50 rounded-3xl p-6 border-2 border-blue-100 relative overflow-hidden group/streets">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-full -mr-12 -mt-12 transition-transform group-hover/streets:scale-110" />
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 relative z-10">
                    <MapPin className="w-4 h-4" /> Jurisdictional Streets
                  </h4>
                  <ul className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                    {selectedOfficialForDetails.streets.map((street, idx) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="text-sm font-bold text-slate-700 flex items-start gap-3 group/item"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0 group-hover/item:scale-125 transition-transform shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="leading-tight">{street}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6 flex gap-3 justify-center">
                <button 
                  onClick={() => {
                    onMessage(selectedOfficialForDetails);
                    setSelectedOfficialForDetails(null);
                  }}
                  className="flex-1 py-3 bg-[#141414] text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Message
                </button>
                {selectedOfficialForDetails.phone && (
                  <button 
                    onClick={() => {
                      onCall(selectedOfficialForDetails);
                      setSelectedOfficialForDetails(null);
                    }}
                    className="flex-1 py-3 bg-white border-2 border-[#141414] text-[#141414] rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-y-1 active:shadow-none"
                  >
                    <Phone className="w-4 h-4" /> Call
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectsModule({ 
  role, 
  projects, 
  onAddProject, 
  onUpdateStatus, 
  onApproveProject,
  onVote, 
  onDeleteProject,
  onBack,
  authName,
  showConfirm,
  showAlert
}: { 
  role: UserRole, 
  projects: Project[], 
  onAddProject: (title: string, desc: string, purok: string, specificLocation: string) => void, 
  onUpdateStatus: (id: string, status: Project['status'], extra?: Partial<Project>) => void, 
  onApproveProject: (id: string, residentId: string, residentName: string) => void,
  onVote: (id: string) => void, 
  onDeleteProject: (id: string) => void,
  onBack: () => void,
  authName: string,
  showConfirm: (msg: string, onConfirm: () => void) => void,
  showAlert: (msg: string) => void
}) {
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestData, setSuggestData] = useState({ title: '', desc: '', purok: '', specificLocation: '' });
  const [declineItemId, setDeclineItemId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [customDeclineReason, setCustomDeclineReason] = useState('');

  const purokOptions = STREET_OPTIONS;

  const declineOptions = [
    'Not feasible at this time',
    'Insufficient community interest',
    'Budget constraints',
    'Duplicate suggestion',
    'Others'
  ];

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestData.title && suggestData.desc && suggestData.purok && suggestData.specificLocation) {
      onAddProject(suggestData.title, suggestData.desc, suggestData.purok, suggestData.specificLocation);
      setShowSuggestForm(false);
      setSuggestData({ title: '', desc: '', purok: '', specificLocation: '' });
      showAlert('Project suggestion submitted! It will be visible to the community once approved by a Barangay Official.');
    }
  };

  const handleDecline = (id: string) => {
    setDeclineItemId(id);
    setDeclineReason(declineOptions[0]);
    setCustomDeclineReason('');
  };

  const handleConfirmDecline = () => {
    if (declineItemId) {
      const finalReason = declineReason === 'Others' ? customDeclineReason : declineReason;
      if (declineReason === 'Others' && !customDeclineReason.trim()) {
        showAlert('Please specify the reason.');
        return;
      }
      onUpdateStatus(declineItemId, 'declined', { declineReason: finalReason } as any);
      setDeclineItemId(null);
      setDeclineReason('');
      setCustomDeclineReason('');
      showAlert('Project suggestion declined with reason.');
    }
  };

  const visibleProjects = role === 'official' 
    ? projects 
    : projects.filter(p => p.status === 'approved');

  const pendingProjects = role === 'official' 
    ? projects.filter(p => p.status === 'pending')
    : projects.filter(p => p.status === 'pending' && p.suggestedBy === authName);

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold uppercase opacity-50 hover:opacity-100"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h3 className="text-3xl font-bold">{role === 'official' ? 'Project Suggestions' : 'Community Projects'}</h3>
          <p className="text-[#141414]/60">Suggest and vote on initiatives for a better barangay.</p>
        </div>
        {role === 'resident' && (
          <button 
            onClick={() => setShowSuggestForm(true)}
            className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" /> Suggest Project
          </button>
        )}
      </div>

      {pendingProjects.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold uppercase flex items-center gap-2 text-amber-600">
            <Clock className="w-5 h-5" /> {role === 'official' ? 'Pending Approvals' : 'Your Pending Suggestions'} ({pendingProjects.length})
          </h4>
          <div className="grid gap-4">
            {pendingProjects.map((p) => (
              <div key={p.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h4 className="text-xl font-bold mb-1">{p.title}</h4>
                  <p className="text-sm opacity-60 mb-2">
                    Suggested by {p.suggestedBy} on {p.date}
                    {p.purok && p.specificLocation && ` • ${p.purok} - ${p.specificLocation}`}
                  </p>
                  <p className="text-[#141414]/80">{p.desc}</p>
                </div>
                {role === 'official' ? (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onApproveProject(p.id, p.suggestedByUid || '', p.suggestedBy)}
                      className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                      title="Approve"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDecline(p.id)}
                      className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
                      title="Decline"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {declineItemId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-4 border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-md"
            >
              <h4 className="text-xl font-black uppercase mb-4">Decline Reason</h4>
              <p className="text-xs font-bold text-[#141414]/60 uppercase mb-6">Please state why you are declining this project suggestion.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">Select Reason</label>
                  <select 
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 font-black uppercase tracking-widest outline-none"
                  >
                    {declineOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {declineReason === 'Others' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <label className="block text-[10px] font-black uppercase mb-1 tracking-widest">Specify Reason</label>
                    <textarea 
                      required
                      value={customDeclineReason}
                      onChange={(e) => setCustomDeclineReason(e.target.value)}
                      className="w-full p-3 border-2 border-[#141414] rounded-lg bg-[#E4E3E0]/20 focus:bg-white outline-none transition-all font-bold min-h-[100px]" 
                      placeholder="Type your reason here..." 
                    />
                  </motion.div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setDeclineItemId(null)}
                    className="flex-1 p-4 border-2 border-[#141414] rounded-xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmDecline}
                    className="flex-1 bg-rose-500 text-white p-4 border-2 border-[#141414] rounded-xl font-black uppercase tracking-widest hover:bg-rose-600 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:scale-95 transition-all"
                  >
                    Confirm Decline
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showSuggestForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-[#141414] p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold uppercase">Suggest a New Project</h4>
              <button onClick={() => setShowSuggestForm(false)}><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSuggestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Project Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={suggestData.title}
                  onChange={(e) => setSuggestData({...suggestData, title: e.target.value})}
                  className="w-full p-3 border border-[#141414] rounded-lg bg-[#E4E3E0]/20" 
                  placeholder="e.g. New Basketball Court"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Street/Purok <span className="text-rose-500">*</span></label>
                  <SearchableSelect
                    options={purokOptions}
                    value={suggestData.purok}
                    onChange={(val) => setSuggestData({...suggestData, purok: val})}
                    placeholder="Select Street/Purok"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Specific Location <span className="text-rose-500">*</span></label>
                  <textarea 
                    required
                    value={suggestData.specificLocation}
                    onChange={(e) => setSuggestData({...suggestData, specificLocation: e.target.value})}
                    className="w-full p-3 border border-[#141414] rounded-lg bg-[#E4E3E0]/20 min-h-[80px] resize-none" 
                    placeholder="Type the specific location here..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Description <span className="text-rose-500">*</span></label>
                <textarea 
                  required
                  value={suggestData.desc}
                  onChange={(e) => setSuggestData({...suggestData, desc: e.target.value})}
                  className="w-full p-3 border border-[#141414] rounded-lg bg-[#E4E3E0]/20 min-h-[100px]" 
                  placeholder="Describe the project and how it benefits the community..."
                />
              </div>
              <button type="submit" className="w-full bg-[#141414] text-white p-4 rounded-xl font-bold hover:opacity-90 transition-opacity">
                Submit Suggestion
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        <h4 className="text-xl font-bold uppercase opacity-50">Community Ideas</h4>
        {visibleProjects.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#141414] rounded-2xl">
            <p className="opacity-40 font-bold">No approved projects yet.</p>
          </div>
        ) : (
          visibleProjects.map((p) => (
            <div key={p.id} className="bg-white border border-[#141414] rounded-2xl p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold">{p.title}</h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border border-[#141414] rounded-full ${p.status === 'approved' ? 'bg-emerald-100' : p.status === 'declined' ? 'bg-rose-100' : 'bg-amber-100'}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-sm opacity-60 mb-2">
                  Suggested by {p.suggestedBy} on {p.date}
                  {p.purok && p.specificLocation && ` • ${p.purok} - ${p.specificLocation}`}
                </p>
                <p className="text-[#141414]/60">{p.desc}</p>
                {p.status === 'declined' && p.declineReason && (
                  <p className="mt-2 text-xs font-bold text-rose-600 uppercase">Reason: {p.declineReason}</p>
                )}
              </div>
              <div className="text-center border-l border-[#141414] pl-8">
                <p className="text-2xl font-bold font-mono">{p.votes}</p>
                <p className="text-[10px] font-bold uppercase opacity-40">Votes</p>
                {p.status === 'approved' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => onVote(p.id)}
                      className="text-xs font-bold underline hover:no-underline"
                    >
                      Vote Up
                    </button>
                    {role === 'official' && (
                      <button 
                        onClick={() => {
                          showConfirm('Are you sure you want to delete this project suggestion?', () => {
                            onDeleteProject(p.id);
                          });
                        }}
                        className="text-rose-500 hover:text-rose-700"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AnnouncementsModule({ 
  role, 
  announcements, 
  onAdd, 
  onDelete, 
  onBack,
  showConfirm,
  t
}: { 
  role: UserRole, 
  announcements: Announcement[], 
  onAdd: (data: Omit<Announcement, 'id'>) => void, 
  onDelete: (id: string) => void, 
  onBack: () => void,
  showConfirm: (msg: string, onConfirm: () => void) => void,
  t: (key: string) => string
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'event' as Announcement['type'],
    color: 'bg-blue-500'
  });

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Previous month days
  for (let i = 0; i < startDay; i++) {
    days.push({ day: null, current: false });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    days.push({ day: i, current: true });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1));

  const getAnnouncementsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return announcements.filter(a => a.date === dateStr);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      onAdd({
        ...formData,
        date: selectedDate
      });
      setShowAddForm(false);
      setFormData({ title: '', content: '', type: 'event', color: 'bg-blue-500' });
    }
  };

  const colors = [
    { name: 'Meetings & Assemblies', value: 'bg-blue-500' },
    { name: 'Health & Wellness', value: 'bg-emerald-500' },
    { name: 'Infrastructure & Maintenance', value: 'bg-amber-500' },
    { name: 'Urgent Notices', value: 'bg-rose-500' },
    { name: 'Social & Cultural', value: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold uppercase opacity-50 hover:opacity-100"
      >
        <ArrowLeft className="w-4 h-4" /> {t('Back to Dashboard')}
      </button>
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h3 className="text-3xl font-bold">{t('Barangay Calendar')}</h3>
          <p className="text-[#141414]/60">{t('1-Year Plan and Community Events.')}</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-[#141414] rounded-xl p-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-[#E4E3E0] rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold uppercase min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-[#E4E3E0] rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white border-4 border-[#141414] rounded-2xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 border-b-4 border-[#141414] bg-[#141414] text-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="p-4 text-center text-[10px] font-black uppercase tracking-widest opacity-60">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
          {days.map((d, i) => {
            const dayAnnouncements = d.day ? getAnnouncementsForDay(d.day) : [];
            const dateStr = d.day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` : null;
            
            return (
              <div 
                key={i} 
                className={`min-h-[140px] border-r-2 border-b-2 border-[#141414] p-2 transition-colors ${!d.current ? 'bg-[#E4E3E0]/30' : 'bg-white'} ${role === 'official' && d.day ? 'cursor-pointer hover:bg-[#E4E3E0]/10' : ''}`}
                onClick={() => {
                  if (role === 'official' && d.day && dateStr) {
                    setSelectedDate(dateStr);
                    setShowAddForm(true);
                  }
                }}
              >
                {d.day && (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-black ${new Date().toDateString() === new Date(year, month, d.day).toDateString() ? 'bg-[#141414] text-white w-7 h-7 flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]' : 'text-[#141414]/40'}`}>
                        {d.day}
                      </span>
                      {role === 'official' && (
                        <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#141414]" />
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayAnnouncements.map(a => (
                        <div 
                          key={a.id} 
                          className={`${a.color || 'bg-blue-500'} text-white text-[10px] p-1.5 rounded border border-[#141414] font-black uppercase leading-tight truncate relative group/item shadow-[1px_1px_0px_0px_rgba(0,0,0,0.2)]`}
                          title={a.title}
                        >
                          {a.title}
                          {role === 'official' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                showConfirm(t('Are you sure you want to delete this event?'), () => {
                                  onDelete(a.id);
                                });
                              }}
                              className="absolute top-0 right-0 p-1 opacity-0 group-item-hover:opacity-100 hover:text-rose-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-[#141414]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#141414] p-8 rounded-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold uppercase">{t('Add Event for')} {selectedDate}</h4>
                <button onClick={() => setShowAddForm(false)}><XCircle className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">{t('Event Title')} <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 border border-[#141414] rounded-lg bg-[#E4E3E0]/20" 
                    placeholder={t('e.g. Community Meeting')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">{t('Description')} <span className="text-rose-500">*</span></label>
                  <textarea 
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full p-3 border border-[#141414] rounded-lg bg-[#E4E3E0]/20 min-h-[100px]" 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">{t('Type')}</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full p-3 border border-[#141414] rounded-lg bg-[#E4E3E0]/20 font-bold"
                    >
                      <option value="event">{t('Event')}</option>
                      <option value="notice">{t('Notice')}</option>
                      <option value="update">{t('Update')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">{t('Color Theme')}</label>
                    <div className="flex gap-2 p-2 border border-[#141414] rounded-lg bg-[#E4E3E0]/20">
                      {colors.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setFormData({...formData, color: c.value})}
                          className={`w-6 h-6 rounded-full border border-[#141414] transition-transform ${c.value} ${formData.color === c.value ? 'scale-125 ring-2 ring-offset-2 ring-[#141414]' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#141414] text-white p-4 rounded-xl font-bold hover:opacity-90 transition-opacity">
                  {t('Add to Calendar')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-xl font-bold uppercase flex items-center gap-2">
            <Megaphone className="w-5 h-5" /> {t('Upcoming This Month')}
          </h4>
          <div className="space-y-4">
            {announcements
              .filter(a => {
                const aDate = new Date(a.date);
                return aDate.getMonth() === month && aDate.getFullYear() === year;
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(a => (
                <div key={a.id} className="bg-white border border-[#141414] p-6 rounded-2xl flex gap-6 items-start">
                  <div className={`w-14 h-14 ${a.color || 'bg-blue-500'} border border-[#141414] rounded-xl flex flex-col items-center justify-center text-white shrink-0`}>
                    <span className="text-xs font-bold uppercase">
                      {t(['Jan', 'Feb', 'Mar', 'Apr', 'May_Short', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][new Date(a.date).getMonth()])}
                    </span>
                    <span className="text-xl font-bold leading-none">{new Date(a.date).getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className="text-xl font-bold mb-1">{a.title}</h5>
                      {role === 'official' && (
                        <button 
                          onClick={() => {
                            showConfirm(t('Are you sure you want to delete this announcement?'), () => {
                              onDelete(a.id);
                            });
                          }} 
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[#141414]/60">{a.content}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xl font-bold uppercase">{t('Legend')}</h4>
          <div className="bg-white border border-[#141414] p-6 rounded-2xl space-y-3">
            {colors.map(c => (
              <div key={c.value} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${c.value} border border-[#141414]`} />
                <span className="text-sm font-bold uppercase opacity-60">{t(c.name)}</span>
              </div>
            ))}
          </div>
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg shadow-slate-900/20">
            <h5 className="font-bold mb-2 uppercase text-[10px] tracking-widest opacity-50">{t('Admin Note')}</h5>
            <p className="text-sm italic text-slate-300">"{t('Planning today for a better community tomorrow. All events are subject to change based on barangay council decisions.')}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}
