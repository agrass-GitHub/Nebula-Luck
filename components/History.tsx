import React from 'react';
import { FUIModal, FUICard } from './FUIComponents';
import { WinnerRecord, User, Prize } from '../types';
import * as XLSX from 'xlsx';
import { Download, Trash } from 'lucide-react';

interface HistoryProps {
  isOpen: boolean;
  onClose: () => void;
  winners: WinnerRecord[];
  users: User[];
  prizes: Prize[];
  onClear: () => void;
}

const History: React.FC<HistoryProps> = ({ isOpen, onClose, winners, users, prizes, onClear }) => {
  
  const getWinnerDetails = (record: WinnerRecord) => {
    const user = users.find(u => u.id === record.userId) || { name: 'Unknown', department: 'Unknown' };
    const prize = prizes.find(p => p.id === record.prizeId) || { name: 'Unknown Prize' };
    return { ...record, userName: user.name, dept: user.department, prizeName: prize.name };
  };

  const enrichedWinners = winners.map(getWinnerDetails).sort((a, b) => b.timestamp - a.timestamp);

  const exportHistory = () => {
    const ws = XLSX.utils.json_to_sheet(enrichedWinners.map(w => ({
      '时间': new Date(w.timestamp).toLocaleString(),
      '姓名': w.userName,
      '部门': w.dept,
      '奖品': w.prizeName
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Winners");
    XLSX.writeFile(wb, "LuckyDraw_History.xlsx");
  };

  return (
    <FUIModal isOpen={isOpen} onClose={onClose} title="ARCHIVE // 中奖记录">
       <div className="flex justify-end gap-2 mb-4">
          <button onClick={exportHistory} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-200 border border-cyan-800 bg-cyan-950/30 px-3 py-1">
             <Download size={14} /> 导出 Excel
          </button>
          <button onClick={() => { if(confirm('清除所有历史记录？')) onClear(); }} className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-200 border border-rose-800 bg-rose-950/30 px-3 py-1">
             <Trash size={14} /> 清除记录
          </button>
       </div>

       <div className="max-h-[500px] overflow-y-auto space-y-2">
          {enrichedWinners.length === 0 && <div className="text-center text-slate-500 py-8">暂无中奖记录</div>}
          
          {enrichedWinners.map((w) => (
            <div key={w.id} className="flex items-center justify-between p-3 bg-slate-900/40 border-b border-slate-800 hover:bg-slate-800/40 transition">
                <div className="flex flex-col">
                   <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-cyan-100">{w.userName}</span>
                      <span className="text-xs text-slate-500">[{w.dept}]</span>
                   </div>
                   <span className="text-xs text-slate-600 font-mono">{new Date(w.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-right">
                   <div className="text-fuchsia-400 font-bold">{w.prizeName}</div>
                </div>
            </div>
          ))}
       </div>
    </FUIModal>
  );
};

export default History;
