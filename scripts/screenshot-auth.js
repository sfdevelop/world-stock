const { chromium } = require("playwright");
const path = require("path");

const OUT = path.resolve(__dirname, "../output/playwright");
const BASE = "http://127.0.0.1:4175";

async function shot(page, name, selector) {
  const el = await page.locator(selector);
  await el.screenshot({
    path: path.join(OUT, name),
    animations: "disabled"
  });
}

async function prepare(page) {
  await page.addStyleTag({
    content: `
      .drop-top, .drop-footer, .drop-up, .drop-cookie, .drop-cart { display: none !important; }
      .drop-auth { padding: 24px !important; justify-content: flex-start !important; }
      body { background: #fff; }
    `
  });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1440, height: 1600 });
  await page.goto(`${BASE}/drop-registration.html`, { waitUntil: "networkidle" });
  await prepare(page);
  await shot(page, "impl-auth-reg-desk.png", ".drop-auth__card");

  await page.setViewportSize({ width: 360, height: 1800 });
  await page.goto(`${BASE}/drop-registration.html`, { waitUntil: "networkidle" });
  await prepare(page);
  await shot(page, "impl-auth-reg-mob.png", ".drop-auth__card");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/drop-login.html`, { waitUntil: "networkidle" });
  await prepare(page);
  await shot(page, "impl-auth-login-desk.png", ".drop-auth__card");

  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto(`${BASE}/drop-login.html`, { waitUntil: "networkidle" });
  await prepare(page);
  await shot(page, "impl-auth-login-mob.png", ".drop-auth__card");

  await browser.close();
  console.log("saved screenshots");
})();
