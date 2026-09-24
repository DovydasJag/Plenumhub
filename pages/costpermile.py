from helpers import *

FIELDS = (
    '<div class="field"><label for="unit">Units</label>'
    '<select id="unit"><option value="metric">Kilometres</option>'
    '<option value="imperial">Miles</option></select></div>'
    '<div class="field u-metric"><label for="dist_km">Distance driven per month (km)</label>'
    '<input id="dist_km" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 1600"></div>'
    '<div class="field u-imperial"><label for="dist_mi">Distance driven per month (mi)</label>'
    '<input id="dist_mi" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 1000"></div>'
    '<div class="field"><label for="fuel">Fuel or charging per month</label>'
    '<input id="fuel" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 120"></div>'
    '<div class="field"><label for="insurance">Insurance per month</label>'
    '<input id="insurance" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 150"></div>'
    '<div class="field"><label for="maint">Maintenance per month</label>'
    '<input id="maint" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 50"></div>'
    '<div class="field"><label for="mode">Cost of owning the car</label>'
    '<select id="mode"><option value="payment">Loan or lease payment</option>'
    '<option value="depr">Depreciation estimate</option></select></div>'
    '<div class="field" data-mode-group="payment"><label for="payment">Loan or lease payment per month</label>'
    '<input id="payment" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 450"></div>'
    '<div class="field" data-mode-group="depr" hidden><label for="depr">Depreciation per year</label>'
    '<input id="depr" type="number" inputmode="decimal" min="0" step="100" placeholder="e.g. 4000"></div>'
)

PAGE = dict(
    slug="cost-per-mile-calculator",
    calc="costpermile",
    niche="automotive",
    icon="📊",
    nav="Cost Per Mile/Km Calculator",
    tile="What your car really costs per mile or km, with fuel, insurance and more.",
    title="Cost Per Mile Calculator: True Cost of Driving",
    desc="Free cost per mile and cost per km calculator. Combine fuel, insurance, maintenance and your loan, lease or depreciation to see what driving really costs.",
    h1="Total Cost Per Mile/Km Calculator",
    intro="Add up what your car costs each month (fuel, insurance, maintenance and either your loan or lease payment or an estimate of depreciation) to see what every mile or kilometre really costs you.",
    form=form(FIELDS, "Calculate cost"),
    article="""
<h2>The formula</h2>
<p>Cost per mile (or km) = total monthly cost &divide; distance driven per month. The total monthly cost is simply everything added together: fuel or charging + insurance + maintenance + the cost of owning the car itself.</p>
<p>For example, someone who drives 1,000 miles a month and spends $120 on fuel, $150 on insurance, $50 on maintenance and $450 on a car loan pays $120 + $150 + $50 + $450 = $770 a month. That's 770 &divide; 1,000 = $0.77 per mile, or $9,240 a year. Fuel is only 16% of the total here, which is why cost per mile is usually much higher than fuel cost alone.</p>

<h2>Loan payment or depreciation?</h2>
<p>Choose the option that matches how you think about the car's cost. If you're paying a loan or lease, the monthly payment is the simplest figure. If you own the car outright, or want a truer long-term figure, use depreciation: the value the car loses each year. Use one or the other, not both, because a loan payment already pays for the car's purchase price.</p>
<p>A rough way to estimate depreciation per year is (price you paid &minus; expected resale value) &divide; years you'll keep it. The Car Depreciation Calculator can help with this.</p>

<h2>Limits of this estimate</h2>
<p>This is a simple average. It doesn't include parking, tolls, road tax, registration, tires or occasional large repairs unless you include them in one of the monthly figures (for example, add a yearly bill divided by 12 to maintenance). Driving more miles spreads the fixed costs (insurance and ownership) over more distance, so your cost per mile falls as mileage rises, while fuel cost per mile stays roughly the same.</p>
""",
    faqs=[
        ("What should I include in maintenance?", "Servicing, oil changes, tires, brakes and repairs, averaged over a year and divided by 12. If you're not sure, look back at a year of bills."),
        ("Can I use this for an electric car?", "Yes. Enter your monthly charging cost in the fuel box. The EV Home Charging Cost Calculator can work that figure out for you."),
        ("Why is my cost per mile so much higher than fuel alone?", "Insurance and the cost of the car itself are usually larger than fuel. Those costs are fixed each month, so they add a lot to every mile, especially if you don't drive much."),
        ("Is this the same as a mileage allowance rate?", "No. Official mileage rates, such as those set by tax authorities for business travel, are fixed averages. This calculator shows the cost for your own car based on your figures."),
    ],
)
