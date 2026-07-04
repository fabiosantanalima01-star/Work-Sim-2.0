/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CBO, CareerPhase, Challenge, Badge, Student } from "./types";

// Authentic subset of CBOs (Brazilian Classification of Occupations) configured for parametric computations
export const CBOS_DATA: CBO[] = [
  { codigo: "4110-05", ocupacao: "Auxiliar de Escritório", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 1950.00 },
  { codigo: "4141-05", ocupacao: "Almoxarife", ct: 1, ro: 1, rd: 1, ee: 0, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 2117.91 },
  { codigo: "5151-05", ocupacao: "Agente Comunitário de Saúde", ct: 1, ro: 1, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 2800.00 },
  { codigo: "7156-10", ocupacao: "Eletricista de Alta Tensão", ct: 1, ro: 1, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 5500.00 },
  { codigo: "5211-10", ocupacao: "Consultor de Vendas", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 1, salarioMedio: 1897.37 },
  { codigo: "3514-05", ocupacao: "Técnico de Segurança do Trabalho", ct: 1, ro: 1, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 3200.00 },
  { codigo: "1421-05", ocupacao: "Gerente de Recursos Humanos", ct: 1, ro: 1, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 8500.00 },
  { codigo: "2124-05", ocupacao: "Analista de Desenvolvimento de Sistemas", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 6800.00 },
  { codigo: "7825-10", ocupacao: "Motorista de Caminhão", ct: 1, ro: 1, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 2750.00 },
  { codigo: "5143-20", ocupacao: "Auxiliar de Limpeza", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 0, rda: 1, salarioMedio: 1580.00 },
  { codigo: "4110-10", ocupacao: "Assistente Administrativo", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 2300.00 },
  { codigo: "3222-05", ocupacao: "Técnico de Enfermagem", ct: 1, ro: 1, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 3325.00 },
  { codigo: "2521-05", ocupacao: "Administrador de Empresas", ct: 1, ro: 1, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 4500.00 },
  { codigo: "5211-15", ocupacao: "Promotor de Vendas", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 1, salarioMedio: 1720.00 },
  { codigo: "4211-25", ocupacao: "Operador de Caixa", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 0, rda: 1, salarioMedio: 1690.00 },
  { codigo: "4121-10", ocupacao: "Digitador", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 1820.00 },
  { codigo: "3171-10", ocupacao: "Desenvolvedor Full-Stack Jr", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 4100.00 },
  { codigo: "5173-30", ocupacao: "Vigilante Patrimonial", ct: 1, ro: 1, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 2200.00 },
  { codigo: "4131-10", ocupacao: "Auxiliar de Faturamento", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 0, rda: 0, salarioMedio: 2050.00 },
  { codigo: "4110-30", ocupacao: "Auxiliar de Departamento Pessoal", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 2100.00 },
  { codigo: "2235-05", ocupacao: "Enfermeiro Geral", ct: 1, ro: 1, rd: 1, ee: 1, jf: 1, si: 1, rt: 1, rda: 1, salarioMedio: 4750.00 },
  { codigo: "4141-10", ocupacao: "Expedidor", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 0, rda: 0, salarioMedio: 1980.00 },
  { codigo: "5132-05", ocupacao: "Cozinheiro Geral", ct: 1, ro: 0, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 1850.00 },
  { codigo: "5142-05", ocupacao: "Coletor de Lixo", ct: 1, ro: 0, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 1780.00 },
  { codigo: "7152-10", ocupacao: "Pedreiro", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 2310.00 },
  { codigo: "7212-15", ocupacao: "Torneiro Mecânico", ct: 1, ro: 1, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 2980.00 },
  { codigo: "3132-15", ocupacao: "Técnico em Eletrônica", ct: 1, ro: 1, rd: 1, ee: 1, jf: 1, si: 1, rt: 1, rda: 1, salarioMedio: 3500.00 },
  { codigo: "4110-35", ocupacao: "Recepcionista", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 0, rda: 0, salarioMedio: 1650.00 },
  { codigo: "7241-10", ocupacao: "Instalador Hidráulico", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 2150.00 },
  { codigo: "3111-05", ocupacao: "Técnico Químico", ct: 1, ro: 1, rd: 1, ee: 1, jf: 1, si: 1, rt: 1, rda: 1, salarioMedio: 3880.00 },
  { codigo: "7223-15", ocupacao: "Serralheiro", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 2080.00 },
  { codigo: "5135-05", ocupacao: "Garçom", ct: 1, ro: 0, rd: 1, ee: 1, jf: 0, si: 1, rt: 0, rda: 1, salarioMedio: 1620.00 },
  { codigo: "1421-15", ocupacao: "Gerente de Logística", ct: 1, ro: 1, rd: 1, ee: 0, jf: 1, si: 1, rt: 1, rda: 0, salarioMedio: 7420.00 },
  { codigo: "4110-40", ocupacao: "Telefonista", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 0, rda: 0, salarioMedio: 1590.00 },
  { codigo: "3513-05", ocupacao: "Técnico de Administração", ct: 1, ro: 1, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 2850.00 },
  { codigo: "5161-05", ocupacao: "Cabeleireiro", ct: 0, ro: 0, rd: 1, ee: 0, jf: 1, si: 0, rt: 0, rda: 0, salarioMedio: 2200.00 },
  { codigo: "2612-05", ocupacao: "Bibliotecário", ct: 1, ro: 1, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 3120.00 },
  { codigo: "3185-10", ocupacao: "Desenhista Projetista", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 3400.00 },
  { codigo: "5141-10", ocupacao: "Manobrista", ct: 1, ro: 1, rd: 1, ee: 0, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 1750.00 },
  { codigo: "7632-15", ocupacao: "Costureiro de Roupas", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 1640.00 },
  { codigo: "4110-45", ocupacao: "Arquivista de Escritório", ct: 1, ro: 0, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 1710.00 },
  { codigo: "5163-40", ocupacao: "Lavandeiro", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 1620.00 },
  { codigo: "3241-15", ocupacao: "Técnico em Radiologia", ct: 1, ro: 1, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 3100.00 },
  { codigo: "2312-05", ocupacao: "Professor de Educação Infantil", ct: 1, ro: 1, rd: 1, ee: 1, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 3600.00 },
  { codigo: "4151-05", ocupacao: "Auxiliar de Triagem de Encomendas", ct: 1, ro: 0, rd: 1, ee: 0, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 1670.00 },
  { codigo: "5133-15", ocupacao: "Churrasqueiro", ct: 1, ro: 0, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 1, salarioMedio: 1920.00 },
  { codigo: "1421-20", ocupacao: "Supervisor de Folha de Pagamento", ct: 1, ro: 1, rd: 1, ee: 0, jf: 1, si: 1, rt: 0, rda: 0, salarioMedio: 5100.00 },
  { codigo: "2251-25", ocupacao: "Clínico Geral (Médico)", ct: 1, ro: 1, rd: 1, ee: 1, jf: 1, si: 1, rt: 1, rda: 0, salarioMedio: 12500.00 },
  { codigo: "5134-35", ocupacao: "Barman", ct: 1, ro: 0, rd: 1, ee: 1, jf: 0, si: 1, rt: 0, rda: 1, salarioMedio: 1810.00 },
  { codigo: "7212-20", ocupacao: "Fresador", ct: 1, ro: 1, rd: 1, ee: 1, jf: 0, si: 1, rt: 1, rda: 0, salarioMedio: 2880.00 }
];

// Configuration of the career track stages
export const CAREER_PHASES: CareerPhase[] = [
  { id: -1, cargo: "Simulado de Revisão", moduloTecnico: "Revisão Geral", focoPrincipal: "Preparação intensiva para a prova final", totalDesafios: 55, precisaoMinima: 0 },
  { id: 0, cargo: "Pré-Cadastro", moduloTecnico: "Admissão (ADM)", focoPrincipal: "Vínculo, FGTS e Noções de Direito", totalDesafios: 21, precisaoMinima: 100 },
  { id: 1, cargo: "Estagiário de RH (Primeiranista)", moduloTecnico: "Triagem e Conformidade", focoPrincipal: "Triagem, documentos básicos e regras de contratação", totalDesafios: 26, precisaoMinima: 85 },
  { id: 2, cargo: "Estagiário de RH (Segundoanista)", moduloTecnico: "FGTS & Rescisões (FGTS/RES)", focoPrincipal: "Contas vinculadas, carimbos de saque e verbas rescisórias (TRCT)", totalDesafios: 13, precisaoMinima: 90 },
  { id: 3, cargo: "Assistente de DP", moduloTecnico: "Conformidade CLT", focoPrincipal: "Análise de cartão de ponto, atestados e interjornada", totalDesafios: 8, precisaoMinima: 90 },
  { id: 4, cargo: "Analista de RH Pl.", moduloTecnico: "Contratos Especiais (CES)", focoPrincipal: "Contratos intermitentes, estágio e terceirização", totalDesafios: 3, precisaoMinima: 90 },
  { id: 5, cargo: "Coordenador de RH", moduloTecnico: "Rescisões Contratuais (RES)", focoPrincipal: "Fase unificada com a Fase 2 para maior compatibilidade operacional", totalDesafios: 0, precisaoMinima: 95 },
  { id: 6, cargo: "Gerente de RH", moduloTecnico: "Pareceres e Compliance (PAR)", focoPrincipal: "Reenquadramento de CBOs, desvio de função", totalDesafios: 0, precisaoMinima: 95 },
  { id: 7, cargo: "Diretor de RH", moduloTecnico: "Estratégia e Realocamento (EST)", focoPrincipal: "Diagnóstico organizacional e realocamento", totalDesafios: 0, precisaoMinima: 95 }
];

// Seed Data for All Game Challenges
export const CHALLENGES_DATA: Challenge[] = [
  // --- FASE -1: REVISÃO PRÉ-PROVA (55 Challenges) ---
  {
    id: "-1.1",
    fase: -1,
    titulo: "Questão 1: Elementos do Vínculo",
    tipo: "Misto",
    focoTecnico: "Artigo 3º da CLT",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: {
      nome: "Simulado",
      cbo: "N/A",
      salarioBase: 0,
      dataAdmissao: "01/01/2026",
      dataFato: "01/01/2026",
      jornada: "N/A"
    },
    queixa: "Para que se configure uma relação de emprego, segundo o art. 3º da CLT, é necessário, cumulativamente:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 3º da CLT",
      respostaEsperadaId: "b",
      valoresCorretos: {
        justificativa: "O Art. 3º da CLT define empregado como toda pessoa física que prestar serviços de natureza não eventual a empregador, sob a dependência deste e mediante salário. Requisitos: Pessoalidade, não eventualidade (habitualidade), onerosidade, subordinação e ser pessoa física."
      }
    },
    opcoes: [
      { id: "a", texto: "a) Subordinação, eventualidade, onerosidade e pessoa jurídica." },
      { id: "b", texto: "b) Pessoalidade, subordinação, onerosidade, não eventualidade e pessoa física." },
      { id: "c", texto: "c) Pessoalidade, autonomia, gratuidade e habitualidade." },
      { id: "d", texto: "d) Subordinação, eventualidade, pessoa física e salário fixo." }
    ]
  },
  {
    id: "-1.2",
    fase: -1,
    titulo: "Questão 2: Divisor de Jornada",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: {
      nome: "Simulado",
      cbo: "N/A",
      salarioBase: 0,
      dataAdmissao: "01/01/2026",
      dataFato: "01/01/2026",
      jornada: "44h/semana"
    },
    queixa: "O divisor padrão para cálculo da hora normal de um empregado com jornada de 44 horas semanais é:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 da CLT",
      respostaEsperadaId: "c",
      valoresCorretos: {
        justificativa: "Para uma jornada de 44 horas semanais, multiplica-se por 5 semanas mensais (em média, considerando o repouso), resultando no divisor 220. (44 / 6 dias úteis * 30 dias = 220)."
      }
    },
    opcoes: [
      { id: "a", texto: "a) 200" },
      { id: "b", texto: "b) 180" },
      { id: "c", texto: "c) 220" },
      { id: "d", texto: "d) 240" }
    ]
  },
  {
    id: "-1.3",
    fase: -1,
    titulo: "Questão 3: Adicional de Periculosidade",
    tipo: "Misto",
    focoTecnico: "Adicionais Salariais",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: {
      nome: "Simulado",
      cbo: "N/A",
      salarioBase: 0,
      dataAdmissao: "01/01/2026",
      dataFato: "01/01/2026",
      jornada: "N/A"
    },
    queixa: "O adicional de periculosidade é devido ao empregado que trabalha em condições de risco e corresponde a:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 193, §1º da CLT",
      respostaEsperadaId: "b",
      valoresCorretos: {
        justificativa: "O adicional de periculosidade é de 30% sobre o salário-base do empregado, sem os acréscimos resultantes de gratificações, prêmios ou participações nos lucros da empresa."
      }
    },
    opcoes: [
      { id: "a", texto: "a) 20% sobre o salário mínimo." },
      { id: "b", texto: "b) 30% sobre o salário-base." },
      { id: "c", texto: "c) 40% sobre a hora normal." },
      { id: "d", texto: "d) 50% sobre o salário contratual." }
    ]
  },
  {
    id: "-1.4",
    fase: -1,
    titulo: "Questão 4: Falta Injustificada e DSR",
    tipo: "Misto",
    focoTecnico: "Faltas e DSR",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: {
      nome: "Simulado",
      cbo: "N/A",
      salarioBase: 0,
      dataAdmissao: "01/01/2026",
      dataFato: "01/01/2026",
      jornada: "N/A"
    },
    queixa: "Sobre a falta injustificada, assinale a opção correta:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 6º da Lei 605/49",
      respostaEsperadaId: "b",
      valoresCorretos: {
        justificativa: "O empregado que falta injustificadamente perde a remuneração do dia da falta e também o direito ao Descanso Semanal Remunerado (DSR) daquela semana."
      }
    },
    opcoes: [
      { id: "a", texto: "a) O empregado perde apenas o salário do dia da falta, mas mantém o DSR." },
      { id: "b", texto: "b) O empregado perde o salário do dia da falta e também o DSR da semana correspondente." },
      { id: "c", texto: "c) O empregador não pode descontar o DSR, apenas a falta." },
      { id: "d", texto: "d) A falta injustificada gera apenas advertência, sem desconto salarial." }
    ]
  },
  {
    id: "-1.5",
    fase: -1,
    titulo: "Questão 5: Prazo do 13º Salário",
    tipo: "Misto",
    focoTecnico: "13º Salário",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O prazo para pagamento da 1ª parcela do 13º salário é:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Lei 4.090/62",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A primeira parcela do 13º salário deve ser paga entre 1º de fevereiro e 30 de novembro de cada ano." }
    },
    opcoes: [
      { id: "a", texto: "a) Até 20 de dezembro." },
      { id: "b", texto: "b) Até 30 de novembro." },
      { id: "c", texto: "c) Até 15 de dezembro." },
      { id: "d", texto: "d) Até 10 de dezembro." }
    ]
  },
  {
    id: "-1.6",
    fase: -1,
    titulo: "Questão 6: FGTS Aprendiz",
    tipo: "Misto",
    focoTecnico: "FGTS",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A alíquota do FGTS para o empregado comum é de 8%, enquanto para o jovem aprendiz é de:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 428, §5º CLT",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "Para os contratos de aprendizagem, a alíquota do FGTS é reduzida para 2%." }
    },
    opcoes: [
      { id: "a", texto: "a) 2%" },
      { id: "b", texto: "b) 5%" },
      { id: "c", texto: "c) 8% (mesma alíquota)" },
      { id: "d", texto: "d) 10%" }
    ]
  },
  {
    id: "-1.7",
    fase: -1,
    titulo: "Questão 7: Adicional Noturno Urbano",
    tipo: "Misto",
    focoTecnico: "Adicional Noturno",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O adicional noturno urbano tem percentual mínimo de 20% e incide sobre o trabalho prestado entre:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 73 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "Considera-se noturno, para o trabalhador urbano, o trabalho executado entre as 22 horas de um dia e as 5 horas do dia seguinte." }
    },
    opcoes: [
      { id: "a", texto: "a) 21h e 6h." },
      { id: "b", texto: "b) 22h e 5h." },
      { id: "c", texto: "c) 23h e 4h." },
      { id: "d", texto: "d) 20h e 6h." }
    ]
  },
  {
    id: "-1.8",
    fase: -1,
    titulo: "Questão 8: Teto INSS 2024",
    tipo: "Misto",
    focoTecnico: "Encargos Sociais",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Na tabela do INSS 2024, o teto do salário de contribuição é:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Portaria Interministerial MPS/MF nº 2/2024",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "O teto máximo de contribuição para o INSS em 2024 é de R$ 7.786,02." }
    },
    opcoes: [
      { id: "a", texto: "a) R$ 7.786,02" },
      { id: "b", texto: "b) R$ 8.157,41" },
      { id: "c", texto: "c) R$ 4.664,68" },
      { id: "d", texto: "d) R$ 7.507,49" }
    ]
  },
  {
    id: "-1.9",
    fase: -1,
    titulo: "Questão 9: Base de Cálculo do IRRF",
    tipo: "Misto",
    focoTecnico: "IRRF",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A base de cálculo do IRRF (Imposto de Renda Retido na Fonte) é:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Legislação IRPF",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "A base de cálculo do IRRF é obtida subtraindo do salário bruto o valor do INSS e a dedução por dependentes (além de outras deduções legais como pensão alimentícia)." }
    },
    opcoes: [
      { id: "a", texto: "a) Salário bruto menos INSS e menos dedução por dependente." },
      { id: "b", texto: "b) Salário bruto menos vale transporte." },
      { id: "c", texto: "c) Salário bruto menos FGTS." },
      { id: "d", texto: "d) Salário bruto menos adiantamento salarial." }
    ]
  },
  {
    id: "-1.10",
    fase: -1,
    titulo: "Questão 10: Justa Causa e Verbas",
    tipo: "Misto",
    focoTecnico: "Rescisão Contratual",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Sobre a dispensa por justa causa, é correto afirmar que o empregado:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "Na justa causa, o empregado perde o direito ao aviso prévio, ao saque do FGTS e à multa de 40%, recebendo apenas saldo de salário e férias vencidas (se houver)." }
    },
    opcoes: [
      { id: "a", texto: "a) Recebe aviso prévio, saca o FGTS e tem direito à multa de 40%." },
      { id: "b", texto: "b) Perde o aviso prévio, não saca o FGTS e não recebe a multa de 40%." },
      { id: "c", texto: "c) Recebe todas as verbas rescisórias normalmente." },
      { id: "d", texto: "d) Perde apenas o 13º proporcional." }
    ]
  },
  {
    id: "-1.11",
    fase: -1,
    titulo: "Questão 11: Lei do Estágio",
    tipo: "Misto",
    focoTecnico: "Estágio",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O estágio, nos termos da Lei 11.788/2008:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 3º Lei 11.788/2008",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "O estágio não cria vínculo empregatício de qualquer natureza, desde que observados os requisitos legais de acompanhamento, termo de compromisso e seguro." }
    },
    opcoes: [
      { id: "a", texto: "a) Gera vínculo empregatício desde que seja remunerado." },
      { id: "b", texto: "b) Não gera vínculo empregatício, desde que cumpridos os requisitos legais." },
      { id: "c", texto: "c) Gera vínculo empregatício sempre, independentemente das condições." },
      { id: "d", texto: "d) É vedado para estudantes do ensino médio." }
    ]
  },
  {
    id: "-1.12",
    fase: -1,
    titulo: "Questão 12: Estagiário e 13º Salário",
    tipo: "Misto",
    focoTecnico: "Estágio",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O estagiário tem direito ao 13º salário?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Lei 11.788/2008",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "O estagiário não possui os mesmos direitos de um empregado CLT, como o 13º salário, pois não há vínculo empregatício. Ele tem direito apenas ao recesso remunerado." }
    },
    opcoes: [
      { id: "a", texto: "a) Sim, integralmente." },
      { id: "b", texto: "b) Sim, proporcional." },
      { id: "c", texto: "c) Não, pois não é empregado." },
      { id: "d", texto: "d) Sim, mas apenas se receber bolsa-auxílio." }
    ]
  },
  {
    id: "-1.13",
    fase: -1,
    titulo: "Questão 13: Desconto do Vale-Transporte",
    tipo: "Misto",
    focoTecnico: "Benefícios",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O desconto máximo do vale-transporte sobre o salário-base do empregado é de:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 2º Lei 7.418/85",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "O empregador pode descontar até 6% do salário-base do empregado como participação no custo do vale-transporte." }
    },
    opcoes: [
      { id: "a", texto: "a) 5%" },
      { id: "b", texto: "b) 6%" },
      { id: "c", texto: "c) 8%" },
      { id: "d", texto: "d) 10%" }
    ]
  },
  {
    id: "-1.14",
    fase: -1,
    titulo: "Questão 14: Importância da CBO",
    tipo: "Misto",
    focoTecnico: "CBO",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A CBO (Classificação Brasileira de Ocupações) é importante para o RH porque, entre outras funções:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "MTE / CBO",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "A CBO é essencial para o enquadramento correto do cargo, definição do piso salarial da categoria (se houver) e para evitar alegações de desvio ou acúmulo de função." }
    },
    opcoes: [
      { id: "a", texto: "a) Define o valor do salário mínimo nacional." },
      { id: "b", texto: "b) Determina a alíquota do INSS a ser aplicada." },
      { id: "c", texto: "c) Ajuda a definir piso salarial da categoria e evita desvio de função." },
      { id: "d", texto: "d) Estabelece o prazo para pagamento do 13º salário." }
    ]
  },
  {
    id: "-1.15",
    fase: -1,
    titulo: "Questão 15: Requisitos Justa Causa",
    tipo: "Misto",
    focoTecnico: "Rescisão Contratual",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "São requisitos para a aplicação da justa causa, EXCETO:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Doutrina e Jurisprudência",
      respostaEsperadaId: "d",
      valoresCorretos: { justificativa: "A prescrição bienal é o prazo que o empregado tem para entrar com uma ação na justiça após o fim do contrato, não um requisito para aplicar a justa causa." }
    },
    opcoes: [
      { id: "a", texto: "a) Imediaticidade (punição logo após o fato)." },
      { id: "b", texto: "b) Proporcionalidade (falta grave o suficiente)." },
      { id: "c", texto: "c) Tipicidade (conduta prevista no art. 482 da CLT)." },
      { id: "d", texto: "d) Prescrição bienal (esperar 2 anos para aplicar)." }
    ]
  },
  {
    id: "-1.16",
    fase: -1,
    titulo: "Questão 16: Férias em Dobro",
    tipo: "Misto",
    focoTecnico: "Férias",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Se o empregador não conceder as férias dentro do período concessivo (12 meses após o aquisitivo), a consequência é:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 137 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "O empregador que não conceder férias no período legal deverá pagar o valor correspondente em dobro ao empregado." }
    },
    opcoes: [
      { id: "a", texto: "a) O empregado perde o direito às férias." },
      { id: "b", texto: "b) As férias devem ser pagas em dobro." },
      { id: "c", texto: "c) O empregado recebe apenas o salário, sem o 1/3." },
      { id: "d", texto: "d) As férias são convertidas em abono pecuniário automático." }
    ]
  },
  {
    id: "-1.17",
    fase: -1,
    titulo: "Questão 17: Cálculo do INSS",
    tipo: "Misto",
    focoTecnico: "Encargos Sociais",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "No cálculo progressivo do INSS, a alíquota é aplicada:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Lei 8.212/91",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "O cálculo do INSS é progressivo, ou seja, aplica-se a alíquota correspondente a cada faixa salarial, somando os resultados." }
    },
    opcoes: [
      { id: "a", texto: "a) Sobre o salário total de uma única vez." },
      { id: "b", texto: "b) Apenas sobre o valor que excede o teto." },
      { id: "c", texto: "c) Faixa por faixa, somando-se os valores de cada faixa." },
      { id: "d", texto: "d) Sempre sobre o salário mínimo." }
    ]
  },
  {
    id: "-1.18",
    fase: -1,
    titulo: "Questão 18: FGTS e Justa Causa",
    tipo: "Misto",
    focoTecnico: "Rescisão Contratual",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Em relação ao FGTS na dispensa por justa causa, o empregado:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 18 Lei 8.036/90",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "Na justa causa, o empregado perde o direito de sacar o saldo da conta vinculada e não recebe a multa compensatória de 40%." }
    },
    opcoes: [
      { id: "a", texto: "a) Pode sacar o saldo integral e recebe multa de 40%." },
      { id: "b", texto: "b) Pode sacar o saldo, mas não recebe multa de 40%." },
      { id: "c", texto: "c) Não pode sacar o saldo e não recebe multa de 40%." },
      { id: "d", texto: "d) Recebe apenas a multa de 40%, mas não pode sacar." }
    ]
  },
  {
    id: "-1.19",
    fase: -1,
    titulo: "Questão 19: Jornada de Estagiário",
    tipo: "Misto",
    focoTecnico: "Estágio",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A jornada máxima diária permitida para um estagiário de nível superior é de:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 10 Lei 11.788/2008",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A jornada de atividade em estágio será definida de comum acordo e não poderá ultrapassar 6 horas diárias e 30 horas semanais." }
    },
    opcoes: [
      { id: "a", texto: "a) 4 horas." },
      { id: "b", texto: "b) 6 horas." },
      { id: "c", texto: "c) 8 horas." },
      { id: "d", texto: "d) 10 horas." }
    ]
  },
  {
    id: "-1.20",
    fase: -1,
    titulo: "Questão 20: Hora Noturna Reduzida",
    tipo: "Misto",
    focoTecnico: "Adicional Noturno",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A hora noturna urbana, para fins de cálculo do adicional, tem duração reduzida de:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 73, §1º CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A hora do trabalho noturno será computada como de 52 minutos e 30 segundos, o que chamamos de 'hora ficta'." }
    },
    opcoes: [
      { id: "a", texto: "a) 60 minutos." },
      { id: "b", texto: "b) 52 minutos e 30 segundos." },
      { id: "c", texto: "c) 50 minutos." },
      { id: "d", texto: "d) 45 minutos." }
    ]
  },
  {
    id: "-1.21",
    fase: -1,
    titulo: "Questão 21: Duração Hora Noturna",
    tipo: "Misto",
    focoTecnico: "Adicional Noturno",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A Consolidação das Leis do Trabalho (CLT) estabelece que, para efeito de cálculo da remuneração, a hora noturna do trabalhador urbano tem duração de:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 73, §1º CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A lei estabelece que a hora noturna é computada como 52 minutos e 30 segundos." }
    },
    opcoes: [
      { id: "a", texto: "a) 60 minutos." },
      { id: "b", texto: "b) 52 minutos e 30 segundos." },
      { id: "c", texto: "c) 55 minutos." },
      { id: "d", texto: "d) 50 minutos." }
    ]
  },
  {
    id: "-1.22",
    fase: -1,
    titulo: "Questão 22: Benefício da Hora Ficta",
    tipo: "Misto",
    focoTecnico: "Adicional Noturno",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A 'hora ficta' ou 'hora noturna reduzida', prevista no art. 73, §1º da CLT, é um benefício ao trabalhador porque:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 73, §1º CLT",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "Como a hora é menor (52.5 min), o trabalhador recebe 1 hora integral por um período menor trabalhado, o que eleva sua remuneração horária efetiva." }
    },
    opcoes: [
      { id: "a", texto: "a) A cada 52 minutos e 30 segundos trabalhados, ele recebe como se tivesse trabalhado 1 hora, aumentando a remuneração total." },
      { id: "b", texto: "b) Permite que ele trabalhe menos horas por dia, mantendo o salário integral." },
      { id: "c", texto: "c) Garante um adicional de 50% sobre o valor da hora noturna." },
      { id: "d", texto: "d) Reduz o valor do desconto do INSS sobre o salário noturno." }
    ]
  },
  {
    id: "-1.23",
    fase: -1,
    titulo: "Questão 23: Cálculo Noturno Real",
    tipo: "Misto",
    focoTecnico: "Adicional Noturno",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Em uma jornada noturna padrão, das 22h às 5h, o total de horas noturnas a serem remuneradas, considerando a duração reduzida de 52 minutos e 30 segundos, é de:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 73 CLT",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "De 22h às 5h temos 7 horas 'de relógio' (420 minutos). Dividindo 420 por 52,5, obtemos exatamente 8 horas noturnas para fins de pagamento." }
    },
    opcoes: [
      { id: "a", texto: "a) 7 horas." },
      { id: "b", texto: "b) 7 horas e 20 minutos." },
      { id: "c", texto: "c) 8 horas." },
      { id: "d", texto: "d) 8 horas e 30 minutos." }
    ]
  },
  {
    id: "-1.24",
    fase: -1,
    titulo: "Questão 24: Trabalho Noturno Urbano",
    tipo: "Misto",
    focoTecnico: "Adicional Noturno",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Além do adicional de 20%, o que mais caracteriza o trabalho noturno urbano, segundo a CLT, em comparação com o trabalho diurno?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 73 CLT",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "A principal diferença técnica é a redução da hora (52,5 min vs 60 min)." }
    },
    opcoes: [
      { id: "a", texto: "a) A duração da hora de trabalho é menor para fins de cálculo da remuneração." },
      { id: "b", texto: "b) A jornada de trabalho é obrigatoriamente mais curta." },
      { id: "c", texto: "c) O trabalhador tem direito a um intervalo de 2 horas para descanso." },
      { id: "d", texto: "d) O salário-base é obrigatoriamente maior." }
    ]
  },
  {
    id: "-1.25",
    fase: -1,
    titulo: "Questão 25: Súmula 60 do TST",
    tipo: "Misto",
    focoTecnico: "Jurisprudência",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A Súmula 60 do Tribunal Superior do Trabalho (TST) estabelece que o adicional noturno:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Súmula 60, I TST",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "O adicional noturno, pago com habitualidade, integra o salário do empregado para todos os efeitos (férias, 13º, FGTS, etc)." }
    },
    opcoes: [
      { id: "a", texto: "a) Não se integra ao salário para cálculo de férias e 13º salário." },
      { id: "b", texto: "b) É devido apenas se a jornada for estritamente noturna, sem prorrogação." },
      { id: "c", texto: "c) Pago com habitualidade, integra o salário do empregado para todos os efeitos." },
      { id: "d", texto: "d) Pode ser suprimido por convenção coletiva de trabalho." }
    ]
  },
  {
    id: "-1.26",
    fase: -1,
    titulo: "Questão 26: Verbas Perdidas na Justa Causa",
    tipo: "Misto",
    focoTecnico: "Rescisão Contratual",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Na dispensa por justa causa, o empregado perde o direito a algumas verbas rescisórias. Assinale a alternativa que apresenta APENAS verbas a que o empregado demitido por justa causa NÃO tem direito:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "O empregado perde o aviso prévio e a multa de 40% do FGTS. Saldo de salário e férias vencidas são mantidos." }
    },
    opcoes: [
      { id: "a", texto: "a) Saldo de salário e férias vencidas." },
      { id: "b", texto: "b) Aviso prévio e multa de 40% sobre o FGTS." },
      { id: "c", texto: "c) 13º salário proporcional e férias proporcionais." },
      { id: "d", texto: "d) Saldo de salário e 13º salário proporcional." }
    ]
  },
  {
    id: "-1.27",
    fase: -1,
    titulo: "Questão 27: Requisitos da Justa Causa",
    tipo: "Misto",
    focoTecnico: "Rescisão Contratual",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Sobre os requisitos para a aplicação da justa causa, é correto afirmar que:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Doutrina Trabalhista",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "Devem ser observados os princípios da imediatidade (punição rápida), proporcionalidade (gravidade) e tipicidade (previsão legal)." }
    },
    opcoes: [
      { id: "a", texto: "a) A punição pode ser aplicada meses após o conhecimento do fato, para garantir a reflexão do empregado." },
      { id: "b", texto: "b) A conduta do empregado deve se enquadrar em uma das hipóteses do art. 482 da CLT, que é um rol exemplificativo." },
      { id: "c", texto: "c) Devem ser observados os princípios da imediatidade, proporcionalidade e tipicidade." },
      { id: "d", texto: "d) A justa causa é uma penalidade leve, que não exige comprovação robusta por parte do empregador." }
    ]
  },
  {
    id: "-1.28",
    fase: -1,
    titulo: "Questão 28: Natureza do Art. 482",
    tipo: "Misto",
    focoTecnico: "Direito do Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O art. 482 da CLT, que elenca as hipóteses de justa causa, é considerado um rol:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "O rol é taxativo (numerus clausus), ou seja, apenas as condutas expressamente previstas em lei autorizam a dispensa por justa causa." }
    },
    opcoes: [
      { id: "a", texto: "a) Exemplificativo, pois o empregador pode criar novas faltas graves." },
      { id: "b", texto: "b) Taxativo, pois somente as condutas listadas na lei podem justificar a rescisão." },
      { id: "c", texto: "c) Aberto, pois depende da interpretação do juiz do trabalho." },
      { id: "d", texto: "d) Indicativo, pois o empregado pode escolher se aceita ou não a justa causa." }
    ]
  },
  {
    id: "-1.29",
    fase: -1,
    titulo: "Questão 29: Conceito de Imediatidade",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O conceito de 'imediatidade', como requisito para a aplicação da justa causa, significa que:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Doutrina",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A falta deve ser punida assim que o empregador toma conhecimento dela. A demora injustificada pode ser interpretada como perdão tácito." }
    },
    opcoes: [
      { id: "a", texto: "a) O empregado deve ser imediatamente substituído em sua função." },
      { id: "b", texto: "b) A rescisão deve ocorrer logo após o empregador tomar conhecimento da falta, sob pena de perdão tácito." },
      { id: "c", texto: "c) O empregador deve pagar todas as verbas rescisórias em até 10 dias." },
      { id: "d", texto: "d) A falta deve ser comunicada ao sindicato da categoria imediatamente." }
    ]
  },
  {
    id: "-1.30",
    fase: -1,
    titulo: "Questão 30: Ônus da Prova",
    tipo: "Misto",
    focoTecnico: "Processo do Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Sobre o ônus da prova na justa causa, é correto afirmar que:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Súmula 212 TST",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "O ônus de provar a justa causa é do empregador, pois a dispensa motivada é exceção ao princípio da continuidade da relação de emprego." }
    },
    opcoes: [
      { id: "a", texto: "a) O empregado deve provar que não cometeu a falta." },
      { id: "b", texto: "b) O empregador deve provar, de forma robusta e inequívoca, a falta grave cometida pelo empregado." },
      { id: "c", texto: "c) A prova é desnecessária, pois a palavra do empregador prevalece." },
      { id: "d", texto: "d) Apenas testemunhas podem ser usadas como prova." }
    ]
  },
  {
    id: "-1.31",
    fase: -1,
    titulo: "Questão 31: Fórmula do Divisor",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A fórmula para encontrar o divisor mensal, conforme o art. 64 da CLT, é:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "O divisor é obtido multiplicando-se a jornada semanal por 30 (dias do mês) e dividindo por 6 (dias úteis da semana)." }
    },
    opcoes: [
      { id: "a", texto: "a) (horas semanais × 4 semanas)" },
      { id: "b", texto: "b) (horas semanais ÷ 6) × 30" },
      { id: "c", texto: "c) (horas semanais × 30) ÷ 7" },
      { id: "d", texto: "d) (horas semanais × 5) + 30" }
    ]
  },
  {
    id: "-1.32",
    fase: -1,
    titulo: "Questão 32: Divisor 220",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O divisor 220 é aplicado para empregados com jornada semanal de:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 58 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "Empregados que trabalham 44 horas semanais utilizam o divisor 220 para o cálculo do valor da hora." }
    },
    opcoes: [
      { id: "a", texto: "a) 40 horas" },
      { id: "b", texto: "b) 44 horas" },
      { id: "c", texto: "c) 36 horas" },
      { id: "d", texto: "d) 30 horas" }
    ]
  },
  {
    id: "-1.33",
    fase: -1,
    titulo: "Questão 33: Divisor para 40h",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Para um empregado com jornada de 40 horas semanais, o divisor a ser utilizado é:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Súmula 431 TST",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "A jurisprudência consolidada no TST estabelece que para jornada de 40 horas semanais aplica-se o divisor 200." }
    },
    opcoes: [
      { id: "a", texto: "a) 200" },
      { id: "b", texto: "b) 220" },
      { id: "c", texto: "c) 180" },
      { id: "d", texto: "d) 150" }
    ]
  },
  {
    id: "-1.34",
    fase: -1,
    titulo: "Questão 34: Súmula 431 do TST",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A Súmula 431 do TST estabelece que se aplica o divisor 200 para:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Súmula 431 TST",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A súmula é específica para empregados que cumprem jornada de 40 horas semanais." }
    },
    opcoes: [
      { id: "a", texto: "a) Empregados com jornada de 44 horas semanais." },
      { id: "b", texto: "b) Empregados com jornada de 40 horas semanais." },
      { id: "c", texto: "c) Bancários com jornada de 6 horas diárias." },
      { id: "d", texto: "d) Empregados com jornada de 36 horas semanais." }
    ]
  },
  {
    id: "-1.35",
    fase: -1,
    titulo: "Questão 35: Divisor para 36h",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Um empregado com jornada de 36 horas semanais tem como divisor correto:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 CLT",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "36 ÷ 6 * 30 = 180. O divisor para 36 horas semanais é 180." }
    },
    opcoes: [
      { id: "a", texto: "a) 220" },
      { id: "b", texto: "b) 200" },
      { id: "c", texto: "c) 180" },
      { id: "d", texto: "d) 160" }
    ]
  },
  {
    id: "-1.36",
    fase: -1,
    titulo: "Questão 36: Divisor para 30h",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Para uma jornada de 30 horas semanais, o divisor a ser utilizado é:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "30 ÷ 6 * 30 = 150. O divisor para 30 horas semanais é 150." }
    },
    opcoes: [
      { id: "a", texto: "a) 120" },
      { id: "b", texto: "b) 150" },
      { id: "c", texto: "c) 180" },
      { id: "d", texto: "d) 200" }
    ]
  },
  {
    id: "-1.37",
    fase: -1,
    titulo: "Questão 37: Divisor para 42h",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Qual o divisor para um empregado que trabalha 42 horas semanais?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "42 ÷ 6 * 30 = 210. O divisor para 42 horas semanais é 210." }
    },
    opcoes: [
      { id: "a", texto: "a) 200" },
      { id: "b", texto: "b) 210" },
      { id: "c", texto: "c) 220" },
      { id: "d", texto: "d) 180" }
    ]
  },
  {
    id: "-1.38",
    fase: -1,
    titulo: "Questão 38: Divisor para 24h",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Um empregado com jornada de 24 horas semanais tem como divisor:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 CLT",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "24 ÷ 6 * 30 = 120. O divisor para 24 horas semanais é 120." }
    },
    opcoes: [
      { id: "a", texto: "a) 120" },
      { id: "b", texto: "b) 100" },
      { id: "c", texto: "c) 140" },
      { id: "d", texto: "d) 150" }
    ]
  },
  {
    id: "-1.39",
    fase: -1,
    titulo: "Questão 39: Origem do Divisor 220",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O divisor 220 é resultado de qual cálculo matemático baseado na CLT?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "(44 horas semanais ÷ 6 dias úteis) × 30 dias mensais = 220." }
    },
    opcoes: [
      { id: "a", texto: "a) 44 horas × 5 semanas" },
      { id: "b", texto: "b) (44 ÷ 6) × 30" },
      { id: "c", texto: "c) 44 × 4.4" },
      { id: "d", texto: "d) (44 ÷ 7) × 30" }
    ]
  },
  {
    id: "-1.40",
    fase: -1,
    titulo: "Questão 40: Divisor de Bancário 40h",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Para um bancário ou empregado administrativo com jornada de 40 horas semanais (segunda a sexta), o divisor é:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Súmula 124 TST",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "Para a jornada de 40 horas semanais, o divisor é 200, conforme entendimento jurisprudencial dominante." }
    },
    opcoes: [
      { id: "a", texto: "a) 220" },
      { id: "b", texto: "b) 200" },
      { id: "c", texto: "c) 180" },
      { id: "d", texto: "d) 150" }
    ]
  },
  {
    id: "-1.41",
    fase: -1,
    titulo: "Questão 41: Cálculo Valor Hora 36h",
    tipo: "Misto",
    focoTecnico: "Cálculos Trabalhistas",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 3000.00, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "36h/semana" },
    queixa: "Um empregado que recebe R$ 3.000,00 mensais e trabalha 36 horas semanais. Qual o valor da sua hora normal?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 CLT",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "Divisor para 36h = 180. R$ 3.000,00 ÷ 180 = R$ 16,67." }
    },
    opcoes: [
      { id: "a", texto: "a) R$ 16,67" },
      { id: "b", texto: "b) R$ 13,64" },
      { id: "c", texto: "c) R$ 15,00" },
      { id: "d", texto: "d) R$ 18,75" }
    ]
  },
  {
    id: "-1.42",
    fase: -1,
    titulo: "Questão 42: Cálculo Valor Hora 30h",
    tipo: "Misto",
    focoTecnico: "Cálculos Trabalhistas",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 2200.00, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "30h/semana" },
    queixa: "Um empregado que recebe R$ 2.200,00 mensais e trabalha 30 horas semanais. Qual o valor da sua hora normal?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "Divisor para 30h = 150. R$ 2.200,00 ÷ 150 = R$ 14,67." }
    },
    opcoes: [
      { id: "a", texto: "a) R$ 10,00" },
      { id: "b", texto: "b) R$ 14,67" },
      { id: "c", texto: "c) R$ 12,22" },
      { id: "d", texto: "d) R$ 15,71" }
    ]
  },
  {
    id: "-1.43",
    fase: -1,
    titulo: "Questão 43: Impacto da Súmula 431",
    tipo: "Misto",
    focoTecnico: "Jornada de Trabalho",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A aplicação do divisor 200 (em vez de 220) para quem trabalha 40 horas semanais tem como impacto prático:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Súmula 431 TST",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "Um divisor menor resulta em um valor de hora maior, o que aumenta o custo das horas extras para a empresa e a remuneração para o empregado." }
    },
    opcoes: [
      { id: "a", texto: "a) Redução do valor da hora extra." },
      { id: "b", texto: "b) Aumento do valor da hora normal e, consequentemente, da hora extra." },
      { id: "c", texto: "c) Redução do salário nominal do empregado." },
      { id: "d", texto: "d) Não há impacto financeiro, apenas administrativo." }
    ]
  },
  {
    id: "-1.44",
    fase: -1,
    titulo: "Questão 44: Hipóteses de Justa Causa",
    tipo: "Misto",
    focoTecnico: "Rescisão Contratual",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "O rol de faltas graves que autorizam a rescisão por justa causa pelo empregador está previsto no artigo:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482 CLT",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "O Art. 482 da CLT é o dispositivo legal que elenca as hipóteses de justa causa por parte do empregado." }
    },
    opcoes: [
      { id: "a", texto: "a) Art. 483 da CLT." },
      { id: "b", texto: "b) Art. 487 da CLT." },
      { id: "c", texto: "c) Art. 482 da CLT." },
      { id: "d", texto: "d) Art. 500 da CLT." }
    ]
  },
  {
    id: "-1.45",
    fase: -1,
    titulo: "Questão 45: Improbidade",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A falta grave caracterizada por desonestidade, abuso de confiança ou fraude visando vantagem para si ou para outrem é denominada:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'a' CLT",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "O ato de improbidade é aquele que revela desonestidade do empregado, como furto ou adulteração de documentos." }
    },
    opcoes: [
      { id: "a", texto: "a) Improbidade." },
      { id: "b", texto: "b) Desídia." },
      { id: "c", texto: "c) Incontinência de conduta." },
      { id: "d", texto: "d) Indisciplina." }
    ]
  },
  {
    id: "-1.46",
    fase: -1,
    titulo: "Questão 46: Incontinência de Conduta",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A falta grave que se manifesta por excessos de natureza sexual, falta de pudor ou desrespeito moral no ambiente de trabalho é a:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'b' CLT",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "A incontinência de conduta está ligada a atos de natureza sexual ou desvios morais graves no trabalho." }
    },
    opcoes: [
      { id: "a", texto: "a) Desídia." },
      { id: "b", texto: "b) Embriaguez habitual." },
      { id: "c", texto: "c) Incontinência de conduta." },
      { id: "d", texto: "d) Ofensa física." }
    ]
  },
  {
    id: "-1.47",
    fase: -1,
    titulo: "Questão 47: Negociação Habitual",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Quando o empregado exerce atividade concorrente com a do empregador, sem sua permissão, prejudicando o serviço, ele comete:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'c' CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A negociação habitual por conta própria ou alheia, sem permissão do empregador, e quando constituir ato de concorrência à empresa, é justa causa." }
    },
    opcoes: [
      { id: "a", texto: "a) Desídia." },
      { id: "b", texto: "b) Negociação habitual sem permissão do empregador." },
      { id: "c", texto: "c) Indisciplina." },
      { id: "d", texto: "d) Mau procedimento." }
    ]
  },
  {
    id: "-1.48",
    fase: -1,
    titulo: "Questão 48: Condenação Criminal",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A condenação criminal do empregado autoriza a justa causa somente quando:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'd' CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A condenação criminal deve ter passado em julgado (não caber mais recurso) e não pode haver suspensão da execução da pena." }
    },
    opcoes: [
      { id: "a", texto: "a) O empregado é preso preventivamente." },
      { id: "b", texto: "b) Houver condenação criminal passada em julgado, caso não tenha havido suspensão da execução da pena." },
      { id: "c", texto: "c) O empregado é réu em qualquer processo criminal." },
      { id: "d", texto: "d) O empregador simplesmente não gostar da conduta social do empregado." }
    ]
  },
  {
    id: "-1.49",
    fase: -1,
    titulo: "Questão 49: Desídia",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A falta grave que se caracteriza pela negligência, preguiça, desatenção ou desinteresse reiterado no cumprimento das obrigações é a:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'e' CLT",
      respostaEsperadaId: "a",
      valoresCorretos: { justificativa: "Desídia é o desleixo habitual, a falta de zelo com as tarefas do trabalho." }
    },
    opcoes: [
      { id: "a", texto: "a) Desídia." },
      { id: "b", texto: "b) Mau procedimento." },
      { id: "c", texto: "c) Insubordinação." },
      { id: "d", texto: "d) Improbidade." }
    ]
  },
  {
    id: "-1.50",
    fase: -1,
    titulo: "Questão 50: Embriaguez",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Sobre a embriaguez como hipótese de justa causa:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'f' CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A lei prevê a embriaguez habitual ou em serviço como justa causa, embora a jurisprudência atual prefira o tratamento médico se for doença (alcoolismo)." }
    },
    opcoes: [
      { id: "a", texto: "a) Somente se o empregado chegar bêbado todos os dias." },
      { id: "b", texto: "b) A embriaguez habitual ou em serviço justifica a rescisão por justa causa." },
      { id: "c", texto: "c) É proibido demitir por embriaguez em qualquer hipótese." },
      { id: "d", texto: "d) O empregador deve pagar uma multa para demitir um empregado embriagado." }
    ]
  },
  {
    id: "-1.51",
    fase: -1,
    titulo: "Questão 51: Violação de Segredo",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A violação de segredo da empresa ocorre quando o empregado:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'g' CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "Revelar informações confidenciais, projetos ou dados técnicos a terceiros sem autorização." }
    },
    opcoes: [
      { id: "a", texto: "a) Conta para a família quanto ganha de salário." },
      { id: "b", texto: "b) Divulga informações sigilosas da empresa que podem causar prejuízo." },
      { id: "c", texto: "c) Perde a chave do escritório." },
      { id: "d", texto: "d) Esquece a senha do seu computador pessoal." }
    ]
  },
  {
    id: "-1.52",
    fase: -1,
    titulo: "Questão 52: Indisciplina vs Insubordinação",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Qual a diferença entre indisciplina e insubordinação?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'h' CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "Indisciplina é o descumprimento de normas gerais da empresa; insubordinação é o descumprimento de uma ordem direta e específica dada ao empregado." }
    },
    opcoes: [
      { id: "a", texto: "a) São sinônimos perfeitos." },
      { id: "b", texto: "b) Indisciplina refere-se a normas gerais; insubordinação refere-se a ordens diretas." },
      { id: "c", texto: "c) Insubordinação é mais leve que a indisciplina." },
      { id: "d", texto: "d) Indisciplina só ocorre fora do horário de trabalho." }
    ]
  },
  {
    id: "-1.53",
    fase: -1,
    titulo: "Questão 53: Abandono de Emprego",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "Para que se configure o abandono de emprego, a jurisprudência (Súmula 32 do TST) presume que o prazo de ausência injustificada deve ser de, pelo menos:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Súmula 32 TST",
      respostaEsperadaId: "c",
      valoresCorretos: { justificativa: "Presume-se o abandono de emprego se o trabalhador não retornar ao serviço no prazo de 30 dias após a cessação do benefício previdenciário ou ausência sem justificativa." }
    },
    opcoes: [
      { id: "a", texto: "a) 15 dias." },
      { id: "b", texto: "b) 20 dias." },
      { id: "c", texto: "c) 30 dias." },
      { id: "d", texto: "d) 60 dias." }
    ]
  },
  {
    id: "-1.54",
    fase: -1,
    titulo: "Questão 54: Ofensas à Honra",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A prática de ato lesivo da honra ou da boa fama contra superiores hierárquicos constitui justa causa:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'k' CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "Ofender verbalmente ou caluniar um superior no ambiente de trabalho (ou em razão dele) é falta grave." }
    },
    opcoes: [
      { id: "a", texto: "a) Apenas se houver agressão física." },
      { id: "b", texto: "b) Em qualquer circunstância no serviço, salvo em caso de legítima defesa." },
      { id: "c", texto: "c) Somente se for feito por escrito." },
      { id: "d", texto: "d) Não é justa causa, apenas advertência." }
    ]
  },
  {
    id: "-1.55",
    fase: -1,
    titulo: "Questão 55: Jogos de Azar",
    tipo: "Misto",
    focoTecnico: "Justa Causa",
    tempoLimiteMinutos: 5,
    xpRecompensa: 10,
    empregado: { nome: "Simulado", cbo: "N/A", salarioBase: 0, dataAdmissao: "01/01/2026", dataFato: "01/01/2026", jornada: "N/A" },
    queixa: "A prática constante de jogos de azar no ambiente de trabalho:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 482, 'l' CLT",
      respostaEsperadaId: "b",
      valoresCorretos: { justificativa: "A prática constante de jogos de azar é uma das hipóteses taxativas de justa causa previstas na CLT." }
    },
    opcoes: [
      { id: "a", texto: "a) É permitida se não atrapalhar o serviço." },
      { id: "b", texto: "b) Constitui justa causa para a rescisão do contrato de trabalho." },
      { id: "c", texto: "c) Gera apenas suspensão de 1 dia." },
      { id: "d", texto: "d) É considerada lazer e incentivada por algumas empresas." }
    ]
  },

  // --- FASE 0: PRÉ-CADASTRO (21 Challenges - Módulo Admissão ADM) ---
  {
    id: "0.1",
    fase: 0,
    bloco: "A",
    titulo: "Os Elementos do Vínculo",
    tipo: "Explicativo",
    focoTecnico: "Artigo 3º da CLT",
    tempoLimiteMinutos: 5,
    xpRecompensa: 20,
    empregado: {
      nome: "Equipe de Admissão",
      cbo: "N/A",
      salarioBase: 0,
      dataAdmissao: "01/01/2026",
      dataFato: "01/01/2026",
      jornada: "N/A"
    },
    queixa: "Olá Equipe, para o meu contrato de registro, preciso ter certeza de que minhas atividades cumprem todos os critérios de um vínculo empregatício legal (vínculo trabalhista) de acordo com a legislação brasileira. Quais são os 5 requisitos fundamentais descritos no Artigo 3º da CLT?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 3º da CLT",
      respostaEsperadaId: "opt_01_A"
    },
    opcoes: [
      { id: "opt_01_A", texto: "A) Pessoalidade, Habitualidade, Subordinação, Onerosidade e ser Pessoa Física." },
      { id: "opt_01_B", texto: "B) Pessoalidade, Exclusividade, Lucratividade, Faturamento Alto e Força Maior." },
      { id: "opt_01_C", texto: "C) Parceria Direta, Informalidade, ID de Microempreendedor (MEI), Serviços sob Demanda e ser Pessoa Jurídica (PJ)." }
    ]
  },
  {
    id: "0.2",
    fase: 0,
    bloco: "A",
    titulo: "Admissão e Natureza do FGTS",
    tipo: "Explicativo",
    focoTecnico: "Cálculo do FGTS Mensal",
    tempoLimiteMinutos: 5,
    xpRecompensa: 20,
    empregado: {
      nome: "Novo Colaborador",
      cbo: "Assistente (4110-10)",
      salarioBase: 2300.00,
      dataAdmissao: "10/01/2026",
      dataFato: "10/01/2026",
      jornada: "44h/semana"
    },
    queixa: "Olá, estou sendo registrado com um salário base de R$ 2.300,00. Gostaria de saber se o depósito do FGTS é descontado do meu salário, qual é a porcentagem exata e quanto o empregador deve depositar mensalmente na minha conta vinculada do FGTS.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Lei 8.036/90",
      respostaEsperadaId: "opt_02_A"
    },
    opcoes: [
      { id: "opt_02_A", texto: "A) O FGTS NÃO é descontado do seu salário; é uma obrigação exclusiva do empregador. A empresa deve depositar R$ 184,00 (8% de R$ 2.300) mensalmente." },
      { id: "opt_02_B", texto: "B) O FGTS é totalmente descontado do salário do trabalhador na folha de pagamento à alíquota de 8%." },
      { id: "opt_02_C", texto: "C) O FGTS é co-financiado: a empresa pode descontar até 6% do seu salário e complementar o restante." }
    ]
  },
  {
    id: "0.3",
    fase: 0,
    bloco: "A",
    titulo: "Tolerância de Ponto",
    tipo: "Explicativo",
    focoTecnico: "Artigo 58 CLT §1º",
    tempoLimiteMinutos: 5,
    xpRecompensa: 20,
    empregado: {
      nome: "Operador de Logística",
      cbo: "Almoxarife (4141-05)",
      salarioBase: 2117.91,
      dataAdmissao: "01/02/2026",
      dataFato: "05/02/2026",
      jornada: "44h/semana"
    },
    queixa: "Bati meu ponto às 08:06 em vez de 08:00 (6 minutos de atraso). No final do mês, a empresa descontou uma hora inteira do meu salário! Esse desconto é permitido pelas regras da CLT?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 58 CLT §1º",
      respostaEsperadaId: "opt_03_A"
    },
    opcoes: [
      { id: "opt_03_A", texto: "A) Não, o desconto é ilegal. A CLT permite uma variação diária de até 10 minutos no total (máximo 5 minutos por batida) sem desconto ou cálculo de extra." },
      { id: "opt_03_B", texto: "B) Sim, qualquer minuto de atraso anula os limites de tolerância e permite à empresa descontar 1 hora cheia." },
      { id: "opt_03_C", texto: "C) O desconto está correto, pois o limite de 5 minutos se aplica apenas às saídas." }
    ]
  },
  {
    id: "0.4",
    fase: 0,
    bloco: "B",
    titulo: "Salário-Hora Base",
    tipo: "Cálculo",
    focoTecnico: "Divisor Mensal 220",
    tempoLimiteMinutos: 5,
    xpRecompensa: 25,
    empregado: {
      nome: "Analista de DP",
      cbo: "4110-30",
      salarioBase: 2200.00,
      dataAdmissao: "01/01/2026",
      dataFato: "01/01/2026",
      jornada: "44h/semana"
    },
    queixa: "Para calcular horas extras e descontos precisos, preciso saber qual é o meu valor-hora. Com um salário base de R$ 2.200,00 e jornada de 44h semanais, qual divisor e valor-hora devem ser usados?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 64 CLT",
      respostaEsperadaId: "opt_04_A"
    },
    opcoes: [
      { id: "opt_04_A", texto: "A) Divisor 220, resultando em R$ 10,00 por hora (2200 / 220)." },
      { id: "opt_04_B", texto: "B) Divisor 200, resultando em R$ 11,00 por hora." },
      { id: "opt_04_C", texto: "C) Divisor 180, resultando em R$ 12,22 por hora." }
    ]
  },
  {
    id: "0.5",
    fase: 0,
    bloco: "B",
    titulo: "Ativação de Admissão",
    tipo: "Explicativo",
    focoTecnico: "Prazo e-Social S-2200",
    tempoLimiteMinutos: 5,
    xpRecompensa: 25,
    empregado: {
      nome: "Gerente de RH",
      cbo: "1421-05",
      salarioBase: 8500.00,
      dataAdmissao: "01/01/2026",
      dataFato: "01/01/2026",
      jornada: "44h/semana"
    },
    queixa: "Um novo funcionário começa a trabalhar amanhã às 08:00. Qual é o prazo legal para transmitirmos o evento de admissão (S-2200 ou S-2190) para o e-Social?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Manual do e-Social",
      respostaEsperadaId: "opt_05_A"
    },
    opcoes: [
      { id: "opt_05_A", texto: "A) Até o dia anterior ao início das atividades do trabalhador." },
      { id: "opt_05_B", texto: "B) Até o dia 15 do mês seguinte ao da admissão." },
      { id: "opt_05_C", texto: "C) No mesmo dia do início, até o final do expediente." }
    ]
  },
  {
    id: "0.6",
    fase: 0,
    bloco: "C",
    titulo: "FGTS do Jovem Aprendiz",
    tipo: "Explicativo",
    focoTecnico: "Alíquota Diferenciada",
    tempoLimiteMinutos: 5,
    xpRecompensa: 30,
    empregado: {
      nome: "Lucas Aprendiz",
      cbo: "Aprendiz (4110-45)",
      salarioBase: 1320.00,
      dataAdmissao: "01/02/2026",
      dataFato: "01/02/2026",
      jornada: "30h/semana"
    },
    queixa: "Sou Jovem Aprendiz e meu colega é CLT efetivo. Ele disse que a empresa deposita 8% de FGTS para ele. Para mim, como aprendiz, a alíquota de depósito é a mesma?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Lei 8.036/90, Art. 15, § 7º",
      respostaEsperadaId: "opt_06_A"
    },
    opcoes: [
      { id: "opt_06_A", texto: "A) Não, a alíquota para o Jovem Aprendiz é reduzida para 2%." },
      { id: "opt_06_B", texto: "B) Sim, a alíquota é de 8% para todos os tipos de contrato." },
      { id: "opt_06_C", texto: "C) Para aprendizes a alíquota é de 4%." }
    ]
  },
  {
    id: "0.7",
    fase: 0,
    bloco: "C",
    titulo: "FGTS e Encargos do Estagiário",
    tipo: "Explicativo",
    focoTecnico: "Lei 11.788/2008",
    tempoLimiteMinutos: 5,
    xpRecompensa: 30,
    empregado: {
      nome: "Mariana Estagiária",
      cbo: "N/A - Estágio",
      salarioBase: 1500.00,
      dataAdmissao: "01/03/2026",
      dataFato: "01/03/2026",
      jornada: "30h/semana"
    },
    queixa: "Recebo bolsa-auxílio de R$ 1.500,00 como estagiária. Verifiquei meu extrato do FGTS e não há depósitos. A empresa está descumprindo a lei de estágio ao não depositar meu FGTS?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Lei 11.788/2008",
      respostaEsperadaId: "opt_07_A"
    },
    opcoes: [
      { id: "opt_07_A", texto: "A) Não. O estágio não configura vínculo empregatício e, portanto, não há previsão legal de depósito de FGTS nem recolhimento de INSS patronal." },
      { id: "opt_07_B", texto: "B) Sim, todo trabalhador que recebe remuneração deve ter 8% de FGTS depositado." },
      { id: "opt_07_C", texto: "C) A empresa deve depositar apenas 2% de FGTS para estagiários." }
    ]
  },
  {
    id: "0.8",
    fase: 0,
    bloco: "D",
    titulo: "Conceito de Empregador",
    tipo: "Explicativo",
    focoTecnico: "Artigo 2º da CLT",
    tempoLimiteMinutos: 5,
    xpRecompensa: 20,
    empregado: {
      nome: "Equipe RH",
      cbo: "N/A",
      salarioBase: 0,
      dataAdmissao: "01/01/2026",
      dataFato: "01/01/2026",
      jornada: "N/A"
    },
    queixa: "Durante o processo de integração, analise as alternativas abaixo e escolha a definição CORRETA de 'EMPREGADOR' de acordo com a CLT.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 2º da CLT",
      respostaEsperadaId: "opt_08_C"
    },
    opcoes: [
      { id: "opt_08_A", texto: "A) Considera-se empregador a empresa, de caráter coletivo apenas, que admite e paga serviços." },
      { id: "opt_08_B", texto: "B) Considera-se empregador a empresa, individual ou coletiva, que admite e dirige a prestação pessoal de serviço, independente de salário." },
      { id: "opt_08_C", texto: "C) Considera-se empregador a empresa, individual ou coletiva, que, assumindo os riscos da atividade econômica, admite, assalaria e dirige a prestação pessoal de serviço." }
    ]
  },
  {
    id: "0.9",
    fase: 0,
    bloco: "A",
    titulo: "O que é o Direito?",
    tipo: "Explicativo",
    focoTecnico: "Definição Jurídica de Direito",
    tempoLimiteMinutos: 5,
    xpRecompensa: 20,
    empregado: {
      nome: "João e Pedro",
      cbo: "7212-15 - Torneiro Mecânico",
      salarioBase: 2500.00,
      dataAdmissao: "10/01/2025",
      dataFato: "15/02/2026",
      jornada: "44h/semana"
    },
    queixa: "**Contexto:** João e Pedro são colegas de trabalho em uma metalúrgica. Durante o intervalo, João comenta: “Essa lei de segurança do trabalho é frescura. É só uma sugestão; se eu quiser operar a máquina sem luva, é problema meu.” Pedro, que faz faculdade de Direito, tenta explicar que a lei não é uma mera recomendação. No dia seguinte, João opera a máquina sem equipamento, sofre um acidente leve e, além de ser demitido por justa causa, é multado pelo Ministério do Trabalho. Revoltado, ele processa a empresa, mas o juiz indefere a ação, afirmando que a obrigação era dele.\n\n**Questão:** Com base na definição jurídica de Direito, assinale a alternativa que melhor explica por que João foi punido, diferentemente de uma simples sugestão.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 166 da CLT",
      respostaEsperadaId: "opt_09_B"
    },
    opcoes: [
      { id: "opt_09_A", texto: "A) O Direito é um conjunto de regras facultativas, mas a empresa aplicou penalidade interna por vontade própria." },
      { id: "opt_09_B", texto: "B) O Direito é um conjunto de regras obrigatórias e coercitivas, impostas pelo Estado, cujo descumprimento gera sanção estatal (multa e demissão com justa causa)." },
      { id: "opt_09_C", texto: "C) O Direito se confunde com a moral religiosa, e João pecou contra a ética protestante." },
      { id: "opt_09_D", texto: "D) As regras jurídicas só valem se o empregado concordar com elas por escrito." }
    ]
  },
  {
    id: "0.10",
    fase: 0,
    bloco: "A",
    titulo: "Finalidades do Direito",
    tipo: "Explicativo",
    focoTecnico: "Segurança Jurídica e Paz Social",
    tempoLimiteMinutos: 5,
    xpRecompensa: 20,
    empregado: {
      nome: "Moradores de Jardim Feliz",
      cbo: "N/A",
      salarioBase: 0,
      dataAdmissao: "01/01/2025",
      dataFato: "10/02/2026",
      jornada: "Escala Comunitária"
    },
    queixa: "**Contexto:** No bairro de Jardim Feliz, há um terreno baldio abandonado. O dono nunca aparece, e moradores começam a usar o espaço para festas, mas também para despejar lixo. Os vizinhos entram em conflito: uns querem cercar o local, outros querem construir uma praça. A prefeitura alega que não pode intervir sem lei. O Ministério Público propõe uma ação civil pública para regular o uso do terreno, destacando que o Direito existe para organizar a convivência. O juiz, ao decidir, cita duas finalidades essenciais do ordenamento jurídico.\n\n**Questão:** Quais das finalidades a seguir o juiz provavelmente mencionou como pilares do Direito nesse caso?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Fim Social do Direito",
      respostaEsperadaId: "opt_10_B"
    },
    opcoes: [
      { id: "opt_10_A", texto: "A) Lucro econômico e livre iniciativa." },
      { id: "opt_10_B", texto: "B) Segurança jurídica e paz social, para evitar a violência e dar previsibilidade às decisões." },
      { id: "opt_10_C", texto: "C) Vingança privada e compensação financeira." },
      { id: "opt_10_D", texto: "D) Isenção fiscal e autonomia total dos moradores." }
    ]
  },
  {
    id: "0.11",
    fase: 0,
    bloco: "A",
    titulo: "Norma Jurídica vs. Moral",
    tipo: "Explicativo",
    focoTecnico: "Heteronomia e Coercitividade",
    tempoLimiteMinutos: 5,
    xpRecompensa: 20,
    empregado: {
      nome: "Carla e Beatriz",
      cbo: "Auxiliar Administrativo (4110-10)",
      salarioBase: 2300.00,
      dataAdmissao: "10/01/2025",
      dataFato: "15/02/2026",
      jornada: "44h/semana"
    },
    queixa: "**Contexto:** Carla e Beatriz são amigas. Carla prometeu a Beatriz que iria ao seu aniversário, mas no dia preferiu ir ao cinema com outro grupo, deixando Beatriz chateada. Beatriz sente-se traída e decide cortar a amizade. No mesmo dia, o vizinho de Carla, Sr. José, furta a encomenda dos correios que estava na portaria de Carla. Carla descobre e registra boletim de ocorrência. O delegado explica que o furto é crime, mas a mentira para a amiga não. Ao saber disso, Beatriz pergunta: “Por que o Direito pune um e não o outro?”\n\n**Questão:** Qual alternativa explica corretamente a diferença entre as duas condutas?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Sanção estatal e Coerção",
      respostaEsperadaId: "opt_11_B"
    },
    opcoes: [
      { id: "opt_11_A", texto: "A) Mentir para amiga é imoral, mas o Direito não pune porque não gera dano econômico; já o furto gera dano, por isso é crime." },
      { id: "opt_11_B", texto: "B) A mentira viola uma norma moral (consciência), sem sanção estatal; o furto viola uma norma jurídica, que tem sanção imposta pelo Estado (prisão/multa)." },
      { id: "opt_11_C", texto: "C) O Direito só se aplica a relações familiares, não a vizinhos." },
      { id: "opt_11_D", texto: "D) Ambas são igualmente crime, mas Beatriz não registrou ocorrência." }
    ]
  },
  {
    id: "0.12",
    fase: 0,
    bloco: "B",
    titulo: "Constituição como Lei Suprema",
    tipo: "Explicativo",
    focoTecnico: "Pìrâmide de Kelsen e Hierarquia das Normas",
    tempoLimiteMinutos: 5,
    xpRecompensa: 25,
    empregado: {
      nome: "Governo do Paraná",
      cbo: "N/A",
      salarioBase: 1412.00,
      dataAdmissao: "01/01/2025",
      dataFato: "01/05/2025",
      jornada: "N/A"
    },
    queixa: "**Contexto:** O governo do Estado do Paraná publica uma lei estadual que reduz o salário mínimo regional para R$ 1.000,00, abaixo do piso federal de R$ 1.412,00. O sindicato dos trabalhadores impetra um mandado de segurança, argumentando que a lei viola a Constituição. O governador defende a lei dizendo que o Estado tem autonomia. O juiz federal, porém, declara a lei inválida. O sindicato pede que o juiz explique por que a Constituição se sobrepõe.\n\n**Questão:** Por que a Constituição Federal prevalece sobre a lei estadual nesse caso?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 1º e 7º da CF/88",
      respostaEsperadaId: "opt_12_B"
    },
    opcoes: [
      { id: "opt_12_A", texto: "A) Porque a Constituição é a única lei que pode ser alterada pelo povo." },
      { id: "opt_12_B", texto: "B) Porque a Constituição está no topo da pirâmide jurídica e todas as leis inferiores devem respeitá-la, sob pena de nulidade." },
      { id: "opt_12_C", texto: "C) Porque a Constituição federal só vale para a União, e os estados podem legislar como quiserem." },
      { id: "opt_12_D", texto: "D) Porque o STF só julga leis federais, e a lei estadual é automaticamente válida." }
    ]
  },
  {
    id: "0.13",
    fase: 0,
    bloco: "B",
    titulo: "Inconstitucionalidade",
    tipo: "Explicativo",
    focoTecnico: "Controle de Constitucionalidade",
    tempoLimiteMinutos: 5,
    xpRecompensa: 25,
    empregado: {
      nome: "Senhor Antônio",
      cbo: "Aposentado",
      salarioBase: 0,
      dataAdmissao: "01/01/2025",
      dataFato: "15/06/2025",
      jornada: "Residencial"
    },
    queixa: "**Contexto:** A Câmara Municipal de uma cidade aprova uma lei que obriga todos os cidadãos a instalarem câmeras de vigilância dentro de suas próprias casas, com imagens transmitidas em tempo real para a central da Guarda Municipal, sob pena de multa diária. Um morador, o senhor Antônio, nega-se a instalar e é multado. Ele contrata uma advogada, que afirma que a lei é inconstitucional. O juiz concorda e suspende a multa.\n\n**Questão:** O que significa juridicamente dizer que essa lei municipal é “inconstitucional”?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 5º, X e XI da CF/88",
      respostaEsperadaId: "opt_13_B"
    },
    opcoes: [
      { id: "opt_13_A", texto: "A) Que a lei é imoral e deve ser reprovada socialmente." },
      { id: "opt_13_B", texto: "B) Que a lei viola dispositivo da Constituição (no caso, a inviolabilidade da intimidade e do domicílio – art. 5º, X e XI), podendo ser anulada pelo Poder Judiciário." },
      { id: "opt_13_C", texto: "C) Que a lei não foi publicada no Diário Oficial." },
      { id: "opt_13_D", texto: "D) Que a lei pode ser descumprida por qualquer cidadão sem penalidade." }
    ]
  },
  {
    id: "0.14",
    fase: 0,
    bloco: "C",
    titulo: "Vacância da Lei",
    tipo: "Cálculo",
    focoTecnico: "LINDB - Vigência das Leis",
    tempoLimiteMinutos: 5,
    xpRecompensa: 30,
    empregado: {
      nome: "Contador Beta S/A",
      cbo: "Contador (2521-05)",
      salarioBase: 4500.00,
      dataAdmissao: "10/03/2020",
      dataFato: "10/03/2025",
      jornada: "44h/semana"
    },
    queixa: "**Contexto:** Em 10 de março de 2025, é publicada no Diário Oficial da União a Lei Federal nº 14.999/2025, que altera o prazo para pagamento de impostos federais. A lei não menciona nenhuma data especial de vigência. O contador da empresa “Beta S/A” precisa saber a partir de quando deve aplicar a nova regra para evitar multas. Ele consulta o art. 1º da LINDB.\n\n**Questão:** Qual é a data de entrada em vigor dessa lei, considerando a regra geral?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 1º da LINDB",
      respostaEsperadaId: "opt_14_B"
    },
    opcoes: [
      { id: "opt_14_A", texto: "A) Imediatamente após a publicação, em 10 de março de 2025." },
      { id: "opt_14_B", texto: "B) 45 dias após a publicação, ou seja, 24 de abril de 2025." },
      { id: "opt_14_C", texto: "C) 30 dias após a publicação, em 9 de abril de 2025." },
      { id: "opt_14_D", texto: "D) No primeiro dia do ano seguinte, em 1º de janeiro de 2026." }
    ]
  },
  {
    id: "0.15",
    fase: 0,
    bloco: "C",
    titulo: "Irretroatividade das Leis",
    tipo: "Explicativo",
    focoTecnico: "Ato Jurídico Perfeito e Direito Adquirido",
    tempoLimiteMinutos: 5,
    xpRecompensa: 30,
    empregado: {
      nome: "Paulo",
      cbo: "Mecanico de Manutenção",
      salarioBase: 2400.00,
      dataAdmissao: "01/01/2024",
      dataFato: "15/04/2025",
      jornada: "44h/semana"
    },
    queixa: "**Contexto:** Em 1º de maio de 2025, entra em vigor uma nova lei que reduz a multa do FGTS de 40% para 20% nos casos de demissão sem justa causa. O empregado Paulo foi demitido sem justa causa em 15 de abril de 2025 (antes da lei). A empresa paga a multa de 20%, alegando que a nova lei já está em vigor. Paulo procura o sindicato, que afirma que a multa correta é de 40%, pois a lei nova não pode prejudicar seu direito adquirido.\n\n**Questão:** Com base no princípio da irretroatividade, qual é o percentual correto a ser aplicado a Paulo?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 5º, XXXVI, CF e LINDB",
      respostaEsperadaId: "opt_15_B"
    },
    opcoes: [
      { id: "opt_15_A", texto: "A) 20%, pois a nova lei já está em vigor e se aplica a todos os pagamentos feitos a partir de maio." },
      { id: "opt_15_B", texto: "B) 40%, pois a lei nova não retroage para prejudicar situações jurídicas já consolidadas (direito adquirido à multa de 40% da data da demissão)." },
      { id: "opt_15_C", texto: "C) 30%, fazendo-se uma média entre as duas leis." },
      { id: "opt_15_D", texto: "D) Nenhum percentual, pois a lei nova revogou todas as multas." }
    ]
  },
  {
    id: "0.16",
    fase: 0,
    bloco: "D",
    titulo: "Personalidade Jurídica",
    tipo: "Explicativo",
    focoTecnico: "Diferença entre PF e PJ",
    tempoLimiteMinutos: 5,
    xpRecompensa: 35,
    empregado: {
      nome: "Carlos (Sócio Construções Rápidas)",
      cbo: "Empresário",
      salarioBase: 0,
      dataAdmissao: "01/01/2025",
      dataFato: "10/02/2026",
      jornada: "Autônomo"
    },
    queixa: "**Contexto:** A empresa “Construções Rápidas Ltda.”, pessoa jurídica, contrai um empréstimo bancário de R$ 500.000,00 para comprar maquinário. Seis meses depois, a empresa vai à falência e deve o valor. O banco cobra o sócio-gerente, Carlos, pessoa física, pedindo a penhora de seu carro e de sua casa. Carlos alega que a dívida é da empresa, não dele.\n\n**Questão:** Qual fundamento jurídico Carlos pode usar para se defender?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 49-A do Código Civil",
      respostaEsperadaId: "opt_16_B"
    },
    opcoes: [
      { id: "opt_16_A", texto: "A) Carlos pode ser cobrado pessoalmente porque o sócio sempre responde pelas dívidas da PJ." },
      { id: "opt_16_B", texto: "B) A pessoa jurídica tem personalidade própria e patrimônio separado dos sócios; em regra, as dívidas da empresa não atingem os bens pessoais de Carlos." },
      { id: "opt_16_C", texto: "C) O banco só pode cobrar a PJ se ela tiver CNPJ, o que não é o caso." },
      { id: "opt_16_D", texto: "D) Como Carlos é pessoa física, ele responde ilimitadamente por qualquer dívida que a PJ contraia." }
    ]
  },
  {
    id: "0.17",
    fase: 0,
    bloco: "D",
    titulo: "Capacidade Civil",
    tipo: "Explicativo",
    focoTecnico: "Capacidade de Fato e de Direito",
    tempoLimiteMinutos: 5,
    xpRecompensa: 35,
    empregado: {
      nome: "Rafael, Gabriela e Lucas",
      cbo: "Estudantes",
      salarioBase: 0,
      dataAdmissao: "01/01/2026",
      dataFato: "15/02/2026",
      jornada: "N/A"
    },
    queixa: "**Contexto:** Três primos – Rafael (15 anos), Gabriela (17 anos) e Lucas (19 anos) – decidem comprar um videogame usado no valor de R$ 3.000,00. Rafael quer pagar à vista com sua mesada. Gabriela quer parcelar no cartão de crédito da tia, mas sem a tia presente. Lucas quer assinar um contrato de compra e venda diretamente com o vendedor. O vendedor, desconfiado, pergunta a um advogado quem pode validamente realizar o negócio sozinho.\n\n**Questão:** Com base no Código Civil, assinale a alternativa correta:",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 3º ao 5º do Código Civil",
      respostaEsperadaId: "opt_17_C"
    },
    opcoes: [
      { id: "opt_17_A", texto: "A) Rafael pode comprar sozinho, pois tem 15 anos e já trabalha." },
      { id: "opt_17_B", texto: "B) Gabriela pode parcelar sozinha sem a tia, pois é relativamente capaz e pode praticar atos da vida civil." },
      { id: "opt_17_C", texto: "C) Lucas pode assinar o contrato sozinho, pois já tem 18 anos e plena capacidade civil." },
      { id: "opt_17_D", texto: "D) Rafael e Gabriela podem comprar juntos, pois a soma das idades dá 32 anos." }
    ]
  },
  {
    id: "0.18",
    fase: 0,
    bloco: "D",
    titulo: "Contrato de Aprendiz e Capacidade",
    tipo: "Misto",
    focoTecnico: "Assistência ao Relativamente Incapaz",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Maria",
      cbo: "Jovem Aprendiz (5191-10)",
      salarioBase: 1200.00,
      dataAdmissao: "01/01/2026",
      dataFato: "01/03/2026",
      jornada: "30h/semana"
    },
    queixa: "**Contexto:** Maria, 16 anos, é contratada pelo supermercado “Bom Preço” como jovem aprendiz. O RH entrega o contrato e ela assina sozinha, sem a presença dos pais. Dois meses depois, a empresa a dispensa sem justa causa. Maria quer cobrar o aviso-prévio e as verbas rescisórias, mas o departamento pessoal alega que o contrato é nulo porque ela assinou sem assistência, e por isso não deve nada. O sindicato intervém.\n\n**Questão:** Qual é a situação jurídica desse contrato?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 4º, CC e Art. 402, CLT",
      respostaEsperadaId: "opt_18_C"
    },
    opcoes: [
      { id: "opt_18_A", texto: "A) O contrato é plenamente válido, pois Maria tem 16 anos e capacidade plena para contratar como aprendiz." },
      { id: "opt_18_B", texto: "B) O contrato é nulo de pleno direito, pois menor de 18 anos nunca pode assinar contrato." },
      { id: "opt_18_C", texto: "C) O contrato é anulável, pois Maria é relativamente incapaz e precisava da assistência dos pais – e isso pode afetar as verbas rescisórias, mas os direitos trabalhistas são devidos." },
      { id: "opt_18_D", texto: "D) O contrato é válido porque a CLT permite que menores de 16 trabalhem sem assistência." }
    ]
  },
  {
    id: "0.19",
    fase: 0,
    bloco: "D",
    titulo: "Registro e Personalidade Jurídica",
    tipo: "Explicativo",
    focoTecnico: "Aquisição da Personalidade Jurídica",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Ana, Bia e Carlos",
      cbo: "Vendedores",
      salarioBase: 0,
      dataAdmissao: "01/01/2026",
      dataFato: "10/05/2026",
      jornada: "44h/semana"
    },
    queixa: "**Contexto:** Ana, Bia e Carlos começam a vender roupas em uma loja alugada, mas não registram a empresa na Junta Comercial nem pedem CNPJ. Eles imprimem cartões com o nome “Moda Jovem” e fecham um contrato de fornecimento de tecidos com a “Tecidos Silva”, no nome da “Moda Jovem”. Não pagam a fatura. A “Tecidos Silva” processa “Moda Jovem”, mas o juiz extingue a ação because a empresa não existe juridicamente. O credor então cobra Ana, Bia e Carlos pessoalmente.\n\n**Questão:** Por que os três sócios respondem com seus bens pessoais?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 45 e 986 do Código Civil",
      respostaEsperadaId: "opt_19_A"
    },
    opcoes: [
      { id: "opt_19_A", texto: "A) Porque o Direito não reconhece pessoa jurídica sem registro – a “Moda Jovem” não tem personalidade jurídica, sendo mero nome fantasia, e os sócios são os titulares do negócio." },
      { id: "opt_19_B", texto: "B) Porque a Junta Comercial protege os sócios mesmo sem registro." },
      { id: "opt_19_C", texto: "C) Porque o CNPJ não é necessário para contratar, mas eles quiseram se responsabilizar." },
      { id: "opt_19_D", texto: "D) Porque a lei permite cobrar qualquer pessoa que assine um contrato." }
    ]
  },
  {
    id: "0.20",
    fase: 0,
    bloco: "E",
    titulo: "Direitos Fundamentais (Art. 5º)",
    tipo: "Explicativo",
    focoTecnico: "Hermenêutica Constitucional",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Município Fictício",
      cbo: "N/A",
      salarioBase: 0,
      dataAdmissao: "01/01/2025",
      dataFato: "01/01/2026",
      jornada: "N/A"
    },
    queixa: "**Contexto:** Em um município fictício, a Câmara Municipal aprova cinco leis em um mesmo pacote. O Ministério Público questiona todas no STF, mas apenas uma delas é considerada **CONSTITUCIONAL**. O juiz pergunta aos advogados: “Qual das seguintes leis pode ser mantida, pois está em harmonia com os direitos fundamentais?”\n\n**Leis:**\nI. Lei que proíbe críticas ao prefeito na internet, com multa de R$ 10 mil.\nII. Lei que autoriza a polícia a entrar em qualquer casa, sem mandado, para fiscalizar consumo de água.\nIII. Lei que obriga todo cidadão a se filiar a um partido político para votar.\nIV. Lei que exige banheiros acessíveis em prédios comerciais com mais de 100 m².\nV. Lei que confisca bens de quem não paga IPTU por dois anos.\n\n**Questão:** Com base no art. 5º da CF, qual delas é CONSTITUCIONAL?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 5º da CF/88",
      respostaEsperadaId: "opt_20_B"
    },
    opcoes: [
      { id: "opt_20_A", texto: "A) I – porque o prefeito precisa ser respeitado." },
      { id: "opt_20_B", texto: "B) IV – porque promove acessibilidade e dignidade, sem violar direito fundamental." },
      { id: "opt_20_C", texto: "C) II – porque o interesse público justifica a invasão." },
      { id: "opt_20_D", texto: "D) V – porque IPTU é obrigação legal." }
    ]
  },
  {
    id: "0.21",
    fase: 0,
    bloco: "E",
    titulo: "Intimidade e Poder Diretivo",
    tipo: "Explicativo",
    focoTecnico: "Revista Vexatória e Dano Moral",
    tempoLimiteMinutos: 5,
    xpRecompensa: 50,
    empregado: {
      nome: "Clarice",
      cbo: "Operador de Máquinas",
      salarioBase: 2800.00,
      dataAdmissao: "01/01/2024",
      dataFato: "15/02/2026",
      jornada: "44h/semana"
    },
    queixa: "**Contexto:** A fábrica “Nova Era” adotou uma política de segurança: todos os funcionários, ao saírem, devem abrir suas bolsas e mochilas em uma mesa, onde o segurança revira todos os pertences, expondo itens pessoais (absorventes, fotos íntimas, medicamentos) na frente dos colegas na fila. A funcionária Clarice, sentindo-se humilhada, processa a empresa pedindo indenização por danos morais. A empresa defende-se dizendo que tem o poder de fiscalizar para evitar furtos.\n\n**Questão:** A conduta da empresa é lícita?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 5º, X da CF/88",
      respostaEsperadaId: "opt_21_B"
    },
    opcoes: [
      { id: "opt_21_A", texto: "A) Sim, pois o empregador pode revistar qualquer objeto do empregado, inclusive expondo-o, para proteger o patrimônio." },
      { id: "opt_21_B", texto: "B) Não, pois a revista expositiva e vexatória viola a inviolabilidade da intimidade, honra e imagem (art. 5º, X), sendo passível de indenização." },
      { id: "opt_21_C", texto: "C) Sim, desde que a empresa avise com antecedência e o funcionário assine um termo de autorização." },
      { id: "opt_21_D", texto: "D) Não, pois qualquer tipo de revista, mesmo impessoal, é proibida no ambiente de trabalho." }
    ]
  },

  // --- FASE 1: ESTAGIÁRIO DE RH (26 challenges) ---
  // --- Bloco A: Erros clássicos (1.1 - 1.8) ---
  {
    id: "1.1",
    fase: 1,
    bloco: "A",
    titulo: "O Desconto Que Não Era Pra Estar Lá",
    tipo: "Erro",
    focoTecnico: "Falta Justificada com Atestado Válido",
    tempoLimiteMinutos: 6,
    xpRecompensa: 35,
    empregado: {
      nome: "Ricardo Souza",
      cbo: "Almoxarife (4141-05)",
      salarioBase: 2117.91,
      dataAdmissao: "10/03/2024",
      dataFato: "15/05/2026",
      jornada: "44h/semana",
      detalhesAtestado: {
        medico: "Dr. Roberto Alencar",
        crm: "18945-SP",
        emissao: "15/05/2026",
        cid: "M54.5 (Lombalgia)",
        diasAfastados: 1
      }
    },
    queixa: "Fui ao consultório justificando dor lombar. Entreguei o atestado certinho com 1 dia de afastamento na Secretaria de Pessoal no dia seguinte. Porém, no meu holerite descontaram R$ 70,60 como falta injustificada e mais R$ 70,60 de DSR! Vocês podem me ajudar?",
    gabarito: {
      tipoAcao: "Abonar Falta",
      artigoLegal: "Artigo 6º, §1º, 'f' da Lei nº 605/1949 e Súmula 15/TST - O atestado médico legal justifica a ausência e blinda o DSR.",
      valoresCorretos: {
        outroDesconto: 141.20,
        justificativa: "Abono integral da falta e reaspiração do DSR descontado incorretamente. Atestado médico válido extingue a possibilidade de desconto."
      },
      respostaEsperadaId: "opt_11_01"
    },
    opcoes: [
      { id: "opt_11_01", texto: "Retificar a folha: Estornar os descontos de Falta e DSR, pois o atestado médico anexado é plenamente válido." },
      { id: "opt_11_02", texto: "Manter descontos: O atestado continha CID, o que invalida automaticamente em conformidade com as diretivas de privacidade." },
      { id: "opt_11_03", texto: "Proceder com demissão: Apresentar queixa ou descontar em dobro por infração das obrigações sindicais." }
    ]
  },
  {
    id: "1.2",
    fase: 1,
    bloco: "A",
    titulo: "Sumiu Minha Hora Extra",
    tipo: "Explicativo",
    focoTecnico: "Apurador de Holerite",
    tempoLimiteMinutos: 5,
    xpRecompensa: 30,
    empregado: {
      nome: "Julia Andrade",
      cbo: "Recepcionista (4110-35)",
      salarioBase: 1650.00,
      dataAdmissao: "22/02/2025",
      dataFato: "10/05/2026",
      jornada: "40h/semana"
    },
    queixa: "Oi, examinei meu holerite deste mês. Fiz 5 horas extras e achava que não haviam pago, pois não achei o título 'Horas Extras 50%'. Tem uma linha chamada 'Reflexo de Horas Extras e DSR', e estou com medo de ter sido prejudicada.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 7º Lei 605/49. O reflexo do DSR é calculado separadamente. Verifique que a verba das horas extras principais está listada na rubrica 'H.E. Diurnas 50%' código 104.",
      respostaEsperadaId: "opt_12_01"
    },
    opcoes: [
      { id: "opt_12_01", texto: "Orientar o funcionário a ver no holerite e localizar a rubrica principal de HE 50% (código 104), explicando que o DSR é apenas o reflexo sobre os descansos remunerados." },
      { id: "opt_12_02", texto: "Proceder com alteração imediata: admitir erro de lançamento e reembolsar em dobro para evitar processo trabalhista." },
      { id: "opt_12_03", texto: "Informar que a jornada flutuante absorve as horas extras em regime de compensação compulsória de banco de horas semanal." }
    ]
  },
  {
    id: "1.3",
    fase: 1,
    bloco: "A",
    titulo: "Meu Vale-Transporte Está Errado",
    tipo: "Erro",
    focoTecnico: "Desconto Limite VT",
    tempoLimiteMinutos: 5,
    xpRecompensa: 35,
    empregado: {
      nome: "Marcos Pinheiro",
      cbo: "Auxiliar de Almoxarifado (4141-05)",
      salarioBase: 1800.00,
      dataAdmissao: "11/04/2025",
      dataFato: "10/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Prezada equipe do portal, recolhi meus contracheques este mês e vi que descontaram R$ 144,00 a título de Vale-Transporte. Mas meu salário é R$ 1.800,00! Isso dá 8% do meu salário! Estão me cobrando a mais, né?",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Artigo 4º, parágrafo único da Lei nº 7.418/1985 - O empregador deduzirá no máximo 6% do salário base do beneficiário.",
      valoresCorretos: {
        outroDesconto: 36.00,
        justificativa: "Reembolso e correção do VT de R$ 144,00 para o limite legal de R$ 108,00 (6% max). O excedente de R$ 36.00 deve ser estornado."
      },
      respostaEsperadaId: "opt_13_02"
    },
    opcoes: [
      { id: "opt_13_01", texto: "Dizer que o vale transporte passou por aumento integral devido à taxa do sistema regional de ônibus, ultrapassando os limites previstos." },
      { id: "opt_13_02", texto: "Retificar o desconto para R$ 108,00 (Exatidão dos 6% legais limites) e proceder com a restituição dos R$ 36,00 lançados erroneamente." },
      { id: "opt_13_03", texto: "Abonar o auxílio na íntegra para diminuir a carga tributária do trabalhador por meio de bonificação interna." }
    ]
  },
  {
    id: "1.4",
    fase: 1,
    bloco: "A",
    titulo: "Folga Trocada Sem Papelada",
    tipo: "Misto",
    focoTecnico: "Compensação de Folgas",
    tempoLimiteMinutos: 6,
    xpRecompensa: 40,
    empregado: {
      nome: "Rodrigo Santos",
      cbo: "Auxiliar de Limpeza",
      salarioBase: 1580.00,
      dataAdmissao: "20/01/2026",
      dataFato: "12/04/2026",
      jornada: "44h/semana"
    },
    queixa: "Eu combinei ‘de boca’ com meu supervisor imediato de vir trabalhar no meu domingo de escala e tirar a folga na terça-feira seguinte. Mas o RH lançou falta injustificada no domingo! Falei com meu chefe e ele mandou resolver com vocês.",
    gabarito: {
      tipoAcao: "Abonar Falta",
      artigoLegal: "Art. 59 §6º CLT. A permuta de folgas sem formalização ou registro escrito no espelho de ponto invalida o abono. Porém, verificado o e-mail de anuência do supervisor, deve-se retificar para compensação válida de escala.",
      respostaEsperadaId: "opt_14_03"
    },
    opcoes: [
      { id: "opt_14_01", texto: "Punir o funcionário por fazer arranjos sem avisar formalmente aos canais do e-Social, retendo o desconto." },
      { id: "opt_14_02", texto: "Ignorar o pedido por falta de acordo coletivo sindical da categoria profissional." },
      { id: "opt_14_03", texto: "Requerer ao supervisor a assinatura urgente do formulário de justificativa ou compensação interna, estornando temporariamente o desconto indevido de falta." }
    ]
  },
  {
    id: "1.5",
    fase: 1,
    bloco: "A",
    titulo: "Salário-Família Que Não Caiu",
    tipo: "Erro",
    focoTecnico: "Acesso ao Benefício Legal",
    tempoLimiteMinutos: 5,
    xpRecompensa: 35,
    empregado: {
      nome: "Lúcia Albuquerque",
      cbo: "Arquivista de Escritório (4110-45)",
      salarioBase: 1710.00,
      dataAdmissao: "15/01/2026",
      dataFato: "25/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Eu tenho 2 filhos de 4 e 6 anos, entreguei as certidões de nascimento no momento de contratação. O meu salário base é de R$ 1.710,00, mas nunca recebi a cota do Salário-Família. Meu dinheiro está curto e preciso desse apoio.",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Artigo 65 da Lei nº 8.213/1991 - O salário-família é devido ao segurado com renda mensal inferior ao teto previdenciário (limite atual aproximado de R$ 1.800,00).",
      valoresCorretos: {
        outroDesconto: -124.40, // Aditivo
        justificativa: "Lançamento retroativo e inclusão das cotas correntes de Salário Família no valor fixado pela Previdência federal."
      },
      respostaEsperadaId: "opt_15_01"
    },
    opcoes: [
      { id: "opt_15_01", texto: "Verificar documentação entregue e retificar a folha de pagamentos imediatamente para lançar as 2 cotas vigentes do benefício governamental." },
      { id: "opt_15_02", texto: "Explicar que o salário excede o teto previdenciário, retirando-lhe legalmente o direito às cotas públicas." },
      { id: "opt_15_03", texto: "Injetar apenas um vale-alimentação avulso de emergência sem registro contábil de encargos fiscais." }
    ]
  },
  {
    id: "1.6",
    fase: 1,
    bloco: "A",
    titulo: "Desconto de Uniforme no Holerite",
    tipo: "Misto",
    focoTecnico: "Gratuidade do EPI",
    tempoLimiteMinutos: 5,
    xpRecompensa: 35,
    empregado: {
      nome: "Gabriel Mendes",
      cbo: "Mecanico de Manutenção",
      salarioBase: 2400.00,
      dataAdmissao: "05/01/2026",
      dataFato: "01/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Olá. Comecei este mês como mecânico, me deram bota de aço, óculos e macacão da empresa. Mas no meu holerite descontaram R$ 150,00 sob o código 'Segurança e Uniforme'. Isso está certo?",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Artigo 166 da CLT e NR 6 da Portaria 3.214/1978 - O fornecimento de Equipamentos de Proteção Individual (EPI) por parte da organização deve ser totalmente isento de custos e taxas para o colaborador.",
      valoresCorretos: {
        outroDesconto: 150.00,
        justificativa: "Estorno do desconto ilegal de R$ 150,00 sobre fardamento e macacão técnico profissional."
      },
      respostaEsperadaId: "opt_16_02"
    },
    opcoes: [
      { id: "opt_16_01", texto: "Manter o desconto pois o profissional é proprietário perpétuo daquela fiação têxtil sob termo de entrega." },
      { id: "opt_16_02", texto: "Proceder à retificação total da folha com estorno integral dos R$ 150,00 devido à natureza de gratuidade dos EPIs garantida pela Norma Regulamentadora." },
      { id: "opt_16_03", texto: "Aplicar desconto parcelado em 3x na folha subsequente de modo a diluir o impacto salarial." }
    ]
  },
  {
    id: "1.7",
    fase: 1,
    bloco: "A",
    titulo: "Atraso de 10 Minutos, Desconto de 1 Hora",
    tipo: "Erro",
    focoTecnico: "Proporcionalidade de Cobrança",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Roberto Silva",
      cbo: "Almoxarife",
      salarioBase: 2117.91,
      dataAdmissao: "06/07/2025",
      dataFato: "22/04/2026",
      jornada: "44h/semana"
    },
    queixa: "Olá! No dia 10 de abril cheguei às 08:30 em vez de 08:20 (exclui o limite de tolerância do dia por 10 minutos de variação). Porém, meu holerite mostra um desconto de 1 hora cheia do meu salário, mais o DSR! Justo?",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Precedente CLT e Jurisprudência. O desconto por impontualidade deve ser estritamente proporcional aos minutos reais de atraso apurados. Lançar 1 hora cheia gera enriquecimento sem causa do empregador.",
      valoresCorretos: {
        outroDesconto: 48.00,
        justificativa: "Ajuste do desconto de atraso para apenas os 10 minutos legítimos de mora, em vez do confisco de 1 hora de serviço e repouso."
      },
      respostaEsperadaId: "opt_17_03"
    },
    opcoes: [
      { id: "opt_17_01", texto: "Ignorar a queixa sob alegação de punição por reincidência impontual coletiva." },
      { id: "opt_17_02", texto: "Manter a hora inteira cobrada para fins de penalização disciplinar e correção pedagógica de comportamento laborativo." },
      { id: "opt_17_03", texto: "Retificar o evento de lançamento, deduzindo exclusivamente a fração de 10 minutos exatos de atraso no holerite do funcionário e estornando o DSR integral." }
    ]
  },
  {
    id: "1.8",
    bloco: "A",
    fase: 1,
    titulo: "Domingo Trabalhado Pagaram Normal",
    tipo: "Erro",
    focoTecnico: "Acréscimo de DSR",
    tempoLimiteMinutos: 6,
    xpRecompensa: 35,
    empregado: {
      nome: "Carlos Silva",
      cbo: "Manobrista",
      salarioBase: 1750.00,
      dataAdmissao: "14/05/2025",
      dataFato: "01/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Olá, sou o Carlos Manobrista. Trabalhei 8 horas no domingo retrasado e não me deram folga compensatória nenhuma na semana. No meu pagamento, pagaram as horas comuns normais, sem nenhum acréscimo legal. É verdade que aos domingos vale o dobro?",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Artigo 9º da Lei nº 605/1949 e Súmula 146 do TST - O labor prestado em domingos/feriados sem compensação deve ser remunerado em dobro (100%).",
      valoresCorretos: {
        outroDesconto: -127.20,
        justificativa: "Crédito integral do adicional de 100% pelas horas laboradas em dia de repouso semanal obrigatório sem compensação subsequente."
      },
      respostaEsperadaId: "opt_18_01"
    },
    opcoes: [
      { id: "opt_18_01", texto: "Calcular o valor devido (8 horas com acréscimo de 100%) e retificar a folha de pagamentos incluindo o crédito de HE Domingos 100%." },
      { id: "opt_18_02", texto: "Informar ao trabalhador estrangeiro ou de escala móvel que o domingo é compensado tacitamente por banco de horas de validade quadrimestral." },
      { id: "opt_18_03", texto: "Proceder à demissão indireta por via de acordos negociados de forma desvantajosa para as partes." }
    ]
  },

  // --- Bloco B: Adicionais, Banco de horas, etc. (1.9 - 1.15) ---
  {
    id: "1.9",
    fase: 1,
    bloco: "B",
    titulo: "O Adicional Noturno Que Virou Pó",
    tipo: "Erro",
    focoTecnico: "Cálculo da Hora Ficta Noturna",
    tempoLimiteMinutos: 7,
    xpRecompensa: 40,
    empregado: {
      nome: "Renata Neves",
      cbo: "Vigilante Patrimonial (5173-30)",
      salarioBase: 2200.00,
      dataAdmissao: "01/02/2025",
      dataFato: "20/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Olá, trabalho na ronda noturna das 22h às 05h da manhã. O RH computou minhas horas extras e adicionais como 7 horas normais diárias comuns, ignorando os minutos reduzidos. Sinto que estou perdendo dinheiro.",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Artigo 73, §1º da CLT - A hora noturna (das 22h às 05h) é computada como sendo de 52 minutos e 30 segundos (hora ficta), equivalendo a 1,14285 horas por período corrido, com 20% de adicional.",
      respostaEsperadaId: "opt_19_01"
    },
    opcoes: [
      { id: "opt_19_01", texto: "Retificar para computar a hora ficta reduzida (8 horas computadas para 7 horas físicas de relógio) e indenizar os 20% corretos sobre a integralidade do adicional de base legal." },
      { id: "opt_19_02", texto: "Dizer que a escala é flutuante e por isso não engloba amortizações de horas noturnas fictas nas regiões urbanas." },
      { id: "opt_19_03", texto: "Promover mudança contratual unilateral convertendo a vigilância em jornada mista de carga diurna exclusiva." }
    ]
  },
  {
    id: "1.10",
    fase: 1,
    bloco: "B",
    titulo: "Banco de Horas Sem Acordo",
    tipo: "Erro",
    focoTecnico: "Legalidade do Banco de Horas",
    tempoLimiteMinutos: 6,
    xpRecompensa: 45,
    empregado: {
      nome: "Filipe Augusto",
      cbo: "Operador de Caixa (4211-25)",
      salarioBase: 1690.00,
      dataAdmissao: "10/05/2025",
      dataFato: "10/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Fiz 12 horas extras esse mês alegando que ‘foi para o banco de horas’. Mas eu nunca assinei nenhum contrato concordando com isso e nossa loja não tem acordo com o sindicato sobre banco de horas. Eu exijo receber o pagamento!",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Artigo 59, §2º da CLT - O banco de horas exige acordo individual escrito ou acordo coletivo de trabalho. Na ausência deste instrumento formalizador, resta ilegal o regime de compensação acumulativa.",
      valoresCorretos: {
        outroDesconto: -345.00,
        justificativa: "Pagamento total das 12 horas extraordinárias com o acréscimo legal de 50%, extinguindo o saldo do banco de horas fictício."
      },
      respostaEsperadaId: "opt_110_02"
    },
    opcoes: [
      { id: "opt_110_01", texto: "Manter o banco de horas sob escusa de uso de aplicativo próprio interno sem amparo legal assinado." },
      { id: "opt_110_02", texto: "Providenciar o cálculo e pagamento imediato das 12 horas extraordinárias na folha como H.E. 50% diante de inexistência de base de acordo escrito legítimo." },
      { id: "opt_110_03", texto: "Admitir compensação folgada futura unilateral ao arbítrio da coordenação da filial sem reembolso." }
    ]
  },
  {
    id: "1.11",
    fase: 1,
    bloco: "B",
    titulo: "Férias Vencidas em Dobro",
    tipo: "Erro",
    focoTecnico: "Artigo 137 CLT",
    tempoLimiteMinutos: 6,
    xpRecompensa: 50,
    empregado: {
      nome: "Amanda Cruz",
      cbo: "Auxiliar Administrativo (4110-05)",
      salarioBase: 1950.00,
      dataAdmissao: "15/05/2024",
      dataFato: "25/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Minhas férias completaram 2 anos vencidas sem que a empresa me deixasse tirar os 30 dias de repouso anual. Agora marquei para o mês que vem. Mas no meu recibo de férias não colocaram nenhum pagamento adicional além do período normal. Meu colega disse que tenho direito à dobra.",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Artigo 137 da CLT e Súmula 450 do TST - Transcorrido o período concessivo (12 meses após o período aquisitivo) sem fruição das férias pelo colaborador, o empregador deve efetuar o pagamento do valor correspondente em dobro.",
      valoresCorretos: {
        outroDesconto: -2600.00,
        justificativa: "Lançamento da dobra das férias vencidas e não concedidas tempestivamente perlo setor de operações."
      },
      respostaEsperadaId: "opt_111_01"
    },
    opcoes: [
      { id: "opt_111_01", texto: "Retificar o recibo de férias para incluir a quitação obrigatória da Dobra de Férias com o adicional de 1/3 correspondente em face da preclusão do período concessivo." },
      { id: "opt_111_02", texto: "Informar que a quitação em dobro só é devida caso haja demissão judicial por rescisão amigável." },
      { id: "opt_111_03", texto: "Substituir o direito pecuniário por mais 15 dias de folgas móveis em datas de menor demanda corporativa." }
    ]
  },
  {
    id: "1.12",
    fase: 1,
    bloco: "B",
    titulo: "A Equiparação Salarial Escondida",
    tipo: "Misto",
    focoTecnico: "Aderência ao Art. 461 CLT",
    tempoLimiteMinutos: 7,
    xpRecompensa: 45,
    empregado: {
      nome: "Juliano Costa",
      cbo: "Expedidor (4141-10)",
      salarioBase: 1980.00,
      dataAdmissao: "10/02/2025",
      dataFato: "15/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Trabalho lado a lado com o Ricardo na Global Logística, fazemos as MESMAS tarefas de recebimento e triagem, no mesmo departamento e com a mesma produtividade. Eu recebo R$ 1.980,00 e ele recebe R$ 2.117,91 há meses. Por que essa discrepância se nossos cargos são idênticos na prática?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 461 da CLT - Identidade de funções, prestação de serviço ao mesmo empregador, na mesma localidade, mesma perfeição técnica e diferença de tempo de contratação inferior a 2 anos autoriza a equiparação salarial. Recomenda-se reenquadramento.",
      respostaEsperadaId: "opt_112_02"
    },
    opcoes: [
      { id: "opt_112_01", texto: "Explicar que o Ricardo possui maior senioridade emocional e contatos internos por indicação direta." },
      { id: "opt_112_02", texto: "Abraçar o caso como indício forte de irregularidade: Notificar a gerência de Gente & Gestão sobre a necessidade de correção salarial por via de equiparação para neutralizar robustos passivos judiciais trabalhistas." },
      { id: "opt_112_03", texto: "Orientar o Juliano a pedir transferência lateral de cargo para dirimir o inconformismo funcional." }
    ]
  },
  {
    id: "1.13",
    fase: 1,
    bloco: "B",
    titulo: "Minha Hora Extra Tá Errada Pelo Sábado",
    tipo: "Explicativo",
    focoTecnico: "Preconceito de Escala de 44h",
    tempoLimiteMinutos: 5,
    xpRecompensa: 30,
    empregado: {
      nome: "Renato Gonçalves",
      cbo: "Auxiliar Administrativo",
      salarioBase: 1900.00,
      dataAdmissao: "10/01/2025",
      dataFato: "20/04/2026",
      jornada: "40h/semana"
    },
    queixa: "Eu trabalho de segunda a sexta, totalizando 40h de labor efetivo. O RH usou o divisor de 220 para estimar minhas horas extraordinárias ao meio do mês, mas eu não trabalho no sábado! Não deveriam usar o divisor 200?",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Súmula 431 do TST. Para o empregado sujeito à jornada de trabalho de 40 horas semanais, o divisor para o cálculo das horas extras é 200. Utilizar 220 incorre em passivo trabalhista.",
      respostaEsperadaId: "opt_113_02"
    },
    opcoes: [
      { id: "opt_113_01", texto: "Rejeitar a reclamação do colaborador, alegando didaticamente que o divisor geral de 220 é soberano e irrestrito para qualquer trabalhador com sábado dispensado ou compensado." },
      { id: "opt_113_02", texto: "Acatar a reclamação e retificar o divisor do colaborador no sistema para 200, recalculando as horas extras de forma legalmente correta e evitando passivos trabalhistas." },
      { id: "opt_113_03", texto: "Indicar que o sábado é deduzido administrativamente por via de férias proporcionais anuais automáticas, mantendo o cálculo atual sem retificação direta." }
    ]
  },
  {
    id: "1.14",
    fase: 1,
    bloco: "B",
    titulo: "Intervalo Intrajornada Não Gozado",
    tipo: "Erro",
    focoTecnico: "Natureza Indenizatória do Intervalo",
    tempoLimiteMinutos: 6,
    xpRecompensa: 40,
    empregado: {
      nome: "Bruno Santos",
      cbo: "Auxiliar de Triagem",
      salarioBase: 1670.00,
      dataAdmissao: "03/10/2024",
      dataFato: "05/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Durante duas semanas consecutivas deste mês, devido ao acúmulo de caixas de remessa, meu coordenador me pediu para tirar apenas 20 minutos de almoço em vez do meu intervalo regular de 1 hora. Não vi nenhuma compensação financeira ou estorno disso na minha folha.",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Art. 71, §4º da CLT alterado pela Reforma Trabalhista. A não concessão total ou parcial do intervalo intrajornada mínimo para repouso e alimentação implica no pagamento obrigatório, com natureza indenizatória, do período suprimido com acréscimo de 50%.",
      respostaEsperadaId: "opt_114_03"
    },
    opcoes: [
      { id: "opt_114_01", texto: "Negar reembolso pois o funcionário consentiu em realizar o lanche no posto de triagem das remessas." },
      { id: "opt_114_02", texto: "Informar que refeições fracionadas dão margem à folga integral combinada na semana subsequente de controle." },
      { id: "opt_114_03", texto: "Retificar a folha do trabalhador computando as horas de intervalo suprimidas (fração diária) como indenização intrajornada com o respectivo adicional de 50% legal." }
    ]
  },
  {
    id: "1.15",
    fase: 1,
    bloco: "B",
    titulo: "Pedido de Demissão ao Contrato de Experiência",
    tipo: "Cálculo",
    focoTecnico: "Verbas Decisórias Prévias",
    tempoLimiteMinutos: 7,
    xpRecompensa: 45,
    empregado: {
      nome: "Renan Alves",
      cbo: "Promotor de Vendas",
      salarioBase: 1720.00,
      dataAdmissao: "01/04/2026",
      dataFato: "15/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Olá. Fui admitido em regime de contrato de experiência de 90 dias. Mas decidi pedir demissão ontem, ao completarem exatos 45 dias trabalhados. Qual o tratamento das minhas verbas rescisórias e se há penalização legal?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigos 479 e 480 da CLT. No encerramento antecipado do contrato de prazo determinado por iniciativa do empregado, este indenizará o empregador dos prejuízos causados, limitada a indenização à metade daquela devida se a rescisão partisse da empresa.",
      respostaEsperadaId: "opt_115_01"
    },
    opcoes: [
      { id: "opt_115_01", texto: "Explicar que o colaborador fará jus ao saldo de salário, 13º proporcional e férias com 1/3, sofrendo desconto correspondente indenizatório limitado a 50% dos dias residuais do contrato (Art. 480 CLT)." },
      { id: "opt_115_02", texto: "Expor que o pedido de demissão em contrato de experiência confisca integralmente o saldo de salário do período de labor." },
      { id: "opt_115_03", texto: "Convir em converter a pedido em demissão consensual com quitação de aviso indenizado integral de 30 dias de bônus." }
    ]
  },

  // --- Bloco C: Atestados Válidos (1.16 - 1.21) ---
  // *Nota: A partir daqui, a ferramenta de Pesquisa de CRM está liberada!*
  {
    id: "1.16",
    fase: 1,
    bloco: "C",
    titulo: "Atestado Sem CID — O Dilema Ético",
    tipo: "Explicativo",
    focoTecnico: "Atestado Válido Sem Código de Doença",
    tempoLimiteMinutos: 6,
    xpRecompensa: 40,
    empregado: {
      nome: "Leticia Ferreira",
      cbo: "Digitadora (4121-10)",
      salarioBase: 1820.00,
      dataAdmissao: "14/08/2024",
      dataFato: "10/05/2026",
      jornada: "40h/semana",
      detalhesAtestado: {
        medico: "Dra. Patricia Medeiros",
        crm: "30514-SP",
        emissao: "10/05/2026",
        cid: "[NÃO INFORMADO - DIREITO DE PRIVACIDADE]",
        diasAfastados: 2,
        legendaCID: "CID omitido conforme Resolução CFM 1.658/2002."
      }
    },
    queixa: "Tive uma consulta de ginecologia por queixas de mialgia severa. No meu atestado oficial da clínica, a médica não escreveu o código CID por privacidade médica minha, seguindo regras éticas. O setor de DP avisou que se eu não entregar com CID, as minhas duas faltas serão descontadas. Estão certos?",
    gabarito: {
      tipoAcao: "Abonar Falta",
      artigoLegal: "Sumula 340 e Resolução CFM nº 1.621/2001 e 1.658/2002 - A indicação de CID no atestado médico depende de prévia e explícita concordância ou solicitação do próprio paciente, razão pela qual sua omissão NÃO gera invalidação do documento.",
      respostaEsperadaId: "opt_116_01"
    },
    opcoes: [
      { id: "opt_116_01", texto: "Abonar as ausências e validar o atestado médico. Explicar ao DP que o CID não é requisito obrigatório de validade legal." },
      { id: "opt_116_02", texto: "Recusar o documento até que o trabalhador providencie declaração adicional que explicite a CID infecciosa de base." },
      { id: "opt_116_03", texto: "Negar o abono, lançando faltas injustificadas para conter flutuações de assiduidade na fábrica." }
    ]
  },
  {
    id: "1.17",
    fase: 1,
    bloco: "C",
    titulo: "Atestado de Dentista (CRO) Isenta?",
    tipo: "Misto",
    focoTecnico: "Validade do Atestado Odontológico",
    tempoLimiteMinutos: 5,
    xpRecompensa: 35,
    empregado: {
      nome: "Arthur Lima",
      cbo: "Digitador",
      salarioBase: 1820.00,
      dataAdmissao: "10/11/2025",
      dataFato: "04/05/2026",
      jornada: "40h/semana",
      detalhesAtestado: {
        medico: "Dr. Roberto de Souza (Cirurgião-Dentista)",
        crm: "CRO 22441-SP",
        emissao: "04/05/2026",
        cid: "K01.1 (Dente Impactado)",
        diasAfastados: 1
      }
    },
    queixa: "Precisei extrair o dente do siso com urgência na segunda-feira. O cirurgião-dentista assinou meu atestado de 1 dia com o carimbo do CRO dele. No DP disseram que atestado de dentista só serve para abonar algumas horas, e não o dia inteiro. Isso procede?",
    gabarito: {
      tipoAcao: "Abonar Falta",
      artigoLegal: "Artigo 6º, I, 'f' da Lei nº 5.081/1966 e Lei nº 605/1949, Artigo 6º, §2º - Profissionais de Odontologia devidamente habilitados têm total prerrogativa de emitir atestados de afastamento para fins trabalhistas ordinários.",
      respostaEsperadaId: "opt_117_02"
    },
    opcoes: [
      { id: "opt_117_01", texto: "Limitar o abono de faltas para apenas 2 horas do procedimento real, retendo em débito o restante da jornada diária." },
      { id: "opt_117_02", texto: "Abonar integralmente a falta apurada. O atestado emitido por cirurgião-dentista com respectivo CRO é legalmente robusto e isenta a ausência do dia." },
      { id: "opt_117_03", texto: "Invalidar o documento indicando que somente atestados emitidos na rede pública de medicina têm validade de 24 horas." }
    ]
  },
  {
    id: "1.18",
    fase: 1,
    bloco: "C",
    titulo: "Atestado de Acompanhamento de Filho",
    tipo: "Misto",
    focoTecnico: "Abono para Acompanhantes de Dependentes",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Fernanda Costa",
      cbo: "Auxiliar Administrativo (4110-05)",
      salarioBase: 2034.54,
      dataAdmissao: "10/01/2025",
      dataFato: "14/05/2026",
      jornada: "40h/semana"
    },
    queixa: "Minha filha de 3 anos teve febre alta e vômito ontem. Tive que levá-la ao pronto-socorro infantil correndo e passei o dia lá de acompanhante. Peguei a certidão de acompanhamento firmada pelo pediatra. O RH recusou abonar dizendo que a lei só cobre doença do próprio trabalhador.",
    gabarito: {
      tipoAcao: "Abonar Falta",
      artigoLegal: "Artigo 473, XI da CLT (Incluído pelo Marco Legal da Primeira Infância) - O trabalhador poderá deixar de comparecer ao serviço por 1 dia por ano para acompanhar filho de até 6 anos em consulta médica, ou conforme acordo coletivo da categoria.",
      respostaEsperadaId: "opt_118_03"
    },
    opcoes: [
      { id: "opt_118_01", texto: "Descontar as horas por falta de autorização de amparo legal irrestrito para enfermidades secundárias." },
      { id: "opt_118_02", texto: "Explicar que acompanhamento médico de dependentes não possui amparo nem amarra na CLT." },
      { id: "opt_118_03", texto: "Validar e abonar a data, explicando à colaboradora que o art. 473, XI garante o direito por 1 dia anual, e verificar se a convenção sindical local do setor de logística expande essa cobertura para mais dias." }
    ]
  },
  {
    id: "1.19",
    fase: 1,
    bloco: "C",
    titulo: "Múltiplos Atestados, Mesmo Médico, Mesmo CID",
    tipo: "Misto",
    focoTecnico: "Soma de Atestados e Encaminhamento ao INSS",
    tempoLimiteMinutos: 7,
    xpRecompensa: 45,
    empregado: {
      nome: "Vitor Hugo",
      cbo: "Auxiliar de Triagem",
      salarioBase: 1670.00,
      dataAdmissao: "20/03/2025",
      dataFato: "22/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Apresentei 3 atestados de 5 dias cada um, sequenciais sob o mesmo motivo de dor nas costas. No DP me alertaram de que este último atestado não será quitado pela Global Logística e serei encaminhado para perícia médica oficial do governo federal. Isso é correto?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Decreto nº 3.048/1999 e Lei nº 8.213/1991, Art. 60 - Quando o período de afastamento pela mesma moléstia (ou CID correlato) superar 15 dias, acumulados no intervalo de 60 dias, o empregador paga os primeiros 15 dias, cessando sua responsabilidade que se transfere ao INSS via auxílio por incapacidade temporária.",
      respostaEsperadaId: "opt_119_01"
    },
    opcoes: [
      { id: "opt_119_01", texto: "Explicar didaticamente que os primeiros 15 dias de exclusão são arcados pela empresa, e a partir do 16º dia do histórico correlato de saúde, o funcionário passa a receber auxílio oficial do INSS mediante perícia governamental." },
      { id: "opt_119_02", texto: "Cortar integralmente os vales e o salário do mês por via preventiva de abandono parcial de posto de trabalho." },
      { id: "opt_119_03", texto: "Ignorar a contagem, forçando o trabalhador a assinar compensações manuais intrajornada." }
    ]
  },
  {
    id: "1.20",
    fase: 1,
    bloco: "C",
    titulo: "Licença Nojo — Falecimento de Pai",
    tipo: "Erro",
    focoTecnico: "Cumprimento do Artigo 473 CLT",
    tempoLimiteMinutos: 4,
    xpRecompensa: 35,
    empregado: {
      nome: "Marisa Fernandes",
      cbo: "Recepcionista (4110-35)",
      salarioBase: 1650.00,
      dataAdmissao: "10/01/2025",
      dataFato: "10/04/2026",
      jornada: "40h/semana",
      certidaoObito: {
        falecido: "José Fernandes Santos",
        parentesco: "Pai (Ascendente)",
        dataObito: "08/04/2026",
        dataRegistro: "09/04/2026",
        cartorio: "Ofício de Registro Civil de Pessoas Naturais - Subdistrito Centro",
        declaracaoObitoNumero: "1029415-SP"
      }
    },
    queixa: "Infelizmente meu pai faleceu há duas semanas. Me ausentei por 2 dias seguidos para o sepultamento e apoio familiar. Anexei a certidão de óbito. O setor de DP me descontou esses 2 dias alegando que eu devia ter solicitado folga de compensação prévia. Quero retificação.",
    gabarito: {
      tipoAcao: "Abonar Falta",
      artigoLegal: "Artigo 473, I da CLT - O trabalhador poderá deixar de comparecer ao trabalho, sem prejuízos de salário, por até 2 dias consecutivos, em caso de falecimento de ascendente (pai, mãe, avós), cônjuge, descendente, irmão ou pessoa sob dependência econômica.",
      valoresCorretos: {
        outroDesconto: 110.00,
        justificativa: "Estorno do desconto ilegal correspondente a abonos estatutários de licença nojo por morte de ascendente imediato."
      },
      respostaEsperadaId: "opt_120_02"
    },
    opcoes: [
      { id: "opt_120_01", texto: "Explicar que falecimentos exigem acionamento de termo do acordo coletivo interno de compensação móvel de folgas." },
      { id: "opt_120_02", texto: "Proceder à retificação e estorno total dos descontos de faltas. O art. 473, I assegura ao funcionário o direito garantido de até 2 dias consecutivos isentos." },
      { id: "opt_120_03", texto: "Dizer que o licença gozada expurgou o vale-refeição dos finais de semana relativos à referida folga." }
    ]
  },
  {
    id: "1.21",
    fase: 1,
    bloco: "C",
    titulo: "Afastamento Menos de 15 Dias — Quem Paga?",
    tipo: "Explicativo",
    focoTecnico: "Obrigatoriedade do Empregador",
    tempoLimiteMinutos: 4,
    xpRecompensa: 30,
    empregado: {
      nome: "Ricardo Souza",
      cbo: "Auxiliar de Almoxarifado",
      salarioBase: 2117.91,
      dataAdmissao: "12/03/2024",
      dataFato: "10/05/2026",
      jornada: "44h/semana",
      detalhesAtestado: {
        medico: "Dr. André Valadares",
        crm: "20541-SP",
        emissao: "10/05/2026",
        cid: "K29.7 (Gastrite)",
        diasAfastados: 4
      }
    },
    queixa: "Peguei um atestado de 4 dias por gastrite crônica emitido pela UPA. O pessoal do almoxarifado disse que por ser mais de 3 dias, a empresa pode pedir que eu dê entrada direto no INSS para não pesar na contabilidade interna da nossa unidade logística. Isso está correto?",
    gabarito: {
      tipoAcao: "Abonar Falta",
      artigoLegal: "Decreto 3.048/99 e Lei 8.213/91. Os primeiros 15 dias consecutivos de licença por motivo de enfermidade e recomendação de saúde são arcados com remuneração total e integral por conta do empregador.",
      respostaEsperadaId: "opt_121_01"
    },
    opcoes: [
      { id: "opt_121_01", texto: "Explicar de forma robusta e cortês que os primeiros 15 dias de licença médica correntemente atestada do empregado são de responsabilidade fiscal direta do empregador, não cabendo qualquer acionamento previdenciário prévio." },
      { id: "opt_121_02", texto: "Orientar o funcionário a agendar exame no instituto nacional de seguro previdenciário antes que vençam os 5 dias de mora." },
      { id: "opt_121_03", texto: "Excluir o custeio das refeições de fretamento da planta operacional durante a licença médica." }
    ]
  },

  // --- Bloco D: Atestados Graves e Fraudes (1.22 - 1.26) ---
  // *ATENÇÃO: A ferramenta de Validade de CRM deve mostrar irregularidades sérias aqui!*
  {
    id: "1.22",
    fase: 1,
    bloco: "D",
    titulo: "Atestado com CRM Inexistente",
    tipo: "Justa Causa",
    focoTecnico: "Apresentação de Documento Falso",
    tempoLimiteMinutos: 8,
    xpRecompensa: 55,
    empregado: {
      nome: "Juliano Costa",
      cbo: "Expedidor (4141-10)",
      salarioBase: 1980.00,
      dataAdmissao: "14/05/2025",
      dataFato: "22/05/2026",
      jornada: "44h/semana",
      detalhesAtestado: {
        medico: "Dr. Mario de Oliveira",
        crm: "99999-SP", // IRREGULAR!
        emissao: "20/05/2026",
        cid: "J11 (Gripe Geral)",
        diasAfastados: 5
      }
    },
    queixa: "Pessoal, entreguei meu atestado de 5 dias assinado pelo médico particular que me atendeu em domicílio. Estou com medo de que queiram descontar pois o meu encarregado disse que achou estranha a assinatura. Está tudo ativo perante a lei e vocês têm o dever de aceitar.",
    gabarito: {
      tipoAcao: "Aplicar Justa Causa",
      artigoLegal: "Artigo 482, alínea 'a' da CLT (Improbidade) - A fabricação ou entrega voluntária de atestado médico portando CRM inexistente ou falso configura fraude documental grave para obtenção de vantagem indevida, autorizando a rescisão forçada por justa causa imediatamente.",
      respostaEsperadaId: "opt_122_01"
    },
    opcoes: [
      { id: "opt_122_01", texto: "Consultar a base de dados do CRM. Diante do feedback de CRM INEXISTENTE/FALSO, notificar a coordenação da empresa para a imediata aplicação de Demissão por Justa Causa (Art. 482, 'a')." },
      { id: "opt_122_02", texto: "Abonar normalmente a falta sob escusa de erro ortográfico do médico emissor." },
      { id: "opt_122_03", texto: "Descontar apenas o repouso semanal das faltas sem acionamento de queixa jurídica por segurança." }
    ]
  },
  {
    id: "1.23",
    fase: 1,
    bloco: "D",
    titulo: "CRM de Terceiro (Nome Não Confere)",
    tipo: "Justa Causa",
    focoTecnico: "Falsidade Ideológica de Atestado",
    tempoLimiteMinutos: 8,
    xpRecompensa: 55,
    empregado: {
      nome: "Vitor Hugo",
      cbo: "Auxiliar de Triagem (4151-05)",
      salarioBase: 1670.00,
      dataAdmissao: "20/03/2025",
      dataFato: "22/05/2026",
      jornada: "44h/semana",
      detalhesAtestado: {
        medico: "Dr. Ronaldo Mendes de Medeiros",
        crm: "12345-SP", // CRM pertence ao pediatra Dra. Maria Heloisa!
        emissao: "22/05/2026",
        cid: "H10 (Conjuntivite)",
        diasAfastados: 3
      }
    },
    queixa: "Olá. Deixei meu atestado de 3 dias de conjuntivite na recepção. O clínico me deu o termo de papel azul carimbado. Gostaria apenas de verificar se o abono correspondente já foi lançado nas minhas planilhas de pagamento.",
    gabarito: {
      tipoAcao: "Aplicar Justa Causa",
      artigoLegal: "Artigo 482, alínea 'a' da CLT e Artigo 304 do Código Penal Brasileiro (Uso de Documento Falso). O cruzamento do banco do CFM indica que o CRM carimbado pertence a outro profissional titular divergente, caracterizando falsidade.",
      respostaEsperadaId: "opt_123_01"
    },
    opcoes: [
      { id: "opt_123_01", texto: "Proceder à pesquisa do registro. Verificada a divergência crítica do titular do CRM, notificar o setor e assessorar a aplicação de Justa Causa imediata." },
      { id: "opt_123_02", texto: "Desprezar as diferenças nominais considerando que médicos cooperam em clínicas mutáveis de rede pública." },
      { id: "opt_123_03", texto: "Suspender o funcionário preventivamente de suas atividades laborativas por 60 dias sem pagamentos." }
    ]
  },
  {
    id: "1.24",
    fase: 1,
    bloco: "D",
    titulo: "O Atestado Rasurado — 1 Dia Virou 3",
    tipo: "Justa Causa",
    focoTecnico: "Adulteração de Documento Físico",
    tempoLimiteMinutos: 8,
    xpRecompensa: 50,
    empregado: {
      nome: "Gabriel Mendes",
      cbo: "Operador de Máquinas",
      salarioBase: 2400.00,
      dataAdmissao: "10/01/2026",
      dataFato: "15/05/2026",
      jornada: "44h/semana",
      detalhesAtestado: {
        medico: "Dr. Fabio Santoro",
        crm: "21544-SP",
        emissao: "15/05/2026",
        cid: "M54.4 (Lombociatalgia)",
        diasAfastados: 3 // A caneta preta está com rasura visível no '3' (original era 1)
      }
    },
    queixa: "Prezados, enviei por e-mail a digitalização do meu atestado médico indicando 3 dias de dispensa. O meu supervisor questionou se o papel original foi rasurado. Eu afirmo com convicção que o médico que reescreveu a caneta por cima e exijo meu abono total.",
    gabarito: {
      tipoAcao: "Aplicar Justa Causa",
      artigoLegal: "Artigo 482, 'a' da CLT - A adulteração grosseira ou intencional de atestados e termos de repouso por parte do empregado destrói categoricamente o elo de confiança mútua e boa-fé, ensejando a rescisão motivada imediata.",
      respostaEsperadaId: "opt_124_03"
    },
    opcoes: [
      { id: "opt_124_01", texto: "Reescrever o holerite abonando 1 dia útil apenas e aplicando punição moral informal." },
      { id: "opt_124_02", texto: "Aceitar a palavra do empregado sem realizar diligências com o hospital ou clínica emissora." },
      { id: "opt_124_03", texto: "Diligenciar preventivamente junto à clínica médica para confirmar os dias de fato concedidos. Constatada a fraude, proceder com a rescisão imediata por justa causa por quebra insolúvel de fidúcia (Art. 482, 'a')." }
    ]
  },
  {
    id: "1.25",
    fase: 1,
    bloco: "D",
    titulo: "O Atestado de CRM Suspenso",
    tipo: "Erro",
    focoTecnico: "Atestado Inválido Contabilmente",
    tempoLimiteMinutos: 7,
    xpRecompensa: 45,
    empregado: {
      nome: "Amanda Cruz",
      cbo: "Auxiliar Administrativo",
      salarioBase: 1950.00,
      dataAdmissao: "15/05/2024",
      dataFato: "22/05/2026",
      jornada: "44h/semana",
      detalhesAtestado: {
        medico: "Dr. Jose Geraldo",
        crm: "40510-SP", // O CRM consta como SUSPENSO/NÃO AUTORIZADO!
        emissao: "22/05/2026",
        cid: "I10 (Hipertensão)",
        diasAfastados: 2
      }
    },
    queixa: "Estava em mau estado de saúde cardíaca e fui atendida por uma clínica rápida do bairro, o médico me prescreveu 2 dias de repouso absoluto. Fiquei sabendo que disseram que o registro dele está suspenso. Mas eu não tenho culpa disso, eu estava doente e fui atendida!",
    gabarito: {
      tipoAcao: "Descontar Falta",
      artigoLegal: "Resoluções CFM e CLT aplicadas. O profissional com CRM suspenso ou impedido de exercer a profissão não emite documentos válidos corporativamente. Contudo, em virtude de ausência de dolo direto ou má-fé comprovável da funcionária, lança-se as ausências como faltas injustificadas normais, sem aplicar justa causa.",
      respostaEsperadaId: "opt_125_01"
    },
    opcoes: [
      { id: "opt_125_01", texto: "Validar que o CRM está impedido/suspenso. Não abonar as faltas e lançá-las como ausências injustificadas legítimas. Não aplicar justa causa, pois a colaboradora foi consumidora de terceiros e não obrou em dolo intencional manifesto." },
      { id: "opt_125_02", texto: "Instaurar processo de demissão direta por fraude dolosa presumida e confisco salarial." },
      { id: "opt_125_03", texto: "Ignorar o parecer do Conselho Regional de Medicina legitimando a quitação da quinzena." }
    ]
  },
  {
    id: "1.26",
    fase: 1,
    bloco: "D",
    titulo: "Declaração de Comparecimento vs. Dia Inteiro",
    tipo: "Erro",
    focoTecnico: "Limitação de Justificativa de Horas",
    tempoLimiteMinutos: 6,
    xpRecompensa: 40,
    empregado: {
      nome: "Gabriel Mendes",
      cbo: "Consultor de Vendas (5211-10)",
      salarioBase: 1897.37,
      dataAdmissao: "10/01/2026",
      dataFato: "10/05/2026",
      jornada: "44h/semana",
      detalhesAtestado: {
        medico: "Dra. Eliana Mendes (Urgências)",
        crm: "31245-SP",
        emissao: "10/05/2026",
        cid: "Z02.7 (Comparecimento/Consulta)",
        diasAfastados: 0, // Apenas comparecimento!
        legendaCID: "Permanência: das 14:00 às 16:30 para consulta regular."
      }
    },
    queixa: "Eu tive uma consulta agendada à tarde. Peguei um 'Atestado de Comparecimento' que comprova minha permanência na UPA das 14:00 às 16:30. No entanto, decidi faltar o dia inteirinho pois o trajeto seria cansativo. O RH quer descontar o restante do dia de mim. Eles podem fazer isso?",
    gabarito: {
      tipoAcao: "Descontar Falta",
      artigoLegal: "Jurisprudência Trabalhista. O atestado de comparecimento justifica EXCLUSIVAMENTE os horários discriminados de permanência e consulta acrescidos do tempo de locomoção saudável. As horas de ausência pretéritas ou subsequentes ao evento de saúde restam injustificadas.",
      respostaEsperadaId: "opt_126_02"
    },
    opcoes: [
      { id: "opt_126_01", texto: "Abonar o dia inteiro indistintamente por conta da dignidade do trabalhador enfermo." },
      { id: "opt_126_02", texto: "Retificar as faltas para abonar unicamente o período consignado (das 14:00 às 16:30 mais transporte razoável), aplicando o desconto em folha do restante das horas injustificadas do expediente." },
      { id: "opt_126_03", texto: "Indicar que a declaração de comparecimento vale por até 10 dias úteis de licença continuada." }
    ]
  },

  // --- FASE 2: ESTAGIÁRIO DE RH (SEGUNDOANISTA) - LIBERAÇÃO DE FGTS (7 Challenges) ---
  {
    id: "FGTS-001",
    fase: 2,
    titulo: "Dispensa Sem Justa Causa",
    tipo: "Justa Causa",
    focoTecnico: "Artigo 20, I da Lei 8.036/90",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Carlos Henrique Lima",
      cbo: "4141-05 — Almoxarife",
      salarioBase: 2117.91,
      dataAdmissao: "05/03/2023",
      dataFato: "20/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Carlos trabalhou por 3 anos e 2 meses na Global Logística. Na manhã de 20 de maio, foi chamado pelo supervisor, que comunicou que a empresa estava reestruturando o setor e que ele seria desligado. O supervisor disse: 'Você não fez nada de errado, é apenas uma decisão da diretoria.' Carlos recebeu seu TRCT no mesmo dia, com aviso prévio indenizado, 13º proporcional e férias vencidas. Não houve nenhuma acusação de falta grave. Ele agora está na agência da Caixa pedindo para sacar seu FGTS.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 20, I da Lei 8.036/90",
      respostaEsperadaId: "liberado",
      valoresCorretos: {
        justificativa: "A dispensa sem justa causa autoriza o saque do saldo integral do FGTS, acrescido da multa de 40%, conforme o Artigo 20, I da Lei 8.036/90."
      }
    },
    opcoes: [
      { id: "liberado", texto: "✅ SAQUE LIBERADO — Direito reconhecido" },
      { id: "bloqueado", texto: "❌ SAQUE BLOQUEADO — Direito negado" },
      { id: "parcial", texto: "⚠️ SAQUE PARCIAL (80%) — Acordo consensual (Art. 484-A)" }
    ]
  },
  {
    id: "FGTS-002",
    fase: 2,
    titulo: "Pedido de Demissão",
    tipo: "Justa Causa",
    focoTecnico: "Artigo 20 da Lei 8.036/90",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Fernanda Costa",
      cbo: "4110-05 — Auxiliar de Escritório",
      salarioBase: 1950.00,
      dataAdmissao: "10/10/2024",
      dataFato: "02/06/2026",
      jornada: "44h/semana"
    },
    queixa: "Fernanda trabalhou 1 ano e 8 meses como auxiliar. No começo de junho, recebeu uma proposta de outra empresa, com salário melhor. Foi até o RH e escreveu uma carta de próprio punho pedindo demissão. Cumpriu os 30 dias de aviso prévio trabalhado, treinou sua substituta e saiu pela porta da frente, com todos os documentos assinados. Agora, uma semana depois, foi à Caixa Econômica tentar sacar o FGTS para dar entrada em um financiamento.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 20 da Lei 8.036/90",
      respostaEsperadaId: "bloqueado",
      valoresCorretos: {
        justificativa: "O pedido de demissão não está entre as hipóteses de saque do FGTS. O saldo permanece em conta vinculada até que outra situação autorizadora ocorra (ex.: aposentadoria, nova dispensa sem justa causa, etc.)."
      }
    },
    opcoes: [
      { id: "liberado", texto: "✅ SAQUE LIBERADO — Direito reconhecido" },
      { id: "bloqueado", texto: "❌ SAQUE BLOQUEADO — Direito negado" },
      { id: "parcial", texto: "⚠️ SAQUE PARCIAL (80%) — Acordo consensual (Art. 484-A)" }
    ]
  },
  {
    id: "FGTS-003",
    fase: 2,
    titulo: "Contrato de Experiência Chegou ao Fim",
    tipo: "Justa Causa",
    focoTecnico: "Artigo 20, IX da Lei 8.036/90",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Renan Alves",
      cbo: "5211-10 — Consultor de Vendas",
      salarioBase: 1897.37,
      dataAdmissao: "01/04/2026",
      dataFato: "29/06/2026",
      jornada: "44h/semana"
    },
    queixa: "Renan foi contratado por 90 dias de experiência. Trabalhou com afinco, mas no último dia o gerente o chamou e disse: 'Infelizmente, seu desempenho não atingiu as metas esperadas. O contrato termina hoje e não vamos efetivar.' Renan recebeu o TRCT com saldo de salário, 13º e férias proporcionais, mas ficou em dúvida se pode sacar o FGTS para se manter enquanto procura outro emprego.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 20, IX da Lei 8.036/90",
      respostaEsperadaId: "liberado",
      valoresCorretos: {
        justificativa: "O término do contrato por prazo determinado (incluindo o contrato de experiência) autoriza o saque do saldo do FGTS. Embora não haja multa de 40%, o trabalhador pode sacar o saldo depositado durante o período."
      }
    },
    opcoes: [
      { id: "liberado", texto: "✅ SAQUE LIBERADO — Direito reconhecido" },
      { id: "bloqueado", texto: "❌ SAQUE BLOQUEADO — Direito negado" },
      { id: "parcial", texto: "⚠️ SAQUE PARCIAL (80%) — Acordo consensual (Art. 484-A)" }
    ]
  },
  {
    id: "FGTS-004",
    fase: 2,
    titulo: "Justa Causa por Ato de Improbidade",
    tipo: "Justa Causa",
    focoTecnico: "Artigo 20 da Lei 8.036/90",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Marcos Vinícius Pereira",
      cbo: "5211-25 — Arrumador de Prateleiras",
      salarioBase: 1690.00,
      dataAdmissao: "15/01/2025",
      dataFato: "12/06/2026",
      jornada: "44h/semana"
    },
    queixa: "Marcos foi despedido por justa causa. Segundo a empresa, ele apresentou um atestado médico falso para justificar uma falta. O RH consultou o CRM, descobriu que o número não existia na base do CFM e documentou a fraude. O sindicato homologou a rescisão. Marcos alega que 'trabalhou por mais de um ano e tem direito ao seu FGTS de qualquer jeito'. Ele entrou com o requerimento pedindo a liberação.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 20 da Lei 8.036/90",
      respostaEsperadaId: "bloqueado",
      valoresCorretos: {
        justificativa: "A dispensa por justa causa não está entre as hipóteses legais de saque do FGTS. Ainda que o trabalhador tenha contribuído por anos, a lei condiciona a liberação à causa do desligamento, e a justa causa bloqueia o acesso ao saldo."
      }
    },
    opcoes: [
      { id: "liberado", texto: "✅ SAQUE LIBERADO — Direito reconhecido" },
      { id: "bloqueado", texto: "❌ SAQUE BLOQUEADO — Direito negado" },
      { id: "parcial", texto: "⚠️ SAQUE PARCIAL (80%) — Acordo consensual (Art. 484-A)" }
    ]
  },
  {
    id: "FGTS-005",
    fase: 2,
    titulo: "Aposentadoria Após Anos de Trabalho",
    tipo: "Justa Causa",
    focoTecnico: "Artigo 20, III da Lei 8.036/90",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Seu José da Silva",
      cbo: "7825-10 — Caçambeiro",
      salarioBase: 2750.00,
      dataAdmissao: "03/02/1992",
      dataFato: "30/06/2026",
      jornada: "44h/semana"
    },
    queixa: "Seu José trabalhou na mesma transportadora por 34 anos. Aos 66 anos, finalmente deu entrada no pedido de aposentadoria no INSS, que foi concedido em junho de 2026. Ele pediu demissão para se dedicar à família e agora quer sacar o saldo do FGTS acumulado durante toda a carreira. O RH informou que, como foi pedido de demissão, ele não teria direito. Mas Seu José acredita que a aposentadoria muda alguma coisa.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 20, III da Lei 8.036/90",
      respostaEsperadaId: "liberado",
      valoresCorretos: {
        justificativa: "A aposentadoria é uma das hipóteses expressas de saque do FGTS, independentemente do tipo de desligamento. Mesmo que Seu José tenha pedido demissão, a concessão da aposentadoria pelo INSS lhe garante o direito de sacar o saldo integral."
      }
    },
    opcoes: [
      { id: "liberado", texto: "✅ SAQUE LIBERADO — Direito reconhecido" },
      { id: "bloqueado", texto: "❌ SAQUE BLOQUEADO — Direito negado" },
      { id: "parcial", texto: "⚠️ SAQUE PARCIAL (80%) — Acordo consensual (Art. 484-A)" }
    ]
  },
  {
    id: "FGTS-006",
    fase: 2,
    titulo: "Acordo Mútuo",
    tipo: "Justa Causa",
    focoTecnico: "Artigo 484-A, §1º da CLT",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Mário César Gomes",
      cbo: "7156-10 — Eletricista de Alta Tensão",
      salarioBase: 5500.00,
      dataAdmissao: "15/02/2021",
      dataFato: "25/06/2026",
      jornada: "44h/semana"
    },
    queixa: "Mário trabalhou 5 anos como eletricista. Ele queria se desligar para abrir o seu próprio negócio de instalações elétricas, mas estava preocupado em perder totalmente o acesso ao seu FGTS. A empresa também estava reduzindo o quadro e propôs que fizessem uma rescisão por acordo mútuo, conforme o Artigo 484-A da CLT. O acordo foi assinado e homologado. Agora, Mário compareceu à agência da Caixa Econômica, mas está na dúvida se tem direito a sacar o saldo de sua conta vinculada e qual seria a regra aplicável a essa modalidade.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 484-A, §1º da CLT",
      respostaEsperadaId: "parcial",
      valoresCorretos: {
        justificativa: "No acordo mútuo, o empregado pode sacar até 80% do saldo do FGTS, e a multa rescisória is de 20%. Diferente dos demais casos, aqui o saque não é integral, mas ainda assim é permitido."
      }
    },
    opcoes: [
      { id: "liberado", texto: "✅ SAQUE LIBERADO — Direito reconhecido" },
      { id: "bloqueado", texto: "❌ SAQUE BLOQUEADO — Direito negado" },
      { id: "parcial", texto: "⚠️ SAQUE PARCIAL (80%) — Acordo consensual (Art. 484-A)" }
    ]
  },
  {
    id: "FGTS-007",
    fase: 2,
    titulo: "Doença Grave na Família",
    tipo: "Justa Causa",
    focoTecnico: "Artigo 20, XIV da Lei 8.036/90",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Tânia Regina Souza",
      cbo: "4221-05 — Atendente de Clínica Veterinária",
      salarioBase: 1620.00,
      dataAdmissao: "10/06/2021",
      dataFato: "[Empregada Ativa]",
      jornada: "44h/semana"
    },
    queixa: "Tânia está empregada há 5 anos na mesma clínica. Seu filho de 8 anos foi diagnosticado com leucemia e precisa de tratamento urgente. Tânia não quer pedir demissão — ela precisa do plano de saúde da empresa — mas o tratamento tem custos altos. Ela soube que o FGTS pode ser sacado em casos de doença grave de dependente. Ela apresenta laudo médico oficial comprovando a doença.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Art. 20, XIV da Lei 8.036/90",
      respostaEsperadaId: "liberado",
      valoresCorretos: {
        justificativa: "O trabalhador pode sacar o FGTS quando seu dependente for acometido de doença grave (como câncer), desde que comprovada por laudo médico oficial. Tânia não precisa pedir demissão; ela continua empregada e ainda assim pode sacar o saldo."
      }
    },
    opcoes: [
      { id: "liberado", texto: "✅ SAQUE LIBERADO — Direito reconhecido" },
      { id: "bloqueado", texto: "❌ SAQUE BLOQUEADO — Direito negado" },
      { id: "parcial", texto: "⚠️ SAQUE PARCIAL (80%) — Acordo consensual (Art. 484-A)" }
    ]
  },

  // --- FASE 3: ASSISTENTE DE DP - MESA DE RESCISÕES TRCT (8 Challenges remaining) ---
  {
    id: "3.2",
    fase: 3,
    titulo: "RES-002 — Fernanda Costa: Auxiliar Administrativo Sem Novidades (Normal)",
    tipo: "Cálculo",
    focoTecnico: "Cálculo Geral de Holerite e Comissões",
    tempoLimiteMinutos: 10,
    xpRecompensa: 40,
    empregado: {
      nome: "Fernanda Costa",
      cbo: "Auxiliar Administrativo (4110-05)",
      salarioBase: 2034.54,
      dataAdmissao: "10/01/2025",
      dataFato: "30/06/2026",
      jornada: "40h/semana (Divisor 200)",
      dependentes: 0,
      vtCustoDiario: 8.00,
      comissoes: 200.00,
      outrasSomas: "Não possui adicionais regulamentares"
    },
    queixa: "Pedi demissão ontem após receber uma nova proposta. Quero que confira o cálculo do meu holerite final do mês trabalhado cheio (30 dias). Tive uma comissão acordada de R$ 200,00 sobre as tarefas, e uso vale-transporte de R$ 8,00 por dia (22 dias).",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Artigo 487 da CLT. Pedido de demissão com aviso cumprido garante todos os direitos do período trabalhado integral e reflexos de DSR sobre comissões (Súmula 172 do TST).",
      valoresCorretos: {
        salario: 2034.54,
        mediaHe: 0.00,
        insalubridade: 0.00,
        periculosidade: 0.00,
        horasExtras: 0.00,
        adicionalNoturno: 0.00,
        comissoes: 200.00,
        dsrHe: 40.00,
        bruto: 2274.54,
        inss: 180.39,
        irrf: 0.00,
        vt: 122.07,
        faltasDesconto: 0.00,
        salarioFamilia: 0.00,
        liquido: 1972.08,
        baseFgts: 2274.54,
        fgts: 181.96,
        justificativa: "Cálculo de Fernanda (30 dias): Salário Integral R$ 2.034,54, Comissão R$ 200,00, Reflexos DSR s/ Comissões R$ 40,00 (Lei 605/1949). Total Proventos Bruto R$ 2.274,54. Descontos: INSS R$ 180,39 e VT R$ 122,07 (6% do salário contratual base). Líquido R$ 1.972,08. FGTS R$ 181,96 (8% sobre a base R$ 2.274,54)."
      },
      respostaEsperadaId: "opt_res2_02"
    }
  },
  {
    id: "3.3",
    fase: 3,
    titulo: "RES-003 — Ricardo Alves: Guariteiro com Periculosidade e Faltas",
    tipo: "Cálculo",
    focoTecnico: "Adicional de Periculosidade, Faltas e Desconto de DSR",
    tempoLimiteMinutos: 15,
    xpRecompensa: 45,
    empregado: {
      nome: "Ricardo Alves",
      cbo: "Guariteiro / Vigilante (5174-10)",
      salarioBase: 1950.33,
      dataAdmissao: "15/02/2024",
      dataFato: "30/06/2026",
      jornada: "44h/semana (Divisor 220)",
      dependentes: 2,
      vtCustoDiario: 6.00,
      outrasSomas: "Adicional de Periculosidade de 30% sobre o salário contratual base seguro"
    },
    queixa: "Preciso do holerite deste mês. Recebo adicional de periculosidade de 30%. Fiz 10 horas extras com 50% de acréscimo. No entanto, infelizmente tive 2 faltas injustificadas na mesma semana que geraram também a perda do descanso semanal (DSR). Uso VT de R$ 6,00 diários (22 dias). Tenho 2 filhos menores de 14 anos dependentes para fins de Salário-Família e IRRF.",
    gabarito: {
      tipoAcao: "Descontar Falta",
      artigoLegal: "Art. 193 CLT (Periculosidade), Art. 6º Lei 605/49 (DSR), Lei 8.213/91 (Salário-Família) e Súmula 132 TST.",
      valoresCorretos: {
        salario: 1950.33,
        mediaHe: 0.00,
        insalubridade: 0.00,
        periculosidade: 585.10,
        horasExtras: 172.87,
        adicionalNoturno: 0.00,
        comissoes: 0.00,
        dsrHe: 34.57,
        bruto: 2742.87,
        inss: 205.00,
        irrf: 0.00,
        vt: 117.02,
        faltasDesconto: 195.03,
        salarioFamilia: 0.00,
        liquido: 2225.82,
        baseFgts: 2547.84,
        fgts: 203.83,
        justificativa: "Cálculo de Ricardo (Retificado 2026): Salário R$ 1.950,33 e Periculosidade R$ 585,10. HE (10h) sobre base integrada (R$ 2.535,43/220*1.5*10) = R$ 172,87. DSR HE (172,87/25*5) = R$ 34,57. Bruto Total R$ 2.742,87. Salário-Família: INDEVIDO, pois o Bruto de R$ 2.742,87 supera o teto de R$ 1.980,38 (regras de 2026). Descontos: 2 Faltas + 1 DSR (3 dias s/ base) R$ 195,03. Base INSS (Bruto - Faltas) R$ 2.547,84, gerando INSS Progressivo 2026 de R$ 205,00. IRRF Isento (Base < Teto). VT 6% do base (R$ 117,02). Líquido R$ 2.225,82. FGTS (8%) R$ 203,83."
      },
      respostaEsperadaId: "opt_res3_01"
    }
  },

  {
    id: "3.5",
    fase: 3,
    titulo: "RES-005 — Mário César: Eletricista com Altas Horas Extras e Domingo",
    tipo: "Cálculo",
    focoTecnico: "Periculosidade, Horas Extras 50% e 100% e DSR Integrado",
    tempoLimiteMinutos: 15,
    xpRecompensa: 60,
    empregado: {
      nome: "Mário César Gomes",
      cbo: "Eletricista de Altas Tensões (7156-10)",
      salarioBase: 8801.35,
      dataAdmissao: "15/02/2023",
      dataFato: "30/05/2026",
      jornada: "44h/semana (Divisor 220)",
      dependentes: 0,
      vtCustoDiario: 12.00,
      outrasSomas: "Adicional de Periculosidade de 30% integrado nas horas extras e reflexos"
    },
    queixa: "Sou eletricista e ganho adicional de periculosidade de 30% regular. Este mês fiz 10 horas extras comuns (50%) e 5 horas extras em domingo de feriado de escala (100%). Preciso auditar o meu holerite cheio de 30 dias. Uso VT de R$ 12,00 por dia (22 dias).",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Súmula 132 do TST (O adicional de periculosidade integra a base de cálculo das horas extras) e Lei 605/49 (DSR sobre as horas extras).",
      valoresCorretos: {
        salario: 8801.35,
        mediaHe: 0.00,
        insalubridade: 0.00,
        periculosidade: 2640.41,
        horasExtras: 1300.25,
        adicionalNoturno: 0.00,
        comissoes: 0.00,
        dsrHe: 260.05,
        bruto: 13002.06,
        inss: 988.09,
        irrf: 2395.11,
        vt: 264.00,
        faltasDesconto: 0.00,
        salarioFamilia: 0.00,
        liquido: 9354.86,
        baseFgts: 13002.06,
        fgts: 1040.16,
        justificativa: "Cálculo de Mário César (Retificado 2026): Salário R$ 8.801,35, Periculosidade R$ 2.640,41, HE 50% (10h com base integrada de R$ 52,01/h) R$ 780,15, HE 100% (5h) R$ 520,10. DSR HE (1.300,25 / 25 * 5) R$ 260,05. Bruto R$ 13.002,06. Descontos: INSS no Teto 2026 de R$ 988,09, IRRF de 27,5% R$ 2.395,11, VT R$ 264,00 (custo real). Líquido R$ 9.354,86. FGTS R$ 1.040,16."
      },
      respostaEsperadaId: "opt_res5_03"
    }
  },
  {
    id: "3.6",
    fase: 3,
    titulo: "RES-006 — Tânia Regina: Atendendente Veterinária Metade do Mês e Faltas Pesadas",
    tipo: "Cálculo",
    focoTecnico: "Afastamento Proporcional, Desconto de 3 Faltas com DSR e Salário Família Triplo",
    tempoLimiteMinutos: 15,
    xpRecompensa: 50,
    empregado: {
      nome: "Tânia Regina Dias",
      cbo: "Atendente Vet. (4221-05)",
      salarioBase: 1620.00,
      dataAdmissao: "01/04/2026",
      dataFato: "15/05/2026",
      jornada: "40h/semana (Divisor 200)",
      dependentes: 3,
      vtCustoDiario: 6.00,
      comissoes: 500.00,
      outrasSomas: "Não possui adicionais físicos"
    },
    queixa: "Trabalhei apenas 15 dias do mês devido a admissão recente. Porém, faltei unjustificadamente 3 dias e perdi o DSR. Tive comissões de vendas no valor de R$ 500,00 e possuo 3 filhos de dependentes para fins de salário-família. Uso VT de R$ 6,00/dia (12 dias de presença).",
    gabarito: {
      tipoAcao: "Descontar Falta",
      artigoLegal: "Artigo 6 Lei 605/49 (DSR) e Portaria Ministério do Trabalho sobre quotas de Salário-Família por filhos menores de 14 anos.",
      valoresCorretos: {
        salario: 810.00,
        mediaHe: 0.00,
        insalubridade: 0.00,
        periculosidade: 0.00,
        horasExtras: 0.00,
        adicionalNoturno: 0.00,
        comissoes: 500.00,
        dsrHe: 0.00,
        bruto: 1310.00,
        inss: 98.25,
        irrf: 0.00,
        vt: 48.60,
        faltasDesconto: 216.00,
        salarioFamilia: 195.00,
        liquido: 1142.15,
        baseFgts: 1094.00,
        fgts: 87.52,
        justificativa: "Cálculo de Tânia: Salário proporcional de 15 dias R$ 810,00, comissões R$ 500,00. Bruto R$ 1.310,00. Descontos: Faltas+DSR R$ 216,00 (3 dias de falta R$ 162,00 + 1 dia DSR R$ 54,00), INSS R$ 98,25 (7,5%), VT R$ 48,60 (6% do salário base proporcional, menor que custo real R$ 72,00). Soma Salário-Família R$ 195,00 (3 filhos). Líquido R$ 1.142,15. FGTS (8% da base deduzida pelas faltas R$ 1.094,00) R$ 87,52."
      },
      respostaEsperadaId: "opt_res6_01"
    }
  },
  {
    id: "3.7",
    fase: 3,
    titulo: "RES-007 — Sérgio Nascimento: Auxiliar Logística Noturno e DSR Integrado",
    tipo: "Cálculo",
    focoTecnico: "Horas Noturnas e Reflexo de DSR no Adicional Noturno e HE",
    tempoLimiteMinutos: 15,
    xpRecompensa: 50,
    empregado: {
      nome: "Sérgio Nascimento",
      cbo: "Auxiliar Logística (4141-40)",
      salarioBase: 1980.00,
      dataAdmissao: "10/11/2024",
      dataFato: "30/06/2026",
      jornada: "44h/semana (Divisor 220)",
      dependentes: 0,
      vtCustoDiario: 9.00,
      outrasSomas: "Recebe Adicional Noturno (20% sobre hora básica)"
    },
    queixa: "Sou auxiliar de logística na escala noturna. Nesse mês trabalhei todos os dias, fiz 5 horas extras com 50% e realizei 40 horas no horário noturno integral de lei. Uso vale-transporte de R$ 9,00 por dia (22 dias de presença).",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Súmula 60 TST (Adicional noturno integra remuneração e reflete no DSR) e hora ficta reduzida legal.",
      valoresCorretos: {
        salario: 1980.00,
        mediaHe: 0.00,
        insalubridade: 0.00,
        periculosidade: 0.00,
        horasExtras: 67.50,
        adicionalNoturno: 82.28,
        comissoes: 0.00,
        dsrHe: 29.96,
        bruto: 2159.74,
        inss: 163.16,
        irrf: 0.00,
        vt: 118.80,
        faltasDesconto: 0.00,
        salarioFamilia: 0.00,
        liquido: 1877.78,
        baseFgts: 2159.74,
        fgts: 172.78,
        justificativa: "Cálculo de Sérgio: Salário R$ 1.980,00, HE (5h 50% de hora básica R$ 9,00) R$ 67,50, Adicional Noturno R$ 82,28 (40h convertidas em 45,71h fictas, x R$ 1,80/h adicional), DSR HE e Noturno R$ 29,96. Bruto R$ 2.159,74. Desconto INSS R$ 163,16, VT R$ 118,80 (6% de base). Líquido R$ 1.877,78. FGTS R$ 172,78."
      },
      respostaEsperadaId: "opt_res7_01"
    }
  },
  {
    id: "3.8",
    fase: 3,
    titulo: "RES-008 — Lúcia Helena: Auxiliar de Limpeza com Insalubridade Integral",
    tipo: "Cálculo",
    focoTecnico: "Insalubridade Máxima (40% s/ Salário Mínimo) e Admissão no Final do Mês",
    tempoLimiteMinutos: 15,
    xpRecompensa: 35,
    empregado: {
      nome: "Lúcia Helena Santos",
      cbo: "Auxiliar de Limpeza (5143-20)",
      salarioBase: 1580.00,
      dataAdmissao: "23/05/2026",
      dataFato: "31/05/2026",
      jornada: "44h/semana (Divisor 220)",
      dependentes: 0,
      vtCustoDiario: 8.00,
      outrasSomas: "Insalubridade em Grau Máximo de 40% sobre o salário mínimo de R$ 1.518,00"
    },
    queixa: "Fui admitida no dia 23 e trabalhei apenas 8 dias nesse mês. Quero auditar se minha insalubridade de 40% Grau Máximo veio correta. Lembrei que jurisprudência impede proporcionalidade diária de insalubridade de ativ. física! Uso VT de R$ 8,00/dia para meus 6 dias de presença.",
    gabarito: {
      tipoAcao: "Retificar Folha",
      artigoLegal: "Súmula 47 TST e Precedentes Normativos - Adicional de insalubridade é inteiramente devido mesmo em fração menstrual.",
      valoresCorretos: {
        salario: 421.33,
        mediaHe: 0.00,
        insalubridade: 607.20,
        periculosidade: 0.00,
        horasExtras: 0.00,
        adicionalNoturno: 0.00,
        comissoes: 0.00,
        dsrHe: 0.00,
        bruto: 1028.53,
        inss: 77.14,
        irrf: 0.00,
        vt: 25.28,
        faltasDesconto: 0.00,
        salarioFamilia: 0.00,
        liquido: 926.11,
        baseFgts: 1028.53,
        fgts: 82.28,
        justificativa: "Cálculo de Lúcia (8 dias): Salário base proporcional R$ 421,33, Insalubridade 40% integral R$ 607,20. Bruto R$ 1.028,53. Descontos: INSS R$ 77,14 (7,5%), VT R$ 25,28 (6% do salário proporcional, menor que custo real R$ 48,00). Líquido R$ 926,11. FGTS R$ 82,28."
      },
      respostaEsperadaId: "opt_res8_01"
    }
  },
  {
    id: "3.9",
    fase: 3,
    titulo: "RES-009 — Fábio Mendes: Balconista com Comissões Altas e Faltas Semanais",
    tipo: "Cálculo",
    focoTecnico: "Reflexos de Comissões e H.E. no DSR, Desconto de Faltas e Dependentes IRRF",
    tempoLimiteMinutos: 15,
    xpRecompensa: 55,
    empregado: {
      nome: "Fábio Mendes",
      cbo: "Balconista (5211-40)",
      salarioBase: 1740.00,
      dataAdmissao: "05/01/2024",
      dataFato: "30/06/2026",
      jornada: "44h/semana (Divisor 220)",
      dependentes: 2,
      vtCustoDiario: 9.00,
      comissoes: 1200.00,
      outrasSomas: "Não tem adicionais de risco ou saúde"
    },
    queixa: "Olá! Sou balconista e ganho comissões elevadas sobre vendas (esse mês foi R$ 1.200,00). Também realizei 20 horas extras a 50%. Porém, tive 1 falta injustificada na terceira semana e perdi também meu DSR semanal. Uso VT de R$ 9,00 diários (20 dias reais devido à falta e feriado). Tenho 2 dependentes legais no IRRF.",
    gabarito: {
      tipoAcao: "Descontar Falta",
      artigoLegal: "Súmula 27 TST (Comissionista tem direito ao DSR sobre comissão) e abatimentos por dependente na instrução de IRRF.",
      valoresCorretos: {
        salario: 1740.00,
        mediaHe: 0.00,
        insalubridade: 0.00,
        periculosidade: 0.00,
        horasExtras: 237.30,
        adicionalNoturno: 0.00,
        comissoes: 1200.00,
        dsrHe: 287.46,
        bruto: 3464.76,
        inss: 319.26,
        irrf: 58.12,
        vt: 104.40,
        faltasDesconto: 116.00,
        salarioFamilia: 0.00,
        liquido: 2866.98,
        baseFgts: 3348.76,
        fgts: 267.90,
        justificativa: "Cálculo de Fábio: Salário R$ 1.740,00, HE (20h 50%) R$ 237,30, Comissões R$ 1.200,00, DSR s/ HE e Comissões R$ 287,46 (Súmula 27). Bruto R$ 3.464,76. Descontos: Falta+DSR R$ 116,00 (1 falta s/ salário base R$ 58 + 1 DSR R$ 58), INSS R$ 319,26 (progressivo), IRRF R$ 58,12 (com desconto de R$ 379,18 pelos 2 dependentes), VT R$ 104,40 (6% de base). Líquido R$ 2.866,98. FGTS R$ 267,90 (8% de R$ 3.348,76)."
      },
      respostaEsperadaId: "opt_res9_01"
    }
  },
  {
    id: "3.10",
    fase: 3,
    titulo: "RES-010 — Ana Clara: Abastecedora com Holerite Completo sob Crise",
    tipo: "Cálculo",
    focoTecnico: "Apurador Completo com Insalubridade, HE, Adicional Noturno, DSR e VT",
    tempoLimiteMinutos: 15,
    xpRecompensa: 70,
    empregado: {
      nome: "Ana Clara Oliveira",
      cbo: "Abastecedor de Linha (7842-05)",
      salarioBase: 1820.00,
      dataAdmissao: "14/08/2024",
      dataFato: "30/06/2026",
      jornada: "44h/semana (Divisor 220)",
      dependentes: 1,
      vtCustoDiario: 8.00,
      outrasSomas: "Insalubridade de Grau Médio 20% sobre o salário mínimo de R$ 1.518,00"
    },
    queixa: "Preciso de auxílio final. Esse mês fiz 10 horas extras com 50% e realizei 10 horas sob regime noturno integral. Ganho insalubridade de 20%. Quero validar se meu holerite cheio (30 dias) com VT (R$ 8,00/dia por 22 dias) e 1 dependente para fins de salário-família e IRRF veio perfeitamente em conformidade legal.",
    gabarito: {
      tipoAcao: "Descontar Falta",
      artigoLegal: "Artigo 192 CLT, Artigo 73 CLT e Súmulas de reflexo de HE e Adic Noturno no DSR.",
      valoresCorretos: {
        salario: 1820.00,
        mediaHe: 0.00,
        insalubridade: 303.60,
        periculosidade: 0.00,
        horasExtras: 124.10,
        adicionalNoturno: 18.91,
        comissoes: 0.00,
        dsrHe: 28.60,
        bruto: 2295.21,
        inss: 183.82,
        irrf: 0.00,
        vt: 109.20,
        faltasDesconto: 0.00,
        salarioFamilia: 65.00,
        liquido: 2067.19,
        baseFgts: 2295.21,
        fgts: 183.62,
        justificativa: "Cálculo de Ana Clara (Holerite total): Salário R$ 1.820,00, Insalubridade R$ 303,60, HE (10h 50%) R$ 124,10, Adicional Noturno R$ 18,91 (10h clock = 11,43h fictas x R$ 1,65 hourly rate), DSR HE e Noturno R$ 28,60. Bruto R$ 2.295,21. Descontos: INSS R$ 183,82, IRRF Zero, VT R$ 109,20 (6% da base). Adição Salário-Família R$ 65,00 (1 filho). Líquido R$ 2.067,19. FGTS R$ 183,62."
      },
      respostaEsperadaId: "opt_res10_01"
    }
  },
  {
    id: "4.1",
    fase: 4,
    titulo: "Questão de Luto vs. Poder Diretivo (Assédio Moral)",
    tipo: "Erro",
    focoTecnico: "Direito à Dignidade e Limites do Poder Diretivo",
    tempoLimiteMinutos: 6,
    xpRecompensa: 45,
    empregado: {
      nome: "Juliane Medeiros",
      cbo: "Auxiliar do Faturamento (4110-05)",
      salarioBase: 2100.00,
      dataAdmissao: "02/01/2025",
      dataFato: "15/05/2026",
      jornada: "44h/semana"
    },
    queixa: "Prezada equipe de compliance e DP, estou sofrendo assédio moral continuado e agressões verbalizadas pelo meu gestor direto, que nos pressiona gritando e ameaçando demissões em público. Para piorar, após o falecimento da minha mãe, estive afastada sob licença de nojo amparada por lei (Art. 473, I CLT) e atestados de ansiedade/depressão. No meu retorno, o gestor me humilhou diante de todos e disse que sou improdutiva. A juíza do Trabalho acabou de qualificar o caso como assédio moral vertical descendente e inobservância patronal da saúde mental da colaboradora, aplicando condenação indenizatória por danos morais na empresa. Diante dessa grave decisão judicial de R$ 20 mil, qual deve ser a providência imediata e juridicamente correta que a nossa empresa deve tomar contra o gestor agressor e em relação à colaboradora vítima?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 482, alínea 'b' da CLT (mau procedimento/incontinência) e Artigos 5º, X da CF/88 e 932, III do Código Civil (responsabilidade civil objetiva por atos de prepostos).",
      respostaEsperadaId: "opt_luto_01",
      valoresCorretos: {
        justificativa: "A agressão verbal indevida e excessiva verbalizada em público, especialmente em momento de luto e severa vulnerabilidade psíquica do funcionário, ultrapassa os limites do poder diretivo e do exercício regular de direito. A omissão caracteriza culpa in vigilando (Art. 932, III do CC). O empregador tem dever de prover ambiente saudável. Enseja demissão por justa causa ao gestor por mau procedimento, além de anular eventuais descontos salariais ilegais durante a licença-nojo e prover o acolhimento médico-psicológico da trabalhadora vítima."
      }
    },
    opcoes: [
      {
        id: "opt_luto_01",
        texto: "Demitir o gestor agressor por JUSTA CAUSA pelo Art. 482, 'b' (mau procedimento grave), cancelar e estornar descontos indevidos da trabalhadora sob licença-nojo, e prover imediato acompanhamento e suporte de saúde mental à colaboradora."
      },
      {
        id: "opt_luto_02",
        texto: "Transferir o gestor de setor, admoestar verbalmente a funcionária sob pretexto de queda de rendimento operacional nas metas e manter os descontos do luto para preservar as finanças."
      },
      {
        id: "opt_luto_03",
        texto: "Orientar a colaboradora de luto a pedir demissão espontânea para que descanse em casa, preservando o gestor de qualquer penalidade por se tratar de um líder de vendas de alto desempenho."
      },
      {
        id: "opt_luto_04",
        texto: "Aplicar demissão por justa causa direta à colaboradora vitimada alegando 'improdutividade após doença' para evitar novas despesas e atestados perante o setor de faturamento."
      }
    ]
  },
  {
    id: "4.2",
    fase: 4,
    titulo: "Regras de Conformidade do Contrato de Estágio",
    tipo: "Misto",
    focoTecnico: "Lei nº 11.788/2008 (Lei do Estágio)",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Lucas Mendes",
      cbo: "Estagiário de RH",
      salarioBase: 1200.00,
      dataAdmissao: "10/02/2026",
      dataFato: "10/05/2026",
      jornada: "30h/semana"
    },
    queixa: "Olá, sou estagiário e me pediram para fazer 2 horas extras diárias para cobrir a alta demanda do fechamento da folha e que iriam me remunerar por fora. Além disso, disseram que não tenho direito a recesso remunerado (férias do estagiário) por ser contrato de estágio de apenas 6 meses. Isso está correto?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 10 e Artigo 13 da Lei nº 11.788/2008. O estágio não admite jornada extraordinária e garante recesso proporcional.",
      respostaEsperadaId: "opt_estag_01",
      valoresCorretos: {
        justificativa: "A jornada máxima do estagiário é de 6h diárias e 30h semanais. É STRICTAMENTE PROIBIDO fazer horas extras, mesmo que pagas por fora. Também é garantido o recesso remunerado de 30 dias a cada ano ou proporcional para contratos menores, o que equivale a 15 dias de recesso para um contrato de 6 meses."
      }
    },
    opcoes: [
      {
        id: "opt_estag_01",
        texto: "É proibido estagiário realizar horas extras, sob pena de descaracterização do estágio. Lucas tem direito indiscutível ao recesso proporcional remunerado de 15 dias pelo período de 6 meses trabalhados."
      },
      {
        id: "opt_estag_02",
        texto: "O estagiário pode realizar horas extras se houver comum acordo e pagamento 'por fora' para não onerar a folha oficial, mas o recesso remunerado só é garantido em contratos de 1 ano ou mais."
      },
      {
        id: "opt_estag_03",
        texto: "A jornada extraordinária do estagiário é limitada a 2 horas adicionais por dia, desde que compensadas no mesmo mês, e o recesso só é devido se o estágio for rescindido de forma antecipada pela empresa."
      },
      {
        id: "opt_estag_04",
        texto: "O estágio é equiparado ao contrato CLT para fins de jornada de trabalho, permitindo horas extras registradas no cartão de ponto, mas sem direito a férias antes de completar o período aquisitivo de 12 meses."
      }
    ]
  },
  {
    id: "5.1",
    fase: 2,
    titulo: "RES-001 — Filipe Santos: Dispensa Sem Justa Causa",
    tipo: "Misto",
    focoTecnico: "Direitos na Dispensa Sem Justa Causa (CLT)",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Filipe Santos Barbosa",
      cbo: "Engenheiro de Processos (2142-05)",
      salarioBase: 6500.00,
      dataAdmissao: "12/03/2023",
      dataFato: "01/06/2026",
      jornada: "44h/semana (Divisor 220)"
    },
    queixa: "Prezada equipe do DP, fui informado hoje que meu contrato foi rescindido pela empresa sem justa causa, por razões mercadológicas. Preciso que vocês auditem meu contrato e listem de quais verbas rescisórias eu de fato possuo o direito de recebimento em meu TRCT.",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 477 da CLT - Sem justa causa garante quitação integral das verbas rescisórias e saque total dos depósitos de FGTS com multa rescisória de 40% e aviso prévio integral.",
      respostaEsperadaId: "saldo,decimo,feriasVenc,feriasProp,saqueFgts,multa40,avisoIntegral,seguro",
      valoresCorretos: {
        justificativa: "A demissão sem justa causa garante o recebimento de TODAS as verbas rescisórias aplicáveis: Saldo de Salário, 13º Salário Proporcional, Férias Vencidas + 1/3, Férias Proporcionais + 1/3, Saque total do FGTS, Multa indenizatória de 40% de FGTS, Aviso Prévio Integral (100%) e as guias habilitando o Seguro-Desemprego."
      }
    }
  },
  {
    id: "5.2",
    fase: 2,
    titulo: "RES-002 — Mariana Costa: Despedida por Justa Causa",
    tipo: "Misto",
    focoTecnico: "Punição e Perda de Verbas Rescisórias (Art. 482 CLT)",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Mariana Costa Silva",
      cbo: "Auxiliar de Almoxarife (4141-10)",
      salarioBase: 2400.00,
      dataAdmissao: "10/05/2024",
      dataFato: "15/06/2026",
      jornada: "40h/semana"
    },
    queixa: "Prezados, cometi uma infração grave de improbidade corporativa reiterada e acabo de receber a notificação de rescisão por Justa Causa sob o Artigo 482, alínea 'a'. Mesmo diante da penalidade severa, resta-me alguma verba a receber? Do que tenho direito?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 482 da CLT and Súmula 171 do TST. A justa causa afasta de forma severa as verbas proporcionais (décimo terceiro e férias) e os benefícios rescisórios de FGTS e seguro-desemprego.",
      respostaEsperadaId: "saldo,feriasVenc",
      valoresCorretos: {
        justificativa: "Na demissão por justa causa, o empregado perde quase todas as verbas proporcionais e indenizações. Tem direito adquirido APENAS ao Saldo de Salário (dias trabalhados) e às Férias Vencidas + 1/3, se houver período aquisitivo completo e vencido na pasta."
      }
    }
  },
  {
    id: "5.3",
    fase: 2,
    titulo: "RES-003 — Roberto Andrade: Pleito de Rescisão Indireta",
    tipo: "Misto",
    focoTecnico: "Infração Contratual do Empregador (Art. 483 CLT)",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Roberto Andrade Pinto",
      cbo: "Operador de Máquinas (7212-10)",
      salarioBase: 3100.00,
      dataAdmissao: "01/02/2023",
      dataFato: "12/06/2026",
      jornada: "44h/semana"
    },
    queixa: "Olá. Estou pleiteando judicialmente a rescisão do meu contrato por falta grave da empresa, que deixou de recolher meu FGTS há 6 meses e me expõe a riscos sem proteção (Artigo 483, alínea 'd'). Se a decisão judicial for favorável, quais verbas a empresa será condenada a me pagar na homologação do TRCT?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 483 da CLT. A rescisão indireta equivale à demissão sem justa causa ao garantir efeito jurídico idêntico de proteção social e direitos resguardados.",
      respostaEsperadaId: "saldo,decimo,feriasVenc,feriasProp,saqueFgts,multa40,avisoIntegral,seguro",
      valoresCorretos: {
        justificativa: "A rescisão indireta em grau judicial favorável acarreta o pagamento exatamente das MESMAS verbas que uma demissão sem justa causa: Saldo de Salário, 13º Proporcional, Férias Vencidas + 1/3, Férias Proporcionais + 1/3, Liberação do Saque do FGTS, Multa de 40% de FGTS, Aviso Prévio Integral (100%) e habilitação Seguro-Desemprego."
      }
    }
  },
  {
    id: "5.4",
    fase: 2,
    titulo: "RES-004 — Ana Júlia: Rescisão por Comum Acordo",
    tipo: "Misto",
    focoTecnico: "Rescisão de Consenso Mútuo (Art. 484-A CLT)",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Ana Júlia Pinheiro",
      cbo: "Assistente Administrativa (4110-10)",
      salarioBase: 2800.00,
      dataAdmissao: "15/09/2024",
      dataFato: "18/06/2026",
      jornada: "44h/semana"
    },
    queixa: "Olá! Fiz um acordo consensual amigável com a empresa para me desligar de forma negociada, com fulcro na Reforma Trabalhista (Art. 484-A CLT). Quais verbas vou receber? E qual o percentual correto para aviso prévio indenizado, multa e saque de FGTS?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 484-A da CLT. O comum acordo partilha alguns ônus contratuais, reduzindo a multa rescisória para 20% e o aviso prévio pela metade (parcial 50%), além de limitar a movimentação do saque FGTS a 80%.",
      respostaEsperadaId: "saldo,decimo,feriasVenc,feriasProp,saqueFgts,multa20,avisoParcial",
      valoresCorretos: {
        justificativa: "No acordo consensual, o trabalhador recebe: Saldo de salário (SIM), 13º proporcional (SIM), Férias vencidas (SIM), Férias proporcionais (SIM), Aviso prévio parcial (50% do aviso indenizado), Saque do FGTS limitado a 80% e Multa rescisória de 20% de FGTS. Ele NÃO tem direito à liberação de guias do Seguro-Desemprego."
      }
    }
  },
  {
    id: "5.5",
    fase: 2,
    titulo: "RES-005 — Carlos Eduardo: Pedido de Demissão",
    tipo: "Misto",
    focoTecnico: "Iniciativa de Desligamento pelo Empregado (Art. 487 CLT)",
    tempoLimiteMinutos: 5,
    xpRecompensa: 40,
    empregado: {
      nome: "Carlos Eduardo Neres",
      cbo: "Analista Financeiro (2521-05)",
      salarioBase: 5200.00,
      dataAdmissao: "10/01/2025",
      dataFato: "22/06/2026",
      jornada: "44h/semana"
    },
    queixa: "Olá. Decidi pedir demissão voluntariamente para assumir um novo desafio profissional. Redigi minha carta de próprio punho entregando à gerência. Em relação às verbas rescisórias do meu TRCT, o que vou receber e o que deixo de receber por ter pedido para sair?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 487 da CLT. A iniciativa do empregado de romper o vínculo preserva os direitos proporcionais regulares acumulados, mas exclui as proteções de FGTS e seguro-desemprego.",
      respostaEsperadaId: "saldo,decimo,feriasVenc,feriasProp",
      valoresCorretos: {
        justificativa: "No pedido de demissão, o trabalhador recebe: Saldo de salário (SIM), 13º proporcional (SIM), Férias vencidas (SIM), Férias proporcionais + 1/3 (SIM). Mas ele NÃO tem direito ao saque do FGTS, NÃO recebe multa rescisória, NÃO tem direito ao Seguro-Desemprego e o aviso prévio não lhe é devido pelo empregador."
      }
    }
  },
  {
    id: "5.6",
    fase: 2,
    titulo: "RES-006 — Beatriz Nogueira: Extinção por Culpa Recíproca",
    tipo: "Misto",
    focoTecnico: "Culpa Recíproca e Reduções Proporcionais (Art. 484 CLT)",
    tempoLimiteMinutos: 5,
    xpRecompensa: 45,
    empregado: {
      nome: "Beatriz Nogueira Mendes",
      cbo: "Consultora de Vendas (5211-10)",
      salarioBase: 2600.00,
      dataAdmissao: "11/04/2024",
      dataFato: "30/06/2026",
      jornada: "44h/semana"
    },
    queixa: "Oi. Tive um desentendimento ríspido recíproco com agressões verbais mútuas com meu supervisor direto e fomos parar na Justiça do Trabalho. O juiz declarou a ocorrência de Culpa Recíproca na extinção do contrato (Artigo 484 CLT). Com essa decisão, quais verbas passarei a receber na folha do termo rescisório?",
    gabarito: {
      tipoAcao: "Apenas Explicar",
      artigoLegal: "Artigo 484 CLT and Súmula 14 do TST. A culpa compartilhada na rescisão por decisão judicial rateia o décimo terceiro proporcional, as férias proporcionais, e o aviso prévio pela metade (50%), restando a multa rescisória reduzida a 20%.",
      respostaEsperadaId: "saldo,decimo,feriasVenc,feriasProp,saqueFgts,multa20,avisoParcial",
      valoresCorretos: {
        justificativa: "Na Culpa Recíproca judicialmente decretada, o empregado tem direito a: Saldo de Salário integral (SIM), 13º Proporcional (reduzido a 50%), Férias Vencidas + 1/3 integral (SIM), Férias Proporcionais + 1/3 (reduzido a 50%), Aviso Prévio parcial (reduzido a 50%), além da autorização de saque do FGTS com a multa rescisória reduzida a 20% (SIM). Ele NÃO tem direito ao Seguro-Desemprego."
      }
    }
  }
];

// High quality custom generated initial list of students for the Professor's simulation OCR upload
export const INITIAL_STUDENTS: Student[] = [
  { id: "adm", nomeCompleto: "Professor Fábio (ADM)", email: "fabiosantanalima01@gmail.com", matricula: "ADM2026", sala: "ADM", ano: 2026, cargo: "Administrador / Mestre de DP", xp: 0, precisao: 0.0, faseAtual: -1, status: "Ativo", senha: "admin", respostasDesafios: {} }
];

export const BADGES_DATA: Badge[] = [
  { id: "badge_solid", titulo: "Fundação Sólida", descricao: "Passou no teste decisivo da Fase 0 com 100% de acerto.", icone: "🛡️", desbloqueado: false },
  { id: "badge_eye", titulo: "Olho Clínico", descricao: "Aprovado na trilha de estágio com mais de 85% de precisão geral.", icone: "👁️‍🗨️", desbloqueado: false },
  { id: "badge_investigator", titulo: "Investigador", descricao: "Completou a investigação documental de atestados sem cair em fraudes.", icone: "🕵️", desbloqueado: false },
  { id: "badge_math", titulo: "Calculista", descricao: "Aprovado na mesa cirúrgica de rescisões (TRCT) com 95% de exatidão.", icone: "🧮", desbloqueado: false },
  { id: "badge_strat", titulo: "Estrategista Contratual", descricao: "Previu enquadramentos complexos e regras de comitê coletivo.", icone: "🧠", desbloqueado: false },
  { id: "badge_master", titulo: "Gestor Master", descricao: "Recebeu a Certificação Máxima de Diretor de Gente & Gestão.", icone: "👑", desbloqueado: false }
];
