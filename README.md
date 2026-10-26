# ColouringAI

**Level 1 of an AI learning app for children.** Children *say* what they'd like to colour. ColouringAI shows their words as colourful bubbles while they speak, checks that the idea is child-friendly, asks an AI to draw a simple colouring-book page, and prints it automatically. Then they colour it in, on paper or on screen.

While they play, children learn how AI works and how to use it responsibly:

- **How AI completes a task:** a step bar shows the AI's journey every time: 👂 Listen → 🛡️ Safety check → 💭 Think → ✏️ Draw → 🖨️ Print.
- **Using AI responsibly:** when an idea isn't suitable, Pip the robot explains kindly why, and offers three fun ideas instead. If a child says their name, address, phone number or school, Pip reminds them that personal details stay private.
- **What AI is:** "AI Smart Tips" appear while the picture is being made, for example "AI can make mistakes. If your picture looks funny, try saying it a different way!"

## What it's like to use

1. **Voice only.** There is no text box anywhere. One big button starts listening, and listening stops on its own when the child stops talking.
2. **Words as bubbles.** Each spoken word pops in as its own coloured bubble. A word the safety filter doesn't like is shown as a 🙈 bubble, so it never appears on screen.
3. **Pip the robot** reads every message aloud, so children who can't read yet can follow along. There is a 🔊 button to turn the voice off.
4. **The drawing appears** as if a pen is drawing it, then the page prints automatically. Children can also tap a crayon and tap shapes to colour on screen.
5. **Calm by design:** a warm paper background, a small set of bright colours, slow and gentle animation, and no sounds apart from Pip's voice. All motion switches off for users with "reduce motion" turned on.

## G-rated only: how children are kept safe

Safety is layered, so no single layer has to be perfect:

| Layer | Where | What it does |
| --- | --- | --- |
| 1. Word filter | Browser **and** server (`shared/safety.js`) | Blocks words linked to violence, weapons, horror, adult content, drugs and alcohol, self-harm, hate, insults and rude or toilet language. It catches disguised spellings (`b0mb`, `guuun`) and the `f***` masking that browsers use for swear words, while allowing wholesome phrases like "shooting star" or "butterfly". |
| 2. Personal-info guard | Browser and server | Catches names, addresses, phone numbers and school names, and teaches the child to keep them private. |
| 3. AI safety reviewer | Server (`server/ai.js`) | Claude reviews every idea for indirect or coded requests, real people and anything not G-rated. If in doubt, it says no. "Caution" words (pirate, ghost, dragon…) get an extra-careful look. |
| 4. Signed ticket | Server | Only ideas that passed review can reach the drawing step. The drawing endpoint rejects anything without a valid, short-lived signature. |
| 5. Clean illustrator | Server | The drawing AI never sees the child's raw words, only the reviewer's cleaned-up subject. |
| 6. Shape-only output | Server | The drawing comes back as plain outline shapes. Each one is checked to contain only drawing commands and numbers, then rebuilt into the page. No text, links, scripts or outside images can appear. |
| 7. Rate limit | Server | A gentle limit per device (20 pictures per 10 minutes by default). |

The API key stays on the server and is never sent to the browser.

## Two versions

| | Full app (this project) | claude.ai app |
| --- | --- | --- |
| Open it | Run it on your computer or a web host (below) | Open its claude.ai link |
| Child's idea | Spoken aloud, words appear as bubbles | Tapped from picture tiles (who, doing, where), words appear as bubbles |
| Drawing | Claude Sonnet, through your API key | Claude Sonnet, through the viewer's own Claude account (no API key) |
| Printing | Prints automatically | Saves an A4 PDF to print |

The claude.ai version exists because claude.ai pages can't use the microphone or open the print window. Its source is `artifact/template.html`. Rebuild it with `node artifact/build.mjs`, which pulls in the same safety filter and built-in pictures as the full app, then publish `artifact/colouringai.html`.

## Running it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
cp .env.example .env      # then paste your Claude API key into .env
npm run dev               # opens on http://localhost:5173
```

Open it in **Chrome, Edge or Safari**. These browsers have built-in speech recognition; Firefox does not. Allow microphone access when asked.

**No API key yet?** The app still runs in **practice mode**, using built-in pictures: a cat, dog, fish, house, rocket, car, tree, butterfly and sun. All the safety checks still apply.

### Production

```bash
npm run build
npm start                 # serves the app and API on http://localhost:8787
```

Microphone access needs HTTPS (or `localhost`), so put the server behind HTTPS when hosting it.

### Printing without the print window

Pages print automatically after each drawing, which normally opens the browser's print window. On a dedicated kids' computer you can skip that window: set a default printer and start Chrome with `--kiosk-printing`.

### Settings (`.env`)

| Variable | Default | Meaning |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | – | Your Claude API key. Leave it empty for practice mode. |
| `COLOURINGAI_REVIEW_MODEL` | `claude-opus-5-5` | The Claude model that safety-checks each idea. |
| `COLOURINGAI_DRAW_MODEL` | `claude-sonnet-5-5` | The Claude model that draws the colouring page. |
| `COLOURINGAI_RATE_LIMIT` | `20` | Pictures per device per 10 minutes. |
| `PORT` | `8787` | Server port. |

## Tests

```bash
npm test
```

The tests cover the word filter (safe ideas pass, unsafe ideas are blocked with the right reason, personal information is caught, on-screen word hiding works), the shape validator (markup and scripts are rejected), and the demo pictures.

## Project layout

```
shared/safety.js           word filter, personal-info guard, kind messages, safe suggestions
server/index.js            API: /api/check (safety) → /api/draw (drawing), signed tickets, rate limit
server/ai.js               Claude safety reviewer and illustrator, shape validation
server/demoLibrary.js      built-in pictures for practice mode
src/App.jsx                the voice-only flow
src/hooks/useSpeech.js     speech recognition (listening) and speech synthesis (Pip's voice)
src/components/            Pip, word bubbles, AI step bar, colouring page and print sheet, grown-ups panel
```

## Privacy notes for parents and schools

- Speech is turned into text by the browser's own speech recognition. In Chrome, this is Google's speech service.
- The words are sent to the ColouringAI server and to Anthropic's Claude API to make the picture.
- ColouringAI itself stores no audio, words or pictures.
