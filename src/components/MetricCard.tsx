import React from 'react';
import { TrendingUp, Percent, AlertTriangle, Users, Landmark, Award } from 'lucide-react';
import { Client, CreditRequest } from '../types';

interface MetricCardProps {
  clients: Client[];
  requests: CreditRequest[];
}

export const MetricCardPanel: React.FC<MetricCardProps> = ({ clients, requests }) => {
  // Calculos dinámicos en base a los clientes en estado
  const totalClients = clients.length;
  
  const totalGranted = clients.reduce((acc, c) => acc + c.totalCreditGranted, 0);
  const totalOwed = clients.reduce((acc, c) => acc + c.balanceOwed, 0);
  
  const averageScore = Math.round(
    clients.reduce((acc, c) => acc + c.creditScore, 0) / (totalClients || 1)
  );

  // Cartera vencida es la que tiene > 0 días de retraso
  const delinquentClientsList = clients.filter(c => c.delinquencyDays > 0);
  const totalDelinquentOwed = delinquentClientsList.reduce((acc, c) => acc + c.balanceOwed, 0);
  
  // % de cartera vencida sobre el saldo total insoluto
  const portfolioAtRiskPct = totalOwed > 0 
    ? parseFloat(((totalDelinquentOwed / totalOwed) * 100).toFixed(1))
    : 0;

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDIENTE').length;

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* CARD 1: CARTERA GLOBAL */}
      <div id="metric-global-portfolio" className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Cartera de Crédito</span>
            <h3 className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {formatMXN(totalGranted)}
            </h3>
          </div>
          <div className="p-2.5 bg-slate-950 text-indigo-400 rounded-xl border border-slate-800">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
        
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Saldo insoluto:</span>
          <span className="font-semibold text-slate-200">{formatMXN(totalOwed)}</span>
        </div>
      </div>

      {/* CARD 2: EVALUACIÓN PROMEDIO - HIGHLIGHT ACCENT CARD */}
      <div id="metric-bureau-score" className="bg-indigo-600 p-6 rounded-3xl border border-indigo-400 shadow-lg shadow-indigo-500/20 hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between text-white">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest font-mono">Buró Interno Promedio</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black font-mono text-white tracking-tight">
                {averageScore}
              </h3>
              <span className="text-xs text-indigo-200 font-mono">/ 850 pts</span>
            </div>
          </div>
          <div className="p-2.5 bg-indigo-700 text-white rounded-xl border border-indigo-500">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="pt-3 border-t border-indigo-500/50 flex items-center justify-between text-xs font-mono">
          <span className="text-indigo-100">Estatus promedio:</span>
          <span className="font-black px-2 py-0.5 rounded-full text-[10px] bg-white text-indigo-800">
            {averageScore >= 700 ? 'EXCELENTE' : averageScore >= 600 ? 'BUENO' : 'REGULAR'}
          </span>
        </div>
      </div>

      {/* CARD 3: CARTERA EN RIESGO */}
      <div id="metric-risk-portfolio" className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Mora de Cartera Activa</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold font-mono text-rose-450 text-rose-500 tracking-tight">
                {portfolioAtRiskPct}%
              </h3>
              <span className="text-xs text-slate-400 font-mono">Riesgo IMDb</span>
            </div>
          </div>
          <div className={`p-2.5 rounded-xl border ${portfolioAtRiskPct > 20 ? 'bg-slate-950 text-rose-500 border-rose-500/20' : 'bg-slate-950 text-amber-550 border-amber-500/20'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Capital bajo riesgo:</span>
          <span className={`font-semibold ${portfolioAtRiskPct > 20 ? 'text-rose-400' : 'text-amber-500'}`}>
            {formatMXN(totalDelinquentOwed)}
          </span>
        </div>
      </div>

      {/* CARD 4: PIPELINE SOLICITUDES */}
      <div id="metric-pipeline-requests" className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Solicitudes en Análisis</span>
            <h3 className="text-3xl font-extrabold font-mono text-slate-100 tracking-tight">
              {pendingRequestsCount} <span className="text-xs text-slate-500 font-normal font-sans">pendientes</span>
            </h3>
          </div>
          <div className="p-2.5 bg-slate-950 text-amber-500 rounded-xl border border-slate-800">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Tasa de aprobación:</span>
          <span className="font-semibold text-emerald-400">82.4%</span>
        </div>
      </div>
    </div>
  );
};
