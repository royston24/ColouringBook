// The journey from voice to paper, shown as simple steps so children can see
// that AI follows a process: it listens, checks it's safe, thinks, draws, and prints.
export const STEPS = [
  { id: "listen", icon: "👂", label: "Listen" },
  { id: "check", icon: "🛡️", label: "Safety check" },
  { id: "think", icon: "💭", label: "Think" },
  { id: "draw", icon: "✏️", label: "Draw" },
  { id: "print", icon: "🖨️", label: "Print" },
];

export default function AiSteps({ current, done = [] }) {
  return (
    <ol className="ai-steps" aria-label="How ColouringAI makes your picture">
      {STEPS.map((step, i) => {
        const state = done.includes(step.id) ? "done" : current === step.id ? "active" : "waiting";
        return (
          <li key={step.id} className={`ai-step ai-step--${state}`} aria-current={state === "active" ? "step" : undefined}>
            <span className="ai-step__icon" aria-hidden="true">
              {state === "done" ? "✓" : step.icon}
            </span>
            <span className="ai-step__label">{step.label}</span>
            {i < STEPS.length - 1 && <span className="ai-step__line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
