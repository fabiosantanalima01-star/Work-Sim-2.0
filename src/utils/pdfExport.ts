/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import { getPointParamsForChallenge } from "./timecard";

export interface RubricRow {
  cod: string;
  desc: string;
  ref: string;
  vencimento: number;
  desconto: number;
}

export function exportTRCTToPDF(
  activeChallenge: any, 
  appLanguage: "pt" | "en",
  employerDetails?: { cnpj: string; razaoSocial: string; nomeFantasia: string }
) {
  if (!activeChallenge || !activeChallenge.gabarito?.valoresCorretos) {
    console.error("Invalid active challenge dataset for PDF export.");
    return;
  }

  const gab = activeChallenge.gabarito.valoresCorretos;

  // Initialize jsPDF A4 document [210mm x 297mm], units in mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const startX = 10;
  const startY = 10;
  const width = 190;
  const height = 277;

  // Formatting utilities
  const formatCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null || val === 0) return "0,00";
    return val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Helper functions to draw grid boxes with small labels and values
  const drawTextBox = (x: number, y: number, w: number, h: number, label: string, value: string, isBold: boolean = false, align: "left" | "right" | "center" = "left") => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.18);
    doc.rect(x, y, w, h);
    
    // Label
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(4.5);
    doc.setTextColor(60, 60, 60);
    doc.text(label.toUpperCase(), x + 1.2, y + 2.0);
    
    // Value
    doc.setFont("Courier", isBold ? "bold" : "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    if (align === "left") {
      doc.text(value || "—", x + 1.2, y + h - 1.2);
    } else if (align === "right") {
      doc.text(value || "—", x + w - 1.2, y + h - 1.2, { align: "right" });
    } else {
      doc.text(value || "—", x + w / 2, y + h - 1.2, { align: "center" });
    }
  };

  // ==================== PÁGINA 1 ====================

  // Draw border around document Page 1
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(startX, startY, width, height);

  // --- CABEÇALHO DO TRCT (y: 10 a 20) ---
  doc.setFillColor(245, 245, 245);
  doc.rect(startX, startY, width, 10, "F");
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.line(startX, startY + 10, startX + width, startY + 10);
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("MINISTÉRIO DO TRABALHO E EMPREGO - MTE", startX + width / 2, startY + 4, { align: "center" });
  doc.setFontSize(6.5);
  doc.text("TERMO DE RESCISÃO DO CONTRATO DE TRABALHO - TRCT (OFICIAL)", startX + width / 2, startY + 8, { align: "center" });

  let currentY = startY + 10;

  // --- 01 - IDENTIFICAÇÃO DO EMPREGADOR (campos 01 a 09) ---
  doc.setFillColor(235, 235, 235);
  doc.rect(startX, currentY, width, 4, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(0, 0, 0);
  doc.text("01 - IDENTIFICAÇÃO DO EMPREGADOR", startX + 2, currentY + 2.8);
  doc.line(startX, currentY + 4, startX + width, currentY + 4);
  currentY += 4;

  drawTextBox(startX, currentY, 50, 6, "01 CNPJ/CEI", employerDetails?.cnpj || "14.882.341/0001-02");
  const displayCompany = employerDetails ? `${employerDetails.razaoSocial}${employerDetails.nomeFantasia ? ` (${employerDetails.nomeFantasia})` : ""}` : "CRISRES SOLUÇÃO TRABALHISTA S/A";
  drawTextBox(startX + 50, currentY, 140, 6, "02 Razão Social/Nome", displayCompany.toUpperCase());
  currentY += 6;

  drawTextBox(startX, currentY, 110, 6, "03 Endereço (Logradouro, nº, andar)", "Rua da Consolidação, 1500");
  drawTextBox(startX + 110, currentY, 40, 6, "04 Bairro", "Consolação");
  drawTextBox(startX + 150, currentY, 40, 6, "05 Município", "São Paulo");
  currentY += 6;

  drawTextBox(startX, currentY, 15, 6, "06 UF", "SP");
  drawTextBox(startX + 15, currentY, 35, 6, "07 CEP", "01301-100");
  drawTextBox(startX + 50, currentY, 40, 6, "08 CNAE", "7020-4/00");
  drawTextBox(startX + 90, currentY, 100, 6, "09 CNPJ/CEI Tomador/Obra", "—");
  currentY += 6;

  // --- 02 - IDENTIFICAÇÃO DO TRABALHADOR (campos 10 a 20) ---
  doc.setFillColor(235, 235, 235);
  doc.rect(startX, currentY, width, 4, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(0, 0, 0);
  doc.text("02 - IDENTIFICAÇÃO DO TRABALHADOR", startX + 2, currentY + 2.8);
  doc.line(startX, currentY + 4, startX + width, currentY + 4);
  currentY += 4;

  drawTextBox(startX, currentY, 50, 6, "10 PIS/PASEP", "120.34192.12-5");
  drawTextBox(startX + 50, currentY, 140, 6, "11 Nome", activeChallenge.empregado.nome.toUpperCase());
  currentY += 6;

  drawTextBox(startX, currentY, 110, 6, "12 Endereço (Logradouro, nº, apto)", "Rua do Aprendizado Técnico, 42");
  drawTextBox(startX + 110, currentY, 40, 6, "13 Bairro", "Centro");
  drawTextBox(startX + 150, currentY, 40, 6, "14 Município", "São Paulo");
  currentY += 6;

  drawTextBox(startX, currentY, 15, 6, "15 UF", "SP");
  drawTextBox(startX + 15, currentY, 35, 6, "16 CEP", "01001-000");
  drawTextBox(startX + 50, currentY, 50, 6, "17 CTPS (Nº, Série, UF)", "12345 Série 001-SP");
  drawTextBox(startX + 100, currentY, 45, 6, "18 CPF", "123.456.789-00");
  drawTextBox(startX + 145, currentY, 45, 6, "19 Data de Nascimento", "12/08/1995");
  currentY += 6;

  drawTextBox(startX, currentY, 190, 6, "20 Nome da Mãe", "Maria de Souza Costa");
  currentY += 6;

  // --- 03 - DADOS DO CONTRATO (campos 21 a 32) ---
  doc.setFillColor(235, 235, 235);
  doc.rect(startX, currentY, width, 4, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(0, 0, 0);
  doc.text("03 - DADOS DO CONTRATO", startX + 2, currentY + 2.8);
  doc.line(startX, currentY + 4, startX + width, currentY + 4);
  currentY += 4;

  const tipoContratoText = activeChallenge.id === "3.8" ? "2 - Prazo determinado s/ cláusula" : "1 - Contrato prazo indeterminado";
  drawTextBox(startX, currentY, 60, 6, "21 Tipo de Contrato", tipoContratoText);
  const causaAfastamentoText = activeChallenge.id === "2" || activeChallenge.id === "3.2" ? "Pedido de demissão pelo empregado" : "Despedida sem justa causa pelo empregador";
  drawTextBox(startX + 60, currentY, 130, 6, "22 Causa do Afastamento", causaAfastamentoText);
  currentY += 6;

  drawTextBox(startX, currentY, 50, 6, "23 Remuneração Mês Anterior", "R$ " + formatCurrency(activeChallenge.empregado.salarioBase));
  drawTextBox(startX + 50, currentY, 45, 6, "24 Data de Admissão", activeChallenge.empregado.dataAdmissao || "—");
  const dataAvisoText = activeChallenge.id === "3.2" ? "29/05/2026" : activeChallenge.empregado.dataFato || "—";
  drawTextBox(startX + 95, currentY, 45, 6, "25 Data do Aviso Prévio", dataAvisoText);
  drawTextBox(startX + 140, currentY, 50, 6, "26 Data de Afastamento", activeChallenge.empregado.dataFato || "—");
  currentY += 6;

  const codAfastamentoText = activeChallenge.id === "2" || activeChallenge.id === "3.2" ? "PD1" : "SJ2";
  drawTextBox(startX, currentY, 35, 6, "27 Cód. Afastamento", codAfastamentoText);
  drawTextBox(startX + 35, currentY, 50, 6, "28 Pensão Alimentícia (%) sobre TRCT", "0,00 %");
  drawTextBox(startX + 85, currentY, 50, 6, "29 Pensão Alimentícia (%) sobre FGTS", "0,00 %");
  drawTextBox(startX + 135, currentY, 55, 6, "30 Categoria do Trabalhador", "01 - Empregado Geral");
  currentY += 6;

  drawTextBox(startX, currentY, 60, 6, "31 Código Sindical", "912.000.000.00000-0");
  drawTextBox(startX + 60, currentY, 130, 6, "32 CNPJ do Sindicato", "11.222.333/0001-44");
  currentY += 6;

  // --- 04 - DISCRIMINAÇÃO DAS VERBAS RESCISÓRIAS (PROVENTOS) (campos 50 a 99) ---
  doc.setFillColor(235, 235, 235);
  doc.rect(startX, currentY, width, 4, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(0, 0, 0);
  doc.text("04 - DISCRIMINAÇÃO DAS VERBAS RESCISÓRIAS (PROVENTOS)", startX + 2, currentY + 2.8);
  doc.line(startX, currentY + 4, startX + width, currentY + 4);
  currentY += 4;

  // Header of the Proventos table
  doc.setFillColor(245, 245, 245);
  doc.rect(startX, currentY, width, 4, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(5);
  doc.text("RUBRICA / DESCRIÇÃO DA VERBA", startX + 2, currentY + 3);
  doc.text("VALOR (CRÉDITO)", startX + width - 15, currentY + 3, { align: "right" });
  doc.line(startX, currentY + 4, startX + width, currentY + 4);
  currentY += 4;

  const proventosList = [
    { code: "50", desc: "Saldo de Salário (Mês Afastamento)", val: gab.salario || 0 },
    { code: "51", desc: "Comissões s/ Vendas", val: gab.comissoes || 0 },
    { code: "52", desc: "Gratificações", val: 0 },
    { code: "53", desc: "Adicional de Insalubridade", val: gab.insalubridade || 0 },
    { code: "54", desc: "Adicional de Periculosidade", val: gab.periculosidade || 0 },
    { code: "55", desc: "Adicional Noturno", val: gab.adicionalNoturno || 0 },
    { code: "56", desc: "Horas Extras Realizadas (50% / 100%)", val: gab.horasExtras || 0 },
    { code: "57", desc: "Gorjetas", val: 0 },
    { code: "58", desc: "Reflexo do DSR sobre Horas Extras e Variáveis", val: gab.dsrHe || 0 },
    { code: "59", desc: "Outros Adicionais", val: 0 },
    { code: "60", desc: "13º Salário Proporcional", val: (activeChallenge.id === "3.6" ? gab.mediaHe : 0) || 0 },
    { code: "61", desc: "13º Salário Exercício Anterior", val: 0 },
    { code: "62", desc: "Salário-Família (Cotas da Previdência)", val: gab.salarioFamilia || 0 },
    { code: "63", desc: "Dupla Função", val: 0 },
    { code: "64", desc: "Outras Verbas", val: 0 },
    { code: "65", desc: "Férias Proporcionais", val: 0 },
    { code: "66", desc: "Férias Vencidas", val: 0 },
    { code: "68", desc: "Terço Constitucional de Férias Proporcionais/Vencidas", val: 0 },
    { code: "69", desc: "Aviso Prévio Indenizado", val: 0 },
    { code: "70", desc: "Décimo Terceiro Salário s/ Aviso Prévio Indenizado", val: 0 },
    { code: "71", desc: "Férias s/ Aviso Prévio Indenizado", val: 0 },
    { code: "72", desc: "Terço Constitucional de Férias s/ Aviso Prévio Indenizado", val: 0 }
  ];

  const proventoRowHeight = 6.2;
  proventosList.forEach((prov) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.18);
    doc.rect(startX, currentY, width, proventoRowHeight);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(4.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`${prov.code} - ${prov.desc.toUpperCase()}`, startX + 1.2, currentY + 2.0);
    
    doc.setFont("Courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    const displayVal = "R$ " + formatCurrency(prov.val);
    doc.text(displayVal, startX + width - 1.2, currentY + proventoRowHeight - 1.2, { align: "right" });
    
    currentY += proventoRowHeight;
  });

  const totalBruto = proventosList.reduce((acc, prov) => acc + prov.val, 0);
  
  doc.setFillColor(240, 240, 240);
  doc.rect(startX, currentY, width, 8, "F");
  drawTextBox(startX, currentY, width, 8, "99 TOTAL BRUTO (CRÉDITOS)", "R$ " + formatCurrency(totalBruto), true, "right");
  currentY += 8;

  // Footnote and page number for Page 1
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor(120, 120, 120);
  doc.text("Termo de Rescisão de Contrato de Trabalho - TRCT. Desenvolvido em conformidade com a Portaria MTE nº 1.621/2010.", startX, height + 8);
  doc.text("PÁGINA 1 DE 2", startX + width, height + 8, { align: "right" });


  // ==================== PÁGINA 2 ====================

  doc.addPage();
  
  // Draw border around Page 2
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(startX, startY, width, height);
  
  // Reset Y coordinate for Page 2
  let p2Y = startY;

  // Header of Page 2 (MTE / TRCT Continuation)
  doc.setFillColor(245, 245, 245);
  doc.rect(startX, p2Y, width, 8, "F");
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.line(startX, p2Y + 8, startX + width, p2Y + 8);
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text("TERMO DE RESCISÃO DO CONTRATO DE TRABALHO - TRCT (DEDUÇÕES, TOTAIS E HOMOLOGAÇÃO)", startX + width / 2, p2Y + 5, { align: "center" });
  p2Y += 8;

  // --- 04 - DISCRIMINAÇÃO DAS VERBAS RESCISÓRIAS (DEDUÇÕES) (campos 100 a 116) ---
  doc.setFillColor(235, 235, 235);
  doc.rect(startX, p2Y, width, 4, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(0, 0, 0);
  doc.text("04 - DISCRIMINAÇÃO DAS VERBAS RESCISÓRIAS (DEDUÇÕES)", startX + 2, p2Y + 2.8);
  doc.line(startX, p2Y + 4, startX + width, p2Y + 4);
  p2Y += 4;

  // Header of the Deduções table
  doc.setFillColor(245, 245, 245);
  doc.rect(startX, p2Y, width, 4, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(5);
  doc.text("RUBRICA / DESCRIÇÃO DO DESCONTO", startX + 2, p2Y + 3);
  doc.text("VALOR (DÉBITO)", startX + width - 15, p2Y + 3, { align: "right" });
  doc.line(startX, p2Y + 4, startX + width, p2Y + 4);
  p2Y += 4;

  const deductionsList = [
    { code: "100", desc: "Pensão Alimentícia", val: 0 },
    { code: "101", desc: "Adiantamento Salarial", val: 0 },
    { code: "102", desc: "Adiantamento de Décimo Terceiro Salário", val: 0 },
    { code: "103", desc: "Assistência Médica / Plano de Saúde", val: 0 },
    { code: "112.1", desc: "Previdência Social (Contribuição do Segurado - INSS)", val: gab.inss || 0 },
    { code: "112.2", desc: "Previdência Social sobre Décimo Terceiro Salário", val: 0 },
    { code: "114.1", desc: "Imposto de Renda Retido na Fonte (IRRF)", val: gab.irrf || 0 },
    { code: "114.2", desc: "Imposto de Renda s/ Décimo Terceiro Salário", val: 0 },
    { code: "115.1", desc: "Desconto Vale-Transporte (6% ou Custo Real)", val: gab.vt || 0 },
    { code: "115.2", desc: "Desconto de Faltas Injustificadas e DSR Perdido", val: gab.faltasDesconto || 0 },
    { code: "116", desc: "Outros Descontos Autorizados", val: 0 }
  ];

  const dedRowHeight = 6.2;
  deductionsList.forEach((ded) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.18);
    doc.rect(startX, p2Y, width, dedRowHeight);
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(4.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`${ded.code} - ${ded.desc.toUpperCase()}`, startX + 1.2, p2Y + 2.0);
    
    doc.setFont("Courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(0, 0, 0);
    const displayVal = "R$ " + formatCurrency(ded.val);
    doc.text(displayVal, startX + width - 1.2, p2Y + dedRowHeight - 1.2, { align: "right" });
    
    p2Y += dedRowHeight;
  });

  // --- CAMPOS EM BRANCO (117 a 149) ---
  doc.setFillColor(248, 248, 248);
  doc.rect(startX, p2Y, width, 18, "F");
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.18);
  doc.rect(startX, p2Y, width, 18);
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(4.5);
  doc.setTextColor(60, 60, 60);
  doc.text("CAMPOS EM BRANCO (117 A 149) - RESIDUAIS RESERVADOS PARA ACRÉSCIMO DE RUBRICAS ADICIONAIS PELO EMPREGADOR", startX + 1.2, p2Y + 2.0);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor(100, 100, 100);
  doc.text("117-149 Rubrica de Acréscimo Adicional da Empresa (Art. 4º da Portaria MTE 1.621/2010)", startX + 1.2, p2Y + 6.0);
  doc.text("117-149 Outras Deduções Regulamentares Opcionais", startX + 1.2, p2Y + 10.0);
  
  doc.setFont("Courier", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text("R$ 0,00", startX + width - 1.2, p2Y + 6.0, { align: "right" });
  doc.text("R$ 0,00", startX + width - 1.2, p2Y + 10.0, { align: "right" });
  doc.text("R$ 0,00", startX + width - 1.2, p2Y + 14.0, { align: "right" });
  p2Y += 18;

  // --- 05 - TOTAIS, BASES DE CÁLCULO E DEPÓSITOS DO FGTS ---
  doc.setFillColor(235, 235, 235);
  doc.rect(startX, p2Y, width, 4, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(0, 0, 0);
  doc.text("05 - TOTAIS, BASES DE CÁLCULO E DEPÓSITOS DO FGTS", startX + 2, p2Y + 2.8);
  doc.line(startX, p2Y + 4, startX + width, p2Y + 4);
  p2Y += 4;

  const totalDeducoes = deductionsList.reduce((acc, ded) => acc + ded.val, 0);
  const valorLiquido = totalBruto - totalDeducoes;

  drawTextBox(startX, p2Y, 63, 8, "100 TOTAL DEDUÇÕES (DESCONTOS)", "R$ " + formatCurrency(totalDeducoes), true);
  
  doc.setFillColor(235, 245, 235);
  doc.rect(startX + 63, p2Y, 127, 8, "F");
  drawTextBox(startX + 63, p2Y, 127, 8, "VALOR LÍQUIDO A RECEBER (DEVIDO)", "R$ " + formatCurrency(valorLiquido), true, "right");
  p2Y += 8;

  // Bases de cálculo (INSS, FGTS, etc)
  const baseInss = gab.baseFgts || 0;
  const baseFgtsVal = gab.baseFgts || 0;
  const fgtsMes = gab.fgts || 0;
  const multaRescisoriaVal = activeChallenge.id === "3.8" ? 0 : fgtsMes * (activeChallenge.id === "3.6" ? 0.2 : 0.4);

  drawTextBox(startX, p2Y, 47.5, 6, "BASE CÁLCULO INSS", "R$ " + formatCurrency(baseInss));
  drawTextBox(startX + 47.5, p2Y, 47.5, 6, "BASE CÁLCULO FGTS", "R$ " + formatCurrency(baseFgtsVal));
  drawTextBox(startX + 95, p2Y, 47.5, 6, "FGTS DO MÊS APURADO (8%)", "R$ " + formatCurrency(fgtsMes));
  drawTextBox(startX + 142.5, p2Y, 47.5, 6, "MULTA RESCISÓRIA FGTS", "R$ " + formatCurrency(multaRescisoriaVal));
  p2Y += 6;

  // --- 06 - FORMALIZAÇÃO DA RESCISÃO / QUITAÇÃO (ART. 477 DA CLT) E HOMOLOGAÇÃO (campos 150 a 158) ---
  doc.setFillColor(235, 235, 235);
  doc.rect(startX, p2Y, width, 4, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(0, 0, 0);
  doc.text("06 - FORMALIZAÇÃO DA RESCISÃO / QUITAÇÃO (ART. 477 DA CLT) E HOMOLOGAÇÃO", startX + 2, p2Y + 2.8);
  doc.line(startX, p2Y + 4, startX + width, p2Y + 4);
  p2Y += 4;

  const signH = 16;
  const dataFatoStr = activeChallenge.empregado.dataFato || "—";
  
  // Linha 1: 150, 151, 152
  drawTextBox(startX, p2Y, 63, signH, "150 local e data de recebimento", "SÃO PAULO, SP, " + dataFatoStr);
  drawTextBox(startX + 63, p2Y, 63, signH, "151 carimbo e assinatura do empregador", `\n\n___________________________________\n${(employerDetails?.razaoSocial || "CRISRES SOLUÇÃO TRABALHISTA S/A").toUpperCase()}`);
  drawTextBox(startX + 126, p2Y, 64, signH, "152 assinatura do trabalhador", "\n\n___________________________________\n" + activeChallenge.empregado.nome.toUpperCase());
  p2Y += signH;

  // Linha 2: 153, 154, 155
  drawTextBox(startX, p2Y, 63, signH, "153 assinatura resp. legal trabalhador", "\n\n___________________________________\nDispensada p/ Reforma Trabalhista (Art. 477)");
  drawTextBox(startX + 63, p2Y, 63, signH, "154 homologação - ass. assistente", "\n\n___________________________________\nMinistério do Trabalho e Emprego");
  drawTextBox(startX + 126, p2Y, 64, signH, "155 digital do trabalhador", "\n[ Polegar Direito ]\n\n\n");
  p2Y += signH;

  // Linha 3: 156, 157
  drawTextBox(startX, p2Y, 95, signH, "156 digital do responsável legal", "\n[ Polegar Direito do Assistente ]\n\n\n");
  drawTextBox(startX + 95, p2Y, 95, signH, "157 identificação do órgão homologador", "MTE / DRT SP - MINISTÉRIO DO TRABALHO");
  p2Y += signH;

  // Linha 4: 158
  drawTextBox(startX, p2Y, width, 12, "158 recepção pelo banco (data e carimbo para saque do fgts)", "AGÊNCIA BANCÁRIA: _______________   DATA DO SAQUE: ___/___/_____   ASSINATURA DO CAIXA: _______________________");

  // Footnote and page number for Page 2
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor(120, 120, 120);
  doc.text("Documento oficial impresso em conformidade com a Portaria MTE nº 1.621/2010.", startX, height + 8);
  doc.text("PÁGINA 2 DE 2", startX + width, height + 8, { align: "right" });

  // Save the generated document
  doc.save(`TRCT_EP_${activeChallenge.id}_${activeChallenge.empregado.nome.replace(/\s+/g, "_")}.pdf`);
}

export interface CertificateExportData {
  certType: "individual-self" | "individual-partner" | "squad";
  displayName: string;
  displayMatricula: string;
  displayTurma: string;
  activeStudentMatricula: string;
  statusText: string;
  phaseName: string;
  stats: {
    correctCount: number;
    completedCount: number;
    hh: number;
    mm: number;
    acertoReal: number;
    acertoNota: number;
    arredondamentoAplicado: boolean;
    notaBase: number;
    bonus: number;
    notaFinal: number;
    excedente: number | null;
    approved: boolean;
    verificationCode: string;
  };
  hasSquad: boolean;
  squadPartners: { nomeCompleto: string; matricula: string }[];
  localEmissao: string;
  modalidadeText: string;
  dia: number;
  mesExtenso: string;
  ano: number;
}

export function exportCertificateToPDF(data: CertificateExportData) {
  const {
    certType,
    displayName,
    displayMatricula,
    displayTurma,
    activeStudentMatricula,
    statusText,
    phaseName,
    stats,
    hasSquad,
    squadPartners,
    localEmissao,
    modalidadeText,
    dia,
    mesExtenso,
    ano
  } = data;

  // Initialize jsPDF A4 document [297mm x 210mm] in landscape
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Main double border
  doc.setDrawColor(180, 83, 9); // Amber 700
  doc.setLineWidth(1.0);
  doc.rect(8, 8, 281, 194, "D");
  doc.setLineWidth(0.3);
  doc.rect(10, 10, 277, 190, "D");

  // Vintage corners
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.4);
  // Top-left
  doc.line(14, 14, 14, 24);
  doc.line(14, 14, 24, 14);
  // Top-right
  doc.line(283, 14, 283, 24);
  doc.line(283, 14, 273, 14);
  // Bottom-left
  doc.line(14, 196, 14, 186);
  doc.line(14, 196, 24, 196);
  // Bottom-right
  doc.line(283, 196, 283, 186);
  doc.line(283, 196, 273, 196);

  // Background Watermark "WORKSIM" in soft sand beige
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(110);
  doc.setTextColor(244, 240, 230);
  doc.text("WORKSIM", 148.5, 115, { align: "center" });

  // Header Section
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(120, 53, 4); // Amber 900
  doc.text("ESCOLA ESTADUAL PROFESSORA FLAVINA MARIA DA SILVA", 148.5, 22, { align: "center" });

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("CURSO TÉCNICO EM RECURSOS HUMANOS – 1.º SEMESTRE", 148.5, 27, { align: "center" });

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text("Unidade Curricular Profissional 3: Legislação Aplicada a Negócios", 148.5, 31.5, { align: "center" });

  // Divider Line
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.35);
  doc.line(40, 36, 257, 36);

  // Certificate Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(67, 20, 7); // Amber 950
  doc.text("CERTIFICADO DE CONCLUSÃO DE FASE", 148.5, 45, { align: "center" });

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Simulador Acadêmico de Legislação de RH – WorkSim", 148.5, 50, { align: "center" });

  // Attribution Text Paragraphs
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);

  const text1 = `Certificamos que ${certType === "squad" ? "o grupo de estudantes do" : "o(a) aluno(a)"} ${displayName.toUpperCase()}` +
    (certType !== "squad" ? `, N.º de matrícula: ${displayMatricula} | Turma: ${displayTurma}` : "") +
    `, estudante da Escola Estadual Professora Flavina Maria da Silva, regularmente matriculado(a) no Curso Técnico em Recursos Humanos – 1.º Semestre, e registrado(a) no sistema WorkSim sob a credencial de matrícula ${activeStudentMatricula},`;

  const text2 = `${statusText} a fase ${phaseName}, com o desempenho técnico-legal registrado e aferido pelas regras do simulador em tempo real:`;

  const lines1 = doc.splitTextToSize(text1, 250);
  doc.text(lines1, 23.5, 59, { align: "left" });

  const lines1Height = lines1.length * 4.5;
  const startText2Y = 59 + lines1Height + 1.5;

  const lines2 = doc.splitTextToSize(text2, 250);
  doc.text(lines2, 23.5, startText2Y, { align: "left" });

  const lines2Height = lines2.length * 4.5;
  const startTableY = startText2Y + lines2Height + 3.5;

  // Results Table
  const tblX = 58.5; // Centered
  const tblW = 180;
  let currentY = startTableY;
  const rowH = 6.8;

  // Table Header
  doc.setFillColor(242, 239, 234);
  doc.rect(tblX, currentY, tblW, rowH, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 4);
  doc.text("Indicador de Conformidade e Resolução", tblX + 4, currentY + 4.5);
  doc.text("Resultado Registrado", tblX + tblW - 4, currentY + 4.5, { align: "right" });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.15);
  doc.line(tblX, currentY + rowH, tblX + tblW, currentY + rowH);
  currentY += rowH;

  const tableRows = [
    { label: "Questões da fase", val: `${stats.correctCount} de ${stats.completedCount}` },
    { label: "Tempo total de resposta", val: `${stats.hh}h ${stats.mm}min` },
    { label: "Percentagem de acerto real", val: `${stats.acertoReal}%` },
    { 
      label: stats.arredondamentoAplicado ? "Percentagem para efeito de nota (Arredondada)" : "Percentagem para efeito de nota", 
      val: `${stats.acertoNota}%` 
    },
    { label: "Nota base (percentagem de nota / 10)", val: `${stats.notaBase.toFixed(1)}` },
    { 
      label: "Bônus por agilidade (para >75% de acerto real)", 
      val: stats.acertoReal > 75 ? `+${stats.bonus.toFixed(2)}` : "Não aplicável" 
    },
    { label: "Nota final consolidada", val: `${stats.notaFinal.toFixed(1)}`, isBold: true },
    { label: "Excedente (desempenho extraordinário)", val: stats.excedente !== null ? `+${stats.excedente.toFixed(2)}` : "—" },
    { label: "RESULTADO FINAL DA AVALIAÇÃO", val: stats.approved ? "APROVADO" : "REPROVADO", isResult: true }
  ];

  tableRows.forEach((r, idx) => {
    // Alternate row styling
    if (idx % 2 === 1) {
      doc.setFillColor(251, 250, 247);
      doc.rect(tblX, currentY, tblW, rowH, "F");
    }
    if (r.isResult) {
      doc.setFillColor(241, 248, 243);
      doc.rect(tblX, currentY, tblW, rowH, "F");
    }

    doc.line(tblX, currentY + rowH, tblX + tblW, currentY + rowH);

    if (r.isBold || r.isResult) {
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
    } else {
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(60, 60, 60);
    }
    doc.setFontSize(7.5);
    doc.text(r.label, tblX + 4, currentY + 4.5);

    if (r.isResult) {
      doc.setFont("Helvetica", "bold");
      if (stats.approved) {
        doc.setTextColor(21, 128, 61); // green-700
      } else {
        doc.setTextColor(190, 24, 74); // rose-700
      }
    } else {
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
    }
    doc.text(r.val, tblX + tblW - 4, currentY + 4.5, { align: "right" });

    currentY += rowH;
  });

  // Outer border of table
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.35);
  doc.rect(tblX, startTableY, tblW, currentY - startTableY, "D");

  // Squad details if applicable
  if (certType === "squad" && hasSquad && squadPartners.length > 0) {
    const squadY = currentY + 2.5;
    const squadH = 10;
    doc.setFillColor(253, 250, 242);
    doc.rect(tblX, squadY, tblW, squadH, "F");
    doc.rect(tblX, squadY, tblW, squadH, "D");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 4);
    doc.text("INTEGRANTES DO SQUAD HOMOLOGADOS CONJUNTAMENTE:", tblX + 4, squadY + 3.5);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(40, 40, 40);
    const integrantsText = squadPartners.map((p) => `${p.nomeCompleto} (${p.matricula})`).join("  |  ");
    doc.text(integrantsText, tblX + 4, squadY + 7.5, { maxWidth: tblW - 8 });

    currentY = squadY + squadH;
  }

  // Footer Section
  const footerY = 162;

  // Separator Line
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.25);
  doc.line(22, footerY - 3, 275, footerY - 3);

  // Column 1: Security
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text("AUTENTICAÇÃO DE SEGURANÇA", 22, footerY);

  doc.setFont("Courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`CÓDIGO: ${stats.verificationCode.toUpperCase()}`, 22, footerY + 5);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text("Verificável em worksim.com.br/verificar", 22, footerY + 9);

  // Column 2: Date & Location
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`Emitido em ${localEmissao}, aos ${dia} de ${mesExtenso} de ${ano}.`, 148.5, footerY + 2.5, { align: "center" });

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  // Remove "composto pelos..." to keep it short and elegant
  const cleanedModalidade = modalidadeText.split(" composto pelos")[0];
  doc.text(`MODALIDADE: ${cleanedModalidade.toUpperCase()}`, 148.5, footerY + 7, { align: "center" });

  // Column 3: Signature
  doc.setFont("Helvetica", "oblique");
  doc.setFontSize(9.5);
  doc.setTextColor(120, 53, 4);
  doc.text("Fábio Santana Lima", 238, footerY + 1.5, { align: "center" });

  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.2);
  doc.line(201, footerY + 4, 275, footerY + 4);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text("ASSINATURA DIGITAL DO RESPONSÁVEL", 238, footerY + 8, { align: "center" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text("Sistema WorkSim Acadêmico", 238, footerY + 11.5, { align: "center" });

  // Save/Download PDF
  const cleanedName = displayName.replace(/\s+/g, "_");
  doc.save(`Certificado_WorkSim_${cleanedName}_Fase_${phaseName.split(" ")[1]}.pdf`);
}

