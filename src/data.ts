/**
 * data.ts
 * Initial dataset for the client portfolio, bureau queries, and credit requests.
 */

import { Client, CreditRequest, BureauQueryLog, RiskParameters, BureauStatus } from './types';

export const getBureauStatusByScore = (score: number, delinquencyDays: number): BureauStatus => {
  if (delinquencyDays > 30) return 'ALERTA';
  if (score >= 720) return 'EXCELENTE';
  if (score >= 650) return 'BUENO';
  if (score >= 580) return 'REGULAR';
  return 'ALERTA';
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'CLI-001',
    name: 'Carlos Mendoza',
    rfc: 'MECC820514TS3',
    email: 'carlos.mendoza@mendozagroup.mx',
    phone: '55-9876-5432',
    creditScore: 745,
    bureauStatus: 'EXCELENTE',
    totalCreditGranted: 1500000,
    balanceOwed: 350000,
    delinquencyDays: 0,
    category: 'Comercial',
    joinDate: '2024-01-10',
    username: 'carlos',
    password: 'password',
    membership: 'Premium'
  },
  {
    id: 'CLI-002',
    name: 'Ana Laura Gómez',
    rfc: 'GOLA890520TS6',
    email: 'ana.gomez@gmail.com',
    phone: '55-6677-8899',
    creditScore: 485,
    bureauStatus: 'ALERTA',
    totalCreditGranted: 0,
    balanceOwed: 0,
    delinquencyDays: 35,
    category: 'Personal',
    joinDate: '2025-11-12',
    username: 'ana',
    password: 'password',
    membership: 'Ninguna'
  },
  {
    id: 'CLI-003',
    name: 'Roberto Martínez',
    rfc: 'MARR801215KJ8',
    email: 'roberto.martinez@outlook.com',
    phone: '55-1234-5678',
    creditScore: 320,
    bureauStatus: 'ALERTA',
    totalCreditGranted: 100000,
    balanceOwed: 95000,
    delinquencyDays: 95,
    category: 'Personal',
    joinDate: '2024-03-15',
    membership: 'Ninguna'
  },
  {
    id: 'PM-820399',
    name: 'Melvin Zauriel Hernández Pérez',
    rfc: 'HEPM850401H01',
    email: 'melvin.hernandez@despachomartinez.mx',
    phone: '+528182039945',
    creditScore: 520,
    bureauStatus: 'ALERTA',
    totalCreditGranted: 15000,
    balanceOwed: 8750,
    delinquencyDays: 210,
    category: 'Personal',
    joinDate: '2025-10-12',
    membership: 'Ninguna'
  },
  {
    id: 'PM-315705',
    name: 'Janeth Alejandra Villalpando Cano',
    rfc: 'VICJ891102K21',
    email: 'janeth.villalpando@despachomartinez.mx',
    phone: '+528131570505',
    creditScore: 545,
    bureauStatus: 'ALERTA',
    totalCreditGranted: 32400,
    balanceOwed: 10800,
    delinquencyDays: 120,
    category: 'Personal',
    joinDate: '2025-08-15',
    membership: 'Ninguna'
  },
  {
    id: 'PM-309767',
    name: 'Luis Antonio Alvarez Garcia',
    rfc: 'AAGL820120D12',
    email: 'luis.alvarez@despachomartinez.mx',
    phone: '+52813097676',
    creditScore: 640,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 14000,
    balanceOwed: 14000,
    delinquencyDays: 30,
    category: 'Personal',
    joinDate: '2026-03-23',
    membership: 'Ninguna'
  },
  {
    id: 'PM-345652',
    name: 'Rocio Elizabeth Tienda Martinez',
    rfc: 'TIMR870512T32',
    email: 'rocio.tienda@despachomartinez.mx',
    phone: '+528134565253',
    creditScore: 505,
    bureauStatus: 'ALERTA',
    totalCreditGranted: 60000,
    balanceOwed: 12500,
    delinquencyDays: 150,
    category: 'Personal',
    joinDate: '2024-04-27',
    membership: 'Ninguna'
  },
  {
    id: 'PM-244895',
    name: 'Maria Karen Farías Guillen',
    rfc: 'FAGM920311N81',
    email: 'maria.farias@despachomartinez.mx',
    phone: '+528124489512',
    creditScore: 590,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 8100,
    balanceOwed: 1350,
    delinquencyDays: 60,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'PM-220272',
    name: 'Jose Francisco Niño Lopez',
    rfc: 'NILJ830114H31',
    email: 'jose.nino@despachomartinez.mx',
    phone: '+528122027288',
    creditScore: 560,
    bureauStatus: 'ALERTA',
    totalCreditGranted: 12960,
    balanceOwed: 3240,
    delinquencyDays: 90,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'PM-198326',
    name: 'Agustín Hernández Tovar',
    rfc: 'HETA800612A91',
    email: 'agustin.hernandez@despachomartinez.mx',
    phone: '+528119832618',
    creditScore: 615,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 8775,
    balanceOwed: 675,
    delinquencyDays: 30,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'PM-365007',
    name: 'Margarita Ramírez Montero',
    rfc: 'RAMM851212B21',
    email: 'margarita.ramirez@despachomartinez.mx',
    phone: '+528136500769',
    creditScore: 595,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 6480,
    balanceOwed: 1080,
    delinquencyDays: 60,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'PM-362609',
    name: 'Ángeles Elizabeth Orzua Aranda',
    rfc: 'ORAA910411F41',
    email: 'angeles.orzua@despachomartinez.mx',
    phone: '+528136260998',
    creditScore: 590,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 8100,
    balanceOwed: 1350,
    delinquencyDays: 60,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'PM-359344',
    name: 'Ma del Carmen Vázquez Jiménez',
    rfc: 'VAJC860101TS0',
    email: 'carmen.vazquez@despachomartinez.mx',
    phone: '+528135934494',
    creditScore: 635,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 16200,
    balanceOwed: 1350,
    delinquencyDays: 30,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'PM-866993',
    name: 'Esmeralda Citlaly Torres Teniente',
    rfc: 'TOTE940212S71',
    email: 'esmeralda.torres@despachomartinez.mx',
    phone: '+528186699374',
    creditScore: 550,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 56700,
    balanceOwed: 14175,
    delinquencyDays: 90,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'PM-325170',
    name: 'Fernanda Montserrat Gonzales Puente',
    rfc: 'GOPF961108RE1',
    email: 'fernanda.gonzales@despachomartinez.mx',
    phone: '+528132517044',
    creditScore: 540,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 37260,
    balanceOwed: 9315,
    delinquencyDays: 90,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'PM-327072',
    name: 'Esperanza Escobedo Guzman',
    rfc: 'EEGE840501TR3',
    email: 'esperanza.escobedo@despachomartinez.mx',
    phone: '+528132707212',
    creditScore: 555,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 8100,
    balanceOwed: 2025,
    delinquencyDays: 90,
    category: 'Personal',
    joinDate: '2025-05-11',
    username: 'esperanza',
    password: 'password',
    membership: 'Ninguna'
  },
  {
    id: 'PM-287397',
    name: 'Ileana Ernestina Lezama Salazar',
    rfc: 'LESI880112D93',
    email: 'ileana.lezama@despachomartinez.mx',
    phone: '+528128739709',
    creditScore: 535,
    bureauStatus: 'ALERTA',
    totalCreditGranted: 34020,
    balanceOwed: 8505,
    delinquencyDays: 90,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'PM-159999',
    name: 'Jose Manuel Pitones Hernández',
    rfc: 'PIHJ821215A42',
    email: 'jose.pitones@despachomartinez.mx',
    phone: '+528115999973',
    creditScore: 545,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 9720,
    balanceOwed: 2430,
    delinquencyDays: 90,
    category: 'Personal',
    joinDate: '2025-05-11',
    membership: 'Ninguna'
  },
  {
    id: 'CLI-0013',
    name: 'Sofia Alarcón Martínez',
    rfc: 'AAMS910408KT7',
    email: 'sofia.alarcon@gmail.com',
    phone: '55-4321-9876',
    creditScore: 785,
    bureauStatus: 'EXCELENTE',
    totalCreditGranted: 1250000,
    balanceOwed: 450000,
    delinquencyDays: 0,
    category: 'Comercial',
    joinDate: '2024-05-12',
    membership: 'Básica'
  },
  {
    id: 'CLI-0042',
    name: 'Mauricio Garza Cantú',
    rfc: 'GACM881112MN9',
    email: 'mauricio.garza@outlook.com',
    phone: '81-2244-1234',
    creditScore: 690,
    bureauStatus: 'BUENO',
    totalCreditGranted: 450000,
    balanceOwed: 210000,
    delinquencyDays: 0,
    category: 'Personal',
    joinDate: '2025-01-20'
  },
  {
    id: 'CLI-0089',
    name: 'Constructora del Norte S.A.',
    rfc: 'CNO050210TS4',
    email: 'contacto@constructoranorte.mx',
    phone: '81-8340-9900',
    creditScore: 615,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 4800000,
    balanceOwed: 3200000,
    delinquencyDays: 12,
    category: 'Comercial',
    joinDate: '2023-09-15'
  },
  {
    id: 'CLI-0114',
    name: 'Alejando Ruiz Esparza',
    rfc: 'RUEA790830DR2',
    email: 'alex.ruiz.esparza@yahoo.com',
    phone: '33-1498-2511',
    creditScore: 540,
    bureauStatus: 'ALERTA',
    totalCreditGranted: 15000,
    balanceOwed: 13500,
    delinquencyDays: 45,
    category: 'Personal',
    joinDate: '2025-02-05'
  },
  {
    id: 'CLI-0121',
    name: 'Tiendas de Conveniencia Del Centro',
    rfc: 'TCC140508PR6',
    email: 'finanzas@delcentro.com.mx',
    phone: '55-5678-0123',
    creditScore: 710,
    bureauStatus: 'BUENO',
    totalCreditGranted: 2100000,
    balanceOwed: 840000,
    delinquencyDays: 0,
    category: 'Pyme',
    joinDate: '2024-03-30'
  },
  {
    id: 'CLI-0205',
    name: 'Diana Patricia Flores',
    rfc: 'FODD860320HT1',
    email: 'diana.flores@serviciosglobales.net',
    phone: '44-2451-9988',
    creditScore: 825,
    bureauStatus: 'EXCELENTE',
    totalCreditGranted: 3500000,
    balanceOwed: 0,
    delinquencyDays: 0,
    category: 'Hipotecario',
    joinDate: '2023-11-01'
  },
  {
    id: 'CLI-0231',
    name: 'Lorena Villaseñor Díaz',
    rfc: 'VIDL921210LK4',
    email: 'lorenadv@icloud.com',
    phone: '55-1122-3344',
    creditScore: 605,
    bureauStatus: 'REGULAR',
    totalCreditGranted: 320000,
    balanceOwed: 290000,
    delinquencyDays: 25,
    category: 'Personal',
    joinDate: '2024-10-18'
  },
  {
    id: 'CLI-0245',
    name: 'Distribuidora Química Integral',
    rfc: 'DQI190312AS1',
    email: 'pagos@dqintegral.com',
    phone: '33-2255-8811',
    creditScore: 480,
    bureauStatus: 'ALERTA',
    totalCreditGranted: 1800000,
    balanceOwed: 1650000,
    delinquencyDays: 62,
    category: 'Pyme',
    joinDate: '2024-07-04'
  }
];

export const INITIAL_REQUESTS: CreditRequest[] = [
  {
    id: 'REQ-4501',
    clientName: 'Ingeniería Digital Aplicada S.A.',
    requestedAmount: 750000,
    purpose: 'Adquisición de maquinaria y servidores de alta densidad',
    score: 742,
    category: 'Pyme',
    dateSubmitted: '2026-05-18',
    status: 'PENDIENTE'
  },
  {
    id: 'REQ-4502',
    clientName: 'Ramiro Benítez Valenzuela',
    requestedAmount: 85000,
    purpose: 'Remodelación de consultorio odontológico',
    score: 665,
    category: 'Personal',
    dateSubmitted: '2026-05-19',
    status: 'PENDIENTE'
  },
  {
    id: 'REQ-4503',
    clientName: 'Agroindustrias del Bajío S.A. de C.V.',
    requestedAmount: 2400000,
    purpose: 'Línea de crédito revolvente para fertilizantes',
    score: 590,
    category: 'Comercial',
    dateSubmitted: '2026-05-19',
    status: 'PENDIENTE'
  },
  {
    id: 'REQ-4504',
    clientName: 'Carla San Román Treviño',
    requestedAmount: 4500000,
    purpose: 'Financiamiento Co-financiado Terreno Residencial',
    score: 810,
    category: 'Hipotecario',
    dateSubmitted: '2026-05-17',
    status: 'PENDIENTE'
  }
];

export const INITIAL_BUREAU_QUERIES: BureauQueryLog[] = [
  {
    id: 'Q-9011',
    timestamp: '2026-05-19 14:24',
    queriedClientName: 'Sofia Alarcón Martínez',
    requestedBy: 'admin_harold',
    scoreFound: 785,
    resolution: 'Score excepcional. Rápido acceso libre de controles adicionales.'
  },
  {
    id: 'Q-9010',
    timestamp: '2026-05-19 11:15',
    queriedClientName: 'Distribuidora Química Integral',
    requestedBy: 'admin_harold',
    scoreFound: 480,
    resolution: 'Alerta máxima por morosidad crítica y días vencidos.'
  }
];

export const INITIAL_RISK_PARAMS: RiskParameters = {
  minScoreAutoApproval: 700,
  maxDelinquencyDaysAllowed: 30,
  baseInterestRate: 14.5
};
