from helpers import *

FIELDS = (
    '<div class="field"><label for="bill">Bill amount</label>'
    '<input id="bill" type="number" inputmode="decimal" min="0" step="0.01" placeholder="e.g. 84.50"></div>'
    '<div class="field"><label for="people">Number of people</label>'
    '<input id="people" type="number" inputmode="numeric" min="1" step="1" value="1"></div>'
    '<div class="field wide"><label for="tip_pct">Tip percent</label>'
    '<input id="tip_pct" type="number" inputmode="decimal" min="0" step="0.1" value="15">'
    '<div class="chips">'
    '<button type="button" class="chip" data-target="tip_pct" data-val="10">10%</button>'
    '<button type="button" class="chip" data-target="tip_pct" data-val="15" aria-pressed="true">15%</button>'
    '<button type="button" class="chip" data-target="tip_pct" data-val="18">18%</button>'
    '<button type="button" class="chip" data-target="tip_pct" data-val="20">20%</button>'
    '<button type="button" class="chip" data-target="tip_pct" data-val="25">25%</button>'
    '</div></div>'
)

PAGE = dict(
    slug="tip-calculator",
    calc="tip",
    niche="money",
    icon="🧾",
    nav="Tip Calculator",
    tile="Work out the tip, total bill, and amount per person when splitting.",
    title="Tip Calculator: Tip Amount, Total and Split Per Person",
    desc="Free tip calculator. Enter the bill amount and tip percent to see the tip, total, and amount per person when splitting between a group.",
    h1="Tip Calculator",
    intro="Enter your bill amount and tip percent to see the tip, the total, and how much each person owes if you're splitting the bill.",
    form=form(FIELDS, "Calculate tip"),
    article="""
<h2>How tipping is calculated</h2>
<p>A tip is a percentage of the bill: tip = bill &times; (percent &divide; 100). The total is the bill plus the tip, and if you're splitting between a group, divide the total by the number of people. For a $84.50 bill with an 18% tip split three ways: tip = 84.50 &times; 0.18 = $15.21, total = $99.71, and each person pays about $33.24.</p>
<p>The quick-select buttons fill in common tip percentages, but you can also type any percentage you like, including 0.</p>

<h2>What percent should I tip?</h2>
<p>Norms vary a lot by country and by service type. In the United States, 15-20% is typical for sit-down restaurant service, with 18-20% common for good service. In many other countries, service is already included in the price or in a mandatory service charge, and an additional tip is smaller or not expected at all. When in doubt, check the menu or bill for a service charge before adding another tip on top.</p>

<h2>Splitting a bill fairly</h2>
<p>Dividing the total evenly is simplest, but it isn't always fair if people ordered very different amounts. Some groups instead calculate each person's share of the food and drink first, then add their share of the tip proportionally. This calculator handles the simple even split; for itemized splitting, add up each person's items separately before tipping.</p>

<h2>Tipping on tax</h2>
<p>Some people tip on the pre-tax subtotal, others on the total including tax. Both are common; there's no single rule. If your receipt already separates tax from the subtotal, you can enter whichever figure you prefer to tip on as the bill amount.</p>
""",
    faqs=[
        ("Is it normal to tip 0%?", "In places where tipping isn't customary, or where service was genuinely poor, yes. Enter 0 in the tip percent field and the calculator will simply show your bill total with no tip added."),
        ("Should I tip on the pre-tax or post-tax amount?", "Either is common practice. Enter whichever amount (pre-tax or post-tax) you want to base the tip on as the bill amount."),
        ("How do I split a tip unevenly?", "This calculator assumes an even split across everyone. For an uneven split, calculate each person's share of the bill separately, then apply the tip percent to each share."),
        ("Does this calculator store my bill amount?", "No. Everything is calculated in your browser and nothing is sent to or stored on our servers."),
    ],
)
