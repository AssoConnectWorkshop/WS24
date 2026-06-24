"use client";

import { useState } from "react";

export default function GenerateurNom() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/generateur-nom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur serveur");
      }
      const data = await res.json();
      setResult(data.names);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">✨ Générateur de nom d&apos;association</h1>
        <p className="text-gray-500 text-sm mt-1">Décrivez votre projet associatif et obtenez 5 propositions de noms originaux.</p>
      </div>
      <div className="max-w-2xl flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description de votre association</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex : Une association de jardinage partagé pour les habitants d'un quartier urbain, axée sur l'écologie et le lien social." rows={4} required className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent" />
            </div>
            <button type="submit" disabled={loading || !description.trim()} className="self-start text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors" style={{ backgroundColor: "#2d4de0" }}>
              {loading ? "Génération en cours…" : "Générer des noms"}
            </button>
          </form>
        </div>
        {error && <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 text-sm text-red-600">{error}</div>}
        {result && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Propositions</h2>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</div>
          </div>
        )}
      </div>
    </main>
  );
}
