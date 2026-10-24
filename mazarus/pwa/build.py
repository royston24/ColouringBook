"""Build the installable app (PWA) from the artifact source.

    python3 mazarus/pwa/build.py [out_dir]

Reads mazarus/index.html (artifact-style: no <head>), wraps it in a full
document with a manifest, icons and an offline service worker, and writes
a static site to out_dir (default: mazarus/pwa/dist). Upload that folder's
contents to a GitHub Pages repo.
"""
import json, math, os, re, sys, hashlib
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "index.html")
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "dist"))

src = open(SRC, encoding="utf-8").read()
title = re.search(r"<title>(.*?)</title>", src).group(1)
body = re.sub(r"<title>.*?</title>\s*", "", src, count=1)
body = re.sub(r'<meta name="theme-color"[^>]*>\s*', "", body, count=1)
version = hashlib.sha1(src.encode()).hexdigest()[:10]

HEAD = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="Daily companion for the Project Mazarus 18-month plan.">
<meta name="theme-color" content="#05070d">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Mazarus">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>
:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}
</style>
</head>
<body>
"""
TAIL = f"""
<script>
if ("serviceWorker" in navigator && location.protocol !== "file:") {{
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {{}}));
}}
</script>
</body>
</html>
"""

os.makedirs(os.path.join(OUT, "icons"), exist_ok=True)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(HEAD + body + TAIL)

manifest = {
    "name": "Mazarus Log", "short_name": "Mazarus", "description": "Daily companion for the Project Mazarus 18-month plan.",
    "start_url": "./", "scope": "./", "display": "standalone", "orientation": "portrait",
    "background_color": "#05070d", "theme_color": "#05070d",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
    ]
}
json.dump(manifest, open(os.path.join(OUT, "manifest.webmanifest"), "w"), indent=2)

SW = """// Offline cache for Mazarus Log. Bump happens automatically on each build.
const CACHE = "mazarus-%s";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate") {
    // Network first for the page so updates arrive; fall back to the cached copy offline
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return r; }).catch(() => caches.match("index.html")));
    return;
  }
  if (url.origin === location.origin || /fonts\\.(googleapis|gstatic)\\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
  }
});
""" % version
open(os.path.join(OUT, "sw.js"), "w").write(SW)

# Icons: a hex badge on the app's ice→violet→rose gradient
def icon(size, pad_frac):
    s = size * 4
    img = Image.new("RGB", (s, s))
    px = img.load()
    stops = [(0.0, (139, 233, 255)), (0.55, (169, 150, 255)), (1.0, (255, 143, 199))]
    for y in range(s):
        for x in range(s):
            t = (x + y) / (2 * s)
            for (a, ca), (b, cb) in zip(stops, stops[1:]):
                if a <= t <= b:
                    k = (t - a) / (b - a); px[x, y] = tuple(int(ca[i] + (cb[i] - ca[i]) * k) for i in range(3)); break
    dark = Image.new("RGB", (s, s), (5, 7, 13))
    mask = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(mask)
    cx = cy = s / 2; r = s * (0.5 - pad_frac)
    hexpts = [(cx + r * math.sin(math.radians(a)), cy - r * math.cos(math.radians(a))) for a in range(0, 360, 60)]
    d.polygon(hexpts, fill=255)
    inner = [(cx + (r * 0.74) * math.sin(math.radians(a)), cy - (r * 0.74) * math.cos(math.radians(a))) for a in range(0, 360, 60)]
    d.polygon(inner, fill=0)
    core = [(cx + (r * 0.30) * math.sin(math.radians(a)), cy - (r * 0.30) * math.cos(math.radians(a))) for a in range(0, 360, 60)]
    d.polygon(core, fill=255)
    out = Image.composite(img, dark, mask)
    glow = out.filter(ImageFilter.GaussianBlur(s * 0.03))
    out = Image.blend(glow, out, 0.75)
    return out.resize((size, size), Image.LANCZOS)

icon(192, 0.12).save(os.path.join(OUT, "icons", "icon-192.png"))
icon(512, 0.12).save(os.path.join(OUT, "icons", "icon-512.png"))
icon(512, 0.22).save(os.path.join(OUT, "icons", "icon-maskable-512.png"))
icon(180, 0.14).save(os.path.join(OUT, "icons", "apple-touch-icon.png"))
open(os.path.join(OUT, ".nojekyll"), "w").close()
print("Built", OUT, "version", version)
