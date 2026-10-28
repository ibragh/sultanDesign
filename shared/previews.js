// Viewport-only previews for the gallery: node shared/previews.js <slug>...
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY } });
  for (const slug of process.argv.slice(2)) {
    for (const [w, h, suffix] of [[1440, 900, ''], [390, 844, '-m']]) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: suffix ? 2 : 1 });
      await page.goto('file://' + path.join(root, 'designs', slug + '.html'), { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1200);
      await page.addStyleTag({ content: '[href$="index.html"]{visibility:hidden!important}' });
      await page.screenshot({ path: path.join(root, 'previews', slug + suffix + '.png') });
      await page.close();
    }
  }
  await browser.close();
})();
