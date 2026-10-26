import { useCallback, useEffect, useRef, useState } from "react";
import { checkPrompt, KIND_MESSAGES, pickSuggestions } from "../shared/safety.js";
import { useSpeechInput, useVoiceOutput } from "./hooks/useSpeech.js";
import Pip from "./components/Pip.jsx";
import WordStage from "./components/WordStage.jsx";
import AiSteps from "./components/AiSteps.jsx";
import ColouringPage, { PrintSheet } from "./components/ColouringPage.jsx";
import GrownUps from "./components/GrownUps.jsx";

const REVEAL_MS = 3200; // how long the "drawing" animation runs before printing

const AI_TIPS = [
  "AI learned to draw by looking at lots and lots of pictures.",
  "AI can make mistakes. If your picture looks funny, try saying it a different way!",
  "Never tell AI your name, address or school. Those are private.",
  "Short, clear words help AI understand you. Like: a happy whale in a hat!",
  "You are the boss of your ideas. AI is just a helper!",
  "Always use AI with a grown-up nearby.",
];

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.status) data.status = "error";
  return data;
}

export default function App() {
  // phase: welcome | listening | checking | thinking | drawing | printed | redirect | error
  const [phase, setPhase] = useState("welcome");
  const [message, setMessage] = useState("Hi! I'm Pip. Tap the big button and tell me what to draw!");
  const [words, setWords] = useState("");
  const [page, setPage] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [tip, setTip] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [showGrownUps, setShowGrownUps] = useState(false);
  const [mode, setMode] = useState(null);
  const runId = useRef(0);
  const tipRef = useRef(0);
  tipRef.current = tip;

  const { say, quiet } = useVoiceOutput(soundOn);

  const talk = useCallback(
    (text) => {
      setMessage(text);
      say(text);
    },
    [say]
  );

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setMode(d.mode))
      .catch(() => setMode(null));
  }, []);

  const showRedirect = useCallback(
    (text, list) => {
      setPhase("redirect");
      setSuggestions(list?.length ? list : pickSuggestions(3));
      talk(text);
    },
    [talk]
  );

  const makePicture = useCallback(
    async (spoken) => {
      const id = ++runId.current;
      const stillCurrent = () => id === runId.current;
      setWords(spoken);
      setPage(null);
      setSuggestions([]);

      // Instant check in the browser (the server checks again).
      const local = checkPrompt(spoken);
      if (!local.ok) {
        const category = local.reason === "empty" || local.reason === "too-long" ? "unclear" : local.category;
        showRedirect(KIND_MESSAGES[category] || KIND_MESSAGES.default);
        return;
      }

      setPhase("checking");
      talk("Let me check that's a kind and safe idea...");
      const check = await postJson("/api/check", { prompt: spoken });
      if (!stillCurrent()) return;
      if (check.status === "redirect") return showRedirect(check.message, check.suggestions);
      if (check.status !== "ok") {
        setPhase("error");
        return talk(check.message || "Oh no, my crayons got tangled! Let's try that again.");
      }

      setPhase("thinking");
      setTip(Math.floor(Math.random() * AI_TIPS.length));
      talk(`Great idea! I'm thinking about how to draw ${check.subject}.`);
      const drawing = await postJson("/api/draw", {
        mode: check.mode,
        subject: check.subject,
        title: check.title,
        ticket: check.ticket,
      });
      if (!stillCurrent()) return;
      if (drawing.status !== "ok") {
        setPhase("error");
        return talk(drawing.message || "Oh no, my crayons got tangled! Let's try that again.");
      }

      setPage({ ...drawing, key: id });
      setPhase("drawing");
      talk(`Ta-da! Here is your ${drawing.title}! Now I'll print it for you.`);
    },
    [showRedirect, talk]
  );

  const speech = useSpeechInput(makePicture);

  // While listening, show each word as it is heard.
  useEffect(() => {
    if (speech.listening) setWords(speech.transcript);
  }, [speech.listening, speech.transcript]);

  useEffect(() => {
    if (speech.error === "no-speech") {
      setPhase("welcome");
      talk("I didn't hear anything. Tap the button and tell me what to draw!");
    } else if (speech.error === "mic-blocked") {
      setPhase("error");
      talk("I can't hear you yet. Ask a grown-up to let me use the microphone.");
    }
  }, [speech.error, talk]);

  // Rotate AI tips while waiting, and read one aloud if the wait is long.
  useEffect(() => {
    if (phase !== "thinking") return;
    const rotate = setInterval(() => setTip((t) => (t + 1) % AI_TIPS.length), 7000);
    const readOne = setTimeout(() => say(`Did you know? ${AI_TIPS[tipRef.current]}`), 6000);
    return () => {
      clearInterval(rotate);
      clearTimeout(readOne);
    };
  }, [phase, say]);

  // After the drawing animation, print automatically.
  useEffect(() => {
    if (phase !== "drawing") return;
    const t = setTimeout(() => {
      setPhase("printed");
      window.print();
      talk("Your page is printing! You can colour it on paper, or tap a crayon and colour it here.");
    }, REVEAL_MS);
    return () => clearTimeout(t);
  }, [phase, talk]);

  const busy = phase === "checking" || phase === "thinking" || phase === "drawing";

  const onMicTap = () => {
    if (speech.listening) {
      speech.stop();
      return;
    }
    if (busy) return;
    quiet();
    runId.current++;
    setPage(null);
    setSuggestions([]);
    setWords("");
    setPhase("listening");
    setMessage("I'm listening... tell me what to draw!");
    speech.start();
  };

  const onSuggestion = (s) => {
    if (busy) return;
    if (speech.listening) speech.cancel();
    quiet();
    makePicture(s.label);
  };

  const pipMood = {
    welcome: "idle",
    listening: "listening",
    checking: "thinking",
    thinking: "thinking",
    drawing: "happy",
    printed: "happy",
    redirect: "oops",
    error: "oops",
  }[phase];

  const stepState = {
    welcome: { current: null, done: [] },
    listening: { current: "listen", done: [] },
    checking: { current: "check", done: ["listen"] },
    thinking: { current: "think", done: ["listen", "check"] },
    drawing: { current: "draw", done: ["listen", "check", "think"] },
    printed: { current: null, done: ["listen", "check", "think", "draw", "print"] },
    redirect: { current: "check", done: ["listen"] },
    error: { current: null, done: [] },
  }[phase];

  const micLabel = speech.listening
    ? "I'm done"
    : busy
      ? "Drawing..."
      : phase === "printed"
        ? "New picture"
        : "Tap to talk";

  return (
    <>
      <div className="app">
        <div className="blobs" aria-hidden="true">
          <span className="blob blob--a" />
          <span className="blob blob--b" />
          <span className="blob blob--c" />
        </div>

        <header className="topbar">
          <h1 className="logo" aria-label="ColouringAI">
            <span className="logo__c1">Colouring</span>
            <span className="logo__ai">AI</span>
          </h1>
          <div className="topbar__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSoundOn((s) => !s)}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Turn Pip's voice off" : "Turn Pip's voice on"}
            >
              {soundOn ? "🔊" : "🔇"}
            </button>
            <button type="button" className="text-btn" onClick={() => setShowGrownUps(true)}>
              For grown-ups
            </button>
          </div>
        </header>

        <main className={`stage stage--${phase}`}>
          <section className="talk-zone" aria-label="Talk to Pip">
            <div className="pip-row">
              <Pip mood={pipMood} size={130} />
              <p className="speech-bubble" aria-live="polite">
                {message}
              </p>
            </div>

            <WordStage text={words} listening={speech.listening} />

            {!speech.supported ? (
              <div className="notice">
                <p>
                  <strong>Grown-ups:</strong> this browser can't listen to voices. Please open ColouringAI in Chrome,
                  Edge or Safari.
                </p>
              </div>
            ) : (
              <button
                type="button"
                className={`mic-btn ${speech.listening ? "mic-btn--on" : ""}`}
                onClick={onMicTap}
                disabled={busy}
                aria-label={micLabel}
              >
                <span className="mic-btn__ring" aria-hidden="true" />
                <span className="mic-btn__icon" aria-hidden="true">
                  {speech.listening ? "✓" : busy ? "✏️" : "🎤"}
                </span>
                <span className="mic-btn__label">{micLabel}</span>
              </button>
            )}

            {phase === "redirect" && suggestions.length > 0 && (
              <div className="suggestions">
                <p className="suggestions__hint">Tap an idea, or tap the button and say a new one!</p>
                <div className="suggestions__list">
                  {suggestions.map((s) => (
                    <button key={s.label} type="button" className="idea-card" onClick={() => onSuggestion(s)}>
                      <span className="idea-card__emoji" aria-hidden="true">
                        {s.emoji}
                      </span>
                      <span className="idea-card__label">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === "thinking" && (
              <div className="tip-card" role="note">
                <span className="tip-card__badge">AI Smart Tip</span>
                <p key={tip}>{AI_TIPS[tip]}</p>
              </div>
            )}
          </section>

          {page && (
            <section className="art-zone" aria-label="Your colouring page">
              <ColouringPage key={page.key} page={page} animate />
              {phase === "printed" && (
                <button type="button" className="soft-btn" onClick={() => window.print()}>
                  🖨️ Print again
                </button>
              )}
            </section>
          )}
        </main>

        <footer className="steps-bar">
          <AiSteps current={stepState.current} done={stepState.done} />
          {mode === "demo" && <p className="demo-note">Practice mode: using built-in pictures.</p>}
        </footer>

        {showGrownUps && <GrownUps mode={mode} onClose={() => setShowGrownUps(false)} />}
      </div>

      <PrintSheet page={page} />
    </>
  );
}
