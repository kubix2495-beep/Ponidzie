import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AudioLines,
  Check,
  FileAudio,
  Loader2,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import { PONIDZIE_TOWNS } from "../data/ponidzieData";
import {
  VoiceStory,
  deleteStory,
  saveStory,
  transcribeAudio,
} from "../services/storyStorage";

interface VoiceStoryStudioProps {
  stories: VoiceStory[];
  isLoadingStories: boolean;
  preselectedTownId: string;
  onStoriesChange: (stories: VoiceStory[]) => void;
}

function formatSeconds(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatDatePl(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Nie udało się odczytać pliku audio."));
      }
    };
    reader.onerror = () => reject(new Error("Błąd odczytu danych audio."));
    reader.readAsDataURL(blob);
  });
}

function getAudioDurationFromUrl(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration)) {
        resolve(Math.round(audio.duration));
      } else {
        resolve(0);
      }
    };
    audio.onerror = () => resolve(0);
    audio.src = url;
  });
}

export default function VoiceStoryStudio({
  stories,
  isLoadingStories,
  preselectedTownId,
  onStoriesChange,
}: VoiceStoryStudioProps) {
  const [inputMode, setInputMode] = useState<"record" | "upload">("record");
  const [townId, setTownId] = useState<string>(preselectedTownId || "pinczow");
  const [author, setAuthor] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  // Audio capture state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioDataUrl, setAudioDataUrl] = useState<string>("");
  const [audioMimeType, setAudioMimeType] = useState<string>("audio/webm");
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(12));

  // Transcription & saving state
  const [transcript, setTranscript] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Archive filtering & audio player state
  const [archiveFilterTown, setArchiveFilterTown] = useState<string>("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<Record<string, number>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playerAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (preselectedTownId) {
      setTownId(preselectedTownId);
    }
  }, [preselectedTownId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
      if (playerAudioRef.current) {
        playerAudioRef.current.pause();
      }
    };
  }, []);

  const townOptions = useMemo(
    () => [
      ...PONIDZIE_TOWNS.map((t) => ({ id: t.id, name: t.name })),
      { id: "ponidzie", name: "Całe Ponidzie" },
    ],
    []
  );

  const selectedTownName =
    townOptions.find((t) => t.id === townId)?.name ?? "Całe Ponidzie";

  const resetCapture = () => {
    setAudioDataUrl("");
    setUploadedFileName("");
    setAudioDuration(0);
    setRecordingSeconds(0);
    setTranscript("");
    setErrorMessage("");
    setSuccessMessage("");
    setWaveformBars(Array(24).fill(12));
  };

  const stopStreamResources = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(
        "Twoja przeglądarka nie obsługuje nagrywania z mikrofonu. Użyj opcji wgrania pliku audio."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg",
      ];
      const supportedMime =
        preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";

      const recorder = supportedMime
        ? new MediaRecorder(stream, { mimeType: supportedMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      // Live audio waveform visualization
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextCtor) {
        const ctx = new AudioContextCtor();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateBars = () => {
          analyser.getByteFrequencyData(dataArray);
          const nextBars = Array.from({ length: 24 }, (_, idx) => {
            const val = dataArray[idx % dataArray.length] ?? 0;
            return Math.max(10, Math.min(100, Math.round((val / 255) * 100)));
          });
          setWaveformBars(nextBars);
          animFrameRef.current = requestAnimationFrame(updateBars);
        };
        updateBars();
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      let startedAt = Date.now();
      recorder.onstop = async () => {
        const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const finalMime = recorder.mimeType || supportedMime || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: finalMime });
        stopStreamResources();

        try {
          const dataUrl = await readBlobAsDataUrl(blob);
          setAudioDataUrl(dataUrl);
          setAudioMimeType(finalMime);
          setAudioDuration(elapsed);
          setUploadedFileName("Nagranie mikrofonowe");
        } catch (err) {
          setErrorMessage(
            err instanceof Error ? err.message : "Nie udało się zapisać nagrania."
          );
        }
      };

      setRecordingSeconds(0);
      setIsRecording(true);
      startedAt = Date.now();
      recorder.start(250);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorMessage(
        "Brak dostępu do mikrofonu. Zezwól przeglądarce na dostęp do mikrofonu lub wgraj plik audio."
      );
      stopStreamResources();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      stopStreamResources();
    }
  };

  const handleAudioFile = async (file: File) => {
    setErrorMessage("");
    setSuccessMessage("");

    const maxBytes = 18 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage("Plik jest zbyt duży (maksymalnie 18 MB). Wybierz krótsze nagranie.");
      return;
    }

    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|ogg|webm)$/i.test(file.name)) {
      setErrorMessage("Wybierz poprawny plik audio (MP3, WAV, M4A, OGG lub WebM).");
      return;
    }

    try {
      const dataUrl = await readBlobAsDataUrl(file);
      const duration = await getAudioDurationFromUrl(dataUrl);
      setAudioDataUrl(dataUrl);
      setAudioMimeType(file.type || "audio/mpeg");
      setAudioDuration(duration);
      setUploadedFileName(file.name);
      setTranscript("");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Nie udało się wczytać pliku audio."
      );
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAudioFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleAudioFile(file);
    }
  };

  const handleRunTranscription = async () => {
    if (!audioDataUrl) {
      setErrorMessage("Najpierw nagraj swój głos lub wgraj plik audio.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsTranscribing(true);

    try {
      const result = await transcribeAudio({
        audioBase64: audioDataUrl,
        mimeType: audioMimeType,
        townName: selectedTownName,
      });
      setTranscript(result);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Nie udało się wykonać transkrypcji."
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handlePublishStory = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!audioDataUrl) {
      setErrorMessage("Dodaj nagranie głosowe przed zapisaniem opowieści.");
      return;
    }
    if (!title.trim() || !author.trim()) {
      setErrorMessage("Wpisz tytuł opowieści oraz imię lub podpis autora.");
      return;
    }

    let finalTranscript = transcript.trim();
    if (!finalTranscript) {
      setIsTranscribing(true);
      try {
        finalTranscript = await transcribeAudio({
          audioBase64: audioDataUrl,
          mimeType: audioMimeType,
          townName: selectedTownName,
        });
        setTranscript(finalTranscript);
      } catch (err) {
        setIsTranscribing(false);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Automatyczna transkrypcja nie powiodła się. Spróbuj ponownie."
        );
        return;
      }
      setIsTranscribing(false);
    }

    setIsSaving(true);
    try {
      const created = await saveStory({
        title: title.trim(),
        author: author.trim(),
        townId,
        townName: selectedTownName,
        transcript: finalTranscript,
        audioDataUrl,
        mimeType: audioMimeType,
        durationSeconds: audioDuration,
      });

      onStoriesChange([created, ...stories]);
      setTitle("");
      setAuthor("");
      resetCapture();
      setSuccessMessage("Twoja opowieść została zapisana wraz z transkrypcją w archiwum Ponidzia.");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Nie udało się zapisać opowieści."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePlay = (story: VoiceStory) => {
    if (playingId === story.id && playerAudioRef.current) {
      playerAudioRef.current.pause();
      setPlayingId(null);
      return;
    }

    if (playerAudioRef.current) {
      playerAudioRef.current.pause();
    }

    const audio = new Audio(story.audioDataUrl);
    playerAudioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        setPlayProgress((prev) => ({
          ...prev,
          [story.id]: Math.round((audio.currentTime / audio.duration) * 100),
        }));
      }
    };

    audio.onended = () => {
      setPlayingId(null);
      setPlayProgress((prev) => ({ ...prev, [story.id]: 0 }));
    };

    audio.play().catch(() => {
      setErrorMessage("Nie udało się odtworzyć tego nagrania w przeglądarce.");
    });
    setPlayingId(story.id);
  };

  const handleDelete = async (id: string) => {
    if (playingId === id && playerAudioRef.current) {
      playerAudioRef.current.pause();
      setPlayingId(null);
    }
    await deleteStory(id);
    onStoriesChange(stories.filter((s) => s.id !== id));
    setConfirmDeleteId(null);
  };

  const filteredStories = useMemo(() => {
    if (archiveFilterTown === "all") return stories;
    return stories.filter((s) => s.townId === archiveFilterTown);
  }, [stories, archiveFilterTown]);

  return (
    <section id="opowiesci" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#57534E] font-medium mb-3">
              03 · Żywe archiwum pamięci
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] tracking-tight text-balance">
              Dodaj własną opowieść głosową z Ponidzia
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#57534E] max-w-md leading-relaxed">
            Nagraj wspomnienie mikrofonem lub wgraj gotowy plik audio. Strona automatycznie
            przygotuje do niego czytelną transkrypcję w języku polskim.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 5 columns: Recorder & Transcription Studio */}
          <div className="lg:col-span-5 bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#ECE9E2]">
              <h3 className="font-serif text-xl font-semibold text-[#1C1917]">
                Studio nagrań
              </h3>
              <div className="flex items-center gap-1 p-1 bg-[#EFECE5] rounded-lg">
                <button
                  type="button"
                  onClick={() => setInputMode("record")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    inputMode === "record"
                      ? "bg-white text-[#1C1917] shadow-xs"
                      : "text-[#57534E] hover:text-[#1C1917]"
                  }`}
                >
                  Mikrofon
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("upload")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    inputMode === "upload"
                      ? "bg-white text-[#1C1917] shadow-xs"
                      : "text-[#57534E] hover:text-[#1C1917]"
                  }`}
                >
                  Plik audio
                </button>
              </div>
            </div>

            <form onSubmit={handlePublishStory} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="story-town"
                  className="block text-xs uppercase tracking-[0.12em] text-[#57534E] font-medium mb-2"
                >
                  Miejscowość na szlaku
                </label>
                <select
                  id="story-town"
                  value={townId}
                  onChange={(e) => setTownId(e.target.value)}
                  className="w-full rounded-lg border border-[#D6D3CB] bg-[#FBFBF9] px-3.5 py-2.5 text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1E4D3B]"
                >
                  {townOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="story-author"
                    className="block text-xs uppercase tracking-[0.12em] text-[#57534E] font-medium mb-2"
                  >
                    Autor / Głos
                  </label>
                  <input
                    id="story-author"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="np. Tata, Jan z Pińczowa"
                    className="w-full rounded-lg border border-[#D6D3CB] bg-[#FBFBF9] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D3B]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="story-title"
                    className="block text-xs uppercase tracking-[0.12em] text-[#57534E] font-medium mb-2"
                  >
                    Tytuł opowieści
                  </label>
                  <input
                    id="story-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="np. Dawne spacery nad Nidą"
                    className="w-full rounded-lg border border-[#D6D3CB] bg-[#FBFBF9] px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D3B]"
                  />
                </div>
              </div>

              {/* Audio Capture Box */}
              <div className="rounded-xl border border-[#E2DFD7] bg-[#F8F7F4] p-5">
                {inputMode === "record" ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-[#57534E]">
                        {isRecording
                          ? "Nagrywanie trwa..."
                          : audioDataUrl
                          ? "Nagranie gotowe do transkrypcji"
                          : "Naciśnij przycisk, aby rozpocząć opowieść"}
                      </span>
                      <span className="font-mono text-sm font-medium text-[#1C1917] tabular-nums">
                        {formatSeconds(isRecording ? recordingSeconds : audioDuration)}
                      </span>
                    </div>

                    {/* Real-time Waveform Visualizer */}
                    <div
                      aria-hidden="true"
                      className="h-14 flex items-center justify-between gap-1 px-2 mb-4 bg-white rounded-lg border border-[#E5E2DC]"
                    >
                      {waveformBars.map((heightPct, i) => (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full transition-all duration-100 ${
                            isRecording ? "bg-[#1E4D3B]" : "bg-[#C7C2B8]"
                          }`}
                          style={{ height: `${Math.max(12, heightPct)}%` }}
                        />
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E4D3B] text-white text-sm font-medium hover:bg-[#173B2D] transition-colors whitespace-nowrap"
                        >
                          <Mic className="w-4 h-4" />
                          <span>{audioDataUrl ? "Nagraj ponownie" : "Rozpocznij nagrywanie"}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#991B1B] text-white text-sm font-medium hover:bg-[#7F1D1D] transition-colors whitespace-nowrap"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Zatrzymaj nagranie</span>
                        </button>
                      )}

                      {audioDataUrl && !isRecording && (
                        <button
                          type="button"
                          onClick={resetCapture}
                          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#D6D3CB] text-xs font-medium text-[#44403C] hover:bg-white transition-colors whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Wyczyść</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="text-center py-4"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                      onChange={handleFileInputChange}
                      className="sr-only"
                    />
                    <FileAudio className="w-7 h-7 mx-auto mb-2.5 text-[#1E4D3B]" />
                    <p className="text-sm font-medium text-[#1C1917]">
                      {uploadedFileName && uploadedFileName !== "Nagranie mikrofonowe"
                        ? uploadedFileName
                        : "Przeciągnij plik audio lub wybierz z dysku"}
                    </p>
                    <p className="text-xs text-[#78716C] mt-1 mb-4">
                      Obsługiwane formaty: MP3, WAV, M4A, OGG, WebM (do 18 MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#D6D3CB] bg-white text-sm font-medium text-[#1C1917] hover:bg-[#F4F2ED] transition-colors whitespace-nowrap"
                    >
                      <Upload className="w-4 h-4 text-[#1E4D3B]" />
                      <span>Wybierz plik audio</span>
                    </button>
                  </div>
                )}

                {audioDataUrl && !isRecording && (
                  <div className="mt-4 pt-4 border-t border-[#E5E2DC]">
                    <audio controls src={audioDataUrl} className="w-full h-10" />
                  </div>
                )}
              </div>

              {/* Automatic Transcription Button & Editable Result */}
              {audioDataUrl && !isRecording && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="story-transcript"
                      className="text-xs uppercase tracking-[0.12em] text-[#57534E] font-medium"
                    >
                      Automatyczna transkrypcja
                    </label>
                    <button
                      type="button"
                      disabled={isTranscribing}
                      onClick={handleRunTranscription}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E4D3B] hover:underline disabled:opacity-50 whitespace-nowrap"
                    >
                      {isTranscribing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Rozpoznawanie mowy...</span>
                        </>
                      ) : (
                        <>
                          <AudioLines className="w-3.5 h-3.5" />
                          <span>
                            {transcript ? "Wykonaj transkrypcję ponownie" : "Generuj transkrypcję"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    id="story-transcript"
                    rows={5}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Kliknij „Generuj transkrypcję” powyżej lub zapisz od razu — tekst pojawi się automatycznie i będziesz mógł go jeszcze poprawić."
                    className="w-full rounded-lg border border-[#D6D3CB] bg-[#FBFBF9] px-3.5 py-2.5 text-sm text-[#1C1917] leading-relaxed placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#1E4D3B]"
                  />
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-xs sm:text-sm text-[#991B1B]"
                >
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div
                  role="status"
                  className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-xs sm:text-sm text-[#166534] flex items-center gap-2"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isRecording || isTranscribing || isSaving || !audioDataUrl}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#1E4D3B] text-white text-sm font-medium hover:bg-[#173B2D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Trwa automatyczna transkrypcja...</span>
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Zapisywanie w archiwum...</span>
                  </>
                ) : (
                  <span>
                    {transcript.trim()
                      ? "Zapisz opowieść w archiwum"
                      : "Transkrybuj i zapisz opowieść"}
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Right 7 columns: Living Voice Archive */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E5E2DC] mb-6">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#1C1917]">
                  Nagrane opowieści ({filteredStories.length})
                </h3>
                <p className="text-xs text-[#78716C] mt-1">
                  Każde nagranie możesz odsłuchać i przeczytać w formie zapisanego tekstu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EFECE5] rounded-lg border border-[#E2DFD7]">
                <button
                  type="button"
                  onClick={() => setArchiveFilterTown("all")}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    archiveFilterTown === "all"
                      ? "bg-white text-[#1C1917] shadow-xs"
                      : "text-[#57534E] hover:text-[#1C1917]"
                  }`}
                >
                  Wszystkie
                </button>
                {PONIDZIE_TOWNS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setArchiveFilterTown(t.id)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      archiveFilterTown === t.id
                        ? "bg-white text-[#1C1917] shadow-xs"
                        : "text-[#57534E] hover:text-[#1C1917]"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingStories ? (
              <div className="bg-white border border-[#E5E2DC] rounded-xl p-10 text-center text-sm text-[#57534E]">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3 text-[#1E4D3B]" />
                <span>Wczytywanie archiwum opowieści...</span>
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="bg-white border border-[#E5E2DC] rounded-xl p-10 sm:p-12 text-center">
                <AudioLines className="w-8 h-8 mx-auto mb-3 text-[#1E4D3B]" />
                <h4 className="font-serif text-xl font-semibold text-[#1C1917] mb-2">
                  {archiveFilterTown === "all"
                    ? "Archiwum czeka na pierwszą opowieść"
                    : "Brak nagrań dla tej miejscowości"}
                </h4>
                <p className="text-sm text-[#57534E] max-w-md mx-auto leading-relaxed">
                  Nagraj wspomnienie Taty lub własną historię znad Nidy w studiu obok, a pojawi się
                  tu od razu z nagraniem audio i pełną transkrypcją.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredStories.map((story) => {
                  const isPlaying = playingId === story.id;
                  const progress = playProgress[story.id] || 0;

                  return (
                    <article
                      key={story.id}
                      className="bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-7"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#57534E] mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-[#1E4D3B]">{story.townName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{story.author}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatDatePl(story.createdAt)}</span>
                        </div>

                        {confirmDeleteId === story.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDelete(story.id)}
                              className="text-xs font-medium text-[#991B1B] hover:underline"
                            >
                              Potwierdź usunięcie
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-[#78716C] hover:underline"
                            >
                              Anuluj
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            aria-label={`Usuń opowieść ${story.title}`}
                            onClick={() => setConfirmDeleteId(story.id)}
                            className="p-1.5 rounded-md text-[#78716C] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <h4 className="font-serif text-2xl font-semibold text-[#1C1917] mb-4">
                        {story.title}
                      </h4>

                      {/* Custom Editorial Audio Bar */}
                      <div className="flex items-center gap-4 p-3.5 rounded-lg bg-[#F8F7F4] border border-[#ECE9E2] mb-5">
                        <button
                          type="button"
                          aria-label={isPlaying ? "Wstrzymaj nagranie" : "Odtwórz nagranie"}
                          onClick={() => handleTogglePlay(story)}
                          className="w-10 h-10 rounded-full bg-[#1E4D3B] text-white flex items-center justify-center shrink-0 hover:bg-[#173B2D] transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="h-1.5 w-full bg-[#E2DFD7] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1E4D3B] transition-all duration-150"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-xs text-[#57534E] tabular-nums shrink-0">
                          {story.durationSeconds > 0
                            ? formatSeconds(story.durationSeconds)
                            : "Audio"}
                        </span>
                      </div>

                      {/* Full Transcript */}
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-[#78716C] font-medium mb-2">
                          Transkrypcja nagrania
                        </p>
                        <p className="text-[15px] text-[#292524] leading-[1.75] whitespace-pre-line max-w-prose">
                          {story.transcript}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
