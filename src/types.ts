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
