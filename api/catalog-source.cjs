const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
let snapshot;
function getCatalogSource() {
  if (!snapshot) {
    const filename = path.join(process.cwd(), 'scripts', 'storefront-snapshot.json.gz');
    snapshot = JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString('utf8'));
    if (!Array.isArray(snapshot.products) || !Array.isArray(snapshot.categories) || !Array.isArray(snapshot.collections)) {
      throw new Error('Katalog ürün kaynağı geçersiz.');
    }
  }
  return snapshot;
}
module.exports = { getCatalogSource };
