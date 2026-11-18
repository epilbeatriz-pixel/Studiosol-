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
// CONFIGURAÇÃO DO FIREBASE
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
  procedureType,
  hasLaserRecord: procedureType === 'laser',
  hasDespigRecord: procedureType === 'despigmentacao',
  source,
  isNewSubmission: source === 'link_cliente',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  personal: {
    fullName: '',
    birthDate: '',
    age: '',
    gender: 'F',
    cpf: '',
    rg: '',
    address: '',
    neighborhood: '',
    cityState: '',
    phone: '',
    email: '',
    profession: '',
    referral: ''
  },
  hairHistory: {
    doesHairRemoval: 'Sim',
    methods: [],
    reactions: [],
    ingrownHair: 'Não',
    ingrownLocation: '',
    hairThickness: 'Médio',
    hairColor: 'Castanho Escuro/Preto',
    expectation: ''
  },
  despigHistory: {
    targetType: 'Sobrancelhas (Micropigmentação)',
    locationAndSize: '',
    pigmentAge: '',
    previousTouchUps: '0',
    previousRemovalSessions: '0',
    previousRemovalMethod: '',
    pigmentColors: [],
    hasScarOrFibrosis: 'Não',
    scarDetails: '',
    expectation: ''
  },
  skinEvaluation: {
    fitzpatrickClient: 'III',
    recentSunExposure: 'Não',
    hasTattooOrHyper: 'Não',
    tattooDetails: ''
  },
  healthHistory: {
    conditions: {},
    cirurgiaDetail: '',
    acidosDetail: ''
  },
  medications: {
    checked: {},
    otherMeds: ''
  },
  consent: {
    accepted: false,
    cityDate: '',
    signatureDataUrl: '',
    a4PaperSigned: false,
    signedAt: ''
  },
  professionalParams: {
    confirmedFitzpatrick: 'III',
    hakonSequential: {
      fluence: '',
      frequency: '',
      passes: '',
      notes: ''
    },
    hakonPunctual: {
      fluence: '',
      frequency: '',
      pulseWidth: '',
      notes: ''
    },
    hakonSweep: {
      fluence: '',
      frequency: '',
      energyKj: '',
      notes: ''
    },
    despigmentationParams: {
      wavelength: '1064nm',
      energyMj: '',
      frequencyHz: '',
      spotSize: '',
      handpiece: '',
      notes: ''
    },
    generalNotes: ''
  },
  sessions: [],
  photos: []
});

// ============================================================================
// COMPONENTE DE ASSINATURA DIGITAL NA TELA
// ============================================================================
function SignaturePad({ value, onChange, readOnly = false }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    }
  }, [value]);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDrawing = (e) => {
    if (readOnly) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#3B2F2F';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
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

  const clearCanvas = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (onChange) onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-amber-800/30 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={170}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-36 touch-none ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
        />
      </div>
      {!readOnly && (
        <div className="flex justify-between items-center text-xs text-stone-500">
          <span>Assine acima usando o dedo ou caneta touch</span>
          <button
            type="button"
            onClick={clearCanvas}
            className="text-amber-900 font-medium hover:underline flex items-center gap-1"
          >
            <Eraser className="w-3.5 h-3.5" /> Limpar assinatura
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FORMULÁRIO COMPLETO DA FICHA
// ============================================================================
function AnamnesisFormBody({
  data,
  setData,
  isClientPublicMode = false,
  readOnly = false
}) {
  const isLaser = data.procedureType === 'laser' || data.hasLaserRecord;
  const isDespig = data.procedureType === 'despigmentacao' || data.hasDespigRecord;

  const updateSection = (section, field, value) => {
    if (readOnly) return;
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleArrayItem = (section, field, item) => {
    if (readOnly) return;
    setData((prev) => {
      const current = prev[section][field] || [];
      const exists = current.includes(item);
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: exists ? current.filter((i) => i !== item) : [...current, item]
        }
      };
    });
  };

  const toggleHealthCondition = (id) => {
    if (readOnly) return;
    setData((prev) => ({
      ...prev,
      healthHistory: {
        ...prev.healthHistory,
        conditions: {
          ...prev.healthHistory.conditions,
          [id]: !prev.healthHistory.conditions[id]
        }
      }
    }));
  };

  const toggleMedication = (id) => {
    if (readOnly) return;
    setData((prev) => ({
      ...prev,
      medications: {
        ...prev.medications,
        checked: {
          ...prev.medications.checked,
          [id]: !prev.medications.checked[id]
        }
      }
    }));
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 disabled:bg-stone-100';

  return (
    <div className="space-y-6">
      {/* 1. DADOS PESSOAIS */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h3 className="font-semibold text-stone-800 text-base">Dados Pessoais</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              disabled={readOnly}
              value={data.personal.fullName}
              onChange={(e) => updateSection('personal', 'fullName', e.target.value)}
              placeholder="Nome e sobrenome da cliente"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Telefone / WhatsApp *
            </label>
            <input
              type="tel"
              required
              disabled={readOnly}
              value={data.personal.phone}
              onChange={(e) => updateSection('personal', 'phone', e.target.value)}
              placeholder="(13) 99999-9999"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              disabled={readOnly}
              value={data.personal.birthDate}
              onChange={(e) => updateSection('personal', 'birthDate', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Idade</label>
            <input
              type="text"
              disabled={readOnly}
              value={data.personal.age}
              onChange={(e) => updateSection('personal', 'age', e.target.value)}
              placeholder="Ex: 29 anos"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Sexo</label>
            <select
              disabled={readOnly}
              value={data.personal.gender}
              onChange={(e) => updateSection('personal', 'gender', e.target.value)}
              className={inputClass}
            >
              <option value="F">Feminino</option>
              <option value="M">Masculino</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">CPF</label>
            <input
              type="text"
              disabled={readOnly}
              value={data.personal.cpf}
              onChange={(e) => updateSection('personal', 'cpf', e.target.value)}
              placeholder="000.000.000-00"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">RG</label>
            <input
              type="text"
              disabled={readOnly}
              value={data.personal.rg}
              onChange={(e) => updateSection('personal', 'rg', e.target.value)}
              placeholder="00.000.000-0"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">E-mail</label>
            <input
              type="email"
              disabled={readOnly}
              value={data.personal.email}
              onChange={(e) => updateSection('personal', 'email', e.target.value)}
              placeholder="cliente@email.com"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-600 mb-1">Endereço</label>
            <input
              type="text"
              disabled={readOnly}
              value={data.personal.address}
              onChange={(e) => updateSection('personal', 'address', e.target.value)}
              placeholder="Rua, número e complemento"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Bairro</label>
            <input
              type="text"
              disabled={readOnly}
              value={data.personal.neighborhood}
              onChange={(e) => updateSection('personal', 'neighborhood', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Cidade / UF</label>
            <input
              type="text"
              disabled={readOnly}
              value={data.personal.cityState}
              onChange={(e) => updateSection('personal', 'cityState', e.target.value)}
              placeholder="Santos - SP"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Profissão</label>
            <input
              type="text"
              disabled={readOnly}
              value={data.personal.profession}
              onChange={(e) => updateSection('personal', 'profession', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Como nos conheceu?
            </label>
            <input
              type="text"
              disabled={readOnly}
              value={data.personal.referral}
              onChange={(e) => updateSection('personal', 'referral', e.target.value)}
              placeholder="Instagram, Indicação, Google..."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* 2A. HISTÓRICO ESPECÍFICO: DEPILAÇÃO A LASER HAKON */}
      {isLaser && (
        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="font-semibold text-stone-800 text-base">
                Histórico de Depilação e Características dos Pelos (Laser Hakon)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Costuma fazer depilação na área?
              </label>
              <select
                disabled={readOnly}
                value={data.hairHistory.doesHairRemoval}
                onChange={(e) => updateSection('hairHistory', 'doesHairRemoval', e.target.value)}
                className={inputClass}
              >
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Presença de pelos encravados?
              </label>
              <div className="flex gap-2">
                <select
                  disabled={readOnly}
                  value={data.hairHistory.ingrownHair}
                  onChange={(e) => updateSection('hairHistory', 'ingrownHair', e.target.value)}
                  className="w-28 px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
                <input
                  type="text"
                  disabled={readOnly || data.hairHistory.ingrownHair === 'Não'}
                  value={data.hairHistory.ingrownLocation}
                  onChange={(e) => updateSection('hairHistory', 'ingrownLocation', e.target.value)}
                  placeholder="Qual local?"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2">
              Métodos utilizados anteriormente:
            </label>
            <div className="flex flex-wrap gap-2">
              {PREVIOUS_METHODS.map((method) => {
                const active = data.hairHistory.methods?.includes(method);
                return (
                  <button
                    key={method}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleArrayItem('hairHistory', 'methods', method)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      active
                        ? 'bg-amber-900 text-white border-amber-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2">
              Reações prévias pós-depilação:
            </label>
            <div className="flex flex-wrap gap-2">
              {PREVIOUS_REACTIONS.map((reaction) => {
                const active = data.hairHistory.reactions?.includes(reaction);
                return (
                  <button
                    key={reaction}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleArrayItem('hairHistory', 'reactions', reaction)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      active
                        ? 'bg-amber-900 text-white border-amber-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {reaction}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Espessura do Pelo
              </label>
              <select
                disabled={readOnly}
                value={data.hairHistory.hairThickness}
                onChange={(e) => updateSection('hairHistory', 'hairThickness', e.target.value)}
                className={inputClass}
              >
                <option value="Fino">Fino</option>
                <option value="Médio">Médio</option>
                <option value="Grosso">Grosso</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Cor do Pelo
              </label>
              <select
                disabled={readOnly}
                value={data.hairHistory.hairColor}
                onChange={(e) => updateSection('hairHistory', 'hairColor', e.target.value)}
                className={inputClass}
              >
                <option value="Loiro/Ruivo">Loiro / Ruivo</option>
                <option value="Castanho Claro">Castanho Claro</option>
                <option value="Castanho Escuro/Preto">Castanho Escuro / Preto</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Expectativa de Resultado
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={data.hairHistory.expectation}
                onChange={(e) => updateSection('hairHistory', 'expectation', e.target.value)}
                placeholder="Ex: Redução permanente, hirsutismo..."
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}

      {/* 2B. HISTÓRICO ESPECÍFICO: DESPIGMENTAÇÃO */}
      {isDespig && (
        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="font-semibold text-stone-800 text-base">
                Avaliação de Despigmentação (Sobrancelhas e Tatuagem)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Tipo de Procedimento
              </label>
              <select
                disabled={readOnly}
                value={data.despigHistory.targetType}
                onChange={(e) => updateSection('despigHistory', 'targetType', e.target.value)}
                className={inputClass}
              >
                <option value="Sobrancelhas (Micropigmentação)">
                  Sobrancelhas (Micropigmentação)
                </option>
                <option value="Tatuagem Corporal">Tatuagem Corporal</option>
                <option value="Ambos (Sobrancelhas e Tatuagem)">
                  Ambos (Sobrancelhas e Tatuagem)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Localização e Tamanho Aproximado (cm)
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={data.despigHistory.locationAndSize}
                onChange={(e) => updateSection('despigHistory', 'locationAndSize', e.target.value)}
                placeholder="Ex: Sobrancelhas / Antebraço 8x5cm"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Tempo do Pigmento / Tatuagem
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={data.despigHistory.pigmentAge}
                onChange={(e) => updateSection('despigHistory', 'pigmentAge', e.target.value)}
                placeholder="Ex: 3 anos"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Nº de Retoques / Coberturas Anteriores
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={data.despigHistory.previousTouchUps}
                onChange={(e) => updateSection('despigHistory', 'previousTouchUps', e.target.value)}
                placeholder="Ex: 2 retoques"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Já fez sessões de remoção antes? Quantas?
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={data.despigHistory.previousRemovalSessions}
                onChange={(e) =>
                  updateSection('despigHistory', 'previousRemovalSessions', e.target.value)
                }
                placeholder="Ex: Nunca / 2 sessões"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Qual técnica usou antes (Laser/Ácido)?
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={data.despigHistory.previousRemovalMethod}
                onChange={(e) =>
                  updateSection('despigHistory', 'previousRemovalMethod', e.target.value)
                }
                placeholder="Ex: Nenhuma, Laser Nd:YAG, Química..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2">
              Cores presentes no pigmento / tatuagem:
            </label>
            <div className="flex flex-wrap gap-2">
              {PIGMENT_COLORS.map((color) => {
                const active = data.despigHistory.pigmentColors?.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    disabled={readOnly}
                    onClick={() => toggleArrayItem('despigHistory', 'pigmentColors', color)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      active
                        ? 'bg-amber-900 text-white border-amber-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Presença de cicatriz, relevo ou fibrose no local?
              </label>
              <div className="flex gap-2">
                <select
                  disabled={readOnly}
                  value={data.despigHistory.hasScarOrFibrosis}
                  onChange={(e) =>
                    updateSection('despigHistory', 'hasScarOrFibrosis', e.target.value)
                  }
                  className="w-28 px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
                <input
                  type="text"
                  disabled={readOnly || data.despigHistory.hasScarOrFibrosis === 'Não'}
                  value={data.despigHistory.scarDetails}
                  onChange={(e) => updateSection('despigHistory', 'scarDetails', e.target.value)}
                  placeholder="Descreva o aspecto"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Objetivo / Expectativa da Cliente
              </label>
              <input
                type="text"
                disabled={readOnly}
                value={data.despigHistory.expectation}
                onChange={(e) => updateSection('despigHistory', 'expectation', e.target.value)}
                placeholder="Ex: Remoção total, clareamento para nova técnica..."
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}

      {/* 3. AVALIAÇÃO CUTÂNEA E FOTOTIPO */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h3 className="font-semibold text-stone-800 text-base">
            Avaliação Cutânea e Fototipo (Fitzpatrick)
          </h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">
            Classificação de Fitzpatrick:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FITZPATRICK_OPTIONS.map((opt) => {
              const selected = data.skinEvaluation.fitzpatrickClient === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => updateSection('skinEvaluation', 'fitzpatrickClient', opt.value)}
                  className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition ${
                    selected
                      ? 'bg-amber-900 text-white border-amber-900 shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Houve exposição solar / bronzeamento nos últimos 15 a 30 dias?
            </label>
            <select
              disabled={readOnly}
              value={data.skinEvaluation.recentSunExposure}
              onChange={(e) =>
                updateSection('skinEvaluation', 'recentSunExposure', e.target.value)
              }
              className={inputClass}
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim (Atenção redobrada)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Há tatuagem, micropigmentação ou hiperpigmentação na área/arredores?
            </label>
            <div className="flex gap-2">
              <select
                disabled={readOnly}
                value={data.skinEvaluation.hasTattooOrHyper}
                onChange={(e) =>
                  updateSection('skinEvaluation', 'hasTattooOrHyper', e.target.value)
                }
                className="w-28 px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm"
              >
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
              <input
                type="text"
                disabled={readOnly || data.skinEvaluation.hasTattooOrHyper === 'Não'}
                value={data.skinEvaluation.tattooDetails}
                onChange={(e) => updateSection('skinEvaluation', 'tattooDetails', e.target.value)}
                placeholder="Onde fica?"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. HISTÓRICO DE SAÚDE E CONTRAINDICAÇÕES */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
            4
          </span>
          <h3 className="font-semibold text-stone-800 text-base">
            Histórico de Saúde e Contraindicações
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {HEALTH_CONTRAINDICATIONS.map((item) => {
            const checked = !!data.healthHistory.conditions?.[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleHealthCondition(item.id)}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-2 ${
                  checked
                    ? item.critical
                      ? 'bg-red-50 border-red-300 text-red-900'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{item.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                      checked
                        ? item.critical
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-800 text-white'
                        : 'bg-white text-stone-400 border border-stone-200'
                    }`}
                  >
                    {checked ? 'SIM' : 'NÃO'}
                  </span>
                </div>

                {checked && item.hasDetail && (
                  <input
                    type="text"
                    disabled={readOnly}
                    onClick={(e) => e.stopPropagation()}
                    value={
                      item.id === 'cirurgia'
                        ? data.healthHistory.cirurgiaDetail
                        : data.healthHistory.acidosDetail
                    }
                    onChange={(e) =>
                      updateSection(
                        'healthHistory',
                        item.id === 'cirurgia' ? 'cirurgiaDetail' : 'acidosDetail',
                        e.target.value
                      )
                    }
                    placeholder={item.detailPlaceholder}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs text-stone-800"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. MEDICAMENTOS E FOTOSSENSIBILIZANTES */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
            5
          </span>
          <h3 className="font-semibold text-stone-800 text-base">
            Verificação de Medicamentos e Fotossensibilizantes
          </h3>
        </div>

        <div className="space-y-4">
          {MEDICATION_GROUPS.map((grp) => (
            <div key={grp.group} className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {grp.group}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {grp.items.map((med) => {
                  const checked = !!data.medications.checked?.[med.id];
                  return (
                    <div
                      key={med.id}
                      onClick={() => toggleMedication(med.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                        checked
                          ? med.critical
                            ? 'bg-red-50 border-red-300 text-red-900'
                            : 'bg-amber-50 border-amber-300 text-amber-950'
                          : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-xs font-medium">{med.label}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                          checked
                            ? med.critical
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-800 text-white'
                            : 'bg-white text-stone-400 border border-stone-200'
                        }`}
                      >
                        {checked ? 'EM USO' : 'NÃO'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            Outros medicamentos relatados pela cliente:
          </label>
          <input
            type="text"
            disabled={readOnly}
            value={data.medications.otherMeds}
            onChange={(e) => updateSection('medications', 'otherMeds', e.target.value)}
            placeholder="Descreva outros medicamentos ou suplementos..."
            className={inputClass}
          />
        </div>
      </section>

      {/* 6. TERMO DE RESPONSABILIDADE E ASSINATURA */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items
