import React, { useRef, useState } from 'react';

export default function AudioPlayer({ url }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.playbackRate = 0.9; a.play(); setPlaying(true); }
  };

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={url} onEnded={()=>setPlaying(false)} />
      <button onClick={toggle} className="px-3 py-1 rounded bg-gray-100">
        {playing ? 'Pause' : 'Écouter'}
      </button>
      <span className="text-xs text-gray-500">Lecture lente</span>
    </div>
  );
}
