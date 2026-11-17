export interface TownHighlight {
  name: string;
  era: string;
  description: string;
}

export interface PonidzieTown {
  id: string;
  index: string;
  name: string;
  subtitle: string;
  regionNote: string;
  coordinates: { x: number; y: number };
  labelOffset: { dx: number; dy: number; align: "start" | "end" | "middle" };
  image: string;
  imageAlt: string;
  imageCaption: string;
  summary: string;
  editorialLead: string;
  editorialContinuation: string;
  highlights: TownHighlight[];
  walkingTip: string;
  atmosphereQuote: string;
}

export const HERO_IMAGE = "/src/assets/images/hero_ponidzie_nida_1794945092852.jpg";

export const PONIDZIE_TOWNS: PonidzieTown[] = [
  {
    id: "pinczow",
    index: "01",
    name: "Pińczów",
    subtitle: "Stolica Ponidzia",
    regionNote: "Garb Pińczowski · Nad środkową Nidą",
    coordinates: { x: 430, y: 215 },
    labelOffset: { dx: 14, dy: -10, align: "start" },
    image: "/src/assets/images/pinczow_hill_kaplica_1794945094313.jpg",
    imageAlt: "Renesansowa kaplica z białego kamienia na wzgórzu nad doliną Nidy w Pińczowie",
    imageCaption: "Ryc. 02 — Wzgórze św. Anny i panorama doliny Nidy w okolicach Pińczowa.",
    summary:
      "Serce krainy nad Nidą, miasto białego wapienia, renesansowych zabytków i szerokich panoram z Góry św. Anny.",
    editorialLead:
      "Pińczów nie bez powodu nazywany jest stolicą Ponidzia. Położony u stóp wapiennego Garbu Pińczowskiego, od wieków splata w sobie historię polskich reformacji, rzeźbiarskich warsztatów Santi Gucciego i spokojny rytm nadnidziańskich łąk. W pogodne poranki z Góry św. Anny widać, jak Nida rozlewa się tu szerokimi zakolami, tworząc jeden z najbardziej malowniczych krajobrazów południowej Polski.",
    editorialContinuation:
      "To także miasto kamienia pińczowskiego — jasnego, miękkiego w obróbce wapienia, z którego wznoszono zarówno skromne kaplice, jak i renesansowe rezydencje. Spacerując od dawnego rynku ku Starej Synagodze i zespołowi pałacowemu Wielopolskich, łatwo poczuć skalę dawnego ośrodka kultury i rzemiosła, w którym historia nie przytłacza, lecz towarzyszy codziennemu życiu.",
    highlights: [
      {
        name: "Kaplica św. Anny",
        era: "1600 r. · Santi Gucci",
        description:
          "Manierystyczna perełka z pińczowskiego kamienia na szczycie wzgórza, skąd rozpościera się widok na całą dolinę Nidy.",
      },
      {
        name: "Stara Synagoga",
        era: "XVI–XVII w.",
        description:
          "Jeden z najstarszych zachowanych budynków synagogalnych w Polsce z renesansowym wnętrzem i polichromiami.",
      },
      {
        name: "Zespół klasztorny Paulinów i Pałac Wielopolskich",
        era: "XV–XVIII w.",
        description:
          "Monumentalna oś historyczna miasta wraz z zabytkowym parkiem i Muzeum Regionalnym.",
      },
      {
        name: "Ciuchcia Ekspres Ponidzie",
        era: "Kolej wąskotorowa",
        description:
          "Sezonowe przejazdy historyczną kolejką przez nadnidziańskie pola, sady i gipsowe pagórki.",
      },
    ],
    walkingTip:
      "Wejdź ścieżką od strony zalewu na Wzgórze św. Anny tuż przed zachodem słońca — biały kamień kaplicy nabiera wtedy ciepłego, miodowego odcienia.",
    atmosphereQuote:
      "Kto raz spojrzy z pińczowskiej góry na zakola Nidy, ten rozumie, dlaczego Ponidzie nazywa się polską Toskanią.",
  },
  {
    id: "busko-zdroj",
    index: "02",
    name: "Busko-Zdrój",
    subtitle: "Uzdrowisko wód siarczkowych",
    regionNote: "Niecka Solecka · Park Zdrojowy",
    coordinates: { x: 565, y: 270 },
    labelOffset: { dx: 14, dy: -8, align: "start" },
    image: "/src/assets/images/busko_solec_park_1794945093189.jpg",
    imageAlt: "Klasycystyczne sanatorium i drewniana tężnia solankowa wśród kasztanowców w parku zdrojowym",
    imageCaption: "Ryc. 03 — Aleje spacerowe, tężnia i klasycystyczna architektura uzdrowiskowa Ponidzia.",
    summary:
      "Klasycystyczne łazienki Henryka Marconiego, rozległy Park Zdrojowy i lecznicze źródła cenione od XIX stulecia.",
    editorialLead:
      "Busko-Zdrój wnosi do pejzażu Ponidzia elegancję dziewiętnastowiecznych kurortów i niespieszny rytm parkowych alei. Sercem części zdrojowej pozostaje gmach Łazienek „Marconi”, zaprojektowany w 1836 roku przez Henryka Marconiego na wzór rzymskich term, otoczony starymi lipami, platanami i kasztanowcami.",
    editorialContinuation:
      "Kilka minut spaceru od zdrojowych pawilonów zmienia się jednak nastrój miejsca: wystarczy skierować się w stronę sosnowych zagajników i gipsowych wychodni wokół Buska albo odwiedzić drewniany kościółek św. Leonarda z końca XVII wieku. Uzdrowiskowy spokój łączy się tu z autentycznym, wiejskim spokojem południowej Kielecczyzny.",
    highlights: [
      {
        name: "Sanatorium Marconi i Park Zdrojowy",
        era: "1836 r. · Klasycyzm",
        description:
          "Reprezentacyjny budynek z kolumnadą, salą koncertową oraz pijalnią wód siarczkowych i solankowych.",
      },
      {
        name: "Tężnia Solankowa w Busku-Zdroju",
        era: "Współczesna architektura uzdrowiskowa",
        description:
          "Jedna z największych tężni w Polsce, tworząca nad parkiem naturalny mikroklimat nasycony minerałami.",
      },
      {
        name: "Kościółek św. Leonarda",
        era: "1699 r. · Architektura drewniana",
        description:
          "Modrzewiowa świątynia na skraju miasta, pamiętająca czasy przed rozkwitem kurortu.",
      },
      {
        name: "Aleja Mickiewicza",
        era: "Trakt spacerowy",
        description:
          "Ponadkilometrowa lipowa aleja łącząca historyczne centrum miasta z dzielnicą zdrojową.",
      },
    ],
    walkingTip:
      "Poranny spacer Aleją Mickiewicza przed godziną dziewiątą pozwala zobaczyć park zdrojowy w ciszy, zanim zapełnią go kuracjusze.",
    atmosphereQuote:
      "W Busku czas odmierza szum starych lip w parku i zapach siarczkowych źródeł niosący się nad alejkami.",
  },
  {
    id: "wislica",
    index: "03",
    name: "Wiślica",
    subtitle: "Kamienna kolebka historii",
    regionNote: "Dolna Nida · Dawny gród piastowski",
    coordinates: { x: 470, y: 370 },
    labelOffset: { dx: -14, dy: -6, align: "end" },
    image: "/src/assets/images/wislica_kolegiata_1794945093486.jpg",
    imageAlt: "Gotycka kolegiata z białego wapienia na historycznym placu w Wiślicy",
    imageCaption: "Ryc. 04 — Monumentalna gotycka architektura sakralna dolnego Ponidzia.",
    summary:
      "Jedno z najważniejszych miejsc polskiej państwowości z bazyliką kazimierzowską, Płytą Orantów i Domem Długosza.",
    editorialLead:
      "Wiślica jest najmniejszym miastem o tak potężnej wadze historycznej. Wzniesiona na wapiennej wyspie wśród rozlewisk Nidy, była kluczowym grodem państwa Wiślan i Piastów, miejscem ogłoszenia Statutów Wiślickich przez Kazimierza Wielkiego oraz ośrodkiem, w którym swoje kroniki i inwentarze pisał Jan Długosz.",
    editorialContinuation:
      "Gdy wchodzi się do podziemi bazyliki kolegiackiej, zmysły uderza chłód białego kamienia i widok unikatowej na skalę europejską romańskiej Płyty Orantów z około 1175 roku. Na zewnątrz natomiast miasteczko zachowuje kameralny, niemal bezczasowy spokój — bez wielkomiejskiego zgiełku, z rzeką płynącą tuż za dawnymi murami.",
    highlights: [
      {
        name: "Bazylika Kolegiacka Narodzenia NMP",
        era: "1350 r. · Fundacja Kazimierza Wielkiego",
        description:
          "Dwunawowy gotycki kościół halowy o smukłych filarach i bogatym programie rzeźbiarskim.",
      },
      {
        name: "Płyta Orantów i Relikty Romańskie",
        era: "ok. 1175 r. · Rezerwat Archeologiczny",
        description:
          "Unikatowa gipsowa posadzka z wyrytymi postaciami modlących się fundatorów w podziemiach kolegiaty.",
      },
      {
        name: "Dom Jana Długosza",
        era: "1460 r. · Późny gotyk",
        description:
          "Ceglana wikarówka ufundowana przez słynnego kronikarza, mieszcząca dziś muzeum z cennymi zbiorami.",
      },
      {
        name: "Grodzisko na Łąkach i Psia Górka",
        era: "X–XII w.",
        description:
          "Wapienne wyniesienia nad Nidą z czytelnie zachowanym wałem wczesnośredniowiecznego grodu.",
      },
    ],
    walkingTip:
      "Po zwiedzeniu podziemi bazyliki przejdź nad brzeg Nidy w kierunku grodziska — zrozumiesz wtedy naturalną obronność tego miejsca.",
    atmosphereQuote:
      "W Wiślicy pod stopami ma się tysiąc lat zapisanych w gipsie i wapieniu.",
  },
  {
    id: "jedrzejow",
    index: "04",
    name: "Jędrzejów",
    subtitle: "Cysterski spokój i zegary słoneczne",
    regionNote: "Północne obrzeże Ponidzia · Biała i Czarna Nida",
    coordinates: { x: 255, y: 145 },
    labelOffset: { dx: 14, dy: 4, align: "start" },
    image: "/src/assets/images/jedrzejow_korczyn_heritage_1794945094196.jpg",
    imageAlt: "Dziedziniec klasztorny z kamiennym zegarem słonecznym, arkadami i ogrodem zielnym",
    imageCaption: "Ryc. 05 — Dziedzictwo cysterskie i tradycja pomiaru czasu na północnym krańcu Ponidzia.",
    summary:
      "Najstarsze opactwo cysterskie na ziemiach polskich oraz słynne na cały świat Muzeum im. Przypkowskich.",
    editorialLead:
      "Jędrzejów otwiera bramę Ponidzia od północy, łącząc surową, ponadczasową tradycję zakonu cystersów z pasją kolekcjonerską rodziny Przypkowskich. To właśnie w tutejszym archiopactwie ostatnie lata swojego życia spędził mistrz Wincenty Kadłubek — pierwszy polski kronikarz.",
    editorialContinuation:
      "Zaledwie kilkanaście minut spaceru dzieli klasztorne mury od rynku, przy którym znajduje się Muzeum im. Przypkowskich — posiadające jedną z największych kolekcji zegarów słonecznych i przyrządów astronomicznych na świecie. Jędrzejów uczy uważności na światło, cień i upływ czasu.",
    highlights: [
      {
        name: "Archiopactwo Cystersów",
        era: "XII–XVIII w.",
        description:
          "Najstarszy klasztor cysterski w Polsce z barokowymi organami i kaplicą bł. Wincentego Kadłubka.",
      },
      {
        name: "Muzeum im. Przypkowskich",
        era: "Założone w 1909 r.",
        description:
          "Trzecia na świecie kolekcja gnomoniki, dawnych map nieba, starodruków oraz historycznych wnętrz mieszczańskich.",
      },
      {
        name: "Jędrzejowska Kolej Dojazdowa",
        era: "Od 1915 r.",
        description:
          "Stacja początkowa historycznej wąskotorówki wiodącej w głąb doliny Nidy w stronę Pińczowa.",
      },
      {
        name: "Klasztorny ogród i wirydarz",
        era: "Tradycja monastyczna",
        description:
          "Spokojna przestrzeń zielna przy zabudowaniach opactwa, sprzyjająca wyciszeniu w trakcie podróży.",
      },
    ],
    walkingTip:
      "Odwiedź ogród za Muzeum im. Przypkowskich w słoneczne południe, kiedy liczne zegary słoneczne rzucają ostre cienie dokładnie na podziałki.",
    atmosphereQuote:
      "W Jędrzejowie nawet cień rzucany przez kamień staje się opowieścią o dawnym ładzie świata.",
  },
  {
    id: "nowy-korczyn",
    index: "05",
    name: "Nowy Korczyn",
    subtitle: "Królewskie miasto u ujścia Nidy",
    regionNote: "Widły Nidy i Wisły · Południe regionu",
    coordinates: { x: 525, y: 440 },
    labelOffset: { dx: -14, dy: 6, align: "end" },
    image: "/src/assets/images/wislica_kolegiata_1794945093486.jpg",
    imageAlt: "Historyczna ceglano-wapienna architektura królewskiego miasteczka u zbiegu rzek",
    imageCaption: "Ryc. 06 — Gotyckie i średniowieczne ślady królewskiego Nowego Korczyna.",
    summary:
      "Dawna siedziba zjazdów rycerskich i sejmików u zbiegu Nidy i Wisły, o wyjątkowym, wyciszonym uroku.",
    editorialLead:
      "Nowy Korczyn leży tam, gdzie Nida kończy swój bieg i oddaje wody Wiśle. W średniowieczu i renesansie było to miasto tętniące politycznym życiem Rzeczypospolitej — odbywały się tu zjazdy szlachty małopolskiej, a w tutejszym zamku zatrzymywali się królowie z dynastii Piastów i Jagiellonów.",
    editorialContinuation:
      "Dziś Nowy Korczyn zachwyca kontrastem między wielkością swojej przeszłości a kameralną ciszą brukowanych uliczek. Gotycki kościół św. Stanisława, pofranciszkański zespół klasztorny z XIII wieku i pamięć o wielokulturowej społeczności sprawiają, że jest to obowiązkowy przystanek na samym końcu nidziańskiego szlaku.",
    highlights: [
      {
        name: "Kościół i klasztor pofranciszkański św. Stanisława",
        era: "XIII–XVII w.",
        description:
          "Jedna z najstarszych świątyń franciszkańskich w Polsce, ufundowana przez Bolesława Wstydliwego i św. Kingę.",
      },
      {
        name: "Kościół Świętej Trójcy",
        era: "XVI w. · Renesans małopolski",
        description:
          "Fara o charakterystycznym szczycie i harmonijnej bryle dominującej nad dawnym miastem.",
      },
      {
        name: "Ruiny Synagogi i Dom Długosza",
        era: "Ślady dawnej wielokulturowości",
        description:
          "Klasycystyczne relikty synagogi oraz zabudowa przypominająca o związkach miasteczka z uczonym kronikarzem.",
      },
      {
        name: "Ujście Nidy do Wisły",
        era: "Krajobraz nadrzeczny",
        description:
          "Malownicze wały i łęgi nadrzeczne, gdzie spotykają się dwie wielkie rzeki regionu.",
      },
    ],
    walkingTip:
      "Przejdź pieszo lub rowerem na wał wiślany w pobliżu ujścia Nidy — to jedno z najbardziej spokojnych miejsc na całym szlaku.",
    atmosphereQuote:
      "Tutaj Nida żegna się ze swoimi łąkami i w ciszy wpływa w nurt Wisły.",
  },
  {
    id: "solec-zdroj",
    index: "06",
    name: "Solec-Zdrój",
    subtitle: "Siarczkowe źródła wśród lasów",
    regionNote: "Wschodnie Ponidzie · Uzdrowisko od 1837 r.",
    coordinates: { x: 660, y: 345 },
    labelOffset: { dx: 12, dy: 16, align: "start" },
    image: "/src/assets/images/busko_solec_park_1794945093189.jpg",
    imageAlt: "Zabytkowa drewniana architektura parkowa i aleje uzdrowiskowe w Solcu-Zdroju",
    imageCaption: "Ryc. 07 — Park Zdrojowy i tradycja uzdrowiskowa Solca-Zdroju.",
    summary:
      "Kameralny kurort słynący z najsilniejszych wód siarczkowych w kraju, drewnianych willi i sosnowych borów.",
    editorialLead:
      "Solec-Zdrój ma zupełnie inną skalę niż tętniące gwarem kurorty. Ukryty wśród lasów na wschodnim skraju Ponidzia, od 1837 roku przyciąga tych, którzy szukają nie tylko wyjątkowych wód leczniczych z głębokiego „Szybu Soleckiego”, lecz przede wszystkim prawdziwego wyciszenia.",
    editorialContinuation:
      "W zabytkowym parku zdrojowym zachowały się urokliwe drewniane wille z przełomu XIX i XX wieku o rzeźbionych werandach i ażurowych gankach. W pobliskim Świniarach oraz nad lokalnymi stawami można wciąż usłyszeć jedynie szum sosen i śpiew ptaków nad wodą.",
    highlights: [
      {
        name: "Park Zdrojowy i Łazienki",
        era: "Od 1837 r.",
        description:
          "Stuletni drzewostan z pomnikami przyrody, historycznymi pawilonami kąpielowymi i alejkami spacerowymi.",
      },
      {
        name: "Źródło „Szyb Solecki”",
        era: "Wody mineralne klasy europejskiej",
        description:
          "Najsilniejsze w Polsce i jedne z najbardziej stężonych wód siarczkowych w Europie.",
      },
      {
        name: "Drewniane wille uzdrowiskowe",
        era: "Przełom XIX i XX w.",
        description:
          "Zabytkowe pensjonaty takie jak „Prus” czy „Irena” z charakterystyczną stolarką kurortową.",
      },
      {
        name: "Kościół św. Mikołaja",
        era: "Neogotyk · 1937 r.",
        description:
          "Świątynia zaprojektowana na miejscu dawnego kościoła, wpisana w spokojny układ wsi uzdrowiskowej.",
      },
    ],
    walkingTip:
      "Zarezerwuj godzinę na niespieszny spacer wokół zabytkowych willi w parku, zanim ruszysz dalej w stronę Nowego Korczyna.",
    atmosphereQuote:
      "Solec-Zdrój to dowód na to, że prawdziwy wypoczynek nie potrzebuje wielkich bulwarów — wystarczą stare drzewa i dobre źródło.",
  },
];
