// Automated Part B audit for the landing-page-design skill (elayadesign/ai-design-skills).
// Measures the rendered page in Chromium at 1440px and 390px and checks every rule that a
// browser can verify: fonts, type scale, spacing, radii, borders, gradients, dark colours,
// hero heading, icons, motion, navigation, states, ship list, tagline reveal and copy rules.
//
// Usage: node shared/skill-audit.js designs/06-editorial.html [--json report.json]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const file = path.resolve(process.argv[2] || '');
const jsonIdx = process.argv.indexOf('--json');
const jsonOut = jsonIdx > 0 ? process.argv[jsonIdx + 1] : null;
if (!fs.existsSync(file)) { console.error('Usage: node shared/skill-audit.js <page.html> [--json out.json]'); process.exit(2); }

const CFG = {
  SCALE: { 12: 16, 14: 20, 16: 24, 18: 28, 20: 28, 24: 32, 30: 36, 36: 40, 48: 48, 60: 60, 72: 72, 96: 96, 128: 128 },
  SPACING: [0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96],
  RADII: [0, 2, 4, 6, 8, 12, 16, 24],
  DARK_BG: ['0,0,0', '24,24,24', '31,31,31', '39,39,39', '49,49,49', '19,18,9'],
  FONTS_OK: ['geist', 'manrope', 'poppins', 'geist mono'],
  PRIMARY_FONTS: ['geist', 'manrope', 'poppins'],
  BANNED: ['revolutionize', 'supercharge', 'cutting edge', 'effortless', 'transform your workflow', 'take it to the next level', 'harness the power', 'world class'],
  BASE: 'cubic-bezier(0.22,1,0.36,1)',
  ALLOWED_TRANSITION_PROPS: ['transform', 'opacity', 'translate', 'scale', 'rotate', 'color', 'background-color', 'border-color', 'fill', 'stroke', 'box-shadow', 'outline-color', 'text-decoration-color', 'visibility', 'overlay', 'display'],
  ALLOWED_KEYFRAME_PROPS: ['transform', 'opacity', 'translate', 'scale', 'rotate', 'offset', 'composite', 'easing', 'animation-timing-function', 'visibility'],
  PROPER: ['jeddah', 'airbnb', 'whatsapp', 'gathern', 'sultan', 'hussam', 'al', 'nahda', 'ajawid', 'madinah', 'road', 'prince', 'fawaz', 'king', "fahd's", 'fahd', 'fountain', 'corniche', 'red', 'sea', 'mall', 'superhost', 'umrah', 'instagram', 'tiktok', 'snapchat', 'mid', 'century', 'studio', 'cozy', 'home', 'luxury', 'suite', 'orange', 'house', 'apartment', 'balad', 'park', 'square', 'national', 'guard', 'hospital', 'international', 'airport', 'sar', 'iqama', 'id', 'pdf', 'apple', 'pay', 'stc', 'mada', 'abdulaziz', 'saudi', 'arabia', 'i', 'sh.apartment', 'benchmark', 'thursday', 'friday', 'monday', 'tuesday', 'wednesday', 'saturday', 'sunday', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'tourism', 'ministry', 'ical'],
};

// Runs inside the page. Returns findings: { rule, level: 'fail'|'warn'|'pass', detail, examples }.
function auditInPage(cfg) {
  const found = new Map();
  const describe = el => {
    if (!el || !el.tagName) return String(el || '');
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);
    return t ? `${s} “${t}”` : s;
  };
  const add = (rule, level, detail, el) => {
    const key = rule + '|' + level + '|' + detail;
    if (!found.has(key)) found.set(key, { rule, level, detail, count: 0, examples: [] });
    const f = found.get(key); f.count++;
    if (el && f.examples.length < 3) f.examples.push(typeof el === 'string' ? el : describe(el));
  };
  const pass = (rule, detail) => add(rule, 'pass', detail);
  const px = v => parseFloat(v) || 0;
  const round = v => Math.round(v * 100) / 100;
  const rgba = c => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = c => { const s = [c.r, c.g, c.b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]; };
  const isVisible = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const srOnly = el => { const cs = getComputedStyle(el); return (cs.position === 'absolute' || cs.position === 'fixed') && ((px(cs.width) <= 1 && px(cs.height) <= 1) || (cs.clip && cs.clip !== 'auto') || /inset\(50%\)/.test(cs.clipPath)); };
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'META', 'LINK', 'TITLE']);
  const all = [...document.body.querySelectorAll('*')].filter(el => !SKIP.has(el.tagName) && !(el.closest('svg') && el.tagName.toLowerCase() !== 'svg'));
  const hasOwnText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const textEls = all.filter(el => hasOwnText(el) && !srOnly(el) && el.tagName !== 'OPTION');
  const formEls = all.filter(el => ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(el.tagName) && !['checkbox', 'radio', 'range', 'hidden', 'color', 'file'].includes((el.getAttribute('type') || '').toLowerCase()));

  // ---------- B1 fonts ----------
  const fams = new Map();
  for (const el of [...textEls, ...formEls]) {
    const fam = getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/["']/g, '').toLowerCase();
    fams.set(fam, (fams.get(fam) || 0) + 1);
    if (!cfg.FONTS_OK.includes(fam)) add('B1 Fonts', 'fail', `Font not allowed: ${fam}`, el);
  }
  const primaries = [...fams.keys()].filter(f => cfg.PRIMARY_FONTS.includes(f));
  if (primaries.length > 1) add('B1 Fonts', 'fail', `More than one typeface: ${primaries.join(' + ')}`);
  else if (primaries.length === 1) pass('B1 Fonts', `Single typeface: ${primaries[0]}${fams.has('geist mono') ? ' (+ Geist Mono for numbers)' : ''}`);
  const rendered = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, '').toLowerCase());
  for (const f of new Set(rendered)) if (!cfg.FONTS_OK.includes(f)) add('B1 Fonts', 'fail', `Loaded a font that is not allowed: ${f}`);
  if (/material (icons|symbols)/i.test([...new Set(rendered)].join(','))) add('B6 Icons', 'fail', 'Material icon font loaded');

  for (const el of [...textEls, ...formEls]) {
    const cs = getComputedStyle(el);
    if (cs.fontStyle !== 'normal') add('B1 Fonts', 'fail', `Italic or oblique text (${cs.fontStyle})`, el);
    if (parseInt(cs.fontWeight, 10) > 700) add('B1 Fonts', 'fail', `Weight above 700 (${cs.fontWeight})`, el);
  }

  // ---------- B1 type scale ----------
  let scaleOk = 0;
  for (const el of [...textEls, ...formEls]) {
    const cs = getComputedStyle(el);
    const fs = round(px(cs.fontSize));
    if (!(fs in cfg.SCALE)) { add('B1 Type scale', 'fail', `Font size ${fs}px is not on the Tailwind scale`, el); continue; }
    const want = cfg.SCALE[fs];
    if (cs.lineHeight === 'normal') { add('B1 Type scale', 'fail', `${fs}px with line-height normal (expected ${want}px)`, el); continue; }
    const lh = round(px(cs.lineHeight));
    if (Math.abs(lh - want) > 0.6) add('B1 Type scale', 'fail', `${fs}px with line height ${lh}px (expected ${want}px)`, el);
    else scaleOk++;
  }
  if (scaleOk) pass('B1 Type scale', `${scaleOk} text elements on the scale with paired line heights`);

  // text-wrap: balance for headings, pretty for body copy
  for (const el of all.filter(e => /^H[1-6]$/.test(e.tagName) && e.textContent.trim())) {
    const tw = getComputedStyle(el).textWrapStyle || getComputedStyle(el).textWrap || '';
    if (!/balance/.test(tw)) add('B1 Copy', 'fail', 'Heading without text-wrap: balance', el);
  }
  for (const el of all.filter(e => e.tagName === 'P' && e.textContent.trim())) {
    const tw = getComputedStyle(el).textWrapStyle || getComputedStyle(el).textWrap || '';
    if (!/pretty|balance/.test(tw)) add('B1 Copy', 'fail', 'Paragraph without text-wrap: pretty', el);
  }

  // ---------- B1 button type + B2 button padding ----------
  const buttons = all.filter(el => (el.tagName === 'BUTTON' || (el.tagName === 'A' && el.getAttribute('href'))) && el.textContent.trim());
  for (const el of buttons) {
    const cs = getComputedStyle(el);
    const bg = rgba(cs.backgroundColor);
    if (!bg || bg.a < 0.6) continue; // only filled buttons are "main" or "header" buttons
    const fs = round(px(cs.fontSize));
    if (fs === 16) {
      if (parseInt(cs.fontWeight, 10) !== 600) add('B1 Buttons', 'fail', `Main button weight ${cs.fontWeight} (expected 600)`, el);
      const pv = [cs.paddingTop, cs.paddingBottom].map(px), ph = [cs.paddingLeft, cs.paddingRight].map(px);
      if (pv.some(v => v !== 8) || ph.some(v => v !== 12)) add('B2 Buttons', 'fail', `Main button padding ${pv[0]}/${ph[0]}px (expected 8px vertical, 12px horizontal)`, el);
      else add('B2 Buttons', 'pass', 'Main buttons: 16px semibold, 8px by 12px padding');
    } else if (fs === 14) {
      if (parseInt(cs.fontWeight, 10) !== 600) add('B1 Buttons', 'fail', `Header button weight ${cs.fontWeight} (expected 600)`, el);
      else add('B1 Buttons', 'pass', 'Header buttons: 14px semibold');
    } else add('B1 Buttons', 'fail', `Filled button at ${fs}px (main 16px or header 14px)`, el);
  }

  // ---------- B2 spacing ----------
  let spacingChecked = 0;
  const okSpace = v => cfg.SPACING.some(s => Math.abs(Math.abs(v) - s) < 0.05);
  for (const el of all) {
    if (el.tagName === 'OPTION' || srOnly(el)) continue;
    const cs = getComputedStyle(el);
    const vals = [['padding-top', cs.paddingTop], ['padding-right', cs.paddingRight], ['padding-bottom', cs.paddingBottom], ['padding-left', cs.paddingLeft], ['margin-top', cs.marginTop], ['margin-bottom', cs.marginBottom]];
    const ml = px(cs.marginLeft), mr = px(cs.marginRight);
    if (!(ml > 0 && Math.abs(ml - mr) < 0.5)) vals.push(['margin-left', cs.marginLeft], ['margin-right', cs.marginRight]); // equal side margins = auto centring
    if (cs.rowGap !== 'normal') vals.push(['row-gap', cs.rowGap]);
    if (cs.columnGap !== 'normal') vals.push(['column-gap', cs.columnGap]);
    for (const [prop, v] of vals) {
      if (!/px$/.test(v)) continue;
      spacingChecked++;
      const n = round(px(v));
      if (okSpace(n)) continue;
      const pd = el.parentElement ? getComputedStyle(el.parentElement).display : '';
      if (/^margin/.test(prop) && n > 96 && /flex|grid/.test(pd)) add('B2 Spacing', 'warn', `${prop}: ${n}px in a flex or grid parent (probably margin auto)`, el);
      else add('B2 Spacing', 'fail', `${prop}: ${n}px is not a spacing token`, el);
    }
  }
  pass('B2 Spacing', `${spacingChecked} margin, padding and gap values measured`);

  // ---------- B3 radius ----------
  const okRadius = v => /%/.test(v) ? false : (px(v) >= 9999 || cfg.RADII.some(r => Math.abs(px(v) - r) < 0.05));
  for (const el of all) {
    const cs = getComputedStyle(el);
    for (const c of ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius']) {
      const v = cs[c];
      if (v.split(' ').length > 1 || !okRadius(v)) { add('B3 Radius', 'fail', `Radius ${v} is not a Tailwind radius`, el); break; }
    }
  }
  // nested radius formula: inner = outer − gap when gap < 32 and result > 2
  const isShape = (el, cs) => { const bg = rgba(cs.backgroundColor); return (bg && bg.a > 0) || px(cs.borderTopWidth) > 0 || ['IMG', 'VIDEO', 'CANVAS', 'PICTURE'].includes(el.tagName) || cs.backgroundImage !== 'none'; };
  let nestedOk = 0;
  for (const el of all) {
    if (!isVisible(el)) continue;
    const cs = getComputedStyle(el);
    if (!isShape(el, cs)) continue;
    let a = el.parentElement, acs = null;
    while (a && a !== document.body) { acs = getComputedStyle(a); if (px(acs.borderTopLeftRadius) > 0 && isShape(a, acs)) break; a = a.parentElement; }
    if (!a || a === document.body) continue;
    const R = px(acs.borderTopLeftRadius), r = px(cs.borderTopLeftRadius);
    if (R >= 9999 || r >= 9999) continue;
    const er = el.getBoundingClientRect(), ar = a.getBoundingClientRect();
    const corners = [[er.left - ar.left, er.top - ar.top], [ar.right - er.right, er.top - ar.top], [ar.right - er.right, ar.bottom - er.bottom], [er.left - ar.left, ar.bottom - er.bottom]];
    const radii = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'];
    corners.forEach(([gx, gy], i) => {
      if (gx < -0.5 || gy < -0.5 || gx >= 32 || gy >= 32 || Math.abs(gx - gy) > 1) return;
      const outer = px(acs[radii[i]]), inner = px(cs[radii[i]]);
      if (outer <= 0) return;
      const expected = outer - Math.min(gx, gy);
      if (expected <= 2) return;
      const clipped = Math.min(gx, gy) < 0.5 && inner === 0 && acs.overflow !== 'visible';
      if (Math.abs(inner - expected) > 1 && !clipped) add('B3 Nested radius', 'fail', `Inner radius ${inner}px inside ${outer}px with ${round(Math.min(gx, gy))}px gap (expected ${round(expected)}px)`, el);
      else nestedOk++;
    });
  }
  if (nestedOk) pass('B3 Nested radius', `${nestedOk} nested corners follow outer minus gap`);

  // ---------- B4 borders and backgrounds ----------
  for (const el of all) {
    const cs = getComputedStyle(el);
    const sides = ['Top', 'Right', 'Bottom', 'Left'].filter(s => px(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== 'none' && cs[`border${s}Style`] !== 'hidden');
    if (sides.length > 0 && sides.length < 4) {
      const bg = rgba(cs.backgroundColor);
      const band = el.getBoundingClientRect().width >= innerWidth * 0.9;
      const card = !band && ((bg && bg.a > 0) || px(cs.borderTopLeftRadius) > 0 || px(cs.borderBottomRightRadius) > 0);
      add('B4 Borders', card ? 'fail' : 'warn', `${card ? 'Card' : 'Element'} with a border on ${sides.join(' and ').toLowerCase()} only`, el);
    }
    for (const pseudo of [null, '::before', '::after']) {
      const pcs = pseudo ? getComputedStyle(el, pseudo) : cs;
      if (pseudo && (pcs.content === 'none' || pcs.content === 'normal')) continue;
      if (!/gradient/.test(pcs.backgroundImage)) continue;
      const clip = pcs.backgroundClip === 'text' || pcs.webkitBackgroundClip === 'text';
      if (clip && el.tagName === 'H1') continue; // checked under B5
      if (clip) add('B5 Gradient text', 'fail', 'Gradient text outside the hero heading', el);
      else add('B4 Backgrounds', 'fail', `Gradient background${pseudo ? ' on ' + pseudo : ''}`, el);
    }
  }
  const bodyBg = rgba(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  const dark = lum(bodyBg) < 0.2;
  if (dark) {
    let darkOk = 0;
    for (const el of [document.documentElement, document.body, ...all]) {
      const bg = rgba(getComputedStyle(el).backgroundColor);
      if (!bg || bg.a === 0 || lum(bg) > 0.08) continue;
      if (!cfg.DARK_BG.includes(`${bg.r},${bg.g},${bg.b}`)) add('B4 Dark backgrounds', 'fail', `Dark surface rgb(${bg.r}, ${bg.g}, ${bg.b}) is not in the allowed list`, el);
      else darkOk++;
    }
    pass('B4 Dark backgrounds', `${darkOk} dark surfaces use the allowed colours`);
  }

  // ---------- B5 hero ----------
  const h1 = document.querySelector('h1');
  if (!h1) add('B5 Hero', 'fail', 'No h1 hero heading');
  else {
    const cs = getComputedStyle(h1);
    const g = cs.backgroundImage;
    const clip = cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text';
    const want = dark ? ['rgb(255, 255, 255)', 'rgb(155, 155, 155)'] : ['rgb(0, 0, 0)', 'rgb(102, 102, 102)'];
    if (!/linear-gradient/.test(g) || !clip) add('B5 Hero', 'fail', 'Hero heading is not gradient text');
    else if (!want.every(c => g.includes(c))) add('B5 Hero', 'fail', `Hero gradient should run ${want.join(' to ')}, found ${g}`);
    else if (!/to right|90deg/.test(g)) add('B5 Hero', 'fail', `Hero gradient is not left to right: ${g}`);
    else pass('B5 Hero', `Heading gradient ${dark ? '#FFFFFF to #9B9B9B' : '#000000 to #666666'}, left to right`);
    const w = h1.getBoundingClientRect().width;
    if (w > 680.5) add('B5 Hero', 'fail', `Hero heading is ${round(w)}px wide (max 680px)`, h1);
    else pass('B5 Hero', 'Heading within 680px');
    const scope = h1.closest('section, header, main') || h1.parentElement;
    const sub = [...scope.querySelectorAll('p')].find(p => p.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_PRECEDING && p.textContent.trim().length > 40);
    if (!sub) add('B5 Hero', 'warn', 'Could not find the hero subheading');
    else if (sub.getBoundingClientRect().width > 680.5) add('B5 Hero', 'fail', `Hero subheading is ${round(sub.getBoundingClientRect().width)}px wide (max 680px)`, sub);
    else pass('B5 Hero', 'Subheading within 680px');
    if (!h1.querySelector('br, span')) add('B5 Hero', 'warn', 'Hero heading has no deliberate line breaks', h1);
  }

  // ---------- B6 icons ----------
  if (document.querySelector('[class*="material-icons"], [class*="material-symbols"]')) add('B6 Icons', 'fail', 'Material icon classes in use');
  const uses = [...document.querySelectorAll('svg use')];
  const ids = new Set([...document.querySelectorAll('symbol[id]')].map(s => s.id));
  const missing = uses.filter(u => { const h = (u.getAttribute('href') || u.getAttribute('xlink:href') || '').slice(1); return !ids.has(h); });
  if (missing.length) add('B6 Icons', 'fail', `${missing.length} icon references point to a missing symbol`, missing[0].closest('svg'));
  else if (uses.length) pass('B6 Icons', `${uses.length} icons from the inline Phosphor sprite`);

  // ---------- B7 motion (stylesheets) ----------
  const rootCS = getComputedStyle(document.documentElement);
  const resolve = v => { let s = v, i = 0; while (/var\(/.test(s) && i++ < 5) s = s.replace(/var\((--[\w-]+)(?:\s*,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (m, n, fb) => (rootCS.getPropertyValue(n).trim() || (fb || '').trim() || m)); return s; };
  const splitTop = s => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
  const tokens = s => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (/\s/.test(ch) && d === 0) { if (cur) out.push(cur); cur = ''; } else cur += ch; } if (cur) out.push(cur); return out; };
  const norm = t => t.replace(/\s+/g, '');
  const ms = t => /ms$/.test(t) ? parseFloat(t) : parseFloat(t) * 1000;
  const isTime = t => /^-?[\d.]+m?s$/.test(t);
  const isEasing = t => /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)$/.test(t) || /^(cubic-bezier|steps|linear)\(/.test(t);
  const checkEasing = (rule, where, e) => { if (norm(e) !== cfg.BASE) add('B7 Motion', 'fail', `${rule} uses ${e} instead of the base curve`, where); };
  let transitionsOk = 0, animationsOk = 0, sawReduced = false;
  const walk = (rules, cb) => { for (const r of rules) { cb(r); if (r.cssRules && !(r instanceof CSSKeyframesRule)) walk(r.cssRules, cb); } };
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    walk(rules, r => {
      if (r instanceof CSSMediaRule && /prefers-reduced-motion/.test(r.conditionText || r.media.mediaText)) sawReduced = true;
      if (r instanceof CSSKeyframesRule) {
        for (const kf of r.cssRules) for (let i = 0; i < kf.style.length; i++) {
          const p = kf.style[i];
          if (!cfg.ALLOWED_KEYFRAME_PROPS.includes(p)) add('B7 Motion', 'fail', `@keyframes ${r.name} animates ${p}`, `@keyframes ${r.name}`);
        }
        return;
      }
      if (!(r instanceof CSSStyleRule)) return;
      const inReduced = (() => { let p = r.parentRule; while (p) { if (p instanceof CSSMediaRule && /prefers-reduced-motion/.test(p.conditionText || p.media.mediaText)) return true; p = p.parentRule; } return false; })();
      const sel = r.selectorText.slice(0, 70);
      // transitions
      let parts = [];
      const raw = r.style.getPropertyValue('transition');
      if (r.style.transitionProperty) {
        const P = splitTop(r.style.transitionProperty), D = splitTop(resolve(r.style.transitionDuration || '0s')), T = splitTop(resolve(r.style.transitionTimingFunction || 'ease'));
        parts = P.map((p, i) => ({ prop: p, dur: D[i % D.length], ease: T[i % T.length] }));
      } else if (raw) {
        parts = splitTop(resolve(raw)).map(part => { const tk = tokens(part); const times = tk.filter(isTime); return { prop: tk.find(t => !isTime(t) && !isEasing(t)) || 'all', dur: times[0] || '0s', ease: tk.find(isEasing) || 'ease' }; });
      }
      for (const t of parts) {
        if (t.prop === 'none' || ms(t.dur) === 0 || inReduced) continue;
        if (/var\(/.test(t.ease) || /var\(/.test(t.dur)) { add('B7 Motion', 'warn', `Unresolved variable in transition on ${sel}`, sel); continue; }
        let bad = false;
        if (!cfg.ALLOWED_TRANSITION_PROPS.includes(t.prop)) { add('B7 Motion', 'fail', `Transition on "${t.prop}" (animate transform and opacity only)`, sel); bad = true; }
        if (norm(t.ease) !== cfg.BASE) { add('B7 Motion', 'fail', `Transition easing ${t.ease} (base curve required)`, sel); bad = true; }
        if (ms(t.dur) < 200) { add('B7 Motion', 'fail', `Transition ${t.dur} is shorter than 200ms`, sel); bad = true; }
        if (!bad) transitionsOk++;
      }
      // animations
      const an = r.style.animationName || (r.style.getPropertyValue('animation') ? 'x' : '');
      if (an && an !== 'none' && !inReduced) {
        let ease = r.style.animationTimingFunction, dur = r.style.animationDuration;
        if (!ease) { const tk = tokens(resolve(splitTop(r.style.getPropertyValue('animation'))[0] || '')); ease = tk.find(isEasing) || 'ease'; dur = tk.find(isTime) || '0s'; }
        ease = resolve(ease);
        if (norm(ease) !== cfg.BASE) add('B7 Motion', 'fail', `Animation easing ${ease} (base curve required)`, sel); else animationsOk++;
      }
    });
  }
  pass('B7 Motion', `${transitionsOk} transition rules and ${animationsOk} animations use the base curve`);
  const scripts = [...document.scripts].map(s => s.textContent).join('\n');
  if (sawReduced || /prefers-reduced-motion/.test(scripts)) pass('B7 Motion', 'prefers-reduced-motion is handled'); else add('B7 Motion', 'fail', 'No prefers-reduced-motion handling');
  if (/IntersectionObserver/.test(scripts)) pass('B7 Motion', 'Scroll reveals use IntersectionObserver'); else add('B7 Motion', 'fail', 'No IntersectionObserver for scroll reveals');
  if (/addEventListener\(\s*['"]scroll['"]/.test(scripts) && !/requestAnimationFrame/.test(scripts)) add('B7 Motion', 'fail', 'Scroll listener without requestAnimationFrame throttling');
  for (const m of scripts.matchAll(/\.animate\(/g)) { add('B7 Motion', 'warn', 'Element.animate() in script: check its easing by hand'); break; }

  // ---------- B9 states ----------
  const css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\n'); } catch (e) { return ''; } }).join('\n');
  if (/:focus-visible/.test(css)) pass('B9 States', 'Focus ring (:focus-visible)'); else add('B9 States', 'fail', 'No :focus-visible style');
  if (/:hover/.test(css)) pass('B9 States', 'Hover styles'); else add('B9 States', 'fail', 'No hover styles');
  if (/:active[^{]*\{[^}]*(scale\(0\.98\)|translateY\(1px\)|translate\(0px, 1px\))/.test(css)) pass('B9 States', 'Active state scale(0.98) or translateY(1px)'); else add('B9 States', 'fail', 'No active state with scale(0.98) or translateY(1px)');
  if (/skeleton/i.test(css + document.body.innerHTML + scripts)) pass('B9 States', 'Skeleton loading state'); else add('B9 States', 'fail', 'No skeleton loading state');
  if (/empty/i.test(css + document.body.innerHTML + scripts)) pass('B9 States', 'Empty state'); else add('B9 States', 'fail', 'No empty state');
  if (/aria-invalid|role="alert"|aria-live/.test(document.body.innerHTML + scripts)) pass('B9 States', 'Inline error messages'); else add('B9 States', 'fail', 'No inline error handling');
  if (/\b(window\.)?(alert|confirm|prompt)\s*\(/.test(scripts.replace(/role=.alert./g, ''))) add('B9 States', 'fail', 'Uses alert(), confirm() or prompt()');
  for (const a of document.querySelectorAll('a')) {
    const h = a.getAttribute('href');
    if (h === null || h === '' || h === '#') { add('B9 Links', 'fail', 'Dead link (href missing, empty or #)', a); continue; }
    if (h.startsWith('#') && h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1))) && !/^#(404|top)$/.test(h)) add('B9 Links', 'fail', `Link to ${h} has no target`, a);
  }
  if (/aria-current/.test(document.body.innerHTML + scripts)) pass('B9 Links', 'Current nav item indicated (aria-current)'); else add('B9 Links', 'fail', 'Current nav item is not indicated');

  // ---------- B10 ship ----------
  const foot = document.querySelector('footer');
  const footText = foot ? foot.textContent.toLowerCase() : '';
  if (/privacy/.test(footText) && /terms/.test(footText)) pass('B10 Ship', 'Privacy and terms in the footer'); else add('B10 Ship', 'fail', 'Footer is missing privacy or terms links');
  if (/404/.test(document.body.innerHTML + scripts)) pass('B10 Ship', 'Branded 404 view'); else add('B10 Ship', 'fail', 'No 404 view');
  if (document.querySelector('[required], [pattern], input[type=email], input[type=tel]') || /aria-invalid/.test(scripts)) pass('B10 Ship', 'Client side form validation'); else add('B10 Ship', 'fail', 'No form validation');
  const firstFocusable = document.querySelector('a[href], button, input, select, textarea');
  if (firstFocusable && (/skip/i.test(firstFocusable.textContent + ' ' + firstFocusable.className) || /^#(main|content)/.test(firstFocusable.getAttribute('href') || ''))) pass('B10 Ship', 'Skip to content link first'); else add('B10 Ship', 'fail', 'Skip link is not the first focusable element', firstFocusable);
  if (document.querySelector('link[rel~="icon"]')) pass('B10 Ship', 'Favicon'); else add('B10 Ship', 'fail', 'No favicon');
  for (const [sel, name] of [['title', 'title'], ['meta[name="description"]', 'meta description'], ['meta[property="og:image"]', 'og:image'], ['meta[property="og:title"]', 'og:title'], ['meta[property="og:description"]', 'og:description']]) {
    if (document.querySelector(sel)) pass('B10 Ship', name); else add('B10 Ship', 'fail', `Missing ${name}`);
  }
  for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt')) add('B10 Ship', 'fail', 'Image without alt text', img.getAttribute('src'));
  for (const tag of ['nav', 'main', 'section', 'footer']) if (!document.querySelector(tag)) add('B10 Ship', 'fail', `No <${tag}> element`);
  if (document.querySelector('a[href*="index.html"], a[href="/"], a[href="./"]')) pass('B10 Ship', 'A way back'); else add('B10 Ship', 'warn', 'No obvious way back link');

  // ---------- Copy rules (B1, B8) ----------
  const texts = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement && !n.parentElement.closest('script, style, noscript, template')) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
  for (let n; (n = tw.nextNode());) if (n.textContent.trim()) texts.push([n.textContent, n.parentElement]);
  for (const el of document.body.querySelectorAll('[placeholder], [aria-label], [alt], [title]')) for (const at of ['placeholder', 'aria-label', 'alt', 'title']) if (el.getAttribute(at)) texts.push([el.getAttribute(at), el]);
  const urlish = w => /[@\/]|www\.|\.(com|co|sa|dev|net|org|html)\b/i.test(w);
  for (const [t, el] of texts) {
    const words = t.split(/\s+/);
    for (const w of words) if (/\p{L}[\-‐‑–—]\p{L}|\d[\-‐‑–—]\d/u.test(w) && !urlish(w)) add('B1 Copy', 'fail', `Hyphen or dash in copy: “${w}”`, el);
    if (/(^|\s)[\-–—](\s|$)/.test(t)) add('B1 Copy', 'fail', 'Standalone dash in copy', el);
    if (/!/.test(t) && !/<!|!=|!important/.test(t)) add('B8 Content', 'fail', 'Exclamation mark in copy', el);
    for (const b of cfg.BANNED) if (t.toLowerCase().includes(b)) add('B8 Content', 'fail', `Banned word: ${b}`, el);
  }
  // sentence case for headings and buttons
  for (const el of all.filter(e => /^(H[1-6]|BUTTON)$/.test(e.tagName) || (e.tagName === 'A' && /btn|button|cta/i.test(e.className)))) {
    const words = el.textContent.trim().split(/\s+/).slice(1).filter(w => /^[A-Za-z]/.test(w) && w.length > 3);
    const caps = words.filter(w => /^[A-Z]/.test(w) && !cfg.PROPER.includes(w.toLowerCase().replace(/[^a-z'.]/g, '')));
    if (caps.length >= 2 && caps.length / Math.max(words.length, 1) > 0.5) add('B8 Content', 'fail', 'Heading or button looks like Title Case', el);
  }
  // orphans: a single word alone on the last line
  let blocks = 0;
  for (const el of all.filter(e => /^(H[1-6]|P|LI|FIGCAPTION|BLOCKQUOTE|DD|DT)$/.test(e.tagName))) {
    if (!isVisible(el) || el.closest('svg') || srOnly(el)) continue;
    const range = document.createRange(); const rects = [];
    const w2 = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n; (n = w2.nextNode());) {
      const re = /\S+/g; let m;
      while ((m = re.exec(n.textContent))) { range.setStart(n, m.index); range.setEnd(n, m.index + m[0].length); const r = range.getClientRects()[0]; if (r && r.width) rects.push(r.top); }
    }
    if (rects.length < 2) continue;
    blocks++;
    const lines = []; for (const t of rects) { if (!lines.length || Math.abs(t - lines[lines.length - 1].top) > 4) lines.push({ top: t, n: 1 }); else lines[lines.length - 1].n++; }
    if (lines.length >= 2 && lines[lines.length - 1].n === 1) add('B1 Copy', 'fail', 'Orphaned word on the last line', el);
  }
  pass('B1 Copy', `${blocks} text blocks checked for orphans`);

  // ---------- B11 tagline reveal (static part) ----------
  const cand = all.filter(el => el !== h1 && el.children.length >= 6 && [...el.children].every(c => c.tagName === 'SPAN' && c.textContent.trim().split(/\s+/).length === 1) && [36, 48, 60].includes(round(px(getComputedStyle(el).fontSize))));
  const tag = cand[0];
  if (!tag) add('B11 Tagline', 'fail', 'No tagline reveal section (word spans at text-4xl to text-6xl)');
  else {
    const lh = px(getComputedStyle(tag).lineHeight), hgt = tag.getBoundingClientRect().height;
    if (hgt / lh < 1.8) add('B11 Tagline', 'fail', 'Tagline is shorter than two lines', tag);
    if (tag.getBoundingClientRect().width > 680.5) add('B11 Tagline', 'fail', `Tagline is ${round(tag.getBoundingClientRect().width)}px wide (max 680px)`, tag);
    tag.setAttribute('data-audit-tagline', '1');
    pass('B11 Tagline', `Tagline found: ${tag.children.length} words at ${getComputedStyle(tag).fontSize}`);
  }

  // complete at rest: readable text left invisible before any scroll
  let hidden = 0;
  for (const el of textEls) { if (!isVisible(el) || el.closest('dialog:not([open]), [hidden], [aria-hidden="true"]')) continue; let o = 1, p = el; while (p && p !== document.body) { o *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement; } if (o < 0.1) { hidden++; add('Artifact', 'warn', 'Text invisible before scrolling (not complete at rest)', el); } }

  return { findings: [...found.values()], dark };
}

(async () => {
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const report = { file: path.relative(process.cwd(), file), widths: {} };
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('file://' + file, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const res = await page.evaluate(auditInPage, CFG);
    const extra = [];
    const push = (rule, level, detail, ex) => extra.push({ rule, level, detail, count: 1, examples: ex ? [ex] : [] });
    if (errors.length) push('Runtime', 'fail', `Console errors: ${errors.slice(0, 2).join(' | ')}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) push('Artifact', 'fail', 'Horizontal scroll');

    // Navigation: floating, centred, sized to content, translucent with blur
    const nav = await page.evaluate(() => {
      const els = [...document.querySelectorAll('nav, header')].filter(e => { const p = getComputedStyle(e).position; return p === 'fixed' || p === 'sticky'; });
      const pick = els.map(e => { const r = e.getBoundingClientRect(); return { e, r }; }).filter(x => x.r.top < 120 && x.r.width > 0 && x.r.height < 140).sort((a, b) => a.r.width - b.r.width)[0];
      if (!pick) return null;
      let el = pick.e; let cs = getComputedStyle(el);
      // the visible bar may be a child of the positioned element
      const bar = [el, ...el.querySelectorAll('*')].find(x => { const c = getComputedStyle(x); return /blur/.test(c.backdropFilter || c.webkitBackdropFilter || ''); }) || el;
      cs = getComputedStyle(bar); const r = bar.getBoundingClientRect();
      const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); const a = m ? (m[1].split(/[\s,\/]+/).filter(Boolean).map(Number)[3] ?? 1) : 1;
      return { top: r.top, left: r.left, width: r.width, center: r.left + r.width / 2, vw: innerWidth, alpha: a, blur: cs.backdropFilter || cs.webkitBackdropFilter || 'none' };
    });
    if (!nav) push('B7 Navigation', 'fail', 'No fixed or sticky navigation bar found');
    else {
      if (nav.top < 4) push('B7 Navigation', 'fail', `Nav sits flush at the top (${Math.round(nav.top)}px)`);
      if (Math.abs(nav.center - nav.vw / 2) > 2) push('B7 Navigation', 'fail', 'Nav is not centred');
      if (w > 1000 && nav.width > nav.vw * 0.8) push('B7 Navigation', 'fail', 'Nav spans the page instead of sizing to its content');
      if (!(nav.alpha < 1) || !/blur/.test(nav.blur)) push('B7 Navigation', 'fail', `Nav is not translucent with a background blur (alpha ${nav.alpha}, ${nav.blur})`);
      if (nav.top >= 4 && Math.abs(nav.center - nav.vw / 2) <= 2 && nav.alpha < 1 && /blur/.test(nav.blur)) push('B7 Navigation', 'pass', 'Floating, centred, translucent nav with blur');
    }

    // Mobile menu: full height panel, strong blur, links rise 24px with 60ms steps capped at 400ms
    if (w < 600) {
      const toggle = await page.$('button[aria-expanded]');
      if (!toggle || !(await toggle.isVisible())) push('B7 Navigation', 'fail', 'No visible menu toggle with aria-expanded on mobile');
      else {
        await toggle.click();
        await page.waitForTimeout(80);
        const menu = await page.evaluate(() => {
          const panel = [...document.querySelectorAll('body *')].filter(e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return (c.position === 'fixed') && r.height >= innerHeight * 0.9 && r.width >= innerWidth * 0.9 && c.display !== 'none' && c.visibility !== 'hidden' && e.querySelectorAll('a').length >= 2; })[0];
          if (!panel) return null;
          const c = getComputedStyle(panel);
          const links = [...panel.querySelectorAll('a')].filter(a => a.offsetParent);
          const delayOf = e => { const cs = getComputedStyle(e); return Math.max(...[cs.transitionDelay, cs.animationDelay].map(v => Math.max(...v.split(',').map(x => /ms/.test(x) ? parseFloat(x) : parseFloat(x) * 1000)))); };
          const delays = links.map(a => { let m = 0; for (let e = a; e && e !== panel; e = e.parentElement) m = Math.max(m, delayOf(e)); return Math.round(m); });
          return { blur: c.backdropFilter || c.webkitBackdropFilter || 'none', bg: c.backgroundColor, delays, expanded: document.querySelector('button[aria-expanded]').getAttribute('aria-expanded') };
        });
        if (!menu) push('B7 Navigation', 'fail', 'Menu does not open as a full height panel');
        else {
          if (!/blur/.test(menu.blur)) push('B7 Navigation', 'fail', 'Mobile menu panel has no blur');
          const steps = menu.delays.slice(1).map((d, i) => Math.round(d - menu.delays[i]));
          const max = Math.max(...menu.delays);
          const run = steps.findIndex(s => Math.abs(s - 60) > 1 && !(max >= 399 && s >= 0 && s <= 60));
          if (menu.delays.length >= 2 && run === 0) push('B7 Navigation', 'fail', `Menu link stagger steps ${steps.join(', ')}ms (expected 60ms)`);
          if (max > 400.5) push('B7 Navigation', 'fail', `Menu link sequence ends at ${max}ms (cap 400ms)`);
          if (menu.expanded !== 'true') push('B7 Navigation', 'fail', 'Toggle does not set aria-expanded="true"');
          if (/blur/.test(menu.blur) && max <= 400.5) push('B7 Navigation', 'pass', `Full height menu with blur, link delays ${menu.delays.join(', ')}ms`);
        }
        await toggle.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }

    // Tagline: words should switch on one at a time while scrolling, in reading order
    if (w > 1000) {
      const has = await page.$('[data-audit-tagline]');
      if (has) {
        const box = await has.boundingBox();
        const samples = [];
        for (let f = 0; f <= 1.0001; f += 0.125) {
          await page.evaluate(([y]) => window.scrollTo(0, y), [box.y - innerHeightFor(900) + f * (900 + box.height) / 1.2]);
          await page.waitForTimeout(900);
          samples.push(await page.evaluate(() => { const el = document.querySelector('[data-audit-tagline]'); const ws = [...el.children]; const base = getComputedStyle(el).color; return ws.map(s => { const c = getComputedStyle(s); const m = c.color.match(/rgba?\(([^)]+)\)/); const a = m ? (m[1].split(/[\s,\/]+/).filter(Boolean).map(Number)[3] ?? 1) : 1; return +(parseFloat(c.opacity) * a).toFixed(2); }); }));
        }
        const counts = samples.map(s => s.filter(v => v >= 0.9).length);
        const n = samples[0].length;
        const muted = samples[0].filter(v => v >= 0.2 && v <= 0.4).length;
        const partial = counts.some(c => c > 0 && c < n);
        const ordered = samples.every(s => { const on = s.map(v => v >= 0.9); const k = on.indexOf(false); return k === -1 || on.slice(k).every(x => !x); });
        if (muted < n * 0.8) push('B11 Tagline', 'warn', `Only ${muted} of ${n} words start muted (25 to 35%) before scrolling`);
        if (!partial) push('B11 Tagline', 'fail', `Words do not switch on one at a time (active words per step: ${counts.join(', ')})`);
        else if (!ordered) push('B11 Tagline', 'fail', 'Words switch on out of reading order');
        else push('B11 Tagline', 'pass', `Words switch on one by one in reading order (active per step: ${counts.join(', ')})`);
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    }
    report.widths[w] = [...res.findings, ...extra];
    await page.close();
  }
  await browser.close();

  // Merge widths: a rule fails if it fails at either width
  const merged = new Map();
  for (const [w, list] of Object.entries(report.widths)) for (const f of list) {
    const k = f.rule + '|' + f.level + '|' + (f.level === 'pass' ? f.detail.replace(/\d+/g, '#') : f.detail);
    if (!merged.has(k)) merged.set(k, { ...f, widths: [w] }); else { const m = merged.get(k); m.count += f.count; m.widths.push(w); m.examples = [...new Set([...m.examples, ...f.examples])].slice(0, 3); }
  }
  const all = [...merged.values()];
  const order = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'Artifact', 'Runtime'];
  all.sort((a, b) => order.findIndex(o => a.rule.startsWith(o)) - order.findIndex(o => b.rule.startsWith(o)) || a.rule.localeCompare(b.rule) || (a.level === 'pass') - (b.level === 'pass'));
  const fails = all.filter(f => f.level === 'fail'), warns = all.filter(f => f.level === 'warn'), passes = all.filter(f => f.level === 'pass');
  console.log(`\nSkill audit · ${report.file}\n`);
  for (const f of all) {
    const mark = f.level === 'pass' ? '✓' : f.level === 'fail' ? '✗' : '!';
    console.log(`${mark} ${f.rule.padEnd(18)} ${f.detail}${f.level !== 'pass' && f.count > 1 ? `  ×${f.count}` : ''}${f.level !== 'pass' && f.widths.length === 1 ? `  @${f.widths[0]}px` : ''}`);
    if (f.level !== 'pass') for (const e of f.examples) console.log(`      ${e}`);
  }
  console.log(`\n${fails.length ? '✗' : '✓'} ${fails.length} failing rules · ${warns.length} warnings · ${passes.length} passing checks\n`);
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ file: report.file, fails: fails.length, warnings: warns.length, passes: passes.length, findings: all }, null, 1));
})();

function innerHeightFor(h) { return h; }
