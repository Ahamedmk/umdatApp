import React, { useState } from 'react';

const labels = [
  { key: 'Hanafi', label: 'Hanafite' },
  { key: 'Maliki', label: 'Malikite' },
  { key: 'Shafi',  label: 'Chafi‘ite' },
  { key: 'Hanbali',label: 'Hanbalite' }
];

export default function OpinionTabs({ opinions }) {
  const [tab, setTab] = useState('Hanafi');
  const o = opinions?.[tab] || {};
  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {labels.map(l => (
          <button key={l.key}
            className={`px-3 py-1 rounded-full border text-sm ${tab===l.key?'bg-gray-900 text-white':'bg-white'}`}
            onClick={()=>setTab(l.key)}>
            {l.label}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-3">
        <div dir="rtl" className="p-3 rounded-lg bg-gray-50 border">
          <div className="text-xs text-gray-500 mb-1">النص الفقهي</div>
          <div className="leading-8">{o.ar}</div>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 border">
          <div className="text-xs text-gray-500 mb-1">Texte en français</div>
          <div className="leading-7">{o.fr}</div>
        </div>
      </div>
    </div>
  );
}
