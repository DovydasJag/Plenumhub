from helpers import *

FIELDS = (
    '<div class="field"><label for="price">Vehicle price (negotiated)</label>'
    '<input id="price" type="number" inputmode="decimal" min="0" step="100" placeholder="e.g. 35000"></div>'
    '<div class="field"><label for="residual">Residual value (%)</label>'
    '<input id="residual" type="number" inputmode="decimal" min="1" max="99" step="0.5" placeholder="e.g. 58"></div>'
    '<div class="field"><label for="term">Lease term (months)</label>'
    '<input id="term" type="number" inputmode="numeric" min="1" max="96" step="1" value="36"></div>'
    '<div class="field"><label for="mode">Lease rate given as</label>'
    '<select id="mode"><option value="mf">Money factor</option><option value="apr">APR (%)</option></select></div>'
    '<div class="field" data-mode-group="mf"><label for="mf">Money factor</label>'
    '<input id="mf" type="number" inputmode="decimal" min="0" step="0.00001" placeholder="e.g. 0.00250"></div>'
    '<div class="field" data-mode-group="apr" hidden><label for="lease_apr">APR (%)</label>'
    '<input id="lease_apr" type="number" inputmode="decimal" min="0" step="0.01" placeholder="e.g. 6"></div>'
)

PAGE = dict(
    slug="car-lease-calculator",
    calc="carlease",
    niche="automotive",
    icon="📝",
    nav="Car Lease Calculator",
    tile="Estimate a monthly lease payment, split into depreciation and finance fee.",
    title="Car Lease Calculator: Monthly Payment From Money Factor",
    desc="Free car lease calculator. Enter the vehicle price, residual value, money factor or APR and term to see the monthly payment, split into depreciation and finance fee.",
    h1="Car Lease Payment Calculator",
    intro="Enter the car's price, its residual value, the lease rate (as a money factor or APR) and the term to see the monthly payment, split into the part that covers depreciation and the part that is the finance charge.",
    form=form(FIELDS, "Calculate payment"),
    article="""
<h2>The formula</h2>
<p>A lease payment has two parts. The depreciation fee pays for the value the car loses while you have it: depreciation fee = (price &minus; residual value) &divide; months. The finance fee is the lender's charge for the money tied up in the car: finance fee = (price + residual value) &times; money factor. Your monthly payment before tax is the two added together.</p>
<p>For example, a $35,000 car with a 58% residual on a 36-month lease: residual value = 35,000 &times; 0.58 = $20,300. Depreciation fee = (35,000 &minus; 20,300) &divide; 36 = $408.33. With a money factor of 0.00250, finance fee = (35,000 + 20,300) &times; 0.00250 = $138.25. Monthly payment = $546.58, or $19,677 over the lease.</p>

<h2>Money factor and APR</h2>
<p>Leases often quote the rate as a money factor, a small decimal such as 0.00250. To turn it into a rough APR, multiply by 2,400: 0.00250 &times; 2,400 = 6% APR. To go the other way, divide the APR by 2,400. If you only know the APR, choose "APR" and the calculator converts it for you.</p>
<div class="tablewrap"><table>
<thead><tr><th>Money factor</th><th>Approximate APR</th></tr></thead>
<tbody>
<tr><td>0.00125</td><td>3%</td></tr>
<tr><td>0.00200</td><td>4.8%</td></tr>
<tr><td>0.00250</td><td>6%</td></tr>
<tr><td>0.00300</td><td>7.2%</td></tr>
</tbody></table></div>

<h2>Limits of this estimate</h2>
<p>This is the standard pre-tax lease formula. It doesn't include sales tax, acquisition or disposition fees, or a down payment (also called a capitalized cost reduction). To include a down payment, subtract it from the vehicle price; to include fees you're financing, add them to the price. Lease terms, residual values and money factors are set by the leasing company, and tax is handled differently in different places, so always check the figures in your actual lease offer.</p>
""",
    faqs=[
        ("Where do I find the residual value and money factor?", "Ask the dealer or leasing company for both; they are set by the lender for each model and term. Residual values are often around 50-60% for a 36-month lease, and money factors change with interest rates and your credit."),
        ("Why is the finance fee based on price plus residual?", "It's a shortcut that gives the average amount of money tied up in the car over the lease. Multiplying that average by the money factor gives the monthly finance charge."),
        ("How do I include a down payment?", "Subtract it from the vehicle price before calculating. A down payment lowers the monthly payment, but you don't get it back if the car is written off, so many people prefer to put little or nothing down on a lease."),
        ("Does this include sales tax?", "No. Many places tax each monthly payment, so multiply the result by (1 + your tax rate) for a rough taxed payment, or check how leases are taxed where you live."),
    ],
)
