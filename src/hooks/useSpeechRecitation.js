import { useEffect, useRef, useState } from "react";

export const DEBUG_SPEECH = false;

function debugSpeech(...args) {
  if (DEBUG_SPEECH) {
    console.log("[speech]", ...args);
  }
}

function readSpeechChunk(result) {
  return result?.[0]?.transcript?.trim() || "";
}

export function useSpeechRecitation() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const resultSlotsRef = useRef([]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      resultSlotsRef.current = [];
      setIsListening(true);
      setError(null);
      setFinalTranscript("");
      setInterimTranscript("");
      debugSpeech("session-start");
    };

    recognition.onresult = event => {
      debugSpeech("onresult", { resultIndex: event.resultIndex, resultCount: event.results.length });

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = readSpeechChunk(result);
        const isFinal = Boolean(result?.isFinal);

        debugSpeech("result-slot", { index, isFinal, text });

        resultSlotsRef.current[index] = { text, isFinal };
      }

      resultSlotsRef.current.length = event.results.length;

      const finalParts = [];
      const interimParts = [];

      resultSlotsRef.current.forEach((slot, index) => {
        if (!slot?.text) return;
        if (slot.isFinal) finalParts.push(slot.text);
        else interimParts.push(slot.text);

        debugSpeech("rebuilt-slot", { index, isFinal: slot.isFinal, text: slot.text });
      });

      const nextFinalTranscript = finalParts.join(" ").replace(/\s+/g, " ").trim();
      const nextInterimTranscript = interimParts.join(" ").replace(/\s+/g, " ").trim();

      debugSpeech("rebuilt-transcripts", {
        finalTranscript: nextFinalTranscript,
        interimTranscript: nextInterimTranscript,
      });

      setFinalTranscript(nextFinalTranscript);
      setInterimTranscript(nextInterimTranscript);
    };

    recognition.onerror = event => {
      const nextError =
        event.error === "not-allowed"
          ? "L'acces au micro a ete refuse."
          : event.error === "no-speech"
            ? "Aucune recitation detectee."
            : "La reconnaissance vocale a rencontre un probleme.";

      debugSpeech("error", { code: event.error, message: nextError });
      setError(nextError);
      setIsListening(false);
    };

    recognition.onend = () => {
      debugSpeech("session-end", {
        finalTranscript: resultSlotsRef.current
          .filter(slot => slot?.isFinal && slot.text)
          .map(slot => slot.text)
          .join(" ")
          .trim(),
      });
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
    resultSlotsRef.current = [];
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);
    debugSpeech("manual-start");
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    debugSpeech("manual-stop");
    recognitionRef.current.stop();
  };

  const resetTranscript = () => {
    resultSlotsRef.current = [];
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);
    debugSpeech("manual-reset");
  };

  return {
    isSupported,
    isListening,
    finalTranscript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export default useSpeechRecitation;
