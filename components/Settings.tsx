import React, { useState } from 'react';
import { FUIModal, FUIButton, FUIInput, FUICard } from './FUIComponents';
import { User, Prize } from '../types';
import { parseExcel, generateId } from '../utils';
import { Upload, Trash2, Plus, Type, Volume2, VolumeX } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  setUsers: (u: User[]) => void;
  prizes: Prize[];
  setPrizes: (p: Prize[]) => void;
  appTitle: string;
  setAppTitle: (t: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, users, setUsers, prizes, setPrizes, appTitle, setAppTitle, soundEnabled, setSoundEnabled }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'prizes' | 'system'>('users');
  const [isImporting, setIsImporting] = useState(false);

  // Users Logic
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsImporting(true);
        const newUsers = await parseExcel(e.target.files[0]);
        setUsers(newUsers);
        alert(`成功导入 ${newUsers.length} 人`);
      } catch (err) {
        alert('导入失败: ' + err);
      } finally {
        setIsImporting(false);
      }
    }
  };

  const clearUsers = () => {
      setUsers([]);
  };

  // Prizes Logic
  const handleAddPrize = () => {
    setPrizes([...prizes, {
      id: generateId(),
      name: '新奖品',
      count: 1,
      level: prizes.length + 1,
      batchSize: 1
    }]);
  };

  const updatePrize = (id: string, field: keyof Prize, value: any) => {
    setPrizes(prizes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deletePrize = (id: string) => {
    if (window.confirm('删除此奖品？')) setPrizes(prizes.filter(p => p.id !== id));
  };

  return (
    <FUIModal isOpen={isOpen} onClose={onClose} title="SYSTEM CONFIGURATION // 系统设置">
      <div className="flex gap-4 mb-6 border-b border-slate-700 pb-2 sticky top-0 bg-slate-900/90 z-10">
        <button 
          onClick={() => setActiveTab('users')} 
          className={`px-4 py-2 text-sm font-orbitron ${activeTab === 'users' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-cyan-200'}`}
        >
          PERSONNEL // 人员
        </button>
        <button 
          onClick={() => setActiveTab('prizes')} 
          className={`px-4 py-2 text-sm font-orbitron ${activeTab === 'prizes' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-cyan-200'}`}
        >
          PRIZES // 奖品
        </button>
        <button 
          onClick={() => setActiveTab('system')} 
          className={`px-4 py-2 text-sm font-orbitron ${activeTab === 'system' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-cyan-200'}`}
        >
          SYSTEM // 系统
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-cyan-950 border border-cyan-500 text-cyan-400 px-4 py-2 hover:bg-cyan-900 transition flex items-center gap-2">
                <Upload size={16} />
                <span>导入 Excel</span>
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
              </label>
              <button onClick={clearUsers} className="text-rose-400 hover:text-rose-300 flex items-center gap-2 px-4 border border-rose-900 bg-rose-950/20 py-2">
                 <Trash2 size={16} /> 清空列表
              </button>
              <div className="ml-auto text-slate-400 font-mono text-sm">
                 总人数: {users.length}
              </div>
           </div>

           <div className="text-xs text-slate-500 mb-2">Excel格式: 必须包含 "姓名" 列。</div>

           <div className="max-h-[400px] overflow-y-auto border border-slate-800 bg-black/20 p-2 grid grid-cols-2 md:grid-cols-3 gap-2">
              {users.map(u => (
                <div key={u.id} className="bg-slate-900/50 p-2 text-sm flex justify-between items-center border-l-2 border-slate-700">
                   <span className="text-slate-200">{u.name}</span>
                   {u.department && <span className="text-slate-500 text-xs">{u.department}</span>}
                </div>
              ))}
              {users.length === 0 && <div className="col-span-3 text-center py-10 text-slate-600">无数据</div>}
           </div>
        </div>
      )}
      
      {activeTab === 'prizes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <div className="text-slate-400 text-sm">直接修改配置</div>
             <FUIButton onClick={handleAddPrize} className="py-1 px-3 text-xs"><Plus size={14} /> 添加奖项</FUIButton>
          </div>

          <div className="space-y-3 p-1">
             {prizes.map((p, idx) => (
               <FUICard key={p.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center w-full">
                     <div className="md:col-span-4">
                        <label className="text-xs text-slate-500">奖品名称</label>
                        <FUIInput value={p.name} onChange={(e) => updatePrize(p.id, 'name', e.target.value)} />
                     </div>
                     <div className="md:col-span-2">
                        <label className="text-xs text-slate-500">总数</label>
                        <FUIInput type="number" min={1} value={p.count} onChange={(e) => updatePrize(p.id, 'count', parseInt(e.target.value))} />
                     </div>
                     <div className="md:col-span-2">
                        <label className="text-xs text-cyan-500">每次抽取</label>
                        <FUIInput type="number" min={1} className="text-cyan-300 border-cyan-800" value={p.batchSize || 1} onChange={(e) => updatePrize(p.id, 'batchSize', parseInt(e.target.value))} />
                     </div>
                     <div className="md:col-span-2">
                        <label className="text-xs text-slate-500">等级</label>
                        <FUIInput type="number" value={p.level} onChange={(e) => updatePrize(p.id, 'level', parseInt(e.target.value))} />
                     </div>
                     <div className="md:col-span-2 flex justify-end">
                       <button onClick={() => deletePrize(p.id)} className="p-2 text-rose-500 hover:bg-rose-950/30 rounded mt-4">
                          <Trash2 size={18} />
                       </button>
                     </div>
                  </div>
               </FUICard>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
            <FUICard className="p-6">
                <div className="flex flex-col gap-6">
                    {/* Title Settings */}
                    <div className="border-b border-cyan-900/50 pb-4">
                        <div className="flex items-center gap-2 text-cyan-400 mb-4">
                            <Type size={20} />
                            <span className="font-orbitron font-bold">APPLICATION TITLE // 标题设置</span>
                        </div>
                        <div>
                            <label className="text-sm text-slate-500 mb-1 block">系统标题 (Main Title)</label>
                            <FUIInput 
                                value={appTitle} 
                                onChange={(e) => setAppTitle(e.target.value)} 
                                placeholder="请输入系统标题..."
                                className="text-lg font-bold tracking-widest"
                            />
                        </div>
                    </div>

                    {/* Audio Settings */}
                    <div>
                        <div className="flex items-center gap-2 text-cyan-400 mb-4">
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            <span className="font-orbitron font-bold">AUDIO SYSTEM // 音效控制</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-950/50 p-4 border border-slate-800">
                             <div>
                                <div className="text-slate-200 font-bold">启用音效 (Sound Effects)</div>
                                <div className="text-xs text-slate-500">包括背景音、抽奖引擎音及点击音效</div>
                             </div>
                             <button 
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${soundEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}
                             >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </button>
                        </div>
                    </div>
                </div>
            </FUICard>
        </div>
      )}

    </FUIModal>
  );
};

export default Settings;
