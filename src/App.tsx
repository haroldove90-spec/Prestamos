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
import { ClientPortal } from './components/ClientPortal';
import { PaymentVerification } from './components/PaymentVerification';
import { Client, CreditRequest, BureauQueryLog, RiskParameters, ClientPayment } from './types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_REQUESTS, 
  INITIAL_BUREAU_QUERIES, 
  INITIAL_RISK_PARAMS,
  getBureauStatusByScore 
} from './data';
import { Layers, Search, FileSpreadsheet, ShieldCheck, Activity, Users, Star, Landmark, Crown, DollarSign, ShieldAlert, Smartphone, Lock, TrendingUp, X, Menu, FileCheck2 } from 'lucide-react';

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

  const [currentUser, setCurrentUser] = useState<'admin_harold' | 'asesor_juan' | 'cajera_lucia' | 'cliente_esperanza'>('admin_harold');

  const [activeTab, setActiveTab] = useState<'portfolio' | 'bureau' | 'requests' | 'memberships' | 'asesor_dashboard' | 'cajera_dashboard' | 'security_center' | 'financial_metrics' | 'client_portal' | 'payment_verification'>('portfolio');

  const [clientPayments, setClientPayments] = useState<ClientPayment[]>(() => {
    const local = localStorage.getItem('buro_client_payments');
    if (local) return JSON.parse(local);
    return [
      {
        id: 'PAG-4621',
        clientId: 'PM-820399',
        clientName: 'Melvin Zauriel Hernández Pérez',
        amount: 1250,
        date: '2026-05-22',
        evidenceImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=80',
        status: 'PENDIENTE',
        notes: 'Abono de Cuota Semanal/Mensual #6. Referencia unificada establecida.',
        reference: 'PM-820399'
      },
      {
        id: 'PAG-4622',
        clientId: 'CLI-001',
        clientName: 'Carlos Mendoza',
        amount: 15000,
        date: '2026-05-20',
        evidenceImage: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=80',
        status: 'PENDIENTE',
        notes: 'Abono realizado vía SPEI. Adjunto comprobante original de la app de BBVA.',
        reference: 'SPEI-BBVA-901235'
      },
      {
        id: 'PAG-3801',
        clientId: 'CLI-002',
        clientName: 'Ana Laura Gómez',
        amount: 8500,
        date: '2026-05-18',
        evidenceImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=80',
        status: 'PAGO_REALIZADO',
        notes: 'Pago extraordinario en sucursal de Oxxo. Ticket de depósito adjunto.',
        reference: 'OXXO-SAFE-882103'
      }
    ];
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Automatically close sidebar when tab changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeTab]);

  const handleUserChange = (user: 'admin_harold' | 'asesor_juan' | 'cajera_lucia' | 'cliente_esperanza') => {
    setCurrentUser(user);
    if (user === 'asesor_juan') {
      setActiveTab('asesor_dashboard');
    } else if (user === 'cajera_lucia') {
      setActiveTab('cajera_dashboard');
    } else if (user === 'cliente_esperanza') {
      setActiveTab('client_portal');
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

  useEffect(() => {
    localStorage.setItem('buro_client_payments', JSON.stringify(clientPayments));
  }, [clientPayments]);

  // REGISTER CLIENT ACTIVE PAYMENT ACTIVITY
  const handleRegisterClientPayment = (newPayment: ClientPayment) => {
    setClientPayments(prev => [newPayment, ...prev]);

    // Add general transaction query log for real-time compliance review
    const newLog: BureauQueryLog = {
      id: `Q-${Math.floor(1005 + Math.random() * 8900)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: newPayment.clientName,
      requestedBy: 'cliente_portal',
      scoreFound: 700,
      resolution: `📥 REGISTRO ABONO: El acreditado reportó un abono de $${newPayment.amount.toLocaleString('es-MX')} MXN (Folio: ${newPayment.id}). En espera de validación administrativa.`
    };
    setQueries(prev => [newLog, ...prev]);
  };

  // VERIFY/APPROVE/REJECT RECEIVED EVIDENCE IMAGES MANUALLY
  const handleVerifyPayment = (paymentId: string, newStatus: 'PAGO_REALIZADO' | 'RECHAZADO') => {
    setClientPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return { ...p, status: newStatus };
      }
      return p;
    }));

    // Find the payment object
    const payment = clientPayments.find(p => p.id === paymentId);
    if (!payment) return;

    if (newStatus === 'PAGO_REALIZADO') {
      // Apply payment deduction from balanceOwed
      setClients(prev => prev.map(c => {
        if (c.id === payment.clientId) {
          const newBalance = Math.max(0, c.balanceOwed - payment.amount);
          
          // Auto-calculate if they fully settled their delinquency
          const newDelinquency = newBalance === 0 ? 0 : c.delinquencyDays;
          const newStatusVal = newBalance === 0 ? 'EXCELENTE' : c.bureauStatus;
          
          return {
            ...c,
            balanceOwed: newBalance,
            delinquencyDays: newDelinquency,
            bureauStatus: newStatusVal
          };
        }
        return c;
      }));

      // Create transaction audit log
      const auditLog: BureauQueryLog = {
        id: `Q-${Math.floor(1003 + Math.random() * 8990)}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        queriedClientName: payment.clientName,
        requestedBy: currentUser,
        scoreFound: 720,
        resolution: `✓ COMPROBANTE APROBADO: Abono de $${payment.amount.toLocaleString('es-MX')} aplicado al saldo del expediente ${payment.clientId} por ${currentUser === 'admin_harold' ? 'Harold Salazar' : 'Lucía Lara'}.`
      };
      setQueries(prev => [auditLog, ...prev]);
    } else {
      // Cancelled log
      const auditLog: BureauQueryLog = {
        id: `Q-${Math.floor(1003 + Math.random() * 8990)}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        queriedClientName: payment.clientName,
        requestedBy: currentUser,
        scoreFound: 350,
        resolution: `🚫 COMPROBANTE MARCADO COMO RECHAZADO: Ficha de abono ${paymentId} cancelada por ${currentUser === 'admin_harold' ? 'Harold Salazar' : 'Lucía Lara'} (Comprobante inválido o ilegible).`
      };
      setQueries(prev => [auditLog, ...prev]);
    }
  };

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
    // Generate unique unified registration number (ID de Cliente, ID de Préstamo e Identificador de Pago)
    const newId = `PM-${Math.floor(100000 + Math.random() * 900000)}`;
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
      resolution: `Alta de expediente exitoso en Cartera. Registro Unificado Único generado: ${newId}. ID Cliente: ${newId}, Contrato de Préstamo ID: ${newId}, Referencia de Pago Asociada: ${newId}.`
    };
    setQueries(prev => [newQueryLog, ...prev]);
  };

  // ADD SIMULATED CREDIT REQUEST
  const handleAddRequest = (newReqData: Omit<CreditRequest, 'id' | 'dateSubmitted' | 'status'>) => {
    // Generate unique unified registration number representing the loan contract right from the start
    const newId = `PM-${Math.floor(100000 + Math.random() * 900000)}`;
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
    // The client ID matches the loan request ID EXACTLY (Unified Registration Identifier System!)
    const simulatedClient: Client = {
      id: requestItem.id, // ID de Cliente es ID de Préstamo
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
      resolution: `SOLICITUD Y PRÉSTAMO ${id} APROBADOS POR HAROLD. Alta automática en Cartera Activa con ID unificado para el Cliente, Contrato de Préstamo y Referencia de Pagos: ${requestItem.id} por un monto de $${requestItem.requestedAmount.toLocaleString('es-MX')} MXN.`
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
        onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
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
          
          {/* MOBILE NAVIGATION SIDEBAR (SLIDE OUT FROM LEFT OVERLAY DRAWER) */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" id="mobile-sidebar-drawer">
              {/* Backdrop blur effect */}
              <div 
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              
              {/* Drawer layout container sliding in from left */}
              <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 p-5 shadow-2xl flex flex-col gap-4 overflow-y-auto text-left z-55">
                <div className="flex justify-between items-center pb-3.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-white text-xs font-mono tracking-wide uppercase">Menú de Navegación</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
                    title="Cerrar menú"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  <span className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest px-3 mb-2">
                    Módulos Disponibles
                  </span>

                  {/* TAB OPTION 0: ADVISOR CONSOLE (ONLY FOR ASESOR) */}
                  {currentUser === 'asesor_juan' && (
                    <button
                      id="mobile-tab-asesor-dashboard"
                      onClick={() => setActiveTab('asesor_dashboard')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                        activeTab === 'asesor_dashboard'
                          ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Star className={`w-4 h-4 ${activeTab === 'asesor_dashboard' ? 'text-white' : 'text-yellow-400 animate-pulse'}`} />
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
                      id="mobile-tab-cajera-dashboard"
                      onClick={() => setActiveTab('cajera_dashboard')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                        activeTab === 'cajera_dashboard'
                          ? 'bg-blue-600 font-bold border-blue-400 shadow-lg shadow-blue-500/20 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
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
                    id="mobile-tab-portfolio-management"
                    onClick={() => setActiveTab('portfolio')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                      activeTab === 'portfolio'
                        ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-955 bg-slate-905 bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
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
                    id="mobile-tab-bureau-lookup"
                    onClick={() => {
                      if (currentUser !== 'admin_harold') {
                        alert('Acceso comercial básico para Ejecutivo. Parámetros de tasas globales e índices macro de Buró están bloqueados en consulta de lectura única por regulaciones del comité de riesgo.');
                      }
                      setActiveTab('bureau');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                      activeTab === 'bureau'
                        ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
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
                    id="mobile-tab-requests-pipeline"
                    onClick={() => setActiveTab('requests')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                      activeTab === 'requests'
                        ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
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
                    id="mobile-tab-memberships-management"
                    onClick={() => {
                      if (currentUser !== 'admin_harold') {
                        alert('El Administrador Senior Harold gestiona las promociones. Puedes realizar afiliaciones automáticas dentro de la consola Asesor.');
                      }
                      setActiveTab('memberships');
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                      activeTab === 'memberships'
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-405 shadow-lg shadow-amber-500/20 shadow-amber-500/20'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
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

                  {/* TAB OPTION 5: SECURITY AUDIT DIVISION */}
                  {currentUser === 'admin_harold' && (
                    <button
                      id="mobile-tab-security-audit"
                      onClick={() => setActiveTab('security_center')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                        activeTab === 'security_center'
                          ? 'bg-rose-600 text-white font-bold border-rose-500 shadow-lg shadow-rose-600/10'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
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

                  {/* TAB OPTION 6: FINANCIAL METRICS */}
                  {currentUser === 'admin_harold' && (
                    <button
                      id="mobile-tab-financial-metrics"
                      onClick={() => setActiveTab('financial_metrics')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                        activeTab === 'financial_metrics'
                          ? 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-lg shadow-indigo-600/15'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className={`w-4 h-4 ${activeTab === 'financial_metrics' ? 'text-white' : 'text-emerald-400'}`} />
                        <span className="text-xs font-semibold">Informes & Cierre de Mes</span>
                      </div>
                      <span className="bg-slate-955 bg-slate-950 text-indigo-400 text-[9px] font-mono border border-slate-850 px-1.5 py-0.5 rounded uppercase font-bold">
                        Finanzas
                      </span>
                    </button>
                  )}

                  {/* PORTAL DE CLIENTES (DEMO) */}
                  <button
                    id="mobile-tab-client-portal"
                    onClick={() => setActiveTab('client_portal')}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                      activeTab === 'client_portal'
                        ? 'bg-emerald-600 font-bold border-emerald-400 shadow-lg text-white'
                        : 'bg-slate-950 text-[#a3c90e] border-[#a3c90e]/25 hover:text-white font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-200">Portal de Clientes (Abonos)</span>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-mono font-black">
                      CLIENTE
                    </span>
                  </button>

                  {/* VERIFICACION DE PAGOS CON COMPROBANTE */}
                  {(currentUser === 'admin_harold' || currentUser === 'cajera_lucia') && (
                    <button
                      id="mobile-tab-payment-verification"
                      onClick={() => setActiveTab('payment_verification')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                        activeTab === 'payment_verification'
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/25'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileCheck2 className={`w-4 h-4 ${activeTab === 'payment_verification' ? 'text-slate-950' : 'text-amber-400 animate-bounce'}`} />
                        <span className="text-xs font-semibold">Validación de Abonos</span>
                      </div>
                      <div className="flex gap-1 items-center">
                        {clientPayments.filter(p => p.status === 'PENDIENTE').length > 0 && (
                          <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                        )}
                        <span className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 font-bold rounded">
                          {clientPayments.filter(p => p.status === 'PENDIENTE').length} pnd
                        </span>
                      </div>
                    </button>
                  )}
                </nav>

                <div className="mt-auto p-4 bg-slate-950 border border-slate-850 rounded-2xl text-[10px] text-slate-500 font-mono tracking-tight text-center">
                  Consola Buró Seguro • v1.2.0
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP NAVIGATION SIDEBAR (MODULES SELECTOR - PERMANENT ON THE LEFT) */}
          <nav className="hidden lg:block lg:col-span-3 space-y-2" id="desktop-sidebar-nav">
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
                <Crown className={`w-4 h-4 ${activeTab === 'memberships' ? 'text-slate-955 animate-bounce' : 'text-amber-400 animate-pulse'}`} />
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
                <span className="bg-slate-955 bg-slate-950 text-indigo-400 text-[9px] font-mono border border-slate-850 px-1.5 py-0.5 rounded uppercase font-bold">
                  Finanzas
                </span>
              </button>
            )}

            {/* TAB OPTION: PORTAL CLIENTES (DEMO) */}
            <button
              id="tab-client-portal"
              onClick={() => setActiveTab('client_portal')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                activeTab === 'client_portal'
                  ? 'bg-emerald-650 bg-emerald-600 text-white font-bold border-emerald-400 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 hover:bg-slate-850/80 text-[#a3c90e] border-[#a3c90e]/25 font-bold'
              }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">Portal de Clientes (Abonos)</span>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-mono font-black">
                CLIENTE
              </span>
            </button>

            {/* TAB OPTION: VERIFICACION DE PAGOS CON COMPROBANTE */}
            {(currentUser === 'admin_harold' || currentUser === 'cajera_lucia') && (
              <button
                id="tab-payment-verification"
                onClick={() => setActiveTab('payment_verification')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                  activeTab === 'payment_verification'
                    ? 'bg-amber-500 text-slate-955 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/25'
                    : 'bg-slate-900 hover:bg-slate-850/80 text-slate-400 hover:text-white border-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileCheck2 className={`w-4 h-4 ${activeTab === 'payment_verification' ? 'text-slate-950' : 'text-amber-400 animate-bounce'}`} />
                  <span className="text-xs font-semibold">Validación de Abonos</span>
                </div>
                <div className="flex gap-1 items-center">
                  {clientPayments.filter(p => p.status === 'PENDIENTE').length > 0 && (
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                  )}
                  <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 font-bold rounded">
                    {clientPayments.filter(p => p.status === 'PENDIENTE').length} pnd
                  </span>
                </div>
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

                {activeTab === 'client_portal' && (
                  <ClientPortal 
                    clients={clients} 
                    payments={clientPayments} 
                    onRegisterPayment={handleRegisterClientPayment} 
                  />
                )}

                {activeTab === 'payment_verification' && (
                  <PaymentVerification 
                    payments={clientPayments} 
                    onVerifyPayment={handleVerifyPayment} 
                    currentUser={currentUser}
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
