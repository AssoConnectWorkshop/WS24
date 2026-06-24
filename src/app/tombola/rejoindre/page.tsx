"use client";

import { useState, useEffect, useRef } from "react";

const PRIZES = [
  { emoji: "🍦", label: "Une glace" },
  { emoji: "🥃", label: "Un shot de génépi" },
  { emoji: "🐱", label: "Une photo encadrée du chat" },
];

const CONFETTI_COLORS = ["#2d4de0", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#f97316"];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function ConfettiPiece({ color, left, delay, duration, size }: { color: string; left: number; delay: number; duration: number; size: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "-20px",
        left: `${left}%`,
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        animation: `confetti-fall ${duration}s ${delay}s ease-in forwards`,
        transform: `rotate(${randomBetween(0, 360)}deg)`,
      }}
    />
  );
}

interface ConfettiParticle {
  id: number;
  color: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export default function Rejoindre() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [wonPrize, setWonPrize] = useState<{ participant: string; prize: { emoji: string; label: string } } | null>(null);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const registeredName = useRef("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  async function checkWinner(participantName: string) {
    try {
      const res = await fetch("/api/tombola/draws");
      if (!res.ok) return;
      const data = await res.json();
      const draws: Array<{ winners_json: Array<{ participant: string; prize: { emoji: string; label: string } }> }> = data.draws ?? [];
      if (draws.length === 0) return;
      const latest = draws[0];
      const found = latest.winners_json?.find(
        (w) => w.participant.trim().toLowerCase() === participantName.trim().toLowerCase()
      );
      if (found) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setWonPrize(found);
        const pieces: ConfettiParticle[] = Array.from({ length: 80 }, (_, i) => ({
          id: i,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          left: randomBetween(0, 100),
          delay: randomBetween(0, 1.2),
          duration: randomBetween(2.5, 4),
          size: randomBetween(8, 18),
        }));
        setConfetti(pieces);
      }
    } catch { /* silent */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/tombola/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur serveur");
      }
      registeredName.current = name;
      setStatus("success");
      pollingRef.current = setInterval(() => checkWinner(registeredName.current), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStatus("error");
    }
  }

  if (wonPrize) {
    return (
      <>
        <style>{`
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes winner-zoom {
            0% { transform: scale(0.3) rotate(-8deg); opacity: 0; }
            60% { transform: scale(1.08) rotate(2deg); }
            80% { transform: scale(0.96) rotate(-1deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes prize-pop {
            0% { transform: translateY(30px) scale(0.7); opacity: 0; }
            70% { transform: translateY(-6px) scale(1.06); }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes shimmer {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .anim-winner-zoom { animation: winner-zoom 0.8s cubic-bezier(.34,1.56,.64,1) forwards; }
          .anim-prize-pop { animation: prize-pop 0.6s 0.4s cubic-bezier(.34,1.56,.64,1) both; }
          .anim-shimmer { animation: shimmer 2s ease-in-out infinite; }
        `}</style>

        <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
          {confetti.map((p) => (
            <ConfettiPiece key={p.id} {...p} />
          ))}
        </div>

        <div className="min-h-screen flex items-center justify-center p-6 relative z-20" style={{ backgroundColor: "#f4f6fb" }}>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 max-w-sm w-full text-center flex flex-col items-center gap-5 anim-winner-zoom">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl anim-shimmer"
              style={{ backgroundColor: "#fff8e1", border: "3px solid #f59e0b" }}
            >
              🏆
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: "#2d4de0" }}>Félicitations !</p>
              <h1 className="text-2xl font-black text-gray-900">{wonPrize.participant}</h1>
              <p className="text-gray-500 text-sm mt-1">Tu as gagné un lot !</p>
            </div>
            <div className="anim-prize-pop w-full px-6 py-5 rounded-2xl flex flex-col items-center gap-2" style={{ backgroundColor: "#f4f6fb" }}>
              <span className="text-5xl">{wonPrize.prize.emoji}</span>
              <p className="font-bold text-gray-900 text-lg mt-1">{wonPrize.prize.label}</p>
            </div>
            <p className="text-xs text-gray-400">Va voir l&apos;organisateur pour récupérer ton lot 🎉</p>
          </div>
        </div>
      </>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#f4f6fb" }}>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: "#e6f9f2" }}>🏟</div>
          <h1 className="text-xl font-bold text-gray-900">Vous êtes inscrit·e !</h1>
          <p className="text-gray-500 text-sm">Bonne chance <span className="font-semibold text-gray-700">{name}</span> 🤞</p>
          <p className="text-xs text-gray-400 mt-2">Le tirage au sort aura lieu bientôt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#f4f6fb" }}>
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: "#2d4de0" }}>🏟</div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Grande tombola fraîchissante<br />du séminaire d&apos;été</h1>
              <p className="text-gray-500 text-sm mt-1">Inscrivez-vous pour tenter de gagner un lot !</p>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {PRIZES.map((prize, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "#f4f6fb" }}>
                <span className="text-xl">{prize.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{prize.label}</span>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre prénom</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Marie" required autoFocus className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={!name.trim() || status === "loading"} className="w-full text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40 transition-colors" style={{ backgroundColor: "#2d4de0" }}>
              {status === "loading" ? "Inscription…" : "Participer à la tombola"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
