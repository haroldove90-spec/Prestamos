import { createClient } from '@supabase/supabase-js';
import { Client, CreditRequest, BureauQueryLog, RiskParameters, ClientPayment } from './types';
import { SecurityIncident } from './components/SecurityAuditModule';

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || 'https://ljtehieijrdsabmvjbcl.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqdGVoaWVpanJkc2FibXZqYmNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjQ3MTgsImV4cCI6MjA5NTkwMDcxOH0.bAiBHS2S_gaqRPovSs7b-89fr3c0xjZJ--k934dCP-o';

// Initialize the Supabase client safely
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Checks if a table is accessible in Supabase by running a cheap SELECT query.
 */
async function checkTableAccessible(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(tableName).select('id').limit(1);
    if (error && error.code === '42P01') {
      // 42P01 is PostgreSQL code for undefined_table
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the required tables exist in Supabase.
 */
export async function verifyTablesExist(): Promise<boolean> {
  const essentialTables = ['clients', 'requests', 'queries', 'risk_params', 'security_alerts', 'client_payments'];
  for (const table of essentialTables) {
    const ok = await checkTableAccessible(table);
    if (!ok) return false;
  }
  return true;
}

// ============================================================================
// CLOUD RETRIEVAL AND SEEDING LOOPS
// ============================================================================

export async function fetchClientsCloud(): Promise<Client[] | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.warn('Error fetching clients from Supabase:', error);
      return null;
    }
    return data as Client[];
  } catch (err) {
    console.error('Supabase fetchClients exception:', err);
    return null;
  }
}

export async function saveClientCloud(client: Client): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .upsert(client);
    if (error) console.error('Error saving client to Supabase:', error);
    return !error;
  } catch (err) {
    console.error('Supabase exception saving client:', err);
    return false;
  }
}

export async function bulkInsertClientsCloud(clients: Client[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .upsert(clients);
    return !error;
  } catch (err) {
    console.error('Supabase bulk clients save error:', err);
    return false;
  }
}

// REQ
export async function fetchRequestsCloud(): Promise<CreditRequest[] | null> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('id', { ascending: true });
    if (error) return null;
    return data as CreditRequest[];
  } catch {
    return null;
  }
}

export async function saveRequestCloud(request: CreditRequest): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('requests')
      .upsert(request);
    return !error;
  } catch {
    return false;
  }
}

export async function bulkInsertRequestsCloud(reqs: CreditRequest[]): Promise<boolean> {
  try {
    const { error } = await supabase.from('requests').upsert(reqs);
    return !error;
  } catch {
    return false;
  }
}

// B_QUERIES
export async function fetchQueriesCloud(): Promise<BureauQueryLog[] | null> {
  try {
    const { data, error } = await supabase
      .from('queries')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) return null;
    return data as BureauQueryLog[];
  } catch {
    return null;
  }
}

export async function saveQueryCloud(log: BureauQueryLog): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('queries')
      .upsert(log);
    return !error;
  } catch {
    return false;
  }
}

export async function bulkInsertQueriesCloud(logs: BureauQueryLog[]): Promise<boolean> {
  try {
    const { error } = await supabase.from('queries').upsert(logs);
    return !error;
  } catch {
    return false;
  }
}

// RISK PARAMS
export async function fetchRiskParamsCloud(): Promise<RiskParameters | null> {
  try {
    const { data, error } = await supabase
      .from('risk_params')
      .select('*')
      .limit(1);
    if (error || !data || data.length === 0) return null;
    return data[0] as RiskParameters;
  } catch {
    return null;
  }
}

export async function saveRiskParamsCloud(params: RiskParameters): Promise<boolean> {
  try {
    // Since there's one parameters record, we use a constant ID or single row override representation
    const payload = {
      id: 'PARAMS_SINGLETON',
      minScoreAutoApproval: params.minScoreAutoApproval,
      maxDelinquencyDaysAllowed: params.maxDelinquencyDaysAllowed,
      baseInterestRate: params.baseInterestRate
    };
    const { error } = await supabase
      .from('risk_params')
      .upsert(payload);
    return !error;
  } catch {
    return false;
  }
}

// ALERTS
export async function fetchSecurityAlertsCloud(): Promise<SecurityIncident[] | null> {
  try {
    const { data, error } = await supabase
      .from('security_alerts')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) return null;
    return data as SecurityIncident[];
  } catch {
    return null;
  }
}

export async function saveSecurityAlertCloud(incident: SecurityIncident): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('security_alerts')
      .upsert(incident);
    return !error;
  } catch {
    return false;
  }
}

export async function bulkInsertSecurityAlertsCloud(alerts: SecurityIncident[]): Promise<boolean> {
  try {
    const { error } = await supabase.from('security_alerts').upsert(alerts);
    return !error;
  } catch {
    return false;
  }
}

export async function clearSecurityAlertsCloud(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('security_alerts')
      .delete()
      .not('id', 'is', null); // Delete all Rows
    return !error;
  } catch {
    return false;
  }
}

// PAYMENTS
export async function fetchPaymentsCloud(): Promise<ClientPayment[] | null> {
  try {
    const { data, error } = await supabase
      .from('client_payments')
      .select('*')
      .order('date', { ascending: false });
    if (error) return null;
    return data as ClientPayment[];
  } catch {
    return null;
  }
}

export async function savePaymentCloud(payment: ClientPayment): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('client_payments')
      .upsert(payment);
    return !error;
  } catch {
    return false;
  }
}

export async function bulkInsertPaymentsCloud(payments: ClientPayment[]): Promise<boolean> {
  try {
    const { error } = await supabase.from('client_payments').upsert(payments);
    return !error;
  } catch {
    return false;
  }
}
