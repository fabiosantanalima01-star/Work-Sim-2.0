/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// CBO interface as requested by parametric engine specifications
export interface CBO {
  codigo: string;
  ocupacao: string;
  // Attributes for the parametric calculation engine
  ct: number; // Carteira de Trabalho (0-1)
  ro: number; // Registro Obrigatório (0-1)
  rd: number; // Recolhimento Digital (0-1)
  ee: number; // Exame Específico (0-1)
  jf: number; // Jornada Flexível (0-1)
  si: number; // Sindicato Integrado (0-1)
  rt: number; // Risco Técnico (0-1)
  rda: number; // Recolhimento de Adicionais (0-1)
  salarioMedio: number;
}

export interface Student {
  id: string; // Ex: "01", "02"
  nomeCompleto: string;
  matricula: string; // Ex: "12345678"
  sala: string; // Ex: "1B"
  ano: number; // 2026
  cargo: string; // Ex: "Estagiário de RH"
  xp: number;
  precisao: number;
  faseAtual: number; // 0 a 7
  status: "Aguardando Ativação" | "Ativo";
  senha?: string; // Saved credentials for veterans and custom logins
  isVeterano?: boolean; // Label for testing veterans
  dispositivoVinculado?: string;
  respostasDesafios: Record<string, boolean>; // challengeId -> correct
  temposRespostas?: Record<string, number>; // challengeId -> seconds spent
  tempoAtivoSegundos?: number; // total accumulated active training seconds
  tempoAcumuladoXP?: number; // current interval accumulator towards the 10-minute border (600s)
  casosResolvidosNoCiclo?: number; // cases solved in this 10-min cycle
  focoStatus?: "Ativo" | "Fora da Tela"; // "Ativo" or "Fora da Tela" when focus was lost
  saidasTela?: number; // count of focus losses
  soundTheme?: "default" | "electronic" | "organic" | "classic" | "cyber" | "mellow"; // Notification sound theme for the professor
  mensagensChat?: { id: string; remetente: "Sistema" | "Professor" | string; texto: string; timestamp: string }[];
  pausasBanheiroUsadas?: number; // max 3
  pausaAtiva?: "banheiro" | "duvida" | null;
  pauseStartTime?: number; // timestamp when the student started their current pause
  contagemDuvidasDia?: number; // doubt history count in session
  recuperadoDeBloqueio?: boolean; // loss of all tolerance, next focus loss blocks instantly!
  streakFasesAutonomas?: number; // count of consecutive phases with >=95% accuracy & 0 doubts
  duvidaPendenteTexto?: string; // current pending doubt message
  duvidasHistorico?: { id: string; pergunta: string; resposta?: string; resolvida: boolean; xpGanhado?: number; timestamp: string; faseId?: number }[];
  timeId?: string; // ID do time de simulador ou máquina compartilhada
  timeLider?: boolean; // Se é o líder eleito do grupo
  timeViceLider?: boolean; // Se é o vice-líder eleito do grupo
  chamadaNumero?: string; // Número do aluno na lista de chamada (ex: "01")
  xpAntecedente?: number; // Pontuação antecedente/individual antes de ingressar no squad
  ultimaDataAcesso?: string; // ISO date YYYY-MM-DD
  email?: string; // Email associado para recuperação externa
  foto?: string; // Base64 picture for security badges
  contratoAssinado?: boolean; // Se o contrato de trabalho foi assinado
  autorizacaoPais?: boolean; // Se a autorização dos pais foi concedida
  tentativaFraude?: number; // Contador de tentativas de abrir devtools
  contaBloqueada?: boolean; // Se a conta foi bloqueada por fraude
  badges?: string[]; // IDs das insígnias conquistadas
  isTyping?: boolean; // Se o usuário está digitando no chat
  profIsTyping?: boolean; // Se o professor está digitando resposta para este aluno
  lastSeen?: number; // Milliseconds timestamp of last heartbeat
}

export interface Challenge {
  id: string; // Ex: "1.1", "RES-001"
  fase: number; // 0, 1, 2, 3...
  bloco?: "A" | "B" | "C" | "D" | "E";
  titulo: string;
  tipo: "Erro" | "Explicativo" | "Misto" | "Cálculo" | "Justa Causa";
  focoTecnico: string;
  tempoLimiteMinutos: number;
  xpRecompensa: number;
  
  // Scenario Data
  empregado: {
    nome: string;
    cbo: string;
    salarioBase: number;
    dataAdmissao: string;
    dataFato: string;
    jornada: string;
    feriasStatus?: string;
    mediaHorasExtras?: number;
    outrasSomas?: string;
    dependentes?: number;
    vtCustoDiario?: number;
    comissoes?: number;
    detalhesAtestado?: {
      medico: string;
      crm: string;
      emissao: string;
      cid: string;
      diasAfastados: number;
      legendaCID?: string;
    };
    certidaoObito?: {
      falecido: string;
      parentesco: string;
      dataObito: string;
      dataRegistro: string;
      cartorio: string;
      declaracaoObitoNumero: string;
    };
  };
  
  queixa: string;
  
  // Custom lab and extraordinary challenge flags
  isLaboratorio?: boolean;
  extraordinaryVariables?: {
    horasExtras50?: number;
    horasExtras100?: number;
    faltasInjustificadas?: number;
    faltasJustificadas?: number;
    atrasosHoras?: number;
    comissao?: number;
    adicionalNoturno?: number;
    insalubridade?: "minimo" | "medio" | "maximo" | "none";
    periculosidade?: boolean;
    trabalhoFeriado?: boolean;
    horasSemanais?: number;
    divisor?: number;
  };
  
  // Options or Calculation template
  gabarito: {
    tipoAcao: "Apenas Explicar" | "Descontar Falta" | "Abonar Falta" | "Aplicar Justa Causa" | "Retificar Folha" | "Aviso Prévio Indenizado";
    valoresCorretos?: {
      saldo?: number;
      aviso?: number;
      decimoTerceiro?: number;
      ferias?: number;
      multaFgts?: number;
      outroDesconto?: number;
      // New Phase 3 Operational Crisis manual holerite fields:
      salario?: number;
      mediaHe?: number;
      insalubridade?: number;
      periculosidade?: number;
      horasExtras?: number;
      adicionalNoturno?: number;
      comissoes?: number;
      dsrHe?: number;
      bruto?: number;
      inss?: number;
      irrf?: number;
      vt?: number;
      faltasDesconto?: number;
      salarioFamilia?: number;
      liquido?: number;
      baseFgts?: number;
      fgts?: number;
      justificativa: string;
    };
    artigoLegal: string;
    respostaEsperadaId: string; // For MCQ challenges
  };
  
  opcoes?: {
    id: string;
    texto: string;
  }[];
}

export interface Badge {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  desbloqueado: boolean;
}

export interface CareerPhase {
  id: number;
  cargo: string;
  moduloTecnico: string;
  focoPrincipal: string;
  totalDesafios: number;
  precisaoMinima: number;
}

export interface SquadLog {
  id: string; // Unique log ID
  machineId: string; // Ex: "PC-01"
  studentIds: string[]; // List of Student.id (max 4)
  timestamp: string; // Creation/update time
}

export interface StudentLiga {
  name: string;
  colorClass: string;
  emoji: string;
  abbr: string;
}

export const getStudentLiga = (fase: number): StudentLiga => {
  if (fase === -1) {
    return { name: "Cadete", colorClass: "text-slate-400 border-slate-500/20 bg-slate-500/10", emoji: "🔰", abbr: "🔰 CAD" };
  }
  if (fase === 0) {
    return { name: "Admissão", colorClass: "text-blue-400 border-blue-500/20 bg-blue-500/10", emoji: "💼", abbr: "💼 ADM" };
  }
  if (fase === 1) {
    return { name: "Bronze I", colorClass: "text-amber-600 border-amber-600/30 bg-amber-600/10", emoji: "🥉", abbr: "🥉 BZ1" };
  }
  if (fase === 2) {
    return { name: "Bronze II", colorClass: "text-amber-500 border-amber-500/30 bg-amber-500/10", emoji: "🥉", abbr: "🥉 BZ2" };
  }
  if (fase === 3) {
    return { name: "Prata", colorClass: "text-slate-300 border-slate-400/20 bg-slate-400/10", emoji: "🥈", abbr: "🥈 PRT" };
  }
  if (fase === 4) {
    return { name: "Ouro", colorClass: "text-yellow-400 border-yellow-500/20 bg-yellow-500/10", emoji: "🥇", abbr: "🥇 OU" };
  }
  if (fase === 5) {
    return { name: "Platina", colorClass: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10", emoji: "💎", abbr: "💎 PL" };
  }
  if (fase === 6) {
    return { name: "Esmeralda", colorClass: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10", emoji: "🟢", abbr: "🟢 ESM" };
  }
  return { name: "Diamante", colorClass: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10", emoji: "👑", abbr: "👑 DM" };
};

export interface PenaltySettings {
  focusLossLimit: number; // Max screen departures allowed (default: 7)
  focusXpPenaltyPercent: number; // XP deduction % when blocked by focus (default: 5)
  inactivityTimeoutMinutes: number; // Inactivity limit (default: 3)
  inactivityXpPenaltyPercent: number; // XP deduction % when blocked by inactivity (default: 5)
  idlenessXpPenalty: number; // XP deducted on idleness cycle (default: 30)
  focusLossEnabled: boolean; // Enable screen departure penalty checks
  inactivityPenaltyEnabled: boolean; // Enable inactivity lockout penalty checks
  idlenessPenaltyEnabled: boolean; // Enable 10-min active idleness penalty checks
}

