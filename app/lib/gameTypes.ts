export interface GameType {
  id: string;
  name: string;
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

export const MISERE_GAME_TYPES: GameType[] = [
  {
    id: "trek_met",
    name: "Trek /met",
    description: "Met maat. Doel 8 slagen: 8=5p, per overslag +1p, 13=15p. Verloren: -5 - onderslagen",
    basePoints: 5,
    requiresPartner: true,
    isTrickBased: true,
    targetTricks: 8,
    minTricks: 0,
    maxTricks: 13,
  },
  {
    id: "schoppen_dame",
    name: "Schoppen dame + laatste slag",
    description: "Passpel: Wie schoppen dame of laatste slag krijgt betaalt boete (-15 of -5 per speler)",
    basePoints: 15,
    isPenalty: true,
    allowsPartner: true,
  },
  {
    id: "trek_alleen_5",
    name: "Trek 5 alleen",
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
    description: "Alleen. Doel 9 slagen. Bieder krijgt 3x 10 = 30p bij winst, -30p bij verlies",
    basePoints: 10,
    requiresPartner: false,
    isTrickBased: true,
    targetTricks: 9,
    minTricks: 0,
    maxTricks: 13,
  },
  {
    id: "troela",
    name: "Troela",
    description: "3 azen. Speel met de 4e aas. 10+ slagen = +15p, kapot (13) = +20p, 10- = -15p",
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
    id: "kaartje_vragen",
    name: "Kaartje vragen",
    description: "Vraag een kaart mee. Basiswaarde 15 punten",
    basePoints: 15,
    allowsPartner: true,
    isTrickBased: false,
  },
  {
    id: "misere",
    name: "Misère",
    description: "0 slagen halen. Winnaar krijgt 3x 15 = 45p. Verliezer betaalt 3x 15 = -45p",
    basePoints: 15,
    requiresPartner: false,
    isMisere: true,
    targetTricks: 0,
  },
  {
    id: "open_misere",
    name: "Open Misère",
    description: "0 slagen halen met open kaarten. Winnaar krijgt 3x 20 = 60p",
    basePoints: 20,
    requiresPartner: false,
    isMisere: true,
    targetTricks: 0,
  },
  {
    id: "13_alleen",
    name: "13 alleen",
    description: "Alle 13 slagen solo halen. Winnaar krijgt 3x 25 = 75p",
    basePoints: 25,
    requiresPartner: false,
    isTrickBased: true,
    targetTricks: 13,
    minTricks: 0,
    maxTricks: 13,
  },
];
