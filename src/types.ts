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
  loanType?: string;
  monthlyPlan?: string;
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

export interface LandingPageConfig {
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroBackgroundUrl: string;
  sliderImages: string[];
  benefits: {
    title: string;
    description: string;
  }[];
  howItWorks: {
    title: string;
    description: string;
  }[];
}

export const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
  logoUrl: "https://cossma.com.mx/saldaapplogo.png",
  phone: "+52 81 2345 6789",
  whatsapp: "528123456789",
  email: "contacto@saldoapp.com",
  address: "Av. Constelaciones 402, Monterrey, N.L.",
  heroTitle: "El impulso financiero que necesitas, hoy mismo.",
  heroSubtitle: "En Saldo app te ofrecemos préstamos mensuales rápidos, claros y sin complicaciones. Elige el monto que necesitas y conoce exactamente cuánto vas a pagar desde el primer día.",
  heroCtaText: "¡Solicita tu Préstamo Aquí!",
  heroBackgroundUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=80",
  sliderImages: [
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=1600&q=80"
  ],
  benefits: [
    { title: "Transparencia Total", description: "Sin letras chiquitas ni comisiones ocultas. Lo que ves es lo que pagas." },
    { title: "Plazos Mensuales", description: "Diseñados para que organices tu presupuesto con calma." },
    { title: "Proceso 100% Digital", description: "Solicita desde tu celular estés donde estés, rápido y seguro." }
  ],
  howItWorks: [
    { title: "Elige tu monto", description: "Revisa nuestras opciones mensuales de $3,000 hasta $10,000 pesos." },
    { title: "Completa tu solicitud", description: "Llena tus datos básicos de forma rápida y segura desde nuestra plataforma." },
    { title: "Recibe tu dinero", description: "Una vez autorizado, tendrás el saldo disponible para usarlo en lo que necesites." }
  ]
};

export interface ContractTemplate {
  id: string; // 'express' | 'particulares'
  name: string; // 'Contrato Express' | 'Contrato de préstamo entre particulares'
  title: string;
  subtitle: string;
  declarations: string;
  clauses: string;
}

export const DEFAULT_CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'express',
    name: 'Contrato Express',
    title: 'CONTRATO EXPRESO DE CRÉDITO DE CONSUMO INMEDIATO',
    subtitle: 'DOCUMENTO DIGITAL CERTIFICADO CON COMPROMISO FISCAL DE AMORTIZACIÓN',
    declarations: 'DECLARACIONES: El presente contrato (en lo sucesivo, el "Contrato") es celebrado el día {fecha_generado} por y entre las partes señaladas a continuación:\n\nPor una parte, Fideicomiso de Recaudación Salda App S.A. como el "Acreedor fiduciario unificado", y por la otra parte, el cliente registrado cuyos datos fiduciarios se autocompletan legalmente:',
    clauses: 'CLÁUSULA PRIMERA (Entrega y Destino del Crédito): Salda App pone a la disposición de la Parte Acreditada la suma autorizada de ${monto} MXN. El Acreditado declara recibir a su entera satisfacción dicho capital fiduciario para ser destinado a fines personales lícitos de consumo.\n\nCLÁUSULA SEGUNDA (Compromiso Único de Pago y Abonos): El cliente se obliga y compromete irrevocablemente a amortizar y liquidar el saldo total, intereses aplicables y recargos, a través de la cuenta fiduciaria habilitada por Salda App, identificando cada depósito indefectiblemente utilizando su Referencia Única de Depósito: {referencia_pago}.\n\nCLÁUSULA TERCERA (Tasa de Interés Moratorio y Buró de Crédito): En caso de retraso en los pagos pactados, se aplicará de manera unificada una tasa de interés moratorio del 5.8% mensual. Asimismo, el atraso dará facultad de reportar el comportamiento negativo inmediatamente a las sociedades de información crediticia (Buró de Crédito).'
  },
  {
    id: 'particulares',
    name: 'Contrato de préstamo entre particulares',
    title: 'CONTRATO DE MUTUO CON INTERÉS Y GARANTÍA ENTRE PARTICULARES',
    subtitle: 'DOCUMENTO DIGITAL CERTIFICADO CON COMPROMISO FISCAL DE AMORTIZACIÓN',
    declarations: 'DECLARACIONES: El presente contrato (en lo sucesivo, el "Contrato") es celebrado el día {fecha_generado} por y entre las partes señaladas a continuación:\n\nPor una parte, Fideicomiso de Recaudación Salda App S.A. como el "Acreedor fiduciario unificado", y por la otra parte, el cliente registrado cuyos datos fiduciarios se autocompletan legalmente:',
    clauses: 'CLÁUSULA PRIMERA (Objeto del Contrato de Mutuo): El Mutuante transmite la propiedad de la cantidad líquida de ${monto} MXN al Mutuatario, quien la recibe con la obligación expresa de restituirla y liquidarla con los intereses pactados y de conformidad con el calendario de pagos de la institución mexicana.\n\nCLÁUSULA SEGUNDA (Tasa de Costo Anual y Referencia de Pago Bancaria): El mutuo se compromete bajo la tasa fiduciaria de la plataforma, conviniéndose expresamente de manera inalterable que todo abono, amortización y pago ordinario se realizará mediante de transferencias bancarias o SPEI, con el identificador único bancario de pagos SPEI fiduciarios registrado: {referencia_pago}.\n\nCLÁUSULA TERCERA (Vencimiento Anticipado): El incumplimiento puntual de cualquiera de los abonos facultará al Mutuante para declarar el vencimiento anticipado de toda la obligación, requiriendo el saldo insoluto de manera inmediata de manera legal por la vía ejecutiva mercantil.'
  }
];

export function interpolateContractTemplate(
  template: ContractTemplate,
  contract: {
    id: string;
    clientName: string;
    amount: number;
    paymentReference: string;
    dateGenerated: string;
  }
): {
  title: string;
  subtitle: string;
  declarations: string;
  clauses: string[];
} {
  const replaceAll = (text: string) => {
    return text
      .replace(/{fecha_generado}/g, contract.dateGenerated)
      .replace(/{clientName}/g, contract.clientName)
      .replace(/{nombre_cliente}/g, contract.clientName)
      .replace(/\${monto}/g, `$${contract.amount.toLocaleString('es-MX')}`)
      .replace(/{monto}/g, contract.amount.toLocaleString('es-MX'))
      .replace(/{referencia_pago}/g, contract.paymentReference)
      .replace(/{contractId}/g, contract.id)
      .replace(/{id_contrato}/g, contract.id);
  };

  return {
    title: replaceAll(template.title),
    subtitle: replaceAll(template.subtitle),
    declarations: replaceAll(template.declarations),
    clauses: replaceAll(template.clauses).split('\n\n')
  };
}

export interface TermsConditions {
  id: string; // 'terms_singleton'
  content: string;
  updatedAt: string;
}

export const DEFAULT_TERMS_CONDITIONS = `TÉRMINOS Y CONDICIONES DE USO
Plataforma de Gestión y Solicitud de Créditos – Salda App

Bienvenido a Salda App. Antes de utilizar nuestra aplicación móvil, plataforma web o cualquiera de nuestros servicios de gestión y solicitud de créditos, le pedimos que lea atentamente los siguientes Términos y Condiciones (en adelante, los "Términos"). Al descargar, registrarse o utilizar Salda App, usted acepta quedar vinculado por este acuerdo. Si no está de acuerdo con estos Términos, deberá abstenerte de utilizar la aplicación de manera inmediata.

1. Naturaleza del Servicio
Salda App es una plataforma tecnológica que facilita la solicitud, evaluación, otorgamiento y gestión de préstamos personales. Salda App se reserva el derecho de aprobar o rechazar las solicitudes de crédito basándose en sus propios criterios de análisis de riesgo, políticas internas y capacidad de pago del usuario.

2. Requisitos para el Usuario
Para solicitar un crédito o registrarse en Salda App, el usuario debe cumplir obligatoriamente con los siguientes requisitos mínimos:
• Ser mayor de edad (18 años o más según la legislación local vigente).
• Contar con una identificación oficial vigente con fotografía.
• Proporcionar información real, exacta, actualizada y comprobable.
• Ser titular de una cuenta bancaria nacional para la recepción y depósito de los fondos.

3. Conditions Financieras, Mora y Gastos
El usuario acepta expresamente las tasas de interés, plazos y comisiones detallados de manera transparente al momento de firmar su contrato de crédito digital. Adicionalmente, se aplicarán los siguientes cargos extraordinarios:

3.1. Cuota por Incumplimiento (Mora)
El pago puntual es responsabilidad exclusiva del usuario. En caso de atraso en la fecha de pago pactada, se generará de forma automática una cuota de mora fija de $100 MXN (cien pesos netos) por cada día de atraso. Esta cuota se sumará diariamente al saldo total deudor hasta que el usuario se ponga completamente al corriente con sus obligaciones de pago.

3.2. Gastos Administrativos por Cancelación
Si el usuario decide realizar una cancelación anticipada del crédito o liquidar el saldo total antes de la fecha de vencimiento final estipulada, Salda App cobrará una cuota fija por concepto de Gastos Administrativos. El monto exacto de esta cuota se calculará y mostrará de forma transparente en la interfaz de la aplicación antes de confirmar la cancelación definitiva del servicio.

Página 1 de 2

4. Reportes a Sociedades de Información Crediticia
Al aceptar estos Términos, el usuario otorga su autorización expresa para que Salda App consulte su historial crediticio ante las Sociedades de Información Crediticia (tales como Buró de Crédito o Círculo de Crédito). Asimismo, en caso de incurrir en impago prolongado, mora o incumplimiento de las obligaciones contraídas, el usuario acepta que su comportamiento será reportado negativamente ante dichas entidades conforme a la legislación aplicable.

5. Proceso de Cobranza
• En caso de atraso en el pago, Salda App iniciará acciones de cobranza preventiva y correctiva.
• El usuario acepta ser contactado y recibir notificaciones de cobro a través de los siguientes canales:
  - Mensajes de texto (SMS) y notificaciones push dentro de la aplicación.
  - Correos electrónicos enviados a la dirección registrada.
  - Llamadas telefónicas y mensajes automáticos a los números provistos en su registro de cuenta.

6. Uso de la Cuenta y Seguridad
El usuario es el único responsable de mantener la confidencialidad de sus credenciales de acceso (usuario, contraseña y PIN de seguridad). Cualquier movimiento, solicitud de préstamo o transferencia realizada desde la cuenta del usuario se considerará legítima y realizada por él mismo. Salda App no se hace responsable por retiros, transferencias o solicitudes derivadas del descuido o préstamo de la cuenta a terceras personas.

7. Propiedad Intelectual
Todo el contenido de Salda App (incluyendo pero no limitado a logotipos, interfaces, códigos de programación, textos, desarrollos tecnológicos y marcas comerciales) es propiedad exclusiva de la plataforma. Queda estrictamente prohibida su reproducción, modificación, distribución o ingeniería inversa sin autorización previa y por escrito de los titulares de la aplicación.

8. Modificaciones a los Términos y Condiciones
Salda App se reserva el derecho de modificar o actualizar estos Términos en cualquier momento para adaptarlos a novedades legislativas o políticas internas de la empresa. Las modificaciones surtirán efecto inmediato a partir de su publicación en la aplicación. El uso continuo de la plataforma tras la publicación de los cambios constituye la aceptación expresa de los nuevos Términos.

Declaración de Consentimiento:
Al presionar el botón de aceptación o utilizar los servicios de la aplicación, usted manifiesta que ha leído, comprendido y aceptado en su totalidad los presentes Términos y Condiciones de Uso de Salda App.

Nota Legal:
Este documento sirve como una base estructural y técnica para el funcionamiento de la aplicación móvil Salda App. Se recomienda su revisión periódica ante profesionales legales para su perfecta adecuación con las leyes fintech y de protección al consumidor del territorio correspondiente.`;



