import React, { useState } from 'react';

export default function QuizMCQ({ question, options, correctIndex, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);

  const submit = () => {
    if (selected==null) return;
    const ok = selected === correctIndex;
    setDone(true);
    onAnswer && onAnswer(ok);
  };

  return (
    <div className="rounded-2xl border p-4">
      <h3 className="font-semibold mb-2">{question}</h3>
      <div className="grid gap-2">
        {options.map((opt,i)=>(
          <button key={i}
            disabled={done}
            onClick={()=>setSelected(i)}
            className={`text-left px-3 py-2 rounded border
              ${selected===i ? 'border-gray-900 bg-gray-50' : 'bg-white'}`}>
            {opt}
          </button>
        ))}
      </div>
      <button onClick={submit} disabled={done || selected==null}
        className="mt-3 px-4 py-2 rounded bg-gray-900 text-white">
        Valider
      </button>
      {done && (
        <div className="mt-2 text-sm">
          {selected === correctIndex ? '✅ Bonne réponse' : '❌ Mauvaise réponse'}
        </div>
      )}
    </div>
  );
}
