"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Prize { id: string; label: string; emoji: string }
interface Participant { id: string; name: string }
interface Winner { prize: Prize; participant: string }

const PRIZES: Prize[] = [
  { id: "1", label: "Une glace", emoji: "🍦" },
  { id: "2", label: "Un shot de génépi", emoji: "🥃" },
  { id: "3", label: "Une photo encadrée du chat", emoji: "🐱" },
];

export default function Tombola() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [phase, setPhase] = useState<"setup" | "results">("setup");
  const [resetting, setResetting] = useState(false);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch("/api/tombola/participants");
      if (!res.ok) return;
      const data = await res.json();
      setParticipants(data.participants ?? []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 4000);
    return () => clearInterval(interval);
  }, [fetchParticipants]);

  async function draw() {
    if (participants.length === 0) return;
    setDrawing(true);
    await new Promise((r) => setTimeout(r, 1000));
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const results: Winner[] = PRIZES.map((prize, i) => ({
      prize,
      participant: shuffled[i % shuffled.length].name,
    }));
    setWinners(results);
    setPhase("results");
    setDrawing(false);
  }

  async function resetTombola() {
    setResetting(true);
    await fetch("/api/tombola/participants", { method: "DELETE" });
    setParticipants([]);
    setWinners([]);
    setPhase("setup");
    setResetting(false);
  }

  return (
    <main className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏟 Tombola</h1>
          <p className="text-gray-500 text-sm mt-1">Tirage au sort — espace organisateur</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tombola/public"
            target="_blank"
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-colors text-white"
            style={{ backgroundColor: "#2d4de0" }}
          >
            <span>📺</span> Afficher le QR code
          </Link>
          {phase === "results" && (
            <button
              onClick={resetTombola}
              disabled={resetting}
              className="text-sm px-4 py-2 rounded-xl border font-medium transition-colors disabled:opacity-40"
              style={{ borderColor: "#2d4de0", color: "#2d4de0" }}
            >
              {resetting ? "Réinitialisation…" : "Nouvelle tombola"}
            </button>
          )}
        </div>
      </div>

      {phase === "setup" && (
        <div className="flex flex-col gap-6 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Lots à gagner</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#eef1fd", color: "#2d4de0" }}>
                  {PRIZES.length} lots
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                {PRIZES.map((prize, i) => (
                  <li key={prize.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "#f4f6fb" }}>
                    <span className="text-2xl">{prize.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{prize.label}</p>
                      <p className="text-xs text-gray-400">Lot #{i + 1}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Participants</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#eef1fd", color: "#2d4de0" }}>
                  {participants.length} inscrit{participants.length > 1 ? "s" : ""}
                </span>
              </div>
              {participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <span className="text-3xl">⏳</span>
                  <p className="text-sm text-gray-400">En attente d&apos;inscriptions…</p>
                  <p className="text-xs text-gray-400">
                    Ouvrez la{" "}
                    <Link href="/tombola/public" target="_blank" className="underline underline-offset-2" style={{ color: "#2d4de0" }}>
                      page d&apos;affichage
                    </Link>{" "}
                    pour projeter le QR code
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {participants.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm text-gray-700 py-1 border-b border-gray-50 last:border-0">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#2d4de0" }} />
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            onClick={draw}
            disabled={participants.length === 0 || drawing}
            className="w-full text-white py-4 rounded-2xl font-bold text-base disabled:opacity-40 transition-colors"
            style={{ backgroundColor: "#2d4de0" }}
          >
            {drawing ? "Tirage en cours…" : participants.length === 0 ? "En attente de participants…" : `🎰 Lancer le tirage (${participants.length} participant${participants.length > 1 ? "s" : ""})`}
          </button>
        </div>
      )}

      {phase === "results" && (
        <div className="max-w-xl flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            <h2 className="font-bold text-gray-900 text-lg">🎉 Résultats du tirage</h2>
            <ul className="flex flex-col gap-3">
              {winners.map((w) => (
                <li key={w.prize.id} className="flex items-center gap-4 p-5 rounded-2xl" style={{ backgroundColor: "#f4f6fb" }}>
                  <span className="text-3xl">{w.prize.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{w.participant}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{w.prize.label}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#e6f9f2", color: "#00875a" }}>Gagnant·e</span>
                </li>
              ))}
            </ul>
          </div>
          <button onClick={draw} disabled={drawing} className="w-full border py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40" style={{ borderColor: "#2d4de0", color: "#2d4de0" }}>
            Tirer à nouveau
          </button>
        </div>
      )}
    </main>
  );
}
