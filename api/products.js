/**
 * Catalog product source.
 * Products are fetched from the public Venta Jewelry storefront, so Catalog
 * Studio does not depend on a separate Shopify OAuth/admin session.
 */
const STOREFRONT_URL = String(process.env.CATALOG_STOREFRONT_URL || 'https://ventajewelry.com')
  .replace(/\/$/, '');
const { getValidSession } = require('./auth-utils.cjs');

function fieldValue(fields, names) {
  const wanted = names.map((name) => name.toLocaleLowerCase('tr-TR'));
  const found = fields.find((field) => {
    const candidates = [field.key, field.namespace, field.definition?.name]
      .filter(Boolean)
      .map((value) => String(value).toLocaleLowerCase('tr-TR'));
    return candidates.some((value) => wanted.includes(value));
  });
  return found?.value || '';
}

async function getProductMetafields(req, res) {
  let session = await getValidSession(req, res);
  if (!session?.shop || !session?.accessToken) return new Map();
  const query = `query ProductMetafields($after: String) {
    products(first: 250, after: $after) {
      nodes {
        legacyResourceId
        metafields(first: 100) { nodes { key namespace value definition { name } } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }`;
  const result = new Map();
  let after = null;
  let hasNextPage = true;
  while (hasNextPage) {
    const response = await fetch(`https://${session.shop}/admin/api/2026-07/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': session.accessToken },
      body: JSON.stringify({ query, variables: { after } }),
    });
    const payload = await response.json();
    if (!response.ok || payload.errors) throw new Error('Shopify ürün meta alanları okunamadı.');
    const connection = payload.data?.products;
    for (const product of connection?.nodes || []) {
      const fields = product.metafields?.nodes || [];
      result.set(String(product.legacyResourceId), {
        color: fieldValue(fields, ['renk', 'color']),
        clarity: fieldValue(fields, ['berraklık', 'clarity']),
        certificate: fieldValue(fields, ['sertifika', 'certificate']),
        stone: fieldValue(fields, ['taş özellikleri', 'taş', 'stone']),
        properties: fieldValue(fields, ['ürün özellikleri', 'product properties']),
      });
    }
    hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
    after = connection?.pageInfo?.endCursor || null;
  }
  return result;
}

function parseKarat(product) {
  const text = `${product.title || ''} ${product.product_type || ''} ${(product.tags || []).join(' ')}`;
  const match = text.match(/(\d+(?:[,.]\d+)?)\s*(?:karat|ct)\b/i);
  return match ? Number.parseFloat(match[1].replace(',', '.')) : undefined;
}

function categoryFor(product) {
  return String(product.product_type || product.vendor || 'Diğer').trim() || 'Diğer';
}

function normalizeStorefrontProduct(product, metafields = {}) {
  const firstVariant = product.variants?.[0] || {};
  const category = categoryFor(product);
  const images = (product.images || [])
    .map((image) => image?.src)
    .filter(Boolean);

  return {
    id: String(product.id),
    name: product.title || 'İsimsiz ürün',
    description: product.body_html || '',
    price: Number(firstVariant.price || 0),
    sku: firstVariant.sku || '',
    material: product.vendor || '',
    color: metafields.color || '',
    clarity: metafields.clarity || '',
    certificate: metafields.certificate || '',
    stone: metafields.stone || '',
    properties: metafields.properties || '',
    images,
    karat: parseKarat(product),
    category,
    categoryId: `type:${category}`,
    categoryFullName: category,
    collectionId: '',
    collectionIds: [],
    collectionNames: [],
    handle: product.handle || '',
    url: product.handle ? `${STOREFRONT_URL}/products/${product.handle}` : null,
    tags: Array.isArray(product.tags) ? product.tags : [],
    productType: product.product_type || '',
    variants: (product.variants || []).map((variant) => ({
      id: String(variant.id),
      title: variant.title || '',
      sku: variant.sku || '',
      price: Number(variant.price || 0),
      compareAtPrice: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
      inventoryQuantity: variant.inventory_quantity,
    })),
  };
}

async function getStorefrontProducts() {
  const products = [];
  const pageSize = 250;

  for (let page = 1; page <= 100; page += 1) {
    const response = await fetch(
      `${STOREFRONT_URL}/products.json?limit=${pageSize}&page=${page}`,
      { headers: { Accept: 'application/json' } },
    );

    if (!response.ok) {
      throw new Error(`Web sitesi ürün kaynağına ulaşılamadı (${response.status}).`);
    }

    const payload = await response.json();
    const pageProducts = Array.isArray(payload?.products) ? payload.products : [];
    products.push(...pageProducts);

    if (pageProducts.length < pageSize) break;
  }

  return products;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const rawProducts = await getStorefrontProducts();
    let metafields = new Map();
    try {
      metafields = await getProductMetafields(req, res);
    } catch (metaError) {
      // Catalog browsing remains available if a Shopify session is absent or expired.
      console.warn('Product metafields unavailable:', metaError.message);
    }
    const products = rawProducts.map((product) => normalizeStorefrontProduct(product, metafields.get(String(product.id))));

    const categories = [...new Map(
      products.map((product) => [
        product.categoryId,
        { id: product.categoryId, name: product.category },
      ]),
    ).values()].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).json({
      connected: true,
      source: 'venta-storefront',
      shopName: 'Venta Jewelry',
      primaryDomain: 'ventajewelry.com',
      products,
      categories,
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
        total: products.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(502).json({
      connected: false,
      error: error.message || 'Web sitesi ürünleri alınamadı.',
    });
  }
};
