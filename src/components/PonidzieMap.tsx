import { ArrowRight, Compass, Mic } from "lucide-react";
import { PONIDZIE_TOWNS, PonidzieTown } from "../data/ponidzieData";

interface PonidzieMapProps {
  selectedTownId: string;
  onSelectTown: (townId: string) => void;
  onRecordForTown: (townId: string) => void;
  storyCounts: Record<string, number>;
}

export default function PonidzieMap({
  selectedTownId,
  onSelectTown,
  onRecordForTown,
  storyCounts,
}: PonidzieMapProps) {
  const activeTown: PonidzieTown =
    PONIDZIE_TOWNS.find((t) => t.id === selectedTownId) ?? PONIDZIE_TOWNS[0];

  return (
    <section id="mapa" className="py-20 lg:py-28 border-b border-[#E5E2DC]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#57534E] font-medium mb-3">
              01 · Kartografia Doliny Nidy
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1917] tracking-tight text-balance">
              Sześć miejscowości wzdłuż biegu Nidy
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#57534E] max-w-md leading-relaxed">
            Kliknij wybrany punkt na mapie, aby prześledzić jego położenie względem rzeki oraz
            poznać najważniejsze miejsca i opowieści.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 bg-[#F2F0EB] border border-[#E2DFD7] rounded-xl p-5 sm:p-8 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-[#57534E] mb-4">
              <span className="font-mono uppercase tracking-wider">Niecka Nidziańska · Szkic szlaku</span>
              <span className="inline-flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#1E4D3B]" />
                <span>Północ ku górze</span>
              </span>
            </div>

            <svg
              viewBox="0 0 820 520"
              role="img"
              aria-label="Interaktywna mapa Ponidzia z rzeką Nidą oraz miejscowościami: Jędrzejów, Pińczów, Busko-Zdrój, Solec-Zdrój, Wiślica i Nowy Korczyn"
              className="w-full h-auto block select-none"
            >
              <defs>
                <pattern id="gridPonidzie" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#E2DFD7"
                    strokeWidth="0.75"
                  />
                </pattern>
              </defs>

              <rect width="820" height="520" rx="8" fill="#F8F7F4" />
              <rect width="820" height="520" rx="8" fill="url(#gridPonidzie)" opacity="0.65" />

              {/* Topographic contour shapes (Garb Pinczowski & Niecka Solecka) */}
              <path
                d="M 160 120 Q 320 90 480 185 T 690 250"
                fill="none"
                stroke="#DDD8CE"
                strokeWidth="1.25"
                strokeDasharray="4 4"
              />
              <path
                d="M 120 280 Q 280 250 420 330 T 720 390"
                fill="none"
                stroke="#DDD8CE"
                strokeWidth="1.25"
                strokeDasharray="4 4"
              />

              {/* Garb Pinczowski ridge label */}
              <text
                x="355"
                y="148"
                className="fill-[#8A857C] font-mono text-[10px] tracking-[0.18em] uppercase"
              >
                Garb Pińczowski
              </text>

              {/* Connecting heritage trail */}
              <path
                d="M 255 145 L 430 215 L 565 270 L 660 345 L 525 440 L 470 370 L 430 215"
                fill="none"
                stroke="#C5C0B5"
                strokeWidth="1.5"
                strokeDasharray="5 5"
              />

              {/* Biala / Czarna Nida tributaries */}
              <path
                d="M 185 70 Q 245 125 320 155 Q 375 180 415 205"
                fill="none"
                stroke="#5F86A0"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.7"
              />

              {/* Main Nida River meandering south to Wisla */}
              <path
                d="M 380 45 C 405 110, 445 150, 430 215 C 415 270, 465 305, 470 370 C 475 410, 505 428, 525 445"
                fill="none"
                stroke="#3B6E8C"
                strokeWidth="5.5"
                strokeLinecap="round"
              />

              {/* Wisla River at bottom */}
              <path
                d="M 190 475 C 330 468, 460 458, 530 445 C 615 432, 700 418, 790 412"
                fill="none"
                stroke="#2C5670"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.85"
              />

              <text
                x="442"
                y="296"
                className="fill-[#3B6E8C] font-serif italic text-[14px]"
                transform="rotate(75 442 296)"
              >
                rzeka Nida
              </text>
              <text
                x="655"
                y="446"
                className="fill-[#2C5670] font-serif italic text-[14px]"
              >
                rzeka Wisła
              </text>

              {/* Town pins */}
              {PONIDZIE_TOWNS.map((town) => {
                const isSelected = town.id === activeTown.id;
                const { x, y } = town.coordinates;
                const { dx, dy, align } = town.labelOffset;

                return (
                  <g
                    key={town.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Wybierz miejscowość ${town.name}`}
                    onClick={() => onSelectTown(town.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectTown(town.id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none group"
                  >
                    {/* Generous invisible hit area */}
                    <circle cx={x} cy={y} r={24} fill="transparent" />

                    {/* Selected outer halo */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r={15}
                        fill="#1E4D3B"
                        fillOpacity="0.14"
                        stroke="#1E4D3B"
                        strokeWidth="1.25"
                      />
                    )}

                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 7.5 : 5.5}
                      fill={isSelected ? "#1E4D3B" : "#1C1917"}
                      stroke="#F8F7F4"
                      strokeWidth="2"
                      className="transition-transform duration-150 group-hover:scale-125"
                    />

                    <text
                      x={x + dx}
                      y={y + dy}
                      textAnchor={align}
                      className={`font-sans text-[13px] transition-colors ${
                        isSelected
                          ? "fill-[#1E4D3B] font-semibold"
                          : "fill-[#292524] font-medium group-hover:fill-[#1E4D3B]"
                      }`}
                    >
                      {town.name}
                    </text>

                    {town.id === "pinczow" && (
                      <text
                        x={x + dx}
                        y={y + dy + 14}
                        textAnchor={align}
                        className="fill-[#78716C] font-mono text-[10px]"
                      >
                        Stolica Ponidzia
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E5E2DC] rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#ECE9E2]">
                <span className="font-mono text-xs text-[#57534E] tabular-nums">
                  {activeTown.index} / 06 · {activeTown.regionNote}
                </span>
                <span className="text-xs text-[#57534E] tabular-nums">
                  Opowieści: {storyCounts[activeTown.id] || 0}
                </span>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.16em] text-[#1E4D3B] font-medium mb-2">
                  {activeTown.subtitle}
                </p>
                <h3 className="font-serif text-3xl font-semibold text-[#1C1917] mb-4">
                  {activeTown.name}
                </h3>
                <p className="text-[#44403C] text-[15px] leading-relaxed mb-6">
                  {activeTown.summary}
                </p>

                <div className="space-y-3 pt-4 border-t border-[#ECE9E2]">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#78716C] font-medium">
                    Najważniejsze punkty na mapie
                  </p>
                  <ul className="space-y-2.5">
                    {activeTown.highlights.slice(0, 3).map((item) => (
                      <li key={item.name} className="text-sm text-[#292524]">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[#78716C]"> · {item.era}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-[#ECE9E2] flex flex-wrap items-center gap-3">
              <a
                href="#miejscowosci"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E4D3B] text-white text-sm font-medium hover:bg-[#173B2D] transition-colors whitespace-nowrap"
              >
                <span>Czytaj przewodnik</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => onRecordForTown(activeTown.id)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#D6D3CB] text-[#1C1917] text-sm font-medium hover:bg-[#F4F2ED] transition-colors whitespace-nowrap"
              >
                <Mic className="w-4 h-4 text-[#1E4D3B]" />
                <span>Dodaj głos z tego miejsca</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
