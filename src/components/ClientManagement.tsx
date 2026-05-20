import React, { useState } from 'react';
import { Search, UserPlus, FileText, CheckCircle, AlertTriangle, HelpCircle, X, ShieldAlert, Plus, Layers, Crown, Award, User, Sparkles } from 'lucide-react';
import { Client, BureauStatus } from '../types';

interface ClientManagementProps {
  clients: Client[];
  onAddClient: (newClient: Omit<Client, 'id' | 'joinDate'>) => void;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({ clients, onAddClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BureauStatus | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newRfc, setNewRfc] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newScore, setNewScore] = useState(650);
  const [newCredit, setNewCredit] = useState(150000);
  const [newOwed, setNewOwed] = useState(0);
  const [newDelinquency, setNewDelinquency] = useState(0);
  const [newCat, setNewCat] = useState<'Comercial' | 'Personal' | 'Pyme' | 'Hipotecario'>('Personal');

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rfc.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'ALL' || c.bureauStatus === selectedStatus;
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRfc) {
      alert('Por favor, ingresa el nombre y el RFC.');
      return;
    }

    const calculatedStatus: BureauStatus = 
      newDelinquency > 30 ? 'ALERTA' :
      newScore >= 720 ? 'EXCELENTE' :
      newScore >= 650 ? 'BUENO' :
      newScore >= 580 ? 'REGULAR' : 'ALERTA';

    onAddClient({
      name: newName,
      rfc: newRfc.toUpperCase(),
      email: newEmail || 'sin_correo@dominio.com',
      phone: newPhone || '55-0000-0000',
      creditScore: Number(newScore),
      bureauStatus: calculatedStatus,
      totalCreditGranted: Number(newCredit),
      balanceOwed: Number(newOwed),
      delinquencyDays: Number(newDelinquency),
      category: newCat
    });

    // Reset Form
    setNewName('');
    setNewRfc('');
    setNewEmail('');
    setNewPhone('');
    setNewScore(650);
    setNewCredit(150000);
    setNewOwed(0);
    setNewDelinquency(0);
    setNewCat('Personal');
    setIsAdding(false);
  };

  const getStatusBadge = (status: BureauStatus) => {
    switch (status) {
      case 'EXCELENTE':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full">EXCELENTE</span>;
      case 'BUENO':
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full">BUENO</span>;
      case 'REGULAR':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full">REGULAR</span>;
      case 'ALERTA':
        return <span className="bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full animate-pulse">⚠️ ALERTA</span>;
      default:
        return null;
    }
  };

  const formatMXN = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(val);
  };

  const exportToCSV = () => {
    // Generate simple CSV content and mock download
    const headers = 'ID,Nombre,RFC,Email,Score,Estatus Buro,Credito Otorgado,Saldo Insoluto,Dias Retraso,Categoria\n';
    const rows = filteredClients.map(c => 
      `"${c.id}","${c.name}","${c.rfc}","${c.email}",${c.creditScore},"${c.bureauStatus}",${c.totalCreditGranted},${c.balanceOwed},${c.delinquencyDays},"${c.category}"`
    ).join('\n');
    
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `cartera_admin_harold_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Title block */}
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Gestión Integrada de Cartera ({filteredClients.length})
          </h2>
          <p className="text-xs text-slate-400">Expedientes consolidados, control de saldos y evaluación de riesgo comercial/personal.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-505 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 shadow-md cursor-pointer border border-indigo-500/50"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Alta Cliente
          </button>
          
          <button
            onClick={exportToCSV}
            className="border border-slate-750 hover:border-slate-605 bg-slate-800 hover:bg-slate-755 hover:bg-slate-700 text-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer border border-slate-700"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/60 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Buscar por Nombre, RFC o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-800 rounded-xl bg-slate-950 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-155"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs font-mono text-slate-500 shrink-0">Estatus:</span>
          {(['ALL', 'EXCELENTE', 'BUENO', 'REGULAR', 'ALERTA'] as const).map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition duration-150 cursor-pointer ${
                selectedStatus === status 
                  ? 'bg-indigo-650 bg-indigo-600 border-indigo-400 text-white font-bold' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'ALL' ? 'Todos' : status}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-slate-500 shrink-0">Segmento:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">Todos los segmentos</option>
            <option value="Comercial">Comercial (Corporativo)</option>
            <option value="Personal font-sans">Personal</option>
            <option value="Pyme font-sans">Pyme (Negocios)</option>
            <option value="Hipotecario font-sans">Hipotecario</option>
          </select>
        </div>
      </div>

      {/* MODAL INLINE-FORM TO ADD A CLIENT */}
      {isAdding && (
        <div className="p-6 bg-slate-950/40 border-b border-slate-800 transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono flex items-center gap-1.5 text-indigo-400">
              <UserPlus className="w-4 h-4" /> Alta de Cliente en Cartera Activa
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre Completo o Razón Social *</label>
              <input
                type="text"
                required
                placeholder="Ej. Distribuidora del Valle S.A."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">RFC Oficial *</label>
              <input
                type="text"
                required
                maxLength={13}
                placeholder="Ej. DIVA900101TS3"
                value={newRfc}
                onChange={(e) => setNewRfc(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white uppercase font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Segmento del Crédito</label>
              <select
                value={newCat}
                onChange={(e: any) => setNewCat(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-205 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Comercial">Comercial</option>
                <option value="Personal">Personal</option>
                <option value="Pyme">Pyme</option>
                <option value="Hipotecario">Hipotecario</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Score Inicial Buró Interno (300 - 850)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="300"
                  max="850"
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="font-mono text-xs font-bold w-12 text-center text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-md py-0.5">{newScore}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Crédito Inicial Autorizado (MXN)</label>
              <input
                type="number"
                min="0"
                placeholder="Ej. 150000"
                value={newCredit}
                onChange={(e) => setNewCredit(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Saldo deudor actual (Saldo Insoluto MXN)</label>
              <input
                type="number"
                min="0"
                placeholder="Ej. 75000"
                value={newOwed}
                onChange={(e) => setNewOwed(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Días de retraso acumulados</label>
              <input
                type="number"
                min="0"
                placeholder="Ej. 0 (Vigente)"
                value={newDelinquency}
                onChange={(e) => setNewDelinquency(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-end justify-end lg:col-span-1 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-lg transition duration-150 cursor-pointer border border-slate-705 border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition duration-150 shadow-md cursor-pointer"
              >
                Registrar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLIENTS LIST (TABLE) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
              <th className="py-3.5 px-5">ID / RFC</th>
              <th className="py-3.5 px-5">Expediente Cliente</th>
              <th className="py-3.5 px-5">Segmento</th>
              <th className="py-3.5 px-5 text-center">Score Buró</th>
              <th className="py-3.5 px-5 text-center">Riesgo Interno</th>
              <th className="py-3.5 px-5 text-right">Crédito Autorizado</th>
              <th className="py-3.5 px-5 text-right">Saldo Insoluto</th>
              <th className="py-3.5 px-5 text-right font-semibold">Días de Retraso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredClients.length > 0 ? (
              filteredClients.map(c => {
                const getRiskClass = (days: number) => {
                  if (days === 0) return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
                  if (days <= 15) return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
                  return 'text-rose-400 bg-rose-500/10 border border-rose-500/20 font-bold';
                };
                
                return (
                  <tr key={c.id} className="hover:bg-slate-850/40 transition duration-100 cursor-pointer active:bg-slate-800" onClick={() => setSelectedClient(c)}>
                    {/* ID & RFC */}
                    <td className="py-4 px-5 font-mono">
                      <div className="font-bold text-white">{c.id}</div>
                      <div className="text-[10px] text-slate-500">{c.rfc}</div>
                    </td>
                    
                    {/* Client Name & Contact */}
                    <td className="py-4 px-5 font-sans">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-200 text-sm">{c.name}</div>
                        {c.membership === 'Premium' && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 text-[8px] rounded font-mono font-black flex items-center gap-0.5" title="Membresía Premium VIP Activa">
                            <Crown className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                            PREMIUM
                          </span>
                        )}
                        {c.membership === 'Básica' && (
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-1.5 py-0.5 text-[8px] rounded font-mono font-black flex items-center gap-0.5" title="Membresía Básica Activa">
                            <Award className="w-2.5 h-2.5 shrink-0 text-indigo-400" />
                            BÁSICA
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>{c.email}</span>
                        <span>•</span>
                        <span>{c.phone}</span>
                      </div>
                    </td>

                    {/* Segment */}
                    <td className="py-4 px-5">
                      <span className="bg-slate-950 text-slate-405 text-slate-350 font-semibold text-[10px] px-2 py-0.5 rounded border border-slate-800">
                        {c.category}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-5 text-center font-mono">
                      <div className={`font-bold text-base ${
                        c.creditScore >= 720 ? 'text-emerald-400' :
                        c.creditScore >= 650 ? 'text-indigo-400' :
                        c.creditScore >= 580 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {c.creditScore}
                      </div>
                      <div className="text-[8px] text-slate-500 bg-slate-950 border border-slate-800 rounded inline-block px-1">score</div>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-4 px-5 text-center">
                      {getStatusBadge(c.bureauStatus)}
                    </td>

                    {/* Authorized credit */}
                    <td className="py-4 px-5 text-right font-mono font-medium text-slate-200">
                      {formatMXN(c.totalCreditGranted)}
                    </td>

                    {/* Balance owed */}
                    <td className="py-4 px-5 text-right font-mono text-slate-400">
                      {formatMXN(c.balanceOwed)}
                    </td>

                    {/* Delinquency Days */}
                    <td className="py-4 px-5 text-right font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${getRiskClass(c.delinquencyDays)}`}>
                        {c.delinquencyDays === 0 ? 'Vigente al corriente' : `${c.delinquencyDays} días`}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto flex flex-col items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-slate-600 animate-pulse" />
                    <p className="text-sm font-semibold text-slate-300">No se encontraron expedientes</p>
                    <p className="text-xs text-slate-500">Prueba cambiando los filtros de búsqueda o estatus.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-950/60 px-6 py-4 border-t border-slate-800 flex justify-between items-center text-xs font-mono text-slate-500">
        <span>Mostrando {filteredClients.length} de {clients.length} clientes totales creados</span>
        <span>•</span>
        <span>Fecha de reporte: {new Date().toLocaleDateString('es-MX')}</span>
      </div>

      {/* DETAILED CLIENT DOSSIER MODAL WITH INTEREST CÁLCULO */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-slideUp">
            {/* Ambient glows */}
            {selectedClient.membership === 'Premium' && (
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
            )}

            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    Expediente Integrado
                  </h3>
                  {selectedClient.membership === 'Premium' && (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full py-0.5 px-2.5 text-[8px] font-mono font-bold flex items-center gap-1 animate-pulse">
                      <Crown className="w-2.5 h-2.5 text-amber-400" />
                      PREMIUM
                    </span>
                  )}
                  {selectedClient.membership === 'Básica' && (
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full py-0.5 px-2.5 text-[8px] font-mono font-bold flex items-center gap-1">
                      <Award className="w-2.5 h-2.5 text-indigo-400" />
                      BÁSICA
                    </span>
                  )}
                </div>
                <h4 className="text-xl font-bold text-white leading-tight">{selectedClient.name}</h4>
              </div>
              
              <button 
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-705 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile body content */}
            <div className="space-y-4">
              
              {/* Score panel inside expediente */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[8px] font-mono text-slate-405 text-slate-400 uppercase block tracking-wider">Score Histórico</span>
                  <span className={`text-2xl font-mono font-black block mt-0.5 ${
                    selectedClient.creditScore >= 720 ? 'text-emerald-400' :
                    selectedClient.creditScore >= 650 ? 'text-indigo-400' :
                    selectedClient.creditScore >= 580 ? 'text-amber-400' : 'text-rose-450 text-rose-400'
                  }`}>
                    {selectedClient.creditScore}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase block font-mono">Calificación: {selectedClient.bureauStatus}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center flex flex-col justify-center">
                  <span className="text-[8px] font-mono text-slate-400 uppercase block tracking-wider">Estatus de Retraso</span>
                  <span className={`text-sm font-mono font-bold block mt-1 ${selectedClient.delinquencyDays === 0 ? 'text-emerald-400' : 'text-amber-400 font-bold'}`}>
                    {selectedClient.delinquencyDays === 0 ? '0 Días (Vigente)' : `${selectedClient.delinquencyDays} días - Alerta`}
                  </span>
                </div>
              </div>

              {/* General details lists */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-450">ID Interno:</span>
                  <span className="font-mono text-slate-200 font-bold">{selectedClient.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-450">Clave RFC local:</span>
                  <span className="font-mono text-slate-200 uppercase font-black">{selectedClient.rfc}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-450">Correo de Contacto:</span>
                  <span className="text-slate-200 font-semibold">{selectedClient.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-450">Estatus Enlace:</span>
                  <span className="text-slate-200 font-mono">{selectedClient.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-450">Sector de Negocio:</span>
                  <span className="text-indigo-400 font-semibold">{selectedClient.category}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-450">Crédito total:</span>
                  <span className="font-mono text-slate-100 font-bold">{formatMXN(selectedClient.totalCreditGranted)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-450">Saldo por liquidar:</span>
                  <span className="font-mono text-slate-300 font-bold">{formatMXN(selectedClient.balanceOwed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-455">Afiliado desde:</span>
                  <span className="text-slate-300">{selectedClient.joinDate}</span>
                </div>
              </div>

              {/* Segmented Membership logic */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Suscripción y Bonificaciones</span>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono font-bold px-2 py-0.5 rounded uppercase">Políticas carteras</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] text-slate-500 uppercase block">Tasa de interés cartera</span>
                    <strong className="text-slate-100 text-xs mt-0.5 block">
                      {selectedClient.membership === 'Premium' ? '12.50% (-2.0% VIP)' : selectedClient.membership === 'Básica' ? '14.00% (-0.5%)' : '14.50% base'}
                    </strong>
                  </div>

                  <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] text-slate-500 uppercase block">Comisión apertura</span>
                    <strong className="text-slate-100 text-xs mt-0.5 block">
                      {selectedClient.membership === 'Premium' ? '0% Exento' : selectedClient.membership === 'Básica' ? '1.0% Preferencial' : '1.5% Ordinario'}
                    </strong>
                  </div>
                </div>

                {selectedClient.membership === 'Premium' ? (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[10px] text-amber-300 flex gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-bold font-sans">Beneficios Premium Directos:</p>
                      <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5 [line-height:1.4]">
                        Este expediente posee una bonificación VIP del 2.0% de descuento en tasa ordinaria anual por suscripción activa ($499/mes). Cumple con el SLA prioritario de Harold.
                      </p>
                    </div>
                  </div>
                ) : selectedClient.membership === 'Básica' ? (
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-[10px] text-indigo-300 flex gap-2">
                    <Award className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold font-sans">Suscripción Básica Activa:</p>
                      <p className="text-slate-400 text-[10px] leading-relaxed mt-0.5 [line-height:1.4]">
                        Goza de un descuento del -0.5% en la tasa ordinaria de su balance insoluto. Las comisiones están reducidas al 1.0%. Costo mensual de $199/mes facturado.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 text-center italic font-sans leading-relaxed">
                    Suscripción estándar. No goza de descuentos automáticos en su tasa vigente o mitigación de comisiones. Se puede promover desde el Módulo de Membresías.
                  </p>
                )}
              </div>

            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="bg-slate-850 hover:bg-slate-800 hover:bg-slate-750 text-slate-100 text-xs font-semibold py-2.5 px-6 rounded-xl transition cursor-pointer border border-slate-750"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
