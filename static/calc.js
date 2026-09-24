/* Health calculators. Pure maths lives in `Calc` so it can be unit-tested in Node. */
(function (root) {
  'use strict';

  var LB = 0.45359237;

  var Calc = {
    bmi: function (kg, cm) {
      var m = cm / 100;
      var v = kg / (m * m);
      var cat = v < 18.5 ? 'Underweight' : v < 25 ? 'Healthy weight' : v < 30 ? 'Overweight' : 'Obesity';
      return { bmi: v, cat: cat, lo: 18.5 * m * m, hi: 24.9 * m * m };
    },

    // Mifflin-St Jeor equation
    bmr: function (sex, kg, cm, age) {
      return 10 * kg + 6.25 * cm - 5 * age + (sex === 'male' ? 5 : -161);
    },

    macros: function (cal, split, meals) {
      var p = (cal * split[0]) / 4, c = (cal * split[1]) / 4, f = (cal * split[2]) / 9;
      return { p: p, c: c, f: f, perMeal: { p: p / meals, c: c / meals, f: f / meals } };
    },

    // U.S. Navy circumference method, measurements in cm
    bodyFat: function (sex, cm, neck, waist, hip) {
      if (sex === 'male') {
        return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(cm)) - 450;
      }
      return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(cm)) - 450;
    },

    bfCategory: function (sex, bf) {
      var t = sex === 'male' ? [[6, 'Essential fat'], [14, 'Athletic'], [18, 'Fit'], [25, 'Average']]
                             : [[14, 'Essential fat'], [21, 'Athletic'], [25, 'Fit'], [32, 'Average']];
      for (var i = 0; i < t.length; i++) if (bf < t[i][0]) return t[i][1];
      return 'Above average';
    },

    // Classic height-based formulas, results in kg
    ideal: function (sex, cm) {
      var over = cm / 2.54 - 60;
      var m = sex === 'male';
      return {
        Devine: (m ? 50 : 45.5) + 2.3 * over,
        Robinson: (m ? 52 : 49) + (m ? 1.9 : 1.7) * over,
        Miller: (m ? 56.2 : 53.1) + (m ? 1.41 : 1.36) * over,
        Hamwi: (m ? 48 : 45.5) + (m ? 2.7 : 2.2) * over
      };
    },

    // Total daily fluid target in litres
    water: function (kg, exerciseMin, hot) {
      return (33 * kg + (exerciseMin / 30) * 350 + (hot ? 500 : 0)) / 1000;
    },

    // Naegele's rule with cycle-length adjustment. All dates are UTC midnight timestamps.
    dueDate: function (lmp, cycle, today) {
      var DAY = 86400000;
      var adj = cycle - 28;
      var days = Math.floor((today - lmp) / DAY);
      return {
        due: lmp + (280 + adj) * DAY,
        ovulation: lmp + (cycle - 14) * DAY,
        tri2: lmp + (98 + adj) * DAY,
        tri3: lmp + (196 + adj) * DAY,
        fullTerm: lmp + (273 + adj) * DAY,
        gaDays: days - adj, // gestational age counted from the adjusted "28-day equivalent" LMP
        weeks: Math.floor((days - adj) / 7),
        rem: (days - adj) % 7,
        daysSinceLmp: days
      };
    },

    zones: function (age, rest, formula) {
      var max = formula === 'tanaka' ? 208 - 0.7 * age : 220 - age;
      var bands = [[0.5, 0.6, 'Zone 1: Very light', 'Warm-up, recovery, easy walking'],
                   [0.6, 0.7, 'Zone 2: Light', 'Fat-burning, base endurance, conversational pace'],
                   [0.7, 0.8, 'Zone 3: Moderate', 'Aerobic fitness, steady cardio'],
                   [0.8, 0.9, 'Zone 4: Hard', 'Speed and lactate threshold work'],
                   [0.9, 1.0, 'Zone 5: Maximum', 'Short all-out efforts only']];
      var out = bands.map(function (b) {
        var f = function (p) { return rest > 0 ? Math.round((max - rest) * p + rest) : Math.round(max * p); };
        return { name: b[2], desc: b[3], lo: f(b[0]), hi: f(b[1]), pct: Math.round(b[0] * 100) + '-' + Math.round(b[1] * 100) + '%' };
      });
      return { max: Math.round(max), zones: out, karvonen: rest > 0 };
    },

    percentOf: function (pct, y) { return (pct / 100) * y; },
    whatPercent: function (x, y) { return (x / y) * 100; },
    percentChange: function (from, to) { return ((to - from) / from) * 100; },

    tip: function (bill, pct, people) {
      var t = bill * (pct / 100), total = bill + t;
      return { tip: t, total: total, perPerson: total / people, tipPerPerson: t / people };
    },

    // Calendar-accurate y/m/d breakdown plus total days between two UTC dates (date2 must not be before date1).
    // Finds the largest whole number of months that can be added to date1 (via Date.UTC's own
    // month/day overflow normalization) without passing date2, then the remainder is exact days.
    // A naive "borrow days from the previous month" approach breaks when the start day-of-month
    // (e.g. the 31st) exceeds the length of the month being borrowed from, so this avoids that.
    ymdDiff: function (y1, m1, d1, y2, m2, d2) {
      var DAY = 86400000;
      var end = Date.UTC(y2, m2, d2);
      var totalDays = Math.round((end - Date.UTC(y1, m1, d1)) / DAY);
      var totalMonths = (y2 - y1) * 12 + (m2 - m1);
      while (totalMonths > 0 && Date.UTC(y1, m1 + totalMonths, d1) > end) { totalMonths--; }
      while (totalMonths < 0 && Date.UTC(y1, m1 + totalMonths, d1) < end) { totalMonths++; }
      var days = Math.round((end - Date.UTC(y1, m1 + totalMonths, d1)) / DAY);
      return { years: Math.trunc(totalMonths / 12), months: totalMonths % 12, days: days, totalDays: totalDays };
    },

    // Exact age as of a reference date, using Date.UTC's own day-overflow rules for Feb 29 birthdays
    // in non-leap years (Date.UTC(year, 1, 29) rolls forward to March 1), so no leap-year special-casing is needed.
    age: function (dobY, dobM, dobD, refY, refM, refD) {
      var DAY = 86400000;
      var b = Calc.ymdDiff(dobY, dobM, dobD, refY, refM, refD);
      var ref = Date.UTC(refY, refM, refD);
      var thisYear = Date.UTC(refY, dobM, dobD);
      var daysToThisYear = Math.round((thisYear - ref) / DAY);
      var nextBirthday, daysToNext;
      if (daysToThisYear >= 0) {
        nextBirthday = thisYear; daysToNext = daysToThisYear;
      } else {
        nextBirthday = Date.UTC(refY + 1, dobM, dobD);
        daysToNext = Math.round((nextBirthday - ref) / DAY);
      }
      return {
        years: b.years, months: b.months, days: b.days,
        totalDays: b.totalDays, totalWeeks: Math.floor(b.totalDays / 7),
        nextBirthday: nextBirthday, daysToNextBirthday: daysToNext,
        weekday: new Date(Date.UTC(dobY, dobM, dobD)).getUTCDay()
      };
    },

    // Calendar-accurate difference between any two dates, either order.
    dateDiff: function (y1, m1, d1, y2, m2, d2) {
      var swapped = Date.UTC(y2, m2, d2) < Date.UTC(y1, m1, d1);
      var b = swapped ? Calc.ymdDiff(y2, m2, d2, y1, m1, d1) : Calc.ymdDiff(y1, m1, d1, y2, m2, d2);
      return {
        years: b.years, months: b.months, days: b.days,
        totalDays: Math.abs(b.totalDays), totalWeeks: Math.floor(Math.abs(b.totalDays) / 7),
        totalMonths: b.years * 12 + b.months, swapped: swapped
      };
    },

    electricity: function (watts, hoursPerDay, pricePerKwh, daysPerMonth) {
      var kwhDay = (watts / 1000) * hoursPerDay;
      var kwhMonth = kwhDay * daysPerMonth, kwhYear = kwhDay * 365;
      return {
        kwhDay: kwhDay, kwhMonth: kwhMonth, kwhYear: kwhYear,
        costDay: kwhDay * pricePerKwh, costMonth: kwhMonth * pricePerKwh, costYear: kwhYear * pricePerKwh
      };
    },

    // Distances in one unit (km or mi); efficiency in that unit per kWh; fuelUsed = litres or gallons
    evCharging: function (distance, efficiency, pricePerKwh, lossPct, chargerKw, batteryKwh, fuelUsed, fuelPrice) {
      var kwhWheel = distance / efficiency;
      var kwhWall = kwhWheel / (1 - lossPct / 100);
      var evCost = kwhWall * pricePerKwh, gasCost = fuelUsed * fuelPrice;
      return {
        kwhWheel: kwhWheel, kwhWall: kwhWall, evCost: evCost, gasCost: gasCost, savings: gasCost - evCost,
        evPerDist: evCost / distance, gasPerDist: gasCost / distance,
        chargeHours: batteryKwh / (chargerKw * (1 - lossPct / 100))
      };
    },

    // Litres (metric, economy in L/100 km) or US gallons (imperial, economy in mpg)
    fuelUsed: function (distance, economy, imperial) {
      return imperial ? distance / economy : (distance * economy) / 100;
    },

    // One fuel economy figure in any of the four units, returned in all four
    fuelEconomy: function (value, from) {
      var KM_PER_MI = 1.609344, L_US = 3.785411784, L_UK = 4.54609;
      var kml = from === 'kml' ? value : from === 'l100' ? 100 / value
        : (value * KM_PER_MI) / (from === 'mpg_uk' ? L_UK : L_US);
      return { kml: kml, l100: 100 / kml, mpg_us: (kml * L_US) / KM_PER_MI, mpg_uk: (kml * L_UK) / KM_PER_MI };
    },

    // Standard amortized loan, with a year-by-year summary
    loan: function (principal, aprPct, months) {
      var r = aprPct / 1200;
      var pay = r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
      var bal = principal, years = [], y = null;
      for (var m = 0; m < months; m++) {
        var interest = bal * r, prin = pay - interest;
        bal -= prin;
        if (m % 12 === 0) { y = { year: years.length + 1, interest: 0, principal: 0, balance: 0 }; years.push(y); }
        y.interest += interest; y.principal += prin; y.balance = Math.max(0, bal);
      }
      return { payment: pay, total: pay * months, interest: pay * months - principal, years: years };
    },

    // Pre-tax lease payment: depreciation fee + finance fee (money factor = APR / 2400)
    lease: function (price, residualPct, moneyFactor, months) {
      var residual = (price * residualPct) / 100;
      var dep = (price - residual) / months, fin = (price + residual) * moneyFactor;
      return { residual: residual, depreciation: dep, finance: fin, payment: dep + fin, total: (dep + fin) * months };
    },

    // parts: [[label, monthly amount], ...]
    costPerDistance: function (monthlyDistance, parts) {
      var total = 0;
      for (var i = 0; i < parts.length; i++) { total += parts[i][1]; }
      return {
        monthly: total, annual: total * 12, perDist: total / monthlyDistance,
        parts: parts.map(function (p) { return { label: p[0], monthly: p[1], perDist: p[1] / monthlyDistance, share: total ? (p[1] / total) * 100 : 0 }; })
      };
    },

    // Declining-balance depreciation: firstPct in year 1, laterPct each year after
    depreciation: function (price, firstPct, laterPct, years) {
      var v = price, rows = [];
      for (var y = 1; y <= years; y++) {
        var lost = v * (y === 1 ? firstPct : laterPct) / 100;
        rows.push({ year: y, start: v, lost: lost, end: v - lost });
        v -= lost;
      }
      return { rows: rows, value: v, lost: price - v, lostPct: ((price - v) / price) * 100 };
    },

    evVsGas: function (distance, evEff, pricePerKwh, evMaint, gasEconomy, fuelPrice, gasMaint, imperial) {
      var kwh = distance / evEff, fuel = Calc.fuelUsed(distance, gasEconomy, imperial);
      var ev = kwh * pricePerKwh + evMaint, gas = fuel * fuelPrice + gasMaint;
      return { kwh: kwh, evEnergy: kwh * pricePerKwh, ev: ev, fuel: fuel, gasFuel: fuel * fuelPrice, gas: gas, diff: gas - ev };
    },

    roadTrip: function (legs, economy, fuelPrice, imperial) {
      var total = { distance: 0, fuel: 0, cost: 0 };
      var rows = legs.map(function (d) {
        var f = Calc.fuelUsed(d, economy, imperial), c = f * fuelPrice;
        total.distance += d; total.fuel += f; total.cost += c;
        return { distance: d, fuel: f, cost: c };
      });
      return { legs: rows, distance: total.distance, fuel: total.fuel, cost: total.cost };
    },

    // "225/45R17", "P225/45 R17", "LT265/70R17", "225/45ZR17" -> {w, a, r} or null
    tireParse: function (s) {
      var m = /^\s*(?:P|LT|ST)?\s*(\d{3})\s*\/\s*(\d{2,3})\s*[A-Z]{0,2}\s*-?\s*(\d{2}(?:\.\d)?)(?:\s+\d{2,3}(?:\/\d{2,3})?[A-Z]{1,2})?\s*$/i.exec(String(s));
      return m ? { w: +m[1], a: +m[2], r: +m[3] } : null;
    },

    // Overall diameter in mm: two sidewalls plus the wheel
    tireDiameter: function (t) { return (2 * t.w * t.a) / 100 + t.r * 25.4; },

    tireCompare: function (stock, fitted) {
      var d1 = Calc.tireDiameter(stock), d2 = Calc.tireDiameter(fitted);
      return { stockDia: d1, newDia: d2, ratio: d2 / d1, errorPct: (d2 / d1 - 1) * 100 };
    },

    convert: function (amount, rate) { return amount * rate; },

    factorial: function (n) {
      if (n < 0 || Math.floor(n) !== n) { throw new Error('Factorial needs a non-negative whole number.'); }
      if (n > 170) { return Infinity; }
      var r = 1;
      for (var i = 2; i <= n; i++) { r *= i; }
      return r;
    },

    // Small recursive-descent parser/evaluator for scientific-calculator expressions.
    // Grammar: expr := term (('+'|'-') term)*; term := unary (('*'|'/') unary)*;
    // unary := ('-'|'+') unary | power; power := postfix ('^' unary)?; postfix := primary '!'?;
    // primary := number | const | IDENT '(' expr ')' | '(' expr ')'
    // Trig functions (sin/cos/tan/asin/acos/atan) work in degrees.
    evalExpr: function (str) {
      var i = 0, n = str.length;
      var skip = function () { while (i < n && /\s/.test(str[i])) { i++; } };
      var CONSTS = { pi: Math.PI, e: Math.E };
      var FUNCS = {
        sin: function (x) { return Math.sin(x * Math.PI / 180); },
        cos: function (x) { return Math.cos(x * Math.PI / 180); },
        tan: function (x) { return Math.tan(x * Math.PI / 180); },
        asin: function (x) { return Math.asin(x) * 180 / Math.PI; },
        acos: function (x) { return Math.acos(x) * 180 / Math.PI; },
        atan: function (x) { return Math.atan(x) * 180 / Math.PI; },
        sqrt: Math.sqrt, log: Math.log10, ln: Math.log, abs: Math.abs
      };

      var parseExpr, parseTerm, parseUnary, parsePower, parsePostfix, parsePrimary;

      parseExpr = function () {
        var v = parseTerm();
        skip();
        while (i < n && (str[i] === '+' || str[i] === '-')) {
          var op = str[i]; i++;
          var rhs = parseTerm();
          v = op === '+' ? v + rhs : v - rhs;
          skip();
        }
        return v;
      };
      parseTerm = function () {
        var v = parseUnary();
        skip();
        while (i < n && (str[i] === '*' || str[i] === '/')) {
          var op = str[i]; i++;
          var rhs = parseUnary();
          if (op === '/') {
            if (rhs === 0) { throw new Error('Cannot divide by zero.'); }
            v = v / rhs;
          } else { v = v * rhs; }
          skip();
        }
        return v;
      };
      parseUnary = function () {
        skip();
        if (i < n && str[i] === '-') { i++; return -parseUnary(); }
        if (i < n && str[i] === '+') { i++; return parseUnary(); }
        return parsePower();
      };
      parsePower = function () {
        var v = parsePostfix();
        skip();
        if (i < n && str[i] === '^') { i++; return Math.pow(v, parseUnary()); }
        return v;
      };
      parsePostfix = function () {
        var v = parsePrimary();
        skip();
        while (i < n && str[i] === '!') { i++; v = Calc.factorial(v); skip(); }
        return v;
      };
      parsePrimary = function () {
        skip();
        if (i >= n) { throw new Error('Unexpected end of expression.'); }
        if (str[i] === '(') {
          i++; var v = parseExpr(); skip();
          if (str[i] !== ')') { throw new Error('Missing closing parenthesis.'); }
          i++; return v;
        }
        if (/[0-9.]/.test(str[i])) {
          var start = i;
          while (i < n && /[0-9.]/.test(str[i])) { i++; }
          var num = parseFloat(str.slice(start, i));
          if (isNaN(num)) { throw new Error('Invalid number.'); }
          return num;
        }
        if (/[a-zA-Z]/.test(str[i])) {
          var s2 = i;
          while (i < n && /[a-zA-Z]/.test(str[i])) { i++; }
          var name = str.slice(s2, i).toLowerCase();
          skip();
          if (name in CONSTS) { return CONSTS[name]; }
          if (name in FUNCS) {
            if (str[i] !== '(') { throw new Error('Expected "(" after ' + name + '.'); }
            i++; var arg = parseExpr(); skip();
            if (str[i] !== ')') { throw new Error('Missing closing parenthesis.'); }
            i++; return FUNCS[name](arg);
          }
          throw new Error('Unknown name "' + name + '".');
        }
        throw new Error('Unexpected character "' + str[i] + '".');
      };

      if (!str || !str.trim()) { throw new Error('Please enter an expression.'); }
      var result = parseExpr();
      skip();
      if (i < n) { throw new Error('Unexpected character "' + str[i] + '".'); }
      if (!isFinite(result)) { throw new Error('Result is too large or undefined.'); }
      return result;
    }
  };

  root.HealthCalc = Calc;
  if (typeof module !== 'undefined' && module.exports) { module.exports = Calc; }
  if (typeof document === 'undefined') { return; }

  /* ------------------------------ DOM layer ------------------------------ */
  var $ = function (id) { return document.getElementById(id); };
  var form = $('calc');
  var res = $('result');
  if (!form || !res) { return; }
  var kind = document.body.getAttribute('data-calc');

  var num = function (id) {
    var el = $(id);
    if (!el || el.value === '') { return NaN; }
    var v = parseFloat(el.value);
    return isFinite(v) ? v : NaN;
  };
  var unit = function () { return $('unit') ? $('unit').value : 'metric'; };
  var imperial = function () { return unit() === 'imperial'; };
  var fmt = function (n, d) {
    d = d === undefined ? 1 : d;
    return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  var weightKg = function () { return imperial() ? num('w_lb') * LB : num('w_kg'); };
  var heightCm = function () {
    if (!imperial()) { return num('h_cm'); }
    var ft = num('h_ft'), inch = num('h_in');
    if (isNaN(ft)) { return NaN; }
    return (ft * 12 + (isNaN(inch) ? 0 : inch)) * 2.54;
  };
  var lenCm = function (key) { return imperial() ? num(key + '_in') * 2.54 : num(key + '_cm'); };
  var showWeight = function (kg, d) {
    d = d === undefined ? 1 : d;
    return imperial() ? fmt(kg / LB, d) + ' lb' : fmt(kg, d) + ' kg';
  };
  var bad = function () {
    for (var i = 0; i < arguments.length; i++) { if (isNaN(arguments[i]) || arguments[i] <= 0) { return true; } }
    return false;
  };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var out = function (html) { res.hidden = false; res.innerHTML = html; };
  var err = function (msg) { out('<p class="err" role="alert">' + esc(msg) + '</p>'); };
  var stat = function (label, value, note) {
    return '<div class="stat"><span class="k">' + label + '</span><span class="v">' + value + '</span>' +
      (note ? '<span class="n">' + note + '</span>' : '') + '</div>';
  };
  // Up to 6 decimal places, trimmed of trailing zeros (and a trailing dot), for scientific-calculator results.
  var fmtSci = function (n) {
    var s = n.toLocaleString('en-US', { maximumFractionDigits: 6, useGrouping: false });
    return s;
  };
  var sexVal = function () { return $('sex') ? $('sex').value : 'male'; };
  // yyyy-mm-dd from a <input type=date>, as {y, m (0-indexed), d}, or null if empty/invalid.
  var parseDate = function (id) {
    var v = $(id) ? $(id).value : '';
    if (!v) { return null; }
    var p = v.split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) { return null; }
    return { y: p[0], m: p[1] - 1, d: p[2] };
  };
  var todayUTC = function () {
    var n = new Date();
    return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() };
  };
  var fmtDate = function (ts) {
    return new Date(ts).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
  };
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Cached per "from" currency for the lifetime of the page, so typing a new amount (or swapping)
  // doesn't re-fetch: only the first lookup for a given base currency hits the network.
  var currencyRateCache = {};
  var currencyReqId = 0;
  var getRates = function (from) {
    if (currencyRateCache[from]) { return Promise.resolve(currencyRateCache[from]); }
    return fetch('https://open.er-api.com/v6/latest/' + from)
      .then(function (r) { if (!r.ok) { throw new Error('bad response'); } return r.json(); })
      .then(function (data) {
        if (data.result !== 'success' || !data.rates) { throw new Error('bad data'); }
        currencyRateCache[from] = data;
        return data;
      });
  };
  var debounce = function (fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  };

  var ecoSource = null; // fuel economy converter: the box the visitor last typed in

  var handlers = {
    bmi: function () {
      var kg = weightKg(), cm = heightCm();
      if (bad(kg, cm)) { return err('Please enter your weight and height.'); }
      if (cm < 100 || cm > 250 || kg < 20 || kg > 400) { return err('Those values look out of range. Please check them.'); }
      var r = Calc.bmi(kg, cm);
      var pos = Math.max(0, Math.min(100, ((r.bmi - 15) / 25) * 100));
      out('<div class="stats">' + stat('Your BMI', fmt(r.bmi), r.cat) +
        stat('Healthy weight for your height', showWeight(r.lo) + ' to ' + showWeight(r.hi), 'BMI 18.5 to 24.9') + '</div>' +
        '<div class="scale" aria-hidden="true"><div class="seg s1"></div><div class="seg s2"></div><div class="seg s3"></div><div class="seg s4"></div>' +
        '<div class="mark" style="left:' + pos.toFixed(1) + '%"></div></div>' +
        '<div class="scale-l" aria-hidden="true"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div>' +
        '<p class="note">BMI is a screening measure. It does not distinguish muscle from fat, and it is less reliable for athletes, older adults and children.</p>');
    },

    calorie: function () {
      var kg = weightKg(), cm = heightCm(), age = num('age'), mult = parseFloat($('activity').value), sex = sexVal();
      if (bad(kg, cm, age)) { return err('Please fill in your age, weight and height.'); }
      var bmr = Calc.bmr(sex, kg, cm, age), tdee = bmr * mult;
      var floor = sex === 'male' ? 1500 : 1200;
      var rows = [['Extreme weight loss (not recommended)', -1000], ['Weight loss', -500], ['Mild weight loss', -250],
                  ['Maintain weight', 0], ['Mild weight gain', 250], ['Weight gain', 500]];
      var perWeek = function (d) {
        var kgWk = (Math.abs(d) * 7) / 7700;
        return d === 0 ? '-' : (d < 0 ? '-' : '+') + (imperial() ? fmt(kgWk / LB, 1) + ' lb' : fmt(kgWk, 2) + ' kg') + ' / week';
      };
      var body = rows.map(function (r) {
        var c = Math.round(tdee + r[1]);
        var low = c < floor;
        return '<tr' + (r[1] === 0 ? ' class="hl"' : '') + '><td>' + r[0] + '</td><td>' + fmt(c, 0) + ' kcal' +
          (low ? ' <span class="warn" title="Below the commonly recommended minimum">&#9888;</span>' : '') + '</td><td>' + perWeek(r[1]) + '</td></tr>';
      }).join('');
      out('<div class="stats">' + stat('Maintenance calories (TDEE)', fmt(tdee, 0) + ' kcal/day', 'Calories to keep your weight steady') +
        stat('Basal metabolic rate (BMR)', fmt(bmr, 0) + ' kcal/day', 'What your body burns at complete rest') + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Goal</th><th>Calories per day</th><th>Approx. change</th></tr></thead><tbody>' + body + '</tbody></table></div>' +
        '<p class="note">&#9888; marks targets below ' + fmt(floor, 0) + ' kcal, the level generally advised as a minimum without medical supervision. These are estimates: track your weight for 2-3 weeks and adjust.</p>');
    },

    macro: function () {
      var cal = num('cal'), meals = num('meals') || 3, split = $('diet').value.split(',').map(parseFloat);
      if (bad(cal)) { return err('Please enter your daily calorie target.'); }
      if (cal < 800 || cal > 8000) { return err('Please enter a daily calorie target between 800 and 8,000.'); }
      meals = Math.max(1, Math.min(10, Math.round(meals)));
      var m = Calc.macros(cal, [split[0] / 100, split[1] / 100, split[2] / 100], meals);
      out('<div class="stats">' + stat('Protein', fmt(m.p, 0) + ' g', split[0] + '% of calories') +
        stat('Carbohydrates', fmt(m.c, 0) + ' g', split[1] + '% of calories') +
        stat('Fat', fmt(m.f, 0) + ' g', split[2] + '% of calories') + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Per meal (' + meals + ' meals)</th><th>Protein</th><th>Carbs</th><th>Fat</th></tr></thead><tbody><tr><td>Grams</td><td>' +
        fmt(m.perMeal.p, 0) + ' g</td><td>' + fmt(m.perMeal.c, 0) + ' g</td><td>' + fmt(m.perMeal.f, 0) + ' g</td></tr></tbody></table></div>' +
        '<p class="note">Protein and carbs provide 4 calories per gram; fat provides 9.</p>');
    },

    bodyfat: function () {
      var sex = sexVal(), cm = heightCm(), neck = lenCm('neck'), waist = lenCm('waist'), hip = sex === 'female' ? lenCm('hip') : 0;
      if (bad(cm, neck, waist) || (sex === 'female' && bad(hip))) { return err('Please fill in every measurement.'); }
      if (sex === 'male' ? waist <= neck : waist + hip <= neck) { return err('Waist measurement must be larger than neck for this formula. Please re-measure.'); }
      var bf = Calc.bodyFat(sex, cm, neck, waist, hip);
      if (!isFinite(bf) || bf < 2 || bf > 60) { return err('The result is outside the range this method can estimate. Please re-check your measurements.'); }
      var kg = weightKg(), extra = '';
      if (!isNaN(kg) && kg > 0) {
        extra = stat('Fat mass', showWeight((kg * bf) / 100), 'of ' + showWeight(kg) + ' total') +
          stat('Lean mass', showWeight(kg - (kg * bf) / 100), 'Everything that is not fat');
      }
      out('<div class="stats">' + stat('Estimated body fat', fmt(bf) + '%', Calc.bfCategory(sex, bf)) + extra + '</div>' +
        '<p class="note">The Navy method is accurate to within a few percentage points for most people. Measure at the same time of day and keep the tape snug but not tight.</p>');
    },

    idealweight: function () {
      var sex = sexVal(), cm = heightCm();
      if (bad(cm)) { return err('Please enter your height.'); }
      if (cm < 122 || cm > 250) { return err('These formulas work for adults between about 4 ft (122 cm) and 8 ft 2 in (250 cm).'); }
      var r = Calc.ideal(sex, cm), keys = Object.keys(r), sum = 0;
      keys.forEach(function (k) { sum += r[k]; });
      var avg = sum / keys.length, b = Calc.bmi(avg, cm);
      var rows = keys.map(function (k) { return '<tr><td>' + k + ' (' + { Devine: 1974, Robinson: 1983, Miller: 1983, Hamwi: 1964 }[k] + ')</td><td>' + showWeight(r[k]) + '</td></tr>'; }).join('');
      out('<div class="stats">' + stat('Average of the four formulas', showWeight(avg), 'A reasonable midpoint') +
        stat('Healthy BMI range at your height', showWeight(b.lo) + ' to ' + showWeight(b.hi), 'BMI 18.5 to 24.9') + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Formula</th><th>Ideal weight</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        (cm < 152.4 ? '<p class="note">These formulas were designed for people over 5 ft (152 cm), so treat results as rough at your height.</p>' : '') +
        '<p class="note">"Ideal" weight formulas ignore frame size, muscle mass and age. Use them as a ballpark, not a target.</p>');
    },

    water: function () {
      var kg = weightKg(), ex = num('exercise'), hot = $('climate').value === 'hot';
      if (bad(kg)) { return err('Please enter your weight.'); }
      if (isNaN(ex) || ex < 0) { ex = 0; }
      var L = Calc.water(kg, ex, hot), lo = L * 0.9, hi = L * 1.1, oz = 33.814;
      var main = imperial() ? fmt(L * oz, 0) + ' fl oz' : fmt(L, 1) + ' L';
      var range = imperial() ? fmt(lo * oz, 0) + '-' + fmt(hi * oz, 0) + ' fl oz' : fmt(lo, 1) + '-' + fmt(hi, 1) + ' L';
      out('<div class="stats">' + stat('Daily fluid target', main, 'Range: ' + range) +
        stat('That is about', fmt((L * 1000) / 250, 0) + ' glasses', 'Of 250 ml (8.5 fl oz) each') + '</div>' +
        '<p class="note">This covers total fluids, including tea, coffee and the water in food (roughly 20% of intake). Pregnancy, breastfeeding, illness and some medications change your needs.</p>');
    },

    duedate: function () {
      var v = $('lmp').value, cycle = num('cycle');
      if (!v) { return err('Please enter the first day of your last period.'); }
      if (isNaN(cycle)) { cycle = 28; }
      if (cycle < 20 || cycle > 45) { return err('Cycle length should be between 20 and 45 days.'); }
      var p = v.split('-').map(Number), lmp = Date.UTC(p[0], p[1] - 1, p[2]);
      var n = new Date(), today = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
      var r = Calc.dueDate(lmp, cycle, today);
      if (r.daysSinceLmp < 0) { return err('That date is in the future. Please enter the first day of your last period.'); }
      if (r.daysSinceLmp > 300) { return err('That date is more than 300 days ago. Please double-check it.'); }
      var d = function (t) { return new Date(t).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }); };
      var tri = r.weeks < 14 ? 'First trimester' : r.weeks < 28 ? 'Second trimester' : 'Third trimester';
      var now = r.weeks < 0 ? '-' : r.weeks + ' weeks, ' + r.rem + ' days';
      out('<div class="stats">' + stat('Estimated due date', d(r.due), 'Only about 4% of babies arrive on this exact day') +
        stat('You are now', now, tri) + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Milestone</th><th>Approximate date</th></tr></thead><tbody>' +
        '<tr><td>Estimated ovulation / conception</td><td>' + d(r.ovulation) + '</td></tr>' +
        '<tr><td>Second trimester begins (week 14)</td><td>' + d(r.tri2) + '</td></tr>' +
        '<tr><td>Third trimester begins (week 28)</td><td>' + d(r.tri3) + '</td></tr>' +
        '<tr><td>Full term begins (week 39)</td><td>' + d(r.fullTerm) + '</td></tr>' +
        '<tr><td>Estimated due date (week 40)</td><td>' + d(r.due) + '</td></tr></tbody></table></div>' +
        '<p class="note">Your midwife or doctor may adjust this date after an ultrasound scan.</p>');
    },

    hrzones: function () {
      var age = num('age'), rest = num('rest'), f = $('formula').value;
      if (bad(age)) { return err('Please enter your age.'); }
      if (age < 10 || age > 100) { return err('Please enter an age between 10 and 100.'); }
      if (!isNaN(rest) && (rest < 30 || rest > 120)) { return err('Resting heart rate is usually between 30 and 120 bpm.'); }
      var r = Calc.zones(age, isNaN(rest) ? 0 : rest, f);
      var rows = r.zones.map(function (z) {
        return '<tr><td><strong>' + z.name + '</strong><br><span class="muted">' + z.desc + '</span></td><td>' + z.pct + '</td><td>' + z.lo + '-' + z.hi + ' bpm</td></tr>';
      }).join('');
      out('<div class="stats">' + stat('Estimated maximum heart rate', r.max + ' bpm', f === 'tanaka' ? 'Tanaka: 208 - 0.7 x age' : 'Classic: 220 - age') + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Zone</th><th>Intensity</th><th>Target heart rate</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="note">' + (r.karvonen ? 'Zones use the Karvonen (heart rate reserve) method with your resting heart rate.' : 'Add your resting heart rate for a more personal result (Karvonen method).') +
        ' Maximum heart rate varies a lot between individuals, so use how hard the effort feels as a cross-check.</p>');
    },

    percentage: function () {
      var mode = $('mode').value;
      if (mode === 'of') {
        var x = num('of_x'), y = num('of_y');
        if (isNaN(x) || isNaN(y)) { return err('Please fill in both numbers.'); }
        var r = Calc.percentOf(x, y);
        return out('<div class="stats">' + stat(fmt(x, 2) + '% of ' + fmt(y, 2), fmt(r, 2)) + '</div>' +
          '<p class="note">' + fmt(x, 2) + '% of ' + fmt(y, 2) + ' = (' + fmt(x, 2) + ' &divide; 100) &times; ' + fmt(y, 2) + ' = ' + fmt(r, 2) + '.</p>');
      }
      if (mode === 'what') {
        var px = num('what_x'), py = num('what_y');
        if (isNaN(px) || isNaN(py)) { return err('Please fill in both numbers.'); }
        if (py === 0) { return err('The whole (Y) cannot be zero.'); }
        var rp = Calc.whatPercent(px, py);
        return out('<div class="stats">' + stat(fmt(px, 2) + ' as a % of ' + fmt(py, 2), fmt(rp, 2) + '%') + '</div>' +
          '<p class="note">' + fmt(px, 2) + ' &divide; ' + fmt(py, 2) + ' &times; 100 = ' + fmt(rp, 2) + '%.</p>');
      }
      var cx = num('chg_x'), cy = num('chg_y');
      if (isNaN(cx) || isNaN(cy)) { return err('Please fill in both numbers.'); }
      if (cx === 0) { return err('The "from" value (X) cannot be zero.'); }
      var rc = Calc.percentChange(cx, cy);
      var word = rc > 0 ? 'increase' : rc < 0 ? 'decrease' : 'change';
      out('<div class="stats">' + stat('Change from ' + fmt(cx, 2) + ' to ' + fmt(cy, 2), (rc > 0 ? '+' : '') + fmt(rc, 2) + '%', 'A ' + fmt(Math.abs(rc), 2) + '% ' + word) + '</div>' +
        '<p class="note">(' + fmt(cy, 2) + ' &minus; ' + fmt(cx, 2) + ') &divide; ' + fmt(cx, 2) + ' &times; 100 = ' + fmt(rc, 2) + '%.</p>');
    },

    tip: function () {
      var bill = num('bill'), pct = num('tip_pct'), people = num('people') || 1;
      if (bad(bill)) { return err('Please enter the bill amount.'); }
      if (isNaN(pct) || pct < 0) { return err('Please enter a tip percent of 0 or more.'); }
      people = Math.max(1, Math.round(people));
      var r = Calc.tip(bill, pct, people);
      out('<div class="stats">' + stat('Tip', fmt(r.tip, 2)) + stat('Total bill', fmt(r.total, 2)) +
        stat('Per person', fmt(r.perPerson, 2), people > 1 ? 'Split ' + people + ' ways' : '') + '</div>' +
        (people > 1 ? '<p class="note">Tip per person: ' + fmt(r.tipPerPerson, 2) + '.</p>' : ''));
    },

    age: function () {
      var dob = parseDate('dob');
      if (!dob) { return err('Please enter your date of birth.'); }
      var asof = parseDate('asof') || todayUTC();
      var dobTs = Date.UTC(dob.y, dob.m, dob.d), refTs = Date.UTC(asof.y, asof.m, asof.d);
      if (dobTs > refTs) { return err('Date of birth cannot be after the "as of" date.'); }
      var r = Calc.age(dob.y, dob.m, dob.d, asof.y, asof.m, asof.d);
      out('<div class="stats">' + stat('Age', r.years + ' years, ' + r.months + ' months, ' + r.days + ' days') +
        stat('Next birthday', r.daysToNextBirthday === 0 ? 'Today!' : r.daysToNextBirthday + ' days', fmtDate(r.nextBirthday)) + '</div>' +
        '<div class="tablewrap"><table><tbody>' +
        '<tr><td>Born on a</td><td>' + WEEKDAYS[r.weekday] + '</td></tr>' +
        '<tr><td>Total days alive</td><td>' + fmt(r.totalDays, 0) + '</td></tr>' +
        '<tr><td>Total weeks alive</td><td>' + fmt(r.totalWeeks, 0) + '</td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">Calculated using calendar-accurate day arithmetic, as of ' + fmtDate(refTs) + '.</p>');
    },

    datediff: function () {
      var d1 = parseDate('date1'), d2 = parseDate('date2');
      if (!d1 || !d2) { return err('Please enter both dates.'); }
      var r = Calc.dateDiff(d1.y, d1.m, d1.d, d2.y, d2.m, d2.d);
      out('<div class="stats">' + stat('Time between dates', r.years + 'y ' + r.months + 'm ' + r.days + 'd') +
        stat('Total days', fmt(r.totalDays, 0)) + '</div>' +
        '<div class="tablewrap"><table><tbody>' +
        '<tr><td>Total weeks</td><td>' + fmt(r.totalWeeks, 0) + '</td></tr>' +
        '<tr><td>Total months (approx.)</td><td>' + fmt(r.totalMonths, 0) + '</td></tr>' +
        '</tbody></table></div>' +
        (r.swapped ? '<p class="note">The second date is earlier than the first, so this is the gap between them either way.</p>' : ''));
    },

    electricity: function () {
      var watts = num('watts'), hours = num('hours'), price = num('price'), days = num('days');
      if (bad(watts)) { return err('Please enter the appliance wattage.'); }
      if (isNaN(hours) || hours < 0) { return err('Please enter hours used per day (0 or more).'); }
      if (isNaN(price) || price < 0) { return err('Please enter a price per kWh of 0 or more.'); }
      if (isNaN(days) || days <= 0) { days = 30; }
      var r = Calc.electricity(watts, hours, price, days);
      out('<div class="stats">' + stat('Cost per day', fmt(r.costDay, 2), fmt(r.kwhDay, 2) + ' kWh') +
        stat('Cost per month', fmt(r.costMonth, 2), fmt(r.kwhMonth, 2) + ' kWh, ' + fmt(days, 0) + ' days') +
        stat('Cost per year', fmt(r.costYear, 2), fmt(r.kwhYear, 2) + ' kWh') + '</div>' +
        '<p class="note">kWh = (watts &divide; 1000) &times; hours used. Cost = kWh &times; your price per kWh.</p>');
    },

    evcharging: function () {
      var imp = imperial(), du = imp ? 'mi' : 'km', car = imp ? 'Gas' : 'Petrol';
      var dist = num(imp ? 'dist_mi' : 'dist_km'), eff = num(imp ? 'eff_mi' : 'eff_km');
      var rate = num('rate'), loss = num('loss'), kw = parseFloat($('charger').value), battery = num('battery');
      var carEff = num(imp ? 'mpg' : 'l100'), fuelPrice = num(imp ? 'fuel_gal' : 'fuel_l');
      if (bad(dist)) { return err('Please enter the distance you drive per month.'); }
      if (bad(eff)) { return err('Please enter your EV\'s efficiency in ' + du + '/kWh.'); }
      if (eff > 10) { return err('That efficiency looks too high. Most EVs manage 2-5 mi/kWh (3-8 km/kWh).'); }
      if (isNaN(rate) || rate < 0) { return err('Please enter a price per kWh of 0 or more.'); }
      if (bad(battery)) { return err('Please enter your battery size in kWh.'); }
      if (bad(carEff)) { return err(imp ? 'Please enter the gas car\'s fuel economy in mpg.' : 'Please enter the petrol car\'s fuel use in L/100 km.'); }
      if (isNaN(fuelPrice) || fuelPrice < 0) { return err(imp ? 'Please enter a gas price per gallon of 0 or more.' : 'Please enter a petrol price per litre of 0 or more.'); }
      if (isNaN(loss) || loss < 0 || loss > 30) { loss = 12; }
      var fuelUsed = imp ? dist / carEff : (dist * carEff) / 100;
      var r = Calc.evCharging(dist, eff, rate, loss, kw, battery, fuelUsed, fuelPrice);
      var h = Math.floor(r.chargeHours), m = Math.round((r.chargeHours - h) * 60);
      if (m === 60) { h++; m = 0; }
      var saveNote = r.savings >= 0 ? fmt(r.savings * 12, 2) + ' per year' : 'The ' + car.toLowerCase() + ' car is cheaper at these prices';
      out('<div class="stats">' + stat('Home charging per month', fmt(r.evCost, 2), fmt(r.kwhWall, 1) + ' kWh from the wall') +
        stat(car + ' car per month', fmt(r.gasCost, 2), fmt(fuelUsed, 1) + (imp ? ' gallons' : ' litres')) +
        stat(r.savings >= 0 ? 'You save per month' : 'Extra cost per month', fmt(Math.abs(r.savings), 2), saveNote) +
        stat('Full charge (empty to 100%)', h + ' h ' + m + ' min', 'At ' + fmt(kw, 1) + ' kW with ' + fmt(loss, 0) + '% loss') + '</div>' +
        '<div class="tablewrap"><table><tbody>' +
        '<tr><td>Energy used at the wheel</td><td>' + fmt(r.kwhWheel, 1) + ' kWh</td></tr>' +
        '<tr><td>Energy drawn from the wall</td><td>' + fmt(r.kwhWall, 1) + ' kWh</td></tr>' +
        '<tr><td>Electric cost per ' + du + '</td><td>' + fmt(r.evPerDist, 3) + '</td></tr>' +
        '<tr><td>' + car + ' cost per ' + du + '</td><td>' + fmt(r.gasPerDist, 3) + '</td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">kWh from the wall = (distance &divide; efficiency) &divide; (1 &minus; ' + fmt(loss, 0) + '% loss). Cost = kWh &times; your price per kWh. Real-world efficiency drops in cold weather and at high speed.</p>');
    },

    fueltrip: function () {
      var imp = imperial(), du = imp ? 'mi' : 'km';
      var dist = num(imp ? 'dist_mi' : 'dist_km'), eco = num(imp ? 'mpg' : 'l100'), price = num(imp ? 'fuel_gal' : 'fuel_l');
      if (bad(dist)) { return err('Please enter the trip distance.'); }
      if (bad(eco)) { return err(imp ? 'Please enter your fuel economy in mpg.' : 'Please enter your fuel use in L/100 km.'); }
      if (isNaN(price) || price < 0) { return err('Please enter a fuel price of 0 or more.'); }
      var fuel = Calc.fuelUsed(dist, eco, imp), cost = fuel * price;
      out('<div class="stats">' + stat('Trip fuel cost', fmt(cost, 2), 'For ' + fmt(dist, 0) + ' ' + du) +
        stat('Fuel used', fmt(fuel, 1) + (imp ? ' gallons' : ' litres'), fmt(cost / dist, 3) + ' per ' + du) + '</div>' +
        '<p class="note">' + (imp ? 'Fuel = ' + fmt(dist, 0) + ' mi &divide; ' + fmt(eco, 1) + ' mpg'
          : 'Fuel = ' + fmt(dist, 0) + ' km &times; ' + fmt(eco, 1) + ' L/100 km &divide; 100') +
        ' = ' + fmt(fuel, 2) + (imp ? ' gal' : ' L') + '. Cost = fuel &times; ' + fmt(price, 2) + ' = ' + fmt(cost, 2) + '. Double it for a return trip.</p>');
    },

    mpgconvert: function () {
      var ids = ['mpg_us', 'mpg_uk', 'l100', 'kml'];
      var from = ecoSource || ids.filter(function (id) { return !isNaN(num(id)); })[0];
      if (!from) { return err('Please enter a fuel economy figure in any one box.'); }
      var v = num(from);
      if (isNaN(v)) {
        ids.forEach(function (id) { if (id !== from) { $(id).value = ''; } });
        res.hidden = true; res.innerHTML = '';
        return;
      }
      if (v <= 0) { return err('Please enter a number greater than 0.'); }
      var r = Calc.fuelEconomy(v, from);
      ids.forEach(function (id) { if (id !== from) { $(id).value = String(Math.round(r[id] * 100) / 100); } });
      out('<p class="note">1 US gallon = 3.785 litres, 1 UK gallon = 4.546 litres, 1 mile = 1.609 km. L/100 km = 235.21 &divide; mpg (US) = 282.48 &divide; mpg (UK), and km/L = 100 &divide; L/100 km. Lower L/100 km means better economy; higher mpg or km/L means better economy.</p>');
    },

    carloan: function () {
      var p = num('amount'), apr = num('apr'), n = num('term');
      if (bad(p)) { return err('Please enter the loan amount.'); }
      if (isNaN(apr) || apr < 0 || apr > 50) { return err('Please enter an APR between 0 and 50%.'); }
      if (bad(n) || n > 120) { return err('Please enter a loan term between 1 and 120 months.'); }
      n = Math.round(n);
      var r = Calc.loan(p, apr, n);
      var rows = r.years.map(function (y) {
        return '<tr><td>Year ' + y.year + '</td><td>' + fmt(y.principal, 2) + '</td><td>' + fmt(y.interest, 2) + '</td><td>' + fmt(y.balance, 2) + '</td></tr>';
      }).join('');
      out('<div class="stats">' + stat('Monthly payment', fmt(r.payment, 2), n + ' payments') +
        stat('Total interest', fmt(r.interest, 2), fmt((r.interest / p) * 100, 1) + '% of the amount borrowed') +
        stat('Total repaid', fmt(r.total, 2), 'Loan plus interest') + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Year</th><th>Principal paid</th><th>Interest paid</th><th>Balance left</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="note">Payment = P &times; r &divide; (1 &minus; (1 + r)<sup>&minus;n</sup>), where P is the loan, r is the APR &divide; 12 &divide; 100 and n is the number of months. Excludes fees, taxes and add-ons unless you include them in the loan amount.</p>');
    },

    carlease: function () {
      var price = num('price'), resPct = num('residual'), n = num('term'), mode = $('mode').value;
      var mf = mode === 'apr' ? num('lease_apr') / 2400 : num('mf');
      if (bad(price)) { return err('Please enter the vehicle price.'); }
      if (bad(resPct) || resPct >= 100) { return err('Please enter a residual value between 1% and 99%.'); }
      if (isNaN(mf) || mf < 0) { return err(mode === 'apr' ? 'Please enter an APR of 0 or more.' : 'Please enter a money factor of 0 or more.'); }
      if (mf > 0.02) { return err('That money factor looks too high. Money factors are small decimals such as 0.00250 (about 6% APR).'); }
      if (bad(n) || n > 96) { return err('Please enter a lease term between 1 and 96 months.'); }
      n = Math.round(n);
      var r = Calc.lease(price, resPct, mf, n);
      out('<div class="stats">' + stat('Monthly payment (before tax)', fmt(r.payment, 2), n + ' payments') +
        stat('Depreciation portion', fmt(r.depreciation, 2), 'Per month') +
        stat('Finance fee portion', fmt(r.finance, 2), 'Per month') + '</div>' +
        '<div class="tablewrap"><table><tbody>' +
        '<tr><td>Residual value at lease end</td><td>' + fmt(r.residual, 2) + '</td></tr>' +
        '<tr><td>Money factor (APR equivalent)</td><td>' + mf.toFixed(5) + ' (' + fmt(mf * 2400, 2) + '%)</td></tr>' +
        '<tr><td>Total of monthly payments</td><td>' + fmt(r.total, 2) + '</td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">Depreciation = (price &minus; residual) &divide; months. Finance fee = (price + residual) &times; money factor. Sales tax, fees and any down payment are not included.</p>');
    },

    costpermile: function () {
      var imp = imperial(), du = imp ? 'mi' : 'km', mode = $('mode').value;
      var dist = num(imp ? 'dist_mi' : 'dist_km');
      var fuel = num('fuel'), ins = num('insurance'), maint = num('maint');
      var own = mode === 'depr' ? num('depr') / 12 : num('payment');
      if (bad(dist)) { return err('Please enter the distance you drive per month.'); }
      var vals = [fuel, ins, maint, own];
      for (var i = 0; i < vals.length; i++) { if (isNaN(vals[i]) || vals[i] < 0) { return err('Please fill in every cost (enter 0 for any that don\'t apply).'); } }
      var r = Calc.costPerDistance(dist, [['Fuel or charging', fuel], ['Insurance', ins], ['Maintenance', maint],
        [mode === 'depr' ? 'Depreciation' : 'Loan or lease payment', own]]);
      var rows = r.parts.map(function (p) {
        return '<tr><td>' + p.label + '</td><td>' + fmt(p.monthly, 2) + '</td><td>' + fmt(p.perDist, 3) + '</td><td>' + fmt(p.share, 0) + '%</td></tr>';
      }).join('');
      out('<div class="stats">' + stat('Cost per ' + du, fmt(r.perDist, 3), 'All costs combined') +
        stat('Total per month', fmt(r.monthly, 2), fmt(dist, 0) + ' ' + du + ' a month') +
        stat('Total per year', fmt(r.annual, 2)) + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Cost</th><th>Per month</th><th>Per ' + du + '</th><th>Share</th></tr></thead><tbody>' + rows +
        '<tr class="hl"><td>Total</td><td>' + fmt(r.monthly, 2) + '</td><td>' + fmt(r.perDist, 3) + '</td><td>100%</td></tr></tbody></table></div>' +
        '<p class="note">Cost per ' + du + ' = total monthly cost &divide; ' + du + ' driven per month.' + (mode === 'depr' ? ' Depreciation per year is divided by 12.' : '') + ' Parking, tolls, tax and registration are not included unless you add them to one of the costs.</p>');
    },

    depreciation: function () {
      var price = num('price'), first = num('first'), later = num('later'), years = num('years');
      if (bad(price)) { return err('Please enter the purchase price.'); }
      if (isNaN(first) || first < 0 || first >= 100 || isNaN(later) || later < 0 || later >= 100) { return err('Please enter depreciation rates between 0% and 99%.'); }
      if (bad(years) || years > 25) { return err('Please enter between 1 and 25 years.'); }
      years = Math.round(years);
      var r = Calc.depreciation(price, first, later, years);
      var rows = r.rows.map(function (y) {
        return '<tr' + (y.year === years ? ' class="hl"' : '') + '><td>Year ' + y.year + '</td><td>' + fmt(y.lost, 2) + '</td><td>' + fmt(y.end, 2) + '</td><td>' + fmt((y.end / price) * 100, 0) + '%</td></tr>';
      }).join('');
      out('<div class="stats">' + stat('Estimated value after ' + years + (years === 1 ? ' year' : ' years'), fmt(r.value, 2), fmt((r.value / price) * 100, 0) + '% of the purchase price') +
        stat('Total value lost', fmt(r.lost, 2), fmt(r.lostPct, 1) + '% of the purchase price') + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Year</th><th>Value lost</th><th>Value at year end</th><th>% of price</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="note">Each year the car loses a percentage of its value at the start of that year: ' + fmt(first, 0) + '% in year 1, then ' + fmt(later, 0) + '% a year. Real values depend on make, mileage, condition and the market.</p>');
    },

    evvsgas: function () {
      var imp = imperial(), du = imp ? 'mi' : 'km', car = imp ? 'Gas' : 'Petrol';
      var dist = num(imp ? 'dist_mi' : 'dist_km'), eff = num(imp ? 'eff_mi' : 'eff_km'), rate = num('rate');
      var eco = num(imp ? 'mpg' : 'l100'), price = num(imp ? 'fuel_gal' : 'fuel_l');
      var evM = num('ev_maint'), gasM = num('gas_maint');
      if (bad(dist)) { return err('Please enter the distance you drive per month.'); }
      if (bad(eff)) { return err('Please enter the EV\'s efficiency in ' + du + '/kWh.'); }
      if (eff > 10) { return err('That efficiency looks too high. Most EVs manage 2-5 mi/kWh (3-8 km/kWh).'); }
      if (isNaN(rate) || rate < 0) { return err('Please enter a price per kWh of 0 or more.'); }
      if (bad(eco)) { return err(imp ? 'Please enter the gas car\'s fuel economy in mpg.' : 'Please enter the petrol car\'s fuel use in L/100 km.'); }
      if (isNaN(price) || price < 0) { return err('Please enter a fuel price of 0 or more.'); }
      if (isNaN(evM) || evM < 0 || isNaN(gasM) || gasM < 0) { return err('Please enter a monthly maintenance estimate for each car (0 or more).'); }
      var r = Calc.evVsGas(dist, eff, rate, evM, eco, price, gasM, imp);
      var cheaper = r.diff > 0 ? 'The EV is cheaper' : r.diff < 0 ? 'The ' + car.toLowerCase() + ' car is cheaper' : 'Both cost the same';
      out('<div class="stats">' + stat('EV per month', fmt(r.ev, 2), fmt(r.ev * 12, 2) + ' per year') +
        stat(car + ' car per month', fmt(r.gas, 2), fmt(r.gas * 12, 2) + ' per year') +
        stat('Difference per month', fmt(Math.abs(r.diff), 2), cheaper + ', ' + fmt(Math.abs(r.diff) * 12, 2) + ' per year') + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Monthly cost</th><th>EV</th><th>' + car + ' car</th></tr></thead><tbody>' +
        '<tr><td>Energy</td><td>' + fmt(r.evEnergy, 2) + ' (' + fmt(r.kwh, 1) + ' kWh)</td><td>' + fmt(r.gasFuel, 2) + ' (' + fmt(r.fuel, 1) + (imp ? ' gal' : ' L') + ')</td></tr>' +
        '<tr><td>Maintenance</td><td>' + fmt(evM, 2) + '</td><td>' + fmt(gasM, 2) + '</td></tr>' +
        '<tr class="hl"><td>Total</td><td>' + fmt(r.ev, 2) + '</td><td>' + fmt(r.gas, 2) + '</td></tr>' +
        '</tbody></table></div>' +
        '<p class="note">EV energy = distance &divide; efficiency &times; price per kWh. ' + car + ' fuel = ' + (imp ? 'miles &divide; mpg' : 'km &times; L/100 km &divide; 100') + ' &times; fuel price. Charging losses are not included; the EV Home Charging Cost Calculator adds them.</p>');
    },

    roadtrip: function () {
      var imp = imperial(), du = imp ? 'mi' : 'km';
      var eco = num(imp ? 'mpg' : 'l100'), price = num(imp ? 'fuel_gal' : 'fuel_l');
      var inputs = document.querySelectorAll('.leg-dist'), legs = [], nums = [];
      for (var i = 0; i < inputs.length; i++) {
        var v = inputs[i].value === '' ? NaN : parseFloat(inputs[i].value);
        if (isNaN(v)) { continue; }
        if (v <= 0) { return err('Leg ' + (i + 1) + ': please enter a distance greater than 0.'); }
        legs.push(v); nums.push(i + 1);
      }
      if (bad(eco)) { return err(imp ? 'Please enter your fuel economy in mpg.' : 'Please enter your fuel use in L/100 km.'); }
      if (isNaN(price) || price < 0) { return err('Please enter a fuel price of 0 or more.'); }
      if (!legs.length) { return err('Please enter the distance of at least one leg.'); }
      var r = Calc.roadTrip(legs, eco, price, imp), fu = imp ? ' gal' : ' L';
      var rows = r.legs.map(function (l, k) {
        return '<tr><td>Leg ' + nums[k] + '</td><td>' + fmt(l.distance, 0) + ' ' + du + '</td><td>' + fmt(l.fuel, 1) + fu + '</td><td>' + fmt(l.cost, 2) + '</td></tr>';
      }).join('');
      out('<div class="stats">' + stat('Total trip fuel cost', fmt(r.cost, 2), legs.length + (legs.length === 1 ? ' leg' : ' legs')) +
        stat('Total distance', fmt(r.distance, 0) + ' ' + du, fmt(r.fuel, 1) + (imp ? ' gallons' : ' litres') + ' of fuel') + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Leg</th><th>Distance</th><th>Fuel</th><th>Cost</th></tr></thead><tbody>' + rows +
        '<tr class="hl"><td>Total</td><td>' + fmt(r.distance, 0) + ' ' + du + '</td><td>' + fmt(r.fuel, 1) + fu + '</td><td>' + fmt(r.cost, 2) + '</td></tr></tbody></table></div>' +
        '<p class="note">Each leg: fuel = ' + (imp ? 'miles &divide; mpg' : 'km &times; L/100 km &divide; 100') + ', cost = fuel &times; ' + fmt(price, 2) + '. Empty legs are skipped.</p>');
    },

    tiresize: function () {
      var imp = imperial();
      var a = Calc.tireParse($('stock').value), b = Calc.tireParse($('fitted').value);
      if (!a) { return err('Please enter the stock tire size in the usual format, for example 225/45R17.'); }
      if (!b) { return err('Please enter the new tire size in the usual format, for example 245/40R18.'); }
      var r = Calc.tireCompare(a, b), sp = imp ? 'mph' : 'km/h';
      var dia = function (mm) { return imp ? fmt(mm / 25.4, 2) + ' in' : fmt(mm, 1) + ' mm'; };
      var speeds = imp ? [20, 30, 40, 50, 60, 70, 80] : [30, 50, 80, 100, 120, 130];
      var rows = speeds.map(function (s) { return '<tr><td>' + s + ' ' + sp + '</td><td>' + fmt(s * r.ratio, 1) + ' ' + sp + '</td></tr>'; }).join('');
      var dir = r.errorPct > 0 ? 'faster than your speedometer shows' : r.errorPct < 0 ? 'slower than your speedometer shows' : 'exactly what your speedometer shows';
      var warn = Math.abs(r.errorPct) > 3 ? ' <span class="warn">More than 3% is usually considered too big a change; check with a tire fitter.</span>' : '';
      out('<div class="stats">' + stat('Speedometer error', (r.errorPct > 0 ? '+' : '') + fmt(r.errorPct, 2) + '%', 'You are actually going ' + dir) +
        stat('Stock diameter', dia(r.stockDia), 'Circumference ' + dia(r.stockDia * Math.PI)) +
        stat('New diameter', dia(r.newDia), 'Circumference ' + dia(r.newDia * Math.PI)) + '</div>' +
        '<div class="tablewrap"><table><thead><tr><th>Speedometer shows</th><th>Actual speed</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<p class="note">Diameter = 2 &times; width &times; aspect ratio &divide; 100 + wheel size &times; 25.4 mm. Actual speed = shown speed &times; new diameter &divide; stock diameter. Your odometer is off by the same ' + fmt(Math.abs(r.errorPct), 2) + '%.' + warn + '</p>');
    },

    scientific: function () {
      var exprEl = $('expr'), expr = exprEl ? exprEl.value : '';
      var v;
      try {
        v = Calc.evalExpr(expr);
      } catch (e) {
        return err(e.message);
      }
      // The answer replaces the expression itself (like a real calculator), so you can keep
      // building on it (e.g. type "+5" and hit = again), rather than reading it from a separate box.
      res.hidden = true;
      res.innerHTML = '';
      exprEl.value = fmtSci(v);
      exprEl.focus();
    },

    currency: function () {
      var amountResult = $('amountResult'), rateNote = $('rateNote');
      var from = $('from').value, to = $('to').value, amount = num('amount');
      res.hidden = true;
      res.innerHTML = '';
      if (isNaN(amount)) { amountResult.innerHTML = '&nbsp;'; rateNote.innerHTML = '&nbsp;'; return; }
      if (amount <= 0) { return err('Please enter an amount greater than 0.'); }
      if (from === to) {
        amountResult.textContent = fmt(amount, 2) + ' ' + to;
        rateNote.textContent = 'Same currency on both sides, so the amount is unchanged.';
        return;
      }
      var myReq = ++currencyReqId;
      if (!currencyRateCache[from]) {
        amountResult.textContent = 'Fetching rate…';
        rateNote.innerHTML = '&nbsp;';
      }
      getRates(from)
        .then(function (data) {
          if (myReq !== currencyReqId) { return; } // superseded by a newer keystroke/selection
          if (!(to in data.rates)) { throw new Error('missing rate'); }
          var rate = data.rates[to], converted = Calc.convert(amount, rate);
          amountResult.textContent = fmt(converted, 2) + ' ' + to;
          var updated = (data.time_last_update_utc || 'recently').replace(/\s*\+0000$/, '');
          rateNote.textContent = 'Rates last updated ' + updated + '.';
        })
        .catch(function () {
          if (myReq !== currencyReqId) { return; }
          amountResult.innerHTML = '&nbsp;';
          rateNote.innerHTML = '&nbsp;';
          err('Could not fetch live exchange rates right now. Please check your connection and try again.');
        });
    }
  };

  var sync = function () {
    form.setAttribute('data-unit', unit());
    var range = document.querySelectorAll('input[type="range"]');
    for (var ri = 0; ri < range.length; ri++) {
      var o = $(range[ri].id + '_out');
      if (o) { o.textContent = range[ri].value; }
    }
    var fem = document.querySelectorAll('.only-female');
    for (var i = 0; i < fem.length; i++) { fem[i].hidden = sexVal() !== 'female'; }
    var modeSel = $('mode');
    if (modeSel) {
      var groups = document.querySelectorAll('[data-mode-group]');
      for (var j = 0; j < groups.length; j++) {
        groups[j].hidden = groups[j].getAttribute('data-mode-group') !== modeSel.value;
      }
    }
  };

  // Quick-select chips (e.g. tip percent presets): clicking one fills the target input.
  var chips = document.querySelectorAll('.chip');
  for (var c = 0; c < chips.length; c++) {
    chips[c].addEventListener('click', function () {
      var target = $(this.getAttribute('data-target'));
      if (!target) { return; }
      target.value = this.getAttribute('data-val');
      var active = document.querySelectorAll('.chip[data-target="' + this.getAttribute('data-target') + '"]');
      for (var k = 0; k < active.length; k++) { active[k].setAttribute('aria-pressed', active[k] === this ? 'true' : 'false'); }
    });
  }

  // Scientific calculator key pad: appends to #expr, with AC (clear) and DEL (backspace) actions.
  var keys = document.querySelectorAll('.key[data-k]');
  for (var kx = 0; kx < keys.length; kx++) {
    keys[kx].addEventListener('click', function () {
      var expr = $('expr');
      if (!expr) { return; }
      var k = this.getAttribute('data-k');
      if (k === 'AC') { expr.value = ''; }
      else if (k === 'DEL') { expr.value = expr.value.slice(0, -1); }
      else { expr.value += k; }
      expr.focus();
    });
  }
  // Currency converter: recalculate live as the amount or currencies change, not just on submit.
  if (kind === 'currency' && $('amount')) {
    var liveCurrency = debounce(function () { handlers.currency(); }, 300);
    $('amount').addEventListener('input', liveCurrency);
    $('from').addEventListener('change', function () { handlers.currency(); });
    $('to').addEventListener('change', function () { handlers.currency(); });
  }

  // Fuel economy converter: typing in any box converts into the other three.
  if (kind === 'mpgconvert') {
    ['mpg_us', 'mpg_uk', 'l100', 'kml'].forEach(function (id) {
      $(id).addEventListener('input', function () { ecoSource = id; handlers.mpgconvert(); });
    });
    form.addEventListener('reset', function () { ecoSource = null; });
  }

  // Road trip: add and remove leg rows. Each row keeps a unique id so its label stays linked.
  var legsWrap = $('legs');
  if (legsWrap) {
    var legCount = legsWrap.querySelectorAll('.leg').length;
    var renumber = function () {
      var rows = legsWrap.querySelectorAll('.leg');
      for (var i = 0; i < rows.length; i++) {
        rows[i].querySelector('.leg-n').textContent = i + 1;
        var rm = rows[i].querySelector('.leg-remove');
        rm.setAttribute('aria-label', 'Remove leg ' + (i + 1));
        rm.hidden = rows.length === 1;
      }
    };
    $('addLeg').addEventListener('click', function () {
      var rows = legsWrap.querySelectorAll('.leg');
      var row = rows[rows.length - 1].cloneNode(true), id = 'leg_' + (++legCount);
      row.querySelector('label').setAttribute('for', id);
      var input = row.querySelector('input');
      input.id = id; input.value = '';
      legsWrap.appendChild(row);
      renumber();
      input.focus();
    });
    legsWrap.addEventListener('click', function (e) {
      var rm = e.target.closest ? e.target.closest('.leg-remove') : null;
      if (!rm || legsWrap.querySelectorAll('.leg').length === 1) { return; }
      rm.closest('.leg').remove();
      renumber();
    });
    renumber();
  }

  // Currency converter: swap the two currencies.
  var swapBtn = $('swap');
  if (swapBtn) {
    swapBtn.addEventListener('click', function () {
      var from = $('from'), to = $('to');
      var t = from.value; from.value = to.value; to.value = t;
      if (handlers[kind]) { handlers[kind](); }
    });
  }

  // Scientific calculator: toggle between simple and scientific keypads.
  var sciToggle = $('sciToggle');
  if (sciToggle) {
    sciToggle.addEventListener('click', function () {
      var on = sciToggle.getAttribute('aria-pressed') !== 'true';
      sciToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      sciToggle.textContent = on ? 'Simple' : 'Scientific';
      var keysEl = document.querySelector('.keys');
      if (keysEl) { keysEl.classList.toggle('sci', on); }
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (handlers[kind]) { handlers[kind](); }
  });
  form.addEventListener('reset', function () {
    res.hidden = true;
    res.innerHTML = '';
    if (kind === 'currency') { setTimeout(function () { handlers.currency(); }, 0); }
    setTimeout(sync, 0);
  });
  form.addEventListener('input', function (e) { if (e.target.type === 'range') { sync(); } });
  form.addEventListener('change', function (e) { if (e.target.id === 'unit' || e.target.id === 'sex' || e.target.id === 'mode') { sync(); } });
  sync();
  if (kind === 'currency' && handlers.currency) { handlers.currency(); }
})(typeof window !== 'undefined' ? window : globalThis);
