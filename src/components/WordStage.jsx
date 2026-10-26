import { isWordFlagged } from "../../shared/safety.js";

const BUBBLE_COLOURS = ["coral", "sun", "sky", "mint", "grape"];

// Shows the child's words as they speak, each one popping in as its own bubble
// instead of sitting in a text box. Words the safety filter doesn't like are
// shown as a "🙈" bubble so they never appear on screen.
export default function WordStage({ text, listening }) {
  const words = text ? text.split(/\s+/).filter(Boolean) : [];

  if (!words.length) {
    return (
      <div className="word-stage word-stage--empty" aria-live="polite">
        {listening && (
          <div className="listening-dots" aria-label="Listening">
            <span /> <span /> <span />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="word-stage" aria-live="polite">
      {words.map((word, i) => {
        const flagged = isWordFlagged(word, words[i - 1], words[i + 1]);
        return (
          <span
            key={`${i}-${flagged ? "x" : word}`}
            className={`word-bubble word-bubble--${flagged ? "oops" : BUBBLE_COLOURS[i % BUBBLE_COLOURS.length]}`}
            style={{ "--i": i }}
            aria-label={flagged ? "hidden word" : undefined}
          >
            {flagged ? "🙈" : word.replace(/\*/g, "")}
          </span>
        );
      })}
    </div>
  );
}
