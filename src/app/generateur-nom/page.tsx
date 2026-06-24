"use client";

import { useState } from "react";
import Link from "next/link";

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
    <main className="flex min-h-screen flex-col items-center p-8 pt-16">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            ← Accueil
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Générateur de nom d&apos;association</h1>
          <p className="text-gray-500 mt-2">
            Décrivez votre projet associatif et obtenez 5 propositions de noms originaux.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : Une association de jardinage partagé pour les habitants d'un quartier urbain, axée sur l'écologie et le lien social."
            rows={4}
            required
            className="w-full border rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="self-start bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
          >
            {loading ? "Génération en cours…" : "Générer des noms"}
          </button>
        </form>

        {error && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Propositions</h2>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
