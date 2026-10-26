import { useCallback, useEffect, useRef, useState } from "react";

const SILENCE_MS = 2200; // stop listening this long after the child stops talking
const NO_SPEECH_MS = 8000; // give up if nothing is heard at all
const MAX_LISTEN_MS = 15000; // keep prompts short

function getRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function pickLanguage() {
  const lang = (typeof navigator !== "undefined" && navigator.language) || "en-GB";
  return lang.toLowerCase().startsWith("en") ? lang : "en-GB";
}

// Voice input. Calls onDone(finalText) once the child has finished speaking.
export function useSpeechInput(onDone) {
  const Recognition = getRecognition();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null); // "mic-blocked" | "no-speech" | null

  const recRef = useRef(null);
  const textRef = useRef("");
  const timersRef = useRef({});
  const cancelledRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const clearTimers = () => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
  };

  const stop = useCallback(() => {
    clearTimers();
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
  }, []);

  const start = useCallback(() => {
    if (!Recognition) return;
    stop();
    const rec = new Recognition();
    rec.lang = pickLanguage();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    textRef.current = "";
    cancelledRef.current = false;
    setTranscript("");
    setError(null);
    let blocked = false;

    rec.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript + " ";
      textRef.current = text.replace(/\s+/g, " ").trim();
      setTranscript(textRef.current);
      clearTimeout(timersRef.current.silence);
      clearTimeout(timersRef.current.noSpeech);
      timersRef.current.silence = setTimeout(stop, SILENCE_MS);
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed" || event.error === "audio-capture") {
        blocked = true;
        setError("mic-blocked");
      }
    };
    rec.onend = () => {
      clearTimers();
      setListening(false);
      recRef.current = null;
      if (blocked || cancelledRef.current) return;
      const finalText = textRef.current.trim();
      if (!finalText) {
        setError("no-speech");
        return;
      }
      onDoneRef.current?.(finalText);
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      timersRef.current.noSpeech = setTimeout(stop, NO_SPEECH_MS);
      timersRef.current.max = setTimeout(stop, MAX_LISTEN_MS);
    } catch {
      setError("mic-blocked");
    }
  }, [Recognition, stop]);

  // Stops listening without sending anything (e.g. the child taps "start again").
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    stop();
    textRef.current = "";
    setTranscript("");
    setError(null);
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { supported: Boolean(Recognition), listening, transcript, error, start, stop, cancel };
}

// Voice output: reads messages aloud so children who can't read yet can follow along.
export function useVoiceOutput(enabled) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const voiceRef = useRef(null);

  useEffect(() => {
    if (!supported) return;
    const choose = () => {
      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("en"));
      const preferred = ["Samantha", "Karen", "Moira", "Google UK English Female", "Google US English", "Serena", "Martha"];
      voiceRef.current =
        preferred.map((n) => voices.find((v) => v.name.includes(n))).find(Boolean) || voices[0] || null;
    };
    choose();
    window.speechSynthesis.addEventListener?.("voiceschanged", choose);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", choose);
  }, [supported]);

  const quiet = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  const say = useCallback(
    (text) => {
      if (!supported || !enabled || !text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ""));
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    },
    [supported, enabled]
  );

  useEffect(() => {
    if (!enabled) quiet();
  }, [enabled, quiet]);

  return { say, quiet };
}
