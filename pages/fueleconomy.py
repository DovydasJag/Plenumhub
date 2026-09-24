from helpers import *

FIELDS = (
    '<div class="field"><label for="mpg_us">Miles per gallon (US)</label>'
    '<input id="mpg_us" type="number" inputmode="decimal" min="0" step="any" placeholder="e.g. 30"></div>'
    '<div class="field"><label for="mpg_uk">Miles per gallon (UK)</label>'
    '<input id="mpg_uk" type="number" inputmode="decimal" min="0" step="any" placeholder="e.g. 36"></div>'
    '<div class="field"><label for="l100">Litres per 100 km</label>'
    '<input id="l100" type="number" inputmode="decimal" min="0" step="any" placeholder="e.g. 7.8"></div>'
    '<div class="field"><label for="kml">Kilometres per litre</label>'
    '<input id="kml" type="number" inputmode="decimal" min="0" step="any" placeholder="e.g. 12.8"></div>'
)

PAGE = dict(
    slug="fuel-economy-converter",
    calc="mpgconvert",
    niche="automotive",
    icon="🔄",
    nav="Fuel Economy Converter",
    tile="Convert between US mpg, UK mpg, L/100 km and km/L as you type.",
    title="Fuel Economy Converter: MPG to L/100 km and km/L",
    desc="Free fuel economy converter. Type a figure in US mpg, UK mpg, litres per 100 km or km per litre and see the other three instantly.",
    h1="Fuel Economy Converter",
    intro="Type a fuel economy figure into any box and the other three update instantly. Useful for comparing cars rated in different countries.",
    form=form(FIELDS, "Convert"),
    article="""
<h2>How the conversion works</h2>
<p>The four units measure the same thing in two different ways. Miles per gallon and kilometres per litre measure distance per unit of fuel, so a higher number is better. Litres per 100 km measures fuel per distance, so a lower number is better.</p>
<p>The conversions use three fixed facts: 1 mile = 1.609344 km, 1 US gallon = 3.785 litres and 1 UK (imperial) gallon = 4.546 litres. From those: L/100 km = 235.21 &divide; US mpg, L/100 km = 282.48 &divide; UK mpg, and km/L = 100 &divide; L/100 km.</p>
<p>For example, 30 US mpg = 235.21 &divide; 30 = 7.84 L/100 km. That's 100 &divide; 7.84 = 12.75 km/L, or 30 &times; 1.201 = 36.03 UK mpg.</p>

<h2>Common values</h2>
<div class="tablewrap"><table>
<thead><tr><th>US mpg</th><th>UK mpg</th><th>L/100 km</th><th>km/L</th></tr></thead>
<tbody>
<tr><td>20</td><td>24.0</td><td>11.76</td><td>8.50</td></tr>
<tr><td>25</td><td>30.0</td><td>9.41</td><td>10.63</td></tr>
<tr><td>30</td><td>36.0</td><td>7.84</td><td>12.75</td></tr>
<tr><td>40</td><td>48.0</td><td>5.88</td><td>17.01</td></tr>
<tr><td>50</td><td>60.0</td><td>4.70</td><td>21.26</td></tr>
</tbody></table></div>

<h2>Why US and UK mpg differ</h2>
<p>A UK (imperial) gallon is about 20% larger than a US gallon, so the same car gets a higher mpg figure in the UK. A car rated at 30 mpg in the US is about 36 mpg in UK terms. Always check which gallon a figure uses before comparing cars from different markets.</p>

<h2>Limits of the conversion</h2>
<p>The conversion itself is exact, but it can't make two ratings comparable if they come from different official test cycles. US (EPA), European (WLTP) and older European (NEDC) ratings are measured differently, so the same car can have noticeably different official figures in each market even after converting units.</p>
""",
    faqs=[
        ("Why does the L/100 km number go down when mpg goes up?", "L/100 km measures how much fuel you use to cover a set distance, so a more efficient car uses less and gets a lower number. Mpg and km/L measure how far you go on a set amount of fuel, so a more efficient car gets a higher number."),
        ("Do I need to press Convert?", "No. The other boxes update as you type. The Convert button does the same thing if you prefer to click."),
        ("Which mpg do car makers in my country use?", "The US uses US gallons. The UK uses imperial (UK) gallons. Most of Europe and many other countries use L/100 km, and some, such as Japan and India, commonly use km/L."),
        ("How precise are the results?", "The conversions use the exact definitions of the mile and both gallons. Results are rounded to two decimal places, which is more precise than any real-world fuel economy figure."),
    ],
)
