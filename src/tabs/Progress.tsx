import { useMemo } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Zap, Target, Activity } from 'lucide-react';
import { useStore, SessionRecord } from '../store/useStore';

function Heatmap() {
  const dailyRuns = useStore((state) => state.stats.dailyRuns);
  
  // Generate last 12 weeks of dates
  const weeks = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(now);
        date.setDate(now.getDate() - (i * 7 + j));
        const dateStr = date.toISOString().split('T')[0];
        const runsOnDate = dailyRuns.filter(r => r.date.startsWith(dateStr));
        
        let color = 'bg-white/5';
        if (runsOnDate.length > 0) {
          const avgTime = runsOnDate.reduce((acc, r) => acc + r.time, 0) / runsOnDate.length;
          if (avgTime < 25000) color = 'bg-magenta-glow';
          else color = 'bg-neon-cyan';
        }
        week.push({ date: dateStr, color });
      }
      data.push(week.reverse());
    }
    return data.reverse();
  }, [dailyRuns]);

  return (
    <div className="glass p-6 rounded-3xl mb-8 overflow-x-auto">
      <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">Neural Activity (12 Weeks)</h3>
      <div className="flex gap-1.5 min-w-max">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            {week.map((day, j) => (
              <div
                key={j}
                title={day.date}
                className={`w-3 h-3 rounded-sm ${day.color} transition-colors duration-500`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Progress() {
  const stats = useStore((state) => state.stats);
  const lastSession = stats.dailyRuns[stats.dailyRuns.length - 1];

  const chartData = useMemo(() => {
    if (!lastSession) return [];
    return lastSession.taps.map((t, i) => ({
      index: i + 1,
      duration: t.duration / 1000,
    }));
  }, [lastSession]);

  const cognitiveDrift = useMemo(() => {
    if (!lastSession || lastSession.taps.length < 2) return 0;
    const durations = lastSession.taps.map(t => t.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const stdDev = Math.sqrt(durations.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / durations.length);
    return (stdDev / avg).toFixed(3);
  }, [lastSession]);

  return (
    <div className="px-6 pt-12 pb-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">PROGRESS</h1>
        <p className="text-white/40 text-sm">Analyze your cognitive evolution.</p>
      </header>

      <Heatmap />

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs uppercase tracking-widest text-white/40">Tap Distribution</h2>
          <div className="text-[10px] text-neon-cyan font-mono">DRIFT SCORE: {cognitiveDrift}</div>
        </div>
        <div className="glass p-4 rounded-3xl h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="index" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  unit="s"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#00F0FF' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#00F0FF" 
                  strokeWidth={3} 
                  dot={{ fill: '#00F0FF', r: 4 }}
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-white/20 text-sm italic">
              Complete a session to see data
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass p-6 rounded-3xl">
          <Trophy className="text-neon-cyan mb-2" size={24} />
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Best 5x5</div>
          <div className="text-xl font-bold">
            {stats.personalBests['Standard_5'] ? (stats.personalBests['Standard_5'] / 1000).toFixed(2) + 's' : '--'}
          </div>
        </div>
        <div className="glass p-6 rounded-3xl">
          <Zap className="text-magenta-glow mb-2" size={24} />
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Total Taps</div>
          <div className="text-xl font-bold">
            {stats.dailyRuns.reduce((acc, r) => acc + r.size * r.size, 0)}
          </div>
        </div>
      </section>

      <section className="glass p-6 rounded-3xl">
        <h3 className="text-xs uppercase tracking-widest text-white/40 mb-4">Recent Sessions</h3>
        <div className="space-y-4">
          {stats.dailyRuns.slice(-5).reverse().map((run, i) => (
            <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Activity size={18} className="text-neon-cyan" />
                </div>
                <div>
                  <div className="font-bold text-sm">{run.mode} {run.size}x{run.size}</div>
                  <div className="text-[10px] text-white/40">{new Date(run.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">{(run.time / 1000).toFixed(2)}s</div>
                <div className="text-[10px] text-success-green">{run.accuracy}% Acc</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
