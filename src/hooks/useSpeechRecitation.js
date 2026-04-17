import { useEffect, useRef, useState } from "react";

export const DEBUG_SPEECH = false;

function debugSpeech(...args) {
  if (DEBUG_SPEECH) {
    console.log("[speech]", ...args);
  }
}

function normalizeTranscript(value = "") {
  return value.trim().replace(/\s+/g, " ");
}

function mergeTranscriptSegments(baseTranscript = "", nextTranscript = "") {
  const base = normalizeTranscript(baseTranscript);
  const next = normalizeTranscript(nextTranscript);

  if (!base) return next;
  if (!next) return base;
  if (base === next || base.endsWith(next)) return base;
  if (next.startsWith(base)) return next;

  const baseWords = base.split(" ");
  const nextWords = next.split(" ");
  const maxOverlap = Math.min(baseWords.length, nextWords.length);

  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const baseSuffix = baseWords.slice(-overlap).join(" ");
    const nextPrefix = nextWords.slice(0, overlap).join(" ");

    if (baseSuffix === nextPrefix) {
      return [...baseWords, ...nextWords.slice(overlap)].join(" ");
    }
  }

  return `${base} ${next}`.trim();
}

function extractRecognitionTexts(event, currentFinalTranscript = "") {
  let nextFinalTranscript = normalizeTranscript(currentFinalTranscript);
  let nextInterimTranscript = "";

  for (let index = event.resultIndex; index < event.results.length; index += 1) {
    const result = event.results[index];
    const transcript = normalizeTranscript(result?.[0]?.transcript || "");

    if (!transcript) continue;

    debugSpeech("result", {
      index,
      isFinal: Boolean(result?.isFinal),
      transcript,
    });

    if (result.isFinal) {
      nextFinalTranscript = mergeTranscriptSegments(nextFinalTranscript, transcript);
    } else {
      nextInterimTranscript = mergeTranscriptSegments(nextInterimTranscript, transcript);
    }
  }

  return {
    finalTranscript: nextFinalTranscript,
    interimTranscript: nextInterimTranscript,
  };
}

export function useSpeechRecitation() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");
  const restartTimeoutRef = useRef(null);
  const shouldKeepListeningRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
    }

    setIsSupported(true);

    return () => {
      shouldKeepListeningRef.current = false;

      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const attachRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("La reconnaissance vocale n'est pas supportee sur ce navigateur.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      debugSpeech("session-start");
    };

    recognition.onresult = event => {
      debugSpeech("onresult", {
        resultIndex: event.resultIndex,
        resultCount: event.results.length,
      });

      const { finalTranscript: nextFinalTranscript, interimTranscript: nextInterimTranscript } =
        extractRecognitionTexts(event, finalTranscriptRef.current);

      if (nextFinalTranscript !== finalTranscriptRef.current) {
        finalTranscriptRef.current = nextFinalTranscript;
        setFinalTranscript(nextFinalTranscript);
      }

      setInterimTranscript(nextInterimTranscript);

      debugSpeech("rebuilt-transcripts", {
        finalTranscript: nextFinalTranscript,
        interimTranscript: nextInterimTranscript,
      });
    };

    recognition.onerror = event => {
      debugSpeech("error", { code: event.error });

      setIsListening(false);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldKeepListeningRef.current = false;
        setError("L'acces au micro a ete refuse.");
      } else if (event.error === "audio-capture") {
        shouldKeepListeningRef.current = false;
        setError("Aucun micro detecte.");
      } else if (event.error === "no-speech" || event.error === "aborted") {
        setError("");
      } else {
        setError("La reconnaissance vocale a rencontre un probleme.");
      }
    };

    recognition.onend = () => {
      debugSpeech("session-end", {
        finalTranscript: finalTranscriptRef.current,
        shouldKeepListening: shouldKeepListeningRef.current,
      });

      setIsListening(false);

      if (!shouldKeepListeningRef.current) {
        return;
      }

      restartTimeoutRef.current = window.setTimeout(() => {
        const restartedRecognition = attachRecognition();
        if (restartedRecognition) {
          recognitionRef.current = restartedRecognition;
          restartedRecognition.start();
        }
      }, 180);
    };

    return recognition;
  };

  const startListening = () => {
    if (isListening) return;

    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    setError("");
    setFinalTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    shouldKeepListeningRef.current = true;

    const recognition = attachRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    debugSpeech("manual-start");
    recognition.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;

    debugSpeech("manual-stop");
    shouldKeepListeningRef.current = false;

    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    recognitionRef.current.stop();
  };

  const resetTranscript = () => {
    shouldKeepListeningRef.current = false;

    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    finalTranscriptRef.current = "";
    setFinalTranscript("");
    setInterimTranscript("");
    setError(null);
    setIsListening(false);

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