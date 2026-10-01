const crypto = require('node:crypto');
const { getUser } = require('./user-auth.js');
const BUCKET = 'venta-catalog-drafts';
const validId = id => typeof id === 'string' && /^[a-f0-9-]{36}--[A-Za-z0-9_-]+\.json$/.test(id);
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const user = getUser(req);
    if (!user) return res.status(401).json({ error: 'Yönetici girişi gerekli.' });
    if (!['admin', 'manager'].includes(user.role)) return res.status(403).json({ error: 'Taslak erişim yetkisi gerekli.' });
    if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
    const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!base || !key) return res.status(503).json({ error: 'Taslak depolaması yapılandırılamadı.' });
    const call = (path, options = {}) => fetch(base + '/storage/v1/' + path, { ...options, headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', ...options.headers } });
    const bucket = await call('bucket/' + BUCKET);
    if (!bucket.ok) {
      if (req.method === 'GET' && [400, 404].includes(bucket.status)) return res.json({ drafts: [] });
      if (![400, 404].includes(bucket.status)) throw new Error('Taslak depolamasına erişilemiyor.');
      const created = await call('bucket', { method: 'POST', body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false, file_size_limit: 3145728, allowed_mime_types: ['application/json'] }) });
      if (!created.ok) {
        const check = await call('bucket/' + BUCKET);
        if (!check.ok) throw new Error('Taslak depolaması oluşturulamadı.');
      }
    } else if ((await bucket.json()).public) throw new Error('Taslak depolaması özel olmalıdır.');
    if (req.method === 'GET' && req.query?.id) {
      if (!validId(req.query.id)) return res.status(400).json({ error: 'Geçersiz taslak.' });
      const result = await call('object/' + BUCKET + '/' + encodeURIComponent(req.query.id));
      if (result.status === 404 || result.status === 400) return res.status(404).json({ error: 'Taslak bulunamadı.' });
      if (!result.ok) throw new Error('Taslak açılamadı.');
      return res.json({ draft: await result.json() });
    }
    if (req.method === 'GET') {
      const result = await call('object/list/' + BUCKET, { method: 'POST', body: JSON.stringify({ prefix: '', limit: 1000, offset: 0, sortBy: { column: 'created_at', order: 'desc' } }) });
      if (!result.ok) throw new Error('Taslaklar listelenemedi.');
      const objects = await result.json();
      return res.json({ drafts: objects.filter(o => validId(o.name)).map(o => ({ id: o.name, name: Buffer.from(o.name.slice(38, -5), 'base64url').toString('utf8'), createdAt: o.created_at })) });
    }
    const { name, catalog, pages, products } = req.body || {};
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 || !catalog?.id || !Array.isArray(pages) || !pages.length || !Array.isArray(products)) return res.status(400).json({ error: 'Taslak adı ve katalog bilgileri gerekli.' });
    const id = crypto.randomUUID() + '--' + Buffer.from(name.trim()).toString('base64url') + '.json';
    const draft = { id, name: name.trim(), createdAt: new Date().toISOString(), createdBy: user.username, catalog, pages, products };
    const body = JSON.stringify(draft);
    if (Buffer.byteLength(body) > 3145728) return res.status(413).json({ error: 'Taslak çok büyük; daha az sayfa ile kaydedin.' });
    const result = await call('object/' + BUCKET + '/' + encodeURIComponent(id), { method: 'POST', headers: { 'x-upsert': 'false' }, body });
    if (!result.ok) throw new Error('Taslak kaydedilemedi. Tekrar deneyin.');
    return res.status(201).json({ saved: true, id, name: draft.name, createdAt: draft.createdAt });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Taslak işlemi başarısız.' });
  }
};
