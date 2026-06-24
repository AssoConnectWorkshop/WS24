"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface Prize {
  id: string;
  label: string;
}

interface Winner {
  prize: Prize;
  participant: string;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Tombola() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [participantInput, setParticipantInput] = useState("");
  const [prizeInput, setPrizeInput] = useState("");
  const [winners, setWinners] = useState<Winner[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [phase, setPhase] = useState<"setup" | "results">("setup");
  const participantRef = useRef<HTMLInputElement>(null);
  const prizeRef = useRef<HTMLInputElement>(null);

  function addParticipant(e: React.FormEvent) {
    e.preventDefault();
    const name = participantInput.trim();
    if (!name || participants.includes(name)) return;
    setParticipants((prev) => [...prev, name]);
    setParticipantInput("");
    participantRef.current?.focus();
  }

  function removeParticipant(name: string) {
    setParticipants((prev) => prev.filter((p) => p !== name));
  }

  function addPrize(e: React.FormEvent) {
    e.preventDefault();
    const label = prizeInput.trim();
    if (!label) return;
    setPrizes((prev) => [...prev, { id: generateId(), label }]);
    setPrizeInput("");
    prizeRef.current?.focus();
  }

  function removePrize(id: string) {
    setPrizes((prev) => prev.filter((p) => p.id !== id));
  }

  async function draw() {
    if (participants.length === 0 || prizes.length === 0) return;
    setDrawing(true);

    await new Promise((r) => setTimeout(r, 800));

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const results: Winner[] = prizes.map((prize, i) => ({
      prize,
      participant: shuffled[i % shuffled.length],
    }));

    setWinners(results);
    setPhase("results");
    setDrawing(false);
  }

  function reset() {
    setWinners([]);
    setPhase("setup");
  }

  const canDraw = participants.length > 0 && prizes.length > 0;

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-16">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            ← Accueil
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold">🏟 Tombola</h1>
          <p className="text-gray-500 mt-2">
            Ajoutez les participants et les lots, puis lancez le tirage au sort.
          </p>
        </div>

        {phase === "setup" && (
          <>
            <div className="border rounded-xl p-6 flex flex-col gap-4">
              <h2 className="font-semibold">Participants</h2>
              <form onSubmit={addParticipant} className="flex gap-2">
                <input
                  ref={participantRef}
                  value={participantInput}
                  onChange={(e) => setParticipantInput(e.target.value)}
                  placeholder="Nom du participant"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  disabled={!participantInput.trim()}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
                >
                  Ajouter
                </button>
              </form>
              {participants.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun participant pour l&apos;instant.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {participants.map((p) => (
                    <li key={p} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                      <span>{p}</span>
                      <button
                        onClick={() => removeParticipant(p)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {participants.length > 0 && (
                <p className="text-xs text-gray-400">{participants.length} participant{participants.length > 1 ? "s" : ""}</p>
              )}
            </div>

            <div className="border rounded-xl p-6 flex flex-col gap-4">
              <h2 className="font-semibold">Lots</h2>
              <form onSubmit={addPrize} className="flex gap-2">
                <input
                  ref={prizeRef}
                  value={prizeInput}
                  onChange={(e) => setPrizeInput(e.target.value)}
                  placeholder="Description du lot"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  type="submit"
                  disabled={!prizeInput.trim()}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
                >
                  Ajouter
                </button>
              </form>
              {prizes.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun lot pour l&apos;instant.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {prizes.map((prize, i) => (
                    <li key={prize.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                      <span>
                        <span className="text-gray-400 mr-2">#{i + 1}</span>
                        {prize.label}
                      </span>
                      <button
                        onClick={() => removePrize(prize.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-xs"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {prizes.length > 0 && (
                <p className="text-xs text-gray-400">{prizes.length} lot{prizes.length > 1 ? "s" : ""}</p>
              )}
            </div>

            <button
              onClick={draw}
              disabled={!canDraw || drawing}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold text-base disabled:opacity-40 hover:bg-gray-800 transition-colors"
            >
              {drawing ? "Tirage en cours…" : "🎰 Lancer le tirage"}
            </button>
          </>
        )}

        {phase === "results" && (
          <>
            <div className="border rounded-xl p-6 flex flex-col gap-4">
              <h2 className="font-semibold text-lg">🎉 Résultats du tirage</h2>
              <ul className="flex flex-col gap-3">
                {winners.map((w, i) => (
                  <li
                    key={w.prize.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <span className="text-2xl font-bold text-gray-300 w-8 text-center">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold">{w.participant}</p>
                      <p className="text-sm text-gray-500">{w.prize.label}</p>
                    </div>
                    <span className="text-2xl">🏆</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={draw}
                disabled={drawing}
                className="flex-1 border border-black text-black py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Retirer au sort à nouveau
              </button>
              <button
                onClick={reset}
                className="flex-1 bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors"
              >
                Nouvelle tombola
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
