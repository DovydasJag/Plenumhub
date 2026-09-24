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
    '<div class="field"><label for="charger">Home charger</label>'
    '<select id="charger">'
    '<option value="1.4">Level 1 (1.4 kW)</option>'
    '<option value="7.2" selected>Level 2 (7.2 kW)</option>'
    '<option value="11.5">High-amp Level 2 (11.5 kW)</option>'
    '</select></div>'
    '<div class="field"><label for="battery">Battery size (kWh)</label>'
    '<input id="battery" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 75"></div>'
    '<div class="field"><label for="loss">Charging loss: <output id="loss_out" for="loss">12</output>%</label>'
    '<input id="loss" type="range" min="0" max="30" step="1" value="12"></div>'
    '<div class="field u-metric"><label for="l100">Comparison petrol car (L/100 km)</label>'
    '<input id="l100" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 7.8"></div>'
    '<div class="field u-imperial"><label for="mpg">Comparison gas car (mpg)</label>'
    '<input id="mpg" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 30"></div>'
    '<div class="field u-metric"><label for="fuel_l">Petrol price per litre</label>'
    '<input id="fuel_l" type="number" inputmode="decimal" min="0" step="0.001" placeholder="e.g. 1.65"></div>'
    '<div class="field u-imperial"><label for="fuel_gal">Gas price per gallon</label>'
    '<input id="fuel_gal" type="number" inputmode="decimal" min="0" step="0.01" placeholder="e.g. 3.50"></div>'
)

PAGE = dict(
    slug="ev-charging-cost-calculator",
    calc="evcharging",
    niche="automotive",
    icon="🔋",
    nav="EV Charging Cost Calculator",
    tile="What charging an electric car at home costs per month, compared with a gas car.",
    title="EV Charging Cost Calculator: Home Charging vs Gas",
    desc="Free EV home charging cost calculator. Enter your monthly distance, efficiency and electricity price to see your monthly charging cost, savings versus a gas car, and full-charge time.",
    h1="EV Home Charging Cost Calculator",
    intro="Enter how far you drive, your electric car's efficiency and your electricity price to see what home charging costs per month, how that compares with a gas car, and how long a full charge takes. Works with any currency: just use your local prices.",
    form=form(FIELDS, "Calculate cost"),
    article="""
<h2>The formula</h2>
<p>An electric car's efficiency tells you how far it goes on one kilowatt-hour (kWh) of energy. The energy the car actually uses is: kWh at the wheel = distance &divide; efficiency. Some energy is lost as heat in the charger, cable and battery, so you have to draw more than that from the wall: kWh from the wall = kWh at the wheel &divide; (1 &minus; charging loss). Your cost is then: monthly cost = kWh from the wall &times; your price per kWh.</p>
<p>For example, driving 1,000 miles a month at 3.5 mi/kWh uses 1,000 &divide; 3.5 = 285.7 kWh at the wheel. With 12% charging loss, that's 285.7 &divide; 0.88 = 324.7 kWh from the wall. At $0.18 per kWh, charging costs 324.7 &times; 0.18 = about $58.44 a month.</p>
<p>For the gas car, fuel used = miles &divide; mpg (or litres = km &times; L/100 km &divide; 100), and fuel cost = fuel used &times; price. The same 1,000 miles in a 30 mpg car uses 33.3 gallons, which at $3.50 a gallon is about $116.67. The saving is simply the gas cost minus the electricity cost: about $58.23 a month in this example.</p>

<h2>How long a full charge takes</h2>
<p>Charge time = battery size &divide; charger power. Because some of the charger's power is lost before it reaches the battery, this calculator divides by the power that actually arrives: charger kW &times; (1 &minus; charging loss). A 75 kWh battery on a 7.2 kW Level 2 charger with 12% loss takes about 75 &divide; (7.2 &times; 0.88) = 11.8 hours from empty to full.</p>
<div class="tablewrap"><table>
<thead><tr><th>Charger</th><th>Typical power</th><th>Range added per hour (at 3.5 mi/kWh)</th></tr></thead>
<tbody>
<tr><td>Level 1: standard 120 V outlet</td><td>1.4 kW</td><td>About 4-5 miles</td></tr>
<tr><td>Level 2: 240 V, 32 A</td><td>7.2 kW</td><td>About 22 miles</td></tr>
<tr><td>High-amp Level 2: 240 V, 48 A</td><td>11.5 kW</td><td>About 35 miles</td></tr>
</tbody></table></div>
<p>Outside North America, a portable "granny" cable on a 230 V socket gives about 2.3 kW, a single-phase wallbox about 7.4 kW, and a three-phase wallbox about 11 kW. Pick the option closest to your charger's rating.</p>

<h2>Typical EV efficiency</h2>
<p>Most electric cars manage roughly 3-4 mi/kWh (5-6.5 km/kWh). Small, efficient cars can beat 4 mi/kWh, while large SUVs and pickups often manage 2-2.5 mi/kWh. Your car's trip computer or app shows your real average. If it shows kWh per 100 miles or per 100 km instead, divide 100 by that number to get miles or km per kWh.</p>

<h2>Limits of this estimate</h2>
<p>Real-world efficiency drops noticeably in cold weather (often by 20-30%), at motorway speeds, and with heavy use of heating or air conditioning, so a winter month can cost more than a summer one. Charging loss varies too: Level 1 charging usually loses more (often 15-20%) than Level 2 (often 10-12%). The charge time assumes the charger's full power the whole way, but many cars slow down near 100%, and your car's onboard charger may cap the speed below your wallbox's rating. This calculator also covers home charging only; public fast charging usually costs several times more per kWh. It doesn't include time-of-use tariffs, standing charges, maintenance or insurance.</p>
""",
    faqs=[
        ("Where do I find my price per kWh?", "Check a recent electricity bill, which usually lists a rate per kWh (or per unit). If you're on an EV or time-of-use tariff, use the cheaper overnight rate for the hours you charge."),
        ("What charging loss should I use?", "The 12% default suits most Level 2 home chargers. If you charge from a standard outlet (Level 1), 15-20% is more realistic. To measure your own, compare the kWh your charger or meter reports with the kWh your car says it added."),
        ("I'm in the UK. Can I use mpg?", "The imperial option uses US gallons, which are smaller than UK (imperial) gallons. To convert UK mpg to US mpg, multiply by 0.833. Or switch to metric and use L/100 km with your price per litre."),
        ("Why does my real bill differ from this estimate?", "Efficiency changes with weather, speed and driving style, and your tariff may have standing charges or time-of-use rates. Use your car's actual average efficiency over a few months for the most accurate result."),
    ],
)
