import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
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
  Share2,
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
  ChevronRight,
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
// CONFIGURAÇÃO FIREBASE E VARIÁVEIS DE AMBIENTE
// ============================================================================
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Código mestre para cadastro de novas profissionais autorizadas
const MASTER_INVITE_CODE = 'CLINICA2026';

// ============================================================================
// CONSTANTES CLÍNICAS (LASER HAKON & DESPIGMENTAÇÃO)
// ============================================================================
const FITZPATRICK_OPTIONS = [
  { value: 'I', label: 'Fototipo I', desc: 'Sempre queima, nunca bronzeia (Muito sensível)' },
  { value: 'II', label: 'Fototipo II', desc: 'Sempre queima, bronzeia pouco (Sensível)' },
  { value: 'III', label: 'Fototipo III', desc: 'Queima moderadamente, bronzeia moderadamente (Normal)' },
  { value: 'IV', label: 'Fototipo IV', desc: 'Queima pouco, sempre bronzeia (Normal)' },
  { value: 'V', label: 'Fototipo V', desc: 'Queima raramente, sempre bronzeia (Pouco sensível)' },
  { value: 'VI', label: 'Fototipo VI', desc: 'Nunca queima, totalmente pigmentada (Insensível)' }
];

const METODOS_DEPILACAO = [
  'Cera Quente', 'Cera Fria', 'Roll-On', 'Lâmina/Gilete',
  'Linha/Egípcia', 'Creme Depilatório', 'Laser/Luz Pulsada'
];

const REACOES_PREVIAS = [
  'Nenhuma', 'Vermelhidão/Eritema', 'Edema/Inchaço',
  'Coceira', 'Descamação', 'Foliculite'
];

const CORES_PIGMENTO_DESPIG = [
  'Preto',
  'Castanho Escuro',
  'Castanho Claro',
  'Avermelhado / Alaranjado',
  'Acinzentado / Chumbado',
  'Azul / Esverdeado',
  'Amarelo / Branco / Camuflagem'
];

const TEMPO_PIGMENTO_OPCOES = [
  'Menos de 6 meses',
  '6 meses a 1 ano',
  '1 a 3 anos',
  'Mais de 3 anos'
];

const AREAS_LASER_SESSAO = [
  'Axilas', 'Virilha Completa', 'Virilha Cavada', 'Perianal',
  'Meia Perna', 'Perna Completa', 'Coxas', 'Buço', 'Queixo',
  'Rosto Completo', 'Barba / Pescoço', 'Braços', 'Antebraços',
  'Abdômen', 'Linha Alba', 'Costas', 'Glúteos', 'Aréolas'
];

const AREAS_DESPIG_SESSAO = [
  'Sobrancelha Direita',
  'Sobrancelha Esquerda',
  'Ambas Sobrancelhas',
  'Delineado / Olhos',
  'Lábios (Neutralização)',
  'Tatuagem (Local Específico)'
];

// Contraindicações específicas para Depilação a Laser (laser.docx)
const HEALTH_CONDITIONS_LASER = [
  { key: 'gestanteLactante', label: 'Gestante ou lactante', critical: true },
  { key: 'marcaPasso', label: 'Portador de Marca-Passo', critical: true },
  { key: 'cancerNeoplasia', label: 'Câncer / Neoplasia ativa ou em tratamento nos últimos 5 anos', critical: true },
  { key: 'doencaAutoimune', label: 'Doença Autoimune (Lúpus, Vitiligo, Psoríase, etc.)', critical: true },
  { key: 'herpesSimplex', label: 'Histórico ou lesão ativa de Herpes Simplex na área', critical: false },
  { key: 'tendenciaQueloide', label: 'Tendência a Quelóide / Cicatriz Hipertrófica', critical: false },
  { key: 'diabetesDescompensada', label: 'Diabetes descompensada', critical: true },
  { key: 'tireoideDescompensada', label: 'Distúrbio de Tireóide descompensado', critical: false },
  { key: 'alteracaoHormonal', label: 'Alteração Hormonal / Síndrome do Ovário Policístico (SOP) / Hirsutismo', critical: false },
  { key: 'epilepsia', label: 'Epilepsia / Histórico de convulsão', critical: true },
  { key: 'doencasVasculares', label: 'Doenças Vasculares / Varizes / Telangiectasias no local', critical: false },
  { key: 'urticariaAlergia', label: 'Urticária, alergia ativa ou lesão/infecção na área', critical: true },
  { key: 'cirurgiaRecente', label: 'Procedimento cirúrgico recente', hasDetail: true, detailPlaceholder: 'Qual cirurgia e há quanto tempo?' },
  { key: 'tratamentoDermatologico', label: 'Tratamento dermatológico / uso de ácidos corporais ou faciais', hasDetail: true, detailPlaceholder: 'Quais ácidos ou tratamentos?' }
];

// Contraindicações específicas para Despigmentação (Sobrancelhas e Tatuagem)
const HEALTH_CONDITIONS_DESPIG = [
  { key: 'gestanteLactante', label: 'Gestante ou lactante', critical: true },
  { key: 'marcaPasso', label: 'Portador de Marca-Passo', critical: true },
  { key: 'cancerNeoplasia', label: 'Câncer / Neoplasia ativa ou em tratamento nos últimos 5 anos', critical: true },
  { key: 'doencaAutoimune', label: 'Doença Autoimune (Lúpus, Vitiligo, Psoríase, etc.)', critical: true },
  { key: 'herpesSimplex', label: 'Herpes ativo ou histórico recorrente na região', critical: false },
  { key: 'tendenciaQueloide', label: 'Tendência a Quelóide ou Cicatriz Hipertrófica (ATENÇÃO CRÍTICA)', critical: true },
  { key: 'diabetesDescompensada', label: 'Diabetes descompensada (risco de cicatrização)', critical: true },
  { key: 'disturbioCoagulacao', label: 'Distúrbios de coagulação / Uso de anticoagulantes (AAS, Varfarina, etc.)', critical: true },
  { key: 'alergiaPigmentosMetais', label: 'Alergia conhecida a pigmentos, tintas ou metais', critical: true },
  { key: 'infeccaoFeridaLocal', label: 'Infecção, dermatite ou ferida ativa no local da remoção', critical: true },
  { key: 'roacutanRecente', label: 'Uso de Isotretinoína Oral (Roacutan) nos últimos 6 meses', critical: true },
  { key: 'acidosLocais', label: 'Uso de ácidos ou peelings recentes na região', hasDetail: true, detailPlaceholder: 'Quais ácidos e há quanto tempo parou?' }
];

const MEDICATIONS_LIST = [
  {
    group: 'Contraindicação Absoluta / Proibida',
    items: [
      { key: 'isotretinoina', label: 'Uso de Isotretinoína Oral (Roacutan) nos últimos 6 meses', pause: 'Sessão Contraindicada' },
      { key: 'oncologicos', label: 'Medicamentos Oncológicos / Quimioterápicos / Imunossupressores (Bleomicina, Metotrexato, etc.)', pause: 'Sessão Proibida / Contraindicada' }
    ]
  },
  {
    group: 'Restrições de Longa Duração (Parar 5 a 20 dias antes)',
    items: [
      { key: 'acidoRetinoico', label: 'Ácido Retinóico / Retinol Tópico / Tazaroteno', pause: 'Pausa de 5 a 7 dias' },
      { key: 'etretinato', label: 'Etretinato', pause: 'Pausa de 5 dias' },
      { key: 'clofazimina', label: 'Clofazimina ou Flucitosina', pause: 'Pausa de 9 a 10 dias' },
      { key: 'piroxidina', label: 'Piroxidina / Suplementação de Vitamina B6 concentrada', pause: 'Pausa de 15 a 20 dias' }
    ]
  },
  {
    group: 'Restrições de Média Duração (Parar 2 a 4 dias antes)',
    items: [
      { key: 'antibioticos', label: 'Antibióticos específicos (Azitromicina, Cefazolina, Limeciclina, Lomefloxacina)', pause: 'Pausa de 3 a 4 dias' },
      { key: 'antidepressivos', label: 'Antidepressivos / Ansiolíticos (Fluoxetina, Sertralina, Citalopram, Escitalopram, Mirtazapina)', pause: 'Pausa de 2 a 4 dias' },
      { key: 'anticonvulsivantes', label: 'Anticonvulsivantes / Estabilizadores (Carbamazepina, Fenitoína, Fenobarbital)', pause: 'Pausa de 2 a 3 dias' },
      { key: 'antiinflamatoriosForte', label: 'Anti-inflamatórios e Antirreumáticos (Diclofenacos, Meloxicam, Rofecoxib, Sulindaco)', pause: 'Pausa de 2 dias' },
      { key: 'corticoides', label: 'Corticoides sistêmicos', pause: 'Pausa de 3 dias' }
    ]
  },
  {
    group: 'Outros Medicamentos (Parar 1 dia antes ou Avaliar)',
    items: [
      { key: 'antiinflamatoriosComuns', label: 'Anti-inflamatórios comuns (Ibuprofeno, Cetoprofeno, Dipirona, Paracetamol)', pause: 'Parar 1 dia antes / Avaliar' },
      { key: 'antihipertensivos', label: 'Anti-hipertensivos / Protetores gástricos (Omeprazol) / Diuréticos', pause: 'Avaliar' }
    ]
  }
];

const ORIENTACOES_LASER = {
  pre: [
    'A pele deve estar completamente limpa, sem maquiagem, cremes, séruns, protetor solar, óleos ou desodorantes no dia.',
    'Os pelos da região devem ser raspados com lâmina de barbear ou creme depilatório antecipadamente (nunca usar cera ou pinça). Cerca de 2 ou 1 dia antes (nunca no dia).',
    'Evitar esfoliações físicas ou químicas nas 24 horas anteriores ao procedimento.'
  ],
  pos: [
    'Higienizar a região apenas com sabonete líquido neutro.',
    'Evitar banhos muito quentes por 15 dias.',
    'Evitar roupas muito apertadas que gerem atrito local por 10 a 12 dias.',
    'Proibida a exposição solar direta na área tratada por pelo menos 15 a 30 dias, bem como fontes de calor excessivo (secador, fogão, carro quente).',
    'Uso diário e obrigatório de Protetor Solar (FPS 50+).',
    'Não utilizar outros cremes ou ácidos locais por 15 dias.'
  ]
};

const ORIENTACOES_DESPIGMENTACAO = {
  pre: [
    'Não realizar exposição solar ou bronzeamento na região nos 15 dias anteriores à sessão.',
    'Suspender o uso de ácidos, retinol ou esfoliantes no local 7 dias antes do procedimento.',
    'Comparecer no dia da sessão com a pele limpa, sem maquiagem ou cremes na área a ser despigmentada.'
  ],
  pos: [
    'NÃO arrancar, coçar ou esfregar eventuais crostas/casquinhas formadas — elas devem cair naturalmente para evitar cicatrizes ou manchas.',
    'Aplicar compressa fria (com gaze limpa e soro fisiológico gelado) nas primeiras 24h caso haja inchaço ou sensação de calor.',
    'Aplicar a pomada cicatrizante/reparadora recomendada pela profissional conforme orientação.',
    'Evitar piscina, mar, sauna, vapor e banhos muito quentes nos primeiros 7 a 10 dias.',
    'Proteção solar rigorosa (FPS 50+) após a queda das crostas e proibição total de sol direto por 30 dias.'
  ]
};

// ============================================================================
// MODELO INICIAL DE FICHA DE CLIENTE (SUPORTA LASER, DESPIGMENTAÇÃO OU AMBOS)
// ============================================================================
const createEmptyClient = (formType = 'laser', source = 'profissional') => {
  const isDespig = formType === 'despigmentacao';
  return {
    status: source === 'cliente' ? 'pendente' : 'ativo', // 'pendente' | 'ativo'
    fichaPrincipal: isDespig ? 'despigmentacao' : 'laser', // 'laser' | 'despigmentacao'
    possuiFichaLaser: !isDespig,
    possuiFichaDespig: isDespig,
    isPaperTranscription: false,
    paperSignedInFile: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    // 1. Dados Pessoais
    dadosPessoais: {
      nomeCompleto: '',
      dataNascimento: '',
      sexo: 'F',
      cpf: '',
      rg: '',
      endereco: '',
      bairro: '',
      cidadeUf: '',
      telefone: '',
      email: '',
      profissao: '',
      comoConheceu: ''
    },

    // 2A. Histórico Específico — Depilação a Laser (Hakon)
    historicoLaser: {
      costumaDepilar: 'Sim',
      metodosAnteriores: [],
      reacoesPrevias: [],
      pelosEncravados: 'Não',
      localPelosEncravados: '',
      espessuraPelo: 'Médio',
      corPelo: 'Castanho Escuro/Preto',
      expectativaResultado: ''
    },

    // 2B. Avaliação Específica — Despigmentação (Sobrancelhas e Tatuagem)
    historicoDespigmentacao: {
      tipoProcedimentoDespig: 'Remoção de Micropigmentação de Sobrancelhas',
      localizacaoTamanho: '',
      tempoRealizacao: '1 a 3 anos',
      numeroRetoquesAnteriores: '1',
      fezDespigmentacaoAnterior: 'Não',
      detalheDespigmentacaoAnterior: '',
      coresPresentes: ['Preto'],
      observacoesCicatrizFibrose: ''
    },

    // 3. Avaliação Cutânea
    avaliacaoCutanea: {
      fototipoCliente: 'III',
      exposicaoSolarRecente: 'Não',
      tatuagemOuHiperpigmentacaoArea: 'Não',
      detalheAreaEspecial: ''
    },

    // 4A. Histórico de Saúde — Laser
    historicoSaudeLaser: {
      gestanteLactante: false,
      marcaPasso: false,
      cancerNeoplasia: false,
      doencaAutoimune: false,
      herpesSimplex: false,
      tendenciaQueloide: false,
      diabetesDescompensada: false,
      tireoideDescompensada: false,
      alteracaoHormonal: false,
      epilepsia: false,
      doencasVasculares: false,
      urticariaAlergia: false,
      cirurgiaRecente: false,
      cirurgiaRecenteDetalhe: '',
      tratamentoDermatologico: false,
      tratamentoDermatologicoDetalhe: ''
    },

    // 4B. Histórico de Saúde — Despigmentação
    historicoSaudeDespig: {
      gestanteLactante: false,
      marcaPasso: false,
      cancerNeoplasia: false,
      doencaAutoimune: false,
      herpesSimplex: false,
      tendenciaQueloide: false,
      diabetesDescompensada: false,
      disturbioCoagulacao: false,
      alergiaPigmentosMetais: false,
      infeccaoFeridaLocal: false,
      roacutanRecente: false,
      acidosLocais: false,
      acidosLocaisDetalhe: ''
    },

    // 5. Medicamentos e Fotossensibilizantes
    medicamentos: {
      isotretinoina: false,
      oncologicos: false,
      acidoRetinoico: false,
      etretinato: false,
      clofazimina: false,
      piroxidina: false,
      antibioticos: false,
      antidepressivos: false,
      anticonvulsivantes: false,
      antiinflamatoriosForte: false,
      corticoides: false,
      antiinflamatoriosComuns: false,
      antihipertensivos: false,
      outrosRelatados: ''
    },

    // Termo e Assinatura
    termoConsentimento: {
      aceito: false,
      cidadeTermo: '',
      dataTermo: new Date().toISOString().split('T')[0],
      assinaturaPacienteBase64: '',
      profissionalResponsavel: ''
    },

    // Área Exclusiva do Profissional: Parâmetros Técnicos
    parametrosProfissional: {
      fototipoConfirmado: 'III',
      // Laser Hakon
      modoSequencial: { fluencia: '', frequencia: '', tempoPulso: '', observacao: '' },
      modoPontual: { fluencia: '', frequencia: '', observacao: '' },
      modoVarredura: { fluencia: '', frequencia: '', passadas: '', observacao: '' },
      observacoesHakon: '',
      // Despigmentação
      despigmentacaoParams: {
        comprimentoOnda: '1064nm',
        energiaMj: '',
        frequenciaHz: '',
        spotSize: '',
        ponteiraUtilizada: '',
        reacaoImediataFrosting: 'Frosting leve / branqueamento imediato'
      },
      observacoesClinicasInternas: ''
    },

    // Controle de Sessões (Ilimitado)
    sessoes: [],

    // Galeria de Fotos
    fotos: []
  };
};

// ============================================================================
// UTILITÁRIOS
// ============================================================================
function calculateAge(birthDateString) {
  if (!birthDateString) return '';
  const today = new Date();
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return '';
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? `${age} anos` : '';
}

function formatDateBR(dateStr) {
  if (!dateStr) return '-';
  if (dateStr.includes('T')) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

function compressImageFile(file, maxWidth = 760, quality = 0.65) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// ============================================================================
// COMPONENTE DE ASSINATURA DIGITAL (CANVAS TOUCH / MOUSE)
// ============================================================================
function SignaturePad({ value, onChange, label = 'Assinatura na Tela (Use o dedo ou caneta)', readOnly = false }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2C2523';

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (readOnly) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || readOnly) return;
    setIsDrawing(false);
    if (onChange && canvasRef.current) {
      onChange(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (onChange) onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-stone-600">{label}</span>
        {!readOnly && value && (
          <button
            type="button"
            onClick={clearSignature}
            className="text-xs text-rose-700 hover:text-rose-900 underline font-medium"
          >
            Limpar assinatura
          </button>
        )}
      </div>
      <div className="relative rounded-xl border-2 border-dashed border-stone-300 bg-[#FCFBF9] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-36 sm:h-44 touch-none ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
        />
        {!value && !readOnly && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-stone-400 text-sm">
            Assine aqui com o dedo ou caneta touch
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL DO APLICATIVO
// ============================================================================
export default function App() {
  // Detecta ?form=laser ou ?form=despigmentacao (e retrocompatibilidade com ?modo=cliente)
  const initialPublicFormType = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const formParam = params.get('form');
      if (formParam === 'laser' || formParam === 'despigmentacao') {
        return formParam;
      }
      if (params.get('modo') === 'cliente') {
        return 'laser';
      }
    }
    return null;
  }, []);

  const [publicFormType, setPublicFormType] = useState(initialPublicFormType); // null | 'laser' | 'despigmentacao'
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Estado de Autenticação Profissional
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [profNameInput, setProfNameInput] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dados dos Clientes (Firestore em tempo real)
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Navegação e Filtros do Painel Profissional
  const [searchTerm, setSearchTerm] = useState('');
  const [procedureFilter, setProcedureFilter] = useState('TODAS'); // TODAS, LASER, DESPIGMENTACAO, NOVAS
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [activeTab, setActiveTab] = useState('anamnese'); // anamnese, tecnico, sessoes, fotos, orientacoes
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);
  const [newClientFormType, setNewClientFormType] = useState('laser');
  const [isPaperModeCreation, setIsPaperModeCreation] = useState(false);

  // Modais e Notificações
  const [toast, setToast] = useState(null);
  const [shareModalType, setShareModalType] = useState(null); // null | 'laser' | 'despigmentacao'
  const [showNewClientChoiceModal, setShowNewClientChoiceModal] = useState(false);
  const [choiceIsPaperMode, setChoiceIsPaperMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmDeleteClientId, setConfirmDeleteClientId] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ==========================================================================
  // 1. AUTENTICAÇÃO FIREBASE
  // ==========================================================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const isPublic =
          params.get('form') === 'laser' ||
          params.get('form') === 'despigmentacao' ||
          params.get('modo') === 'cliente';

        if (isPublic) {
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        } else if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          if (!auth.currentUser) {
            await signInWithCustomToken(auth, __initial_auth_token);
          }
        }
      } catch (err) {
        console.error('Erro na autenticação inicial:', err);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const isProfessionalLoggedIn = useMemo(() => {
    if (!authUser) return false;
    return !authUser.isAnonymous && Boolean(authUser.email);
  }, [authUser]);

  // ==========================================================================
  // 2. ESCUTA EM TEMPO REAL DAS FICHAS DE CLIENTES
  // ==========================================================================
  useEffect(() => {
    if (!authReady || !isProfessionalLoggedIn || publicFormType) {
      setLoadingClients(false);
      return;
    }

    setLoadingClients(true);
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'anamneses_clientes');

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        list.sort((a, b) => {
          if (a.status === 'pendente' && b.status !== 'pendente') return -1;
          if (a.status !== 'pendente' && b.status === 'pendente') return 1;
          return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
        });
        setClients(list);
        setLoadingClients(false);
      },
      (error) => {
        console.error('Erro ao carregar prontuários:', error);
        setLoadingClients(false);
      }
    );

    return () => unsubscribe();
  }, [authReady, isProfessionalLoggedIn, publicFormType]);

  // ==========================================================================
  // HANDLERS DE LOGIN / CADASTRO PROFISSIONAL
  // ==========================================================================
  const handleProfessionalAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        if (inviteCodeInput.trim().toUpperCase() !== MASTER_INVITE_CODE) {
          setAuthError('Código mestre da clínica inválido. Solicite à responsável.');
          setAuthLoading(false);
          return;
        }
        if (!profNameInput.trim()) {
          setAuthError('Informe o nome completo da profissional.');
          setAuthLoading(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'profissionais', cred.user.uid), {
          nome: profNameInput.trim(),
          email: emailInput.trim(),
          criadoEm: new Date().toISOString()
        });
        showNotification('Cadastro realizado com sucesso! Bem-vinda ao Studio Sol.');
      } else {
        await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        showNotification('Acesso autorizado.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('Este e-mail já está cadastrado.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setAuthError('Não foi possível autenticar. Verifique os dados.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSelectedClientId(null);
    setIsCreatingNewClient(false);
    showNotification('Sessão encerrada com segurança.');
  };

  // ==========================================================================
  // LINKS EXCLUSIVOS PARA A CLIENTE (?form=laser e ?form=despigmentacao)
  // ==========================================================================
  const getClientFormUrl = (type) => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.delete('modo');
    url.searchParams.set('form', type);
    return url.toString();
  };

  const handleCopyClientLink = (type) => {
    navigator.clipboard.writeText(getClientFormUrl(type));
    setCopiedLink(true);
    showNotification(
      type === 'laser'
        ? 'Link da Ficha Depilação a Laser copiado!'
        : 'Link da Ficha Despigmentação copiado!'
    );
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSwitchToTabletClientMode = async (type) => {
    await signOut(auth);
    await signInAnonymously(auth);
    const url = new URL(window.location.href);
    url.searchParams.delete('modo');
    url.searchParams.set('form', type);
    window.history.pushState({}, '', url.toString());
    setShareModalType(null);
    setPublicFormType(type);
  };

  // ==========================================================================
  // FILTRAGEM DE CLIENTES (NOME, SOBRENOME E CELULAR + TIPO DE FICHA)
  // ==========================================================================
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const dp = client.dadosPessoais || {};
      const fullName = (dp.nomeCompleto || '').toLowerCase();
      const phoneDigits = (dp.telefone || '').replace(/\D/g, '');
      const query = searchTerm.toLowerCase().trim();
      const queryDigits = query.replace(/\D/g, '');

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        (queryDigits.length > 0 && phoneDigits.includes(queryDigits));

      if (!matchesSearch) return false;

      if (procedureFilter === 'NOVAS') {
        return client.status === 'pendente';
      }
      if (procedureFilter === 'LASER') {
        return client.possuiFichaLaser || client.fichaPrincipal === 'laser';
      }
      if (procedureFilter === 'DESPIGMENTACAO') {
        return client.possuiFichaDespig || client.fichaPrincipal === 'despigmentacao';
      }
      return true;
    });
  }, [clients, searchTerm, procedureFilter]);

  const pendingCount = useMemo(
    () => clients.filter((c) => c.status === 'pendente').length,
    [clients]
  );

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) || null,
    [clients, selectedClientId]
  );

  // ==========================================================================
  // RENDERIZAÇÃO 1: MODO PÚBLICO EXCLUSIVO DA CLIENTE (?form=laser ou ?form=despigmentacao)
  // ==========================================================================
  if (publicFormType) {
    return (
      <ClientPublicFormView
        formType={publicFormType}
        db={db}
        auth={auth}
        appId={appId}
        onRequestProfessionalLogin={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('form');
          url.searchParams.delete('modo');
          window.history.pushState({}, '', url.toString());
          setPublicFormType(null);
        }}
      />
    );
  }

  // ==========================================================================
  // RENDERIZAÇÃO 2: TELA DE LOGIN RESTRITO DAS PROFISSIONAIS
  // ==========================================================================
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F7F4F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-stone-600">
          <div className="w-10 h-10 border-4 border-[#C89D7C] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-wide">Carregando Studio Sol — Laser Hakon...</p>
        </div>
      </div>
    );
  }

  if (!isProfessionalLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F7F4F0] flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E8DFD5] overflow-hidden">
          <div className="bg-gradient-to-br from-[#2C2421] via-[#3D312C] to-[#524039] px-8 py-9 text-center text-white relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
              <Sparkles className="w-7 h-7 text-[#E5C1A1]" />
            </div>
            <h1 className="text-2xl font-serif tracking-wide text-[#FBF8F5]">
              Studio Sol
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#E5C1A1] font-semibold mt-1">
              Laser Hakon • Estética & Despigmentação
            </p>
            <p className="text-[11px] uppercase tracking-[0.15em] text-[#D7B89C]/80 mt-2">
              Acesso Restrito às Profissionais
            </p>
          </div>

          <div className="flex border-b border-stone-200 bg-[#FAF8F5]">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                authMode === 'login'
                  ? 'text-[#8C5E45] border-b-2 border-[#8C5E45] bg-white'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Entrar no Sistema
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setAuthError(''); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                authMode === 'register'
                  ? 'text-[#8C5E45] border-b-2 border-[#8C5E45] bg-white'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Cadastrar Profissional
            </button>
          </div>

          <form onSubmit={handleProfessionalAuth} className="p-7 sm:p-8 space-y-4">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Nome da Profissional
                  </label>
                  <input
                    type="text"
                    required
                    value={profNameInput}
                    onChange={(e) => setProfNameInput(e.target.value)}
                    placeholder="Ex: Solange / Dra. Camila"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-stone-800 focus:outline-none focus:border-[#9E6B4F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                    Código Mestre da Clínica
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    placeholder="Código de autorização"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-stone-800 focus:outline-none focus:border-[#9E6B4F]"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Código de liberação: <strong className="text-stone-600">CLINICA2026</strong>
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                E-mail Profissional
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="profissional@studiosol.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-stone-800 focus:outline-none focus:border-[#9E6B4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-stone-800 focus:outline-none focus:border-[#9E6B4F]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#8C5E45] hover:bg-[#734B36] text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              <Lock className="w-4 h-4" />
              {authLoading
                ? 'Validando acesso...'
                : authMode === 'login'
                ? 'Acessar Prontuários'
                : 'Criar Conta Profissional'}
            </button>

            <div className="pt-4 border-t border-stone-100 space-y-2">
              <p className="text-[11px] text-stone-400 text-center">Abrir ficha para cliente preencher no tablet:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchToTabletClientMode('laser')}
                  className="py-2 px-3 rounded-xl bg-[#FAF7F4] hover:bg-[#EFE7DE] border border-[#E2D2C3] text-[#734B36] text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" /> Ficha Laser
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchToTabletClientMode('despigmentacao')}
                  className="py-2 px-3 rounded-xl bg-[#FAF7F4] hover:bg-[#EFE7DE] border border-[#E2D2C3] text-[#734B36] text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Eraser className="w-3.5 h-3.5" /> Ficha Despigmentação
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDERIZAÇÃO 3: PAINEL PRINCIPAL EXCLUSIVO DAS PROFISSIONAIS
  // ==========================================================================
  return (
    <div className="min-h-screen bg-[#F7F4F0] text-[#2C2523] flex flex-col">
      {/* Toast Flutuante */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 ${
            toast.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : 'bg-[#2C2421] text-[#FBF8F5] border-[#524039]'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-[#E5C1A1] shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Barra Superior com os Dois Links Independentes */}
      <header className="bg-white border-b border-[#E8DFD5] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div
            onClick={() => {
              setSelectedClientId(null);
              setIsCreatingNewClient(false);
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8C5E45] to-[#B6866A] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-semibold text-[#2C2523] leading-tight">
                Studio Sol <span className="text-sm font-sans font-semibold text-[#8C5E45]">• Laser Hakon</span>
              </h1>
              <p className="text-[11px] text-stone-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Área Profissional • {authUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão 1: Link Ficha Laser */}
            <button
              type="button"
              onClick={() => {
                setCopiedLink(false);
                setShareModalType('laser');
              }}
              className="px-3 py-2 rounded-xl bg-[#F4ECE4] hover:bg-[#EADCCF] text-[#734B36] border border-[#DFCBB9] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-[#8C5E45]" />
              <span>Link Ficha Laser</span>
            </button>

            {/* Botão 2: Link Ficha Despigmentação */}
            <button
              type="button"
              onClick={() => {
                setCopiedLink(false);
                setShareModalType('despigmentacao');
              }}
              className="px-3 py-2 rounded-xl bg-[#F9EFEF] hover:bg-[#F2E0E0] text-[#7A3E3E] border border-[#E4C7C7] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eraser className="w-3.5 h-3.5 text-[#8C4545]" />
              <span>Link Ficha Despigmentação</span>
            </button>

            {/* Botão Cadastrar Ficha A4 (Papel) */}
            <button
              type="button"
              onClick={() => {
                setChoiceIsPaperMode(true);
                setShowNewClientChoiceModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5 text-[#8C5E45]" />
              <span>Cadastrar Ficha A4</span>
            </button>

            {/* Botão Nova Cliente */}
            <button
              type="button"
              onClick={() => {
                setChoiceIsPaperMode(false);
                setShowNewClientChoiceModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#8C5E45] hover:bg-[#734B36] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nova Cliente</span>
            </button>

            {/* Sair */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sair do sistema"
              className="p-2 rounded-xl text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {isCreatingNewClient ? (
          <ClientRecordEditor
            initialData={createEmptyClient(newClientFormType, 'profissional')}
            isNew={true}
            initialPaperMode={isPaperModeCreation}
            professionalEmail={authUser.email}
            onCancel={() => setIsCreatingNewClient(false)}
            onSave={async (newClientData) => {
              try {
                const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'anamneses_clientes');
                const docRef = await addDoc(colRef, {
                  ...newClientData,
                  status: 'ativo',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
                setIsCreatingNewClient(false);
                setSelectedClientId(docRef.id);
                setActiveTab('anamnese');
                showNotification('Prontuário da cliente cadastrado com sucesso!');
              } catch (err) {
                console.error(err);
                showNotification('Erro ao salvar prontuário.', 'error');
              }
            }}
          />
        ) : selectedClient ? (
          <ClientDetailView
            client={selectedClient}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            professionalEmail={authUser.email}
            onBack={() => setSelectedClientId(null)}
            onUpdateClient={async (updatedFields) => {
              try {
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'anamneses_clientes', selectedClient.id);
                await updateDoc(docRef, {
                  ...updatedFields,
                  updatedAt: new Date().toISOString()
                });
                showNotification('Alterações salvas no prontuário!');
              } catch (err) {
                console.error(err);
                showNotification('Erro ao atualizar dados. Verifique o tamanho das fotos.', 'error');
              }
            }}
            onDeleteClient={() => setConfirmDeleteClientId(selectedClient.id)}
          />
        ) : (
          /* LISTAGEM E BUSCA DE CLIENTES */
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-semibold text-[#2C2523]">
                  Studio Sol — Prontuários & Anamneses
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  Protocolos separados para <strong>Depilação a Laser (Hakon)</strong> e <strong>Despigmentação</strong>.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-2xl bg-[#FAF7F4] border border-[#E8DFD5] text-center">
                  <span className="block text-xl font-bold text-[#8C5E45]">{clients.length}</span>
                  <span className="text-[11px] uppercase tracking-wider text-stone-500">Clientes</span>
                </div>
                {pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setProcedureFilter('NOVAS')}
                    className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-center hover:bg-amber-100 transition-colors"
                  >
                    <span className="block text-xl font-bold text-amber-700">{pendingCount}</span>
                    <span className="text-[11px] uppercase tracking-wider text-amber-800 font-semibold">
                      Novas (Não Lidas)
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Barra de Busca e Filtros Rápidos */}
            <div className="bg-white rounded-2xl p-4 border border-[#E8DFD5] shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cliente por nome, sobrenome ou celular..."
                  className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8C5E45] text-sm sm:text-base"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'TODAS', label: 'Todas' },
                  { id: 'LASER', label: 'Depilação a Laser' },
                  { id: 'DESPIGMENTACAO', label: 'Despigmentação' },
                  { id: 'NOVAS', label: `Novas (Não Lidas) (${pendingCount})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setProcedureFilter(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      procedureFilter === tab.id
                        ? 'bg-[#2C2421] text-white shadow-sm'
                        : 'bg-[#F7F4F0] text-stone-600 hover:bg-[#EBE4DC]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Clientes */}
            {loadingClients ? (
              <div className="text-center py-12 text-stone-500">Carregando fichas...</div>
            ) : filteredClients.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-[#E8DFD5] text-center space-y-3">
                <Users className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-lg font-semibold text-stone-700">Nenhum prontuário encontrado</h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
                  Envie o <strong>Link Ficha Laser</strong> ou <strong>Link Ficha Despigmentação</strong> para sua cliente, ou cadastre uma ficha manualmente.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => {
                  const dp = client.dadosPessoais || {};
                  const isPending = client.status === 'pendente';
                  const totalSessoes = (client.sessoes || []).length;
                  const fototipo = client.parametrosProfissional?.fototipoConfirmado || client.avaliacaoCutanea?.fototipoCliente || '-';

                  const hasLaser = client.possuiFichaLaser || client.fichaPrincipal === 'laser';
                  const hasDespig = client.possuiFichaDespig || client.fichaPrincipal === 'despigmentacao';

                  return (
                    <div
                      key={client.id}
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setActiveTab('anamnese');
                      }}
                      className={`group bg-white rounded-2xl p-5 border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between ${
                        isPending
                          ? 'border-amber-300 ring-2 ring-amber-100'
                          : 'border-[#E8DFD5] hover:border-[#C89D7C]'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-[#F4ECE4] text-[#8C5E45] font-serif font-bold text-lg flex items-center justify-center shrink-0">
                              {(dp.nomeCompleto || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-stone-900 group-hover:text-[#8C5E45] transition-colors line-clamp-1">
                                {dp.nomeCompleto || 'Cliente sem nome'}
                              </h3>
                              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />
                                {dp.telefone || 'Sem celular'}
                              </p>
                            </div>
                          </div>

                          {isPending ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider shrink-0">
                              Nova Ficha
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold shrink-0">
                              Fototipo {fototipo}
                            </span>
                          )}
                        </div>

                        {/* Selos das Fichas Preenchidas */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {hasLaser && (
                            <span className="px-2.5 py-1 rounded-lg bg-[#FAF6F2] text-[#734B36] border border-[#EADCCF] text-[11px] font-semibold flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Depilação a Laser
                            </span>
                          )}
                          {hasDespig && (
                            <span className="px-2.5 py-1 rounded-lg bg-[#F9EFEF] text-[#7A3E3E] border border-[#E4C7C7] text-[11px] font-semibold flex items-center gap-1">
                              <Eraser className="w-3 h-3" /> Despigmentação
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                        <span>
                          <strong className="text-stone-700">{totalSessoes}</strong>{' '}
                          {totalSessoes === 1 ? 'sessão realizada' : 'sessões realizadas'}
                        </span>
                        <span className="text-[#8C5E45] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Abrir ficha <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ====================================================================
          MODAL 1: ESCOLHER QUAL FICHA CADASTRAR (NOVA CLIENTE OU FICHA A4)
         ==================================================================== */}
      {showNewClientChoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#E8DFD5] shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {choiceIsPaperMode ? 'Transcrever Ficha A4 (Papel)' : 'Cadastrar Nova Cliente'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Selecione qual ficha de anamnese deseja abrir:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewClientChoiceModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setShowNewClientChoiceModal(false);
                  setSelectedClientId(null);
                  setNewClientFormType('laser');
                  setIsPaperModeCreation(choiceIsPaperMode);
                  setIsCreatingNewClient(true);
                }}
                className="w-full p-4 rounded-2xl bg-[#FAF6F2] hover:bg-[#F3E8DE] border border-[#E2D2C3] text-left flex items-center gap-3.5 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#8C5E45] text-white flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-sm text-stone-900">
                    Ficha 1 — Depilação a Laser (Hakon)
                  </span>
                  <span className="block text-xs text-stone-500 mt-0.5">
                    Histórico de pelos, fototipo, contraindicações e medicamentos fotossensibilizantes.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNewClientChoiceModal(false);
                  setSelectedClientId(null);
                  setNewClientFormType('despigmentacao');
                  setIsPaperModeCreation(choiceIsPaperMode);
                  setIsCreatingNewClient(true);
                }}
                className="w-full p-4 rounded-2xl bg-[#F9EFEF] hover:bg-[#F3E1E1] border border-[#E4C7C7] text-left flex items-center gap-3.5 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#8C4545] text-white flex items-center justify-center shrink-0">
                  <Eraser className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-sm text-stone-900">
                    Ficha 2 — Despigmentação (Sobrancelhas e Tatuagem)
                  </span>
                  <span className="block text-xs text-stone-500 mt-0.5">
                    Cores do pigmento, tempo, retoques, cicatrizes/queloides e termo específico.
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: GERAR / COMPARTILHAR LINK EXCLUSIVO (LASER OU DESPIGMENTAÇÃO)
         ==================================================================== */}
      {shareModalType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#E8DFD5] shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    shareModalType === 'laser'
                      ? 'bg-[#F4ECE4] text-[#8C5E45]'
                      : 'bg-[#F9EFEF] text-[#8C4545]'
                  }`}
                >
                  {shareModalType === 'laser' ? <Zap className="w-6 h-6" /> : <Eraser className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-semibold text-stone-900">
                    {shareModalType === 'laser'
                      ? 'Link Ficha — Depilação a Laser (Hakon)'
                      : 'Link Ficha — Despigmentação'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Exclusivo para a cliente preencher antes da sessão
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareModalType(null)}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-[#E8DFD5] text-xs text-stone-600 space-y-2 leading-relaxed">
              <p>
                <strong>Formulário Dedicado:</strong> Ao abrir este link, a cliente verá <strong>apenas</strong> as perguntas e o termo de consentimento de{' '}
                <strong>{shareModalType === 'laser' ? 'Depilação a Laser' : 'Despigmentação de Sobrancelhas e Tatuagem'}</strong>.
              </p>
              <p>
                Nenhum dado interno do Studio Sol fica visível. Assim que ela assinar e enviar, a ficha chega no seu painel com o aviso <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">Nova Ficha</span>.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Link direto para enviar no WhatsApp:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getClientFormUrl(shareModalType)}
                  className="flex-1 px-3.5 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopyClientLink(shareModalType)}
                  className="px-4 py-3 rounded-xl bg-[#8C5E45] hover:bg-[#734B36] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => handleSwitchToTabletClientMode(shareModalType)}
                className="w-full py-3 px-4 rounded-xl bg-[#2C2421] hover:bg-[#3E332F] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Abrir esta Ficha neste Tablet p/ Cliente Preencher Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: CONFIRMAÇÃO DE EXCLUSÃO DE PRONTUÁRIO
         ==================================================================== */}
      {confirmDeleteClientId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Excluir Prontuário?</h3>
            </div>
            <p className="text-sm text-stone-600">
              Tem certeza que deseja apagar permanentemente esta ficha de anamnese, histórico de sessões e fotos? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteClientId(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'anamneses_clientes', confirmDeleteClientId));
                    setConfirmDeleteClientId(null);
                    setSelectedClientId(null);
                    showNotification('Prontuário excluído com sucesso.');
                  } catch (err) {
                    console.error(err);
                    showNotification('Erro ao excluir prontuário.', 'error');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// VISÃO DETALHADA DA CLIENTE (5 ABAS COMPLETAS)
// ============================================================================
function ClientDetailView({
  client,
  activeTab,
  setActiveTab,
  professionalEmail,
  onBack,
  onUpdateClient,
  onDeleteClient
}) {
  const [isEditingAnamnese, setIsEditingAnamnese] = useState(false);
  const dp = client.dadosPessoais || {};
  const isPending = client.status === 'pendente';

  const hasLaser = Boolean(client.possuiFichaLaser || client.fichaPrincipal === 'laser');
  const hasDespig = Boolean(client.possuiFichaDespig || client.fichaPrincipal === 'despigmentacao');

  // Verifica alertas clínicos críticos em ambas as fichas ativas
  const criticalAlerts = useMemo(() => {
    const alerts = [];
    const hsLaser = client.historicoSaudeLaser || {};
    const hsDespig = client.historicoSaudeDespig || {};
    const med = client.medicamentos || {};

    if (hasLaser) {
      HEALTH_CONDITIONS_LASER.forEach((cond) => {
        if (hsLaser[cond.key]) alerts.push(`[Laser] ${cond.label}`);
      });
    }
    if (hasDespig) {
      HEALTH_CONDITIONS_DESPIG.forEach((cond) => {
        if (hsDespig[cond.key]) alerts.push(`[Despig.] ${cond.label}`);
      });
    }
    MEDICATIONS_LIST.forEach((grp) => {
      grp.items.forEach((item) => {
        if (med[item.key]) alerts.push(`${item.label} (${item.pause})`);
      });
    });
    if (client.avaliacaoCutanea?.exposicaoSolarRecente === 'Sim') {
      alerts.push('Exposição solar recente (últimos 15-30 dias)');
    }
    return alerts;
  }, [client, hasLaser, hasDespig]);

  return (
    <div className="space-y-5">
      {/* Navegação Superior & Ações Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-sm font-medium flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar para Lista
        </button>

        <div className="flex items-center gap-2">
          {isPending && (
            <button
              type="button"
              onClick={() => onUpdateClient({ status: 'ativo' })}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Aprovar e Validar Ficha
            </button>
          )}
          <button
            type="button"
            onClick={onDeleteClient}
            className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Excluir prontuário"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cabeçalho do Prontuário da Cliente */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8C5E45] to-[#C89D7C] text-white font-serif text-2xl font-bold flex items-center justify-center shrink-0">
              {(dp.nomeCompleto || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  {dp.nomeCompleto || 'Sem Nome'}
                </h2>
                {isPending && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    Nova (Não Lida)
                  </span>
                )}
                {client.isPaperTranscription && (
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
                    Transcrita de Ficha A4
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-stone-500 mt-1">
                <span>{dp.telefone || 'Sem celular'}</span>
                {dp.dataNascimento && (
                  <span>
                    Nasc.: {formatDateBR(dp.dataNascimento)} ({calculateAge(dp.dataNascimento)})
                  </span>
                )}
                <span>CPF: {dp.cpf || '-'}</span>
              </div>
              {/* Selos das fichas vinculadas */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {hasLaser && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FAF6F2] text-[#734B36] border border-[#EADCCF] text-xs font-semibold">
                    Ficha Laser Hakon
                  </span>
                )}
                {hasDespig && (
                  <span className="px-2.5 py-0.5 rounded-md bg-[#F9EFEF] text-[#7A3E3E] border border-[#E4C7C7] text-xs font-semibold">
                    Ficha Despigmentação
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-[#FAF7F4] border border-[#E8DFD5]">
              <span className="block text-[10px] uppercase tracking-wider text-stone-400">Fototipo Prof.</span>
              <span className="font-bold text-sm text-[#8C5E45]">
                Fitzpatrick {client.parametrosProfissional?.fototipoConfirmado || client.avaliacaoCutanea?.fototipoCliente || '-'}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[#FAF7F4] border border-[#E8DFD5]">
              <span className="block text-[10px] uppercase tracking-wider text-stone-400">Sessões</span>
              <span className="font-bold text-sm text-stone-800">{(client.sessoes || []).length}</span>
            </div>
          </div>
        </div>

        {/* Banner de Alertas Clínicos */}
        {criticalAlerts.length > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 text-red-800 font-semibold text-xs uppercase tracking-wider mb-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Atenção Clínica — Contraindicações / Alertas Sinalizados ({criticalAlerts.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {criticalAlerts.map((al, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-medium">
                  {al}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Abas de Navegação do Prontuário */}
        <div className="flex gap-1.5 overflow-x-auto mt-6 pt-4 border-t border-stone-100">
          {[
            { id: 'anamnese', label: '1. Anamnese', icon: FileText },
            { id: 'tecnico', label: '2. Parâmetros Profissional', icon: Sliders },
            { id: 'sessoes', label: `3. Sessões (${(client.sessoes || []).length})`, icon: Calendar },
            { id: 'fotos', label: `4. Fotos (${(client.fotos || []).length})`, icon: Camera },
            { id: 'orientacoes', label: '5. Pré & Pós (WhatsApp)', icon: MessageCircle }
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id);
                  setIsEditingAnamnese(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#8C5E45] text-white shadow-sm'
                    : 'bg-[#FAF7F4] text-stone-600 hover:bg-[#EFE8E0]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO DA ABA SELECIONADA */}
      {activeTab === 'anamnese' && (
        isEditingAnamnese ? (
          <ClientRecordEditor
            initialData={client}
            isNew={false}
            professionalEmail={professionalEmail}
            onCancel={() => setIsEditingAnamnese(false)}
            onSave={async (updatedData) => {
              await onUpdateClient(updatedData);
              setIsEditingAnamnese(false);
            }}
          />
        ) : (
          <AnamneseReadView
            client={client}
            onEdit={() => setIsEditingAnamnese(true)}
            onAddComplementaryForm={(type) => {
              if (type === 'laser') {
                onUpdateClient({ possuiFichaLaser: true });
              } else {
                onUpdateClient({ possuiFichaDespig: true });
              }
              setIsEditingAnamnese(true);
            }}
          />
        )
      )}

      {activeTab === 'tecnico' && (
        <ProfessionalParametersTab
          client={client}
          onSaveParams={(parametrosProfissional) => onUpdateClient({ parametrosProfissional })}
        />
      )}

      {activeTab === 'sessoes' && (
        <SessionsControlTab
          client={client}
          professionalEmail={professionalEmail}
          onUpdateSessions={(sessoes) => onUpdateClient({ sessoes })}
        />
      )}

      {activeTab === 'fotos' && (
        <PhotoGalleryTab
          client={client}
          onUpdatePhotos={(fotos) => onUpdateClient({ fotos })}
        />
      )}

      {activeTab === 'orientacoes' && (
        <PrePostGuidelinesTab client={client} />
      )}
    </div>
  );
}

// ============================================================================
// ABA 1 (LEITURA): VISUALIZAÇÃO COMPLETA DA(S) FICHA(S) + ADICIONAR FICHA COMPLEMENTAR
// ============================================================================
function AnamneseReadView({ client, onEdit, onAddComplementaryForm }) {
  const dp = client.dadosPessoais || {};
  const hl = client.historicoLaser || {};
  const hd = client.historicoDespigmentacao || {};
  const ac = client.avaliacaoCutanea || {};
  const hsLaser = client.historicoSaudeLaser || {};
  const hsDespig = client.historicoSaudeDespig || {};
  const med = client.medicamentos || {};
  const termo = client.termoConsentimento || {};

  const hasLaser = Boolean(client.possuiFichaLaser || client.fichaPrincipal === 'laser');
  const hasDespig = Boolean(client.possuiFichaDespig || client.fichaPrincipal === 'despigmentacao');

  return (
    <div className="space-y-5">
      {/* Barra de Ações */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {!hasLaser && (
            <button
              type="button"
              onClick={() => onAddComplementaryForm('laser')}
              className="px-4 py-2 rounded-xl bg-[#FAF6F2] hover:bg-[#F1E5DA] text-[#734B36] border border-[#DFCBB9] text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Adicionar Ficha de Depilação a Laser
            </button>
          )}
          {!hasDespig && (
            <button
              type="button"
              onClick={() => onAddComplementaryForm('despigmentacao')}
              className="px-4 py-2 rounded-xl bg-[#F9EFEF] hover:bg-[#F2E0E0] text-[#7A3E3E] border border-[#E4C7C7] text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Adicionar Ficha de Despigmentação
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="px-5 py-2.5 rounded-xl bg-[#2C2421] hover:bg-[#3F332F] text-white text-sm font-semibold flex items-center gap-2 shadow-sm ml-auto"
        >
          <Edit3 className="w-4 h-4" />
          Editar Ficha
        </button>
      </div>

      {/* 1. Dados Pessoais */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4">
        <h3 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
          1. Dados Pessoais da Cliente
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-stone-400 block">Nome Completo</span>
            <span className="font-semibold text-stone-800">{dp.nomeCompleto || '-'}</span>
          </div>
          <div>
            <span className="text-xs text-stone-400 block">Data de Nascimento / Idade</span>
            <span className="font-semibold text-stone-800">
              {formatDateBR(dp.dataNascimento)} {dp.dataNascimento ? `(${calculateAge(dp.dataNascimento)})` : ''}
            </span>
          </div>
          <div>
            <span className="text-xs text-stone-400 block">Sexo</span>
            <span className="font-semibold text-stone-800">{dp.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
          </div>
          <div>
            <span className="text-xs text-stone-400 block">CPF / RG</span>
            <span className="font-semibold text-stone-800">{dp.cpf || '-'} / {dp.rg || '-'}</span>
          </div>
          <div>
            <span className="text-xs text-stone-400 block">Telefone / WhatsApp</span>
            <span className="font-semibold text-stone-800">{dp.telefone || '-'}</span>
          </div>
          <div>
            <span className="text-xs text-stone-400 block">E-mail</span>
            <span className="font-semibold text-stone-800">{dp.email || '-'}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs text-stone-400 block">Endereço Completo</span>
            <span className="font-semibold text-stone-800">
              {[dp.endereco, dp.bairro, dp.cidadeUf].filter(Boolean).join(' • ') || '-'}
            </span>
          </div>
          <div>
            <span className="text-xs text-stone-400 block">Profissão / Como nos conheceu</span>
            <span className="font-semibold text-stone-800">
              {[dp.profissao, dp.comoConheceu].filter(Boolean).join(' • ') || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* BLOCO ESPECÍFICO: DEPILAÇÃO A LASER (HAKON) */}
      {hasLaser && (
        <div className="bg-white rounded-3xl p-6 border border-[#E2D2C3] space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
            <Zap className="w-5 h-5 text-[#8C5E45]" />
            <h3 className="text-base font-serif font-bold text-[#8C5E45]">
              Ficha Depilação a Laser (Hakon) — Histórico & Saúde
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs text-stone-400 block">Costuma fazer depilação na área?</span>
              <span className="font-semibold text-stone-800">{hl.costumaDepilar || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-stone-400 block">Espessura / Cor do Pelo</span>
              <span className="font-semibold text-stone-800">{hl.espessuraPelo} • {hl.corPelo}</span>
            </div>
            <div>
              <span className="text-xs text-stone-400 block">Pelos encravados?</span>
              <span className="font-semibold text-stone-800">
                {hl.pelosEncravados} {hl.localPelosEncravados ? `(${hl.localPelosEncravados})` : ''}
              </span>
            </div>
            <div className="sm:col-span-3">
              <span className="text-xs text-stone-400 block">Métodos utilizados anteriormente</span>
              <span className="font-semibold text-stone-800">
                {(hl.metodosAnteriores || []).join(', ') || 'Nenhum informado'}
              </span>
            </div>
            <div className="sm:col-span-3">
              <span className="text-xs text-stone-400 block">Reações prévias pós-depilação</span>
              <span className="font-semibold text-stone-800">
                {(hl.reacoesPrevias || []).join(', ') || 'Nenhuma'}
              </span>
            </div>
            <div className="sm:col-span-3">
              <span className="text-xs text-stone-400 block">Expectativa de Resultado</span>
              <span className="font-semibold text-stone-800">{hl.expectativaResultado || '-'}</span>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Histórico de Saúde e Contraindicações (Laser)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {HEALTH_CONDITIONS_LASER.map((cond) => {
                const isYes = Boolean(hsLaser[cond.key]);
                return (
                  <div
                    key={cond.key}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      isYes ? 'bg-red-50 border-red-200 text-red-900' : 'bg-[#FAF8F5] border-stone-100 text-stone-700'
                    }`}
                  >
                    <span className="text-xs">
                      {cond.label}
                      {isYes && cond.hasDetail && hsLaser[`${cond.key}Detalhe`] && (
                        <strong className="block mt-0.5">Detalhe: {hsLaser[`${cond.key}Detalhe`]}</strong>
                      )}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                        isYes ? 'bg-red-600 text-white' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isYes ? 'SIM' : 'NÃO'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* BLOCO ESPECÍFICO: DESPIGMENTAÇÃO (SOBRANCELHAS E TATUAGEM) */}
      {hasDespig && (
        <div className="bg-white rounded-3xl p-6 border border-[#E4C7C7] space-y-5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
            <Eraser className="w-5 h-5 text-[#8C4545]" />
            <h3 className="text-base font-serif font-bold text-[#8C4545]">
              Ficha Despigmentação (Sobrancelhas e Tatuagem) — Avaliação & Saúde
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs text-stone-400 block">Tipo de Procedimento</span>
              <span className="font-semibold text-stone-800">{hd.tipoProcedimentoDespig || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-stone-400 block">Localização e Tamanho (cm)</span>
              <span className="font-semibold text-stone-800">{hd.localizacaoTamanho || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-stone-400 block">Tempo desde a realização</span>
              <span className="font-semibold text-stone-800">{hd.tempoRealizacao || '-'}</span>
            </div>
            <div>
              <span className="text-xs text-stone-400 block">Nº de retoques / sessões anteriores</span>
              <span className="font-semibold text-stone-800">{hd.numeroRetoquesAnteriores || '0'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-stone-400 block">Já realizou despigmentação anterior?</span>
              <span className="font-semibold text-stone-800">
                {hd.fezDespigmentacaoAnterior || 'Não'}{' '}
                {hd.detalheDespigmentacaoAnterior ? `(${hd.detalheDespigmentacaoAnterior})` : ''}
              </span>
            </div>
            <div className="sm:col-span-3">
              <span className="text-xs text-stone-400 block">Cores presentes no pigmento</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(hd.coresPresentes || []).map((c) => (
                  <span key={c} className="px-2.5 py-0.5 rounded-md bg-[#F9EFEF] text-[#7A3E3E] text-xs font-semibold">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            {hd.observacoesCicatrizFibrose && (
              <div className="sm:col-span-3">
                <span className="text-xs text-stone-400 block">Observações sobre cicatriz prévia / fibrose</span>
                <span className="font-semibold text-stone-800">{hd.observacoesCicatrizFibrose}</span>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Histórico de Saúde e Contraindicações (Despigmentação)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {HEALTH_CONDITIONS_DESPIG.map((cond) => {
                const isYes = Boolean(hsDespig[cond.key]);
                return (
                  <div
                    key={cond.key}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      isYes ? 'bg-red-50 border-red-200 text-red-900' : 'bg-[#FAF8F5] border-stone-100 text-stone-700'
                    }`}
                  >
                    <span className="text-xs">
                      {cond.label}
                      {isYes && cond.hasDetail && hsDespig[`${cond.key}Detalhe`] && (
                        <strong className="block mt-0.5">Detalhe: {hsDespig[`${cond.key}Detalhe`]}</strong>
                      )}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                        isYes ? 'bg-red-600 text-white' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isYes ? 'SIM' : 'NÃO'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Avaliação Cutânea */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4">
        <h3 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
          Avaliação Cutânea & Exposição Solar
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-stone-400 block">Fototipo Informado</span>
            <span className="font-semibold text-stone-800">
              {FITZPATRICK_OPTIONS.find((f) => f.value === ac.fototipoCliente)?.label || ac.fototipoCliente}
            </span>
          </div>
          <div>
            <span className="text-xs text-stone-400 block">Exposição Solar (últimos 15-30 dias)</span>
            <span className={`font-semibold ${ac.exposicaoSolarRecente === 'Sim' ? 'text-red-600' : 'text-stone-800'}`}>
              {ac.exposicaoSolarRecente || 'Não'}
            </span>
          </div>
          <div>
            <span className="text-xs text-stone-400 block">Tatuagem ou hiperpigmentação na área?</span>
            <span className="font-semibold text-stone-800">
              {ac.tatuagemOuHiperpigmentacaoArea || 'Não'} {ac.detalheAreaEspecial ? `(${ac.detalheAreaEspecial})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Medicamentos */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4">
        <h3 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
          Verificação de Medicamentos e Fotossensibilizantes
        </h3>
        <div className="space-y-3">
          {MEDICATIONS_LIST.map((grp) => (
            <div key={grp.group} className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{grp.group}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {grp.items.map((item) => {
                  const active = Boolean(med[item.key]);
                  return (
                    <div
                      key={item.key}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                        active ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-[#FAF8F5] border-stone-100 text-stone-600'
                      }`}
                    >
                      <span className="text-xs">{item.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                          active ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {active ? 'USA' : 'Não'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {med.outrosRelatados && (
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm">
              <span className="text-xs text-stone-500 block">Outros medicamentos relatados:</span>
              <strong>{med.outrosRelatados}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Termo e Assinatura */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4">
        <h3 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
          Termo de Responsabilidade e Consentimento Informado — Studio Sol
        </h3>
        <div className="text-xs text-stone-600 leading-relaxed bg-[#FAF8F5] p-4 rounded-2xl border border-stone-100 space-y-2">
          {hasLaser && (
            <p>
              <strong>Termo Epilação a Laser (Hakon):</strong> Declaro serem verdadeiras todas as informações prestadas ao <strong>Studio Sol</strong>. Fui amplamente orientado(a) sobre a natureza do tratamento de epilação a laser (redução permanente dos pelos), possíveis efeitos transitórios e a necessidade estrita de cumprir os cuidados pré e pós-sessão.
            </p>
          )}
          {hasDespig && (
            <p>
              <strong>Termo Despigmentação (Sobrancelhas / Tatuagem):</strong> Estou ciente de que a remoção requer um número variável de sessões conforme profundidade e composição do pigmento, podendo ocorrer escurecimento paradoxal transitório (em pigmentos com dióxido de titânio/óxido de ferro), edema e formação de crostas que não devem ser removidas manualmente.
            </p>
          )}
          <p>Autorizo o registro fotográfico para acompanhamento clínico, preservando-se o sigilo profissional.</p>
        </div>

        {client.paperSignedInFile ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 shrink-0" />
            <span>
              <strong>Ficha Física A4 Assinada e Arquivada:</strong> Transcrita para o sistema digital.
            </span>
          </div>
        ) : termo.assinaturaPacienteBase64 ? (
          <div className="max-w-md">
            <SignaturePad
              value={termo.assinaturaPacienteBase64}
              readOnly={true}
              label={`Assinatura Digital da Cliente (${formatDateBR(termo.dataTermo)})`}
            />
          </div>
        ) : (
          <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
            Assinatura digital ainda não registrada. Clique em "Editar Ficha" para coletar na tela ou marcar ficha física A4.
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EDITOR DE ANAMNESE (PROFISSIONAL / TRANSCRIÇÃO FICHA A4 / EDIÇÃO)
// ============================================================================
function ClientRecordEditor({
  initialData,
  isNew,
  initialPaperMode = false,
  onCancel,
  onSave
}) {
  const [formData, setFormData] = useState(() => ({
    ...initialData,
    possuiFichaLaser: initialData.possuiFichaLaser ?? initialData.fichaPrincipal === 'laser',
    possuiFichaDespig: initialData.possuiFichaDespig ?? initialData.fichaPrincipal === 'despigmentacao',
    isPaperTranscription: initialPaperMode || initialData.isPaperTranscription || false,
    paperSignedInFile: initialPaperMode || initialData.paperSignedInFile || false
  }));
  const [saving, setSaving] = useState(false);

  const toggleArrayItem = (section, field, item) => {
    const arr = formData[section]?.[field] || [];
    const next = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
    setFormData({
      ...formData,
      [section]: { ...formData[section], [field]: next }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const hasLaser = Boolean(formData.possuiFichaLaser);
  const hasDespig = Boolean(formData.possuiFichaDespig);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Barra Superior de Ação */}
      <div className="bg-white rounded-3xl p-5 border border-[#E8DFD5] flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 shadow-sm">
        <div>
          <h2 className="text-lg font-serif font-bold text-stone-900">
            {isNew
              ? formData.isPaperTranscription
                ? 'Transcrição Rápida — Ficha de Papel A4'
                : 'Nova Ficha de Anamnese'
              : 'Editando Prontuário da Cliente'}
          </h2>
          <p className="text-xs text-stone-500">
            Ative uma ou ambas as fichas abaixo conforme os procedimentos da cliente.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#8C5E45] hover:bg-[#734B36] text-white text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Prontuário'}
          </button>
        </div>
      </div>

      {/* Opção Modo Ficha A4 em Papel */}
      <div className="bg-[#FAF6F2] rounded-2xl p-4 border border-[#E2D2C3] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileCheck className="w-6 h-6 text-[#8C5E45] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-stone-800">
              Ficha física A4 assinada e arquivada?
            </p>
            <p className="text-xs text-stone-500">
              Marque caso esteja transcrevendo uma ficha de papel já assinada pela cliente.
            </p>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-stone-200">
          <input
            type="checkbox"
            checked={formData.paperSignedInFile}
            onChange={(e) =>
              setFormData({
                ...formData,
                isPaperTranscription: e.target.checked,
                paperSignedInFile: e.target.checked
              })
            }
            className="w-4 h-4 accent-[#8C5E45]"
          />
          <span className="text-xs font-semibold text-stone-700">Ficha física A4 assinada e arquivada</span>
        </label>
      </div>

      {/* Seletor de Fichas Ativas no Prontuário */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-3">
        <h3 className="text-base font-serif font-bold text-[#8C5E45]">
          Fichas Vinculadas a esta Cliente
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              if (hasLaser && !hasDespig) return;
              setFormData({
                ...formData,
                possuiFichaLaser: !hasLaser,
                fichaPrincipal: !hasLaser ? 'laser' : 'despigmentacao'
              });
            }}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center gap-2 transition-all ${
              hasLaser
                ? 'bg-[#8C5E45] text-white border-[#8C5E45]'
                : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            {hasLaser ? '✓ Ficha Depilação a Laser (Hakon)' : '+ Incluir Ficha Depilação a Laser'}
          </button>

          <button
            type="button"
            onClick={() => {
              if (hasDespig && !hasLaser) return;
              setFormData({
                ...formData,
                possuiFichaDespig: !hasDespig,
                fichaPrincipal: !hasDespig && !hasLaser ? 'despigmentacao' : formData.fichaPrincipal
              });
            }}
            className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold border flex items-center gap-2 transition-all ${
              hasDespig
                ? 'bg-[#8C4545] text-white border-[#8C4545]'
                : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
            }`}
          >
            <Eraser className="w-4 h-4" />
            {hasDespig ? '✓ Ficha Despigmentação (Sobrancelhas/Tatuagem)' : '+ Incluir Ficha Despigmentação'}
          </button>
        </div>
      </div>

      {/* 1. Dados Pessoais */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4">
        <h3 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
          1. Dados Pessoais
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-600 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={formData.dadosPessoais.nomeCompleto}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, nomeCompleto: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Telefone / WhatsApp *</label>
            <input
              type="tel"
              required
              value={formData.dadosPessoais.telefone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, telefone: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Data de Nascimento {formData.dadosPessoais.dataNascimento && `(${calculateAge(formData.dadosPessoais.dataNascimento)})`}
            </label>
            <input
              type="date"
              value={formData.dadosPessoais.dataNascimento}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, dataNascimento: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Sexo</label>
            <select
              value={formData.dadosPessoais.sexo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, sexo: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            >
              <option value="F">Feminino (F)</option>
              <option value="M">Masculino (M)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">CPF</label>
            <input
              type="text"
              value={formData.dadosPessoais.cpf}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, cpf: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">RG</label>
            <input
              type="text"
              value={formData.dadosPessoais.rg}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, rg: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">E-mail</label>
            <input
              type="email"
              value={formData.dadosPessoais.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, email: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Profissão</label>
            <input
              type="text"
              value={formData.dadosPessoais.profissao}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, profissao: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-600 mb-1">Endereço</label>
            <input
              type="text"
              value={formData.dadosPessoais.endereco}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, endereco: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Bairro</label>
            <input
              type="text"
              value={formData.dadosPessoais.bairro}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, bairro: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Cidade/UF</label>
            <input
              type="text"
              value={formData.dadosPessoais.cidadeUf}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, cidadeUf: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Como nos conheceu?</label>
            <input
              type="text"
              value={formData.dadosPessoais.comoConheceu}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dadosPessoais: { ...formData.dadosPessoais, comoConheceu: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO ESPECÍFICA: DEPILAÇÃO A LASER */}
      {hasLaser && (
        <div className="bg-white rounded-3xl p-6 border border-[#E2D2C3] space-y-5">
          <h3 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            2A. Histórico de Depilação & Saúde — Laser Hakon
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Costuma fazer depilação na área?</label>
              <select
                value={formData.historicoLaser.costumaDepilar}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoLaser: { ...formData.historicoLaser, costumaDepilar: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Espessura do Pelo</label>
              <select
                value={formData.historicoLaser.espessuraPelo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoLaser: { ...formData.historicoLaser, espessuraPelo: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                <option value="Fino">Fino</option>
                <option value="Médio">Médio</option>
                <option value="Grosso">Grosso</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Cor do Pelo</label>
              <select
                value={formData.historicoLaser.corPelo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoLaser: { ...formData.historicoLaser, corPelo: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                <option value="Loiro/Ruivo">Loiro / Ruivo</option>
                <option value="Castanho Claro">Castanho Claro</option>
                <option value="Castanho Escuro/Preto">Castanho Escuro / Preto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Métodos utilizados anteriormente:</label>
            <div className="flex flex-wrap gap-2">
              {METODOS_DEPILACAO.map((m) => {
                const checked = (formData.historicoLaser.metodosAnteriores || []).includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleArrayItem('historicoLaser', 'metodosAnteriores', m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      checked ? 'bg-[#8C5E45] text-white border-[#8C5E45]' : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Reações prévias pós-depilação:</label>
            <div className="flex flex-wrap gap-2">
              {REACOES_PREVIAS.map((r) => {
                const checked = (formData.historicoLaser.reacoesPrevias || []).includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleArrayItem('historicoLaser', 'reacoesPrevias', r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      checked ? 'bg-[#8C5E45] text-white border-[#8C5E45]' : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Presença de pelos encravados?</label>
              <select
                value={formData.historicoLaser.pelosEncravados}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoLaser: { ...formData.historicoLaser, pelosEncravados: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1">Local dos pelos encravados</label>
              <input
                type="text"
                value={formData.historicoLaser.localPelosEncravados}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoLaser: { ...formData.historicoLaser, localPelosEncravados: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-stone-600 mb-1">Expectativa de Resultado</label>
              <input
                type="text"
                value={formData.historicoLaser.expectativaResultado}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoLaser: { ...formData.historicoLaser, expectativaResultado: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Contraindicações & Histórico de Saúde (Laser)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {HEALTH_CONDITIONS_LASER.map((cond) => {
                const checked = Boolean(formData.historicoSaudeLaser[cond.key]);
                return (
                  <div
                    key={cond.key}
                    className={`p-3 rounded-2xl border ${
                      checked ? 'bg-red-50 border-red-200' : 'bg-[#FAF8F5] border-stone-200'
                    }`}
                  >
                    <label className="flex items-start justify-between gap-3 cursor-pointer">
                      <span className="text-xs font-medium text-stone-800">{cond.label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            historicoSaudeLaser: { ...formData.historicoSaudeLaser, [cond.key]: e.target.checked }
                          })
                        }
                        className="w-4 h-4 accent-red-600 shrink-0 mt-0.5"
                      />
                    </label>
                    {checked && cond.hasDetail && (
                      <input
                        type="text"
                        placeholder={cond.detailPlaceholder}
                        value={formData.historicoSaudeLaser[`${cond.key}Detalhe`] || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            historicoSaudeLaser: {
                              ...formData.historicoSaudeLaser,
                              [`${cond.key}Detalhe`]: e.target.value
                            }
                          })
                        }
                        className="mt-2 w-full px-3 py-1.5 rounded-xl border border-red-200 bg-white text-xs"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO ESPECÍFICA: DESPIGMENTAÇÃO */}
      {hasDespig && (
        <div className="bg-white rounded-3xl p-6 border border-[#E4C7C7] space-y-5">
          <h3 className="text-base font-serif font-bold text-[#8C4545] border-b border-stone-100 pb-2 flex items-center gap-2">
            <Eraser className="w-5 h-5" />
            2B. Avaliação Específica & Saúde — Despigmentação (Sobrancelhas e Tatuagem)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Tipo de Procedimento</label>
              <select
                value={formData.historicoDespigmentacao.tipoProcedimentoDespig}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoDespigmentacao: {
                      ...formData.historicoDespigmentacao,
                      tipoProcedimentoDespig: e.target.value
                    }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                <option value="Remoção de Micropigmentação de Sobrancelhas">Remoção de Micropigmentação de Sobrancelhas</option>
                <option value="Remoção de Tatuagem">Remoção de Tatuagem</option>
                <option value="Ambos">Ambos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Localização exata e tamanho (cm)</label>
              <input
                type="text"
                placeholder="Ex: Sobrancelhas / Antebraço 8x5cm"
                value={formData.historicoDespigmentacao.localizacaoTamanho}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoDespigmentacao: { ...formData.historicoDespigmentacao, localizacaoTamanho: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Tempo desde a realização</label>
              <select
                value={formData.historicoDespigmentacao.tempoRealizacao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoDespigmentacao: { ...formData.historicoDespigmentacao, tempoRealizacao: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                {TEMPO_PIGMENTO_OPCOES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Nº de retoques / sessões já feitas</label>
              <input
                type="text"
                value={formData.historicoDespigmentacao.numeroRetoquesAnteriores}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoDespigmentacao: {
                      ...formData.historicoDespigmentacao,
                      numeroRetoquesAnteriores: e.target.value
                    }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Já fez despigmentação anterior?</label>
              <select
                value={formData.historicoDespigmentacao.fezDespigmentacaoAnterior}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoDespigmentacao: {
                      ...formData.historicoDespigmentacao,
                      fezDespigmentacaoAnterior: e.target.value
                    }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                <option value="Não">Não</option>
                <option value="Sim (Laser)">Sim (Laser)</option>
                <option value="Sim (Ácido / Despigmentante Químico)">Sim (Ácido / Despigmentante Químico)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Quantas sessões e há quanto tempo?</label>
              <input
                type="text"
                value={formData.historicoDespigmentacao.detalheDespigmentacaoAnterior}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    historicoDespigmentacao: {
                      ...formData.historicoDespigmentacao,
                      detalheDespigmentacaoAnterior: e.target.value
                    }
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5">Cores presentes no pigmento:</label>
            <div className="flex flex-wrap gap-2">
              {CORES_PIGMENTO_DESPIG.map((cor) => {
                const checked = (formData.historicoDespigmentacao.coresPresentes || []).includes(cor);
                return (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => toggleArrayItem('historicoDespigmentacao', 'coresPresentes', cor)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      checked ? 'bg-[#8C4545] text-white border-[#8C4545]' : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
                    }`}
                  >
                    {cor}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Observações sobre cicatriz prévia, fibrose ou alteração de textura no local:
            </label>
            <input
              type="text"
              value={formData.historicoDespigmentacao.observacoesCicatrizFibrose}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  historicoDespigmentacao: {
                    ...formData.historicoDespigmentacao,
                    observacoesCicatrizFibrose: e.target.value
                  }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>

          <div className="pt-2 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Contraindicações & Histórico de Saúde (Despigmentação)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {HEALTH_CONDITIONS_DESPIG.map((cond) => {
                const checked = Boolean(formData.historicoSaudeDespig[cond.key]);
                return (
                  <div
                    key={cond.key}
                    className={`p-3 rounded-2xl border ${
                      checked ? 'bg-red-50 border-red-200' : 'bg-[#FAF8F5] border-stone-200'
                    }`}
                  >
                    <label className="flex items-start justify-between gap-3 cursor-pointer">
                      <span className="text-xs font-medium text-stone-800">{cond.label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            historicoSaudeDespig: { ...formData.historicoSaudeDespig, [cond.key]: e.target.checked }
                          })
                        }
                        className="w-4 h-4 accent-red-600 shrink-0 mt-0.5"
                      />
                    </label>
                    {checked && cond.hasDetail && (
                      <input
                        type="text"
                        placeholder={cond.detailPlaceholder}
                        value={formData.historicoSaudeDespig[`${cond.key}Detalhe`] || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            historicoSaudeDespig: {
                              ...formData.historicoSaudeDespig,
                              [`${cond.key}Detalhe`]: e.target.value
                            }
                          })
                        }
                        className="mt-2 w-full px-3 py-1.5 rounded-xl border border-red-200 bg-white text-xs"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Avaliação Cutânea e Fototipo */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4">
        <h3 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
          3. Avaliação Cutânea e Fototipo (Fitzpatrick)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {FITZPATRICK_OPTIONS.map((opt) => {
            const selected = formData.avaliacaoCutanea.fototipoCliente === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    avaliacaoCutanea: { ...formData.avaliacaoCutanea, fototipoCliente: opt.value }
                  })
                }
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selected
                    ? 'bg-[#8C5E45] text-white border-[#8C5E45] shadow-xs'
                    : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-[#C89D7C]'
                }`}
              >
                <span className="block font-bold text-sm">{opt.label}</span>
                <span className={`text-xs ${selected ? 'text-amber-100' : 'text-stone-500'}`}>{opt.desc}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Exposição solar nos últimos 15 a 30 dias?
            </label>
            <select
              value={formData.avaliacaoCutanea.exposicaoSolarRecente}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  avaliacaoCutanea: { ...formData.avaliacaoCutanea, exposicaoSolarRecente: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Tatuagem ou hiperpigmentação na área?
            </label>
            <select
              value={formData.avaliacaoCutanea.tatuagemOuHiperpigmentacaoArea}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  avaliacaoCutanea: { ...formData.avaliacaoCutanea, tatuagemOuHiperpigmentacaoArea: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Local / Observação</label>
            <input
              type="text"
              value={formData.avaliacaoCutanea.detalheAreaEspecial}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  avaliacaoCutanea: { ...formData.avaliacaoCutanea, detalheAreaEspecial: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
        </div>
      </div>

      {/* 4. Medicamentos */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4">
        <h3 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
          4. Verificação de Medicamentos e Fotossensibilizantes
        </h3>
        {MEDICATIONS_LIST.map((grp) => (
          <div key={grp.group} className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">{grp.group}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {grp.items.map((item) => {
                const checked = Boolean(formData.medicamentos[item.key]);
                return (
                  <label
                    key={item.key}
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 cursor-pointer ${
                      checked ? 'bg-amber-50 border-amber-300' : 'bg-[#FAF8F5] border-stone-200'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-medium text-stone-800">{item.label}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-semibold text-stone-600">
                        {item.pause}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicamentos: { ...formData.medicamentos, [item.key]: e.target.checked }
                        })
                      }
                      className="w-5 h-5 accent-amber-600 shrink-0 mt-0.5"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            Outros medicamentos relatados pelo paciente:
          </label>
          <input
            type="text"
            value={formData.medicamentos.outrosRelatados}
            onChange={(e) =>
              setFormData({
                ...formData,
                medicamentos: { ...formData.medicamentos, outrosRelatados: e.target.value }
              })
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
          />
        </div>
      </div>

      {/* Termo e Assinatura */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4">
        <h3 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
          Termo de Responsabilidade e Assinatura
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Cidade/UF do Termo</label>
            <input
              type="text"
              value={formData.termoConsentimento.cidadeTermo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  termoConsentimento: { ...formData.termoConsentimento, cidadeTermo: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Data</label>
            <input
              type="date"
              value={formData.termoConsentimento.dataTermo}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  termoConsentimento: { ...formData.termoConsentimento, dataTermo: e.target.value }
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
        </div>

        {!formData.paperSignedInFile && (
          <SignaturePad
            value={formData.termoConsentimento.assinaturaPacienteBase64}
            onChange={(base64) =>
              setFormData({
                ...formData,
                termoConsentimento: {
                  ...formData.termoConsentimento,
                  aceito: true,
                  assinaturaPacienteBase64: base64
                }
              })
            }
          />
        )}
      </div>
    </form>
  );
}

// ============================================================================
// ABA 2: PARÂMETROS TÉCNICOS EXCLUSIVOS DO PROFISSIONAL
// ============================================================================
function ProfessionalParametersTab({ client, onSaveParams }) {
  const hasLaser = Boolean(client.possuiFichaLaser || client.fichaPrincipal === 'laser');
  const hasDespig = Boolean(client.possuiFichaDespig || client.fichaPrincipal === 'despigmentacao');

  const [params, setParams] = useState(() => ({
    fototipoConfirmado:
      client.parametrosProfissional?.fototipoConfirmado || client.avaliacaoCutanea?.fototipoCliente || 'III',
    modoSequencial: client.parametrosProfissional?.modoSequencial || {
      fluencia: '',
      frequencia: '',
      tempoPulso: '',
      observacao: ''
    },
    modoPontual: client.parametrosProfissional?.modoPontual || {
      fluencia: '',
      frequencia: '',
      observacao: ''
    },
    modoVarredura: client.parametrosProfissional?.modoVarredura || {
      fluencia: '',
      frequencia: '',
      passadas: '',
      observacao: ''
    },
    observacoesHakon: client.parametrosProfissional?.observacoesHakon || '',
    despigmentacaoParams: client.parametrosProfissional?.despigmentacaoParams || {
      comprimentoOnda: '1064nm',
      energiaMj: '',
      frequenciaHz: '',
      spotSize: '',
      ponteiraUtilizada: '',
      reacaoImediataFrosting: 'Frosting leve / branqueamento imediato'
    },
    observacoesClinicasInternas: client.parametrosProfissional?.observacoesClinicasInternas || ''
  }));

  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSaveParams(params);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#2C2523] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#8C5E45]" />
              Parâmetros Técnicos — Studio Sol (Laser Hakon & Despigmentação)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Área restrita às profissionais cadastradas.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#8C5E45] hover:bg-[#734B36] text-white text-sm font-semibold flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Parâmetros'}
          </button>
        </div>

        {/* Fototipo Confirmado pelo Profissional */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
            Fototipo Confirmado pela Profissional (Fitzpatrick)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {FITZPATRICK_OPTIONS.map((f) => {
              const selected = params.fototipoConfirmado === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setParams({ ...params, fototipoConfirmado: f.value })}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    selected
                      ? 'bg-[#2C2421] text-white border-[#2C2421] shadow-xs'
                      : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-[#C89D7C]'
                  }`}
                >
                  <span className="block text-base font-bold">{f.value}</span>
                  <span className="block text-[10px] opacity-80 line-clamp-1">{f.desc.split('(')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PARÂMETROS LASER HAKON */}
        {hasLaser && (
          <div className="space-y-4 pt-2 border-t border-stone-100">
            <h4 className="text-sm font-bold text-[#8C5E45] flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Parâmetros do Equipamento Laser Hakon (Sequencial, Pontual e Varredura)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Modo Sequencial */}
              <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-[#E5D7C9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#734B36]">Modo Sequencial</span>
                  <span className="px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-stone-500 border border-stone-200">
                    Sequencial
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Potência / Fluência (J/cm²)</label>
                  <input
                    type="text"
                    placeholder="Ex: 18 J/cm²"
                    value={params.modoSequencial.fluencia}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoSequencial: { ...params.modoSequencial, fluencia: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Frequência (Hz)</label>
                  <input
                    type="text"
                    placeholder="Ex: 3 Hz"
                    value={params.modoSequencial.frequencia}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoSequencial: { ...params.modoSequencial, frequencia: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Tempo / Largura de Pulso</label>
                  <input
                    type="text"
                    placeholder="Ex: 30 ms"
                    value={params.modoSequencial.tempoPulso || ''}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoSequencial: { ...params.modoSequencial, tempoPulso: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Áreas / Notas</label>
                  <input
                    type="text"
                    placeholder="Ex: Virilha e axilas"
                    value={params.modoSequencial.observacao}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoSequencial: { ...params.modoSequencial, observacao: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Modo Pontual */}
              <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-[#E5D7C9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#734B36]">Modo Pontual</span>
                  <span className="px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-stone-500 border border-stone-200">
                    Pontual
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Potência / Fluência (J/cm²)</label>
                  <input
                    type="text"
                    placeholder="Ex: 24 J/cm²"
                    value={params.modoPontual.fluencia}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoPontual: { ...params.modoPontual, fluencia: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Frequência (Hz)</label>
                  <input
                    type="text"
                    placeholder="Ex: 1 Hz"
                    value={params.modoPontual.frequencia}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoPontual: { ...params.modoPontual, frequencia: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Áreas / Notas</label>
                  <input
                    type="text"
                    placeholder="Ex: Buço / Pelos resistentes"
                    value={params.modoPontual.observacao}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoPontual: { ...params.modoPontual, observacao: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
              </div>

              {/* Modo Varredura */}
              <div className="p-4 rounded-2xl bg-[#FAF7F4] border border-[#E5D7C9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#734B36]">Modo Varredura</span>
                  <span className="px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-stone-500 border border-stone-200">
                    Varredura
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Potência / Fluência (J/cm²)</label>
                  <input
                    type="text"
                    placeholder="Ex: 12 J/cm²"
                    value={params.modoVarredura.fluencia}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoVarredura: { ...params.modoVarredura, fluencia: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Frequência (Hz)</label>
                  <input
                    type="text"
                    placeholder="Ex: 10 Hz"
                    value={params.modoVarredura.frequencia}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoVarredura: { ...params.modoVarredura, frequencia: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Passadas por Quadrante</label>
                  <input
                    type="text"
                    placeholder="Ex: 3 a 4 passadas"
                    value={params.modoVarredura.passadas || ''}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoVarredura: { ...params.modoVarredura, passadas: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Áreas / Notas</label>
                  <input
                    type="text"
                    placeholder="Ex: Pernas / Áreas extensas"
                    value={params.modoVarredura.observacao}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        modoVarredura: { ...params.modoVarredura, observacao: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Observações do Equipamento Laser Hakon (resfriamento ponteira, conforto, etc.)
              </label>
              <input
                type="text"
                value={params.observacoesHakon}
                onChange={(e) => setParams({ ...params, observacoesHakon: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
          </div>
        )}

        {/* PARÂMETROS DESPIGMENTAÇÃO */}
        {hasDespig && (
          <div className="p-5 rounded-2xl bg-[#F9EFEF]/60 border border-[#E4C7C7] space-y-4">
            <h4 className="text-sm font-bold text-[#7A3E3E] flex items-center gap-2">
              <Eraser className="w-4 h-4" />
              Parâmetros de Despigmentação (Sobrancelhas / Remoção de Tatuagem)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Comprimento de Onda</label>
                <select
                  value={params.despigmentacaoParams.comprimentoOnda}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      despigmentacaoParams: { ...params.despigmentacaoParams, comprimentoOnda: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
                >
                  <option value="1064nm">1064nm (Pigmentos Escuros / Preto / Chumbado)</option>
                  <option value="532nm">532nm (Pigmentos Quentes / Vermelho / Alaranjado)</option>
                  <option value="755nm">755nm (Pigmentos Azuis / Esverdeados)</option>
                  <option value="1064nm + 532nm">1064nm + 532nm</option>
                  <option value="Despigmentação Química/Enzimática">Despigmentação Química / Enzimática</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Energia (mJ)</label>
                <input
                  type="text"
                  placeholder="Ex: 350 mJ"
                  value={params.despigmentacaoParams.energiaMj}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      despigmentacaoParams: { ...params.despigmentacaoParams, energiaMj: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Frequência (Hz)</label>
                <input
                  type="text"
                  placeholder="Ex: 2 Hz"
                  value={params.despigmentacaoParams.frequenciaHz}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      despigmentacaoParams: { ...params.despigmentacaoParams, frequenciaHz: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Spot Size (mm)</label>
                <input
                  type="text"
                  placeholder="Ex: 3 mm"
                  value={params.despigmentacaoParams.spotSize}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      despigmentacaoParams: { ...params.despigmentacaoParams, spotSize: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Ponteira Utilizada</label>
                <input
                  type="text"
                  placeholder="Ex: Colimada / F1064 / F532"
                  value={params.despigmentacaoParams.ponteiraUtilizada || ''}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      despigmentacaoParams: { ...params.despigmentacaoParams, ponteiraUtilizada: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Reação Imediata (Frosting)</label>
                <input
                  type="text"
                  placeholder="Ex: Frosting imediato sem sangramento"
                  value={params.despigmentacaoParams.reacaoImediataFrosting || ''}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      despigmentacaoParams: {
                        ...params.despigmentacaoParams,
                        reacaoImediataFrosting: e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Observações Clínicas Internas */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
            Anotações Clínicas Internas da Profissional
          </label>
          <textarea
            rows={4}
            placeholder="Registre sensibilidade da cliente, resposta ao teste de disparo, histórico de evolução..."
            value={params.observacoesClinicasInternas}
            onChange={(e) => setParams({ ...params, observacoesClinicasInternas: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border border-stone-300 bg-[#FCFBF9] text-sm"
          />
        </div>
      </div>
    </form>
  );
}

// ============================================================================
// ABA 3: CONTROLE DE SESSÕES & ÁREAS FEITAS EM CADA SESSÃO
// ============================================================================
function SessionsControlTab({ client, professionalEmail, onUpdateSessions }) {
  const sessions = client.sessoes || [];
  const [showAddForm, setShowAddForm] = useState(false);

  const hasLaser = Boolean(client.possuiFichaLaser || client.fichaPrincipal === 'laser');
  const hasDespig = Boolean(client.possuiFichaDespig || client.fichaPrincipal === 'despigmentacao');

  const defaultProc = hasLaser ? 'Depilação a Laser (Hakon)' : 'Despigmentação';
  const defaultFototipo =
    client.parametrosProfissional?.fototipoConfirmado || client.avaliacaoCutanea?.fototipoCliente || 'III';

  const [newSession, setNewSession] = useState({
    numeroSessao: sessions.length + 1,
    data: new Date().toISOString().split('T')[0],
    procedimento: defaultProc,
    areasTratadas: [],
    areaPersonalizada: '',
    fototipo: defaultFototipo,
    modoAplicacao: hasLaser ? 'Sequencial' : 'Despigmentação 1064nm',
    fluencia: '',
    frequencia: '',
    passadas: '',
    endpoint: hasLaser ? 'Edema perifolicular + Hiperemia leve' : 'Frosting imediato leve',
    observacoes: '',
    assinaturaSessao: '',
    profissional: professionalEmail || ''
  });

  const toggleArea = (area) => {
    const exists = newSession.areasTratadas.includes(area);
    setNewSession({
      ...newSession,
      areasTratadas: exists
        ? newSession.areasTratadas.filter((a) => a !== area)
        : [...newSession.areasTratadas, area]
    });
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    const areasFinal = [...newSession.areasTratadas];
    if (newSession.areaPersonalizada.trim()) {
      areasFinal.push(newSession.areaPersonalizada.trim());
    }

    const sessionRecord = {
      id: crypto.randomUUID(),
      ...newSession,
      areasTratadas: areasFinal
    };

    const updated = [...sessions, sessionRecord];
    await onUpdateSessions(updated);
    setShowAddForm(false);
    setNewSession({
      numeroSessao: updated.length + 1,
      data: new Date().toISOString().split('T')[0],
      procedimento: defaultProc,
      areasTratadas: [],
      areaPersonalizada: '',
      fototipo: defaultFototipo,
      modoAplicacao: hasLaser ? 'Sequencial' : 'Despigmentação 1064nm',
      fluencia: '',
      frequencia: '',
      passadas: '',
      endpoint: hasLaser ? 'Edema perifolicular + Hiperemia leve' : 'Frosting imediato leve',
      observacoes: '',
      assinaturaSessao: '',
      profissional: professionalEmail || ''
    });
  };

  const handleRemoveSession = async (sessionId) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    await onUpdateSessions(updated);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-serif font-bold text-stone-900">
            Histórico e Controle de Sessões
          </h3>
          <p className="text-xs text-stone-500">
            Registre cada sessão realizada, áreas tratadas, modo aplicado e endpoint observado.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewSession((prev) => ({ ...prev, numeroSessao: sessions.length + 1 }));
            setShowAddForm(!showAddForm);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#8C5E45] hover:bg-[#734B36] text-white text-sm font-semibold flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Registrar Nova Sessão ({sessions.length + 1}ª)
        </button>
      </div>

      {/* Formulário de Nova Sessão */}
      {showAddForm && (
        <form onSubmit={handleAddSession} className="bg-white rounded-3xl p-6 border-2 border-[#C89D7C] shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="font-serif font-bold text-base text-[#8C5E45]">
              Nova Sessão — {newSession.numeroSessao}ª Sessão
            </h4>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-stone-400 hover:text-stone-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Nº da Sessão</label>
              <input
                type="number"
                min="1"
                required
                value={newSession.numeroSessao}
                onChange={(e) => setNewSession({ ...newSession, numeroSessao: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Data da Sessão</label>
              <input
                type="date"
                required
                value={newSession.data}
                onChange={(e) => setNewSession({ ...newSession, data: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Procedimento</label>
              <select
                value={newSession.procedimento}
                onChange={(e) => setNewSession({ ...newSession, procedimento: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                <option value="Depilação a Laser (Hakon)">Depilação a Laser (Hakon)</option>
                <option value="Despigmentação de Sobrancelhas">Despigmentação de Sobrancelhas</option>
                <option value="Remoção de Tatuagem">Remoção de Tatuagem</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Fototipo Aplicado</label>
              <select
                value={newSession.fototipo}
                onChange={(e) => setNewSession({ ...newSession, fototipo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                {FITZPATRICK_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    Fototipo {f.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Áreas feitas na sessão (agrupadas por Laser e Despigmentação) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-600">
              Áreas feitas nesta sessão (selecione uma ou mais):
            </label>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E45]">Áreas Depilação a Laser:</p>
              <div className="flex flex-wrap gap-1.5">
                {AREAS_LASER_SESSAO.map((area) => {
                  const selected = newSession.areasTratadas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-[#8C5E45] text-white border-[#8C5E45]'
                          : 'bg-[#FAF8F5] text-stone-700 border-stone-200 hover:border-[#C89D7C]'
                      }`}
                    >
                      {selected ? '✓ ' : ''}
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C4545]">Áreas Despigmentação:</p>
              <div className="flex flex-wrap gap-1.5">
                {AREAS_DESPIG_SESSAO.map((area) => {
                  const selected = newSession.areasTratadas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-[#8C4545] text-white border-[#8C4545]'
                          : 'bg-[#F9EFEF]/60 text-stone-700 border-[#E4C7C7] hover:border-[#8C4545]'
                      }`}
                    >
                      {selected ? '✓ ' : ''}
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              type="text"
              placeholder="Outra região específica (ex: Tatuagem antebraço esquerdo)..."
              value={newSession.areaPersonalizada}
              onChange={(e) => setNewSession({ ...newSession, areaPersonalizada: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-[#FCFBF9] text-xs"
            />
          </div>

          {/* Parâmetros da Sessão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Modo</label>
              <select
                value={newSession.modoAplicacao}
                onChange={(e) => setNewSession({ ...newSession, modoAplicacao: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                <option value="Sequencial">Sequencial</option>
                <option value="Pontual">Pontual</option>
                <option value="Varredura">Varredura</option>
                <option value="Despigmentação 1064nm">Despigmentação 1064nm</option>
                <option value="Despigmentação 532nm">Despigmentação 532nm</option>
                <option value="Despigmentação Química">Despigmentação Química</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Fluência / Energia</label>
              <input
                type="text"
                placeholder="Ex: 18 J/cm² ou 350 mJ"
                value={newSession.fluencia}
                onChange={(e) => setNewSession({ ...newSession, fluencia: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Frequência (Hz)</label>
              <input
                type="text"
                placeholder="Ex: 3 Hz"
                value={newSession.frequencia}
                onChange={(e) => setNewSession({ ...newSession, frequencia: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Passadas / Spot</label>
              <input
                type="text"
                placeholder="Ex: 2 passadas / 3mm"
                value={newSession.passadas}
                onChange={(e) => setNewSession({ ...newSession, passadas: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Endpoint Observado</label>
              <input
                type="text"
                placeholder="Edema / Hiperemia / Frosting"
                value={newSession.endpoint}
                onChange={(e) => setNewSession({ ...newSession, endpoint: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Observações da Sessão</label>
              <textarea
                rows={4}
                placeholder="Evolução dos pelos/pigmento, conforto da cliente..."
                value={newSession.observacoes}
                onChange={(e) => setNewSession({ ...newSession, observacoes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <SignaturePad
                label="Assinatura da Cliente na Sessão (Opcional)"
                value={newSession.assinaturaSessao}
                onChange={(b64) => setNewSession({ ...newSession, assinaturaSessao: b64 })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#8C5E45] hover:bg-[#734B36] text-white text-sm font-semibold shadow-sm"
            >
              Salvar Sessão
            </button>
          </div>
        </form>
      )}

      {/* Listagem das Sessões Registradas */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-[#E8DFD5] text-center space-y-2">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="font-semibold text-stone-700">Nenhuma sessão registrada ainda</p>
          <p className="text-xs text-stone-500">
            Clique em "Registrar Nova Sessão" para documentar o atendimento de hoje.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...sessions].reverse().map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-5 border border-[#E8DFD5] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#2C2421] text-white text-xs font-bold">
                    {s.numeroSessao}ª Sessão
                  </span>
                  <span className="text-sm font-semibold text-stone-800">{formatDateBR(s.data)}</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#F4ECE4] text-[#734B36] text-xs font-medium">
                    {s.procedimento}
                  </span>
                  <span className="text-xs text-stone-500">• Fototipo {s.fototipo}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-stone-500">Áreas tratadas:</span>
                  {(s.areasTratadas || []).length > 0 ? (
                    s.areasTratadas.map((ar, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium">
                        {ar}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-400">Não especificadas</span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2 rounded-lg bg-[#FAF8F5]">
                    <span className="text-stone-400 block">Modo</span>
                    <strong className="text-stone-800">{s.modoAplicacao || '-'}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAF8F5]">
                    <span className="text-stone-400 block">Fluência / Energia</span>
                    <strong className="text-stone-800">{s.fluencia || '-'}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAF8F5]">
                    <span className="text-stone-400 block">Frequência / Passadas</span>
                    <strong className="text-stone-800">
                      {[s.frequencia, s.passadas].filter(Boolean).join(' • ') || '-'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAF8F5]">
                    <span className="text-stone-400 block">Endpoint</span>
                    <strong className="text-stone-800">{s.endpoint || '-'}</strong>
                  </div>
                </div>

                {s.observacoes && (
                  <p className="text-xs text-stone-600 italic pt-1">Obs.: {s.observacoes}</p>
                )}
              </div>

              <div className="flex items-center gap-3 self-end lg:self-center">
                {s.assinaturaSessao && (
                  <img
                    src={s.assinaturaSessao}
                    alt="Assinatura sessão"
                    className="h-12 w-28 object-contain border border-stone-200 rounded-lg bg-[#FCFBF9] p-1"
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveSession(s.id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50"
                  title="Remover sessão"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ABA 4: GALERIA DE FOTOS DA CLIENTE (ANTES, DURANTE E DEPOIS)
// ============================================================================
function PhotoGalleryTab({ client, onUpdatePhotos }) {
  const photos = client.fotos || [];
  const [stageTag, setStageTag] = useState('Antes');
  const [areaTag, setAreaTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const compressedList = [];
      for (const file of files) {
        const dataUrl = await compressImageFile(file, 720, 0.62);
        compressedList.push({
          id: crypto.randomUUID(),
          url: dataUrl,
          etapa: stageTag,
          area: areaTag.trim() || 'Área tratada',
          data: new Date().toISOString().split('T')[0]
        });
      }
      await onUpdatePhotos([...photos, ...compressedList]);
      setAreaTag('');
    } catch (err) {
      console.error('Erro ao processar foto:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    await onUpdatePhotos(photos.filter((p) => p.id !== photoId));
    if (lightboxPhoto?.id === photoId) setLightboxPhoto(null);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-stone-900">
            Registro Fotográfico & Evolução Clínica
          </h3>
          <p className="text-xs text-stone-500">
            Anexe fotos do antes, durante e depois das sessões com sigilo absoluto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-[#FAF7F4] p-4 rounded-2xl border border-[#E8DFD5]">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Momento / Etapa</label>
            <select
              value={stageTag}
              onChange={(e) => setStageTag(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
            >
              <option value="Antes">Antes (Avaliação Inicial)</option>
              <option value="1ª Sessão">1ª Sessão</option>
              <option value="2ª Sessão">2ª Sessão</option>
              <option value="3ª Sessão">3ª Sessão</option>
              <option value="Evolução">Evolução / Intermediário</option>
              <option value="Depois">Depois (Resultado Final)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Região / Descrição</label>
            <input
              type="text"
              placeholder="Ex: Sobrancelhas, Axila..."
              value={areaTag}
              onChange={(e) => setAreaTag(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
            />
          </div>
          <div>
            <label className="w-full py-2.5 px-4 rounded-xl bg-[#8C5E45] hover:bg-[#734B36] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors">
              <Camera className="w-4 h-4" />
              <span>{uploading ? 'Processando...' : 'Adicionar / Tirar Foto'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E8DFD5] text-center space-y-2">
          <ImageIcon className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="font-semibold text-stone-700">Nenhuma foto anexada a este prontuário</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group bg-white rounded-2xl border border-[#E8DFD5] overflow-hidden shadow-2xs flex flex-col"
            >
              <div
                onClick={() => setLightboxPhoto(photo)}
                className="relative aspect-square bg-stone-100 cursor-pointer overflow-hidden"
              >
                <img
                  src={photo.url}
                  alt={photo.area}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-semibold backdrop-blur-xs">
                  {photo.etapa}
                </span>
              </div>
              <div className="p-3 flex items-center justify-between gap-2 text-xs">
                <div className="truncate">
                  <p className="font-semibold text-stone-800 truncate">{photo.area}</p>
                  <p className="text-[11px] text-stone-400">{formatDateBR(photo.data)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  title="Remover foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <div onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-stone-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-[#F4ECE4] text-[#8C5E45] text-xs font-bold mr-2">
                  {lightboxPhoto.etapa}
                </span>
                <span className="font-semibold text-sm text-stone-800">{lightboxPhoto.area}</span>
                <span className="text-xs text-stone-400 ml-2">({formatDateBR(lightboxPhoto.data)})</span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[75vh]">
              <img src={lightboxPhoto.url} alt={lightboxPhoto.area} className="max-h-[75vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ABA 5: ORIENTAÇÕES PRÉ E PÓS-PROCEDIMENTO (LASER E DESPIGMENTAÇÃO)
// ============================================================================
function PrePostGuidelinesTab({ client }) {
  const [selectedProtocol, setSelectedProtocol] = useState(
    client.fichaPrincipal === 'despigmentacao' && !client.possuiFichaLaser ? 'despigmentacao' : 'laser'
  );
  const [copiedType, setCopiedType] = useState(null);

  const dp = client.dadosPessoais || {};
  const firstName = (dp.nomeCompleto || 'Cliente').split(' ')[0];
  const phoneDigits = (dp.telefone || '').replace(/\D/g, '');

  const currentGuide = selectedProtocol === 'laser' ? ORIENTACOES_LASER : ORIENTACOES_DESPIGMENTACAO;
  const protocolTitle =
    selectedProtocol === 'laser' ? 'Depilação a Laser (Laser Hakon)' : 'Despigmentação (Sobrancelhas / Tatuagem)';

  const buildMessage = (type) => {
    if (type === 'pre') {
      return `Olá ${firstName}! ✨ Aqui é do *Studio Sol*. Seguem os *Cuidados Pré-Aplicação (${protocolTitle})* para a sua sessão:\n\n${currentGuide.pre
        .map((item) => `• ${item}`)
        .join('\n')}\n\nQualquer dúvida estou à disposição!`;
    }
    return `Olá ${firstName}! ✨ Aqui é do *Studio Sol*. Seguem os *Cuidados Pós-Aplicação (${protocolTitle})* obrigatórios após o procedimento de hoje:\n\n${currentGuide.pos
      .map((item) => `• ${item}`)
      .join('\n')}\n\nQualquer dúvida me avise por aqui!`;
  };

  const handleCopy = (type) => {
    navigator.clipboard.writeText(buildMessage(type));
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const openWhatsApp = (type) => {
    const text = encodeURIComponent(buildMessage(type));
    const formattedPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
    const url = phoneDigits ? `https://wa.me/${formattedPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Seletor de Protocolo */}
      <div className="bg-white rounded-2xl p-3 border border-[#E8DFD5] flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedProtocol('laser')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            selectedProtocol === 'laser'
              ? 'bg-[#8C5E45] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-stone-600 hover:bg-[#EFE8E0]'
          }`}
        >
          <Zap className="w-4 h-4" />
          Orientações Depilação a Laser (Hakon)
        </button>
        <button
          type="button"
          onClick={() => setSelectedProtocol('despigmentacao')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            selectedProtocol === 'despigmentacao'
              ? 'bg-[#8C4545] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-stone-600 hover:bg-[#EFE8E0]'
          }`}
        >
          <Eraser className="w-4 h-4" />
          Orientações Despigmentação
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cartão Pré-Aplicação */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-[#F4ECE4] text-[#8C5E45] text-xs font-bold uppercase tracking-wider">
              Antes da Sessão
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Cuidados Pré-Aplicação
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-700 bg-[#FAF8F5] p-4 rounded-2xl border border-stone-100">
              {currentGuide.pre.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#8C5E45] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openWhatsApp('pre')}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar no WhatsApp
            </button>
            <button
              type="button"
              onClick={() => handleCopy('pre')}
              className="py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
            >
              {copiedType === 'pre' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'pre' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Cartão Pós-Aplicação */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              Após a Sessão
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Cuidados Pós-Aplicação
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-700 bg-[#FAF8F5] p-4 rounded-2xl border border-stone-100">
              {currentGuide.pos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#8C5E45] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openWhatsApp('pos')}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar no WhatsApp
            </button>
            <button
              type="button"
              onClick={() => handleCopy('pos')}
              className="py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
            >
              {copiedType === 'pos' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedType === 'pos' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ÁREA PÚBLICA EXCLUSIVA DA CLIENTE (?form=laser OU ?form=despigmentacao)
// ============================================================================
function ClientPublicFormView({ formType, db, auth, appId, onRequestProfessionalLogin }) {
  const isLaser = formType === 'laser';
  const [formData, setFormData] = useState(() => createEmptyClient(formType, 'cliente'));
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleArrayItem = (section, field, item) => {
    const arr = formData[section]?.[field] || [];
    const next = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
    setFormData({
      ...formData,
      [section]: { ...formData[section], [field]: next }
    });
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.dadosPessoais.nomeCompleto.trim() || !formData.dadosPessoais.telefone.trim()) {
      setErrorMsg('Por favor, preencha seu Nome Completo e Telefone/WhatsApp.');
      return;
    }

    if (!formData.termoConsentimento.aceito || !formData.termoConsentimento.assinaturaPacienteBase64) {
      setErrorMsg('Por favor, marque o aceite do termo de responsabilidade e assine no campo indicado.');
      return;
    }

    setSubmitting(true);
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'anamneses_clientes');
      await addDoc(colRef, {
        ...formData,
        fichaPrincipal: formType,
        possuiFichaLaser: isLaser,
        possuiFichaDespig: !isLaser,
        status: 'pendente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setSubmittedSuccess(true);
    } catch (err) {
      console.error('Erro ao enviar ficha:', err);
      setErrorMsg('Ocorreu um erro ao enviar sua ficha. Por favor, avise a profissional.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="min-h-screen bg-[#F7F4F0] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8DFD5] shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Ficha Enviada com Sucesso!
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Obrigada, <strong>{formData.dadosPessoais.nomeCompleto}</strong>! Sua ficha de{' '}
            <strong>{isLaser ? 'Depilação a Laser (Hakon)' : 'Despigmentação'}</strong> já foi transferida com segurança para o <strong>Studio Sol</strong>.
          </p>
          <p className="text-xs text-stone-400">
            Você já pode fechar esta página ou devolver o tablet para a profissional.
          </p>
          <div className="pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onRequestProfessionalLogin}
              className="text-xs text-stone-400 hover:text-[#8C5E45] underline"
            >
              Acesso Restrito Profissional
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4F0] text-[#2C2523] pb-12">
      {/* Cabeçalho Limpo da Cliente */}
      <header className="bg-gradient-to-r from-[#2C2421] to-[#4A3B35] text-white py-6 px-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              {isLaser ? <Zap className="w-6 h-6 text-[#E5C1A1]" /> : <Eraser className="w-6 h-6 text-[#E5C1A1]" />}
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 rounded bg-white/15 text-[#E5C1A1] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                {isLaser ? 'Ficha de Epilação a Laser' : 'Ficha de Despigmentação'}
              </span>
              <h1 className="text-xl font-serif font-semibold">Studio Sol — Laser Hakon</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestProfessionalLogin}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 flex items-center gap-1 shrink-0"
          >
            <Lock className="w-3 h-3" />
            Profissional
          </button>
        </div>
      </header>

      <form onSubmit={handleClientSubmit} className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Dados Pessoais */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4 shadow-xs">
          <h2 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
            1. Seus Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.dadosPessoais.nomeCompleto}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, nomeCompleto: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Telefone / WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="(00) 00000-0000"
                value={formData.dadosPessoais.telefone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, telefone: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={formData.dadosPessoais.dataNascimento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, dataNascimento: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">CPF</label>
              <input
                type="text"
                value={formData.dadosPessoais.cpf}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, cpf: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">RG</label>
              <input
                type="text"
                value={formData.dadosPessoais.rg}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, rg: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Sexo</label>
              <select
                value={formData.dadosPessoais.sexo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, sexo: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              >
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">E-mail</label>
              <input
                type="email"
                value={formData.dadosPessoais.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, email: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-600 mb-1">Endereço</label>
              <input
                type="text"
                value={formData.dadosPessoais.endereco}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, endereco: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Bairro</label>
              <input
                type="text"
                value={formData.dadosPessoais.bairro}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, bairro: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Cidade/UF</label>
              <input
                type="text"
                value={formData.dadosPessoais.cidadeUf}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, cidadeUf: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Profissão</label>
              <input
                type="text"
                value={formData.dadosPessoais.profissao}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, profissao: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Como nos conheceu?</label>
              <input
                type="text"
                value={formData.dadosPessoais.comoConheceu}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dadosPessoais: { ...formData.dadosPessoais, comoConheceu: e.target.value }
                  })
                }
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
              />
            </div>
          </div>
        </div>

        {/* FLUXO EXCLUSIVO 1: DEPILAÇÃO A LASER */}
        {isLaser ? (
          <>
            <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4 shadow-xs">
              <h2 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
                2. Histórico de Depilação e Características dos Pelos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Costuma depilar a área?</label>
                  <select
                    value={formData.historicoLaser.costumaDepilar}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoLaser: { ...formData.historicoLaser, costumaDepilar: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  >
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Espessura do Pelo</label>
                  <select
                    value={formData.historicoLaser.espessuraPelo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoLaser: { ...formData.historicoLaser, espessuraPelo: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  >
                    <option value="Fino">Fino</option>
                    <option value="Médio">Médio</option>
                    <option value="Grosso">Grosso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Cor do Pelo</label>
                  <select
                    value={formData.historicoLaser.corPelo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoLaser: { ...formData.historicoLaser, corPelo: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  >
                    <option value="Loiro/Ruivo">Loiro / Ruivo</option>
                    <option value="Castanho Claro">Castanho Claro</option>
                    <option value="Castanho Escuro/Preto">Castanho Escuro / Preto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Métodos utilizados anteriormente:
                </label>
                <div className="flex flex-wrap gap-2">
                  {METODOS_DEPILACAO.map((m) => {
                    const checked = (formData.historicoLaser.metodosAnteriores || []).includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleArrayItem('historicoLaser', 'metodosAnteriores', m)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border ${
                          checked ? 'bg-[#8C5E45] text-white border-[#8C5E45]' : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Reações prévias pós-depilação:
                </label>
                <div className="flex flex-wrap gap-2">
                  {REACOES_PREVIAS.map((r) => {
                    const checked = (formData.historicoLaser.reacoesPrevias || []).includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleArrayItem('historicoLaser', 'reacoesPrevias', r)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border ${
                          checked ? 'bg-[#8C5E45] text-white border-[#8C5E45]' : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Presença de pelos encravados?</label>
                  <select
                    value={formData.historicoLaser.pelosEncravados}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoLaser: { ...formData.historicoLaser, pelosEncravados: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Qual local?</label>
                  <input
                    type="text"
                    value={formData.historicoLaser.localPelosEncravados}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoLaser: { ...formData.historicoLaser, localPelosEncravados: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Expectativa de Resultado (ex: redução gradual, foliculite, hirsutismo)
                  </label>
                  <input
                    type="text"
                    value={formData.historicoLaser.expectativaResultado}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoLaser: { ...formData.historicoLaser, expectativaResultado: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Avaliação Cutânea e Fototipo */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4 shadow-xs">
              <h2 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
                3. Avaliação Cutânea, Fototipo e Sol
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FITZPATRICK_OPTIONS.map((opt) => {
                  const selected = formData.avaliacaoCutanea.fototipoCliente === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          avaliacaoCutanea: { ...formData.avaliacaoCutanea, fototipoCliente: opt.value }
                        })
                      }
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selected
                          ? 'bg-[#8C5E45] text-white border-[#8C5E45]'
                          : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="block font-bold text-xs">{opt.label}</span>
                      <span className={`text-[11px] ${selected ? 'text-amber-100' : 'text-stone-500'}`}>{opt.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Houve exposição solar nos últimos 15 a 30 dias?
                  </label>
                  <select
                    value={formData.avaliacaoCutanea.exposicaoSolarRecente}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        avaliacaoCutanea: { ...formData.avaliacaoCutanea, exposicaoSolarRecente: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Há tatuagem ou hiperpigmentação na área ou arredores?
                  </label>
                  <select
                    value={formData.avaliacaoCutanea.tatuagemOuHiperpigmentacaoArea}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        avaliacaoCutanea: { ...formData.avaliacaoCutanea, tatuagemOuHiperpigmentacaoArea: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  >
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Histórico de Saúde Laser */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-3 shadow-xs">
              <h2 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
                4. Histórico de Saúde (Marque caso possua)
              </h2>
              <div className="space-y-2.5">
                {HEALTH_CONDITIONS_LASER.map((cond) => {
                  const checked = Boolean(formData.historicoSaudeLaser[cond.key]);
                  return (
                    <div
                      key={cond.key}
                      className={`p-3.5 rounded-2xl border ${
                        checked ? 'bg-amber-50 border-amber-300' : 'bg-[#FAF8F5] border-stone-200'
                      }`}
                    >
                      <label className="flex items-center justify-between gap-3 cursor-pointer">
                        <span className="text-xs sm:text-sm font-medium text-stone-800">{cond.label}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              historicoSaudeLaser: { ...formData.historicoSaudeLaser, [cond.key]: e.target.checked }
                            })
                          }
                          className="w-5 h-5 accent-[#8C5E45] shrink-0"
                        />
                      </label>
                      {checked && cond.hasDetail && (
                        <input
                          type="text"
                          placeholder={cond.detailPlaceholder}
                          value={formData.historicoSaudeLaser[`${cond.key}Detalhe`] || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              historicoSaudeLaser: {
                                ...formData.historicoSaudeLaser,
                                [`${cond.key}Detalhe`]: e.target.value
                              }
                            })
                          }
                          className="mt-2 w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* FLUXO EXCLUSIVO 2: DESPIGMENTAÇÃO (SOBRANCELHAS E TATUAGEM) */
          <>
            <div className="bg-white rounded-3xl p-6 border border-[#E4C7C7] space-y-4 shadow-xs">
              <h2 className="text-base font-serif font-bold text-[#8C4545] border-b border-stone-100 pb-2">
                2. Avaliação Específica do Pigmento / Tatuagem
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Tipo de Procedimento *</label>
                  <select
                    value={formData.historicoDespigmentacao.tipoProcedimentoDespig}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoDespigmentacao: {
                          ...formData.historicoDespigmentacao,
                          tipoProcedimentoDespig: e.target.value
                        }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  >
                    <option value="Remoção de Micropigmentação de Sobrancelhas">Remoção de Micropigmentação de Sobrancelhas</option>
                    <option value="Remoção de Tatuagem">Remoção de Tatuagem</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Localização exata e tamanho aproximado (cm)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sobrancelhas / Tatuagem pulso 5x3cm"
                    value={formData.historicoDespigmentacao.localizacaoTamanho}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoDespigmentacao: {
                          ...formData.historicoDespigmentacao,
                          localizacaoTamanho: e.target.value
                        }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Há quanto tempo foi feita a micropigmentação ou tatuagem?
                  </label>
                  <select
                    value={formData.historicoDespigmentacao.tempoRealizacao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoDespigmentacao: { ...formData.historicoDespigmentacao, tempoRealizacao: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  >
                    {TEMPO_PIGMENTO_OPCOES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Número de retoques / sessões já feitas no local
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2 retoques"
                    value={formData.historicoDespigmentacao.numeroRetoquesAnteriores}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoDespigmentacao: {
                          ...formData.historicoDespigmentacao,
                          numeroRetoquesAnteriores: e.target.value
                        }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Já realizou sessões anteriores de despigmentação?
                  </label>
                  <select
                    value={formData.historicoDespigmentacao.fezDespigmentacaoAnterior}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoDespigmentacao: {
                          ...formData.historicoDespigmentacao,
                          fezDespigmentacaoAnterior: e.target.value
                        }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  >
                    <option value="Não">Não</option>
                    <option value="Sim (Laser)">Sim (Laser)</option>
                    <option value="Sim (Ácido / Despigmentante Químico)">Sim (Ácido / Despigmentante Químico)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Quantas sessões e há quanto tempo?
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2 sessões há 6 meses"
                    value={formData.historicoDespigmentacao.detalheDespigmentacaoAnterior}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        historicoDespigmentacao: {
                          ...formData.historicoDespigmentacao,
                          detalheDespigmentacaoAnterior: e.target.value
                        }
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Quais cores estão presentes no pigmento / tatuagem?
                </label>
                <div className="flex flex-wrap gap-2">
                  {CORES_PIGMENTO_DESPIG.map((cor) => {
                    const checked = (formData.historicoDespigmentacao.coresPresentes || []).includes(cor);
                    return (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => toggleArrayItem('historicoDespigmentacao', 'coresPresentes', cor)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium border ${
                          checked ? 'bg-[#8C4545] text-white border-[#8C4545]' : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
                        }`}
                      >
                        {cor}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Possui cicatriz prévia, fibrose ou alteração de textura no local? Descreva:
                </label>
                <input
                  type="text"
                  value={formData.historicoDespigmentacao.observacoesCicatrizFibrose}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      historicoDespigmentacao: {
                        ...formData.historicoDespigmentacao,
                        observacoesCicatrizFibrose: e.target.value
                      }
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                />
              </div>
            </div>

            {/* Avaliação Cutânea e Sol */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4 shadow-xs">
              <h2 className="text-base font-serif font-bold text-[#8C4545] border-b border-stone-100 pb-2">
                3. Fototipo & Exposição Solar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FITZPATRICK_OPTIONS.map((opt) => {
                  const selected = formData.avaliacaoCutanea.fototipoCliente === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          avaliacaoCutanea: { ...formData.avaliacaoCutanea, fototipoCliente: opt.value }
                        })
                      }
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selected
                          ? 'bg-[#8C4545] text-white border-[#8C4545]'
                          : 'bg-[#FAF8F5] text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className="block font-bold text-xs">{opt.label}</span>
                      <span className={`text-[11px] ${selected ? 'text-rose-100' : 'text-stone-500'}`}>{opt.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Houve exposição solar ou bronzeamento recente (últimos 15 a 30 dias)?
                </label>
                <select
                  value={formData.avaliacaoCutanea.exposicaoSolarRecente}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      avaliacaoCutanea: { ...formData.avaliacaoCutanea, exposicaoSolarRecente: e.target.value }
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>
            </div>

            {/* Histórico de Saúde Despigmentação */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-3 shadow-xs">
              <h2 className="text-base font-serif font-bold text-[#8C4545] border-b border-stone-100 pb-2">
                4. Histórico de Saúde e Contraindicações (Marque caso possua)
              </h2>
              <div className="space-y-2.5">
                {HEALTH_CONDITIONS_DESPIG.map((cond) => {
                  const checked = Boolean(formData.historicoSaudeDespig[cond.key]);
                  return (
                    <div
                      key={cond.key}
                      className={`p-3.5 rounded-2xl border ${
                        checked ? 'bg-red-50 border-red-300' : 'bg-[#FAF8F5] border-stone-200'
                      }`}
                    >
                      <label className="flex items-center justify-between gap-3 cursor-pointer">
                        <span className="text-xs sm:text-sm font-medium text-stone-800">{cond.label}</span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              historicoSaudeDespig: { ...formData.historicoSaudeDespig, [cond.key]: e.target.checked }
                            })
                          }
                          className="w-5 h-5 accent-red-600 shrink-0"
                        />
                      </label>
                      {checked && cond.hasDetail && (
                        <input
                          type="text"
                          placeholder={cond.detailPlaceholder}
                          value={formData.historicoSaudeDespig[`${cond.key}Detalhe`] || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              historicoSaudeDespig: {
                                ...formData.historicoSaudeDespig,
                                [`${cond.key}Detalhe`]: e.target.value
                              }
                            })
                          }
                          className="mt-2 w-full px-3 py-2 rounded-xl border border-red-300 bg-white text-xs"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* 5. Medicamentos */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4 shadow-xs">
          <h2 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
            5. Uso de Medicamentos ou Ácidos na Pele
          </h2>
          {MEDICATIONS_LIST.map((grp) => (
            <div key={grp.group} className="space-y-2">
              <p className="text-xs font-bold text-stone-500">{grp.group}</p>
              <div className="space-y-2">
                {grp.items.map((item) => {
                  const checked = Boolean(formData.medicamentos[item.key]);
                  return (
                    <label
                      key={item.key}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer ${
                        checked ? 'bg-amber-50 border-amber-300' : 'bg-[#FAF8F5] border-stone-200'
                      }`}
                    >
                      <span className="text-xs sm:text-sm text-stone-800">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            medicamentos: { ...formData.medicamentos, [item.key]: e.target.checked }
                          })
                        }
                        className="w-5 h-5 accent-[#8C5E45] shrink-0"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Faz uso de algum outro medicamento? Qual?
            </label>
            <input
              type="text"
              value={formData.medicamentos.outrosRelatados}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medicamentos: { ...formData.medicamentos, outrosRelatados: e.target.value }
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-[#FCFBF9] text-sm"
            />
          </div>
        </div>

        {/* Termo de Consentimento Específico e Assinatura */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8DFD5] space-y-4 shadow-xs">
          <h2 className="text-base font-serif font-bold text-[#8C5E45] border-b border-stone-100 pb-2">
            Termo de Responsabilidade e Consentimento Informado — Studio Sol
          </h2>
          {isLaser ? (
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-600 leading-relaxed space-y-2">
              <p>
                Declaro para os devidos fins que todas as informações prestadas nesta ficha ao <strong>Studio Sol</strong> são expressões da verdade, assumindo total responsabilidade civil e criminal por omissões de dados de saúde ou uso de substâncias.
              </p>
              <p>
                Fui amplamente orientado(a) sobre a natureza do tratamento de <strong>epilação a laser (Laser Hakon)</strong>, aprovado para redução permanente dos pelos, possíveis efeitos transitórios (como ardor por até 24h ou alterações de pigmentação temporárias) e a necessidade estrita de cumprir os cuidados pré e pós-sessão. Autorizo também o registro fotográfico para acompanhamento clínico, preservando-se o sigilo profissional.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F9EFEF]/60 border border-[#E4C7C7] text-xs text-stone-700 leading-relaxed space-y-2">
              <p>
                Declaro serem verdadeiras todas as informações prestadas nesta ficha ao <strong>Studio Sol</strong>, assumindo total responsabilidade por omissões de dados de saúde, histórico de queloides ou uso de medicamentos.
              </p>
              <p>
                Fui amplamente orientado(a) de que o procedimento de <strong>despigmentação (sobrancelhas ou tatuagem)</strong> exige um número variável de sessões conforme a profundidade, tempo e composição química do pigmento. Estou ciente da possibilidade de <strong>escurecimento paradoxal transitório</strong> (especialmente em pigmentos que contêm dióxido de titânio ou óxido de ferro), edema local, vermelhidão e formação de crostas que <strong>não devem ser arrancadas manualmente</strong>, comprometendo-me a seguir rigorosamente todos os cuidados pós-sessão. Autorizo o registro fotográfico para acompanhamento clínico, preservando-se o sigilo profissional.
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-[#FAF6F2] border border-[#E2D2C3]">
            <input
              type="checkbox"
              required
              checked={formData.termoConsentimento.aceito}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  termoConsentimento: { ...formData.termoConsentimento, aceito: e.target.checked }
                })
              }
              className="w-5 h-5 accent-[#8C5E45] mt-0.5 shrink-0"
            />
            <span className="text-xs sm:text-sm font-semibold text-stone-800">
              Li, compreendi e concordo com os termos acima declarando serem verdadeiras minhas respostas.
            </span>
          </label>

          <SignaturePad
            value={formData.termoConsentimento.assinaturaPacienteBase64}
            onChange={(base64) =>
              setFormData({
                ...formData,
                termoConsentimento: { ...formData.termoConsentimento, assinaturaPacienteBase64: base64 }
              })
            }
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
            isLaser ? 'bg-[#8C5E45] hover:bg-[#734B36]' : 'bg-[#8C4545] hover:bg-[#723636]'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          {submitting ? 'Enviando sua ficha...' : 'Finalizar e Enviar Ficha'}
        </button>
      </form>
    </div>
  );
}
