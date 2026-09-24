from helpers import *

FIELDS = (
    '<div class="field"><label for="unit">Units</label>'
    '<select id="unit"><option value="metric">Metric (mm, km/h)</option>'
    '<option value="imperial">Imperial (inches, mph)</option></select></div>'
    '<div class="field"><label for="stock">Stock tire size</label>'
    '<input id="stock" type="text" autocomplete="off" spellcheck="false" placeholder="e.g. 225/45R17"></div>'
    '<div class="field"><label for="fitted">New tire size</label>'
    '<input id="fitted" type="text" autocomplete="off" spellcheck="false" placeholder="e.g. 245/40R18"></div>'
)

PAGE = dict(
    slug="tire-size-calculator",
    calc="tiresize",
    niche="automotive",
    icon="🛞",
    nav="Tire Size & Speedometer Calculator",
    tile="Compare two tire sizes and see how a change affects your speedometer.",
    title="Tire Size Calculator: Speedometer Error From New Tires",
    desc="Free tire size calculator. Compare your stock and new tire sizes to see the diameter difference, speedometer error and your actual speed at common speeds.",
    h1="Tire Size & Speedometer Accuracy Calculator",
    intro="Enter your car's original tire size and the size you're thinking of fitting, both as printed on the tire sidewall (for example 225/45R17). You'll see how much bigger or smaller the new tire is and what your speedometer will show compared with your real speed.",
    form=form(FIELDS, "Compare tires"),
    article="""
<h2>Reading a tire size</h2>
<p>A size such as 225/45R17 has three numbers. 225 is the tire's width in millimetres. 45 is the aspect ratio: the sidewall height as a percentage of the width, so 45% of 225 mm = 101.25 mm. R means radial construction, and 17 is the wheel (rim) diameter in inches. Prefixes such as P or LT and speed letters such as ZR are fine to include; the calculator ignores them.</p>

<h2>The formula</h2>
<p>A tire's overall diameter is the wheel plus two sidewalls: diameter = 2 &times; width &times; aspect ratio &divide; 100 + wheel size &times; 25.4 mm. Your speedometer counts wheel turns and assumes the stock diameter, so if the new tire is bigger, you travel further on every turn and go faster than the speedometer shows. Actual speed = speedometer reading &times; new diameter &divide; stock diameter.</p>
<p>For example, 225/45R17 is 2 &times; 225 &times; 0.45 + 17 &times; 25.4 = 202.5 + 431.8 = 634.3 mm tall. 245/40R18 is 196 + 457.2 = 653.2 mm. The new tire is 2.98% bigger, so when your speedometer shows 100 km/h you are really doing about 103 km/h, and at an indicated 60 mph you're doing about 61.8 mph.</p>

<h2>How much difference is OK?</h2>
<p>A common rule of thumb is to keep the new overall diameter within about 3% of the original. Beyond that, the speedometer and odometer become noticeably wrong, and the new tires may rub on the bodywork or suspension, or confuse the ABS and stability control systems. Also check that the new tire fits your wheel width, has the correct load index and speed rating, and is allowed by your car's manufacturer and local rules.</p>

<h2>Limits of this estimate</h2>
<p>The calculation uses the nominal size printed on the tire. Real tires of the same size vary slightly between brands, and a tire's rolling diameter shrinks a little under the car's weight and as the tread wears. Many speedometers are also set to read slightly high from the factory. For an exact figure, compare your speedometer with a GPS speed reading.</p>
""",
    faqs=[
        ("Is a bigger tire bad for my speedometer?", "A bigger tire makes the speedometer read lower than your real speed, which could lead to speeding without realising. A smaller tire makes it read higher. Keeping within about 3% of the original diameter keeps the error small."),
        ("Does the odometer change too?", "Yes, by the same percentage. With a 3% bigger tire, the odometer records about 3% fewer miles or kilometres than you actually drive."),
        ("Can I enter sizes like P225/45R17 or 225/45ZR17?", "Yes. The calculator reads the width, aspect ratio and wheel size and ignores letters such as P, LT, R or ZR. A load index and speed rating on the end, such as 91W, are ignored too."),
        ("Does this work for flotation sizes like 33x12.50R15?", "No. It only reads the standard metric format (width/aspect ratio R wheel size). For flotation sizes, the first number is already the overall diameter in inches."),
    ],
)
