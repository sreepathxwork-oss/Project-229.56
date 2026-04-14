import { motion } from 'motion/react';
import { User, Award, Palette, Download, Trash2, ChevronRight } from 'lucide-react';
import { useStore, Theme } from '../store/useStore';

export default function Profile() {
  const { level, totalSynapses, unlockedBadges, theme, setTheme, resetData, stats } = useStore();

  const themes: { name: Theme; colors: string[] }[] = [
    { name: 'Void', colors: ['#0A0A0F', '#00F0FF'] },
    { name: 'Amber Forest', colors: ['#0F0F0A', '#FFD700'] },
    { name: 'Synthwave', colors: ['#1A0A1F', '#FF007F'] },
  ];

  const badges = [
    { id: 'Sub-20s Club', label: 'Sub-20s Club', icon: Award, desc: 'Complete 5x5 in < 20s' },
    { id: 'Synapse Collector', label: 'Synapse Collector', icon: Award, desc: 'Reach 1000 total taps' },
    { id: 'Synesthete', label: 'Synesthete', icon: Award, desc: 'Zero errors in Chromatic Flux' },
    { id: 'Daily Voyager', label: 'Daily Voyager', icon: Award, desc: '7 day training streak' },
  ];

  const exportStats = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "neuroflare_stats.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="px-6 pt-12 pb-8">
      <header className="mb-8 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full glass neon-border flex items-center justify-center relative">
          <User size={48} className="text-white/20" />
          <div className="absolute -bottom-2 bg-neon-cyan text-void text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            LVL {Math.floor(totalSynapses / 500) + 1}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{level}</h1>
          <p className="text-white/40 text-sm">{totalSynapses} Total Synapses</p>
          <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(totalSynapses % 500) / 5}%` }}
              className="h-full bg-neon-cyan"
            />
          </div>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 px-1">Achievement Badges</h2>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`glass p-4 rounded-3xl flex flex-col items-center text-center transition-all ${
                  isUnlocked ? 'neon-border' : 'opacity-40 grayscale'
                }`}
              >
                <div className={`p-3 rounded-2xl mb-3 ${isUnlocked ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-white/40'}`}>
                  <badge.icon size={24} />
                </div>
                <div className="text-xs font-bold mb-1">{badge.label}</div>
                <div className="text-[10px] text-white/40 leading-tight">{badge.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 px-1">Visual Interface</h2>
        <div className="glass rounded-3xl overflow-hidden">
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => setTheme(t.name)}
              className={`w-full p-6 flex items-center justify-between border-b border-white/5 last:border-0 transition-colors ${
                theme === t.name ? 'bg-white/5' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {t.colors.map((c, i) => (
                    <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="font-bold">{t.name}</div>
              </div>
              {theme === t.name && <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00F0FF]" />}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <button 
          onClick={exportStats}
          className="w-full glass p-6 rounded-3xl flex items-center justify-between group hover:neon-border transition-all"
        >
          <div className="flex items-center gap-4">
            <Download size={20} className="text-white/40 group-hover:text-neon-cyan transition-colors" />
            <span className="font-bold">Export Neural Data</span>
          </div>
          <ChevronRight size={20} className="text-white/20" />
        </button>

        <button 
          onClick={() => {
            if (confirm('Are you sure you want to purge all synaptic data? This cannot be undone.')) {
              resetData();
            }
          }}
          className="w-full glass p-6 rounded-3xl flex items-center justify-between group border-error-red/20 hover:border-error-red transition-all"
        >
          <div className="flex items-center gap-4">
            <Trash2 size={20} className="text-error-red/40 group-hover:text-error-red transition-colors" />
            <span className="font-bold text-error-red/80 group-hover:text-error-red transition-colors">Reset All Progress</span>
          </div>
          <ChevronRight size={20} className="text-white/20" />
        </button>
      </section>

      <div className="mt-12 text-center">
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">NEUROFLARE v1.0.0</div>
      </div>
    </div>
  );
}
