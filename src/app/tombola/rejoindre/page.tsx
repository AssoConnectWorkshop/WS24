"use client";

import { useState } from "react";

export default function Rejoindre() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: "#e6f9f2" }}
          >
            🏟
          </div>
          <h1 className="text-xl font-bold text-gray-900">Vous êtes inscrit·e !</h1>
          <p className="text-gray-500 text-sm">
            Bonne chance <span className="font-semibold text-gray-700">{name}</span> 🤞
          </p>
          <p className="text-xs text-gray-400 mt-2">Le tirage au sort aura lieu bientôt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 max-w-sm w-full flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: "#eef1fd" }}
          >
            🏟
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tombola AssoConnect</h1>
            <p className="text-gray-500 text-sm mt-1">Inscrivez-vous pour tenter de gagner un lot !</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Votre prénom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Marie"
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || status === "loading"}
            className="w-full text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-40 transition-colors"
            style={{ backgroundColor: "#2d4de0" }}
          >
            {status === "loading" ? "Inscription…" : "Participer à la tombola"}
          </button>
        </form>
      </div>
    </div>
  );
}
