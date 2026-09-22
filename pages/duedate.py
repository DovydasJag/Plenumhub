from helpers import *

FIELDS = (
    '<div class="field"><label for="lmp">First day of your last period</label>'
    '<input id="lmp" type="date"></div>'
    '<div class="field"><label for="cycle">Average cycle length (days)</label>'
    '<input id="cycle" type="number" inputmode="numeric" min="20" max="45" step="1" value="28"></div>'
)

PAGE = dict(
    slug="pregnancy-due-date-calculator",
    calc="duedate",
    icon="🤰",
    nav="Pregnancy Due Date Calculator",
    tile="Estimate your due date from the first day of your last period, with key pregnancy milestones.",
    title="Pregnancy Due Date Calculator: Estimate Your Due Date",
    desc="Free due date calculator. Enter the first day of your last period and cycle length to estimate your due date, current week of pregnancy and trimester dates.",
    h1="Pregnancy Due Date Calculator",
    intro="Enter the first day of your last menstrual period to estimate your due date, how far along you are, and when each trimester begins.",
    form=form(FIELDS, "Calculate due date"),
    article="""
<h2>How your due date is calculated</h2>
<p>This calculator uses <strong>Naegele's rule</strong>, the method most doctors and midwives use. Pregnancy is counted as 40 weeks (280 days) from the first day of your last menstrual period (LMP). For a typical 28-day cycle, that works out to about the same as adding one year, subtracting three months and adding seven days to the LMP date (the day count is the exact method; the month shortcut can be off by a day or two).</p>
<p>If your cycles are longer or shorter than 28 days, ovulation usually happens later or earlier than day 14, which moves your due date accordingly. The calculator adjusts by the difference between your cycle length and 28 days, for example adding 2 days for a 30-day cycle.</p>

<h2>Why 40 weeks if conception is around week 2?</h2>
<p>Pregnancy is dated from the LMP because that is a date most people know, while the moment of conception is not. Ovulation and conception normally happen about two weeks after the LMP, so a baby is only about 38 weeks old at the due date, even though it is called week 40 of pregnancy.</p>

<h2>Trimesters at a glance</h2>
<ul>
<li><strong>First trimester:</strong> weeks 1 to 13. Baby's organs begin to form. Nausea and tiredness are common.</li>
<li><strong>Second trimester:</strong> weeks 14 to 27. Often the most comfortable stage; you may feel first movements and have your main anatomy scan around weeks 18 to 22.</li>
<li><strong>Third trimester:</strong> weeks 28 to birth. Baby gains weight quickly and gets into position for birth.</li>
</ul>
<p>A baby is considered early term at 37 to 38 weeks, full term at 39 to 40 weeks, and late term at 41 weeks. Only about 4% of babies are born on their exact due date; most arrive within two weeks either side.</p>

<h2>When the estimate may change</h2>
<p>An LMP-based date assumes a regular cycle and that you remember the date correctly. If your cycles are irregular, you conceived while breastfeeding or after stopping hormonal contraception, or you are unsure of the date, your due date may be revised after an early ultrasound. If the scan and LMP dates are more than a week or so apart, clinicians usually use the scan date. Always follow the date given by your healthcare provider.</p>
""",
    faqs=[
        ("How accurate is a due date?", "It is an estimate. Only around 4% of babies are born on the due date, and it is normal to deliver anywhere from about 37 to 42 weeks."),
        ("What if I don't know my last period date?", "Book an early ultrasound with your doctor or midwife. Measuring the baby in the first trimester gives a reliable due date."),
        ("Does cycle length matter?", "Yes. Naegele's rule assumes a 28-day cycle with ovulation on day 14. If your cycle is longer or shorter, ovulation shifts by the same number of days, so the due date does too."),
        ("How many weeks pregnant am I?", "The calculator shows your current gestational age in weeks and days, counted from your LMP and adjusted for cycle length. Your provider may use a scan-based date instead."),
    ],
)
