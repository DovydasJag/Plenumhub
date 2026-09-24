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
