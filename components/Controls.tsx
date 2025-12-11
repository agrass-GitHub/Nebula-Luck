import React, { useRef } from 'react';
import { FUIButton } from './FUIComponents';
import { AppState, Prize, WinnerRecord } from '../types';
import { Play, RotateCcw, Award, Loader2 } from 'lucide-react';

interface ControlsProps {
  appState: AppState;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  currentPrize: Prize | null;
  prizes: Prize[];
  winners: WinnerRecord[];
  onSelectPrize: (id: string) => void;
  remainingCount: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  appState, 
  onStart, 
  onStop, 
  onReset,
  currentPrize,
  prizes,
  winners,
  onSelectPrize,
  remainingCount
}) => {
  const isRunning = appState === AppState.RUNNING;
  const isDrawing = appState === AppState.DRAWING;
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to get true remaining count
  const getRemaining = (prize: Prize) => {
    const used = winners.filter(w => w.prizeId === prize.id).length;
    return Math.max(0, prize.count - used);
  };

  const currentPrizeRemaining = currentPrize ? getRemaining(currentPrize) : 0;

  // Handle Horizontal Scroll with Mouse Wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-[70] pointer-events-none transition-opacity duration-500 ${appState === AppState.SHOW_WINNER ? 'opacity-0' : 'opacity-100'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pointer-events-auto">
        
        {/* Prize Selector */}
        <div className="flex flex-col gap-2 w-full md:w-1/3 order-2 md:order-1">
           <label className="text-cyan-500 font-orbitron text-xs uppercase tracking-widest text-center md:text-left">Select Target</label>
           <div 
                ref={scrollContainerRef}
                onWheel={handleWheel}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scroll-smooth mask-linear-fade justify-start"
           >
             {prizes.sort((a,b) => a.level - b.level).map(p => {
               const remaining = getRemaining(p);
               return (
                <button
                    key={p.id}
                    onClick={() => !isRunning && !isDrawing && onSelectPrize(p.id)}
                    disabled={isRunning || isDrawing}
                    className={`flex-shrink-0 px-4 py-2 border text-sm transition-all whitespace-nowrap ${
                    currentPrize?.id === p.id 
                    ? 'bg-cyan-900/50 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.3)]' 
                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'
                    } ${(isRunning || isDrawing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="font-bold">{p.name}</div>
                    <div className={`text-xs ${remaining === 0 ? 'text-rose-500' : 'opacity-70'}`}>
                        剩余: {remaining} / {p.count}
                    </div>
                </button>
               );
             })}
           </div>
        </div>

        {/* Main Action */}
        <div className="flex-1 flex flex-col items-center w-full md:w-auto order-1 md:order-2 mb-2 md:mb-0">
            <div className="mb-4 text-center">
                <div className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-1">Current Target Prize</div>
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-orbitron drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {currentPrize ? currentPrize.name : 'NO PRIZE SELECTED'}
                </div>
            </div>

            <div className="flex gap-4">
              {isRunning ? (
                <FUIButton variant="danger" onClick={onStop} className="w-48 h-14 text-xl">
                  <span className="flex items-center justify-center gap-2">
                    <Award className="w-6 h-6 animate-bounce" /> 停止
                  </span>
                </FUIButton>
              ) : isDrawing ? (
                <FUIButton 
                    disabled 
                    className="w-48 h-14 text-xl border-cyan-500/50 text-cyan-200 cursor-wait bg-cyan-950/40"
                >
                  <span className="flex items-center justify-center gap-2 animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin" /> 计算中...
                  </span>
                </FUIButton>
              ) : (
                <FUIButton 
                  onClick={onStart} 
                  disabled={!currentPrize || currentPrizeRemaining <= 0 || remainingCount <= 0}
                  className={`w-48 h-14 text-xl ${(!currentPrize || currentPrizeRemaining <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-6 h-6" /> 启动
                  </span>
                </FUIButton>
              )}
            </div>
        </div>

        {/* Stats */}
        <div className="w-full md:w-1/3 flex justify-center md:justify-end gap-4 text-right items-center md:items-start order-3">
             <div>
                <div className="text-slate-500 text-xs uppercase">Waitlist</div>
                <div className="text-2xl font-mono text-cyan-400">{remainingCount}</div>
             </div>
             <button 
                onClick={onReset} 
                disabled={isRunning || isDrawing}
                className={`group p-2 bg-slate-900/80 border border-slate-700 hover:bg-slate-800 hover:border-cyan-400 rounded transition-all cursor-pointer shadow-lg ${(isRunning || isDrawing) ? 'opacity-50 pointer-events-none' : ''}`} 
                title="重置系统/刷新"
             >
                <RotateCcw className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
             </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;