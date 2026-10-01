const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
let snapshot;
function getCatalogSource() {
  if (!snapshot) {
    const filename = path.join(process.cwd(), 'scripts', 'storefront-snapshot.json.gz');
    snapshot = JSON.parse(zlib.gunzipSync(fs.readFileSync(filename)).toString('utf8'));
    const dates=require('../scripts/product-created-dates.json');
    snapshot.products=snapshot.products.map(product=>({...product,createdAt:product.createdAt||(dates[product.id]?new Date(dates[product.id]).toISOString():undefined)}));
    const larien = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(process.cwd(), 'scripts', 'larien-snapshot.json.gz'))).toString('utf8'));
    snapshot={...snapshot,products:[...snapshot.products,...larien.products],categories:[...snapshot.categories,...larien.categories],collections:[...snapshot.collections,...larien.collections]};
    if (!Array.isArray(snapshot.products) || !Array.isArray(snapshot.categories) || !Array.isArray(snapshot.collections)) {
      throw new Error('Katalog ürün kaynağı geçersiz.');
    }
  }
  return snapshot;
}
module.exports = { getCatalogSource };
