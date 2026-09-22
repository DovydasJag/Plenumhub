from helpers import *

FIELDS = (
    unit_toggle() + weight_field()
    + '<div class="field"><label for="exercise">Exercise per day (minutes)</label>'
      '<input id="exercise" type="number" inputmode="numeric" min="0" max="600" step="5" value="30"></div>'
    + '<div class="field"><label for="climate">Climate</label><select id="climate">'
      '<option value="temperate">Temperate or air-conditioned</option>'
      '<option value="hot">Hot or humid</option></select></div>'
)

PAGE = dict(
    slug="water-intake-calculator",
    calc="water",
    icon="💧",
    nav="Water Intake Calculator",
    tile="Estimate how much water you should drink each day based on weight, exercise and climate.",
    title="Water Intake Calculator: How Much Water Should You Drink?",
    desc="Free daily water intake calculator. Get a personalised fluid target in litres or ounces based on your body weight, exercise and climate.",
    h1="Water Intake Calculator",
    intro="Find out roughly how much fluid you need each day based on your body weight, how much you exercise and the climate you live in.",
    form=form(FIELDS, "Calculate water intake"),
    article="""
<h2>How much water do you need?</h2>
<p>You may have heard "eight glasses a day", but your needs depend on your size, activity and environment. A widely used starting point is about 30 to 35 ml of fluid per kilogram of body weight. This calculator uses 33 ml per kg, then adds about 350 ml for every 30 minutes of exercise and 500 ml for a hot or humid climate.</p>
<p>For reference, the U.S. National Academies suggest total daily fluid intakes of roughly 3.7 litres for men and 2.7 litres for women. Those figures include water from all drinks and from food, which supplies about 20% of a typical person's intake.</p>

<h2>What counts towards your fluid intake?</h2>
<p>Plain water is best, but tea, coffee, milk, soups and juices all contribute. Fruits and vegetables such as cucumber, watermelon and oranges are also high in water. Caffeinated drinks have a mild diuretic effect but, in normal amounts, still add to your daily total. Sugary drinks and alcohol are poor choices for hydration because of the added sugar and calories.</p>

<h2>Signs you are drinking enough</h2>
<ul>
<li>Your urine is pale yellow to clear.</li>
<li>You rarely feel thirsty and you urinate regularly through the day.</li>
<li>You have steady energy, and no headaches or dizziness linked to being dry.</li>
</ul>
<p>Dark yellow urine, a dry mouth, fatigue and headaches can suggest you need more. Your thirst is a good guide for most healthy people, and increasing fluids around exercise, in hot weather and when you are ill is sensible.</p>

<h2>Can you drink too much?</h2>
<p>Yes, though it is rare. Drinking very large amounts in a short time can dilute the sodium in your blood, a condition called hyponatremia, which is a particular risk in endurance events. Spread your drinking across the day and do not force fluids well beyond thirst.</p>
<p>Some people need special advice. If you are pregnant, breastfeeding, have kidney, heart or liver disease, or take diuretics, follow your doctor's guidance rather than this estimate. Athletes wanting to eat for performance can also use our <a href="/fitness/calorie-calculator/">calorie calculator</a>.</p>
""",
    faqs=[
        ("Does coffee or tea count towards my water intake?", "Yes. In normal amounts the water in coffee and tea outweighs their mild diuretic effect, so they contribute to your daily fluid total."),
        ("How much water should I drink when exercising?", "A common guideline is 400 to 800 ml per hour of exercise, adjusted for heat, sweat rate and intensity. Start drinking before you feel very thirsty."),
        ("Do I need to drink 8 glasses a day?", "Eight glasses (about 2 litres) is a handy approximation, but the right amount varies. Larger, more active people and those in hot climates need more; smaller, less active people can need less."),
        ("How can I tell if I am dehydrated?", "Dark urine, thirst, dry mouth, headache and tiredness are common early signs. Severe dehydration, with confusion, a racing heart or fainting, needs urgent medical help."),
    ],
)
