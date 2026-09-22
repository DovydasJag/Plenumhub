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
  var sexVal = function () { return $('sex') ? $('sex').value : 'male'; };

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
    }
  };

  var sync = function () {
    form.setAttribute('data-unit', unit());
    var fem = document.querySelectorAll('.only-female');
    for (var i = 0; i < fem.length; i++) { fem[i].hidden = sexVal() !== 'female'; }
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (handlers[kind]) { handlers[kind](); }
  });
  form.addEventListener('reset', function () { res.hidden = true; res.innerHTML = ''; setTimeout(sync, 0); });
  form.addEventListener('change', function (e) { if (e.target.id === 'unit' || e.target.id === 'sex') { sync(); } });
  sync();
})(typeof window !== 'undefined' ? window : globalThis);
