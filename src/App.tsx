import { useState, useEffect } from 'react';
import { AdminHeader } from './components/AdminHeader';
import { MetricCardPanel } from './components/MetricCard';
import { ClientManagement } from './components/ClientManagement';
import { BureauLookup } from './components/BureauLookup';
import { RequestPipeline } from './components/RequestPipeline';
import { MembershipsModule } from './components/MembershipsModule';
import { AsesorDashboard } from './components/AsesorDashboard';
import { CajeraDashboard } from './components/CajeraDashboard';
import { SecurityAuditModule, SecurityIncident } from './components/SecurityAuditModule';
import { FinancialMetricsModule } from './components/FinancialMetricsModule';
import { Client, CreditRequest, BureauQueryLog, RiskParameters } from './types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_REQUESTS, 
  INITIAL_BUREAU_QUERIES, 
  INITIAL_RISK_PARAMS,
  getBureauStatusByScore 
} from './data';
import { Layers, Search, FileSpreadsheet, ShieldCheck, Activity, Users, Star, Landmark, Crown, DollarSign, ShieldAlert, Smartphone, Lock, TrendingUp } from 'lucide-react';

export default function App() {
  // State initialization with localStorage fallback
  const [clients, setClients] = useState<Client[]>(() => {
    const local = localStorage.getItem('buro_clients');
    return local ? JSON.parse(local) : INITIAL_CLIENTS;
  });

  const [requests, setRequests] = useState<CreditRequest[]>(() => {
    const local = localStorage.getItem('buro_requests');
    return local ? JSON.parse(local) : INITIAL_REQUESTS;
  });

  const [queries, setQueries] = useState<BureauQueryLog[]>(() => {
    const local = localStorage.getItem('buro_queries');
    return local ? JSON.parse(local) : INITIAL_BUREAU_QUERIES;
  });

  const [riskParams, setRiskParams] = useState<RiskParameters>(() => {
    const local = localStorage.getItem('buro_risk_params');
    return local ? JSON.parse(local) : INITIAL_RISK_PARAMS;
  });

  const [isAsesorSuspended, setIsAsesorSuspended] = useState<boolean>(() => {
    const local = localStorage.getItem('buro_asesor_suspended');
    return local ? JSON.parse(local) : false;
  });

  const [securityAlerts, setSecurityAlerts] = useState<SecurityIncident[]>(() => {
    const local = localStorage.getItem('buro_security_alerts');
    return local ? JSON.parse(local) : [];
  });

  const [currentUser, setCurrentUser] = useState<'admin_harold' | 'asesor_juan' | 'cajera_lucia'>('admin_harold');

  const [activeTab, setActiveTab] = useState<'portfolio' | 'bureau' | 'requests' | 'memberships' | 'asesor_dashboard' | 'cajera_dashboard' | 'security_center' | 'financial_metrics'>('portfolio');

  const handleUserChange = (user: 'admin_harold' | 'asesor_juan' | 'cajera_lucia') => {
    setCurrentUser(user);
    if (user === 'asesor_juan') {
      setActiveTab('asesor_dashboard');
    } else if (user === 'cajera_lucia') {
      setActiveTab('cajera_dashboard');
    } else {
      setActiveTab('portfolio');
    }
  };

  // Push updates to localStorage
  useEffect(() => {
    localStorage.setItem('buro_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('buro_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('buro_queries', JSON.stringify(queries));
  }, [queries]);

  useEffect(() => {
    localStorage.setItem('buro_risk_params', JSON.stringify(riskParams));
  }, [riskParams]);

  useEffect(() => {
    localStorage.setItem('buro_asesor_suspended', JSON.stringify(isAsesorSuspended));
  }, [isAsesorSuspended]);

  useEffect(() => {
    localStorage.setItem('buro_security_alerts', JSON.stringify(securityAlerts));
  }, [securityAlerts]);

  // RESET DATABASE ACTION
  const handleResetData = () => {
    if (confirm('¿Estás seguro de restablecer la base de datos a sus valores demo por defecto? Se perderán las modificaciones realizadas en esta sesión.')) {
      setClients(INITIAL_CLIENTS);
      setRequests(INITIAL_REQUESTS);
      setQueries(INITIAL_BUREAU_QUERIES);
      setRiskParams(INITIAL_RISK_PARAMS);
      setIsAsesorSuspended(false);
      setSecurityAlerts([]);
      setActiveTab('portfolio');
    }
  };

  // ADD NEW CLIENT
  const handleAddClient = (newClientData: Omit<Client, 'id' | 'joinDate'>) => {
    const newId = `CLI-0${Math.floor(250 + Math.random() * 700)}`;
    const newClient: Client = {
      ...newClientData,
      id: newId,
      joinDate: new Date().toISOString().slice(0,10)
    };
    
    setClients(prev => [newClient, ...prev]);

    // Also write a query log entry for cataloging
    const newQueryLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: newClientData.name,
      requestedBy: 'admin_harold',
      scoreFound: newClientData.creditScore,
      resolution: `Alta de expediente exitoso en Cartera. Estatus buró establecido en: ${newClientData.bureauStatus}`
    };
    setQueries(prev => [newQueryLog, ...prev]);
  };

  // ADD SIMULATED CREDIT REQUEST
  const handleAddRequest = (newReqData: Omit<CreditRequest, 'id' | 'dateSubmitted' | 'status'>) => {
    const newId = `REQ-${Math.floor(4510 + Math.random() * 500)}`;
    const newRequest: CreditRequest = {
      ...newReqData,
      id: newId,
      dateSubmitted: new Date().toISOString().slice(0, 10),
      status: 'PENDIENTE'
    };

    setRequests(prev => [newRequest, ...prev]);
  };

  // APPROVE CREDIT REQUEST -> PROCESSED AND ADDED TO ACTIVE CLIENTS
  const handleApproveRequest = (id: string) => {
    const requestItem = requests.find(r => r.id === id);
    if (!requestItem) return;

    // 1. Update request status to approved
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'APROBADO' } : r));

    // 2. Generate custom RFC for Mexico
    const rfcBase = (requestItem.clientName.slice(0, 4).toUpperCase().padEnd(4, 'X') + '850101TS2').replace(/\s+/g, 'A');

    // 3. Create active Client card and append to portfolio
    const simulatedClient: Client = {
      id: `CLI-0${Math.floor(300 + Math.random() * 500)}`,
      name: requestItem.clientName,
      rfc: rfcBase,
      email: `${requestItem.clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@financiero.mx`,
      phone: `55-${Math.floor(3000 + Math.random() * 6000)}-${Math.floor(1000 + Math.random() * 8999)}`,
      creditScore: requestItem.score,
      bureauStatus: getBureauStatusByScore(requestItem.score, 0),
      totalCreditGranted: requestItem.requestedAmount,
      balanceOwed: requestItem.requestedAmount,
      delinquencyDays: 0,
      category: requestItem.category,
      joinDate: new Date().toISOString().slice(0, 10)
    };

    setClients(prev => {
      // Check if client is already in portfolio
      const exists = prev.some(c => c.name.toLowerCase() === requestItem.clientName.toLowerCase());
      if (exists) {
        // If they already exist, just increment their authorized credit
        return prev.map(c => c.name.toLowerCase() === requestItem.clientName.toLowerCase() 
          ? { 
              ...c, 
              totalCreditGranted: c.totalCreditGranted + requestItem.requestedAmount,
              balanceOwed: c.balanceOwed + requestItem.requestedAmount 
            } 
          : c
        );
      }
      return [simulatedClient, ...prev];
    });

    // 4. Create evaluation log entry
    const newLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: requestItem.clientName,
      requestedBy: 'admin_harold',
      scoreFound: requestItem.score,
      resolution: `SOLICITUD ${id} APROBADA POR HAROLD. Alta automática en Cartera Activa por monto de $${requestItem.requestedAmount.toLocaleString('es-MX')} MXN.`
    };
    setQueries(prev => [newLog, ...prev]);
  };

  // REJECT CREDIT REQUEST
  const handleRejectRequest = (id: string) => {
    const requestItem = requests.find(r => r.id === id);
    if (!requestItem) return;

    // 1. Update request status to rejected
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'RECHAZADO' } : r));

    // 2. Log resolution decline
    const newLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: requestItem.clientName,
      requestedBy: 'admin_harold',
      scoreFound: requestItem.score,
      resolution: `SOLICITUD ${id} RECHAZADA POR EXCISO DE RIESGO DE BURÓ (Score obtenido: ${requestItem.score}).`
    };
    setQueries(prev => [newLog, ...prev]);
  };

  // ADD INDEPENDENT QUERY LOG
  const handleAddQueryLog = (log: BureauQueryLog) => {
    setQueries(prev => [log, ...prev]);
  };

  // UPDATE RISK POLICIES
  const handleUpdateRiskParams = (newParams: RiskParameters) => {
    setRiskParams(newParams);
  };

  // UPDATE CLIENT MEMBERSHIP
  const handleUpdateClientMembership = (clientId: string, membership: 'Ninguna' | 'Básica' | 'Premium') => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, membership } : c));

    // Register a log entry
    const targetClient = clients.find(c => c.id === clientId);
    if (targetClient) {
      const newQueryLog: BureauQueryLog = {
        id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        queriedClientName: targetClient.name,
        requestedBy: 'admin_harold',
        scoreFound: targetClient.creditScore,
        resolution: `MEMBRESÍA ACTUALIZADA: Se asignó plan "${membership}" al expediente ${clientId} por Harold Salazar.`
      };
      setQueries(prev => [newQueryLog, ...prev]);
    }
  };

  // TRIGGER SECURITY INCIDENT FOR ADVISOR (MOBILE BYPASS SIMULATION)
  const handleTriggerIncident = (details: { device: string; timestamp: string; actionBlocked: string; targetClient: string }) => {
    const newIncident: SecurityIncident = {
      id: `SEC-${Math.floor(8000 + Math.random() * 999)}`,
      timestamp: details.timestamp,
      device: details.device,
      user: 'asesor_juan',
      actionBlocked: details.actionBlocked,
      targetClient: details.targetClient,
      status: 'PENDIENTE'
    };

    setSecurityAlerts(prev => [newIncident, ...prev]);
    setIsAsesorSuspended(true);

    // Also write to general query logs so it's transparent to auditing
    const newLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: details.timestamp,
      queriedClientName: details.targetClient,
      requestedBy: 'asesor_juan',
      scoreFound: 320,
      resolution: `🚨 INCIDENTE CRÍTICO BLOQUEADO: ${details.actionBlocked}`
    };
    setQueries(prev => [newLog, ...prev]);
  };

  // RESOLVE SECURITY INCIDENT FROM ACTION PANEL
  const handleResolveIncident = (incidentId: string, action: 'LEVANTAR' | 'PENALIZAR' | 'DESESTIMAR', notes: string) => {
    setSecurityAlerts(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: action === 'LEVANTAR' || action === 'DESESTIMAR' ? 'RESUELTO_LEVANTADO' : 'RESUELTO_PENALIZADO',
          notes: notes
        };
      }
      return inc;
    }));

    if (action === 'LEVANTAR' || action === 'DESESTIMAR') {
      setIsAsesorSuspended(false);
      
      // Log supervisor override
      const overrideLog: BureauQueryLog = {
        id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        queriedClientName: 'Roberto Martínez',
        requestedBy: 'admin_harold',
        scoreFound: 320,
        resolution: `✓ REACTIVACIÓN: El administrador Harold Salazar levantó la suspensión del asesor_juan tras dictamen de seguridad.`
      };
      setQueries(prev => [overrideLog, ...prev]);
    } else {
      // PENALIZAR - keep suspended
      setIsAsesorSuspended(true);
      
      const penalLog: BureauQueryLog = {
        id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        queriedClientName: 'Roberto Martínez',
        requestedBy: 'admin_harold',
        scoreFound: 320,
        resolution: `🚫 SANCIÓN DISCIPLINARIA: Suspensión de asesor_juan ratificada por Harold Salazar. Expediente transferido a Capital Humano y CNBV.`
      };
      setQueries(prev => [penalLog, ...prev]);
    }
  };

  const handleClearSecurityLogs = () => {
    setSecurityAlerts([]);
    setIsAsesorSuspended(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Dynamic Header */}
      <AdminHeader 
        currentUser={currentUser} 
        onUserChange={handleUserChange} 
        onResetData={handleResetData} 
      />

      {/* Main Layout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* UPPER STATUS HIGHLIGHT BAR */}
        <div className={`p-4 border rounded-3xl flex flex-col md:flex-row justify-between items-center gap-3 shadow-md transition-colors duration-300 ${
          currentUser === 'asesor_juan' 
            ? 'bg-indigo-950/40 border-indigo-900/50' 
            : currentUser === 'cajera_lucia'
            ? 'bg-blue-950/40 border-blue-900/50'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                currentUser === 'asesor_juan' ? 'bg-indigo-400' : currentUser === 'cajera_lucia' ? 'bg-blue-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                currentUser === 'asesor_juan' ? 'bg-indigo-505' : currentUser === 'asesor_juan' ? 'bg-indigo-500' : currentUser === 'cajera_lucia' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <div className="text-xs text-slate-350">
              {currentUser === 'asesor_juan' ? (
                <>
                  <span className="font-semibold font-mono text-indigo-400">Sesión de Operación Iniciada</span> como Ejecutivo de Crédito <strong className="text-white">@asesor_juan</strong>. Token de Oficina: <strong className="text-white font-mono">AJ-X011B</strong>.
                </>
              ) : currentUser === 'cajera_lucia' ? (
                <>
                  <span className="font-semibold font-mono text-blue-450 text-blue-400">Caja de Recaudación Activa</span> como Gestora Express <strong className="text-white">@cajera_lucia</strong>. ID Transacción: <strong className="text-white font-mono">CL-P049A</strong>.
                </>
              ) : (
                <>
                  <span className="font-semibold font-mono text-emerald-450 text-emerald-400">Conexión Segura Autenticada</span> con token de supervisor <strong className="text-white">AH-908A1</strong>. Bienvenido de vuelta, Harold Salazar.
                </>
              )}
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-indigo-455 text-indigo-400" />
            <span>Nodos operativos óptimos • Tiempo real</span>
          </div>
        </div>

        {/* METRIC PANEL (LIVE CARDS IN REAL TIME) */}
        <MetricCardPanel clients={clients} requests={requests} />

        {/* BOTTOM SECTION LAYOUT WITH SIDEBAR + MAIN MODULE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* NAVIGATION SIDEBAR (MODULES SELECTOR) */}
          <nav className="lg:col-span-3 space-y-2">
            <span className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest px-3 mb-2">
              Módulos Disponibles
            </span>

            {/* TAB OPTION 0: ADVISOR CONSOLE (ONLY FOR ASESOR) */}
            {currentUser === 'asesor_juan' && (
              <button
                id="tab-asesor-dashboard"
                onClick={() => setActiveTab('asesor_dashboard')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                  activeTab === 'asesor_dashboard'
                    ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900 hover:bg-slate-850/80 text-slate-400 hover:text-white border-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star className={`w-4 h-4 ${activeTab === 'asesor_dashboard' ? 'text-white' : 'text-yellow-405 text-yellow-400 animate-pulse'}`} />
                  <span className="text-xs font-semibold">Consola del Asesor (VIP)</span>
                </div>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded font-mono font-black">
                  OPERATIVO
                </span>
              </button>
            )}

            {/* TAB OPTION 0.5: CAJERA DASHBOARD (ONLY FOR CAJERA/SUPER ADMIN) */}
            {(currentUser === 'cajera_lucia' || currentUser === 'admin_harold') && (
              <button
                id="tab-cajera-dashboard"
                onClick={() => setActiveTab('cajera_dashboard')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                  activeTab === 'cajera_dashboard'
                    ? 'bg-blue-600 font-bold border-blue-400 shadow-lg shadow-blue-500/20 text-white'
                    : 'bg-slate-900 hover:bg-slate-850/80 text-slate-400 hover:text-white border-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <DollarSign className={`w-4 h-4 ${activeTab === 'cajera_dashboard' ? 'text-white' : 'text-blue-400 animate-pulse'}`} />
                  <span className="text-xs font-semibold">Módulo de Pagos (Caja)</span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  activeTab === 'cajera_dashboard'
                    ? 'bg-slate-950 text-blue-400 border-blue-500/30 font-bold'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold'
                }`}>
                  RECAUDACIÓN
                </span>
              </button>
            )}

            {/* TAB OPTION 1: PORTFOLIO */}
            <button
              id="tab-portfolio-management"
              onClick={() => setActiveTab('portfolio')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                activeTab === 'portfolio'
                  ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900 hover:bg-slate-850/80 text-slate-400 hover:text-white border-slate-800 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className={`w-4 h-4 ${activeTab === 'portfolio' ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">Gestión de Cartera</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                activeTab === 'portfolio' ? 'bg-indigo-700 text-white font-bold' : 'bg-slate-950 text-slate-400'
              }`}>
                {clients.length}
              </span>
            </button>

            {/* TAB OPTION 2: BUREAU INTEL & STRESS (SUPERVISOR RESTRICTED ACCORDING TO ROLE) */}
            <button
              id="tab-bureau-lookup"
              onClick={() => {
                if (currentUser !== 'admin_harold') {
                  alert('Acceso comercial básico para Ejecutivo. Parámetros de tasas globales e índices macro de Buró están bloqueados en consulta de lectura única por regulaciones del comité de riesgo.');
                }
                setActiveTab('bureau');
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                activeTab === 'bureau'
                  ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900 hover:bg-slate-850/80 text-slate-400 hover:text-white border-slate-800 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Search className={`w-4 h-4 ${activeTab === 'bureau' ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">Buró de Inteligencia</span>
              </div>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                activeTab === 'bureau' ? 'bg-indigo-700 text-white font-bold' : 'bg-slate-950 text-indigo-400 font-bold'
              }`}>
                {currentUser === 'admin_harold' ? 'Parámetros' : 'Consulta'}
              </span>
            </button>

            {/* TAB OPTION 3: REQUESTS PIPELINE */}
            <button
              id="tab-requests-pipeline"
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                activeTab === 'requests'
                  ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900 hover:bg-slate-850/80 text-slate-400 hover:text-white border-slate-800 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'requests' ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold">Pipeline Aprobaciones</span>
              </div>
              <div className="flex gap-1.5 items-center">
                {requests.filter(r => r.status === 'PENDIENTE').length > 0 && (
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                )}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  activeTab === 'requests' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-amber-500/10 text-amber-400 font-bold'
                }`}>
                  {requests.filter(r => r.status === 'PENDIENTE').length} pnd
                </span>
              </div>
            </button>

            {/* TAB OPTION 4: MEMBERSHIPS MODULE */}
            <button
              id="tab-memberships-management"
              onClick={() => {
                if (currentUser !== 'admin_harold') {
                  alert('El Administrador Senior Harold gestiona las promociones. Puedes realizar afiliaciones automáticas dentro de la consola Asesor.');
                }
                setActiveTab('memberships');
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                activeTab === 'memberships'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-850/85 text-slate-400 hover:text-white border-slate-800 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Crown className={`w-4 h-4 ${activeTab === 'memberships' ? 'text-slate-950 animate-bounce' : 'text-amber-400 animate-pulse'}`} />
                <span className="text-xs font-semibold">Módulo de Membresías</span>
              </div>
              <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'memberships' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
              }`}>
                VIP ACTIVO
              </span>
            </button>

            {/* TAB OPTION 5: SECURITY AUDIT DIVISION (AVAILABLE TO ADMIN) */}
            {currentUser === 'admin_harold' && (
              <button
                id="tab-security-audit"
                onClick={() => setActiveTab('security_center')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                  activeTab === 'security_center'
                    ? 'bg-rose-600 text-white font-bold border-rose-500 shadow-lg shadow-rose-600/10'
                    : 'bg-slate-900 hover:bg-slate-850/80 text-slate-400 hover:text-white border-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className={`w-4 h-4 ${activeTab === 'security_center' ? 'text-white' : 'text-rose-450'}`} />
                  <span className="text-xs font-semibold">Auditoría de Seguridad</span>
                </div>
                {securityAlerts.some(a => a.status === 'PENDIENTE') ? (
                  <span className="bg-rose-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse font-mono tracking-tighter">
                    ALERTA ROJA
                  </span>
                ) : (
                  <span className="bg-slate-950 text-slate-500 text-[9px] font-mono border border-slate-850 px-1.5 py-0.5 rounded">
                    SISTEMA OK
                  </span>
                )}
              </button>
            )}

            {/* TAB OPTION 6: FINANCIAL METRICS & MONTH-END CLOSE (AVAILABLE TO ADMIN) */}
            {currentUser === 'admin_harold' && (
              <button
                id="tab-financial-metrics"
                onClick={() => setActiveTab('financial_metrics')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                  activeTab === 'financial_metrics'
                    ? 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-lg shadow-indigo-600/15'
                    : 'bg-slate-900 hover:bg-slate-850/80 text-slate-400 hover:text-white border-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className={`w-4 h-4 ${activeTab === 'financial_metrics' ? 'text-white' : 'text-emerald-400'}`} />
                  <span className="text-xs font-semibold">Informes & Cierre de Mes</span>
                </div>
                <span className="bg-slate-950 text-indigo-400 text-[9px] font-mono border border-slate-850 px-1.5 py-0.5 rounded uppercase font-bold">
                  Finanzas
                </span>
              </button>
            )}

            {/* MOCK ADVICE TILE IN SIDEBAR */}
            <div className="p-5 bg-slate-900 rounded-3xl border border-slate-800 space-y-2 mt-4 hidden lg:block shadow-md">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                <Star className="w-3.5 h-3.5 text-indigo-400" /> Tips de Harold
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                El motor evalúa automáticamente las propuestas de crédito contra el score buró mínimo histórico y los días tolerados de mora.
              </p>
            </div>
          </nav>

          {/* MAIN MODULE ZONE */}
          <main className="lg:col-span-9">
            {/* REAL-TIME SECURITY ALARM FOR Harold Salazar */}
            {currentUser === 'admin_harold' && securityAlerts.some(a => a.status === 'PENDIENTE') && (
              <div className="bg-gradient-to-r from-red-955 from-red-950/60 to-slate-950 border-2 border-red-600/40 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden mb-6 animate-pulse">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-rose-500 text-slate-950 w-12 h-12 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="text-left space-y-1">
                    <span className="bg-red-500/20 text-rose-400 border border-red-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider block w-fit">
                      ALERTA ROJA - CONTROL PERIMETRAL DETECTADO
                    </span>
                    <h4 className="text-xs font-mono font-black text-white leading-tight uppercase">
                      Intento de Bypass Crítico de @asesor_juan desde Dispositivo Móvil
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Se bloqueó alteración manual de Buró Interno para <strong className="text-slate-200">Roberto Martínez (CLI-003)</strong> a las 22:40:57. El sistema congeló de manera inmediata los accesos del asesor.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('security_center')}
                  className="bg-rose-600 hover:bg-rose-500 text-white border border-rose-550/20 shadow-md font-bold text-xs px-5 py-3 rounded-xl transition cursor-pointer shrink-0 uppercase tracking-tight font-sans text-center"
                >
                  Dictaminar Incidencia
                </button>
              </div>
            )}

            {/* CONDITIONAL CHECK: USER SUSPENDED PREVENTS COMMERCE ACCESS */}
            {currentUser === 'asesor_juan' && isAsesorSuspended ? (
              <div className="bg-slate-900 border border-red-900 p-8 rounded-3xl text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
                
                <div className="w-20 h-20 bg-rose-500/10 text-rose-450 border border-rose-550/30 rounded-full flex items-center justify-center mx-auto shadow-lg text-rose-400">
                  <Lock className="w-10 h-10" />
                </div>

                <div className="max-w-xl mx-auto space-y-3">
                  <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest block w-fit mx-auto animate-pulse">
                    ⚠️ ACCESO DENEGADO / CUENTA CONGELADA TEMPORALMENTE
                  </span>
                  
                  <h3 className="text-lg font-black text-white">
                    Privilegios Operativos Inhabilitados por Incidencia de Cripto-Seguridad
                  </h3>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    El Módulo de Cyber-Seguridad de la financiera ha detectado un <strong className="text-slate-250 text-slate-200">intento de bypass manual de políticas del Buró Interno</strong> realizado desde un dispositivo móvil Safari para cambiar el expediente de <strong className="text-slate-250 text-slate-200">Roberto Martínez (CLI-003)</strong> de <strong className="text-rose-400 font-mono">BLOQUEADO</strong> a <strong className="text-emerald-400 font-mono">APROBADO</strong>.
                  </p>

                  <div className="p-4 bg-slate-100 bg-slate-950 rounded-2xl border border-slate-850 text-left space-y-2.5 font-mono text-[11px] leading-relaxed text-slate-400 mt-4">
                    <div>
                      <span className="text-slate-500 block">DISPOSITIVO INFRACTOR DETECTADO:</span>
                      <strong className="text-indigo-400">Mobile (Safari, iPhone 15 Pro, iOS 19.3)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">FECHA DE INCIDENCIA REGISTRADA:</span>
                      <strong className="text-slate-300">2026-05-19 22:40:57 (Hora Local)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">NOTIFICACIÓN DIRECTA AL COLEGIO:</span>
                      <strong className="text-rose-400">Enviada en tiempo real a Consola de Harold Salazar (@admin_harold).</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-500 font-medium pt-3 leading-snug">
                     Tus privilegios operativos se mantendrán suspendidos por contingencia operativa. Tu supervisor Harold Salazar ha sido notificado para evaluar el expediente de auditoría y dictaminar la resolución de reactivación o levantamiento sancionatorio.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'portfolio' && (
                  <ClientManagement 
                    clients={clients} 
                    onAddClient={handleAddClient} 
                  />
                )}

                {activeTab === 'bureau' && (
                  <BureauLookup 
                    clients={clients} 
                    queries={queries} 
                    riskParams={riskParams} 
                    onAddQueryLog={handleAddQueryLog} 
                    onUpdateRiskParams={handleUpdateRiskParams} 
                  />
                )}

                {activeTab === 'requests' && (
                  <RequestPipeline 
                    requests={requests} 
                    onApproveRequest={handleApproveRequest} 
                    onRejectRequest={handleRejectRequest} 
                    onAddRequest={handleAddRequest} 
                  />
                )}

                {activeTab === 'memberships' && (
                  <MembershipsModule 
                    clients={clients} 
                    riskParams={riskParams}
                    onUpdateClientMembership={handleUpdateClientMembership} 
                  />
                )}

                {activeTab === 'asesor_dashboard' && (
                  <AsesorDashboard 
                    clients={clients} 
                    riskParams={riskParams}
                    onUpdateClientMembership={handleUpdateClientMembership}
                    onAddRequest={handleAddRequest}
                    onAddQueryLog={handleAddQueryLog}
                    setClients={setClients}
                    setRequests={setRequests}
                    isAsesorSuspended={isAsesorSuspended}
                    onTriggerIncident={handleTriggerIncident}
                  />
                )}

                {activeTab === 'cajera_dashboard' && (
                  <CajeraDashboard 
                    clients={clients}
                    setClients={setClients}
                    onAddQueryLog={handleAddQueryLog}
                  />
                )}

                {activeTab === 'security_center' && (
                  <SecurityAuditModule 
                    incidents={securityAlerts}
                    isAsesorSuspended={isAsesorSuspended}
                    onResolveIncident={handleResolveIncident}
                    onClearLogs={handleClearSecurityLogs}
                  />
                )}

                {activeTab === 'financial_metrics' && (
                  <FinancialMetricsModule 
                    clients={clients}
                    setClients={setClients}
                    onAddQueryLog={handleAddQueryLog}
                  />
                )}
              </>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
