export interface GameType {
  id: string;
  name: string;
  category: "family" | "classic";
  description: string;
  basePoints: number;
  requiresPartner?: boolean;
  allowsPartner?: boolean;
  isTrickBased?: boolean;
  targetTricks?: number;
  minTricks?: number;
  maxTricks?: number;
  isMisere?: boolean;
  isPenalty?: boolean;
  presetOptions?: { label: string; value: string | number }[];
}

export const FAMILY_GAME_TYPES: GameType[] = [
  {
    id: "troela",
    name: "Troela",
    category: "family",
    description: "3 azen. Speel met de 4e aas. 10+ slagen = +15, kapot (13) = +20, 10- = -15",
    basePoints: 15,
    requiresPartner: true,
    isTrickBased: true,
    targetTricks: 10,
    presetOptions: [
      { label: "10+ slagen (+15p)", value: "10+" },
      { label: "Kapot gespeeld (13 slagen, +20p)", value: "kapot gespeeld" },
      { label: "10- slagen (verloren, -15p)", value: "10-" },
    ],
  },
  {
    id: "troelalier",
    name: "Troelalier",
    category: "family",
    description: "4 azen. Vraag een heer of vrouw. Zelfde telling als Troela",
    basePoints: 15,
    requiresPartner: true,
    isTrickBased: true,
    targetTricks: 10,
    presetOptions: [
      { label: "10+ slagen (+15p)", value: "10+" },
      { label: "Kapot gespeeld (13 slagen, +20p)", value: "kapot gespeeld" },
      { label: "10- slagen (verloren, -15p)", value: "10-" },
    ],
  },
  {
    id: "trek_met",
    name: "Trek /met",
    category: "family",
    description: "Met maat. Doel 8 slagen: 8=5p, per overslag +1p, 13=15p. Verloren: -5 - onderslagen",
    basePoints: 5,
    requiresPartner: true,
    isTrickBased: true,
    targetTricks: 8,
    minTricks: 0,
    maxTricks: 13,
  },
  {
    id: "trek_alleen_5",
    name: "Trek (alleen 5)",
    category: "family",
    description: "Alleen. Doel 5 slagen: 5=15p (+3p per overslag, 13=45p). Verloren: -15 (-3p per onderslag)",
    basePoints: 15,
    requiresPartner: false,
    isTrickBased: true,
    targetTricks: 5,
    minTricks: 0,
    maxTricks: 13,
  },
  {
    id: "9_alleen",
    name: "9 alleen",
    category: "family",
    description: "Alleen. Doel 9 slagen. Bieder krijgt 3x 10 = 30p bij winst, -30p bij verlies",
    basePoints: 10,
    requiresPartner: false,
    isTrickBased: true,
    targetTricks: 9,
    minTricks: 0,
    maxTricks: 13,
  },
  {
    id: "kaartje_vragen",
    name: "Kaartje vragen",
    category: "family",
    description: "Vraag een kaart mee. Basiswaarde 15 punten",
    basePoints: 15,
    allowsPartner: true,
    isTrickBased: false,
  },
  {
    id: "misere",
    name: "Misère",
    category: "family",
    description: "0 slagen halen. Winnaar krijgt 3x 15 = 45p. Verliezer betaalt 3x 15 = -45p",
    basePoints: 15,
    requiresPartner: false,
    isMisere: true,
    targetTricks: 0,
  },
  {
    id: "open_misere",
    name: "Open Misère",
    category: "family",
    description: "0 slagen halen met open kaarten. Winnaar krijgt 3x 20 = 60p",
    basePoints: 20,
    requiresPartner: false,
    isMisere: true,
    targetTricks: 0,
  },
  {
    id: "13_alleen",
    name: "13 alleen",
    category: "family",
    description: "Alle 13 slagen solo halen. Winnaar krijgt 3x 25 = 75p",
    basePoints: 25,
    requiresPartner: false,
    isTrickBased: true,
    targetTricks: 13,
    minTricks: 0,
    maxTricks: 13,
  },
  {
    id: "schoppen_dame",
    name: "Schoppen dame + laatste slag",
    category: "family",
    description: "Passpel: Wie schoppen dame of laatste slag krijgt betaalt boete (-15 of -5 per speler)",
    basePoints: 15,
    isPenalty: true,
    allowsPartner: true,
  },
];

export const CLASSIC_RIKKEN_GAME_TYPES: GameType[] = [
  {
    id: "rik_classic",
    name: "Rik",
    category: "classic",
    description: "Met maat 8 slagen halen. 10p + 5p per overslag (alle 13 = +35p bonus)",
    basePoints: 10,
    requiresPartner: true,
    isTrickBased: true,
    targetTricks: 8,
  },
  {
    id: "betere_rik_classic",
    name: "Betere rik",
    category: "classic",
    description: "Met maat 8 slagen met harten troef. 10p + 5p per overslag",
    basePoints: 10,
    requiresPartner: true,
    isTrickBased: true,
    targetTricks: 8,
  },
  {
    id: "8_alleen_classic",
    name: "8 alleen",
    category: "classic",
    description: "Alleen 8 slagen halen. 10p + 5p per overslag",
    basePoints: 10,
    requiresPartner: false,
    isTrickBased: true,
    targetTricks: 8,
  },
  {
    id: "piek_classic",
    name: "Piek",
    category: "classic",
    description: "Precies 1 slag halen. Basiswaarde 15 punten",
    basePoints: 15,
    isMisere: true,
    targetTricks: 1,
  },
  {
    id: "10_alleen_classic",
    name: "10 alleen",
    category: "classic",
    description: "Alleen 10 slagen halen. 30p + 5p per overslag",
    basePoints: 30,
    requiresPartner: false,
    isTrickBased: true,
    targetTricks: 10,
  },
  {
    id: "open_piek_classic",
    name: "Open piek",
    category: "classic",
    description: "Precies 1 slag halen met open kaarten. Basis 40 punten",
    basePoints: 40,
    isMisere: true,
    targetTricks: 1,
  },
  {
    id: "11_alleen_classic",
    name: "Elf alleen",
    category: "classic",
    description: "Alleen 11 slagen halen. 40p + 5p per overslag",
    basePoints: 40,
    requiresPartner: false,
    isTrickBased: true,
    targetTricks: 11,
  },
  {
    id: "een_of_vijf_classic",
    name: "Één of vijf",
    category: "classic",
    description: "Iedereen die precies 1 of 5 slagen haalt krijgt 10 punten",
    basePoints: 10,
    isTrickBased: true,
  },
];

export const ALL_GAME_TYPES = [...FAMILY_GAME_TYPES, ...CLASSIC_RIKKEN_GAME_TYPES];
