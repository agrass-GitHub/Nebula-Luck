export interface User {
  id: string;
  name: string;
  department: string;
  avatar?: string;
}

export interface Prize {
  id: string;
  name: string;
  count: number;
  level: number;
  batchSize: number; // How many to draw per round
}

export interface WinnerRecord {
  id: string;
  userId: string;
  prizeId: string;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING', 
  DRAWING = 'DRAWING', 
  SHOW_WINNER = 'SHOW_WINNER'
}

export interface LotteryContextType {
  users: User[];
  prizes: Prize[];
  winners: WinnerRecord[];
  currentPrizeId: string | null;
  appState: AppState;
  
  setUsers: (users: User[]) => void;
  setPrizes: (prizes: Prize[]) => void;
  addWinner: (winner: WinnerRecord) => void;
  resetHistory: () => void;
  setCurrentPrize: (id: string) => void;
  setAppState: (state: AppState) => void;
  getRemainingUsers: () => User[];
}