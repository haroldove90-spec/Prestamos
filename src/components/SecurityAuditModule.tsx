import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, Smartphone, User, Clock, 
  AlertTriangle, RefreshCw, Eye, CheckCircle, Ban, 
  Trash2, Send, FileText, ChevronRight, Activity, ShieldQuestion
} from 'lucide-react';

export interface SecurityIncident {
  id: string;
  timestamp: string;
  device: string;
  user: string;
  actionBlocked: string;
  targetClient: string;
  status: 'PENDIENTE' | 'RESUELTO_LEVANTADO' | 'RESUELTO_PENALIZADO';
  notes?: string;
}

interface SecurityAuditModuleProps {
  incidents: SecurityIncident[];
  isAsesorSuspended: boolean;
  onResolveIncident: (incidentId: string, action: 'LEVANTAR' | 'PENALIZAR' | 'DESESTIMAR', notes: string) => void;
  onClearLogs?: () => void;
  onTriggerMockIncident?: () => void;
}

export const SecurityAuditModule: React.FC<SecurityAuditModuleProps> = ({
  incidents,
  isAsesorSuspended,
  onResolveIncident,
  onClearLogs,
  onTriggerMockIncident
}) => {
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [activeIncidentTab, setActiveIncidentTab] = useState<'all' | 'pending' | 'resolved'>('all');

  // Auto-select first incident if none selected
  React.useEffect(() => {
    if (incidents.length > 0 && !selectedIncident) {
      setSelectedIncident(incidents[0]);
    }
  }, [incidents, selectedIncident]);

  const filteredIncidents = incidents.filter(idx => {
    if (activeIncidentTab === 'pending') return idx.status === 'PENDIENTE';
    if (activeIncidentTab === 'resolved') return idx.status !== 'PENDIENTE';
    return true;
  });

  const getStatusBadge = (status: SecurityIncident['status']) => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="bg-rose-500/10 text-rose-455 border border-rose-500/25 px-2 py-0.5 rounded text-[10px] font-mono font-bold animate-pulse text-rose-400">
            🚨 ALERTA ACTIVA
          </span>
        );
      case 'RESUELTO_LEVANTADO':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
            ✓ SUSPENSIÓN LEVANTADA
          </span>
        );
      case 'RESUELTO_PENALIZADO':
        return (
          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
            🚫 BLOQUEO MANTENIDO (RH)
          </span>
        );
      default:
        return null;
    }
  };

  const handleResolveAction = (action: 'LEVANTAR' | 'PENALIZAR' | 'DESESTIMAR') => {
    if (!selectedIncident) return;
    const finalNotes = resolutionNotes.trim() || `Resolución aplicada por el Administrador Harold Salazar. Acción: ${action}`;
    onResolveIncident(selectedIncident.id, action, finalNotes);
    setResolutionNotes('');
    
    // Refresh selected item from parameters
    const updated = { ...selectedIncident, status: action === 'LEVANTAR' || action === 'DESESTIMAR' ? 'RESUELTO_LEVANTADO' as const : 'RESUELTO_PENALIZADO' as const, notes: finalNotes };
    setSelectedIncident(updated);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="flex border-b border-slate-800 pb-4 mb-5 items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Módulo de Auditoría & Cyber-Seguridad
            </h2>
            <p className="text-xs text-slate-400">
              Monitoreo perimetral e incidentes internos en tiempo real. Análisis forense de intentos de bypass de riesgo según regulaciones de la CNBV.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isAsesorSuspended 
                ? 'bg-rose-500/10 text-rose-400 border-rose-550/30 font-extrabold animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {isAsesorSuspended ? '⚠️ OPERADOR SUSPENDIDO: @asesor_juan' : '✓ TODOS LOS OPERADORES ACTIVOS'}
            </span>
          </div>
        </div>

        {/* SEC HEALTH CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Canal Móvil (Celular)</span>
              <strong className="text-xs text-white">Geoperimetrado Segura</strong>
              <div className="text-[9px] text-slate-405 text-emerald-400 font-mono mt-0.5">Control de IP Activo</div>
            </div>
          </div>
          
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Incidentes Detectados</span>
              <strong className="text-xs text-white">{incidents.length} de Alertas de Privilegio</strong>
              <div className="text-[9px] text-slate-405 text-rose-400 font-mono mt-0.5">
                {incidents.filter(i => i.status === 'PENDIENTE').length} Pendientes de Dictamen
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Autenticación Multifactor</span>
              <strong className="text-xs text-white">Token Criptográfico OTP</strong>
              <span className="text-[9px] text-slate-405 text-teal-400 font-mono block mt-0.5">Requerido para Modificaciones</span>
            </div>
          </div>
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl border border-slate-850 p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-white">No hay incidencias de seguridad registradas</h3>
            <p className="text-xs text-slate-400">
              El sistema de control perimetral no ha reportado ningún bypass de políticas ni accesos irregulares de asesores comerciales.
            </p>
          </div>
          {onTriggerMockIncident && (
            <button
              onClick={onTriggerMockIncident}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition border border-rose-550/30"
            >
              Simular Incidente Práctico de @asesor_juan (Celular)
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* List panel */}
          <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-3">
            <div className="flex justify-between items-center px-2 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-400">Historial de Alertas</span>
              
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setActiveIncidentTab('all')}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${activeIncidentTab === 'all' ? 'bg-slate-950 text-white' : 'text-slate-550 hover:text-slate-200'}`}
                >
                  Todas
                </button>
                <button 
                  onClick={() => setActiveIncidentTab('pending')}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${activeIncidentTab === 'pending' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-550 hover:text-slate-200'}`}
                >
                  Activas {incidents.filter(i => i.status === 'PENDIENTE').length > 0 && `(${incidents.filter(i => i.status === 'PENDIENTE').length})`}
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredIncidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncident(inc);
                    setResolutionNotes('');
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col gap-2 ${
                    selectedIncident?.id === inc.id
                      ? 'bg-slate-950 border-rose-500/70 shadow-md ring-1 ring-rose-500/50'
                      : 'bg-slate-950/40 border-slate-850 hover:bg-slate-950/80 hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      {inc.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-605 text-slate-500" />
                      {inc.timestamp}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      Modificación No Autorizada a {inc.targetClient}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {inc.actionBlocked}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-900/50 mt-1">
                    <span className="text-[9px] font-mono text-indigo-400 font-semibold flex items-center gap-1">
                      <Smartphone className="w-2.5 h-2.5 text-indigo-500" />
                      {inc.device} • @{inc.user}
                    </span>
                    {getStatusBadge(inc.status)}
                  </div>
                </button>
              ))}
            </div>

            {onClearLogs && (
              <button
                onClick={onClearLogs}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-500 hover:text-rose-400 py-2 border border-dashed border-slate-800 hover:border-rose-500/30 rounded-xl transition cursor-pointer bg-transparent"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar Bitácora de Alertas Resueltas
              </button>
            )}
          </div>

          {/* Details & Resolution panel */}
          <div className="lg:col-span-7 space-y-6">
            {selectedIncident ? (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5 animate-slideUp">
                {/* ID Header */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[9px] font-mono bg-rose-500/15 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                      INCIDENCIA FORENSE CRÍTICA CLI-REHA
                    </span>
                    <h3 className="text-sm font-black text-white mt-1">
                      Expediente de Seguridad: {selectedIncident.id}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 font-bold bg-slate-950 border border-slate-850 px-3.5 py-1 rounded-xl">
                    Estatus: {selectedIncident.status === 'PENDIENTE' ? '🔴 SIN RESOLVER' : '🟢 DICTAMINADO'}
                  </span>
                </div>

                {/* Forensics card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider border-b border-slate-900 pb-2">
                    Detalles del Intento de Infracción (Simulación de Mobile)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">USUARIO INFRACTOR:</span>
                      <strong className="text-white text-xs flex items-center gap-1 mt-0.5">
                        <User className="w-4 h-4 text-rose-400" />
                        Ejecutivo Juan Salazar (@{selectedIncident.user})
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">DISPOSITIVO DETECTADO (U/A):</span>
                      <strong className="text-white text-xs flex items-center gap-1 mt-0.5">
                        <Smartphone className="w-4 h-4 text-indigo-400" />
                        Celular ({selectedIncident.device})
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">FECHA Y HORA DEL INCIDENTE:</span>
                      <strong className="text-white text-xs font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {selectedIncident.timestamp}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">EXPEDIENTE AFECTADO:</span>
                      <strong className="text-white text-xs flex items-center gap-1 mt-0.5">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        {selectedIncident.targetClient}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900 text-xs">
                    <span className="text-[10px] text-slate-500 font-mono block mb-1">DETALLE DE LA ACCIÓN BLOQUEADA:</span>
                    <div className="p-3 bg-rose-950/20 border border-rose-505/30 border-rose-900/30 text-rose-400/90 rounded-xl leading-normal font-mono font-semibold text-[11px]">
                      {selectedIncident.actionBlocked}
                    </div>
                  </div>
                </div>

                {/* Automation defense log */}
                <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-2xl text-xs space-y-1.5">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    ACCIÓN AUTOMÁTICA DEL SISTEMA (SHIELD CORE ENGINE)
                  </h4>
                  <p className="text-slate-300 leading-normal">
                    La petición de edición directa de la tabla de Buró Interno fue <strong className="text-white">RECHAZADA Y BLOQUEADA IN SITU</strong>. El motor criptográfico no detectó firma delegada del Supervisor (@admin_harold). Se congelaron de inmediato todos los accesos de @asesor_juan a la red corporativa de la financiera.
                  </p>
                </div>

                {/* Resolution History / Actions */}
                {selectedIncident.status !== 'PENDIENTE' ? (
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      DICTAMEN FINAL DEL SUPERVISOR (AUDITORÍA RESOLVADA)
                    </h4>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-850">
                      <p className="text-slate-350 text-xs leading-relaxed font-sans italic">
                        "{selectedIncident.notes}"
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end text-[10px] text-slate-500 font-mono uppercase">
                      <span>Auditor: Harold Salazar</span>
                      <span>•</span>
                      <span>Autorizado vía llave AH-908A1</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-300 font-mono uppercase tracking-widest">
                        Agregar Comentarios o Notas del Dictamen:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Ej. Se entrevistó al asesor por llamada. Indica que fue un error accidental al intentar corroborar datos del cliente Martínez desde su teléfono móvil. Se reactiva con advertencia de auditoría."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full text-xs p-3 border border-slate-800 bg-slate-950 text-white placeholder-slate-650 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    {/* MENU OPTIONS FOR RESOLVING OR RAISING THE SUSPENSION */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                      <span className="block text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                        DIRECCIÓN OPERATIVA / ACCIÓN DE RESOLUCIÓN DISPONIBLE:
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* OPTION 1: LEVANTAR SUSPENSIÓN */}
                        <button
                          onClick={() => handleResolveAction('LEVANTAR')}
                          className="bg-emerald-600 hover:bg-emerald-505 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-3 rounded-xl transition cursor-pointer flex flex-col justify-center items-center gap-1.5 border border-emerald-550/40 text-center"
                        >
                          <ShieldCheck className="w-4 h-4 font-black" />
                          <span className="font-bold">Levantar Suspensión</span>
                          <span className="text-[8px] font-medium opacity-80 block text-center leading-tight">Limpia estatus y devuelve accesos</span>
                        </button>

                        {/* OPTION 2: NOTIFICAR A RECURSOS HUMANOS / MANTENER BLOQUEO */}
                        <button
                          onClick={() => handleResolveAction('PENALIZAR')}
                          className="bg-amber-600 hover:bg-amber-505 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3 py-3 rounded-xl transition cursor-pointer flex flex-col justify-center items-center gap-1.5 border border-amber-550/40 text-center"
                        >
                          <Ban className="w-4 h-4" />
                          <span className="font-bold">Mantener Bloqueo y Notificar RH</span>
                          <span className="text-[8px] font-medium opacity-80 block text-center leading-tight">Mantener bloqueado y enviar acta</span>
                        </button>

                        {/* OPTION 3: DESESTIMAR ALERTA */}
                        <button
                          onClick={() => handleResolveAction('DESESTIMAR')}
                          className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs px-3 py-3 rounded-xl transition cursor-pointer flex flex-col justify-center items-center gap-1.5 border border-slate-700 text-center"
                        >
                          <ShieldQuestion className="w-4 h-4 text-slate-405 text-slate-400" />
                          <span className="font-bold">Desestimar / Archivar</span>
                          <span className="text-[8px] font-medium opacity-80 block text-center leading-tight">Ignorar alerta y restaurar agente</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 text-center space-y-2">
                <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-xs font-bold">Selecciona una alerta en la lista de la izquierda para ver su análisis de forensia y dictamen.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
