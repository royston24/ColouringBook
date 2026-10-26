// The two AI steps behind ColouringAI, both using Claude:
//   1. reviewPrompt  - an AI safety reviewer decides if the idea is G-rated and
//                      rewrites it as a short, clean drawing subject.
//   2. drawPicture   - an AI illustrator turns that clean subject into simple,
//                      bold line-art shapes for a colouring page.
//
// The illustrator never sees the child's raw words, only the reviewer's clean subject.
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

// Opus reviews for safety (the careful judgement call); Sonnet draws (fast and cheaper).
const REVIEW_MODEL = process.env.COLOURINGAI_REVIEW_MODEL || "claude-opus-5-5";
const DRAW_MODEL = process.env.COLOURINGAI_DRAW_MODEL || "claude-sonnet-5-5";

let client = null;
export function aiAvailable() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

// ---------- Step 1: safety review ----------

const ReviewSchema = z.object({
  verdict: z.enum(["safe", "not_safe", "unclear"]),
  category: z.enum([
    "none", "violence", "weapons", "scary", "adult", "substances", "selfHarm",
    "meanness", "rude", "personal", "real_person", "unclear",
  ]),
  subject: z.string(),
  title: z.string(),
});

const REVIEW_SYSTEM = `You are the safety reviewer for ColouringAI, a voice app where young children (ages 4-10) say what they want on a printable colouring page.

You receive a transcript of what the child said. Speech recognition can mishear words, and children may try silly or rude things. Decide whether the idea is suitable for a G-rated colouring page that any parent or teacher would be happy to see.

verdict "safe" only when the drawing would be completely wholesome: animals, nature, vehicles, food, space, toys, sports, family and friends, friendly fantasy (unicorns, friendly dragons, fairies, friendly robots, cute monsters), everyday scenes.

verdict "not_safe" for anything involving: violence, fighting, injury, weapons, death, blood, horror or genuinely frightening imagery, nudity, romance beyond a simple hug, anything sexual or suggestive, body-part or toilet humour, drugs, alcohol, smoking, gambling, hate, insults, mocking appearance, self-harm, dangerous stunts, or anything a child could copy to get hurt. Also not_safe for real, identifiable people (celebrities, politicians, named classmates). Look for indirect or coded ways of asking for these things, misspellings, and words that sound like rude words. When in doubt, choose not_safe.

verdict "unclear" when there is no drawable idea (silence, gibberish, only filler words).

Personal information: if the child shares their name, address, school, phone number or similar, use category "personal" and verdict "not_safe", even if the drawing idea itself is fine.

If a caution hint lists words, those words often appear in child-friendly ideas but deserve a closer look. Allow them only when the overall idea is clearly gentle (a friendly pirate on a ship is fine; a pirate attacking someone is not).

For safe ideas:
- subject: a short, clean, positive description of what to draw (max 12 words), e.g. "a happy cat wearing a party hat". Replace trademarked characters with a generic look-alike description ("a friendly cartoon mouse"). Never include any personal information.
- title: a cheerful 2-5 word page title, e.g. "Party Cat".
For not_safe or unclear ideas, set subject and title to empty strings.`;

export async function reviewPrompt(spokenText, cautionWords = []) {
  const hint = cautionWords.length ? `\nCaution hint: ${cautionWords.join(", ")}` : "";
  const response = await getClient().messages.parse({
    model: REVIEW_MODEL,
    max_tokens: 4000,
    output_config: { effort: "low", format: zodOutputFormat(ReviewSchema) },
    system: REVIEW_SYSTEM,
    messages: [
      {
        role: "user",
        content: `<child_transcript>${spokenText}</child_transcript>${hint}`,
      },
    ],
  });

  // A refusal from the model itself is the strongest "no" there is.
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    return { verdict: "not_safe", category: "unclear", subject: "", title: "" };
  }
  return response.parsed_output;
}

// ---------- Step 2: drawing ----------

const DrawingSchema = z.object({
  shapes: z.array(
    z.object({
      kind: z.enum(["area", "line"]),
      d: z.string(),
    })
  ),
});

const DRAW_SYSTEM = `You are the illustrator for ColouringAI. You draw simple, cheerful black-and-white colouring-book pages for young children (ages 4-10).

Draw on a 400 x 400 canvas (x and y from 0 to 400). Describe the picture as a list of SVG path "d" strings.

- kind "area": a closed shape a child can colour in (end the path with Z). Make 8-20 of these.
- kind "line": an open detail stroke that is not coloured, such as a smile, whiskers, eyelashes or grass blades. Use up to 15.
- Use only absolute or relative M, L, H, V, C, S, Q, T, A and Z commands with numbers. No transforms, no text, no letters or words in the picture.
- Shapes must be large, bold and simple, with no tiny details a small child could not colour. Keep at least 10 units of margin from the edges.
- Later shapes are drawn on top of earlier ones and hide them, so draw the background first (sky, ground, big circles) and small details last.
- Fill the canvas nicely: the main subject should be large and centred, with a simple friendly background (ground line, sun, clouds, flowers, stars).
- Friendly cartoon style: big eyes, smiles, rounded shapes. Nothing scary, sad, violent or grown-up.`;

// Allows only path commands and numbers, so a path can never carry script or markup.
const SAFE_PATH = /^[MmLlHhVvCcSsQqTtAaZz0-9eE.,\s+-]+$/;

export function cleanShapes(shapes) {
  return (shapes || [])
    .filter((s) => s && (s.kind === "area" || s.kind === "line"))
    .map((s) => ({ kind: s.kind, d: String(s.d || "").trim() }))
    .filter((s) => s.d.length > 2 && s.d.length < 4000 && SAFE_PATH.test(s.d) && /^[Mm]/.test(s.d))
    .slice(0, 60);
}

export async function drawPicture(subject) {
  const response = await getClient().messages.parse({
    model: DRAW_MODEL,
    max_tokens: 16000,
    output_config: { effort: "medium", format: zodOutputFormat(DrawingSchema) },
    system: DRAW_SYSTEM,
    messages: [{ role: "user", content: `Draw a colouring page of: ${subject}` }],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error("drawing-refused");
  }
  const shapes = cleanShapes(response.parsed_output.shapes);
  if (shapes.filter((s) => s.kind === "area").length < 3) throw new Error("drawing-too-simple");
  return shapes;
}
