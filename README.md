# PlenumHub

A hub of free calculators grouped by topic ("niche"). Each niche has its own page at `/<niche>/` and its
calculators live at `/<niche>/<calculator>/`. The first niche is Fitness: eight calculators (BMI, calorie, macro,
body fat, ideal weight, water intake, pregnancy due date, heart rate zones). The site also has About, Contact,
Privacy Policy, Terms of Use and Medical Disclaimer pages.
Plain HTML/CSS/JS output: no database, no server code.

## 1. Build the site

    python3 build.py --name "Your Site Name" --domain https://yourdomain.com --email you@yourdomain.com \
      --operator "Your Name or Company" --address "Street, City, Postcode" --country Lithuania --host Cloudflare

This writes the finished site into the `dist/` folder. Upload the *contents* of `dist/`.

`--operator`, `--address`, `--country` and `--host` fill in the Privacy Policy, Terms of Use and Contact pages.
Anything you leave out shows as a yellow `[placeholder]` on those pages, and the build prints a WARNING. Do not
publish while a warning is showing. A business address or PO box is fine for `--address`.

## 2. Publish it (you only have the domain)

Free option, recommended: Cloudflare Pages.
1. Make a free Cloudflare account, then Workers & Pages > Create > Pages > Upload assets. Upload `dist/`.
2. In Cloudflare, add your domain as a site. Cloudflare shows you two nameservers.
3. In Hostinger: Domains > your domain > DNS / Nameservers > change to Cloudflare's two nameservers.
4. In the Pages project, Custom domains > add your domain. It can take up to a few hours to go live.

Alternative: buy a Hostinger web hosting plan and upload the contents of `dist/` to `public_html`.

## 3. Add ads (after the site is live)

1. Apply at Google AdSense (https://adsense.google.com) with your live domain.
2. AdSense gives you a script for the `<head>`. Save it as `ads_head.html` next to `build.py`.
3. When approved, create an ad unit and save its code as `ad_unit.html`. It appears in two places on every
   calculator page and once on the homepage. Legal pages get no ads.
4. AdSense also gives you an `ads.txt` line. Save it as `ads.txt` next to `build.py`.
5. Rebuild and re-upload.
6. For visitors in the EU/EEA, UK and Switzerland you need a Google-certified consent message. In AdSense turn on
   Privacy & messaging, publish a GDPR message, and also the US state regulations message.
7. Privacy & messaging gives you a script. Save it as `consent_head.html` next to `build.py`. The build loads it
   before the ad script and adds a "Privacy and cookie settings" link to every footer, which reopens the consent
   message so visitors can change or withdraw consent (Google requires this link). The build warns you if ads
   are on but `consent_head.html` is missing.

Until `ad_unit.html` exists, no ad space is shown. Ad slots reserve 250px of height so the page does not jump when
an ad loads; change `--ad-min` in `static/style.css` if you use smaller or larger units. Unfilled slots collapse.

## Legal pages

The Privacy Policy, Terms of Use, Medical Disclaimer, About and Contact pages are general templates, not legal
advice. Once the real details are filled in, have a lawyer or a reputable policy generator review them, and
re-read the Privacy Policy whenever you add analytics, affiliate links or another ad network.

## Adding another calculator

1. Copy one file in `pages/` and edit the text (`slug`, `nav`, `title`, `intro`, `form`, `article`, `faqs`...).
2. Set `niche="..."` to the slug of the niche it belongs to. If you leave it out, the calculator goes under
   `fitness` and gets the medical disclaimer, so always set it for non-fitness calculators.
3. Add the maths to `static/calc.js`: a function in `Calc`, plus a handler in `handlers` keyed by the page's
   `calc` name.
4. Add the slug to `order` in `build.py` so it appears in the right position (anything not listed goes last).
5. Rebuild and check it locally (see below).

## Adding a new niche

Add an entry to `NICHES` in `build.py`. Every key is required:

| Key | What it is |
|---|---|
| `slug` | URL folder, e.g. `finance` gives `/finance/` |
| `name` | Short name for the top menu and breadcrumbs |
| `icon` | Emoji shown on the homepage tile |
| `tagline` | Heading and page title of the niche page |
| `tile` | One-line description on the homepage tile |
| `lead` | Intro paragraph under the niche page heading |
| `desc` | Meta description for search engines |
| `about` | HTML shown on the niche page below the calculator tiles |
| `disclaimer` | HTML for the box near the bottom of every calculator in the niche |

Then add calculators to it as described above. The niche is added to the top menu, the homepage and the
sitemap automatically. If the new topic needs its own legal wording (for example a financial disclaimer page),
add a page in `pages/` with `kind="static"` and link to it from the niche's `disclaimer`.

## Checking changes locally

The pages link to `/assets/...`, so open them through a local server, not by double-clicking the files:

    python3 build.py --name "PlenumHub" --domain https://plenumhub.com --email dovydasjagm@gmail.com \
      --operator "Dovydas Jagminas" --address "Aukštagirio g. 18, Vilnius, 10105" --country Lithuania --host "GitHub Pages"
    cd dist && python3 -m http.server 8000

Then open http://localhost:8000. Pushing to `main` builds and deploys the live site automatically
(`.github/workflows/deploy.yml`).
