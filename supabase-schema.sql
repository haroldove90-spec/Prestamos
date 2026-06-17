-- ============================================================================
-- SALDA APP - CONFIGURACIÓN DE TABLAS DE BASE DE DATOS EN SUPABASE
-- Copia y pega este script en el editor SQL de tu panel de Supabase (SQL Editor)
-- Proyecto ID: ljtehieijrdsabmvjbcl
-- ============================================================================

-- 1. TABLA: clients
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rfc TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  "creditScore" INT NOT NULL,
  "bureauStatus" TEXT NOT NULL,
  "totalCreditGranted" NUMERIC NOT NULL,
  "balanceOwed" NUMERIC NOT NULL,
  "delinquencyDays" INT NOT NULL,
  category TEXT NOT NULL,
  "joinDate" TEXT NOT NULL,
  membership TEXT NOT NULL DEFAULT 'Ninguna',
  "facebookProfile" TEXT,
  "locationLink" TEXT
);

-- 2. TABLA: requests
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  "clientName" TEXT NOT NULL,
  "requestedAmount" NUMERIC NOT NULL,
  purpose TEXT NOT NULL,
  score INT NOT NULL,
  category TEXT NOT NULL,
  "dateSubmitted" TEXT NOT NULL,
  status TEXT NOT NULL
);

-- 3. TABLA: queries
CREATE TABLE IF NOT EXISTS public.queries (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  "queriedClientName" TEXT NOT NULL,
  "requestedBy" TEXT NOT NULL,
  "scoreFound" INT NOT NULL,
  resolution TEXT NOT NULL
);

-- 4. TABLA: risk_params
CREATE TABLE IF NOT EXISTS public.risk_params (
  id TEXT PRIMARY KEY, -- 'PARAMS_SINGLETON'
  "minScoreAutoApproval" INT NOT NULL,
  "maxDelinquencyDaysAllowed" INT NOT NULL,
  "baseInterestRate" NUMERIC NOT NULL
);

-- 5. TABLA: security_alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  device TEXT NOT NULL,
  "user" TEXT NOT NULL,
  "actionBlocked" TEXT NOT NULL,
  "targetClient" TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT
);

-- 6. TABLA: client_payments
CREATE TABLE IF NOT EXISTS public.client_payments (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  "evidenceImage" TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  reference TEXT
);

-- 7. TABLA: dossiers
CREATE TABLE IF NOT EXISTS public.dossiers (
  id TEXT PRIMARY KEY,
  "clientName" TEXT NOT NULL,
  address TEXT NOT NULL,
  "birthDate" TEXT NOT NULL,
  "ineFront" TEXT NOT NULL,
  "ineBack" TEXT NOT NULL,
  "proofOfAddress" TEXT NOT NULL,
  "requestedAmount" NUMERIC NOT NULL,
  status TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "adminNotes" TEXT,
  "notificationDismissed" BOOLEAN NOT NULL DEFAULT false,
  "facebookProfile" TEXT,
  "locationLink" TEXT
);

-- 8. TABLA: system_notifications
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'success', 'info', 'warning', 'error'
  "targetRoles" TEXT NOT NULL, -- list of roles separated by commas
  timestamp TEXT NOT NULL,
  "readBy" TEXT NOT NULL, -- list of users who have read the notification separated by commas
  "soundPlayed" BOOLEAN NOT NULL DEFAULT false
);

-- Configuración de políticas de seguridad fáciles para el cliente (Anon Key Access)
-- Desactivar RLS o habilitar libre escritura y lectura para que la app cliente funcione de inmediato:
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_params DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications DISABLE ROW LEVEL SECURITY;

-- En caso de tener RLS activado por defecto globalmente, creamos políticas permisivas para anon:
DO $$
BEGIN
    -- CLIENTS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.clients FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    -- REQUESTS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'requests' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.requests FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- QUERIES
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'queries' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.queries FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- RISK PARAMS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'risk_params' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.risk_params FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- SECURITY ALERTS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_alerts' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.security_alerts FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- CLIENT PAYMENTS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_payments' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.client_payments FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- DOSSIERS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dossiers' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.dossiers FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- SYSTEM NOTIFICATIONS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_notifications' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.system_notifications FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- ============================================================================
-- MIGRACIÓN ADICIONAL (Para bases de datos ya existentes)
-- Ejecuta estas líneas si ya tenías las tablas consolidadas del sistema anterior:
-- ============================================================================
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "facebookProfile" TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "locationLink" TEXT;
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS "facebookProfile" TEXT;
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS "locationLink" TEXT;
