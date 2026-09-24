from helpers import *

# The keypad is one 4-column grid throughout. Scientific-only keys come first in the markup
# and are hidden (display:none) until toggled, so hiding/showing them never reflows the
# always-visible numeric pad below into a different column count.
SCI_KEYS = (
    '<button type="button" class="key key-sci" data-k="(">(</button>'
    '<button type="button" class="key key-sci" data-k=")">)</button>'
    '<button type="button" class="key key-sci key-pow" data-k="^">'
    '<span class="pow-glyph">a<span class="pow-x">x</span></span></button>'
    '<button type="button" class="key key-sci" data-k="sqrt(">&radic;</button>'
    '<button type="button" class="key key-sci" data-k="!">!</button>'
    '<button type="button" class="key key-sci" data-k="pi">&pi;</button>'
    '<button type="button" class="key key-sci" data-k="e">e</button>'
    '<button type="button" class="key key-sci" data-k="sin(">sin</button>'
    '<button type="button" class="key key-sci" data-k="cos(">cos</button>'
    '<button type="button" class="key key-sci" data-k="tan(">tan</button>'
    '<button type="button" class="key key-sci" data-k="log(">log</button>'
    '<button type="button" class="key key-sci" data-k="ln(">ln</button>'
)
NUM_KEYS = (
    '<button type="button" class="key op" data-k="AC">AC</button>'
    '<button type="button" class="key op" data-k="DEL">&#9003;</button>'
    '<button type="button" class="key op" data-k="/">&divide;</button>'
    '<button type="button" class="key op" data-k="*">&times;</button>'
    '<button type="button" class="key" data-k="7">7</button>'
    '<button type="button" class="key" data-k="8">8</button>'
    '<button type="button" class="key" data-k="9">9</button>'
    '<button type="button" class="key op" data-k="-">&minus;</button>'
    '<button type="button" class="key" data-k="4">4</button>'
    '<button type="button" class="key" data-k="5">5</button>'
    '<button type="button" class="key" data-k="6">6</button>'
    '<button type="button" class="key op" data-k="+">+</button>'
    '<button type="button" class="key" data-k="1">1</button>'
    '<button type="button" class="key" data-k="2">2</button>'
    '<button type="button" class="key" data-k="3">3</button>'
    '<button type="submit" class="key eq">=</button>'
    '<button type="button" class="key key-zero" data-k="0">0</button>'
    '<button type="button" class="key" data-k=".">.</button>'
)

FORM_HTML = (
    '<form id="calc" class="calc" novalidate data-unit="metric"><div class="grid">'
    '<div class="field wide"><label for="expr">Expression</label>'
    '<input id="expr" type="text" inputmode="text" autocomplete="off"></div>'
    '<div class="field wide">'
    '<button type="button" id="sciToggle" class="btn ghost sci-toggle" aria-pressed="false">Scientific</button>'
    f'<div class="keys">{SCI_KEYS}{NUM_KEYS}</div>'
    '</div>'
    '</div></form>'
    '<div id="result" class="result" aria-live="polite" hidden></div>'
)

PAGE = dict(
    slug="scientific-calculator",
    calc="scientific",
    niche="math",
    icon="🧮",
    nav="Scientific Calculator",
    tile="A full scientific calculator for trigonometry, logarithms, powers, roots and more.",
    title="Scientific Calculator: Trigonometry, Logs, Powers and Roots",
    desc="Free scientific calculator. Type or tap out an expression with trigonometry, logarithms, powers, roots and factorials, and get an instant result.",
    h1="Scientific Calculator",
    intro="A simple calculator by default — tap Scientific to add trigonometry, logarithms, powers, roots, factorials and parentheses. Type an expression or use the keypad, then hit = to calculate.",
    form=FORM_HTML,
    article="""
<h2>What this calculator can do</h2>
<p>It opens as a simple calculator: digits, + &minus; &times; &divide; and =. Tap the <strong>Scientific</strong> button above the keypad to reveal parentheses, trigonometry, logarithms, powers, roots, factorials and the &pi;/e constants, for whenever you need more than basic arithmetic. Type an expression directly, or build one with the keypad, and it evaluates it following the standard order of operations (parentheses first, then powers, then multiplication and division, then addition and subtraction &mdash; PEMDAS). It supports:</p>
<ul>
<li><strong>Basic operators:</strong> + &minus; &times; (or *) &divide; (or /) and parentheses for grouping.</li>
<li><strong>Powers and roots:</strong> <code>^</code> for exponents (e.g. <code>2^10</code>) and <code>sqrt(x)</code> for square roots.</li>
<li><strong>Trigonometry:</strong> <code>sin(x)</code>, <code>cos(x)</code>, <code>tan(x)</code> and their inverses, all in <strong>degrees</strong> (not radians).</li>
<li><strong>Logarithms:</strong> <code>log(x)</code> for base-10 log, <code>ln(x)</code> for natural log.</li>
<li><strong>Factorials:</strong> <code>5!</code> for 5 factorial (5 &times; 4 &times; 3 &times; 2 &times; 1).</li>
<li><strong>Constants:</strong> <code>pi</code> and <code>e</code>.</li>
</ul>

<h2>Order of operations</h2>
<p>Expressions are evaluated with standard mathematical precedence: whatever is inside parentheses is calculated first, then powers and factorials, then multiplication and division (left to right), then addition and subtraction (left to right). For example, <code>2 + 3 * 4</code> is 14, not 20, because multiplication happens before addition. Use parentheses to force a different order, like <code>(2 + 3) * 4</code> for 20.</p>

<h2>Degrees, not radians</h2>
<p>Calculators disagree on whether trigonometric functions default to degrees or radians. This one uses <strong>degrees</strong>, matching what most people expect from a general-purpose calculator and what's taught first in school (so <code>sin(30)</code> gives 0.5, not the radian-mode answer). If you need radians for a specific calculation, convert first: multiply your radian value by <code>180/pi</code> before using it in a trig function here.</p>

<h2>A note on precision</h2>
<p>Like any calculator built on standard floating-point arithmetic, results for some expressions (particularly ones involving irrational numbers like &pi; or repeating decimals) are shown to a limited number of decimal places rather than being mathematically exact. For most everyday and coursework use this makes no practical difference.</p>
""",
    faqs=[
        ("Why does the calculator open in simple mode?", "Most visits only need basic arithmetic, so the calculator opens simple and stays out of the way. Tap Scientific any time to add trigonometry, logs, powers, roots, factorials and parentheses; tap it again to go back to simple."),
        ("Does this use degrees or radians for trig functions?", "Degrees. sin(30) returns 0.5, matching the standard degree-mode convention most calculators default to."),
        ("How do I calculate a square root or a power?", "Use sqrt(x) for a square root, e.g. sqrt(16), and ^ for a power, e.g. 2^8 for 2 to the 8th power."),
        ("Can I use parentheses to control the order of operations?", "Yes. Tap Scientific to reveal the parentheses keys, then (2 + 3) * 4 gives a different result (20) than 2 + 3 * 4 (14)."),
        ("Why do I get an error for something like 5 / 0?", "Division by zero is mathematically undefined, so the calculator shows an error instead of a result, rather than silently returning an incorrect number."),
    ],
)
