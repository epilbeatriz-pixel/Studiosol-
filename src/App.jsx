import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  Search,
  UserPlus,
  Users,
  FileText,
  Sliders,
  Calendar,
  Camera,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Save,
  Trash2,
  Plus,
  X,
  Phone,
  Sparkles,
  Lock,
  Copy,
  Check,
  ChevronLeft,
  FileCheck,
  MessageCircle,
  ExternalLink,
  Smartphone,
  Zap,
  Image as ImageIcon,
  Layers,
  Eraser
} from 'lucide-react';

// ============================================================================
// CONFIGURAÇÃO DO FIREBASE (SUBSTITUA PELAS CHAVES REAIS DO SEU PROJETO)
// ============================================================================
const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY_AQUI",
  authDomain: "COLE_SEU_PROJETO.firebaseapp.com",
  projectId: "COLE_SEU_PROJECT_ID",
  storageBucket: "COLE_SEU_PROJETO.appspot.com",
  messagingSenderId: "COLE_SEU_SENDER_ID",
  appId: "COLE_SEU_APP_ID"
};

const appId = 'studio-sol-hakon';
const MASTER_INVITE_CODE = 'CLINICA2026';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================================================
// CONSTANTES CLÍNICAS (STUDIO SOL — LASER HAKON & DESPIGMENTAÇÃO)
// ============================================================================
const FITZPATRICK_OPTIONS = [
  { value: 'I', label: 'I - Sempre queima, nunca bronzeia (Muito sensível)' },
  { value: 'II', label: 'II - Sempre queima, bronzeia pouco (Sensível)' },
  { value: 'III', label: 'III - Queima moderadamente, bronzeia moderadamente (Normal)' },
  { value: 'IV', label: 'IV - Queima pouco, sempre bronzeia (Normal)' },
  { value: 'V', label: 'V - Queima raramente, sempre bronzeia (Pouco sensível)' },
  { value: 'VI', label: 'VI - Nunca queima, totalmente pigmentada (Insensível)' }
];

const PREVIOUS_METHODS = [
  'Cera Quente',
  'Cera Fria',
  'Roll-On',
  'Lâmina/Gilete',
  'Linha/Egípcia',
  'Creme Depilatório',
  'Laser/Luz Pulsada'
];

const PREVIOUS_REACTIONS = [
  'Nenhuma',
  'Vermelhidão/Eritema',
  'Edema/Inchaço',
  'Coceira',
  'Descamação',
  'Foliculite'
];

const HEALTH_CONTRAINDICATIONS = [
  { id: 'gestante', label: 'Gestante ou lactante', critical: true },
  { id: 'marcapasso', label: 'Portador de Marca-Passo', critical: true },
  { id: 'cancer', label: 'Câncer / Neoplasia ativa ou em tratamento nos últimos 5 anos', critical: true },
  { id: 'autoimune', label: 'Doença Autoimune (Lúpus, Vitiligo, Psoríase, etc.)', critical: true },
  { id: 'herpes', label: 'Histórico ou lesão ativa de Herpes Simplex na área', critical: false },
  { id: 'queloide', label: 'Tendência a Quelóide / Cicatriz Hipertrófica', critical: false },
  { id: 'diabetes', label: 'Diabetes descompensada', critical: true },
  { id: 'tireoide', label: 'Distúrbio de Tireóide descompensado', critical: false },
  { id: 'hormonal', label: 'Alteração Hormonal / SOP / Hirsutismo', critical: false },
  { id: 'epilepsia', label: 'Epilepsia / Histórico de convulsão', critical: true },
  { id: 'vascular', label: 'Doenças Vasculares / Varizes / Telangiectasias no local', critical: false },
  { id: 'urticaria', label: 'Urticária, alergia ativa ou lesão/infecção na área', critical: true },
  { id: 'cirurgia', label: 'Procedimento cirúrgico recente', critical: false, hasDetail: true, detailPlaceholder: 'Qual cirurgia e há quanto tempo?' },
  { id: 'acidos', label: 'Tratamento dermatológico / uso de ácidos corporais ou faciais', critical: false, hasDetail: true, detailPlaceholder: 'Quais ácidos ou produtos utiliza?' }
];

const MEDICATION_GROUPS = [
  {
    group: 'Contraindicação Absoluta / Pausa Longa',
    items: [
      { id: 'roacutan', label: 'Isotretinoína Oral (Roacutan) nos últimos 6 meses — Sessão Contraindicada', critical: true },
      { id: 'oncologico', label: 'Medicamentos Oncológicos / Quimioterápicos / Imunossupressores — Proibido', critical: true }
    ]
  },
  {
    group: 'Restrições de Longa Duração (Parar 5 a 20 dias antes)',
    items: [
      { id: 'acido_retinoico', label: 'Ácido Retinóico / Retinol Tópico / Tazaroteno (Pausa de 5 a 7 dias)' },
      { id: 'etretinato', label: 'Etretinato (Pausa de 5 dias)' },
      { id: 'clofazimina', label: 'Clofazimina ou Flucitosina (Pausa de 9 a 10 dias)' },
      { id: 'vitamina_b6', label: 'Piroxidina / Suplementação de Vitamina B6 concentrada (Pausa de 15 a 20 dias)' }
    ]
  },
  {
    group: 'Restrições de Média Duração (Parar 2 a 4 dias antes)',
    items: [
      { id: 'antibioticos', label: 'Antibióticos específicos (Azitromicina, Cefazolina, Limeciclina, Lomefloxacina) (3 a 4 dias)' },
      { id: 'antidepressivos', label: 'Antidepressivos / Ansiolíticos (Fluoxetina, Sertralina, Citalopram, Escitalopram, etc.) (2 a 4 dias)' },
      { id: 'anticonvulsivantes', label: 'Anticonvulsivantes / Estabilizadores (Carbamazepina, Fenitoína, Fenobarbital) (2 a 3 dias)' },
      { id: 'antiinflamatorios_fortes', label: 'Anti-inflamatórios e Antirreumáticos (Diclofenacos, Meloxicam, Rofecoxib) (2 dias)' },
      { id: 'corticoides', label: 'Corticoides sistêmicos (Pausa de 3 dias)' }
    ]
  },
  {
    group: 'Outros Medicamentos (Parar 1 dia antes ou Avaliar)',
    items: [
      { id: 'antiinflamatorios_comuns', label: 'Anti-inflamatórios comuns (Ibuprofeno, Cetoprofeno, Dipirona, Paracetamol)' },
      { id: 'antihipertensivos', label: 'Anti-hipertensivos / Protetores gástricos (Omeprazol) / Diuréticos' }
    ]
  }
];

const PIGMENT_COLORS = [
  'Preto / Chumbado',
  'Castanho Escuro / Médio',
  'Avermelhado / Alaranjado',
  'Azul / Esverdeado',
  'Amarelo / Branco / Bege (Dióxido de Titânio)',
  'Colorido Misto'
];

const TREATMENT_AREAS = [
  'Buço',
  'Rosto Completo',
  'Pescoço / Nuca',
  'Axilas',
  'Braços / Antebraços',
  'Tórax / Abdômen',
  'Costas',
  'Virilha Cavada',
  'Virilha Completa',
  'Íntima / Perianal',
  'Glúteos',
  'Meia Perna',
  'Pernas Completas',
  'Sobrancelha Direita',
  'Sobrancelha Esquerda',
  'Sobrancelhas (Par)',
  'Tatuagem Corporal'
];

const PRE_POST_LASER = {
  pre: [
    'A pele deve estar completamente limpa, sem maquiagem, cremes, séruns, protetor solar, óleos ou desodorantes no dia.',
    'Os pelos da região devem ser raspados com lâmina de barbear ou creme depilatório antecipadamente (nunca usar cera ou pinça), cerca de 1 a 2 dias antes (nunca no dia).',
    'Evitar esfoliações físicas ou químicas nas 24 horas anteriores ao procedimento.'
  ],
  post: [
    'Higienizar a região apenas com sabonete líquido neutro.',
    'Evitar banhos muito quentes por 15 dias.',
    'Evitar roupas muito apertadas que gerem atrito local por 10 a 12 dias.',
    'Proibida a exposição solar direta na área tratada por pelo menos 15 a 30 dias, bem como fontes de calor excessivo (secador, fogão, carro quente).',
    'Uso diário e obrigatório de Protetor Solar (FPS 50+).',
    'Não utilizar outros cremes ou ácidos locais por 15 dias.'
  ]
};

const PRE_POST_DESPIG = {
  pre: [
    'Não realizar procedimentos invasivos, peeling, tintura ou henna na região nos 15 dias anteriores.',
    'Manter a pele íntegra, sem feridas, queimaduras solares ou processos inflamatórios ativos.',
    'Comunicar previamente qualquer uso de ácidos, antibióticos ou histórico de herpes labial/facial.'
  ],
  post: [
    'Aplicar compressa fria ou gelo envolto em gaze limpa nas primeiras 24h caso haja edema ou ardor local.',
    'Não arrancar, coçar ou puxar as crostas (casquinhas) que se formarem — deixar cair naturalmente para evitar cicatrizes ou discromias.',
    'Higienizar suavemente com sabonete neutro e aplicar a pomada reparadora indicada pela profissional.',
    'Evitar piscina, mar, sauna e exposição solar direta por 30 dias e usar FPS 50+ após a queda das crostas.'
  ]
};

const createEmptyClient = (procedureType = 'laser', source = 'profissional') => ({
  procedureType, // 'laser' | 'despigmentacao'
  hasLaserRecord: procedureType === 'laser',
  hasDespigRecord: procedureType === 'despigmentacao',
  source, // 'link_cliente' | 'ficha_a4' | 'profissional'
  isNewSubmission: source === 'link_cliente',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  personal: {
    fullName: '',
    birthDate: '',
    age
