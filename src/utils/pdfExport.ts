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

export function exportTRCTToPDF(activeChallenge: any, appLanguage: "pt" | "en") {
  if (!activeChallenge || !activeChallenge.gabarito?.valoresCorretos) {
    console.error("Invalid active challenge dataset for PDF export.");
    return;
  }

  const gab = activeChallenge.gabarito.valoresCorretos;
  const params = getPointParamsForChallenge(activeChallenge);

  // Initialize jsPDF A4 document [210mm x 297mm], units in mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Calculate rubrics list exactly as on screen
  const rubricsList: RubricRow[] = [];
  if (gab.salario > 0) {
    const refLabel = activeChallenge.id === "3.6" ? (appLanguage === "en" ? "15 Days" : "15 Dias") : activeChallenge.id === "3.8" ? (appLanguage === "en" ? "04 Days" : "04 Dias") : (appLanguage === "en" ? "30 Days" : "30 Dias");
    rubricsList.push({ 
      cod: "101", 
      desc: appLanguage === "en" ? "BASE SALARY (PROPORTIONAL)" : "SALÁRIO BASE PROPORCIONAL", 
      ref: refLabel, 
      vencimento: gab.salario, 
      desconto: 0 
    });
  }
  if (gab.mediaHe > 0) {
    rubricsList.push({ 
      cod: "115", 
      desc: appLanguage === "en" ? "AVERAGE OVERTIME (12M)" : "MÉDIA HORAS EXTRAS (12M)", 
      ref: appLanguage === "en" ? "Average" : "Média", 
      vencimento: gab.mediaHe, 
      desconto: 0 
    });
  }
  if (gab.insalubridade > 0) {
    rubricsList.push({ 
      cod: "135", 
      desc: appLanguage === "en" ? "HAZARDOUS INSALUBRITY PREMIUM" : "ADICIONAL DE INSALUBRIDADE", 
      ref: appLanguage === "en" ? "40% s/ MW" : "40% s/ SM", 
      vencimento: gab.insalubridade, 
      desconto: 0 
    });
  }
  if (gab.periculosidade > 0) {
    rubricsList.push({ 
      cod: "140", 
      desc: appLanguage === "en" ? "DEATH-RISK DANGER PREMIUM" : "ADICIONAL DE PERICULOSIDADE", 
      ref: "30.00%", 
      vencimento: gab.periculosidade, 
      desconto: 0 
    });
  }
  if (gab.horasExtras > 0) {
    rubricsList.push({ 
      cod: "150", 
      desc: appLanguage === "en" ? "OVERTIME HOURS WORKED" : "HORAS EXTRAS REALIZADAS", 
      ref: appLanguage === "en" ? "Computed" : "Apuradas", 
      vencimento: gab.horasExtras, 
      desconto: 0 
    });
  }
  if (gab.adicionalNoturno > 0) {
    rubricsList.push({ 
      cod: "160", 
      desc: appLanguage === "en" ? "NIGHT SHIFT DIFFERENTIAL (CLT)" : "ADICIONAL NOTURNO (CLT)", 
      ref: appLanguage === "en" ? "20% Night" : "20% Not.", 
      vencimento: gab.adicionalNoturno, 
      desconto: 0 
    });
  }
  if (gab.comissoes > 0) {
    rubricsList.push({ 
      cod: "180", 
      desc: appLanguage === "en" ? "COMMISSIONS ON TARGETS" : "COMISSÕES S/ TAREFAS ACORDADAS", 
      ref: appLanguage === "en" ? "Comm." : "Comis.", 
      vencimento: gab.comissoes, 
      desconto: 0 
    });
  }
  if (gab.dsrHe > 0) {
    rubricsList.push({ 
      cod: "190", 
      desc: appLanguage === "en" ? "WEEKLY PAID REST (DSR)" : "REFLEXOS DSR S/ HE E VARIAVEIS", 
      ref: appLanguage === "en" ? "Law 605/49" : "Lei 605", 
      vencimento: gab.dsrHe, 
      desconto: 0 
    });
  }
  if (gab.salarioFamilia > 0) {
    rubricsList.push({ 
      cod: "210", 
      desc: appLanguage === "en" ? "FAMILY SALARY PREVIDENTIAL" : "SALÁRIO-FAMÍLIA (PREVIDÊNCIA)", 
      ref: activeChallenge.id === "3.6" ? (appLanguage === "en" ? "3 Quotas" : "3 Cotas") : (appLanguage === "en" ? "1 Quota" : "1 Cota"), 
      vencimento: gab.salarioFamilia, 
      desconto: 0 
    });
  }
  if (gab.inss > 0) {
    rubricsList.push({ 
      cod: "501", 
      desc: appLanguage === "en" ? "INSS SOCIAL SECURITY CONTRIBUTION" : "CONTRIBUIÇÃO PREVIDENCIÁRIA INSS", 
      ref: `${((gab.inss / gab.bruto) * 100).toFixed(1)}%`, 
      vencimento: 0, 
      desconto: gab.inss 
    });
  }
  if (gab.irrf > 0) {
    rubricsList.push({ 
      cod: "502", 
      desc: appLanguage === "en" ? "IRRF PAYROLL INCOME TAX" : "IMPOSTO DE RENDA RETIDO IRRF", 
      ref: appLanguage === "en" ? "Bracket" : "Tabela", 
      vencimento: 0, 
      desconto: gab.irrf 
    });
  }
  if (gab.vt > 0) {
    rubricsList.push({ 
      cod: "510", 
      desc: appLanguage === "en" ? "VALE-TRANSPORTE (VT) DEDUCTION" : "DESCONTO VALE-TRANSPORTE (LEI)", 
      ref: "6.00%", 
      vencimento: 0, 
      desconto: gab.vt 
    });
  }
  if (gab.faltasDesconto > 0) {
    rubricsList.push({ 
      cod: "520", 
      desc: appLanguage === "en" ? "UNEXCUSED ABSENCE & LOST DSR" : "DESCONTO DE FALTAS E DSR PERDIDO", 
      ref: appLanguage === "en" ? "Days/DSR" : "Dias/DSR", 
      vencimento: 0, 
      desconto: gab.faltasDesconto 
    });
  }

  // Pad the rest of the table so it always renders 10 static entries under the receipt
  const padCount = Math.max(10 - rubricsList.length, 0);
  const paddedList = [
    ...rubricsList,
    ...Array(padCount).fill({ cod: "", desc: "", ref: "", vencimento: 0, desconto: 0 })
  ];

  const sumVencimentos = rubricsList.reduce((acc, current) => acc + current.vencimento, 0);
  const sumDescontos = rubricsList.reduce((acc, current) => acc + current.desconto, 0);
  const valLiquido = sumVencimentos - sumDescontos;

  // Render borders
  const startX = 10;
  const startY = 10;
  const width = 190;
  const height = 277;

  // Main Border around A4
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.4);
  doc.rect(startX, startY, width, height);

  // --- HEADER SECTION (y: 10 to 35) ---
  doc.line(startX, 35, startX + width, 35); // Horizontal bottom line of header
  doc.line(startX + 130, startY, startX + 130, 35); // Vertical divider

  // Left - Employer details
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text("CRISRES SOLUÇÃO TRABALHISTA S/A", startX + 5, startY + 8);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text("CNPJ: 14.882.341/0001-02", startX + 5, startY + 14);
  doc.text("Rua da Consolidação, 1500 - São Paulo/SP - CEP: 01301-100", startX + 5, startY + 19);
  doc.text(appLanguage === "en" ? "Labor Compliance Simulator Office" : "Escritório de Simulação Legal do Ministério do Trabalho", startX + 5, startY + 24);

  // Right - Document identifier
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(appLanguage === "en" ? "PAYROLL PAYMENT RECEIPT" : "RECIBO DE PAGAMENTO DE SALÁRIO", startX + 133, startY + 8);
  doc.setFontSize(8);
  doc.setFont("Helvetica", "bold");
  doc.text(appLanguage === "en" ? "CLT OFFICIAL TRCT DEMONSTRATOR" : "DEMONSTRATIVO OFICIAL VERIFICADO", startX + 133, startY + 13);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`${appLanguage === "en" ? "Reference Month" : "Mês Referência"}: ${params.mes_referencia}`, startX + 133, startY + 21);
  doc.text(`${appLanguage === "en" ? "System Token ID" : "ID do Sistema"}: 000${activeChallenge.id.replace(".", "")}`, startX + 133, startY + 27);

  // --- EMPLOYEE REGISTRY BOX (y: 35 to 65) ---
  doc.line(startX, 50, startX + width, 50); // Mid divider line
  doc.line(startX, 65, startX + width, 65); // Bottom border line of registry

  // Vertical divisions for row 1 (y: 35 to 50)
  doc.line(startX + 20, 35, startX + 20, 50); // Cód divider
  doc.line(startX + 145, 35, startX + 145, 50); // Admissão divider

  // Row 1 Text Info
  // Employee ID
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "CODE" : "CÓD.", startX + 2, startY + 29);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(10, 10, 10);
  doc.text(`000${activeChallenge.id.replace(".", "")}`, startX + 3, startY + 36);

  // Employee Name
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "EMPLOYEE / WORKER" : "FUNCIONÁRIO / TRABALHADOR", startX + 22, startY + 29);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(10, 10, 10);
  doc.text(activeChallenge.empregado.nome.toUpperCase(), startX + 22, startY + 36);

  // Admission Date
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "ADMISSION" : "ADMISSÃO", startX + 147, startY + 29);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(10, 10, 10);
  doc.text(activeChallenge.empregado.dataAdmissao, startX + 147, startY + 36);

  // Vertical divisions for row 2 (y: 50 to 65)
  doc.line(startX + 105, 50, startX + 105, 65); // Cargo to CBO divider
  doc.line(startX + 145, 50, startX + 145, 65); // CBO to Jornada divider

  // Row 2 Text Info
  // Role
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "PRACTICAL ROLE / CONTRACT STIPULATION" : "CARGO CONTRATUAL REGISTRADO", startX + 2, startY + 44);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(10, 10, 10);
  doc.text(activeChallenge.empregado.cbo.split(" (")[0], startX + 2, startY + 51);

  // CBO
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text("CBO", startX + 107, startY + 44);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(10, 10, 10);
  const cboCode = activeChallenge.empregado.cbo.match(/\(([^)]+)\)/)?.[1] || "—";
  doc.text(cboCode, startX + 107, startY + 51);

  // Working Hours (Jornada)
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "JORNADA / UNIT" : "JORNADA TRIM." , startX + 147, startY + 44);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(10, 10, 10);
  doc.text(activeChallenge.empregado.jornada || "44 horas/semana", startX + 147, startY + 51);

  // --- RUBRIC TABLE SECTION (y: 65 to 185) ---
  // Table Header Background bar (Light Gray)
  doc.setFillColor(242, 244, 245);
  doc.rect(startX, 65, width, 8, "F");

  // Bottom line of header
  doc.line(startX, 73, startX + width, 73);

  // Table Column Headers Text
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  doc.text(appLanguage === "en" ? "CODE" : "CÓD", startX + 2, 70.5);
  doc.text(appLanguage === "en" ? "DESCRIPTION OF THE ACCOUNT / NATURE" : "DESCRIÇÃO DA VERBA / DESCONTO", startX + 18, 70.5);
  doc.text(appLanguage === "en" ? "REFERENCE" : "REFERÊNCIA", startX + 115, 70.5, { align: "center" });
  doc.text(appLanguage === "en" ? "CREDITS (R$)" : "PROVENTOS (R$)", startX + 160, 70.5, { align: "right" });
  doc.text(appLanguage === "en" ? "DEBITS (R$)" : "DESCONTOS (R$)", startX + 188, 70.5, { align: "right" });

  // Draw Vertical lines for columns in the table area (y: 65 to 183)
  const tblEndY = 183;
  doc.line(startX + 14, 65, startX + 14, tblEndY); // Cód column separator
  doc.line(startX + 100, 65, startX + 100, tblEndY); // Descrição column separator
  doc.line(startX + 130, 65, startX + 130, tblEndY); // Referência column separator
  doc.line(startX + 163, 65, startX + 163, tblEndY); // Proventos column separator

  // Iterate over 10 rows and draw horizontal separator grids
  let currentY = 73;
  const rowHeight = 11; // height representing each item beautifully

  doc.setFontSize(8);
  paddedList.forEach((row, index) => {
    // Fill background of alternate rows slightly for high contrast
    if (index % 2 === 1 && row.cod) {
      doc.setFillColor(252, 253, 254);
      doc.rect(startX, currentY, width, rowHeight, "F");
    }

    doc.line(startX, currentY + rowHeight, startX + width, currentY + rowHeight);

    if (row.cod) {
      doc.setTextColor(40, 40, 40);
      // Code
      doc.setFont("Helvetica", "bold");
      doc.text(row.cod, startX + 7, currentY + 7, { align: "center" });
      
      // Description
      doc.setFont("Helvetica", "bold");
      doc.text(row.desc, startX + 17, currentY + 7);
      
      // Reference
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(row.ref || "—", startX + 115, currentY + 7, { align: "center" });
      
      // Proventos (Vencimentos)
      doc.setTextColor(15, 110, 50);
      doc.setFont("Helvetica", "bold");
      const provVal = row.vencimento > 0 ? row.vencimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "";
      doc.text(provVal, startX + 160, currentY + 7, { align: "right" });
      
      // Descontos
      doc.setTextColor(180, 20, 20);
      const descVal = row.desconto > 0 ? row.desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "";
      doc.text(descVal, startX + 188, currentY + 7, { align: "right" });
    }

    currentY += rowHeight;
  });

  // Now currentY should be exactly tblEndY = 183

  // --- SUMMARY TOTALS SECTION (y: 183 to 207) ---
  // Outer rectangle for total summations divided into 3 pieces
  doc.line(startX, 207, startX + width, 207);
  doc.line(startX + 63, 183, startX + 63, 207); // Divider 1
  doc.line(startX + 126, 183, startX + 126, 207); // Divider 2

  // Total Proventos
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(6.5);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "TOTAL CREDITS (PROVENTOS)" : "TOTAL DE PROVENTOS (CRÉDITOS)", startX + 3, 189);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 110, 50);
  doc.text(`R$ ${sumVencimentos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, startX + 3, 199);

  // Total Descontos
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(6.5);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "TOTAL DEDUCTIONS (DESCONTOS)" : "TOTAL DE DESCONTOS (DEDUÇÕES)", startX + 66, 189);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(180, 20, 20);
  doc.text(`R$ ${sumDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, startX + 66, 199);

  // Liquid (Net Amount Paid)
  // Fill background of Net Liquid box dynamically for priority notice
  doc.setFillColor(240, 248, 242);
  doc.rect(startX + 126, 183, 64, 24, "F");
  doc.line(startX + 126, 183, startX + 126 + 64, 183); // Redraw borders over background

  doc.setFont("Helvetica", "mono");
  doc.setFontSize(7.5);
  doc.setTextColor(10, 10, 10);
  doc.text(appLanguage === "en" ? "NET AMOUNT A RECEIVE" : "VALOR LÍQUIDO A RECEBER", startX + 129, 189);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(11, 74, 30);
  doc.text(`R$ ${valLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, startX + 129, 199);

  // --- ANALYTICAL BASES BOX (y: 207 to 230) ---
  doc.line(startX, 230, startX + width, 230);
  doc.line(startX + 47.5, 207, startX + 47.5, 230); // Base 1 Divider
  doc.line(startX + 95, 207, startX + 95, 230); // Base 2 Divider
  doc.line(startX + 142.5, 207, startX + 142.5, 230); // Base 3 Divider

  doc.setFont("Helvetica", "mono");
  doc.setFontSize(6);
  doc.setTextColor(110, 110, 110);

  // 1: Salário Contratual
  doc.text(appLanguage === "en" ? "CONTRACTUAL WAGE" : "SALÁRIO CONTRATUAL", startX + 2, 213);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`R$ ${activeChallenge.empregado.salarioBase?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, startX + 2, 223);

  // 2: Base Contribuição INSS
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(6);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "INSS CONTRIB. BASE" : "BASE CONTRIB. INSS", startX + 49.5, 213);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`R$ ${gab.baseFgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, startX + 49.5, 223);

  // 3: Base Cálculo FGTS
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(6);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "FGTS CALCULATION BASE" : "BASE CÁLCULO FGTS", startX + 97, 213);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`R$ ${gab.baseFgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, startX + 97, 223);

  // 4: FGTS do Mês (8%)
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(6);
  doc.setTextColor(110, 110, 110);
  doc.text(appLanguage === "en" ? "FGTS MONTH DEPOSIT (8%)" : "FGTS DO MÊS APURADO (8%)", startX + 144.5, 213);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(10, 10, 10);
  doc.text(`R$ ${gab.fgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, startX + 144.5, 223);


  // --- LEGAL VALIDITY & SIGNATURES SECTION (y: 230 to 287) ---
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);

  // Title on legal validity
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(appLanguage === "en" ? "LEGAL COMPLIANCE WARRANTY" : "DECLARAÇÃO DE VALOR JURÍDICO RECONHECIDO", startX + 5, 240);

  // Paragraph
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  const textLine1 = appLanguage === "en" 
    ? "I hereby declare having received the exact cash/deposit net amount detailed in this" 
    : "Declaro ter recebido a importância líquida e integral descrita neste recibo";
  const textLine2 = appLanguage === "en" 
    ? "document as final compensation before legal termination per Article 477 of CLT." 
    : "de pagamento, dando plena, geral e irrevogável quitação sob termos do Artigo 477 da CLT.";
  doc.text(textLine1, startX + 5, 247);
  doc.text(textLine2, startX + 5, 252);

  // Audit Footer stamp decoration
  doc.setFillColor(248, 249, 250);
  doc.rect(startX + 5, 258, 100, 16);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text(appLanguage === "en" ? "OFFICIAL COMPLIANCE BARCODE METRICS:" : "CHANCE DE VALIDADE REGULATÓRIA: 100%", startX + 8, 263);
  doc.setFont("Helvetica", "mono");
  doc.setFontSize(6);
  doc.text(`REF-HASH-TOKEN: CLTx772x023x000${activeChallenge.id.replace(".", "")}xFFA982B`, startX + 8, 268);
  doc.text(appLanguage === "en" ? "STATUS: CONFORME E-SOCIAL MINISTERIO DO TRABALHO DIGITAL" : "ESTADO: REGISTRADO EM CONFORMIDADE COM e-SOCIAL E MTE", startX + 8, 271);

  // Draw signature fields on the right-hand side
  doc.line(startX + 115, 230, startX + 115, 287); // Left side division divider

  const signatureY = 265;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("______ / ______ / _________", startX + 120, signatureY);
  doc.text(appLanguage === "en" ? "Date" : "Data", startX + 120, signatureY + 5);

  doc.line(startX + 120, signatureY + 14, startX + 185, signatureY + 14);
  doc.setFontSize(7);
  doc.text(appLanguage === "en" ? "Employee / Trainee Legal Signature" : "Assinatura do Funcionário / Beneficiário", startX + 120, signatureY + 19);

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
  doc.text("ESCOLA ESTADUAL PROFª FLORIANA LOPES", 148.5, 22, { align: "center" });

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
    `, estudante da Escola Estadual Profª Floriana Lopes, regularmente matriculado(a) no Curso Técnico em Recursos Humanos – 1.º Semestre, e registrado(a) no sistema WorkSim sob a credencial de matrícula ${activeStudentMatricula},`;

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

