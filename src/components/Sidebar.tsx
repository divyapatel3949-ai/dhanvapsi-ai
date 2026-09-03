import React from 'react';
import { LayoutDashboard, ListOrdered, Search, Activity, BarChart3, Zap } from 'lucide-react';

export type PageId = 'overview' | 'recovery-queue' | 'case-forensics' | 'agent-activity' | 'analytics';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode; num: number }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" />, num: 1 },
  { id: 'recovery-queue', label: 'Recovery Queue', icon: <ListOrdered className="w-4 h-4" />, num: 2 },
  { id: 'case-forensics', label: 'Case Forensics', icon: <Search className="w-4 h-4" />, num: 3 },
  { id: 'agent-activity', label: 'Agent Activity', icon: <Activity className="w-4 h-4" />, num: 4 },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, num: 5 },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-dv-sidebar border-r border-dv-border flex flex-col z-30">
      
      {/* Brand */}
      <div className="px-5 py-5 border-b border-dv-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-dv-violet to-purple-400 flex items-center justify-center shadow-lg shadow-dv-violet/30">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-white tracking-tight">DhanVapsi AI</div>
            <div className="text-[10px] text-dv-textMuted font-medium">Revenue recovery</div>
          </div>
        </div>
      </div>

      {/* Navigation Label */}
      <div className="px-5 pt-6 pb-2">
        <span className="text-[10px] font-bold text-dv-textDim uppercase tracking-[0.15em]">Demo Path</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activePage === item.id
                ? 'bg-dv-violet text-white shadow-md shadow-dv-violet/25'
                : 'text-dv-textMuted hover:text-white hover:bg-dv-cardHover'
            }`}
          >
            <span className={`text-xs font-bold w-5 h-5 rounded flex items-center justify-center ${
              activePage === item.id ? 'bg-white/20' : 'bg-dv-border'
            }`}>
              {item.num}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Simulation Badge */}
      <div className="p-4">
        <div className="bg-dv-violet/15 border border-dv-violet/30 rounded-lg px-3 py-2 text-center">
          <span className="text-[11px] font-bold text-dv-violet">Simulation mode · synthetic data</span>
        </div>
      </div>
    </aside>
  );
};
