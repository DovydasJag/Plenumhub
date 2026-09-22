"""Reusable HTML snippets for the calculator forms."""


def unit_toggle():
    return (
        '<div class="field"><label for="unit">Units</label>'
        '<select id="unit"><option value="metric">Metric (kg, cm)</option>'
        '<option value="imperial">Imperial (lb, ft/in)</option></select></div>'
    )


def sex_field():
    return (
        '<div class="field"><label for="sex">Sex</label>'
        '<select id="sex"><option value="male">Male</option>'
        '<option value="female">Female</option></select></div>'
    )


def age_field(default="", label="Age (years)", lo=15, hi=100):
    return (
        f'<div class="field"><label for="age">{label}</label>'
        f'<input id="age" type="number" inputmode="numeric" min="{lo}" max="{hi}" '
        f'step="1" value="{default}" placeholder="e.g. 30"></div>'
    )


def weight_field(label="Weight"):
    return (
        f'<div class="field u-metric"><label for="w_kg">{label} (kg)</label>'
        '<input id="w_kg" type="number" inputmode="decimal" min="20" max="400" step="0.1" placeholder="e.g. 70"></div>'
        f'<div class="field u-imperial"><label for="w_lb">{label} (lb)</label>'
        '<input id="w_lb" type="number" inputmode="decimal" min="44" max="880" step="0.1" placeholder="e.g. 154"></div>'
    )


def height_field():
    return (
        '<div class="field u-metric"><label for="h_cm">Height (cm)</label>'
        '<input id="h_cm" type="number" inputmode="decimal" min="100" max="250" step="0.1" placeholder="e.g. 175"></div>'
        '<div class="field u-imperial"><span class="lbl">Height</span>'
        '<div class="pair"><input id="h_ft" type="number" inputmode="numeric" min="3" max="8" step="1" '
        'placeholder="ft" aria-label="Height, feet">'
        '<input id="h_in" type="number" inputmode="decimal" min="0" max="11.9" step="0.1" '
        'placeholder="in" aria-label="Height, inches"></div></div>'
    )


def length_field(key, label, extra_class=""):
    """Circumference-style measurement stored as {key}_cm / {key}_in."""
    cls = f" {extra_class}" if extra_class else ""
    return (
        f'<div class="field u-metric{cls}"><label for="{key}_cm">{label} (cm)</label>'
        f'<input id="{key}_cm" type="number" inputmode="decimal" min="10" max="250" step="0.1"></div>'
        f'<div class="field u-imperial{cls}"><label for="{key}_in">{label} (in)</label>'
        f'<input id="{key}_in" type="number" inputmode="decimal" min="4" max="100" step="0.1"></div>'
    )


def activity_field():
    return (
        '<div class="field wide"><label for="activity">Activity level</label>'
        '<select id="activity">'
        '<option value="1.2">Sedentary: desk job, little or no exercise</option>'
        '<option value="1.375">Lightly active: exercise 1-3 days a week</option>'
        '<option value="1.55" selected>Moderately active: exercise 3-5 days a week</option>'
        '<option value="1.725">Very active: hard exercise 6-7 days a week</option>'
        '<option value="1.9">Extra active: physical job plus hard training</option>'
        '</select></div>'
    )


def form(fields_html, submit="Calculate"):
    return (
        '<form id="calc" class="calc" novalidate data-unit="metric">'
        f'<div class="grid">{fields_html}</div>'
        f'<div class="actions"><button class="btn" type="submit">{submit}</button>'
        '<button class="btn ghost" type="reset">Reset</button></div></form>'
        '<div id="result" class="result" aria-live="polite" hidden></div>'
    )
