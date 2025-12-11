import React from 'react';
import { FUIButton, FUICard } from './FUIComponents';
import { User } from '../types';
import { getDeterministicEmoji } from '../utils';

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  winners: User[];
  prizeName: string;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ isOpen, onClose, winners, prizeName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-5xl transform transition-all scale-100">
        {/* Use FUICard with title prop for the top-left style */}
        <FUICard 
            title="WINNING RESULT // 中奖名单" 
            className="border-cyan-500/50 shadow-[0_0_50px_rgba(34,211,238,0.2)] bg-slate-900/95 py-6 md:py-8"
        >
            <div className="flex flex-col items-center w-full">
                
                {/* Prize Header */}
                <div className="text-center mb-6 md:mb-10 w-full px-4 relative z-10">
                    <h2 className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] font-orbitron leading-tight py-2">
                        {prizeName}
                    </h2>
                    <div className="flex items-center justify-center gap-4 mt-2 md:mt-4">
                         <div className="h-[1px] w-8 md:w-12 bg-cyan-500/50"></div>
                         <div className="text-cyan-500/70 tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm uppercase">CONGRATULATIONS</div>
                         <div className="h-[1px] w-8 md:w-12 bg-cyan-500/50"></div>
                    </div>
                </div>

                {/* Winners Grid - Spherical Card Design */}
                <div className={`flex flex-wrap justify-center gap-4 md:gap-8 max-h-[50vh] overflow-y-auto custom-scrollbar p-2 md:p-4 w-full`}>
                    {winners.map((winner, idx) => {
                        const emoji = getDeterministicEmoji(winner.id);
                        return (
                            <div 
                                key={winner.id} 
                                className="group relative flex-shrink-0 animate-fadeIn"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Sphere Container */}
                                <div className="w-28 h-28 md:w-40 md:h-40 rounded-full relative flex flex-col items-center justify-center bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.15)] group-hover:scale-105 group-hover:border-cyan-400 group-hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] transition-all duration-300 overflow-hidden">
                                    
                                    {/* Inner Glow */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
                                    
                                    {/* Content Inside Sphere */}
                                    <div className="z-10 flex flex-col items-center text-center transform group-hover:scale-110 transition-transform duration-300 px-2">
                                        <div className="text-2xl md:text-4xl mb-1 md:mb-2 drop-shadow-lg filter">{emoji}</div>
                                        <div className="text-sm md:text-lg font-bold text-white font-orbitron w-full truncate shadow-black drop-shadow-md">
                                            {winner.name}
                                        </div>
                                    </div>
                                </div>

                                {/* Orbit Ring Decoration */}
                                <div className="absolute inset-[-6px] md:inset-[-10px] rounded-full border border-dashed border-cyan-500/20 animate-spin-slow pointer-events-none group-hover:border-cyan-400/40"></div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-6 md:mt-10 mb-2">
                    <FUIButton onClick={onClose} className="w-56 md:w-64 h-12 md:h-14 text-lg md:text-xl border-cyan-400 text-cyan-200 bg-cyan-950/50 hover:bg-cyan-900/80">
                        CONTINUE / 继续
                    </FUIButton>
                </div>
            </div>
        </FUICard>
      </div>
    </div>
  );
};

export default WinnerModal;