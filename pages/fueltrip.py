from helpers import *

FIELDS = (
    '<div class="field"><label for="unit">Units</label>'
    '<select id="unit"><option value="metric">Metric (km, L/100 km)</option>'
    '<option value="imperial">Imperial (miles, US mpg)</option></select></div>'
    '<div class="field u-metric"><label for="dist_km">Trip distance (km)</label>'
    '<input id="dist_km" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 500"></div>'
    '<div class="field u-imperial"><label for="dist_mi">Trip distance (mi)</label>'
    '<input id="dist_mi" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 300"></div>'
    '<div class="field u-metric"><label for="l100">Fuel use (L/100 km)</label>'
    '<input id="l100" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 7"></div>'
    '<div class="field u-imperial"><label for="mpg">Fuel economy (mpg)</label>'
    '<input id="mpg" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 30"></div>'
    '<div class="field u-metric"><label for="fuel_l">Fuel price per litre</label>'
    '<input id="fuel_l" type="number" inputmode="decimal" min="0" step="0.001" placeholder="e.g. 1.65"></div>'
    '<div class="field u-imperial"><label for="fuel_gal">Fuel price per gallon</label>'
    '<input id="fuel_gal" type="number" inputmode="decimal" min="0" step="0.01" placeholder="e.g. 3.50"></div>'
)

PAGE = dict(
    slug="fuel-cost-calculator",
    calc="fueltrip",
    niche="automotive",
    icon="⛽",
    nav="Fuel Cost Per Trip Calculator",
    tile="How much fuel a trip will use and what it will cost.",
    title="Fuel Cost Calculator: Cost of a Trip",
    desc="Free fuel cost calculator. Enter the trip distance, your car's fuel economy and the fuel price to see how much fuel the trip uses and what it costs.",
    h1="Fuel Cost Per Trip Calculator",
    intro="Enter how far you're going, your car's fuel economy and the price of fuel to see what the trip will cost. Works with any currency: just use your local fuel price.",
    form=form(FIELDS, "Calculate cost"),
    article="""
<h2>The formula</h2>
<p>First work out how much fuel the trip uses, then multiply by the price. With miles and mpg: gallons = miles &divide; mpg. With kilometres and L/100 km: litres = km &times; L/100 km &divide; 100. Then: trip cost = fuel used &times; price per gallon or litre.</p>
<p>For example, a 300-mile trip in a car that does 30 mpg uses 300 &divide; 30 = 10 gallons. At $3.50 a gallon, that's 10 &times; 3.50 = $35.00. In metric, a 500 km trip at 7 L/100 km uses 500 &times; 7 &divide; 100 = 35 litres, which at 1.65 a litre costs 57.75.</p>

<h2>Finding your real fuel economy</h2>
<p>The official figure for your car is a good starting point, but most drivers get somewhat less in everyday use. Your car's trip computer usually shows a real average. For the most accurate figure, fill the tank, reset the trip meter, drive normally until your next fill-up, then divide the distance by the fuel you put in (or, for L/100 km, divide the litres by the kilometres and multiply by 100).</p>

<h2>Limits of this estimate</h2>
<p>Fuel economy changes with speed, traffic, hills, weather, load and roof boxes. Motorway driving at high speed, heavy luggage or towing can all use noticeably more fuel than normal. The result is for a one-way trip at the fuel economy you enter; double it for a return trip, and treat it as an estimate rather than an exact figure.</p>
""",
    faqs=[
        ("Is the result for a one-way or return trip?", "One way. For a return trip, enter the total distance there and back, or double the result."),
        ("Which mpg does the imperial option use?", "US mpg. UK mpg figures are about 20% higher for the same car because a UK gallon is bigger. To convert UK mpg to US mpg, multiply by 0.833, or use the Fuel Economy Converter."),
        ("How do I split the fuel cost between passengers?", "Divide the trip cost by the number of people sharing it. For a trip with several stops or drivers, the Road Trip Fuel Cost Calculator shows the cost of each leg."),
        ("Why is my real cost higher than the estimate?", "Most cars use more fuel than their official rating in real driving, especially at high speed, in cold weather or with a heavy load. Using your trip computer's average makes the estimate more realistic."),
    ],
)
