import React, { useState } from 'react';
import { ShieldCheck, User, LogOut, Calendar, Database, RefreshCw, Key, Menu, ChevronDown, Award, Smartphone } from 'lucide-react';

interface AdminHeaderProps {
  currentUser: 'admin_harold' | 'asesor_juan' | 'cajera_lucia' | 'cliente_esperanza';
  onUserChange: (user: 'admin_harold' | 'asesor_juan' | 'cajera_lucia' | 'cliente_esperanza') => void;
  onResetData: () => void;
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ currentUser, onUserChange, onResetData, onToggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Convert role name to human readable
  const getRoleName = (user: string) => {
    if (user === 'admin_harold') return 'SUPER ADMIN';
    if (user === 'asesor_juan') return 'ASESOR VIP';
    if (user === 'cajera_lucia') return 'CAJERA EXPRESS';
    return 'PORTAL CLIENTE';
  };

  return (
    <header className="bg-[#a3c90e] border-b border-[#8dae09] text-white shadow-md relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 md:py-2.5 flex items-center justify-between gap-2 min-h-[44px] md:min-h-[56px]">
        
        {/* Left Side: Menu Toggle + Title */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1 sm:p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              title="Abrir menú de navegación"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Icon Badge */}
          <div className="hidden sm:flex p-1.5 rounded-xl bg-white/15 text-white border border-white/10 shrink-0">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>

          {/* Titles */}
          <div className="text-left leading-none md:leading-tight">
            <h1 className="text-xs sm:text-base md:text-lg font-extrabold tracking-tight text-white flex items-center gap-1 sm:gap-1.5 font-sans">
              Prestamos Marín
              <span className="text-[8px] sm:text-[9px] font-bold font-mono px-1 sm:px-1.5 py-0 rounded-full bg-slate-950/40 text-white uppercase border border-white/10 shrink-0">
                {currentUser === 'admin_harold' ? 'SD' : currentUser === 'asesor_juan' ? 'VIP' : currentUser === 'cajera_lucia' ? 'CAJA' : 'CLIENTE'}
              </span>
            </h1>
            <p className="hidden md:block text-[11px] text-white/85 font-mono tracking-tight">
              Consola Administrativa de Riesgo y Cartera
            </p>
          </div>
        </div>

        {/* Center Section: Metadata (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-white/90">
          <div className="flex items-center gap-1.5 bg-[#0a3a46]/20 px-3 py-1 rounded-full border border-white/10">
            <Calendar className="w-3.5 h-3.5 text-white" />
            <span>Sesión: 20 de Mayo, 2026</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0a3a46]/20 px-3 py-1 rounded-full border border-white/10">
            <Database className="w-3.5 h-3.5 text-white" />
            <span>Cloud Run • Servidor Seguro</span>
          </div>
        </div>

        {/* Right Side: Compact controls / Dropdown selector */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Access Switcher (Desktop Only) */}
          <div className="hidden xl:flex gap-1 bg-[#0a3a46]/10 p-1 rounded-xl border border-white/15">
            <button
              onClick={() => onUserChange('admin_harold')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition duration-150 flex items-center gap-1 cursor-pointer ${
                currentUser === 'admin_harold'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Key className="w-3 h-3 text-[#a3c90e]" />
              @harold
            </button>
            <button
              onClick={() => onUserChange('asesor_juan')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition duration-150 flex items-center gap-1 cursor-pointer ${
                currentUser === 'asesor_juan'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3 h-3 text-[#a3c90e]" />
              @juan
            </button>
            <button
              onClick={() => onUserChange('cajera_lucia')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition duration-150 flex items-center gap-1 cursor-pointer ${
                currentUser === 'cajera_lucia'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LogOut className="w-3 h-3 rotate-180 text-orange-400" />
              @lucia
            </button>
            <button
              onClick={() => onUserChange('cliente_esperanza')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
                currentUser === 'cliente_esperanza'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3 h-3 text-[#a3c90e]" />
              @cliente
            </button>
          </div>

          {/* Quick Reset Demo button (Elegant & small) */}
          <button
            onClick={onResetData}
            title="Restablecer base de datos inicial"
            className="bg-white/15 hover:bg-white/25 text-white font-mono text-[9px] md:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-white/10 transition cursor-pointer shrink-0"
          >
            Reset
          </button>

          {/* Active Profile Circle Avatar with Dropdown Trigger */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 p-0.5 rounded-full hover:bg-white/15 transition duration-150 cursor-pointer focus:outline-none"
              title="Abre el selector de perfiles"
            >
              {/* White Circle with Deep Teal border - matches the mock visual element precisely */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-[#0a3a46] text-[#a3c90e] font-extrabold flex items-center justify-center shadow-md transform hover:scale-105 active:scale-95 transition-all duration-150 text-[10px] sm:text-xs md:text-sm">
                {currentUser === 'admin_harold' ? 'AH' : currentUser === 'asesor_juan' ? 'AJ' : currentUser === 'cajera_lucia' ? 'CL' : 'CE'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white hidden sm:block" />
            </button>

            {/* Float Dropdown for Mobile / Switcher */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setShowDropdown(false)}
                />
                <div 
                  className="absolute right-0 mt-2 bg-[#0a3a46] border border-[#0d4c5c] text-slate-100 rounded-2xl shadow-2xl p-2.5 z-50 w-52 font-mono text-xs flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
                  id="header-user-dropdown"
                >
                  <div className="px-2 py-1 text-[9px] uppercase text-white/50 font-bold tracking-widest border-b border-white/10 mb-1">
                    Cambiar de Rol
                  </div>
                  
                  <button
                    onClick={() => {
                      onUserChange('admin_harold');
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer ${
                      currentUser === 'admin_harold' 
                        ? 'bg-[#a3c90e] text-[#0a3a46] font-bold shadow-md' 
                        : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center font-bold text-[10px]">AH</div>
                    <div className="text-left">
                      <div className="font-bold text-[11px]">@admin_harold</div>
                      <div className="text-[8px] opacity-80 font-sans">Super Admin</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUserChange('asesor_juan');
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer ${
                      currentUser === 'asesor_juan' 
                        ? 'bg-[#a3c90e] text-[#0a3a46] font-bold shadow-md' 
                        : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center font-bold text-[10px]">AJ</div>
                    <div className="text-left">
                      <div className="font-bold text-[11px]">@asesor_juan</div>
                      <div className="text-[8px] opacity-80 font-sans">Asesor VIP</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUserChange('cajera_lucia');
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer ${
                      currentUser === 'cajera_lucia' 
                        ? 'bg-[#a3c90e] text-[#0a3a46] font-bold shadow-md' 
                        : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center font-bold text-[10px]">CL</div>
                    <div className="text-left">
                      <div className="font-bold text-[11px]">@cajera_lucia</div>
                      <div className="text-[8px] opacity-80 font-sans">Cajera Express</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onUserChange('cliente_esperanza');
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center gap-2 cursor-pointer ${
                      currentUser === 'cliente_esperanza' 
                        ? 'bg-[#a3c90e] text-[#0a3a46] font-bold shadow-md' 
                        : 'hover:bg-white/10 text-white'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center font-bold text-[10px]">CE</div>
                    <div className="text-left">
                      <div className="font-bold text-[11px]">@cliente_esperanza</div>
                      <div className="text-[8px] opacity-80 font-sans">Portal Cliente</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
