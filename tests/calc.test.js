// Node-based unit tests for the new pure calculation functions in static/calc.js.
// Run with: node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Calc = require('../static/calc.js');

test('percentOf: basic', () => {
  assert.equal(Calc.percentOf(20, 50), 10);
  assert.equal(Calc.percentOf(100, 40), 40);
});
test('percentOf: zero and negative inputs', () => {
  assert.equal(Calc.percentOf(0, 50), 0);
  assert.equal(Calc.percentOf(20, 0), 0);
  assert.equal(Calc.percentOf(-10, 50), -5);
  assert.equal(Calc.percentOf(10, -50), -5);
});

test('whatPercent: basic', () => {
  assert.equal(Calc.whatPercent(15, 60), 25);
  assert.equal(Calc.whatPercent(60, 60), 100);
});
test('whatPercent: zero and negative inputs', () => {
  assert.equal(Calc.whatPercent(0, 60), 0);
  assert.equal(Calc.whatPercent(-15, 60), -25);
  assert.ok(Number.isNaN(Calc.whatPercent(0, 0)));
  assert.equal(Calc.whatPercent(15, 0), Infinity);
});

test('percentChange: basic increase and decrease', () => {
  assert.equal(Calc.percentChange(80, 100), 25);
  assert.equal(Math.round(Calc.percentChange(100, 80) * 100) / 100, -20);
});
test('percentChange: zero and negative inputs', () => {
  assert.equal(Calc.percentChange(50, 50), 0);
  assert.equal(Calc.percentChange(-50, -25), -50);
  assert.equal(Calc.percentChange(0, 10), Infinity);
});

test('tip: basic split', () => {
  const r = Calc.tip(84.5, 18, 3);
  assert.equal(Math.round(r.tip * 100) / 100, 15.21);
  assert.equal(Math.round(r.total * 100) / 100, 99.71);
  assert.equal(Math.round(r.perPerson * 100) / 100, 33.24);
});
test('tip: zero percent and single person', () => {
  const r = Calc.tip(50, 0, 1);
  assert.equal(r.tip, 0);
  assert.equal(r.total, 50);
  assert.equal(r.perPerson, 50);
});

test('ymdDiff: simple same-year gap', () => {
  const r = Calc.ymdDiff(2024, 0, 1, 2024, 0, 11);
  assert.deepEqual(r, { years: 0, months: 0, days: 10, totalDays: 10 });
});
test('ymdDiff: start day-of-month (31st) exceeds the borrowed month length (Jan 31 -> Mar 1, leap year)', () => {
  // Adding 1 month to Jan 31 2024 normalizes past Feb's 29 days to Mar 2, which is already
  // after Mar 1, so the correct whole-month count is 0, with 30 days remaining (Jan31->Feb1=1,
  // all of Feb's 29 days, ->Mar1). This is the case a naive "borrow a month" formula gets wrong.
  const r = Calc.ymdDiff(2024, 0, 31, 2024, 2, 1);
  assert.equal(r.years, 0);
  assert.equal(r.months, 0);
  assert.equal(r.days, 30);
  assert.equal(r.totalDays, 30);
});

test('age: exact birthday (0y 0m 0d) and next-birthday is today', () => {
  const r = Calc.age(2000, 5, 15, 2024, 5, 15);
  assert.equal(r.years, 24);
  assert.equal(r.months, 0);
  assert.equal(r.days, 0);
  assert.equal(r.daysToNextBirthday, 0);
});
test('age: day before birthday', () => {
  const r = Calc.age(2000, 5, 15, 2024, 5, 14);
  assert.equal(r.years, 23);
  assert.equal(r.months, 11);
  assert.equal(r.daysToNextBirthday, 1);
});
test('age: leap-day birthday (Feb 29 2000), as of day before the anniversary in a leap year', () => {
  const r = Calc.age(2000, 1, 29, 2024, 1, 28); // 2024 is a leap year, so Feb 29 2024 exists
  assert.equal(r.years, 23);
  assert.equal(r.months, 11);
  assert.equal(r.days, 30);
});
test('age: leap-day birthday, exact 24th anniversary in a leap year', () => {
  const r = Calc.age(2000, 1, 29, 2024, 1, 29);
  assert.equal(r.years, 24);
  assert.equal(r.months, 0);
  assert.equal(r.days, 0);
});
test('age: leap-day birthday in a non-leap year rolls to March 1', () => {
  // 2023 is not a leap year; Date.UTC(2023, 1, 29) normalizes to March 1 2023.
  const onFeb28 = Calc.age(2000, 1, 29, 2023, 1, 28);
  assert.equal(onFeb28.years, 22);
  assert.equal(onFeb28.months, 11);
  assert.equal(onFeb28.days, 30);
  const onMar1 = Calc.age(2000, 1, 29, 2023, 2, 1);
  assert.equal(onMar1.years, 23);
  assert.equal(onMar1.months, 0);
  assert.equal(onMar1.days, 0);
});
test('age: weekday and total days/weeks are correct', () => {
  // 2000-01-01 was a Saturday (weekday index 6).
  const r = Calc.age(2000, 0, 1, 2000, 0, 8);
  assert.equal(r.weekday, 6);
  assert.equal(r.totalDays, 7);
  assert.equal(r.totalWeeks, 1);
});
test('age: dob after reference date is not validated here (pure function trusts caller)', () => {
  const r = Calc.age(2024, 0, 10, 2024, 0, 1);
  assert.equal(r.totalDays, -9);
});

test('dateDiff: forward order', () => {
  const r = Calc.dateDiff(2024, 0, 1, 2024, 2, 1);
  assert.equal(r.totalDays, 60);
  assert.equal(r.years, 0);
  assert.equal(r.months, 2);
  assert.equal(r.days, 0);
  assert.equal(r.swapped, false);
});
test('dateDiff: reversed order gives the same magnitude and flags swapped', () => {
  const r = Calc.dateDiff(2024, 2, 1, 2024, 0, 1);
  assert.equal(r.totalDays, 60);
  assert.equal(r.swapped, true);
});
test('dateDiff: same date is zero', () => {
  const r = Calc.dateDiff(2024, 5, 1, 2024, 5, 1);
  assert.equal(r.totalDays, 0);
  assert.equal(r.years, 0);
  assert.equal(r.months, 0);
  assert.equal(r.days, 0);
});

test('electricity: basic example', () => {
  const r = Calc.electricity(1500, 3, 0.18, 30);
  assert.equal(Math.round(r.kwhDay * 1000) / 1000, 4.5);
  assert.equal(Math.round(r.costDay * 100) / 100, 0.81);
  assert.equal(Math.round(r.costMonth * 100) / 100, 24.3);
});
test('electricity: zero hours used means zero cost', () => {
  const r = Calc.electricity(1500, 0, 0.18, 30);
  assert.equal(r.kwhDay, 0);
  assert.equal(r.costDay, 0);
  assert.equal(r.costMonth, 0);
  assert.equal(r.costYear, 0);
});
test('electricity: yearly figure uses 365 days regardless of daysPerMonth', () => {
  const r = Calc.electricity(1000, 1, 0.20, 30);
  assert.equal(r.kwhYear, 365);
  assert.equal(Math.round(r.costYear * 100) / 100, 73);
});

test('evCharging: 1000 mi at 3.5 mi/kWh, $0.18/kWh, 12% loss vs 30 mpg at $3.50', () => {
  const r = Calc.evCharging(1000, 3.5, 0.18, 12, 7.2, 75, 1000 / 30, 3.5);
  assert.equal(Math.round(r.kwhWheel * 10) / 10, 285.7);
  assert.equal(Math.round(r.kwhWall * 10) / 10, 324.7);
  assert.equal(Math.round(r.evCost * 100) / 100, 58.44);
  assert.equal(Math.round(r.gasCost * 100) / 100, 116.67);
  assert.equal(Math.round(r.savings * 100) / 100, 58.23);
  assert.equal(Math.round(r.chargeHours * 10) / 10, 11.8);
});
test('evCharging: zero loss means wall energy equals wheel energy', () => {
  const r = Calc.evCharging(100, 4, 0.2, 0, 10, 50, 0, 0);
  assert.equal(r.kwhWall, 25);
  assert.equal(r.evCost, 5);
  assert.equal(r.chargeHours, 5);
});

test('convert: basic and edge cases', () => {
  assert.equal(Calc.convert(50, 0.92), 46);
  assert.equal(Calc.convert(0, 1.5), 0);
  assert.equal(Calc.convert(100, 0), 0);
  assert.equal(Calc.convert(-10, 2), -20);
});

test('factorial: basic and edge cases', () => {
  assert.equal(Calc.factorial(0), 1);
  assert.equal(Calc.factorial(1), 1);
  assert.equal(Calc.factorial(5), 120);
  assert.equal(Calc.factorial(10), 3628800);
  assert.throws(() => Calc.factorial(-1), /non-negative/);
  assert.throws(() => Calc.factorial(2.5), /non-negative/);
});

test('evalExpr: basic arithmetic and order of operations', () => {
  assert.equal(Calc.evalExpr('2+3'), 5);
  assert.equal(Calc.evalExpr('2 + 3 * 4'), 14);
  assert.equal(Calc.evalExpr('(2 + 3) * 4'), 20);
  assert.equal(Calc.evalExpr('10 / 4'), 2.5);
  assert.equal(Calc.evalExpr('2^3^2'), 512); // right-associative: 2^(3^2) = 2^9
  assert.equal(Calc.evalExpr('-5 + 3'), -2);
  assert.equal(Calc.evalExpr('-(2+3)'), -5);
});
test('evalExpr: functions and constants', () => {
  assert.ok(Math.abs(Calc.evalExpr('sin(30)') - 0.5) < 1e-9);
  assert.ok(Math.abs(Calc.evalExpr('cos(60)') - 0.5) < 1e-9);
  assert.equal(Calc.evalExpr('sqrt(16)'), 4);
  assert.equal(Calc.evalExpr('log(100)'), 2);
  assert.ok(Math.abs(Calc.evalExpr('ln(e)') - 1) < 1e-9);
  assert.ok(Math.abs(Calc.evalExpr('pi') - Math.PI) < 1e-9);
  assert.equal(Calc.evalExpr('5!'), 120);
  assert.equal(Calc.evalExpr('2^10'), 1024);
});
test('evalExpr: division by zero throws', () => {
  assert.throws(() => Calc.evalExpr('5/0'), /divide by zero/);
});
test('evalExpr: invalid syntax throws rather than returning garbage', () => {
  assert.throws(() => Calc.evalExpr(''));
  assert.throws(() => Calc.evalExpr('2+'));
  assert.throws(() => Calc.evalExpr('(2+3'));
  assert.throws(() => Calc.evalExpr('2 $ 3'));
  assert.throws(() => Calc.evalExpr('bogus(1)'));
});
test('evalExpr: nested functions and negative factorial input', () => {
  assert.ok(Math.abs(Calc.evalExpr('sin(30) + cos(60)') - 1) < 1e-9);
  assert.throws(() => Calc.evalExpr('(-1)!'));
});
