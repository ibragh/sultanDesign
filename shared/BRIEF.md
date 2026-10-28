# sh.apartment redesign: shared brief for the 5 concepts (v2, replaces v1 entirely)

The old Riyadh/"Liwan" brief is dead. Everything is now based on the real business:

- Current site: https://hello-jed.sh-apartment.workers.dev/ (Arabic, RTL). Screenshots:
  `/tmp/claude-0/-home-user-sultanDesign/5f279c7a-a13b-5c35-ae8a-8b2b364c68db/scratchpad/orig/site-1440-full.png` and `site-390-full.png`.
  Its code (for reference only): `.../scratchpad/orig/app.js` (contains the Jeddah panorama SVG builder, booking flow,
  contract terms). Never copy the `pw` value or call any `/api/*` endpoint from a design. All booking/sync behaviour in the
  concepts is SIMULATED in the page.
- Real data: `/home/user/sultanDesign/shared/apartments.json` (7 apartments: names AR/EN, district, coordinates,
  bedrooms/beds/baths/guests, real Airbnb rating + review count, host, real descriptions, highlights, Airbnb links,
  photo paths). Read it and use it. Prices in it are placeholders.
- Real photos: `/home/user/sultanDesign/photos/<id>-<n>-<room>.jpg` (taken in the actual apartments; many are portrait
  phone shots). Reference as `../photos/...` from a design page. Always `object-fit: cover` in fixed aspect boxes.
  Look at the photos before designing (contact sheets: `.../scratchpad/orig/sheet-r1.jpg` … `sheet-r7.jpg`, where
  r1=midcentury, r2=cozy, r3=suite, r4=fawaz, r5=ajawid, r6=madinah, r7=orange). The interiors are the selling point:
  neon lit loft beds, cinema sofas, a jacuzzi, mustard and orange accents, a blue lit cinema loft, a black freestanding tub.

## The business

- Brand **sh.apartment** (Sultan and Hussam). Tagline "Your stay, our priority" / «راحتك أولويتنا». City: **Jeddah**.
  Logo in the current site: lowercase "sh." in orange + "apartment" in dark brown, with a small house roof mark. Brand
  orange #F59A1E. Emoji motifs in their listings: 🧡 and 🦩 (use the flamingo/orange idea as visual cues if you want, not
  emoji spam).
- 7 apartments in 4 areas: Al Nahda on King Road (3 units in ONE building: midcentury, cozy, suite), Madinah Road
  (madinah), Prince Fawaz (fawaz), Al Ajawid (ajawid and orange, same building). North cluster near the Corniche and
  airport; south east cluster near the National Guard Hospital, Park Square and a mosque.
- Proof: **4.83 average from 517 Airbnb reviews**. Sultan is an Airbnb Superhost. All units self check in (smart lock).
- WhatsApp: **+966 50 489 5569**, link `https://wa.me/966504895569` (owner's real public number, from their site).
  Also show it as selectable text.
- Channels today: Airbnb (main). The user also wants **Gathern** (جاذر إن, gathern.co). Show "Book direct" as the
  primary path, plus "Open on Airbnb" (real listing URLs from the JSON) and optionally "Gathern" (link
  `https://gathern.co/` for now). Availability label: «التقويم متزامن مع Airbnb» (and Gathern where it fits).

## What the current site already does (keep all of it, make it better)

1. One column "link in bio" list: an animated Jeddah illustration (Al Balad roshan houses, Corniche palms, King Fahd's
   Fountain, sky that follows device time, tap for lights, drag to change time), the logo, then 7 accordion rows
   (name, rating, review count, area, "Open on Airbnb", "Direct booking"). No photos, no prices, ratings flash 0.00.
2. **Direct booking with a contract** (their conversion engine):
   - calendar synced with Airbnb; booked nights are struck through; can't pick a range that crosses a booking
   - guest details: full name as on ID, nationality, ID / Iqama / passport number, mobile (05xxxxxxxx),
     number of companions and their names (optional)
   - read the contract terms, sign with a finger on a signature pad, tick "I agree"
   - «تأكيد وإنشاء العقد» → dates are held pending the owner's confirmation → contract number (e.g. SH-2611-0427) →
     send the contract PDF to the owner on WhatsApp, or download it
   - copy says the guest's data is not stored on the site
3. Owner dashboard (password) to manage units, Airbnb iCal links and direct bookings. Guest facing designs should NOT
   push this; at most a quiet footer link «دخول المالك».

Contract terms / house rules (from their site, use them): check in from 4:00 pm, check out by 12:00 pm; no smoking of
any kind inside (including e-cigarettes and shisha) and no charcoal; no pets without prior approval; keep quiet and
respect neighbours; booking confirmed after the agreed rent is paid to the owner; owner not responsible for personal
valuables; breaking the rules can end the stay without refund; the e-signature means the guest read and agreed.

## UX problems to fix (every concept should visibly solve most of these)

No photos. No prices or totals. Hard to compare units (mixed Arabic/English names, no beds/guests). Ratings show 0.00.
Booking is buried inside accordions. No search by dates across all units. No map or sense of which part of Jeddah.
No amenities, rules or FAQ before committing. Owner button is the most prominent button on a guest page.

## Content rules

- **Arabic first, RTL** (`<html lang="ar" dir="rtl">`) for every concept. Apartment names: use the clean `name_ar` /
  `name_en` from the JSON. D4 also has a working English toggle.
- Digits: use Western digits (0-9) for prices, dates, ratings and times, consistently. Currency «ر.س» or "SAR".
- Prices are placeholders from the JSON (weeknight `price`, Thursday/Friday nights `weekend`). No platform fee on direct.
- **Do not invent guest reviews.** Use the real aggregate (rating, review count per unit, 517 total, Superhost) and link
  to the Airbnb listing to read them. If a design needs quote cards, they must carry a visible small label like
  «نموذج: ضع هنا تقييماً حقيقياً من Airbnb» so nobody mistakes them for real reviews. No invented license numbers.
- Calm, specific, hospitable Saudi Arabic (Modern Standard, natural, not machine literal). No exclamation marks.
- Jeddah context you may use: the Corniche, King Fahd's Fountain, Al Balad (historic Jeddah, UNESCO), Red Sea Mall,
  King Abdulaziz International Airport (JED), Jeddah Season. Approximate coordinates are in the JSON `landmarks_approx`.

## Technical contract (every design)

- ONE standalone file `/home/user/sultanDesign/designs/<file>.html`. It is published as a supporting file of a multi page
  artifact, so it gets NO skeleton: start with `<!doctype html>`, `<html lang="ar" dir="rtl">`, `<meta charset="utf-8">`,
  `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `<title>`, meta
  description, then `<style>`. `body{margin:0}` with an explicit background.
- Fonts: Google Fonts `<link>` only, with real fallback stacks. Arabic text needs an Arabic face (see each concept).
- Vanilla inline JS. No libraries unless essential (allowed CDNs only, pinned). No `fetch` to anything.
- No external images, no iframes (maps in SVG/CSS), no `alert/confirm/prompt`, no `window.print`, no real downloads
  (a "Download PDF" button can show an inline note that the real site generates the PDF). Forms: `preventDefault()`,
  validate, show results inline.
- External links (`wa.me`, airbnb, gathern): `target="_blank" rel="noopener"`. Building a WhatsApp message link with
  `encodeURIComponent` text is great.
- Icons: Phosphor, inline. Literal marker `<!--ICONS-->` right after `<body>`; use
  `<svg class="i" aria-hidden="true"><use href="#i-NAME"/></svg>`; then run
  `python3 /home/user/sultanDesign/shared/inline-icons.py /home/user/sultanDesign/designs/<file>.html` (idempotent;
  rerun after edits). Names: see `shared/icons-sprite.svg.html`. Mirror directional arrows in RTL.
- Layout: side gutter `padding-left/right: max(16px, env(safe-area-inset-left/right, 0px))` on each band's inner
  wrapper; vertical padding via `padding-block`. No horizontal scroll at 390px. `min-width:0` on flex/grid text children.
  Sticky headers `top: env(safe-area-inset-top, 0px)`; fixed bottom bars add `env(safe-area-inset-bottom, 0px)`.
- Page complete at rest: nothing meant to be read waits at `opacity:0`. Scroll reveal pattern: on the first `scroll`
  (passive, once) mark only elements fully below the viewport as `.pre`, then reveal with IntersectionObserver (once).
  Images: no `loading="lazy"` on the first screen; lazy is fine further down.
- `prefers-reduced-motion` respected. Visible focus rings, skip link, landmarks, `tabular-nums` for numbers.
- Back link to the gallery: small fixed pill «كل التصاميم» linking `../index.html`, bottom LEFT corner in RTL (the
  opposite side from the main sticky CTA), respecting safe areas, clearly secondary. On mobile keep it clear of any
  sticky booking bar (stack above it).
- Single theme is fine unless the concept says otherwise; set every color through `:root` tokens and `color-scheme`.

### Verify, then report

1. `node /home/user/sultanDesign/shared/shot.js /home/user/sultanDesign/designs/<file>.html /tmp/claude-0/-home-user-sultanDesign/5f279c7a-a13b-5c35-ae8a-8b2b364c68db/scratchpad/<name> 1440 390`
   (prints overflow, fonts, console errors; writes full page PNGs). Read both PNGs.
2. Fix what is broken or ugly; at most one more screenshot round. Also click through the main flow once with a short
   Playwright script (e.g. pick dates, open booking, submit with errors, then valid) and confirm no console errors.
3. Report in under 150 words: path, the concept, what works, what is unfinished. No code.

---

## Concepts

### D1 `designs/01-corniche.html` · skill · layout A (classic hero + sections) · light
Follow the `landing-page-design` SKILL.md to the letter (Part A structure, Part B visual system). Script rule: Latin
text in **Manrope**; Arabic glyphs need an Arabic companion, use **IBM Plex Sans Arabic** for Arabic only (treat it like
the skill's allowed functional exception; one face per script, no other fonts). Tailwind scale sizes, spacing tokens,
radius formula, flat backgrounds, hero heading gradient #000 to #666 following reading direction, 680px hero max
width, floating blurred pill nav, full height mobile menu with staggered links and animated toggle, base curve, the
mandatory word by word tagline reveal, full state set (skeletons when searching, empty state, inline errors).
Homepage for all 7 units. One primary action: «تحقق من التوفر». Hero: real photo mosaic + availability bar (check in,
check out, guests) → skeleton → results across all 7 units (simulate some nights booked per unit), with totals.
Then: area filter chips (الكل، طريق الملك، طريق المدينة، الأمير فواز، الأجاويد) + size filter, cards with photo,
rating, reviews, beds/baths/guests, price, «احجز مباشرة» and «Airbnb»; benefits (4, outcome driven); how direct booking
works (3 real steps: choose dates, sign the contract on your phone, confirm on WhatsApp); proof band (4.83 from 517,
Superhost); FAQ (from the rules/policies); risk reversal; final CTA identical to the hero; footer with quiet owner link.
Palette: flat warm white + ink + the brand orange as the only accent (use it with restraint; check contrast; darken
for text).

### D2 `designs/02-neon.html` · skill · layout B (long form story) · dark
Same skill, to the letter. Dark backgrounds only from the skill list (base #131209, surfaces #1F1F1F/#272727/#313131),
hero heading gradient #FFFFFF to #9B9B9B. Latin **Geist** (Geist Mono allowed for numbers), Arabic companion
**Noto Kufi Arabic** for Arabic glyphs only. Accent: the brand orange, sparingly, plus the photos' own neon.
The story is one night in Jeddah told as a real timeline (times are meaningful structure): landing at JED, the door
code on WhatsApp, the lift up, neon on (use midcentury-3-neon-night, cozy-1-neon-cinema), cinema sofa and the 75 inch
screen, Corniche walk / King Fahd's Fountain, the jacuzzi, coffee in the morning (midcentury-6-coffee, cozy-5-coffee),
check out at 12:00. Then: all 7 apartments, an interactive "book direct" explainer (pick unit + nights → direct total;
make the point that the same apartment is also on Airbnb; keep any platform comparison clearly labelled «مثال»),
proof (real aggregate), tagline reveal, FAQ, risk reversal, final CTA identical to the top («اختر تواريخك»).

### D3 `designs/03-studio.html` · skill · layout C (minimal conversion page) · light
Same skill, to the letter. Latin **Poppins**, Arabic companion **Tajawal** for Arabic glyphs only. The single
apartment page for **استديو ميد سنشري** (midcentury). One action: «احجز هذه التواريخ». Contents: compact nav, title,
real rating 4.90 · 105 reviews · Superhost · Al Nahda, King Road; photo grid (all 7 midcentury photos) with a "show all
photos" lightbox (keyboard + swipe friendly); key facts; sticky booking card (desktop side column; mobile bottom bar →
full height sheet) with a two month range calendar (some nights booked, struck through, can't cross a booking), label
«التقويم متزامن مع Airbnb · آخر تحديث قبل 6 دقائق», guests stepper (max 3), live price (weeknight vs Thu/Fri rates,
nights, total, "no service fee when you book direct"). Then the **redesigned direct booking contract flow** as a clean
3 step sheet: 1 dates and guests, 2 guest details (name, nationality, ID/Iqama/passport, mobile, companions count +
names) with inline validation, 3 contract summary + terms (collapsible) + a working signature pad (canvas, clear
button) + agree checkbox → success screen with contract number, "dates held until the owner confirms", a WhatsApp button
with a prefilled message, and a "Download PDF" button that shows an inline note. Also: about the studio (real
description), highlights, amenities, location (SVG schematic of north Jeddah: King Road, Corniche, Red Sea Mall,
airport, the pin), house rules, proof (aggregate, link to Airbnb reviews), tagline reveal, FAQ, the other 6 apartments
as a strip, "Also on Airbnb", footer. Palette: white / neutral with one accent derived from the studio's own red-orange.

### D4 `designs/04-roshan.html` · Claude's own · Arabic first with working English toggle
The idea: keep what is charming in their current site (the illustrated Jeddah, roshan windows, live sky, orange and
brown) and make it a mature brand with real UX. Hero: a refined, larger SVG/CSS Jeddah panorama (Al Balad roshan
houses, Corniche palms and lamps, King Fahd's Fountain, the Red Sea) whose sky follows the real time of day (dawn,
day, sunset, night palettes; lights in roshan windows at night; a time scrubber like theirs). You may study their
panorama code in app.js but redraw it with more craft. Below: the brand (keep "sh.apartment" wordmark style), a
two-cluster overview ("north: King Road and Madinah Road, near the Corniche and the airport" / "south east: Al Ajawid
and Prince Fawaz, near Park Square and the National Guard Hospital"), apartment cards with real photos, then a
**WhatsApp first** booking: pick apartment, dates (show Gregorian AND Hijri via
`Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura')`), guests, name → live preview of the WhatsApp message → open
wa.me with it; secondary «حجز مباشر بعقد». House rules, FAQ, footer. Language toggle AR ⇄ EN switches `lang`/`dir` and
all copy (dictionary + `data-i18n`). Typography: characterful Arabic display for headings used with restraint (e.g.
**Reem Kufi** or **El Messiri**) + a clean Arabic/Latin body (e.g. **IBM Plex Sans Arabic**, or **Alexandria**, which
they already use), Latin wordmark can keep **Fraunces** like their logo. Palette: their orange and coffee brown on a
plaster white, with Red Sea teal as a secondary; avoid generic cream + terracotta + serif.

### D5 `designs/05-finder.html` · Claude's own · app style finder · light + dark
A product UI (Arabic RTL): search and book across all 7 units in one screen. Top bar: logo, date range, guests,
filters (area, bedrooms, max price, features chips: self check in, jacuzzi, massage chair, cinema sofa, kids friendly,
washing machine). Split view: results list (photo with dots carousel, name, area, rating · reviews, beds/baths/guests,
total for the chosen dates or "from" price, availability badge) and a **schematic SVG map of Jeddah** built from the
real coordinates (coastline on the west, King Road, Madinah Road, Haramain Expressway approximate; label landmarks:
airport, Red Sea Mall, King Fahd's Fountain, Al Balad; label it «خريطة توضيحية»), price pins (the 3 Al Nahda units
share a building: show a cluster pin that fans out). Hover/focus syncs card and pin. Click → detail drawer: gallery,
facts, real description, two month availability calendar (booked nights struck through, legend «متزامن مع Airbnb»),
price breakdown, actions: «احجز مباشرة» (primary; opens a compact version of the contract flow: details → sign → done),
«افتحها على Airbnb», «Gathern». Compare tray: up to 3 units side by side. Sort (recommended, price, rating). Empty state
with «مسح الفلاتر». Mobile: list first with a floating «الخريطة» toggle; drawer becomes a full screen sheet.
Theme aware: bare `:root` light tokens, dark under `@media (prefers-color-scheme: dark)` guarded by
`:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`, plus a manual theme toggle that sets
`data-theme`. Typography: a distinctive but very legible Arabic UI face (e.g. **Readex Pro** or **Alexandria**, not
Cairo/Tajawal since D3 uses Tajawal), tabular numbers. Accent: brand orange tuned for both themes.
