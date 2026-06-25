import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });

// --- Gemini Sync ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Help TypeScript by casting if necessary, though it should work with standard SDK
const getModel = (name: string) => (ai as any).getGenerativeModel({ model: name });

app.use(express.json());

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

    const model = getModel("gemini-1.5-flash");
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType } }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = result.response;
    const text = response.text();
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
        faseAtual: 0,
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
