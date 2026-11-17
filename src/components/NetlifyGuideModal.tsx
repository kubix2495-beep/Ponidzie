import { X } from "lucide-react";

interface NetlifyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NetlifyGuideModal({ isOpen, onClose }: NetlifyGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="netlify-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E2DC] rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#ECE9E2]">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#1E4D3B] font-medium mb-1">
              Wdrożenie produkcyjne
            </p>
            <h3 id="netlify-guide-title" className="font-serif text-2xl font-semibold text-[#1C1917]">
              Konfiguracja w Netlify
            </h3>
          </div>
          <button
            type="button"
            aria-label="Zamknij okno"
            onClick={onClose}
            className="p-2 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#F4F2ED] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm text-[#44403C] leading-relaxed">
          <p>
            Projekt zawiera już gotową konfigurację <span className="font-mono text-[#1C1917]">netlify.toml</span> oraz
            funkcję serwerową <span className="font-mono text-[#1C1917]">netlify/functions/transcribe.mts</span>, która
            obsługuje automatyczną transkrypcję głosu po wdrożeniu.
          </p>

          <ol className="space-y-3 list-decimal list-inside">
            <li>
              W panelu Netlify wybierz <strong>Add new site</strong> i połącz repozytorium projektu.
              Polecenia budowania (<span className="font-mono">npm run build</span>) oraz katalog{" "}
              <span className="font-mono">dist</span> zostaną wykryte automatycznie.
            </li>
            <li>
              W zakładce <strong>Site configuration → Environment variables</strong> dodaj zmienną{" "}
              <span className="font-mono text-[#1C1917]">GEMINI_API_KEY</span> ze swoim kluczem do
              usługi transkrypcji.
            </li>
            <li>
              Uruchom wdrożenie. Na wersji statycznej nagrania użytkowników zapisują się bezpiecznie w
              pamięci przeglądarki (IndexedDB), a jeśli zechcesz współdzielić je między wszystkimi
              odwiedzającymi w internecie, w kolejnym etapie możesz podpiąć bazę danych lub Netlify
              Blobs.
            </li>
          </ol>
        </div>

        <div className="mt-7 pt-5 border-t border-[#ECE9E2] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1E4D3B] text-white text-sm font-medium hover:bg-[#173B2D] transition-colors"
          >
            Rozumiem
          </button>
        </div>
      </div>
    </div>
  );
}
