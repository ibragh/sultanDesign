"""Inject only the Phosphor symbols a page uses.

Usage: python3 shared/inline-icons.py path/to/page.html
The page must contain the marker <!--ICONS--> (or a previous injected block)
and reference icons as <svg class="icon"><use href="#i-NAME"/></svg>.
"""
import re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent
sprite = (root / "icons-sprite.svg.html").read_text()
symbols = {sid: full for full, sid in re.findall(r'(<symbol id="(i-[a-z0-9-]+)".*?</symbol>)', sprite, re.S)}

page = pathlib.Path(sys.argv[1])
html = page.read_text()
used = sorted(set(re.findall(r'href="#(i-[a-z0-9-]+)"', html)))
missing = [u for u in used if u not in symbols]
block = ('<!--ICONS--><svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">'
         + "".join(symbols[u] for u in used if u in symbols) + "</svg><!--/ICONS-->")
html, n = re.subn(r'<!--ICONS-->(?:.*?<!--/ICONS-->)?', lambda m: block, html, count=1, flags=re.S)
if not n:
    sys.exit("No <!--ICONS--> marker found in " + str(page))
page.write_text(html)
print(f"{page}: injected {len(used) - len(missing)} icons" + (f"; MISSING: {missing}" if missing else ""))
