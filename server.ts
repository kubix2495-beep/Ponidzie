import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "data");
const STORIES_FILE = path.join(DATA_DIR, "stories.json");

interface StoredStory {
  id: string;
  title: string;
  author: string;
  townId: string;
  townName: string;
  transcript: string;
  audioDataUrl: string;
  mimeType: string;
  durationSeconds: number;
  createdAt: string;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORIES_FILE)) {
    fs.writeFileSync(STORIES_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readStories(): StoredStory[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(STORIES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStories(stories: StoredStory[]): void {
  ensureDataDir();
  fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2), "utf-8");
}

function normalizeAudioMimeType(rawMime?: string): string {
  if (!rawMime || typeof rawMime !== "string") {
    return "audio/webm";
  }
  const base = rawMime.split(";")[0].trim().toLowerCase();
  if (base === "audio/x-wav" || base === "audio/wave") return "audio/wav";
  if (base === "audio/x-m4a" || base === "audio/m4a") return "audio/mp4";
  return base || "audio/webm";
}

async function startServer(): Promise<void> {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === "production";

  app.use(express.json({ limit: "25mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/transcribe", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: "Brak klucza GEMINI_API_KEY po stronie serwera. Sprawdź ustawienia Secrets.",
      });
      return;
    }

    const { audioBase64, mimeType, townName } = req.body as {
      audioBase64?: string;
      mimeType?: string;
      townName?: string;
    };

    const rawBase64 = audioBase64?.includes(",") ? audioBase64.split(",")[1] : audioBase64;
    if (!rawBase64 || rawBase64.trim().length < 16) {
      res.status(400).json({ error: "Przesłane nagranie audio jest puste lub niepoprawne." });
      return;
    }

    try {
      const cleanMime = normalizeAudioMimeType(mimeType);
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const contextHint = townName
        ? ` Nagranie może nawiązywać do miejscowości lub okolic: ${townName} na Ponidziu.`
        : "";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: cleanMime,
                data: rawBase64,
              },
            },
            {
              text:
                "Dokonaj wiernej, starannej transkrypcji tego nagrania głosowego w języku polskim. " +
                "Zachowaj naturalną interpunkcję, podział na zdania i akapity oraz poprawne nazwy własne związane z Ponidziem " +
                "(Pińczów, Busko-Zdrój, Wiślica, Jędrzejów, Nowy Korczyn, Solec-Zdrój, Nida). " +
                "Zwróć wyłącznie sam tekst transkrypcji, bez żadnych dodatkowych komentarzy ani wprowadzeń." +
                contextHint,
            },
          ],
        },
      });

      const transcript = (response.text ?? "").trim();
      if (!transcript) {
        res.status(422).json({
          error: "Nie udało się rozpoznać mowy w nagraniu. Upewnij się, że słychać głos wyraźnie i spróbuj ponownie.",
        });
        return;
      }

      res.json({ transcript });
    } catch (error) {
      console.error("Transcription error:", error);
      const message =
        error instanceof Error ? error.message : "Wystąpił błąd podczas transkrypcji nagrania.";
      res.status(500).json({ error: message });
    }
  });

  app.get("/api/stories", (_req, res) => {
    const stories = readStories();
    res.json({ stories });
  });

  app.post("/api/stories", (req, res) => {
    const body = req.body as Partial<StoredStory>;
    if (!body.title?.trim() || !body.author?.trim() || !body.transcript?.trim() || !body.audioDataUrl) {
      res.status(400).json({ error: "Uzupełnij tytuł, autora, nagranie oraz transkrypcję." });
      return;
    }

    const newStory: StoredStory = {
      id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: body.title.trim(),
      author: body.author.trim(),
      townId: body.townId || "ponidzie",
      townName: body.townName || "Całe Ponidzie",
      transcript: body.transcript.trim(),
      audioDataUrl: body.audioDataUrl,
      mimeType: normalizeAudioMimeType(body.mimeType),
      durationSeconds: Number(body.durationSeconds) || 0,
      createdAt: new Date().toISOString(),
    };

    const existing = readStories();
    const updated = [newStory, ...existing];
    writeStories(updated);
    res.status(201).json({ story: newStory });
  });

  app.delete("/api/stories/:id", (req, res) => {
    const { id } = req.params;
    const existing = readStories();
    const filtered = existing.filter((item) => item.id !== id);
    if (filtered.length === existing.length) {
      res.status(404).json({ error: "Nie znaleziono opowieści." });
      return;
    }
    writeStories(filtered);
    res.json({ deleted: id });
  });

  if (isProd) {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Przewodnik po Ponidziu server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
