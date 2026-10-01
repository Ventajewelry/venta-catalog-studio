import fs from 'node:fs';

const file = 'src/components/studio/CatalogStudioV5.tsx';
let source = fs.readFileSync(file, 'utf8');
const marker = '// Studio default grid and matching typography preview';
if (!source.includes(marker)) {
  const replace = (before, after) => {
    if (!source.includes(before)) throw new Error(`Studio update anchor missing: ${before.slice(0, 90)}`);
    source = source.replace(before, after);
  };
  replace('function applyLayoutToPage(p:Page,id:LayoutId)', 'export function applyLayoutToPage(p:Page,id:LayoutId,productInfoDefaults?:Partial<ProductInfoSettings>)');
  replace('blocks:layoutBlocks(cfg(id),ids)}}}', "blocks:layoutBlocks(cfg(id),ids).map(b=>b.frameKind==='product'?{...b,productInfo:{...b.productInfo,...productInfoDefaults}}:b)}}}");
  replace("const target=cfg(page.layoutId).capacity>1?page.layoutId:'LAYOUT_C_PRODUCT_GRID';", "const target:LayoutId='LAYOUT_C_PRODUCT_GRID';");
  // The normal Products tab also starts with a four-product grid.
  const placeStart = source.indexOf('const placeFrom=');
  const placeEnd = source.indexOf('const addIds=', placeStart);
  const place = source.slice(placeStart, placeEnd);
  if (!place.includes('}},target)')) throw new Error('Default grid pagination anchor missing');
  source = source.slice(0, placeStart) + place.replace('}},target)', '}},target,settings.productInfoDefaults)') + source.slice(placeEnd);
  // Keep vacant slots in the data, but never draw empty product cards.
  replace('const p=b.productId?products.find(x=>x.id===b.productId):null;const productInfo=', "const p=b.productId?products.find(x=>x.id===b.productId):null;if(b.frameKind==='empty'||(b.frameKind==='product'&&!p))return null;const productInfo=");
  replace('function Preview({cfg:lc,products}:{cfg:LayoutConfig;products:Product[]})', 'function Preview({cfg:lc,products,hideEmpty=false}:{cfg:LayoutConfig;products:Product[];hideEmpty?:boolean})');
  replace('<div key={i} className="border border-[#0f203a]/15', '<div key={i} style={hideEmpty&&!pics[i]?{visibility:"hidden"}:undefined} className="border border-[#0f203a]/15');
  replace('<Preview cfg={cfg(p.layoutId)} products=', '<Preview hideEmpty cfg={cfg(p.layoutId)} products=');
  // Both actions are always visible below each layout, including on touch screens.
  replace('key={l.id} className="group relative border', 'key={l.id} data-layout-card={l.id} className="group relative border');
  replace('className="absolute inset-0 bg-[#0f203a]/92 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2 p-3"', 'className="border-t bg-[#f5f7fa] flex flex-col gap-2 p-2"');
  replace('className="w-full h-8 bg-white text-[#0f203a] text-[8px] uppercase tracking-[.12em]">Bu sayfaya uygula', 'className="w-full min-h-9 px-2 border bg-white text-[#0f203a] text-[10px]">Geçerli sayfaya uygula');
  replace('className="w-full h-8 border border-white text-white text-[8px] uppercase tracking-[.12em]">Tüm ürünleri yeniden yerleştir', 'className="w-full min-h-9 px-2 bg-[#0f203a] text-white text-[10px]">Tümünü uygula');
  replace("if(all){if(cap===0)return;", "if(all){if(cap===0){if(window.confirm(`Tüm sayfalara ${cfg(id).name} layoutu uygulanacak. Devam edilsin mi?`)){save(sorted.map(pg=>applyLayoutToPage(pg,id)));setBlockId(null)}return;}");
  // New layouts inherit the catalog's chosen typography instead of resetting it.
  const editorStart = source.indexOf('export function CatalogStudioV5(');
  source = source.slice(0, editorStart) + source.slice(editorStart).replaceAll('applyLayoutToPage(', 'applyWithSettings(');
  replace('const settings={...defaults,...catalog.settings};', 'const settings={...defaults,...catalog.settings};const applyWithSettings=(p:Page,id:LayoutId,info=settings.productInfoDefaults)=>applyLayoutToPage(p,id,info);');
  fs.writeFileSync(file, marker + '\n' + source);
}
