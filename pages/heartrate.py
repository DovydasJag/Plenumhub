from helpers import *

FIELDS = (
    age_field(lo=10, hi=100)
    + '<div class="field"><label for="rest">Resting heart rate (bpm, optional)</label>'
      '<input id="rest" type="number" inputmode="numeric" min="30" max="120" step="1" placeholder="e.g. 62"></div>'
    + '<div class="field wide"><label for="formula">Maximum heart rate formula</label><select id="formula">'
      '<option value="tanaka">Tanaka: 208 - 0.7 x age (more accurate for most adults)</option>'
      '<option value="classic">Classic: 220 - age</option></select></div>'
)

PAGE = dict(
    slug="heart-rate-zones-calculator",
    calc="hrzones",
    icon="❤️",
    nav="Heart Rate Zones Calculator",
    tile="Find your maximum heart rate and target heart rate zones for training.",
    title="Heart Rate Zones Calculator: Max Heart Rate and Training Zones",
    desc="Free heart rate zone calculator. Enter your age (and resting heart rate) to get your maximum heart rate and five training zones in beats per minute.",
    h1="Heart Rate Zones Calculator",
    intro="Work out your maximum heart rate and the five training zones to use for warm-ups, fat burning, cardio and hard intervals.",
    form=form(FIELDS, "Calculate zones"),
    article="""
<h2>What are heart rate zones?</h2>
<p>Heart rate zones divide your effort into five bands, each a percentage of your maximum heart rate. Training in different zones produces different benefits: easy zones build a base and aid recovery, moderate zones improve aerobic fitness, and hard zones raise your top-end speed and power. Most of an endurance athlete's training is done at low intensity, with a smaller share at high intensity.</p>

<h2>The five zones</h2>
<ul>
<li><strong>Zone 1 (50 to 60%):</strong> very light. Warm-ups, cool-downs and recovery days.</li>
<li><strong>Zone 2 (60 to 70%):</strong> light. You can hold a conversation easily. This builds aerobic base and fat-burning ability, and is the backbone of most training plans.</li>
<li><strong>Zone 3 (70 to 80%):</strong> moderate. Breathing is deeper; you can speak in short sentences. Improves general cardio fitness.</li>
<li><strong>Zone 4 (80 to 90%):</strong> hard. Speech is limited to a few words. Raises your lactate threshold, so you can sustain faster paces.</li>
<li><strong>Zone 5 (90 to 100%):</strong> maximum. Sprint intervals of seconds to a few minutes only.</li>
</ul>

<h2>Estimating your maximum heart rate</h2>
<p>The old rule of thumb is 220 minus your age. It is simple but tends to underestimate the maximum heart rate of older adults. The Tanaka formula (208 &minus; 0.7 &times; age), based on a large analysis published in 2001, is generally more accurate for adults, so it is the default here. Even so, individual maximums can differ from the formula by 10 to 12 beats per minute either way. The most accurate way to find yours is a supervised maximal exercise test.</p>

<h2>Why add a resting heart rate?</h2>
<p>If you enter your resting heart rate, the calculator uses the <strong>Karvonen method</strong>. This calculates zones as a percentage of your heart rate <em>reserve</em> (maximum minus resting), then adds your resting rate back. Because fitter people have lower resting rates, the zones are tailored to you. Measure your resting heart rate first thing in the morning, before getting out of bed, over two or three days, and average the readings.</p>

<h2>Safety</h2>
<p>If you have a heart condition, take medication such as beta blockers, are pregnant, or are new to exercise, ask your doctor before training at high intensity. Heart rate targets are only estimates; if you feel dizzy, get chest pain or become unusually short of breath, stop and seek medical advice. Looking to pair training with nutrition? Try the <a href="/calorie-calculator/">calorie calculator</a>.</p>
""",
    faqs=[
        ("What is a good resting heart rate?", "For most adults, a resting heart rate of 60 to 100 beats per minute is normal. Well-trained athletes often have rates in the 40s or 50s."),
        ("Which zone burns the most fat?", "Zone 2 burns the highest proportion of fat as fuel, but higher zones burn more total calories per minute. A mix of both is usually best for fitness and weight management."),
        ("Are wrist heart rate monitors accurate?", "Optical wrist sensors are good at steady-state exercise but less reliable during intervals or in cold weather. A chest strap is more accurate."),
        ("How do I use the zones?", "Check your watch or monitor during a workout and adjust your pace to stay in the zone you are aiming for. Combine with how hard it feels: you should be able to talk comfortably in Zones 1 and 2."),
    ],
)
