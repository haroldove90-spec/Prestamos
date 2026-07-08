-- ============================================================================
-- SALDA APP - CONFIGURACIÓN COMPLETA DE TABLAS DE BASE DE DATOS EN SUPABASE
-- Copia y pega este script en el editor SQL de tu panel de Supabase (SQL Editor)
-- Proyecto ID: ljtehieijrdsabmvjbcl
-- 
-- ⚠️ NOTA IMPORTANTE PARA EVITAR EL ERROR "column active of relation clients does not exist":
-- PostgreSQL analiza y compila todas las instrucciones del bloque SQL antes de ejecutarlas.
-- Si tu tabla 'clients' ya existía anteriormente sin la columna 'active', el editor de Supabase
-- arrojará un error al compilar el bloque de "INSERT" porque la columna 'active' aún no está 
-- guardada en la base de datos física al momento del análisis.
-- 
-- 🚀 SOLUCIÓN EN 2 PASOS SENCILLOS:
-- PASO 1: Copia, pega y ejecuta primero SOLAMENTE la sección de creación y migración 
--         (desde el inicio de este archivo hasta la línea 157, es decir, antes de los INSERT).
--         Esto creará las tablas y agregará la columna 'active' mediante ALTER TABLE.
-- PASO 2: Ahora sí, ejecuta el resto del script (los INSERT de Diego Martínez y los administradores)
--         para insertar la información sin ningún error de compilación.
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
  "locationLink" TEXT,
  username TEXT,
  password TEXT,
  "profileImage" TEXT,
  active BOOLEAN NOT NULL DEFAULT true
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

-- 9. TABLA: contract_templates (Plantillas de Contratos)
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id TEXT PRIMARY KEY, -- 'express' | 'particulares'
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  declarations TEXT NOT NULL,
  clauses TEXT NOT NULL
);

-- 10. TABLA: terms_conditions (Términos y Condiciones)
CREATE TABLE IF NOT EXISTS public.terms_conditions (
  id TEXT PRIMARY KEY, -- 'terms_singleton'
  content TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

-- ============================================================================
-- MIGRACIÓN DE COLUMNAS DE SEGURIDAD (En caso de que las tablas ya existan)
-- ============================================================================
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "profileImage" TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "facebookProfile" TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "locationLink" TEXT;

ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS "facebookProfile" TEXT;
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS "locationLink" TEXT;

-- ============================================================================
-- DESACTIVACIÓN DE ROW LEVEL SECURITY (Para acceso simple con Anon Key)
-- ============================================================================
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_params DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_conditions DISABLE ROW LEVEL SECURITY;

-- Crear políticas permisivas como plan de respaldo por si RLS se mantiene activo
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

    -- CONTRACT TEMPLATES
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contract_templates' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.contract_templates FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- TERMS CONDITIONS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'terms_conditions' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.terms_conditions FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- ============================================================================
-- INSERTAR / ACTUALIZAR CREDENCIALES DEL CLIENTE DIEGO MARTÍNEZ HERNÁNDEZ
-- ============================================================================
INSERT INTO public.clients (
  id, 
  name, 
  rfc, 
  email, 
  phone, 
  "creditScore", 
  "bureauStatus", 
  "totalCreditGranted", 
  "balanceOwed", 
  "delinquencyDays", 
  category, 
  "joinDate", 
  membership, 
  username, 
  password, 
  "profileImage",
  active
)
VALUES (
  'CLI-260', 
  'Diego Martínez Hernández', 
  'MAHD990526HDF', 
  'leonbrito99@gmail.com', 
  '5512345678', 
  740, 
  'BUENO', 
  15000, 
  0, 
  0, 
  'Excelente', 
  '2026-07-06', 
  'Oro', 
  'Diego26', 
  'Ariann@89', 
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&fit=crop',
  true
)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  rfc = EXCLUDED.rfc,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  "creditScore" = EXCLUDED."creditScore",
  "bureauStatus" = EXCLUDED."bureauStatus",
  "totalCreditGranted" = EXCLUDED."totalCreditGranted",
  "balanceOwed" = EXCLUDED."balanceOwed",
  "delinquencyDays" = EXCLUDED."delinquencyDays",
  category = EXCLUDED.category,
  "joinDate" = EXCLUDED."joinDate",
  membership = EXCLUDED.membership,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  "profileImage" = EXCLUDED."profileImage",
  active = EXCLUDED.active;

-- ============================================================================
-- 11. TABLA: administrators (Administradores y Personal Operativo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.administrators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.administrators DISABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'administrators' AND policyname = 'Allow dynamic anon access') THEN
        CREATE POLICY "Allow dynamic anon access" ON public.administrators FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- INSERTAR / ACTUALIZAR CREDENCIALES ADMINISTRATIVAS
INSERT INTO public.administrators (id, name, username, password, role, active)
VALUES 
  ('admin_harold', 'Harold Anguiano', 'harold_anguiano', 'Chevropar#1970', 'admin', true),
  ('asesor_juan', 'Juan Orozco', 'asesor_juan', 'asesor', 'asesor', true),
  ('cajera_lucia', 'Lucía Lara', 'cajera_lucia', 'caja', 'cajera', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  active = EXCLUDED.active;
