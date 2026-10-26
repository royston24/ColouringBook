// Shared child-safety word filter.
//
// Used in two places:
//   * the browser, so a flagged word is hidden the instant it is heard, and
//   * the server, which is the real gatekeeper (the browser check can't be trusted).
//
// It is only the first layer. On the server every prompt that passes this filter is
// also checked by an AI safety reviewer, and the drawing itself is rebuilt from
// validated shapes, so nothing unsafe can reach the page.

// Words that are never OK in a G-rated children's app. Matched as whole words,
// with common endings (s, es, ed, ing, er, y) also caught.
const BLOCKED = {
  violence: [
    "kill", "killer", "murder", "blood", "bloody", "gore", "gory", "corpse", "dead body",
    "behead", "decapitate", "stab", "strangle", "choke", "torture", "massacre", "slaughter",
    "war", "warfare", "battle", "fight", "punch", "beat up", "attack", "assault", "kidnap",
    "hostage", "terrorist", "terrorism", "execute", "execution", "noose",
    "violent", "violence", "injure", "wound", "bleed", "bruise", "abuse", "hurt",
  ],
  weapons: [
    "gun", "pistol", "rifle", "shotgun", "machine gun", "revolver", "bullet", "ammo",
    "ammunition", "bomb", "grenade", "explosive", "dynamite", "missile", "rocket launcher",
    "weapon", "knife", "dagger", "machete", "axe", "chainsaw", "sniper", "tank shell",
    "nuke", "nuclear bomb", "shoot", "shooting", "shooter",
  ],
  scary: [
    "horror", "gruesome", "creepy", "terrifying", "nightmare", "demon", "devil", "satan",
    "satanic", "hell", "zombie", "possessed", "exorcist", "evil clown", "serial killer",
    "slasher", "haunted", "skull", "skeleton", "grave", "graveyard", "coffin", "cemetery",
    "vampire bite", "werewolf attack",
  ],
  adult: [
    "sex", "sexy", "sexual", "naked", "nude", "nudity", "porn", "porno", "pornography",
    "boob", "boobs", "breast", "breasts", "nipple", "penis", "vagina", "genital", "genitals",
    "bikini", "lingerie", "underwear", "bra", "panties", "thong", "stripper", "strip club",
    "seductive", "erotic", "kinky", "fetish", "hooker", "prostitute", "making out", "hot girl",
  ],
  substances: [
    "drug", "drugs", "cocaine", "heroin", "meth", "weed", "marijuana", "cannabis", "joint",
    "bong", "pills", "overdose", "beer", "wine", "vodka", "whisky", "whiskey", "alcohol",
    "cocktail", "drunk", "booze", "cigarette", "cigar", "smoking", "smoke weed", "vape",
    "vaping", "tobacco", "casino", "gambling",
  ],
  selfHarm: [
    "suicide", "suicidal", "kill myself", "hurt myself", "cut myself", "self harm",
    "die", "dying", "death",
  ],
  meanness: [
    "hate", "racist", "racism", "nazi", "swastika", "kkk", "slave", "slavery", "bully",
    "bullying", "loser", "ugly", "fat", "stupid", "idiot", "dumb", "moron", "retard",
  ],
  rude: [
    "fuck", "fucking", "shit", "bitch", "bastard", "damn", "crap", "ass", "asshole",
    "dick", "cock", "pussy", "cunt", "whore", "slut", "wanker", "bollocks", "bugger",
    "piss", "poop", "poo", "pee", "fart", "butt", "bum", "booty", "toilet humour",
  ],
};

// Words that are often fine for children (a friendly ghost, a pirate sword) but can
// head somewhere not child-friendly. They are not blocked here; instead the AI safety
// reviewer is told to look extra carefully. In demo mode (no AI available) they are
// redirected to something else, because there is no reviewer to make the call.
const CAUTION = [
  "sword", "pirate", "ghost", "witch", "monster", "dragon", "dinosaur fight", "scary",
  "spooky", "halloween", "vampire", "werewolf", "mummy", "spider", "snake", "shark",
  "fire", "burning", "explosion", "volcano", "police", "army", "soldier", "ninja",
  "robot fight", "jail", "prison", "blood moon", "kiss", "kissing", "boyfriend",
  "girlfriend", "date", "dating", "wedding", "bath", "swimsuit", "medicine", "needle",
  "injection", "hospital", "bow and arrow", "cannon", "tank", "laser", "battle",
];

// Phrases that contain a blocked word but are completely wholesome.
const ALLOWED_PHRASES = [
  "shooting star", "shooting stars", "bow tie", "hot air balloon", "hot dog",
  "joint of", "hangman", "hanging basket", "hanging plant", "fire engine", "fire truck",
  "fire fighter", "firefighter", "fire station", "rocket ship", "space rocket",
  "fat cat", "die cast", "butterfly", "butterflies", "cockatoo", "cockatiel",
  "cockerel", "peacock", "dickens", "grasshopper", "assistant", "classroom",
  "passport", "glasses", "class", "skeleton key", "battle of the bands", "pillow fight",
  "snowball fight", "water fight", "cake fight", "butter", "butterscotch", "ugly duckling",
  "big fat", "fat pig", "fat panda", "dumb bell", "dumbbell",
];

// Spoken personal information we never want a child to share with an AI.
const PERSONAL_INFO_PATTERNS = [
  /\bmy (full |real |last )?name is\b/,
  /\bmy (home )?address\b/,
  /\bi live (at|on|in)\b/,
  /\bmy (phone|telephone|mobile|cell)( number)?\b/,
  /\bmy (email|password|school is|teacher is)\b/,
  /\bmy (mum|mom|dad|mother|father)'?s? (name|phone|number|email)\b/,
  /\b\d{5,}\b/, // long number strings: phone numbers, postcodes, card numbers
  /\b\d+ [a-z]+ (street|st|road|rd|avenue|ave|lane|ln|drive|dr|close|way|crescent)\b/,
];

const LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" };

// Lower-case, strip accents, undo simple letter-for-number swaps and squash
// stretched words ("guuuun" -> "gun") so the filter isn't easy to dodge.
export function normalise(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    // Only swap numbers/symbols that sit inside a word ("b0mb"), never real numbers ("3 cats").
    .replace(/[a-z0-9@$]*[a-z][a-z0-9@$]*/g, (w) => w.replace(/[013457@$]/g, (c) => LEET[c]))
    .replace(/[’`]/g, "'")
    .replace(/[^a-z0-9'*\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/([a-z])\1{2,}/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordRegex(term) {
  const parts = term.split(" ").map(escapeRegExp).join("\\s+");
  return new RegExp(`(^|[^a-z])${parts}(s|es|ed|ing|er|y)?(?=$|[^a-z])`, "i");
}

const BLOCKED_ENTRIES = Object.entries(BLOCKED).flatMap(([category, words]) =>
  words.map((w) => ({ category, word: w, re: wordRegex(w) }))
);
const CAUTION_ENTRIES = CAUTION.map((w) => ({ word: w, re: wordRegex(w) }));

function withoutAllowedPhrases(text) {
  let out = ` ${text} `;
  for (const phrase of ALLOWED_PHRASES) {
    out = out.replace(new RegExp(`(^|[^a-z])${escapeRegExp(phrase)}(?=$|[^a-z])`, "gi"), "$1 ");
  }
  return out;
}

// Checks a whole spoken prompt.
// Returns { ok, reason, category, matches, caution }
//   reason: "empty" | "too-long" | "masked-word" | "blocked-word" | "personal-info" | null
export function checkPrompt(raw) {
  const text = normalise(raw);
  if (!text) return { ok: false, reason: "empty", category: null, matches: [], caution: [] };
  if (text.length > 300) return { ok: false, reason: "too-long", category: null, matches: [], caution: [] };

  // Browsers' speech recognition turns swear words into "f***". Treat that as rude.
  if (/\*/.test(raw)) {
    return { ok: false, reason: "masked-word", category: "rude", matches: ["***"], caution: [] };
  }

  for (const re of PERSONAL_INFO_PATTERNS) {
    if (re.test(text)) {
      return { ok: false, reason: "personal-info", category: "personal", matches: [], caution: [] };
    }
  }

  const scanText = withoutAllowedPhrases(text);
  const hits = BLOCKED_ENTRIES.filter((e) => e.re.test(scanText));
  if (hits.length) {
    return {
      ok: false,
      reason: "blocked-word",
      category: hits[0].category,
      matches: [...new Set(hits.map((h) => h.word))],
      caution: [],
    };
  }

  const caution = CAUTION_ENTRIES.filter((e) => e.re.test(scanText)).map((e) => e.word);
  return { ok: true, reason: null, category: null, matches: [], caution };
}

// Checks a single word as it appears on screen, so a flagged word can be shown
// as a friendly "oops" bubble instead of the word itself. The neighbouring words
// let wholesome phrases through ("shooting" is fine in "shooting star").
export function isWordFlagged(word, previousWord = "", nextWord = "") {
  if (/\*/.test(word)) return true;
  const single = normalise(word);
  if (!single) return false;
  if (!BLOCKED_ENTRIES.some((e) => e.re.test(` ${single} `))) return false;
  const withPrev = normalise(`${previousWord} ${word}`);
  const withNext = normalise(`${word} ${nextWord}`);
  return !ALLOWED_PHRASES.some((p) => p === single || p === withPrev || p === withNext);
}

// Friendly, non-judgemental explanations a child hears when a prompt is redirected.
// Each one also teaches a little about using AI responsibly.
export const KIND_MESSAGES = {
  rude: "Oops! Those words aren't kind words. ColouringAI only uses friendly words. Let's try a different idea!",
  violence: "ColouringAI only draws happy, gentle pictures. AI helpers have rules to keep everyone safe. How about something fun instead?",
  weapons: "ColouringAI only draws happy, gentle pictures. AI helpers have rules to keep everyone safe. How about something fun instead?",
  scary: "That might be a bit too spooky! ColouringAI likes friendly pictures. Let's pick something cheerful!",
  adult: "That's not something ColouringAI can draw. It only makes pictures that are just right for kids. Let's think of something else!",
  substances: "That's a grown-up thing, so ColouringAI won't draw it. Let's choose something fun for kids!",
  selfHarm: "That sounds like a big feeling. If you feel sad or hurt, please talk to a grown-up you trust. They are there to help you. Would you like to draw something happy together?",
  meanness: "ColouringAI only uses kind words about everyone. Being kind is a great way to use AI! Let's try a kind idea.",
  personal: "Remember! We never tell AI our name, address, phone number, or school. Those are private. Just tell me what to draw!",
  unclear: "Hmm, I'm not sure what to draw. Try saying something like: a happy cat in a hat!",
  default: "Let's try a different idea! ColouringAI only draws pictures that are friendly for kids.",
};

export const SAFE_SUGGESTIONS = [
  { label: "a cat in a hat", emoji: "🐱" },
  { label: "a rocket in space", emoji: "🚀" },
  { label: "a smiling sun", emoji: "🌞" },
  { label: "a fish in the sea", emoji: "🐟" },
  { label: "a house with flowers", emoji: "🏡" },
  { label: "a friendly dog", emoji: "🐶" },
  { label: "a butterfly", emoji: "🦋" },
  { label: "a car going fast", emoji: "🚗" },
  { label: "a big tree", emoji: "🌳" },
];

export function pickSuggestions(count = 3) {
  const pool = [...SAFE_SUGGESTIONS];
  const out = [];
  while (out.length < count && pool.length) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}
