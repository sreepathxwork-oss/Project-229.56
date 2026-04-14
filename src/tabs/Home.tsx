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
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">MIDTRAN</h1>
        <p className="text-white/40 text-sm">Optimize your synaptic pathways.</p>
      </header>

      <NeuralWeather />

      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 px-1">Quick Start</h2>
        <div className="grid grid-cols-1 gap-4">
          {quickStart.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate('/training', { state: { size: item.size, mode: item.mode } })}
              className="glass p-6 rounded-2xl flex items-center justify-between group hover:neon-border transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">{item.title}</div>
                  <div className="text-xs text-white/40">{item.size}x{item.size} Grid</div>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap size={20} className="text-neon-cyan" />
              </div>
            </button>
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
