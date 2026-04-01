import { motion } from 'motion/react';
import { Bolt, ArrowRight, Lightbulb, Network, UserCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 md:px-16 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 z-10"
          >
            <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary mb-6 block font-bold">Evolutionary Intelligence</span>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter text-primary leading-[0.9] mb-8">
              The Nexus of Human Intuition & <span className="text-secondary italic">Machine Precision.</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12 font-sans leading-relaxed">
              NeonCurator isn't just a platform; it's a living laboratory. We catalyze innovation through high-fidelity AI matching, real-time collaboration nodes, and objective assessment metrics.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="gradient-pulse text-white px-10 py-5 rounded-xl font-headline font-bold text-lg shadow-xl">
                Join the Innovation Network
              </button>
              <button className="border-2 border-primary/10 text-primary px-10 py-5 rounded-xl font-headline font-bold text-lg hover:bg-primary/5 transition-all">
                View Methodology
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl scale-150"></div>
              <img 
                className="relative z-10 w-full h-full object-cover rounded-[3rem] shadow-2xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsSQoQZsPcgY6D15ySH0wwIkV8KxQmjJCfMF9kGaIMXYyei93XtSw2LJ8PKzflkvxKr2NN-Kp7nV57WcvQVW3KheA4fXibNLWzbr7yyZDa822b3NvVwQyZmQwH0vM4KQnisbvEq5Nkz47hPH1hYciGJtKnIdjfTgL5ONnXnbgDahe13AUZsnbTjOQWy_KZAcn4eBVJJS5xyYCeltHirMfyehPbepG20RcA8P_entqjm7OLApyfDEPSR_gOpfKrF5Upf9-32okXBjk6"
                alt="AI Visualization"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -left-8 glass-panel ambient-shadow p-6 rounded-xl z-20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Bolt className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <p className="font-label text-[10px] uppercase tracking-widest text-secondary">Active Nodes</p>
                    <p className="font-headline font-bold text-xl">12,482+</p>
                  </div>
                </div>
                <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[85%]"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="bg-surface-container-low py-32 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-primary mb-4">Core Ecosystem</h2>
            <p className="font-sans text-on-surface-variant">The architecture of breakthrough thinking.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-surface-container-lowest p-10 rounded-[2rem] ambient-shadow group overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Lightbulb className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-headline text-3xl font-bold mb-4">Advanced AI Matching</h3>
                <p className="text-on-surface-variant font-sans max-w-md mb-8">Our proprietary neural engine identifies synergistic talent and resource overlaps that traditional search algorithms miss.</p>
                <a className="inline-flex items-center text-secondary font-bold font-label text-sm group" href="#">
                  EXPLORE ENGINE <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </a>
              </div>
              <img 
                className="absolute -bottom-10 -right-10 w-2/3 h-auto opacity-20 group-hover:opacity-40 transition-opacity" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLorxXoH1zGyK1AV0Jzf465O4kihfXcCz88nq9EpElgwjC9CewEBG5AXzMoxaVhrcX0FrIRS_F-quyzzVu1BFfE_oGN-tGnPDS8ysUelca4KK4J5pvVM_pc2B6uSjisy0kbgxynB9VR_LrpmvxSgQIEWUVjoOEnbUHFI1geZd3NLR-9HHYtH0TMnbQ3N-XV2ePpQTaQGyeXvyocYSLJHg36PeoMQypG-_ols1Ymzj-c5vIH6NyZv1IcUZ982Vcx7UzUlRzx5LkNZ4L"
                alt="Data Visualization"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="md:col-span-4 bg-primary text-white p-10 rounded-[2rem] ambient-shadow flex flex-col justify-between">
              <div>
                <UserCheck className="w-10 h-10 mb-6" />
                <h3 className="font-headline text-2xl font-bold mb-4">Impact Assessment</h3>
                <p className="text-white/70 font-sans text-sm leading-relaxed">Quantitative benchmarking for innovation lifecycle stages from seed to scale.</p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <span className="font-headline text-4xl font-light">99.2%</span>
                  <span className="font-label text-[10px] uppercase opacity-60">Accuracy Rating</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 bg-surface-container-lowest p-8 rounded-[2rem] ambient-shadow border border-outline-variant/10">
              <div className="w-14 h-14 bg-tertiary/10 rounded-2xl flex items-center justify-center mb-6">
                <Network className="w-8 h-8 text-tertiary" />
              </div>
              <h3 className="font-headline text-xl font-bold mb-3">Sync Workspace</h3>
              <p className="text-on-surface-variant font-sans text-sm mb-6">Unified environment for global teams to iterate at lightspeed without latency.</p>
              <img 
                className="w-full h-40 object-cover rounded-xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRjjVff5tzw-N9c1Ig28NZWB1g51gM9Wz0EtuGd9q64bKjQOVh4cVxV90AphH0Zc85jB-hcFd6GnrYa-y5ZXaua3nzTPdqbxxQUZOr-BsN-q35ECR0iYlzP8EX4_AhDkla5I0WnWOIyblGck0Z6Vwp5oH5-aOnyu7-RBW7rQfDZiktmMWt4-FY3TIskhw0Y6SrI7d0rnEtElSURuem1JUhN4ohurot7Q1egD-vK4vkrRYwLjdrca6ApQBJbjHJp8uEH5PvwnY-RCLC"
                alt="Workspace"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="md:col-span-8 bg-secondary p-1 rounded-[2rem] overflow-hidden">
              <div className="bg-surface-container-lowest h-full w-full rounded-[1.9rem] p-10 flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1">
                  <h3 className="font-headline text-2xl font-bold mb-4">Global Network Expansion</h3>
                  <p className="text-on-surface-variant font-sans text-sm mb-6">Access the top 1% of innovators, scientists, and venture builders across 40+ countries.</p>
                  <div className="flex -space-x-4">
                    {[1, 2, 3].map((i) => (
                      <img 
                        key={i}
                        className="w-12 h-12 rounded-full border-4 border-white" 
                        src={`https://picsum.photos/seed/user${i}/100/100`}
                        alt="User"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-white bg-secondary/10 flex items-center justify-center text-[10px] font-bold text-secondary">+2k</div>
                  </div>
                </div>
                <div className="flex-1 w-full h-full min-h-[200px] bg-slate-100 rounded-2xl overflow-hidden relative">
                  <img 
                    className="absolute inset-0 w-full h-full object-cover opacity-80" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs1Nrxz55ErjMvI85ykMj9oraDjXEcfGz8TB4V_LchDAe4Kpq6FkcvM_lMxPcZn8VzyqdQuXIctsQCALRKsBxvA9F8XkGj1boSXcG1djW0QWoHX9Kk0CBLq5MEhgxR76X3oP5k3hfEVK6IoKvEu4GY61LaEXqHpuRmVLxfJORBuQrGhKIYgm62MxGXyYp6tXB8eIwovn16g-6RBGSHXHkv1_LVKnKIE_ui_MTzirNfElBPlyH3ln703E1hyIafuZ4-DG9EqZgpMC6J"
                    alt="Map"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto hero-gradient rounded-[3rem] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="relative z-10">
            <h2 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-8">Ready to curate the future?</h2>
            <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto font-sans">
              Join the most exclusive intelligence network for high-impact innovation leaders. Applications reviewed within 48 hours.
            </p>
            <button className="bg-white text-primary px-12 py-6 rounded-full font-headline font-bold text-xl hover:bg-secondary-container transition-all hover:scale-[1.05] shadow-lg">
              Apply for Access
            </button>
            <p className="mt-8 font-label text-[10px] uppercase tracking-[0.2em] opacity-60">Limited spaces available for Q4 intake</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
