// ColouringAI server: keeps the Claude API key private and runs every safety check
// before a picture is drawn. The browser never talks to the AI directly.
import crypto from "node:crypto";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkPrompt, KIND_MESSAGES, pickSuggestions } from "../shared/safety.js";
import { aiAvailable, reviewPrompt, drawPicture } from "./ai.js";
import { findDemoPage, DEMO_PAGES } from "./demoLibrary.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "4kb" }));

// Gentle per-device limit so the app can't be used to spam the AI.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = Number(process.env.COLOURINGAI_RATE_LIMIT || 20);
const hits = new Map();
function rateLimited(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > RATE_MAX;
}
const TOO_MANY = {
  status: "rest",
  message: "Wow, you made lots of pictures! Time to colour them in. Come back in a little while for more.",
};

// A reviewed idea is handed back to the browser with a signed ticket, and only a
// valid ticket can be drawn. That way the drawing step can't be reached without
// passing the safety check first.
const SECRET = crypto.randomBytes(32);
const TICKET_TTL_MS = 10 * 60 * 1000;
function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}
function makeTicket({ mode, subject, title }) {
  const issued = Date.now();
  return { issued, sig: sign(`${mode}|${subject}|${title}|${issued}`) };
}
function ticketValid({ mode, subject, title, ticket }) {
  if (!ticket || typeof ticket.sig !== "string" || typeof ticket.issued !== "number") return false;
  if (Date.now() - ticket.issued > TICKET_TTL_MS) return false;
  const expected = Buffer.from(sign(`${mode}|${subject}|${title}|${ticket.issued}`));
  const given = Buffer.from(ticket.sig);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

function redirect(category) {
  return {
    status: "redirect",
    category: category || "default",
    message: KIND_MESSAGES[category] || KIND_MESSAGES.default,
    suggestions: pickSuggestions(3),
  };
}

app.get("/api/status", (_req, res) => {
  res.json({ mode: aiAvailable() ? "ai" : "demo" });
});

// Step: safety check. Word filter first, then the AI safety reviewer.
app.post("/api/check", async (req, res) => {
  if (rateLimited(`check:${req.ip}`)) return res.status(429).json(TOO_MANY);

  const spoken = typeof req.body?.prompt === "string" ? req.body.prompt.slice(0, 400) : "";

  // Layer 1: word filter (the same rules the browser uses, re-checked here).
  const check = checkPrompt(spoken);
  if (!check.ok) {
    if (check.reason === "empty") return res.json(redirect("unclear"));
    if (check.reason === "too-long") {
      return res.json({ ...redirect("unclear"), message: "That's a big idea! Try telling me in just a few words." });
    }
    return res.json(redirect(check.category));
  }

  // Demo mode: no AI reviewer, so caution words are redirected and only
  // built-in pictures are used.
  if (!aiAvailable()) {
    if (check.caution.length) return res.json(redirect("default"));
    const page = findDemoPage(spoken);
    if (!page) {
      return res.json({
        ...redirect("default"),
        category: "demo",
        message:
          "I'm in practice mode, so I only know a few pictures right now. Try a cat, a dog, a fish, a house, a rocket, a car, a tree, a butterfly or the sun!",
      });
    }
    const result = { mode: "demo", subject: page.title, title: page.title };
    return res.json({ status: "ok", ...result, ticket: makeTicket(result) });
  }

  try {
    // Layer 2: AI safety reviewer.
    const review = await reviewPrompt(spoken, check.caution);
    if (review.verdict !== "safe") {
      return res.json(redirect(review.verdict === "unclear" ? "unclear" : review.category));
    }
    // The reviewer's clean subject goes through the word filter again, just in case.
    if (!checkPrompt(`${review.subject} ${review.title}`).ok) return res.json(redirect("default"));

    const result = { mode: "ai", subject: review.subject, title: review.title };
    return res.json({ status: "ok", ...result, ticket: makeTicket(result) });
  } catch (err) {
    console.error("[check] failed:", err?.status || "", err?.message || err);
    return res.status(502).json({ status: "error", message: "Oh no, my crayons got tangled! Let's try that again." });
  }
});

// Step: think and draw. Only accepts ideas that passed the safety check.
app.post("/api/draw", async (req, res) => {
  if (rateLimited(`draw:${req.ip}`)) return res.status(429).json(TOO_MANY);

  const { mode, subject, title, ticket } = req.body || {};
  if (!ticketValid({ mode, subject, title, ticket })) {
    return res.status(400).json({ status: "error", message: "Let's start that one again!" });
  }

  if (mode === "demo") {
    const page = Object.values(DEMO_PAGES).find((p) => p.title === title) || DEMO_PAGES.sun;
    return res.json({ status: "ok", title: page.title, subject: page.title, shapes: page.shapes });
  }

  try {
    // Layer 3: the illustrator only receives the clean subject, and its answer is
    // rebuilt from validated path data (see cleanShapes), so no markup can sneak in.
    const shapes = await drawPicture(subject);
    return res.json({ status: "ok", title, subject, shapes });
  } catch (err) {
    console.error("[draw] failed:", err?.status || "", err?.message || err);
    return res.status(502).json({ status: "error", message: "Oh no, my crayons got tangled! Let's try that again." });
  }
});

if (process.env.NODE_ENV === "production") {
  const dist = path.join(here, "..", "dist");
  app.use(express.static(dist));
  app.get("/{*splat}", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`ColouringAI server on http://localhost:${port} (${aiAvailable() ? "AI" : "demo"} mode)`);
});
