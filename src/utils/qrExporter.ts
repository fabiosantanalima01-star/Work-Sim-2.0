/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import { Student } from "../types";

/**
 * Fetches the QR code image from the high-speed API and converts it to a base64 DataURL
 * so it can be cleanly drawn into the jsPDF file.
 */
export async function fetchQRCodeAsBase64(data: string): Promise<string> {
  try {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("API response error");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error generating QR code on fallback backend:", error);
    // Fallback: Return a simple canvas-drawn black square or empty string
    return "";
  }
}

/**
 * Generates a beautiful, multi-page, print-ready PDF containing standard-sized (85mm x 55mm)
 * QR login badges for all selected employees, interns, and administrators of the WorkSim platform.
 */
export async function exportAllQRBadgesToPDF(students: Student[], appLanguage: "pt" | "en" = "pt"): Promise<void> {
  if (!students || students.length === 0) {
    console.warn("No students/admins selected for exporting QR badges.");
    return;
  }

  // Initialize jsPDF A4 document [210mm x 297mm], units in mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // A4 dimensions: 210 x 297 mm
  // We place up to 8 badges on a single sheet: 2 columns, 4 rows
  const marginX = 15;
  const marginY = 15;
  const badgeWidth = 85;
  const badgeHeight = 55;
  const gapX = 10;
  const gapY = 10;

  let currentBadgeCount = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];

    // Page overflow logic (8 badges max per page)
    if (currentBadgeCount > 0 && currentBadgeCount % 8 === 0) {
      doc.addPage();
    }

    const badgeIndexOnPage = currentBadgeCount % 8;
    const col = badgeIndexOnPage % 2; // 0 or 1
    const row = Math.floor(badgeIndexOnPage / 2); // 0, 1, 2, or 3

    const x = marginX + col * (badgeWidth + gapX);
    const y = marginY + row * (badgeHeight + gapY);

    await drawBadgeOnDoc(doc, x, y, student, student.foto, appLanguage);

    currentBadgeCount++;
  }

  // Save/Download the constructed document
  const fileName = `WorkSim_Crachas_Acesso_${Date.now()}.pdf`;
  doc.save(fileName);
}

/**
 * Exports a single individual badge, potentially with a custom user photo.
 */
export async function exportIndividualBadgePDF(student: Student, photoBase64?: string, appLanguage: "pt" | "en" = "pt"): Promise<void> {
  // Use a smaller format or centered in A4
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const x = (210 - 85) / 2; // Centered
  const y = 30;

  await drawBadgeOnDoc(doc, x, y, student, photoBase64, appLanguage);

  const fileName = `WorkSim_Cracha_${student.nomeCompleto.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}

/**
 * Shared logic to draw a single badge on a PDF document.
 */
async function drawBadgeOnDoc(
  doc: jsPDF, 
  x: number, 
  y: number, 
  student: Student, 
  photoBase64?: string,
  appLanguage: "pt" | "en" = "pt"
): Promise<void> {
  const badgeWidth = 85;
  const badgeHeight = 55;

  // 1. Draw Badge Border (Professional Rounded Corporate Look)
  doc.setDrawColor(209, 213, 219); // #D1D5DB (from Senior UI palette)
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  // draw rounded rect
  doc.roundedRect(x, y, badgeWidth, badgeHeight, 3.5, 3.5, "FD");

  // 2. Head Stripe Accent
  doc.setFillColor(29, 78, 216); // Brand Blue #1D4ED8
  doc.rect(x + 1, y + 1, badgeWidth - 2, 8, "F");

  // Header Text inside stripe
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("WORKSIM RH — CRACHÁ DE ACESSO", x + 5, y + 6.2);

  // 3. User Identification Details
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39); // #111827 - Soft pure black

  // Truncate name if it's too long
  let displayName = student.nomeCompleto;
  
  // If there's a photo, we shift the name to the right
  const hasPhoto = !!photoBase64;
  const textXOffset = hasPhoto ? 26 : 26; // Always keep space for photo/placeholder in official badges? 
  // No, let's keep it conditional but centered if no photo. 
  // Actually, user said "caso não [tenha foto] com espaço de foto para colar". 
  // So there's ALWAYS a space for a photo now.
  const drawPhotoSpace = true; 
  const effectiveTextXOffset = 28; 

  const qrSize = 24; // mm
  const qrX = x + badgeWidth - qrSize - 3;
  const qrY = y + 13;
  const maxTextWidth = qrX - (x + effectiveTextXOffset) - 2;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39); // #111827 - Soft pure black

  // Use maxWidth to prevent overlapping with QR
  doc.text(displayName, x + effectiveTextXOffset, y + 15, { maxWidth: maxTextWidth });

  // Role / Position
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(75, 85, 99); // #4B5563 - Graphite gray
  doc.text(student.cargo || "Estagiário de RH", x + effectiveTextXOffset, y + 21, { maxWidth: maxTextWidth });

  // Photo rendering or placeholder
  const photoWidth = 18;
  const photoHeight = 22;
  const photoX = x + 5;
  const photoY = y + 12;

  // Border for photo/placeholder
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  doc.rect(photoX, photoY, photoWidth, photoHeight, "D");

  if (hasPhoto) {
    try {
      doc.addImage(photoBase64!, "JPEG", photoX + 0.5, photoY + 0.5, photoWidth - 1, photoHeight - 1);
    } catch (e) {
      console.error("Error drawing photo badge:", e);
    }
  } else {
    // Placeholder text
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(4);
    doc.setTextColor(200, 200, 200);
    doc.text(appLanguage === "en" ? "PASTE PHOTO" : "COLAR FOTO", photoX + photoWidth/2, photoY + photoHeight/2 + 1, { align: "center" });
    doc.text("3x4", photoX + photoWidth/2, photoY + photoHeight/2 + 4, { align: "center" });
  }

  // Code Badge Monospace Pill
  doc.setFillColor(243, 244, 246); // Light gray #F3F4F6
  const pillWidth = Math.min(32, maxTextWidth);
  doc.roundedRect(x + effectiveTextXOffset, y + 25, pillWidth, 7, 1.2, 1.2, "F");
  
  doc.setFont("Courier", "bold");
  doc.setFontSize(7);
  doc.setTextColor(29, 78, 216); // Highlight Blue
  doc.text(`ID: ${student.matricula}`, x + effectiveTextXOffset + 2, y + 29.8);

  // School Class / Room
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(75, 85, 99);
  doc.text(`Sala/Turma: ${student.sala || "1B"}`, x + effectiveTextXOffset, y + 38);

  // Instructions and Warnings
  doc.setFontSize(4.5);
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(153, 27, 27); // Dark red #991B1B for warning
  const warningText = appLanguage === "en" 
    ? "PERSONAL & NON-TRANSFERABLE ACCESS. DO NOT SHARE THIS QR CODE."
    : "ACESSO PESSOAL E INTRANSFERÍVEL. NÃO COMPARTILHE ESTE QR CODE.";
  doc.text(warningText, x + 5, y + 46, { maxWidth: badgeWidth - 10 });

  doc.setFontSize(4.2);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  const infoText = appLanguage === "en"
    ? "Sharing your access may allow others to enter your student account."
    : "O compartilhamento pode permitir que terceiros entrem na sua conta de estudante.";
  doc.text(infoText, x + 5, y + 49, { maxWidth: badgeWidth - 10 });

  doc.setFontSize(5.5);
  doc.setFont("Helvetica", "oblique");
  doc.setTextColor(107, 114, 128); // Muted gray
  const instrText = appLanguage === "en" 
    ? "Position code in camera center to login."
    : "Aproxime da câmera para efetuar login.";
  doc.text(instrText, x + 5, y + 53, { maxWidth: badgeWidth - 10 });

  // 4. Fetch and Embed the Actual QR Code Image
  const qrBase64 = await fetchQRCodeAsBase64(student.matricula);
  if (qrBase64) {
    // Draw white background backing for QR code
    doc.setFillColor(255, 255, 255);
    doc.rect(qrX, qrY, qrSize, qrSize, "F");
    
    // Embed Image
    doc.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
    
    // Add subtle gray contour line to QR code box for luxury feel
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.15);
    doc.rect(qrX, qrY, qrSize, qrSize, "D");
  } else {
    // Draw a fallback box indicating failure to load
    doc.setFillColor(249, 250, 251);
    doc.rect(x + badgeWidth - 34, y + 12, 30, 30, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(156, 163, 175);
    doc.text("[QR Offline]", x + badgeWidth - 25, y + 28);
  }
}

