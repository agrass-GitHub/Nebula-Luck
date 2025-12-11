import { User, Prize } from './types';

export const MOCK_USERS: User[] = Array.from({ length: 100 }, (_, i) => ({
  id: `u-${i + 1}`,
  name: `人员-${i + 1}`,
  department: '科技部',
}));

export const DEFAULT_PRIZES: Prize[] = [
  {
    id: 'p-1',
    name: '特等奖：星际旅行券',
    count: 1,
    level: 0,
    batchSize: 1
  },
  {
    id: 'p-2',
    name: '一等奖：量子计算机',
    count: 3,
    level: 1,
    batchSize: 1
  },
  {
    id: 'p-3',
    name: '二等奖：全息投影仪',
    count: 10,
    level: 2,
    batchSize: 5
  },
  {
    id: 'p-4',
    name: '三等奖：赛博机械键盘',
    count: 20,
    level: 3,
    batchSize: 10
  },
];

export const PLANET_COLORS = [
  'from-cyan-400 to-blue-600',
  'from-fuchsia-400 to-purple-600',
  'from-emerald-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-rose-400 to-red-600',
];

// Big face emojis
export const FACE_EMOJIS = [
  '😎', '🤓', '🥳', '🤯', '🤑', '🤠', '🤩', '😜', '🥶', '🤡', 
  '👻', '🎃', '👽', '🤖', '🦁', '🐯', '🤣', '😇', '😈'
];