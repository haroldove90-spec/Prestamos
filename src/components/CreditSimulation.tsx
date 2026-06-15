import React, { useState, useEffect } from 'react';
import { 
  Calculator, Calendar, ClipboardList, Download, 
  Printer, Sparkles, TrendingUp, RefreshCw, ChevronRight, Check, DollarSign, Award, ArrowUpRight,
  FileSpreadsheet
} from 'lucide-react';
import { Client } from '../types';

interface CreditSimulationProps {
  clients: Client[];
  currentUser: string;
}

interface AmortizationRow {
  period: number;
  date: string;
  payment: number;
  capital: number;
  interest: number;
  balance: number;
}

export const CreditSimulation: React.FC<CreditSimulationProps> = ({ clients, currentUser }) => {
  // Input states
  const [amount, setAmount] = useState<number>(10000);
  const [rate, setRate] = useState<number>(14.5);
  const [months, setMonths] = useState<number>(12);
  const [frequency, setFrequency] = useState<'Mensual' | 'Quincenal' | 'Semanal'>('Mensual');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  // Calculated outputs
  const [periodicPayment, setPeriodicPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationRow[]>([]);
  const [savedSimulations, setSavedSimulations] = useState<any[]>([]);

  // Prefill simulator based on selected existing client score & membership
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        // Suggested values based on real client stats
        setAmount(Math.min(50000, Math.max(10000, client.totalCreditGranted || 10000)));
        
        let baseRate = 14.5; // base
        if (client.membership === 'Premium') baseRate = 12.5; // VIP discount
        else if (client.membership === 'Básica') baseRate = 14.0; // Basic
        else if (client.creditScore >= 720) baseRate = 13.0; // Excellent credit
        
        setRate(baseRate);
      }
    }
  }, [selectedClientId, clients]);

  const calculateAmortization = () => {
    const P = amount;
    const annualRate = rate / 100;
    
    // Set frequency factors
    let periodsPerYear = 12;
    if (frequency === 'Quincenal') periodsPerYear = 24;
    else if (frequency === 'Semanal') periodsPerYear = 52;
    
    const totalPeriods = Math.round((months / 12) * periodsPerYear);
    const periodicRate = annualRate / periodsPerYear;
    
    // PMT formula: P * r * (1+r)^n / ((1+r)^n - 1)
    let pmt = 0;
    if (periodicRate === 0) {
      pmt = P / totalPeriods;
    } else {
      pmt = P * (periodicRate * Math.pow(1 + periodicRate, totalPeriods)) / (Math.pow(1 + periodicRate, totalPeriods) - 1);
    }
    
    setPeriodicPayment(pmt);
    
    // Construct schedule with declining balance
    let remainingBalance = P;
    const schedule: AmortizationRow[] = [];
    let accumInterest = 0;
    const startDate = new Date();
    
    for (let i = 1; i <= totalPeriods; i++) {
      const interestPayment = remainingBalance * periodicRate;
      const capitalPayment = pmt - interestPayment;
      remainingBalance = Math.max(0, remainingBalance - capitalPayment);
      accumInterest += interestPayment;
      
      // Calculate future dates based on payment frequency
      const payDate = new Date(startDate);
      if (frequency === 'Mensual') {
        payDate.setMonth(startDate.getMonth() + i);
      } else if (frequency === 'Quincenal') {
        payDate.setDate(startDate.getDate() + (i * 15));
      } else if (frequency === 'Semanal') {
        payDate.setDate(startDate.getDate() + (i * 7));
      }

      schedule.push({
        period: i,
        date: payDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }),
        payment: pmt,
        capital: capitalPayment,
        interest: interestPayment,
        balance: remainingBalance
      });
    }
    
    setTotalInterest(accumInterest);
    setAmortizationSchedule(schedule);
  };

  // Run calculation initially and on parameter change
  useEffect(() => {
    calculateAmortization();
  }, [amount, rate, months, frequency]);

  const handleSaveSimulation = () => {
    const clientName = selectedClientId 
      ? clients.find(c => c.id === selectedClientId)?.name || 'Anónimo'
      : 'Prospecto Nuevo';
      
    const newSim = {
      id: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName,
      amount,
      rate,
      months,
      frequency,
      periodicPayment,
      totalInterest,
      dateSaved: new Date().toLocaleDateString('es-MX') + ' ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };
    
    setSavedSimulations(prev => [newSim, ...prev]);
  };

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleExportCSV = () => {
    const clientName = selectedClientId 
      ? clients.find(c => c.id === selectedClientId)?.name || 'Prospecto Unificado'
      : 'Prospecto General';
      
    const headers = "Periodo,Fecha de Vencimiento,Cuota Total (MXN),Abono a Capital (MXN),Intereses Ordinarios (MXN),Saldo Insoluto Restante (MXN)\n";
    const rows = amortizationSchedule.map(p => 
      `${p.period},"${p.date}",${p.payment.toFixed(2)},${p.capital.toFixed(2)},${p.interest.toFixed(2)},${p.balance.toFixed(2)}`
    ).join('\n');
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `simulacion_${clientName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const clientName = selectedClientId 
      ? clients.find(c => c.id === selectedClientId)?.name || 'Prospecto Unificado'
      : 'Prospecto General';
      
    const clientRfc = selectedClientId 
      ? clients.find(c => c.id === selectedClientId)?.rfc || 'XAXX010101000'
      : 'XAXX010101000';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor habilita las ventanas emergentes (popups) de este navegador para proceder con la descarga del reporte de simulación.");
      return;
    }
    
    // Construct rows HTML
    const scheduleRows = amortizationSchedule.map(p => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: bold; font-family: monospace;">${p.period}</td>
        <td style="padding: 10px; font-family: inherit;">${p.date}</td>
        <td style="padding: 10px; font-weight: bold; color: #1e1b4b;">${formatMXN(p.payment)}</td>
        <td style="padding: 10px; color: #475569;">${formatMXN(p.capital)}</td>
        <td style="padding: 10px; color: #475569;">${formatMXN(p.interest)}</td>
        <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #1e293b;">${formatMXN(p.balance)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Simulación de Préstamo - Salda App</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
            .badge { background-color: #eef2ff; color: #4338ca; font-size: 11px; padding: 4px 10px; border-radius: 9999px; font-weight: bold; display: inline-block; }
            .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
            .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; }
            .results-box { background: #eef2ff; border: 1px solid #c7d2fe; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 15px; }
            th { text-align: left; background-color: #1e1b4b; color: white; padding: 12px 10px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
            .footer { margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 20px; font-size: 10px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1 style="color: #4f46e5; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -1px;">SALDA APP</h1>
              <p style="margin: 3px 0 0 0; font-size: 11px; color: #475569; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Simulador de Crédito e Inteligencia Financiera</p>
            </div>
            <div style="text-align: right; font-family: monospace; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 4px 0;">FOLIO REGISTRO: SIM-${Math.floor(100500 + Math.random() * 899000)}</p>
              <p style="margin: 0 0 4px 0;">FECHA GENERACIÓN: ${new Date().toLocaleDateString('es-MX')}</p>
              <p style="margin: 0;">EMITIDO POR: Harold Salazar (@admin_harold)</p>
            </div>
          </div>

          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">Expediente del Cliente Asociado</h3>
            <p style="margin: 0; font-size: 15px; font-weight: bold; color: #0f172a;">${clientName} <span style="font-weight: normal; color: #64748b; font-size: 13px;">(RFC: ${clientRfc})</span></p>
          </div>

          <div class="metric-grid">
            <div class="metric-card">
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Monto de Crédito</span>
              <strong style="color: #0f172a; font-size: 20px; display: block; margin-top: 3px;">${formatMXN(amount)} MXN</strong>
            </div>
            <div class="metric-card">
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Tasa de Interés (CAT)</span>
              <strong style="color: #0f172a; font-size: 20px; display: block; margin-top: 3px;">${rate}% Anual</strong>
            </div>
            <div class="metric-card">
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; display: block;">Plazo & Frecuencia</span>
              <strong style="color: #0f172a; font-size: 20px; display: block; margin-top: 3px;">${months} Meses (${frequency})</strong>
            </div>
          </div>

          <div class="results-box">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #c7d2fe; padding-bottom: 12px; margin-bottom: 12px;">
              <div>
                <span style="font-size: 11px; color: #4338ca; text-transform: uppercase; font-weight: bold;">Pago Cuota Periódica (${frequency})</span>
                <strong style="color: #4338ca; font-size: 24px; display: block; margin-top: 3px;">${formatMXN(periodicPayment)} MXN</strong>
              </div>
              <div style="text-align: right;">
                <span class="badge">SISTEMA RECALCULADO</span>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; font-size: 13px;">
              <div>
                <span style="color: #475569; display: block;">Monto Capital Solicitado:</span>
                <strong style="color: #0c1033; font-size: 15px;">${formatMXN(amount)} MXN</strong>
              </div>
              <div>
                <span style="color: #475569; display: block;">Costo Total por Interés Ord:</span>
                <strong style="color: #0c1033; font-size: 15px;">+ ${formatMXN(totalInterest)} MXN</strong>
              </div>
            </div>
            
            <div style="border-top: 1px solid #c7d2fe; margin-top: 12px; padding-top: 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; color: #1e1b4b;">
              <span>Monto Total a Devolver (Insoluto acumulado):</span>
              <span>${formatMXN(amount + totalInterest)} MXN</span>
            </div>
          </div>

          <h3 style="font-size: 14px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 10px; text-transform: uppercase; font-family: monospace;">TABLA DE AMORTIZACIÓN PROYECTADA</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 10%;">Cuota</th>
                <th style="width: 25%;">Vencimiento Estimado</th>
                <th style="width: 20%;">Monto Pago</th>
                <th style="width: 15%;">Amortig. Capital</th>
                <th style="width: 15%;">Interés Cuota</th>
                <th style="width: 15%;">Saldo Capital</th>
              </tr>
            </thead>
            <tbody>
              ${scheduleRows}
            </tbody>
          </table>

          <div class="footer">
            <p>La simulación es de carácter informativo. No representa oferta de financiamiento definitiva ni desembolso inmediato garantizado. Todo crédito está subordinado a validación documental previa.</p>
            <p style="margin-top: 8px; font-weight: bold; color: #334155;">Salda App S.A. de C.V. • Harold Salazar • Monterrey, N.L.</p>
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

  return (
    <div className="space-y-6">
      {/* HEADER TILE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
              <Calculator className="w-5 h-5 text-indigo-400" />
              Simulador de Crédito
            </h2>
          </div>

          <div className="bg-slate-950 px-4 py-2 border border-slate-800 rounded-2xl flex items-center gap-3 font-mono text-[10px]">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 uppercase block leading-none">Interés Base</span>
              <strong className="text-slate-200 text-xs mt-0.5 block">14.5% Anual</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* PARAMS SELECTOR FORM (LG:COL-SPAN-4) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-md space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#a3c90e]" />
              Parámetros de Simulación
            </h4>

            {/* Link Client */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-mono font-bold text-slate-500">Filtrar por Cliente Existente</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer text-left"
              >
                <option value="">-- Prospecto Nuevo (Sin expediente central) --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.membership === 'Premium' ? '⭐ VIP' : c.membership === 'Básica' ? '✓ Básica' : 'Regular'}, Score: {c.creditScore})
                  </option>
                ))}
              </select>
              {selectedClientId && (
                <p className="text-[9px] text-[#a3c90e] font-mono">
                  ✓ Configuración auto-ajustada al perfil del expediente de riesgo.
                </p>
              )}
            </div>

            {/* Mount Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                <span className="uppercase text-slate-500 font-bold">Monto del Crédito</span>
                <span className="text-[#a3c90e] font-black italic">{formatMXN(amount)} MXN</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#a3c90e]"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>$1,000</span>
                <span>$25,000</span>
                <span>$50,000</span>
              </div>
            </div>

            {/* Month terms slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                <span className="uppercase text-slate-500 font-bold">Plazo de Pago (Meses)</span>
                <span className="text-[#a3c90e] font-black italic">{months} meses</span>
              </div>
              <input
                type="range"
                min="3"
                max="36"
                step="3"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#a3c90e]"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>3 meses</span>
                <span>18 meses</span>
                <span>36 meses</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Annual Interest Rate */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-500">Tasa Anual (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="50"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value) || 14.5)}
                    disabled={currentUser !== 'admin_harold'}
                    className={`w-full border text-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 ${
                      currentUser === 'admin_harold' 
                        ? 'bg-slate-950 border-slate-800 focus:ring-1 focus:ring-[#a1c60d]' 
                        : 'bg-slate-900 border-slate-850/80 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 text-[10px] font-mono font-bold">%</span>
                </div>
                {currentUser !== 'admin_harold' && (
                  <p className="text-[9px] text-amber-500/80 font-semibold leading-tight mt-1">
                    🔒 El Supervisor Harold Salazar bloqueó los ajustes a la tasa anual.
                  </p>
                )}
              </div>

              {/* Recurrence Frequency */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-500">Periodicidad</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Semanal">Semanal</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2">
              <button
                onClick={handleSaveSimulation}
                className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-850 text-slate-200 text-[10px] font-bold transition cursor-pointer"
                title="Guardar Simulación"
              >
                <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
                <span>Guardar</span>
              </button>
              
              <button
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-1 py-1 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white text-[10px] font-bold transition cursor-pointer shadow-md"
                title="Exportar a PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Exp. PDF</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-1 py-1 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition cursor-pointer border border-slate-700"
                title="Exportar a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exp. Excel</span>
              </button>
            </div>
          </div>

          {/* HISTORIC SAVED RUNS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md space-y-3.5">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
              Historial de Simulación local
            </h4>

            {savedSimulations.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic py-2 text-center leading-relaxed">
                Ninguna simulación guardada en esta sesión operativa. Presiona "Guardar Sim." arriba.
              </p>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {savedSimulations.map((s) => (
                  <div key={s.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 space-y-1">
                    <div className="flex justify-between text-[8px] font-mono">
                      <span className="text-indigo-400 font-extrabold">{s.id}</span>
                      <span className="text-slate-500">{s.dateSaved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-200 max-w-[120px] truncate">{s.clientName}</span>
                      <span className="text-[11px] font-mono font-black text-indigo-400">{formatMXN(s.amount)}</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>{s.months} meses / {s.frequency}</span>
                      <span className="font-bold text-[#a3c90e]">Pago: {formatMXN(s.periodicPayment)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS & DETAILED SCHEDULING (LG:COL-SPAN-8) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-3xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5 md:border-r md:border-slate-800 pr-2">
              <span className="text-[10px] uppercase font-mono font-bold text-[#a3c90e] tracking-wider block">Pago Estimado Cuota</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-mono font-black text-white">{formatMXN(periodicPayment)}</span>
                <span className="text-[9px] text-[#a3c90e] font-mono uppercase font-black">{frequency}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Proyección compuesta sobre saldo capital amortizado de {formatMXN(amount)} con interés del {rate}% CAT.
              </p>
            </div>

            <div className="space-y-2 text-xs pl-0 md:pl-2">
              <div className="flex justify-between border-b border-indigo-500/5 pb-1">
                <span className="text-slate-400">Total Intereses:</span>
                <span className="font-mono text-slate-200 mt-0.5 block font-bold">+{formatMXN(totalInterest)}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-500/5 pb-1 font-bold text-sm">
                <span className="text-slate-300">Total a Pagar:</span>
                <span className="font-mono text-[#a3c90e] block font-black">{formatMXN(amount + totalInterest)}</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-[#a3c90e] bg-[#a3c90e]/5 border border-[#a3c90e]/15 p-1 rounded-lg">
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>Exento de comisión por uso del portal Harold Salazar.</span>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-md">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">
                Tabla de Amortproject (Proyectada)
              </h4>
              <span className="text-[9px] bg-slate-950 text-slate-450 border border-slate-850 px-2.5 py-0.5 rounded font-mono uppercase">
                {amortizationSchedule.length} Cuotas
              </span>
            </div>

            <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[9px] font-mono text-slate-500 uppercase">
                    <th className="py-2.5 bg-transparent text-slate-450 font-bold">Enlace/No.</th>
                    <th className="py-2.5 bg-transparent text-slate-455 font-bold">Vence en</th>
                    <th className="py-2.5 bg-transparent text-slate-450 font-bold">Pago Total</th>
                    <th className="py-2.5 bg-transparent text-slate-450 font-bold">Amort. Capital</th>
                    <th className="py-2.5 bg-transparent text-slate-450 font-bold">Interés Pago</th>
                    <th className="py-2.5 bg-transparent text-slate-450 font-bold text-right">Saldo Insoluto</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] divide-y divide-slate-850/60 font-mono">
                  {amortizationSchedule.map((row) => (
                    <tr key={row.period} className="hover:bg-slate-950/20">
                      <td className="py-2 text-indigo-400 font-extrabold">{row.period}</td>
                      <td className="py-2 text-slate-300">{row.date}</td>
                      <td className="py-2 font-bold text-white">{formatMXN(row.payment)}</td>
                      <td className="py-2 text-slate-400">{formatMXN(row.capital)}</td>
                      <td className="py-2 text-slate-400">{formatMXN(row.interest)}</td>
                      <td className="py-2 text-slate-300 text-right font-bold">{formatMXN(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
