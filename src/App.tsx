import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Zap, BarChart2, FlaskConical, User } from 'lucide-react';
import { useStore } from './store/useStore';

// Tabs
import HomeScreen from './tabs/Home';
import TrainingScreen from './tabs/Training';
import ProgressScreen from './tabs/Progress';
import LabScreen from './tabs/Lab';
import ProfileScreen from './tabs/Profile';

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [text, setText] = useState('');
  const fullText = 'MIDTRAN';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-void z-50 flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 1, times: [0, 0.8, 1] }}
        className="w-4 h-4 bg-neon-cyan rounded-full mb-8"
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold tracking-[0.2em] text-white"
      >
        {text}
      </motion.div>
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="grid grid-cols-5 grid-rows-5 h-full w-full border border-neon-cyan/20">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="border border-neon-cyan/10" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/training', icon: Zap, label: 'Train' },
    { path: '/progress', icon: BarChart2, label: 'Stats' },
    { path: '/lab', icon: FlaskConical, label: 'Lab' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-white/10 flex items-center justify-around px-4 pb-4 z-40">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
              isActive ? 'text-neon-cyan' : 'text-white/40'
            }`}
          >
            <tab.icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-1 w-12 h-1 bg-neon-cyan rounded-full shadow-[0_0_10px_rgba(0,240,255,0.5)]"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    // Apply theme classes to body
    document.body.className = `bg-void text-white font-sans antialiased overflow-hidden theme-${theme.toLowerCase().replace(' ', '-')}`;
  }, [theme]);

  return (
    <Router>
      <div className="relative h-screen w-screen overflow-hidden flex flex-col">
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto pb-24">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/training" element={<TrainingScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/lab" element={<LabScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Routes>
        </main>

        {!showSplash && <Navigation />}
      </div>
    </Router>
  );
}
