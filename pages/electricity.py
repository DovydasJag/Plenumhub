from helpers import *

FIELDS = (
    '<div class="field"><label for="watts">Appliance wattage (W)</label>'
    '<input id="watts" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 1500"></div>'
    '<div class="field"><label for="hours">Hours used per day</label>'
    '<input id="hours" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 3"></div>'
    '<div class="field"><label for="price">Price per kWh</label>'
    '<input id="price" type="number" inputmode="decimal" min="0" step="0.001" placeholder="e.g. 0.18"></div>'
    '<div class="field"><label for="days">Days used per month</label>'
    '<input id="days" type="number" inputmode="numeric" min="1" max="31" step="1" value="30"></div>'
)

PAGE = dict(
    slug="electricity-cost-calculator",
    calc="electricity",
    niche="home",
    icon="🔌",
    nav="Electricity Cost Calculator",
    tile="See what an appliance actually costs to run per day, month and year.",
    title="Electricity Cost Calculator: Appliance Running Cost",
    desc="Free electricity cost calculator. Enter an appliance's wattage, hours used and your price per kWh to see its running cost per day, month and year.",
    h1="Electricity Cost Calculator",
    intro="Enter an appliance's wattage, how long you use it per day, and your price per kWh to see exactly what it costs to run per day, month and year. Works with any currency: just use your local price per kWh.",
    form=form(FIELDS, "Calculate cost"),
    article="""
<h2>The formula</h2>
<p>Electricity is billed in kilowatt-hours (kWh): one kWh is one kilowatt (1,000 watts) of power used for one hour. To find an appliance's energy use: kWh = (watts &divide; 1000) &times; hours used. To find the cost: cost = kWh &times; your price per kWh.</p>
<p>For example, a 1,500 W space heater run for 3 hours a day: kWh per day = (1500 &divide; 1000) &times; 3 = 4.5 kWh. At $0.18 per kWh, that's 4.5 &times; 0.18 = $0.81 per day, or about $24.30 over a 30-day month.</p>

<h2>Typical wattage of common appliances</h2>
<div class="tablewrap"><table>
<thead><tr><th>Appliance</th><th>Typical wattage</th></tr></thead>
<tbody>
<tr><td>Refrigerator</td><td>100-400 W (cycles on and off; averages to roughly 1-2 kWh/day)</td></tr>
<tr><td>Air conditioning unit (window/portable)</td><td>900-1,500 W</td></tr>
<tr><td>Space heater</td><td>750-1,500 W</td></tr>
<tr><td>LED light bulb</td><td>5-15 W</td></tr>
<tr><td>Washing machine</td><td>350-1,200 W (varies a lot by cycle, mostly for heating water)</td></tr>
</tbody></table></div>
<p>These are rough ranges. Actual wattage varies a lot by model, size and settings, so treat this table as a starting point, not a substitute for your specific appliance's rating.</p>

<h2>Finding your appliance's actual wattage</h2>
<p>The most reliable source is the rating label, usually on the back, bottom or inside of the appliance, or in its manual, which lists watts (W) directly. If it only lists amps (A) and volts (V), multiply them together to estimate watts (amps &times; volts = watts). For the most accurate real-world figure, a plug-in electricity usage monitor measures actual power draw, which is especially useful for appliances like fridges and washing machines whose power use varies a lot during a cycle rather than staying constant.</p>

<h2>Limits of this estimate</h2>
<p>This calculator assumes constant wattage for the hours you enter, which is accurate for simple resistive devices like heaters and incandescent bulbs, but only an approximation for appliances that cycle on and off (fridges, air conditioners) or draw different power at different stages (washing machines, dishwashers). It also doesn't include standby ("phantom") power draw when a device is plugged in but switched off. For those appliances, a plug-in usage monitor over a few days will give a more accurate average than the wattage on the label alone.</p>
""",
    faqs=[
        ("Where do I find my price per kWh?", "Check a recent electricity bill, which usually lists a rate per kWh (or per unit). Your utility provider's website or customer service can also give you the current rate."),
        ("Does this work outside the US?", "Yes. Enter your price per kWh in your own currency and the result will be in that same currency; the calculator doesn't assume dollars."),
        ("Why doesn't the fridge/AC cost match the table exactly?", "Fridges, air conditioners and similar appliances cycle on and off rather than drawing constant power, so their average wattage over a day is lower than their rated (peak) wattage. Use a plug-in usage monitor for a more accurate figure."),
        ("What if I enter 0 hours per day?", "The calculator will show $0 and 0 kWh, since an appliance that isn't used doesn't consume energy in this model. This doesn't account for standby power draw."),
    ],
)
