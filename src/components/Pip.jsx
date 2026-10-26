// Pip, the friendly ColouringAI robot. Its face shows what the AI is doing,
// so children can "see" listening, thinking and drawing.
// mood: "idle" | "listening" | "thinking" | "happy" | "oops"
export default function Pip({ mood = "idle", size = 140 }) {
  const eyes = {
    idle: <><circle cx="44" cy="62" r="7" /><circle cx="76" cy="62" r="7" /></>,
    listening: <><circle cx="44" cy="62" r="8" /><circle cx="76" cy="62" r="8" /></>,
    thinking: <><circle cx="47" cy="57" r="6" /><circle cx="79" cy="57" r="6" /></>,
    happy: (
      <>
        <path d="M36 64 Q44 54 52 64" fill="none" strokeWidth="5" stroke="#2B2D42" strokeLinecap="round" />
        <path d="M68 64 Q76 54 84 64" fill="none" strokeWidth="5" stroke="#2B2D42" strokeLinecap="round" />
      </>
    ),
    oops: <><circle cx="44" cy="62" r="6" /><circle cx="76" cy="62" r="6" /></>,
  }[mood];

  const mouth = {
    idle: <path d="M48 80 Q60 90 72 80" />,
    listening: <ellipse cx="60" cy="83" rx="7" ry="5" fill="#FF8A7A" />,
    thinking: <path d="M52 84 L68 82" />,
    happy: <path d="M44 78 Q60 96 76 78 Z" fill="#FF8A7A" />,
    oops: <ellipse cx="60" cy="84" rx="6" ry="7" fill="#FFF" />,
  }[mood];

  return (
    <svg
      className={`pip pip--${mood}`}
      viewBox="-16 0 152 130"
      width={size}
      height={size * (130 / 152)}
      role="img"
      aria-label="Pip the ColouringAI robot"
    >
      {/* antenna */}
      <path d="M60 24 V10" stroke="#2B2D42" strokeWidth="5" strokeLinecap="round" />
      <circle className="pip__bulb" cx="60" cy="9" r="7" fill="#FFC845" stroke="#2B2D42" strokeWidth="4" />
      {/* ears */}
      <rect x="4" y="52" width="14" height="28" rx="6" fill="#FF6B5B" stroke="#2B2D42" strokeWidth="4" />
      <rect x="102" y="52" width="14" height="28" rx="6" fill="#FF6B5B" stroke="#2B2D42" strokeWidth="4" />
      {mood === "listening" && (
        <g className="pip__waves" fill="none" stroke="#3BB4E5" strokeWidth="4" strokeLinecap="round">
          <path d="M-6 56 Q-14 66 -6 76" />
          <path d="M126 56 Q134 66 126 76" />
        </g>
      )}
      {/* head */}
      <rect x="16" y="24" width="88" height="80" rx="26" fill="#3BB4E5" stroke="#2B2D42" strokeWidth="5" />
      <rect x="28" y="40" width="64" height="54" rx="18" fill="#E9F7FD" stroke="#2B2D42" strokeWidth="4" />
      <g fill="#2B2D42" stroke="#2B2D42" strokeWidth="5" strokeLinecap="round">
        {eyes}
        {mouth}
      </g>
      {/* cheeks */}
      <circle cx="36" cy="80" r="5" fill="#FFB3A8" />
      <circle cx="84" cy="80" r="5" fill="#FFB3A8" />
      {/* crayon body */}
      <rect x="40" y="104" width="40" height="22" rx="8" fill="#FFC845" stroke="#2B2D42" strokeWidth="4" />
      {mood === "thinking" && (
        <g className="pip__dots" fill="#8E6CEF">
          <circle cx="98" cy="16" r="4" />
          <circle cx="108" cy="8" r="3" />
        </g>
      )}
    </svg>
  );
}
