import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Moon, Zap, Volume2, Smartphone, Eye, 
  RotateCcw, Hash, Binary, Brain, EyeOff, 
  Move, RefreshCw, Activity, Target, Shield, 
  ZapOff, Clock, Gauge, Sparkles, Infinity,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { useStore, ColorblindMode } from '../store/useStore';

interface ModeCardProps {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  category: string;
}

const ADVANCED_MODES: ModeCardProps[] = [
  // Visual Attention
  { id: 'Eclipse', title: 'ECLIPSE', description: 'Numbers fade to 10% opacity. Rely on spatial memory.', icon: Moon, color: 'text-magenta-glow', category: 'Visual Attention' },
  { id: 'Chromatic Flux', title: 'CHROMATIC FLUX', description: 'HSL color distraction. Find order in chaos.', icon: Layers, color: 'text-neon-cyan', category: 'Visual Attention' },
  { id: 'Blindspot', title: 'BLINDSPOT', description: 'A moving void obscures parts of the grid.', icon: EyeOff, color: 'text-error-red', category: 'Visual Attention' },
  { id: 'Synaptic Noise', title: 'SYNAPTIC NOISE', description: 'Fake numbers flicker to distract your focus.', icon: ZapOff, color: 'text-yellow-400', category: 'Visual Attention' },
  
  // Working Memory
  { id: 'Memory Palace', title: 'MEMORY PALACE', description: 'Numbers vanish after 3s. Tap from memory.', icon: Brain, color: 'text-purple-400', category: 'Working Memory' },
  { id: 'Hidden Dimension', title: 'HIDDEN DIMENSION', description: 'Only neighbors of the last tap are visible.', icon: Shield, color: 'text-blue-400', category: 'Working Memory' },
  { id: 'Vanishing Point', title: 'VANISHING POINT', description: 'Each number disappears 1s after appearing.', icon: Sparkles, color: 'text-indigo-400', category: 'Working Memory' },
  { id: 'Ghost Grid', title: 'GHOST GRID', description: 'Numbers only appear when hovering near them.', icon: Infinity, color: 'text-slate-400', category: 'Working Memory' },

  // Cognitive Flexibility
  { id: 'Mirror Reality', title: 'MIRROR REALITY', description: 'The entire grid is horizontally inverted.', icon: Move, color: 'text-emerald-400', category: 'Flexibility' },
  { id: 'Reverse Entropy', title: 'REVERSE ENTROPY', description: 'Tap numbers in descending order (25 to 1).', icon: RotateCcw, color: 'text-orange-400', category: 'Flexibility' },
  { id: 'Kaleidoscope', title: 'KALEIDOSCOPE', description: 'Grid rotates 90° every 5 correct taps.', icon: RefreshCw, color: 'text-pink-400', category: 'Flexibility' },
  { id: 'Quantum Shift', title: 'QUANTUM SHIFT', description: 'Numbers swap positions every 3 taps.', icon: Activity, color: 'text-cyan-400', category: 'Flexibility' },

  // Mathematical Processing
  { id: 'Binary Vision', title: 'BINARY VISION', description: 'Numbers are displayed in 5-bit binary code.', icon: Binary, color: 'text-green-400', category: 'Processing' },
  { id: 'Roman Legion', title: 'ROMAN LEGION', description: 'Numbers are displayed as Roman Numerals.', icon: Hash, color: 'text-amber-600', category: 'Processing' },
  { id: 'Prime Directive', title: 'PRIME DIRECTIVE', description: 'Tap all Primes first, then the rest.', icon: Target, color: 'text-red-500', category: 'Processing' },
  { id: 'Parity Check', title: 'PARITY CHECK', description: 'Alternate between Odd and Even numbers.', icon: Gauge, color: 'text-lime-400', category: 'Processing' },

  // Speed & Pressure
  { id: 'Chronos', title: 'CHRONOS', description: 'Start with 10s. Each tap adds +2 seconds.', icon: Clock, color: 'text-rose-500', category: 'Speed' },
  { id: 'Doppler Effect', title: 'DOPPLER EFFECT', description: 'Numbers pulse in size at varying speeds.', icon: Activity, color: 'text-sky-400', category: 'Speed' },
  { id: 'Gravity Well', title: 'GRAVITY WELL', description: 'Numbers are offset from cell centers.', icon: Move, color: 'text-violet-400', category: 'Speed' },
  { id: 'Resonance', title: 'RESONANCE', description: 'Numbers only visible during sonar pulses.', icon: Zap, color: 'text-teal-400', category: 'Speed' },
];

function ModeCard({ mode, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="glass p-5 rounded-3xl flex flex-col gap-3 cursor-pointer hover:neon-border transition-all group relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl bg-void ${mode.color} group-hover:scale-110 transition-transform`}>
          <mode.icon size={20} />
        </div>
        <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">{mode.category}</span>
      </div>
      <div>
        <div className="font-bold text-sm mb-1 group-hover:text-neon-cyan transition-colors">{mode.title}</div>
        <div className="text-[11px] text-white/40 leading-relaxed">{mode.description}</div>
      </div>
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={14} className="text-neon-cyan" />
      </div>
    </div>
  );
}

function Toggle({ active, onToggle, icon: Icon, label, description }: any) {
  return (
    <div className="glass p-6 rounded-3xl flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${active ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-white/40'}`}>
          <Icon size={24} />
        </div>
        <div>
          <div className="font-bold">{label}</div>
          <div className="text-xs text-white/40">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${active ? 'bg-neon-cyan' : 'bg-white/10'}`}
      >
        <motion.div
          animate={{ x: active ? 26 : 4 }}
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );
}

export default function Lab() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useStore();

  const colorblindOptions: ColorblindMode[] = ['None', 'Protanopia', 'Deuteranopia', 'Tritanopia'];

  const categories = Array.from(new Set(ADVANCED_MODES.map(m => m.category)));

  return (
    <div className="px-6 pt-12 pb-24">
      <header className="mb-8 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">THE LAB</h1>
          <p className="text-white/40 text-sm">Experimental cognitive protocols.</p>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-6 px-1">Advanced Training Protocols</h2>
        
        {categories.map(category => (
          <div key={category} className="mb-8">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan/60 font-bold mb-4 px-1">{category}</h3>
            <div className="grid grid-cols-2 gap-4">
              {ADVANCED_MODES.filter(m => m.category === category).map((mode) => (
                <ModeCard 
                  key={mode.id} 
                  mode={mode} 
                  onClick={() => navigate('/training', { state: { size: 5, mode: mode.id } })}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 px-1">System Calibration</h2>
        
        <Toggle 
          active={settings.haptic} 
          onToggle={() => updateSettings({ haptic: !settings.haptic })}
          icon={Smartphone}
          label="Haptic Feedback"
          description="Tactile synaptic confirmation."
        />

        <Toggle 
          active={settings.sound} 
          onToggle={() => updateSettings({ sound: !settings.sound })}
          icon={Volume2}
          label="Audio Cues"
          description="Sonic reinforcement patterns."
        />

        <div className="glass p-6 rounded-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-white/5 text-white/40">
              <Eye size={24} />
            </div>
            <div>
              <div className="font-bold">Colorblind Mode</div>
              <div className="text-xs text-white/40">Adjust chromatic sensitivity.</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {colorblindOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => updateSettings({ colorblind: opt })}
                className={`py-3 rounded-xl text-xs font-medium transition-all ${
                  settings.colorblind === opt 
                    ? 'bg-neon-cyan text-void' 
                    : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
