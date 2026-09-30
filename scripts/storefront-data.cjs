// Read-only parsing of product facts published by Venta's storefront.
const clean = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
function productFacts(html) {
  const table = html.match(/<table\b[^>]*class=["'][^"']*\buo-table\b[^"']*["'][^>]*>([\s\S]*?)<\/table>/i)?.[1] || '';
  const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(row => [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(cell=>clean(cell[1]))).filter(row=>row.length>=6);
  const unique = index => [...new Set(rows.map(row=>row[index]).filter(Boolean))].join(', ');
  const title = clean(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const certificate = title.match(/\b(HRD|GIA|IGI)\s+Sertifikalı/i)?.[1] || '';
  const info = html.match(/<div class="collapsible__content-inner rte">([\s\S]*?)<div class="urun-ozellikleri">/)?.[1];
  return { color: unique(3), clarity: unique(4), stone: unique(0), certificate, properties: clean(info), stoneDetails: rows.map(row=>row.join(' · ')).join('\n') };
}
module.exports = { productFacts, clean };
