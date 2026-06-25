/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import { Student } from "../types";

export function exportContractToPDF(student: Student, appLanguage: "pt" | "en") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const width = 210;
  const height = 297;
  const margin = 20;

  // 1. BACKGROUND / BORDER
  doc.setDrawColor(30, 41, 59); // Slate-800
  doc.setLineWidth(0.5);
  doc.rect(5, 5, width - 10, height - 10);
  doc.setLineWidth(0.2);
  doc.rect(7, 7, width - 14, height - 14);

  // 2. CRESTS / BRASÕES (Header)
  // Let's draw a professional crest-like shape at the top center
  const centerX = width / 2;
  
  // Left side badge-like element
  doc.setFillColor(30, 41, 59);
  doc.circle(margin + 5, margin + 5, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("Helvetica", "bold");
  doc.text("W", margin + 5, margin + 6.5, { align: "center" });

  // Right side badge-like element
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.circle(width - margin - 5, margin + 5, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("RH", width - margin - 5, margin + 6.5, { align: "center" });

  // Main Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(22);
  doc.setFont("Helvetica", "bold");
  doc.text("WORKSIM RH LABORATORY", centerX, margin + 10, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(100, 116, 139); // Slate-400
  doc.text(appLanguage === "en" ? "OFFICIAL SIMULATION EMPLOYMENT CONTRACT" : "CONTRATO OFICIAL DE SIMULAÇÃO DE TRABALHO", centerX, margin + 16, { align: "center" });

  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(margin, margin + 22, width - margin, margin + 22);

  // 3. STUDENT INFO SECTION
  let currentY = margin + 35;

  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(appLanguage === "en" ? "1. IDENTIFICATION" : "1. IDENTIFICAÇÃO DO COLABORADOR", margin, currentY);
  
  currentY += 8;
  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  doc.text(`${appLanguage === "en" ? "Name" : "Nome"}: ${student.nomeCompleto}`, margin + 5, currentY);
  currentY += 6;
  doc.text(`${appLanguage === "en" ? "ID Card" : "Matrícula"}: ${student.matricula}`, margin + 5, currentY);
  currentY += 6;
  doc.text(`${appLanguage === "en" ? "Class/Room" : "Sala/Turma"}: ${student.sala}`, margin + 5, currentY);
  currentY += 6;
  doc.text(`${appLanguage === "en" ? "Role" : "Cargo"}: ${student.cargo || "Estagiário de RH"}`, margin + 5, currentY);

  // 4. CONTRACT CLAUSES
  currentY += 15;
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.text(appLanguage === "en" ? "2. CONTRACTUAL TERMS" : "2. TERMOS CONTRATUAIS", margin, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont("Helvetica", "normal");
  const clauses = appLanguage === "en" ? [
    "Clause 1: The employee commits to solving technical HR, Accounting, and Legal challenges.",
    "Clause 2: All performance metrics are tracked via the Real-Time Focus Telemetry system.",
    "Clause 3: Progression depends on accuracy, speed, and continuous dedication to the lab."
  ] : [
    "Cláusula 1ª: O colaborador compromete-se a resolver desafios técnicos de RH, Contabilidade e Direito.",
    "Cláusula 2ª: Todas as métricas de desempenho são rastreadas via sistema de Telemetria de Foco em Tempo Real.",
    "Cláusula 3ª: A progressão na carreira depende de precisão, agilidade e dedicação contínua ao laboratório."
  ];

  clauses.forEach(clause => {
    const splitClause = doc.splitTextToSize(clause, width - (margin * 2) - 10);
    doc.text(splitClause, margin + 5, currentY);
    currentY += (splitClause.length * 5) + 2;
  });

  // 5. CERTIFICATE OF PERFORMANCE (The requested "certidão")
  currentY += 10;
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.rect(margin, currentY, width - (margin * 2), 65, "F");
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.rect(margin, currentY, width - (margin * 2), 65, "D");

  currentY += 8;
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.text(appLanguage === "en" ? "PERFORMANCE CERTIFICATE" : "CERTIDÃO DE APONTAMENTO E DESEMPENHO", centerX, currentY, { align: "center" });

  currentY += 12;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  
  // CALCULATE HOURS
  const activeSeconds = student.tempoAtivoSegundos || 0;
  const hours = Math.floor(activeSeconds / 3600);
  const minutes = Math.floor((activeSeconds % 3600) / 60);
  const timeStr = `${hours}h ${minutes}m`;

  const metricsYStart = currentY;
  // Metric 1: Hours
  doc.setFont("Helvetica", "bold");
  doc.text(appLanguage === "en" ? "Simulator Time" : "Horas no Simulador", margin + 15, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text(timeStr, margin + 65, currentY);

  currentY += 8;
  // Metric 2: XP
  doc.setFont("Helvetica", "bold");
  doc.text(appLanguage === "en" ? "Total XP Points" : "Pontos de XP Total", margin + 15, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text(`${student.xp} XP`, margin + 65, currentY);

  currentY += 8;
  // Metric 3: Precision
  doc.setFont("Helvetica", "bold");
  doc.text(appLanguage === "en" ? "Metric Accuracy" : "Precisão Técnica", margin + 15, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text(`${(student.precisao * 100).toFixed(1)}%`, margin + 65, currentY);

  currentY += 8;
  // Metric 4: Telemetry (Focus Losses)
  doc.setFont("Helvetica", "bold");
  doc.text(appLanguage === "en" ? "Focus Efficiency" : "Telemetria de Foco", margin + 15, currentY);
  doc.setFont("Helvetica", "normal");
  const focusLosses = student.saidasTela || 0;
  const focusMsg = appLanguage === "en" 
    ? `${focusLosses} Screen Shifts Recorded` 
    : `${focusLosses} Desvios de Tela Registrados`;
  doc.text(focusMsg, margin + 65, currentY);

  // 6. SIGNATURES
  currentY += 35;
  doc.setDrawColor(30, 41, 59);
  doc.line(margin + 10, currentY, margin + 80, currentY);
  doc.line(width - margin - 80, currentY, width - margin - 10, currentY);

  currentY += 5;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(appLanguage === "en" ? "LABORATORY AUTHORIZATION" : "AUTORIZAÇÃO DO LABORATÓRIO", margin + 45, currentY, { align: "center" });
  doc.text(appLanguage === "en" ? "EMPLOYEE SIGNATURE" : "ASSINATURA DO COLABORADOR", width - margin - 45, currentY, { align: "center" });
  
  currentY += 5;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(student.nomeCompleto, width - margin - 45, currentY + 5, { align: "center" });

  // 7. FOOTER STAMP
  const footerY = height - 25;
  doc.setFontSize(7);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  const date = new Date().toLocaleDateString(appLanguage === "pt" ? "pt-BR" : "en-US");
  const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
  doc.text(`${appLanguage === "en" ? "Generated on" : "Documento emitido em"}: ${date} | HASH: ${hash}`, centerX, footerY, { align: "center" });
  doc.text("WORKSIM RH EDUCATION - ALL RIGHTS RESERVED © 2026", centerX, footerY + 4, { align: "center" });

  // SAVE
  doc.save(`Contrato_Trabalho_${student.nomeCompleto.replace(/\s+/g, "_")}.pdf`);
}
