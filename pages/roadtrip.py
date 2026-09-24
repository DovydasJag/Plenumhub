from helpers import *


def leg(n):
    return (
        f'<div class="field leg"><label for="leg_{n}">Leg <span class="leg-n">{n}</span> distance '
        '(<span class="u-metric">km</span><span class="u-imperial">mi</span>)</label>'
        f'<div class="field-row"><input id="leg_{n}" class="leg-dist" type="number" inputmode="decimal" min="0" step="1">'
        f'<button type="button" class="swap-btn leg-remove" aria-label="Remove leg {n}">&times;</button></div></div>'
    )


FIELDS = (
    '<div class="field"><label for="unit">Units</label>'
    '<select id="unit"><option value="metric">Metric (km, L/100 km)</option>'
    '<option value="imperial">Imperial (miles, US mpg)</option></select></div>'
    '<div class="field u-metric"><label for="l100">Fuel use (L/100 km)</label>'
    '<input id="l100" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 7"></div>'
    '<div class="field u-imperial"><label for="mpg">Fuel economy (mpg)</label>'
    '<input id="mpg" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 28"></div>'
    '<div class="field u-metric"><label for="fuel_l">Fuel price per litre</label>'
    '<input id="fuel_l" type="number" inputmode="decimal" min="0" step="0.001" placeholder="e.g. 1.65"></div>'
    '<div class="field u-imperial"><label for="fuel_gal">Fuel price per gallon</label>'
    '<input id="fuel_gal" type="number" inputmode="decimal" min="0" step="0.01" placeholder="e.g. 3.40"></div>'
    '<div class="field wide"><div class="grid" id="legs">' + leg(1) + leg(2) + leg(3) + '</div></div>'
    '<div class="field wide"><div><button type="button" id="addLeg" class="btn ghost">+ Add another leg</button></div></div>'
)

PAGE = dict(
    slug="road-trip-cost-calculator",
    calc="roadtrip",
    niche="automotive",
    icon="🗺️",
    nav="Road Trip Fuel Cost Calculator",
    tile="Add each leg of a road trip to see the fuel cost per leg and in total.",
    title="Road Trip Fuel Cost Calculator: Cost Per Leg and Total",
    desc="Free road trip fuel cost calculator. Add as many legs as you like to see the fuel used and cost of each leg and of the whole trip.",
    h1="Road Trip Fuel Cost Calculator",
    intro="Enter your car's fuel economy and the fuel price, then the distance of each leg of your trip. Add as many legs as you need to see the fuel cost of each one and of the whole trip.",
    form=form(FIELDS, "Calculate trip cost"),
    article="""
<h2>The formula</h2>
<p>Each leg is worked out on its own, then the legs are added up. For each leg: fuel = miles &divide; mpg (or km &times; L/100 km &divide; 100), and cost = fuel &times; price. The trip total is the sum of all the legs.</p>
<p>For example, a three-leg trip of 120, 250 and 180 miles in a car that does 28 mpg, with fuel at $3.40 a gallon: leg 1 uses 120 &divide; 28 = 4.29 gallons and costs $14.57, leg 2 costs $30.36 and leg 3 costs $21.86. The whole 550-mile trip uses 19.6 gallons and costs $66.79.</p>

<h2>Planning tips</h2>
<p>Splitting a trip into legs makes it easy to see where the money goes, share costs fairly when different people join for different parts, or budget day by day. Get each leg's distance from a map or route planner, and remember to include the drive home if you're coming back the same way.</p>
<p>If fuel prices vary a lot along your route, for example between countries or states, calculate those legs separately with each area's price and add the results together.</p>

<h2>Limits of this estimate</h2>
<p>Motorway driving at high speed, mountains, headwinds, a fully loaded car, a roof box or towing can all use noticeably more fuel than your usual average. City driving and traffic jams can also increase fuel use. Treat the result as a budget estimate and allow a margin of 10-20% for a long or heavily loaded trip.</p>
""",
    faqs=[
        ("How many legs can I add?", "As many as you like. Use the \"Add another leg\" button to add a row, and the &times; button to remove one. Empty legs are ignored."),
        ("Can I use a different fuel price for each leg?", "This calculator uses one price for the whole trip. If prices differ a lot along the way, calculate those legs separately with each price and add up the results."),
        ("How do I split the cost between passengers?", "Divide the total by the number of people. If people join for different legs, add up the cost of the legs each person was on."),
        ("Which mpg does the imperial option use?", "US mpg. If your car is rated in UK mpg, multiply it by 0.833 to get US mpg, or use the Fuel Economy Converter."),
    ],
)
