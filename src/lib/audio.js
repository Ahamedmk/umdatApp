export function playAudio(url, onEnded) {
  const audio = new Audio(url);
  audio.playbackRate = 0.9; // légèrement ralenti
  audio.addEventListener('ended', () => onEnded && onEnded());
  audio.play();
  return audio;
}
