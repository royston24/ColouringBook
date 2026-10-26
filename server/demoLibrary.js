// Ready-made colouring pages used in demo mode (when no Claude API key is set),
// so the whole app can be tried out without an AI connection.
// Every picture is drawn on the same 400 x 400 canvas the AI uses.

const ground = { kind: "area", d: "M10 320 Q200 290 390 320 L390 390 L10 390 Z" };
const sun = { kind: "area", d: "M330 30 A40 40 0 1 1 329.9 30 Z" };
const cloud = (x, y) => ({
  kind: "area",
  d: `M${x} ${y} q0 -24 26 -24 q8 -18 30 -14 q20 -10 34 8 q24 0 24 30 Z`,
});
const flower = (x, y) => [
  { kind: "line", d: `M${x} ${y} L${x} ${y + 40}` },
  { kind: "area", d: `M${x - 14} ${y} a14 14 0 1 1 28 0 a14 14 0 1 1 -28 0 Z` },
  { kind: "area", d: `M${x - 5} ${y} a5 5 0 1 1 10 0 a5 5 0 1 1 -10 0 Z` },
];

export const DEMO_PAGES = {
  cat: {
    title: "Happy Cat",
    keywords: ["cat", "kitten", "kitty"],
    shapes: [
      ground, sun, cloud(40, 80),
      { kind: "area", d: "M130 330 Q110 230 200 220 Q290 230 270 330 Z" },
      { kind: "area", d: "M270 320 Q330 300 320 240 Q318 225 330 222 Q345 230 338 250 Q345 320 272 335 Z" },
      { kind: "area", d: "M140 150 L150 90 L185 125 Z" },
      { kind: "area", d: "M260 150 L250 90 L215 125 Z" },
      { kind: "area", d: "M135 170 A65 58 0 1 1 265 170 A65 58 0 1 1 135 170 Z" },
      { kind: "area", d: "M165 160 a12 14 0 1 1 24 0 a12 14 0 1 1 -24 0 Z" },
      { kind: "area", d: "M211 160 a12 14 0 1 1 24 0 a12 14 0 1 1 -24 0 Z" },
      { kind: "area", d: "M192 185 L208 185 L200 195 Z" },
      { kind: "line", d: "M185 205 Q200 218 215 205" },
      { kind: "line", d: "M150 190 L110 182 M150 198 L108 202 M250 190 L290 182 M250 198 L292 202" },
      ...flower(60, 290), ...flower(345, 285),
    ],
  },
  fish: {
    title: "Little Fish",
    keywords: ["fish", "sea", "ocean", "goldfish", "underwater"],
    shapes: [
      { kind: "area", d: "M10 330 Q100 310 200 330 Q300 350 390 325 L390 390 L10 390 Z" },
      { kind: "area", d: "M100 200 Q170 110 260 200 Q170 290 100 200 Z" },
      { kind: "area", d: "M255 200 L330 150 Q315 200 330 250 Z" },
      { kind: "area", d: "M160 150 Q185 110 215 140 Z" },
      { kind: "area", d: "M130 185 a12 12 0 1 1 24 0 a12 12 0 1 1 -24 0 Z" },
      { kind: "line", d: "M115 215 Q125 225 140 220" },
      { kind: "line", d: "M190 160 Q210 200 190 240 M215 165 Q235 200 215 235" },
      { kind: "area", d: "M80 110 a14 14 0 1 1 28 0 a14 14 0 1 1 -28 0 Z" },
      { kind: "area", d: "M60 70 a9 9 0 1 1 18 0 a9 9 0 1 1 -18 0 Z" },
      { kind: "area", d: "M90 35 a6 6 0 1 1 12 0 a6 6 0 1 1 -12 0 Z" },
      { kind: "area", d: "M40 330 Q30 280 50 250 Q60 290 55 330 Z" },
      { kind: "area", d: "M330 330 Q350 270 340 240 Q320 280 320 330 Z" },
      { kind: "area", d: "M200 360 a20 12 0 1 1 40 0 a20 12 0 1 1 -40 0 Z" },
    ],
  },
  house: {
    title: "My House",
    keywords: ["house", "home", "cottage"],
    shapes: [
      ground, sun, cloud(30, 70),
      { kind: "area", d: "M110 200 L290 200 L290 330 L110 330 Z" },
      { kind: "area", d: "M90 205 L200 110 L310 205 Z" },
      { kind: "area", d: "M245 150 L245 110 L270 110 L270 172 Z" },
      { kind: "area", d: "M180 260 L220 260 L220 330 L180 330 Z" },
      { kind: "area", d: "M130 225 L165 225 L165 260 L130 260 Z" },
      { kind: "area", d: "M235 225 L270 225 L270 260 L235 260 Z" },
      { kind: "line", d: "M147 225 L147 260 M130 242 L165 242 M252 225 L252 260 M235 242 L270 242" },
      { kind: "area", d: "M190 160 a10 10 0 1 1 20 0 a10 10 0 1 1 -20 0 Z" },
      ...flower(60, 285), ...flower(340, 285),
    ],
  },
  rocket: {
    title: "Space Rocket",
    keywords: ["rocket", "space", "spaceship", "astronaut", "planet", "moon", "stars"],
    shapes: [
      { kind: "area", d: "M300 300 a50 50 0 1 1 100 0 L390 390 L300 390 Z" },
      { kind: "area", d: "M200 40 Q260 110 255 260 L145 260 Q140 110 200 40 Z" },
      { kind: "area", d: "M200 40 Q225 65 236 95 L164 95 Q175 65 200 40 Z" },
      { kind: "area", d: "M170 150 a30 30 0 1 1 60 0 a30 30 0 1 1 -60 0 Z" },
      { kind: "area", d: "M145 200 L100 280 L148 260 Z" },
      { kind: "area", d: "M255 200 L300 280 L252 260 Z" },
      { kind: "area", d: "M165 262 L235 262 Q230 320 200 360 Q170 320 165 262 Z" },
      { kind: "area", d: "M60 60 L66 78 L84 78 L70 89 L75 107 L60 96 L45 107 L50 89 L36 78 L54 78 Z" },
      { kind: "area", d: "M320 90 L325 104 L340 104 L328 113 L332 127 L320 118 L308 127 L312 113 L300 104 L315 104 Z" },
      { kind: "area", d: "M40 250 a28 28 0 1 1 56 0 a28 28 0 1 1 -56 0 Z" },
      { kind: "line", d: "M30 255 Q68 235 106 255" },
    ],
  },
  sun: {
    title: "Sunny Day",
    keywords: ["sun", "sunny", "sky", "weather", "rainbow"],
    shapes: [
      ground, cloud(30, 80), cloud(260, 120),
      { kind: "area", d: "M140 170 a60 60 0 1 1 120 0 a60 60 0 1 1 -120 0 Z" },
      { kind: "line", d: "M200 85 L200 60 M200 255 L200 280 M115 170 L90 170 M285 170 L310 170 M140 110 L122 92 M260 110 L278 92 M140 230 L122 248 M260 230 L278 248" },
      { kind: "area", d: "M172 150 a8 10 0 1 1 16 0 a8 10 0 1 1 -16 0 Z" },
      { kind: "area", d: "M212 150 a8 10 0 1 1 16 0 a8 10 0 1 1 -16 0 Z" },
      { kind: "line", d: "M170 190 Q200 215 230 190" },
      ...flower(80, 300), ...flower(200, 310), ...flower(320, 300),
    ],
  },
  car: {
    title: "Zoom Car",
    keywords: ["car", "truck", "bus", "vehicle", "race"],
    shapes: [
      ground, sun, cloud(40, 80),
      { kind: "area", d: "M60 290 L70 240 Q80 225 110 222 L150 175 Q160 165 180 165 L260 165 Q280 165 292 180 L320 222 Q345 226 345 250 L345 290 Z" },
      { kind: "area", d: "M160 185 L190 185 L190 222 L135 222 Z" },
      { kind: "area", d: "M205 185 L255 185 Q268 185 276 196 L295 222 L205 222 Z" },
      { kind: "area", d: "M95 295 a32 32 0 1 1 64 0 a32 32 0 1 1 -64 0 Z" },
      { kind: "area", d: "M247 295 a32 32 0 1 1 64 0 a32 32 0 1 1 -64 0 Z" },
      { kind: "area", d: "M115 295 a12 12 0 1 1 24 0 a12 12 0 1 1 -24 0 Z" },
      { kind: "area", d: "M267 295 a12 12 0 1 1 24 0 a12 12 0 1 1 -24 0 Z" },
      { kind: "area", d: "M325 240 L345 240 L345 258 L325 258 Z" },
      { kind: "line", d: "M20 240 L50 240 M10 262 L45 262" },
    ],
  },
  tree: {
    title: "Big Tree",
    keywords: ["tree", "forest", "garden", "park", "apple"],
    shapes: [
      ground, sun,
      { kind: "area", d: "M180 330 L185 220 L215 220 L220 330 Z" },
      { kind: "area", d: "M200 60 Q260 60 270 110 Q320 120 310 170 Q320 230 250 230 L150 230 Q80 230 90 170 Q80 120 130 110 Q140 60 200 60 Z" },
      { kind: "area", d: "M150 150 a12 12 0 1 1 24 0 a12 12 0 1 1 -24 0 Z" },
      { kind: "area", d: "M225 130 a12 12 0 1 1 24 0 a12 12 0 1 1 -24 0 Z" },
      { kind: "area", d: "M200 185 a12 12 0 1 1 24 0 a12 12 0 1 1 -24 0 Z" },
      { kind: "area", d: "M255 190 a12 12 0 1 1 24 0 a12 12 0 1 1 -24 0 Z" },
      { kind: "area", d: "M60 140 Q75 125 90 140 Q75 150 60 140 Z" },
      { kind: "line", d: "M48 130 Q60 120 70 135 M90 135 Q100 120 112 130" },
      ...flower(70, 290), ...flower(330, 290),
    ],
  },
  dog: {
    title: "Friendly Dog",
    keywords: ["dog", "puppy", "doggy"],
    shapes: [
      ground, sun, cloud(40, 80),
      { kind: "area", d: "M120 330 Q110 240 200 235 Q290 240 280 330 Z" },
      { kind: "area", d: "M140 165 A60 58 0 1 1 260 165 A60 58 0 1 1 140 165 Z" },
      { kind: "area", d: "M145 130 Q110 140 115 200 Q140 205 150 160 Z" },
      { kind: "area", d: "M255 130 Q290 140 285 200 Q260 205 250 160 Z" },
      { kind: "area", d: "M172 150 a10 12 0 1 1 20 0 a10 12 0 1 1 -20 0 Z" },
      { kind: "area", d: "M208 150 a10 12 0 1 1 20 0 a10 12 0 1 1 -20 0 Z" },
      { kind: "area", d: "M186 178 a14 10 0 1 1 28 0 a14 10 0 1 1 -28 0 Z" },
      { kind: "line", d: "M180 200 Q200 214 220 200" },
      { kind: "area", d: "M193 207 Q200 230 207 207 Z" },
      { kind: "area", d: "M280 300 Q330 280 320 240 Q335 245 335 265 Q330 310 282 318 Z" },
      ...flower(60, 290),
    ],
  },
  butterfly: {
    title: "Pretty Butterfly",
    keywords: ["butterfly", "butterflies", "bug", "insect", "flower", "flowers"],
    shapes: [
      ground,
      { kind: "area", d: "M195 180 Q120 70 70 110 Q40 170 190 200 Z" },
      { kind: "area", d: "M205 180 Q280 70 330 110 Q360 170 210 200 Z" },
      { kind: "area", d: "M190 205 Q90 220 110 280 Q150 300 195 220 Z" },
      { kind: "area", d: "M210 205 Q310 220 290 280 Q250 300 205 220 Z" },
      { kind: "area", d: "M110 135 a18 18 0 1 1 36 0 a18 18 0 1 1 -36 0 Z" },
      { kind: "area", d: "M254 135 a18 18 0 1 1 36 0 a18 18 0 1 1 -36 0 Z" },
      { kind: "area", d: "M190 160 Q200 140 210 160 L208 260 Q200 275 192 260 Z" },
      { kind: "line", d: "M196 150 Q180 110 165 105 M204 150 Q220 110 235 105" },
      ...flower(60, 285), ...flower(200, 300), ...flower(340, 285),
    ],
  },
};

// Picks the demo page that best matches the spoken idea, or the sunny day page.
export function findDemoPage(text) {
  const words = String(text).toLowerCase();
  for (const page of Object.values(DEMO_PAGES)) {
    if (page.keywords.some((k) => new RegExp(`\\b${k}`).test(words))) return page;
  }
  return null;
}
