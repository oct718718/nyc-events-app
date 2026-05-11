import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Calendar, MapPin, Sparkles, List, Loader2, ExternalLink, Filter, X } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EventApp() {
  const [view, setView] = useState('explore');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedBorough, setSelectedBorough] = useState('All');
  const [selectedVibe, setSelectedVibe] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase.from('events').select('*').order('Date', { ascending: true });
      if (!error) setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  // Helper to extract Borough from Venue string
  const getBorough = (venue = "") => {
    const v = venue.toLowerCase();
    if (v.includes('brooklyn') || v.includes('bk')) return 'Brooklyn';
    if (v.includes('central park') || v.includes('manhattan') || v.includes('harlem')) return 'Manhattan';
    if (v.includes('staten island')) return 'Staten Island';
    if (v.includes('bronx')) return 'Bronx';
    if (v.includes('queens')) return 'Queens';
    return 'Other';
  };

  // Logic for dynamic filtering
  const filteredEvents = events.filter(event => {
    const matchesSearch = event['Event Title']?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event['Genres']?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const eventDate = new Date(event['Date']);
    const matchesMonth = selectedMonth === 'All' || eventDate.toLocaleString('default', { month: 'long' }) === selectedMonth;
    
    const matchesBorough = selectedBorough === 'All' || getBorough(event['Venue']) === selectedBorough;
    
    const matchesVibe = selectedVibe === 'All' || event['Vibe Summary']?.toLowerCase().includes(selectedVibe.toLowerCase());

    return matchesSearch && matchesMonth && matchesBorough && matchesVibe;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-indigo-400">
      <Loader2 className="animate-spin" size={40} />
      <p className="mt-4 font-bold tracking-widest text-xs uppercase text-gray-400">Curating the Vibe...</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-[#121212] text-gray-100 min-h-screen pb-24 font-sans relative shadow-2xl">
      
      {/* Header */}
      <header className="p-6 bg-[#121212]/90 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter italic">NYC.LIVE</h1>
        <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'}`}>
          <Filter size={20} />
        </button>
      </header>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="p-6 bg-[#1a1a1a] border-b border-white/5 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Refine Search</span>
            <button onClick={() => {setSelectedMonth('All'); setSelectedBorough('All'); setSelectedVibe('All');}} className="text-[10px] font-bold text-gray-500 uppercase">Reset</button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-[#252525] border-none text-xs p-3 rounded-xl outline-none">
              <option value="All">All Months</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
            </select>
            <select value={selectedBorough} onChange={(e) => setSelectedBorough(e.target.value)} className="bg-[#252525] border-none text-xs p-3 rounded-xl outline-none">
              <option value="All">All Boroughs</option>
              <option value="Brooklyn">Brooklyn</option>
              <option value="Manhattan">Manhattan</option>
              <option value="Queens">Queens</option>
            </select>
          </div>
          <input 
            className="w-full p-3 bg-[#252525] rounded-xl text-xs outline-none border-none" 
            placeholder="Search vibe (e.g. Soulful, Energy...)" 
            value={selectedVibe === 'All' ? '' : selectedVibe}
            onChange={(e) => setSelectedVibe(e.target.value || 'All')}
          />
        </div>
      )}

      {/* Content Section */}
      <main className="p-4 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-600" size={18} />
          <input 
            className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm" 
            placeholder="Search events or genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {view === 'explore' ? (
          <section className="grid gap-6">
            {filteredEvents.map((event, idx) => (
              <div key={idx} className="bg-[#1a1a1a] rounded-[2rem] overflow-hidden border border-white/5 group transition-all">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/20">
                      {event['Genres']}
                    </span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{getBorough(event['Venue'])}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors">{event['Event Title']}</h3>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed font-medium italic opacity-80">"{event['Vibe Summary']}"</p>
                  <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><MapPin size={14} className="text-indigo-500"/> {event['Venue']}</div>
                    <div className="flex items-center gap-2"><Calendar size={14} className="text-indigo-500"/> {event['Date']}</div>
                  </div>
                  {event['Website'] && (
                    <a href={event['Website']} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center gap-2 w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] hover:bg-indigo-400 transition-all uppercase">
                      Get Access <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="space-y-3">
            {filteredEvents.map((event, idx) => (
              <div key={idx} className="bg-[#1a1a1a] p-5 rounded-2xl flex items-center gap-5 border border-white/5">
                <div className="flex flex-col items-center justify-center min-w-[65px] h-[65px] bg-[#252525] rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black text-indigo-500 uppercase">{new Date(event['Date']).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg font-black text-white">{new Date(event['Date']).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate text-sm">{event['Event Title']}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-wider">{event['Venue']} • {event['Time']}</p>
                </div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></div>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-[320px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-full py-4 px-10 flex justify-between items-center shadow-2xl z-30">
        <button onClick={() => setView('explore')} className={`flex flex-col items-center gap-1 ${view === 'explore' ? 'text-white' : 'text-gray-600'}`}>
          <Sparkles size={20} />
          <span className="text-[8px] font-black tracking-[0.2em]">EXPLORE</span>
        </button>
        <div className="h-4 w-[1px] bg-white/10"></div>
        <button onClick={() => setView('calendar')} className={`flex flex-col items-center gap-1 ${view === 'calendar' ? 'text-white' : 'text-gray-600'}`}>
          <List size={20} />
          <span className="text-[8px] font-black tracking-[0.2em]">LIST</span>
        </button>
      </nav>
    </div>
  );
}