/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import { Student } from "../types";

/**
 * Generates a signed, certified digital receipt/PDF for parental consent.
 */
export function exportParentalAuthorizationToPDF(
  student: Student,
  guardianName: string,
  guardianCpf: string,
  guardianPhone: string,
  timestamp: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const width = 210;
  const height = 297;
  const margin = 20;
  const centerX = width / 2;

  // 1. BACKGROUND & DOUBLE BORDER
  doc.setDrawColor(30, 41, 59); // Slate-800
  doc.setLineWidth(0.5);
  doc.rect(5, 5, width - 10, height - 10);
  doc.setDrawColor(16, 185, 129); // Emerald-500
  doc.setLineWidth(0.25);
  doc.rect(7, 7, width - 14, height - 14);

  // 2. HEADER
  doc.setFillColor(30, 41, 59);
  doc.circle(margin + 5, margin + 5, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("Helvetica", "bold");
  doc.text("W", margin + 5, margin + 6.5, { align: "center" });

  doc.setFillColor(16, 185, 129);
  doc.circle(width - margin - 5, margin + 5, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.text("OK", width - margin - 5, margin + 6.5, { align: "center" });

  // Titles
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont("Helvetica", "bold");
  doc.text("WORKSIM RH LABORATORY", centerX, margin + 6, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("CERTIFICADO DE HOMOLOGAÇÃO DE AUTORIZAÇÃO PARENTAL", centerX, margin + 12, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("ESCOLA ESTADUAL PROFESSORA FLAVINA MARIA DA SILVA", centerX, margin + 17, { align: "center" });

  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(margin, margin + 21, width - margin, margin + 21);

  let currentY = margin + 30;

  // 3. STUDENT IDENTIFICATION
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("1. IDENTIFICAÇÃO DO(A) ESTUDANTE (MENOR DE IDADE)", margin, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont("Helvetica", "normal");
  doc.text(`Nome Completo: ${student.nomeCompleto}`, margin + 5, currentY);
  currentY += 6;
  doc.text(`Matrícula Operacional: ${student.matricula}`, margin + 5, currentY);
  currentY += 6;
  doc.text(`Turma / Sala: ${student.sala} (Ano: ${student.ano})`, margin + 5, currentY);

  // 4. GUARDIAN IDENTIFICATION
  currentY += 14;
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.text("2. IDENTIFICAÇÃO DO RESPONSÁVEL LEGAL AUTORIZADOR", margin, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont("Helvetica", "normal");
  doc.text(`Nome do Responsável: ${guardianName}`, margin + 5, currentY);
  currentY += 6;
  doc.text(`CPF do Responsável: ${guardianCpf}`, margin + 5, currentY);
  currentY += 6;
  doc.text(`Telefone de Contato: ${guardianPhone}`, margin + 5, currentY);

  // 5. CLAUSES & DECLARATIONS
  currentY += 14;
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.text("3. DECLARAÇÃO DE CONSENTIMENTO E AUTORIZAÇÃO", margin, currentY);

  currentY += 8;
  doc.setFontSize(8.5);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85); // Slate-700

  const paragraphs = [
    `Como pai, mãe ou responsável legal devidamente identificado acima, declaro para os devidos fins de direito que AUTORIZO expressamente o cadastro do(a) menor no simulador WORKSIM RH Laboratory nas aulas do curso técnico de RH sob a regência do Prof. Fábio Santana Lima na Escola Estadual Professora Flavina Maria da Silva.`,
    "Estou ciente de que os dados cadastrados limitam-se ao primeiro nome do estudante (com inicial do sobrenome para fins de desempate de homônimos) e número da sala, garantindo total conformidade com a privacidade e proteção à identidade do menor.",
    "O cadastro no simulador WORKSIM RH é efetuado em um ambiente estritamente educacional, seguro e fechado, acessado de forma exclusiva por estudantes autorizados da turma e pelo professor, sendo todos os dados cadastrados definitivamente excluídos ao encerramento do ano letivo vigente.",
    "Entendo que a participação é facultativa e que, caso opte por não autorizar o uso do nome real, meu(minha) filho(a) operará a dinâmica sob um código fictício e anônimo sem qualquer tipo de prejuízo acadêmico."
  ];

  paragraphs.forEach(pText => {
    const splitText = doc.splitTextToSize(pText, width - (margin * 2) - 10);
    doc.text(splitText, margin + 5, currentY);
    currentY += (splitText.length * 4) + 2.5;
  });

  // 6. SIGNATURE BLOCK
  currentY = 235;
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.rect(margin, currentY, width - (margin * 2), 35, "DF");

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont("Helvetica", "bold");
  doc.text("DOCUMENTO HOMOLOGADO E ASSINADO DIGITALMENTE", margin + 5, currentY + 7);

  doc.setFontSize(8);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Assinado por: ${guardianName}`, margin + 5, currentY + 14);
  doc.text(`CPF do Assinante: ${guardianCpf} | Tel: ${guardianPhone}`, margin + 5, currentY + 19);
  
  const formattedDate = new Date(timestamp).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour12: false,
  });
  doc.text(`Protocolo de Segurança: AUT-${student.id.toUpperCase().slice(0, 8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`, margin + 5, currentY + 24);
  doc.text(`Data/Hora de Assinatura: ${formattedDate} (Horário de Brasília)`, margin + 5, currentY + 29);

  // Sign marker
  doc.setFillColor(16, 185, 129);
  doc.rect(width - margin - 25, currentY + 5, 20, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("Helvetica", "bold");
  doc.text("HOMOLOGADO", width - margin - 15, currentY + 11, { align: "center" });

  // Save the document
  doc.save(`Autorizacao_Digital_Worksim_${student.matricula}.pdf`);
}

/**
 * Generates a beautiful physical printable authorization form to print, sign manually, and deliver to the teacher.
 * Fully customized based on the user's detailed text template!
 */
export function exportPrintableParentalAuthorizationForm(student: Student) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const width = 210;
  const height = 297;
  const margin = 20;
  const centerX = width / 2;

  // 1. FRAME & BORDER (Clean & Professional Academic style)
  doc.setDrawColor(15, 23, 42); // Slate-900
  doc.setLineWidth(0.4);
  doc.rect(8, 8, width - 16, height - 16);
  doc.setDrawColor(71, 85, 105); // Slate-600
  doc.setLineWidth(0.15);
  doc.rect(10, 10, width - 20, height - 20);

  // 2. HEADER
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont("Helvetica", "bold");
  doc.text("AUTORIZAÇÃO PARA CADASTRO NO SIMULADOR WORKSIM RH LABORATORY", centerX, margin + 2, { align: "center" });

  doc.setFontSize(11);
  doc.text("ESCOLA ESTADUAL PROFESSORA FLAVINA MARIA DA SILVA", centerX, margin + 8, { align: "center" });

  doc.setDrawColor(148, 163, 184); // Slate-400
  doc.line(margin, margin + 12, width - margin, margin + 12);

  let currentY = margin + 19;

  // Prezado(a) responsável
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.text("Prezado(a) responsável,", margin, currentY);
  
  currentY += 6;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  
  const text1 = "O professor Fábio Santana Lima pretende utilizar o simulador WORKSIM RH Laboratory nas aulas do curso técnico de RH. É um ambiente digital onde os alunos praticam cálculos trabalhistas e rotinas de departamento pessoal, tudo dentro de um sistema fechado e seguro.";
  const splitText1 = doc.splitTextToSize(text1, width - (margin * 2));
  doc.text(splitText1, margin, currentY);
  currentY += (splitText1.length * 4.5) + 3;

  const text2 = "Para que seu/sua filho(a) possa acessar o simulador, precisamos fazer um cadastro básico.";
  doc.text(text2, margin, currentY);

  currentY += 8;
  doc.line(margin, currentY, width - margin, currentY);
  currentY += 6;

  // O que será cadastrado
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text("O que será cadastrado?", margin, currentY);
  
  currentY += 5.5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text("- Primeiro nome (ex: \"Ana\").", margin + 4, currentY);
  currentY += 4.5;
  doc.text("- Número da sala.", margin + 4, currentY);
  currentY += 5;
  const note1 = "*(Se houver dois alunos com o mesmo nome na mesma turma, usamos apenas a inicial do sobrenome para diferenciar, ex: \"Ana S.\").*";
  doc.setFont("Helvetica", "oblique");
  doc.text(note1, margin + 4, currentY);
  
  currentY += 6;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(185, 28, 28); // Red-700
  doc.text("Nunca será solicitado:", margin, currentY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(" RG, CPF, sobrenome completo, endereço, foto ou qualquer outro dado pessoal.", margin + 36, currentY);

  // Segurança
  currentY += 9;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Segurança", margin, currentY);
  currentY += 5;
  doc.setFont("Helvetica", "normal");
  const textSecurity = "O sistema é fechado: apenas alunos da turma e o professor têm acesso. Todos os dados serão excluídos ao final do ano letivo.";
  const splitSecurity = doc.splitTextToSize(textSecurity, width - (margin * 2));
  doc.text(splitSecurity, margin, currentY);

  // E se eu não quiser autorizar
  currentY += 12;
  doc.setFont("Helvetica", "bold");
  doc.text("E se eu não quiser autorizar?", margin, currentY);
  currentY += 5;
  doc.setFont("Helvetica", "normal");
  const textNoAuth = "Sem problema. Seu/sua filho(a) não será prejudicado(a) em nenhuma atividade ou nota. Ele(a) usará um código fictício (ex: \"Aluno_07\") e manterá total anonimato.";
  const splitNoAuth = doc.splitTextToSize(textNoAuth, width - (margin * 2));
  doc.text(splitNoAuth, margin, currentY);

  // Divider
  currentY += 11;
  doc.setDrawColor(148, 163, 184); // Slate-400
  doc.line(margin, currentY, width - margin, currentY);
  currentY += 7;

  // Autorização checkboxes
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.text("Autorização", margin, currentY);

  currentY += 6.5;
  // Box 1
  doc.rect(margin, currentY - 3, 4, 4);
  doc.setFont("Helvetica", "bold");
  doc.text("SIM, autorizo", margin + 6, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text(" o cadastro com o primeiro nome real (+ inicial do sobrenome, se necessário) e o número da sala.", margin + 30, currentY);

  currentY += 7;
  // Box 2
  doc.rect(margin, currentY - 3, 4, 4);
  doc.setFont("Helvetica", "bold");
  doc.text("NÃO autorizo.", margin + 6, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text(" Quero que meu/minha filho(a) use um código fictício.", margin + 30, currentY);

  currentY += 11;
  
  // Pre-fill fields section
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  
  // Student Name
  doc.text("Nome do(a) aluno(a):", margin, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text(student.nomeCompleto || "_________________________________", margin + 38, currentY);
  
  // Room
  doc.setFont("Helvetica", "bold");
  doc.text("Número da sala:", width - margin - 60, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text(student.sala || "_________", width - margin - 30, currentY);

  currentY += 7.5;
  doc.setFont("Helvetica", "bold");
  doc.text("Nome do responsável:", margin, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text("_______________________________________________________________", margin + 38, currentY);

  currentY += 7.5;
  doc.setFont("Helvetica", "bold");
  doc.text("Telefone:", margin, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text("____________________________", margin + 18, currentY);

  doc.setFont("Helvetica", "bold");
  doc.text("Data:", width - margin - 60, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text("____/____/______", width - margin - 48, currentY);

  currentY += 9.5;
  doc.setFont("Helvetica", "bold");
  doc.text("Assinatura do responsável:", margin, currentY);
  doc.setFont("Helvetica", "normal");
  doc.text("_________________________________________________________", margin + 46, currentY);

  // Footer Contacts
  currentY += 14;
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.line(margin, currentY, width - margin, currentY);
  currentY += 6;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Dúvidas? Fale com o professor:", margin, currentY);
  
  currentY += 4.5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Prof. Fábio Santana Lima – (67) 99243-1425 – fabiosantanalima@hotmail.com", margin, currentY);
  
  currentY += 4.5;
  doc.setFont("Helvetica", "bold");
  doc.text("Coordenação Pedagógica da Escola", margin, currentY);
  currentY += 4;
  doc.setFont("Helvetica", "normal");
  doc.text("Telefone: _____________________  |  E-mail: _________________________________", margin, currentY);

  // Footer mark
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("WORKSIM RH LABORATORY - ESCOLA ESTADUAL PROFESSORA FLAVINA MARIA DA SILVA", centerX, height - 12, { align: "center" });

  // Save the document
  doc.save(`Termo_Autorizacao_Imprimir_${student.matricula}.pdf`);
}
