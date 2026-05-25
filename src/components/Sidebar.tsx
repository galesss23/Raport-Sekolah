import React from 'react';
import { LayoutDashboard, Users, FilePlus, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

export type ViewState = 'dashboard' | 'form' | 'preview' | 'settings';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'form', label: 'Tambah Raport', icon: FilePlus },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col shrink-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs"><Users className="w-4 h-4" /></span>
        </div>
        <h1 className="font-bold text-lg tracking-tight text-slate-900">RaportDigital</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (currentView === 'preview' && item.id === 'dashboard');
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-slate-100">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
