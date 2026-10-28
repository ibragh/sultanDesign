# Strict landing-page-design set (pages 6 to 8)

Source of truth: `.claude/skills/landing-page-design/SKILL.md` (elayadesign/ai-design-skills, commit ded7efc).
Every Part B rule applies with NO exceptions. Language: English (`lang="en" dir="ltr"`), so the skill's fonts work.

## A1 intake (answered by the user)
- Language: English, 100% skill rules.
- Directions: one of each: minimal editorial (page 6), playful 3D (page 7), glass UI (page 8).
- One primary action: book direct (dates, sign the stay contract on the phone, confirm on WhatsApp).
- Traffic: Instagram / TikTok / Snapchat, past Airbnb guests, WhatsApp word of mouth (not search).
- Audience: English speaking guests in Jeddah: Umrah visitors, business travellers, expats hosting family.
- Objections: is booking outside Airbnb safe; is it the same apartment; double booking; getting in at night.
- Risk reversal: nothing to pay until the host confirms; same apartments and calendar as Airbnb.
- Proof: real only (4.83 from 517 Airbnb reviews, per unit ratings, Sultan is an Airbnb Superhost). NO invented
  testimonials (deliberate deviation from B8); link to the Airbnb listings to read reviews.
- Data: `shared/apartments.json` (use `name_en`, `description_en`, `highlights_en`, `rules_en`). Prices are placeholders.

## Page 6 `designs/06-editorial.html` · minimal editorial · Geist (+ Geist Mono for prices, times, ratings) · light · layout A
Outline: floating nav · hero · problem to solution · the seven apartments · benefits · tagline reveal · how it works ·
proof · FAQ · risk reversal · final CTA · footer.
Hero: H "The Jeddah apartments from your feed, / booked direct with the host" · Sub "Neon lofts, cinema sofas and a
jacuzzi studio across seven homes in Al Nahda, Madinah Road, Al Ajawid and Prince Fawaz. Sign on your phone and skip the
app fee." · CTA "Check dates and book direct" · Proof "4.83 from 517 Airbnb reviews · Sultan is an Airbnb Superhost" ·
Visual: an editorial spread of the real photos.
Benefits: Pay the nightly rate and nothing on top / Let yourself in any time after 4 pm / The same seven listings, the
same calendar / Talk to the hosts, not a call centre (bold benefit, then the detail).
How it works: 1 Pick an apartment and your dates (calendar synced with Airbnb) · 2 Sign the stay contract on your
phone (dates held right away) · 3 Confirm on WhatsApp (host confirms, you pay, door code arrives before you do).
FAQ (10): getting in; same as Airbnb; why direct is cheaper; when do I pay; what ID; check in and check out times; smoking;
pets; which apartment for families; how far is the airport (about 15 min from Al Nahda, about 35 from Al Ajawid, traffic
dependent).
SEO: index. Title "sh.apartment | Self check in apartments in Jeddah, booked direct". Meta "Seven furnished apartments
in Jeddah rated 4.83 from 517 Airbnb reviews. Book direct with the hosts, sign on your phone, no service fee." FAQPage
JSON-LD.
Layout A: social visitors already saw the rooms in a post; the photos carry the offer.

## Page 7 `designs/07-playful.html` · playful 3D · Poppins · light, bright flat colours · layout B
3D is built with CSS 3D transforms and FLAT coloured faces (no gradients anywhere in backgrounds), animated with
transform/opacity only.
Outline: floating nav · hero with an isometric 3D block of the seven apartments (tap a unit to see it) · story: four
doubts answered one by one, each with a 3D object (same apartment: a 3D flip card Airbnb face / direct face; no double
booking: stacked 3D calendar layers; pay after confirm: 3D steps; getting in: 3D lock and code) · the seven apartments
as 3D tilt cards · benefits · tagline reveal · how it works · proof · FAQ · risk reversal · final CTA · footer.
Hero: H "Same Jeddah apartment, / without the app in the middle" · Sub "All seven sh.apartment homes are on Airbnb with
517 reviews. Book them here instead: sign on your phone, pay after the host confirms, and keep the service fee." · CTA
"Check dates and book direct" · Proof "4.83 from 517 Airbnb reviews".
Benefits: Nothing to pay until the host confirms / Check it on Airbnb first / One calendar, no double bookings / A
signed contract, not a chat promise.
How it works: same three steps.
FAQ (8, trust focused): is booking outside Airbnb safe; what if it is booked on Airbnb at the same time; when and how do
I pay; what happens to my ID details (used only to create the contract, not stored on the site); how do I get in; can I
cancel (agreed with the host before you pay and written into the contract); check in and check out; smoking and pets.
SEO: noindex (story page for social posts and shared links; page 6 is the indexed home).
Layout B: visitors from a post or a friend's link doubt booking outside Airbnb, so educate before asking for dates.

## Page 8 `designs/08-glass.html` · glass UI · Manrope · dark (#131209 base; surfaces only from the skill's dark list) · layout C
Glass = translucent panels with backdrop blur over full bleed REAL photos (photos are images, not gradients).
Outline: compact floating nav · hero: full bleed photo (cozy-1-neon-cinema or midcentury-3-neon-night) with a glass
panel holding headline, sub, the booking form (apartment, dates, guests) and proof · benefits (3) · tagline reveal ·
how it works · proof (per apartment ratings) · FAQ (6) · risk reversal · final CTA (the same glass form) · footer.
Hero: H "Stayed with us on Airbnb? / Book your next stay direct" · Sub "Same apartments, same hosts, same 4 pm self check
in. Book here and the service fee stays with you." · CTA "Book my next stay" · Proof "4.83 from 517 reviews · Hosted by
Sultan, Airbnb Superhost".
Benefits: Keep the service fee / Pick the apartment you loved / Book with the hosts you know.
How it works: same three steps.
FAQ (6): is it the same apartment; why is it cheaper here; when do I pay; do I still get a door code; what do you need
from me; can I still book on Airbnb.
SEO: noindex (reached from WhatsApp links and a card left in each apartment).
Layout C: past guests already trust the place; one form above the fold, nothing competing with it.

## Build rules for all three
- Build in A6 order, section by section (hero, then benefits, how it works, proof, FAQ, final CTA), appending one
  section at a time; do not rewrite the whole page per iteration.
- Booking flow (the one action): dates and guests → live total (weeknight `price`, Thu/Fri `weekend`, service fee 0) →
  guest details (full name as on ID, nationality, ID / Iqama / passport, mobile, companions) with inline validation →
  contract summary, house rules (`rules_en`, write "vapes" not "e-cigarettes"), signature pad, agree box → success with a
  contract number, "dates held until the host confirms", WhatsApp link to +966 50 489 5569 with a prefilled message.
  Simulated: no fetch, no real API. Booked nights simulated per unit; a range cannot cross a booking.
- Part B checklist, all of it: one typeface; no italics; weights ≤ 700; no hyphens or dashes in visible copy (write
  "self check in", "Mid century", "wifi"); text-wrap balance/pretty; font sizes only on the Tailwind scale with paired
  line heights; spacing only 0 2 4 8 12 16 24 32 40 48 64 80 96 px; Tailwind radii + nested radius formula; borders
  on all sides or none; no background gradients; hero heading gradient text (light #000→#666, dark #FFF→#9B9B9B), hero
  heading and sub max width 680px with meaningful line breaks; Phosphor icons (inline sprite); base curve
  cubic-bezier(0.22,1,0.36,1), 500ms layout / 300ms hover colour, never under 200ms, never ease/linear/ease-in-out;
  animate transform/opacity only; reduced motion; floating translucent blurred nav sized to content; animated menu
  toggle; full height mobile menu with links rising 24px, 60ms stagger, ≤ 400ms total; scroll reveals rise 32px,
  600 to 800ms, once, IntersectionObserver; mandatory tagline reveal (≥ 2 lines, text-4xl to text-6xl, words go from
  ~30% to full colour one by one in reading order); main buttons text-base semibold with 8px 12px padding, header buttons
  text-sm semibold; full state set (hover, active scale .98, focus ring, skeleton loading, empty, inline error); no dead
  links; current nav item indicated; footer privacy + terms; branded 404 view (unknown `#hash` or `#404` shows it, with
  a way back); client side validation; skip link; branded favicon (inline SVG data URI); title, meta description,
  og:title/description/image tags; alt text; semantic landmarks.
- Artifact contract from `shared/BRIEF.md` still applies (standalone document, Google Fonts only, inline Phosphor via
  `shared/inline-icons.py`, `../photos/` paths, 16px safe area gutters, no horizontal scroll at 390px, complete at rest,
  "All concepts" pill to `../index.html`, no alert/confirm/prompt, no fetch).
- Before finishing run `node shared/skill-audit.js designs/<file>.html` and fix every violation it reports.
