import { motion } from 'motion/react';
import { Search, MapPin, Globe, Filter, UserPlus, MessageSquare, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

const curators = [
  { name: 'Dr. Aris Thorne', role: 'Quantum Bio-Logic', location: 'Geneva, CH', tags: ['AI', 'Biotech'], img: 'https://picsum.photos/seed/curator1/200/200' },
  { name: 'Sarah Chen', role: 'Spatial Audio Architect', location: 'Tokyo, JP', tags: ['Audio', 'AR'], img: 'https://picsum.photos/seed/curator2/200/200' },
  { name: 'Marcus Vane', role: 'Ethics API Lead', location: 'London, UK', tags: ['Ethics', 'API'], img: 'https://picsum.photos/seed/curator3/200/200' },
  { name: 'Elena Rossi', role: 'Neural Privacy Specialist', location: 'Milan, IT', tags: ['Privacy', 'Neural'], img: 'https://picsum.photos/seed/curator4/200/200' },
  { name: 'Julian Sterling', role: 'Generative Artist', location: 'Berlin, DE', tags: ['Art', 'GenAI'], img: 'https://picsum.photos/seed/curator5/200/200' },
  { name: 'Anya Petrova', role: 'Venture Builder', location: 'New York, US', tags: ['VC', 'Scaling'], img: 'https://picsum.photos/seed/curator6/200/200' },
];

export default function Network() {
  return (
    <main className="pt-28 pb-12 px-6 md:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-2xl">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary mb-4 block font-bold">Global Intelligence</span>
            <h1 className="text-5xl font-headline font-bold text-primary tracking-tighter leading-none mb-4">The Curator <br/><span className="text-secondary italic">Network</span></h1>
            <p className="text-on-surface-variant font-sans text-lg">Access the top 1% of global innovators. Filter by node specialization, geographic location, or impact score.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input className="bg-surface-container-high border-none rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 w-full md:w-64" placeholder="Search curators..." type="text" />
            </div>
            <button className="p-3 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {curators.map((curator, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[2rem] p-8 ambient-shadow border border-outline-variant/10 group hover:border-secondary/30 transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="relative">
                <img className="w-20 h-20 rounded-2xl object-cover" src={curator.img} alt={curator.name} referrerPolicy="no-referrer" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white"></div>
              </div>
              <button className="text-on-surface-variant/40 hover:text-primary transition-all">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-headline font-bold text-primary mb-1">{curator.name}</h3>
              <p className="text-sm font-sans text-secondary font-medium mb-3">{curator.role}</p>
              <div className="flex items-center text-on-surface-variant/60 text-xs font-label uppercase tracking-widest">
                <MapPin className="w-3 h-3 mr-1" /> {curator.location}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {curator.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-surface-container-low rounded-full text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-primary text-white py-3 rounded-xl font-headline font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                Connect
              </button>
              <button className="p-3 bg-surface-container-low text-primary rounded-xl hover:bg-surface-container-high transition-all">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-16 text-center">
        <button className="px-12 py-4 border-2 border-primary/10 rounded-xl font-headline font-bold text-primary hover:bg-primary/5 transition-all">
          Load More Curators
        </button>
      </div>
    </main>
  );
}
