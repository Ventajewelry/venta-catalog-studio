const { getUser } = require('./user-auth.js');
const { getCatalogSource } = require('./catalog-source.cjs');
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!getUser(req)) return res.status(401).json({ error: 'Dahili kullanıcı girişi gerekli.' });
  try {
    const data = getCatalogSource();
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({ collections: data.collections, generatedAt: data.generatedAt });
  } catch (error) {
    console.error('Catalog collection source unavailable:', error.message);
    return res.status(502).json({ error: 'Koleksiyonlar alınamadı.' });
  }
};
