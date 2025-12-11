import React from 'react';

// A stylistic Button
export const FUIButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'ghost' }> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const baseStyles = "relative px-6 py-2 font-orbitron font-bold text-sm tracking-wider uppercase transition-all duration-300 clip-path-button group overflow-hidden";
  
  const variants = {
    primary: "bg-cyan-950/40 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-400/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]",
    danger: "bg-rose-950/40 text-rose-400 border border-rose-500/50 hover:bg-rose-400/20 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(251,113,133,0.4)]",
    ghost: "bg-transparent text-slate-400 border border-slate-700 hover:text-slate-200 hover:border-slate-500"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      <span className="relative z-10">{children}</span>
      {/* Glitch overlay element */}
      <div className="absolute inset-0 bg-white/5 skew-x-12 -translate-x-full group-hover:animate-shine" />
    </button>
  );
};

// A tech-card container
export const FUICard: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => {
  return (
    <div className={`relative bg-slate-900/80 backdrop-blur-md border border-slate-700 p-6 ${className}`}>
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-500" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-500" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500" />
      
      {title && (
        <div className="absolute -top-3 left-4 bg-slate-950 px-3 py-0.5 text-cyan-500 text-xs font-orbitron tracking-widest border border-cyan-900/50 z-20 whitespace-nowrap shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          {title}
        </div>
      )}
      
      {children}
    </div>
  );
};

// Input Field
export const FUIInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={`bg-slate-950/50 border border-slate-700 text-cyan-100 px-4 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm w-full ${props.className}`}
  />
);

export const FUIModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl animate-fadeIn">
        {/* We move overflow handling to the child div to allow the title (positioned absolute top) to be visible */}
        <FUICard title={title}>
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-cyan-400 z-30">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
               {children}
            </div>
        </FUICard>
      </div>
    </div>
  );
};
