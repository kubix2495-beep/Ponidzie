import { GoogleGenAI } from "@google/genai";

interface TranscribeRequestBody {
  audioBase64?: string;
  mimeType?: string;
  townName?: string;
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

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return Response.json({ error: "Metoda niedozwolona. Użyj POST." }, { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Brak klucza GEMINI_API_KEY w zmiennych środowiskowych Netlify." },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as TranscribeRequestBody;
    const rawBase64 = body.audioBase64?.includes(",")
      ? body.audioBase64.split(",")[1]
      : body.audioBase64;

    if (!rawBase64) {
      return Response.json({ error: "Brak danych audio do transkrypcji." }, { status: 400 });
    }

    const mimeType = normalizeAudioMimeType(body.mimeType);
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const contextHint = body.townName
      ? ` Nagranie dotyczy miejscowości lub okolic: ${body.townName} w regionie Ponidzia.`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: rawBase64,
            },
          },
          {
            text:
              "Dokonaj wiernej, starannej transkrypcji tego nagrania głosowego w języku polskim. " +
              "Zachowaj naturalną interpunkcję, podział na zdania i akapity oraz poprawne nazwy geograficzne Ponidzia " +
              "(Pińczów, Busko-Zdrój, Wiślica, Jędrzejów, Nowy Korczyn, Solec-Zdrój, Nida). " +
              "Zwróć wyłącznie sam tekst transkrypcji, bez żadnych dodatkowych komentarzy ani nagłówków." +
              contextHint,
          },
        ],
      },
    });

    const transcript = (response.text ?? "").trim();
    return Response.json({ transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Błąd transkrypcji nagrania.";
    return Response.json({ error: message }, { status: 500 });
  }
}
