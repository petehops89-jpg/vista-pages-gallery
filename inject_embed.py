#!/usr/bin/env python3
"""
Inject the Perchance generator chat embed into the built Thumbsup gallery.

Why this exists:
  Thumbsup regenerates the gallery HTML on every build, so any manual edit to
  build_output/*.html would be wiped on the next deploy. Instead we inject the
  embed here, as a build step, so it survives rebuilds and stays in version
  control (this script + the URL below).

Placement:
  A simple chat-style panel, fixed at the top-right, ~25% down the viewport
  (so it floats over the gallery while you browse). Collapsible. On narrow
  screens it docks to the bottom.

The embed URL is a PLACEHOLDER. Replace PERCHANCE_URL with your real generator:
  - Full page:  https://perchance.org/YOUR-GENERATOR
  - Embed mode: https://perchance.org/embed/YOUR-GENERATOR   (preferred for iframes)
"""
import os
import sys
import re

# TODO(peteh): replace with your real Perchance generator embed URL.
# Prefer the /embed/ form so it renders cleanly inside an iframe.
PERCHANCE_URL = "https://perchance.org/embed/fortnite-info-persona"

BUILD_DIR = os.environ.get("EMBED_BUILD_DIR", "build_output")
PANEL_ID = "fn-perchance-embed"

EMBED_HTML = f"""
<!-- Fortnite Collection: Perchance generator chat embed (injected by inject_embed.py) -->
<div id="{PANEL_ID}">
  <div class="fn-embed-header">
    <span>Fortnite Generator</span>
    <button type="button" onclick="document.getElementById('{PANEL_ID}').classList.toggle('fn-collapsed')">_</button>
  </div>
  <iframe src="{PERCHANCE_URL}" title="Fortnite info / persona generator" loading="lazy"></iframe>
</div>
<!-- /inject_embed.py -->
"""


def inject_into_file(path: str) -> bool:
    with open(path, "r", encoding="utf-8") as fh:
        html = fh.read()

    # Idempotent: if we already injected, skip.
    if PANEL_ID in html and "inject_embed.py" in html:
        print(f"  already injected: {path}")
        return False

    # Insert just before </body>.
    if "</body>" in html:
        html = html.replace("</body>", EMBED_HTML + "\n</body>", 1)
    else:
        html += EMBED_HTML

    with open(path, "w", encoding="utf-8") as fh:
        fh.write(html)
    print(f"  injected: {path}")
    return True


def main() -> int:
    if not os.path.isdir(BUILD_DIR):
        print(f"Build dir '{BUILD_DIR}' not found — nothing to inject.")
        return 0

    count = 0
    for root, _dirs, files in os.walk(BUILD_DIR):
        for name in files:
            if name.endswith(".html"):
                if inject_into_file(os.path.join(root, name)):
                    count += 1

    print(f"Done. Injected embed into {count} HTML file(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
