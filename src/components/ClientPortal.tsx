import React, { useState, useRef, useEffect } from 'react';
import { 
  DollarSign, Camera, Upload, CheckCircle2, AlertCircle, 
  ArrowRight, Smartphone, RefreshCw, User, Calendar, 
  ChevronDown, FileImage, Check, FileCheck2, X, Image as ImageIcon
} from 'lucide-react';
import { Client, ClientPayment } from '../types';

interface ClientPortalProps {
  clients: Client[];
  onRegisterPayment: (payment: ClientPayment) => void;
  activeClientPayment?: ClientPayment | null;
}

// Pre-designed mockup receipt URLs
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
  onRegisterPayment 
}) => {
  // Filter clients who have pending balances, default to the first one
  const clientsWithBalance = clients.filter(c => c.balanceOwed > 0);
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    const hasEsperanza = clients.some(c => c.id === 'PM-327072' && c.balanceOwed > 0);
    if (hasEsperanza) return 'PM-327072';
    return clientsWithBalance[0]?.id || clients[0]?.id || '';
  });
  
  const activeClient = clients.find(c => c.id === selectedClientId);

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  
  // Camera & Image states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);

  // Success flow
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [justSubmittedId, setJustSubmittedId] = useState<string | null>(null);

  // Camera references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clear inputs when selected client changes
  useEffect(() => {
    if (activeClient) {
      setAmount(Math.min(activeClient.balanceOwed, 25000).toString());
      setReference(activeClient.id); // Defaulting reference to the UNIFIED registration number (ID)!
      setCapturedImage(null);
      setUploadedFileName(null);
      setSelectedTemplateIndex(null);
      setJustSubmittedId(null);
    }
  }, [selectedClientId, activeClient]);

  // Launch camera
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
      // Fallback message handled in UI
    }
  };

  // Capture screen frame from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add watermarks or time details on captured visual frame like a real app
        ctx.fillStyle = '#a3c90e';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('PRÉSTAMOS MARÍN - DIGITAL VOUCHER', 20, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Courier';
        ctx.fillText(`FECHA: ${new Date().toLocaleString()}`, 20, 60);
        ctx.fillText(`CLIENTE ID: ${selectedClientId}`, 20, 80);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Turn off camera stream
  const stopCamera = () => {
    setIsCameraActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Keep stream clean on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle manual image file uploading
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

  // select pre-made high fidelity evidence template
  const selectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    setUploadedFileName(null);
    stopCamera();
    
    // Generate a unique reference based on selection
    const tmpl = MOCK_RECEIPT_TEMPLATES[index];
    setReference(activeClient ? activeClient.id : `${tmpl.refPrefix}-${Math.floor(100000 + Math.random() * 900000)}`);
    setCapturedImage(tmpl.img);
  };

  // Handle Form Submission
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#a3c90e]/5 rounded-full blur-3xl animate-pulse" />
        
        <div>
          <span className="text-[10px] font-mono font-black text-[#a3c90e] uppercase tracking-widest block">PORTAL AUTOSERVICIO CLIENTE</span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
            <Smartphone className="w-5 h-5 text-[#a3c90e]" />
            Registrar Abono y Evidencias de Pago
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-2xl">
            Desde este portal, los clientes de <strong>Salda App</strong> pueden reportar un depósito bancario, transferencia o pago en efectivo. 
            Es requisito cargar una fotografía legible o captura de pantalla como evidencia que el equipo administrativo validará en tiempo real.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Left Side: Client Selector & Account Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#a3c90e] uppercase tracking-wider">
              1. Seleccionar Identidad del Cliente
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Clientes Activos con Deuda:</label>
                <div className="relative">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-[#a3c90e] appearance-none cursor-pointer pr-10"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id}) — Saldo: {formatMXN(c.balanceOwed)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {activeClient && (
                <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-850 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0a3a46] border border-[#a3c90e]/30 flex items-center justify-center font-bold text-white text-sm">
                      {activeClient.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{activeClient.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{activeClient.rfc}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-2.5 space-y-1.5 text-[11px] font-mono leading-relaxed">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total Otorgado:</span>
                      <span className="text-white font-bold">{formatMXN(activeClient.totalCreditGranted)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Saldo Pendiente:</span>
                      <span className="text-amber-400 font-extrabold">{formatMXN(activeClient.balanceOwed)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Estado de Buró:</span>
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
                        <span className="text-red-450 text-red-400">Días de Atraso:</span>
                        <span className="bg-red-500/10 text-red-400 font-black px-1 rounded text-[10px]">
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

        {/* Right Side: Payment Form & Evidence Upload */}
        <div className="lg:col-span-8">
          {justSubmittedId ? (
            /* Submission success screen */
            <div className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-505/35 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">¡Abono Registrado y Enviado correctamente!</h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-normal">
                  Se ha generado la ficha de validación de pago <strong className="font-mono text-[#a3c90e]">{justSubmittedId}</strong>. 
                  El pago ahora aparece con estatus <span className="bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded font-mono text-[10px]">PENDIENTE</span> en la bandeja del equipo de Finanzas.
                </p>
              </div>

              {capturedImage && (
                <div className="max-w-xs mx-auto border border-slate-850 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-950 p-2 text-[9px] font-mono text-slate-400 flex justify-between border-b border-slate-850">
                    <span>Ficha de Evidencia</span>
                    <span className="text-emerald-400 font-bold">Registrada ✓</span>
                  </div>
                  <img src={capturedImage} alt="Evidencia de Pago" className="w-full h-40 object-cover opacity-80" />
                </div>
              )}

              <div className="border-t border-slate-850 pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setJustSubmittedId(null)}
                  className="bg-[#a3c90e] text-slate-950 hover:bg-[#acd113] active:scale-95 transition-all font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  Regresar a registrar otro abono
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Main interactive form card */
            <form onSubmit={handleSubmitPayment} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
              <div className="border-b border-slate-850 pb-3">
                <h3 className="text-xs font-mono font-bold text-[#a3c90e] uppercase tracking-wider">
                  2. Datos del Depósito y Comprobante
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Captura la cantidad de este abono y adjunta el comprobante.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Monto a Reportar ($ MXN):</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-[#a3c90e] absolute left-3 top-3" />
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        max={activeClient ? activeClient.balanceOwed : 999999}
                        placeholder="Ej. 15000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#a3c90e] font-mono text-lg font-bold"
                      />
                    </div>
                    {activeClient && (
                      <p className="text-[9px] text-slate-500 mt-1 font-mono">
                        Monto máximo de abono permitido: <strong className="text-slate-350">{formatMXN(activeClient.balanceOwed)}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Folio de Referencia Bancaria (Opcional):</label>
                    <input
                      type="text"
                      placeholder="Ej. SPEI8890123"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#a3c90e] font-mono"
                    />
                    {activeClient && reference === activeClient.id && (
                      <div className="mt-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-[9px] font-mono text-emerald-400 leading-normal animate-pulse">
                        ⚡ VINCULACIÓN UNIFICADA DETECTADA: Tu referencia de pago coincide con tu número de registro unificado <strong className="font-bold">{activeClient.id}</strong>. Al aprobarse, el abono se liquidará automáticamente de tu préstamo.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Notas / Concepto de Abono:</label>
                    <textarea
                      rows={2}
                      placeholder="Indique si es pago mensual, liquidación, o abono a capital..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#a3c90e]"
                    />
                  </div>
                </div>

                {/* Evidence fields */}
                <div className="space-y-3 bg-slate-950 rounded-xl p-4 border border-slate-850 flex flex-col justify-between">
                  <div>
                    <span className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Captura de Evidencia Fotográfica:</span>
                    <p className="text-[9px] text-slate-400 mb-3 block leading-snug">
                      Toma una foto con tu dispositivo, sube un archivo o selecciona una plantilla realista de ejemplo para simularla.
                    </p>

                    {/* Pre-made Template Selector */}
                    <div className="space-y-1.5 mb-3">
                      <span className="text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Atajos Rápidos de Voucher Demo:</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {MOCK_RECEIPT_TEMPLATES.map((tmpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => selectTemplate(idx)}
                            className={`px-2 py-1.5 rounded-lg border text-[9px] font-mono font-medium flex items-center justify-between transition cursor-pointer text-left ${
                              selectedTemplateIndex === idx
                                ? 'bg-[#a3c90e]/10 border-[#a3c90e] text-[#a3c90e]'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span>{tmpl.name}</span>
                            {selectedTemplateIndex === idx ? (
                              <Check className="w-3 h-3 text-[#a3c90e]" />
                            ) : (
                              <span className="text-[8px] bg-slate-950 text-slate-500 px-1 py-0.1 rounded">Usar</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Camera view or placeholder */}
                  <div className="relative border border-dashed border-slate-800 rounded-xl bg-slate-900/60 p-2 flex flex-col items-center justify-center min-h-[140px] overflow-hidden">
                    {isCameraActive ? (
                      /* Live Camera Screen */
                      <div className="w-full flex flex-col items-center gap-2">
                        <video 
                          ref={videoRef} 
                          className="w-full h-28 object-cover rounded-lg bg-black"
                          playsInline 
                          muted 
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded text-[9px] uppercase hover:scale-105 active:scale-95 transition"
                          >
                            Tomar foto
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-3 py-1 rounded text-[9px] uppercase hover:bg-red-500/20 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : capturedImage ? (
                      /* Captured Evidence Preview */
                      <div className="relative w-full h-full group">
                        <img 
                          src={capturedImage} 
                          alt="Evidence preview" 
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
                            className="bg-red-500 text-white rounded-lg p-2 text-xs font-semibold flex items-center gap-1 hover:bg-red-450 active:scale-95 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Eliminar Comprobante
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
                      /* Actions to acquire image */
                      <div className="text-center p-3 space-y-2">
                        <ImageIcon className="w-8 h-8 text-slate-650 text-slate-600 block mx-auto" />
                        <div className="flex flex-wrap gap-2 justify-center">
                          {/* Live webcam button */}
                          <button
                            type="button"
                            onClick={startCamera}
                            className="bg-[#a3c90e] hover:bg-[#acd113] text-slate-950 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow transition cursor-pointer active:scale-95"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Capturar Foto URL
                          </button>

                          {/* File input */}
                          <label className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition active:scale-95">
                            <Upload className="w-3.5 h-3.5 text-slate-400" />
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

              {/* Submitting button container */}
              <div className="border-t border-slate-850 pt-4 flex justify-between items-center flex-wrap gap-3">
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>La evidencia fotográfica se asocia a tu clave RFC de forma segura.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !amount}
                  className="bg-[#a3c90e] text-slate-950 hover:bg-[#acd113] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-[#a3c90e]/10 ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Registrando abono...
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      Enviar Registro de Pago
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Hidden camera snapshot canvas container */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
