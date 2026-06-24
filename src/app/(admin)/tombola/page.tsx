"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Prize { id: string; label: string; emoji: string }
interface Participant { id: string; name: string }
interface Winner { prize: Prize; participant: string }
interface DrawRecord {
  id: string;
  participant_count: number;
  prizes_json: Prize[];
  winners_json: Winner[];
  drawn_at: string;
}

const DEFAULT_PRIZES: Prize[] = [
  { id: "1", label: "Une glace", emoji: "🍦" },
  { id: "2", label: "Un shot de génépi", emoji: "🥃" },
  { id: "3", label: "Une photo encadrée du chat", emoji: "🐱" },
];

const EMOJIS = ["🎁", "🏆", "🎀", "🍕", "🍾", "🎂", "🎮", "🎵", "📚", "🌟"];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

type AnimPhase = "idle" | "countdown" | "spinning" | "revealing";

export default function Tombola() {
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [prizeInput, setPrizeInput] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [phase, setPhase] = useState<"setup" | "results">("setup");
  const [resetting, setResetting] = useState(false);

  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [currentPrizeIdx, setCurrentPrizeIdx] = useState(0);
  const [spinningName, setSpinningName] = useState("");
  const [revealedWinners, setRevealedWinners] = useState<Winner[]>([]);

  const [drawHistory, setDrawHistory] = useState<DrawRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

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

  async function fetchHistory() {
    if (historyLoaded) return;
    try {
      const res = await fetch("/api/tombola/draws");
      if (!res.ok) return;
      const data = await res.json();
      setDrawHistory(data.draws ?? []);
      setHistoryLoaded(true);
    } catch { /* silent */ }
  }

  function addPrize(e: React.FormEvent) {
    e.preventDefault();
    const label = prizeInput.trim();
    if (!label) return;
    const emoji = EMOJIS[prizes.length % EMOJIS.length];
    setPrizes((prev) => [...prev, { id: generateId(), label, emoji }]);
    setPrizeInput("");
  }

  function removePrize(id: string) {
    setPrizes((prev) => prev.filter((p) => p.id !== id));
  }

  async function draw() {
    if (participants.length === 0 || prizes.length === 0 || drawing) return;
    setDrawing(true);

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const results: Winner[] = prizes.map((prize, i) => ({
      prize,
      participant: shuffled[i % shuffled.length].name,
    }));

    setRevealedWinners([]);
    setCurrentPrizeIdx(0);

    // Countdown
    setAnimPhase("countdown");
    for (let c = 3; c >= 1; c--) {
      setCountdown(c);
      await sleep(900);
    }

    // Spin each prize
    for (let i = 0; i < results.length; i++) {
      setCurrentPrizeIdx(i);
      setAnimPhase("spinning");

      const names = participants.map((p) => p.name);
      let tick = 0;

      // Fast spin 2s
      const fast = setInterval(() => {
        setSpinningName(names[tick++ % names.length]);
      }, 70);
      await sleep(2000);
      clearInterval(fast);

      // Slow spin 0.8s
      const slow = setInterval(() => {
        setSpinningName(names[tick++ % names.length]);
      }, 220);
      await sleep(800);
      clearInterval(slow);

      // Lock winner
      setSpinningName(results[i].participant);
      setAnimPhase("revealing");
      setRevealedWinners((prev) => [...prev, results[i]]);
      await sleep(1800);

      if (i < results.length - 1) {
        await sleep(400);
      }
    }

    // Save to history
    try {
      await fetch("/api/tombola/draws", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prizes: results.map((w) => w.prize),
          winners: results,
          participant_count: participants.length,
        }),
      });
      setHistoryLoaded(false);
    } catch { /* silent */ }

    await sleep(1200);
    setAnimPhase("idle");
    setWinners(results);
    setPhase("results");
    setDrawing(false);
  }

  async function resetTombola() {
    setResetting(true);
    await fetch("/api/tombola/participants", { method: "DELETE" });
    setParticipants([]);
    setWinners([]);
    setPrizes(DEFAULT_PRIZES);
    setPhase("setup");
    setResetting(false);
  }

  const showAnim = animPhase !== "idle";
  const currentPrize = prizes[currentPrizeIdx];

  return (
    <>
      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes winner-slide {
          0% { transform: translateY(40px) scale(0.8); opacity: 0; }
          60% { transform: translateY(-8px) scale(1.05); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cd-pop {
          0% { transform: scale(0.2); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes spin-blur {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .anim-pop-in { animation: pop-in 0.5s cubic-bezier(.34,1.56,.64,1) forwards; }
        .anim-winner { animation: winner-slide 0.6s cubic-bezier(.34,1.56,.64,1) forwards; }
        .anim-cd { animation: cd-pop 0.85s ease-out forwards; }
        .anim-spin-blur { animation: spin-blur 0.14s linear infinite; }
      `}</style>

      {showAnim && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ backgroundColor: "rgba(10,15,40,0.97)" }}>
          {animPhase === "countdown" && (
            <div key={countdown} className="anim-cd text-9xl font-black select-none" style={{ color: "#2d4de0" }}>
              {countdown}
            </div>
          )}

          {(animPhase === "spinning" || animPhase === "revealing") && currentPrize && (
            <div className="flex flex-col items-center gap-8 w-full max-w-md px-8">
              {revealedWinners.length > 0 && (
                <div className="w-full flex flex-col gap-2">
                  {revealedWinners.slice(0, -1).map((w) => (
                    <div key={w.prize.id} className="flex items-center gap-3 px-4 py-2 rounded-2xl" style={{ backgroundColor: "rgba(45,77,224,0.15)", border: "1px solid rgba(45,77,224,0.3)" }}>
                      <span className="text-xl">{w.prize.emoji}</span>
                      <span className="text-white font-semibold text-sm flex-1">{w.participant}</span>
                      <span className="text-xs" style={{ color: "#7b93f5" }}>{w.prize.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center gap-3 text-center">
                <div className="text-5xl anim-pop-in">{currentPrize.emoji}</div>
                <p className="text-white/60 text-sm font-medium uppercase tracking-widest">Lot #{currentPrizeIdx + 1}</p>
                <p className="text-white font-bold text-xl">{currentPrize.label}</p>
              </div>

              <div className="relative flex items-center justify-center w-full">
                <div
                  className="px-8 py-5 rounded-3xl text-center w-full"
                  style={{ backgroundColor: "rgba(45,77,224,0.2)", border: "2px solid #2d4de0" }}
                >
                  {animPhase === "spinning" ? (
                    <p className="anim-spin-blur text-3xl font-black text-white tracking-tight">{spinningName || "…"}</p>
                  ) : (
                    <p key={spinningName} className="anim-winner text-3xl font-black tracking-tight" style={{ color: "#7b93f5" }}>
                      🎉 {spinningName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-1">
                {prizes.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: i <= currentPrizeIdx ? "#2d4de0" : "rgba(255,255,255,0.2)" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <main className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏟 Tombola</h1>
            <p className="text-gray-500 text-sm mt-1">Tirage au sort — espace organisateur</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowHistory((v) => !v); if (!showHistory) fetchHistory(); }}
              className="text-sm px-4 py-2 rounded-xl border font-medium transition-colors"
              style={{ borderColor: "#2d4de0", color: "#2d4de0" }}
            >
              📋 Historique
            </button>
            <Link
              href="/tombola/public"
              target="_blank"
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium text-white transition-colors"
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

        {showHistory && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-3xl">
            <h2 className="font-bold text-gray-900 mb-4">📋 Historique des tombolas</h2>
            {drawHistory.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucun tirage enregistré pour l&apos;instant.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {drawHistory.map((draw) => (
                  <details key={draw.id} className="rounded-xl overflow-hidden group" style={{ backgroundColor: "#f4f6fb" }}>
                    <summary className="flex items-center gap-4 px-4 py-3 cursor-pointer select-none list-none">
                      <span className="text-xl">🎰</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {new Date(draw.drawn_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#eef1fd", color: "#2d4de0" }}>
                        {draw.participant_count} participant{draw.participant_count > 1 ? "s" : ""}
                      </span>
                      <span className="text-gray-400 text-xs group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
                      {(draw.winners_json ?? []).map((w: Winner, i: number) => (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2">
                          <span>{w.prize.emoji}</span>
                          <span className="font-semibold text-gray-900 text-sm flex-1">{w.participant}</span>
                          <span className="text-xs text-gray-500">{w.prize.label}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}

        {phase === "setup" && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Lots à gagner</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#eef1fd", color: "#2d4de0" }}>
                    {prizes.length} lot{prizes.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {prizes.map((prize, i) => (
                    <li key={prize.id} className="flex items-center gap-3 p-3 rounded-xl group" style={{ backgroundColor: "#f4f6fb" }}>
                      <span className="text-xl">{prize.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{prize.label}</p>
                        <p className="text-xs text-gray-400">Lot #{i + 1}</p>
                      </div>
                      <button onClick={() => removePrize(prize.id)} className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs flex-shrink-0">
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={addPrize} className="flex gap-2 mt-1">
                  <input
                    value={prizeInput}
                    onChange={(e) => setPrizeInput(e.target.value)}
                    placeholder="Ajouter un lot…"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                  <button type="submit" disabled={!prizeInput.trim()} className="text-white px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-40 transition-colors" style={{ backgroundColor: "#2d4de0" }}>
                    +
                  </button>
                </form>
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
                      <Link href="/tombola/public" target="_blank" className="underline underline-offset-2" style={{ color: "#2d4de0" }}>page d&apos;affichage</Link>{" "}
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
              disabled={participants.length === 0 || prizes.length === 0 || drawing}
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
    </>
  );
}
