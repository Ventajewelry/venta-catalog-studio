/**
 * Catalog Studio uses the public Venta storefront as its product source.
 * A separate Shopify admin session is not required.
 */
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    connected: true,
    source: 'venta-storefront',
    shop: 'ventajewelry.com',
  });
};
