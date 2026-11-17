import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, Compass, Mic } from "lucide-react";
import { HERO_IMAGE, PONIDZIE_TOWNS } from "./data/ponidzieData";
import { VoiceStory, fetchStories } from "./services/storyStorage";
import PonidzieMap from "./components/PonidzieMap";
import TownMonographSection from "./components/TownMonographSection";
import VoiceStoryStudio from "./components/VoiceStoryStudio";
import NetlifyGuideModal from "./components/NetlifyGuideModal";

export default function App() {
  const [selectedTownId, setSelectedTownId] = useState<string>("pinczow");
  const [studioTownId, setStudioTownId] = useState<string>("pinczow");
  const [stories, setStories] = useState<VoiceStory[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState<boolean>(true);
  const [heroImageFailed, setHeroImageFailed] = useState<boolean>(false);
  const [isNetlifyModalOpen, setIsNetlifyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    fetchStories()
      .then((loaded) => {
        if (active) setStories(loaded);
      })
      .finally(() => {
        if (active) setIsLoadingStories(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const storyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const story of stories) {
      counts[story.townId] = (counts[story.townId] || 0) + 1;
    }
    return counts;
  }, [stories]);

  const handleRecordForTown = (townId: string) => {
    setStudioTownId(townId);
    const el = document.getElementById("opowiesci");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1917] flex flex-col">
      {/* Top Bar Contract: strictly 1 row, 3 zones */}
      <header className="sticky top-0 z-40 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-[#E5E2DC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
          <a
            href="#kraina"
            className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0"
          >
            Przewodnik po Ponidziu
          </a>

          <nav
            aria-label="Nawigacja główna"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
          >
            <a
              href="#kraina"
              className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0"
            >
              Kraina
            </a>
            <a
              href="#mapa"
              className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0"
            >
              Mapa Nidy
            </a>
            <a
              href="#miejscowosci"
              className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0"
            >
              Miejscowości
            </a>
            <a
              href="#opowiesci"
              className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0"
            >
              Głosy i Opowieści
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <a
              href="#opowiesci"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E4D3B] text-white text-xs sm:text-sm font-medium hover:bg-[#173B2D] transition-colors whitespace-nowrap shrink-0"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Dodaj opowieść</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Editorial Hero Section */}
        <section id="kraina" className="pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-[#E5E2DC]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
              <div className="lg:col-span-7">
                <p className="text-xs uppercase tracking-[0.18em] text-[#57534E] font-medium mb-4">
                  Dolina Nidy · Świętokrzyskie · Wirtualny Przewodnik
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] font-semibold text-[#1C1917] leading-[1.08] tracking-tight text-balance">
                  Kraina białego kamienia, meandrów Nidy i ludzkiej pamięci
                </h1>
              </div>

              <div className="lg:col-span-5">
                <p className="text-base text-[#44403C] leading-relaxed max-w-prose mb-6">
                  Od Pińczowa i Jędrzejowa, przez uzdrowiska w Busku-Zdroju i Solcu-Zdroju, aż po
                  piastowską Wiślicę i królewski Nowy Korczyn. Odkryj Ponidzie krok po kroku i
                  zostaw tu własną opowieść nagraną głosem.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="#miejscowosci"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1C1917] text-white text-sm font-medium hover:bg-[#292524] transition-colors whitespace-nowrap"
                  >
                    <span>Poznaj 6 miejscowości</span>
                    <ArrowDownRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#opowiesci"
                    className="text-sm font-medium text-[#1E4D3B] hover:underline whitespace-nowrap"
                  >
                    Nagraj lub wgraj opowieść
                  </a>
                </div>
              </div>
            </div>

            {/* Primary Focal Anchor Photography */}
            <figure className="mt-10 lg:mt-12">
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#ECE9E2] border border-[#E2DFD7]">
                {heroImageFailed ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center bg-gradient-to-br from-[#ECE9E2] to-[#DCD6CA] text-[#57534E]">
                    <Compass className="w-10 h-10 mb-3 text-[#1E4D3B]" />
                    <span className="font-serif text-2xl text-[#1C1917]">
                      Dolina rzeki Nidy · Ponidzie
                    </span>
                  </div>
                ) : (
                  <img
                    src={HERO_IMAGE}
                    alt="Poranna mgła nad rozlewiskami rzeki Nidy i zielonymi łąkami Ponidzia o wschodzie słońca"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImageFailed(true)}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E]">
                <span className="font-serif italic">
                  Ryc. 01 — Rozlewiska Nidy o poranku, krajobraz środkowego Ponidzia.
                </span>
                <span className="font-mono text-[#78716C]">50°31′N 20°31′E</span>
              </figcaption>
            </figure>

            {/* Clean 4-column Strip below Hero */}
            <div className="mt-12 pt-8 border-t border-[#E5E2DC] grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] tabular-nums">
                  {PONIDZIE_TOWNS.length}
                </p>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1">
                  Historyczne miejscowości na szlaku
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] tabular-nums">
                  153 km
                </p>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1">
                  Długość biegu rzeki Nidy do Wisły
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1C1917] tabular-nums">
                  XII–XIX w.
                </p>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1">
                  Zabytki od romanizmu po uzdrowiska
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E4D3B] tabular-nums">
                  {stories.length}
                </p>
                <p className="text-xs sm:text-sm text-[#57534E] mt-1">
                  Opowieści głosowych w archiwum
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Cartographic Trail Map */}
        <PonidzieMap
          selectedTownId={selectedTownId}
          onSelectTown={setSelectedTownId}
          onRecordForTown={handleRecordForTown}
          storyCounts={storyCounts}
        />

        {/* Six-Town Editorial Monograph Explorer */}
        <TownMonographSection
          selectedTownId={selectedTownId}
          onSelectTown={setSelectedTownId}
          onRecordForTown={handleRecordForTown}
          storyCounts={storyCounts}
        />

        {/* Voice Recording, Upload & Automatic Transcription Archive */}
        <VoiceStoryStudio
          stories={stories}
          isLoadingStories={isLoadingStories}
          preselectedTownId={studioTownId}
          onStoriesChange={setStories}
        />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E5E2DC] bg-[#F2F0EB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif text-lg font-semibold text-[#1C1917]">
              Przewodnik po Ponidziu
            </p>
            <p className="text-xs text-[#57534E] mt-1">
              Pińczów · Busko-Zdrój · Wiślica · Jędrzejów · Nowy Korczyn · Solec-Zdrój
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#57534E]">
            <a href="#mapa" className="hover:text-[#1C1917] transition-colors">
              Mapa szlaku
            </a>
            <a href="#miejscowosci" className="hover:text-[#1C1917] transition-colors">
              Miejscowości
            </a>
            <a href="#opowiesci" className="hover:text-[#1C1917] transition-colors">
              Dodaj opowieść
            </a>
            <button
              type="button"
              onClick={() => setIsNetlifyModalOpen(true)}
              className="font-medium text-[#1E4D3B] hover:underline"
            >
              Konfiguracja w Netlify
            </button>
          </div>
        </div>
      </footer>

      <NetlifyGuideModal
        isOpen={isNetlifyModalOpen}
        onClose={() => setIsNetlifyModalOpen(false)}
      />
    </div>
  );
}
