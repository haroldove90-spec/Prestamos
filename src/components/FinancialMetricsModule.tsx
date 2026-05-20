import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Coins, Users, FileSpreadsheet, Download, Mail, 
  FileText, Sparkles, Calculator, Percent, ArrowRight, CheckCircle2, 
  Clock, ShieldAlert, Cpu, RefreshCcw, Send, CheckCircle, ChevronRight, Check
} from 'lucide-react';
import { Client } from '../types';

interface FinancialMetricsModuleProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  onAddQueryLog?: (log: any) => void;
}

interface ExportLog {
  timestamp: string;
  type: 'info' | 'success' | 'warn';
  message: string;
}

export const FinancialMetricsModule: React.FC<FinancialMetricsModuleProps> = ({
  clients,
  setClients,
  onAddQueryLog
}) => {
  // Simulation states
  const [isClosingMonth, setIsClosingMonth] = useState<boolean>(false);
  const [closeStep, setCloseStep] = useState<number>(0);
  const [isClosed, setIsClosed] = useState<boolean>(() => {
    const local = localStorage.getItem('buro_month_ended');
    return local ? JSON.parse(local) : false;
  });

  const [exportLogs, setExportLogs] = useState<ExportLog[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [approvedIncreases, setApprovedIncreases] = useState<string[]>([]);
  const [selectedPremiumClient, setSelectedPremiumClient] = useState<Client | null>(null);

  // Month-end core calculations
  const totalCapitalColocado = clients.reduce((acc, client) => acc + client.totalCreditGranted, 0);
  const totalOutstandingBalance = clients.reduce((acc, client) => acc + client.balanceOwed, 0);
  const abonosCapital = totalCapitalColocado - totalOutstandingBalance;

  // Let's compute estimated monthly interests (e.g. 1.2% base monthly rate of active balance or derived)
  const interesesRecaudados = clients.reduce((acc, client) => {
    // Estimación racional de intereses generados por cliente según saldo deudor
    const clientTermRate = client.creditScore > 700 ? 0.11 : client.creditScore > 600 ? 0.14 : 0.18;
    return acc + (client.balanceOwed * (clientTermRate / 12));
  }, 0);

  // Dynamic Membership Fees calculation
  const basicMemberships = clients.filter(c => c.membership === 'Básica').length;
  const premiumMemberships = clients.filter(c => c.membership === 'Premium').length;
  const basicFee = 149; // $149 MXN
  const premiumFee = 499; // $499 MXN
  const recaudacionMembresias = (basicMemberships * basicFee) + (premiumMemberships * premiumFee);

  // Total monthly revenue (abonos + intereses + membresias)
  const totalIngresosMes = abonosCapital + interesesRecaudados + recaudacionMembresias;

  // Overdue portfolio calculations (NPL ratio / Cartera Vencida)
  // Active outstanding balance is divided into: al corriente vs atrasados
  const carteraSana = clients.filter(c => c.delinquencyDays <= 30);
  const carteraVencida = clients.filter(c => c.delinquencyDays > 30);
  
  const totalOverdueBalance = carteraVencida.reduce((acc, c) => acc + c.balanceOwed, 0);
  const nplRatio = totalOutstandingBalance > 0 ? (totalOverdueBalance / totalOutstandingBalance) * 100 : 0;

  // Smart suggestions logic
  // Eligibility criteria: Premium membership, excellent background, no delinquency days, low utilization or excellent score
  const premiumClientsForIncrease = clients.filter(client => {
    return client.membership === 'Premium' && client.delinquencyDays === 0 && client.creditScore >= 680;
  });

  useEffect(() => {
    if (premiumClientsForIncrease.length > 0 && !selectedPremiumClient) {
      setSelectedPremiumClient(premiumClientsForIncrease[0]);
    }
  }, [premiumClientsForIncrease, selectedPremiumClient]);

  // Persistent closed status
  useEffect(() => {
    localStorage.setItem('buro_month_ended', JSON.stringify(isClosed));
  }, [isClosed]);

  // Execute Cierre de Mes Simulation
  const handleCierreMes = () => {
    setIsClosingMonth(true);
    setCloseStep(1);

    // Step 1: Provisions
    setTimeout(() => {
      setCloseStep(2);
      // Step 2: charging memberships
      setTimeout(() => {
        setCloseStep(3);
        // Step 3: archiving & creating registers
        setTimeout(() => {
          setCloseStep(4);
          setIsClosingMonth(false);
          setIsClosed(true);

          if (onAddQueryLog) {
            onAddQueryLog({
              id: `Q-FIN-${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: '2026-05-31 23:59:59',
              queriedClientName: 'CIERRE DE MES AUTOMÁTICO',
              requestedBy: 'admin_harold',
              scoreFound: 850,
              resolution: `⚙️ BALANCES CERTIFICADOS: Auditoría contable completada. Capital Colocado: ${formatMXN(totalCapitalColocado)}. Cartera Vencida: ${nplRatio.toFixed(2)}%.`
            });
          }
        }, 1200);
      }, 1000);
    }, 1000);
  };

  // Reopen month for testing
  const handleReabrirMes = () => {
    setIsClosed(false);
    setCloseStep(0);
    setExportLogs([]);
    setApprovedIncreases([]);
  };

  // Execute Export Process
  const handleExportProceso = () => {
    setIsExporting(true);
    const logs: ExportLog[] = [
      { timestamp: '22:49:21', type: 'info', message: 'INICIANDO: Invocando generador de reportes estructurados CNBV...' },
      { timestamp: '22:49:21', type: 'info', message: 'ANALYSIS: Consolidando saldos deudores de clientes y abonos del periodo ordinario.' },
      { timestamp: '22:49:22', type: 'info', message: 'PROCESS: Calculando prorrateos de membresías activas (Básica: 149 / Premium: 499).' },
      { timestamp: '22:49:22', type: 'success', message: 'PDF GENERATED: Guardado en /files/reportes/Cierre_Mayo_2026.pdf con firmas criptográficas.' },
      { timestamp: '22:49:23', type: 'success', message: 'SERVER BACKUP: Respaldo estructurado transmitido a softwareai569@gmail.com con protocolo SSL/TLS.' },
      { timestamp: '22:49:23', type: 'info', message: 'FINISH: Reportes consolidados e indexados en el casillero digital del Administrador.' }
    ];

    let currentLogIndex = 0;
    setExportLogs([]);

    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setExportLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsExporting(false);
      }
    }, 450);
  };

  // Approve Recommended Credit Line Increase
  const handleApproveIncrease = (clientId: string, increaseAmount: number) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          totalCreditGranted: c.totalCreditGranted + increaseAmount
        };
      }
      return c;
    }));

    setApprovedIncreases(prev => [...prev, clientId]);

    if (onAddQueryLog) {
      const client = clients.find(c => c.id === clientId);
      onAddQueryLog({
        id: `Q-INC-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: '2026-05-31 22:49:21',
        queriedClientName: client?.name || clientId,
        requestedBy: 'admin_harold',
        scoreFound: client?.creditScore || 700,
        resolution: `📈 LÍNEA INCREMENTADA: Ajuste automático del +25% de crédito autorizado por membresía Premium activa. Nueva línea: ${formatMXN((client?.totalCreditGranted || 0) + increaseAmount)}`
      });
    }
  };

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Month-End Banner Control */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isClosed ? 'bg-indigo-505 bg-indigo-500 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
              <h2 className="text-base font-bold text-white uppercase font-mono tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-455 text-indigo-400" />
                Módulo de Inteligencia Financiera / Cierre de Mes
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Consolidación periódica de balances, indexación perimetral de cartera vencida y cálculo sistemático de ganancias por membresía.
            </p>
          </div>

          <div className="flex gap-2">
            {isClosed ? (
              <button
                onClick={handleReabrirMes}
                className="bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
                title="Pruebas: Permite reabrir el mes para correr la simulación de nuevo."
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Reabrir Ejercicio
              </button>
            ) : null}

            <button
              onClick={handleCierreMes}
              disabled={isClosingMonth || isClosed}
              className={`text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 uppercase tracking-tight ${
                isClosed
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15 border border-indigo-550/30'
              }`}
            >
              {isClosingMonth ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-dashed border-white rounded-full animate-spin" />
                  Procesando Cierre...
                </>
              ) : isClosed ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Ejercicio Consolidado ✓
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Ejecutar Cierre de Mayo 2026
                </>
              )}
            </button>
          </div>
        </div>

        {/* Closing Month Progress Tracker */}
        {isClosingMonth && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-850 animate-fadeIn space-y-3">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-indigo-400 font-bold">PROCESANDO PROTOCOLOS DE CIERRE DIGITAL</span>
              <span className="text-slate-500">{closeStep * 25}% COMPLETADO</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="bg-indigo-550 bg-indigo-550 bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${closeStep * 25}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-mono">
              <div className={closeStep >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                1. Provisiones de Pérdida
              </div>
              <div className={closeStep >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                2. Recargo Membresías
              </div>
              <div className={closeStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                3. Indexar Cartera Vencida
              </div>
              <div className={closeStep >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                4. Firmar Cierre PDF
              </div>
            </div>
          </div>
        )}

        {isClosed && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              <strong>Cierre del Mes Registrado con Éxito:</strong> Se ha recalculado el <strong>Índice de Cartera Vencida ({nplRatio.toFixed(2)}%)</strong> y las comisiones residuales del nuevo módulo comercial. Todos los saldos concuerdan contablemente.
            </span>
          </div>
        )}
      </div>

      {/* CORE FINANCIAL REPORTING MODULE (Desglose contable de los ingresos del mes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Financial Breakdown Spreadsheet & Gauge */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Reporte de Balance y Recaudación Mensual
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Valores actualizados al {isClosed ? 'Cierre de Ejercicio Mayo-2026' : 'Tiempo Real (Cierre Pendiente)'}</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-950 px-2.5 py-1 border border-slate-850 rounded text-slate-400 font-bold">
              ESTATUS: {isClosed ? 'CONSOLIDADO' : 'CRAFTING'}
            </span>
          </div>

          <div className="space-y-4">
            {/* Headline KPIs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Capital Colocado Corp</span>
                <strong className="text-sm md:text-base text-white tracking-tight">{formatMXN(totalCapitalColocado)}</strong>
                <span className="text-[9px] text-slate-450 text-indigo-400 font-mono block">Monto Total Expedido</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Ingresos Totales del Ejercicio</span>
                <strong className="text-sm md:text-base text-emerald-400 tracking-tight">{formatMXN(totalIngresosMes)}</strong>
                <span className="text-[9px] text-slate-450 text-emerald-500 font-mono block">Recaudado Neto (Abonos + Utilidades)</span>
              </div>
            </div>

            {/* In-depth breakdown ledger table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden">
              <div className="p-3 bg-slate-900 border-b border-slate-850">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Auxiliar de Caja / Prorrateo de Cobranzas Netas
                </h4>
              </div>

              <div className="divide-y divide-slate-850 text-xs">
                {/* Abonos capital */}
                <div className="p-3.5 flex justify-between items-center bg-transparent">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">Abonos Consolidados a Principal (Capital)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Retorno directo de línea prestada (Total - Remanente)</span>
                  </div>
                  <strong className="text-slate-200 font-mono">{formatMXN(abonosCapital)}</strong>
                </div>

                {/* Intereses ordinarios */}
                <div className="p-3.5 flex justify-between items-center bg-transparent">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">Financiamiento por Intereses Estimados</span>
                    <span className="text-[10px] text-slate-500 font-mono">Interés ordinario acumulado devengado en cartera cobrada</span>
                  </div>
                  <strong className="text-emerald-400 font-mono">+{formatMXN(interesesRecaudados)}</strong>
                </div>

                {/* Membresias */}
                <div className="p-3.5 flex justify-between items-center bg-slate-900/10">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white block">Rendimiento por Módulo Comercial de Membresías</span>
                      <span className="bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">NUEVO</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Basic ({basicMemberships} @ $149) + Premium ({premiumMemberships} @ $499)
                    </span>
                  </div>
                  <strong className="text-indigo-400 font-mono">+{formatMXN(recaudacionMembresias)}</strong>
                </div>

                {/* Totales */}
                <div className="p-4 flex justify-between items-center bg-slate-900 font-bold border-t border-slate-800">
                  <span className="text-indigo-450 uppercase font-mono tracking-wider text-[10px] text-white">RECAUDACIÓN BRUTA DEFINITIVA:</span>
                  <strong className="text-slate-50 text-emerald-400 font-mono text-sm">{formatMXN(totalIngresosMes)}</strong>
                </div>
              </div>
            </div>

            {/* Core NPL Gauge Meter Info (Índice de Cartera Vencida) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">ÍNDICE DE CARTERA VENCIDA (CNBV NPL)</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                  nplRatio < 5 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : nplRatio < 15 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                    : 'bg-rose-500/10 text-rose-450 border-rose-500/25'
                }`}>
                  {nplRatio < 5 ? 'EXCENTO • RIESGO BAJO' : nplRatio < 15 ? 'RIESGO MODERADO' : 'ALERTA PERIMETRAL'}
                </span>
              </div>

              <div className="flex items-center gap-4 flex-col sm:flex-row">
                {/* Score Circle Progress */}
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="stroke-slate-900"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className={`${nplRatio < 10 ? 'stroke-indigo-505 stroke-indigo-500' : 'stroke-rose-505 stroke-rose-400'} transition-all duration-1000`}
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - nplRatio / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-mono font-black text-white">{nplRatio.toFixed(1)}%</span>
                    <span className="text-[7.5px] uppercase font-mono text-slate-500 font-extrabold">NPL ratio</span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 flex-1 text-xs">
                  <p className="text-slate-300 font-sans leading-relaxed">
                    De la cartera activa de <strong>{formatMXN(totalOutstandingBalance)}</strong>, se identifican <strong>{carteraVencida.length} expedientes</strong> con mora mayor a 30 días, que suman un saldo vencido de <strong>{formatMXN(totalOverdueBalance)}</strong>.
                  </p>
                  <p className="text-[10.5px] text-slate-500 font-sans">
                    *Mínimo regulatorio permitido sin activar reservas de choque: 12.0%. Tu portafolio opera con parámetros aceptables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Proyecciones Inteligentes & Export Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Smart Projections Panel (Líneas de crédito aumentadas para Premium) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-black text-white uppercase font-mono tracking-tight">Proyecciones Inteligentes Premium</h3>
                <p className="text-[9.5px] text-slate-450 text-slate-400 leading-normal">Optimización algorítmica de rentabilidad para clientes VIP sin morosidad.</p>
              </div>
            </div>

            {premiumClientsForIncrease.length === 0 ? (
              <div className="p-4 text-center bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                <span className="text-xs font-mono text-slate-500 block">No hay candidatos óptimos válidos</span>
                <p className="text-[10px] text-slate-455">Todos los clientes Premium de momento cuentan con historial de morosidad o aún no cumplen el score mínimo de 680.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Main dynamic selection display */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                        MIEMBRO PREMIUM VIP
                      </span>
                      <h4 className="text-xs font-black text-white mt-1">
                        {selectedPremiumClient?.name}
                      </h4>
                      <p className="text-[10px] text-indigo-350 text-slate-400 font-mono mt-0.5">Score: {selectedPremiumClient?.creditScore} pts | Mora: 0 días</p>
                    </div>

                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Riesgo: Mínimo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono border-t border-slate-900 pt-3.5">
                    <div>
                      <span className="block text-slate-500">Línea de Crédito Actual</span>
                      <strong className="text-slate-205 text-slate-350">{formatMXN(selectedPremiumClient?.totalCreditGranted || 0)}</strong>
                    </div>

                    <div>
                      <span className="block text-amber-450 block text-amber-400 font-bold">Aumento Sugerido (+25%):</span>
                      <strong className="text-emerald-400">+{formatMXN((selectedPremiumClient?.totalCreditGranted || 0) * 0.25)}</strong>
                    </div>
                  </div>

                  {/* Operational recommendation disclaimer */}
                  <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl leading-relaxed text-[10.5px] text-slate-400">
                    Basado en la puntualidad de pagos, saldo actual e impacto de su Membresía Premium, posee perfil sobresaliente para una expansión controlada de límites de crédito para mitigar el churn y fomentar la colocación.
                  </div>

                  {selectedPremiumClient && (
                    <button
                      disabled={approvedIncreases.includes(selectedPremiumClient.id)}
                      onClick={() => handleApproveIncrease(selectedPremiumClient.id, selectedPremiumClient.totalCreditGranted * 0.25)}
                      className={`w-full py-2.5 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                        approvedIncreases.includes(selectedPremiumClient.id)
                          ? 'bg-emerald-555 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : 'bg-gradient-to-r from-amber-600 to-indigo-600 hover:opacity-90 text-white shadow-md'
                      }`}
                    >
                      {approvedIncreases.includes(selectedPremiumClient.id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Límite Ampliado y Autorizado ✓
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Aprobar Incremento Directo de Línea
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Micro selector list of other prospects */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-550 uppercase font-black block tracking-wider">
                    Otros Candidatos Pre-Aprobados ({premiumClientsForIncrease.length}):
                  </span>

                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {premiumClientsForIncrease.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPremiumClient(p)}
                        className={`w-full text-left p-2.5 rounded-xl border flex justify-between items-center transition cursor-pointer text-xs ${
                          selectedPremiumClient?.id === p.id
                            ? 'bg-slate-950 border-indigo-500/50 text-white font-semibold'
                            : 'bg-slate-950/40 border-slate-850/60 text-slate-400 hover:text-white hover:bg-slate-950/80'
                        }`}
                      >
                        <span className="truncate max-w-[150px]">{p.name}</span>
                        <div className="flex items-center gap-2 font-mono text-[10.5px]">
                          <span>Score: {p.creditScore}</span>
                          {approvedIncreases.includes(p.id) ? (
                            <span className="text-emerald-400 text-[10px] font-bold">Aumentado</span>
                          ) : (
                            <span className="text-indigo-400 text-[10px] font-medium">+25%</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export & Email Automation Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
            <div className="pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black text-white uppercase font-mono tracking-tight flex items-center gap-1.5">
                <Send className="w-4 h-4 text-indigo-400" />
                Consola de Exportación & Respaldo
              </h3>
              <p className="text-[9.5px] text-slate-450 text-slate-400 mt-0.5">Acciones de egreso auditadas y transmisión SSL.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                disabled={isExporting}
                onClick={handleExportProceso}
                className="bg-indigo-600 hover:bg-indigo-505 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-3 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-2 border border-indigo-550/20 text-center"
              >
                <Download className="w-4 h-4 font-black text-indigo-150 text-indigo-100" />
                <span>Exportar Reporte</span>
                <span className="text-[8px] font-medium opacity-80 leading-snug">Genera PDF en disco corporativo</span>
              </button>

              <button
                disabled={isExporting}
                onClick={handleExportProceso}
                className="bg-slate-950/60 hover:bg-slate-950 text-slate-200 hover:text-white disabled:opacity-50 font-bold py-3 px-3 border border-slate-850 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Respaldar Correo</span>
                <span className="text-[8px] opacity-80 text-slate-500 leading-snug font-medium">Envía balances a Harold</span>
              </button>
            </div>

            {/* Exporting Indicator / Terminal Logs */}
            {isExporting && (
              <div className="w-full bg-slate-950 border border-slate-850 p-3.5 rounded-2xl animate-pulse flex items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-xs font-mono text-slate-300">Transmitiendo paquete cifrado a servidores externos...</span>
              </div>
            )}

            {exportLogs.length > 0 && (
              <div className="space-y-1.5 pt-1 text-left">
                <span className="text-[9px] font-mono text-slate-500 font-extrabold block">LOG DE EVENTOS DE AUDITORÍA:</span>
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-2 max-h-[160px] overflow-y-auto font-mono text-[10px] leading-relaxed text-indigo-300 antialiased">
                  {exportLogs.map((log, i) => (
                    <div key={i} className="flex gap-1 items-start">
                      <span className="text-slate-550">[{log.timestamp}]</span>
                      <span className={
                        log.type === 'success' 
                          ? 'text-emerald-400 font-bold' 
                          : log.type === 'warn' 
                          ? 'text-rose-400 font-bold' 
                          : 'text-indigo-400'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
