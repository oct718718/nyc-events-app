import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Calendar, MapPin, Sparkles, List, Loader2 } from 'lucide-react';

// Initialize Supabase Client
// In production, use process.env.REACT_APP_SUPABASE_URL
const supabaseUrl = 'https://rjdfyhommrglmpqxmxby.supabase.co/rest/v1/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZGZ5aG9tbXJnbG1wcXhteGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjU5NjQsImV4cCI6MjA5NDEwMTk2NH0.G9pnrZk_l7RVdRsxy50EVAdjtHtvS2yaaMg-71rGVOk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EventApp() {
  const [view, setView] = useState('explore'); // 'explore' or 'calendar'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Data from Supabase
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data);
      }
      setLoading(false);
    }

    fetchEvents();
  }, []);

  // 2. Filter Logic for Search
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.vibe.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="mt-4 text-gray-500 font-medium">Loading NYC vibes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 font-sans shadow-xl relative">
      {/* Header */}
      <header className="p-6 bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">
          {view === 'explore' ? 'EXPLORE' : 'SCHEDULE'}
        </h1>
      </header>

      {/* Screen 1: Explore */}
      {view === 'explore' && (
        <main className="p-4 space-y-6 animate-in fade-in duration-500">
          {/* Search/Filters */}
          <section className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                className="w-full pl-10 pr-4 py-2.5 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-black transition-all" 
                placeholder="Search vibe, genre, or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['Brooklyn', 'Manhattan', 'Soulful', 'Afrobeats'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => setSearchTerm(tag)}
                  className="px-4 py-1.5 bg-white border border-gray-200 rounded-full whitespace-nowrap shadow-sm text-xs font-semibold hover:bg-gray-50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Cards */}
          <section className="grid gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={event.image_url || `https://source.unsplash.com/featured/?${event.genre},party`} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                      {event.genre}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">{event.title}</h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 italic leading-relaxed">
                    "{event.summary}"
                  </p>
                  <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-500"/> {event.venue}</div>
                    <div className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500"/> {event.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </main>
      )}

      {/* Screen 2: Calendar List */}
      {view === 'calendar' && (
        <main className="p-4 animate-in slide-in-from-bottom-4 duration-400">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {events.map((event, idx) => (
              <div key={event.id} className={`p-5 flex items-center gap-4 ${idx !== events.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex flex-col items-center justify-center min-w-[50px] py-2 bg-gray-50 rounded-xl">
                  <span className="text-[10px] font-black text-indigo-600 uppercase">{event.date.split(' ')[0]}</span>
                  <span className="text-lg font-black text-gray-900">{event.date.split(' ')[1]}</span>
                </div>
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block leading-tight">{event.title}</span>
                  <span className="text-xs text-gray-400 font-medium">{event.venue} • {event.time}</span>
                </div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-black rounded-full py-3 px-8 flex justify-between items-center shadow-2xl z-30">
        <button 
          onClick={() => setView('explore')} 
          className={`flex flex-col items-center transition-colors ${view === 'explore' ? 'text-white' : 'text-gray-500'}`}
        >
          <Sparkles size={20} />
          <span className="text-[9px] mt-1 font-black tracking-widest">EXPLORE</span>
        </button>
        <div className="h-6 w-[1px] bg-gray-800"></div>
        <button 
          onClick={() => setView('calendar')} 
          className={`flex flex-col items-center transition-colors ${view === 'calendar' ? 'text-white' : 'text-gray-500'}`}
        >
          <List size={20} />
          <span className="text-[9px] mt-1 font-black tracking-widest">LIST</span>
        </button>
      </nav>
    </div>
  );
}