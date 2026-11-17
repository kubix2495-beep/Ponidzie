import { useState } from "react";
import { Compass, Mic } from "lucide-react";
import { PONIDZIE_TOWNS } from "../data/ponidzieData";

interface TownMonographSectionProps {
  selectedTownId: string;
  onSelectTown: (townId: string) => void;
  onRecordForTown: (townId: string) => void;
  storyCounts: Record<string, number>;
}

export default function TownMonographSection({
  selectedTownId,
  onSelectTown,
  onRecordForTown,
  storyCounts,
}: TownMonographSectionProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const activeTown =
    PONIDZIE_TOWNS.find((t) => t.id === selectedTownId) ?? PONIDZIE_TOWNS[0];

  const markImageFailed = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="miejscowosci" className="py-20 lg:py-28 border-b border-[#E5E2DC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#57534E] font-medium mb-3">
              02 · Monografie miejscowości
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] tracking-tight text-balance">
              Przewodnik po sześciu punktach Ponidzia
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Wybierz miejscowość Ponidzia"
            className="flex flex-wrap items-center gap-1 p-1 bg-[#EFECE5] rounded-lg border border-[#E2DFD7]"
          >
            {PONIDZIE_TOWNS.map((town) => {
              const active = town.id === activeTown.id;
              return (
                <button
                  key={town.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => onSelectTown(town.id)}
                  className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? "bg-white text-[#1C1917] shadow-xs"
                      : "text-[#57534E] hover:text-[#1C1917]"
                  }`}
                >
                  {town.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Town Detailed Monograph */}
        <article className="bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-10 lg:p-12">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#57534E] pb-6 border-b border-[#ECE9E2]">
            <span className="font-mono tabular-nums uppercase tracking-wider">
              Rozdział {activeTown.index}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeTown.subtitle}</span>
            <span aria-hidden="true">·</span>
            <span>{activeTown.regionNote}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              Nagrane opowieści: {storyCounts[activeTown.id] || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mt-8 items-start">
            <div className="lg:col-span-7">
              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1C1917] tracking-tight mb-6">
                {activeTown.name}
              </h3>

              <div className="space-y-5 max-w-prose text-[#292524] text-[15px] sm:text-base leading-[1.8]">
                <p className="editorial-drop-cap">{activeTown.editorialLead}</p>
                <p>{activeTown.editorialContinuation}</p>
              </div>

              {/* Curatorial Pull Quote (hairline top & bottom, no thick left border) */}
              <blockquote className="my-8 py-6 border-y border-[#E5E2DC]">
                <p className="font-serif italic text-xl sm:text-2xl text-[#1C1917] leading-relaxed">
                  „{activeTown.atmosphereQuote}”
                </p>
              </blockquote>

              <div className="pt-2">
                <p className="text-xs uppercase tracking-[0.16em] text-[#57534E] font-medium mb-2">
                  Wskazówka na spacer
                </p>
                <p className="text-sm sm:text-[15px] text-[#44403C] leading-relaxed max-w-prose">
                  {activeTown.walkingTip}
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-8">
              <figure>
                <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-[#ECE9E2] border border-[#E2DFD7]">
                  {failedImages[activeTown.id] ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#EFECE5] to-[#E2DDD2] text-[#57534E]">
                      <Compass className="w-8 h-8 mb-3 text-[#1E4D3B]" />
                      <span className="font-serif text-lg text-[#1C1917]">{activeTown.name}</span>
                      <span className="text-xs mt-1">{activeTown.subtitle}</span>
                    </div>
                  ) : (
                    <img
                      src={activeTown.image}
                      alt={activeTown.imageAlt}
                      referrerPolicy="no-referrer"
                      onError={() => markImageFailed(activeTown.id)}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <figcaption className="mt-2.5 font-serif italic text-xs text-[#57534E]">
                  {activeTown.imageCaption}
                </figcaption>
              </figure>

              <div>
                <h4 className="text-xs uppercase tracking-[0.16em] text-[#57534E] font-medium pb-3 border-b border-[#ECE9E2]">
                  Warto zobaczyć w terenie
                </h4>
                <dl className="divide-y divide-[#ECE9E2]">
                  {activeTown.highlights.map((highlight) => (
                    <div key={highlight.name} className="py-3.5">
                      <dt className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-medium text-sm text-[#1C1917]">
                          {highlight.name}
                        </span>
                        <span className="font-mono text-xs text-[#78716C] tabular-nums">
                          {highlight.era}
                        </span>
                      </dt>
                      <dd className="mt-1 text-xs sm:text-sm text-[#57534E] leading-relaxed">
                        {highlight.description}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onRecordForTown(activeTown.id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#1E4D3B] text-white text-sm font-medium hover:bg-[#173B2D] transition-colors whitespace-nowrap"
                >
                  <Mic className="w-4 h-4" />
                  <span>Nagraj wspomnienie z: {activeTown.name}</span>
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Compact 6-town Editorial Directory below */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PONIDZIE_TOWNS.map((town) => {
            const isSelected = town.id === activeTown.id;
            return (
              <button
                key={town.id}
                type="button"
                onClick={() => onSelectTown(town.id)}
                className={`text-left p-6 rounded-xl border transition-colors ${
                  isSelected
                    ? "bg-[#1E4D3B] text-white border-[#1E4D3B]"
                    : "bg-white text-[#1C1917] border-[#E5E2DC] hover:border-[#B8B2A6]"
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs mb-3 tabular-nums ${
                    isSelected ? "text-white/75" : "text-[#78716C]"
                  }`}
                >
                  <span className="font-mono">{town.index}</span>
                  <span>Opowieści: {storyCounts[town.id] || 0}</span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-1">{town.name}</h3>
                <p
                  className={`text-xs mb-3 ${
                    isSelected ? "text-white/80" : "text-[#1E4D3B]"
                  }`}
                >
                  {town.subtitle}
                </p>
                <p
                  className={`text-sm leading-relaxed line-clamp-2 ${
                    isSelected ? "text-white/90" : "text-[#57534E]"
                  }`}
                >
                  {town.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
