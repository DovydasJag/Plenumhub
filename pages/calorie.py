from helpers import *

PAGE = dict(
    slug="calorie-calculator",
    calc="calorie",
    icon="🔥",
    nav="Calorie Calculator",
    tile="Work out your maintenance calories and how much to eat to lose or gain weight.",
    title="Calorie Calculator: Daily Calories to Lose, Maintain or Gain Weight",
    desc="Free calorie calculator using the Mifflin-St Jeor equation. Find your BMR, maintenance calories (TDEE) and daily targets for weight loss or gain.",
    h1="Calorie Calculator",
    intro="Estimate how many calories you burn each day and how many to eat to lose, maintain or gain weight.",
    form=form(unit_toggle() + sex_field() + age_field() + weight_field() + height_field() + activity_field(), "Calculate calories"),
    article="""
<h2>How this calorie calculator works</h2>
<p>The calculator works in two steps. First it estimates your <strong>basal metabolic rate (BMR)</strong>, the calories your body burns at complete rest to keep you breathing, circulating blood and running your organs. It uses the Mifflin-St Jeor equation, which studies have found to be one of the more accurate predictors for most adults:</p>
<ul>
<li><strong>Men:</strong> BMR = 10 &times; weight (kg) + 6.25 &times; height (cm) &minus; 5 &times; age + 5</li>
<li><strong>Women:</strong> BMR = 10 &times; weight (kg) + 6.25 &times; height (cm) &minus; 5 &times; age &minus; 161</li>
</ul>
<p>Second, it multiplies your BMR by an activity factor, from 1.2 for a mostly sedentary day up to 1.9 for a very physical job combined with hard training. The result is your <strong>total daily energy expenditure (TDEE)</strong>, or maintenance calories: the amount you can eat to stay at the same weight.</p>

<h2>How many calories to lose weight</h2>
<p>To lose weight you need to eat fewer calories than you burn. A pound of body fat holds roughly 3,500 calories (about 7,700 per kilogram), so a daily deficit of 500 calories produces roughly 1 lb (0.45 kg) of loss per week. A deficit of 250 calories is gentler and easier to sustain. Very large deficits tend to cost muscle, energy and mood, and they are hard to keep up.</p>
<p>The calculator flags any target below 1,500 kcal for men or 1,200 kcal for women. These are commonly cited minimums for adults without medical supervision, so do not eat below them unless a doctor advises it.</p>

<h2>How many calories to gain weight</h2>
<p>For gaining, aim for a small surplus of 250 to 500 calories a day, combined with strength training and enough protein. A small surplus gives your body the energy to build muscle without adding much fat. Bigger surpluses mostly add fat.</p>

<h2>Why your real number may differ</h2>
<p>Any formula is an average. Two people of the same age, size and sex can differ by 200 to 300 calories a day because of muscle mass, genetics, sleep, stress and how much they fidget or walk through the day. The best approach is to use the result as a starting point, eat that amount consistently for two to three weeks, and watch what your weight does. If it does not move the way you expected, adjust by 100 to 200 calories.</p>
<p>Once you have a target, use our <a href="/macro-calculator/">macro calculator</a> to split it into protein, carbohydrates and fat.</p>
""",
    faqs=[
        ("What is the difference between BMR and TDEE?", "BMR is what you burn at complete rest. TDEE is BMR plus the calories you burn through daily movement and exercise, so it is the number that matters for planning what to eat."),
        ("Which activity level should I choose?", "Choose based on your typical week, not your best one. If you sit most of the day and work out three times a week, 'lightly active' or 'moderately active' is usually right. People often overestimate their activity, so when unsure pick the lower option."),
        ("Is the Mifflin-St Jeor equation accurate?", "It is considered one of the best general-purpose equations and is typically within about 10% of measured values for most adults. It is less accurate for very lean, very muscular or very obese people."),
        ("How fast can I safely lose weight?", "A loss of about 0.5 to 1 kg (1 to 2 lb) per week is generally considered safe and sustainable for most people. If you have a lot to lose you may lose faster at first, but talk to your doctor before aiming for more."),
    ],
)
