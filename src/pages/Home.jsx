import React from 'react';

export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Umdat al-Ahkam • Mémorisation & Fiqh</h1>
      <p className="text-gray-700">
        Apprends et mémorise les hadiths (arabe / français), compare les avis des 4 écoles, révise avec un système de répétition espacée.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <a href="/learn" className="rounded-xl border p-4 bg-white hover:shadow">
          <h3 className="font-semibold">📖 Apprendre</h3>
          <p className="text-sm text-gray-600">Texte arabe, audio, opinions en un clic.</p>
        </a>
        <a href="/review" className="rounded-xl border p-4 bg-white hover:shadow">
          <h3 className="font-semibold">🔁 Réviser</h3>
          <p className="text-sm text-gray-600">Système de révision espacée (SM-2).</p>
        </a>
        <a href="/quiz" className="rounded-xl border p-4 bg-white hover:shadow">
          <h3 className="font-semibold">🧩 Quiz</h3>
          <p className="text-sm text-gray-600">Teste-toi sur chaque hadith.</p>
        </a>
        <a href="/compare" className="rounded-xl border p-4 bg-white hover:shadow">
          <h3 className="font-semibold">⚖️ Comparer</h3>
          <p className="text-sm text-gray-600">Tableaux clairs des 4 écoles.</p>
        </a>
      </div>
    </section>
  );
}
