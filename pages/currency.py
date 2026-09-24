from helpers import *

CURRENCIES = [
    ("USD", "US Dollar"), ("EUR", "Euro"), ("GBP", "British Pound"), ("JPY", "Japanese Yen"),
    ("CHF", "Swiss Franc"), ("CAD", "Canadian Dollar"), ("AUD", "Australian Dollar"),
    ("NZD", "New Zealand Dollar"), ("CNY", "Chinese Yuan"), ("INR", "Indian Rupee"),
    ("BRL", "Brazilian Real"), ("MXN", "Mexican Peso"), ("ZAR", "South African Rand"),
    ("SEK", "Swedish Krona"), ("NOK", "Norwegian Krone"), ("DKK", "Danish Krone"),
    ("PLN", "Polish Zloty"), ("CZK", "Czech Koruna"), ("HUF", "Hungarian Forint"),
    ("TRY", "Turkish Lira"), ("RUB", "Russian Ruble"), ("KRW", "South Korean Won"),
    ("SGD", "Singapore Dollar"), ("HKD", "Hong Kong Dollar"), ("THB", "Thai Baht"),
    ("IDR", "Indonesian Rupiah"), ("MYR", "Malaysian Ringgit"), ("PHP", "Philippine Peso"),
    ("VND", "Vietnamese Dong"), ("AED", "UAE Dirham"), ("SAR", "Saudi Riyal"),
    ("ILS", "Israeli Shekel"), ("EGP", "Egyptian Pound"), ("PKR", "Pakistani Rupee"),
    ("NGN", "Nigerian Naira"), ("RON", "Romanian Leu"),
]


def options(selected):
    return "".join(
        f'<option value="{code}"{" selected" if code == selected else ""}>{code} - {name}</option>'
        for code, name in CURRENCIES
    )


FORM_HTML = (
    '<form id="calc" class="calc" novalidate data-unit="metric"><div class="grid">'
    '<div class="field wide"><div class="field-row">'
    '<div class="field"><label for="amount">Amount</label>'
    '<input id="amount" type="number" inputmode="decimal" min="0" step="0.01" value="1"></div>'
    '<div class="field"><label for="amountResult">Converted</label>'
    '<div class="amount-result" id="amountResult" aria-live="polite">&nbsp;</div></div>'
    '</div></div>'
    '<div class="field wide"><div class="field-row">'
    f'<div class="field"><label for="from">From</label><select id="from">{options("USD")}</select></div>'
    '<button type="button" id="swap" class="swap-btn" aria-label="Swap currencies" title="Swap currencies">&#8644;</button>'
    f'<div class="field"><label for="to">To</label><select id="to">{options("EUR")}</select></div>'
    '</div></div>'
    '<p class="note" id="rateNote">&nbsp;</p>'
    '</div>'
    '<div class="actions"><button class="btn" type="submit">Convert</button>'
    '<button class="btn ghost" type="reset">Reset</button></div>'
    '</form>'
    '<div id="result" class="result" aria-live="polite" hidden></div>'
)

PAGE = dict(
    slug="currency-converter",
    calc="currency",
    niche="money",
    icon="💱",
    nav="Currency Converter",
    tile="Convert between currencies using live, daily-updated exchange rates.",
    title="Currency Converter: Live Exchange Rates",
    desc="Free currency converter. Convert between more than 30 currencies using live, daily-updated exchange rates.",
    h1="Currency Converter",
    intro="Choose your two currencies and start typing an amount — the converted result updates automatically as you type, no need to click Convert.",
    form=FORM_HTML,
    article="""
<h2>Where the rates come from</h2>
<p>This converter fetches live exchange rates directly from your browser as you type or change currencies, from a third-party rate provider. Rates are updated roughly once a day, so this is suitable for everyday conversions like travel budgeting or online shopping, but is not a live trading feed for financial markets.</p>
<p>Because the rate lookup happens directly between your browser and the rate provider, the amount you type never passes through our servers, in keeping with how every calculator on this site works.</p>

<h2>How the conversion works</h2>
<p>Converting currency is a single multiplication: converted amount = amount &times; exchange rate. For example, if 1 US Dollar equals 0.92 Euro, then 50 US Dollars converts to 50 &times; 0.92 = 46 Euro. The calculator shows both the converted amount and the underlying rate (as "1 [from] = X [to]"), so you can see and reuse that rate yourself.</p>

<h2>Why exchange rates move</h2>
<p>Currency exchange rates float based on supply and demand in global currency markets, which are influenced by interest rates, inflation, trade balances and investor sentiment. This means the rate you see today can differ from yesterday's, sometimes by a meaningful amount for volatile currency pairs. For large or time-sensitive transactions, always check the live rate at the moment of the actual transfer, since a small percentage difference matters more on larger amounts.</p>

<h2>Mid-market rate vs. what you'll actually pay</h2>
<p>The rate shown here is the <strong>mid-market rate</strong>: the midpoint between the buy and sell prices banks and exchanges trade at. Banks, currency exchange counters and payment apps almost always add a markup on top of this rate, or charge a separate fee, so the amount you actually receive when exchanging money will usually be somewhat less favorable than the mid-market rate shown here. Use this calculator to understand the "true" rate and compare how much a provider's markup is costing you.</p>
""",
    faqs=[
        ("Do I need to click Convert?", "No. The result updates automatically as you type an amount or change either currency. The Convert button and pressing Enter still work too, if you prefer."),
        ("How often are the exchange rates updated?", "The underlying rate provider updates its data roughly once a day, so rates here reflect that day's published rate rather than second-by-second market movements."),
        ("Is this the rate I'll get at my bank?", "No. This shows the mid-market rate. Banks, exchange counters and payment apps typically add a markup or fee on top, so you'll usually receive a less favorable rate in practice."),
        ("Does this work without an internet connection?", "No. Unlike the other calculators on this site, converting currency needs a live rate lookup, so an internet connection is required for this one tool."),
        ("Is my amount sent to your servers?", "No. The amount you type is used only in your browser to multiply against the fetched rate; only the currency codes (not the amount) are sent to the rate provider to look up the exchange rate."),
    ],
)
