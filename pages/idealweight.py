from helpers import *

PAGE = dict(
    slug="ideal-weight-calculator",
    calc="idealweight",
    icon="🎯",
    nav="Ideal Weight Calculator",
    tile="See your ideal weight using four classic formulas, alongside your healthy BMI range.",
    title="Ideal Weight Calculator: Devine, Robinson, Miller and Hamwi",
    desc="Free ideal weight calculator. Compare the Devine, Robinson, Miller and Hamwi formulas for your height and sex, plus your healthy BMI weight range.",
    h1="Ideal Weight Calculator",
    intro="Enter your sex and height to see your ideal body weight according to four well-known formulas.",
    form=form(unit_toggle() + sex_field() + height_field(), "Calculate ideal weight"),
    article="""
<h2>Where "ideal weight" formulas come from</h2>
<p>Ideal body weight formulas were not created to say what you should look like. The first, the Hamwi formula from 1964, was a rule of thumb for doctors. The Devine formula (1974) was developed to help calculate drug doses, and the Robinson (1983) and Miller (1983) formulas refined the numbers using other data. All four use the same idea: start from a base weight at a height of 5 feet, then add a set amount for every inch above 5 feet.</p>

<h2>The four formulas</h2>
<p>Below, weight is in kilograms and height is measured in inches over 5 feet (60 inches).</p>
<div class="tablewrap"><table>
<thead><tr><th>Formula</th><th>Men</th><th>Women</th></tr></thead>
<tbody>
<tr><td>Hamwi (1964)</td><td>48.0 + 2.7 kg per inch</td><td>45.5 + 2.2 kg per inch</td></tr>
<tr><td>Devine (1974)</td><td>50.0 + 2.3 kg per inch</td><td>45.5 + 2.3 kg per inch</td></tr>
<tr><td>Robinson (1983)</td><td>52.0 + 1.9 kg per inch</td><td>49.0 + 1.7 kg per inch</td></tr>
<tr><td>Miller (1983)</td><td>56.2 + 1.41 kg per inch</td><td>53.1 + 1.36 kg per inch</td></tr>
</tbody></table></div>
<p>The results differ by several kilograms because each formula was built from different data. That spread is a useful reminder that there is no single "correct" number: a range is more honest.</p>

<h2>Ideal weight vs healthy BMI range</h2>
<p>The calculator also shows the weight range that corresponds to a BMI of 18.5 to 24.9 at your height. This range is wider than the formula results, and for many people it is the more practical target. Two people of the same height can both be at a healthy weight while differing by 10 kg or more because of frame size and muscle mass.</p>

<h2>What these formulas leave out</h2>
<p>None of the formulas account for age, frame size, muscle mass or body composition. A bodybuilder and a sedentary person of the same height and sex will get identical results. The formulas were also based on data from adults of average height, so they become less reliable for people shorter than about 5 feet or much taller than 6 feet 5 inches. Use them as a general reference alongside the <a href="/fitness/bmi-calculator/">BMI calculator</a>, your waist measurement and, most importantly, how you feel and what your doctor says.</p>
""",
    faqs=[
        ("Which ideal weight formula is best?", "None is universally best. Devine is the most widely used in clinical settings, while Miller tends to give higher values. Looking at the range across all four is more useful than picking one."),
        ("Is ideal body weight the same as healthy weight?", "Not exactly. Ideal weight is a single formula estimate, while a healthy weight range (based on BMI) allows for natural variation in build. Many people are healthy at weights above or below their 'ideal' figure."),
        ("Why are the results different for men and women?", "On average, men have more muscle and denser bones at the same height, so the formulas give men a higher base weight and a larger increase per inch."),
        ("Do these formulas work for teenagers?", "No. They are for adults. Teenagers are still growing and should be assessed using growth charts by a healthcare professional."),
    ],
)
