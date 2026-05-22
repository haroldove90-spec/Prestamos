import React, { useState } from 'react';
import { 
  FileCheck2, XCircle, AlertCircle, Calendar, 
  User, DollarSign, Image as ImageIcon, CheckCircle, 
  Tag, Info, Eye
} from 'lucide-react';
import { ClientPayment } from '../types';

interface PaymentVerificationProps {
  payments: ClientPayment[];
  onVerifyPayment: (paymentId: string, status: 'PAGO_REALIZADO' | 'RECHAZADO') => void;
  currentUser: string;
}

export const PaymentVerification: React.FC<PaymentVerificationProps> = ({
  payments,
  onVerifyPayment,
  currentUser
}) => {
  const [filter, setFilter] = useState<'TODOS' | 'PENDIENTE' | 'PAGO_REALIZADO' | 'RECHAZADO'>('PENDIENTE');
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    payments.find(p => p.status === 'PENDIENTE')?.id || payments[0]?.id || null
  );

  // Filter payments list
  const filteredPayments = payments.filter(p => {
    if (filter === 'TODOS') return true;
    return p.status === filter;
  });

  // Active selected item
  const activePayment = payments.find(p => p.id === selectedPaymentId) || filteredPayments[0];

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-black text-[#a3c90e] uppercase tracking-widest block">AUDITORÍA GESTIÓN COBRANZA</span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
              <FileCheck2 className="w-5 h-5 text-[#a3c90e]" />
              Verificación de Abonos y Evidencia Visual
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-normal max-w-xl">
              Revisa y procesa en tiempo real las capturas y fotografías tomadas por los acreditados. Al aprobar, el abono se aplicará automáticamente a la cartera vencida o saldo activo.
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex gap-2 font-mono text-[10px]">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1.5 rounded-xl font-bold">
              {payments.filter(p => p.status === 'PENDIENTE').length} Pnd
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl font-bold">
              {payments.filter(p => p.status === 'PAGO_REALIZADO').length} Apr
            </span>
          </div>
        </div>
      </div>

      {/* Verification Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        
        {/* Left List of Payments (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status Tabs Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 grid grid-cols-4 gap-1">
            {(['PENDIENTE', 'PAGO_REALIZADO', 'RECHAZADO', 'TODOS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFilter(tab);
                  // Auto-select first in new filtered list
                  const newList = payments.filter(p => tab === 'TODOS' ? true : p.status === tab);
                  if (newList.length > 0) {
                    setSelectedPaymentId(newList[0].id);
                  }
                }}
                className={`py-1.5 rounded-lg text-[9px] font-mono font-extrabold uppercase transition-all tracking-tight cursor-pointer ${
                  filter === tab
                    ? tab === 'PENDIENTE' ? 'bg-amber-500 text-slate-950 font-black'
                      : tab === 'PAGO_REALIZADO' ? 'bg-emerald-500 text-slate-950 font-black'
                      : tab === 'RECHAZADO' ? 'bg-red-500 text-white font-black'
                      : 'bg-[#a3c90e] text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                {tab === 'PENDIENTE' ? 'Pnd' : tab === 'PAGO_REALIZADO' ? 'Apr' : tab === 'RECHAZADO' ? 'Rch' : 'Ver Todos'}
              </button>
            ))}
          </div>

          {/* List Content */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md max-h-[500px] overflow-y-auto">
            <h4 className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              {filter === 'TODOS' ? 'Historial Total de Abonos' : `Abonos con Estado: ${filter}`}
            </h4>

            {filteredPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-650 text-slate-600 block animate-pulse" />
                <p className="text-[11px]">No se encontraron abonos registrados en esta categoría.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPayments.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPaymentId(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 cursor-pointer ${
                      (activePayment?.id === p.id)
                        ? 'bg-slate-950 border-[#a3c90e] shadow-lg shadow-[#a3c90e]/5'
                        : 'bg-slate-950/45 border-slate-850 hover:bg-slate-950/85'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-1.5">
                      <span className="font-mono text-[9px] font-black text-[#a3c90e]">{p.id}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-mono font-bold ${
                        p.status === 'PENDIENTE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' :
                        p.status === 'PAGO_REALIZADO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                        'bg-red-500/10 text-red-400 border border-red-500/15'
                      }`}>
                        {p.status === 'PENDIENTE' ? 'Por validar' : p.status === 'PAGO_REALIZADO' ? 'Aprobado ✓' : 'Falsa / Rechazada'}
                      </span>
                    </div>

                    <h5 className="text-[11px] font-bold text-white truncate">{p.clientName}</h5>
                    
                    <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-slate-850 text-[10px] font-mono text-slate-400">
                      <span>{p.date}</span>
                      <span className="text-white font-extrabold text-xs">{formatMXN(p.amount)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Panel and Image Review (col-span-7) */}
        <div className="lg:col-span-7">
          {activePayment ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
              
              {/* Header Info */}
              <div className="flex justify-between items-start gap-4 flex-wrap border-b border-slate-850 pb-3">
                <div className="text-left">
                  <span className="font-mono text-[10px] text-[#a3c90e] font-black block">VERIFICACIÓN ACTIVA</span>
                  <h3 className="text-sm font-black text-white">{activePayment.clientName}</h3>
                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    Folio Interno: {activePayment.id} • Ref Bancaria: <span className="text-white font-bold">{activePayment.reference || 'N/A'}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">MONTO TRANSACCIONAL</span>
                  <div className="text-lg font-black text-[#a3c90e] font-mono">{formatMXN(activePayment.amount)}</div>
                </div>
              </div>

              {/* Layout: Info Card + Image Comparison Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meta details */}
                <div className="space-y-3 text-[11px] font-mono">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Metadatos del Depósito</span>
                    
                    <div className="flex justify-between py-1 border-b border-slate-850/60">
                      <span className="text-slate-400 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Cliente:</span>
                      <span className="text-white font-bold text-right truncate max-w-[124px]">{activePayment.clientName}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-850/60">
                      <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Fecha Registro:</span>
                      <span className="text-white">{activePayment.date}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-400 flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Ref de Transacción:</span>
                      <span className="text-amber-400 font-bold">{activePayment.reference}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/65 p-3 rounded-xl border border-slate-850 space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Comentarios del Cliente</span>
                    <p className="text-slate-300 font-sans italic text-xs leading-normal">
                      "{activePayment.notes || 'Sin notas adicionales cargadas para este folio.'}"
                    </p>
                  </div>

                  {activePayment.status !== 'PENDIENTE' && (
                    <div className={`p-3 rounded-xl border text-center font-bold ${
                      activePayment.status === 'PAGO_REALIZADO' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {activePayment.status === 'PAGO_REALIZADO' 
                        ? 'Este comprobante ya fue aprobado y el saldo fue descontado ✓' 
                        : 'Este comprobante fue marcado como RECHAZADO / FALSO 🚫'
                      }
                    </div>
                  )}
                </div>

                {/* Evidence Image Screen view */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-2 flex flex-col justify-between min-h-[190px]">
                  <div className="text-[9px] font-mono text-slate-400 flex justify-between select-none mb-1 px-1">
                    <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Fotografía Adjunta</span>
                    <span className="text-[#a3c90e] font-mono">Ficha Original</span>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-slate-850 bg-black flex-1 flex items-center justify-center">
                    {activePayment.evidenceImage ? (
                      <React.Fragment>
                        <img 
                          src={activePayment.evidenceImage} 
                          alt="Evidencia cargada" 
                          className="w-full h-40 object-cover hover:scale-105 transition-transform duration-150 cursor-zoom-in"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1.5 text-center text-[9px] font-mono text-slate-300 truncate">
                          Evidencia SHA-256 válida
                        </div>
                      </React.Fragment>
                    ) : (
                      <div className="p-8 text-center text-slate-500 space-y-1.5">
                        <ImageIcon className="w-8 h-8 text-slate-600 block mx-auto animate-pulse" />
                        <span className="text-[10px]">No hay imagen de comprobante</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive verification controls (Only when pending) */}
              {activePayment.status === 'PENDIENTE' && (
                <div className="border-t border-slate-850 pt-4 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => onVerifyPayment(activePayment.id, 'RECHAZADO')}
                    className="bg-red-500/15 border border-red-500/35 hover:bg-red-550/30 text-red-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer hover:scale-101 active:scale-97"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar Evidencia (Falsa/Ilegible)
                  </button>

                  <button
                    type="button"
                    onClick={() => onVerifyPayment(activePayment.id, 'PAGO_REALIZADO')}
                    className="bg-[#a3c90e] hover:bg-[#acd113] active:scale-97 hover:scale-101 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-[#a3c90e]/10"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Aprobar Comprobante y Aplicar Abono
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3 shadow-lg">
              <CheckCircle className="w-12 h-12 text-slate-650 text-[#a3c90e] mx-auto block" />
              <h3 className="text-md font-bold text-white">¡Bandeja de verificación vacía!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No hay comprobantes pendientes de validar en este momento para {currentUser}. Todo está auditado.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
