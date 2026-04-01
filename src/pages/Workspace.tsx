import { motion } from 'motion/react';
import { PlusCircle, Share2, Network, FlaskConical, Building2, Languages, MessageSquare, Send, ThumbsUp, Users, ArrowRight } from 'lucide-react';

export default function Workspace() {
  return (
    <main className="pt-28 pb-12 px-6 md:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Hero Section */}
      <header className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-label font-bold uppercase tracking-widest">Active Labs</span>
            <span className="h-[1px] w-12 bg-outline-variant/30"></span>
            <span className="text-on-surface-variant/60 text-xs font-label uppercase tracking-widest">Innovation Hub v3.4</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-headline font-bold tracking-tighter leading-none text-primary mb-6">
            Project <br/><span className="text-secondary italic">Collaboration</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl font-sans leading-relaxed">
            A dedicated neural space for early-stage project ideation. Connect with elite curators, join specialized groups, and evolve raw concepts into structured intelligence.
          </p>
        </div>
        <div className="lg:col-span-4 flex justify-end">
          <button className="group relative flex items-center gap-3 hero-gradient text-white px-8 py-5 rounded-xl font-headline font-bold text-lg shadow-xl hover:scale-[1.02] transition-all">
            <PlusCircle className="w-6 h-6" />
            Create New Group
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Main Featured Card */}
        <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-surface-container-lowest rounded-xl overflow-hidden ambient-shadow relative group">
          <div className="h-64 overflow-hidden relative">
            <img 
              alt="Cybersecurity Hub" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkzbWTh0zcb90mVb268p0Db10z6FNCrtYW7eWW29v0vEK1mNxlsWy2r5Fb-xmMsv8SZZ8_hNZ41BPAz9y3E7XlSmRFLyxAGxQaHQDCe1kX35B70m99iLgMqgiPZ8pPG1Cv3yoiFxwFmxtX7CMnGk6HXRc8o3KUlrUivqBqPE3TkE8Ivc0twWQSciq7wYQKAjZCKhIV8R5IXLM1Anqmn6xVPrFgQIGaUX5JJ6t1GSi3RuHED8fgW9ulw1XHJ0fMnPuHTmshXWlGBa9k"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"></div>
          </div>
          <div className="p-8 relative">
            <div className="flex justify-between items-start mb-6">
              <span className="text-secondary font-label text-xs font-bold uppercase tracking-widest">Active Discussion</span>
              <div className="flex -space-x-2">
                {[1, 2].map(i => (
                  <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://picsum.photos/seed/user${i+10}/100/100`} alt="User" referrerPolicy="no-referrer" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">+12</div>
              </div>
            </div>
            <h3 className="text-2xl font-headline font-bold text-primary mb-4 tracking-tight">Quantum-Safe Encryption Standards for Neural Networks</h3>
            <p className="text-on-surface-variant font-sans mb-8 line-clamp-3">Collaborative deep-dive into implementing lattice-based cryptography for distributed AI model training. We're looking for security architects and crypto-enthusiasts.</p>
            <div className="flex items-center gap-4">
              <button className="flex-1 bg-secondary text-white py-3 rounded-lg font-headline font-semibold text-sm hover:opacity-90 transition-all">Join Discussion</button>
              <button className="p-3 bg-surface-container-low text-primary rounded-lg hover:bg-surface-container-high transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Module */}
        <div className="bg-primary text-white p-8 rounded-xl flex flex-col justify-between">
          <div>
            <Network className="text-secondary-container w-10 h-10 mb-4" />
            <h4 className="font-headline text-3xl font-bold tracking-tight">42</h4>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] opacity-70">Cross-Node Synergies</p>
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm font-sans opacity-80 leading-snug">Projects are currently accelerating at 12% above quarterly projection.</p>
          </div>
        </div>

        {/* Small Project Card 1 */}
        <div className="bg-white p-6 rounded-xl ambient-shadow border border-outline-variant/10 group hover:border-secondary/30 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-headline font-bold text-primary leading-none">Bio-Logic v2</h5>
              <span className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-wider">3 Days ago</span>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">Synthetic biology interfaces for organic computing clusters.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> 8
            </span>
            <button className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              View <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Idea Stream */}
        <div className="md:col-span-2 lg:col-span-2 bg-surface-container-low/50 backdrop-blur-xl p-8 rounded-xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-headline font-bold text-xl text-primary tracking-tight">Idea Stream</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="w-2 h-2 rounded-full bg-secondary/30"></span>
              <span className="w-2 h-2 rounded-full bg-secondary/30"></span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4 p-4 rounded-lg bg-white/40 hover:bg-white/60 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 font-headline">JS</div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-primary text-sm">Julian Sterling</span>
                  <span className="text-[10px] font-label text-on-surface-variant/60">Just now</span>
                </div>
                <p className="text-sm text-on-surface-variant">What if we used LLMs to translate ancient hieroglyphs in real-time during AR museum tours?</p>
                <div className="mt-3 flex gap-4">
                  <button className="text-[11px] font-bold text-secondary flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Upvote</button>
                  <button className="text-[11px] font-bold text-on-surface-variant/60 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 3 Comments</button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <img className="w-8 h-8 rounded-full" src="https://picsum.photos/seed/me/100/100" alt="Me" referrerPolicy="no-referrer" />
            <input className="flex-1 bg-white/80 border-none rounded-lg text-sm focus:ring-2 focus:ring-secondary/20" placeholder="Share a raw concept..." type="text"/>
            <button className="bg-primary text-white p-2 rounded-lg"><Send className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Small Project Card 2 */}
        <div className="bg-white p-6 rounded-xl ambient-shadow border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <Building2 className="w-5 h-5" />
              </span>
              <span className="bg-surface-container-high px-2 py-1 rounded text-[10px] font-label font-bold text-on-surface-variant/60 uppercase tracking-wider">Concept</span>
            </div>
            <h5 className="font-headline font-bold text-primary text-lg mb-2">Spatial Audio Mesh</h5>
            <p className="text-xs text-on-surface-variant font-sans">Decentralized network for immersive audio streaming in virtual landscapes.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 rounded-full bg-slate-200 border border-white"></div>
              <div className="w-6 h-6 rounded-full bg-slate-300 border border-white"></div>
            </div>
            <button className="text-[11px] font-bold text-secondary uppercase tracking-widest">Connect</button>
          </div>
        </div>

        {/* Small Project Card 3 */}
        <div className="bg-white p-6 rounded-xl ambient-shadow border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
                <Languages className="w-5 h-5" />
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-label font-bold uppercase tracking-wider">Joinable</span>
            </div>
            <h5 className="font-headline font-bold text-primary text-lg mb-2">Global Ethics API</h5>
            <p className="text-xs text-on-surface-variant font-sans">Standardized ethical verification layers for LLM deployments.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
            <div className="flex -space-x-1">
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-white"></div>
            </div>
            <button className="text-[11px] font-bold text-secondary uppercase tracking-widest">Connect</button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="mt-20 bg-surface-container-high rounded-3xl p-12 lg:p-20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-headline font-bold text-primary mb-6 leading-tight">Collaborate on the next paradigm shift.</h2>
          <p className="text-on-surface-variant text-lg font-sans mb-10">Our community values curiosity over certainty. Join a project or start your own workspace to invite the brightest minds in the network.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-primary text-white px-8 py-4 rounded-xl font-headline font-bold hover:scale-105 transition-transform">Explore All Groups</button>
            <button className="bg-transparent border-2 border-primary/20 text-primary px-8 py-4 rounded-xl font-headline font-bold hover:bg-primary/5 transition-colors">Documentation</button>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full hidden lg:block opacity-10 pointer-events-none">
          <Users className="w-full h-full text-primary" />
        </div>
      </section>
    </main>
  );
}
