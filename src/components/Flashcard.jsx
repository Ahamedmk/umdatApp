import React, { useState } from 'react';

export default function Flashcard({ arabic, french }) {
  const [showFr, setShowFr] = useState(false);
  return (
    <div className="rounded-2xl border bg-white p-6 text-center">
      <div dir="rtl" className="text-2xl leading-10 font-serif">{arabic}</div>
      <button onClick={()=>setShowFr(!showFr)} className="mt-4 px-4 py-2 rounded bg-gray-900 text-white">
        {showFr ? 'Cacher la traduction' : 'Afficher la traduction'}
      </button>
      {showFr && <p className="mt-3 text-gray-800">{french}</p>}
    </div>
  );
}
