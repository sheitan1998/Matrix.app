const COINBASE_URL = "https://api.coinbase.com/v2/exchange-rates?currency=EUR";
const ER_API_URL = "https://open.er-api.com/v6/latest/EUR";

const ISO = new Set(
  ("AED AFN ALL AMD ANG AOA ARS AUD AWG AZN BAM BBD BDT BGN BHD BIF BMD BND BOB BRL BSD BTN BWP BYN BZD " +
    "CAD CDF CHF CLP CNY COP CRC CVE CZK DJF DKK DOP DZD EGP ERN ETB EUR FJD FKP GBP GEL GHS GIP GMD GNF GTQ " +
    "GYD HKD HNL HTG HUF IDR ILS INR IQD IRR ISK JMD JOD JPY KES KGS KHR KMF KPW KRW KWD KYD KZT LAK LBP LKR " +
    "LRD LSL LYD MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MYR MZN NAD NGN NIO NOK NPR NZD OMR PAB PEN " +
    "PGK PHP PKR PLN PYG QAR RON RSD RUB RWF SAR SBD SCR SDG SEK SGD SHP SLE SOS SRD SSP STN SVC SYP SZL THB " +
    "TJS TMT TND TOP TRY TTD TWD TZS UAH UGX USD UYU UZS VES VND VUV WST XAF XCD XOF XPF YER ZAR ZMW").split(" ")
);

const cleanRates = (raw) => {
  const out = {};
  Object.entries(raw || {}).forEach(([code, value]) => {
    const key = String(code).toUpperCase();
    const num = Number(value);
    if (ISO.has(key) && Number.isFinite(num) && num > 0) out[key] = num;
  });
  return out;
};

const toBase = (eurRates, base) => {
  const factor = eurRates[base];
  if (!factor) return null;
  const out = {};
  Object.entries(eurRates).forEach(([code, value]) => {
    const rate = value / factor;
    if (Number.isFinite(rate) && rate > 0) out[code] = rate;
  });
  out[base] = 1;
  return out;
};

export default async function (req) {
  try {
    const { base: requested } = await req.json().catch(() => ({}));
    const base = String(requested || "EUR").toUpperCase();
    if (!ISO.has(base)) return Response.json({ error: `Devise inconnue : ${base}` }, { status: 400 });

    let eurRates = null;
    let source = null;
    let live = false;
    let providerUpdatedAt = null;

    try {
      const res = await fetch(COINBASE_URL, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(9000),
      });
      if (res.ok) {
        const payload = await res.json();
        const rates = cleanRates(payload?.data?.rates);
        if (Object.keys(rates).length > 60) {
          eurRates = rates;
          source = "Coinbase";
          live = true;
        }
      }
    } catch {
      /* fallback below */
    }

    if (!eurRates) {
      const res = await fetch(ER_API_URL, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) return Response.json({ error: "Aucun fournisseur de taux disponible" }, { status: 502 });
      const payload = await res.json();
      const rates = cleanRates(payload?.rates);
      if (!Object.keys(rates).length) return Response.json({ error: "Taux indisponibles" }, { status: 502 });
      eurRates = rates;
      source = "ExchangeRate-API";
      providerUpdatedAt = payload?.time_last_update_utc ? new Date(payload.time_last_update_utc).toISOString() : null;
    }

    eurRates.EUR = 1;
    const rates = toBase(eurRates, base);
    if (!rates) return Response.json({ error: `Devise inconnue : ${base}` }, { status: 400 });

    return Response.json({
      base,
      rates,
      source,
      live,
      provider_updated_at: providerUpdatedAt,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}