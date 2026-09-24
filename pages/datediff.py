from helpers import *

FIELDS = (
    '<div class="field"><label for="date1">First date</label>'
    '<input id="date1" type="date"></div>'
    '<div class="field"><label for="date2">Second date</label>'
    '<input id="date2" type="date"></div>'
)

PAGE = dict(
    slug="date-calculator",
    calc="datediff",
    niche="time",
    icon="🗓️",
    nav="Days Between Dates Calculator",
    tile="Find the exact number of days, weeks and months between any two dates.",
    title="Days Between Dates Calculator: Time Between Two Dates",
    desc="Free days between dates calculator. Enter two dates to see the exact number of days, weeks and months between them, in either order.",
    h1="Days Between Dates Calculator",
    intro="Enter any two dates to see exactly how much time is between them, in total days, weeks and months, plus a years/months/days breakdown.",
    form=form(FIELDS, "Calculate difference"),
    article="""
<h2>How the difference is calculated</h2>
<p>The calculator counts the exact number of calendar days between your two dates, then also expresses that gap as total weeks, an approximate total months figure, and a years/months/days breakdown. The breakdown uses calendar-accurate arithmetic: it accounts for the real length of each month and for leap years, so it works the same whether you're measuring three days or thirty years.</p>
<p>You can enter the dates in either order. If the second date is earlier than the first, the calculator still shows the gap between them (and lets you know the order was reversed).</p>

<h2>Total days vs. the years/months/days breakdown</h2>
<p>Total days is a simple, unambiguous count. The years/months/days breakdown is more readable for long gaps (for example, "2 years, 3 months, 10 days" instead of "833 days"), but because months vary in length, two gaps with the same total number of days can show a slightly different months/days split depending on which calendar months they cross. Both figures are correct; they just answer the question in different units.</p>

<h2>Common uses</h2>
<p>People use a days-between-dates calculator for project deadlines, contract and notice periods, work anniversaries, countdowns to events like weddings or trips, and figuring out someone's age at a specific past date (for that specific case, our <a href="/time/age-calculator/">age calculator</a> also adds a next-birthday countdown).</p>
""",
    faqs=[
        ("Does it matter which date I enter first?", "No. If the second date is earlier than the first, the calculator still works and tells you the order was reversed."),
        ("Are both dates counted (inclusive), or is it the gap between them?", "This calculator gives the gap between the two dates (an exclusive count), which matches how most people mean 'days between'. For example, 1 January to 3 January is 2 days apart."),
        ("Why do the total months and the years/months/days breakdown look inconsistent for some dates?", "Total months is years x 12 plus the leftover months from the breakdown, so it will always match the breakdown for that specific pair of dates; it can look different from a rough total-days-divided-by-30 estimate because real months aren't 30 days."),
        ("Can I use this for a date far in the future or past?", "Yes, any two valid calendar dates work, including dates decades apart."),
    ],
)
