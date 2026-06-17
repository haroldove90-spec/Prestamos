import React, { useState, useRef, useEffect } from 'react';
import { 
  DollarSign, Camera, Upload, CheckCircle2, AlertCircle, 
  ArrowRight, Smartphone, RefreshCw, User, Calendar, 
  ChevronDown, FileImage, Check, FileCheck2, X, Image as ImageIcon,
  Sparkles, CreditCard, Clock, FileText, CheckCircle, ShieldCheck, Zap,
  PlusCircle, Printer, Lock
} from 'lucide-react';
import { Client, ClientPayment, ClientDossier, CreditRequest, PRESTAMOS_FIJOS, ClientContract } from '../types';

interface ClientPortalProps {
  clients: Client[];
  contracts: ClientContract[];
  onRegisterPayment: (payment: ClientPayment) => void;
  activeClientPayment?: ClientPayment | null;
  dossiers?: ClientDossier[];
  setDossiers?: React.Dispatch<React.SetStateAction<ClientDossier[]>>;
  currentUser?: string;
  setClients?: React.Dispatch<React.SetStateAction<Client[]>>;
  onAddRequest?: (request: Omit<CreditRequest, 'id' | 'dateSubmitted' | 'status'>) => void;
  onAddDossier?: (dossier: ClientDossier) => void;
}

// Pre-designed mockup receipt URLs for testing payments
const MOCK_RECEIPT_TEMPLATES = [
  {
    name: '💰 SPEI Electrónico (BBVA/Banxico)',
    color: 'from-blue-600 to-indigo-700',
    img: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400&auto=format&fit=crop&q=80',
    refPrefix: 'SPEI-BBVA'
  },
  {
    name: '🏪 Ticket Depósito OXXO Pay',
    color: 'from-amber-600 to-red-700',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=80',
    refPrefix: 'OXXO-SAFE'
  },
  {
    name: '🏦 Ventanilla Bancaria (Santander)',
    color: 'from-red-650 to-red-800',
    img: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=400&auto=format&fit=crop&q=80',
    refPrefix: 'VENT-SANT'
  }
];

export const ClientPortal: React.FC<ClientPortalProps> = ({ 
  clients, 
  contracts,
  onRegisterPayment,
  dossiers,
  setDossiers,
  currentUser = 'cliente_esperanza',
  setClients,
  onAddRequest,
  onAddDossier
}) => {
  const isCustomUser = currentUser.startsWith('cliente_') && currentUser !== 'cliente_esperanza';
  const customTargetUsername = currentUser.replace('cliente_', '').toLowerCase().trim();

  // Active client selection state (defaults to matched profile or Esperanza)
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (isCustomUser) {
      const match = clients.find(c => 
        (c.username && c.username.toLowerCase() === customTargetUsername) ||
        (c.id.toLowerCase() === customTargetUsername) ||
        (c.name.toLowerCase().replace(/[^a-z0-9]/g, '_') === customTargetUsername) ||
        (c.name.toLowerCase() === customTargetUsername.replace(/_/g, ' '))
      );
      if (match) return match.id;
    }
    const hasEsperanza = clients.some(c => c.id === 'PM-327072');
    if (hasEsperanza) return 'PM-327072';
    return clients[0]?.id || '';
  });

  // Force sync selection if currentUser changes
  useEffect(() => {
    if (isCustomUser) {
      const match = clients.find(c => 
        (c.username && c.username.toLowerCase() === customTargetUsername) ||
        (c.id.toLowerCase() === customTargetUsername) ||
        (c.name.toLowerCase().replace(/[^a-z0-9]/g, '_') === customTargetUsername) ||
        (c.name.toLowerCase() === customTargetUsername.replace(/_/g, ' '))
      );
      if (match) setSelectedClientId(match.id);
    } else if (currentUser === 'cliente_esperanza') {
      const match = clients.find(c => c.id === 'PM-327072');
      if (match) setSelectedClientId(match.id);
    }
  }, [currentUser, clients]);
  
  const activeClient = clients.find(c => c.id === selectedClientId);

  // Tabs layout
  const [portalTab, setPortalTab] = useState<'my_loan' | 'my_payments' | 'request_loan' | 'profile' | 'contract'>('my_loan');

  // Form states inside "Mis pagos"
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [reference, setReference] = useState<string>('');

  // Sincronización temporal del Perfil del Cliente
  const [tempName, setTempName] = useState('');
  const [tempRfc, setTempRfc] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempBirthDate, setTempBirthDate] = useState('');
  const [tempAddress, setTempAddress] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [tempProfileImage, setTempProfileImage] = useState('');
  const [tempIneFront, setTempIneFront] = useState('');
  const [tempIneBack, setTempIneBack] = useState('');
  const [tempProofOfAddress, setTempProofOfAddress] = useState('');
  const [tempFacebookProfile, setTempFacebookProfile] = useState('');
  const [tempLocationLink, setTempLocationLink] = useState('');

  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Selector / Modal de zoom de identificación
  const [zoomedImg, setZoomedImg] = useState<{ src: string, title: string } | null>(null);

  const myDossier = (dossiers || []).find(d => {
    if (isCustomUser && activeClient) {
      return d.clientName.toLowerCase() === activeClient.name.toLowerCase();
    }
    return d.clientName.toLowerCase() === activeClient?.name.toLowerCase();
  });

  useEffect(() => {
    if (activeClient && portalTab === 'profile') {
      setTempName(activeClient.name || '');
      setTempRfc(activeClient.rfc || '');
      setTempPhone(activeClient.phone || '');
      setTempEmail(activeClient.email || '');
      setTempPassword(activeClient.password || '');
      setTempProfileImage(activeClient.profileImage || '');
      setTempFacebookProfile(activeClient.facebookProfile || myDossier?.facebookProfile || '');
      setTempLocationLink(activeClient.locationLink || myDossier?.locationLink || '');

      setProfileSuccessMsg(null);
      setProfileErrorMsg(null);

      if (myDossier) {
        setTempBirthDate(myDossier.birthDate || '');
        setTempAddress(myDossier.address || '');
        setTempIneFront(myDossier.ineFront || '');
        setTempIneBack(myDossier.ineBack || '');
        setTempProofOfAddress(myDossier.proofOfAddress || '');
      } else {
        setTempBirthDate('');
        setTempAddress('');
        setTempIneFront('');
        setTempIneBack('');
        setTempProofOfAddress('');
      }
    }
  }, [selectedClientId, portalTab, dossiers, activeClient]);
  
  // Camera & Image states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);

  // Success flow states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [justSubmittedId, setJustSubmittedId] = useState<string | null>(null);

  // Camera references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // States inside "Solicitar otro préstamo"
  const [reqLoanType, setReqLoanType] = useState<'12 semanas' | 'Préstamo Fijo'>('12 semanas');
  const [reqMonthlyPlan, setReqMonthlyPlan] = useState<string>('3000_4200');
  const [reqWeeklyPlan, setReqWeeklyPlan] = useState<string>('3000_3900');
  const [reqCustomAmount, setReqCustomAmount] = useState<number>(10000);
  const [reqPurpose, setReqPurpose] = useState<string>('');
  const [reqNotes, setReqNotes] = useState<string>('');
  
  // Credit Request submitted feedback
  const [reqSuccessMsg, setReqSuccessMsg] = useState<string | null>(null);
  const [reqSuccessDetails, setReqSuccessDetails] = useState<string | null>(null);

  // Sync "Mis pagos" defaults when selection changes
  useEffect(() => {
    if (activeClient) {
      setAmount(Math.min(activeClient.balanceOwed, 25000).toString());
      setReference(activeClient.id);
      setCapturedImage(null);
      setUploadedFileName(null);
      setSelectedTemplateIndex(null);
      setJustSubmittedId(null);
    }
  }, [selectedClientId, activeClient]);

  // Demo / Test Profile Loader ("Datos de Prueba")
  const loadTestDataProfile = (profile: {
    id: string;
    name: string;
    username: string;
    totalCreditGranted: number;
    balanceOwed: number;
    delinquencyDays: number;
    membership: 'Ninguna' | 'Básica' | 'Premium';
  }) => {
    if (!setClients) {
      alert('Error de depuración: setClients no está enlazado.');
      return;
    }
    
    setClients(prev => {
      const exists = prev.find(c => c.id === profile.id);
      if (exists) {
        return prev.map(c => c.id === profile.id ? {
          ...c,
          balanceOwed: profile.balanceOwed,
          delinquencyDays: profile.delinquencyDays,
          totalCreditGranted: profile.totalCreditGranted,
          membership: profile.membership
        } : c);
      } else {
        const newClient: Client = {
          id: profile.id,
          name: profile.name,
          username: profile.username,
          rfc: 'XAXX010101050',
          email: `${profile.username}@saldaapp.com`,
          phone: '811' + Math.floor(1000000 + Math.random() * 9000000),
          creditScore: profile.delinquencyDays > 15 ? 420 : profile.delinquencyDays > 0 ? 590 : 720,
          bureauStatus: profile.delinquencyDays > 15 ? 'ALERTA' : profile.delinquencyDays > 0 ? 'REGULAR' : 'EXCELENTE',
          totalCreditGranted: profile.totalCreditGranted,
          balanceOwed: profile.balanceOwed,
          delinquencyDays: profile.delinquencyDays,
          category: 'Personal',
          joinDate: new Date().toISOString().split('T')[0],
          membership: profile.membership
        };
        return [newClient, ...prev];
      }
    });

    setSelectedClientId(profile.id);
    setPortalTab('my_loan');
    setJustSubmittedId(null);
    setReqSuccessMsg(null);
  };

  // Launch camera for real-time capture simulation in iframe
  const startCamera = async () => {
    setIsCameraActive(true);
    setCapturedImage(null);
    setSelectedTemplateIndex(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('No se pudo acceder a la cámara:', err);
    }
  };

  // Capture photo from video feed
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#a3c90e';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('SALDA APP - COMPROBANTE DIGITAL', 20, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText(`FECHA: ${new Date().toLocaleString()}`, 20, 60);
        ctx.fillText(`CLIENTE ID: ${selectedClientId}`, 20, 80);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Turn off camera feed
  const stopCamera = () => {
    setIsCameraActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle uploaded files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setSelectedTemplateIndex(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // BBVA, OXXO, Santander test templates direct simulation loading
  const selectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    setUploadedFileName(null);
    stopCamera();
    
    const tmpl = MOCK_RECEIPT_TEMPLATES[index];
    setReference(`${tmpl.refPrefix}-${Math.floor(100000 + Math.random() * 900000)}`);
    setCapturedImage(tmpl.img);
  };

  // Submit payment handler
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !amount) return;

    const paymentVal = parseFloat(amount);
    if (isNaN(paymentVal) || paymentVal <= 0) {
      alert('Por favor introduce un monto de pago válido.');
      return;
    }

    if (!capturedImage) {
      alert('Es obligatorio adjuntar una evidencia fotográfica o comprobante para validar el abono.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const paymentId = `PAG-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPayment: ClientPayment = {
        id: paymentId,
        clientId: activeClient.id,
        clientName: activeClient.name,
        amount: paymentVal,
        date: new Date().toISOString().slice(0, 10),
        evidenceImage: capturedImage,
        status: 'PENDIENTE',
        notes: notes || 'Abono registrado por el portal de cliente',
        reference: reference
      };

      onRegisterPayment(newPayment);
      setJustSubmittedId(paymentId);
      setIsSubmitting(false);
      setNotes('');
    }, 1200);
  };

  // Submit NEW/ANOTHER Loan request handler
  const handleSubmitLoanRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    if (reqLoanType !== 'Préstamo Fijo' && (reqCustomAmount < 1000 || reqCustomAmount > 50000)) {
      alert('La cantidad solicitada debe ser de un mínimo de $1,000 MXN hasta un máximo de $50,000 MXN.');
      return;
    }

    const finalAmount = reqCustomAmount;
    let reqFee = 0;
    if (reqLoanType === 'Préstamo Fijo') {
      const match = PRESTAMOS_FIJOS.find(p => p.capital === finalAmount);
      reqFee = match ? match.interest : 1200;
    } else {
      reqFee = Math.round((finalAmount / 1000) * 135 * 12);
    }
    const reqTotalPayable = finalAmount + reqFee;
    let descPlan = '';

    if (reqLoanType === 'Préstamo Fijo') {
      descPlan = `Préstamo Fijo de $${finalAmount.toLocaleString('es-MX')} MXN para pagar $${reqTotalPayable.toLocaleString('es-MX')} MXN (Interés: $${reqFee.toLocaleString('es-MX')} MXN en 4 semanas)`;
    } else {
      const abonoSemanal = Math.round(reqTotalPayable / 12);
      descPlan = `Plan Semanal a 12 Semanas con 12 pagos de $${abonoSemanal.toLocaleString('es-MX')} MXN (Total: $${reqTotalPayable.toLocaleString('es-MX')} MXN, Capital: $${finalAmount.toLocaleString('es-MX')} MXN + Costo: $${reqFee.toLocaleString('es-MX')} MXN por 12 semanas)`;
    }

    // Call state handlers
    if (onAddRequest) {
      onAddRequest({
        clientName: activeClient.name,
        requestedAmount: finalAmount,
        purpose: reqPurpose || 'Solicitud de línea de crédito adicional',
        score: activeClient.creditScore,
        category: 'Personal',
        loanType: reqLoanType,
        monthlyPlan: descPlan
      });
    }

    if (onAddDossier) {
      const dossierId = 'EXP-' + Math.floor(1000 + Math.random() * 9000);
      onAddDossier({
        id: dossierId,
        clientName: activeClient.name,
        address: 'Domicilio registrado de ' + activeClient.name,
        birthDate: '1990-01-01',
        ineFront: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&auto=format&fit=crop&q=80',
        ineBack: 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=800&auto=format&fit=crop&q=80',
        proofOfAddress: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80',
        requestedAmount: finalAmount,
        status: 'ANALIZANDO',
        createdAt: new Date().toISOString().split('T')[0],
        notificationDismissed: false,
        loanType: reqLoanType,
        monthlyPlan: descPlan
      });
    }

    setReqSuccessMsg('¡Solicitud de Préstamo Enviada Correctamente!');
    setReqSuccessDetails(`Tu solicitud de nuevo crédito por capital neto de $${finalAmount.toLocaleString('es-MX')} MXN (${reqLoanType === 'Préstamo Fijo' ? 'Fijo/Mensual' : '12 Semanas'}) ha sido ingresada al Pipeline de Aprobaciones. El monto total a pagar estimado es de $${reqTotalPayable.toLocaleString('es-MX')} MXN.`);
    
    // Clear inputs
    setReqPurpose('');
    setReqNotes('');
  };

  const handleProfileFileChange = (
    field: 'profileImage' | 'ineFront' | 'ineBack' | 'proofOfAddress',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (field === 'profileImage') {
        setTempProfileImage(base64String);
      } else if (field === 'ineFront') {
        setTempIneFront(base64String);
      } else if (field === 'ineBack') {
        setTempIneBack(base64String);
      } else if (field === 'proofOfAddress') {
        setTempProofOfAddress(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = (field: 'profileImage' | 'ineFront' | 'ineBack' | 'proofOfAddress') => {
    if (field === 'profileImage') {
      setTempProfileImage('');
    } else if (field === 'ineFront') {
      setTempIneFront('');
    } else if (field === 'ineBack') {
      setTempIneBack('');
    } else if (field === 'proofOfAddress') {
      setTempProofOfAddress('');
    }
  };

  const handleSaveProfileChanges = () => {
    if (!activeClient) return;

    if (!tempName.trim()) {
      setProfileErrorMsg('El nombre completo no puede estar vacío.');
      return;
    }

    // Update clients array
    if (setClients) {
      setClients(prev => prev.map(c => {
        if (c.id === activeClient.id) {
          return {
            ...c,
            name: tempName.trim(),
            rfc: tempRfc.trim().toUpperCase(),
            phone: tempPhone.trim(),
            email: tempEmail.trim(),
            password: tempPassword,
            profileImage: tempProfileImage
          };
        }
        return c;
      }));
    }

    // Update dossiers array
    if (setDossiers) {
      setDossiers(prev => {
        const existingDossierIndex = prev.findIndex(d => {
          return d.clientName.toLowerCase() === activeClient.name.toLowerCase() || 
                 d.clientName.toLowerCase() === tempName.trim().toLowerCase();
        });

        if (existingDossierIndex !== -1) {
          return prev.map((d, idx) => {
            if (idx === existingDossierIndex) {
              return {
                ...d,
                clientName: tempName.trim(),
                address: tempAddress.trim(),
                birthDate: tempBirthDate,
                ineFront: tempIneFront,
                ineBack: tempIneBack,
                proofOfAddress: tempProofOfAddress
              };
            }
            return d;
          });
        } else {
          const newDossier: ClientDossier = {
            id: `DOS-${Math.floor(100000 + Math.random() * 900000)}`,
            clientName: tempName.trim(),
            address: tempAddress.trim(),
            birthDate: tempBirthDate || new Date().toISOString().split('T')[0],
            ineFront: tempIneFront || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&auto=format&fit=crop&q=80',
            ineBack: tempIneBack || 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=800&auto=format&fit=crop&q=80',
            proofOfAddress: tempProofOfAddress || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80',
            requestedAmount: 0,
            status: 'ANALIZANDO',
            createdAt: new Date().toISOString().split('T')[0],
            notificationDismissed: false
          };
          return [...prev, newDossier];
        }
      });
    }

    setProfileSuccessMsg('¡Configuraciones y documentos respaldados exitosamente!');
    setProfileErrorMsg(null);

    // Auto clear feedback after 4 seconds
    setTimeout(() => {
      setProfileSuccessMsg(null);
    }, 4000);
  };

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Visual Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#a3c90e]/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-black text-[#a3c90e] uppercase tracking-widest block">Portal de Autoservicio</span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1" id="client-greeting-title">
              <Smartphone className="w-5 h-5 text-[#a3c90e]" />
              Hola, {activeClient?.name || 'Cliente'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Bienvenido a tu panel personal de autoservicio. Consulta tu préstamo activo, gestiona el estatus de tus pagos o solicita financiamiento complementario al instante.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-2xl px-4 py-2 flex flex-col items-start gap-1 shrink-0">
            <span className="text-[9px] font-mono text-slate-400 uppercase">Clave Única (ID):</span>
            <span className="text-xs font-black text-white">{activeClient?.id || 'NO REGISTRADO'}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          TEST DATA PANEL ("Datos de Prueba" simulator block)
          ------------------------------------------------------------- */}
      {setClients && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-left relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#a3c90e]/5 rounded-full blur-xl" />
          
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4.5 h-4.5 text-[#acd113] anim-pulse" />
            <span className="text-xs font-black uppercase text-white font-mono tracking-wider">
              Datos de Prueba (Simulación de Estados del Cliente)
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mb-4 leading-normal">
            Haz clic en cualquiera de estos perfiles de prueba para cambiar instantáneamente el saldo, historial de pagos y período de morosidad actuales para experimentar el comportamiento interactivo del portal:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* PROFILE 1 */}
            <button
              onClick={() => {
                loadTestDataProfile({
                  id: 'PM-327072',
                  name: 'Esperanza Escobedo',
                  username: 'esperanza',
                  totalCreditGranted: 15000,
                  balanceOwed: 8500,
                  delinquencyDays: 0,
                  membership: 'Básica'
                });
              }}
              className="p-3 rounded-xl border border-emerald-500/10 hover:border-emerald-500 bg-slate-950/70 hover:bg-slate-950 text-left transition duration-150 transform hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col gap-1 inline-block"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-black text-white truncate">E. Escobedo</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Al corriente ($8,500)</span>
            </button>

            {/* PROFILE 2 */}
            <button
              onClick={() => {
                loadTestDataProfile({
                  id: 'PM-921443',
                  name: 'Gregorio Marín',
                  username: 'gregorio',
                  totalCreditGranted: 20000,
                  balanceOwed: 14200,
                  delinquencyDays: 32,
                  membership: 'Ninguna'
                });
              }}
              className="p-3 rounded-xl border border-red-500/15 hover:border-red-500 bg-slate-950/70 hover:bg-slate-950 text-left transition duration-150 transform hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col gap-1 inline-block"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-xs font-black text-white truncate">Gregorio Marín</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Atraso Crítico (32 días)</span>
            </button>

            {/* PROFILE 3 */}
            <button
              onClick={() => {
                loadTestDataProfile({
                  id: 'PM-881255',
                  name: 'Sofía Castruita',
                  username: 'sofia',
                  totalCreditGranted: 10000,
                  balanceOwed: 4500,
                  delinquencyDays: 8,
                  membership: 'Premium'
                });
              }}
              className="p-3 rounded-xl border border-amber-500/15 hover:border-amber-500 bg-slate-950/70 hover:bg-slate-950 text-left transition duration-150 transform hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col gap-1 inline-block"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs font-black text-white truncate">S. Castruita</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Atraso Leve (8 días)</span>
            </button>

            {/* PROFILE 4 */}
            <button
              onClick={() => {
                loadTestDataProfile({
                  id: 'PM-112233',
                  name: 'Marta Gómez Lozano',
                  username: 'marta_l',
                  totalCreditGranted: 12000,
                  balanceOwed: 0,
                  delinquencyDays: 0,
                  membership: 'Premium'
                });
              }}
              className="p-3 rounded-xl border border-blue-500/15 hover:border-blue-500 bg-slate-950/70 hover:bg-slate-950 text-left transition duration-150 transform hover:scale-[1.02] active:scale-95 cursor-pointer flex flex-col gap-1 inline-block"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs font-black text-white truncate">Marta Gómez</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Préstamo Liquidado ($0)</span>
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN DE EXPEDIENTE ACTIVO */}
      {dossiers && dossiers.length > 0 && (() => {
        const myDossier = dossiers.find(d => {
          if (currentUser === 'cliente_esperanza') {
            return d.clientName.toLowerCase().includes('esperanza');
          }
          if (isCustomUser && activeClient) {
            return d.clientName.toLowerCase() === activeClient.name.toLowerCase();
          }
          return d.clientName.toLowerCase() === activeClient?.name.toLowerCase();
        }) || dossiers.find(d => d.clientName.toLowerCase() === activeClient?.name.toLowerCase());
        
        if (!myDossier) return null;
        return (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-left ${
            myDossier.status === 'ANALIZANDO' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
            myDossier.status === 'APROBADO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
            'bg-red-500/10 border-red-500/20 text-red-300'
          }`}>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-950 rounded-xl shrink-0 border border-slate-800">
                {myDossier.status === 'ANALIZANDO' ? (
                  <span className="flex h-5 w-5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <RefreshCw className="w-5 h-5 text-amber-400 animate-spin relative inline-flex" />
                  </span>
                ) : myDossier.status === 'APROBADO' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-black uppercase tracking-widest block text-[#a3c90e]">SISTEMA DE EXPEDIENTES DIGITALES</span>
                <h4 className="text-xs font-black text-white">
                  Expediente {myDossier.id}: Estatus <strong className={myDossier.status === 'ANALIZANDO' ? 'text-amber-400' : myDossier.status === 'APROBADO' ? 'text-emerald-400' : 'text-red-400'}>{myDossier.status}</strong>
                </h4>
                <p className="text-[11px] text-slate-300 font-sans leading-normal">
                  {myDossier.status === 'ANALIZANDO' && `Tu solicitud por $${myDossier.requestedAmount.toLocaleString()} de tipo "${myDossier.loanType || 'Semanales'}" está bajo estudio técnico-documental por nuestra mesa de control.`}
                  {myDossier.status === 'APROBADO' && `¡Aprobado! Tu crédito (${formatMXN(myDossier.requestedAmount)}) fue liquidado positivamente y cargado a tu saldo disponible.`}
                  {myDossier.status === 'RECHAZADO' && `Tu solicitud contractual de expediente fue rechazada: "${myDossier.adminNotes || 'Sube estados legibles de cuenta'}"`}
                </p>
              </div>
            </div>
            
            <div className="text-[9px] font-mono text-slate-400 bg-slate-950/70 border border-slate-850 px-3 py-1.5 rounded-xl uppercase tracking-wider">
              {myDossier.createdAt}
            </div>
          </div>
        );
      })()}

      {/* FOUR INTERACTIVE PORTAL VIEWS TABS */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => {
            setPortalTab('my_loan');
            setReqSuccessMsg(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer ${
            portalTab === 'my_loan' 
              ? 'border-[#a3c90e] bg-[#a3c90e]/5 text-[#a3c90e]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Mi Préstamo
        </button>

        <button
          onClick={() => {
            setPortalTab('my_payments');
            setJustSubmittedId(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer ${
            portalTab === 'my_payments' 
              ? 'border-[#a3c90e] bg-[#a3c90e]/5 text-[#a3c90e]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Mis pagos (Abonos)
        </button>

        <button
          onClick={() => {
            setPortalTab('request_loan');
            setReqSuccessMsg(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition duration-200 cursor-pointer ${
            portalTab === 'request_loan' 
              ? 'border-[#acd113] bg-[#a3c90e]/5 text-[#a3c90e]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          Solicitar otro préstamo
        </button>

        <button
          onClick={() => {
            setPortalTab('profile');
            setReqSuccessMsg(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition duration-250 cursor-pointer ${
            portalTab === 'profile' 
              ? 'border-[#a3c90e] bg-[#a3c90e]/5 text-[#a3c90e]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Mi Perfil
        </button>

        <button
          onClick={() => {
            setPortalTab('contract');
            setReqSuccessMsg(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition duration-250 cursor-pointer ${
            portalTab === 'contract' 
              ? 'border-[#a3c90e] bg-[#a3c90e]/5 text-[#a3c90e]' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-[#a3c90e]" />
          Contrato
        </button>
      </div>

      {/* Grid view containing selected subview as main, and side status panel info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Left Side Col (8 spans): Dynamic Subview */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. VIEW "MI PRÉSTAMO" CONTAINER */}
          {portalTab === 'my_loan' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#a3c90e]" />
                  Resumen Analítico del Préstamo Activo
                </h3>
                {activeClient && (
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    activeClient.balanceOwed === 0 ? 'bg-blue-500/10 text-blue-400' :
                    activeClient.delinquencyDays > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                  }`}>
                    {activeClient.balanceOwed === 0 ? 'Liquidado' :
                     activeClient.delinquencyDays > 0 ? `Atrasado • ${activeClient.delinquencyDays} días` :
                     'Al Corriente (Vigente)'}
                  </span>
                )}
              </div>

              {activeClient ? (
                <div className="space-y-6">
                  {/* Big figures blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Capital Granted Box */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5 shadow-inner">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Capital Otorgado
                      </span>
                      <span className="text-base font-extrabold text-white">
                        {formatMXN(activeClient.totalCreditGranted)}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">Plan Inicial Comercial</span>
                    </div>

                    {/* Pending balance Box */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5 shadow-inner">
                      <span className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Saldo Pendiente Oxxo/SPEI
                      </span>
                      <span className="text-xl font-black text-amber-400">
                        {formatMXN(activeClient.balanceOwed)}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">Capital + Intereses pendientes</span>
                    </div>

                    {/* Delinquency Status */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5 shadow-inner">
                      <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Período de Gracia / Atraso
                      </span>
                      <span className={`text-base font-black ${activeClient.delinquencyDays > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {activeClient.delinquencyDays > 0 ? `${activeClient.delinquencyDays} Días Hábiles` : 'Abono al Día'}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">Días transcurridos después del límite</span>
                    </div>
                  </div>

                  {/* Payment Calendar Simulation */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">Cronograma Estimado de Amortización</h4>
                    
                    <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-850 text-slate-300">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-850 font-mono text-slate-400 uppercase text-[9px] tracking-wider">
                            <th className="px-3 py-2.5">Abono</th>
                            <th className="px-3 py-2.5">Fecha programada</th>
                            <th className="px-3 py-2.5">Monto sugerido</th>
                            <th className="px-3 py-2.5">Estatus administrativo</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-slate-900">
                            <td className="px-3 py-2.5 font-mono">Semana 1</td>
                            <td className="px-3 py-2.5">Hace 14 días</td>
                            <td className="px-3 py-2.5">{formatMXN(activeClient.totalCreditGranted * 0.12)}</td>
                            <td className="px-3 py-2.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-450 text-emerald-400">PAGADO (VERIFICADO)</span>
                            </td>
                          </tr>
                          <tr className="border-b border-slate-900">
                            <td className="px-3 py-2.5 font-mono">Semana 2</td>
                            <td className="px-3 py-2.5">Hace 7 días</td>
                            <td className="px-3 py-2.5">{formatMXN(activeClient.totalCreditGranted * 0.12)}</td>
                            <td className="px-3 py-2.5">
                              {activeClient.delinquencyDays > 30 ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400">CON RESTRICCIÓN</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-450 text-emerald-400">PAGADO (PROCESADO)</span>
                              )}
                            </td>
                          </tr>
                          <tr className="border-b border-slate-900">
                            <td className="px-3 py-2.5 font-mono">Semana 3</td>
                            <td className="px-3 py-2.5">Hoy (Límite semanal)</td>
                            <td className="px-3 py-2.5">{formatMXN(activeClient.totalCreditGranted * 0.12)}</td>
                            <td className="px-3 py-2.5">
                              {activeClient.balanceOwed === 0 ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400">LIQUIDADO</span>
                              ) : activeClient.delinquencyDays > 0 ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/10 text-red-400">VENCIDO / ATRASADO</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-505 bg-amber-500/10 text-amber-500">PENDIENTE</span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {activeClient.balanceOwed > 0 && (
                    <div className="bg-[#a3c90e]/5 border border-[#a3c90e]/20 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-black text-white">¿Tienes abonos por reportar hoy?</h5>
                        <p className="text-[10px] text-slate-300">Carga tu ticket o recibo en la sección de pagos para conciliar tu saldo en tiempo real.</p>
                      </div>
                      <button
                        onClick={() => {
                          setPortalTab('my_payments');
                          setAmount(Math.min(activeClient.balanceOwed, 5000).toString());
                        }}
                        className="bg-[#a3c90e] hover:bg-[#acd113] text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow transition"
                      >
                        Abonar saldo <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Selecciona una cuenta de cliente activa para visualizar la amortización.
                </div>
              )}
            </div>
          )}

          {/* 2. VIEW "MIS PAGOS" CONTAINER */}
          {portalTab === 'my_payments' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              {justSubmittedId ? (
                /* Success screen on reporting a payment */
                <div className="text-center py-6 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-md font-bold text-white">¡Abono reportado con éxito!</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Tu abono por la cantidad de <strong className="text-emerald-400">{formatMXN(parseFloat(amount))} MXN</strong> bajo el folio <span className="font-mono text-white text-[11px] font-bold bg-slate-950 px-1.5 py-0.5 rounded">{justSubmittedId}</span> ha sido registrado en estatus <span className="text-amber-400 font-bold">PENDIENTE</span>.
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Personal de mesa de control verificará la legibilidad de la imagen y la vigencia de la clave {reference}. Tu saldo pendiente se actualizará una vez aprobado.
                  </p>
                  <button
                    onClick={() => setJustSubmittedId(null)}
                    className="bg-slate-800 text-slate-300 hover:text-white font-mono text-[10px] uppercase font-bold px-4 py-2 rounded-xl border border-slate-700 cursor-pointer"
                  >
                    ← Reportar otro pago
                  </button>
                </div>
              ) : (
                /* The standard voucher reporter form */
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#a3c90e]" />
                      Reportar nuevo abono
                    </h3>
                    <p className="text-[10.5px] text-slate-400 mt-1">
                      Indica la cantidad, asocia la clave del contrato y adjunta la imagen/foto del ticket físico o digital.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Monto del abono reportado ($ MXN) *:</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-[#a3c90e] font-sans font-bold text-sm">$</span>
                        <input
                          type="number"
                          required
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Referencia del contrato / Clave de cliente *:</label>
                      <input
                        type="text"
                        required
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Ej. PM-327072"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:ring-1 focus:ring-[#a3c90e] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Notas aclaratorias para el administrador:</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej. Transferencia electrónica realizada por Bancomer Móvil, favor de validar."
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                    />
                  </div>

                  {/* Evidence Upload and templates */}
                  <div className="bg-[#0b1c24]/30 border border-slate-850 rounded-xl p-4 space-y-3">
                    <span className="text-[9.5px] font-mono font-bold text-[#a3c90e] uppercase tracking-wider block">Adjuntar Evidencia Fotográfica / Ticket Digital:</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Interactive action launcher list */}
                      <div className="space-y-2">
                        <span className="block text-[9px] text-slate-400 font-mono">Demos / Comprobantes pre-diseñados de simulación:</span>
                        <div className="flex flex-col gap-1.5">
                          {MOCK_RECEIPT_TEMPLATES.map((tmpl, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectTemplate(index)}
                              className={`p-2 rounded-xl text-left border flex items-center justify-between text-[11px] font-bold cursor-pointer transition ${
                                selectedTemplateIndex === index 
                                  ? 'border-[#a3c90e] bg-[#a3c90e]/10 text-[#a3c90e]' 
                                  : 'border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-300'
                              }`}
                            >
                              <span>{tmpl.name}</span>
                              {selectedTemplateIndex === index && <Check className="w-3.5 h-3.5 text-[#a3c90e]" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: Camera video viewport or static photo frame rendering */}
                      <div className="bg-slate-950 rounded-xl border border-slate-850 relative min-h-[110px] flex items-center justify-center overflow-hidden">
                        {isCameraActive ? (
                          /* Camera feed */
                          <div className="relative w-full h-28">
                            <video 
                              ref={videoRef} 
                              className="w-full h-full object-cover"
                              playsInline 
                              muted 
                            />
                            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded text-[9px] uppercase hover:scale-105 active:scale-95 transition cursor-pointer"
                              >
                                Tomar foto
                              </button>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-3 py-1 rounded text-[9px] uppercase hover:bg-red-500/20 transition cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : capturedImage ? (
                          /* Preview */
                          <div className="relative w-full h-full group">
                            <img 
                              src={capturedImage} 
                              alt="Evidence Preview" 
                              className="w-full h-28 object-cover rounded-lg border border-slate-850" 
                            />
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setCapturedImage(null);
                                  setUploadedFileName(null);
                                  setSelectedTemplateIndex(null);
                                }}
                                className="bg-red-500 text-white rounded-lg p-2 text-xs font-semibold flex items-center gap-1 hover:bg-red-450 active:scale-95 transition cursor-pointer border-none"
                              >
                                <X className="w-3.5 h-3.5" />
                                Eliminar
                              </button>
                            </div>
                            {uploadedFileName && (
                              <div className="absolute bottom-1 left-1 right-1 bg-slate-950/90 border border-slate-850 rounded px-1.5 py-0.5 text-[8px] font-mono text-slate-300 truncate">
                                Archivo: {uploadedFileName}
                              </div>
                            )}
                            {selectedTemplateIndex !== null && (
                              <div className="absolute bottom-1 left-1 right-1 bg-[#0a3a46]/90 border border-[#a3c90e]/30 rounded px-1.5 py-0.5 text-[8px] font-mono text-[#a3c90e] truncate">
                                Demo: {MOCK_RECEIPT_TEMPLATES[selectedTemplateIndex].name}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Unselected standard actions block */
                          <div className="text-center p-3 space-y-2">
                            <ImageIcon className="w-7 h-7 text-slate-600 block mx-auto shrink-0" />
                            <div className="flex flex-wrap gap-1.5 justify-center">
                              <button
                                type="button"
                                onClick={startCamera}
                                className="bg-[#a3c90e] hover:bg-[#acd113] text-slate-950 text-[9px] font-bold px-2 py-1.5 rounded flex items-center gap-1 shadow transition cursor-pointer active:scale-95 border-none"
                              >
                                <Camera className="w-3 h-3" />
                                Cámara Web
                              </button>

                              <label className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-[9px] font-bold px-2 py-1.5 rounded flex items-center gap-1 cursor-pointer transition active:scale-95">
                                <Upload className="w-3 h-3 text-slate-400" />
                                Subir Archivo
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Form action launcher */}
                  <div className="border-t border-slate-850 pt-4 flex justify-between items-center flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                      <span>La evidencia fotográfica se asocia de forma irrevocable.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !amount}
                      className="bg-[#a3c90e] text-slate-950 hover:bg-[#acd113] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow ml-auto border-none"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Registrando abono...
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="w-3.5 h-3.5" />
                          Enviar Registro de Pago
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. VIEW "SOLICITAR OTRO PRÉSTAMO" CONTAINER */}
          {portalTab === 'request_loan' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              {reqSuccessMsg ? (
                /* Success feedback screen for loan request submission */
                <div className="text-center py-6 space-y-4 animate-fade-in text-slate-300">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto shrink-0">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-md font-bold text-white">{reqSuccessMsg}</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      {reqSuccessDetails}
                    </p>
                  </div>
                  <div className="px-5 py-3 bg-slate-950 border border-slate-850 rounded-xl inline-block text-[11px] font-mono">
                    <span className="text-slate-450 text-slate-400 text-[10px]">TIPO DE PRÉSTAMO:</span>{' '}
                    <strong className="text-white">{reqLoanType === '1 mes' ? 'Mensual (Plan Imagen)' : 'Plan Semanal a 12 Semanas'}</strong>
                  </div>
                  <div>
                    <button
                      onClick={() => setReqSuccessMsg(null)}
                      className="bg-slate-800 text-slate-300 hover:text-white font-mono text-[10px] uppercase font-bold px-4 py-2 rounded-xl border border-slate-700 cursor-pointer"
                    >
                      ← Solicitar otro préstamo adicional
                    </button>
                  </div>
                </div>
              ) : (
                /* The loan request formulary with customized select options */
                <form onSubmit={handleSubmitLoanRequest} className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <PlusCircle className="w-5 h-5 text-[#a3c90e]" />
                      Formulario de Solicitud de Préstamo
                    </h3>
                    <p className="text-[10.5px] text-slate-400 mt-1">
                      Presenta una nueva solicitud de crédito complementario. Configura el pago, plazos e ingresa el objetivo de los fondos.
                    </p>
                  </div>

                  {/* Interactive Dynamic Loan Request Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                    <div className="space-y-4">
                      {/* Loan type choice option selector */}
                      <div>
                        <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Tipo de Préstamo a Solicitar *:</label>
                        <select
                          value={reqLoanType}
                          onChange={(e) => {
                            const val = e.target.value as '12 semanas' | 'Préstamo Fijo';
                            setReqLoanType(val);
                            if (val === 'Préstamo Fijo') {
                              setReqCustomAmount(3000);
                            } else {
                              setReqCustomAmount(10000);
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e] cursor-pointer"
                        >
                          <option value="12 semanas">Opción #1: 12 Semanas (Planes Semanales)</option>
                          <option value="Préstamo Fijo">Opción #2: Préstamos Fijos (Planes Mensuales)</option>
                        </select>
                      </div>

                      {reqLoanType === 'Préstamo Fijo' ? (
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Seleccionar Préstamo Fijo *:</label>
                          <select
                            value={reqCustomAmount}
                            onChange={(e) => {
                              setReqCustomAmount(Number(e.target.value));
                            }}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-[#a3c90e] font-black focus:outline-none focus:ring-1 focus:ring-[#a3c90e] cursor-pointer"
                          >
                            {PRESTAMOS_FIJOS.map((item) => (
                              <option key={item.capital} value={item.capital}>
                                {item.label} (Mensual)
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        /* Custom Amount Requested Input & Slider */
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase font-mono text-slate-400">
                            Cantidad Requerida (Monto) *:
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-black select-none">$</span>
                            <input
                              type="number"
                              min={1000}
                              max={50000}
                              step={1000}
                              required
                              value={reqCustomAmount || ''}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setReqCustomAmount(val);
                              }}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-7 pr-16 py-2 text-xs font-black text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                              placeholder="Monto requerido"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-mono text-[#a3c90e] font-bold">
                              MXN
                            </span>
                          </div>

                          {/* Visual Range Slider */}
                          <div className="pt-1 px-1">
                            <input
                              type="range"
                              min={1000}
                              max={50000}
                              step={1000}
                              value={reqCustomAmount || 1000}
                              onChange={(e) => setReqCustomAmount(Number(e.target.value))}
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#a3c90e]"
                            />
                            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 select-none">
                              <span>Mín: $1,000</span>
                              <span className="text-[#a3c90e] bg-[#a3c90e]/5 border border-[#a3c90e]/10 px-1 py-0.2 rounded font-bold">
                                Paso: $1,000
                              </span>
                              <span>Máx: $50,000</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Desglose de Pago Estimado Panel */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] uppercase font-mono font-black text-[#a3c90e] tracking-wider border-b border-slate-850 pb-1.5 mb-2.5 flex items-center justify-between">
                          <span>📊 Desglose de Solicitud</span>
                          <span className="text-[9px] text-[#a3c90e]/85 lowercase font-normal italic">
                            {reqLoanType === 'Préstamo Fijo' ? 'Menú de Préstamos Fijos' : '($135 sem. por cada $1,000)'}
                          </span>
                        </h4>

                        <div className="space-y-2 text-xs leading-none">
                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-400 text-[11px]">Monto del Crédito (Capital)</span>
                            <span className="text-white font-mono font-bold">
                              {formatMXN(reqCustomAmount || 0)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-400 text-[11px]">
                              Interés ({reqLoanType === '12 semanas' ? '12 Semanas' : 'Préstamo Fijo'})
                            </span>
                            <span className="text-[#a3c90e] font-mono font-bold">
                              {formatMXN(Math.round(
                                reqLoanType === 'Préstamo Fijo'
                                  ? (PRESTAMOS_FIJOS.find(p => p.capital === reqCustomAmount)?.interest || 1200)
                                  : ((reqCustomAmount || 0) / 1000) * 135 * 12
                              ))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Display of amortization / installments */}
                      <div className="mt-3.5 p-2 bg-[#0284c7]/5 border border-[#0284c7]/10 rounded-lg">
                        <div className="text-[9px] uppercase font-mono text-[#38bdf8] font-bold mb-1">
                          Plan de Amortización Propuesto:
                        </div>
                        {reqLoanType === '12 semanas' ? (
                          <div className="text-xs text-slate-300 font-sans">
                            <strong>12 pagos semanales</strong> de{" "}
                            <span className="text-white font-black font-mono">
                              {formatMXN(Math.round(Math.round(((reqCustomAmount || 0) / 1000) * 135 * 12) / 12))}
                            </span>{" "}
                            MXN.
                          </div>
                        ) : (
                          <div className="text-xs text-slate-300 font-sans">
                            <strong>4 pagos semanales</strong> de{" "}
                            <span className="text-white font-black font-mono">
                              {formatMXN(Math.round((PRESTAMOS_FIJOS.find(p => p.capital === reqCustomAmount)?.interest || 1200) / 4))}
                            </span>{" "}
                            MXN.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Propósito del Crédito *:</label>
                    <input
                      type="text"
                      required
                      value={reqPurpose}
                      onChange={(e) => setReqPurpose(e.target.value)}
                      placeholder="Ej. Inversión en local, compra de insumos, salud..."
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Comentarios / Observaciones adicionales:</label>
                    <textarea
                      rows={2}
                      value={reqNotes}
                      onChange={(e) => setReqNotes(e.target.value)}
                      placeholder="Ej. Es mi segundo crédito comercial con Salda App, agradecería respuesta expedita."
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                    />
                  </div>

                  <div className="border-t border-slate-850 pt-4 flex justify-between items-center flex-wrap gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      Sujeto a validación documental e historial del buró local.
                    </span>

                    <button
                      type="submit"
                      className="bg-[#a3c90e] hover:bg-[#acd113] active:scale-95 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow border-none ml-auto"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Enviar Solicitud de Préstamo
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 4. VIEW "MI PERFIL" CONTAINER */}
          {portalTab === 'profile' && activeClient && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#a3c90e]" />
                  Expediente Digital Verificado
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  ID de Cliente: {activeClient.id} • Consulta tus registros contractuales y personales protegidos.
                </p>
              </div>

              {/* Security Lock Banner */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-xs text-amber-400">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block uppercase tracking-wide mb-0.5">Expediente Certificado y Bloqueado 🔒</span>
                  Por políticas de seguridad de SALDA APP y cumplimiento legal ante de buró de crédito, toda la información personal, credenciales de acceso y expediente digital quedan bloqueados una vez completado el registro. Solo es posible su visualización. Si requieres alguna rectificación, solicita soporte con un asesor.
                </div>
              </div>

              {/* Form container divided in responsive columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Panel: Datos Personales */}
                <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl space-y-3.5">
                  <h4 className="text-[11px] uppercase font-mono font-bold text-[#a3c90e] border-b border-slate-850 pb-1.5 flex justify-between items-center">
                    <span>1. Datos Personales de Identidad</span>
                    <span className="text-[9px] bg-[#a3c90e]/10 text-[#a3c90e] px-1.5 py-0.5 rounded uppercase font-mono flex items-center gap-1 font-semibold">
                      <Lock className="w-2.5 h-2.5" /> BLOQUEADO
                    </span>
                  </h4>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Nombre Completo:</label>
                    <input
                      type="text"
                      disabled
                      className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                      value={tempName}
                      placeholder="Sin registrar"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">RFC Oficial:</label>
                    <input
                      type="text"
                      disabled
                      className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 uppercase cursor-not-allowed"
                      value={tempRfc}
                      placeholder="Sin registrar"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Teléfono Móvil:</label>
                    <input
                      type="tel"
                      disabled
                      className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                      value={tempPhone}
                      placeholder="Sin registrar"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Dirección de Correo Electrónico:</label>
                    <input
                      type="email"
                      disabled
                      className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                      value={tempEmail}
                      placeholder="Sin registrar"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Fecha de Nacimiento:</label>
                    <input
                      type="date"
                      disabled
                      className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 cursor-not-allowed"
                      value={tempBirthDate}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Dirección Domiciliaria:</label>
                    <textarea
                      rows={2}
                      disabled
                      className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed resize-none"
                      value={tempAddress}
                      placeholder="Sin registrar"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Perfil de Facebook:</label>
                    <input
                      type="text"
                      disabled
                      className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                      value={tempFacebookProfile}
                      placeholder="Sin registrar"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Link de Ubicación (Google Maps):</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed pr-12"
                        value={tempLocationLink}
                        placeholder="Sin registrar"
                      />
                      {tempLocationLink && (
                        <a 
                          href={tempLocationLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute right-3 top-2 text-[#a3c90e] hover:underline text-[10px] font-mono cursor-pointer"
                        >
                          Abrir
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Panel: Credenciales / Contraseña de acceso */}
                <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl space-y-4">
                  <h4 className="text-[11px] uppercase font-mono font-bold text-[#a3c90e] border-b border-slate-850 pb-1.5 flex justify-between items-center">
                    <span>2. Contraseña del Sistema</span>
                    <span className="text-[9px] bg-[#a3c90e]/10 text-[#a3c90e] px-1.5 py-0.5 rounded uppercase font-mono flex items-center gap-1 font-semibold">
                      <Lock className="w-2.5 h-2.5" /> ENCRIPTADO
                    </span>
                  </h4>

                  <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-1.5 text-[11px] leading-relaxed">
                    <p className="text-slate-350">
                      Usa estas credenciales para acceder a tu dashboard en tu siguiente inicio de sesión.
                    </p>
                    <div className="flex gap-2">
                      <span className="text-slate-500 font-mono">Nombre de Usuario:</span>
                      <span className="font-bold text-white font-mono">{activeClient.username || activeClient.id}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Contraseña de Acceso:</label>
                    <input
                      type="text"
                      disabled
                      className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-slate-550 cursor-not-allowed select-all"
                      value={tempPassword}
                      placeholder="Contraseña del cliente"
                    />
                  </div>

                  {/* Panel For Profile Avatar Upload */}
                  <div className="border-t border-slate-850 pt-4 space-y-3">
                    <h5 className="text-[10px] uppercase font-mono font-black text-white flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#a3c90e]" /> Fotografía de Perfil (Avatar)
                    </h5>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full border border-slate-850 bg-slate-950 overflow-hidden flex items-center justify-center relative shadow-inner">
                        {tempProfileImage ? (
                          <img src={tempProfileImage} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 text-[11px] text-slate-400 leading-normal">
                        La fotografía de perfil se encuentra locked por seguridad. Si requieres actualizar tu foto, ponte en contacto con administración.
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Section 3: Expedientes Digitales (INE, Comprobante de domicilio, etc) */}
              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-4">
                <h4 className="text-[11px] uppercase font-mono font-bold text-[#a3c90e] border-b border-slate-850 pb-2 flex justify-between items-center">
                  <span>3. Expediente Contractual (Expediente Digital)</span>
                  <span className="text-[9px] bg-[#a3c90e]/10 text-[#a3c90e] px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1 font-mono font-semibold">
                    <Lock className="w-2.5 h-2.5" /> ARCHIVO RESGUARDADO
                  </span>
                </h4>

                <p className="text-[11px] text-slate-350 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#a3c90e]" />
                  Tus documentos oficiales y probatorios del expediente comercial han sido validados y resguardados con éxito.
                </p>

                {/* Grid display for the images */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* INE Frontal */}
                  <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase font-mono font-black text-amber-400 flex items-center justify-between">
                      <span>INE Anverso (Delante)</span>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </span>
                    
                    <div className="aspect-[4/3] w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex items-center justify-center relative group">
                      {tempIneFront ? (
                        <>
                          <img src={tempIneFront} alt="INE Frontal" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setZoomedImg({ src: tempIneFront, title: 'INE - Anverso (Frente)' })}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#a3c90e] hover:text-slate-950 text-white transition cursor-pointer text-xs"
                            >
                              Ver Grande
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 text-slate-600 flex flex-col items-center gap-1.55">
                          <ImageIcon className="w-8 h-8 opacity-40 text-slate-500" />
                          <span className="text-[9px] font-mono">Sin Imagen de INE</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* INE Reverso */}
                  <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase font-mono font-black text-amber-400 flex items-center justify-between">
                      <span>INE Reverso (Detrás)</span>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </span>
                    
                    <div className="aspect-[4/3] w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex items-center justify-center relative group">
                      {tempIneBack ? (
                        <>
                          <img src={tempIneBack} alt="INE Reverso" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setZoomedImg({ src: tempIneBack, title: 'INE - Reverso (Atrás)' })}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#a3c90e] hover:text-slate-950 text-white transition cursor-pointer text-xs"
                            >
                              Ver Grande
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 text-slate-600 flex flex-col items-center gap-1.5">
                          <ImageIcon className="w-8 h-8 opacity-40 text-slate-500" />
                          <span className="text-[9px] font-mono">Sin Imagen de INE</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comprobante de Domicilio */}
                  <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 flex flex-col gap-2.5">
                    <span className="text-[10px] uppercase font-mono font-black text-amber-400 flex items-center justify-between">
                      <span>Comprobante de Domicilio</span>
                      <Lock className="w-3 h-3 text-slate-400" />
                    </span>
                    
                    <div className="aspect-[4/3] w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-850 flex items-center justify-center relative group">
                      {tempProofOfAddress ? (
                        <>
                          <img src={tempProofOfAddress} alt="Comprobante" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setZoomedImg({ src: tempProofOfAddress, title: 'Comprobante de Domicilio' })}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#a3c90e] hover:text-[#a3c90e]/80 transition cursor-pointer text-xs"
                            >
                              Ver Grande
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 text-slate-600 flex flex-col items-center gap-1.5">
                          <ImageIcon className="w-8 h-8 opacity-40 text-slate-500" />
                          <span className="text-[9px] font-mono">Sin Documento</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Locked/Saved Indicators Bottom Bar */}
              <div className="border-t border-slate-800/80 pt-5">
                <div className="bg-[#a3c90e]/5 border border-[#a3c90e]/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-2.5 text-[#a3c90e] text-xs text-center sm:text-left">
                    <ShieldCheck className="w-5 h-5 text-[#a3c90e] shrink-0" />
                    <div>
                      <span className="font-bold block uppercase tracking-wide">ESTATUS: EXPEDIENTE CERRADO Y SEGURO</span>
                      Toda tu información está protegida mediante encriptación SSL y certificaciones de SALDA APP.
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-950 border border-slate-850 text-slate-400 font-mono py-1.5 px-3 rounded-lg uppercase flex items-center gap-1.5 font-semibold select-none">
                    <Lock className="w-3 h-3 text-[#a3c90e]" /> PROTEGIDO CON CANDADOS
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. VIEW "CONTRATO" CUSTOMER PORTAL CONTAINER */}
          {portalTab === 'contract' && activeClient && (() => {
            const clientContract = contracts.find(c => c.clientId === activeClient.id);
            
            const handlePrintLocal = (contractId: string) => {
              const printContent = document.getElementById(`printable-client-contract-${contractId}`);
              if (!printContent) return;
              
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Contrato Oficial Salda App - ${contractId}</title>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>
                        body { font-family: 'Inter', system-ui, sans-serif; background-color: white; color: black; padding: 40px; }
                        @media print {
                          body { padding: 0; }
                        }
                      </style>
                    </head>
                    <body onload="window.print(); window.close();">
                      <div class="max-w-4xl mx-auto border-2 border-slate-900 p-8 rounded-lg relative">
                        ${printContent.innerHTML}
                      </div>
                    </body>
                  </html>
                `);
                printWindow.document.close();
              }
            };

            if (clientContract) {
              return (
                <div className="space-y-6 animate-fadeIn text-left">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#a3c90e]" />
                        Tu Contrato Digital Emitido
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        Código Único Federal: <span className="text-[#a3c90e] font-semibold">{clientContract.id}</span> • Estatus: <span className="text-emerald-400 font-bold uppercase">{clientContract.status}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handlePrintLocal(clientContract.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow border-none cursor-pointer transition active:scale-95 select-none"
                    >
                      <Printer className="w-4 h-4" />
                      Visualizar y Exportar PDF
                    </button>
                  </div>

                  {/* PREMIUM PRINTABLE CONTRACT CANVAS */}
                  <div 
                    className="bg-white text-slate-900 rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl overflow-y-auto max-h-[550px] leading-relaxed relative"
                    id={`printable-client-contract-${clientContract.id}`}
                  >
                    {/* Background Watermark/Graphic */}
                    <div className="absolute inset-0 bg-contain bg-center opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url('https://cossma.com.mx/saldaapplogo.png')` }}></div>

                    {/* Corporate Header Block */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src="https://cossma.com.mx/saldaapplogo.png" 
                          alt="Salda Logo" 
                          className="h-10 w-auto object-contain" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h1 className="font-sans font-black tracking-tight text-lg text-slate-950 uppercase leading-none">Salda App</h1>
                          <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold block mt-1">Fideicomiso Express Mexicana S.A. de C.V.</span>
                        </div>
                      </div>
                      <div className="text-right text-[10px] font-mono text-slate-600">
                        <div className="font-bold text-slate-900">CERTIFICACIÓN VIGENTE</div>
                        <div>Ref: {clientContract.paymentReference}</div>
                        <div>Reg: CNBV-FID-2026</div>
                      </div>
                    </div>

                    {/* Official Title Section */}
                    <div className="text-center space-y-1 mb-6">
                      <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 underline">
                        {clientContract.contractType === 'Contrato Express'
                          ? 'CONTRATO EXPRESO DE CRÉDITO DE CONSUMO INMEDIATO'
                          : 'CONTRATO DE MUTUO CON INTERÉS Y GARANTÍA ENTRE PARTICULARES'}
                      </h2>
                      <p className="text-[9.5px] text-slate-500 font-mono tracking-wider">
                        DOCUMENTO DIGITAL CERTIFICADO CON COMPROMISO FISCAL DE AMORTIZACIÓN
                      </p>
                    </div>

                    {/* Substantive Declared Body Text */}
                    <div className="text-[10.5px] text-slate-800 space-y-2.5 text-justify leading-relaxed">
                      <p>
                        <strong>DECLARACIONES:</strong> El presente contrato (en lo sucesivo, el "Contrato") es celebrado el día <strong className="text-slate-950 font-black">{clientContract.dateGenerated}</strong> por y entre las partes señaladas a continuación:
                      </p>
                      <p className="pl-3 border-l pb-1 border-slate-300">
                        Por una parte, <strong>Fideicomiso de Recaudación Salda App S.A.</strong> como el <strong>"Acreedor fiduciario unificado"</strong>, y por la otra parte, el cliente registrado cuyos datos fiduciarios se autocompletan legalmente:
                      </p>

                      {/* Client Metadata block */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[9.5px] my-3 leading-loose text-slate-900">
                        <div>
                          <span className="text-slate-500 uppercase block text-[8px] font-black">MUTUATARIO / CLIENTE:</span>
                          <strong className="text-slate-950 text-[10.5px] font-sans">{clientContract.clientName}</strong>
                          <div className="mt-1">ID Contrato: <span className="font-bold text-indigo-750">{clientContract.id}</span></div>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase block text-[8px] font-black">MONTO MUTUADO / LÍNEA DE CRÉDITO:</span>
                          <strong className="text-[#8dae09] text-[10.5px] font-bold">${clientContract.amount.toLocaleString('es-MX')} MXN</strong>
                          <div className="mt-1">Referencia Bancaria Sincronizada: <span className="bg-slate-900 text-white font-bold font-mono px-1.5 py-0.2 rounded">{clientContract.paymentReference}</span></div>
                        </div>
                      </div>

                      <p>
                        Las partes manifiestan de común acuerdo someterse al tenor de las siguientes cláusulas obligatorias bajo las leyes de la República Mexicana:
                      </p>

                      {clientContract.contractType === 'Contrato Express' ? (
                        <div className="space-y-2">
                          <p>
                            <strong>CLÁUSULA PRIMERA (Entrega y Destino del Crédito):</strong> Salda App pone a la disposición de la Parte Acreditada la suma autorizada de <strong>${clientContract.amount.toLocaleString('es-MX')} MXN</strong>. El Acreditado declara recibir a su entera satisfacción dicho capital fiduciario para ser destinado a fines personales lícitos de consumo.
                          </p>
                          <p>
                            <strong>CLÁUSULA SEGUNDA (Compromiso Único de Pago y Abonos):</strong> El cliente se obliga y compromete irrevocablemente a amortizar y liquidar el saldo total, intereses aplicables y recargos, a través de la cuenta fiduciaria habilitada por Salda App, identificando cada depósito indefectiblemente utilizando su Referencia Única de Depósito: <strong className="font-mono text-slate-950 underline">{clientContract.paymentReference}</strong>.
                          </p>
                          <p>
                            <strong>CLÁUSULA TERCERA (Tasa de Interés Moratorio y Buró de Crédito):</strong> En caso de retraso en los pagos pactados, se aplicará de manera unificada una tasa de interés moratorio del 5.8% mensual. Asimismo, el atraso dará facultad de reportar el comportamiento negativo inmediatamente a las sociedades de información crediticia (Buró de Crédito).
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p>
                            <strong>CLÁUSULA PRIMERA (Objeto del Contrato de Mutuo):</strong> El Mutuante transmite la propiedad de la cantidad líquida de <strong>${clientContract.amount.toLocaleString('es-MX')} MXN</strong> al Mutuatario, quien la recibe con la obligación expresa de restituirla y liquidarla con los intereses pactados de conformidad con el calendario regulado.
                          </p>
                          <p>
                            <strong>CLÁUSULA SEGUNDA (Tasa de Costo Anual y Referencia de Pago Bancaria):</strong> El mutuo se compromete bajo la tasa fiduciaria de la plataforma, conviniéndose expresamente de manera inalterable que todo abono, amortización y pago ordinario se realizará mediante de transferencias bancarias o SPEI, con el identificador único bancario de pagos SPEI fiduciarios registrado: <strong className="font-mono text-slate-950 underline">{clientContract.paymentReference}</strong>.
                          </p>
                          <p>
                            <strong>CLÁUSULA TERCERA (Vencimiento Anticipado):</strong> El incumplimiento puntual de cualquiera de los abonos facultará al Mutuante para declarar el vencimiento anticipado de toda la obligación, requiriendo el saldo insoluto de manera inmediata por la vía ejecutiva mercantil.
                          </p>
                        </div>
                      )}

                      <p>
                        <strong>SELLO DIGITAL CENTRAL DE LA PLATAFORMA:</strong>
                        <span className="block font-mono text-[8px] bg-slate-100 p-2 text-slate-600 rounded-lg break-all mt-1">
                          SHA256::A1B9392BC876251EF9302A0931B2A1{clientContract.id}FE::FirmaDigitalSincronizadaConComiteEspecialSaldaAppFisicoJuridico2026CE73A2B1C9D2EBC918
                        </span>
                      </p>
                    </div>

                    {/* Digital Stamps / Authorized Signatures panels */}
                    <div className="grid grid-cols-2 gap-6 border-t border-slate-205 pt-6 mt-6 text-[9.5px] font-sans">
                      <div className="text-center">
                        <p className="text-slate-450 text-[8px] uppercase tracking-wider font-mono text-slate-500 font-bold">Por el Acreedor (Salda App)</p>
                        <div className="h-10 flex items-center justify-center italic text-blue-800 font-serif font-black">
                          Harold Salazar S.
                        </div>
                        <div className="border-t border-slate-400 pt-1 text-slate-700">
                          <strong>LIC. HAROLD SALAZAR RUIZ</strong>
                          <span className="block text-[8px] text-slate-500 font-mono">Apoderado General de Crédito</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-slate-450 text-[8px] uppercase tracking-wider font-mono text-slate-500 font-bold">Por el Mutuatario (Acreditado)</p>
                        <div className="h-10 flex items-center justify-center italic text-slate-650 font-serif font-mono text-xs text-slate-700">
                          FIRMADO ELECTRÓNICAMENTE
                        </div>
                        <div className="border-t border-slate-400 pt-1 text-slate-700">
                          <strong>{clientContract.clientName}</strong>
                          <span className="block text-[8px] text-slate-500 font-mono">Firma Biométrica Validada</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 border border-slate-805 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#a3c90e] shrink-0" />
                    <span className="text-[11px] text-slate-400 leading-snug">
                      Este contrato virtual se sincroniza perfectamente con tu saldo deudor. Puedes realizar abonos o pagos puntuales usando tu Referencia Única <strong className="text-white font-mono">{clientContract.paymentReference}</strong>.
                    </span>
                  </div>
                </div>
              );
            } else {
              // Status steps: no contract generated yet
              return (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6 text-left animate-fadeIn">
                  <div className="text-center max-w-lg mx-auto py-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-950/60 flex items-center justify-center border border-slate-800 text-indigo-400 font-bold animate-pulse mx-auto">
                      <FileText className="w-6 h-6 text-[#a3c90e]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base">Contrato Digital en Trámite</h3>
                      <p className="text-xs text-slate-450 text-slate-400 mt-1 font-sans leading-relaxed">
                        Tu contrato fiduciario se encuentra en fase de instrumentación legal y validación de firmas por nuestro super administrador <strong className="text-white">Harold Salazar</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Horizontal visual stepper milestones */}
                  <div className="bg-slate-950/55 p-5 border border-slate-850 rounded-2xl">
                    <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">Etapas de Validación y Generación</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2 text-[11px] leading-tight relative">
                      <div className="space-y-1.5 p-3 rounded-xl bg-[#a3c90e]/5 border border-[#a3c90e]/20 text-[#a3c90e]">
                        <div className="font-bold font-mono">ETAPA 1</div>
                        <div className="font-black">Crédito Aprobado</div>
                        <span className="bg-[#a3c90e]/20 text-[#a3c90e] text-[8px] font-mono uppercase px-1 py-0.2 rounded font-bold">Completado</span>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-xl bg-[#a3c90e]/5 border border-[#a3c90e]/20 text-[#a3c90e]">
                        <div className="font-bold font-mono">ETAPA 2</div>
                        <div className="font-black">Expediente Validado</div>
                        <span className="bg-[#a3c90e]/20 text-[#a3c90e] text-[8px] font-mono uppercase px-1 py-0.2 rounded font-bold">Completado</span>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 animate-pulse">
                        <div className="font-bold font-mono">ETAPA 3</div>
                        <div className="font-bold text-white">Generación de Cláusulas</div>
                        <span className="bg-indigo-505 bg-indigo-500/15 text-indigo-400 text-[8px] font-mono uppercase px-1 py-0.2 rounded font-bold">En Proceso</span>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/20 border border-slate-900 text-slate-600">
                        <div className="font-bold font-mono">ETAPA 4</div>
                        <div className="font-bold">Emisión del PDF</div>
                        <span className="border border-slate-850 text-[8px] font-mono uppercase px-1 py-0.2 rounded font-mono">Pendiente</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-600/5 border border-indigo-600/20 rounded-xl">
                    <p className="text-xs text-slate-350 leading-relaxed">
                      💡 <strong>¿Qué sucede después de la generación?</strong> Se agregará automáticamente la Referencia única de pago bancaria para que puedas realizar abonos recurrentes con conciliación automatizada en tiempo real. Recibirás una notificación instantánea en pantalla una vez asignado.
                    </p>
                  </div>
                </div>
              );
            }
          })()}

        </div>

        {/* Right Side Col (4 spans): Selected Client Info Card (Persistent details) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#a3c90e] uppercase tracking-wider">
              Identidad de Consulta
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Clientes activos en cartera:</label>
                <div className="relative">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e] appearance-none cursor-pointer pr-10"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {activeClient && (
                <div className="bg-slate-950/85 rounded-xl p-4 border border-slate-850 space-y-3 font-mono">
                  <div className="flex items-center gap-3 font-sans">
                    <div className="w-10 h-10 rounded-full bg-[#0a3a46] border border-[#a3c90e]/30 flex items-center justify-center font-bold text-white text-xs shrink-0">
                      {activeClient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#a3c90e] uppercase tracking-wide truncate max-w-[130px]">{activeClient.name}</h4>
                      <span className="text-[10px] text-slate-350 block mt-0.5">Clave Préstamo: <strong className="text-white">{activeClient.id}</strong></span>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-2.5 space-y-1.5 text-[11px] leading-relaxed">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Otorgado:</span>
                      <span className="text-white font-bold">{formatMXN(activeClient.totalCreditGranted)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Saldo Pendiente:</span>
                      <span className="text-amber-400 font-extrabold">{formatMXN(activeClient.balanceOwed)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Tipo Membresía:</span>
                      <span className="text-slate-205 text-white font-bold">{activeClient.membership || 'Ninguna'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Estatus de Buró:</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        activeClient.bureauStatus === 'EXCELENTE' ? 'bg-emerald-500/10 text-emerald-400' :
                        activeClient.bureauStatus === 'BUENO' ? 'bg-blue-500/10 text-blue-400' :
                        activeClient.bureauStatus === 'REGULAR' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {activeClient.bureauStatus}
                      </span>
                    </div>
                    {activeClient.delinquencyDays > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 font-bold">Días de Atraso:</span>
                        <span className="bg-red-500/10 text-red-400 font-black px-1.5 py-0.5 rounded text-[10px]">
                          {activeClient.delinquencyDays} días
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Hidden camera snapshot canvas rendering tool */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Lightbox Modal for zooming in on ID / document photographs */}
      {zoomedImg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-3xl w-full bg-slate-910 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-805 border-slate-800">
              <h4 className="text-xs uppercase tracking-widest font-mono text-[#a3c90e] font-black">{zoomedImg.title}</h4>
              <button 
                onClick={() => setZoomedImg(null)}
                className="p-1 px-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-500 text-slate-400 hover:text-white transition cursor-pointer text-xs font-mono"
              >
                ✕ Cerrar
              </button>
            </div>
            
            <div className="w-full h-[60vh] max-h-[500px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center relative">
              <img 
                src={zoomedImg.src} 
                alt={zoomedImg.title} 
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
