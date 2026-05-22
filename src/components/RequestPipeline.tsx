import React, { useState } from 'react';
import { UserCheck, UserX, Plus, FileSpreadsheet, Check, CheckCircle, AlertOctagon, HelpCircle, CornerDownRight, ChevronRight, Sparkles } from 'lucide-react';
import { CreditRequest } from '../types';

interface RequestPipelineProps {
  requests: CreditRequest[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onAddRequest: (newReq: Omit<CreditRequest, 'id' | 'dateSubmitted' | 'status'>) => void;
}

export const RequestPipeline: React.FC<RequestPipelineProps> = ({
  requests,
  onApproveRequest,
  onRejectRequest,
  onAddRequest,
}) => {
  const [isSimulatingReq, setIsSimulatingReq] = useState(false);
  
  // Simulation Form State
  const [candName, setCandName] = useState('');
  const [amount, setAmount] = useState(250000);
  const [purpose, setPurpose] = useState('');
  const [score, setScore] = useState(710);
  const [category, setCategory] = useState<'Comercial' | 'Personal' | 'Pyme' | 'Hipotecario'>('Personal');

  const pendingRequests = requests.filter(r => r.status === 'PENDIENTE');
  const resolvedRequests = requests.filter(r => r.status !== 'PENDIENTE');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !purpose) {
      alert('Ingresa el nombre del solicitante y el propósito del crédito.');
      return;
    }

    onAddRequest({
      clientName: candName,
      requestedAmount: Number(amount),
      purpose: purpose,
      score: Number(score),
      category: category
    });

    // Reset Form
    setCandName('');
    setAmount(250000);
    setPurpose('');
    setScore(710);
    setCategory('Personal');
    setIsSimulatingReq(false);
  };

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* TITLE & QUICK FORM */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              Triage y Pipeline de Solicitudes
            </h2>
            <p className="text-xs text-slate-400">
              Analiza solicitudes entrantes, evalúa el score y decide aprobación expedita o rechazo por riesgo.
            </p>
          </div>

          <button
            onClick={() => setIsSimulatingReq(!isSimulatingReq)}
            className="bg-indigo-650 hover:bg-slate-800 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md border border-indigo-500/40"
          >
            <Plus className="w-4 h-4" />
            Simular Solicitud Entrante
          </button>
        </div>

        {isSimulatingReq && (
          <div className="space-y-4 pt-5 transition-all duration-300">
            <div className="bg-slate-950/60 border border-indigo-500/25 rounded-xl p-3.5 text-xs text-indigo-300 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-white">Auto-Generador de Referencia Unificada:</span> Al enviar este prerregistro, se reservará un número de identificación único (p. ej., <code className="text-[#a3c90e] bg-[#a3c90e]/10 px-1 py-0.5 rounded font-mono font-bold">PM-XXXXXX</code>) para la solicitud de crédito. Cuando Harold autorice este financiamiento, el expediente del cliente adoptará <strong>el mismo número</strong>. Al realizar abonos, este número servirá también como el número correlativo para la conciliación de su pago de muestra.
              </div>
            </div>
            
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre del Solicitante *</label>
              <input
                type="text"
                required
                placeholder="Ej. Comercializadora del Centro S.A."
                value={candName}
                onChange={(e) => setCandName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white placeholder-slate-505 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Monto Solicitado (MXN) *</label>
              <input
                type="number"
                required
                min="10000"
                placeholder="Ej. 150000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Propósito del Financiamiento *</label>
              <input
                type="text"
                required
                placeholder="Ej. Línea revolvente para inventario"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Segmento Crédito</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-200"
              >
                <option value="Personal" className="bg-slate-950">Personal</option>
                <option value="Comercial" className="bg-slate-950">Comercial</option>
                <option value="Pyme" className="bg-slate-950">Pyme</option>
                <option value="Hipotecario" className="bg-slate-950">Hipotecario</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 font-sans">Score de Consulta Predictivo</label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="300"
                  max="850"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="font-mono text-xs font-bold text-center px-1.5 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded">{score}</span>
              </div>
            </div>

            <div className="flex items-end justify-end md:col-span-2 lg:col-span-1 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSimulatingReq(false)}
                className="bg-slate-800 hover:bg-slate-755 text-slate-200 font-sans border border-slate-705 border-slate-700 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer animate-none"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-md cursor-pointer whitespace-nowrap"
              >
                Enviar Solicitud
              </button>
            </div>
          </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BANDEJA SOLICITUDES PENDIENTES */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Bandeja de Pendientes ({pendingRequests.length})</span>
              <span className="bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold font-sans">En Espera de Harold</span>
            </h3>

            <div className="space-y-4">
              {pendingRequests.map(req => {
                return (
                  <div key={req.id} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-950/90 transition-all duration-150 flex flex-col justify-between gap-3 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[9px] font-mono font-bold text-slate-500 uppercase">{req.id} • {req.dateSubmitted}</div>
                        <h4 className="font-bold text-white text-sm mt-0.5">{req.clientName}</h4>
                        <div className="text-[10px] text-slate-400 italic mt-0.5">Motivo: {req.purpose}</div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-slate-800 font-mono">
                          {req.category}
                        </span>
                        <div className="mt-1 flex items-center justify-end gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500">Score:</span>
                          <span className={`font-mono text-xs font-bold ${
                            req.score >= 700 ? 'text-emerald-450 text-emerald-400' :
                            req.score >= 600 ? 'text-indigo-405 text-indigo-400' :
                            req.score >= 500 ? 'text-amber-455 text-amber-400' : 'text-rose-455 text-rose-400'
                          }`}>
                            {req.score}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-2">
                      <div className="text-xs font-mono">
                        <span className="text-slate-500">Monto:</span>{' '}
                        <span className="font-bold text-white text-sm">{formatMXN(req.requestedAmount)}</span>
                      </div>

                      <div className="flex gap-1.5 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                        <button
                          onClick={() => onRejectRequest(req.id)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-rose-500/20 transition cursor-pointer flex items-center gap-1 sm:w-auto w-1/2 justify-center"
                        >
                          <UserX className="w-3 h-3" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => onApproveRequest(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition border border-emerald-600/10 cursor-pointer flex items-center gap-1 sm:w-auto w-1/2 justify-center"
                        >
                          <UserCheck className="w-3 h-3" />
                          Aprobar Crédito
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {pendingRequests.length === 0 && (
                <div className="text-center py-12 text-slate-500 max-w-xs mx-auto">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2.5 animate-pulse" />
                  <p className="text-xs font-bold font-sans text-white">¡Bandeja Completada!</p>
                  <p className="text-[11px] text-slate-500 mt-1">No quedan solicitudes en espera de Harold. Puedes simular operaciones arriba.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HISTORIAL RESOLUCIONES RECIENTES */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-3">
              Histórico de Resoluciones de Sesión
            </h3>

            <div className="space-y-3 max-h-[460px] overflow-y-auto scrollbar-thin">
              {resolvedRequests.map(req => {
                const approved = req.status === 'APROBADO';
                return (
                  <div key={req.id} className={`p-3.5 rounded-xl border flex items-start gap-3 transition duration-150 ${
                    approved 
                      ? 'bg-emerald-50/10 border-emerald-500/25' 
                      : 'bg-slate-950/40 border-slate-800/85'
                  }`}>
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      approved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {approved ? <Check className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1 w-full min-w-0">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
                        <span>ID: {req.id}</span>
                        <span className={`font-bold uppercase ${approved ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {req.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-200 truncate">{req.clientName}</h4>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-dotted border-slate-800 font-mono">
                        <span className="font-bold text-slate-300">{formatMXN(req.requestedAmount)}</span>
                        <span>Score: <strong className="font-mono text-slate-300">{req.score}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {resolvedRequests.length === 0 && (
                <p className="text-xs text-center text-slate-500 py-12 font-mono italic">
                  Ninguna resolución guardada en esta sesión.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
