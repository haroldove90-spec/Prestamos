import { Client } from '../types';

export interface LateFeeResult {
  isWeekly: boolean;
  ratePerDay: number;
  totalFee: number;
  delinquencyDays: number;
  label: string;
}

/**
 * Calculates the late fee config and details for a given client.
 * Rules:
 *  - Clients with weekly plans ("12 semanas" or hasweekly in plan name): $100 pesos per delinquency day.
 *  - Other clients (e.g. Préstamo Fijo, Commercial or default other category): $400 pesos per delinquency day.
 */
export function getLateFeeConfig(client: Client): LateFeeResult {
  const delinquencyDays = client.delinquencyDays || 0;
  
  // A client has a weekly loan if:
  // - loanType is explicitly "12 semanas"
  // - or monthlyPlan has "semana", "semanal"
  // - or we default base on category 'Personal' as weekly since in this system Personal Loans are 12 semanas weekly by default
  const isWeekly = 
    client.loanType === '12 semanas' || 
    (client.monthlyPlan !== undefined && /semana|semanal/i.test(client.monthlyPlan)) ||
    client.category === 'Personal';

  const ratePerDay = isWeekly ? 100 : 400;
  const totalFee = delinquencyDays > 0 ? delinquencyDays * ratePerDay : 0;
  
  return {
    isWeekly,
    ratePerDay,
    totalFee,
    delinquencyDays,
    label: isWeekly ? '$100 MXN / Día (Planes Semanales - 12 Semanas)' : '$400 MXN / Día (Planes de Pago Fijo / Comerciales)',
  };
}

/**
 * Returns the dynamic total debt including accumulated late fees.
 */
export function getEffectiveTotalDebt(client: Client): number {
  const config = getLateFeeConfig(client);
  return (client.balanceOwed || 0) + config.totalFee;
}
