// Playwright smoke tests for the five new calculators, driven against the built `dist/` output
// served locally (see README: `cd dist && python3 -m http.server 8000`).
// Run with: node tests/e2e.spec.js
'use strict';
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8000';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let failures = 0;

  const check = async (name, fn) => {
    try {
      await fn();
      console.log('PASS', name);
    } catch (e) {
      failures++;
      console.log('FAIL', name, '-', e.message);
    }
  };

  const assertContains = (text, needle, label) => {
    if (!text.includes(needle)) { throw new Error((label || 'text') + ' did not contain "' + needle + '". Got: ' + text.slice(0, 300)); }
  };

  await check('Percentage Calculator: 20% of 50 = 10', async () => {
    await page.goto(BASE + '/money/percentage-calculator/');
    await page.fill('#of_x', '20');
    await page.fill('#of_y', '50');
    await page.click('button[type=submit]');
    const t = await page.locator('#result').innerText();
    assertContains(t, '10.00', 'percentage result');
  });

  await check('Percentage Calculator: 15 is what % of 60 = 25%', async () => {
    await page.goto(BASE + '/money/percentage-calculator/');
    await page.selectOption('#mode', 'what');
    await page.fill('#what_x', '15');
    await page.fill('#what_y', '60');
    await page.click('button[type=submit]');
    const t = await page.locator('#result').innerText();
    assertContains(t, '25.00%', 'what-percent result');
  });

  await check('Percentage Calculator: change from 80 to 100 = +25%', async () => {
    await page.goto(BASE + '/money/percentage-calculator/');
    await page.selectOption('#mode', 'change');
    await page.fill('#chg_x', '80');
    await page.fill('#chg_y', '100');
    await page.click('button[type=submit]');
    const t = await page.locator('#result').innerText();
    assertContains(t, '+25.00%', 'percent change result');
  });

  await check('Tip Calculator: $84.50 bill, 18% tip, 3 people', async () => {
    await page.goto(BASE + '/money/tip-calculator/');
    await page.fill('#bill', '84.50');
    await page.fill('#tip_pct', '18');
    await page.fill('#people', '3');
    await page.click('button[type=submit]');
    const t = await page.locator('#result').innerText();
    assertContains(t, '15.21', 'tip amount');
    assertContains(t, '99.71', 'tip total');
    assertContains(t, '33.24', 'tip per person');
  });

  await check('Tip Calculator: quick-select chip fills the tip percent field', async () => {
    await page.goto(BASE + '/money/tip-calculator/');
    await page.click('.chip[data-val="20"]');
    const val = await page.inputValue('#tip_pct');
    if (val !== '20') { throw new Error('expected tip_pct to be 20, got ' + val); }
  });

  await check('Age Calculator: exact birthday shows 0y 0m 0d and "Today!"', async () => {
    await page.goto(BASE + '/time/age-calculator/');
    await page.fill('#dob', '2000-06-15');
    await page.fill('#asof', '2024-06-15');
    await page.click('button[type=submit]');
    const t = await page.locator('#result').innerText();
    assertContains(t, '24 years, 0 months, 0 days', 'age breakdown');
    assertContains(t, 'Today!', 'next birthday');
  });

  await check('Age Calculator: leap-day birthday as of the day before, in a leap year', async () => {
    await page.goto(BASE + '/time/age-calculator/');
    await page.fill('#dob', '2000-02-29');
    await page.fill('#asof', '2024-02-28');
    await page.click('button[type=submit]');
    const t = await page.locator('#result').innerText();
    assertContains(t, '23 years, 11 months, 30 days', 'leap-day age breakdown');
  });

  await check('Days Between Dates: Jan 1 to Mar 1 2024 = 60 total days', async () => {
    await page.goto(BASE + '/time/date-calculator/');
    await page.fill('#date1', '2024-01-01');
    await page.fill('#date2', '2024-03-01');
    await page.click('button[type=submit]');
    const t = await page.locator('#result').innerText();
    assertContains(t, '60', 'total days');
  });

  await check('Electricity Cost Calculator: 1500W, 3h/day, $0.18/kWh', async () => {
    await page.goto(BASE + '/home/electricity-cost-calculator/');
    await page.fill('#watts', '1500');
    await page.fill('#hours', '3');
    await page.fill('#price', '0.18');
    await page.click('button[type=submit]');
    const t = await page.locator('#result').innerText();
    assertContains(t, '0.81', 'daily cost');
    assertContains(t, '24.30', 'monthly cost');
  });

  await check('Electricity Cost Calculator: 0 hours used gives $0.00 cost, not an error', async () => {
    await page.goto(BASE + '/home/electricity-cost-calculator/');
    await page.fill('#watts', '1500');
    await page.fill('#hours', '0');
    await page.fill('#price', '0.18');
    await page.click('button[type=submit]');
    const t = await page.locator('#result').innerText();
    assertContains(t, '0.00', 'zero-hours cost');
    const errCount = await page.locator('#result .err').count();
    if (errCount !== 0) { throw new Error('expected no error message for 0 hours'); }
  });

  await check('Scientific Calculator: 2 + 3 * 4 respects order of operations, answer lands in the expression field', async () => {
    await page.goto(BASE + '/math/scientific-calculator/');
    await page.fill('#expr', '2 + 3 * 4');
    await page.click('button[type=submit]');
    const val = await page.inputValue('#expr');
    if (val !== '14') { throw new Error('expected expr to become 14, got ' + val); }
    const resultHidden = await page.locator('#result').isHidden();
    if (!resultHidden) { throw new Error('expected the separate #result box to stay hidden on success'); }
  });

  await check('Scientific Calculator: can keep building on the answer (chaining)', async () => {
    await page.goto(BASE + '/math/scientific-calculator/');
    await page.fill('#expr', '2 + 3 * 4');
    await page.click('button[type=submit]');
    await page.click('.key[data-k="+"]');
    await page.click('.key[data-k="6"]');
    const val = await page.inputValue('#expr');
    if (val !== '14+6') { throw new Error('expected expr to be 14+6, got ' + val); }
    await page.click('button[type=submit]');
    const finalVal = await page.inputValue('#expr');
    if (finalVal !== '20') { throw new Error('expected chained result to be 20, got ' + finalVal); }
  });

  await check('Scientific Calculator: opens in simple mode with scientific keys hidden', async () => {
    await page.goto(BASE + '/math/scientific-calculator/');
    const visible = await page.locator('.key[data-k="sin("]').isVisible();
    if (visible) { throw new Error('expected sin( key to be hidden in simple mode'); }
    const pressed = await page.getAttribute('#sciToggle', 'aria-pressed');
    if (pressed !== 'false') { throw new Error('expected sciToggle aria-pressed=false initially'); }
  });

  await check('Scientific Calculator: Scientific toggle reveals and hides the extra keys', async () => {
    await page.goto(BASE + '/math/scientific-calculator/');
    await page.click('#sciToggle');
    const visibleOn = await page.locator('.key[data-k="sin("]').isVisible();
    if (!visibleOn) { throw new Error('expected sin( key to be visible after toggling Scientific on'); }
    await page.click('#sciToggle');
    const visibleOff = await page.locator('.key[data-k="sin("]').isVisible();
    if (visibleOff) { throw new Error('expected sin( key to be hidden after toggling Scientific off again'); }
  });

  await check('Scientific Calculator: keypad buttons build an expression (scientific mode)', async () => {
    await page.goto(BASE + '/math/scientific-calculator/');
    await page.click('#sciToggle');
    await page.click('.key[data-k="sqrt("]');
    await page.click('.key[data-k="9"]');
    await page.click('.key[data-k=")"]');
    const val = await page.inputValue('#expr');
    if (val !== 'sqrt(9)') { throw new Error('expected expr to be sqrt(9), got ' + val); }
    await page.click('button[type=submit]');
    const result = await page.inputValue('#expr');
    if (result !== '3') { throw new Error('expected expr to become 3, got ' + result); }
  });

  await check('Scientific Calculator: division by zero shows an error, not a crash', async () => {
    await page.goto(BASE + '/math/scientific-calculator/');
    await page.fill('#expr', '5/0');
    await page.click('button[type=submit]');
    const errCount = await page.locator('#result .err').count();
    if (errCount !== 1) { throw new Error('expected exactly one error message for division by zero'); }
  });

  await check('Currency Converter: shows a converted amount right next to Amount on load, with no interaction', async () => {
    await page.goto(BASE + '/money/currency-converter/');
    await page.waitForFunction(() => {
      const el = document.querySelector('#amountResult');
      return el && /\d/.test(el.innerText) && !el.innerText.includes('Fetching');
    }, { timeout: 10000 });
    const t = await page.locator('#amountResult').innerText();
    assertContains(t, 'EUR', 'default on-load conversion result');
  });

  await check('Currency Converter: same currency on both sides returns the amount unchanged', async () => {
    await page.goto(BASE + '/money/currency-converter/');
    await page.selectOption('#to', 'USD'); // from also defaults to USD, triggers live update
    const t = await page.locator('#amountResult').innerText();
    assertContains(t, '1.00 USD', 'same-currency result');
  });

  await check('Currency Converter: typing an amount updates the result live, with no click needed', async () => {
    await page.goto(BASE + '/money/currency-converter/');
    await page.waitForFunction(() => {
      const el = document.querySelector('#amountResult');
      return el && /\d/.test(el.innerText) && !el.innerText.includes('Fetching');
    }, { timeout: 10000 });
    const before = await page.locator('#amountResult').innerText();
    await page.fill('#amount', '10');
    // Debounced (300ms) live update, driven purely by typing - no button click.
    await page.waitForFunction((prev) => {
      const el = document.querySelector('#amountResult');
      return el && el.innerText.includes('EUR') && el.innerText !== prev;
    }, before, { timeout: 10000 });
  });

  await check('Currency Converter: swap button exchanges the two currencies and updates live', async () => {
    await page.goto(BASE + '/money/currency-converter/');
    await page.click('#swap');
    const from = await page.inputValue('#from');
    const to = await page.inputValue('#to');
    if (from !== 'EUR' || to !== 'USD') { throw new Error('expected from=EUR to=USD after swap, got from=' + from + ' to=' + to); }
    await page.waitForFunction(() => {
      const el = document.querySelector('#amountResult');
      return el && el.innerText.includes('USD') && /\d/.test(el.innerText);
    }, { timeout: 10000 });
  });

  await check('Currency Converter: different currencies fetch a live rate and show a converted amount', async () => {
    await page.goto(BASE + '/money/currency-converter/');
    await page.fill('#amount', '100');
    await page.selectOption('#from', 'USD');
    await page.selectOption('#to', 'EUR');
    await page.click('button[type=submit]');
    await page.waitForFunction(() => {
      const el = document.querySelector('#amountResult');
      return el && /\d/.test(el.innerText) && !el.innerText.includes('Fetching');
    }, { timeout: 10000 });
    const t = await page.locator('#amountResult').innerText();
    assertContains(t, 'EUR', 'currency conversion result');
    const errCount = await page.locator('#result .err').count();
    if (errCount !== 0) { throw new Error('expected a successful conversion, got an error: ' + t); }
  });

  await check('Search box finds and navigates to a new calculator', async () => {
    await page.goto(BASE + '/');
    await page.fill('#site-search', 'electricity');
    await page.waitForSelector('#search-results a');
    await page.click('#search-results a');
    await page.waitForURL('**/home/electricity-cost-calculator/**');
  });

  await browser.close();
  console.log('\n' + (failures === 0 ? 'All Playwright checks passed.' : failures + ' Playwright check(s) FAILED.'));
  process.exit(failures === 0 ? 0 : 1);
}

run();
