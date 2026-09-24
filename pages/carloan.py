from helpers import *

FIELDS = (
    '<div class="field"><label for="amount">Loan amount</label>'
    '<input id="amount" type="number" inputmode="decimal" min="0" step="100" placeholder="e.g. 30000"></div>'
    '<div class="field"><label for="apr">Interest rate (APR %)</label>'
    '<input id="apr" type="number" inputmode="decimal" min="0" max="50" step="0.01" placeholder="e.g. 6.5"></div>'
    '<div class="field"><label for="term">Loan term (months)</label>'
    '<input id="term" type="number" inputmode="numeric" min="1" max="120" step="1" value="60"></div>'
)

PAGE = dict(
    slug="car-loan-calculator",
    calc="carloan",
    niche="automotive",
    icon="🏦",
    nav="Car Loan Calculator",
    tile="Your monthly car payment, total interest and total amount repaid.",
    title="Car Loan Calculator: Monthly Payment and Total Interest",
    desc="Free car loan calculator. Enter the loan amount, APR and term to see your monthly payment, total interest and a year-by-year repayment breakdown.",
    h1="Car Loan Payment Calculator",
    intro="Enter how much you're borrowing, the interest rate and the loan term to see your monthly payment, how much interest you'll pay in total, and how the balance goes down each year.",
    form=form(FIELDS, "Calculate payment"),
    article="""
<h2>The formula</h2>
<p>Car loans are usually amortized: you pay the same amount every month, and each payment covers that month's interest plus some of the loan. The standard formula is: payment = P &times; r &divide; (1 &minus; (1 + r)<sup>&minus;n</sup>), where P is the amount borrowed, r is the monthly interest rate (APR &divide; 12 &divide; 100) and n is the number of monthly payments.</p>
<p>For example, borrowing $30,000 at 6.5% APR over 60 months: r = 6.5 &divide; 1200 = 0.005417, and the payment works out to $586.98 a month. Over 60 payments you repay $35,219.07, so the total interest is $5,219.07. If the APR is 0%, the payment is simply the loan divided by the number of months.</p>

<h2>How the term changes what you pay</h2>
<div class="tablewrap"><table>
<thead><tr><th>$30,000 at 6.5% APR</th><th>Monthly payment</th><th>Total interest</th></tr></thead>
<tbody>
<tr><td>36 months</td><td>$919.47</td><td>$3,100.92</td></tr>
<tr><td>48 months</td><td>$711.45</td><td>$4,149.53</td></tr>
<tr><td>60 months</td><td>$586.98</td><td>$5,219.07</td></tr>
<tr><td>72 months</td><td>$504.30</td><td>$6,309.45</td></tr>
<tr><td>84 months</td><td>$445.48</td><td>$7,420.58</td></tr>
</tbody></table></div>
<p>A longer term lowers the monthly payment but increases the total interest. It also means you owe more than the car is worth for longer, because cars lose value fastest in their first few years.</p>

<h2>Limits of this estimate</h2>
<p>This calculator assumes a fixed rate, equal monthly payments and no early repayments. It doesn't include sales tax, registration, dealer fees or add-ons such as extended warranties unless you add them to the loan amount. Your lender's figures may differ slightly because of rounding or how they count days. Check the APR and total amount payable on your actual loan offer before signing.</p>
""",
    faqs=[
        ("Should I include my down payment?", "Enter the amount you're actually borrowing: the car's price minus your down payment and any trade-in value, plus any fees or taxes you're rolling into the loan."),
        ("What's the difference between APR and interest rate?", "APR (annual percentage rate) includes some fees on top of the basic interest rate, so it's the better figure for comparing loan offers. If your offer only shows an interest rate, enter that; the result will be slightly lower than your true cost if there are fees."),
        ("Does paying extra each month help?", "Yes. Extra payments go straight to the balance, which cuts the interest you pay and ends the loan sooner. This calculator shows the standard schedule without extra payments."),
        ("Why does most of my early payment go to interest?", "Interest is charged on the balance you still owe, which is highest at the start. As the balance falls, less of each payment goes to interest and more goes to paying off the loan, as the year-by-year table shows."),
    ],
)
