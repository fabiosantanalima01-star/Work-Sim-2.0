import express from "express";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import postgres from "postgres";

dotenv.config();

const app = express();

// Redirecionar automaticamente de HTTP para HTTPS em produção
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] === "http") {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
});

const upload = multer({ storage: multer.memoryStorage() });

// --- Neon PostgreSQL Integration ---
let sql: any = null;
let postgresConnected = false;
const dbConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (dbConnectionString) {
  try {
    sql = postgres(dbConnectionString, {
      ssl: "require",
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    // Self-initializing table on start
    (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS worksim_students (
            id TEXT PRIMARY KEY,
            matricula TEXT UNIQUE,
            nome_completo TEXT,
            xp INT,
            fase_atual INT,
            data JSONB NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        postgresConnected = true;
        console.log("Neon PostgreSQL: worksim_students table verified/created successfully.");
      } catch (err: any) {
        postgresConnected = false;
        console.warn("Neon PostgreSQL connection/init skipped (Database is not active or accessible):", err.message || err);
      }
    })();
  } catch (err) {
    postgresConnected = false;
    console.error("Failed to initialize postgres client with connection string:", err);
  }
}

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
app.get("/api/time", (req, res) => {
  res.json({ serverTime: Date.now() });
});

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

// --- Neon PostgreSQL API Endpoints ---

// Check if Neon DB is enabled/configured
app.get("/api/db-status", (req, res) => {
  res.json({
    neonEnabled: !!dbConnectionString && postgresConnected,
    firestoreEnabled: !!process.env.GEMINI_API_KEY,
  });
});

// Get all students
app.get("/api/db-students", async (req, res) => {
  if (!sql || !postgresConnected) {
    return res.json({ students: [], info: "Neon database not connected/configured", success: false });
  }

  try {
    const rows = await sql`
      SELECT data FROM worksim_students ORDER BY (data->>'nomeCompleto') ASC
    `;
    const students = rows.map((r: any) => r.data);
    res.json({ students, success: true });
  } catch (error: any) {
    console.error("Error fetching students from PostgreSQL:", error);
    res.status(500).json({ error: error.message || "Failed to fetch students." });
  }
});

// Single student upsert
app.post("/api/db-students/upsert", async (req, res) => {
  if (!sql || !postgresConnected) {
    return res.status(501).json({ error: "Neon database is not connected." });
  }

  const { student } = req.body;
  if (!student || !student.id) {
    return res.status(400).json({ error: "Invalid student object." });
  }

  try {
    await sql`
      INSERT INTO worksim_students (id, matricula, nome_completo, xp, fase_atual, data, updated_at)
      VALUES (
        ${student.id},
        ${student.matricula || null},
        ${student.nomeCompleto || ""},
        ${student.xp || 0},
        ${student.faseAtual ?? -1},
        ${sql.json(student)},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        matricula = EXCLUDED.matricula,
        nome_completo = EXCLUDED.nome_completo,
        xp = EXCLUDED.xp,
        fase_atual = EXCLUDED.fase_atual,
        data = EXCLUDED.data,
        updated_at = NOW()
    `;
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error upserting student in PostgreSQL:", error);
    res.status(500).json({ error: error.message || "Failed to upsert student." });
  }
});

// Bulk sync students
app.post("/api/db-students/bulk-sync", async (req, res) => {
  if (!sql || !postgresConnected) {
    return res.status(501).json({ error: "Neon database is not connected." });
  }

  const { students } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ error: "Expected an array of students." });
  }

  try {
    // Perform upsert inside a transaction
    await sql.begin(async (tx: any) => {
      for (const student of students) {
        if (!student.id) continue;
        await tx`
          INSERT INTO worksim_students (id, matricula, nome_completo, xp, fase_atual, data, updated_at)
          VALUES (
            ${student.id},
            ${student.matricula || null},
            ${student.nomeCompleto || ""},
            ${student.xp || 0},
            ${student.faseAtual ?? -1},
            ${tx.json(student)},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            matricula = EXCLUDED.matricula,
            nome_completo = EXCLUDED.nome_completo,
            xp = EXCLUDED.xp,
            fase_atual = EXCLUDED.fase_atual,
            data = EXCLUDED.data,
            updated_at = NOW()
        `;
      }
    });
    res.json({ success: true, count: students.length });
  } catch (error: any) {
    console.error("Error bulk syncing students in PostgreSQL:", error);
    res.status(500).json({ error: error.message || "Failed to bulk sync students." });
  }
});

// Delete single student
app.delete("/api/db-students/:id", async (req, res) => {
  if (!sql || !postgresConnected) {
    return res.status(501).json({ error: "Neon database is not connected." });
  }

  const { id } = req.params;
  try {
    await sql`
      DELETE FROM worksim_students WHERE id = ${id}
    `;
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting student from PostgreSQL:", error);
    res.status(500).json({ error: error.message || "Failed to delete student." });
  }
});

// Delete all students (Reset DB)
app.post("/api/db-students/reset", async (req, res) => {
  if (!sql || !postgresConnected) {
    return res.status(501).json({ error: "Neon database is not connected." });
  }

  try {
    await sql`
      TRUNCATE worksim_students
    `;
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error truncating worksim_students:", error);
    res.status(500).json({ error: error.message || "Failed to reset database." });
  }
});

// Scraping Google Drive public folder embedded view to list files dynamically
app.get("/api/drive-folder/:folderId", async (req, res) => {
  const { folderId } = req.params;
  try {
    const url = `https://drive.google.com/embeddedfolderview?hl=en&id=${folderId}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) {
      throw new Error(`Google Drive retornou status ${response.status}`);
    }
    const html = await response.text();
    
    // Parse files from the HTML response
    const files: { id: string; name: string }[] = [];
    
    // Google Drive's embedded folderview uses <div class="flip-entry" id="entry-FILE_ID">...
    // followed by <div class="flip-entry-title">FILE_NAME</div>
    const entryBlocks = html.split('class="flip-entry"');
    for (let i = 1; i < entryBlocks.length; i++) {
      const block = entryBlocks[i];
      const idMatch = block.match(/id="entry-([a-zA-Z0-9_-]+)"/);
      const titleMatch = block.match(/class="flip-entry-title">([^<]+)<\/div>/);
      
      if (idMatch && titleMatch) {
        files.push({
          id: idMatch[1],
          name: titleMatch[1].trim()
        });
      }
    }
    
    res.json({ success: true, files });
  } catch (error: any) {
    console.error("Erro ao raspar pasta do Google Drive:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido ao ler pasta do Drive." });
  }
});

// --- Cloudinary Secure Audio Upload Endpoint ---
app.post("/api/upload-audio", upload.single("audio"), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      return res.status(501).json({ error: "Cloudinary não está configurado no servidor (CLOUDINARY_URL ausente)." });
    }

    // Parse cloudinary://<api_key>:<api_secret>@<cloud_name>
    const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (!match) {
      return res.status(500).json({ error: "Formato CLOUDINARY_URL inválido." });
    }

    const apiKey = match[1];
    const apiSecret = match[2];
    const cloudName = match[3];

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "worksim_audios";
    
    // Sort parameters alphabetically: folder, timestamp
    const signatureStr = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const crypto = await import("crypto");
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Cloudinary video/upload handles audio format as well
    const formData = new URLSearchParams();
    formData.append("file", base64Data);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("folder", folder);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json() as any;

    if (!response.ok) {
      throw new Error(result.error?.message || "Erro no upload do Cloudinary.");
    }

    // Return the secure URL
    res.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
    });
  } catch (error: any) {
    console.error("Erro no upload do Cloudinary:", error);
    res.status(500).json({ error: error.message || "Erro ao fazer upload para o Cloudinary." });
  }
});

export default app;
