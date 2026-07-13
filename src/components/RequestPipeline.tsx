import React, { useState } from 'react';
import { UserCheck, UserX, Plus, FileSpreadsheet, Check, CheckCircle, AlertOctagon, HelpCircle, CornerDownRight, ChevronRight, Sparkles, Trash2, Search } from 'lucide-react';
import { CreditRequest } from '../types';

interface RequestPipelineProps {
  requests: CreditRequest[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onAddRequest: (newReq: Omit<CreditRequest, 'id' | 'dateSubmitted' | 'status'>) => void;
  onClearDatabase?: () => Promise<boolean>;
  onDeleteRequest?: (id: string) => void;
}

export const RequestPipeline: React.FC<RequestPipelineProps> = ({
  requests,
  onApproveRequest,
  onRejectRequest,
  onAddRequest,
  onClearDatabase,
  onDeleteRequest
}) => {
  const [isSimulatingReq, setIsSimulatingReq] = useState(false);
  
  // Simulation Form State
  const [candName, setCandName] = useState('');
  const [amount, setAmount] = useState(10000);
  const [purpose, setPurpose] = useState('');
  const [score, setScore] = useState(710);
  const [category, setCategory] = useState<'Comercial' | 'Personal' | 'Pyme' | 'Hipotecario'>('Personal');

  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST' | 'AMOUNT_DESC' | 'AMOUNT_ASC' | 'SCORE_DESC' | 'SCORE_ASC'>('NEWEST');

  const filterAndSortRequests = (reqList: CreditRequest[]) => {
    const filtered = reqList.filter(r => {
      const matchesSearch = r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMinAmount = minAmount === '' ? true : r.requestedAmount >= minAmount;
      const matchesMaxAmount = maxAmount === '' ? true : r.requestedAmount <= maxAmount;

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(r.dateSubmitted) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(r.dateSubmitted) <= new Date(endDate + 'T23:59:59');
      }

      return matchesSearch && matchesMinAmount && matchesMaxAmount && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime();
      }
      if (sortBy === 'AMOUNT_DESC') {
        return b.requestedAmount - a.requestedAmount;
      }
      if (sortBy === 'AMOUNT_ASC') {
        return a.requestedAmount - b.requestedAmount;
      }
      if (sortBy === 'SCORE_DESC') {
        return b.score - a.score;
      }
      if (sortBy === 'SCORE_ASC') {
        return a.score - b.score;
      }
      return 0;
    });
  };

  const pendingRequests = filterAndSortRequests(requests.filter(r => r.status === 'PENDIENTE'));
  const resolvedRequests = filterAndSortRequests(requests.filter(r => r.status !== 'PENDIENTE'));

  const exportRequestsCSV = () => {
    const headers = "ID Solicitud,Solicitante,Monto Solicitado,Proposito,Segmento,Score Consulta,Fecha Envio,Estado Actual\n";
    const allFilteredSorted = [...pendingRequests, ...resolvedRequests];
    const rows = allFilteredSorted.map(r => 
      `"${r.id}","${r.clientName}",${r.requestedAmount},"${r.purpose}","${r.category}",${r.score},"${r.dateSubmitted}","${r.status}"`
    ).join('\n');
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `solicitudes_credito_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportRequestsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor habilita las ventanas emergentes (popups) de este navegador para proceder con la descarga del reporte PDF.");
      return;
    }

    const allFilteredSorted = [...pendingRequests, ...resolvedRequests];
    const requestRows = allFilteredSorted.map(r => `
      <tr style="border-bottom: 1px solid #e1e8ed;">
        <td style="padding: 10px 8px; font-weight: bold; font-family: monospace; font-size: 11px;">${r.id}</td>
        <td style="padding: 10px 8px;">
          <div style="font-weight: bold; font-size: 13px; color: #1e293b;">${r.clientName}</div>
          <div style="font-size: 11px; color: #64748b;">Motivo: ${r.purpose}</div>
        </td>
        <td style="padding: 10px 8px; font-weight: bold; font-family: monospace; font-size: 11px; color: #1e1b4b; text-align: right;">$${r.requestedAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px 8px; font-family: monospace; font-size: 11px; text-align: center;">${r.category}</td>
        <td style="padding: 10px 8px; text-align: center; font-weight: bold; color: ${r.score >= 700 ? '#10b981' : r.score >= 600 ? '#d97706' : '#dc2626'}; font-family: monospace; font-size: 11px;">${r.score}</td>
        <td style="padding: 10px 8px; font-family: monospace; font-size: 11px; text-align: center; color: #475569;">${r.dateSubmitted}</td>
        <td style="padding: 10px 8px; text-align: center; font-weight: bold; font-size: 10.5px; font-family: monospace; color: ${r.status === 'PENDIENTE' ? '#d97706' : r.status === 'APROBADO' ? '#059669' : '#dc2626'}">
          ${r.status}
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Solicitudes y Dictámenes de Crédito</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #334155; padding: 40px; margin: 0; background-color: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; }
            .logo-text { font-size: 22px; font-weight: bold; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; }
            .metadata { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }
            .title { text-align: center; margin-bottom: 25px; }
            .title h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #f8fafc; padding: 10px 8px; text-align: left; font-weight: bold; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px; color: #475569; }
            .footer { border-top: 1px dashed #cbd5e1; margin-top: 50px; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-text">SALDA APP</div>
            <div class="metadata">
              <p>FECHA: ${new Date().toLocaleDateString('es-MX')}</p>
              <p>EMISIÓN: Harold Anguiano (Admin)</p>
            </div>
          </div>
          <div class="title">
            <h1>Historial y Dictamen de Solicitudes de Crédito</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID Solicitud</th>
                <th>Acreditado</th>
                <th style="text-align: right;">Monto Solicitado</th>
                <th style="text-align: center;">Segmento</th>
                <th style="text-align: center;">Score</th>
                <th style="text-align: center;">Fecha Envio</th>
                <th style="text-align: center;">Dictamen</th>
              </tr>
            </thead>
            <tbody>
              ${requestRows}
            </tbody>
          </table>
          <div class="footer">
            <p>Salda App S.A. de C.V. • Control del Consolidado de Créditos Oficial.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !purpose) {
      alert('Ingresa el nombre del solicitante y el propósito del crédito.');
      return;
    }
    const amt = Number(amount);
    if (amt < 1000 || amt > 50000) {
      alert('La cantidad solicitada debe estar entre $1,000 y $50,000 MXN.');
      return;
    }

    onAddRequest({
      clientName: candName,
      requestedAmount: amt,
      purpose: purpose,
      score: Number(score),
      category: category
    });

    // Reset Form
    setCandName('');
    setAmount(10000);
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
              Autorización de Créditos
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onClearDatabase && (
              <button
                onClick={() => {
                  if (window.confirm("⚠️ ¿Estás seguro de que deseas limpiar TODOS los registros de la base de datos (Clientes, Solicitudes, Pagos, etc.) para comenzar tus pruebas reales? Esta acción es irreversible.")) {
                    onClearDatabase().then((success) => {
                      if (success) {
                        alert("✓ Base de datos reiniciada correctamente.");
                      } else {
                        alert("✕ Error al restablecer la base de datos.");
                      }
                    });
                  }
                }}
                className="bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold px-3 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-md cursor-pointer border border-red-500/50"
                title="Borrar todos los registros para pruebas limpias"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar BD (Pruebas)
              </button>
            )}

            <button
              onClick={exportRequestsCSV}
              className="border border-slate-700 bg-slate-800 hover:bg-slate-705 bg-slate-800 hover:bg-slate-700 text-slate-100 text-[11px] font-semibold px-3 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Exportar Excel
            </button>

            <button
              onClick={exportRequestsPDF}
              className="border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-[11px] font-semibold px-3 py-2 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
              Exportar PDF
            </button>

            <button
              onClick={() => setIsSimulatingReq(!isSimulatingReq)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md border border-indigo-500/40"
            >
              <Plus className="w-3.5 h-3.5" />
              Simular Solicitud Entrante
            </button>
          </div>
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
                min="1000"
                max="50000"
                placeholder="Ej. 15000"
                value={amount}
                onChange={(e) => setAmount(Math.min(50000, Math.max(0, Number(e.target.value))))}
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

      {/* SECCIÓN DE FILTROS AVANZADOS (ADMIN) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-left space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <span className="text-xs font-mono font-black text-[#a3c90e] uppercase tracking-wider">FILTRAR Y ORDENAR SOLICITUDES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Buscar */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase">Buscar Solicitante/RFC:</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Nombre, propósito o folio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-800 rounded-xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Rango de Fechas */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase">Rango de Fechas:</label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs p-1.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-300 w-full focus:outline-none"
              />
              <span className="text-slate-600 text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs p-1.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-300 w-full focus:outline-none"
              />
            </div>
          </div>

          {/* Rango de Montos */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase">Monto Solicitado:</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                placeholder="Mín"
                value={minAmount === '' ? '' : minAmount}
                onChange={(e) => setMinAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="text-xs p-1.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-300 w-full focus:outline-none"
              />
              <span className="text-slate-600 text-xs">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={maxAmount === '' ? '' : maxAmount}
                onChange={(e) => setMaxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="text-xs p-1.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-300 w-full focus:outline-none"
              />
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-500 uppercase">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs p-1.5 border border-slate-800 rounded-xl bg-slate-950 text-slate-300 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="NEWEST">Más recientes primero</option>
              <option value="OLDEST">Más antiguos primero</option>
              <option value="AMOUNT_DESC">Mayor monto solicitado</option>
              <option value="AMOUNT_ASC">Menor monto solicitado</option>
              <option value="SCORE_DESC">Mayor Score de buró</option>
              <option value="SCORE_ASC">Menor Score de buró</option>
            </select>
          </div>
        </div>
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
                        {req.loanType && (
                          <div className="mt-2.5 flex flex-col gap-0.5 bg-indigo-950/25 border border-indigo-900/40 p-2 rounded-lg">
                            <span className="text-[9.5px] uppercase font-mono font-bold text-indigo-300">
                              Tipo: {req.loanType}
                            </span>
                            {req.monthlyPlan && (
                              <span className="text-[9.5px] text-slate-300 font-sans leading-tight">
                                {req.monthlyPlan}
                              </span>
                            )}
                          </div>
                        )}
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
                        {onDeleteRequest && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la solicitud ${req.id} de ${req.clientName}?`)) {
                                onDeleteRequest(req.id);
                              }
                            }}
                            className="bg-slate-800 hover:bg-red-950 hover:text-red-400 hover:border-red-500/30 text-slate-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1 justify-center"
                            title="Eliminar Solicitud"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
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
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold uppercase ${approved ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {req.status}
                          </span>
                          {onDeleteRequest && (
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Deseas eliminar permanentemente la solicitud resuelta ${req.id} de ${req.clientName}?`)) {
                                  onDeleteRequest(req.id);
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 transition cursor-pointer border-none bg-transparent p-0 flex items-center"
                              title="Eliminar del histórico"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 className="font-bold text-xs text-slate-200 truncate">{req.clientName}</h4>
                      {req.loanType && (
                        <div className="text-[9.5px] text-indigo-400 font-mono font-bold leading-tight">
                          {req.loanType} {req.monthlyPlan && <span className="text-[9px] text-slate-400 font-sans font-normal italic">({req.monthlyPlan})</span>}
                        </div>
                      )}
                      
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
