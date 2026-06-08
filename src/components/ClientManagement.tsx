import React, { useState, useRef } from 'react';
import { Search, UserPlus, FileText, CheckCircle, AlertTriangle, HelpCircle, X, ShieldAlert, Plus, Layers, Crown, Award, User, Sparkles, Upload, Edit, Trash2, Eye, Printer } from 'lucide-react';
import { Client, BureauStatus } from '../types';

interface ClientManagementProps {
  clients: Client[];
  onAddClient: (newClient: Omit<Client, 'id' | 'joinDate'>) => void;
  onImportClients?: (newClients: Client[]) => void;
  onUpdateClient?: (updatedClient: Client) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({ 
  clients, 
  onAddClient, 
  onImportClients,
  onUpdateClient,
  onDeleteClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BureauStatus | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Client | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedClients, setImportedClients] = useState<any[]>([]);
  const [showImportReview, setShowImportReview] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importStats, setImportStats] = useState({ total: 0, valid: 0, dups: 0 });

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

  // CSV Import and Template Operations
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const parseCSV = (text: string) => {
    // Detect delimiters (comma vs semicolon)
    const firstLine = text.split('\n')[0] || '';
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ';' : ',';

    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentToken = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentToken += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        row.push(currentToken.trim());
        currentToken = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentToken.trim());
        if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
          lines.push(row);
        }
        row = [];
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
    if (currentToken !== '' || row.length > 0) {
      row.push(currentToken.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
    }
    return lines;
  };

  const normalizeHeader = (raw: string) => {
    return raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '')
      .trim();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileText = event.target?.result as string;
        if (!fileText) {
          setImportError('No se pudo leer el contenido del archivo.');
          return;
        }

        const parsedLines = parseCSV(fileText);
        if (parsedLines.length < 2) {
          setImportError('El archivo CSV está vacío o carece de registros de datos.');
          return;
        }

        const headers = parsedLines[0].map(normalizeHeader);
        
        // Find indices with key-agnostic aliases
        const findIndex = (aliases: string[]) => {
          return headers.findIndex(h => aliases.includes(h));
        };

        const idIdx = findIndex(['id', 'clave', 'idcliente', 'clientid', 'contrato', 'codigo']);
        const nameIdx = findIndex(['nombre', 'name', 'razonsocial', 'nombrecompleto', 'cliente', 'expediente']);
        const rfcIdx = findIndex(['rfc', 'cverfc', 'taxid', 'tax_id']);
        const emailIdx = findIndex(['email', 'correo', 'correoelectronico', 'mail']);
        const phoneIdx = findIndex(['telefono', 'phone', 'celular', 'tel', 'cell']);
        const scoreIdx = findIndex(['creditscore', 'score', 'buro', 'puntos', 'calificacion', 'internal_score', 'scores', 'bureau_score']);
        const statusIdx = findIndex(['bureaustatus', 'status', 'estatus', 'riesgo', 'estatusburo', 'estatus_buro']);
        const creditIdx = findIndex(['totalcreditgranted', 'credito', 'totalcredito', 'limite', 'montocredito', 'monto_cupo', 'creditgranted']);
        const owedIdx = findIndex(['balanceowed', 'saldo', 'saldoinsoluto', 'deuda', 'montodeuda', 'balance', 'adeudo', 'saldo_deudor']);
        const delIdx = findIndex(['delinquencydays', 'retraso', 'diasretraso', 'retrasos', 'mora', 'diasmora', 'dias_retraso', 'dias_mora']);
        const catIdx = findIndex(['category', 'categoria', 'tipo', 'segmento', 'clase']);
        const memIdx = findIndex(['membership', 'membresia', 'suscripcion', 'plan']);
        const joinIdx = findIndex(['joindate', 'fecha', 'fechaalta', 'alta', 'ingreso', 'registro']);

        if (nameIdx === -1) {
          setImportError('Encabezado de columna obligatorio omitido: Nombre / Razón Social. Asegúrate de incluir una columna llamada "Nombre" o "Cliente".');
          return;
        }

        const existingIds = new Set(clients.map(c => c.id));
        const existingRfcs = new Set(clients.map(c => c.rfc.toUpperCase()));

        const imported: any[] = [];
        let dupCount = 0;
        let validCount = 0;

        for (let i = 1; i < parsedLines.length; i++) {
          const row = parsedLines[i];
          if (row.length < 2 || (row.length === 1 && row[0] === '')) continue;

          const rawId = idIdx >= 0 && row[idIdx] ? row[idIdx].trim() : '';
          const rawName = nameIdx >= 0 && row[nameIdx] ? row[nameIdx].trim() : '';
          const rawRfc = rfcIdx >= 0 && row[rfcIdx] ? row[rfcIdx].trim() : '';
          const rawEmail = emailIdx >= 0 && row[emailIdx] ? row[emailIdx].trim() : '';
          const rawPhone = phoneIdx >= 0 && row[phoneIdx] ? row[phoneIdx].trim() : '';
          
          let parsedScore = 650;
          if (scoreIdx >= 0 && row[scoreIdx]) {
            const sc = parseInt(row[scoreIdx].toString().replace(/[^0-9]/g, ''), 10);
            if (!isNaN(sc)) parsedScore = sc;
          }
          
          const rawStatus = statusIdx >= 0 && row[statusIdx] ? row[statusIdx].trim().toUpperCase() : '';
          
          let parsedCredit = 150000;
          if (creditIdx >= 0 && row[creditIdx]) {
            const cr = parseFloat(row[creditIdx].toString().replace(/[^0-9.]/g, ''));
            if (!isNaN(cr)) parsedCredit = cr;
          }

          let parsedOwed = 0;
          if (owedIdx >= 0 && row[owedIdx]) {
            const ow = parseFloat(row[owedIdx].toString().replace(/[^0-9.]/g, ''));
            if (!isNaN(ow)) parsedOwed = ow;
          }

          let parsedDel = 0;
          if (delIdx >= 0 && row[delIdx]) {
            const dl = parseInt(row[delIdx].toString().replace(/[^0-9]/g, ''), 10);
            if (!isNaN(dl)) parsedDel = dl;
          }

          const rawCat = catIdx >= 0 && row[catIdx] ? row[catIdx].trim() : '';
          const rawMem = memIdx >= 0 && row[memIdx] ? row[memIdx].trim() : '';
          const rawJoin = joinIdx >= 0 && row[joinIdx] ? row[joinIdx].trim() : '';

          if (!rawName) continue;

          // Check for collision with existing DB
          const isDup = existingIds.has(rawId) || (rawRfc && existingRfcs.has(rawRfc.toUpperCase()));
          if (isDup) {
            dupCount++;
          } else {
            validCount++;
          }

          // Generate adaptive evaluation status
          let finalStatus: BureauStatus = 'REGULAR';
          if (['EXCELENTE', 'BUENO', 'REGULAR', 'ALERTA'].includes(rawStatus)) {
            finalStatus = rawStatus as BureauStatus;
          } else {
            if (parsedDel > 30) finalStatus = 'ALERTA';
            else if (parsedScore >= 720) finalStatus = 'EXCELENTE';
            else if (parsedScore >= 650) finalStatus = 'BUENO';
            else if (parsedScore >= 580) finalStatus = 'REGULAR';
            else finalStatus = 'ALERTA';
          }

          let finalCat: 'Comercial' | 'Personal' | 'Pyme' | 'Hipotecario' = 'Personal';
          const catL = rawCat.toLowerCase();
          if (catL.includes('comercial') || catL.includes('corp')) finalCat = 'Comercial';
          else if (catL.includes('pyme') || catL.includes('negocio')) finalCat = 'Pyme';
          else if (catL.includes('hipo')) finalCat = 'Hipotecario';

          let finalMem: 'Ninguna' | 'Básica' | 'Premium' = 'Ninguna';
          const memL = rawMem.toLowerCase();
          if (memL.includes('pre') || memL.includes('vip')) finalMem = 'Premium';
          else if (memL.includes('bas')) finalMem = 'Básica';

          imported.push({
            id: rawId || `PM-${Math.floor(100000 + Math.random() * 900000)}`,
            name: rawName,
            rfc: rawRfc ? rawRfc.toUpperCase() : `XAXX010101${Math.floor(100 + Math.random() * 900)}`,
            email: rawEmail || `${rawName.toLowerCase().replace(/[^a-z0-9]/g, '')}@financiero.mx`,
            phone: rawPhone || `55-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9999)}`,
            creditScore: parsedScore,
            bureauStatus: finalStatus,
            totalCreditGranted: parsedCredit,
            balanceOwed: parsedOwed,
            delinquencyDays: parsedDel,
            category: finalCat,
            membership: finalMem,
            joinDate: rawJoin || new Date().toISOString().slice(0, 10),
            isDuplicate: isDup
          });
        }

        if (imported.length === 0) {
          setImportError('No se hallaron expedientes legibles o estructurados en el archivo.');
          return;
        }

        setImportStats({
          total: imported.length,
          valid: validCount,
          dups: dupCount
        });
        setImportedClients(imported);
        setShowImportReview(true);
        setImportError(null);
      } catch (err) {
        console.error(err);
        setImportError('Error fatal durante la decodificación del archivo CSV.');
      }
    };
    reader.readAsText(file);
  };

  const executeCSVImport = () => {
    if (!onImportClients) {
      alert('La función de importación masiva no está inicializada.');
      return;
    }

    const validOnly = importedClients.filter(c => !c.isDuplicate);
    if (validOnly.length === 0) {
      alert('Imposible finalizar importación: Ningún expediente es apto para adición debido a duplicidad de RFC/ID.');
      return;
    }

    onImportClients(validOnly);
    setImportSuccess(`Importación completada con éxito. Se añadieron ${validOnly.length} nuevos expedientes de clientes.`);
    setShowImportReview(false);
    setImportedClients([]);
    
    setTimeout(() => {
      setImportSuccess(null);
    }, 5000);
  };

  const downloadCSVTemplate = () => {
    const headers = 'ID,Nombre,RFC,Email,Telefono,Score,Estatus Buro,Credito Otorgado,Saldo Insoluto,Dias Retraso,Categoria,Membresia\n';
    const sampleRecord = 'PM-562091,"Armando Ruiz González",RUGA820512T83,armando.ruiz@ejemplo.mx,55-4921-3910,740,EXCELENTE,250000,45000,0,Pyme,Premium\n';
    const sampleRecord2 = 'PM-912543,"Laura Esthela Rocha",ROSL941102HM4,laura.rocha@ejemplo.mx,55-1490-5821,630,REGULAR,30000,28500,12,Personal,Ninguna\n';
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + sampleRecord + sampleRecord2);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'plantilla_cartera_clientes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes (popups) para poder exportar a PDF.');
      return;
    }

    const clientRows = filteredClients.map(c => `
      <tr style="border-bottom: 1px solid #e1e8ed;">
        <td style="padding: 10px 8px; font-weight: bold; font-family: monospace; font-size: 11px;">${c.id}</td>
        <td style="padding: 10px 8px;">
          <div style="font-weight: bold; font-size: 13px; color: #1e293b;">${c.name}</div>
          <div style="font-size: 11px; color: #64748b; font-family: monospace;">${c.rfc} • ${c.email}</div>
        </td>
        <td style="padding: 10px 8px; font-size: 11px; color: #334155;">${c.category}</td>
        <td style="padding: 10px 8px; text-align: center; font-weight: bold; color: ${c.creditScore >= 700 ? '#10b981' : c.creditScore >= 640 ? '#4f46e5' : '#eab308'}; font-family: monospace; font-size: 12px;">${c.creditScore}</td>
        <td style="padding: 10px 8px; text-align: center; font-size: 10px; font-weight: bold; font-family: monospace; letter-spacing: 0.5px;">${c.bureauStatus}</td>
        <td style="padding: 10px 8px; text-align: right; font-family: monospace; font-size: 11.5px; color: #0f172a; font-weight: 500;">$${c.totalCreditGranted.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px 8px; text-align: right; font-family: monospace; font-size: 11.5px; color: #475569;">$${c.balanceOwed.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px 8px; text-align: center; font-family: monospace; font-size: 11px;">
          <span style="padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; display: inline-block; background: ${c.delinquencyDays === 0 ? '#d1fae5; color: #065f46' : '#fef3c7; color: #92400e'}; border: 1px solid ${c.delinquencyDays === 0 ? '#a7f3d0' : '#fde68a'};">
            ${c.delinquencyDays === 0 ? 'Vigente' : `${c.delinquencyDays} días`}
          </span>
        </td>
        <td style="padding: 10px 8px; text-align: center; font-weight: bold; font-size: 10px; font-family: monospace; color: ${c.active !== false ? '#059669' : '#dc2626'}">
          ${c.active !== false ? '● ACTIVO' : '○ INACTIVO'}
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Cartera Consolidada - Harold Salazar</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #334155; padding: 40px; margin: 0; background-color: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; }
            .logo-text { font-size: 22px; font-weight: bold; color: #1e1b4b; text-transform: uppercase; letter-spacing: 1px; }
            .metadata { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }
            .title { text-align: center; margin-bottom: 25px; }
            .title h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
            .title p { margin: 5px 0 0 0; font-size: 12px; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #f8fafc; padding: 10px 8px; text-align: left; font-weight: bold; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 9.5px; letter-spacing: 0.5px; color: #475569; }
            .footer { border-top: 1px dashed #cbd5e1; margin-top: 50px; padding-top: 15px; text-align: center; font-size: 10px; color: #94a3b8; }
            @media print {
              .no-print { display: none; }
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-text">Harold Salazar S.A.</div>
              <div style="font-size: 11px; color: #475569; font-weight: bold;">Plataforma de Finanzas y Préstamos Consolidada</div>
            </div>
            <div class="metadata">
              <div><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-MX')}</div>
              <div><strong>Hora de Reporte:</strong> ${new Date().toLocaleTimeString('es-MX')}</div>
              <div><strong>Generado por:</strong> admin_harold</div>
            </div>
          </div>

          <div class="title">
            <h1>Reporte General de Cartera de Clientes</h1>
            <p>Resumen unificado de calificaciones de Buró Interno, saldos deudores e historiales de retrasos</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 10%">ID</th>
                <th style="width: 25%">Cliente / RFC</th>
                <th style="width: 10%">Sector</th>
                <th style="width: 8%; text-align: center;">Score</th>
                <th style="width: 11%; text-align: center;">Riesgo Buró</th>
                <th style="width: 13%; text-align: right;">Crd. Otorgado</th>
                <th style="width: 12%; text-align: right;">Sld. Insoluto</th>
                <th style="width: 12%; text-align: center;">Vencimiento</th>
                <th style="width: 10%; text-align: center;">Estatus</th>
              </tr>
            </thead>
            <tbody>
              ${clientRows}
            </tbody>
          </table>

          <div style="margin-top: 35px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; font-size: 11px; line-height: 1.5;">
            <strong>Aviso de Confidencialidad y Auditoría Bancaria:</strong> Este documento contiene información financiera confidencial sujeta a secreto bancario bajo la jurisdicción federal de cumplimiento interno en auditoría. Está estrictamente prohibido su intercambio sin la firma autorizada del administrador Harold Salazar.
          </div>

          <div class="footer">
            Consola Central Harold Salazar • Sistema de Seguridad contra Fraude y Administración del Riesgo de Crédito.
          </div>

          <div class="no-print" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              Imprimir / Guardar en PDF
            </button>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printSingleDossier = (client: Client) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes (popups) para poder imprimir el expediente.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Expediente de Cliente - \${client.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.6; background-color: #ffffff; }
            .header-table { width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
            .info-card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; background: #fafafa; }
            .info-card h3 { margin: 0 0 12px 0; font-size: 11.5px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; font-weight: bold; letter-spacing: 0.5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px; }
            .info-row strong { color: #0f172a; }
            .signature-area { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px; text-align: center; }
            .signature-line { border-top: 1px solid #475569; width: 80%; margin: 0 auto; padding-top: 8px; font-size: 11px; color: #64748b; font-weight: bold; }
            @media print {
              .no-print { display: none; }
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <table class="header-table" style="width: 100%;">
            <tr>
              <td>
                <div style="font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1e1b4b;">Harold Salazar S.A.</div>
                <div style="font-size: 10.5px; color: #475569; font-weight: bold;">Plataforma de Finanzas y Préstamos Consolidada</div>
              </td>
              <td style="text-align: right; font-size: 10.5px; color: #64748b; line-height: 1.4;">
                <div><strong>Expediente ID:</strong> \${client.id}</div>
                <div><strong>Fecha de Alta:</strong> \${client.joinDate}</div>
                <div><strong>Estatus Operativo:</strong> \${client.active !== false ? 'VIGENTE' : 'INHABILITADO POR CONTROL INTERNO'}</div>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin-bottom: 25px;">
            <p style="text-transform: uppercase; font-family: monospace; font-size: 10px; font-weight: bold; color: #4f46e5; margin: 0; letter-spacing: 1px;">SISTEMA CENTRAL DE BURÓ INTERNO</p>
            <h1 style="margin: 4px 0 0 0; font-size: 20px; color: #0f172a; text-transform: uppercase;">Acreditación Comercial de Expediente</h1>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <h3>Datos Generales del Titular</h3>
              <div class="info-row"><span>Nombre de Titular:</span> <strong>\${client.name}</strong></div>
              <div class="info-row"><span>RFC Consolidado:</span> <strong style="font-family: monospace; text-transform: uppercase;">\${client.rfc}</strong></div>
              <div class="info-row"><span>Número de Teléfono:</span> <strong style="font-family: monospace;">\${client.phone}</strong></div>
              <div class="info-row"><span>Email Asociado:</span> <strong>\${client.email}</strong></div>
              <div class="info-row"><span>Afiliación Inicial:</span> <strong>\${client.joinDate || 'N/A'}</strong></div>
            </div>

            <div class="info-card">
              <h3>Detalles de Calificación Crediticia</h3>
              <div class="info-row"><span>Score Buró Interno:</span> <strong style="font-size: 14px; color: #4f46e5;">\${client.creditScore} Pts</strong></div>
              <div class="info-row"><span>Nivel de Riesgo:</span> <strong>\${client.bureauStatus}</strong></div>
              <div class="info-row"><span>Giro Comercial:</span> <strong>\${client.category}</strong></div>
              <div class="info-row"><span>Membresía del Cliente:</span> <strong style="color: #b45309;">\${client.membership || 'Ninguna'}</strong></div>
              <div class="info-row"><span>SLA Retraso del Pago:</span> <strong>\${client.delinquencyDays === 0 ? 'Al corriente (0 Días)' : \`\${client.delinquencyDays} días acumulados\`}</strong></div>
            </div>
          </div>

          <div class="info-card" style="margin-bottom: 25px;">
            <h3>Condiciones Vigentes y Parámetros del Crédito</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center; padding: 5px 0;">
              <div>
                <span style="font-size: 10.5px; color: #64748b; display: block; text-transform: uppercase;">Línea de Crédito Autorizada</span>
                <strong style="font-size: 16px; color: #0f172a; font-family: monospace; display: block; margin-top: 4px;">$\${client.totalCreditGranted.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div>
                <span style="font-size: 10.5px; color: #64748b; display: block; text-transform: uppercase;">Saldo Deudor Insoluto</span>
                <strong style="font-size: 16px; color: #b91c1c; font-family: monospace; display: block; margin-top: 4px;">$\${client.balanceOwed.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div>
                <span style="font-size: 10.5px; color: #64748b; display: block; text-transform: uppercase;">Tasa Anual Aplicada (CAT)</span>
                <strong style="font-size: 16px; color: #047857; font-family: monospace; display: block; margin-top: 4px;">\${client.membership === 'Premium' ? '12.50% Anual (VIP)' : client.membership === 'Básica' ? '14.00% Anual' : '14.50% Anual'}</strong>
              </div>
            </div>
          </div>

          <div style="font-size: 11.5px; line-height: 1.6; color: #475569; text-align: justify; margin: 25px 0; border-left: 3px solid #cbd5e1; padding-left: 12px;">
            <strong>Declaración Juramentada de Cumplimiento:</strong> Por medio de este dictamen mecanizado, la Dirección de Crédito avala el comportamiento del titular del expediente. El cliente se compromete a liquidar de forma oportuna cualquier balance de cuotas de amortización o tasas de penalización acumulables para evitar el reporte a entidades regulatorias del Buró Nacional de Crédito mexicano.
          </div>

          <div class="signature-area">
            <div>
              <div style="height: 45px;"></div>
              <div class="signature-line">\${client.name}</div>
              <div style="font-size: 9.5px; color: #94a3b8; text-transform: uppercase;">Firma Titular Avalado</div>
            </div>
            <div>
              <div style="height: 45px;"></div>
              <div class="signature-line">Harold Salazar Salazar</div>
              <div style="font-size: 9.5px; color: #94a3b8; text-transform: uppercase;">Sello de Autorización Bancaria</div>
            </div>
          </div>

          <div class="no-print" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #1e1b4b; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15);">
              Enviar a Impresora / Guardar PDF
            </button>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Title block */}
      <div className="p-6 border-b border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-950/40">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Gestión Integrada de Cartera ({filteredClients.length})
          </h2>
          <p className="text-xs text-slate-400">Expedientes consolidados, control de saldos y evaluación de riesgo comercial/personal.</p>
        </div>
        
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 shadow-md cursor-pointer border border-indigo-500/50 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Alta Cliente
          </button>

          {/* Hidden File Input for CSV Import */}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />

          <button
            onClick={triggerFileInput}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 shadow-md cursor-pointer border border-emerald-500/50 shrink-0"
            title="Importar un archivo CSV con múltiples clientes a la vez"
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </button>
          
          <button
            onClick={exportToCSV}
            className="border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Exportar CSV
          </button>
          
          <button
            onClick={exportToPDF}
            className="border border-[#a3c90e]/30 bg-slate-900 text-[#a3c90e] hover:bg-slate-850 hover:text-[#c4ef13] text-xs font-bold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* CSV IMPORT SUCCESS BANNER */}
      {importSuccess && (
        <div className="mx-6 mt-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3 text-left">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase font-mono">
              Proceso de Importación Completado
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium">
              {importSuccess} Todos los registros se han incorporado con éxito a la base de datos de la cartera activa.
            </p>
          </div>
          <button onClick={() => setImportSuccess(null)} className="ml-auto text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CSV IMPORT ERROR BANNER */}
      {importError && (
        <div className="mx-6 mt-5 bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase font-mono text-rose-400">
              Error de Estructura de Importación
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {importError} Asegúrate de utilizar los formatos correctos para tu documento.
            </p>
            <button
              onClick={downloadCSVTemplate}
              className="text-[10px] text-indigo-400 hover:text-indigo-350 underline font-mono font-bold block pt-1 cursor-pointer"
            >
              📥 Descargar Plantilla Oficial CSV (.csv)
            </button>
          </div>
          <button onClick={() => setImportError(null)} className="ml-auto text-slate-450 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* GLOWING INDICATOR BANNER FOR THE PDF INJECTED CLIENTS */}
      <div className="mx-6 mt-5 bg-[#a3c90e]/10 border border-[#a3c90e]/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#a3c90e] text-slate-950 font-mono text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
              ✨ PDF DETECTADO E INYECTADO
            </span>
            <span className="text-[10px] font-mono text-[#a3c90e] font-bold">Consola Salda App</span>
          </div>
          <h4 className="text-xs font-bold text-white uppercase font-mono">
            Se registraron con éxito 15 nuevos clientes de muestra extraídos del PDF
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            Se detectaron los registros de Melvin Zauriel, Janeth Alejandra, Luis Antonio, Rocio Elizabeth, Maria Karen, José Francisco, Agustín, Margarita, Ángeles, Ma del Carmen, Esmeralda, Fernanda, Esperanza, Ileana y José Manuel. Ya están unificados en este panel y listos para simular su abono o cobro.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setSearchTerm('PM-')}
            className="bg-[#a3c90e] hover:bg-[#b8e014] text-slate-950 text-[10px] font-black px-3.5 py-2 rounded-xl transition duration-150 uppercase tracking-tight shadow-md cursor-pointer"
          >
            Filtrar Registros PDF
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
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono flex items-center gap-1.5 text-indigo-400">
              <UserPlus className="w-4 h-4" /> Alta de Cliente en Cartera Activa
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 bg-slate-900 border border-[#a3c90e]/30 rounded-xl p-3 text-xs text-[#a3c90e] flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-[#a3c90e] shrink-0 mt-0.5 animate-pulse" />
            <div>
              <span className="font-bold">Fideicomiso Integrado de Registro (PM-XXXXXX):</span> Al dar de alta este cliente, el sistema generará automáticamente una clave de registro unificada. Esta clave servirá simultáneamente como <strong>ID del Cliente</strong>, <strong>Número de Contrato de su Préstamo</strong>, e <strong>Identificador para su Pago</strong> (Referencia Bancaria/SPEI/Oxxo), permitiendo una conciliación del 100% en tiempo real.
            </div>
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
              <th className="py-3.5 px-5 text-center">Estado</th>
              <th className="py-3.5 px-5 text-center">Acciones</th>
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

                    {/* Active/Inactive Estado */}
                    <td className="py-4 px-5 text-center">
                      {c.active !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-slate-450 bg-slate-500/15 border border-slate-700/30">
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          Inactivo
                        </span>
                      )}
                    </td>

                    {/* Action buttons with stopPropagation */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex justify-center items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          title="Ver Expediente"
                          onClick={() => {
                            setSelectedClient(c);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:text-white rounded-lg text-slate-300 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Editar Expediente"
                          onClick={() => {
                            setEditForm({ ...c });
                            setIsEditing(true);
                          }}
                          className="p-1.5 bg-indigo-950/20 hover:bg-indigo-600/25 border border-indigo-900 hover:border-indigo-500 text-indigo-400 hover:text-white rounded-lg transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title={c.active !== false ? "Desactivar" : "Activar"}
                          onClick={() => {
                            if (onUpdateClient) {
                              onUpdateClient({ ...c, active: c.active === false });
                            }
                          }}
                          className={`p-1.5 border rounded-lg transition cursor-pointer ${
                            c.active !== false 
                              ? 'bg-amber-955/20 hover:bg-amber-600/20 border-amber-900/60 text-amber-450 hover:text-amber-300' 
                              : 'bg-emerald-955/20 hover:bg-emerald-600/20 border-emerald-900/60 text-emerald-450 hover:text-emerald-300'
                          }`}
                        >
                          <span className="text-[9px] font-mono font-black tracking-tighter">
                            {c.active !== false ? "DES" : "ACT"}
                          </span>
                        </button>
                        <button
                          title="Eliminar Expediente"
                          onClick={() => {
                            setConfirmDeleteId(c.id);
                          }}
                          className="p-1.5 bg-rose-955/25 hover:bg-rose-600/30 border border-rose-900/60 hover:border-rose-500/80 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
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
            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => printSingleDossier(selectedClient)}
                className="bg-[#a3c90e]/10 border border-[#a3c90e]/20 hover:bg-[#a3c90e]/20 text-[#a3c90e] text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                title="Generar Ficha Financiera e Imprimir en PDF"
              >
                <Printer className="w-4 h-4" />
                Imprimir Ficha
              </button>

              <button
                onClick={() => {
                  setEditForm({ ...selectedClient });
                  setIsEditing(true);
                  setSelectedClient(null); // Close the detail popup when entering editor
                }}
                className="bg-indigo-950/40 border border-indigo-805 border-indigo-500/30 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                title="Editar este expediente"
              >
                <Edit className="w-4 h-4" />
                Editar Perfil
              </button>

              <button
                onClick={() => setSelectedClient(null)}
                className="bg-slate-850 hover:bg-slate-800 text-slate-100 text-xs font-semibold py-2.5 px-6 rounded-xl transition cursor-pointer border border-slate-750"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG OVERLAY */}
      {isEditing && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-slideUp">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-5">
              <div>
                <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 bg-indigo-550/10 border border-indigo-550/20 px-2.5 py-1 rounded w-fit">
                  <Edit className="w-3.5 h-3.5" /> Editor de Expedientes
                </h3>
                <h4 className="text-lg font-bold text-white leading-tight">Modificar Cliente: {editForm.id}</h4>
              </div>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(null);
                }}
                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer border border-slate-750"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (onUpdateClient && editForm) {
                onUpdateClient(editForm);
              }
              setIsEditing(false);
              setEditForm(null);
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre Completo del Cliente</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">RFC Local</label>
                  <input
                    type="text"
                    required
                    value={editForm.rfc}
                    onChange={(e) => setEditForm({ ...editForm, rfc: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Teléfono Enlace</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Correo Electrónico Oficial</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Score Histórico</label>
                  <input
                    type="number"
                    min="300"
                    max="850"
                    required
                    value={editForm.creditScore}
                    onChange={(e) => {
                      const score = Number(e.target.value);
                      let bStatus: any = 'REGULAR';
                      if (score >= 700) bStatus = 'EXCELENTE';
                      else if (score >= 640) bStatus = 'BUENO';
                      else if (score >= 580) bStatus = 'REGULAR';
                      else bStatus = 'ALERTA';

                      setEditForm({ 
                        ...editForm, 
                        creditScore: score,
                        bureauStatus: bStatus
                      });
                    }}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Días de Retraso</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.delinquencyDays}
                    onChange={(e) => setEditForm({ ...editForm, delinquencyDays: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Membresía</label>
                  <select
                    value={editForm.membership || 'Ninguna'}
                    onChange={(e) => setEditForm({ ...editForm, membership: e.target.value as any })}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Ninguna">Ninguna</option>
                    <option value="Básica">Básica</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Categoría</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Pyme">Pyme</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Hipotecario">Hipotecario</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Crédito Concedido</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.totalCreditGranted}
                    onChange={(e) => setEditForm({ ...editForm, totalCreditGranted: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo Insoluto</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.balanceOwed}
                    onChange={(e) => setEditForm({ ...editForm, balanceOwed: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="edit-active-status"
                  checked={editForm.active !== false}
                  onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="edit-active-status" className="text-xs text-slate-300 font-semibold cursor-pointer select-none">
                  Expediente Activo y Vigente para Operación Comercial
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition duration-150 shadow-md cursor-pointer border border-indigo-500/50"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETION DIALOG OVERLAY */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden text-center space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-550 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-455">
              <AlertTriangle className="w-7 h-7 text-rose-450 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xs font-bold font-mono text-rose-450 uppercase tracking-widest block mb-1">
                Remoción de Expediente
              </h3>
              <h4 className="text-base font-bold text-white">¿Deseas eliminar este registro?</h4>
              <p className="text-left text-[11px] text-slate-400 mt-2 font-sans leading-normal">
                Esta acción es irreversible y removerá permanentemente al cliente <span className="text-white font-mono font-bold">{confirmDeleteId}</span> de la Consola Única de Harold, registrando un log de auditoría.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 cursor-pointer"
              >
                No, Cancelar
              </button>
              <button
                onClick={() => {
                  if (onDeleteClient && confirmDeleteId) {
                    onDeleteClient(confirmDeleteId);
                  }
                  setConfirmDeleteId(null);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW DIALOG MODAL FOR CSV IMPORT */}
      {showImportReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] text-left">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse-slow" />
            
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-5 shrink-0">
              <div>
                <h3 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-1 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-lg w-fit">
                  <Upload className="w-3.5 h-3.5" /> Vista Previa de Importación Masiva
                </h3>
                <h4 className="text-xl font-bold text-white leading-tight">Análisis del Archivo de Clientes</h4>
              </div>
              <button 
                onClick={() => {
                  setShowImportReview(false);
                  setImportedClients([]);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics and Warnings banner */}
            <div className="grid grid-cols-3 gap-3 mb-4 shrink-0 font-mono">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 uppercase block tracking-wider font-semibold">Total Evaluados</span>
                <span className="text-lg sm:text-2xl font-black text-white block mt-0.5">{importStats.total}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-455 text-slate-400 uppercase block tracking-wider font-semibold">Aptos (Nuevos)</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-400 block mt-0.5">{importStats.valid}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-455 text-slate-400 uppercase block tracking-wider font-semibold">Duplicados</span>
                <span className="text-lg sm:text-2xl font-black text-amber-500 block mt-0.5">{importStats.dups}</span>
              </div>
            </div>

            {importStats.dups > 0 && (
              <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] p-3 rounded-xl flex items-start gap-2.5 shrink-0 leading-normal font-sans">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Aviso de Conciliación Normativa:</strong> Se detectaron {importStats.dups} expedientes cuyos RFCs o IDs ya existen en la cartera de Harold. Para cumplir con las directrices de auditoría, el sistema omitirá estos duplicados e inyectará los {importStats.valid} registros nuevos de forma segura.
                </div>
              </div>
            )}

            {/* Table / List scrollable of parsed records */}
            <div className="overflow-y-auto flex-1 border border-slate-800 rounded-2xl bg-slate-950 mb-5 max-h-[40vh]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                    <th className="py-2.5 px-4 bg-slate-950">ID / RFC</th>
                    <th className="py-2.5 px-4 bg-slate-950">Nombre / Contacto</th>
                    <th className="py-2.5 px-4 bg-slate-950">Segmento</th>
                    <th className="py-2.5 px-4 bg-slate-950 text-center">Score</th>
                    <th className="py-2.5 px-4 bg-slate-950 text-right">Crédito</th>
                    <th className="py-2.5 px-4 bg-slate-950 text-right">Saldo</th>
                    <th className="py-2.5 px-4 bg-slate-950 text-center font-bold">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-[11px]">
                  {importedClients.map((c, index) => (
                    <tr 
                      key={index} 
                      className={`hover:bg-slate-900/40 transition duration-105 ${
                        c.isDuplicate ? 'opacity-40 bg-amber-500/[0.02]' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-mono font-medium">
                        <div className="text-white font-bold">{c.id}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{c.rfc}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-200">{c.name}</div>
                        <div className="text-[9px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{c.email}</span>
                          <span>•</span>
                          <span>{c.phone}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold font-mono">{c.category}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-300">
                        {c.creditScore}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-305">
                        {formatMXN(c.totalCreditGranted)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-rose-350">
                        {formatMXN(c.balanceOwed)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {c.isDuplicate ? (
                          <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Duplicado
                          </span>
                        ) : (
                          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase tracking-wider">
                            Listo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions for review */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 font-sans">
              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="text-indigo-400 hover:text-indigo-350 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                📥 Descargar Plantilla Guía (.csv)
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportReview(false);
                    setImportedClients([]);
                  }}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer border border-slate-700 mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executeCSVImport}
                  disabled={importStats.valid === 0}
                  className={`w-full sm:w-auto font-black text-xs px-6 py-2.5 rounded-xl transition cursor-pointer text-center text-slate-950 ${
                    importStats.valid === 0
                      ? 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-750'
                      : 'bg-emerald-400 hover:bg-emerald-350 shadow-lg shadow-emerald-500/10 font-bold'
                  }`}
                >
                  Confirmar e Inyectar ({importStats.valid})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
