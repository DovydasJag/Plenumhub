from helpers import *

FIELDS = (
    '<div class="field"><label for="dob">Date of birth</label>'
    '<input id="dob" type="date"></div>'
    '<div class="field"><label for="asof">Calculate age as of (optional)</label>'
    '<input id="asof" type="date"></div>'
)

PAGE = dict(
    slug="age-calculator",
    calc="age",
    niche="time",
    icon="🎂",
    nav="Age Calculator",
    tile="Find your exact age in years, months and days, plus your next birthday countdown.",
    title="Age Calculator: Exact Age in Years, Months and Days",
    desc="Free age calculator. Enter your date of birth to see your exact age in years, months and days, total days and weeks alive, and a countdown to your next birthday.",
    h1="Age Calculator",
    intro="Enter your date of birth to see your exact age, how many days and weeks you've been alive, and how long until your next birthday. Leave the second date blank to use today.",
    form=form(FIELDS, "Calculate age"),
    article="""
<h2>How exact age is worked out</h2>
<p>Your age in years, months and days is found by comparing your date of birth to the reference date (today, unless you enter a different one) using calendar-accurate day arithmetic: it accounts for the real number of days in each month and for leap years, rather than assuming every month is 30 days. That's why this calculator gives the same answer as counting on a calendar by hand, month by month.</p>
<p>Total days and weeks alive are a straight count of days between the two dates, so they don't depend on calendar quirks the way the years/months/days breakdown does.</p>

<h2>Birthdays on 29 February</h2>
<p>If you were born on 29 February, most years don't have that date at all. This calculator follows the standard convention used by calendar systems: in a non-leap year, your "birthday" for the purposes of a next-birthday countdown falls on 1 March, since 29 February doesn't exist that year. Every four years, when 29 February returns, your birthday lands back on the original date.</p>

<h2>Why not just subtract dates?</h2>
<p>A naive subtraction of dates (treating every month as, say, 30 days) gives wrong answers for most date pairs, because real months are 28 to 31 days long. This calculator uses proper calendar math instead: it borrows days from the actual previous month's length and accounts for leap years automatically, so results for someone born on 29 February or 31 January are just as accurate as for any other date.</p>

<h2>Related</h2>
<p>Want the time between two dates that aren't a birthday, like a work anniversary or a countdown to an event? Use our <a href="/time/date-calculator/">days between dates calculator</a>.</p>
""",
    faqs=[
        ("Why does my age in years, months and days look different from just subtracting years?", "Because months have different lengths and leap years shift things, a plain year subtraction can be off by a month or a day around your birthday. This calculator counts exact calendar days instead."),
        ("What happens if I was born on 29 February?", "In non-leap years, your birthday is treated as 1 March for the next-birthday countdown, which is the standard convention since 29 February doesn't exist that year."),
        ("What if I don't enter an 'as of' date?", "The calculator uses today's date automatically."),
        ("Can I calculate someone else's age, or an age at a specific past date?", "Yes. Enter their date of birth, and enter the date you want the age calculated as of instead of leaving it blank."),
    ],
)
