import React, { useState, useEffect } from 'react';
import { 
  User, Search, AlertTriangle, ShieldCheck, Crown, 
  CreditCard, Camera, Check, FileText, ArrowRight, 
  Sparkles, RefreshCw, Landmark, Layers, Calendar, ChevronRight, CheckCircle
} from 'lucide-react';
import { Client, RiskParameters, CreditRequest, BureauQueryLog } from '../types';

interface AsesorDashboardProps {
  clients: Client[];
  riskParams: RiskParameters;
  onUpdateClientMembership: (clientId: string, membership: 'Ninguna' | 'Básica' | 'Premium') => void;
  onAddRequest: (newReq: Omit<CreditRequest, 'id' | 'dateSubmitted' | 'status'>) => void;
  onAddQueryLog: (log: BureauQueryLog) => void;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setRequests: React.Dispatch<React.SetStateAction<CreditRequest[]>>;
  isAsesorSuspended?: boolean;
  onTriggerIncident: (incidentDetails: { device: string; timestamp: string; actionBlocked: string; targetClient: string }) => void;
}

export const AsesorDashboard: React.FC<AsesorDashboardProps> = ({
  clients,
  riskParams,
  onUpdateClientMembership,
  onAddRequest,
  onAddQueryLog,
  setClients,
  setRequests,
  isAsesorSuspended = false,
  onTriggerIncident
}) => {
  // Search state
  const [searchTerm, setSearchTerm] = useState('Ana Laura Gómez');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Interactive Simulator states
  const [loanAmount, setLoanAmount] = useState<number>(12000);
  const [loanTerm, setLoanTerm] = useState<number>(6); // months
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
  const [isCapturingCamera, setIsCapturingCamera] = useState<boolean>(false);
  const [isCameraCompleted, setIsCameraCompleted] = useState<boolean>(false);
  const [isMembershipUpgraded, setIsMembershipUpgraded] = useState<boolean>(false);
  const [isLoanSubmitted, setIsLoanSubmitted] = useState<boolean>(false);
  const [cameraLog, setCameraLog] = useState<string[]>([]);

  // Automatically find Ana Laura on mount if she is in clients list
  useEffect(() => {
    const ana = clients.find(c => c.name.toLowerCase().includes('ana laura') || c.id === 'CLI-002');
    if (ana) {
      setSelectedClient(ana);
    }
  }, [clients]);

  // Handle client search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = clients.find(
      c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase() === searchTerm.toLowerCase()
    );
    if (found) {
      setSelectedClient(found);
      setIsAnalyzed(false);
      setIsCameraCompleted(false);
      setIsMembershipUpgraded(found.membership === 'Premium');
      setIsLoanSubmitted(false);
      setCameraLog([]);
    } else {
      setSelectedClient(null);
    }
  };

  // Trigger feasibility analysis
  const handleAnalyzeFeasibility = () => {
    setIsAnalyzed(true);
    // If client is already Premium, auto unlock
    if (selectedClient?.membership === 'Premium') {
      setIsMembershipUpgraded(true);
    }
  };

  // Simulate Camera Module integration
  const handleCaptureCamera = () => {
    setIsCapturingCamera(true);
    setCameraLog(prev => [...prev, "📷 [CÁMARA] Iniciando comunicación con dispositivo biométrico..."]);
    
    setTimeout(() => {
      setCameraLog(prev => [...prev, "📷 [CÁMARA] Capturando identificación oficial (Anverso y Reverso)..."]);
    }, 600);

    setTimeout(() => {
      setCameraLog(prev => [
        ...prev, 
        "📷 [CÁMARA] Identificación oficial de Ana Laura Gómez capturada con éxito.",
        "✓ [STORAGE] Archivo ana_gomez_id.jpg guardado y encriptado en el expediente local.",
        "✓ [BIOMÉTRICOS] Cotejo facial con INE exitoso (coincidencia del 98.7%)."
      ]);
      setIsCapturingCamera(false);
      setIsCameraCompleted(true);
    }, 1800);
  };

  // Upgrade to Premium to lift block
  const handleUpgradeMembership = () => {
    if (!selectedClient) return;
    
    // Upgrade client role via prop action
    onUpdateClientMembership(selectedClient.id, 'Premium');
    
    // Also local update so UI reflects immediately
    setSelectedClient(prev => prev ? { ...prev, membership: 'Premium' } : null);
    setIsMembershipUpgraded(true);

    // Append log to central query logs
    const upgradedLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: selectedClient.name,
      requestedBy: 'asesor_juan',
      scoreFound: selectedClient.creditScore,
      resolution: `UPGRADE VIP: El asesor Juan inició el bypass de RIESGO mediante suscripción de Membresía Premium VIP para destrabar crédito de $${loanAmount.toLocaleString('es-MX')} MXN.`
    };
    onAddQueryLog(upgradedLog);
  };

  // Final submit loan
  const handleSubmitLoan = () => {
    if (!selectedClient) return;

    // Create a new Credit Request
    const newReqId = `REQ-${Math.floor(4510 + Math.random() * 500)}`;
    const newRequest: CreditRequest = {
      id: newReqId,
      clientName: selectedClient.name,
      requestedAmount: loanAmount,
      purpose: `Préstamo de Emergencia Libre - Desbloqueo VIP`,
      score: selectedClient.creditScore,
      category: 'Personal',
      dateSubmitted: new Date().toISOString().slice(0, 10),
      status: 'APROBADO' // Approved immediately due to Premium membership!
    };

    setRequests(prev => [newRequest, ...prev]);

    // Also update client balances
    setClients(prev => prev.map(c => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          totalCreditGranted: c.totalCreditGranted + loanAmount,
          balanceOwed: c.balanceOwed + loanAmount
        };
      }
      return c;
    }));

    setIsLoanSubmitted(true);

    // Create log
    const finalLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: selectedClient.name,
      requestedBy: 'asesor_juan',
      scoreFound: selectedClient.creditScore,
      resolution: `CRÉDITO VIP AUTORIZADO: Se emitió y dispersó préstamo de ${formatMXN(loanAmount)} a Ana Laura Gómez (CLI-002) aplicando tasa preferencial de 12.5% por Membresía Premium.`
    };
    onAddQueryLog(finalLog);
  };

  // Calculate Amortization schedule details
  const getAmortizationTable = (principal: number, annualRate: number, terms: number) => {
    // Interest rate with Premium benefit is 12.5% (base 14.5% - 2%)
    // Base is 14.5% - Premium is 12.5%
    const rateMonthly = (annualRate / 12) / 100;
    
    // Constant monthly payment (Annuity) formula: P = [r * PV] / [1 - (1 + r)^(-n)]
    const monthlyPayment = (rateMonthly * principal) / (1 - Math.pow(1 + rateMonthly, -terms));
    
    let balance = principal;
    const rows = [];
    
    for (let i = 1; i <= terms; i++) {
      const interestPayment = balance * rateMonthly;
      const principalPayment = monthlyPayment - interestPayment;
      balance = balance - principalPayment;
      
      rows.push({
        month: i,
        payment: monthlyPayment,
        interest: interestPayment,
        principalAmortized: principalPayment,
        remainingBalance: Math.max(0, balance)
      });
    }
    
    return {
      monthlyPayment,
      totalInterest: rows.reduce((sum, row) => sum + row.interest, 0),
      totalRepayment: monthlyPayment * terms,
      rows
    };
  };

  // Interest rate applied based on membership
  const appliedRate = selectedClient?.membership === 'Premium' 
    ? riskParams.baseInterestRate - 2.0 
    : selectedClient?.membership === 'Básica'
    ? riskParams.baseInterestRate - 0.5
    : riskParams.baseInterestRate;

  const amortization = getAmortizationTable(loanAmount, appliedRate, loanTerm);

  const handleSimulateBypass = () => {
    alert(
      "🛑 [ALERTA DE SEGURIDAD PERIMETRAL]\n\n" +
      "Detectado: Intento ilegal de modificación de estatus de Buró Interno para el cliente Roberto Martínez (CLI-003) sin token criptográfico de Harold Salazar.\n\n" +
      "Acción Automática: Transacción bloqueada. El canal de comunicación móvil ha de reportar esta anomalía a la consola de @admin_harold. Se procedió al bloqueo temporal de tu cuenta operativa."
    );
    
    onTriggerIncident({
      device: 'Mobile (Safari, iPhone 15 Pro, iOS 19.3)',
      timestamp: '2026-05-19 22:40:57',
      actionBlocked: 'Intento de modificación manual de estatus de Buró Interno para Roberto Martínez (CLI-003) de [BLOQUEADO] a [APROBADO] sin autorización.',
      targetClient: 'Roberto Martínez (CLI-003)'
    });
  };

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* SECURITY INCIDENT SIMULATION CARD (AS DEMANDED BY USER ACTION) */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900/40 to-slate-900/90 border border-red-900/40 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl animate-pulse" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <h3 className="text-xs font-mono font-black tracking-wider text-rose-400 uppercase">
              Simulador de Incidencia / Sistema de Seguridad (CNBV SEC-801)
            </h3>
          </div>
          <p className="text-xs text-white font-bold leading-snug">
            Simular Modificación Manual de Roberto Martínez (CLI-003) desde Celular
          </p>
          <p className="text-[10.5px] text-slate-405 text-slate-400 leading-normal max-w-xl">
            Simula que @asesor_juan inicia sesión desde un dispositivo móvil (iPhone) e intenta alterar de forma manual el Buró de <strong className="text-slate-200 font-mono">Roberto Martínez (CLI-003, Bloqueado - Score: 320)</strong> a <strong className="text-emerald-400">APROBADO</strong>, gatillando el bloqueo perimetral de CNBV y enviando una alerta forense en tiempo real a la consola de Harold.
          </p>
        </div>

        <button
          onClick={handleSimulateBypass}
          className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-5 py-3 rounded-xl transition cursor-pointer shrink-0 border border-rose-500/30 flex items-center gap-2 shadow-lg shadow-rose-500/10 uppercase tracking-wide font-sans text-center"
        >
          <span>📱</span>
          Iniciar Intento Bypass (Mobile)
        </button>
      </div>

      {/* ADVISOR BANNER INFO - POINT 5 */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-84 h-84 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="flex border-b border-slate-800 pb-4 mb-5 items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-400" />
              Consola del Asesor de Crédito
            </h2>
            <p className="text-xs text-slate-400">
              Módulo operativo para Ejecutivos Senior. Registro de expedientes, verificación de buró, autenticación oficial e integración de membresías VIP.
            </p>
          </div>
          <span className="bg-indigo-550/15 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            Asesor: @asesor_juan (Conectado)
          </span>
        </div>

        {/* PROFILE SWITCHER / ACTIONS INSTRUCTIONS OF ROLE - POINT 5 */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            Catálogo de Acciones Disponibles del Rol (Asesor de Crédito)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400 font-sans">
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
              <strong className="text-slate-200 block mb-1">1. Buscador Interno</strong>
              Localizar prospectos y clientes activos en cartera nacional para triage pre-calificado.
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
              <strong className="text-slate-200 block mb-1">2. Cámara y Cotejo Biométrico</strong>
              Capturar y registrar digitalmente credenciales oficiales mediante el hardware autorizado del módulo.
            </div>
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
              <strong className="text-slate-200 block mb-1">3. Venta y Bypass VIP</strong>
              Afiliar cuentas de riesgo al plan Premium para eximir comisiones e iniciar colocación inmediata de fideicomisos.
            </div>
          </div>
        </div>
      </div>

      {/* CORE WORKFLOW AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CLIENT LOOKUP & FEASIBILITY FORM */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3 mb-2">
            <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest block">OPERACIÓN CLIENTES</span>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
              Triage e Inicio de Solicitud de Crédito
            </h3>
          </div>

          {/* SEARCH FIELD */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 font-mono">1. BUSCAR CLIENTE DE INTERÉS (RFC o Nombre)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Ej. Ana Laura Gómez"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-3 border border-slate-800 rounded-xl bg-slate-950 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Buscar
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Prueba buscando <strong className="text-slate-400">"Ana Laura Gómez"</strong> o escribe su Clave Interna <strong className="text-slate-405">"CLI-002"</strong>.
            </p>
          </form>

          {/* DISPLAY CLIENT PROFILE DETAILS */}
          {selectedClient ? (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    {selectedClient.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">{selectedClient.id} • RFC: {selectedClient.rfc}</span>
                </div>
                
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  selectedClient.creditScore < 500 ? 'bg-rose-500/10 text-rose-450 border border-rose-550/20 text-rose-400' : 'bg-slate-900 text-slate-405'
                }`}>
                  {selectedClient.creditScore < 500 ? 'ALTO RIESGO' : 'NORMAL'}
                </span>
              </div>

              {/* Score Display */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Score de Buró</span>
                  <strong className="text-base font-mono text-rose-400 block mt-0.5">{selectedClient.creditScore} pts</strong>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Mora Registrada</span>
                  <strong className="text-base font-mono text-rose-400 block mt-0.5">{selectedClient.delinquencyDays} días</strong>
                </div>
              </div>

              {/* LOAN REQUEST CONTROLS */}
              <div className="space-y-3 pt-3 border-t border-slate-905 border-slate-900">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-450 font-mono mb-1">MONTO DE CRÉDITO</label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Math.max(1000, Number(e.target.value)))}
                      className="w-full text-xs font-mono font-bold p-2.5 border border-slate-850 rounded-lg bg-slate-900 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-450 font-mono mb-1">PLAZO (MESES)</label>
                    <select
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-slate-850 rounded-lg bg-slate-900 text-slate-100 font-mono font-bold"
                    >
                      <option value="3">3 Meses</option>
                      <option value="6">6 Meses</option>
                      <option value="12">12 Meses</option>
                      <option value="24">24 Meses</option>
                    </select>
                  </div>
                </div>

                {!isAnalyzed ? (
                  <button
                    type="button"
                    onClick={handleAnalyzeFeasibility}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10 border border-indigo-500/30"
                  >
                    Iniciar Análisis de Viabilidad
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="p-1.5 bg-slate-900 rounded-xl text-center border border-slate-850">
                    <span className="text-[9px] font-mono text-indigo-400 font-bold block">✓ ANÁLISIS PREVIO REALIZADO CORRECAMENTE</span>
                  </div>
                )}

                {selectedClient.id === 'CLI-003' && (
                  <div className="pt-3 border-t border-dashed border-slate-800 space-y-1.5">
                    <span className="text-[9px] font-mono text-rose-400 font-bold uppercase animate-pulse block">
                      ⚠️ FORZAR OPERACIÓN (MÓVIL):
                    </span>
                    <button
                      type="button"
                      onClick={handleSimulateBypass}
                      className="w-full bg-rose-955 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 font-bold text-[11px] py-2.5 px-3 rounded-xl transition cursor-pointer border border-rose-900/30 flex items-center justify-center gap-1.5 text-center leading-normal"
                    >
                      <span>Intentar Bypass Manual a [APROBADO]</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-2xl text-center space-y-1 animate-fadeIn">
              <p className="text-xs font-bold text-rose-455 text-rose-400">Cliente no encontrado en cartera activa</p>
              <p className="text-[10px] text-slate-500">Valida la clave del expediente e intenta de nuevo.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DYNAMIC SYSTEM DECISION VIEW, CAMERA MODULE, UPGRADE AND REPORT */}
        <div className="lg:col-span-7 space-y-6">
          {isAnalyzed && selectedClient && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5 animate-slideUp">
              
              {/* POINT 2: AUTOMATIC RIESGO ASSESSMENT DETECTION */}
              <div className="border border-red-500/30 bg-red-500/5 p-4 rounded-2xl space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl font-black" />
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="text-xs font-mono font-black tracking-widest text-white uppercase">
                      DIAGNÓSTICO AUTOMÁTICO DE RIESGO DETECTADO
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1">
                      El sistema determinó que <strong className="text-slate-200">Ana Laura Gómez</strong> se encuentra en estatus de <strong className="text-rose-400">RIESGO / ALERTA</strong> debido a sus <strong className="text-white font-mono">{selectedClient.delinquencyDays} días de mora histórica</strong> y score predictivo crítico de <strong className="text-white font-mono">{selectedClient.creditScore} pts</strong> (Por debajo del umbral mínimo de aprobación de {riskParams.minScoreAutoApproval} pts).
                    </p>
                    
                    {!isMembershipUpgraded ? (
                      <p className="text-amber-400 text-[11px] font-bold font-sans mt-2 leading-normal">
                        🚨 CANDIDATA CONFIGURADA AL LÍMITE DE RIESGO: Requiere adquirir la "Membresía Premium VIP" ($499 MXN) para poder eximir las restricciones del Buró Interno y habilitar su autorización de crédito.
                      </p>
                    ) : (
                      <p className="text-emerald-400 text-[11px] font-bold font-sans mt-2 flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1.5 rounded-lg">
                        <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        DESBLOQUEADO POR MEMBRESÍA PREMIUM VIP: El plan VIP exime las penalizaciones en cartera. Se autoriza tasa preferencial final.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* POINT 4: BIOMETRIC CAMERA MODULE LOG SIMULATION */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    MÓDULO CÁMARA E IDENTIFICACIONES (MÉTODO BIOMÉTRICO)
                  </h4>
                  <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono px-2 py-0.5 rounded uppercase font-bold text-[8px]">
                    EXIGIBLE
                  </span>
                </div>

                {!isCameraCompleted ? (
                  <div className="space-y-3 text-center py-2">
                    <p className="text-[11px] text-slate-400 font-sans">
                      Es obligatorio capturar y verificar la identificación oficial del prospecto antes del bypass administrativo.
                    </p>
                    <button
                      type="button"
                      disabled={isCapturingCamera}
                      onClick={handleCaptureCamera}
                      className="inline-flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-650/30 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 text-xs font-bold px-5 py-3 rounded-xl transition cursor-pointer"
                    >
                      {isCapturingCamera ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                          Escaneando ID Oficial...
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                          Tomar Foto de ID de Ana Laura
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-lg flex items-center justify-between text-xs text-slate-350">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-sans">
                      <Check className="w-4 h-4 shrink-0" />
                      ID de Identificación Cargado Correctamente
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.2 uppercase font-black tracking-widest leading-none">
                      REGISTRADO
                    </span>
                  </div>
                )}

                {cameraLog.length > 0 && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 space-y-1">
                    {cameraLog.map((log, index) => (
                      <p key={index} className="leading-relaxed">{log}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* POINT 3: SIMULATE ACTIVATION / VIP MEMBERSHIP UPGRADE */}
              {isCameraCompleted && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      AFILIACIÓN VIP DEL EXPEDIENTE CLI-002
                    </h4>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">$499 MXN / Mes</span>
                  </div>

                  {!isMembershipUpgraded ? (
                    <div className="space-y-3">
                      <p className="text-[11px] text-slate-450 leading-relaxed font-sans">
                        La afiliación a la <strong className="text-slate-200">Membresía Premium VIP</strong> desbloquea la viabilidad administrativa de forma instantánea. Otorga un beneficio en la tasa de interés anual de <strong className="text-amber-400 font-mono">-2.0%</strong> (resultando en Tasa Activa del <strong className="text-white font-mono">12.5%</strong>) y exención del 100% en la comisión de apertura comercial.
                      </p>
                      
                      <button
                        type="button"
                        onClick={handleUpgradeMembership}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black font-sans text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xl shadow-amber-550/15"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
                        Activar Membresía Premium VIP (Ana Laura Gómez)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* ACCORTIZATION TABLE HEADER & BENEFIT DETAILS - POINT 3 */}
                      <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 border border-amber-500/20 text-slate-200 text-xs">
                        <div className="flex justify-between items-start pb-2 border-b border-slate-800">
                          <div>
                            <span className="text-[8px] font-mono text-amber-400 uppercase tracking-widest font-black leading-none">Beneficios de Cartera Premium</span>
                            <h5 className="font-bold text-white text-sm mt-0.5">Tasa preferencial aplicada: 12.5% ANUAL</h5>
                          </div>
                          
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold animate-pulse">
                            VIP ACTIVO
                          </span>
                        </div>

                        {/* Amortization calculations outputs */}
                        <div className="grid grid-cols-3 gap-2 text-center pt-3 font-mono">
                          <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-850">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Pago Mensual</span>
                            <span className="text-xs text-emerald-400 font-extrabold">{formatMXN(amortization.monthlyPayment)}</span>
                          </div>

                          <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-850">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Total Interés</span>
                            <span className="text-xs text-slate-350 font-medium">{formatMXN(amortization.totalInterest)}</span>
                          </div>

                          <div className="p-2 bg-slate-950/40 rounded-lg border border-slate-850">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Total a Pagar</span>
                            <span className="text-xs text-white font-medium">{formatMXN(amortization.totalRepayment)}</span>
                          </div>
                        </div>
                      </div>

                      {/* DETAILED AMORTIZATION SCHEDULE TABELLE - POINT 3 */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-450 uppercase block tracking-wider">Tabla de Amortización Generada ($12,000 a 12.5%)</span>
                        <div className="max-h-[160px] overflow-y-auto scrollbar-thin border border-slate-900 rounded-lg bg-slate-950">
                          <table className="w-full text-[11px] font-mono text-left">
                            <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800 text-[9px] font-bold uppercase">
                              <tr>
                                <th className="p-2 text-center">Mes</th>
                                <th className="p-2">Capital Inicial</th>
                                <th className="p-2">Mensualidad</th>
                                <th className="p-2">Interés</th>
                                <th className="p-2">Abono Capital</th>
                                <th className="p-2">Saldo Insoluto</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900 text-slate-300">
                              {amortization.rows.map(row => {
                                const beginningB = row.remainingBalance + row.principalAmortized;
                                return (
                                  <tr key={row.month} className="hover:bg-slate-900/35">
                                    <td className="p-2 text-center text-indigo-400 font-bold">{row.month}</td>
                                    <td className="p-2">{formatMXN(beginningB)}</td>
                                    <td className="p-2 text-emerald-400 font-bold">{formatMXN(row.payment)}</td>
                                    <td className="p-2 text-slate-450 text-slate-400">{formatMXN(row.interest)}</td>
                                    <td className="p-2">{formatMXN(row.principalAmortized)}</td>
                                    <td className="p-2 text-slate-300 font-semibold">{formatMXN(row.remainingBalance)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* FINAL REY COMPLETED ACTION BUTTON */}
                      {!isLoanSubmitted ? (
                        <button
                          type="button"
                          onClick={handleSubmitLoan}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black font-sans text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xl shadow-emerald-500/10 border border-emerald-500/20"
                        >
                          <ShieldCheck className="w-4 h-4 animate-pulse text-white" />
                          Confirmar y Generar Registro de Solicitud de Crédito ($12,000 MXN)
                        </button>
                      ) : (
                        <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-2xl text-center space-y-1.5 animate-bounce">
                          <p className="text-xs font-black text-emerald-450 uppercase tracking-widest text-emerald-400 font-sans flex items-center justify-center gap-1.5">
                            <CheckCircle className="w-4 h-4" />
                            CRÉDITO APROBADO Y COLOCADO CON ÉXITO
                          </p>
                          <p className="text-[10px] text-slate-400 font-sans">
                            La solicitud REQ-VIP de Ana Laura Gómez por $12,000 MXN ha sido guardada en cartera activa y reconciliada bajo exención de mora.
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {!isAnalyzed && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 text-center text-slate-500 space-y-3 shadow-xl">
              <Landmark className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-slate-300">Tablero de Evaluación del Ejecutivo</h3>
              <p className="text-xs leading-relaxed max-w-sm mx-auto">
                Selecciona al prospecto <strong className="text-slate-400">"Ana Laura Gómez"</strong> en el buscador de la izquierda y haz clic en "Iniciar Análisis de Viabilidad" para simular todo el proceso del expediente crediticio del ejecutivo con alertas, cámara biométrica e integración VIP.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
