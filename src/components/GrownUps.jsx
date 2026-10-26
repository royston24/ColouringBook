import { useEffect, useRef } from "react";

// Information for parents and teachers: how it works, how children are kept safe,
// and what happens to their voice.
export default function GrownUps({ mode, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="grownups-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="grownups-title">For grown-ups</h2>

        <h3>What ColouringAI does</h3>
        <p>
          Your child says what they'd like to colour. ColouringAI shows their words as they speak, checks the idea is
          child-friendly, asks an AI to draw a simple line-art page, and sends it to your printer. They can colour it on
          paper, or tap shapes on screen to colour them in.
        </p>

        <h3>How children are kept safe (G-rated only)</h3>
        <ul>
          <li>
            <strong>Word filter:</strong> words linked to violence, weapons, scary or adult themes, drugs, unkind or rude
            language are caught instantly, and never shown on screen.
          </li>
          <li>
            <strong>AI safety reviewer:</strong> every idea is then checked by an AI that looks for indirect or disguised
            requests. If in doubt, it says no and offers a friendly alternative.
          </li>
          <li>
            <strong>Clean drawing:</strong> the drawing AI only receives the reviewed, cleaned-up idea, and only simple
            outline shapes are accepted back. No text, links or images from the internet can appear.
          </li>
          <li>
            <strong>Privacy lesson:</strong> if a child says their name, address, phone number or school, Pip reminds them
            to keep those private and doesn't send them on.
          </li>
        </ul>

        <h3>Voice and privacy</h3>
        <p>
          Speech is turned into words by your web browser's built-in speech recognition (in Chrome, this uses Google's
          service). The words are sent to the ColouringAI server and to Anthropic's Claude AI to make the picture. No
          audio, words or pictures are stored by ColouringAI.
        </p>

        <h3>Printing</h3>
        <p>
          Pages print automatically after each drawing. To skip the print window on a dedicated kids' computer, start
          Chrome with <code>--kiosk-printing</code> and set your default printer.
        </p>

        {mode === "demo" && (
          <p className="modal__demo">
            ColouringAI is in <strong>practice mode</strong> because no AI key is set up, so it uses a few built-in
            pictures. See the README to connect it to Claude.
          </p>
        )}

        <button ref={closeRef} type="button" className="soft-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
