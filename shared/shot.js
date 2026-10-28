// Usage: node shot.js <html> <out-prefix> [widths...]
const { chromium } = require('playwright');
(async () => {
  const [file, out, ...ws] = process.argv.slice(2);
  const widths = ws.length ? ws.map(Number) : [1440, 390];
  const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: w > 600 ? 900 : 844 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('requestfailed', r => errors.push('requestfailed: ' + r.url().slice(0, 120) + ' ' + (r.failure() || {}).errorText));
    await page.goto('file://' + require('path').resolve(file), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const info = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, h: document.documentElement.scrollHeight,
      fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i) }));
    await page.screenshot({ path: `${out}-${w}.png`, fullPage: true });
    console.log(JSON.stringify({ width: w, overflowX: info.sw > info.iw, scrollWidth: info.sw, height: info.h, fonts: info.fonts, errors }));
    await page.close();
  }
  await browser.close();
})();
