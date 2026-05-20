import React, { useState } from 'react';
import { Crown, Award, Percent, Star, Sparkles, User, ShieldCheck, CreditCard, ArrowRight, Check, AlertCircle, RefreshCw, Zap, X } from 'lucide-react';
import { Client, RiskParameters } from '../types';

interface MembershipsModuleProps {
  clients: Client[];
  riskParams: RiskParameters;
  onUpdateClientMembership: (clientId: string, membership: 'Ninguna' | 'Básica' | 'Premium') => void;
}

export const MembershipsModule: React.FC<MembershipsModuleProps> = ({
  clients,
  riskParams,
  onUpdateClientMembership,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients.find(c => c.id === 'CLI-001')?.id || clients[0]?.id || ''
  );
  
  const selectedClient = clients.find(c => c.id === selectedClientId);

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getClientInterestRate = (client: Client) => {
    const baseRate = riskParams.baseInterestRate;
    if (client.membership === 'Premium') {
      return baseRate - 2.0;
    }
    if (client.membership === 'Básica') {
      return baseRate - 0.5;
    }
    return baseRate;
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="flex border-b border-slate-800 pb-4 mb-5 items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
              Módulo de Membresías y Beneficios de Tasa
            </h2>
            <p className="text-xs text-slate-400">
              Configuración y asignación de suscripciones corporativas que otorgan tasas preferenciales y exención de comisiones.
            </p>
          </div>
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            Super Admin Conectado
          </span>
        </div>

        {/* COMPARISON CARDS - POINT 1: REGULACIONES DEL NUEVO MÓDULO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* STANDARD TIER (NINGUNA) */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Plan Estándar</span>
                <span className="text-xs font-bold text-slate-400 font-mono">Gratuito</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Sin Membresía</h3>
              <p className="text-[11px] text-slate-400 mt-1 mb-4">Servicio base para prospectos y clientes ordinarios.</p>
              
              <ul className="space-y-2 mb-6 text-[11px] text-slate-300">
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  Tasa Base Completa ({riskParams.baseInterestRate.toFixed(2)}%)
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  1.5% Comisión de apertura estándar
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  SLA de aprobación: 24 - 48 hrs
                </li>
              </ul>
            </div>
            <div className="text-[10px] text-slate-500 bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 text-center font-mono">
              Por defecto para nueva cartera
            </div>
          </div>

          {/* BÁSICA TIER */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between relative">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Plan Acceso rápido</span>
                <span className="text-xs font-black text-indigo-400 font-mono">$199 MXN<span className="text-[9px] text-slate-500">/Mes</span></span>
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                Membresía Básica
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 mb-4">Beneficios iniciales para Pymes y particulares en crecimiento.</p>
              
              <ul className="space-y-2 mb-6 text-[11px] text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  Descuento en Tasa: <strong className="text-indigo-300 font-mono">-0.5%</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  Apertura Preferencial (<strong className="text-indigo-300 font-mono">1.0%</strong>)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  SLA de aprobación: &lt; 12 hrs
                </li>
              </ul>
            </div>
            <div className="text-[10px] text-indigo-400/90 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 text-center font-mono font-semibold">
              Bonificación acumulativa
            </div>
          </div>

          {/* PREMIUM TIER */}
          <div className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/40 flex flex-col justify-between relative overflow-hidden shadow-amber-500/5 shadow-2xl">
            <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black font-mono tracking-widest px-3 py-1 uppercase rounded-bl-xl">
              VIP CORPORATIVO
            </div>
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Máximo Retorno</span>
                <span className="text-xs font-black text-amber-400 font-mono">$499 MXN<span className="text-[9px] text-slate-500">/Mes</span></span>
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                Membresía Premium
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 mb-4">Exclusivo de grandes cuentas y directivos de alta solvencia.</p>
              
              <ul className="space-y-2 mb-6 text-[11px] text-slate-200 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 font-bold" />
                  Descuento en Tasa: <strong className="text-amber-400 font-mono">-2.0% ANUAL</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Comisión de Apertura: <strong className="text-amber-400 font-mono">0% (EXENTO)</strong>
                </li>
                <li className="flex items-center gap-2 text-white">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Prioridad Harold: <span className="font-mono bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 px-1 py-0.2 rounded font-bold">SLA MÁX &lt; 1 HR</span>
                </li>
              </ul>
            </div>
            <div className="text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-center font-mono font-bold animate-pulse">
              Beneficios VIP completos activos
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CARLOS MENDOZA EXPEDIENTE DETAIL DISPLAY - POINT 2 */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono px-3.5 py-1 rounded-br-2xl text-indigo-300 font-bold tracking-widest">
            VISTA DE EXPEDIENTE COMPLETADO (PREVIEW)
          </div>
          
          <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-5 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-lg font-bold text-white">
                  {selectedClient?.name || 'Carlos Mendoza'}
                </h3>
                {selectedClient?.membership === 'Premium' && (
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full py-0.5 px-2.5 text-[9px] font-mono font-bold flex items-center gap-1 animate-pulse">
                    <Crown className="w-3 h-3" />
                    PREMIUM ACTIVE
                  </span>
                )}
                {selectedClient?.membership === 'Básica' && (
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full py-0.5 px-2.5 text-[9px] font-mono font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    BÁSICA ACTIVE
                  </span>
                )}
                {(!selectedClient?.membership || selectedClient?.membership === 'Ninguna') && (
                  <span className="bg-slate-950 text-slate-500 border border-slate-800 rounded-full py-0.5 px-2.5 text-[9px] font-mono font-bold">
                    ESTÁNDAR
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="font-mono bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800">
                  ID: {selectedClient?.id || 'CLI-001'}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-400">RFC: {selectedClient?.rfc || 'MECC820514TS3'}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <div className="text-center bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800">
                <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Score Buró</span>
                <span className="font-mono text-lg font-black text-emerald-400">{selectedClient?.creditScore || 745}</span>
              </div>
              
              <div className="text-center bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800">
                <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Mora Mora</span>
                <span className={`font-mono text-lg font-black ${selectedClient?.delinquencyDays === 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                  {selectedClient?.delinquencyDays || 0}d
                </span>
              </div>
            </div>
          </div>

          {/* RENDER DYNAMIC VIP VALUE DISPLAY */}
          <div className="space-y-4">
            
            {/* BIG INTEREST RATE HIGHLIGHT */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-1">CÁLCULO DE TASA PREFERENCIAL DE CARTERA</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-black text-white">
                    {selectedClient ? getClientInterestRate(selectedClient).toFixed(2) : '12.50'}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-bold line-through">
                    {riskParams.baseInterestRate.toFixed(2)}% base
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedClient?.membership === 'Premium' 
                    ? 'Descuento VIP del -2.0% aplicado automáticamente sobre créditos insolutos.'
                    : selectedClient?.membership === 'Básica'
                    ? 'Descuento del -0.5% aplicado en cartera por estatus de Membresía Básica.'
                    : 'Sin beneficios financieros. Aplica tasa de interés base vigente.'}
                </p>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full shrink-0 animate-pulse">
                <Percent className="w-8 h-8" />
              </div>
            </div>

            {/* BENEFITS TILES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none font-bold">Comisión Apertura</span>
                  <span className="text-xs font-bold text-slate-200 font-mono mt-1 block">
                    {selectedClient?.membership === 'Premium' ? '0% (Completamente Exento)' : selectedClient?.membership === 'Básica' ? '1.0% Preferencial' : '1.5% Estándar'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none font-bold">SLA Priorización de Turno</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {selectedClient?.membership === 'Premium' ? 'Prioridad de Harold (<1hr)' : selectedClient?.membership === 'Básica' ? 'Prioridad Media (<12hrs)' : 'Estándar (24 - 48hrs)'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <Percent className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none font-bold">Bonificación Económica Anual</span>
                  <span className="text-xs font-mono font-bold text-slate-200 mt-1 block">
                    {selectedClient 
                      ? formatMXN((selectedClient.balanceOwed * (riskParams.baseInterestRate - getClientInterestRate(selectedClient))) / 100)
                      : '$7,000'} MXN / anual
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <User className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block leading-none font-bold">Contacto de Cuenta asignado</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {selectedClient?.membership === 'Premium' ? 'Harold Salazar (Super Admin)' : 'Asesor Comercial Regular'}
                  </span>
                </div>
              </div>
            </div>

            {/* MORE EXPEDIENTE DATA DETAILS */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block tracking-wider mb-2">Desglose de Saldos de Cartera</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-400">Total Crédito Autorizado:</span>
                  <span className="font-mono text-slate-200 font-bold">{formatMXN(selectedClient?.totalCreditGranted || 1500000)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-400">Saldo Pendiente Owed:</span>
                  <span className="font-mono text-slate-200 font-bold">{formatMXN(selectedClient?.balanceOwed || 350000)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-400">Tipo de Segmentación:</span>
                  <span className="font-medium text-indigo-400">{selectedClient?.category || 'Comercial'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-400">Antigüedad en Financiera:</span>
                  <span className="text-slate-200">{selectedClient?.joinDate || '2024-01-10'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE MEMBERSHIP CONSOLE - POINT 3 (GESTIÓN DE MEMBRESÍAS COHERENTE) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-800">
              <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Consola de Suscripción</h3>
                <p className="text-[11px] text-slate-500 font-sans">Administra membresías de clientes en tiempo real.</p>
              </div>
            </div>

            {/* SELECCIONAR CLIENTE */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-400">SELECCIONE EXPEDIENTE A CONFIGURAR</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-sm font-semibold p-3 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="text-slate-200 bg-slate-950">
                    {c.id} - {c.name} ({c.membership || 'Ninguna'})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500">
                Selecciona al cliente para inspeccionar su perfil a la izquierda y reasignar su nivel de membresía abajo.
              </p>
            </div>

            {/* OPCIONES DE MEMBRESÍA DISPONIBLES */}
            {selectedClient && (
              <div className="space-y-4 pt-4 border-t border-dashed border-slate-800">
                <span className="block text-xs font-mono font-bold text-slate-400 uppercase">
                  ASIGNAR NUEVO NIVEL PARA <span className="text-slate-200">{selectedClient.name}</span>:
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onUpdateClientMembership(selectedClient.id, 'Ninguna')}
                    className={`p-3 rounded-xl border text-xs font-bold font-sans transition duration-150 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      selectedClient.membership === 'Ninguna' || !selectedClient.membership
                        ? 'bg-slate-950 border-slate-600 text-slate-200 shadow-md ring-1 ring-slate-600/30'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Básico / Ninguno
                  </button>

                  <button
                    onClick={() => onUpdateClientMembership(selectedClient.id, 'Básica')}
                    className={`p-3 rounded-xl border text-xs font-bold font-sans transition duration-150 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      selectedClient.membership === 'Básica'
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-lg ring-1 ring-indigo-500/35 shadow-indigo-500/5'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    Básica ($199)
                  </button>

                  <button
                    onClick={() => onUpdateClientMembership(selectedClient.id, 'Premium')}
                    className={`p-3 rounded-xl border text-xs font-bold font-sans transition duration-150 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      selectedClient.membership === 'Premium'
                        ? 'bg-amber-950/70 border-amber-500 text-amber-300 shadow-xl ring-1 ring-amber-500/35 shadow-amber-500/5'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300 font-medium'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                    Premium ($499)
                  </button>
                </div>

                {/* VISUAL REAL TIME FEEDBACK FOR MODIFICATION */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex gap-2 text-slate-200">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Retroalimentación del Sistema:</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                        Al aplicar la membresía <strong className="text-slate-200 font-semibold">{selectedClient.membership || 'Ninguna'}</strong> al cliente <strong className="text-white">{selectedClient.name}</strong>, el score predictivo del Buró se mantiene en <strong className="text-white font-mono">{selectedClient.creditScore}</strong>, pero su tasa de interés automática en el plan VIP cambia de <strong className="font-mono text-slate-400">{riskParams.baseInterestRate.toFixed(1)}% base</strong> a <strong className="font-mono text-emerald-400 font-bold">{(getClientInterestRate(selectedClient)).toFixed(1)}% preferencial.</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIMULATION AUDIT INSIGHT */}
          <div className="p-3 bg-amber-500/5 border border-amber-500/25 rounded-2xl flex items-start gap-3 mt-6 text-xs text-slate-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-sans font-bold text-slate-100">Políticas de Cobranza del Módulo:</p>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5 [line-height:1.4]">
                La cuota del Módulo de Membresías se factura mensualmente de forma automática al balance insoluto de cada expediente. Las bonificaciones en tasas de interés se recalculan diariamente en base al balance insoluto activo.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

// Simple Clock layout helper inside component file to support standard layout since clocks aren't always exported
const Clock: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};
