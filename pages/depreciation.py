from helpers import *

FIELDS = (
    '<div class="field"><label for="price">Purchase price</label>'
    '<input id="price" type="number" inputmode="decimal" min="0" step="100" placeholder="e.g. 35000"></div>'
    '<div class="field"><label for="years">Years you will keep it</label>'
    '<input id="years" type="number" inputmode="numeric" min="1" max="25" step="1" value="5"></div>'
    '<div class="field"><label for="first">Depreciation in year 1 (%)</label>'
    '<input id="first" type="number" inputmode="decimal" min="0" max="99" step="0.5" value="20"></div>'
    '<div class="field"><label for="later">Depreciation each year after (%)</label>'
    '<input id="later" type="number" inputmode="decimal" min="0" max="99" step="0.5" value="15"></div>'
)

PAGE = dict(
    slug="car-depreciation-calculator",
    calc="depreciation",
    niche="automotive",
    icon="📉",
    nav="Car Depreciation Calculator",
    tile="Estimate what your car will be worth each year and how much value it loses.",
    title="Car Depreciation Calculator: Value by Year",
    desc="Free car depreciation calculator. Enter the purchase price and years you'll keep the car to estimate its value at the end of each year and the total value lost.",
    h1="Car Depreciation Calculator",
    intro="Enter what you paid and how long you'll keep the car to estimate its value at the end of each year. The default rates follow a typical curve: a big drop in the first year, then a slower decline.",
    form=form(FIELDS, "Calculate value"),
    article="""
<h2>The formula</h2>
<p>Cars lose a percentage of their value each year, not a fixed amount, so the drop is biggest early on and gets smaller over time. Each year: value at year end = value at start of year &times; (1 &minus; depreciation rate). The default rates are 20% in the first year and 15% in each year after, a common rule of thumb for an average new car.</p>
<p>For example, a $35,000 car loses 20% in year 1 and is worth 35,000 &times; 0.80 = $28,000. In year 2 it loses 15% of that, leaving 28,000 &times; 0.85 = $23,800. After five years it's worth about $14,616, so it has lost $20,384, or 58% of what you paid.</p>

<h2>Typical depreciation by age</h2>
<div class="tablewrap"><table>
<thead><tr><th>Age</th><th>Value left (default rates)</th></tr></thead>
<tbody>
<tr><td>1 year</td><td>80%</td></tr>
<tr><td>3 years</td><td>58%</td></tr>
<tr><td>5 years</td><td>42%</td></tr>
<tr><td>8 years</td><td>26%</td></tr>
</tbody></table></div>
<p>Some cars hold their value much better than this, often popular pickups, some SUVs and models with a strong reputation for reliability. Others, often luxury cars and some electric cars, can lose value faster. Change the rates to match what similar used cars actually sell for.</p>

<h2>Limits of this estimate</h2>
<p>Real resale value depends on make and model, mileage, condition, accident history, color, location and the used-car market at the time you sell. A fixed yearly rate is a reasonable average but can't predict any of those. For a real valuation, compare prices of the same model, age and mileage on used-car listings, or use a pricing guide in your country.</p>
""",
    faqs=[
        ("Can I use this for a used car?", "Yes. Enter what you paid and set the year 1 rate to match the later rate (for example 15% for both), because the steep first-year drop has already happened."),
        ("Why does a new car lose so much in the first year?", "As soon as a new car is registered it becomes a used car, and buyers pay less for used cars. Much of the price also covers dealer margin and new-car premium that a used buyer won't pay."),
        ("Does mileage affect depreciation?", "Yes. High mileage for the car's age lowers its value, and low mileage raises it. The default rates assume average mileage of roughly 10,000-15,000 miles (16,000-24,000 km) a year."),
        ("How do I use this to compare buying and leasing?", "The value lost over the years you'd keep the car is the main cost of owning it. Compare that, plus loan interest, with the total of the lease payments over the same time."),
    ],
)
