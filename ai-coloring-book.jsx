import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Printer, Eraser, ShieldCheck } from "lucide-react";

const CRAYONS = [
  { name: "Sunshine", hex: "#FFC93C" },
  { name: "Coral", hex: "#FF6F59" },
  { name: "Sky", hex: "#3EC1D3" },
  { name: "Grass", hex: "#6BBF59" },
  { name: "Grape", hex: "#9B5DE5" },
  { name: "Bubblegum", hex: "#FF8FB1" },
  { name: "Chocolate", hex: "#8C5A3C" },
  { name: "Snow", hex: "#FFFFFF" },
];

// Light-grey coloring-book style decorative doodles used purely as background flavor
function Doodle({ type, size = 90, style }) {
  const common = { fill: "none", stroke: "#D7D1BF", strokeWidth: 4, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    princess: (
      <svg viewBox="0 0 100 140" width={size} height={size * 1.4} style={style}>
        <circle cx="50" cy="30" r="16" {...common} />
        <path d="M34 20 L38 6 L44 16 L50 4 L56 16 L62 6 L66 20" {...common} />
        <path d="M35 46 Q50 40 65 46 L78 130 Q50 140 22 130 Z" {...common} />
      </svg>
    ),
    superhero: (
      <svg viewBox="0 0 100 140" width={size} height={size * 1.4} style={style}>
        <circle cx="50" cy="26" r="16" {...common} />
        <path d="M38 22 Q50 30 62 22" {...common} />
        <path d="M30 46 L70 46 L82 120 Q50 135 18 120 Z" {...common} />
        <path d="M50 68 L54 80 L66 80 L56 88 L60 100 L50 92 L40 100 L44 88 L34 80 L46 80 Z" {...common} />
      </svg>
    ),
    car: (
      <svg viewBox="0 0 120 70" width={size * 1.3} height={size * 0.76} style={style}>
        <path d="M10 50 L14 30 Q20 18 40 18 L80 18 Q96 18 104 34 L110 50 Z" {...common} />
        <circle cx="30" cy="54" r="10" {...common} />
        <circle cx="90" cy="54" r="10" {...common} />
      </svg>
    ),
    spaceship: (
      <svg viewBox="0 0 80 140" width={size * 0.7} height={size * 1.4} style={style}>
        <path d="M40 4 Q60 30 60 80 L20 80 Q20 30 40 4 Z" {...common} />
        <circle cx="40" cy="50" r="10" {...common} />
        <path d="M20 80 L6 110 L22 100 Z" {...common} />
        <path d="M60 80 L74 110 L58 100 Z" {...common} />
        <path d="M30 100 L40 130 L50 100" {...common} />
      </svg>
    ),
    animal: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={style}>
        <circle cx="50" cy="55" r="30" {...common} />
        <path d="M26 34 L34 10 L46 30 Z" {...common} />
        <path d="M74 34 L66 10 L54 30 Z" {...common} />
        <circle cx="40" cy="52" r="3" fill="#D7D1BF" stroke="none" />
        <circle cx="60" cy="52" r="3" fill="#D7D1BF" stroke="none" />
        <path d="M46 64 Q50 68 54 64" {...common} />
        <path d="M20 60 L36 58 M20 68 L36 66 M80 60 L64 58 M80 68 L64 66" {...common} />
      </svg>
    ),
    leaf: (
      <svg viewBox="0 0 100 100" width={size} height={size} style={style}>
        <path d="M50 90 Q20 70 30 30 Q50 10 70 30 Q80 70 50 90 Z" {...common} />
        <path d="M50 90 L50 30" {...common} />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 100 100" width={size * 0.7} height={size * 0.7} style={style}>
        <path d="M50 5 L61 38 L96 38 L67 59 L78 92 L50 71 L22 92 L33 59 L4 38 L39 38 Z" {...common} />
      </svg>
    ),
    cloud: (
      <svg viewBox="0 0 120 70" width={size * 1.2} height={size * 0.7} style={style}>
        <path d="M25 55 Q5 55 5 38 Q5 22 22 22 Q26 6 46 6 Q66 6 70 22 Q90 20 92 40 Q94 55 76 55 Z" {...common} />
      </svg>
    ),
    balloon: (
      <svg viewBox="0 0 60 100" width={size * 0.55} height={size} style={style}>
        <path d="M30 5 Q55 5 55 32 Q55 55 30 60 Q5 55 5 32 Q5 5 30 5 Z" {...common} />
        <path d="M30 60 L26 90 M30 60 L34 90 M26 90 L34 90" {...common} />
      </svg>
    ),
  };
  return paths[type] || null;
}

// Scattered placement for the background collage — kept clear of the center column
const DECOR_ITEMS = [
  { type: "princess", top: "4%", left: "3%", size: 80, rotate: -8 },
  { type: "spaceship", top: "6%", left: "84%", size: 70, rotate: 10 },
  { type: "car", top: "20%", left: "-2%", size: 90, rotate: 6 },
  { type: "cloud", top: "2%", left: "40%", size: 70, rotate: 0 },
  { type: "star", top: "12%", left: "60%", size: 50, rotate: 15 },
  { type: "superhero", top: "38%", left: "86%", size: 75, rotate: -6 },
  { type: "animal", top: "40%", left: "1%", size: 80, rotate: 4 },
  { type: "leaf", top: "58%", left: "88%", size: 70, rotate: 12 },
  { type: "balloon", top: "60%", left: "4%", size: 65, rotate: -10 },
  { type: "star", top: "74%", left: "90%", size: 45, rotate: -12 },
  { type: "cloud", top: "80%", left: "6%", size: 80, rotate: 0 },
  { type: "leaf", top: "88%", left: "70%", size: 60, rotate: -6 },
  { type: "balloon", top: "92%", left: "40%", size: 55, rotate: 8 },
  { type: "car", top: "94%", left: "82%", size: 70, rotate: -4 },
];

function DecorLayer() {
  return (
    <div
      className="no-print"
      style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
      aria-hidden="true"
    >
      {DECOR_ITEMS.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: item.top,
            left: item.left,
            transform: `rotate(${item.rotate}deg)`,
            opacity: 0.6,
          }}
        >
          <Doodle type={item.type} size={item.size} />
        </div>
      ))}
    </div>
  );
}

const SYSTEM_PROMPT = `You create simple black-and-white line-art coloring pages for young children (ages 4-9).

Output ONLY a single valid SVG element, nothing else — no markdown fences, no explanation.

Rules:
- Root: <svg viewBox="0 0 400 400" width="400" height="400" xmlns="http://www.w3.org/2000/svg">
- Build the scene from 8-14 separate closed shapes (path, circle, ellipse, rect, or polygon), each with a unique id like id="shape-1".
- Every shape: fill="white" stroke="#1a1a1a" stroke-width="6" stroke-linejoin="round"
- Shapes should be big, bold, simple, and friendly — no fine detail, no text, no tiny elements a small child couldn't color.
- The scene should clearly depict what was asked for, drawn in a cheerful children's-book style.
- Keep content 100% wholesome and age-appropriate. If the request is unclear, unsafe, scary, or inappropriate for a young child, ignore it and instead draw a simple happy sun with a smiling face and a few clouds.
- Never include real people, brand logos, or violent/scary imagery.`;

export default function ColoringBookApp() {
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micError, setMicError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [svgMarkup, setSvgMarkup] = useState("");
  const [activeColor, setActiveColor] = useState(CRAYONS[1].hex);
  const [showAiNote, setShowAiNote] = useState(false);
  const [heardText, setHeardText] = useState("");

  const artRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSpeechSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + " ";
      transcriptRef.current = text.trim();
      setHeardText(transcriptRef.current);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setMicError(true);
      setListening(false);
    };
    recognitionRef.current = rec;
  }, []);

  const startListening = () => {
    if (!speechSupported || loading) return;
    setError("");
    setMicError(false);
    setSvgMarkup("");
    transcriptRef.current = "";
    setHeardText("");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      setMicError(true);
    }
  };

  const stopListeningAndGo = () => {
    if (!speechSupported || !listening) return;
    recognitionRef.current.stop();
    setListening(false);
    const finalPrompt = transcriptRef.current.trim();
    if (!finalPrompt) {
      setError("I didn't catch that — hold the button and try again!");
      return;
    }
    generate(finalPrompt);
  };

  const generate = async (spokenPrompt) => {
    setLoading(true);
    setError("");
    setSvgMarkup("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Draw: ${spokenPrompt}` }],
        }),
      });
      const data = await response.json();
      const text = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");
      const match = text.match(/<svg[\s\S]*?<\/svg>/i);
      if (!match) throw new Error("no-svg");
      setSvgMarkup(match[0]);
    } catch (e) {
      setError("Hmm, the drawing didn't work. Let's try again!");
    } finally {
      setLoading(false);
    }
  };

  // Auto-print the moment a fresh drawing is ready
  useEffect(() => {
    if (!svgMarkup) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [svgMarkup]);

  const handleShapeClick = useCallback(
    (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (["path", "circle", "ellipse", "rect", "polygon"].includes(tag)) {
        e.target.setAttribute("fill", activeColor);
      }
    },
    [activeColor]
  );

  useEffect(() => {
    const node = artRef.current;
    if (!node) return;
    node.addEventListener("click", handleShapeClick);
    return () => node.removeEventListener("click", handleShapeClick);
  }, [svgMarkup, handleShapeClick]);

  const clearColors = () => {
    const node = artRef.current;
    if (!node) return;
    node.querySelectorAll("path, circle, ellipse, rect, polygon").forEach((el) => {
      el.setAttribute("fill", "white");
    });
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: "#FFFBF0", minHeight: "100vh", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&family=Nunito:wght@400;700;800&display=swap');
        .brand-title { font-family: 'Fredoka', sans-serif; }
        .crayon-btn {
          border: none; cursor: pointer; font-family: 'Fredoka', sans-serif;
          border-radius: 999px; padding: 14px 28px; font-size: 17px; font-weight: 600;
          box-shadow: 0 4px 0 rgba(0,0,0,0.15); transition: transform 0.08s ease;
        }
        .crayon-btn:active { transform: translateY(3px); box-shadow: 0 1px 0 rgba(0,0,0,0.15); }
        .crayon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .wobble-card {
          background: white; border-radius: 28px; border: 3px solid #22303F;
          box-shadow: 6px 6px 0 #22303F;
        }
        .swatch {
          width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
          border: 3px solid #22303F; transition: transform 0.1s ease;
        }
        .swatch.active { transform: scale(1.18); box-shadow: 0 0 0 3px #FFC93C; }
        @media print {
          .no-print { display: none !important; }
          .print-area { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <DecorLayer />

      <div
        style={{
          maxWidth: 640, margin: "0 auto", padding: "28px 20px 60px",
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column",
          minHeight: svgMarkup ? "auto" : "100vh",
          justifyContent: svgMarkup ? "flex-start" : "center",
        }}
      >
        <div className="no-print" style={{ textAlign: "center", marginBottom: 22 }}>
          <h1
            className="brand-title"
            style={{
              fontSize: 38, margin: 0, letterSpacing: "-0.5px",
              background: "linear-gradient(90deg, #FF6F59, #FFC93C, #3EC1D3, #9B5DE5)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}
          >
            🖍️ Doodle Buddy
          </h1>
          <p style={{ color: "#5a5a5a", marginTop: 6, fontSize: 15 }}>
            Hold the button, say what to draw, and let go — it'll sketch it and print it out!
          </p>
        </div>

        <div className="no-print" style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            className="crayon-btn"
            onMouseDown={startListening}
            onMouseUp={stopListeningAndGo}
            onMouseLeave={() => listening && stopListeningAndGo()}
            onTouchStart={(e) => { e.preventDefault(); startListening(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopListeningAndGo(); }}
            disabled={!speechSupported || loading}
            style={{
              background: listening ? "#FF6F59" : loading ? "#ddd" : "#3EC1D3",
              color: "white", width: 160, height: 160, borderRadius: "50%",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 8, fontSize: 16, margin: "0 auto",
              boxShadow: "0 6px 0 rgba(0,0,0,0.15)",
              transform: listening ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.12s ease",
            }}
          >
            <Mic size={36} />
            {loading ? "Drawing…" : listening ? "Let go to draw!" : "Hold & speak"}
          </button>

          {heardText && listening && (
            <p style={{ marginTop: 14, fontSize: 15, color: "#5a5a5a", fontStyle: "italic" }}>
              "{heardText}"
            </p>
          )}
          {!speechSupported && (
            <p style={{ fontSize: 13, color: "#a15", marginTop: 12 }}>
              Voice input isn't supported in this browser — try Chrome.
            </p>
          )}
          {micError && (
            <p style={{ fontSize: 13, color: "#a15", marginTop: 12, maxWidth: 320, marginInline: "auto" }}>
              Can't reach the microphone. If this is running inside a preview/sandbox, mic access may be blocked at the platform level — try opening the app on its own page.
            </p>
          )}
          {error && <p style={{ fontSize: 14, color: "#c0392b", marginTop: 10 }}>{error}</p>}
        </div>

        {svgMarkup && (
          <>
            <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
              {CRAYONS.map((c) => (
                <div
                  key={c.hex}
                  className={"swatch" + (activeColor === c.hex ? " active" : "")}
                  style={{ background: c.hex }}
                  onClick={() => setActiveColor(c.hex)}
                  title={c.name}
                />
              ))}
            </div>

            <div className="wobble-card print-area" style={{ padding: 16, marginBottom: 18 }}>
              <div
                ref={artRef}
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>

            <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="crayon-btn" onClick={clearColors} style={{ background: "#eee", color: "#22303F", display: "flex", alignItems: "center", gap: 8 }}>
                <Eraser size={18} /> Clear colors
              </button>
              <button className="crayon-btn" onClick={handlePrint} style={{ background: "#6BBF59", color: "white", display: "flex", alignItems: "center", gap: 8 }}>
                <Printer size={18} /> Print
              </button>
            </div>
          </>
        )}

        <div className="no-print" style={{ marginTop: 30, textAlign: "center" }}>
          <button
            onClick={() => setShowAiNote((s) => !s)}
            style={{ background: "none", border: "none", color: "#5a5a5a", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}
          >
            {showAiNote ? "Hide" : "How does the AI draw this? 🤔"}
          </button>
          {showAiNote && (
            <div className="wobble-card" style={{ padding: 18, marginTop: 12, textAlign: "left", fontSize: 14, lineHeight: 1.5, color: "#22303F" }}>
              <p style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                <ShieldCheck size={18} color="#6BBF59" /> Being smart with AI
              </p>
              <p>Your words become a picture in three steps: <b>Words</b> → the AI thinks about your idea → <b>Sketch</b>.</p>
              <p>AI isn't magic — it's a computer program that learned from lots of pictures and words. It can make mistakes or draw things a little differently than you imagined!</p>
              <p>Some rules for using AI safely: never share your full name, address, or photos of yourself. Always ask a grown-up before using AI on your own. And remember — AI helps you create, but the ideas are yours!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
