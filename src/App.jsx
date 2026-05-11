import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Calendar, MapPin, Sparkles, List, Loader2, ExternalLink } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EventApp() {
  const [view, setView] = useState('explore');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('Date', { ascending: true });
      if (!error) setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    event['Event Title']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event['Genres']?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-indigo-600">
        <Loader2 className="animate-spin" size={40} />
        <p className="mt-4 font-bold tracking-widest text-xs uppercase">Loading NYC Vibes</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 font-sans shadow-xl relative">
      <header className="p-6 bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">
          {view === 'explore' ? 'EXPLORE' : 'SCHEDULE'}
        </h1>
      </header>

      {view === 'explore' && (
        <main className="p-4 space-y-6">
          <section className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-black" 
              placeholder="Search by title or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </section>

          <section className="grid gap-6">
            {filteredEvents.map((event, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-5">
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                    {event['Genres']}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">{event['Event Title']}</h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 italic italic font-medium">"{event['Vibe Summary']}"</p>
                  <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-500"/> {event['Venue']}</div>
                    <div className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500"/> {event['Date']}</div>
                  </div>
                  {event['Website'] && (
                    <a href={event['Website']} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full bg-black text-white py-3 rounded-2xl text-xs font-black tracking-widest uppercase">
                      View Details <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </section>
        </main>
      )}

      {view === 'calendar' && (
        <main className="p-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {events.map((event, idx) => (
              <div key={idx} className={`p-5 flex items-center gap-4 ${idx !== events.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex flex-col items-center justify-center min-w-[60px] py-2 bg-gray-50 rounded-xl">
                  <span className="text-[10px] font-black text-indigo-600 uppercase">DATE</span>
                  <span className="text-sm font-black text-gray-900">{event['Date']}</span>
                </div>
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block leading-tight">{event['Event Title']}</span>
                  <span className="text-xs text-gray-400 font-medium">{event['Venue']} • {event['Time']}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-black rounded-full py-3 px-8 flex justify-between items-center shadow-2xl z-30">
        <button onClick={() => setView('explore')} className={`flex flex-col items-center ${view === 'explore' ? 'text-white' : 'text-gray-500'}`}>
          <Sparkles size={20} />
          <span className="text-[9px] mt-1 font-black">EXPLORE</span>
        </button>
        <div className="h-6 w-[1px] bg-gray-800"></div>
        <button onClick={() => setView('calendar')} className={`flex flex-col items-center ${view === 'calendar' ? 'text-white' : 'text-gray-500'}`}>
          <List size={20} />
          <span className="text-[9px] mt-1 font-black">LIST</span>
        </button>
      </nav>
    </div>
  );
}