import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Activity, Zap, ArrowUpRight, ArrowDownRight, MoreVertical, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

const data = [
  { name: '01', value: 400 },
  { name: '02', value: 300 },
  { name: '03', value: 600 },
  { name: '04', value: 800 },
  { name: '05', value: 500 },
  { name: '06', value: 900 },
  { name: '07', value: 1100 },
];

const activity = [
  { id: 1, user: 'Dr. Aris Thorne', action: 'Synchronized Node', target: 'Quantum Bio-Logic', time: '2m ago', status: 'success' },
  { id: 2, user: 'Sarah Chen', action: 'Proposed Synergy', target: 'Spatial Audio Mesh', time: '15m ago', status: 'pending' },
  { id: 3, user: 'Marcus Vane', action: 'Deployed API', target: 'Global Ethics v2', time: '1h ago', status: 'success' },
  { id: 4, user: 'Elena Rossi', action: 'Flagged Conflict', target: 'Neural Privacy', time: '3h ago', status: 'alert' },
];

export default function Admin() {
  return (
    <main className="pt-28 pb-12 px-6 md:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary tracking-tight mb-2">Program Dashboard</h1>
          <p className="text-on-surface-variant font-sans">Real-time oversight of VisionTech’s AI-powered collaboration network.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
            <input className="bg-surface-container-high border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-secondary/20 w-64" placeholder="Search pathways..." type="text" />
          </div>
          <button className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Innovators', value: '12,482', change: '+12.5%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Collaborations', value: '3,842', change: '+8.2%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Engagement Velocity', value: '94.8%', change: '-2.1%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', down: true },
          { label: 'Opportunity Score', value: '8.4/10', change: '+0.4', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl ambient-shadow border border-outline-variant/10"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center text-xs font-bold font-label px-2 py-1 rounded-full",
                stat.down ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              )}>
                {stat.down ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                {stat.change}
              </div>
            </div>
            <p className="text-on-surface-variant/60 font-label text-[10px] uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-headline font-bold text-primary">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] ambient-shadow border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline text-xl font-bold text-primary">Innovation Growth</h3>
              <p className="text-xs text-on-surface-variant">Progress across discovery, matching, and project delivery over the last 7 cycles.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-surface-container-high rounded text-[10px] font-bold text-primary uppercase tracking-widest">7 Days</button>
              <button className="px-3 py-1 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest hover:text-primary transition-colors">30 Days</button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#24389c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#24389c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#24389c', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#24389c" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-8 rounded-[2rem] ambient-shadow border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline text-xl font-bold text-primary">Engagement Feed</h3>
            <button className="text-on-surface-variant/40 hover:text-primary transition-all">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-6">
            {activity.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${item.id+20}/100/100`} alt={item.user} referrerPolicy="no-referrer" />
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                    item.status === 'success' ? 'bg-emerald-500' : 
                    item.status === 'alert' ? 'bg-red-500' : 'bg-amber-500'
                  )}></div>
                </div>
                <div className="flex-1 border-b border-outline-variant/10 pb-4 group-last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-primary">{item.user}</p>
                    <span className="text-[10px] text-on-surface-variant/40 font-label">{item.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {item.action} <span className="font-bold text-secondary">{item.target}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 bg-surface-container-high rounded-xl text-xs font-bold text-primary uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
            View All Logs
          </button>
        </div>
      </div>

      {/* Node Table */}
      <section className="mt-12 bg-white rounded-[2rem] ambient-shadow border border-outline-variant/10 overflow-hidden">
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
          <h3 className="font-headline text-xl font-bold text-primary">Network Nodes</h3>
          <button className="text-secondary font-bold text-xs font-label uppercase tracking-widest">Export Data</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">Project ID</th>
                <th className="px-8 py-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">Participant</th>
                <th className="px-8 py-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">Focus Area</th>
                <th className="px-8 py-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">Progress</th>
                <th className="px-8 py-4 font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {[
                { id: 'VT-4829', user: 'Dr. Aris Thorne', spec: 'Quantum Bio-Logic', uptime: '99.9%', status: 'Active' },
                { id: 'VT-1024', user: 'Sarah Chen', spec: 'Spatial Audio', uptime: '98.4%', status: 'Active' },
                { id: 'VT-7721', user: 'Marcus Vane', spec: 'Ethics API', uptime: '94.2%', status: 'Maintenance' },
                { id: 'VT-3309', user: 'Elena Rossi', spec: 'Neural Privacy', uptime: '99.1%', status: 'Active' },
              ].map((node, i) => (
                <tr key={i} className="hover:bg-surface-container-low/30 transition-colors cursor-pointer">
                  <td className="px-8 py-5 font-mono text-xs text-on-surface-variant">{node.id}</td>
                  <td className="px-8 py-5 font-bold text-primary text-sm">{node.user}</td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">{node.spec}</td>
                  <td className="px-8 py-5 text-sm text-on-surface-variant">{node.uptime}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                      node.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    )}>
                      {node.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
