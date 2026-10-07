"use client";
import React, { useState } from "react";
import { X, BookOpen, Award } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [activeTab, setActiveTab] = useState<"family" | "points" | "classic">("family");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-2xs animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-lg border-2 border-neutral-900 shadow-xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-neutral-900 bg-neutral-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-neutral-800" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900">
              Spelregels &amp; Puntentelling
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-600 hover:text-black hover:bg-neutral-200 transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-2 pt-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("family")}
            className={`py-1.5 px-3 rounded-t-md font-bold uppercase tracking-wider transition-colors border-t border-x ${
              activeTab === "family"
                ? "bg-white border-neutral-300 border-b-white text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Onze Regels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("points")}
            className={`py-1.5 px-3 rounded-t-md font-bold uppercase tracking-wider transition-colors border-t border-x ${
              activeTab === "points"
                ? "bg-white border-neutral-300 border-b-white text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Puntentelling
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("classic")}
            className={`py-1.5 px-3 rounded-t-md font-bold uppercase tracking-wider transition-colors border-t border-x ${
              activeTab === "classic"
                ? "bg-white border-neutral-300 border-b-white text-neutral-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Klassiek
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-neutral-800 leading-relaxed">
          {activeTab === "family" && (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-neutral-900 uppercase text-[11px] mb-1">
                  Algemeen &amp; Deler
                </h4>
                <p>
                  Het spel wordt gespeeld met een standaard kaartspel van 52 kaarten zonder jokers.
                  De deler rouleert elke ronde met de klok mee.
                </p>
              </div>

              <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200 space-y-1.5">
                <h4 className="font-bold text-neutral-900 uppercase text-[11px]">
                  Biedingen in volgorde van rang:
                </h4>
                <ol className="list-decimal list-inside space-y-1 font-medium">
                  <li><strong>Troela / Troelalier</strong> (3 of 4 azen, met maat)</li>
                  <li><strong>Trek /met</strong> (met maat, minimaal 8 slagen)</li>
                  <li><strong>Trek (alleen 5)</strong> (alleen, minimaal 5 slagen)</li>
                  <li><strong>9 alleen</strong> (alleen, 9 slagen)</li>
                  <li><strong>Kaartje vragen</strong> (met vraagkaart)</li>
                  <li><strong>Misère</strong> (0 slagen solo)</li>
                  <li><strong>Open Misère</strong> (0 slagen met open kaarten)</li>
                  <li><strong>13 alleen</strong> (alle slagen solo)</li>
                  <li><strong>Schoppen dame + laatste slag</strong> (passpel)</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 uppercase text-[11px] mb-1">
                  Automatische Berekening
                </h4>
                <p>
                  Deze app berekent alle scores automatisch en garandeert een constante
                  puntensom (zero-sum: wat gewonnen wordt, wordt door de tegenspelers betaald).
                  Zo ontstaan er nooit meer telfouten tijdens het kaarten!
                </p>
              </div>
            </div>
          )}

          {activeTab === "points" && (
            <div className="space-y-3">
              <div className="p-2 bg-emerald-50 rounded border border-emerald-300">
                <span className="font-bold text-emerald-950 uppercase text-[11px]">
                  Troela / Troelalier
                </span>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-emerald-900">
                  <li><strong>10+ slagen:</strong> Duo krijgt elk +15p, anderen elk -15p</li>
                  <li><strong>Kapot (13 slagen):</strong> Duo krijgt elk +20p, anderen elk -20p</li>
                  <li><strong>10- slagen:</strong> Duo krijgt elk -15p, anderen elk +15p</li>
                </ul>
              </div>

              <div className="p-2 bg-blue-50 rounded border border-blue-300">
                <span className="font-bold text-blue-950 uppercase text-[11px]">
                  Trek /met (doel 8 slagen)
                </span>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-blue-900">
                  <li><strong>8 slagen:</strong> +5p voor duo, -5p anderen</li>
                  <li><strong>9 t/m 12 slagen:</strong> 5 + (slagen - 8) pnt (bv. 9 slagen = +6p, 10 slagen = +7p)</li>
                  <li><strong>13 slagen (alle):</strong> +15p voor duo, -15p anderen</li>
                  <li><strong>Verloren (&lt; 8 slagen):</strong> -5 - (7 - slagen) pnt (bv. 7 slagen = -5p, 6 slagen = -6p)</li>
                </ul>
              </div>

              <div className="p-2 bg-amber-50 rounded border border-amber-300">
                <span className="font-bold text-amber-950 uppercase text-[11px]">
                  Trek (alleen 5)
                </span>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-900">
                  <li><strong>5 slagen:</strong> +15p voor bieder (-5p per tegenspeler)</li>
                  <li><strong>6 t/m 12 slagen:</strong> 15 + (slagen - 5) * 3 pnt (bv. 6 slagen = +18p, -6p elk)</li>
                  <li><strong>13 slagen:</strong> +45p voor bieder (-15p per tegenspeler)</li>
                  <li><strong>Verloren (&lt; 5 slagen):</strong> -15 - (4 - slagen) * 3 pnt (bv. 4 slagen = -15p, 3 slagen = -18p)</li>
                </ul>
              </div>

              <div className="p-2 bg-neutral-100 rounded border border-neutral-300">
                <span className="font-bold text-neutral-900 uppercase text-[11px]">
                  Solo &amp; Misère Biedingen
                </span>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-neutral-800">
                  <li><strong>9 alleen:</strong> Basis 10p → +30p bieder (-10p elk)</li>
                  <li><strong>Kaartje vragen:</strong> Basis 15p</li>
                  <li><strong>Misère:</strong> Basis 15p → +45p winst (-15p elk) / -45p verlies (+15p elk)</li>
                  <li><strong>Open Misère:</strong> Basis 20p → +60p winst (-20p elk) / -60p verlies (+20p elk)</li>
                  <li><strong>13 alleen:</strong> Basis 25p → +75p winst (-25p elk) / -75p verlies (+25p elk)</li>
                  <li><strong>Schoppen dame:</strong> 1 speler beide (-15p, +5p elk) • 2 spelers elk één (-5p elk, +5p anderen)</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "classic" && (
            <div className="space-y-2">
              <p>
                Klassiek Rikken volgt de standaard Brabantse &amp; Limburgse rikkensregels:
              </p>
              <ul className="list-disc list-inside space-y-1 font-medium">
                <li><strong>Rik / Betere rik:</strong> 10p basis + 5p per overslag (Kapot = +35p bonus)</li>
                <li><strong>8 alleen:</strong> 10p basis + 5p per overslag</li>
                <li><strong>Piek:</strong> Precies 1 slag halen (15p)</li>
                <li><strong>10 alleen:</strong> 30p basis + 5p per overslag</li>
                <li><strong>Open Piek:</strong> Precies 1 slag open (40p)</li>
                <li><strong>11 alleen:</strong> 40p basis + 5p per overslag</li>
                <li><strong>Één of vijf:</strong> 10p voor wie precies 1 of 5 slagen haalt</li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 bg-neutral-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 active:bg-black transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
