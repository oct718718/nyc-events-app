import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Calendar, MapPin, Sparkles, List, Loader2, ExternalLink } from 'lucide-react';

// Initialize Supabase Client using Vite Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EventApp() {
  const [view, setView] = useState('explore'); // 'explore' or 'calendar'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Data from Supabase using your exact column titles
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('Date', { ascending: true }); // Matches your 'Date' column

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }

    fetchEvents();
  }, []);

  // 2. Filter Logic for Search (Title and Genres)
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
      {/* Header */}
      <header className="p-6 bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">
          {view === 'explore' ? 'EXPLORE' : 'SCHEDULE'}
        </h1>
      </header>

      {/* Screen 1: Explore View */}
      {view === 'explore' && (
        <main className="p-4 space-y-6">
          {/* Search Bar */}
          <section className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2.5 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-black transition-all" 
              placeholder="Search by title or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </section>

          {/* Event Cards */}
          <section className="grid gap-6">
            {filteredEvents.map((event, idx) => (
              <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                      {event['Genres']}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {event['Event Title']}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 italic leading-relaxed">
                    "{event['Vibe Summary']}"
                  </p>

                  <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-500"/> {event['Venue']}</div>
                    <div className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500"/> {event['Date']}</div>
                  </div>

                  {event['Website'] && (
                    <a 
                      href={event['Website']} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full bg-black text-white py-3 rounded-2xl text-xs font-black tracking-widest hover:bg-gray-800 transition-colors"
                    >
                      VIEW DETAILS <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </section>
        </main>
      )}

      {/* Screen 2: Calendar List View */}
      {view === 'calendar' && (
        <main className="p-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {events.