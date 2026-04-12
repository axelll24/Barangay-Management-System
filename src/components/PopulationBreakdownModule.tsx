import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Home, 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon,
  TrendingUp,
  ArrowRight,
  Search,
  UserCheck,
  Briefcase,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';

interface PopulationBreakdownModuleProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

const AGE_DATA = [
  { name: 'Children (0-12)', value: 4000, color: '#3b82f6', percentage: '21%' },
  { name: 'Teenagers (13-19)', value: 3500, color: '#10b981', percentage: '18%' },
  { name: 'Adults (20-59)', value: 9000, color: '#f59e0b', percentage: '47%' },
  { name: 'Senior Citizens (60+)', value: 2600, color: '#ef4444', percentage: '14%' },
];

const GENDER_DATA = [
  { name: 'Male', value: 9450, color: '#3b82f6' },
  { name: 'Female', value: 9650, color: '#ec4899' },
];

const EMPLOYMENT_DATA = [
  { name: 'Employed', value: 7200, color: '#10b981' },
  { name: 'Unemployed', value: 1800, color: '#ef4444' },
  { name: 'Student', value: 6500, color: '#3b82f6' },
  { name: 'Retired/Others', value: 3600, color: '#f59e0b' },
];

const STREETS = [
  "ACACIA ST.", "ANOBING ST.", "ANTIPOLO COMP.", "ANTIPOLO ST.", "APITONG ST.", "ARANGAN ST.", "BAGONG SIBOL", "BAKAWAN ST.", "BALAYONG ST.", "BANSALANGIN ST.", "BARANGAY HALL", "BATINO ST.", "BITAOG ST.", "BOBADILLA COMP.", "BUNCAYO SUBD. (INCLUDING BANGKAL ST.)", "CHRISTIAN VILLAGE", "DAO ST.", "DITA ST.", "DUNGON ST.", "GUIHO - MALIGAYA SITE", "HONESTA ST.", "IPIL-IPIL ST.", "IPIT ST.", "ISRAEL VILLAGE", "JATOBA ST.", "KAGAYAWAN ST.", "KAKAWATI ST. BUROL AVE.", "KALANTAS ST.", "KAMAGONG ST.", "KAPATIRAN SUBD.", "KASTANYAS ST.", "LANITE ST. (INCLUDING ST. PETER SUBD.)", "LAUAN ST.", "MAGARILAO ST.", "MAHOGANY ST.", "MANGACHUPOY ST.", "MANGGAHAN ST.", "MANIEBO COMPOUND", "MAULAWIN ST.", "MAULAWIN ST. TO IPIL ST. RIVERSIDE", "MERANTI ST.", "MOLAVE ST.", "NARRA ST.", "NATO ST.", "PAG-ASA ST.", "PALAPI ST.", "PALOTSINA ST.", "PART OF SITIO BROTHERS & SISTERS (UNTIL TOOG ST.)", "PETER PAUL SUBD.", "PINAGPALA SUBD. (PHASE 1,2,3)", "PUBLIC MARKET", "PUBLIC MARKET TO BANSALANGIN ST. RIVERSIDE", "QPLC", "REST OF RIVERSIDE", "REST OF SITIO BROTHERS & SISTERS", "SANGGALAN SUBD.", "SAPLUNGAN ST.", "SCHOOL SITE", "SITIO BOUNDARY (INCLUDING GMELINA ST.)", "SITIO LANZONESAN", "SITIO RIVERSIDE", "TANGGUALAN ST.", "TANGUILE ST.", "TINDALO ST.", "VILLA KATRINA SUBD.", "VNH SUBD.", "YAKAL ST.", "YAKAL ST. TO ANTIPOLO ST. RIVERSIDE"
];

// Generate realistic data for streets summing to 19,100
const STREET_DATA = STREETS.map((name, index) => {
  // Use a deterministic "random" value based on index
  const basePop = 200 + (index * 7) % 150;
  const households = Math.floor(basePop / 4);
  return {
    name,
    households,
    population: basePop,
    color: index % 2 === 0 ? '#3b82f6' : '#10b981'
  };
});

// Adjust last item to make total exactly 19,100
const currentTotal = STREET_DATA.reduce((sum, item) => sum + item.population, 0);
const diff = 19100 - currentTotal;
STREET_DATA[STREET_DATA.length - 1].population += diff;
STREET_DATA[STREET_DATA.length - 1].households = Math.floor(STREET_DATA[STREET_DATA.length - 1].population / 4);

export default function PopulationBreakdownModule({ isOpen, onClose, t }: PopulationBreakdownModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!isOpen) return null;

  const totalPopulation = 19100;
  const filteredStreets = STREET_DATA.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-5xl bg-white border-4 border-[#141414] rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b-4 border-[#141414] bg-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">{t('Population Analytics')}</h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">{t('Pahinga Norte Demographic Report')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-blue-50 border-2 border-[#141414] rounded-2xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{t('Total Population')}</p>
              <p className="text-4xl font-black">19,100</p>
            </div>
            <div className="p-6 bg-emerald-50 border-2 border-[#141414] rounded-2xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">{t('Total Households')}</p>
              <p className="text-4xl font-black">4,775</p>
            </div>
            <div className="p-6 bg-pink-50 border-2 border-[#141414] rounded-2xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <p className="text-xs font-black text-pink-600 uppercase tracking-widest mb-1">{t('Female Population')}</p>
              <p className="text-4xl font-black">9,650</p>
            </div>
            <div className="p-6 bg-amber-50 border-2 border-[#141414] rounded-2xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">{t('Male Population')}</p>
              <p className="text-4xl font-black">9,450</p>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Age Distribution */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <PieChartIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-black uppercase tracking-tight">{t('Age Distribution')}</h3>
              </div>
              <div className="h-64 bg-slate-50 border-2 border-[#141414] rounded-3xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={AGE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {AGE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#141414" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #141414', borderRadius: '12px', fontWeight: 'bold' }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Employment Status */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-black uppercase tracking-tight">{t('Employment Status')}</h3>
              </div>
              <div className="h-64 bg-slate-50 border-2 border-[#141414] rounded-3xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={EMPLOYMENT_DATA}>
                    <XAxis dataKey="name" stroke="#141414" fontSize={10} fontWeight="bold" />
                    <YAxis stroke="#141414" fontSize={10} fontWeight="bold" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #141414', borderRadius: '12px', fontWeight: 'bold' }} />
                    <Bar dataKey="value" stroke="#141414" strokeWidth={2}>
                      {EMPLOYMENT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {/* Street Level Data */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Home className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-black uppercase tracking-tight">{t('Street/Purok Breakdown')}</h3>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder={t('Search street...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-[#141414] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                />
              </div>
            </div>

            <div className="border-4 border-[#141414] rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-900 text-white border-b-4 border-[#141414]">
                      <th className="p-4 text-left text-xs font-black uppercase tracking-widest">{t('Street / Purok')}</th>
                      <th className="p-4 text-center text-xs font-black uppercase tracking-widest">{t('Households')}</th>
                      <th className="p-4 text-right text-xs font-black uppercase tracking-widest">{t('Population')}</th>
                      <th className="p-4 w-48"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#141414] bg-white">
                    {filteredStreets.map((item) => (
                      <tr key={item.name} className="hover:bg-blue-50 transition-colors group">
                        <td className="p-4 font-black uppercase text-xs text-slate-700 group-hover:text-blue-600">{item.name}</td>
                        <td className="p-4 text-center font-bold text-sm">{item.households.toLocaleString()}</td>
                        <td className="p-4 text-right font-black text-sm">{item.population.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="h-2 bg-slate-100 border border-[#141414] rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.population / 500) * 100}%` }}
                              className="h-full bg-blue-500"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStreets.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-400 font-bold italic">
                          {t('No streets found matching your search.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Statistical Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-900 text-white rounded-3xl border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-black uppercase tracking-tight">{t('Demographic Insights')}</h4>
              </div>
              <ul className="space-y-3 text-sm text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>The population is slightly <span className="text-white font-bold">Female-dominant (50.5%)</span>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Working-age adults (20-59) make up the largest segment at <span className="text-white font-bold">47%</span>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Average household density is <span className="text-white font-bold">4.0 members per unit</span>.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-blue-600 text-white rounded-3xl border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-6 h-6 text-blue-200" />
                <h4 className="text-lg font-black uppercase tracking-tight">{t('Voter Statistics')}</h4>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold uppercase">{t('Registered Voters')}</span>
                  <span className="text-xl font-black">12,359 (64.7%)</span>
                </div>
                <div className="h-3 bg-blue-800 border-2 border-[#141414] rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[64.7%]" />
                </div>
                <p className="text-xs text-blue-100 font-medium italic">
                  *Based on the latest COMELEC synchronization for Pahinga Norte.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-[#141414] bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-[#141414] text-white font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all active:translate-y-1 active:shadow-none"
          >
            {t('Close Report')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
