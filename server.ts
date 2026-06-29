import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });

// --- Email Config ---
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Gemini Sync ---
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper function to call Gemini with automatic retry and model fallback when encountering 503 or transient errors
async function generateContentWithRetry(options: {
  contents: any[];
  config?: any;
}) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    let delay = 500;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: options.config,
        });
        if (result) {
          return result;
        }
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.statusCode || (error?.error && error.error.code);
        const message = error?.message || "";
        
        console.warn(`Gemini generation failed for model ${model} (attempt ${attempt + 1}/${maxRetries}):`, message);

        // If it's a 4xx error that is NOT a rate limit (429), don't retry this model
        if (status && status >= 400 && status < 500 && status !== 429) {
          break; 
        }

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate content with Gemini API after all retries and fallbacks");
}

app.use(express.json({ limit: "10mb" })); // Increase limit for PDF base64

// Email Sending Endpoint
app.post("/api/send-cheat-sheet", async (req, res) => {
  const { email, studentName, pdfBase64, matricula, lang } = req.body;

  if (!email || !pdfBase64) {
    return res.status(400).json({ error: "Email e PDF são obrigatórios." });
  }

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Configuração de email ausente no servidor.");
    }

    const isEn = lang === "en";

    const mailOptions = {
      from: isEn ? `"HR Simulator" <${process.env.EMAIL_USER}>` : `"Simulador de RH" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: isEn ? `Review Answer Key - ${studentName}` : `Gabarito de Revisão - ${studentName}`,
      text: isEn
        ? `Hello ${studentName},\n\nAttached is your Review Answer Key (Cheat-sheet) with the incorrect challenges so far.\n\nHappy studying!\nHR Simulator Team`
        : `Olá ${studentName},\n\nSegue em anexo o seu Gabarito de Revisão com os desafios errados até agora.\n\nBons estudos!\nEquipe Simulador de RH`,
      attachments: [
        {
          filename: isEn ? `Review_Errors_${matricula}.pdf` : `Revisao_Erros_${matricula}.pdf`,
          content: pdfBase64.split("base64,")[1] || pdfBase64,
          encoding: "base64",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: isEn ? "Email sent successfully!" : "Email enviado com sucesso!" });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    res.status(500).json({ error: error.message || "Erro ao enviar email." });
  }
});

// Bulk Enrollment Endpoint
app.post("/api/process-attendance-sheet", upload.single("attendanceSheet"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const { turma, eje } = req.body; // e.g. "1B", "RH"
    if (!turma || !eje) {
      return res.status(400).json({ error: "Turma e Eixo são obrigatórios." });
    }

    const base64Data = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    const prompt = `Analise esta folha de chamada (imagem ou PDF) e extraia o NOME COMPLETO e o NÚMERO DE CHAMADA de cada aluno.
Retorne um JSON no formato:
{
  "students": [
    { "name": "Nome do Aluno", "number": "01" },
    ...
  ]
}
Importante: O número deve ser sempre com 2 dígitos (ex: 01, 12).
Ignore cabeçalhos ou rodapés, foque na lista de nomes e números.`;

    const result = await generateContentWithRetry({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = result.text || "{}";
    const parsedResult = JSON.parse(text);
    const currentYear = new Date().getFullYear();

    // Transform to application format
    const enrolledStudents = parsedResult.students.map((s: any) => {
      const matricula = `${turma}${s.number}${currentYear}${eje}`;
      return {
        id: Math.random().toString(36).substring(2, 9),
        nomeCompleto: s.name,
        matricula: matricula,
        sala: turma,
        ano: currentYear,
        cargo: "Candidato de RH",
        xp: 0,
        precisao: 0.0,
        faseAtual: -1,
        status: "Ativo",
        respostasDesafios: {}
      };
    });

    res.json({ students: enrolledStudents });
  } catch (error) {
    console.error("Erro ao processar folha de chamada:", error);
    res.status(500).json({ error: "Erro ao processar o arquivo com Gemini." });
  }
});

// Translate individual CLT challenge to English on-the-fly
app.post("/api/translate-challenge", async (req, res) => {
  const { challenge } = req.body;
  if (!challenge) {
    return res.status(400).json({ error: "Challenge object is required" });
  }

  const prompt = `You are an expert legal and technical translator specializing in Brazilian Labor Law (CLT) and Department of Personnel (DP) / HR concepts.
Translate the following CLT challenge to professional, accurate, and natural English:

Challenge ID: ${challenge.id}
Title (titulo): ${challenge.titulo}
Complaint/Question (queixa): ${challenge.queixa}
Technical Focus (focoTecnico): ${challenge.focoTecnico}
Justification/Explanation (justificativa): ${challenge.gabarito?.valoresCorretos?.justificativa || ""}
Options (opcoes):
${JSON.stringify(challenge.opcoes || [], null, 2)}

Return the translations in JSON format with exactly these fields:
{
  "titulo": "Translated Title",
  "queixa": "Translated Complaint/Question",
  "focoTecnico": "Translated Technical Focus (e.g., 'Article 3 of the CLT')",
  "justificativa": "Translated Justification/Explanation",
  "opcoes": [
    { "id": "a", "texto": "Translated option a, keeping the layout of 'a) text'" },
    ...
  ]
}`;

  try {
    const result = await generateContentWithRetry({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = result.text || "{}";
    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Error translating challenge:", error);
    res.status(500).json({ error: "Translation failed" });
  }
});

// Start Server with Vite Middleware
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
