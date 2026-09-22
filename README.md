# Health & fitness calculator site

Eight calculators (BMI, calorie, macro, body fat, ideal weight, water intake, pregnancy due date,
heart rate zones) plus About, Contact, Privacy Policy and Medical Disclaimer pages.
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

Copy one file in `pages/`, edit the text, add matching logic to `static/calc.js` (a function in `Calc` plus a
handler keyed by the `calc` name), add the slug to `order` in `build.py`, and rebuild.
