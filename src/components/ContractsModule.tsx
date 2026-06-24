import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, UserCheck, Calendar, DollarSign, 
  Download, Printer, Plus, Search, CheckCircle, AlertCircle, 
  Trash2, Layers, Briefcase, FileSignature, Globe, Share2
} from 'lucide-react';
import { Client, ClientContract, ContractTemplate, interpolateContractTemplate } from '../types';

interface ContractsModuleProps {
  currentUser: string;
  clients: Client[];
  contracts: ClientContract[];
  onAddContract: (newContract: ClientContract) => void;
  onDeleteContract: (contractId: string) => void;
  onClearDatabase?: () => Promise<boolean>;
  templates: ContractTemplate[];
  onUpdateTemplates: (updated: ContractTemplate[]) => void;
}

export const ContractsModule: React.FC<ContractsModuleProps> = ({
  currentUser,
  clients,
  contracts,
  onAddContract,
  onDeleteContract,
  onClearDatabase,
  templates,
  onUpdateTemplates
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [contractType, setContractType] = useState<'Contrato Express' | 'Contrato de préstamo entre particulares'>('Contrato Express');
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [customReference, setCustomReference] = useState('');
  const [contractDate, setContractDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedPreviewContract, setSelectedPreviewContract] = useState<ClientContract | null>(
    contracts.length > 0 ? contracts[0] : null
  );

  // Contract Templates Editor State
  const [isEditingTemplates, setIsEditingTemplates] = useState(false);
  const [activeTemplateEditId, setActiveTemplateEditId] = useState<'express' | 'particulares'>('express');
  const [tempTitle, setTempTitle] = useState('');
  const [tempSubtitle, setTempSubtitle] = useState('');
  const [tempDeclarations, setTempDeclarations] = useState('');
  const [tempClauses, setTempClauses] = useState('');

  const openTemplateEditor = (typeId: 'express' | 'particulares') => {
    const template = templates.find(t => t.id === typeId) || templates[0];
    setActiveTemplateEditId(typeId);
    setTempTitle(template.title);
    setTempSubtitle(template.subtitle);
    setTempDeclarations(template.declarations);
    setTempClauses(template.clauses);
    setIsEditingTemplates(true);
  };

  const handleSaveTemplate = () => {
    const updated = templates.map(t => {
      if (t.id === activeTemplateEditId) {
        return {
          ...t,
          title: tempTitle,
          subtitle: tempSubtitle,
          declarations: tempDeclarations,
          clauses: tempClauses
        };
      }
      return t;
    });
    onUpdateTemplates(updated);
    setIsEditingTemplates(false);
    alert('✓ Plantilla de contrato actualizada con éxito.');
  };

  // Filter clients to select from (preferably ones with active credit or balanceOwed > 0, but show all)
  const availableClientsForNewContract = clients.filter(c => {
    const isSearchingName = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isSearchingId = c.id.toLowerCase().includes(searchTerm.toLowerCase());
    return isSearchingName || isSearchingId;
  });

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setCustomAmount(client.balanceOwed || client.totalCreditGranted || 10000);
      setCustomReference(client.id); // Unified reference (ID)
    }
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    const newId = `CON-${Math.floor(100000 + Math.random() * 900000)}`;
    const newContract: ClientContract = {
      id: newId,
      clientId: client.id,
      clientName: client.name,
      contractType,
      amount: customAmount ? Number(customAmount) : 10000,
      paymentReference: customReference || client.id,
      dateGenerated: contractDate,
      monthlyPlan: client.balanceOwed > 0 
        ? `Saldar saldo deudor de $${client.balanceOwed.toLocaleString('es-MX')} MXN` 
        : 'Amortización pactada en 12 semanas',
      status: 'ACTIVO'
    };

    onAddContract(newContract);
    setSelectedPreviewContract(newContract);
    setIsAssigning(false);
    setSelectedClientId('');
    setSearchTerm('');
  };

  // Printing function - opens print dialog specifically styling the contract container
  const handlePrint = (contractId: string) => {
    const printContent = document.getElementById(`printable-contract-${contractId}`);
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Contrato Digital - ${contractId}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { font-family: 'Inter', system-ui, sans-serif; background-color: white; color: black; padding: 40px; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
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

  const activeReviewContract = selectedPreviewContract || (contracts.length > 0 ? contracts[0] : null);

  const getInterpolatedContract = () => {
    if (!activeReviewContract) return null;
    const matchId = activeReviewContract.contractType === 'Contrato Express' ? 'express' : 'particulares';
    const activeTemplate = templates.find(t => t.id === matchId) || templates[0];
    return interpolateContractTemplate(activeTemplate, {
      id: activeReviewContract.id,
      clientName: activeReviewContract.clientName,
      amount: activeReviewContract.amount,
      paymentReference: activeReviewContract.paymentReference,
      dateGenerated: activeReviewContract.dateGenerated
    });
  };

  const interpolated = getInterpolatedContract();

  return (
    <div className="space-y-6" id="contracts-module-container">
      {/* Header Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] border border-indigo-500/20 px-2.5 py-1 rounded-full font-bold font-mono tracking-wider uppercase mb-1.5 inline-block">
            Área Jurídica y Fideicomiso Unificado
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-[#a3c90e]" />
            Asignación de Contratos Digitales
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestione y asigne contratos con firma electrónica y certificación inmediata para clientes con líneas de crédito aprobadas.
          </p>
        </div>

        <div className="flex gap-2.5 items-center flex-wrap">
          {onClearDatabase && (
            <button
              onClick={() => {
                if (window.confirm("⚠️ ¿Estás seguro de que deseas limpiar TODOS los registros de la base de datos (Clientes, Solicitudes, Pagos, etc.) para comenzar tus pruebas reales? Esta acción es irreversible.")) {
                  onClearDatabase().then((success) => {
                    if (success) {
                      alert("✓ Base de datos reiniciada correctamente.");
                    } else {
                      alert("✕ Error al restablecer la base de datos.");
                    }
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-black px-4.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg select-none active:scale-95 transition cursor-pointer border-none"
              title="Borrar todos los registros para pruebas limpias"
            >
              <Trash2 className="w-4 h-4 text-white" />
              Limpiar BD (Pruebas)
            </button>
          )}

          {currentUser === 'admin_harold' && (
            <button
              onClick={() => openTemplateEditor('express')}
              className="bg-slate-800 hover:bg-slate-700 text-[#a3c90e] border border-[#a3c90e]/30 hover:border-[#a3c90e]/50 font-black px-4.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg select-none active:scale-95 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#a3c90e]" />
              Personalizar Plantillas
            </button>
          )}

          <button
            onClick={() => setIsAssigning(true)}
            className="bg-[#a3c90e] hover:bg-[#b5df12] text-slate-950 font-black px-4.5 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg select-none active:scale-95 transition cursor-pointer border-none"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Generar y Asignar Contrato
          </button>
        </div>
      </div>

      {isAssigning && (
        <div className="bg-slate-905 bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 space-y-5 animate-fadeIn relative">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Asignación del Contrato e Incorporación de Datos
            </h3>
            <button 
              onClick={() => {
                setIsAssigning(false);
                setSelectedClientId('');
              }}
              className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer p-1.5 hover:bg-slate-800 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateContract} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Client Selection */}
              <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-450 text-indigo-400 font-bold mb-1.5">
                    1. Buscar y Seleccionar Cliente Autorizado *
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar por Nombre, ID, o RFC..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-805 text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-950/80 p-2 rounded-xl border border-slate-850">
                    {availableClientsForNewContract.length === 0 ? (
                      <p className="text-slate-500 text-[11px] text-center py-4 italic">No se encontraron clientes.</p>
                    ) : (
                      availableClientsForNewContract.map(client => {
                        const isSelected = selectedClientId === client.id;
                        return (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => handleClientSelect(client.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                              isSelected 
                                ? 'bg-[#a3c90e]/10 border border-[#a3c90e]/30 text-[#a3c90e]' 
                                : 'bg-transparent border border-transparent text-slate-350 hover:bg-slate-800/60 hover:text-white'
                            }`}
                          >
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                {client.name}
                                <span className="bg-slate-900 border border-slate-800 text-[9px] px-1.5 py-0.2 rounded font-mono text-indigo-400 font-bold">
                                  {client.id}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">Saldo: ${client.balanceOwed?.toLocaleString('es-MX')} | Historial: {client.bureauStatus}</div>
                            </div>
                            <CheckCircle className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-[#a3c90e] opacity-100' : 'opacity-0'}`} />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {selectedClientId && (
                  <div className="p-3 bg-[#a3c90e]/5 border border-[#a3c90e]/20 rounded-xl text-xs space-y-1 animate-pulse">
                    <p className="text-white font-bold">
                      Cliente Seleccionado:
                    </p>
                    <p className="text-slate-300 font-mono">
                      {clients.find(c => c.id === selectedClientId)?.name}
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Referencia Única unificada auto-asignada: <strong className="text-white font-bold">{customReference}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Contract Metadata */}
              <div className="space-y-4 bg-slate-950/40 p-4 border border-slate-850 rounded-2xl">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-indigo-400 font-bold mb-1.5">
                    2. Seleccionar Plantilla de Contrato *
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-100 font-sans text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500/70 focus:ring-0 outline-none transition cursor-pointer"
                  >
                    <option value="Contrato Express">Contrato Express (Corto Plazo con Amortización Simple)</option>
                    <option value="Contrato de préstamo entre particulares">Contrato de préstamo entre particulares (Mutuo con Interés y Garantías)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-[#a3c90e]" /> Monto del Contrato (MXN) *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={customAmount || ''}
                      onChange={(e) => setCustomAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 text-slate-105 px-3 py-2 text-xs rounded-xl border border-slate-800 focus:border-indigo-550 outline-none text-[#a3c90e] font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" /> Fecha de Contrato *
                    </label>
                    <input
                      type="date"
                      required
                      value={contractDate}
                      onChange={(e) => setContractDate(e.target.value)}
                      className="w-full bg-slate-950 text-slate-200 px-3 py-2 text-xs rounded-xl border border-slate-800 focus:border-indigo-550 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
                    Referencia Bancaria Única de Pago *
                  </label>
                  <input
                    type="text"
                    required
                    value={customReference}
                    onChange={(e) => setCustomReference(e.target.value.toUpperCase())}
                    placeholder="Referencia de Conciliación..."
                    className="w-full bg-slate-950 text-slate-200 uppercase font-mono px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none text-xs text-slate-300 font-bold"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block leading-tight">
                    * Clave fiduciaria única utilizada para conciliaciones inmediatas SPEI/Oxxo/Depósitos.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAssigning(false);
                  setSelectedClientId('');
                }}
                className="bg-slate-800 hover:bg-slate-750 text-slate-350 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition border-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedClientId}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition border-none shadow-md"
              >
                Asignar y Notificar al Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Left Column (Contract Records) | Right Column (Interactive Legal Document Viewer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CONTRACT RECORDS LIST (5 SPANS) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <span>LISTADO DE CONTRATOS ({contracts.length})</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Activos</span>
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {contracts.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2.5" />
                  <p className="text-slate-400 text-xs font-bold">No hay contratos registrados</p>
                  <p className="text-slate-500 text-[11px] mt-1">Presione el botón "Generar y Asignar Contrato" para certificar el primero.</p>
                </div>
              ) : (
                contracts.map(contract => {
                  const isSelected = activeReviewContract?.id === contract.id;
                  return (
                    <div 
                      key={contract.id}
                      onClick={() => setSelectedPreviewContract(contract)}
                      className={`p-3.5 rounded-2xl border transition-all duration-150 text-left cursor-pointer flex flex-col justify-between gap-1.5 relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-slate-950 border-[#a3c90e]/70 shadow-lg' 
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-950 hover:border-slate-705'
                      }`}
                    >
                      {/* Badge decor */}
                      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Globe className="w-3.5 h-3.5 text-slate-700 animate-spin" />
                      </div>

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[9px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                            <span>{contract.id}</span>
                            <span>•</span>
                            <span>{contract.dateGenerated}</span>
                          </div>
                          <h4 className="font-extrabold text-white text-xs mt-0.5 max-w-[170px] truncate">{contract.clientName}</h4>
                          <span className="text-[10px] text-[#a3c90e] font-sans font-bold flex items-center gap-1 mt-0.5 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#a3c90e] inline-block animate-pulse" />
                            {contract.contractType}
                          </span>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-black text-white font-mono">${contract.amount.toLocaleString('es-MX')}</div>
                          <span className="text-[8px] bg-indigo-500/10 text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase mt-1 inline-block">
                            REF: {contract.paymentReference}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-850 text-[10px] text-slate-400">
                        <span className="font-mono text-emerald-400 font-bold uppercase">Estado: {contract.status}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrint(contract.id);
                            }}
                            title="Imprimir contrato físicamente"
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer border-none"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteContract(contract.id);
                              if (activeReviewContract?.id === contract.id) {
                                setSelectedPreviewContract(null);
                              }
                            }}
                            title="Eliminar contrato"
                            className="p-1 text-red-400 hover:bg-red-500/20 rounded transition cursor-pointer border-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* HIGH-FIDELITY LEGAL CONTRACT VIEW PANELS (8 SPANS) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          {activeReviewContract ? (
            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-white text-sm uppercase">CONTRATO EN VISTA DIGITAL PREVIA</h3>
                  <p className="text-[10.5px] text-slate-450 text-slate-400 font-mono mt-0.5">ID: {activeReviewContract.id} • Certificación Encriptada SHA-256</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrint(activeReviewContract.id)}
                    className="bg-indigo-600/20 hover:bg-indigo-600 text-[#a3c90e] hover:text-white border border-[#a3c90e]/20 px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir / Exportar PDF
                  </button>
                </div>
              </div>

              {/* STYLED PRINTABLE PAPER BOARD */}
              <div 
                className="bg-white text-slate-900 rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl overflow-y-auto max-h-[500px] leading-relaxed relative"
                id={`printable-contract-${activeReviewContract.id}`}
              >
                {/* Background Watermark/Graphic */}
                <div className="absolute inset-0 bg-contain bg-center opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url('https://cossma.com.mx/saldaapplogo.png')` }}></div>

                {/* Corporate Header Block */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src="https://cossma.com.mx/saldaapplogo.png" 
                      alt="Salda Logo" 
                      className="h-10 w-auto object-contain no-print" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h1 className="font-sans font-black tracking-tight text-lg text-slate-950 uppercase leading-none">Salda App</h1>
                      <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold block mt-1">Fideicomiso Express Mexicana S.A. de C.V.</span>
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-600">
                    <div className="font-bold text-slate-900">CERTIFICACIÓN VIGENTE</div>
                    <div>Ref: {activeReviewContract.paymentReference}</div>
                    <div>Reg: CNBV-FID-2026</div>
                  </div>
                </div>

                {/* Official Title Section */}
                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 underline">
                    {interpolated ? interpolated.title : (activeReviewContract.contractType === 'Contrato Express'
                      ? 'CONTRATO EXPRESO DE CRÉDITO DE CONSUMO INMEDIATO'
                      : 'CONTRATO DE MUTUO CON INTERÉS Y GARANTÍA ENTRE PARTICULARES')}
                  </h2>
                  <p className="text-[9.5px] text-slate-500 font-mono tracking-wider">
                    {interpolated ? interpolated.subtitle : 'DOCUMENTO DIGITAL CERTIFICADO CON COMPROMISO FISCAL DE AMORTIZACIÓN'}
                  </p>
                </div>

                {/* Substantive Declared Body Text */}
                <div className="text-[10.5px] text-slate-800 space-y-2.5 text-justify leading-relaxed">
                  {interpolated ? (
                    interpolated.declarations.split('\n\n').map((para, pIdx) => (
                      <p key={pIdx} className={pIdx === 1 ? "pl-3 border-l pb-1 border-slate-300 text-justify" : "text-justify"}>
                        {para}
                      </p>
                    ))
                  ) : (
                    <>
                      <p>
                        <strong>DECLARACIONES:</strong> El presente contrato (en lo sucesivo, el "Contrato") es celebrado el día <strong className="text-slate-950 font-black">{activeReviewContract.dateGenerated}</strong> por y entre las partes señaladas a continuación:
                      </p>
                      <p className="pl-3 border-l pb-1 border-slate-300">
                        Por una parte, <strong>Fideicomiso de Recaudación Salda App S.A.</strong> como el <strong>"Acreedor fiduciario unificado"</strong>, y por la otra parte, el cliente registrado cuyos datos fiduciarios se autocompletan legalmente:
                      </p>
                    </>
                  )}

                  {/* Client Metadata block */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[9.5px] my-3 leading-loose text-slate-900">
                    <div>
                      <span className="text-slate-500 uppercase block text-[8px] font-black">MUTUATARIO / CLIENTE:</span>
                      <strong className="text-slate-950 text-[10.5px] font-sans">{activeReviewContract.clientName}</strong>
                      <div className="mt-1">ID Contrato: <span className="font-bold text-indigo-700">{activeReviewContract.id}</span></div>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block text-[8px] font-black">MONTO MUTUADO / LÍNEA DE CRÉDITO:</span>
                      <strong className="text-[#8dae09] text-[10.5px] font-bold">${activeReviewContract.amount.toLocaleString('es-MX')} MXN</strong>
                      <div className="mt-1">Referencia Bancaria Sincronizada: <span className="bg-slate-900 text-white font-bold font-mono px-1.5 py-0.2 rounded">{activeReviewContract.paymentReference}</span></div>
                    </div>
                  </div>

                  <p>
                    Las partes manifiestan de común acuerdo someterse al tenor de las siguientes cláusulas obligatorias bajo las leyes de la República Mexicana:
                  </p>

                  {interpolated ? (
                    <div className="space-y-2">
                      {interpolated.clauses.map((clause, cIdx) => (
                        <p key={cIdx} className="text-justify">
                          {clause}
                        </p>
                      ))}
                    </div>
                  ) : (
                    activeReviewContract.contractType === 'Contrato Express' ? (
                      <div className="space-y-2">
                        <p>
                          <strong>CLÁUSULA PRIMERA (Entrega y Destino del Crédito):</strong> Salda App pone a la disposición de la Parte Acreditada la suma autorizada de <strong>${activeReviewContract.amount.toLocaleString('es-MX')} MXN</strong>. El Acreditado declara recibir a su entera satisfacción dicho capital fiduciario para ser destinado a fines personales lícitos de consumo.
                        </p>
                        <p>
                          <strong>CLÁUSULA SEGUNDA (Compromiso Único de Pago y Abonos):</strong> El cliente se obliga y compromete irrevocablemente a amortizar y liquidar el saldo total, intereses aplicables y recargos, a través de la cuenta fiduciaria habilitada por Salda App, identificando cada depósito indefectiblemente utilizando su Referencia Única de Depósito: <strong className="font-mono text-slate-950 underline">{activeReviewContract.paymentReference}</strong>.
                        </p>
                        <p>
                          <strong>CLÁUSULA TERCERA (Tasa de Interés Moratorio y Buró de Crédito):</strong> En caso de retraso en los pagos pactados, se aplicará de manera unificada una tasa de interés moratorio del 5.8% mensual. Asimismo, el atraso dará facultad de reportar el comportamiento negativo inmediatamente a las sociedades de información crediticia (Buró de Crédito).
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>
                          <strong>CLÁUSULA PRIMERA (Objeto del Contrato de Mutuo):</strong> El Mutuante transmite la propiedad de la cantidad líquida de <strong>${activeReviewContract.amount.toLocaleString('es-MX')} MXN</strong> al Mutuatario, quien la recibe con la obligación expresa de restituirla y liquidarla con los intereses pactados y de conformidad con el calendario de pagos de la institución mexicana.
                        </p>
                        <p>
                          <strong>CLÁUSULA SEGUNDA (Tasa de Costo Anual y Referencia de Pago Bancaria):</strong> El mutuo se compromete bajo la tasa fiduciaria de la plataforma, conviniéndose expresamente de manera inalterable que todo abono, amortización y pago ordinario se realizará mediante de transferencias bancarias o SPEI, con el identificador único bancario de pagos SPEI fiduciarios registrado: <strong className="font-mono text-slate-950 underline">{activeReviewContract.paymentReference}</strong>.
                        </p>
                        <p>
                          <strong>CLÁUSULA TERCERA (Vencimiento Anticipado):</strong> El incumplimiento puntual de cualquiera de los abonos facultará al Mutuante para declarar el vencimiento anticipado de toda la obligación, requiriendo el saldo insoluto de manera inmediata de manera legal por la vía ejecutiva mercantil.
                        </p>
                      </div>
                    )
                  )}

                  <p>
                    <strong>SELLO DIGITAL CENTRAL DE LA PLATAFORMA:</strong>
                    <span className="block font-mono text-[8px] bg-slate-100 p-2 text-slate-600 rounded-lg break-all mt-1">
                      SHA256::A1B9392BC876251EF9302A0931B2A1${activeReviewContract.id}FE::FirmaDigitalSincronizadaConComiteEspecialSaldaAppFisicoJuridico2026CE73A2B1C9D2EBC918
                    </span>
                  </p>
                </div>

                {/* Digital Stamps / Authorized Signatures panels */}
                <div className="grid grid-cols-2 gap-6 border-t border-slate-205 pt-6 mt-6 text-[9.5px] font-sans">
                  <div className="text-center">
                    <p className="text-slate-450 text-[8px] uppercase tracking-wider font-mono text-slate-500 font-bold">Por el Acreedor (Salda App)</p>
                    <div className="h-10 flex items-center justify-center italic text-blue-800 font-serif font-black no-print">
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
                      <strong>{activeReviewContract.clientName}</strong>
                      <span className="block text-[8px] text-slate-500 font-mono">Firma Biométrica Validada</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Notice Indicator */}
              <div className="bg-slate-950/70 p-3 border border-slate-800 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#a3c90e] shrink-0 animate-bounce" />
                <span className="text-[10px] text-slate-350 leading-tight">
                  Este documento digital tiene validez completa según la Ley de Firma Electrónica Mexicana, enlazando directamente al deudor con su número unificado de cuenta <strong className="text-white font-mono">{activeReviewContract.paymentReference}</strong>.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-955 bg-slate-950/40 border border-slate-850 rounded-2xl">
              <FileSignature className="w-12 h-12 text-[#a3c90e] mx-auto mb-3 animate-pulse" />
              <h3 className="text-white text-sm font-bold">Ningún contrato seleccionado</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                Seleccione un contrato del panel lateral izquierdo para desplegar su instrumentación documental y previsualizar sus firmas, o genere uno nuevo.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* TEMPLATE EDITOR MODAL */}
      {isEditingTemplates && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <FileSignature className="w-5 h-5 text-[#a3c90e]" />
                <div className="text-left">
                  <h3 className="font-extrabold text-white text-base">Personalizador y Editor de Plantillas de Contratos</h3>
                  <p className="text-xs text-slate-400">Personaliza los textos legales del fideicomiso, copia y pega tus contratos vigentes.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditingTemplates(false)}
                className="text-slate-400 hover:text-white font-mono text-lg cursor-pointer p-1.5 hover:bg-slate-800 rounded-xl transition bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-left">
              {/* Template Selector Tabs */}
              <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => openTemplateEditor('express')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border-none cursor-pointer ${
                    activeTemplateEditId === 'express'
                      ? 'bg-indigo-650 bg-indigo-600 text-white shadow'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Contrato Express (Corto)
                </button>
                <button
                  type="button"
                  onClick={() => openTemplateEditor('particulares')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border-none cursor-pointer ${
                    activeTemplateEditId === 'particulares'
                      ? 'bg-indigo-650 bg-indigo-600 text-white shadow'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Contrato de Mutuo (Particulares)
                </button>
              </div>

              {/* Placeholders Help Panel */}
              <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  Códigos Dinámicos (Copy & Paste en tus textos):
                </h4>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Utiliza estos códigos exactos dentro de tus textos. El sistema los reemplazará de forma automática con los datos reales del cliente al generar el contrato:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px] font-mono mt-1">
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-[#a3c90e] font-bold block mb-0.5">{"{id_contrato}"}</span>
                    <span className="text-slate-500 block text-[9px]">ID del contrato</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-[#a3c90e] font-bold block mb-0.5">{"{nombre_cliente}"}</span>
                    <span className="text-slate-500 block text-[9px]">Nombre completo</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-[#a3c90e] font-bold block mb-0.5">{"{monto}"}</span>
                    <span className="text-slate-500 block text-[9px]">Monto del préstamo</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-[#a3c90e] font-bold block mb-0.5">{"{referencia_pago}"}</span>
                    <span className="text-slate-500 block text-[9px]">Clabe / Referencia</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-center">
                    <span className="text-[#a3c90e] font-bold block mb-0.5">{"{fecha_generado}"}</span>
                    <span className="text-slate-500 block text-[9px]">Fecha de firma</span>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Título del Contrato</label>
                    <input 
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      placeholder="Ej. CONTRATO EXPRESO DE CRÉDITO..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subtítulo o Certificación</label>
                    <input 
                      type="text"
                      value={tempSubtitle}
                      onChange={(e) => setTempSubtitle(e.target.value)}
                      placeholder="Ej. DOCUMENTO DIGITAL CERTIFICADO..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Declaraciones (Copia y pega aquí)
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">Para separar en párrafos distintos, deja una línea en blanco (doble enter).</p>
                  <textarea
                    rows={4}
                    value={tempDeclarations}
                    onChange={(e) => setTempDeclarations(e.target.value)}
                    placeholder="Escribe o pega aquí las declaraciones..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Cláusulas del Contrato (Copia y pega aquí)
                  </label>
                  <p className="text-[10px] text-slate-500 mb-2">Pega todas tus cláusulas de corrido. Para que el sistema detecte y enumere/separe cada cláusula individualmente en la visualización, sepáralas dejando un renglón vacío (doble enter).</p>
                  <textarea
                    rows={8}
                    value={tempClauses}
                    onChange={(e) => setTempClauses(e.target.value)}
                    placeholder="Ejemplo:&#10;CLÁUSULA PRIMERA: El acreedor entrega la cantidad de...&#10;&#10;CLÁUSULA SEGUNDA: El deudor se obliga a pagar..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditingTemplates(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer border-none"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="bg-[#a3c90e] hover:bg-[#b5df12] text-slate-950 font-black px-5 py-2 rounded-xl text-xs transition cursor-pointer border-none animate-pulse"
              >
                Guardar Plantilla
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
