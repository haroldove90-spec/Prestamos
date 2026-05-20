import React from 'react';
import { ShieldCheck, User, LogOut, Calendar, Database, Sparkles, RefreshCw, Key } from 'lucide-react';

interface AdminHeaderProps {
  currentUser: 'admin_harold' | 'asesor_juan' | 'cajera_lucia';
  onUserChange: (user: 'admin_harold' | 'asesor_juan' | 'cajera_lucia') => void;
  onResetData: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentUser, onUserChange, onResetData }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-lg px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
          currentUser === 'admin_harold' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : currentUser === 'asesor_juan'
            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          <ShieldCheck className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Buró Interno de Crédito
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all duration-300 ${
              currentUser === 'admin_harold'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : currentUser === 'asesor_juan'
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              {currentUser === 'admin_harold' ? 'MODO SUPER ADMIN' : currentUser === 'asesor_juan' ? 'MODO ASESOR VIP' : 'CAJERA EXPRESS'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Consola Administrativa de Riesgo y Cartera</p>
        </div>
      </div>

      {/* Center metadata */}
      <div className="hidden lg:flex items-center gap-5 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sesión: 19 de Mayo, 2026</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Servidor Principal • Cloud Run</span>
        </div>
      </div>

      {/* User Info & Role Switcher Actions */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-end flex-wrap">
        
        {/* INTERACTIVE TOGGLE BUTTON */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onUserChange('admin_harold')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition duration-150 flex items-center gap-1 cursor-pointer ${
              currentUser === 'admin_harold'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-500 hover:text-slate-350 hover:text-slate-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            @admin_harold
          </button>
          <button
            onClick={() => onUserChange('asesor_juan')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition duration-150 flex items-center gap-1 cursor-pointer ${
              currentUser === 'asesor_juan'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-350 hover:text-slate-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            @asesor_juan
          </button>
          <button
            onClick={() => onUserChange('cajera_lucia')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition duration-150 flex items-center gap-1 cursor-pointer ${
              currentUser === 'cajera_lucia'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-350 hover:text-slate-300'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 rotate-180 text-blue-400" />
            @cajera_lucia
          </button>
        </div>

        {/* PROFILE BADGE DETAIL */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm shadow-inner text-slate-950 transition-colors duration-300 ${
            currentUser === 'admin_harold' ? 'bg-emerald-500' : currentUser === 'asesor_juan' ? 'bg-indigo-400' : 'bg-blue-400'
          }`}>
            {currentUser === 'admin_harold' ? 'AH' : currentUser === 'asesor_juan' ? 'AJ' : 'CL'}
          </div>
          <div className="text-left w-[130px] overflow-hidden">
            <div className="text-xs font-semibold text-slate-200 font-mono truncate">
              {currentUser === 'admin_harold' ? '@admin_harold' : currentUser === 'asesor_juan' ? '@asesor_juan' : '@cajera_lucia'}
            </div>
            <div className="text-[9px] text-slate-400 font-medium truncate">
              {currentUser === 'admin_harold' ? 'Super Admin de Riesgo' : currentUser === 'asesor_juan' ? 'Asesor de Crédito VIP' : 'Cajera Cobros Express'}
            </div>
          </div>
        </div>

        <button
          onClick={onResetData}
          title="Restablecer base de datos inicial"
          className="bg-slate-800 hover:bg-slate-705 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl transition duration-150 text-xs font-mono border border-slate-750 cursor-pointer"
        >
          Reset Demo
        </button>
      </div>
    </header>
  );
};
