"use client";

import { useState, useRef } from "react";

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
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">🏟 Tombola</h1>
        <p className="text-gray-500 text-sm mt-1">Ajoutez les participants et les lots, puis lancez le tirage au sort.</p>
      </div>

      {phase === "setup" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Participants</h2>
              {participants.length > 0 && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#eef1fd", color: "#2d4de0" }}
                >
                  {participants.length}
                </span>
              )}
            </div>
            <form onSubmit={addParticipant} className="flex gap-2">
              <input
                ref={participantRef}
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                placeholder="Nom du participant"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!participantInput.trim()}
                className="text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
                style={{ backgroundColor: "#2d4de0" }}
              >
                +
              </button>
            </form>
            {participants.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun participant.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {participants.map((p) => (
                  <li key={p} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700">{p}</span>
                    <button onClick={() => removeParticipant(p)} className="text-gray-300 hover:text-red-400 transition-colors text-xs">
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Lots</h2>
              {prizes.length > 0 && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#eef1fd", color: "#2d4de0" }}
                >
                  {prizes.length}
                </span>
              )}
            </div>
            <form onSubmit={addPrize} className="flex gap-2">
              <input
                ref={prizeRef}
                value={prizeInput}
                onChange={(e) => setPrizeInput(e.target.value)}
                placeholder="Description du lot"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!prizeInput.trim()}
                className="text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
                style={{ backgroundColor: "#2d4de0" }}
              >
                +
              </button>
            </form>
            {prizes.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun lot.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {prizes.map((prize, i) => (
                  <li key={prize.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-700">
                      <span className="text-gray-300 mr-2">#{i + 1}</span>{prize.label}
                    </span>
                    <button onClick={() => removePrize(prize.id)} className="text-gray-300 hover:text-red-400 transition-colors text-xs">
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="md:col-span-2">
            <button
              onClick={draw}
              disabled={!canDraw || drawing}
              className="w-full text-white py-3 rounded-xl font-semibold text-base disabled:opacity-40 transition-colors"
              style={{ backgroundColor: "#2d4de0" }}
            >
              {drawing ? "Tirage en cours…" : "🎰 Lancer le tirage au sort"}
            </button>
          </div>
        </div>
      )}

      {phase === "results" && (
        <div className="max-w-xl flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900 text-lg">🎉 Résultats du tirage</h2>
            <ul className="flex flex-col gap-3">
              {winners.map((w, i) => (
                <li key={w.prize.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: "#f4f6fb" }}>
                  <span className="text-xl font-bold text-gray-200 w-8 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{w.participant}</p>
                    <p className="text-sm text-gray-500">{w.prize.label}</p>
                  </div>
                  <span className="text-xl">🏆</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={draw}
              disabled={drawing}
              className="flex-1 border py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40"
              style={{ borderColor: "#2d4de0", color: "#2d4de0" }}
            >
              Tirer à nouveau
            </button>
            <button
              onClick={reset}
              className="flex-1 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
              style={{ backgroundColor: "#2d4de0" }}
            >
              Nouvelle tombola
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
