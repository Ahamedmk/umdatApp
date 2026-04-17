import { useEffect, useRef, useState } from "react";

export function useSpeechRecitation() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = event => {
      let nextFinalTranscript = finalTranscriptRef.current;
      let nextInterimTranscript = "";

      // On mobile, event.results often replays previous segments.
      // Restricting work to resultIndex avoids duplicating the same text.
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const chunk = result[0]?.transcript?.trim() || "";
        if (!chunk) continue;

        if (result.isFinal) {
          nextFinalTranscript = `${nextFinalTranscript} ${chunk}`.trim();
        } else {
          nextInterimTranscript = `${nextInterimTranscript} ${chunk}`.trim();
        }
      }

      finalTranscriptRef.current = nextFinalTranscript;
      setTranscript(nextFinalTranscript);
      setInterimTranscript(nextInterimTranscript);
    };

    recognition.onerror = event => {
      const nextError =
        event.error === "not-allowed"
          ? "L'acces au micro a ete refuse."
          : event.error === "no-speech"
            ? "Aucune recitation detectee."
            : "La reconnaissance vocale a rencontre un probleme.";
      setError(nextError);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
  };

  const resetTranscript = () => {
    finalTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  };

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export default useSpeechRecitation;
