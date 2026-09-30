const { getCatalogSource } = require('./catalog-source.cjs');
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const data = getCatalogSource();
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({
      connected: true, source: 'venta-storefront-verified',
      shop: 'ventajewelry.com', shopName: 'Venta Jewelry', primaryDomain: 'ventajewelry.com',
      products: data.products, categories: data.categories, collections: data.collections,
      generatedAt: data.generatedAt,
      pageInfo: { hasNextPage: false, endCursor: null, total: data.products.length },
    });
  } catch (error) {
    console.error('Catalog product source unavailable:', error.message);
    return res.status(502).json({ connected: false, error: 'Katalog ürün kaynağı okunamadı.' });
  }
};
