#!/usr/bin/env python3
"""Static site generator.

Usage:
  python3 build.py --name "Your Site Name" --domain https://yourdomain.com --email you@yourdomain.com

Legal details for the Privacy Policy, Terms and Contact pages (a highlighted placeholder is shown until set):
  --operator "Your Name or Company" --address "Street, City, Postcode" --country Lithuania --host Cloudflare

Ads: put your ad network's <head> script in  ads_head.html  and one ad unit in  ad_unit.html
(both next to this file), then rebuild. Until those files exist, no ad slots are rendered.
Consent: put your consent tool's <head> script in  consent_head.html. It loads before the ad script, and a
"Privacy and cookie settings" link is added to the footer. Required before ads go live for EEA/UK/Swiss visitors.
"""
import argparse
import datetime
import glob
import html
import importlib.util
import json
import os
import shutil
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)

NICHES = [
    {"slug": "fitness", "name": "Fitness", "icon": "💪",
     "tagline": "Free health & fitness calculators",
     "tile": "Weight, nutrition, fitness and pregnancy calculators with plain-English explanations.",
     "lead": "Simple, private calculators for weight, nutrition, fitness and pregnancy. Every result comes with a plain-English explanation of how it was worked out and what it means.",
     "desc": "Free BMI, calorie, macro, body fat, ideal weight, water intake, due date and heart rate zone calculators with clear explanations."},
]
NICHE_BY_SLUG = {n["slug"]: n for n in NICHES}

ap = argparse.ArgumentParser()
ap.add_argument("--name", default="PlenumHub", help="Site name shown in header/footer")
ap.add_argument("--domain", default="https://example.com", help="Full https:// domain, no trailing slash")
ap.add_argument("--email", default="contact@example.com", help="Public contact email for the Contact page")
ap.add_argument("--operator", default="", help="Person or company that runs the site (Privacy Policy, Terms, Contact)")
ap.add_argument("--address", default="", help="Postal address of the operator; a business address or PO box is fine")
ap.add_argument("--country", default="", help="Country whose law governs the Terms of Use, e.g. Lithuania")
ap.add_argument("--host", default="", help="Hosting provider named in the Privacy Policy, e.g. Cloudflare")
ap.add_argument("--out", default=os.path.join(ROOT, "dist"))
args = ap.parse_args()

NAME = args.name
DOMAIN = args.domain.rstrip("/")
EMAIL = args.email
OUT = args.out
TODAY = datetime.date.today()
YEAR = TODAY.year
UPDATED = TODAY.strftime("%B %d, %Y").replace(" 0", " ")


def read_optional(name):
    p = os.path.join(ROOT, name)
    if os.path.exists(p):
        with open(p, encoding="utf-8-sig") as f:  # -sig: tolerate the BOM some Windows editors add
            return f.read().strip()
    return ""


ADS_HEAD = read_optional("ads_head.html")
AD_UNIT = read_optional("ad_unit.html")
CONSENT_HEAD = read_optional("consent_head.html")

MISSING = []


def legal(value, label):
    """Escaped value, or a highlighted placeholder (also recorded) so unfinished legal details can't go live unnoticed."""
    if value:
        return html.escape(value)
    if label not in MISSING:
        MISSING.append(label)
    return f'<mark class="todo">[{label}]</mark>'


def load_pages():
    pages = []
    for path in sorted(glob.glob(os.path.join(ROOT, "pages", "*.py"))):
        spec = importlib.util.spec_from_file_location(os.path.basename(path)[:-3], path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        page = mod.PAGE
        page.setdefault("kind", "calc")
        if page["kind"] == "calc":
            page.setdefault("niche", "fitness")
        pages.append(page)
    return pages


def e(s):
    return html.escape(s, quote=True)


def ico(p):
    """Decorative emoji shown next to a calculator's or niche's name (hidden from screen readers)."""
    return f'<span class="ico" aria-hidden="true">{p["icon"]}</span>' if p.get("icon") else ""


def ad_slot():
    return f'<div class="ad-slot">{AD_UNIT}</div>' if AD_UNIT else ""


def layout(*, title, desc, path, body, calc=None, schema=None, noindex=False):
    url = f"{DOMAIN}{path}"
    full_title = title if path == "/" else f"{title} | {NAME}"
    calc_attr = f' data-calc="{calc}"' if calc else ""
    scripts = '<script src="/assets/calc.js" defer></script>' if calc else ""
    if CONSENT_HEAD:
        scripts += '<script src="/assets/consent.js" defer></script>'
    ld = f'<script type="application/ld+json">{json.dumps(schema)}</script>' if schema else ""
    robots = '<meta name="robots" content="noindex">' if noindex else ""
    # Google requires a link titled "Privacy and cookie settings" so visitors can change or withdraw consent.
    privacy_link = ('<a href="/privacy-policy/#consent" data-privacy-settings>Privacy and cookie settings</a>'
                    if CONSENT_HEAD else "")
    niche_nav = "".join(f'<a href="/{n["slug"]}/">{e(n["name"])}</a>' for n in NICHES)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(full_title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
{robots}
<meta property="og:type" content="website">
<meta property="og:title" content="{e(full_title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="{e(NAME)}">
<meta name="theme-color" content="#0f766e">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/style.css">
{CONSENT_HEAD}
{ADS_HEAD}
{ld}
</head>
<body{calc_attr}>
<header class="site"><div class="wrap">
<a class="logo" href="/">{e(NAME)}</a>
<nav class="top" aria-label="Main">{niche_nav}<a href="/about/">About</a></nav>
</div></header>
<main><div class="wrap">
{body}
</div></main>
<footer class="site"><div class="wrap">
<a href="/about/">About</a><a href="/contact/">Contact</a><a href="/privacy-policy/">Privacy Policy</a><a href="/terms-of-use/">Terms of Use</a><a href="/medical-disclaimer/">Medical Disclaimer</a>{privacy_link}
<p>&copy; {YEAR} {e(NAME)}. For information only; not medical advice.</p>
</div></footer>
{scripts}
</body>
</html>
"""


def write(path, content):
    target = os.path.join(OUT, path.strip("/"), "index.html") if path != "/" else os.path.join(OUT, "index.html")
    os.makedirs(os.path.dirname(target), exist_ok=True)
    with open(target, "w", encoding="utf-8") as f:
        f.write(content)


def build_calc(p, all_pages):
    niche = NICHE_BY_SLUG[p["niche"]]
    path = f"/{p['niche']}/{p['slug']}/"
    faq_html = "".join(
        f"<details><summary>{e(q)}</summary><p>{a}</p></details>" for q, a in p["faqs"]
    )
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": html.unescape(a.replace("<em>", "").replace("</em>", ""))}}
            for q, a in p["faqs"]
        ],
    }
    related = "".join(
        f'<a href="/{o["niche"]}/{o["slug"]}/">{ico(o)}{e(o["nav"])}</a>' for o in all_pages
        if o["kind"] == "calc" and o["niche"] == p["niche"] and o["slug"] != p["slug"]
    )
    body = f"""
<div class="crumbs"><a href="/">Home</a> &rsaquo; <a href="/{niche['slug']}/">{e(niche['name'])}</a> &rsaquo; {e(p['nav'])}</div>
<h1>{ico(p)}{e(p['h1'])}</h1>
<p class="lead">{p['intro']}</p>
<section class="card" aria-label="Calculator">
{p['form']}
</section>
{ad_slot()}
<article class="prose">
{p['article']}
<h2>Frequently asked questions</h2>
<div class="faq">{faq_html}</div>
</article>
{ad_slot()}
<div class="disclaimer"><strong>Not medical advice.</strong> This calculator gives general estimates for adults and is not a substitute for professional advice. Speak to a doctor or registered dietitian before making significant changes to your diet or exercise, especially if you have a medical condition or are pregnant. <a href="/medical-disclaimer/">Read the full disclaimer</a>.</div>
<h2>More calculators</h2>
<div class="related">{related}</div>
"""
    write(path, layout(title=p["title"], desc=p["desc"], path=path, body=body, calc=p["calc"], schema=schema))


def build_home():
    tiles = "".join(
        f'<a class="tile" href="/{n["slug"]}/"><h3>{ico(n)}{e(n["name"])}</h3><p>{e(n["tile"])}</p></a>'
        for n in NICHES
    )
    body = f"""
<h1>{e(NAME)}: free calculators and tools</h1>
<p class="lead">Simple, private tools with plain-English explanations of how each result was worked out and what it means.</p>
<div class="tiles">{tiles}</div>
<article class="prose">
<h2>Everything is calculated in your browser</h2>
<p>The numbers you type in are not sent to our servers or stored.</p>
</article>
"""
    schema = {"@context": "https://schema.org", "@type": "WebSite", "name": NAME, "url": DOMAIN + "/"}
    write("/", layout(title=f"{NAME}: Free Calculators and Tools",
                      desc=f"{NAME} offers free, private calculators across several topics, starting with health and fitness.",
                      path="/", body=body, schema=schema))


def build_niche_home(niche, pages_in_niche):
    tiles = "".join(
        f'<a class="tile" href="/{niche["slug"]}/{p["slug"]}/"><h3>{ico(p)}{e(p["nav"])}</h3><p>{e(p["tile"])}</p></a>'
        for p in pages_in_niche
    )
    body = f"""
<div class="crumbs"><a href="/">Home</a> &rsaquo; {e(niche['name'])}</div>
<h1>{e(niche['tagline'])}</h1>
<p class="lead">{niche['lead']}</p>
<div class="tiles">{tiles}</div>
{ad_slot()}
<article class="prose">
<h2>How these calculators work</h2>
<p>Each tool uses a published, widely used formula, such as the Mifflin-St Jeor equation for calorie needs or the U.S. Navy method for body fat. Every page explains the formula, its limits, and how to interpret your result.</p>
<p>Everything is calculated in your browser. The numbers you type in are not sent to our servers or stored.</p>
<h2>Please read</h2>
<p>These tools give estimates for healthy adults. They cannot diagnose or treat any condition. For personal medical advice, talk to a qualified healthcare professional.</p>
</article>
"""
    path = f"/{niche['slug']}/"
    schema = {"@context": "https://schema.org", "@type": "CollectionPage", "name": niche["tagline"], "url": DOMAIN + path}
    write(path, layout(title=f"{niche['tagline']}", desc=niche["desc"], path=path, body=body, schema=schema))


def build_static(p):
    path = f"/{p['slug']}/"
    body = f"""
<div class="crumbs"><a href="/">Home</a> &rsaquo; {e(p['h1'])}</div>
<h1>{e(p['h1'])}</h1>
<article class="prose">{p['article']}</article>
"""
    write(path, layout(title=p["title"], desc=p["desc"], path=path, body=body))


def main():
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, "assets"))
    for f in os.listdir(os.path.join(ROOT, "static")):
        shutil.copy(os.path.join(ROOT, "static", f), os.path.join(OUT, "assets", f))

    pages = load_pages()
    # Order calculators as listed in ORDER for the homepage
    order = ["bmi-calculator", "calorie-calculator", "macro-calculator", "body-fat-calculator",
             "ideal-weight-calculator", "water-intake-calculator", "pregnancy-due-date-calculator",
             "heart-rate-zones-calculator"]
    pages.sort(key=lambda p: order.index(p["slug"]) if p["slug"] in order else 99)

    build_home()
    for niche in NICHES:
        build_niche_home(niche, [p for p in pages if p["kind"] == "calc" and p["niche"] == niche["slug"]])
    for p in pages:
        if p["kind"] == "calc":
            build_calc(p, pages)
        else:
            build_static(p)

    # 404
    with open(os.path.join(OUT, "404.html"), "w", encoding="utf-8") as f:
        f.write(layout(
            title="Page not found", desc="Page not found.", path="/404.html", noindex=True,
            body='<h1>Page not found</h1><p class="lead">That page does not exist. Try one of our tools instead.</p><p><a class="btn" href="/">See all tools</a></p>'))

    # robots + sitemap
    with open(os.path.join(OUT, "robots.txt"), "w") as f:
        f.write(f"User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n")
    urls = (["/"] + [f"/{n['slug']}/" for n in NICHES]
            + [f"/{p['niche']}/{p['slug']}/" if p["kind"] == "calc" else f"/{p['slug']}/" for p in pages])
    with open(os.path.join(OUT, "sitemap.xml"), "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for u in urls:
            f.write(f"  <url><loc>{DOMAIN}{u}</loc><lastmod>{TODAY.isoformat()}</lastmod></url>\n")
        f.write("</urlset>\n")

    # Cloudflare Pages / Netlify friendly headers (harmless on Hostinger)
    with open(os.path.join(OUT, "_headers"), "w") as f:
        f.write("/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n")

    # Placeholder for ads.txt: the ad network gives you the exact line to paste.
    ads_txt = read_optional("ads.txt")
    if ads_txt:
        with open(os.path.join(OUT, "ads.txt"), "w") as f:
            f.write(ads_txt + "\n")

    print(f"Built {len(pages) + len(NICHES) + 1} pages into {OUT}  (ads {'ON' if AD_UNIT else 'off: no ad_unit.html'}, "
          f"consent tool {'ON' if CONSENT_HEAD else 'off: no consent_head.html'})")

    warnings = []
    if MISSING:
        warnings.append("Legal details missing, shown highlighted in the Privacy Policy, Terms and Contact pages: "
                        + ", ".join(MISSING) + ". Pass --operator, --address, --country and --host.")
    if EMAIL.endswith("@example.com"):
        warnings.append("Contact email is still the example.com placeholder. Pass --email.")
    if (AD_UNIT or ADS_HEAD) and not CONSENT_HEAD:
        warnings.append("Ads are on but consent_head.html is missing. Do not publish: visitors in the EEA, UK and "
                        "Switzerland must be asked for consent before ads load.")
    for w in warnings:
        print("WARNING:", w)


# Shared values available to page modules through the environment of build.py
import builtins  # noqa: E402
builtins.SITE_NAME = NAME
builtins.SITE_DOMAIN = DOMAIN
builtins.SITE_EMAIL = EMAIL
builtins.SITE_UPDATED = UPDATED
builtins.SITE_OPERATOR = legal(args.operator, "your name or company name")
builtins.SITE_ADDRESS = legal(args.address, "your postal address")
builtins.SITE_COUNTRY = legal(args.country, "your country")
builtins.SITE_HOST = legal(args.host, "your hosting provider")

if __name__ == "__main__":
    main()
