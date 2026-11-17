export interface VoiceStory {
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

const DB_NAME = "ponidzie_stories_db";
const STORE_NAME = "stories";

function openLocalDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readLocalStories(): Promise<VoiceStory[]> {
  try {
    const db = await openLocalDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = (req.result as VoiceStory[]) || [];
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

async function writeLocalStory(story: VoiceStory): Promise<void> {
  try {
    const db = await openLocalDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(story);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore IndexedDB quota errors silently
  }
}

async function removeLocalStory(id: string): Promise<void> {
  try {
    const db = await openLocalDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore IndexedDB delete errors
  }
}

export async function transcribeAudio(params: {
  audioBase64: string;
  mimeType: string;
  townName?: string;
}): Promise<string> {
  const response = await fetch("/api/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    transcript?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(
      payload.error || "Nie udało się wykonać transkrypcji nagrania. Spróbuj ponownie."
    );
  }

  if (!payload.transcript) {
    throw new Error("Transkrypcja zwróciła pusty tekst.");
  }

  return payload.transcript;
}

export async function fetchStories(): Promise<VoiceStory[]> {
  try {
    const response = await fetch("/api/stories");
    if (response.ok) {
      const data = (await response.json()) as { stories?: VoiceStory[] };
      const serverStories = Array.isArray(data.stories) ? data.stories : [];
      const localStories = await readLocalStories();
      const merged = new Map<string, VoiceStory>();
      for (const s of serverStories) merged.set(s.id, s);
      for (const l of localStories) {
        if (!merged.has(l.id)) merged.set(l.id, l);
      }
      return Array.from(merged.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch {
    // Static hosting fallback (e.g. Netlify without backend DB)
  }
  return readLocalStories();
}

export async function saveStory(
  input: Omit<VoiceStory, "id" | "createdAt">
): Promise<VoiceStory> {
  try {
    const response = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (response.ok) {
      const data = (await response.json()) as { story: VoiceStory };
      await writeLocalStory(data.story);
      return data.story;
    }
  } catch {
    // Static Netlify fallback stores directly in browser IndexedDB
  }

  const localStory: VoiceStory = {
    ...input,
    id: `story_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  await writeLocalStory(localStory);
  return localStory;
}

export async function deleteStory(id: string): Promise<void> {
  await removeLocalStory(id);
  try {
    await fetch(`/api/stories/${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch {
    // Ignore if running statically
  }
}
