import { motion } from 'motion/react';
import { ArrowRight, Brain, Code, Network, FlaskConical, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Onboarding() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Editorial Context */}
      <section className="hidden md:flex w-2/5 hero-gradient p-16 flex-col justify-between text-white">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-white mb-2">NeonCurator</h1>
          <p className="font-label text-xs uppercase tracking-[0.2em] opacity-70">Intelligence Hub V3.4</p>
        </div>
        
        <div className="space-y-8">
          <div className="relative">
            <span className="absolute -left-8 top-0 font-headline text-6xl opacity-20 select-none">“</span>
            <h2 className="font-headline text-4xl font-light leading-tight tracking-tight">
              Engineering the future through <span className="font-bold italic">asymmetric</span> intelligence.
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChQCwW5WfCOzjr6GhhTDhouB0nl5FzwxmsHct8UGRQWdOE4LoA-uvEL-lqdkUXgHuizAmyL61qQGa5lQzxlwO66j_aFPeXnG7H5gMjh62Fzrtne7pK3319izCyaWCOWaXxO9nvyxewETZlpf1qfubrwiKDflyA3CbER9hbdlg3vxshoKlzV0yNMJScmuesM38svyb_kJ0XGURUhp-K7dedaa0BXom66JlK2s_PwQiwtD3CumvqVCKpxQ-Zlsyz89Hr2vb8d7pRBsZc"
                alt="Neural Network"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-label text-sm font-bold">Curated Experience</p>
              <p className="font-sans text-xs opacity-60">Step 1 of 3: Identity & Intent</p>
            </div>
          </div>
        </div>
        
        <div className="text-xs opacity-40 font-label">
          © 2024 NEON CURATOR AI. ALL RIGHTS RESERVED.
        </div>
      </section>

      {/* Right Side: Interaction Canvas */}
      <section className="flex-1 bg-surface-container-low px-6 py-12 md:px-24 md:py-20 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Mobile Branding */}
          <div className="md:hidden mb-12">
            <h1 className="font-headline text-2xl font-bold tracking-tighter text-primary">NeonCurator</h1>
          </div>

          {/* Progress Stepper */}
          <nav className="flex items-center space-x-8 mb-16">
            <div className="flex items-center group cursor-pointer">
              <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-headline text-sm font-bold mr-3">1</span>
              <span className="font-label text-xs uppercase tracking-widest font-bold text-primary">Account</span>
            </div>
            <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
            <div className="flex items-center opacity-40">
              <span className="w-8 h-8 rounded-full bg-outline-variant flex items-center justify-center text-on-surface font-headline text-sm font-bold mr-3">2</span>
              <span className="font-label text-xs uppercase tracking-widest">Skills</span>
            </div>
            <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
            <div className="flex items-center opacity-40">
              <span className="w-8 h-8 rounded-full bg-outline-variant flex items-center justify-center text-on-surface font-headline text-sm font-bold mr-3">3</span>
              <span className="font-label text-xs uppercase tracking-widest">Interests</span>
            </div>
          </nav>

          <header className="mb-12">
            <h3 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-3">Begin your evolution.</h3>
            <p className="text-on-surface-variant font-sans leading-relaxed">Let's establish your professional core. This information helps our AI personalize your intelligence stream.</p>
          </header>

          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/60 font-bold ml-1">Email Address</label>
                <input className="w-full bg-surface-container-lowest border-none rounded-xl h-14 px-5 font-sans focus:ring-2 focus:ring-secondary/20 transition-all outline-none" placeholder="name@innovation.lab" type="email"/>
              </div>
              <div className="space-y-2">
                <label className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant/60 font-bold ml-1">Educational Background</label>
                <select className="w-full bg-surface-container-lowest border-none rounded-xl h-14 px-5 font-sans focus:ring-2 focus:ring-secondary/20 transition-all outline-none appearance-none">
                  <option>Post-Doctorate / Research</option>
                  <option>Graduate Studies</option>
                  <option>Undergraduate</option>
                  <option>Self-Taught Specialist</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-headline text-xl font-bold mb-1">Technical Proficiency</h4>
                <p className="text-sm text-on-surface-variant">Select the nodes that define your expertise.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center px-5 py-3 rounded-full bg-primary text-white font-sans text-sm font-medium transition-transform active:scale-95">
                  <Brain className="w-4 h-4 mr-2" /> Machine Learning
                </button>
                <button className="flex items-center px-5 py-3 rounded-full bg-surface-container-lowest text-on-surface-variant font-sans text-sm font-medium hover:bg-surface-container-high transition-all active:scale-95">
                  <Code className="w-4 h-4 mr-2" /> Python Architecture
                </button>
                <button className="flex items-center px-5 py-3 rounded-full bg-surface-container-lowest text-on-surface-variant font-sans text-sm font-medium hover:bg-surface-container-high transition-all active:scale-95">
                  <Network className="w-4 h-4 mr-2" /> Distributed Systems
                </button>
                <button className="flex items-center px-5 py-3 rounded-full bg-surface-container-lowest text-on-surface-variant font-sans text-sm font-medium hover:bg-surface-container-high transition-all active:scale-95">
                  <FlaskConical className="w-4 h-4 mr-2" /> Bio-Computing
                </button>
                <button className="flex items-center px-5 py-3 rounded-full bg-surface-container-lowest text-on-surface-variant font-sans text-sm font-medium hover:bg-surface-container-high transition-all active:scale-95">
                  <Lock className="w-4 h-4 mr-2" /> Quantum Crypto
                </button>
                <button className="px-5 py-3 rounded-full border border-dashed border-outline-variant text-on-surface-variant/60 font-label text-xs uppercase tracking-widest hover:border-secondary hover:text-secondary transition-colors">
                  + Add Custom Node
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-headline text-xl font-bold mb-1">Innovation Vertical</h4>
                <p className="text-sm text-on-surface-variant">Where does your curiosity focus?</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { title: 'Generative Art', sub: 'Design & AI', img: 'https://picsum.photos/seed/art/300/300' },
                  { title: 'Health-Tech', sub: 'Bio-Innovation', img: 'https://picsum.photos/seed/health/300/300', active: true },
                  { title: 'Web 4.0', sub: 'Spatial Compute', img: 'https://picsum.photos/seed/web/300/300' },
                ].map((item) => (
                  <div 
                    key={item.title}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl aspect-square cursor-pointer transition-all",
                      item.active ? "ring-4 ring-secondary/10 border-2 border-secondary" : "hover:ring-2 hover:ring-secondary/50"
                    )}
                  >
                    <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={item.img} alt={item.title} referrerPolicy="no-referrer" />
                    <div className={cn(
                      "absolute inset-0 flex flex-col justify-end p-6",
                      item.active ? "bg-gradient-to-t from-secondary/90 to-transparent" : "bg-gradient-to-t from-on-surface/90 to-transparent"
                    )}>
                      <div className="flex justify-between items-center">
                        <p className="font-headline text-white font-bold">{item.title}</p>
                        {item.active && <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-secondary rounded-full"></div></div>}
                      </div>
                      <p className="text-[10px] text-white/60 font-label uppercase tracking-widest mt-1">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 flex items-center justify-between">
              <button className="text-on-surface-variant/60 font-label text-xs uppercase tracking-widest hover:text-on-surface transition-colors">
                Save Progress & Exit
              </button>
              <button className="hero-gradient px-12 py-5 rounded-xl text-white font-headline font-bold tracking-tight shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center">
                Synchronize Workspace
                <ArrowRight className="ml-3 w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
