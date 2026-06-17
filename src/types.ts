/**
 * types.ts
 * Shared TypeScript definitions.
 */

export type BureauStatus = 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'ALERTA';

export interface Client {
  id: string;
  name: string;
  rfc: string;
  email: string;
  phone: string;
  creditScore: number; // 300 to 850
  bureauStatus: BureauStatus;
  totalCreditGranted: number;
  balanceOwed: number;
  delinquencyDays: number;
  category: 'Comercial' | 'Personal' | 'Pyme' | 'Hipotecario';
  joinDate: string;
  membership?: 'Ninguna' | 'Básica' | 'Premium';
  active?: boolean;
  username?: string;
  password?: string;
  profileImage?: string;
  facebookProfile?: string;
  locationLink?: string;
}

export interface CreditRequest {
  id: string;
  clientName: string;
  requestedAmount: number;
  purpose: string;
  score: number;
  category: 'Comercial' | 'Personal' | 'Pyme' | 'Hipotecario';
  dateSubmitted: string;
  status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  loanType?: string;
  monthlyPlan?: string;
}

export interface BureauQueryLog {
  id: string;
  timestamp: string;
  queriedClientName: string;
  requestedBy: string;
  scoreFound: number;
  resolution: string;
}

export interface RiskParameters {
  minScoreAutoApproval: number;
  maxDelinquencyDaysAllowed: number;
  baseInterestRate: number;
}

export interface ClientPayment {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  evidenceImage: string; // Base64 or mock visual resource URL
  status: 'PENDIENTE' | 'PAGO_REALIZADO' | 'RECHAZADO';
  notes?: string;
  reference?: string;
}

export interface ClientContract {
  id: string;
  clientId: string;
  clientName: string;
  contractType: 'Contrato Express' | 'Contrato de préstamo entre particulares';
  amount: number;
  paymentReference: string;
  dateGenerated: string;
  monthlyPlan?: string;
  status: 'ACTIVO' | 'FIRMADO' | 'PENDIENTE';
}

export interface ClientDossier {
  id: string;
  clientName: string;
  address: string;
  birthDate: string;
  ineFront: string;
  ineBack: string;
  proofOfAddress: string;
  requestedAmount: number;
  status: 'ANALIZANDO' | 'APROBADO' | 'RECHAZADO';
  createdAt: string;
  adminNotes?: string;
  notificationDismissed: boolean;
  loanType?: string;
  monthlyPlan?: string;
  facebookProfile?: string;
  locationLink?: string;
}

export const PRESTAMOS_FIJOS = [
  { capital: 3000, interest: 1200, label: "$3,000 para pagar $4,200" },
  { capital: 4000, interest: 1600, label: "$4,000 para pagar $5,600" },
  { capital: 5000, interest: 2000, label: "$5,000 para pagar $7,000" },
  { capital: 6000, interest: 2400, label: "$6,000 para pagar $8,400" },
  { capital: 7000, interest: 2800, label: "$7,000 para pagar $9,800" },
  { capital: 8000, interest: 3200, label: "$8,000 para pagar $11,200" },
  { capital: 9000, interest: 3600, label: "$9,000 para pagar $12,600" },
  { capital: 10000, interest: 4000, label: "$10,000 para pagar $14,000" },
];


