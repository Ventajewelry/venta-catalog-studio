import fs from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
// Reproducible builds use the verified public snapshot. Explicit refresh reads the storefront only.
const snapshotPath = new URL('./storefront-snapshot.json.gz', import.meta.url);
if (process.env.CATALOG_REFRESH_DATA !== '1') {
  const bytes = await fs.readFile(snapshotPath);
  const data = gunzipSync(bytes);
  await fs.mkdir(path.join(process.cwd(), 'public'), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), 'public', 'preview-products.json'), data);
  console.log(`Verified catalog snapshot: ${JSON.parse(data).products.length} products`);
  process.exit(0);
}
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { productFacts } = require('./storefront-data.cjs');
const navigation = JSON.parse(await fs.readFile(new URL('./storefront-navigation.json', import.meta.url), 'utf8'));
async function read(url, json = true) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Storefront read failed (${response.status}): ${url}`);
  return json ? response.json() : response.text();
}
async function pool(items, work, size = 6) {
  let next = 0;
  await Promise.all(Array.from({length: Math.min(size, items.length)}, async () => { while (next < items.length) { const item = items[next++]; await work(item); } }));
}

const root = process.cwd();
const base = 'https://ventajewelry.com';
const products = [];

for (let page = 1; page <= 100; page += 1) {
  const response = await fetch(`${base}/products.json?limit=250&page=${page}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Preview ürünleri alınamadı: ${response.status}`);
  const payload = await response.json();
  const batch = Array.isArray(payload.products) ? payload.products : [];
  products.push(...batch);
  if (batch.length < 250) break;
}

const normalized = products.map((product) => {
  const variant = product.variants?.[0] || {};
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const tagged = (names) => {
    const found = tags.find((tag) => names.some((name) => String(tag).toLocaleLowerCase('tr-TR').startsWith(`${name}:`)));
    return found ? String(found).split(':').slice(1).join(':').trim() : undefined;
  };
  const category = '';
  const match = `${product.title || ''} ${product.product_type || ''} ${(product.tags || []).join(' ')}`.match(/(\d+(?:[,.]\d+)?)\s*(?:karat|ct)\b/i);
  return {
    id: String(product.id),
    name: product.title || 'İsimsiz ürün',
    sku: variant.sku || '',
    price: Number(variant.price || 0),
    images: (product.images || []).map((image) => image?.src).filter(Boolean),
    category,
    categoryId: '',
    categoryIds: [],
    collectionIds: [],
    collectionNames: [],
    handle: product.handle,
    description: product.body_html || '',
    material: product.vendor || '',
    karat: match ? Number(match[1].replace(',', '.')) : undefined,
    color: tagged(['renk', 'color']),
    clarity: tagged(['berraklık', 'berraklik', 'clarity']),
    certificate: tagged(['sertifika', 'certificate']),
    stone: tagged(['taş', 'tas', 'stone']),
    collectionId: '',
  };
});

const { categories, collections } = navigation;
const byId = new Map(normalized.map(product => [product.id, product]));
const handles = [...new Set([...categories, ...collections].map(item => item.id))];
await pool(handles, async handle => {
  for (let page = 1; page <= 100; page++) {
    const payload = await read(`${base}/collections/${handle}/products.json?limit=250&page=${page}`);
    const batch = payload.products || [];
    const parents = categories.filter(item => item.id === handle || collections.some(child => child.id === handle && child.parentId === item.id));
    for (const raw of batch) {
      const product = byId.get(String(raw.id));
      if (!product) continue;
      product.collectionIds.push(handle);
      product.collectionNames.push(collections.find(item => item.id === handle)?.name || categories.find(item => item.id === handle)?.name || handle);
      product.categoryIds.push(...parents.map(item=>item.id));
    }
    if (batch.length < 250) break;
  }
});
let completed = 0;
await pool(normalized, async product => {
  Object.assign(product, productFacts(await read(`${base}/products/${product.handle}`, false)));
  product.categoryIds = [...new Set(product.categoryIds)];
  product.categoryId = product.categoryIds[0] || '';
  product.category = categories.find(item => item.id === product.categoryId)?.name || '';
  product.collectionId = product.collectionIds[0] || '';
  if (++completed % 100 === 0) console.log(`Verified storefront details: ${completed}/${normalized.length}`);
});

await fs.mkdir(path.join(root, 'public'), { recursive: true });
await fs.writeFile(path.join(root, 'public', 'preview-products.json'), JSON.stringify({ products: normalized, categories, collections, generatedAt: new Date().toISOString() }));
console.log(`Preview ürün listesi hazır: ${normalized.length} ürün, ${categories.length} kategori`);
