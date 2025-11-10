import React from 'react';
import AudioPlayer from './AudioPlayer';
import OpinionTabs from './OpinionTabs';

export default function HadithCard({ hadith }) {
  return (
    <article className="rounded-2xl border p-4 bg-white shadow-sm">
      <div className="text-xs text-gray-500 mb-2">Umdat — Hadith {hadith.number} • {hadith.source}</div>
      <div dir="rtl" className="text-xl leading-9 font-serif mb-3">{hadith.arabic_text}</div>
      <p className="text-gray-800 mb-3">{hadith.french_text}</p>
      {hadith.audio_url && <AudioPlayer url={hadith.audio_url} />}
      <OpinionTabs opinions={hadith.opinions} />
    </article>
  );
}
