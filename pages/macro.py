from helpers import *

DIET = (
    '<div class="field wide"><label for="diet">Diet style</label><select id="diet">'
    '<option value="30,40,30">Balanced: 30% protein, 40% carbs, 30% fat</option>'
    '<option value="35,35,30">High protein: 35% protein, 35% carbs, 30% fat</option>'
    '<option value="30,25,45">Lower carb: 30% protein, 25% carbs, 45% fat</option>'
    '<option value="20,55,25">Endurance: 20% protein, 55% carbs, 25% fat</option>'
    '<option value="25,5,70">Keto: 25% protein, 5% carbs, 70% fat</option>'
    '</select></div>'
)

FIELDS = (
    '<div class="field"><label for="cal">Daily calories</label>'
    '<input id="cal" type="number" inputmode="numeric" min="800" max="8000" step="10" placeholder="e.g. 2200"></div>'
    '<div class="field"><label for="meals">Meals per day</label>'
    '<input id="meals" type="number" inputmode="numeric" min="1" max="10" step="1" value="3"></div>'
) + DIET

PAGE = dict(
    slug="macro-calculator",
    calc="macro",
    icon="🥗",
    nav="Macro Calculator",
    tile="Turn a calorie target into daily grams of protein, carbs and fat.",
    title="Macro Calculator: Daily Protein, Carbs and Fat in Grams",
    desc="Free macro calculator. Enter your calorie target and diet style to get daily grams of protein, carbohydrates and fat, plus a per-meal breakdown.",
    h1="Macro Calculator",
    intro="Turn your daily calorie target into grams of protein, carbohydrates and fat. Not sure of your calories? Use the <a href=\"/calorie-calculator/\">calorie calculator</a> first.",
    form=form(FIELDS, "Calculate macros"),
    article="""
<h2>What are macros?</h2>
<p>Macronutrients are the three nutrients that supply calories: protein, carbohydrates and fat. Protein and carbohydrates each give 4 calories per gram, and fat gives 9 calories per gram. Counting macros, rather than only calories, lets you control the quality of what you eat as well as the quantity.</p>

<h2>What each macro does</h2>
<ul>
<li><strong>Protein</strong> repairs and builds muscle and keeps you full. Many active adults do well with roughly 1.2 to 2.0 grams per kilogram of body weight per day; the calculator's protein figure gives you a quick sanity check against that.</li>
<li><strong>Carbohydrates</strong> are the body's preferred fuel for hard exercise and for the brain. Endurance athletes typically eat more of them.</li>
<li><strong>Fat</strong> supports hormone production and the absorption of vitamins A, D, E and K. Most guidelines suggest fat make up around 20 to 35% of calories.</li>
</ul>

<h2>Choosing a split</h2>
<p>There is no single best ratio. The <strong>balanced</strong> and <strong>high-protein</strong> options suit most people who are lifting weights or dieting, because higher protein helps preserve muscle and appetite control. A <strong>lower-carb</strong> split can suit people who feel better with fewer starchy foods. The <strong>endurance</strong> split gives more fuel for long runs, rides and swims. A <strong>keto</strong> split is very restrictive and works only if you stay consistent; speak to a doctor first if you have diabetes, kidney problems or take medication.</p>
<p>Whatever you choose, the most important factor is the one you can stick to. Adherence beats the perfect ratio.</p>

<h2>Using the per-meal numbers</h2>
<p>Dividing your daily grams across meals is a simple way to plan your day. It does not need to be exact: hitting your daily total within about 5 to 10 grams is fine. Spreading protein across your meals rather than eating most of it at dinner may also help your body use it more effectively.</p>
""",
    faqs=[
        ("How many grams of protein do I need?", "A common range for active adults is 1.2 to 2.0 g per kg of body weight per day (about 0.5 to 0.9 g per lb). Sedentary adults need less, with a minimum recommendation of 0.8 g per kg."),
        ("Do I need to hit my macros exactly?", "No. Aim to land within roughly 5 to 10% of your targets on most days. Consistency over weeks matters far more than precision on any single day."),
        ("Are macros or calories more important?", "For changing your weight, total calories matter most. Macros affect how full you feel, how well you keep muscle, and how you perform in training."),
        ("How do I track macros?", "Weigh or measure your food and log it in a nutrition app. Many apps have barcode scanners and large food databases, which makes tracking quick after the first week."),
    ],
)
