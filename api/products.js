/**
 * Catalog product source.
 * Products are fetched from the public Venta Jewelry storefront, so Catalog
 * Studio does not depend on a separate Shopify OAuth/admin session.
 */
const STOREFRONT_URL = String(process.env.CATALOG_STOREFRONT_URL || 'https://ventajewelry.com')
  .replace(/\/$/, '');

function parseKarat(product) {
  const text = `${product.title || ''} ${product.product_type || ''} ${(product.tags || []).join(' ')}`;
  const match = text.match(/(\d+(?:[,.]\d+)?)\s*(?:karat|ct)\b/i);
  return match ? Number.parseFloat(match[1].replace(',', '.')) : undefined;
}

function categoryFor(product) {
  return String(product.product_type || product.vendor || 'Diğer').trim() || 'Diğer';
}

function normalizeStorefrontProduct(product) {
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
    const products = rawProducts.map(normalizeStorefrontProduct);

    const categories = [...new Map(
      products.map((product) => [
        product.categoryId,
        { id: product.categoryId, name: product.category },
      ]),
    ).values()].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

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
