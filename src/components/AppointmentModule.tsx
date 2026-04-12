import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit2, 
  Info,
  Filter,
  User,
  ArrowLeft,
  Search,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, BarangayService, OfficialAvailability, UserRole, Official } from '../types';

interface AppointmentModuleProps {
  appointments: Appointment[];
  services: BarangayService[];
  availabilities: OfficialAvailability[];
  role: UserRole;
  onAdd: (app: any) => void;
  onUpdateStatus: (id: string, status: Appointment['status'], reason?: string) => void;
  onApproveAppointment: (id: string, residentId: string, residentName: string) => void;
  onReschedule: (id: string, date: string, slot: string) => void;
  onCancel: (id: string) => void;
  onDeleteAppointment: (id: string) => void;
  officials: Official[];
  onAddService: (service: any) => void;
  onDeleteService: (id: string) => void;
  onUpdateAvailability: (avail: any) => void;
  onDeleteAvailability: (id: string) => void;
  onBackToDashboard: () => void;
  showConfirm: (msg: string, onConfirm: () => void) => void;
  t: (key: string) => string;
}

export default function AppointmentModule({ 
  appointments, 
  services, 
  availabilities, 
  role, 
  onAdd, 
  onUpdateStatus, 
  onApproveAppointment,
  onReschedule, 
  onCancel,
  onDeleteAppointment,
  officials,
  onAddService,
  onDeleteService,
  onUpdateAvailability,
  onDeleteAvailability,
  onBackToDashboard,
  showConfirm,
  t
}: AppointmentModuleProps) {
  const [view, setView] = useState<'list' | 'create' | 'manage_services' | 'manage_availability'>('list');
  const [selectedService, setSelectedService] = useState<BarangayService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [additionalDescription, setAdditionalDescription] = useState<string>('');
  const [filterService, setFilterService] = useState<string>('all');
  const [activeStatusTab, setActiveStatusTab] = useState<'pending' | 'approved' | 'completed' | 'declined' | 'cancelled'>('pending');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_az' | 'name_za'>('date_desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [declineAppId, setDeclineAppId] = useState<string | null>(null);
  const [declineReasonInput, setDeclineReasonInput] = useState('');

  const [rescheduleApp, setRescheduleApp] = useState<Appointment | null>(null);
  const [rescheduleDateInput, setRescheduleDateInput] = useState('');
  const [rescheduleSlotInput, setRescheduleSlotInput] = useState('');

  const timeSlots = [
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM"
  ];

  const [currentTime, setCurrentTime] = useState(new Date());

  const uniqueServices = useMemo(() => {
    const seen = new Set();
    return services.filter(s => {
      const duplicate = seen.has(s.name);
      seen.add(s.name);
      return !duplicate;
    });
  }, [services]);

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(app => {
      const matchesService = filterService === 'all' || app.serviceName === filterService;
      const matchesStatus = app.status === activeStatusTab;
      const matchesSearch = app.residentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           app.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesService && matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'name_az': return a.serviceName.localeCompare(b.serviceName);
        case 'name_za': return b.serviceName.localeCompare(a.serviceName);
        default: return 0;
      }
    });
  }, [appointments, filterService, activeStatusTab, searchQuery, sortBy]);

  const getSlotAvailability = (date: string, slot: string) => {
    const dayOfWeek = new Date(date).getDay();
    const dayAvailabilities = availabilities.filter(a => a.dayOfWeek === dayOfWeek);
    
    // If no specific availability set, assume default 5 slots
    const maxSlots = dayAvailabilities.length > 0 ? Math.max(...dayAvailabilities.map(a => a.maxSlotsPerTimeSlot)) : 5;
    const takenSlots = appointments.filter(a => a.date === date && a.timeSlot === slot && a.status !== 'cancelled' && a.status !== 'declined').length;
    
    return {
      available: takenSlots < maxSlots,
      remaining: maxSlots - takenSlots,
      total: maxSlots
    };
  };

  const handleCreateAppointment = () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    
    onAdd({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: selectedDate,
      timeSlot: selectedSlot,
      additionalDescription,
      officialId: selectedService.assignedOfficialId || '',
      officialName: officials.find(o => o.id === selectedService.assignedOfficialId)?.name || ''
    });
    
    setView('list');
    setSelectedService(null);
    setSelectedDate('');
    setSelectedSlot('');
    setAdditionalDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#141414] uppercase tracking-tight flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            {t('Appointment System')}
          </h2>
          <p className="text-slate-500 font-medium">{t('Schedule your visit to the barangay hall')}</p>
        </div>
        
          <div className="flex gap-2">
            <button 
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-white border-2 border-[#141414] rounded-xl font-bold hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('Back to Dashboard')}
            </button>
            {role === 'official' && (
            <>
              <button 
                onClick={() => setView('manage_services')}
                className="px-4 py-2 bg-white border-2 border-[#141414] rounded-xl font-bold hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {t('Services')}
              </button>
              <button 
                onClick={() => setView('manage_availability')}
                className="px-4 py-2 bg-white border-2 border-[#141414] rounded-xl font-bold hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                {t('Availability')}
              </button>
            </>
          )}
          {view === 'list' ? (
            role === 'resident' && (
              <button 
                onClick={() => setView('create')}
                className="px-6 py-2 bg-blue-600 text-white border-2 border-[#141414] rounded-xl font-bold hover:bg-blue-700 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('Set Appointment')}
              </button>
            )
          ) : (
            <button 
              onClick={() => setView('list')}
              className="px-4 py-2 bg-white border-2 border-[#141414] rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('Back to List')}
            </button>
          )}
        </div>
      </div>

      {view === 'list' && (
        <div className="space-y-6">
          {/* Filters & Sorting */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder={t('Search appointments...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#141414] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white border-2 border-[#141414] rounded-xl px-3 py-2 shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="text-[10px] font-black uppercase tracking-widest outline-none bg-transparent"
                >
                  <option value="all">{t('All Services')}</option>
                  {uniqueServices.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

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
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 border-b-4 border-[#141414] pb-2">
            {[
              { id: 'pending', label: t('Pending'), icon: <Clock className="w-4 h-4" /> },
              { id: 'approved', label: t('Approved'), icon: <CheckCircle2 className="w-4 h-4" /> },
              { id: 'completed', label: t('Completed'), icon: <CheckCircle2 className="w-4 h-4" /> },
              { id: 'declined', label: t('Declined'), icon: <XCircle className="w-4 h-4" /> },
              {id: 'cancelled', label: t('Cancelled'), icon: <AlertCircle className="w-4 h-4" /> }
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

          {/* Appointments List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((app) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={app.id}
                  className="bg-white border-2 border-[#141414] rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 border-[#141414] shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] ${
                        app.status === 'approved' ? 'bg-green-100' : 
                        app.status === 'pending' ? 'bg-amber-100' : 
                        app.status === 'declined' ? 'bg-red-100' : 'bg-slate-100'
                      }`}>
                        <FileText className={`w-7 h-7 ${
                          app.status === 'approved' ? 'text-green-600' : 
                          app.status === 'pending' ? 'text-amber-600' : 
                          app.status === 'declined' ? 'text-red-600' : 'text-slate-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#141414] uppercase tracking-tight">{app.serviceName}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {t(new Date(app.date).toLocaleDateString('en-US', { month: 'long' }))} {new Date(app.date).getDate()}, {new Date(app.date).getFullYear()}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                            <Clock className="w-4 h-4" />
                            {app.timeSlot}
                          </span>
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600">
                            <User className="w-4 h-4" />
                            {role === 'official' ? app.residentName : `${t('Official')}: ${app.officialName || t('TBD')}`}
                          </span>
                        </div>
                        {app.additionalDescription && (
                          <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('Additional Details')}:</p>
                            <p className="text-sm text-slate-700 italic">"{app.additionalDescription}"</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 border-[#141414] shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] ${
                        app.status === 'approved' ? 'bg-green-500 text-white' : 
                        app.status === 'pending' ? 'bg-amber-400 text-[#141414]' : 
                        app.status === 'declined' ? 'bg-red-500 text-white' : 
                        app.status === 'completed' ? 'bg-blue-500 text-white' : 'bg-slate-400 text-white'
                      }`}>
                        {t(app.status.charAt(0).toUpperCase() + app.status.slice(1))}
                      </span>

                      <div className="flex gap-2">
                        {role === 'official' && app.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => onApproveAppointment(app.id, app.residentId, app.residentName)}
                              className="p-2 bg-green-500 text-white border-2 border-[#141414] rounded-lg hover:bg-green-600 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]"
                              title={t('Approve')}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                setDeclineAppId(app.id);
                                setDeclineReasonInput('');
                              }}
                              className="p-2 bg-red-500 text-white border-2 border-[#141414] rounded-lg hover:bg-red-600 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]"
                              title={t('Decline')}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {role === 'official' && app.status === 'approved' && (
                          <button 
                            onClick={() => onUpdateStatus(app.id, 'completed')}
                            className="px-4 py-2 bg-blue-500 text-white border-2 border-[#141414] rounded-lg font-bold hover:bg-blue-600 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]"
                          >
                            {t('Mark Completed')}
                          </button>
                        )}
                        {role === 'resident' && (app.status === 'pending' || app.status === 'approved') && (
                          <>
                            <button 
                              onClick={() => {
                                setRescheduleApp(app);
                                setRescheduleDateInput(app.date);
                                setRescheduleSlotInput(app.timeSlot);
                              }}
                              className="px-4 py-2 bg-white border-2 border-[#141414] rounded-lg font-bold hover:bg-slate-50 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]"
                            >
                              {t('Reschedule')}
                            </button>
                            <button 
                              onClick={() => onCancel(app.id)}
                              className="px-4 py-2 bg-red-50 text-red-600 border-2 border-red-600 rounded-lg font-bold hover:bg-red-100 transition-all"
                            >
                              {t('Cancel')}
                            </button>
                          </>
                        )}
                        {role === 'official' && (
                          <button 
                            onClick={() => {
                              showConfirm(t('Are you sure you want to delete this appointment record?'), () => {
                                onDeleteAppointment(app.id);
                              });
                            }}
                            className="p-2 bg-red-50 text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-100 transition-all"
                            title={t('Delete Record')}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {app.declineReason && (
                    <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <p className="text-sm font-bold text-red-700">{t('Decline Reason:')} <span className="font-medium">{app.declineReason}</span></p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white border-2 border-dashed border-slate-300 rounded-3xl">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">{t('No appointments found')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'create' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-[#141414] rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-black text-[#141414] uppercase tracking-tight mb-6">{t('Schedule New Appointment')}</h3>
          
          <div className="space-y-6">
            {/* Step 1: Select Service */}
            <div>
              <label className="block text-sm font-black text-[#141414] uppercase tracking-widest mb-2">{t('Select Service')}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uniqueServices.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className={`p-4 text-left border-2 rounded-xl transition-all ${
                      selectedService?.id === s.id 
                        ? 'border-blue-600 bg-blue-50 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]' 
                        : 'border-[#141414] hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-black text-[#141414] uppercase tracking-tight">{s.name}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedService && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50 border-2 border-[#141414] rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-[#141414] uppercase tracking-tight">{t('Requirements:')}</p>
                    <ul className="mt-2 space-y-1">
                      {selectedService.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm font-medium text-slate-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Select Date */}
            <div>
              <label className="block text-sm font-black text-[#141414] uppercase tracking-widest mb-2">{t('Preferred Date')}</label>
              <input 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 bg-white border-2 border-[#141414] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              />
            </div>

            {/* Step 3: Select Time Slot */}
            {selectedDate && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-sm font-black text-[#141414] uppercase tracking-widest mb-2">{t('Available Time Slots')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {timeSlots.map(slot => {
                    const availability = getSlotAvailability(selectedDate, slot);
                    return (
                      <button 
                        key={slot}
                        disabled={!availability.available}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 text-left border-2 rounded-xl transition-all flex justify-between items-center ${
                          selectedSlot === slot 
                            ? 'border-blue-600 bg-blue-50 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]' 
                            : availability.available 
                              ? 'border-[#141414] hover:bg-slate-50' 
                              : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-[#141414]">{slot}</p>
                          <p className={`text-xs font-bold ${availability.remaining < 2 ? 'text-red-500' : 'text-green-600'}`}>
                            {availability.remaining} {t('slots left')}
                          </p>
                        </div>
                        {selectedSlot === slot && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4: Additional Description */}
            {selectedSlot && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="block text-sm font-black text-[#141414] uppercase tracking-widest mb-2">{t('Additional Description')}</label>
                <textarea 
                  value={additionalDescription}
                  onChange={(e) => setAdditionalDescription(e.target.value)}
                  placeholder={t('Add any extra details or specific concerns...')}
                  className="w-full p-4 bg-white border-2 border-[#141414] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium h-32 resize-none"
                />
              </motion.div>
            )}

            <button 
              onClick={handleCreateAppointment}
              disabled={!selectedService || !selectedDate || !selectedSlot}
              className="w-full py-4 bg-blue-600 text-white border-2 border-[#141414] rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {t('Confirm Appointment')}
            </button>
          </div>
        </motion.div>
      )}

      {view === 'manage_services' && (
        <div className="bg-white border-2 border-[#141414] rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-[#141414] uppercase tracking-tight">{t('Manage Barangay Services')}</h3>
            <button 
              onClick={() => {
                const name = prompt(t('Service Name:'));
                const desc = prompt(t('Description:'));
                const reqs = prompt(t('Requirements (comma separated):'))?.split(',').map(r => r.trim());
                if (name && desc && reqs) {
                  onAddService({ name, description: desc, requirements: reqs, estimatedProcessingTime: '15-30 mins' });
                }
              }}
              className="p-2 bg-blue-600 text-white border-2 border-[#141414] rounded-xl hover:bg-blue-700 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uniqueServices.map(s => (
              <div key={s.id} className="p-4 border-2 border-[#141414] rounded-2xl flex justify-between items-start">
                <div>
                  <h4 className="font-black text-[#141414] uppercase tracking-tight">{s.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{s.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.requirements.map((r, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold rounded-md border border-slate-200">{r}</span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteService(s.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'manage_availability' && (
        <div className="bg-white border-2 border-[#141414] rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-[#141414] uppercase tracking-tight">{t('Official Availability')}</h3>
            <button 
              onClick={() => {
                const day = parseInt(prompt(t('Day of Week (0-6):')) || '0');
                const start = prompt(t('Start Time (HH:mm):'), '08:00');
                const end = prompt(t('End Time (HH:mm):'), '17:00');
                const max = parseInt(prompt(t('Max Slots per hour:'), '5') || '5');
                if (!isNaN(day) && start && end) {
                  onUpdateAvailability({ dayOfWeek: day, startTime: start, endTime: end, maxSlotsPerTimeSlot: max });
                }
              }}
              className="p-2 bg-blue-600 text-white border-2 border-[#141414] rounded-xl hover:bg-blue-700 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {availabilities.map(a => (
              <div key={a.id} className="p-4 border-2 border-[#141414] rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center font-black text-blue-600">
                    {[t('S'), t('M'), t('T'), t('W'), t('T_Short'), t('F'), t('S_Short')][a.dayOfWeek]}
                  </div>
                  <div>
                    <p className="font-black text-[#141414] uppercase tracking-tight">
                      {[t('Sunday'), t('Monday'), t('Tuesday'), t('Wednesday'), t('Thursday'), t('Friday'), t('Saturday')][a.dayOfWeek]}
                    </p>
                    <p className="text-sm font-bold text-slate-500">{a.startTime} - {a.endTime} • {a.maxSlotsPerTimeSlot} slots/hr</p>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteAvailability(a.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {declineAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-4 border-[#141414] rounded-2xl p-6 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-red-600">{t('Decline Appointment')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{t('Reason for Declining')}</label>
                <textarea
                  value={declineReasonInput}
                  onChange={(e) => setDeclineReasonInput(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-[#141414] rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium h-32 resize-none"
                  placeholder={t('Please provide a reason...')}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setDeclineAppId(null)}
                  className="flex-1 px-4 py-3 bg-white border-2 border-[#141414] rounded-xl font-bold hover:bg-slate-50 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={() => {
                    if (declineReasonInput.trim()) {
                      onUpdateStatus(declineAppId, 'declined', declineReasonInput.trim());
                      setDeclineAppId(null);
                    }
                  }}
                  disabled={!declineReasonInput.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white border-2 border-[#141414] rounded-xl font-bold hover:bg-red-700 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('Decline')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-4 border-[#141414] rounded-2xl p-6 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-blue-600">{t('Reschedule Appointment')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{t('New Date')}</label>
                <input
                  type="date"
                  value={rescheduleDateInput}
                  onChange={(e) => setRescheduleDateInput(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-white border-2 border-[#141414] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{t('New Time Slot')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {timeSlots.map(slot => {
                    const availability = rescheduleDateInput ? getSlotAvailability(rescheduleDateInput, slot) : null;
                    const isAvailable = availability?.available;
                    
                    return (
                      <button
                        key={slot}
                        onClick={() => setRescheduleSlotInput(slot)}
                        disabled={!isAvailable}
                        className={`p-2 rounded-xl border-2 text-sm font-bold transition-all ${
                          rescheduleSlotInput === slot 
                            ? 'bg-blue-600 text-white border-[#141414] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]' 
                            : !isAvailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-white text-[#141414] border-[#141414] hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                        }`}
                      >
                        {slot}
                        {availability && (
                          <span className="block text-[10px] opacity-80 font-medium mt-1">
                            {availability.remaining} {t('slots left')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setRescheduleApp(null)}
                  className="flex-1 px-4 py-3 bg-white border-2 border-[#141414] rounded-xl font-bold hover:bg-slate-50 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  {t('Cancel')}
                </button>
                <button
                  onClick={() => {
                    if (rescheduleDateInput && rescheduleSlotInput) {
                      onReschedule(rescheduleApp.id, rescheduleDateInput, rescheduleSlotInput);
                      setRescheduleApp(null);
                    }
                  }}
                  disabled={!rescheduleDateInput || !rescheduleSlotInput}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white border-2 border-[#141414] rounded-xl font-bold hover:bg-blue-700 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('Reschedule')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
