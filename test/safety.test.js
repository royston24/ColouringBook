import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPrompt, isWordFlagged } from "../shared/safety.js";
import { cleanShapes } from "../server/ai.js";
import { DEMO_PAGES } from "../server/demoLibrary.js";

const SAFE = [
  "a cat in a hat",
  "a rocket going to the moon",
  "a shooting star over a house",
  "a butterfly on a flower",
  "a hot air balloon",
  "my dog playing with a ball",
  "three happy fish",
  "a fire engine",
  "bread and butter on a plate",
  "a pillow fight with teddies",
];

const UNSAFE = [
  ["a man with a gun", "weapons"],
  ["a b0mb", "weapons"],
  ["somebody getting killed", "violence"],
  ["blood everywhere", "violence"],
  ["a naked lady", "adult"],
  ["a guy drinking beer", "substances"],
  ["a zombie", "scary"],
  ["you are stupid", "meanness"],
  ["f*** this", "rude"],
  ["a big poo", "rude"],
  ["a guuuun", "weapons"],
];

test("allows wholesome ideas", () => {
  for (const p of SAFE) assert.equal(checkPrompt(p).ok, true, p);
});

test("blocks unsafe ideas with the right category", () => {
  for (const [p, cat] of UNSAFE) {
    const r = checkPrompt(p);
    assert.equal(r.ok, false, p);
    assert.equal(r.category, cat, p);
  }
});

test("catches personal information", () => {
  for (const p of ["my name is Sam Smith", "I live at 12 Oak Road", "call 07700900123", "my school is Hill Primary"]) {
    assert.equal(checkPrompt(p).reason, "personal-info", p);
  }
});

test("flags caution words for a closer look", () => {
  assert.deepEqual(checkPrompt("a friendly pirate on a ship").caution, ["pirate"]);
});

test("empty and very long prompts are not drawn", () => {
  assert.equal(checkPrompt("   ").reason, "empty");
  assert.equal(checkPrompt("cat ".repeat(100)).reason, "too-long");
});

test("hides flagged words on screen but keeps wholesome phrases", () => {
  assert.equal(isWordFlagged("gun"), true);
  assert.equal(isWordFlagged("s***"), true);
  assert.equal(isWordFlagged("cat"), false);
  assert.equal(isWordFlagged("shooting", "a", "star"), false);
  assert.equal(isWordFlagged("shooting", "a", "people"), true);
});

test("only plain path data survives from the drawing AI", () => {
  const shapes = cleanShapes([
    { kind: "area", d: "M10 10 L50 50 Z" },
    { kind: "area", d: "M0 0\"/><script>alert(1)</script>" },
    { kind: "line", d: "javascript:alert(1)" },
    { kind: "image", d: "M1 1 L2 2" },
  ]);
  assert.deepEqual(shapes, [{ kind: "area", d: "M10 10 L50 50 Z" }]);
});

test("demo pages are valid drawings", () => {
  for (const [name, page] of Object.entries(DEMO_PAGES)) {
    assert.equal(cleanShapes(page.shapes).length, page.shapes.length, name);
  }
});
