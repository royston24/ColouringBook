// Builds the claude.ai version of ColouringAI (artifact/colouringai.html) from
// template.html, inlining the shared safety filter and the built-in pictures so
// both versions of the app follow exactly the same rules.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEMO_PAGES } from "../server/demoLibrary.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const safety = fs
  .readFileSync(path.join(here, "..", "shared", "safety.js"), "utf8")
  .replace(/^export /gm, "");
const pictures = Object.fromEntries(
  Object.entries(DEMO_PAGES).map(([k, p]) => [k, { title: p.title, keywords: p.keywords, shapes: p.shapes }])
);

const html = fs
  .readFileSync(path.join(here, "template.html"), "utf8")
  .replace("/*SAFETY*/", () => safety)
  .replace("/*PICTURES*/", () => `const PICTURES = ${JSON.stringify(pictures)};`);

fs.writeFileSync(path.join(here, "colouringai.html"), html);
console.log("Wrote artifact/colouringai.html", `(${(html.length / 1024).toFixed(1)} KB)`);
