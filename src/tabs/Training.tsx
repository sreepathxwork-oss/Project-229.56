import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pause, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore, SessionRecord, TapData } from '../store/useStore';

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface ParticleBurstProps {
  x: number;
  y: number;
  key?: React.Key;
}

function ParticleBurst({ x, y }: ParticleBurstProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x, y, scale: 1, opacity: 1 }}
          animate={{ 
            x: x + (Math.random() - 0.5) * 100, 
            y: y + (Math.random() - 0.5) * 100,
            scale: 0,
            opacity: 0,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-2 h-2 bg-success-green rounded-full"
        />
      ))}
    </div>
  );
}

export default function Training() {
  const location = useLocation();
  const navigate = useNavigate();
  const addSession = useStore((state) => state.addSession);
  const settings = useStore((state) => state.settings);

  const config = location.state || { size: 5, mode: 'Standard' };
  const { size, mode } = config;

  const [numbers, setNumbers] = useState<number[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(60 * (mode === 'Chromatic Flux' ? 1.8 : 1));
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [taps, setTaps] = useState<TapData[]>([]);
  const [errors, setErrors] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bursts, setBursts] = useState<{ id: number, x: number, y: number }[]>([]);
  const [errorCell, setErrorCell] = useState<number | null>(null);
  const [memoryHidden, setMemoryHidden] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [sonarPulse, setSonarPulse] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isPrime = (n: number) => {
    if (n <= 1) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const getPrimes = useCallback(() => {
    return Array.from({ length: size * size }, (_, i) => i + 1).filter(isPrime);
  }, [size]);

  const initGame = useCallback(() => {
    const sequence = Array.from({ length: size * size }, (_, i) => i + 1);
    setNumbers(shuffle(sequence));
    
    if (mode === 'Reverse Entropy') {
      setNextNumber(size * size);
    } else if (mode === 'Prime Directive') {
      const primes = getPrimes();
      setNextNumber(primes.length > 0 ? primes[0] : 1);
    } else if (mode === 'Parity Check') {
      setNextNumber(1);
    } else {
      setNextNumber(1);
    }

    setStartTime(null);
    setTimeLeft(mode === 'Chronos' ? 10 : 60 * (mode === 'Chromatic Flux' ? 1.8 : 1));
    setIsPaused(false);
    setIsComplete(false);
    setTaps([]);
    setErrors(0);
    setStreak(0);
    setBursts([]);
    setErrorCell(null);
    setMemoryHidden(false);
    setRotation(0);
    setHoveredCell(null);

    if (mode === 'Memory Palace') {
      setTimeout(() => setMemoryHidden(true), 3000);
    }
    if (mode === 'Vanishing Point') {
      setTimeout(() => setMemoryHidden(true), 1000);
    }
  }, [size, mode, getPrimes]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (mode === 'Resonance' && !isPaused && !isComplete) {
      const interval = setInterval(() => {
        setSonarPulse(p => p + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [mode, isPaused, isComplete]);

  useEffect(() => {
    if (startTime && !isPaused && !isComplete && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isPaused, isComplete, timeLeft]);

  const completedSet = useMemo(() => new Set(taps.map(t => t.number)), [taps]);

  const handleTap = (num: number, e: React.MouseEvent) => {
    if (isPaused || isComplete) return;

    const now = Date.now();
    if (!startTime) setStartTime(now);

    let isCorrect = false;

    if (mode === 'Reverse Entropy') {
      isCorrect = num === nextNumber;
    } else if (mode === 'Prime Directive') {
      const primes = getPrimes();
      const currentPrimesTapped = taps.filter(t => isPrime(t.number)).length;
      if (currentPrimesTapped < primes.length) {
        isCorrect = isPrime(num) && !completedSet.has(num);
      } else {
        const nonPrimes = Array.from({ length: size * size }, (_, i) => i + 1).filter(n => !isPrime(n));
        const currentNonPrimesTapped = taps.filter(t => !isPrime(t.number)).length;
        isCorrect = !isPrime(num) && num === nonPrimes[currentNonPrimesTapped];
      }
    } else if (mode === 'Parity Check') {
      const odds = Array.from({ length: size * size }, (_, i) => i + 1).filter(n => n % 2 !== 0);
      const evens = Array.from({ length: size * size }, (_, i) => i + 1).filter(n => n % 2 === 0);
      const currentOddsTapped = taps.filter(t => t.number % 2 !== 0).length;
      if (currentOddsTapped < odds.length) {
        isCorrect = num % 2 !== 0 && num === odds[currentOddsTapped];
      } else {
        const currentEvensTapped = taps.filter(t => t.number % 2 === 0).length;
        isCorrect = num % 2 === 0 && num === evens[currentEvensTapped];
      }
    } else {
      isCorrect = num === nextNumber;
    }

    if (isCorrect) {
      // Success
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      
      setBursts(prev => [...prev, { id: now, x, y }]);
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== now)), 600);

      const lastTapTime = taps.length > 0 ? taps[taps.length - 1].time : startTime || now;
      const newTap: TapData = {
        number: num,
        time: now,
        duration: now - lastTapTime,
      };
      
      const newTaps = [...taps, newTap];
      setTaps(newTaps);
      
      if (mode === 'Reverse Entropy') {
        setNextNumber(prev => prev - 1);
      } else if (mode === 'Prime Directive') {
        const primes = getPrimes();
        if (newTaps.filter(t => isPrime(t.number)).length < primes.length) {
          // Still tapping primes, nextNumber doesn't strictly matter but let's keep it 1 for UI
          setNextNumber(1);
        } else {
          const nonPrimes = Array.from({ length: size * size }, (_, i) => i + 1).filter(n => !isPrime(n));
          const currentNonPrimesTapped = newTaps.filter(t => !isPrime(t.number)).length;
          setNextNumber(nonPrimes[currentNonPrimesTapped] || 0);
        }
      } else if (mode === 'Parity Check') {
        const odds = Array.from({ length: size * size }, (_, i) => i + 1).filter(n => n % 2 !== 0);
        const evens = Array.from({ length: size * size }, (_, i) => i + 1).filter(n => n % 2 === 0);
        if (newTaps.filter(t => t.number % 2 !== 0).length < odds.length) {
          setNextNumber(odds[newTaps.filter(t => t.number % 2 !== 0).length]);
        } else {
          setNextNumber(evens[newTaps.filter(t => t.number % 2 === 0).length] || 0);
        }
      } else {
        setNextNumber(prev => prev + 1);
      }

      setStreak((prev) => prev + 1);

      if (mode === 'Chronos') {
        setTimeLeft(prev => prev + 2);
      }

      if (mode === 'Kaleidoscope' && newTaps.length % 5 === 0) {
        setRotation(prev => prev + 90);
      }

      if (mode === 'Quantum Shift' && newTaps.length % 3 === 0) {
        setNumbers(prev => shuffle(prev));
      }

      if (newTaps.length === size * size) {
        handleComplete();
      }
    } else {
      // Error
      setErrors((prev) => prev + 1);
      setStreak(0);
      setErrorCell(num);
      setTimeout(() => setErrorCell(null), 300);
      if (settings.haptic) {
        window.navigator.vibrate?.([50, 50]);
      }
    }
  };

  const toRoman = (num: number) => {
    const lookup: any = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    for (let i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  };

  const toBinary = (num: number) => {
    return num.toString(2).padStart(5, '0');
  };

  const handleComplete = () => {
    setIsComplete(true);
    const totalTime = Date.now() - (startTime || Date.now());
    const accuracy = Math.round(((size * size) / (size * size + errors)) * 100);

    const session: SessionRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      mode,
      size,
      time: totalTime,
      accuracy,
      taps,
    };

    addSession(session);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00F0FF', '#FF007F', '#00FFAD']
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / (60 * (mode === 'Chromatic Flux' ? 1.8 : 1))) * 100;

  return (
    <div className="h-full flex flex-col px-4 pt-6 pb-4">
      <header className="flex justify-between items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 glass rounded-full">
          <X size={20} />
        </button>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="4"
              strokeDasharray="276.46"
              animate={{ strokeDashoffset: 276.46 * (1 - progress / 100) }}
              transition={{ duration: 0.1 }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="50%" stopColor="#BF00FF" />
                <stop offset="100%" stopColor="#FF00FF" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-lg font-bold font-mono">{formatTime(timeLeft)}</div>
        </div>
        <button onClick={() => setIsPaused(!isPaused)} className="p-2 glass rounded-full">
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-bold mb-1">Synaptic Chain</div>
          <div className="text-3xl font-black italic bg-gradient-to-r from-neon-cyan via-electric-purple to-magenta-glow bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(191,0,255,0.4)]">
            x{streak}
          </div>
        </div>

        <div 
          className="grid gap-2 w-full max-w-[min(90vw,45vh)] aspect-square relative transition-transform duration-500"
          style={{ 
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            transform: `${mode === 'Mirror Reality' ? 'scaleX(-1)' : ''} rotate(${rotation}deg)`
          }}
        >
          {bursts.map(b => <ParticleBurst key={b.id} x={b.x} y={b.y} />)}
          
          {mode === 'Blindspot' && (
            <motion.div 
              animate={{ 
                x: [0, 200, 0, -200, 0],
                y: [0, -200, 200, 0, 0]
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
            >
              <div className="w-32 h-32 bg-void rounded-full blur-3xl opacity-80" />
            </motion.div>
          )}

          {mode === 'Resonance' && (
            <motion.div 
              key={sonarPulse}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 z-20 pointer-events-none border-4 border-neon-cyan/30 rounded-full"
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />
          )}
          
          {numbers.map((num, idx) => {
            const isCompleted = taps.some(t => t.number === num);
            const isActive = num === nextNumber;
            const isError = errorCell === num;
            
            // Mode specific visibility
            let isVisible = true;
            if (memoryHidden && !isCompleted) isVisible = false;
            if (mode === 'Hidden Dimension' && !isCompleted) {
              // Only show neighbors of last tap
              const lastTap = taps[taps.length - 1];
              if (lastTap) {
                const lastIdx = numbers.indexOf(lastTap.number);
                const row = Math.floor(idx / size);
                const lastRow = Math.floor(lastIdx / size);
                const col = idx % size;
                const lastCol = lastIdx % size;
                isVisible = Math.abs(row - lastRow) <= 1 && Math.abs(col - lastCol) <= 1;
              } else {
                isVisible = num === 1;
              }
            }
            if (mode === 'Ghost Grid' && !isCompleted) {
              isVisible = hoveredCell === idx;
            }
            if (mode === 'Resonance' && !isCompleted) {
              // Only visible during pulse? Let's make it pulse opacity
              isVisible = true; // Handled by opacity animation below
            }

            const fluxColor = mode === 'Chromatic Flux' ? `hsl(${num * 14}, 80%, 60%)` : null;
            
            let displayText: string | number = num;
            if (mode === 'Binary Vision') displayText = toBinary(num);
            if (mode === 'Roman Legion') displayText = toRoman(num);
            if (mode === 'Stroop Interference') {
              const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Pink'];
              displayText = colors[num % colors.length];
            }

            return (
              <motion.button
                key={idx}
                onMouseEnter={() => setHoveredCell(idx)}
                onMouseLeave={() => setHoveredCell(null)}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  scale: isCompleted ? [1, 1.05, 1] : (mode === 'Doppler Effect' ? [1, 1.1, 1] : 1),
                  backgroundColor: isError 
                    ? '#FF333366' 
                    : (fluxColor || (isCompleted ? '#1A1A24' : 'rgba(255,255,255,0.08)')),
                  borderColor: isError ? '#FF3333' : (isCompleted ? '#00FFAD' : 'rgba(255,255,255,0.15)'),
                  opacity: isVisible ? (mode === 'Eclipse' && nextNumber > 3 && !isCompleted && num !== nextNumber ? 0.5 : 1) : 0,
                }}
                transition={{ 
                  scale: mode === 'Doppler Effect' ? { duration: 0.8 + (num % 2), repeat: Infinity } : { duration: 0.15 },
                  backgroundColor: { type: "spring", stiffness: 450, damping: 25 },
                  borderColor: { type: "spring", stiffness: 450, damping: 25 },
                  opacity: { duration: 0.15 }
                }}
                onClick={(e) => handleTap(num, e)}
                className={`relative rounded-2xl flex items-center justify-center font-bold border transition-all duration-300 ${
                  isActive ? 'neon-border magenta-glow' : ''
                } ${mode === 'Binary Vision' ? 'text-[10px]' : 'text-3xl'}`}
                style={{
                  transform: mode === 'Gravity Well' ? `translate(${(num % 3 - 1) * 5}px, ${(Math.floor(num / 3) % 3 - 1) * 5}px)` : undefined
                }}
              >
                <motion.span 
                  animate={{ 
                    fontWeight: isActive ? 900 : 600,
                    opacity: mode === 'Synaptic Noise' && !isCompleted ? [1, 0.2, 1] : 1
                  }}
                  transition={{ 
                    duration: 0.1,
                    opacity: { duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 5 }
                  }}
                  className={`${isCompleted ? 'text-white/40' : 'text-white'} drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] z-10`}
                >
                  {displayText}
                </motion.span>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 border-2 border-success-green rounded-2xl pointer-events-none shadow-[0_0_15px_rgba(0,255,173,0.4)]"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-void/80 backdrop-blur-md flex items-center justify-center"
          >
            <div className="glass p-8 rounded-3xl text-center max-w-xs w-full">
              <h2 className="text-2xl font-bold mb-6">Neural Pause</h2>
              <button
                onClick={() => setIsPaused(false)}
                className="w-full bg-neon-cyan text-void font-bold py-4 rounded-2xl mb-4"
              >
                Resume Flow
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full glass py-4 rounded-2xl text-white/60"
              >
                Abort Mission
              </button>
            </div>
          </motion.div>
        )}

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 bg-void/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="glass p-8 rounded-[40px] text-center w-full max-w-sm neon-border">
              <div className="w-20 h-20 bg-success-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-success-green" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Myelination Increased</h2>
              <p className="text-white/40 mb-8">Neural pathways reinforced successfully.</p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="glass p-4 rounded-2xl">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Time</div>
                  <div className="text-xl font-bold text-neon-cyan">
                    {( (Date.now() - (startTime || 0)) / 1000).toFixed(2)}s
                  </div>
                </div>
                <div className="glass p-4 rounded-2xl">
                  <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Accuracy</div>
                  <div className="text-xl font-bold text-magenta-glow">
                    {Math.round(((size * size) / (size * size + errors)) * 100)}%
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full bg-white text-void font-bold py-4 rounded-2xl"
              >
                Return to Base
              </button>
            </div>
          </motion.div>
        )}

        {timeLeft <= 0 && !isComplete && (
           <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="fixed inset-0 z-50 bg-void/90 backdrop-blur-xl flex items-center justify-center p-6"
         >
           <div className="glass p-8 rounded-[40px] text-center w-full max-w-sm border-error-red/40">
             <div className="w-20 h-20 bg-error-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertCircle size={40} className="text-error-red" />
             </div>
             <h2 className="text-3xl font-bold mb-2">Neural Depletion</h2>
             <p className="text-white/40 mb-8">Time limit reached. Synaptic flow interrupted.</p>
             <button
               onClick={() => initGame()}
               className="w-full bg-error-red text-white font-bold py-4 rounded-2xl mb-4"
             >
               Retry Sequence
             </button>
             <button
               onClick={() => navigate('/')}
               className="w-full glass py-4 rounded-2xl text-white/60"
             >
               Return to Base
             </button>
           </div>
         </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
