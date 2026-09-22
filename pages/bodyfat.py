from helpers import *

FIELDS = (
    unit_toggle() + sex_field() + height_field()
    + length_field("neck", "Neck")
    + length_field("waist", "Waist (at navel)")
    + length_field("hip", "Hips (widest point)", "only-female")
    + weight_field("Weight, optional")
)

PAGE = dict(
    slug="body-fat-calculator",
    calc="bodyfat",
    icon="📏",
    nav="Body Fat Calculator",
    tile="Estimate your body fat percentage from a tape measure using the U.S. Navy method.",
    title="Body Fat Calculator: U.S. Navy Method",
    desc="Free body fat percentage calculator using the U.S. Navy circumference method. All you need is a tape measure. See fat mass, lean mass and your category.",
    h1="Body Fat Calculator",
    intro="Estimate your body fat percentage with nothing more than a tape measure. This calculator uses the U.S. Navy circumference method.",
    form=form(FIELDS, "Calculate body fat"),
    article="""
<h2>How to measure yourself</h2>
<p>Accurate measurements make a real difference to the result. Use a flexible tape measure, stand relaxed, and keep the tape snug against the skin without squeezing.</p>
<ul>
<li><strong>Neck:</strong> measure just below the larynx (Adam's apple), with the tape sloping slightly down towards the front.</li>
<li><strong>Waist:</strong> for men and women alike, measure horizontally at the level of the navel, after breathing out normally. Do not suck in your stomach.</li>
<li><strong>Hips (women):</strong> measure around the widest part of the buttocks.</li>
<li><strong>Height:</strong> measure without shoes, standing against a wall.</li>
</ul>
<p>Take each measurement twice and use the average. Measure in the morning, before eating, for the most repeatable readings.</p>

<h2>How the U.S. Navy method works</h2>
<p>The method was developed for military body composition screening. It uses the logic that, for a given height, a larger waist compared with the neck (and hips, for women) indicates more fat. The formulas (measurements in centimetres) are:</p>
<ul>
<li><strong>Men:</strong> 495 &divide; (1.0324 &minus; 0.19077 &times; log<sub>10</sub>(waist &minus; neck) + 0.15456 &times; log<sub>10</sub>(height)) &minus; 450</li>
<li><strong>Women:</strong> 495 &divide; (1.29579 &minus; 0.35004 &times; log<sub>10</sub>(waist + hip &minus; neck) + 0.22100 &times; log<sub>10</sub>(height)) &minus; 450</li>
</ul>

<h2>Body fat percentage categories</h2>
<div class="tablewrap"><table>
<thead><tr><th>Category</th><th>Men</th><th>Women</th></tr></thead>
<tbody>
<tr><td>Essential fat</td><td>2 to 5%</td><td>10 to 13%</td></tr>
<tr><td>Athletes</td><td>6 to 13%</td><td>14 to 20%</td></tr>
<tr><td>Fitness</td><td>14 to 17%</td><td>21 to 24%</td></tr>
<tr><td>Average</td><td>18 to 24%</td><td>25 to 31%</td></tr>
<tr><td>Above average</td><td>25% and over</td><td>32% and over</td></tr>
</tbody></table></div>
<p>These ranges follow the American Council on Exercise guidelines. Women naturally carry more essential fat than men, because it supports reproductive health. Healthy ranges also rise somewhat with age.</p>

<h2>How accurate is it?</h2>
<p>Tape-measure methods are convenient but approximate. Compared with a DEXA scan, the Navy method is usually within about 3 to 4 percentage points for average-build people, and can be less accurate for very muscular, very lean or very heavy people. It is best used to track your own trend over time, using the same technique each time, rather than as an exact number.</p>
<p>To see how your weight fits your height, use the <a href="/fitness/bmi-calculator/">BMI calculator</a>.</p>
""",
    faqs=[
        ("What is a healthy body fat percentage?", "For most adult men roughly 10 to 20% and for most adult women roughly 18 to 28% is considered healthy, though the ideal range depends on age, fitness goals and health."),
        ("Is the Navy method better than BMI?", "It accounts for waist and neck size, so it can tell apart two people with the same BMI but different builds. It is still an estimate, but it often gives a more useful picture than BMI alone."),
        ("How often should I measure?", "Once every two to four weeks is enough. Body fat changes slowly, and day-to-day noise from water, food and measuring technique can hide real changes."),
        ("Why does the calculator ask for hips only for women?", "The women's version of the formula includes hip circumference, because women store more fat on the hips and thighs. The men's formula does not use it."),
    ],
)
