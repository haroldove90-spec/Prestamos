import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, CheckCircle2, XCircle, AlertCircle, 
  MapPin, Calendar, User, DollarSign, Bell, RefreshCw, 
  Eye, EyeOff, ShieldCheck, Sparkles, Send, Trash2
} from 'lucide-react';
import { ClientDossier, Client, PRESTAMOS_FIJOS } from '../types';

interface ExpedientesModuleProps {
  currentUser: string;
  clients: Client[];
  dossiers: ClientDossier[];
  onAddDossier: (dossier: ClientDossier) => void;
  onUpdateDossier: (dossierId: string, updates: Partial<ClientDossier>) => void;
  onApproveDossier: (dossier: ClientDossier) => void; // Will register them as approved & create requests/client entry
  onAddSystemAlert?: (alert: { actionBlocked: string; targetClient: string; notes: string }) => void;
}

export const ExpedientesModule: React.FC<ExpedientesModuleProps> = ({
  currentUser,
  clients,
  dossiers,
  onAddDossier,
  onUpdateDossier,
  onApproveDossier,
  onAddSystemAlert
}) => {
  // Client state
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loanType, setLoanType] = useState<'12 semanas' | 'Préstamo Fijo'>('12 semanas');
  const [requestedAmount, setRequestedAmount] = useState<number>(10000);
  
  // Document base64 contents
  const [ineFront, setIneFront] = useState<string>('');
  const [ineBack, setIneBack] = useState<string>('');
  const [proofOfAddress, setProofOfAddress] = useState<string>('');

  // Filenames for visual feedback
  const [ineFrontName, setIneFrontName] = useState('');
  const [ineBackName, setIneBackName] = useState('');
  const [proofName, setProofName] = useState('');

  // Drag highlights
  const [dragActiveIneFront, setDragActiveIneFront] = useState(false);
  const [dragActiveIneBack, setDragActiveIneBack] = useState(false);
  const [dragActiveProof, setDragActiveProof] = useState(false);

  // Active admin selected dossier
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [viewingDocumentUrl, setViewingDocumentUrl] = useState<{ url: string; title: string } | null>(null);

  // Client's own dossier if they are in client view
  // Let's search if current user has an existing dossier
  const clientOwnDossier = dossiers.find(
    d => d.clientName.toLowerCase() === (currentUser === 'cliente_esperanza' ? 'esperanza escobedo guzman' : currentUser.toLowerCase()) || 
         (currentUser === 'cliente_esperanza' && d.clientName.toLowerCase().includes('esperanza'))
  ) || dossiers[dossiers.length - 1]; // Fallback to last submitted for easy demonstration

  // Auto-populate when user is cliente_esperanza
  useEffect(() => {
    if (currentUser === 'cliente_esperanza') {
      setClientName('Esperanza Escobedo Guzman');
      setAddress('Av. Constelaciones 402, Col. Satélite, Monterrey, N.L.');
      setBirthDate('1984-05-01');
    } else {
      setClientName('');
      setAddress('');
      setBirthDate('');
    }
  }, [currentUser]);

  // Handle files
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setBase64: (val: string) => void,
    setFileName: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent, setActive: (val: boolean) => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setActive(true);
    } else if (e.type === "dragleave") {
      setActive(false);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    setActive: (val: boolean) => void,
    setBase64: (val: string) => void,
    setFileName: (val: string) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitClientDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !address || !birthDate || !requestedAmount) {
      alert('Por favor, rellena todos los campos requeridos (*).');
      return;
    }

    // Default document placeholds if none uploaded
    const finalIneFront = ineFront || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=800&auto=format&fit=crop&q=80';
    const finalIneBack = ineBack || 'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?w=800&auto=format&fit=crop&q=80';
    const finalProof = proofOfAddress || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80';

    let reqFee = 0;
    if (loanType === 'Préstamo Fijo') {
      const match = PRESTAMOS_FIJOS.find(p => p.capital === requestedAmount);
      reqFee = match ? match.interest : 1200;
    } else {
      reqFee = Math.round((requestedAmount / 1000) * 135 * 12);
    }
    const reqTotalPayable = requestedAmount + reqFee;
    let descPlan = '';

    if (loanType === 'Préstamo Fijo') {
      descPlan = `Préstamo Fijo de $${requestedAmount.toLocaleString('es-MX')} MXN para pagar $${reqTotalPayable.toLocaleString('es-MX')} MXN (Interés: $${reqFee.toLocaleString('es-MX')} MXN en 4 semanas)`;
    } else {
      const abonoSemanal = Math.round(reqTotalPayable / 12);
      descPlan = `Plan Semanal a 12 Semanas con 12 pagos de $${abonoSemanal.toLocaleString('es-MX')} MXN (Total: $${reqTotalPayable.toLocaleString('es-MX')} MXN, Capital: $${requestedAmount.toLocaleString('es-MX')} MXN + Costo: $${reqFee.toLocaleString('es-MX')} MXN por 12 semanas)`;
    }

    const newDossier: ClientDossier = {
      id: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
      clientName,
      address,
      birthDate,
      ineFront: finalIneFront,
      ineBack: finalIneBack,
      proofOfAddress: finalProof,
      requestedAmount,
      status: 'ANALIZANDO',
      createdAt: new Date().toISOString().split('T')[0],
      notificationDismissed: false,
      loanType: loanType,
      monthlyPlan: descPlan
    };

    onAddDossier(newDossier);
    
    // Clear form except user info
    if (currentUser !== 'cliente_esperanza') {
      setClientName('');
      setAddress('');
      setBirthDate('');
    }
    setIneFront('');
    setIneBack('');
    setProofOfAddress('');
    setIneFrontName('');
    setIneBackName('');
    setProofName('');
    
    // Auto-select in admin view
    setSelectedDossierId(newDossier.id);

    // Security alert for credit activity
    if (onAddSystemAlert) {
      onAddSystemAlert({
        actionBlocked: 'EXPEDIENTE_SOLICITADO',
        targetClient: clientName,
        notes: `El cliente solicitó un préstamo por ${formatMXN(requestedAmount)} mediante el módulo unificado de expedientes.`
      });
    }
  };

  const handleAdminApprove = (dossier: ClientDossier) => {
    const updated = { ...dossier, status: 'APROBADO' as const, adminNotes };
    onApproveDossier(updated);
    setAdminNotes('');
  };

  const handleAdminReject = (dossierId: string) => {
    onUpdateDossier(dossierId, { status: 'RECHAZADO', adminNotes });
    const dossier = dossiers.find(d => d.id === dossierId);
    if (dossier && onAddSystemAlert) {
      onAddSystemAlert({
        actionBlocked: 'EXPEDIENTE_RECHAZADO',
        targetClient: dossier.clientName,
        notes: `El expediente ${dossierId} fue rechazado. Razón: ${adminNotes || 'No especificada'}`
      });
    }
    setAdminNotes('');
  };

  // Instant simulation helper requested: "por lo pronto esa funcion debe simular que el cliente ha sido aceptado el prestamo por el admin."
  const handleSimulateInstantAccept = (dossier: ClientDossier) => {
    const updated = { ...dossier, status: 'APROBADO' as const, adminNotes: 'Aprobación rápida simulada por el cliente de forma local.' };
    onApproveDossier(updated);
    
    // Fire callback alert indicating simulation success
    if (onAddSystemAlert) {
      onAddSystemAlert({
        actionBlocked: 'SIMULACION_AUTORIZADA',
        targetClient: dossier.clientName,
        notes: `Auto-aprobación simulada e instantánea del expediente ${dossier.id}.`
      });
    }
  };

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(val);
  };

  // Active dossier for admin
  const activeAdminDossier = dossiers.find(d => d.id === selectedDossierId) || dossiers[0];

  return (
    <div className="space-y-6">
      {/* Banner de Título */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-black text-[#a3c90e] uppercase tracking-widest block">MÓDULO DE EXPEDIENTES</span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
              <FileText className="w-5 h-5 text-[#a3c90e]" />
              Expedientes de Crédito y Cotejo de Documentos
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-normal max-w-2xl">
              Recaba identidad, comprobante de domicilio y cantidad solicitada por el cliente. El Administrador coteja y autoriza los préstamos con sincronización total en tiempo real con Supabase.
            </p>
          </div>

          <div className="flex gap-2">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              {dossiers.filter(d => d.status === 'ANALIZANDO').length} En Análisis
            </span>
          </div>
        </div>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
        
        {/* ==================================================================== */}
        {/* VIEW A: CLIENT FORM / SOLICITUD VIEW (Vistas para Cliente o para asesor que asiste) */}
        {/* ==================================================================== */}
        {currentUser === 'cliente_esperanza' && (
          <div className="xl:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#a3c90e]" />
                  Nueva Solicitud / Registrar Expediente
                </h3>
                <p className="text-[10px] text-slate-400">Rellena el expediente con documentación fidedigna</p>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                Formulario digital
              </span>
            </div>

            <form onSubmit={handleSubmitClientDossier} className="space-y-4">
              {/* Client Name Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-black text-slate-400 flex items-center gap-1">
                  <User className="w-3 w-3 text-[#a3c90e]" /> Nombre Completo del Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Esperanza Escobedo Guzman"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={currentUser === 'cliente_esperanza'}
                  className="w-full bg-slate-950/70 text-slate-100 placeholder-slate-600 font-sans text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-[#a3c90e]/75 focus:ring-0 outline-none transition disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* Domicilio e IP Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase font-black text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#a3c90e]" /> Domicilio Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Calle, Número, Colonia, Municipio, Estado"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950/70 text-slate-100 placeholder-slate-600 font-sans text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-[#a3c90e]/75 focus:ring-0 outline-none transition"
                />
              </div>

              {/* DOB & Loan Type Selection & Requested Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-black text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#a3c90e]" /> Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-950/70 text-slate-100 font-sans text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-[#a3c90e]/75 focus:ring-0 outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-black text-slate-400 flex items-center gap-1">
                    Tipo de Préstamo *
                  </label>
                  <select
                    value={loanType}
                    onChange={(e) => {
                      const val = e.target.value as '12 semanas' | 'Préstamo Fijo';
                      setLoanType(val);
                      if (val === 'Préstamo Fijo') {
                        setRequestedAmount(3000); // Default to first available option
                      } else {
                        setRequestedAmount(10000);
                      }
                    }}
                    className="w-full bg-slate-950/70 text-slate-100 font-sans text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-[#a3c90e]/75 focus:ring-0 outline-none transition cursor-pointer"
                  >
                    <option value="12 semanas">12 Semanas (Planes Semanales)</option>
                    <option value="Préstamo Fijo">Préstamo Fijo (Planes Mensuales)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 bg-slate-950/40 p-3 border border-slate-850 rounded-xl">
                {loanType === 'Préstamo Fijo' ? (
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-[#a3c90e]" /> Seleccionar Préstamo Fijo *
                    </label>
                    <select
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 text-slate-100 font-mono text-xs px-3 py-2 border border-slate-800 rounded-xl focus:border-[#a3c90e]/75 text-[#a3c90e] font-black focus:outline-none cursor-pointer"
                    >
                      {PRESTAMOS_FIJOS.map((item) => (
                        <option key={item.capital} value={item.capital}>
                          {item.label} (Abono de ${((item.capital + item.interest) / 4).toLocaleString('es-MX')} x4)
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-[#a3c90e]" /> Monto Solicitado (MXN entre $1,000 y $50,000) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      max={50000}
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(Math.min(50000, Math.max(0, Number(e.target.value))))}
                      className="w-full bg-slate-950/70 text-slate-100 font-mono text-xs px-3 py-2 rounded-xl border border-slate-800 focus:border-[#a3c90e]/75 focus:outline-none font-extrabold text-[#a3c90e]"
                    />
                    <div className="flex gap-2 items-center mt-2.5">
                      <input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={requestedAmount}
                        onChange={(e) => setRequestedAmount(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#a3c90e]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* DOCUMENT UPLOAD PANELS */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-extrabold uppercase font-mono text-[#a3c90e] tracking-wider block">Adjuntar Documentación Obligatoria</span>
                
                {/* 1. INE FRONT UPLOAD */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-400">1. Identificación Oficial Frente (INE/Pasaporte)</span>
                  <div 
                    onDragEnter={(e) => handleDrag(e, setDragActiveIneFront)}
                    onDragOver={(e) => handleDrag(e, setDragActiveIneFront)}
                    onDragLeave={(e) => handleDrag(e, setDragActiveIneFront)}
                    onDrop={(e) => handleDrop(e, setDragActiveIneFront, setIneFront, setIneFrontName)}
                    className={`border-2 border-dashed rounded-xl p-3 text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-950/45 min-h-[90px] ${
                      dragActiveIneFront ? 'border-[#a3c90e] bg-[#a3c90e]/5' : ineFront ? 'border-emerald-500/60' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {ineFront ? (
                      <div className="flex items-center gap-2 justify-between w-full px-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold truncate max-w-[85%]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{ineFrontName || "ine_frente.png"}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={(o) => { o.stopPropagation(); setIneFront(''); setIneFrontName(''); }}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition"
                          title="Remover documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-[#a3c90e]" />
                        <p className="text-[9px] text-slate-400">Arraastra tu archivo aquí o <span className="text-[#a3c90e] hover:underline">explora archivos</span></p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setIneFront, setIneFrontName)}
                          className="opacity-0 absolute w-0 h-0" 
                          id="input-ine-front"
                        />
                        <button 
                          type="button"
                          onClick={() => document.getElementById('input-ine-front')?.click()}
                          className="text-[8px] bg-[#a3c90e]/10 text-[#a3c90e] hover:bg-[#a3c90e]/20 border border-[#a3c90e]/20 px-2 py-0.5 rounded"
                        >
                          Seleccionar Foto
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. INE BACK UPLOAD */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-400">2. Identificación Oficial Reverso</span>
                  <div 
                    onDragEnter={(e) => handleDrag(e, setDragActiveIneBack)}
                    onDragOver={(e) => handleDrag(e, setDragActiveIneBack)}
                    onDragLeave={(e) => handleDrag(e, setDragActiveIneBack)}
                    onDrop={(e) => handleDrop(e, setDragActiveIneBack, setIneBack, setIneBackName)}
                    className={`border-2 border-dashed rounded-xl p-3 text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-950/45 min-h-[90px] ${
                      dragActiveIneBack ? 'border-[#a3c90e] bg-[#a3c90e]/5' : ineBack ? 'border-emerald-500/60' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {ineBack ? (
                      <div className="flex items-center gap-2 justify-between w-full px-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold truncate max-w-[85%]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{ineBackName || "ine_reverso.png"}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={(o) => { o.stopPropagation(); setIneBack(''); setIneBackName(''); }}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition"
                          title="Remover documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-[#a3c90e]" />
                        <p className="text-[9px] text-slate-400">Arrastra tu archivo aquí o <span className="text-[#a3c90e] hover:underline">explora archivos</span></p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setIneBack, setIneBackName)}
                          className="opacity-0 absolute w-0 h-0" 
                          id="input-ine-back"
                        />
                        <button 
                          type="button"
                          onClick={() => document.getElementById('input-ine-back')?.click()}
                          className="text-[8px] bg-[#a3c90e]/10 text-[#a3c90e] hover:bg-[#a3c90e]/20 border border-[#a3c90e]/20 px-2 py-0.5 rounded"
                        >
                          Seleccionar Foto
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. PROOF OF ADDRESS */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-400">3. Comprobante de Domicilio (Agua/Luz - Máx 3 Meses)</span>
                  <div 
                    onDragEnter={(e) => handleDrag(e, setDragActiveProof)}
                    onDragOver={(e) => handleDrag(e, setDragActiveProof)}
                    onDragLeave={(e) => handleDrag(e, setDragActiveProof)}
                    onDrop={(e) => handleDrop(e, setDragActiveProof, setProofOfAddress, setProofName)}
                    className={`border-2 border-dashed rounded-xl p-3 text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-950/45 min-h-[90px] ${
                      dragActiveProof ? 'border-[#a3c90e] bg-[#a3c90e]/5' : proofOfAddress ? 'border-emerald-500/60' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {proofOfAddress ? (
                      <div className="flex items-center gap-2 justify-between w-full px-2">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold truncate max-w-[85%]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{proofName || "comprobante_domicilio.png"}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={(o) => { o.stopPropagation(); setProofOfAddress(''); setProofName(''); }}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition"
                          title="Remover documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-[#a3c90e]" />
                        <p className="text-[9px] text-slate-400">Arrastra tu archivo aquí o <span className="text-[#a3c90e] hover:underline">explora archivos</span></p>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setProofOfAddress, setProofName)}
                          className="opacity-0 absolute w-0 h-0" 
                          id="input-proof"
                        />
                        <button 
                          type="button"
                          onClick={() => document.getElementById('input-proof')?.click()}
                          className="text-[8px] bg-[#a3c90e]/10 text-[#a3c90e] hover:bg-[#a3c90e]/20 border border-[#a3c90e]/20 px-2 py-0.5 rounded"
                        >
                          Seleccionar Foto
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-indigo-600 to-[#a3c90e] hover:from-indigo-500 hover:to-[#b6e012] text-slate-950 font-black tracking-tight uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-xs shadow-md shadow-indigo-650/10 active:scale-95 text-center font-bold text-[11px]"
              >
                <Send className="w-4 h-4" />
                Subir Expediente y Solicitar Comisión
              </button>
            </form>
          </div>
        </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW B: INTEGRATED NOTIFICATION & STATUS PANEL (FOR ACTIVE SUBMITTER) */}
        {/* ==================================================================== */}
        {currentUser === 'cliente_esperanza' && (
          <div className="xl:col-span-6 space-y-6">
          
          {/* CLIENT NOTIFICATIONS & PROGRESS FEEDBACK */}
          {clientOwnDossier ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Bell className="w-5 h-5 text-[#a3c90e] animate-bounce" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Estado de tu Expediente: {clientOwnDossier.id}</h3>
                    <p className="text-[9px] font-mono text-slate-400">Monitoreo de Verificación en Tiempo Real</p>
                  </div>
                </div>
                
                {/* Instant Sim Button */}
                {clientOwnDossier.status === 'ANALIZANDO' && (
                  <button
                    onClick={() => handleSimulateInstantAccept(clientOwnDossier)}
                    className="px-2.5 py-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-md hover:bg-emerald-500/20 active:scale-95 transition"
                    title="Aprobación inmediata sin esperar interacción del dashboard admin"
                  >
                    Simular Aceptación Admin
                  </button>
                )}
              </div>

              {/* Status Indicator Panel */}
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
                
                {/* 1. STATUS: ANALIZANDO (IN_REVIEW) */}
                {clientOwnDossier.status === 'ANALIZANDO' && (
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-center shrink-0">
                        <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block">PROCESANDO VERIFICACIÓN</span>
                        <h4 className="text-sm font-bold text-white">Préstamo bajo revisión del Comité de Crédito</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          Tu expediente está <strong className="text-white">siendo analizado</strong> por Inteligencia de Buró. El Administrador verificará la autenticidad del comprobante de domicilio e identificación antes de autorizar los fondos.
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress tracking points */}
                    <div className="pt-2 border-t border-slate-850 grid grid-cols-3 gap-2 text-center text-[9px] font-mono font-bold">
                      <div className="space-y-1 p-2 bg-slate-900/40 rounded-lg">
                        <div className="text-[#a3c90e]">Hito 1: Registrado</div>
                        <div className="text-[8px] text-slate-500">Completado ✓</div>
                      </div>
                      <div className="space-y-1 p-2 bg-slate-900/40 rounded-lg border border-amber-500/20">
                        <div className="text-amber-400 animate-pulse">Hito 2: Cotejo</div>
                        <div className="text-[8px] text-amber-500 animate-pulse">Analizando...</div>
                      </div>
                      <div className="space-y-1 p-2 bg-slate-900/40 rounded-lg opacity-40">
                        <div className="text-slate-400">Hito 3: Desembolso</div>
                        <div className="text-[8px] text-slate-500">Pendiente</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-slate-400 text-center leading-relaxed font-sans">
                      ⚠️ <strong className="text-slate-300">Aviso importante:</strong> Favor de mantener su sesión activa. La respuesta del admin se sincronizará automáticamente.
                    </div>
                  </div>
                )}

                {/* 2. STATUS: APROBADO */}
                {clientOwnDossier.status === 'APROBADO' && (
                  <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest block">¡CRÉDITO AUTORIZADO!</span>
                        <h4 className="text-sm font-black text-white">Felicidades, tu préstamo ha sido aprobado</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          El Administrador cotejó exitosamente sus comprobantes e identificaciones y procedió a la <strong className="text-[#a3c90e]">aprobación definitiva</strong> de la cantidad solicitada.
                        </p>
                      </div>
                    </div>

                    {/* Financial details panel */}
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 divide-x divide-slate-800 font-mono text-[10px]">
                      <div className="space-y-1 text-left">
                        <span className="text-slate-500 block uppercase">Cantidad Otorgada:</span>
                        <span className="text-[#a3c90e] text-base font-black">{formatMXN(clientOwnDossier.requestedAmount)}</span>
                      </div>
                      <div className="space-y-1 pl-4 text-left">
                        <span className="text-slate-500 block uppercase">Estatus Cartera:</span>
                        <span className="text-emerald-400 font-extrabold text-xs uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25 inline-block mt-0.5">Activo ✓</span>
                      </div>
                    </div>

                    {clientOwnDossier.adminNotes && (
                      <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg text-left">
                        <span className="text-[8px] uppercase font-mono text-slate-500 block">Comentarios del Comité:</span>
                        <p className="text-[10px] text-slate-300 italic">"{clientOwnDossier.adminNotes}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. STATUS: RECHAZADO */}
                {clientOwnDossier.status === 'RECHAZADO' && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center justify-center shrink-0">
                        <XCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest block">EXPEDIENTE DENEGADO</span>
                        <h4 className="text-sm font-bold text-white">Solicitud Rechazada por el Administrador</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          El comité ha rechazado este crédito. La documentación enviada cargó con inconsistencias o falsificaciones. Puede intentar subir un nuevo recibo u otra identificación válida.
                        </p>
                      </div>
                    </div>

                    {clientOwnDossier.adminNotes && (
                      <div className="p-2.5 bg-red-950/10 border border-red-500/15 rounded-lg text-left">
                        <span className="text-[8px] uppercase font-mono text-red-400 block">Razón del Rechazo:</span>
                        <p className="text-[10px] text-red-350 italic text-slate-300">"{clientOwnDossier.adminNotes}"</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
              
              {/* Detailed Client Info display */}
              <div className="p-3 bg-slate-900/60 rounded-2xl space-y-2 text-xs divide-y divide-slate-800/60">
                <div className="flex justify-between py-1 font-mono text-[10px]">
                  <span className="text-slate-500 uppercase">Domicilio:</span>
                  <span className="text-slate-300 font-sans">{clientOwnDossier.address}</span>
                </div>
                <div className="flex justify-between py-1 font-mono text-[10px]">
                  <span className="text-slate-500 uppercase">Fecha Nacimiento:</span>
                  <span className="text-slate-300">{clientOwnDossier.birthDate}</span>
                </div>
                <div className="flex justify-between py-1 pt-1.5 font-mono text-[10px]">
                  <span className="text-slate-500 uppercase">Documentos:</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewingDocumentUrl({ url: clientOwnDossier.ineFront, title: 'Identificación Oficial Frente' })}
                      className="text-[#a3c90e] hover:underline"
                    >
                      INE Frente
                    </button>
                    <button 
                      onClick={() => setViewingDocumentUrl({ url: clientOwnDossier.ineBack, title: 'Identificación Oficial Vuelta' })}
                      className="text-[#a3c90e] hover:underline"
                    >
                      INE Vuelta
                    </button>
                    <button 
                      onClick={() => setViewingDocumentUrl({ url: clientOwnDossier.proofOfAddress, title: 'Comprobante Domicilio' })}
                      className="text-[#a3c90e] hover:underline"
                    >
                      Comprobante
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-700 mx-auto block animate-pulse" />
              <h3 className="text-sm font-bold text-white">No tienes expedientes activos</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Rellena la solicitud a la izquierda para poder capturar tu información de crédito obligatoria y recibir una notificación instantánea aquí sobre tu estado.
              </p>
            </div>
          )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW C: ADMIN COTEJAR GENERAL PANEL (Solo para administradores o asesores) */}
        {/* ==================================================================== */}
        {(currentUser === 'admin_harold' || currentUser === 'asesor_juan') && (
          <div className="xl:col-span-12 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-[#a3c90e]" />
                    Consola del Administrador: Cotejo del Expedientes
                  </h3>
                  <p className="text-[9px] text-slate-400">Total presentados por la plataforma: {dossiers.length}</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded text-[8px] font-mono font-bold">
                  SINC REMOTO OK
                </span>
              </div>

              {/* Dossiers Selection List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {dossiers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 font-mono text-[10px]">
                    <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-700" />
                    No hay solicitudes registradas de momento.
                  </div>
                ) : (
                  dossiers.map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDossierId(d.id);
                        setAdminNotes(d.adminNotes || '');
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 cursor-pointer ${
                        (activeAdminDossier?.id === d.id)
                          ? 'bg-slate-950 border-[#a3c90e] shadow-lg shadow-[#a3c90e]/5'
                          : 'bg-slate-950/45 border-slate-850 hover:bg-slate-950/85'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[8px] font-black text-indigo-400">{d.id} • {d.createdAt}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold ${
                          d.status === 'ANALIZANDO' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' :
                          d.status === 'APROBADO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                          'bg-red-500/10 text-red-400 border border-red-500/15'
                        }`}>
                          {d.status === 'ANALIZANDO' ? 'POR COTEJAR' : d.status === 'APROBADO' ? 'APROBADO ✓' : 'RECHAZADO ✗'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-0.5">
                        <h4 className="text-[11px] font-black text-white">{d.clientName}</h4>
                        <span className="text-white font-extrabold text-[11px] font-mono">{formatMXN(d.requestedAmount)}</span>
                      </div>
                      
                      <p className="text-[9px] text-slate-400 truncate mt-0.5">Dir: {d.address}</p>
                    </button>
                  ))
                )}
              </div>

              {/* Active Admin Review Workspace Details */}
              {activeAdminDossier && (
                <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start flex-wrap gap-2 border-b border-slate-850 pb-2">
                    <div className="text-left">
                      <span className="text-[8px] font-mono font-black text-[#a3c90e] block">EXPEDIENTE SELECCIONADO: {activeAdminDossier.id}</span>
                      <h4 className="text-xs font-black text-white">{activeAdminDossier.clientName}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono">
                    <div className="space-y-1 bg-slate-900 border border-slate-850/60 p-2.5 rounded-xl">
                      <span className="text-slate-500 uppercase font-black block text-[8px]">Datos Generales:</span>
                      <p className="text-slate-300 font-sans"><strong className="text-white">Nacimiento:</strong> {activeAdminDossier.birthDate}</p>
                      <p className="text-slate-300 font-sans leading-tight mt-0.5"><strong className="text-white">Dirección:</strong> {activeAdminDossier.address}</p>
                    </div>

                    <div className="space-y-1 bg-slate-900 border border-slate-850/60 p-2.5 rounded-xl text-left">
                      <span className="text-slate-500 uppercase font-black block text-[8px]">Monto del Préstamo:</span>
                      <p className="text-[#a3c90e] text-sm font-black mt-1">{formatMXN(activeAdminDossier.requestedAmount)}</p>
                      {activeAdminDossier.loanType && (
                        <div className="mt-1 pt-1 border-t border-slate-800">
                          <span className="text-[10px] text-indigo-400 font-bold block">{activeAdminDossier.loanType}</span>
                          {activeAdminDossier.monthlyPlan && (
                            <span className="text-[9px] text-slate-400 block font-sans italic max-w-xs">{activeAdminDossier.monthlyPlan}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Previews Links Row */}
                  <div className="space-y-1 text-[10px] font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 uppercase font-black block text-[8px]">Cotejo Visual de Evidencias (Documentos Recabados):</span>
                    <div className="flex gap-2 pt-1 font-bold flex-wrap">
                      <button 
                        onClick={() => setViewingDocumentUrl({ url: activeAdminDossier.ineFront, title: 'INE Frente de ' + activeAdminDossier.clientName })}
                        className="bg-slate-950/80 border border-indigo-500/20 text-[#a3c90e] hover:text-[#b6e012] px-2 py-1 rounded transition flex items-center gap-1 text-[9px]"
                      >
                        <Eye className="w-3 h-3 text-[#a3c90e]" />
                        INE Frente
                      </button>
                      <button 
                        onClick={() => setViewingDocumentUrl({ url: activeAdminDossier.ineBack, title: 'INE Reverso de ' + activeAdminDossier.clientName })}
                        className="bg-slate-950/80 border border-indigo-500/20 text-[#a3c90e] hover:text-[#b6e012] px-2 py-1 rounded transition flex items-center gap-1 text-[9px]"
                      >
                        <Eye className="w-3 h-3 text-[#a3c90e]" />
                        INE Reverso
                      </button>
                      <button 
                        onClick={() => setViewingDocumentUrl({ url: activeAdminDossier.proofOfAddress, title: 'Comprobante de ' + activeAdminDossier.clientName })}
                        className="bg-slate-950/80 border border-indigo-500/20 text-[#a3c90e] hover:text-[#b6e012] px-2 py-1 rounded transition flex items-center gap-1 text-[9px]"
                      >
                        <Eye className="w-3 h-3 text-[#a3c90e]" />
                        Comprobante
                      </button>
                    </div>
                  </div>

                  {/* Input for admin decision comments */}
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-mono uppercase font-black text-slate-400">Comentarios para el Cliente / Razón de rechazo:</label>
                    <textarea
                      placeholder="Escribe alguna acotación respecto al estatus, ej. Expediente completo, documentación fidedigna cotejada."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full bg-slate-900 text-slate-100 placeholder-slate-600 font-sans text-[11px] px-3 py-2 rounded-xl border border-slate-800 focus:border-[#a3c90e]/75 focus:ring-0 outline-none transition h-16 resize-none"
                    />
                  </div>

                  {/* Approval Actions Panel */}
                  {activeAdminDossier.status === 'ANALIZANDO' ? (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        onClick={() => handleAdminApprove(activeAdminDossier)}
                        className="py-2.5 text-[10px] font-bold uppercase font-mono tracking-tight text-slate-950 bg-emerald-400 hover:bg-emerald-350 active:scale-95 transition-all rounded-xl cursor-pointer shadow flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aprobar y Desembolsar
                      </button>
                      <button
                        onClick={() => handleAdminReject(activeAdminDossier.id)}
                        className="py-2.5 text-[10px] font-bold uppercase font-mono tracking-tight text-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-xl cursor-pointer shadow flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rechazar Solicitud
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center font-mono text-[9px] text-slate-400">
                      Esta solicitud ya fue procesada: Estatus <strong className={activeAdminDossier.status === 'APROBADO' ? 'text-emerald-400' : 'text-red-400'}>{activeAdminDossier.status}</strong>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* DOCUMENT REVIEW LIGHTBOX / MODAL */}
      {viewingDocumentUrl && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-slate-850 pb-2.5 text-left">
              <h3 className="text-xs font-mono font-black uppercase text-[#a3c90e]">{viewingDocumentUrl.title}</h3>
              <button 
                onClick={() => setViewingDocumentUrl(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl overflow-hidden p-1 flex items-center justify-center min-h-[220px]">
              {viewingDocumentUrl.url.startsWith('https://') ? (
                <img 
                  src={viewingDocumentUrl.url} 
                  alt="Documento" 
                  className="max-h-[350px] w-auto object-contain rounded-xl shadow"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <img 
                  src={viewingDocumentUrl.url} 
                  alt="Documento subido" 
                  className="max-h-[350px] w-auto object-contain rounded-xl shadow"
                />
              )}
            </div>

            <p className="text-[9px] font-mono text-slate-500 text-center uppercase tracking-wide">
              Módulo de Privacidad y Consentimiento de Datos Seguros Activo
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
