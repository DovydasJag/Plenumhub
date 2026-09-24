from helpers import *

FIELDS = (
    '<div class="field"><label for="unit">Units</label>'
    '<select id="unit"><option value="metric">Metric (km, L/100 km)</option>'
    '<option value="imperial">Imperial (miles, US mpg)</option></select></div>'
    '<div class="field u-metric"><label for="dist_km">Distance driven per month (km)</label>'
    '<input id="dist_km" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 1600"></div>'
    '<div class="field u-imperial"><label for="dist_mi">Distance driven per month (mi)</label>'
    '<input id="dist_mi" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 1000"></div>'
    '<div class="field u-metric"><label for="eff_km">EV efficiency (km/kWh)</label>'
    '<input id="eff_km" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 5.6"></div>'
    '<div class="field u-imperial"><label for="eff_mi">EV efficiency (mi/kWh)</label>'
    '<input id="eff_mi" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 3.5"></div>'
    '<div class="field"><label for="rate">Electricity price per kWh</label>'
    '<input id="rate" type="number" inputmode="decimal" min="0" step="0.001" placeholder="e.g. 0.18"></div>'
    '<div class="field"><label for="ev_maint">EV maintenance per month</label>'
    '<input id="ev_maint" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 30"></div>'
    '<div class="field u-metric"><label for="l100">Petrol car fuel use (L/100 km)</label>'
    '<input id="l100" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 7.8"></div>'
    '<div class="field u-imperial"><label for="mpg">Gas car fuel economy (mpg)</label>'
    '<input id="mpg" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 30"></div>'
    '<div class="field u-metric"><label for="fuel_l">Petrol price per litre</label>'
    '<input id="fuel_l" type="number" inputmode="decimal" min="0" step="0.001" placeholder="e.g. 1.65"></div>'
    '<div class="field u-imperial"><label for="fuel_gal">Gas price per gallon</label>'
    '<input id="fuel_gal" type="number" inputmode="decimal" min="0" step="0.01" placeholder="e.g. 3.50"></div>'
    '<div class="field"><label for="gas_maint"><span class="u-metric">Petrol</span><span class="u-imperial">Gas</span> car maintenance per month</label>'
    '<input id="gas_maint" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 60"></div>'
)

PAGE = dict(
    slug="ev-vs-gas-cost-calculator",
    calc="evvsgas",
    niche="automotive",
    icon="⚖️",
    nav="EV vs Gas Cost Comparison",
    tile="Compare the monthly and yearly running cost of an electric and a gas car.",
    title="EV vs Gas Cost Calculator: Running Cost Comparison",
    desc="Free EV vs gas car cost calculator. Compare monthly and yearly energy and maintenance costs for an electric car and a gasoline car side by side.",
    h1="EV vs Gas Total Cost Comparison",
    intro="Compare what an electric car and a gas (petrol) car cost to run each month and each year: energy plus a simple maintenance estimate for each, side by side. Works with any currency: just use your local prices.",
    form=form(FIELDS, "Compare costs"),
    article="""
<h2>The formula</h2>
<p>For the electric car: energy cost = distance &divide; efficiency &times; price per kWh. For the gas car: fuel cost = miles &divide; mpg &times; price per gallon (or km &times; L/100 km &divide; 100 &times; price per litre). Each car's monthly total is its energy cost plus its monthly maintenance estimate, and the difference is simply one total minus the other.</p>
<p>For example, driving 1,000 miles a month: an EV at 3.5 mi/kWh uses 285.7 kWh, which at $0.18 per kWh costs $51.43. Add $30 maintenance and the EV costs $81.43 a month. A 30 mpg gas car uses 33.3 gallons, which at $3.50 costs $116.67. Add $60 maintenance and it costs $176.67. The EV is $95.24 a month cheaper, or $1,142.86 a year.</p>

<h2>Why EV maintenance is usually lower</h2>
<p>Electric cars have no oil changes, spark plugs, timing belts or exhaust systems, and regenerative braking means brake pads usually last much longer. They still need tires, which can wear a little faster because EVs are heavy, plus wipers, cabin filters, brake fluid and occasional suspension work. As a rough guide, EV maintenance often costs somewhere between half and two-thirds as much as for a comparable gas car.</p>

<h2>How this differs from the EV Home Charging Cost Calculator</h2>
<p>This is a simple side-by-side comparison. It uses the EV's efficiency as-is and doesn't add charging losses (typically 10-15% extra electricity drawn from the wall) or work out charging times. For a more detailed look at home charging costs, use the EV Home Charging Cost Calculator, then compare its monthly figure here.</p>

<h2>Limits of this estimate</h2>
<p>This compares running costs only. It doesn't include purchase price, depreciation, insurance, tax or incentives, which often matter more than running costs. Public fast charging usually costs several times more per kWh than charging at home, and cold weather can reduce EV efficiency by 20-30%. Fuel and electricity prices change, so re-run the numbers with your current prices.</p>
""",
    faqs=[
        ("What maintenance figures should I use?", "Use your own service history if you have it. Otherwise, $50-80 a month (or similar in your currency) is a reasonable average for a gas car, and roughly half to two-thirds of that for an EV."),
        ("Are charging losses included?", "No. Some electricity is lost as heat while charging, typically 10-15%. To allow for it, increase your electricity price by that percentage, or use the EV Home Charging Cost Calculator, which includes it."),
        ("I'm in the UK. Can I use mpg?", "The imperial option uses US gallons, which are smaller than UK gallons. Multiply UK mpg by 0.833 to get US mpg, or switch to metric and use L/100 km with your price per litre."),
        ("Does this include the cost of buying the car?", "No, only energy and maintenance. EVs often cost more to buy, so also compare purchase price, depreciation and insurance before deciding. The Total Cost Per Mile/Km Calculator can combine all of these."),
    ],
)
