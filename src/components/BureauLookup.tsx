import React, { useState } from 'react';
import { Search, ShieldCheck, AlertOctagon, RefreshCw, BarChart2, Star, CheckCircle2, History, Database, ArrowRight } from 'lucide-react';
import { Client, BureauQueryLog, RiskParameters, BureauStatus } from '../types';

interface BureauLookupProps {
  clients: Client[];
  queries: BureauQueryLog[];
  riskParams: RiskParameters;
  onAddQueryLog: (log: BureauQueryLog) => void;
  onUpdateRiskParams: (params: RiskParameters) => void;
}

export const BureauLookup: React.FC<BureauLookupProps> = ({
  clients,
  queries,
  riskParams,
  onAddQueryLog,
  onUpdateRiskParams,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [customSearchName, setCustomSearchName] = useState('');
  const [activeQueryClient, setActiveQueryClient] = useState<Client | null>(clients[0] || null);
  const [customQueryScore, setCustomQueryScore] = useState<number>(710);
  const [customQueryDelinquency, setCustomQueryDelinquency] = useState<number>(0);
  const [simulatedCategory, setSimulatedCategory] = useState<'Comercial' | 'Personal' | 'Pyme' | 'Hipotecario'>('Personal');

  // Simulator values
  const [minScore, setMinScore] = useState(riskParams.minScoreAutoApproval);
  const [maxDelinquency, setMaxDelinquency] = useState(riskParams.maxDelinquencyDaysAllowed);
  const [interestRate, setInterestRate] = useState(riskParams.baseInterestRate);

  // Search local client for lookup
  const handleClientSelectChange = (id: string) => {
    setSelectedClientId(id);
    const client = clients.find(c => c.id === id);
    if (client) {
      setActiveQueryClient(client);
      setCustomSearchName('');
      
      // Log lookup query
      const newLog: BureauQueryLog = {
        id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        queriedClientName: client.name,
        requestedBy: 'admin_harold',
        scoreFound: client.creditScore,
        resolution: `Búsqueda en base local. Estatus: ${client.bureauStatus}.`
      };
      onAddQueryLog(newLog);
    }
  };

  // Run custom simulation query for third parties (not in local clients)
  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchName.trim()) return;

    const mockScore = Number(customQueryScore);
    const mockDelinq = Number(customQueryDelinquency);

    const calculatedStatus: BureauStatus = 
      mockDelinq > maxDelinquency ? 'ALERTA' :
      mockScore >= 720 ? 'EXCELENTE' :
      mockScore >= 650 ? 'BUENO' :
      mockScore >= 580 ? 'REGULAR' : 'ALERTA';

    const simulatedClient: Client = {
      id: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      name: customSearchName,
      rfc: 'XAXX010101000',
      email: `${customSearchName.toLowerCase().replace(/\s+/g, '')}@simulado.com`,
      phone: '55-9999-8888',
      creditScore: mockScore,
      bureauStatus: calculatedStatus,
      totalCreditGranted: 0,
      balanceOwed: 0,
      delinquencyDays: mockDelinq,
      category: simulatedCategory,
      joinDate: new Date().toISOString().slice(0, 10)
    };

    setActiveQueryClient(simulatedClient);

    // Add query log
    const newLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: customSearchName,
      requestedBy: 'admin_harold',
      scoreFound: mockScore,
      resolution: `Evaluación externa. Score: ${mockScore}. Recomendación: ${
        mockScore >= minScore && mockDelinq === 0 ? 'APROBACIÓN EXPRÉS AUTO' : 'REQUIERE ANÁLISIS COMITÉ_D'
      }`
    };
    onAddQueryLog(newLog);
  };

  // Apply general parameters updates
  const handleApplyParams = () => {
    onUpdateRiskParams({
      minScoreAutoApproval: Number(minScore),
      maxDelinquencyDaysAllowed: Number(maxDelinquency),
      baseInterestRate: Number(interestRate)
    });
    alert('Parámetros de Riesgo del Buró actualizados para la sesión actual.');
  };

  // Dynamic feedback stats based on simulated parameters
  // How many current clients would violate the new stress params?
  const clientsWithHighRisk = clients.filter(c => 
    c.creditScore < minScore || c.delinquencyDays > maxDelinquency
  );

  const getScoreColorClass = (score: number) => {
    if (score >= 720) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 650) return 'text-indigo-500 border-indigo-500/20 bg-indigo-500/5';
    if (score >= 580) return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/5';
  };

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: BUREAU REPORT GENERATOR / LOOKUP */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Consulta de Expediente Buró Interno
              </h2>
              <p className="text-xs text-slate-400">Realiza consultas exprés de clientes en la base local o simula consultas externas.</p>
            </div>
          </div>

          {/* Quick select database client */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 mb-2">SELECCIONAR EXPEDIENTE EXISTENTE</label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientSelectChange(e.target.value)}
                className="w-full text-sm font-semibold p-3 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 mb-4 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="" disabled className="text-slate-500 bg-slate-950">-- Elige un cliente de la Cartera --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="text-slate-200 bg-slate-950">
                    {c.id} - {c.name} (Score: {c.creditScore} • RFC: {c.rfc})
                  </option>
                ))}
              </select>
            </div>

            {/* Simulated consultation builder */}
            <div className="border-t border-dashed border-slate-800 pt-4 space-y-3">
              <label className="block text-xs font-mono font-bold text-slate-400">O SIMULAR CONSULTA DE PROSPECTO NUEVO</label>
              
              <form onSubmit={handleCustomQuery} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nombre del Prospecto..."
                    value={customSearchName}
                    onChange={(e) => setCustomSearchName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-405 text-slate-400 mb-1">Score Simulated (300-850)</label>
                  <input
                    type="number"
                    min="300"
                    max="850"
                    value={customQueryScore}
                    onChange={(e) => setCustomQueryScore(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-800 rounded-lg font-mono bg-slate-950 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-405 text-slate-400 mb-1">Retraso Días Simulated</label>
                  <input
                    type="number"
                    min="0"
                    value={customQueryDelinquency}
                    onChange={(e) => setCustomQueryDelinquency(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-800 rounded-lg font-mono bg-slate-950 text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-405 text-slate-400 mb-1">Segmento</label>
                  <select
                    value={simulatedCategory}
                    onChange={(e: any) => setSimulatedCategory(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-800 rounded-lg bg-slate-950 text-white"
                  >
                    <option value="Personal" className="bg-slate-950">Personal</option>
                    <option value="Comercial" className="bg-slate-950">Comercial</option>
                    <option value="Pyme" className="bg-slate-950">Pyme</option>
                    <option value="Hipotecario" className="bg-slate-950">Hipotecario</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold p-2.5 rounded-lg transition duration-150 flex items-center justify-center gap-1 cursor-pointer border border-emerald-500/30"
                  >
                    Consultar Externo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ACTIVE QUERY DISPLAY: DETAILED CERTIFICATE */}
        {activeQueryClient && (
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Ambient decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
            
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full inline-block mb-1">
                  REPORTE DE SOLVENCIA INTERNA - CERTIFICADO
                </span>
                <h3 className="text-lg font-bold font-sans text-white">{activeQueryClient.name}</h3>
                <p className="text-[10px] font-mono text-slate-400 flex gap-2">
                  <span>RFC: {activeQueryClient.rfc}</span>
                  <span>•</span>
                  <span>ID: {activeQueryClient.id}</span>
                </p>
              </div>

              {/* Huge circular Score indicator */}
              <div className={`p-4 rounded-full border flex flex-col items-center justify-center w-24 h-24 shrink-0 ${getScoreColorClass(activeQueryClient.creditScore)}`}>
                <span className="text-[9px] font-mono text-slate-450 text-slate-300 uppercase font-bold">SCORE</span>
                <span className="text-2xl font-black font-mono tracking-tight leading-none">{activeQueryClient.creditScore}</span>
                <span className="text-[8px] font-mono text-slate-400 mt-1">/ 850 pts</span>
              </div>
            </div>

            {/* Report body split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans pb-4 border-b border-slate-800">
              <div className="space-y-2">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">CRÉDITO ACTIVO AUTORIZADO</span>
                  <span className="font-mono text-sm font-bold text-slate-100">{formatMXN(activeQueryClient.totalCreditGranted)}</span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">SALDO INSOLUTO VIGENTE</span>
                  <span className="font-mono text-sm font-bold text-slate-100">{formatMXN(activeQueryClient.balanceOwed)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">DIAS DE RETRASO DE PAGO</span>
                  <span className={`font-mono text-xs font-bold ${activeQueryClient.delinquencyDays > 0 ? 'text-rose-450 text-rose-400 font-bold' : 'text-emerald-400 font-bold'}`}>
                    {activeQueryClient.delinquencyDays === 0 ? '0 Días (Al Corriente)' : `${activeQueryClient.delinquencyDays} días activos`}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">CATEGORÍA EXPEDIENTE</span>
                  <span className="font-mono text-xs text-indigo-300 font-semibold uppercase">{activeQueryClient.category}</span>
                </div>
              </div>
            </div>

            {/* EVALUATION ACTION BOX */}
            <div className="mt-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-1 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
              <div className="flex gap-2.5 items-start">
                {activeQueryClient.creditScore >= riskParams.minScoreAutoApproval && activeQueryClient.delinquencyDays <= riskParams.maxDelinquencyDaysAllowed ? (
                  <div className="bg-emerald-500/15 text-emerald-400 p-2 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="bg-rose-500/15 text-rose-400 p-2 rounded-lg border border-rose-500/30">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-slate-100 text-xs">Evaluación Algorítmica de Buró</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 md:max-w-md">
                    {activeQueryClient.creditScore >= riskParams.minScoreAutoApproval && activeQueryClient.delinquencyDays <= riskParams.maxDelinquencyDaysAllowed
                      ? `Elegible para pre-aprobación inmediata. Tasa base estimada: ${(riskParams.baseInterestRate - (activeQueryClient.creditScore - 600) / 100).toFixed(2)}%`
                      : `No elegible para flujos automáticos. Requiere análisis manual de Harold Salazar o mitigantes.`}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded ${
                  activeQueryClient.creditScore >= riskParams.minScoreAutoApproval && activeQueryClient.delinquencyDays <= riskParams.maxDelinquencyDaysAllowed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {activeQueryClient.creditScore >= Math.max(riskParams.minScoreAutoApproval, 680) && activeQueryClient.delinquencyDays === 0 ? 'APROBABLE' : 'REVISIÓN REQUERIDA'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: PARAMETERS SIMULATOR & INHERENT ALERTS */}
      <div className="lg:col-span-5 space-y-6">
        {/* PARÁMETROS DE RIESGO DE BURÓ */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/80">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Consola de Políticas de Riesgo</h3>
          </div>

          <div className="space-y-5">
            {/* Slider 1: Score mínimo */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Score mínimo para Aprobación</span>
                <span className="font-mono font-bold text-indigo-400">{minScore} pts</span>
              </div>
              <input
                type="range"
                min="500"
                max="800"
                step="10"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Slider 2: Max delinquency allowed */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Días tolerados de moratoria</span>
                <span className="font-mono font-bold text-amber-500">{maxDelinquency} días</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={maxDelinquency}
                onChange={(e) => setMaxDelinquency(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Slider 3: Base interest rate */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Tasa de interés Base de Cartera</span>
                <span className="font-mono font-bold text-emerald-400">{interestRate}% anual</span>
              </div>
              <input
                type="range"
                min="8.0"
                max="24.0"
                step="0.5"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-505 accent-indigo-500"
              />
            </div>

            <button
              onClick={handleApplyParams}
              className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-200 font-mono text-xs font-semibold py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Aplicar Cambios en Políticas
            </button>
          </div>

          {/* Stress impact alert indicator */}
          <div className="mt-5 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-200">
            <Star className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold font-sans text-white">Impacto en Cartera Activa:</p>
              <p className="text-[10px] text-slate-300 font-sans mt-0.5">
                Bajo la política simulada (Mini-score: {minScore} y Máx-mora: {maxDelinquency}), un total de <span className="font-bold font-mono text-indigo-400">{clientsWithHighRisk.length} de {clients.length} clientes</span> se clasifican fuera de rango aprobado (Alto Riesgo).
              </p>
            </div>
          </div>
        </div>

        {/* LOGS HISTÓRICOS DE CONSULTAS REALIZADAS */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/80">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Historial Consultas de Sesión (Log)</h3>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {queries.map(q => (
              <div key={q.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>ID Consulta: {q.id}</span>
                  <span>{q.timestamp}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-200 text-xs truncate max-w-[170px]">{q.queriedClientName}</span>
                  <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 font-bold px-1.5 py-0.5 rounded">Score: {q.scoreFound}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic mt-0.5">{q.resolution}</p>
              </div>
            ))}
            {queries.length === 0 && (
              <p className="text-xs text-center text-slate-500 py-6 font-mono">Sin logs registrados en esta sesión.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
