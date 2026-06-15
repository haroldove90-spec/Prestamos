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
import { ExpedientesModule } from './components/ExpedientesModule';
import { CreditSimulation } from './components/CreditSimulation';
import { Client, CreditRequest, BureauQueryLog, RiskParameters, ClientPayment, ClientDossier, PRESTAMOS_FIJOS } from './types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_REQUESTS, 
  INITIAL_BUREAU_QUERIES, 
  INITIAL_RISK_PARAMS,
  getBureauStatusByScore 
} from './data';
import { 
  verifyTablesExist,
  fetchClientsCloud,
  bulkInsertClientsCloud,
  fetchRequestsCloud,
  bulkInsertRequestsCloud,
  fetchQueriesCloud,
  bulkInsertQueriesCloud,
  fetchRiskParamsCloud,
  saveRiskParamsCloud,
  fetchSecurityAlertsCloud,
  bulkInsertSecurityAlertsCloud,
  clearSecurityAlertsCloud,
  fetchPaymentsCloud,
  bulkInsertPaymentsCloud,
  fetchDossiersCloud,
  saveDossierCloud,
  bulkInsertDossiersCloud,
  fetchSystemNotificationsCloud,
  bulkInsertSystemNotificationsCloud,
  DbSystemNotification
} from './supabase';
import { Layers, Search, FileSpreadsheet, ShieldCheck, Activity, Users, User, Star, Landmark, Crown, DollarSign, ShieldAlert, Smartphone, Lock, TrendingUp, X, Menu, FileCheck2, Download, FileText, CheckCircle2, AlertCircle, Bell, Volume2, VolumeX, Upload, ChevronDown, Eye, EyeOff } from 'lucide-react';

export function generateNextClientId(currentClients: Client[], baseRef?: string): string {
  let reference = baseRef ? baseRef.trim() : "";
  if (!reference) {
    const pattern = /^([A-Za-z]+)-?(\d+)$/;
    let maxNum = 0;
    let prefix = "PM";
    let delimiter = "-";
    
    for (const client of currentClients) {
      const match = client.id.match(pattern);
      if (match) {
        const pref = match[1];
        const num = parseInt(match[2], 10);
        if (num > maxNum) {
          maxNum = num;
          prefix = pref;
          delimiter = client.id.includes("-") ? "-" : "";
        }
      }
    }
    
    if (maxNum > 0) {
      const nextNum = maxNum + 1;
      const originalNumStr = maxNum.toString();
      const numLength = originalNumStr.length;
      let nextNumStr = nextNum.toString();
      if (nextNumStr.length < numLength) {
        nextNumStr = nextNumStr.padStart(numLength, '0');
      }
      return `${prefix}${delimiter}${nextNumStr}`;
    }
    
    return `PM-${Math.floor(100000 + Math.random() * 900000)}`;
  } else {
    const match = reference.match(/^([A-Za-z]+)-?(\d+)$/);
    if (match) {
      const prefix = match[1];
      const delimiter = reference.includes("-") ? "-" : "";
      const currentNum = parseInt(match[2], 10);
      let nextNum = currentNum + 1;
      
      let proposedId = `${prefix}${delimiter}${nextNum}`;
      while (currentClients.some(c => c.id === proposedId)) {
        nextNum++;
        proposedId = `${prefix}${delimiter}${nextNum}`;
      }
      
      const numLength = match[2].length;
      let nextNumStr = nextNum.toString();
      if (nextNumStr.length < numLength) {
        nextNumStr = nextNumStr.padStart(numLength, '0');
      }
      return `${prefix}${delimiter}${nextNumStr}`;
    }
    return `${reference}${Math.floor(1005 + Math.random() * 8900)}`;
  }
}

export default function App() {
  // PWA & Splash Screen States
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIosInstruction, setShowIosInstruction] = useState<boolean>(false);

  // Splash screen timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // Beforeinstallprompt & installer triggers
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      console.log('Salda App instalada exitosamente.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Resultado de instalación: ${outcome}`);
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIos) {
        setShowIosInstruction(true);
      } else {
        alert('Para instalar Salda App en tu dispositivo móvil, puedes añadirla como aplicación de inicio rápido desde el menú de opciones de tu navegador o pulsar el botón de Instalación rápida en la barra lateral.');
      }
    }
  };

  // State initialization with localStorage fallback
  const [clients, setClients] = useState<Client[]>(() => {
    const local = localStorage.getItem('buro_clients');
    if (local) {
      try {
        const parsed = JSON.parse(local) as Client[];
        const hasPdfClients = parsed.some(c => c.id.startsWith('PM-'));
        if (hasPdfClients) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CLIENTS;
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

  const [currentUser, setCurrentUser] = useState<string>('admin_harold');

  const getUserDisplayName = (user: string) => {
    if (user === 'admin_harold') return 'Harold Salazar';
    if (user === 'asesor_juan') return 'Juan Orozco';
    if (user === 'cajera_lucia') return 'Lucía Lara';
    if (user === 'cliente_esperanza') return 'Esperanza Escobedo Guzman';
    if (user.startsWith('cliente_')) {
      const parts = user.replace('cliente_', '').split('_');
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    return user;
  };

  const [activeTab, setActiveTab] = useState<'portfolio' | 'bureau' | 'requests' | 'memberships' | 'asesor_dashboard' | 'cajera_dashboard' | 'security_center' | 'financial_metrics' | 'client_portal' | 'payment_verification' | 'dossiers' | 'credit_simulation'>('portfolio');

  const [dossiers, setDossiers] = useState<ClientDossier[]>(() => {
    const local = localStorage.getItem('buro_dossiers');
    if (local) {
      try {
        return JSON.parse(local) as ClientDossier[];
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'EXP-8801',
        clientName: 'Esperanza Escobedo Guzman',
        address: 'Av. Constelaciones 402, Col. Satélite, Monterrey, N.L.',
        birthDate: '1984-05-01',
        ineFront: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&auto=format&fit=crop&q=80',
        ineBack: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=800&auto=format&fit=crop&q=80',
        proofOfAddress: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80',
        requestedAmount: 25000,
        status: 'ANALIZANDO',
        createdAt: '2026-05-20',
        notificationDismissed: false
      }
    ];
  });

  const [clientPayments, setClientPayments] = useState<ClientPayment[]>(() => {
    const local = localStorage.getItem('buro_client_payments');
    if (local) {
      try {
        const parsed = JSON.parse(local) as ClientPayment[];
        const hasPmPayment = parsed.some(p => p.clientId.startsWith('PM-'));
        if (hasPmPayment) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
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
  const [isHome, setIsHome] = useState<boolean>(true);
  const [homeSubView, setHomeSubView] = useState<'roles' | 'client_options' | 'client_register'>('roles');

  // Client number baseline configuration
  const [nextClientNumberBase, setNextClientNumberBase] = useState<string>(() => {
    return localStorage.getItem('buro_next_client_ref') || 'PM-820400';
  });

  const handleUpdateNextClientNumberBase = (val: string) => {
    setNextClientNumberBase(val);
    localStorage.setItem('buro_next_client_ref', val);
  };

  // Registration form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regAddress, setRegAddress] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regRequestedAmount, setRegRequestedAmount] = useState<number>(10000);
  const [regLoanType, setRegLoanType] = useState<'12 semanas' | 'Préstamo Fijo'>('12 semanas');
  const [regMonthlyPlan, setRegMonthlyPlan] = useState<string>('3000_4200');
  const [regWeeklyPlan, setRegWeeklyPlan] = useState<string>('3000_3900');
  const [regIneFront, setRegIneFront] = useState('');
  const [regIneBack, setRegIneBack] = useState('');
  const [regProofOfAddress, setRegProofOfAddress] = useState('');
  
  const [regIneFrontName, setRegIneFrontName] = useState('');
  const [regIneBackName, setRegIneBackName] = useState('');
  const [regProofName, setRegProofName] = useState('');

  const [dragActiveRegIneFront, setDragActiveRegIneFront] = useState(false);
  const [dragActiveRegIneBack, setDragActiveRegIneBack] = useState(false);
  const [dragActiveRegProof, setDragActiveRegProof] = useState(false);

  // ---------------------------------------------------------
  // NOTIFICATIONS & PROGRAMMATIC AUDIO SYNTHESIZER
  // ---------------------------------------------------------
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('buro_sound_enabled') !== 'false';
  });

  const [systemNotifications, setSystemNotifications] = useState<any[]>(() => {
    const local = localStorage.getItem('buro_notifications');
    if (local) {
      try { return JSON.parse(local); } catch(e) { console.error(e); }
    }
    return [
      {
        id: 'NOT-001',
        title: '📥 Ficha de Pago Entrante',
        message: 'Melvin Zauriel Pérez reportó evidencia de abono por $1,250 MXN.',
        type: 'info',
        targetRoles: 'admin_harold,cajera_lucia,asesor_juan',
        timestamp: new Date().toISOString(),
        readBy: '',
        soundPlayed: true
      },
      {
        id: 'NOT-002',
        title: '📝 Expediente en Revisión',
        message: 'Esperanza Escobedo Guzman cargó documentos para su línea de crédito EXP-8801 por $25,000.',
        type: 'warning',
        targetRoles: 'admin_harold,asesor_juan',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        readBy: '',
        soundPlayed: true
      }
    ];
  });

  // Active floating alert overlay modal for real-time notifications
  const [activePopupAlert, setActivePopupAlert] = useState<{
    id: string;
    title: string;
    message: string;
    soundType: 'success' | 'warning' | 'alert' | 'submit';
    type: 'success' | 'warning' | 'info';
    actionText?: string;
    actionTab?: string;
  } | null>(null);

  const [isNotificationTrayOpen, setIsNotificationTrayOpen] = useState<boolean>(false);

  // Synthesize custom wave audio chimes programmatically without download lag
  const playSynthesizedSound = (type: 'success' | 'warning' | 'alert' | 'submit') => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'success') {
        // High-glowing positive chime arpeggio
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gainNode.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.40);
        });
      } else if (type === 'warning') {
        // Low double buzz for rejections / failures
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(145, ctx.currentTime);
        osc2.frequency.setValueAtTime(142, ctx.currentTime); // detuned buzz
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.5);
        osc2.stop(ctx.currentTime + 0.5);
      } else if (type === 'submit') {
        // Upward frequency swipe for uploads
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Crisp high bell ding
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Audio Context audio playback blocked or not allowed yet:", e);
    }
  };

  const addNotificationAndPopup = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'info',
    soundType: 'success' | 'warning' | 'alert' | 'submit',
    rolesCsv: string,
    showPopupForCurrentUser: boolean,
    actionButton?: { text: string; tab: string }
  ) => {
    const freshId = 'NOT-' + Math.floor(1005 + Math.random() * 8990);
    const newNotif = {
      id: freshId,
      title,
      message,
      type,
      targetRoles: rolesCsv,
      timestamp: new Date().toISOString(),
      readBy: '',
      soundPlayed: true
    };

    setSystemNotifications(prev => [newNotif, ...prev]);

    // Show popup overlay modal immediately for matching roles
    if (showPopupForCurrentUser) {
      setActivePopupAlert({
        id: freshId,
        title,
        message,
        soundType,
        type,
        actionText: actionButton?.text,
        actionTab: actionButton?.tab
      });
    }

    playSynthesizedSound(soundType);
  };

  const toggleSoundSettings = () => {
    setIsSoundEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('buro_sound_enabled', String(newVal));
      return newVal;
    });
  };

  const handleMarkAllNotificationsAsRead = () => {
    setSystemNotifications(prev => prev.map(n => {
      const readArray = n.readBy ? n.readBy.split(',').filter(Boolean) : [];
      if (!readArray.includes(currentUser)) {
        readArray.push(currentUser);
      }
      return { ...n, readBy: readArray.join(',') };
    }));
  };

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

  // SUPABASE CLOUD DEPLOYMENT & SYNC ENGINE
  const [supabaseStatus, setSupabaseStatus] = useState<'LOADING' | 'CONNECTED' | 'ERROR_NO_TABLES' | 'OFFLINE'>('LOADING');
  const [isCloudSyncInProgress, setIsCloudSyncInProgress] = useState<boolean>(false);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('buro_dossiers', JSON.stringify(dossiers));
  }, [dossiers]);

  useEffect(() => {
    localStorage.setItem('buro_notifications', JSON.stringify(systemNotifications));
    if (supabaseStatus === 'CONNECTED' && systemNotifications.length > 0) {
      const dbNotifs: DbSystemNotification[] = systemNotifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        targetRoles: n.targetRoles || '',
        timestamp: n.timestamp,
        readBy: n.readBy || '',
        soundPlayed: n.soundPlayed ?? true
      }));
      bulkInsertSystemNotificationsCloud(dbNotifs);
    }
  }, [systemNotifications, supabaseStatus]);

  // Sincronización Inicial (Mount)
  useEffect(() => {
    async function initSupabaseSync() {
      try {
        setSupabaseStatus('LOADING');
        
        // 1. Verificar existencia de las tablas
        const ok = await verifyTablesExist();
        if (!ok) {
          setSupabaseStatus('ERROR_NO_TABLES');
          return;
        }

        setIsCloudSyncInProgress(true);

        // 2. Sincronizar clientes
        const cloudClients = await fetchClientsCloud();
        if (cloudClients !== null) {
          if (cloudClients.length === 0) {
            await bulkInsertClientsCloud(clients);
          } else {
            setClients(cloudClients);
          }
        }

        // 3. Sincronizar solicitudes de crédito
        const cloudRequests = await fetchRequestsCloud();
        if (cloudRequests !== null) {
          if (cloudRequests.length === 0) {
            await bulkInsertRequestsCloud(requests);
          } else {
            setRequests(cloudRequests);
          }
        }

        // 4. Sincronizar consultas de buró
        const cloudQueries = await fetchQueriesCloud();
        if (cloudQueries !== null) {
          if (cloudQueries.length === 0) {
            await bulkInsertQueriesCloud(queries);
          } else {
            setQueries(cloudQueries);
          }
        }

        // 5. Sincronizar parámetros de riesgo
        const cloudParams = await fetchRiskParamsCloud();
        if (cloudParams !== null) {
          setRiskParams(cloudParams);
        } else {
          await saveRiskParamsCloud(riskParams);
        }

        // 6. Sincronizar alertas forenses de seguridad
        const cloudAlerts = await fetchSecurityAlertsCloud();
        if (cloudAlerts !== null) {
          if (cloudAlerts.length === 0 && securityAlerts.length > 0) {
            await bulkInsertSecurityAlertsCloud(securityAlerts);
          } else {
            setSecurityAlerts(cloudAlerts);
          }
        }

        // 7. Sincronizar evidencias de abono/pagos
        const cloudPayments = await fetchPaymentsCloud();
        if (cloudPayments !== null) {
          if (cloudPayments.length === 0) {
            await bulkInsertPaymentsCloud(clientPayments);
          } else {
            setClientPayments(cloudPayments);
          }
        }

        // 8. Sincronizar expedientes (dossiers)
        const cloudDossiers = await fetchDossiersCloud();
        if (cloudDossiers !== null) {
          if (cloudDossiers.length === 0) {
            await bulkInsertDossiersCloud(dossiers);
          } else {
            setDossiers(cloudDossiers);
          }
        }

        // 9. Sincronizar notificaciones en tiempo real
        const cloudNotifications = await fetchSystemNotificationsCloud();
        if (cloudNotifications !== null) {
          if (cloudNotifications.length === 0) {
            const dbNotifs: DbSystemNotification[] = systemNotifications.map(n => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type,
              targetRoles: n.targetRoles || '',
              timestamp: n.timestamp,
              readBy: n.readBy || '',
              soundPlayed: n.soundPlayed ?? true
            }));
            await bulkInsertSystemNotificationsCloud(dbNotifs);
          } else {
            // Remap database string format back to react state schema
            const decodedNotifs = cloudNotifications.map(n => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type,
              targetRoles: n.targetRoles,
              timestamp: n.timestamp,
              readBy: n.readBy,
              soundPlayed: n.soundPlayed
            }));
            setSystemNotifications(decodedNotifs);
          }
        }

        setSupabaseStatus('CONNECTED');
      } catch (err: any) {
        console.error('Supabase Setup error:', err);
        setSupabaseStatus('OFFLINE');
        setSyncErrorMessage(err?.message || 'Error de red / RLS');
      } finally {
        setIsCloudSyncInProgress(false);
      }
    }

    initSupabaseSync();
  }, []);

  // Incremental sync effects
  useEffect(() => {
    if (supabaseStatus === 'CONNECTED' && clients.length > 0) {
      bulkInsertClientsCloud(clients);
    }
  }, [clients, supabaseStatus]);

  useEffect(() => {
    if (supabaseStatus === 'CONNECTED' && requests.length > 0) {
      bulkInsertRequestsCloud(requests);
    }
  }, [requests, supabaseStatus]);

  useEffect(() => {
    if (supabaseStatus === 'CONNECTED' && queries.length > 0) {
      bulkInsertQueriesCloud(queries);
    }
  }, [queries, supabaseStatus]);

  useEffect(() => {
    if (supabaseStatus === 'CONNECTED') {
      saveRiskParamsCloud(riskParams);
    }
  }, [riskParams, supabaseStatus]);

  useEffect(() => {
    if (supabaseStatus === 'CONNECTED') {
      if (securityAlerts.length === 0) {
        clearSecurityAlertsCloud();
      } else {
        bulkInsertSecurityAlertsCloud(securityAlerts);
      }
    }
  }, [securityAlerts, supabaseStatus]);

  useEffect(() => {
    if (supabaseStatus === 'CONNECTED' && clientPayments.length > 0) {
      bulkInsertPaymentsCloud(clientPayments);
    }
  }, [clientPayments, supabaseStatus]);

  useEffect(() => {
    if (supabaseStatus === 'CONNECTED' && dossiers.length > 0) {
      bulkInsertDossiersCloud(dossiers);
    }
  }, [dossiers, supabaseStatus]);

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

    // Dispatch system notifications and matching popup modals
    const isClient = currentUser === 'cliente_esperanza';
    addNotificationAndPopup(
      isClient ? `📝 Comprobante Enviado Correctamente` : `💸 Comprobante Recibido (Folio: ${newPayment.id})`,
      isClient 
        ? `Tus documentos de abono por $${newPayment.amount.toLocaleString('es-MX')} MXN fueron enviados correctamente a recepción. Por favor, espera tu autorización.`
        : `El acreditado ${newPayment.clientName} ha reportado una ficha de abono por $${newPayment.amount.toLocaleString('es-MX')} MXN (ID: ${newPayment.id}) para validar administrativamente.`,
      'info',
      'alert',
      'admin_harold,cajera_lucia,asesor_juan,cliente_esperanza',
      true, // Show modal popup immediately to the submitter / receiver
      isClient ? undefined : { text: 'Validar en Caja', tab: 'cajera_dashboard' }
    );
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

      // Notify globally with nice success chime chord
      addNotificationAndPopup(
        `🎉 ¡Abono Liquidado y Validado!`,
        `El pago por $${payment.amount.toLocaleString('es-MX')} MXN de ${payment.clientName} (Folio: ${payment.id}) ha sido verificado con éxito y restado del saldo insoluto de inmediato.`,
        'success',
        'success',
        'admin_harold,cajera_lucia,asesor_juan,cliente_esperanza',
        true,
        { text: 'Ir a mi Portal', tab: 'client_portal' }
      );
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

      // Notify rejection globally with dissonant buzz
      addNotificationAndPopup(
        `⚠️ Comprobante Declinado por Cajera`,
        `El comprobante adjunto por $${payment.amount.toLocaleString('es-MX')} MXN para ${payment.clientName} fue rechazado por invalidez, duplicidad o ilegibilidad del ticket de depósito.`,
        'warning',
        'warning',
        'admin_harold,cajera_lucia,asesor_juan,cliente_esperanza',
        true,
        { text: 'Verificar Estatus', tab: 'client_portal' }
      );
    }
  };

  // EXPEDIENTES (DOSSIERS) ACTIONS AND PIPELINE MUTATIONS
  const handleAddDossier = (newDossier: ClientDossier) => {
    setDossiers(prev => [newDossier, ...prev]);

    // Create a transaction query log entry indicating receipt/analyzing status
    const newLog: BureauQueryLog = {
      id: `Q-${Math.floor(1005 + Math.random() * 8900)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: newDossier.clientName,
      requestedBy: 'cliente_portal',
      scoreFound: 680,
      resolution: `📥 SOLICITUD DE EXPEDIENTE: ${newDossier.id} de $${newDossier.requestedAmount.toLocaleString('es-MX')} MXN ingresada en fase de COTEJO. En espera de verificación de documentos.`
    };
    setQueries(prev => [newLog, ...prev]);

    // Push notifications with popup sound confirming submission successfully
    const isClient = currentUser === 'cliente_esperanza';
    addNotificationAndPopup(
      isClient ? `📄 Documentos Enviados Correctamente` : `🚨 Nueva Solicitud de Crédito (${newDossier.id})`,
      isClient
        ? `Tus documentos e identificaciones han sido enviados correctamente. Tu expediente por $${newDossier.requestedAmount.toLocaleString('es-MX')} está siendo analizado por el comité de crédito.`
        : `El cliente ${newDossier.clientName} ha enviado identificaciones y comprobantes para solicitar una línea de crédito de $${newDossier.requestedAmount.toLocaleString('es-MX')} MXN.`,
      'info',
      'submit',
      'admin_harold,asesor_juan,cliente_esperanza',
      true, // Show popup for either client or committee instantly
      isClient ? undefined : { text: 'Cotejar en Expedientes', tab: 'bureau' }
    );
  };

  const handleUpdateDossier = (dossierId: string, updates: Partial<ClientDossier>) => {
    setDossiers(prev => prev.map(d => {
      if (d.id === dossierId) {
        const updatedDossier = { ...d, ...updates };

        // Real-time notify if dossier has been declined
        if (updates.status === 'RECHAZADO') {
          addNotificationAndPopup(
            `🚫 Expediente Declinado por el Admin`,
            `El expediente ${d.id} de ${d.clientName} por $${d.requestedAmount.toLocaleString('es-MX')} fue rechazado tras el cotejo documental por inconsistencia en comprobantes.`,
            'warning',
            'warning',
            'admin_harold,asesor_juan,cliente_esperanza',
            true,
            { text: 'Ver Expediente', tab: 'client_portal' }
          );
        }
        return updatedDossier;
      }
      return d;
    }));
  };

  const handleApproveDossier = (dossier: ClientDossier) => {
    // 1. Update dossier status to APROBADO
    setDossiers(prev => prev.map(d => d.id === dossier.id ? { ...d, status: 'APROBADO', adminNotes: dossier.adminNotes } : d));

    // 2. Create an authorized credit request in requests pipeline
    const newRequest: CreditRequest = {
      id: 'REQ-' + Math.floor(10000 + Math.random() * 90000),
      clientName: dossier.clientName,
      requestedAmount: dossier.requestedAmount,
      purpose: 'Préstamo vía Expediente Digital Autorizado',
      score: 710,
      category: 'Personal',
      dateSubmitted: dossier.createdAt,
      status: 'APROBADO'
    };
    setRequests(prev => [newRequest, ...prev]);

    // 3. Register client if they don't already exist under this exact name
    const existingClientIndex = clients.findIndex(c => c.name.toLowerCase() === dossier.clientName.toLowerCase());
    
    // Format MXN helper
    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
    };

    if (existingClientIndex === -1) {
      // Create new client in app pool
      const newClientId = `PM-${Math.floor(100000 + Math.random() * 900000)}`;
      const newClient: Client = {
        id: newClientId,
        name: dossier.clientName,
        rfc: 'XAXX010101000',
        email: `${dossier.clientName.replaceAll(' ', '').trim().toLowerCase()}@saldaapp.com`,
        phone: '811' + Math.floor(1000000 + Math.random() * 9000000),
        creditScore: 710,
        bureauStatus: 'EXCELENTE',
        totalCreditGranted: dossier.requestedAmount,
        balanceOwed: dossier.requestedAmount,
        delinquencyDays: 0,
        category: 'Personal',
        joinDate: dossier.createdAt,
        membership: 'Ninguna'
      };
      setClients(prev => [newClient, ...prev]);

      const auditLog: BureauQueryLog = {
        id: `Q-${Math.floor(1003 + Math.random() * 8990)}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        queriedClientName: dossier.clientName,
        requestedBy: currentUser,
        scoreFound: 710,
        resolution: `✓ ALTA POR EXPEDIENTE: Nuevo cliente ${newClientId} creado con crédito otorgado de ${formatCurrency(dossier.requestedAmount)}.`
      };
      setQueries(prev => [auditLog, ...prev]);
    } else {
      // Update existing client balance and limits
      setClients(prev => prev.map((c, idx) => idx === existingClientIndex ? {
        ...c,
        totalCreditGranted: Number(c.totalCreditGranted) + Number(dossier.requestedAmount),
        balanceOwed: Number(c.balanceOwed) + Number(dossier.requestedAmount)
      } : c));

      const auditLog: BureauQueryLog = {
        id: `Q-${Math.floor(1003 + Math.random() * 8990)}`,
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        queriedClientName: dossier.clientName,
        requestedBy: currentUser,
        scoreFound: 710,
        resolution: `✓ ACTUALIZACIÓN POR EXPEDIENTE: Crédito de ${formatCurrency(dossier.requestedAmount)} adicionado al saldo insoluto de ${dossier.clientName}.`
      };
      setQueries(prev => [auditLog, ...prev]);
    }

    // Register security alert forenses
    const isLocalUser = currentUser || 'admin_harold';
    const alertId = 'SEC-' + Math.floor(10000 + Math.random() * 90000);
    const alertItem: SecurityIncident = {
      id: alertId,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      device: 'Consola Central Cloud',
      user: isLocalUser,
      actionBlocked: 'APROBACION_DE_EXPEDIENTE',
      targetClient: dossier.clientName,
      status: 'PENDIENTE',
      notes: `El usuario ${isLocalUser} autorizó y desembolsó exitosamente $${dossier.requestedAmount.toLocaleString('es-MX')} del expediente unificado ${dossier.id}.`
    };
    setSecurityAlerts(prev => [alertItem, ...prev]);

    // Dispatch real-time authorized loan notification with positive chiming sounds
    addNotificationAndPopup(
      `🌟 ¡PRÉSTAMO AUTORIZADO! ($${dossier.requestedAmount.toLocaleString('es-MX')})`,
      `Buenas noticias: El expediente ${dossier.id} de ${dossier.clientName} fue autorizado y activado en el sistema por el comité central. ¡Habilitado comercialmente!`,
      'success',
      'success',
      'admin_harold,asesor_juan,cajera_lucia,cliente_esperanza',
      true, // Show modal popup immediately
      { text: 'Ver Portal de Crédito', tab: 'client_portal' }
    );
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

  // UPDATE CLIENT WITH NEW VALUES (EDIT OR DEACTIVATE)
  const handleUpdateClient = (updatedClient: Client, originalId?: string) => {
    const idToMatch = originalId || updatedClient.id;
    setClients(prev => prev.map(c => c.id === idToMatch ? updatedClient : c));
    
    const newQueryLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: updatedClient.name,
      requestedBy: currentUser || 'admin_harold',
      scoreFound: updatedClient.creditScore,
      resolution: `✓ ACTUALIZACIÓN COMERCIAL: Expediente de cliente ${updatedClient.id} actualizado con éxito en Consola. Estatus Activo: ${updatedClient.active !== false ? 'SÍ' : 'NO'}.`
    };
    setQueries(prev => [newQueryLog, ...prev]);
  };

  // DELETE CLIENT PERMANENTLY
  const handleDeleteClient = (clientId: string) => {
    const target = clients.find(c => c.id === clientId);
    setClients(prev => prev.filter(c => c.id !== clientId));

    const newQueryLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: target ? target.name : `Cliente ${clientId}`,
      requestedBy: currentUser || 'admin_harold',
      scoreFound: target ? target.creditScore : 600,
      resolution: `⚠️ BAJA DE CARTERA: Expediente ${clientId} eliminado permanentemente de la Consola Central por Harold Salazar.`
    };
    setQueries(prev => [newQueryLog, ...prev]);
  };

  // ADD NEW CLIENT
  const handleAddClient = (newClientData: Omit<Client, 'id' | 'joinDate'>) => {
    // Generate unique unified registration number (ID de Cliente, ID de Préstamo e Identificador de Pago)
    const newId = generateNextClientId(clients, nextClientNumberBase);
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

  // IMPORT BATCH OF CLIENTS FROM CSV
  const handleImportClients = (newClients: Client[]) => {
    setClients(prev => {
      // Filter out duplicate clients by checking if ID or RFC already exists in prev
      const existingIds = new Set(prev.map(c => c.id));
      const existingRfcs = new Set(prev.map(c => c.rfc.toUpperCase()));
      
      const uniqueNewClients = newClients.map(c => {
        // If the imported client does not have a proper ID starting with CLI- or PM-, generate one
        let cleanId = c.id;
        if (!cleanId || (!cleanId.startsWith('PM-') && !cleanId.startsWith('CLI-'))) {
          cleanId = `PM-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        
        // Ensure ID is unique
        while (existingIds.has(cleanId)) {
          cleanId = `PM-${Math.floor(100000 + Math.random() * 900000)}`;
        }
        
        existingIds.add(cleanId);
        
        return {
          ...c,
          id: cleanId,
          rfc: c.rfc.toUpperCase(),
          joinDate: c.joinDate || new Date().toISOString().slice(0, 10),
          membership: c.membership || 'Ninguna'
        };
      }).filter(c => {
        // Double check RFC uniqueness: don't double import existing RFCs
        const rfcUpper = c.rfc.toUpperCase();
        if (existingRfcs.has(rfcUpper)) {
          return false;
        }
        existingRfcs.add(rfcUpper);
        return true;
      });

      return [...uniqueNewClients, ...prev];
    });

    // Create a batch query log
    const batchLog: BureauQueryLog = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      queriedClientName: `Lote de ${newClients.length} Clientes`,
      requestedBy: 'admin_harold',
      scoreFound: 750,
      resolution: `✓ IMPORTACIÓN MASIVA EXITOSA: Se añadieron ${newClients.length} expedientes de cartera de clientes unificados desde un archivo CSV.`
    };
    setQueries(prev => [batchLog, ...prev]);
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

  // Compute unread notifications count for the active logged-in user
  const unreadCount = systemNotifications.filter(n => {
    const roles = n.targetRoles ? n.targetRoles.split(',').map((r: string) => r.trim()) : [];
    const readUsers = n.readBy ? n.readBy.split(',').map((u: string) => u.trim()) : [];
    const isTarget = roles.includes(currentUser) || 
      (currentUser.startsWith('cliente_') && roles.some(r => r === 'cliente_esperanza' || r.startsWith('cliente_')));
    return isTarget && !readUsers.includes(currentUser);
  }).length;

  if (isHome) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-12 font-sans relative overflow-hidden text-left" id="select-role-home-page">
        {/* Decorative background glow rings to look extremely crafted and clean */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#a3c90e]/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -z-10" />

        <div className="max-w-4xl w-full flex flex-col items-center gap-6 text-center animate-fade-in relative z-10 py-6">
          
          <img 
            src="https://cossma.com.mx/saldaapplogo.png" 
            alt="Salda App" 
            className="h-14 md:h-16 w-auto object-contain block hover:scale-105 transition-transform duration-300 pointer-events-none mb-2" 
            referrerPolicy="no-referrer"
          />

          {homeSubView === 'roles' && (
            <div className="space-y-6 w-full max-w-2xl mx-auto animate-fadeIn">
              <span className="text-[10px] font-mono font-bold text-[#a3c90e] uppercase tracking-widest block text-center">Seleccione su Rol de Acceso</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                {/* ADMIN ACCESS CARD */}
                <button
                  onClick={() => {
                    setCurrentUser('admin_harold');
                    setActiveTab('portfolio');
                    setIsHome(false);
                    playSynthesizedSound('success');
                  }}
                  className="group relative bg-[#0a1f26]/60 hover:bg-[#0f2e38] border border-white/10 hover:border-[#a3c90e]/40 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 text-center overflow-hidden"
                  id="role-box-admin"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#a3c90e]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-[#a3c90e] group-hover:bg-[#a3c90e]/10 group-hover:border-[#a3c90e]/20 transition-all duration-300 shadow-inner">
                    <ShieldCheck className="w-7 h-7 group-hover:scale-110 transition-transform duration-305" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-white tracking-wide font-sans group-hover:text-[#a3c90e] transition-colors duration-200">
                      Administrador
                    </h2>
                    <p className="text-[9px] text-slate-400 font-mono tracking-tight leading-tight">Harold Salazar</p>
                  </div>
                </button>

                {/* CLIENT ACCESS CARD */}
                <button
                  onClick={() => {
                    setHomeSubView('client_options');
                    playSynthesizedSound('success');
                  }}
                  className="group relative bg-[#061019]/60 hover:bg-[#0c1c2b] border border-white/10 hover:border-indigo-500/40 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 text-center overflow-hidden"
                  id="role-box-client"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="w-14 h-14 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-300 shadow-inner">
                    <Smartphone className="w-7 h-7 group-hover:scale-110 transition-transform duration-305" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-white tracking-wide font-sans group-hover:text-indigo-400 transition-colors duration-200">
                      Cliente
                    </h2>
                    <p className="text-[9px] text-slate-400 font-mono tracking-tight leading-tight font-bold text-[#a3c90e]">Autoservicio</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {homeSubView === 'client_options' && (
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[32px] space-y-6 animate-fade-in relative overflow-hidden" id="client-login-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl animate-pulse" />
              
              <div className="border-b border-slate-800 pb-4 text-center sm:text-left">
                <span className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-widest block">Acceso de Clientes</span>
                <h3 className="text-lg font-bold text-white mt-1">Ingresar a mi Cuenta</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Ingresa tu usuario o clave única ID y contraseña para consultar tus saldos, reportar tus comprobantes de pago o simular créditos.
                </p>
              </div>

              {/* Login Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  setLoginError('');
                  const cleanUsername = loginUsername.trim().toLowerCase();
                  
                  // Search client in memory
                  const matchedClient = clients.find(c => 
                    (c.username && c.username.toLowerCase() === cleanUsername) || 
                    (c.id.toLowerCase() === cleanUsername) ||
                    (c.email && c.email.toLowerCase() === cleanUsername)
                  );

                  if (!matchedClient) {
                    setLoginError('El usuario o ID ingresado no está registrado.');
                    playSynthesizedSound('warning');
                    return;
                  }

                  if (matchedClient.password && matchedClient.password !== loginPassword) {
                    setLoginError('Contraseña incorrecta. Por favor, intente de nuevo.');
                    playSynthesizedSound('warning');
                    return;
                  }

                  // Login successful!
                  const targetUserStr = 'cliente_' + (matchedClient.username || matchedClient.id).toLowerCase();
                  setCurrentUser(targetUserStr);
                  setActiveTab('client_portal');
                  setIsHome(false);
                  playSynthesizedSound('success');

                  // Reset fields
                  setLoginUsername('');
                  setLoginPassword('');
                  setLoginError('');
                }}
                className="space-y-4"
              >
                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-500 text-xs rounded-xl flex items-center gap-2 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Nombre de Usuario o ID de Cliente *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. esperanza o PM-327072"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    id="login-username-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Contraseña *:</label>
                  <input
                    type="password"
                    required
                    placeholder="Ingrese su contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    id="login-password-input"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-95 duration-100 mt-2"
                  id="submit-login-button"
                >
                  <Smartphone className="w-4 h-4 animate-bounce" />
                  Iniciar Sesión en el Dashboard
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800/60 flex flex-col gap-3">
                <span className="text-[10px] uppercase font-mono text-slate-500 text-center">¿Nuevo en Salda App?</span>
                
                {/* Option B: New Registration */}
                <button
                  onClick={() => {
                    setHomeSubView('client_register');
                    playSynthesizedSound('success');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950/45 border border-[#a3c90e]/15 hover:border-[#a3c90e] hover:bg-slate-950/80 text-left transition duration-150 flex items-center justify-between cursor-pointer group"
                  id="go-to-register-button"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#a3c90e]/10 text-[#a3c90e] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                      +
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#a3c90e] transition">¡Crear Cuenta y Solicitar Préstamo!</h4>
                      <p className="text-[9px] text-slate-400">Auto-registro digital con INE y comprobantes en segundos.</p>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 -rotate-90" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setHomeSubView('roles')}
                  className="text-xs text-slate-400 hover:text-white font-mono underline cursor-pointer bg-transparent border-none"
                  type="button"
                >
                  ← Regresar al Selector de Roles
                </button>
              </div>
            </div>
          )}

          {homeSubView === 'client_register' && (
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[32px] space-y-6 text-left animate-fade-in relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3c90e]/5 rounded-full blur-2xl" />
              
              <div className="border-b border-slate-800 pb-4 text-center sm:text-left">
                <span className="text-[9px] font-mono font-black text-[#a3c90e] uppercase tracking-widest block">FORMULARIO DE EXPEDIENTE DIGITAL</span>
                <h3 className="text-lg font-bold text-white mt-1">Alta de Cliente y Solicitud de Préstamo</h3>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  Rellena los campos para darte de alta y subir tu expediente en línea. Al finalizar, tu préstamo quedará activo y personalizado con tu nombre.
                </p>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!regName || !regAddress || !regBirthDate || !regRequestedAmount) {
                    alert('Por favor, rellena los campos marcados con (*).');
                    return;
                  }
                  if (regRequestedAmount < 1000 || regRequestedAmount > 50000) {
                    alert('Error: El monto del préstamo solicitado debe ser de un mínimo de $1,000 MXN hasta un máximo de $50,000 MXN.');
                    return;
                  }
                  if (regPassword !== regConfirmPassword) {
                    alert('Error: Las contraseñas ingresadas no coinciden. Por favor, verifíquelas.');
                    return;
                  }
                  
                  const cleanUsername = regUsername.toLowerCase().trim() || regName.toLowerCase().replace(/[^a-z0-9]/g, '_');
                  const dossierId = 'EXP-' + Math.floor(1000 + Math.random() * 9000);
                  const finalIneFront = regIneFront || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&auto=format&fit=crop&q=80';
                  const finalIneBack = regIneBack || 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=800&auto=format&fit=crop&q=80';
                  const finalProof = regProofOfAddress || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80';

                  let regFee = 0;
                  if (regLoanType === 'Préstamo Fijo') {
                    const match = PRESTAMOS_FIJOS.find(p => p.capital === regRequestedAmount);
                    regFee = match ? match.interest : 1200;
                  } else {
                    regFee = Math.round((regRequestedAmount / 1000) * 135 * 12);
                  }
                  const regTotalPayable = regRequestedAmount + regFee;
                  let planDesc = '';
                  if (regLoanType === 'Préstamo Fijo') {
                    planDesc = `Préstamo Fijo/Mensual de $${regRequestedAmount.toLocaleString('es-MX')} MXN para pagar $${regTotalPayable.toLocaleString('es-MX')} MXN (Costo: $${regFee.toLocaleString('es-MX')} MXN en 4 semanas)`;
                  } else {
                    const abonoSemanal = Math.round(regTotalPayable / 12);
                    planDesc = `Plan Semanal a 12 Semanas con 12 pagos de $${abonoSemanal.toLocaleString('es-MX')} MXN (Total: $${regTotalPayable.toLocaleString('es-MX')} MXN, Capital: $${regRequestedAmount.toLocaleString('es-MX')} MXN + Costo: $${regFee.toLocaleString('es-MX')} MXN por 12 semanas)`;
                  }

                  const newDossier: ClientDossier = {
                    id: dossierId,
                    clientName: regName,
                    address: regAddress,
                    birthDate: regBirthDate,
                    ineFront: finalIneFront,
                    ineBack: finalIneBack,
                    proofOfAddress: finalProof,
                    requestedAmount: regRequestedAmount,
                    status: 'ANALIZANDO',
                    createdAt: new Date().toISOString().split('T')[0],
                    notificationDismissed: false,
                    loanType: regLoanType,
                    monthlyPlan: planDesc
                  };

                  const newClientId = generateNextClientId(clients, nextClientNumberBase);
                  const newClient: Client = {
                    id: newClientId,
                    name: regName,
                    username: cleanUsername,
                    password: regPassword,
                    rfc: 'XAXX010101050',
                    email: `${regName.replaceAll(' ', '').trim().toLowerCase()}@saldaapp.com`,
                    phone: '811' + Math.floor(1000000 + Math.random() * 9000000),
                    creditScore: 680,
                    bureauStatus: 'REGULAR',
                    totalCreditGranted: regRequestedAmount,
                    balanceOwed: regTotalPayable,
                    delinquencyDays: 0,
                    category: 'Personal',
                    joinDate: new Date().toISOString().split('T')[0],
                    membership: 'Ninguna'
                  };

                  setClients(prev => {
                    const updated = [newClient, ...prev];
                    bulkInsertClientsCloud([newClient]).catch(console.error);
                    return updated;
                  });

                  setDossiers(prev => {
                    const updated = [newDossier, ...prev];
                    saveDossierCloud(newDossier).catch(console.error);
                    return updated;
                  });

                  // Add bureau query log
                  const newLog: BureauQueryLog = {
                    id: `Q-${Math.floor(1005 + Math.random() * 8900)}`,
                    timestamp: new Date().toISOString(),
                    queriedClientName: regName,
                    requestedBy: 'cliente_portal',
                    scoreFound: 710,
                    resolution: `📥 AUTO-REGISTRO EXITOSO: Expediente ${dossierId} de ${regName} con ID de Cliente ${newClientId} por $${regRequestedAmount.toLocaleString('es-MX')} MXN ingresado en fase de validación.`
                  };
                  setQueries(prev => [newLog, ...prev]);

                  // Security Incident
                  const alertId = 'SEC-' + Math.floor(10000 + Math.random() * 90000);
                  const alertItem: SecurityIncident = {
                    id: alertId,
                    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    device: 'Plataforma Web',
                    user: 'cliente_' + cleanUsername,
                    actionBlocked: 'EXPEDIENTE_SOLICITADO',
                    targetClient: regName,
                    status: 'PENDIENTE',
                    notes: `El nuevo cliente ${regName} ha completado exitosamente su registro de expediente con número ${newClientId} y solicitado una línea de crédito comercial.`
                  };
                  setSecurityAlerts(prev => [alertItem, ...prev]);

                  // Notify
                  addNotificationAndPopup(
                    `📄 Expediente Creado: ${regName}`,
                    `Tu nuevo expediente digital ${dossierId} con Número de Cliente (Folio) ${newClientId} fue creado con estatus ANALIZANDO. Ya puedes operar en el Portal del Cliente.`,
                    'info',
                    'submit',
                    'admin_harold,asesor_juan,cliente_esperanza',
                    true
                  );

                  setCurrentUser('cliente_' + cleanUsername);
                  setActiveTab('client_portal');
                  setIsHome(false);
                  playSynthesizedSound('success');

                  // Clear
                  setRegName('');
                  setRegUsername('');
                  setRegPassword('');
                  setRegConfirmPassword('');
                  setShowRegPassword(false);
                  setShowRegConfirmPassword(false);
                  setRegAddress('');
                  setRegBirthDate('');
                  setRegIneFront('');
                  setRegIneBack('');
                  setRegProofOfAddress('');
                  setRegIneFrontName('');
                  setRegIneBackName('');
                  setRegProofName('');
                  setHomeSubView('roles');
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Nombre Completo *:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Gregorio Marín"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Fecha de Nacimiento *:</label>
                    <input
                      type="date"
                      required
                      value={regBirthDate}
                      onChange={(e) => setRegBirthDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                    />
                  </div>
                </div>

                {/* ACCOUNT CREDENTIALS FOR PORTAL LOGIN */}
                <div className="bg-[#0b1c24]/50 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <span className="text-[9px] font-mono font-black text-[#a3c90e] uppercase tracking-wider block">Credenciales de Acceso al Portal:</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Usuario *:</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. gregorio12"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Contraseña *:</label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          required
                          placeholder="Mín. 8 caracteres"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2 top-1.5 text-slate-400 hover:text-[#a3c90e] bg-transparent border-none cursor-pointer p-1"
                        >
                          {showRegPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
                          let pass = "";
                          for (let i = 0; i < 10; i++) {
                            pass += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          setRegPassword(pass);
                          setRegConfirmPassword(pass);
                        }}
                        className="text-[9px] text-[#a3c90e] hover:underline font-mono mt-1 block w-full text-left bg-transparent border-none cursor-pointer"
                      >
                        ⚡ Generar Contraseña
                      </button>
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Confirmar Contraseña *:</label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? "text" : "password"}
                          required
                          placeholder="Repite la contraseña"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-2 top-1.5 text-slate-400 hover:text-[#a3c90e] bg-transparent border-none cursor-pointer p-1"
                        >
                          {showRegConfirmPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Domicilio Completo *:</label>
                  <input
                    type="text"
                    required
                    placeholder="Calle, número, colonia, código postal, estado..."
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                  />
                </div>

                {/* Dynamic Onboarding Loan Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-950/40 p-4 border border-slate-800 rounded-2xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Tipo de Préstamo *:</label>
                      <select
                        value={regLoanType}
                        onChange={(e) => {
                          const val = e.target.value as '12 semanas' | 'Préstamo Fijo';
                          setRegLoanType(val);
                          if (val === 'Préstamo Fijo') {
                            setRegRequestedAmount(3000);
                          } else {
                            setRegRequestedAmount(10000);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                      >
                        <option value="12 semanas">12 Semanas (Planes Semanales)</option>
                        <option value="Préstamo Fijo">Préstamo Fijo (Planes Mensuales)</option>
                      </select>
                    </div>

                    {regLoanType === 'Préstamo Fijo' ? (
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Préstamos Fijos *:</label>
                        <select
                          value={regRequestedAmount}
                          onChange={(e) => {
                            setRegRequestedAmount(Number(e.target.value));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-[#a3c90e] font-black focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                        >
                          {PRESTAMOS_FIJOS.map((item) => (
                            <option key={item.capital} value={item.capital}>
                              {item.label} (Mensual)
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Monto de Capital Solicitado ($ MXN) *:</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-[#a3c90e] font-sans font-bold text-sm">$</span>
                          <input
                            type="number"
                            min={1000}
                            max={50000}
                            step={1000}
                            required
                            value={regRequestedAmount || ''}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setRegRequestedAmount(Math.min(50000, val));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-[#a3c90e] font-black focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                          />
                        </div>

                        {/* Onboarding slider */}
                        <div className="pt-2 px-1">
                          <input
                            type="range"
                            min={1000}
                            max={50000}
                            step={1000}
                            value={regRequestedAmount || 1000}
                            onChange={(e) => setRegRequestedAmount(Number(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#a3c90e]"
                          />
                          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 select-none">
                            <span>Mín: $1,000</span>
                            <span>Paso: $1,000</span>
                            <span>Máx: $50,000</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Real-time Calculation Panel */}
                  <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[10px] uppercase font-mono font-black text-[#a3c90e] tracking-wider border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
                        <span>📊 Análisis de Cuotas</span>
                        <span className="text-[9px] text-[#a3c90e]/80 font-normal italic">
                          {regLoanType === 'Préstamo Fijo' ? 'Menú de Préstamos Fijos' : '($135 sem. x cada $1,000)'}
                        </span>
                      </h4>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400">Capital Solicitado:</span>
                          <span className="text-white font-mono font-bold">
                            ${(regRequestedAmount || 0).toLocaleString('es-MX')} MXN
                          </span>
                        </div>

                        <div className="flex justify-between py-0.5">
                          <span className="text-slate-400">Interés Estimado ({regLoanType === '12 semanas' ? '12 Semanas' : 'Préstamo Fijo'}):</span>
                          <span className="text-[#a3c90e] font-mono font-bold">
                            ${(Math.round(
                              regLoanType === 'Préstamo Fijo'
                                ? (PRESTAMOS_FIJOS.find(p => p.capital === regRequestedAmount)?.interest || 1200)
                                : ((regRequestedAmount || 0) / 1000) * 135 * 12
                            )).toLocaleString('es-MX')} MXN
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-[#0284c7]/5 border border-[#0284c7]/10 rounded-lg">
                      <div className="text-[9px] uppercase font-mono text-[#38bdf8] font-bold mb-0.5">
                        Plan de Amortización:
                      </div>
                      {regLoanType === '12 semanas' ? (
                        <div className="text-[11px] text-slate-300">
                          <strong>12 pagos semanales</strong> de{" "}
                          <span className="text-white font-bold font-mono">
                            ${Math.round(Math.round(((regRequestedAmount || 0) / 1000) * 135 * 12) / 12).toLocaleString('es-MX')}
                          </span>{" "}
                          MXN.
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-300">
                          <strong>4 pagos semanales</strong> de{" "}
                          <span className="text-white font-bold font-mono">
                            ${Math.round((PRESTAMOS_FIJOS.find(p => p.capital === regRequestedAmount)?.interest || 1200) / 4).toLocaleString('es-MX')}
                          </span>{" "}
                          MXN.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Documents row */}
                <div className="space-y-3 bg-slate-950 p-4 border border-slate-900 rounded-2xl">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block">EXPEDIENTE DE DOCUMENTOS DIGITALES:</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* INE FRONT */}
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center transition ${
                        dragActiveRegIneFront ? 'border-[#a3c90e] bg-[#a3c90e]/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                      }`}
                      onDragEnter={(e) => { e.preventDefault(); setDragActiveRegIneFront(true); }}
                      onDragOver={(e) => { e.preventDefault(); setDragActiveRegIneFront(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragActiveRegIneFront(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActiveRegIneFront(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setRegIneFrontName(file.name);
                          const r = new FileReader();
                          r.onloadend = () => setRegIneFront(r.result as string);
                          r.readAsDataURL(file);
                        }
                      }}
                    >
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-white mb-1 shrink-0" />
                      <span className="text-[9px] font-mono text-slate-300 font-bold">INE Frente</span>
                      <span className="text-[8px] text-slate-500 font-sans mt-0.5 truncate max-w-full">
                        {regIneFrontName ? `✓ ${regIneFrontName}` : 'Arrastra o pincha'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.type === 'change' ? (e.target as HTMLInputElement).files?.[0] : (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            setRegIneFrontName(file.name);
                            const r = new FileReader();
                            r.onloadend = () => setRegIneFront(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>

                    {/* INE BACK */}
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center transition ${
                        dragActiveRegIneBack ? 'border-[#a3c90e] bg-[#a3c90e]/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                      }`}
                      onDragEnter={(e) => { e.preventDefault(); setDragActiveRegIneBack(true); }}
                      onDragOver={(e) => { e.preventDefault(); setDragActiveRegIneBack(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragActiveRegIneBack(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActiveRegIneBack(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setRegIneBackName(file.name);
                          const r = new FileReader();
                          r.onloadend = () => setRegIneBack(r.result as string);
                          r.readAsDataURL(file);
                        }
                      }}
                    >
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-white mb-1 shrink-0" />
                      <span className="text-[9px] font-mono text-slate-300 font-bold">INE Reverso</span>
                      <span className="text-[8px] text-slate-500 font-sans mt-0.5 truncate max-w-full">
                        {regIneBackName ? `✓ ${regIneBackName}` : 'Arrastra o pincha'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            setRegIneBackName(file.name);
                            const r = new FileReader();
                            r.onloadend = () => setRegIneBack(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>

                    {/* ADDRESS CE */}
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center transition ${
                        dragActiveRegProof ? 'border-[#a3c90e] bg-[#a3c90e]/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                      }`}
                      onDragEnter={(e) => { e.preventDefault(); setDragActiveRegProof(true); }}
                      onDragOver={(e) => { e.preventDefault(); setDragActiveRegProof(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragActiveRegProof(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActiveRegProof(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setRegProofName(file.name);
                          const r = new FileReader();
                          r.onloadend = () => setRegProofOfAddress(r.result as string);
                          r.readAsDataURL(file);
                        }
                      }}
                    >
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-white mb-1 shrink-0" />
                      <span className="text-[9px] font-mono text-slate-300 font-bold">Comprobante</span>
                      <span className="text-[8px] text-slate-500 font-sans mt-0.5 truncate max-w-full">
                        {regProofName ? `✓ ${regProofName}` : 'Arrastra o pincha'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            setRegProofName(file.name);
                            const r = new FileReader();
                            r.onloadend = () => setRegProofOfAddress(r.result as string);
                            r.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setHomeSubView('client_options')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold py-2.5 px-4 rounded-xl transition text-center text-xs border border-white/5 cursor-pointer"
                  >
                    Regresar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#a3c90e] hover:bg-[#b5dc12] text-slate-950 font-black py-2.5 px-4 rounded-xl transition text-center text-xs cursor-pointer shadow-lg shadow-[#a3c90e]/20"
                  >
                    Enviar Expediente y Entrar ✓
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-4">
            Salda App • Cartera Integrada y Consulta Remota
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* IMMERSIVE UNENCAPSULATED SPLASH SCREEN */}
      {showSplash && (
        <div 
          onClick={() => setShowSplash(false)}
          className="fixed inset-0 z-50 bg-[#051b21] flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer"
          title="Toca en cualquier parte para ingresar de inmediato"
        >
          <div className="max-w-md w-full flex flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
            {/* Splash image - Unencapsulated to display completely */}
            <img 
              src="https://cossma.com.mx/saldaappsplash.png" 
              alt="Salda App Splash" 
              className="w-full max-h-[45vh] object-contain block" 
              referrerPolicy="no-referrer"
            />
            
            <div className="space-y-2 mt-2">
              <h1 className="text-3xl font-black text-white tracking-widest uppercase font-sans">
                Salda App
              </h1>
              <p className="text-xs font-mono text-[#a3c90e] uppercase tracking-wider font-bold">
                Consola General de Cartera y Buró Seguro
              </p>
            </div>

            {/* Glowing progress line */}
            <div className="w-56 h-1 bg-slate-800 rounded-full overflow-hidden mt-4 relative">
              <div className="absolute inset-y-0 w-full bg-gradient-to-r from-emerald-400 via-[#a3c90e] to-indigo-500 rounded-full animate-progress-infinite" />
            </div>
            
            <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-2 uppercase">
              Estableciendo túnel cifrado CNBV • Harold Salazar_
            </p>
            <p className="text-[9px] text-slate-500 mt-2 font-sans opacity-75">
              (Haz clic en cualquier lado para saltar inmediatamente)
            </p>
          </div>
        </div>
      )}

      {/* iOS INSTALLATION MANUAL MODAL */}
      {showIosInstruction && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-left">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-[#a3c90e]" /> ¡Instalar en tu iPhone!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Para tener acceso instantáneo en tu iPhone o iPad sin barra de navegación del explorador:
            </p>
            <ol className="space-y-3.5 text-xs text-slate-400 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#a3c90e]/10 text-[#a3c90e] font-mono font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>Pulsa el botón de <strong>Compartir</strong> (un cuadrado con flecha hacia arriba) en la parte inferior de Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#a3c90e]/10 text-[#a3c90e] font-mono font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>Desplázate y selecciona <strong>Añadir a la pantalla de inicio</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#a3c90e]/10 text-[#a3c90e] font-mono font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>Nombra la app como <strong className="text-white">Salda App</strong> y presiona <strong>Añadir</strong> en la esquina superior derecha.</span>
              </li>
            </ol>
            <div className="mt-6">
              <button
                onClick={() => setShowIosInstruction(false)}
                className="w-full bg-[#a3c90e] hover:bg-[#b8e014] text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition cursor-pointer text-center"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Header */}
      {(() => {
        const activeClientObj = clients.find(c => {
          const isCustomUser = currentUser.startsWith('cliente_') && currentUser !== 'cliente_esperanza';
          const customTargetUsername = currentUser.replace('cliente_', '').toLowerCase().trim();
          if (isCustomUser) {
            return (c.username && c.username.toLowerCase() === customTargetUsername) || 
                   (c.id.toLowerCase() === customTargetUsername) ||
                   (c.name.toLowerCase().replace(/[^a-z0-9]/g, '_') === customTargetUsername) ||
                   (c.name.toLowerCase() === customTargetUsername.replace(/_/g, ' '));
          } else if (currentUser === 'cliente_esperanza') {
            return c.id === 'PM-327072';
          }
          return false;
        });
        const headerDisplayName = activeClientObj ? activeClientObj.name : getUserDisplayName(currentUser);
        const headerProfileImage = activeClientObj?.profileImage;

        return (
          <AdminHeader 
            currentUser={currentUser} 
            onUserChange={handleUserChange} 
            onResetData={handleResetData} 
            onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
            unreadNotificationsCount={unreadCount}
            onOpenNotifications={() => setIsNotificationTrayOpen(true)}
            isSoundEnabled={isSoundEnabled}
            onToggleSound={toggleSoundSettings}
            onGoHome={() => setIsHome(true)}
            userDisplayName={headerDisplayName}
            profileImage={headerProfileImage}
          />
        );
      })()}

      {/* Main Layout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

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
                <div className="flex flex-col gap-3 pb-3.5 border-b border-slate-800 animate-fadeIn bg-slate-900">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <img 
                        src="https://cossma.com.mx/saldaapplogo.png" 
                        alt="Salda App Logo"
                        className="h-7 w-auto object-contain block"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <button 
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
                      title="Cerrar menú"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Compact Mobile Cloud Status Indicator */}
                  <div className="flex items-center gap-2 px-1 py-1 rounded bg-slate-950/50 justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        supabaseStatus === 'CONNECTED' ? 'bg-[#a3c90e] animate-pulse' :
                        supabaseStatus === 'LOADING' ? 'bg-amber-400 animate-ping' :
                        supabaseStatus === 'ERROR_NO_TABLES' ? 'bg-orange-500' : 'bg-slate-600'
                      }`} />
                      <span className="text-[9px] font-mono font-bold uppercase text-slate-400">
                        {supabaseStatus === 'CONNECTED' ? 'NUBE ACTIVA' :
                         supabaseStatus === 'LOADING' ? 'CARGANDO...' :
                         supabaseStatus === 'ERROR_NO_TABLES' ? 'TABLAS EXTRAVIADAS' : 'NUBE OFFLINE'}
                      </span>
                    </div>
                    {supabaseStatus === 'ERROR_NO_TABLES' && (
                      <span className="text-[8px] font-sans text-orange-400 font-bold">Requiere SQL</span>
                    )}
                    {supabaseStatus === 'CONNECTED' && (
                      <span className="text-[8px] font-mono text-[#a3c90e] font-bold">OK</span>
                    )}
                  </div>
                </div>

                <nav className="space-y-2">
                  <span className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest px-3 mb-2">
                    Módulos Disponibles
                  </span>

                  {/* TAB OPTION 6: FINANCIAL METRICS (MOVED TO TOP) */}
                  {currentUser === 'admin_harold' && (
                    <button
                      id="mobile-tab-financial-metrics"
                      onClick={() => setActiveTab('financial_metrics')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                        activeTab === 'financial_metrics'
                          ? 'bg-indigo-600 text-white font-bold border-indigo-500 shadow-lg shadow-indigo-600/15'
                          : 'bg-slate-955 bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className={`w-4 h-4 ${activeTab === 'financial_metrics' ? 'text-white' : 'text-emerald-400'}`} />
                        <span className="text-xs font-semibold">Métricas</span>
                      </div>
                      <span className="bg-slate-955 bg-slate-950 text-indigo-400 text-[9px] font-mono border border-slate-850 px-1.5 py-0.5 rounded uppercase font-bold">
                        Finanzas
                      </span>
                    </button>
                  )}

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
                  {currentUser === 'cajera_lucia' && (
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
                          : 'bg-blue-500/10 text-blue-400 border-blue-505/20 font-bold'
                      }`}>
                        RECAUDACIÓN
                      </span>
                    </button>
                  )}

                  {/* TAB OPTION 1: PORTFOLIO */}
                  {(currentUser === 'admin_harold' || currentUser === 'asesor_juan' || currentUser === 'cajera_lucia') && (
                    <button
                      id="mobile-tab-portfolio-management"
                      onClick={() => setActiveTab('portfolio')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                        activeTab === 'portfolio'
                          ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Layers className={`w-4 h-4 ${activeTab === 'portfolio' ? 'text-white' : 'text-slate-500'}`} />
                        <span className="text-xs font-semibold">
                          {currentUser === 'admin_harold' ? 'Clientes Nuevos' : 'Gestión de Cartera'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        activeTab === 'portfolio' 
                          ? 'bg-slate-950 text-[#a3c90e] font-bold border border-[#a3c90e]/20' 
                          : 'bg-[#a3c90e]/15 text-[#a3c90e] border border-[#a3c90e]/20 font-bold'
                      }`}>
                        {clients.length}
                      </span>
                    </button>
                  )}



                  {/* TAB OPTION 3: REQUESTS PIPELINE */}
                  {(currentUser === 'admin_harold' || currentUser === 'asesor_juan' || currentUser === 'cajera_lucia') && (
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
                        <span className="text-xs font-semibold">
                          {currentUser === 'admin_harold' ? 'Autorización de Créditos' : 'Pipeline Aprobaciones'}
                        </span>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        {requests.filter(r => r.status === 'PENDIENTE').length > 0 && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        )}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          activeTab === 'requests' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {requests.filter(r => r.status === 'PENDIENTE').length} pnd
                        </span>
                      </div>
                    </button>
                  )}

                  {/* TAB OPTION 7: CREDIT SIMULATION */}
                  {(currentUser === 'admin_harold' || currentUser === 'asesor_juan' || currentUser === 'cliente_esperanza' || currentUser.startsWith('cliente_')) && (
                    <button
                      id="mobile-tab-credit-simulation"
                      onClick={() => setActiveTab('credit_simulation')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                        activeTab === 'credit_simulation'
                          ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-955 bg-slate-950 text-slate-400 hover:text-white border-slate-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Layers className={`w-4 h-4 ${activeTab === 'credit_simulation' ? 'text-white' : 'text-[#a3c90e]'}`} />
                        <span className="text-xs font-semibold font-semibold font-semibold">Simulador de Crédito</span>
                      </div>
                      <span className="bg-slate-950 text-[#a3c90e] text-[9px] font-mono border border-slate-850 px-1.5 py-0.5 rounded uppercase font-bold">
                        Simulación
                      </span>
                    </button>
                  )}

                  {/* EXPEDIENTES (NUEVO MODULO) */}
                  {(currentUser === 'admin_harold' || currentUser === 'asesor_juan') && (
                    <button
                      id="mobile-tab-dossiers"
                      onClick={() => setActiveTab('dossiers')}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                        activeTab === 'dossiers'
                          ? 'bg-indigo-650 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-550/20'
                          : 'bg-slate-950 text-indigo-400 border-slate-800 hover:text-white font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`w-4 h-4 ${activeTab === 'dossiers' ? 'text-white' : 'text-indigo-400'}`} />
                        <span className="text-xs font-bold text-slate-200">Expedientes (Préstamos)</span>
                      </div>
                      <span className="text-[9px] bg-indigo-505 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono font-black animate-pulse">
                        NUEVO
                      </span>
                    </button>
                  )}

                  {/* PORTAL DE CLIENTES (DEMO) */}
                  {currentUser !== 'admin_harold' && (
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
                        <span className="text-xs font-bold text-slate-200">Mis pagos</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-mono font-black">
                        CLIENTE
                      </span>
                    </button>
                  )}

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
                        <FileCheck2 className={`w-4 h-4 ${activeTab === 'payment_verification' ? 'text-slate-955' : 'text-amber-450 animate-bounce'}`} />
                        <span className="text-xs font-semibold">
                          {currentUser === 'admin_harold' ? 'Verificación de Pagos' : 'Validación de Abonos'}
                        </span>
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

                {/* PWA INSTALLATION WIDGET (MOBILE DRAWER) */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-left space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://cossma.com.mx/saldaappicono.png" 
                      alt="Salda App" 
                      className="w-5 h-5 rounded-lg object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[9px] font-mono font-bold text-emerald-400 block uppercase tracking-wider">
                      Aplicación Móvil
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    Lleva la Consola de Riesgo y Cartera de Salda App instalada nativamente en tu smartphone.
                  </p>
                  <button
                    onClick={handleInstallApp}
                    className="w-full py-2 px-3 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 hover:text-white rounded-xl text-[10px] font-black tracking-tight uppercase transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    Instalar Salda App
                  </button>
                </div>

                <div className="mt-auto p-4 bg-slate-950 border border-slate-850 rounded-2xl text-[10px] text-slate-500 font-mono tracking-tight text-center">
                  Consola Buró Seguro • v1.2.0
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP NAVIGATION SIDEBAR (MODULES SELECTOR - PERMANENT ON THE LEFT) */}
          <nav className="hidden lg:block lg:col-span-3 space-y-2" id="desktop-sidebar-nav">
            {/* UNENCAPSULATED DESKTOP BRAND LOGO & SUPABASE SYNC STATUS */}
            <div className="p-4 mb-3 bg-slate-900/40 rounded-3xl border border-slate-800/80 flex flex-col items-center justify-center gap-3 animate-fadeIn">
              <img 
                src="https://cossma.com.mx/saldaapplogo.png" 
                alt="Salda App Logo" 
                className="h-10 w-auto object-contain block" 
                referrerPolicy="no-referrer"
              />
              
              {/* Supabase Dynamic Cloud Sync Indicator */}
              <div className="w-full pt-2.5 border-t border-slate-800/60 flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${
                    supabaseStatus === 'CONNECTED' ? 'bg-[#a3c90e] animate-pulse' :
                    supabaseStatus === 'LOADING' ? 'bg-amber-400 animate-ping' :
                    supabaseStatus === 'ERROR_NO_TABLES' ? 'bg-orange-500' : 'bg-slate-600'
                  }`} />
                  <span className="text-[10px] font-mono font-bold tracking-tight uppercase text-slate-300">
                    {supabaseStatus === 'CONNECTED' ? 'Nube Supabase' :
                     supabaseStatus === 'LOADING' ? 'Conectando...' :
                     supabaseStatus === 'ERROR_NO_TABLES' ? 'Tablas Faltantes' : 'Nube Offline'}
                  </span>
                </div>
                
                {supabaseStatus === 'CONNECTED' && (
                  <p className="text-[8px] text-[#a3c90e] font-mono text-center leading-none uppercase font-black tracking-wider">
                    ¡Conexión Activa!
                  </p>
                )}
                {supabaseStatus === 'LOADING' && (
                  <p className="text-[8px] text-amber-400 font-mono text-center leading-none">
                    Comprobando estado...
                  </p>
                )}
                {supabaseStatus === 'ERROR_NO_TABLES' && (
                  <p className="text-[8px] text-orange-400 font-sans text-center leading-normal">
                    Falta ejecutar el script <strong className="text-white font-mono bg-slate-950 px-1 py-0.5 rounded">supabase-schema.sql</strong> para activar la base de datos remota.
                  </p>
                )}
                {supabaseStatus === 'OFFLINE' && (
                  <p className="text-[8px] text-slate-500 font-mono text-center leading-none">
                    Modo Local Seguro (Offline)
                  </p>
                )}
              </div>
            </div>
            <span className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest px-3 mb-2">
              Módulos Disponibles
            </span>

            {/* TAB OPTION 6: FINANCIAL METRICS & MONTH-END CLOSE (MOVED TO TOP) */}
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
                  <span className="text-xs font-semibold">Métricas</span>
                </div>
                <span className="bg-slate-955 bg-slate-950 text-indigo-400 text-[9px] font-mono border border-slate-850 px-1.5 py-0.5 rounded uppercase font-bold">
                  Finanzas
                </span>
              </button>
            )}

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
            {currentUser === 'cajera_lucia' && (
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
            {(currentUser === 'admin_harold' || currentUser === 'asesor_juan' || currentUser === 'cajera_lucia') && (
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
                  <span className="text-xs font-semibold">
                    {currentUser === 'admin_harold' ? 'Clientes Nuevos' : 'Gestión de Cartera'}
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  activeTab === 'portfolio' 
                    ? 'bg-slate-950 text-[#a3c90e] font-bold border border-[#a3c90e]/20' 
                    : 'bg-[#a3c90e]/15 text-[#a3c90e] border border-[#a3c90e]/20 font-bold'
                }`}>
                  {clients.length}
                </span>
              </button>
            )}

            {/* TAB OPTION 3: REQUESTS PIPELINE */}
            {(currentUser === 'admin_harold' || currentUser === 'asesor_juan' || currentUser === 'cajera_lucia') && (
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
                  <span className="text-xs font-semibold">
                    {currentUser === 'admin_harold' ? 'Autorización de Créditos' : 'Pipeline Aprobaciones'}
                  </span>
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
            )}



            {/* TAB OPTION 7: CREDIT SIMULATION */}
            {(currentUser === 'admin_harold' || currentUser === 'asesor_juan' || currentUser === 'cliente_esperanza' || currentUser.startsWith('cliente_')) && (
              <button
                id="tab-credit-simulation"
                onClick={() => setActiveTab('credit_simulation')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                  activeTab === 'credit_simulation'
                    ? 'bg-indigo-600 text-white font-bold border-indigo-400 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900 hover:bg-slate-850/85 text-slate-400 hover:text-white border-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className={`w-4 h-4 ${activeTab === 'credit_simulation' ? 'text-white' : 'text-[#a3c90e]'}`} />
                  <span className="text-xs font-semibold">Simulador de Crédito</span>
                </div>
                <span className="bg-slate-950 text-[#a3c90e] text-[9px] font-mono border border-slate-850 px-1.5 py-0.5 rounded uppercase font-bold">
                  Simulación
                </span>
              </button>
            )}

            {/* TAB OPTION: EXPEDIENTES (NUEVO MODULO) */}
            {(currentUser === 'admin_harold' || currentUser === 'asesor_juan') && (
              <button
                id="tab-dossiers"
                onClick={() => setActiveTab('dossiers')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-150 cursor-pointer border ${
                  activeTab === 'dossiers'
                    ? 'bg-indigo-600 font-bold border-indigo-450 shadow-lg text-white'
                    : 'bg-slate-900 hover:bg-slate-850/80 text-indigo-400 hover:text-white border-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={`w-4 h-4 ${activeTab === 'dossiers' ? 'text-white' : 'text-indigo-450'}`} />
                  <span className="text-xs font-bold text-slate-200">Expedientes (Préstamos)</span>
                </div>
                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-1.5 py-0.5 rounded font-mono font-black animate-pulse">
                  NUEVO
                </span>
              </button>
            )}

            {/* TAB OPTION: PORTAL CLIENTES (DEMO) */}
            {currentUser !== 'admin_harold' && (
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
                  <span className="text-xs font-bold text-slate-200">Mis pagos</span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-mono font-black">
                  CLIENTE
                </span>
              </button>
            )}

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
                  <span className="text-xs font-semibold">
                    {currentUser === 'admin_harold' ? 'Verificación de Pagos' : 'Validación de Abonos'}
                  </span>
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

            {/* PWA INSTALLATION WIDGET (DESKTOP SIDEBAR) */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl mt-4 hidden lg:block shadow-md relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#a3c90e]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src="https://cossma.com.mx/saldaappicono.png" 
                  alt="Icono Salda App" 
                  className="w-5 h-5 rounded-lg object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-mono font-bold text-[#a3c90e] uppercase tracking-wider block">
                  Instalación Rápida
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                Agrega Salda App a tu pantalla de inicio para disfrutar de accesibilidad inmediata de grado nativo.
              </p>
              <button
                onClick={handleInstallApp}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-emerald-500 via-[#a3c90e] to-indigo-650 text-slate-950 font-black tracking-tight uppercase hover:text-white rounded-xl text-[10px] transition cursor-pointer shadow-md shadow-[#a3c90e]/10 active:scale-95"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                Instalar Salda App
              </button>
            </div>
          </nav>

          {/* MAIN MODULE ZONE */}
          <main className="lg:col-span-9">

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
                    onImportClients={handleImportClients}
                    onUpdateClient={handleUpdateClient}
                    onDeleteClient={handleDeleteClient}
                    nextClientNumberBase={nextClientNumberBase}
                    onUpdateNextClientNumberBase={handleUpdateNextClientNumberBase}
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



                {activeTab === 'financial_metrics' && (
                  <div className="space-y-6">
                    <MetricCardPanel clients={clients} requests={requests} />
                    <FinancialMetricsModule 
                      clients={clients}
                      setClients={setClients}
                      onAddQueryLog={handleAddQueryLog}
                    />
                  </div>
                )}

                {activeTab === 'credit_simulation' && (
                  <CreditSimulation 
                    clients={clients}
                    currentUser={currentUser}
                  />
                )}

                {activeTab === 'client_portal' && (
                  <ClientPortal 
                    clients={clients} 
                    payments={clientPayments} 
                    onRegisterPayment={handleRegisterClientPayment} 
                    dossiers={dossiers}
                    setDossiers={setDossiers}
                    currentUser={currentUser}
                    setClients={setClients}
                    onAddRequest={handleAddRequest}
                    onAddDossier={handleAddDossier}
                  />
                )}

                {activeTab === 'payment_verification' && (
                  <PaymentVerification 
                    payments={clientPayments} 
                    onVerifyPayment={handleVerifyPayment} 
                    currentUser={currentUser}
                  />
                )}

                {activeTab === 'dossiers' && (
                  <ExpedientesModule 
                    currentUser={currentUser}
                    clients={clients}
                    dossiers={dossiers}
                    onAddDossier={handleAddDossier}
                    onUpdateDossier={handleUpdateDossier}
                    onApproveDossier={handleApproveDossier}
                    onAddSystemAlert={(alert) => {
                      const alertItem: SecurityIncident = {
                        id: 'SEC-' + Math.floor(10000 + Math.random() * 90000),
                        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
                        device: 'Consola Central Cloud',
                        user: currentUser,
                        actionBlocked: alert.actionBlocked,
                        targetClient: alert.targetClient,
                        status: 'PENDIENTE',
                        notes: alert.notes
                      };
                      setSecurityAlerts(prev => [alertItem, ...prev]);
                    }}
                  />
                )}
              </>
            )}
          </main>

        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* VENTANA EMERGENTE DE NOTIFICACIÓN EN TIEMPO REAL (POPUP MODAL) */}
      {/* --------------------------------------------------------- */}
      {activePopupAlert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="notification-popup-modal">
          <div className="bg-slate-900 border-2 border-[#a3c90e]/40 rounded-3xl p-6 max-w-sm sm:max-w-md w-full shadow-2xl relative overflow-hidden transform scale-105 transition-all duration-300">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3c90e]/10 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col items-center text-center gap-4">
              {/* Header Icon Indicator */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                activePopupAlert.type === 'success' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : activePopupAlert.type === 'warning' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {activePopupAlert.type === 'success' ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : activePopupAlert.type === 'warning' ? (
                  <AlertCircle className="w-8 h-8 animate-pulse" />
                ) : (
                  <Bell className="w-8 h-8" />
                )}
              </div>

              {/* Title & Body */}
              <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{activePopupAlert.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">{activePopupAlert.message}</p>
              
              {/* Indicator status notice */}
              <div className="mt-1 bg-slate-950/40 border border-white/5 py-1.5 px-3 rounded-xl text-[9px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a3c90e] animate-ping"></span>
                <span>Expediente digital verificado en base de datos cloud</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 w-full mt-3">
                {activePopupAlert.actionText && activePopupAlert.actionTab && (
                  <button
                    onClick={() => {
                      setActiveTab(activePopupAlert.actionTab);
                      setActivePopupAlert(null);
                    }}
                    className="flex-1 bg-[#a3c90e] hover:bg-[#b8e014] text-slate-950 font-extrabold py-2 px-3 rounded-xl transition cursor-pointer text-xs"
                  >
                    {activePopupAlert.actionText}
                  </button>
                )}
                <button
                  onClick={() => setActivePopupAlert(null)}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-semibold py-2 px-3 rounded-xl transition cursor-pointer text-xs border border-white/5"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* DESPLEGABLE DESLIZABLE (DRAWER TRAY) DE HISTORIAL DE NOTIFICACIONES */}
      {/* --------------------------------------------------------- */}
      {isNotificationTrayOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" id="notification-tray-backdrop">
          {/* Backdrop dismiss */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsNotificationTrayOpen(false)}
          />
          
          {/* Drawer Body panel */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl z-10 animate-slide-in">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#a3c90e]/10 text-[#a3c90e]">
                  <Bell className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Bitácora de Eventos</h2>
                  <p className="text-[10px] text-slate-400 font-mono">Movimientos de cartera en tiempo real</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNotificationTrayOpen(false)}
                className="p-1 px-1.5 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick config settings inside Drawer (Sound toggle & clear) */}
            <div className="p-3 bg-slate-950/20 border-b border-white/5 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={toggleSoundSettings}
                className="flex items-center gap-1.5 text-slate-350 hover:text-white transition bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 cursor-pointer"
              >
                {isSoundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span className="font-mono text-[9px]">Chimes: SÍ</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-[9px]">Chimes: NO</span>
                  </>
                )}
              </button>

              <button
                onClick={handleMarkAllNotificationsAsRead}
                className="text-[10px] sm:text-xs font-semibold text-[#a3c90e] hover:text-[#b8e014] transition bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 cursor-pointer"
              >
                Marcar todas leídas
              </button>
            </div>

            {/* Scrollable Notifications list */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-sans">
              {(() => {
                const userNotifications = systemNotifications.filter(notif => {
                  const rolesList = notif.targetRoles ? notif.targetRoles.split(',').map((r: string) => r.trim()) : [];
                  return rolesList.includes(currentUser) || 
                    (currentUser.startsWith('cliente_') && rolesList.some(r => r === 'cliente_esperanza' || r.startsWith('cliente_')));
                });

                if (userNotifications.length === 0) {
                  return (
                    <div className="text-center py-12 flex flex-col items-center justify-center gap-3 w-full">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                        <Bell className="w-6 h-6 opacity-30" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-400">Sin notificaciones nuevas</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Los movimientos se reflejarán de inmediato.</p>
                      </div>
                    </div>
                  );
                }

                return userNotifications.map((notif) => {
                  const rolesList = notif.targetRoles ? notif.targetRoles.split(',').map((r: string) => r.trim()) : [];
                  const readList = notif.readBy ? notif.readBy.split(',').map((u: string) => u.trim()) : [];
                  
                  const isTargetForUser = rolesList.includes(currentUser) || 
                    (currentUser.startsWith('cliente_') && rolesList.some(r => r === 'cliente_esperanza' || r.startsWith('cliente_')));
                  const isUnread = isTargetForUser && !readList.includes(currentUser);
                  
                  // Handle manual mark single item as read
                  const handleMarkAsRead = () => {
                    if (isUnread) {
                      setSystemNotifications(prev => prev.map(n => {
                        if (n.id === notif.id) {
                          const rList = n.readBy ? n.readBy.split(',').filter(Boolean) : [];
                          if (!rList.includes(currentUser)) rList.push(currentUser);
                          return { ...n, readBy: rList.join(',') };
                        }
                        return n;
                      }));
                    }
                  };

                  return (
                    <div
                      key={notif.id}
                      onClick={handleMarkAsRead}
                      className={`p-3 rounded-2xl border transition-all duration-250 relative group flex gap-3 cursor-pointer ${
                        isUnread 
                          ? 'bg-slate-800 border-white/20 shadow-md' 
                          : 'bg-slate-950/35 border-white/5 opacity-60 hover:opacity-100 hover:border-white/10'
                      }`}
                    >
                      {/* Active glowing green dot if unread */}
                      {isUnread && (
                        <span className="absolute top-3.5 right-3.5 h-1.5 w-1.5 rounded-full bg-[#a3c90e] animate-ping" />
                      )}

                      {/* Notif Badge indicator color icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        notif.type === 'success' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' 
                          : notif.type === 'warning' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/10' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/10'
                      }`}>
                        {notif.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 animate-bounce" />
                        ) : notif.type === 'warning' ? (
                          <AlertCircle className="w-4 h-4 animate-pulse" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white leading-tight block truncate pr-3">{notif.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-350 leading-relaxed mt-1 font-sans break-words">{notif.message}</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-[8px] font-mono text-slate-400">
                          <span>{notif.id}</span>
                          <span>•</span>
                          <span>{new Date(notif.timestamp).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Bottom active roles guide lines */}
            <div className="p-4 bg-slate-950/40 border-t border-white/10 text-[9px] font-mono text-slate-300 flex flex-col gap-1">
              <span>Filtro de Seguridad: <strong className="text-[#a3c90e] font-bold">Activo</strong></span>
              <span>Visualizando alertas para: <strong className="text-white font-semibold">{currentUser === 'admin_harold' ? 'Harold Salazar (Super Admin)' : currentUser === 'asesor_juan' ? 'Juan Orozco (Asesor VIP)' : currentUser === 'cajera_lucia' ? 'Lucía Lara (Cajera Express)' : 'Portal del Cliente'}</strong></span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
