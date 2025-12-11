import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Prize, WinnerRecord, AppState } from './types';
import { MOCK_USERS, DEFAULT_PRIZES } from './constants';
import { generateId } from './utils';

// Components
import Lottery3D from './components/Lottery3D';
import Controls from './components/Controls';
import Settings from './components/Settings';
import History from './components/History';
import Celebration from './components/Celebration';
import WinnerModal from './components/WinnerModal'; 
import AudioManager from './components/AudioManager'; 
import TunnelOverlay from './components/TunnelOverlay';
import StarBackground from './components/StarBackground'; // Imported
import { Settings as SettingsIcon, Archive } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [appTitle, setAppTitle] = useState(() => {
    return localStorage.getItem('lottery_title') || 'NEBULA LUCK';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('lottery_sound') !== 'false'; // Default true
  });

  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('lottery_users');
    return stored ? JSON.parse(stored) : MOCK_USERS;
  });
  
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    const stored = localStorage.getItem('lottery_prizes');
    return stored ? JSON.parse(stored) : DEFAULT_PRIZES;
  });
  
  const [winners, setWinners] = useState<WinnerRecord[]>(() => {
    const stored = localStorage.getItem('lottery_winners');
    return stored ? JSON.parse(stored) : [];
  });

  const [currentPrizeId, setCurrentPrizeId] = useState<string | null>(prizes[0]?.id || null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // New: Current batch of winners for the specific round
  const [currentRoundWinners, setCurrentRoundWinners] = useState<User[]>([]);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // --- Persistence ---
  useEffect(() => localStorage.setItem('lottery_title', appTitle), [appTitle]);
  useEffect(() => localStorage.setItem('lottery_sound', String(soundEnabled)), [soundEnabled]);
  useEffect(() => localStorage.setItem('lottery_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('lottery_prizes', JSON.stringify(prizes)), [prizes]);
  useEffect(() => localStorage.setItem('lottery_winners', JSON.stringify(winners)), [winners]);

  // --- Logic Helpers ---
  const getPrizeRemainingCount = useCallback((prizeId: string) => {
    const prize = prizes.find(p => p.id === prizeId);
    if (!prize) return 0;
    const usedCount = winners.filter(w => w.prizeId === prizeId).length;
    return Math.max(0, prize.count - usedCount);
  }, [prizes, winners]);

  // --- Derived Data ---
  const currentPrize = prizes.find(p => p.id === currentPrizeId) || null;
  const currentPrizeRemaining = currentPrizeId ? getPrizeRemainingCount(currentPrizeId) : 0;

  const displayUsers = useMemo(() => {
    const allWinnerIds = new Set(winners.map(w => w.userId));
    const currentRoundIds = new Set(currentRoundWinners.map(u => u.id));

    return users.filter(u => {
      if (currentRoundIds.has(u.id)) return true;
      if (allWinnerIds.has(u.id)) return false;
      return true;
    });
  }, [users, winners, currentRoundWinners]);

  const eligibleUsersCount = useMemo(() => {
      const allWinnerIds = new Set(winners.map(w => w.userId));
      return users.filter(u => !allWinnerIds.has(u.id)).length;
  }, [users, winners]);

  // --- Actions ---
  
  const startLottery = () => {
    if (!currentPrize || currentPrizeRemaining <= 0) {
      alert("此奖品已抽完或未选择奖品");
      return;
    }
    
    const currentEligible = users.filter(u => !winners.some(w => w.userId === u.id));
    
    if (currentEligible.length === 0) {
      alert("所有人员已中奖！");
      return;
    }

    setAppState(AppState.RUNNING);
    setCurrentRoundWinners([]);
  };

  const stopLottery = useCallback(() => {
    if (appState !== AppState.RUNNING) return;
    
    setAppState(AppState.DRAWING);
    
    const batchSize = currentPrize ? (currentPrize.batchSize || 1) : 1;
    const currentEligible = users.filter(u => !winners.some(w => w.userId === u.id));
    
    // Use derived remaining count instead of mutating prize.count
    const remaining = currentPrizeId ? getPrizeRemainingCount(currentPrizeId) : 0;
    const countToDraw = Math.min(batchSize, remaining, currentEligible.length);

    setTimeout(() => {
       const roundWinners: User[] = [];
       const tempEligible = [...currentEligible];

       for (let i = 0; i < countToDraw; i++) {
         if (tempEligible.length === 0) break;
         const randomIndex = Math.floor(Math.random() * tempEligible.length);
         roundWinners.push(tempEligible[randomIndex]);
         tempEligible.splice(randomIndex, 1);
       }
       
       if (roundWinners.length === 0) {
         setAppState(AppState.IDLE);
         return;
       }

       setCurrentRoundWinners(roundWinners);
       setAppState(AppState.SHOW_WINNER);

       const newRecords: WinnerRecord[] = roundWinners.map(w => ({
            id: generateId(),
            userId: w.id,
            prizeId: currentPrizeId!,
            timestamp: Date.now()
       }));

       setWinners(prev => [...prev, ...newRecords]);
       
    }, 3000); 
  }, [appState, users, winners, currentPrizeId, currentPrize, getPrizeRemainingCount]);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setCurrentRoundWinners([]);
  };
  
  const handleFullReset = () => {
     setWinners([]);
     setCurrentRoundWinners([]);
     setAppState(AppState.IDLE);
  };

  const handleClearHistory = () => {
      setWinners([]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030712] text-white selection:bg-cyan-500/30">
       <div className="scanlines absolute inset-0 pointer-events-none z-50"></div>
       
       {/* Audio Manager */}
       <AudioManager appState={appState} enabled={soundEnabled} />

       {/* Star Background (Deep Space & Meteors) */}
       <StarBackground />

       {/* Tunnel Overlay (Transparent Center) */}
       <TunnelOverlay 
         isActive={appState === AppState.RUNNING || appState === AppState.DRAWING} 
         isAccelerating={appState === AppState.DRAWING}
       />

       {/* Top Bar */}
       <div className="absolute top-0 left-0 right-0 z-[60] p-4 md:p-6 flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-xl md:text-3xl font-black font-orbitron tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              {appTitle}
            </h1>
            <div className="text-[10px] md:text-xs text-slate-500 tracking-[0.5em] mt-1">ANNUAL MEETING SYSTEM v2.0</div>
          </div>

          <div className="flex gap-2 md:gap-4">
             <button onClick={() => setShowHistory(true)} className="p-2 md:p-3 bg-slate-900/50 border border-slate-700 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-400 transition rounded-full group">
               <Archive className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
             </button>
             <button onClick={() => setShowSettings(true)} className="p-2 md:p-3 bg-slate-900/50 border border-slate-700 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-400 transition rounded-full group">
               <SettingsIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform" />
             </button>
          </div>
       </div>

       {/* Main Scene (Transparent) */}
       <div className="absolute inset-0 z-0">
          <Lottery3D 
            users={displayUsers} 
            appState={appState} 
            winners={currentRoundWinners}
            prizeName={currentPrize?.name || ''} 
          />
       </div>

       {/* Celebration Effect */}
       {appState === AppState.SHOW_WINNER && <Celebration />}

       {/* Winner Modal Pop-up */}
       <WinnerModal 
          isOpen={appState === AppState.SHOW_WINNER}
          onClose={handleReset}
          winners={currentRoundWinners}
          prizeName={currentPrize?.name || 'Winner'}
       />

       {/* Controls */}
       <Controls 
            appState={appState}
            onStart={startLottery}
            onStop={stopLottery}
            onReset={handleFullReset}
            currentPrize={currentPrize}
            prizes={prizes}
            winners={winners} 
            onSelectPrize={setCurrentPrizeId}
            remainingCount={eligibleUsersCount}
        />

       {/* Dialogs */}
       <Settings 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)}
          users={users}
          setUsers={setUsers}
          prizes={prizes}
          setPrizes={setPrizes}
          appTitle={appTitle}
          setAppTitle={setAppTitle}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
       />

       <History 
          isOpen={showHistory} 
          onClose={() => setShowHistory(false)}
          winners={winners}
          users={users}
          prizes={prizes}
          onClear={handleClearHistory}
       />
    </div>
  );
};

export default App;