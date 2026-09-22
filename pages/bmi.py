from helpers import *

PAGE = dict(
    slug="bmi-calculator",
    calc="bmi",
    icon="⚖️",
    nav="BMI Calculator",
    tile="Check your body mass index and the weight range that is healthy for your height.",
    title="BMI Calculator: Body Mass Index for Adults",
    desc="Free BMI calculator. Enter your height and weight to see your body mass index, your category, and the healthy weight range for your height.",
    h1="BMI Calculator",
    intro="Enter your height and weight to find your body mass index (BMI) and the weight range that counts as healthy for your height.",
    form=form(unit_toggle() + weight_field() + height_field(), "Calculate BMI"),
    article="""
<h2>What is BMI?</h2>
<p>Body mass index is your weight in kilograms divided by your height in metres squared. A person who weighs 70 kg and is 1.75 m tall has a BMI of 70 &divide; (1.75 &times; 1.75) = 22.9. In pounds and inches the formula is 703 &times; weight &divide; height&sup2;.</p>
<p>BMI was designed as a quick way to screen populations, not to diagnose individuals. It takes seconds to calculate and correlates reasonably well with health risk across large groups, which is why doctors still use it as a starting point.</p>

<h2>BMI categories for adults</h2>
<div class="tablewrap"><table>
<thead><tr><th>BMI</th><th>Category</th></tr></thead>
<tbody>
<tr><td>Below 18.5</td><td>Underweight</td></tr>
<tr><td>18.5 to 24.9</td><td>Healthy weight</td></tr>
<tr><td>25.0 to 29.9</td><td>Overweight</td></tr>
<tr><td>30.0 and above</td><td>Obesity</td></tr>
</tbody></table></div>
<p>These cut-offs are the ones used by the World Health Organization and the U.S. Centers for Disease Control and Prevention for adults aged 20 and over. Children and teenagers are assessed differently, using percentile charts for their age and sex.</p>

<h2>Limits of BMI</h2>
<p>BMI cannot tell fat from muscle. A muscular athlete can land in the "overweight" range while carrying very little body fat, and an older person who has lost muscle can have a "healthy" BMI while carrying too much fat around the middle. It also ignores where fat is stored, and that matters: fat around the waist carries more health risk than fat on the hips and thighs.</p>
<p>Some research suggests the risks of a given BMI differ between ethnic groups. For example, some guidelines use lower thresholds for people of South Asian descent. If you want a fuller picture, pair BMI with a waist measurement or try our <a href="/body-fat-calculator/">body fat calculator</a>.</p>

<h2>What to do with your result</h2>
<p>If your BMI is in the healthy range, there is nothing to fix; focus on habits such as regular activity, sleep and a varied diet. If it is above or below the healthy range, treat it as a prompt to look at the bigger picture with your doctor, who can consider your waist size, blood pressure, blood sugar, family history and lifestyle. If you want to change your weight, our <a href="/calorie-calculator/">calorie calculator</a> shows how much to eat for your goal.</p>
""",
    faqs=[
        ("Is BMI accurate?", "It is a reasonable screening tool for most adults, but it is only an estimate. It cannot separate muscle from fat, so it can mislead for very muscular people, older adults and some ethnic groups."),
        ("What is a healthy BMI?", "For adults, a BMI between 18.5 and 24.9 is considered a healthy weight. The healthy weight range shown in the calculator is worked out from those two limits and your height."),
        ("Does BMI differ for men and women?", "The adult categories are the same for both sexes. Women typically carry more body fat than men at the same BMI, which is one reason BMI is only a rough guide."),
        ("Can I use BMI for children?", "No. Children and teenagers are assessed using BMI-for-age percentile charts, because their bodies change as they grow. Ask a pediatrician for an assessment."),
    ],
)
