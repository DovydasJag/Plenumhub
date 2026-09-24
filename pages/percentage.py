from helpers import *

FIELDS = (
    '<div class="field wide"><label for="mode">Calculation</label><select id="mode">'
    '<option value="of">X% of Y</option>'
    '<option value="what">X is what % of Y</option>'
    '<option value="change">% increase/decrease from X to Y</option>'
    '</select></div>'
    '<div class="field" data-mode-group="of"><label for="of_x">Percent (X)</label>'
    '<input id="of_x" type="number" inputmode="decimal" step="any" placeholder="e.g. 20"></div>'
    '<div class="field" data-mode-group="of"><label for="of_y">Of number (Y)</label>'
    '<input id="of_y" type="number" inputmode="decimal" step="any" placeholder="e.g. 50"></div>'
    '<div class="field" data-mode-group="what" hidden><label for="what_x">Part (X)</label>'
    '<input id="what_x" type="number" inputmode="decimal" step="any" placeholder="e.g. 15"></div>'
    '<div class="field" data-mode-group="what" hidden><label for="what_y">Whole (Y)</label>'
    '<input id="what_y" type="number" inputmode="decimal" step="any" placeholder="e.g. 60"></div>'
    '<div class="field" data-mode-group="change" hidden><label for="chg_x">From (X)</label>'
    '<input id="chg_x" type="number" inputmode="decimal" step="any" placeholder="e.g. 80"></div>'
    '<div class="field" data-mode-group="change" hidden><label for="chg_y">To (Y)</label>'
    '<input id="chg_y" type="number" inputmode="decimal" step="any" placeholder="e.g. 100"></div>'
)

PAGE = dict(
    slug="percentage-calculator",
    calc="percentage",
    niche="money",
    icon="%",
    nav="Percentage Calculator",
    tile="Work out X% of Y, what percent X is of Y, or the percent change between two numbers.",
    title="Percentage Calculator: Percent Of, Percent Change and More",
    desc="Free percentage calculator. Work out X% of Y, what percent one number is of another, or the percent increase or decrease between two numbers.",
    h1="Percentage Calculator",
    intro="Choose what you want to work out, then enter your numbers: a percentage of a number, one number as a percentage of another, or the percent change between two numbers.",
    form=form(FIELDS, "Calculate"),
    article="""
<h2>The three things this calculator does</h2>
<p>"Percentage" questions usually come in one of three shapes, and each uses a different formula:</p>
<ul>
<li><strong>X% of Y</strong> &mdash; for example, "what is 20% of 50?" Formula: (X &divide; 100) &times; Y.</li>
<li><strong>X is what % of Y</strong> &mdash; for example, "15 is what percent of 60?" Formula: (X &divide; Y) &times; 100.</li>
<li><strong>% increase/decrease from X to Y</strong> &mdash; for example, "a price went from 80 to 100, what's the change?" Formula: ((Y &minus; X) &divide; X) &times; 100.</li>
</ul>
<p>Pick the option that matches your question and the calculator does the rest.</p>

<h2>Worked examples</h2>
<p>20% of 50: (20 &divide; 100) &times; 50 = 10.</p>
<p>15 is what percent of 60? (15 &divide; 60) &times; 100 = 25%.</p>
<p>Change from 80 to 100: ((100 &minus; 80) &divide; 80) &times; 100 = 25% increase. Change from 100 to 80 the other way round is a 20% decrease &mdash; percent increase and decrease are not symmetric, because the base number (what you divide by) is different each time.</p>

<h2>Common mistakes</h2>
<p>A frequent error is assuming a 25% increase followed by a 25% decrease gets you back to the start. It does not: 100 up 25% is 125, and 125 down 25% is 93.75, because the second percentage is taken from a different base number. Always check which number the percentage applies to.</p>
<p>Another common trap is percentage points versus percent: if a rate moves from 10% to 15%, that is a 5 percentage-point increase, but a 50% relative increase (use the % change mode above for the second figure).</p>

<h2>Where percentages show up</h2>
<p>Discounts and markups, exam and survey scores, tax and tip rates, interest rates, and year-on-year comparisons in business are the most common everyday uses. For a dedicated tip calculation with per-person splitting, see our <a href="/money/tip-calculator/">tip calculator</a>.</p>
""",
    faqs=[
        ("How do I calculate a percentage by hand?", "Divide the percentage by 100 to get a decimal, then multiply by the number. For 20% of 50: 20 / 100 = 0.2, then 0.2 x 50 = 10."),
        ("Why are percent increase and percent decrease not opposites?", "Because each is calculated from a different starting number (base). Going up 25% from 100 reaches 125, but coming back down 25% from 125 only reaches 93.75, not 100."),
        ("Can X or Y be negative?", "Yes, for X% of Y and for percent change. For 'X is what % of Y', Y cannot be zero, since dividing by zero is undefined."),
        ("What is the difference between percent and percentage points?", "Percentage points measure the raw difference between two percentages (15% - 10% = 5 points). Percent change measures the relative difference (a 50% increase). They answer different questions."),
    ],
)
