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
// CONFIGURAÇÃO DO FIREBASE (COLE SUAS CHAVES REAIS DO PROJETO)
// ============================================================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDj6aUJogCOjstJXEJkAOdV7TlyDHSZ-1g",
  authDomain: "studiosol-gd.firebaseapp.com",
  projectId: "studiosol-gd",
  storageBucket: "studiosol-gd.firebasestorage.app",
  messagingSenderId: "1089430874805",
  appId: "1:1089430874805:web:328c87e746a2297d952cfc",
  measurementId: "G-G5J6BF5P7T"
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

function AnamnesisFormBody({ data, setData, isClientPublicMode = false, readOnly = false }) {
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
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          <h3 className="font-semibold text-stone-800 text-base">Dados Pessoais</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-stone-600 mb-1">Nome Completo *</label>
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
            <label className="block text-xs font-semibold text-stone-600 mb-1">Telefone / WhatsApp *</label>
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
            <label className="block text-xs font-semibold text-stone-600 mb-1">Data de Nascimento</label>
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
            <label className="block text-xs font-semibold text-stone-600 mb-1">Como nos conheceu?</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Costuma fazer depilação na área?</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Presença de pelos encravados?</label>
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
            <label className="block text-xs font-semibold text-stone-600 mb-2">Métodos utilizados anteriormente:</label>
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
            <label className="block text-xs font-semibold text-stone-600 mb-2">Reações prévias pós-depilação:</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Espessura do Pelo</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Cor do Pelo</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Expectativa de Resultado</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Tipo de Procedimento</label>
              <select
                disabled={readOnly}
                value={data.despigHistory.targetType}
                onChange={(e) => updateSection('despigHistory', 'targetType', e.target.value)}
                className={inputClass}
              >
                <option value="Sobrancelhas (Micropigmentação)">Sobrancelhas (Micropigmentação)</option>
                <option value="Tatuagem Corporal">Tatuagem Corporal</option>
                <option value="Ambos (Sobrancelhas e Tatuagem)">Ambos (Sobrancelhas e Tatuagem)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Localização e Tamanho (cm)</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Tempo do Pigmento / Tatuagem</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Nº de Retoques Anteriores</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Já fez sessões de remoção antes?</label>
              <input
                type="text"
                disabled={readOnly}
                value={data.despigHistory.previousRemovalSessions}
                onChange={(e) => updateSection('despigHistory', 'previousRemovalSessions', e.target.value)}
                placeholder="Ex: Nunca / 2 sessões"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Qual técnica usou antes?</label>
              <input
                type="text"
                disabled={readOnly}
                value={data.despigHistory.previousRemovalMethod}
                onChange={(e) => updateSection('despigHistory', 'previousRemovalMethod', e.target.value)}
                placeholder="Ex: Laser Nd:YAG, Química..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-2">Cores presentes no pigmento:</label>
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Cicatriz, relevo ou fibrose no local?</label>
              <div className="flex gap-2">
                <select
                  disabled={readOnly}
                  value={data.despigHistory.hasScarOrFibrosis}
                  onChange={(e) => updateSection('despigHistory', 'hasScarOrFibrosis', e.target.value)}
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
              <label className="block text-xs font-semibold text-stone-600 mb-1">Objetivo / Expectativa</label>
              <input
                type="text"
                disabled={readOnly}
                value={data.despigHistory.expectation}
                onChange={(e) => updateSection('despigHistory', 'expectation', e.target.value)}
                placeholder="Ex: Remoção total, clareamento..."
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}

      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
            3
          </span>
          <h3 className="font-semibold text-stone-800 text-base">Avaliação Cutânea e Fototipo (Fitzpatrick)</h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2">Classificação de Fitzpatrick:</label>
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
            <label className="block text-xs font-semibold text-stone-600 mb-1">Exposição solar nos últimos 15 a 30 dias?</label>
            <select
              disabled={readOnly}
              value={data.skinEvaluation.recentSunExposure}
              onChange={(e) => updateSection('skinEvaluation', 'recentSunExposure', e.target.value)}
              className={inputClass}
            >
              <option value="Não">Não</option>
              <option value="Sim">Sim (Atenção redobrada)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Tatuagem ou hiperpigmentação na área?</label>
            <div className="flex gap-2">
              <select
                disabled={readOnly}
                value={data.skinEvaluation.hasTattooOrHyper}
                onChange={(e) => updateSection('skinEvaluation', 'hasTattooOrHyper', e.target.value)}
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

      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
            4
          </span>
          <h3 className="font-semibold text-stone-800 text-base">Histórico de Saúde e Contraindicações</h3>
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

      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
            5
          </span>
          <h3 className="font-semibold text-stone-800 text-base">Verificação de Medicamentos e Fotossensibilizantes</h3>
        </div>

        <div className="space-y-4">
          {MEDICATION_GROUPS.map((grp) => (
            <div key={grp.group} className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-900">{grp.group}</p>
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
          <label className="block text-xs font-semibold text-stone-600 mb-1">Outros medicamentos relatados:</label>
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

      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/80 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
          <span className="w-7 h-7 rounded-full bg-amber-900 text-white text-xs font-bold flex items-center justify-center">
            6
          </span>
          <h3 className="font-semibold text-stone-800 text-base">Termo de Responsabilidade e Consentimento — Studio Sol</h3>
        </div>

        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed space-y-2">
          <p>
            Declaro para os devidos fins que todas as informações prestadas nesta ficha são expressões da verdade, assumindo total responsabilidade civil e criminal por omissões.
          </p>
          {isLaser && (
            <p>
              Fui amplamente orientado(a) sobre a natureza do tratamento de <strong>epilação a laser (Laser Hakon)</strong>, possíveis efeitos transitórios e cuidados pré e pós-sessão.
            </p>
          )}
          {isDespig && (
            <p>
              Fui amplamente orientado(a) sobre o procedimento de <strong>despigmentação</strong>, incluindo possibilidade de escurecimento temporário, formação de crostas e cuidados estritos.
            </p>
          )}
          <p>
            Autorizo o registro fotográfico da região tratada para acompanhamento clínico no <strong>Studio Sol</strong>.
          </p>
        </div>

        {!isClientPublicMode && (
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={!!data.consent.a4PaperSigned}
              onChange={(e) => updateSection('consent', 'a4PaperSigned', e.target.checked)}
              className="w-4 h-4 accent-amber-900"
            />
            <span className="text-xs font-semibold text-amber-950">
              Ficha física em papel A4 já assinada pela cliente e arquivada na clínica
            </span>
          </label>
        )}

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            disabled={readOnly}
            checked={!!data.consent.accepted}
            onChange={(e) => updateSection('consent', 'accepted', e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-amber-900"
          />
          <span className="text-xs font-medium text-stone-800">
            Li, compreendi e concordo integralmente com o Termo de Responsabilidade e Consentimento Informado.
          </span>
        </label>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Cidade / UF e Data</label>
          <input
            type="text"
            disabled={readOnly}
            value={data.consent.cityDate}
            onChange={(e) => updateSection('consent', 'cityDate', e.target.value)}
            placeholder="Ex: Santos - SP, 18/11/2026"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5">Assinatura Digital da Cliente / Responsável</label>
          <SignaturePad
            readOnly={readOnly}
            value={data.consent.signatureDataUrl}
            onChange={(url) => updateSection('consent', 'signatureDataUrl', url)}
          />
        </div>
      </section>
    </div>
  );
}

function ClientPublicIntake({ formType }) {
  const [formData, setFormData] = useState(() =>
    createEmptyClient(formType === 'despigmentacao' ? 'despigmentacao' : 'laser', 'link_cliente')
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDespig = formType === 'despigmentacao';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.personal.fullName.trim() || !formData.personal.phone.trim()) {
      setErrorMsg('Por favor, preencha seu Nome Completo e Telefone/WhatsApp.');
      return;
    }

    if (!formData.consent.accepted) {
      setErrorMsg('Por favor, marque a caixa concordando com o Termo de Responsabilidade.');
      return;
    }

    setSubmitting(true);
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const clientsRef = collection(db, 'artifacts', appId, 'public', 'data', 'clients');
      await addDoc(clientsRef, {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        consent: {
          ...formData.consent,
          signedAt: new Date().toISOString()
        }
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Não foi possível enviar sua ficha agora. Verifique a conexão com a internet.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FBF8F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg border border-stone-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-800">Ficha Enviada com Sucesso!</h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Obrigada, <strong>{formData.personal.fullName}</strong>! Sua ficha foi transferida com segurança para o prontuário do <strong>Studio Sol — Laser Hakon</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F5] pb-12">
      <header className="bg-[#3B2F2F] text-white py-6 px-4 shadow-md">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span className="text-xs uppercase tracking-widest text-amber-200/90 font-semibold">
                Studio Sol • Laser Hakon
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold mt-1">
              {isDespig ? 'Ficha de Anamnese — Despigmentação' : 'Ficha de Anamnese — Depilação a Laser'}
            </h1>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <AnamnesisFormBody data={formData} setData={setFormData} isClientPublicMode={true} readOnly={false} />

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-[#3B2F2F] hover:bg-[#2A2020] text-white font-semibold text-base shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <FileCheck className="w-5 h-5 text-amber-300" />
            {submitting ? 'Enviando Ficha...' : 'Finalizar e Enviar Minha Ficha'}
          </button>
        </div>
      </form>
    </div>
  );
}

function StaffAuthScreen({ onOpenClientPreview }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (inviteCode.trim().toUpperCase() !== MASTER_INVITE_CODE) {
          throw new Error('Código Mestre da Clínica inválido.');
        }
        if (!name.trim()) {
          throw new Error('Informe o nome da profissional.');
        }
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'staff', cred.user.uid), {
          uid: cred.user.uid,
          name: name.trim(),
          email: email.trim(),
          role: 'profissional',
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado. Tente entrar na aba "Entrar no Sistema".');
      } else if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(err.message || 'Não foi possível autenticar. Verifique os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F5] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        <div className="bg-[#3B2F2F] text-white p-7 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="text-2xl font-serif font-bold">Studio Sol</h1>
          <p className="text-xs tracking-widest uppercase text-amber-200/90">
            Laser Hakon • Estética & Despigmentação
          </p>
          <p className="text-[11px] text-stone-300 pt-1">Acesso Restrito às Profissionais</p>
        </div>

        <div className="grid grid-cols-2 border-b border-stone-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-3.5 transition ${
              mode === 'login'
                ? 'text-amber-900 border-b-2 border-amber-900 bg-amber-50/40'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Entrar no Sistema
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-3.5 transition ${
              mode === 'register'
                ? 'text-amber-900 border-b-2 border-amber-900 bg-amber-50/40'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Cadastrar Profissional
          </button>
        </div>

        <form onSubmit={handleAuth} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Nome da Profissional</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Beatriz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Código Mestre da Clínica</label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Código de autorização"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm uppercase focus:outline-none focus:border-amber-800"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">E-mail Profissional</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@studiosol.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#3B2F2F] hover:bg-[#2A2020] text-white font-semibold text-sm transition flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
          >
            <Lock className="w-4 h-4 text-amber-300" />
            {loading ? 'Autenticando...' : mode === 'register' ? 'Criar Conta Profissional' : 'Acessar Prontuários'}
          </button>

          <div className="pt-3 border-t border-stone-100 text-center space-y-2">
            <p className="text-[11px] text-stone-500">Abrir ficha para cliente preencher:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenClientPreview('laser')}
                className="py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-800" /> Ficha Laser
              </button>
              <button
                type="button"
                onClick={() => onOpenClientPreview('despigmentacao')}
                className="py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 flex items-center justify-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-amber-800" /> Ficha Despig.
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClientRecordModal({ client, onClose, onSaved }) {
  const [formData, setFormData] = useState(client);
  const [activeTab, setActiveTab] = useState('ficha');
  const [isEditingFicha, setIsEditingFicha] = useState(!client.id);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    procedure: client.procedureType === 'despigmentacao' ? 'Despigmentação' : 'Laser Hakon',
    areas: [],
    mode: 'Sequencial',
    fitzpatrick: client.professionalParams?.confirmedFitzpatrick || 'III',
    frequency: '',
    fluence: '',
    passes: '',
    endpoint: 'Eritema leve / Edema perifolicular',
    professionalName: auth.currentUser?.displayName || 'Profissional Studio Sol',
    notes: ''
  });

  const [photoStage, setPhotoStage] = useState('Antes do Procedimento');
  const [photoNote, setPhotoNote] = useState('');
  const [selectedZoomPhoto, setSelectedZoomPhoto] = useState(null);
  const [waGuideType, setWaGuideType] = useState(
    client.procedureType === 'despigmentacao' ? 'despigmentacao' : 'laser'
  );

  const activeAlerts = useMemo(() => {
    const alerts = [];
    HEALTH_CONTRAINDICATIONS.forEach((c) => {
      if (formData.healthHistory?.conditions?.[c.id]) {
        alerts.push(c.label);
      }
    });
    MEDICATION_GROUPS.forEach((g) => {
      g.items.forEach((m) => {
        if (formData.medications?.checked?.[m.id]) {
          alerts.push(m.label);
        }
      });
    });
    if (formData.skinEvaluation?.recentSunExposure === 'Sim') {
      alerts.push('Exposição solar recente (15-30 dias)');
    }
    return alerts;
  }, [formData]);

  const handleSaveAll = async (updatedObj = formData) => {
    if (!updatedObj.personal?.fullName?.trim()) {
      setFeedback('Erro: O nome da cliente é obrigatório.');
      return;
    }

    setSaving(true);
    setFeedback('');
    try {
      const payload = {
        ...updatedObj,
        isNewSubmission: false,
        updatedAt: new Date().toISOString()
      };

      if (updatedObj.id) {
        const { id, ...rest } = payload;
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'clients', id), rest);
      } else {
        const docRef = await addDoc(
          collection(db, 'artifacts', appId, 'public', 'data', 'clients'),
          payload
        );
        setFormData({ ...payload, id: docRef.id });
      }

      setIsEditingFicha(false);
      setFeedback('Prontuário salvo com sucesso!');
      setTimeout(() => setFeedback(''), 3000);
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      setFeedback('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSession = async () => {
    if (newSession.areas.length === 0) {
      setFeedback('Selecione pelo menos uma área tratada nesta sessão.');
      return;
    }
    const sessionItem = {
      id: Date.now().toString(),
      number: (formData.sessions?.length || 0) + 1,
      ...newSession
    };
    const updated = {
      ...formData,
      sessions: [...(formData.sessions || []), sessionItem]
    };
    setFormData(updated);
    setNewSession((prev) => ({ ...prev, areas: [], notes: '' }));
    await handleSaveAll(updated);
  };

  const handleDeleteSession = async (sessionId) => {
    const updated = {
      ...formData,
      sessions: (formData.sessions || []).filter((s) => s.id !== sessionId)
    };
    setFormData(updated);
    await handleSaveAll(updated);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 900;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.78);

        const newPhoto = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('pt-BR'),
          stage: photoStage,
          note: photoNote,
          url: compressedBase64
        };

        const updated = {
          ...formData,
          photos: [newPhoto, ...(formData.photos || [])]
        };
        setFormData(updated);
        setPhotoNote('');
        await handleSaveAll(updated);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (photoId) => {
    const updated = {
      ...formData,
      photos: (formData.photos || []).filter((p) => p.id !== photoId)
    };
    setFormData(updated);
    await handleSaveAll(updated);
  };

  const sendWhatsAppGuide = (phase) => {
    const phoneDigits = (formData.personal.phone || '').replace(/\D/g, '');
    const guide = waGuideType === 'despigmentacao' ? PRE_POST_DESPIG : PRE_POST_LASER;
    const list = phase === 'pre' ? guide.pre : guide.post;
    const title =
      phase === 'pre'
        ? `✨ *STUDIO SOL — Orientações PRÉ-SESSÃO (${
            waGuideType === 'despigmentacao' ? 'Despigmentação' : 'Laser Hakon'
          })* ✨`
        : `✨ *STUDIO SOL — Orientações PÓS-SESSÃO (${
            waGuideType === 'despigmentacao' ? 'Despigmentação' : 'Laser Hakon'
          })* ✨`;

    const text = `${title}\n\nOlá, *${formData.personal.fullName || 'Cliente'}*! Seguem os cuidados importantes:\n\n${list
      .map((item) => `• ${item}`)
      .join('\n')}\n\nQualquer dúvida estamos à disposição! 💛`;

    const url = phoneDigits
      ? `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const updateParam = (group, field, val) => {
    setFormData((prev) => ({
      ...prev,
      professionalParams: {
        ...prev.professionalParams,
        [group]:
          typeof prev.professionalParams[group] === 'object'
            ? { ...prev.professionalParams[group], [field]: val }
            : val
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#FBF8F5] pb-16">
      <div className="bg-[#3B2F2F] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg">
                  {formData.personal.fullName || 'Novo Prontuário'}
                </h2>
                {formData.source === 'ficha_a4' && (
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-300/20 text-amber-200 font-semibold">
                    Transcrição Ficha A4
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 flex items-center gap-3">
                <span>{formData.personal.phone || 'Sem telefone'}</span>
                <span>•</span>
                <span>Fototipo: {formData.professionalParams?.confirmedFitzpatrick}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {feedback && (
              <span className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-medium">
                {feedback}
              </span>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveAll()}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Prontuário'}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto gap-1 border-t border-white/10">
          {[
            { id: 'ficha', label: 'Ficha & Anamnese', icon: FileText },
            { id: 'parametros', label: 'Parâmetros Profissional', icon: Sliders },
            { id: 'sessoes', label: `Sessões (${formData.sessions?.length || 0})`, icon: Calendar },
            { id: 'fotos', label: `Fotos (${formData.photos?.length || 0})`, icon: Camera },
            { id: 'orientacoes', label: 'Pré & Pós (WhatsApp)', icon: MessageCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition ${
                  active
                    ? 'border-amber-300 text-amber-300 bg-white/5'
                    : 'border-transparent text-stone-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {activeAlerts.length > 0 && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-1.5">
            <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" /> Alertas Clínicos & Contraindicações Assinaladas:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeAlerts.map((al, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-red-100 text-red-900 px-2.5 py-1 rounded-lg font-medium border border-red-200"
                >
                  {al}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ficha' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-stone-600">Fichas ativas:</span>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, hasLaserRecord: !p.hasLaserRecord }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    formData.hasLaserRecord || formData.procedureType === 'laser'
                      ? 'bg-amber-900 text-white border-amber-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  + Depilação a Laser Hakon
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, hasDespigRecord: !p.hasDespigRecord }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    formData.hasDespigRecord || formData.procedureType === 'despigmentacao'
                      ? 'bg-amber-900 text-white border-amber-900'
                      : 'bg-stone-50 text-stone-600 border-stone-200'
                  }`}
                >
                  + Despigmentação (Sobrancelhas/Tattoo)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingFicha(!isEditingFicha)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingFicha ? 'Bloquear Edição' : 'Editar Dados da Ficha'}
              </button>
            </div>

            <AnamnesisFormBody
              data={formData}
              setData={setFormData}
              isClientPublicMode={false}
              readOnly={!isEditingFicha}
            />
          </div>
        )}

        {activeTab === 'parametros' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-stone-800">
                Avaliação Técnica da Profissional — Studio Sol
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Fototipo Confirmado pela Profissional
                  </label>
                  <select
                    value={formData.professionalParams?.confirmedFitzpatrick || 'III'}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        professionalParams: {
                          ...p.professionalParams,
                          confirmedFitzpatrick: e.target.value
                        }
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    {FITZPATRICK_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        Fototipo {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Observações Clínicas Gerais
                  </label>
                  <input
                    type="text"
                    value={formData.professionalParams?.generalNotes || ''}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        professionalParams: {
                          ...p.professionalParams,
                          generalNotes: e.target.value
                        }
                      }))
                    }
                    placeholder="Sensibilidade, pelos resistentes..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm border-b border-stone-100 pb-2">
                  <Zap className="w-4 h-4" /> Laser Hakon — Sequencial
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Fluência (J/cm²)</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.hakonSequential?.fluence || ''}
                    onChange={(e) => updateParam('hakonSequential', 'fluence', e.target.value)}
                    placeholder="Ex: 18 J/cm²"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Frequência (Hz)</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.hakonSequential?.frequency || ''}
                    onChange={(e) => updateParam('hakonSequential', 'frequency', e.target.value)}
                    placeholder="Ex: 5 Hz"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Observação</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.hakonSequential?.notes || ''}
                    onChange={(e) => updateParam('hakonSequential', 'notes', e.target.value)}
                    placeholder="Ex: 3 passadas"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm border-b border-stone-100 pb-2">
                  <Zap className="w-4 h-4" /> Laser Hakon — Pontual
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Fluência (J/cm²)</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.hakonPunctual?.fluence || ''}
                    onChange={(e) => updateParam('hakonPunctual', 'fluence', e.target.value)}
                    placeholder="Ex: 24 J/cm²"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Frequência (Hz)</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.hakonPunctual?.frequency || ''}
                    onChange={(e) => updateParam('hakonPunctual', 'frequency', e.target.value)}
                    placeholder="Ex: 2 Hz"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Observação</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.hakonPunctual?.notes || ''}
                    onChange={(e) => updateParam('hakonPunctual', 'notes', e.target.value)}
                    placeholder="Ex: Buço"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm border-b border-stone-100 pb-2">
                  <Zap className="w-4 h-4" /> Laser Hakon — Varredura
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Fluência (J/cm²)</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.hakonSweep?.fluence || ''}
                    onChange={(e) => updateParam('hakonSweep', 'fluence', e.target.value)}
                    placeholder="Ex: 10 J/cm²"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Frequência / Energia</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.hakonSweep?.frequency || ''}
                    onChange={(e) => updateParam('hakonSweep', 'frequency', e.target.value)}
                    placeholder="Ex: 10 Hz / 12 kJ"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Observação</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.hakonSweep?.notes || ''}
                    onChange={(e) => updateParam('hakonSweep', 'notes', e.target.value)}
                    placeholder="Ex: Pernas completas"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm border-b border-stone-100 pb-2">
                <Layers className="w-4 h-4" /> Parâmetros de Despigmentação
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Comprimento de Onda</label>
                  <select
                    value={formData.professionalParams?.despigmentationParams?.wavelength || '1064nm'}
                    onChange={(e) => updateParam('despigmentationParams', 'wavelength', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    <option value="1064nm">1064nm (Escuros/Preto)</option>
                    <option value="532nm">532nm (Vermelho/Laranja)</option>
                    <option value="755nm">755nm (Verde/Azul claro)</option>
                    <option value="1064nm + 532nm">Misto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Energia (mJ)</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.despigmentationParams?.energyMj || ''}
                    onChange={(e) => updateParam('despigmentationParams', 'energyMj', e.target.value)}
                    placeholder="Ex: 350 mJ"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Frequência (Hz)</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.despigmentationParams?.frequencyHz || ''}
                    onChange={(e) => updateParam('despigmentationParams', 'frequencyHz', e.target.value)}
                    placeholder="Ex: 3 Hz"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Spot Size</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.despigmentationParams?.spotSize || ''}
                    onChange={(e) => updateParam('despigmentationParams', 'spotSize', e.target.value)}
                    placeholder="Ex: 3mm"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Reação / Frosting</label>
                  <input
                    type="text"
                    value={formData.professionalParams?.despigmentationParams?.notes || ''}
                    onChange={(e) => updateParam('despigmentationParams', 'notes', e.target.value)}
                    placeholder="Ex: Frosting leve"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessoes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-stone-800">
                Registrar Nova Sessão (#{(formData.sessions?.length || 0) + 1})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Data</label>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Procedimento</label>
                  <select
                    value={newSession.procedure}
                    onChange={(e) => setNewSession({ ...newSession, procedure: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    <option value="Laser Hakon">Laser Hakon</option>
                    <option value="Despigmentação">Despigmentação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Modo</label>
                  <select
                    value={newSession.mode}
                    onChange={(e) => setNewSession({ ...newSession, mode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    <option value="Sequencial">Sequencial</option>
                    <option value="Pontual">Pontual</option>
                    <option value="Varredura">Varredura</option>
                    <option value="1064nm Q-Switched">Despigmentação 1064nm</option>
                    <option value="532nm Q-Switched">Despigmentação 532nm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Fluência / Energia</label>
                  <input
                    type="text"
                    value={newSession.fluence}
                    onChange={(e) => setNewSession({ ...newSession, fluence: e.target.value })}
                    placeholder="Ex: 18 J/cm²"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Frequência (Hz)</label>
                  <input
                    type="text"
                    value={newSession.frequency}
                    onChange={(e) => setNewSession({ ...newSession, frequency: e.target.value })}
                    placeholder="Ex: 5 Hz"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Passadas</label>
                  <input
                    type="text"
                    value={newSession.passes}
                    onChange={(e) => setNewSession({ ...newSession, passes: e.target.value })}
                    placeholder="Ex: 3 passadas"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Endpoint Observado</label>
                  <input
                    type="text"
                    value={newSession.endpoint}
                    onChange={(e) => setNewSession({ ...newSession, endpoint: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-2">Áreas Feitas:</label>
                <div className="flex flex-wrap gap-1.5">
                  {TREATMENT_AREAS.map((area) => {
                    const selected = newSession.areas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() =>
                          setNewSession((prev) => ({
                            ...prev,
                            areas: selected
                              ? prev.areas.filter((a) => a !== area)
                              : [...prev.areas, area]
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          selected
                            ? 'bg-amber-900 text-white border-amber-900'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-2">
                <input
                  type="text"
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  placeholder="Observações..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSession}
                  className="px-5 py-2.5 rounded-xl bg-[#3B2F2F] hover:bg-[#2A2020] text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-amber-300" /> Registrar Sessão
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-stone-700">Histórico de Sessões</h4>
              {(!formData.sessions || formData.sessions.length === 0) && (
                <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-sm text-stone-500">
                  Nenhuma sessão registrada ainda.
                </div>
              )}
              {(formData.sessions || []).map((sess, idx) => (
                <div
                  key={sess.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-900 text-white text-xs font-bold">
                        {idx + 1}ª Sessão
                      </span>
                      <span className="text-xs font-semibold text-stone-800">{sess.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                        {sess.procedure} • {sess.mode}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(sess.areas || []).map((a) => (
                        <span
                          key={a}
                          className="text-[11px] bg-amber-50 text-amber-950 border border-amber-200 px-2 py-0.5 rounded-md font-medium"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-stone-600">
                      <strong>Parâmetros:</strong> {sess.fluence || '-'} | {sess.frequency || '-'} • <strong>Endpoint:</strong> {sess.endpoint}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(sess.id)}
                    className="self-end sm:self-center p-2 text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'fotos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-stone-800">Adicionar Foto Clínica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Etapa</label>
                  <select
                    value={photoStage}
                    onChange={(e) => setPhotoStage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm bg-white"
                  >
                    <option value="Antes do Procedimento">Antes do Procedimento</option>
                    <option value="Após 1ª Sessão">Após 1ª Sessão</option>
                    <option value="Após 2ª Sessão">Após 2ª Sessão</option>
                    <option value="Resultado Final / Depois">Resultado Final / Depois</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Legenda</label>
                  <input
                    type="text"
                    value={photoNote}
                    onChange={(e) => setPhotoNote(e.target.value)}
                    placeholder="Ex: Sobrancelha direita"
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm"
                  />
                </div>
                <div>
                  <label className="w-full py-2.5 px-4 rounded-xl bg-[#3B2F2F] hover:bg-[#2A2020] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition">
                    <Camera className="w-4 h-4 text-amber-300" />
                    Escolher Foto
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {(!formData.photos || formData.photos.length === 0) ? (
              <div className="bg-white p-10 rounded-2xl border border-stone-200 text-center text-sm text-stone-500">
                Nenhuma foto adicionada ainda.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.photos.map((photo) => (
                  <div key={photo.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
                    <div
                      onClick={() => setSelectedZoomPhoto(photo)}
                      className="h-56 bg-stone-100 overflow-hidden cursor-zoom-in relative group"
                    >
                      <img src={photo.url} alt={photo.stage} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    </div>
                    <div className="p-3.5 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">{photo.stage}</span>
                        <p className="text-xs text-stone-700 font-medium mt-1">{photo.note || 'Registro clínico'}</p>
                        <p className="text-[11px] text-stone-400">{photo.date}</p>
                      </div>
                      <button type="button" onClick={() => handleDeletePhoto(photo.id)} className="p-1.5 text-stone-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedZoomPhoto && (
              <div onClick={() => setSelectedZoomPhoto(null)} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="max-w-3xl w-full bg-white rounded-2xl overflow-hidden">
                  <img src={selectedZoomPhoto.url} alt={selectedZoomPhoto.stage} className="w-full max-h-[75vh] object-contain bg-black" />
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-stone-800">{selectedZoomPhoto.stage}</p>
                      <p className="text-xs text-stone-500">{selectedZoomPhoto.note} • {selectedZoomPhoto.date}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedZoomPhoto(null)} className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-semibold">
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orientacoes' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWaGuideType('laser')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    waGuideType === 'laser' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  Orientações Laser Hakon
                </button>
                <button
                  type="button"
                  onClick={() => setWaGuideType('despigmentacao')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    waGuideType === 'despigmentacao' ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  Orientações Despigmentação
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-base text-stone-800">Cuidados Pré-Aplicação</h4>
                  <ul className="space-y-2 text-xs text-stone-700 list-disc pl-4">
                    {(waGuideType === 'despigmentacao' ? PRE_POST_DESPIG.pre : PRE_POST_LASER.pre).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => sendWhatsAppGuide('pre')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar Pré-Aplicação no WhatsApp
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-base text-stone-800">Cuidados Pós-Aplicação</h4>
                  <ul className="space-y-2 text-xs text-stone-700 list-disc pl-4">
                    {(waGuideType === 'despigmentacao' ? PRE_POST_DESPIG.post : PRE_POST_LASER.post).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => sendWhatsAppGuide('post')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar Pós-Aplicação no WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [publicFormType, setPublicFormType] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('form');
    if (f === 'laser' || f === 'despigmentacao') return f;
    return null;
  });

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !currentUser.isAnonymous) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setClients([]);
      setLoadingClients(false);
      return;
    }

    setLoadingClients(true);
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'clients');
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        setClients(list);
        setLoadingClients(false);
      },
      (err) => {
        console.error('Erro ao buscar clientes:', err);
        setLoadingClients(false);
      }
    );

    return () => unsub();
  }, [user]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (c.personal?.fullName || '').toLowerCase().includes(q);
      const phoneDigits = (c.personal?.phone || '').replace(/\D/g, '');
      const queryDigits = q.replace(/\D/g, '');
      const phoneMatch =
        (c.personal?.phone || '').toLowerCase().includes(q) ||
        (queryDigits.length > 0 && phoneDigits.includes(queryDigits));

      const matchesSearch = !q || nameMatch || phoneMatch;

      if (!matchesSearch) return false;
      if (filterType === 'novas') return !!c.isNewSubmission;
      if (filterType === 'laser') return c.procedureType === 'laser' || !!c.hasLaserRecord;
      if (filterType === 'despigmentacao')
        return c.procedureType === 'despigmentacao' || !!c.hasDespigRecord;
      return true;
    });
  }, [clients, searchQuery, filterType]);

  const copyFormLink = (type) => {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const fullLink = `${baseUrl}?form=${type}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(''), 2500);
  };

  const handleDeleteClient = async (e, clientId, clientName) => {
    e.stopPropagation();
    if (!window.confirm(`Deseja realmente excluir o prontuário de ${clientName}?`)) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'clients', clientId));
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FBF8F5] flex items-center justify-center text-stone-600 text-sm">
        Carregando sistema Studio Sol...
      </div>
    );
  }

  if (publicFormType) {
    return (
      <div>
        {user && (
          <div className="bg-amber-900 text-white px-4 py-2 text-xs flex items-center justify-between">
            <span>Modo Tablet da Cliente Ativo (Acesso interno bloqueado nesta tela)</span>
            <button
              type="button"
              onClick={() => {
                window.history.replaceState({}, '', window.location.pathname);
                setPublicFormType(null);
              }}
              className="underline font-bold"
            >
              Voltar ao Painel Profissional
            </button>
          </div>
        )}
        <ClientPublicIntake formType={publicFormType} />
      </div>
    );
  }

  if (!user) {
    return <StaffAuthScreen onOpenClientPreview={(type) => setPublicFormType(type)} />;
  }

  if (selectedClient) {
    return (
      <ClientRecordModal
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onSaved={() => {}}
      />
    );
  }

  const newSubmissionsCount = clients.filter((c) => c.isNewSubmission).length;

  return (
    <div className="min-h-screen bg-[#FBF8F5] pb-12">
      <header className="bg-[#3B2F2F] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-xl leading-tight">Studio Sol — Laser Hakon</h1>
              <p className="text-xs text-amber-200/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Profissional: <strong>{user.displayName || user.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => copyFormLink('laser')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copiedLink === 'laser' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
              {copiedLink === 'laser' ? 'Link Laser Copiado!' : 'Link Ficha Laser'}
            </button>

            <button
              type="button"
              onClick={() => copyFormLink('despigmentacao')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copiedLink === 'despigmentacao' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
              {copiedLink === 'despigmentacao' ? 'Link Despig. Copiado!' : 'Link Ficha Despig.'}
            </button>

            <button
              type="button"
              onClick={() => signOut(auth)}
              className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setShowNewClientModal(true)}
            className="p-4 rounded-2xl bg-[#3B2F2F] hover:bg-[#2A2020] text-white text-left shadow-sm transition flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Cadastrar Ficha A4 / Nova Cliente</p>
              <p className="text-xs text-stone-300">Transcrever ficha de papel</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPublicFormType('laser')}
            className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-left shadow-sm transition flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-800">Abrir Ficha Laser no Tablet</p>
              <p className="text-xs text-stone-500">Para preenchimento imediato</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPublicFormType('despigmentacao')}
            className="p-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-left shadow-sm transition flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-800">Abrir Ficha Despig. no Tablet</p>
              <p className="text-xs text-stone-500">Sobrancelhas e tatuagem</p>
            </div>
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar cliente por nome, sobrenome ou celular..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-800"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'todos', label: `Todas (${clients.length})` },
              { id: 'novas', label: `Novas Fichas (${newSubmissionsCount})` },
              { id: 'laser', label: 'Laser Hakon' },
              { id: 'despigmentacao', label: 'Despigmentação' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filterType === f.id ? 'bg-amber-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loadingClients ? (
          <div className="text-center py-12 text-sm text-stone-500">Carregando prontuários...</div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-2">
            <Users className="w-9 h-9 text-stone-300 mx-auto" />
            <p className="font-semibold text-stone-700 text-sm">Nenhuma cliente encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-800/50 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-bold text-base text-stone-800 leading-snug">
                      {client.personal?.fullName || 'Sem Nome'}
                    </h3>
                    {client.isNewSubmission && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                        Nova Ficha
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-800" />
                    {client.personal?.phone || 'Telefone não informado'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(client.procedureType === 'laser' || client.hasLaserRecord) && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-200 font-medium">
                        Laser Hakon
                      </span>
                    )}
                    {(client.procedureType === 'despigmentacao' || client.hasDespigRecord) && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200 font-medium">
                        Despigmentação
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>{client.sessions?.length || 0} sessões registradas</span>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClient(e, client.id, client.personal?.fullName)}
                    className="p-1 text-stone-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-stone-800">Novo Cadastro / Transcrição A4</h3>
              <button type="button" onClick={() => setShowNewClientModal(false)} className="p-1.5 rounded-xl hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <p className="text-xs text-stone-600">Escolha o procedimento inicial para abrir o prontuário:</p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowNewClientModal(false);
                  setSelectedClient(createEmptyClient('laser', 'ficha_a4'));
                }}
                className="w-full p-4 rounded-2xl border border-stone-200 hover:border-amber-800 hover:bg-amber-50/40 text-left transition flex items-center gap-3"
              >
                <Zap className="w-5 h-5 text-amber-900 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-stone-800">Ficha 1 — Depilação a Laser (Hakon)</p>
                  <p className="text-xs text-stone-500">Com opção de marcar ficha A4 física assinada</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNewClientModal(false);
                  setSelectedClient(createEmptyClient('despigmentacao', 'ficha_a4'));
                }}
                className="w-full p-4 rounded-2xl border border-stone-200 hover:border-amber-800 hover:bg-amber-50/40 text-left transition flex items-center gap-3"
              >
                <Layers className="w-5 h-5 text-amber-900 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-stone-800">Ficha 2 — Despigmentação (Sobrancelhas/Tattoo)</p>
                  <p className="text-xs text-stone-500">Avaliação de pigmentos e cores</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
