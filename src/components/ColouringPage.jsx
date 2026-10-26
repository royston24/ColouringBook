import { useState } from "react";

export const CRAYONS = [
  { name: "Red", hex: "#FF6B5B" },
  { name: "Orange", hex: "#FF9F43" },
  { name: "Yellow", hex: "#FFD84D" },
  { name: "Green", hex: "#5CC98C" },
  { name: "Blue", hex: "#4AB3F4" },
  { name: "Purple", hex: "#9D7BF0" },
  { name: "Pink", hex: "#FF9EC7" },
  { name: "Brown", hex: "#A47148" },
];
const ERASER = { name: "Eraser", hex: "#FFFFFF" };

// Draws the shapes as line art. Lines are revealed one after another like a pen
// drawing them, which helps children see the AI "drawing" rather than just appearing.
export function LineArt({ shapes, fills = {}, onShapeTap, animate = false, className = "" }) {
  const total = shapes.length;
  return (
    <svg className={`line-art ${animate ? "line-art--animate" : ""} ${className}`} viewBox="0 0 400 400" role="img">
      <rect x="0" y="0" width="400" height="400" fill="#FFFFFF" />
      {shapes.map((shape, i) => {
        const isArea = shape.kind === "area";
        return (
          <path
            key={i}
            d={shape.d}
            pathLength="1"
            fill={isArea ? fills[i] || "#FFFFFF" : "none"}
            stroke="#1E1E24"
            strokeWidth={isArea ? 5 : 4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isArea ? "art-area" : "art-line"}
            style={{ "--d": `${(i / Math.max(total, 1)) * 2.2}s` }}
            onClick={isArea && onShapeTap ? () => onShapeTap(i) : undefined}
          />
        );
      })}
    </svg>
  );
}

// The on-screen colouring page: tap a crayon, then tap a shape to colour it in.
export default function ColouringPage({ page, animate }) {
  const [fills, setFills] = useState({});
  const [crayon, setCrayon] = useState(CRAYONS[0].hex);

  const colourShape = (i) => setFills((f) => ({ ...f, [i]: crayon }));

  return (
    <div className="colouring">
      <div className="paper">
        <LineArt shapes={page.shapes} fills={fills} onShapeTap={colourShape} animate={animate} />
      </div>
      <div className="crayon-box" role="radiogroup" aria-label="Pick a crayon">
        {[...CRAYONS, ERASER].map((c) => (
          <button
            key={c.name}
            type="button"
            role="radio"
            aria-checked={crayon === c.hex}
            aria-label={c.name}
            title={c.name}
            className={`crayon ${crayon === c.hex ? "crayon--active" : ""} ${c === ERASER ? "crayon--eraser" : ""}`}
            style={{ "--c": c.hex }}
            onClick={() => setCrayon(c.hex)}
          >
            {c === ERASER && <span aria-hidden="true">🧽</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// The sheet that goes to the printer: a big, clean page with space to write a name.
export function PrintSheet({ page }) {
  if (!page) return null;
  return (
    <div className="print-sheet" aria-hidden="true">
      <h1 className="print-sheet__title">{page.title}</h1>
      <LineArt shapes={page.shapes} className="print-sheet__art" />
      <div className="print-sheet__footer">
        <span>Coloured in by: ______________________</span>
        <span>Made with ColouringAI ✏️</span>
      </div>
    </div>
  );
}
