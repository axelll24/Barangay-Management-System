import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Info, 
  Clock, 
  ArrowLeft,
  CheckCircle2,
  X,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarangayService, UserRole } from '../types';

interface BarangayServiceModuleProps {
  role: UserRole;
  services: BarangayService[];
  onAdd: (service: Omit<BarangayService, 'id'>) => void;
  onUpdate: (id: string, service: Partial<BarangayService>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  showConfirm: (msg: string, onConfirm: () => void) => void;
  t: (key: string) => string;
}

export default function BarangayServiceModule({ 
  role, 
  services, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onBack,
  showConfirm,
  t 
}: BarangayServiceModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<BarangayService | null>(null);
  const [formData, setFormData] = useState<Omit<BarangayService, 'id'>>({
    name: '',
    description: '',
    requirements: [],
    estimatedProcessingTime: '15-30 mins'
  });
  const [newRequirement, setNewRequirement] = useState('');

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      onUpdate(editingService.id, formData);
    } else {
      onAdd(formData);
    }
    setShowForm(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      requirements: [],
      estimatedProcessingTime: '15-30 mins'
    });
  };

  const handleEdit = (service: BarangayService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      requirements: service.requirements,
      estimatedProcessingTime: service.estimatedProcessingTime
    });
    setShowForm(true);
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-[#141414] pb-6">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#141414] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Dashboard')}
          </button>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
            {t('Barangay Services')}
          </h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">
            {t('Official Guide to Community Services & Requirements')}
          </p>
        </div>
        {role === 'official' && (
          <button 
            onClick={() => {
              setEditingService(null);
              setFormData({
                name: '',
                description: '',
                requirements: [],
                estimatedProcessingTime: '15-30 mins'
              });
              setShowForm(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-blue-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('Add Service')}
          </button>
        )}
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder={t('Search for services, requirements, or documents...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#141414] rounded-2xl font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
        <div className="bg-[#141414] text-white p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('Total Services')}</p>
            <p className="text-2xl font-black">{services.length}</p>
          </div>
          <FileText className="w-8 h-8 text-blue-400 opacity-50" />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service, idx) => (
          <motion.div 
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group bg-white border-4 border-[#141414] rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] transition-all flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 border-2 border-[#141414] rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(20,20,20,1)] group-hover:bg-blue-100 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              {role === 'official' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      showConfirm(t('Are you sure you want to delete this service?'), () => {
                        onDelete(service.id);
                      });
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-xl font-black uppercase tracking-tight mb-2">{service.name}</h3>
            <p className="text-sm text-slate-500 font-medium mb-6 flex-1">{service.description}</p>

            <div className="space-y-4 pt-4 border-t-2 border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('Requirements')}</p>
                <div className="flex flex-wrap gap-2">
                  {service.requirements.map((req, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{service.estimatedProcessingTime}</span>
                </div>
                <button 
                  className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:translate-x-1 transition-transform"
                >
                  {t('Details')} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-20 bg-white border-4 border-dashed border-slate-200 rounded-[3rem]">
          <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest">{t('No services found matching your search')}</p>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white border-4 border-[#141414] rounded-[2.5rem] shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] overflow-hidden"
            >
              <div className="p-8 border-b-4 border-[#141414] bg-blue-50 flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  {editingService ? t('Edit Service') : t('Add New Service')}
                </h3>
                <button 
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('Service Name')}</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-blue-600 outline-none transition-all"
                    placeholder="e.g. Barangay Clearance"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('Description')}</label>
                  <textarea 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-blue-600 outline-none transition-all h-24 resize-none"
                    placeholder="Briefly describe the service..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('Estimated Time')}</label>
                    <input 
                      type="text"
                      required
                      value={formData.estimatedProcessingTime}
                      onChange={(e) => setFormData({ ...formData, estimatedProcessingTime: e.target.value })}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-blue-600 outline-none transition-all"
                      placeholder="e.g. 15-30 mins"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('Requirements')}</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      className="flex-1 p-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold focus:border-blue-600 outline-none transition-all"
                      placeholder={t('Add a requirement...')}
                    />
                    <button 
                      type="button"
                      onClick={addRequirement}
                      className="p-4 bg-[#141414] text-white rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-xl group">
                        <span className="text-xs font-bold text-blue-700">{req}</span>
                        <button 
                          type="button"
                          onClick={() => removeRequirement(i)}
                          className="text-blue-400 hover:text-rose-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-[#141414] text-white font-black uppercase tracking-widest rounded-2xl shadow-[6px_6px_0px_0px_rgba(20,20,20,0.3)] hover:bg-slate-800 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  {editingService ? t('Update Service') : t('Create Service')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
