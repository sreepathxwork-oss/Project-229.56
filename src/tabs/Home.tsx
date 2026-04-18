import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Zap, Activity, Layers, History } from 'lucide-react';
import { useStore } from '../store/useStore';

function NeuralWeather() {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-3xl glass neon-border mb-8 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <motion.path
          d="M 0 100 Q 50 50 100 100 T 200 100 T 300 100 T 400 100"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="3"
          animate={{
            d: [
              "M 0 100 Q 50 20 100 100 T 200 100 T 300 100 T 400 100",
              "M 0 100 Q 50 180 100 100 T 200 100 T 300 100 T 400 100",
              "M 0 100 Q 50 20 100 100 T 200 100 T 300 100 T 400 100",
            ]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#FF007F" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-1">Neural Weather</div>
        <div className="text-2xl font-bold text-white">High Synaptic Flux</div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const ghostData = useStore((state) => state.ghostData);

  const quickStart = [
    { title: '3x3 Warmup', icon: Activity, color: 'text-success-green', size: 3, mode: 'Warmup' },
    { title: '5x5 Standard', icon: Zap, color: 'text-neon-cyan', size: 5, mode: 'Standard' },
    { title: 'Chromatic Flux', icon: Layers, color: 'text-magenta-glow', size: 5, mode: 'Chromatic Flux' },
  ];

  return (
    <div className="px-6 pt-12">
      <header className="mb-8 pl-1">
        <h1 className="text-4xl font-black italic tracking-tighter bg-gradient-to-br from-neon-cyan via-electric-purple to-magenta-glow bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(191,0,255,0.3)]">
          MIDTRAN
        </h1>
        <p className="text-[10px] font-bold text-white/40 tracking-[0.4em] uppercase mt-1">
          Neural Matrix Training
        </p>
      </header>

      <NeuralWeather />

      <section className="mb-8">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Synaptic Protocols</h2>
          <div className="h-[1px] flex-1 bg-white/5 ml-4" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {quickStart.map((item) => (
            <motion.button
              key={item.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={() => navigate('/training', { state: { size: item.size, mode: item.mode } })}
              className="glass p-5 rounded-[2rem] flex items-center justify-between group relative overflow-hidden active:bg-white/[0.05]"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className={`p-3.5 rounded-2xl ${item.color} bg-void/40 backdrop-blur-sm group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon size={22} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-base group-hover:text-neon-cyan transition-colors">{item.title}</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-white/20">{item.size}x{item.size} Interface</div>
                </div>
              </div>
              <div className={`p-2 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 group-hover:bg-neon-cyan/20 transition-all duration-200`}>
                <Zap size={16} className="text-neon-cyan" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {ghostData && (
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 px-1">Beat Yesterday's Ghost</h2>
          <div className="glass p-6 rounded-2xl flex items-center gap-4">
            <History size={24} className="text-white/40" />
            <div>
              <div className="font-bold">Last Session Sequence</div>
              <div className="text-xs text-white/40">25 taps • Avg 0.8s/tap</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
