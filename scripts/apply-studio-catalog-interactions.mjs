import fs from 'node:fs';
const file='src/components/studio/CatalogStudioV5.tsx';
let s=fs.readFileSync(file,'utf8');
const marker='// Studio catalog interaction controls';
if(!s.includes(marker)){
 const replace=(before,after)=>{if(!s.includes(before))throw new Error('Catalog interaction anchor missing: '+before.slice(0,100));s=s.replace(before,after)};
 s="import { CatalogLogoControls, FittedProductInfo, useCatalogPinch } from './CatalogInteractionHelpers';\n"+s;
 replace('type Props={','type Props={onActivePageChange?:(id:string)=>void;');
 replace('export function CatalogStudioV5({mobileStudioRequest,','export function CatalogStudioV5({onActivePageChange,mobileStudioRequest,');
 replace('const[blockId,setBlockId]=',"React.useEffect(()=>{if(pageId)onActivePageChange?.(pageId)},[pageId,onActivePageChange]);const {zoom,setZoom,areaRef}=useCatalogPinch(stackedMobile);const pageDrag=React.useRef<string|null>(null);const[pendingProducts,setPendingProducts]=React.useState<string[]|null>(null);const[blockId,setBlockId]=");
 // Undo history also covers page moves, page deletion and clearing the catalog.
 replace('const exportPdf=',`const reorderPages=(from:string,to:string)=>{if(from===to)return;const a=sorted.findIndex(p=>p.id===from),b=sorted.findIndex(p=>p.id===to);if(a<0||b<0)return;const next=[...sorted],moved=next.splice(a,1)[0];next.splice(b,0,moved);save(next)};
const emptyPage=()=>({...sorted[0],id:sorted[0]?.id||uid(),catalogId:catalog.id,title:'Sayfa 1',order:0,layoutId:'LAYOUT_C_PRODUCT_GRID' as LayoutId,style:undefined,content:{productIds:[],blocks:[]}});
const clearCatalog=()=>{if(!window.confirm('Katalogdaki tüm sayfa ve ürünler temizlensin mi? Geri al ile geri dönebilirsiniz.'))return;const blank=emptyPage();save([blank]);setPageId(blank.id);setBlockId(null)};
const deleteStudioPage=(id:string)=>{if(!window.confirm('Bu sayfa silinsin mi? Geri al ile geri dönebilirsiniz.'))return;const next=sorted.filter(p=>p.id!==id);save(next.length?next:[emptyPage()]);if(pageId===id){setPageId(next[0]?.id||sorted[0]?.id);setBlockId(null)}};
const addToNewPage=(ids:string[])=>{if(!page)return;const i=sorted.findIndex(p=>p.id===page.id),chunks=Array.from({length:Math.ceil(ids.length/4)},(_,n)=>applyWithSettings({...page,id:uid(),title:'Ürünler '+(n+1),style:undefined,content:{productIds:ids.slice(n*4,n*4+4)}},'LAYOUT_C_PRODUCT_GRID'));save([...sorted.slice(0,i+1),...chunks,...sorted.slice(i+1)]);setPendingProducts(null)};
const exportPdf=`);
 replace('const addIds=', 'const addIdsNow=');
 replace('onAddIds={addIds}', 'onAddIds={ids=>setPendingProducts(ids)}');
 // Product creation-date ordering is the same in the desktop tab and quick selector.
 s="import { compareCatalogProducts, CatalogProductOrder } from '../shared/catalogProductOrder';\n"+s;
 const productsStart=s.indexOf('function ProductsPanel'),productsEnd=s.indexOf('function PageSettingsPanel',productsStart);
 let productPanel=s.slice(productsStart,productsEnd);
 productPanel=productPanel.replace("{const[q,setQ]", "{const[sortOrder,setSortOrder]=React.useState<CatalogProductOrder>('default');const[q,setQ]");
 productPanel=productPanel.replace('return true}),[products,q,cat', 'return true}).sort((a,b)=>compareCatalogProducts(a as any,b as any,sortOrder)),[sortOrder,products,q,cat');
 productPanel=productPanel.replace("setMaxPrice('')}}", "setMaxPrice('');setSortOrder('default')}}");
 productPanel=productPanel.replace('<div className="grid grid-cols-2 gap-2"><select className="field" value={cat}', '<label className="block text-xs mb-2">Yüklenme sırası<select aria-label="Yüklenme sırası" className="field mt-1" value={sortOrder} onChange={e=>setSortOrder(e.target.value as CatalogProductOrder)}><option value="default">Varsayılan sıra</option><option value="oldest">İlk yüklenen</option><option value="newest">Son yüklenen</option></select></label><div className="grid grid-cols-2 gap-2"><select className="field" value={cat}');
 if(!productPanel.includes('value="oldest"')||!productPanel.includes('.sort((a,b)=>compareCatalogProducts'))throw new Error('Product date ordering anchor missing');
 s=s.slice(0,productsStart)+productPanel+s.slice(productsEnd);
 // Thumbnail selection and independent page action controls.
 replace("{sorted.map((p,i)=><button key={p.id} onClick=", "{sorted.map((p,i)=><div key={p.id} data-page-row={p.id} draggable onDragStart={e=>{pageDrag.current=p.id;e.dataTransfer.setData('application/catalog-page',p.id)}} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();e.stopPropagation();const from=pageDrag.current||e.dataTransfer.getData('application/catalog-page');if(from)reorderPages(from,p.id);pageDrag.current=null}}><div className=\"flex items-center gap-1\"><span role=\"button\" tabIndex={0} aria-label=\"Sayfayı taşı\" className=\"catalog-page-drag\" onPointerDown={e=>{e.stopPropagation();pageDrag.current=p.id;e.currentTarget.setPointerCapture(e.pointerId)}} onPointerUp={e=>{e.stopPropagation();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-page-row]');if(pageDrag.current&&target)reorderPages(pageDrag.current,target.dataset.pageRow!);pageDrag.current=null}} onPointerCancel={()=>{pageDrag.current=null}}>↕</span><button aria-label=\"Sayfayı yukarı taşı\" disabled={i===0} onClick={()=>reorderPages(p.id,sorted[i-1].id)} className=\"p-2 disabled:opacity-20\">↑</button><button aria-label=\"Sayfayı aşağı taşı\" disabled={i===sorted.length-1} onClick={()=>reorderPages(p.id,sorted[i+1].id)} className=\"p-2 disabled:opacity-20\">↓</button><button onClick={()=>deleteStudioPage(p.id)} className=\"ml-auto p-2 text-[10px]\">Sayfayı sil</button></div><button onClick=");
 replace('</div></button>)}</div></aside><main','</div></button></div>)}</div></aside><main');
 replace('<button disabled={exportingAll} onClick={exportPdf}', '<button onClick={undo} disabled={!history.length} className="px-3 py-2 border rounded text-[9px] disabled:opacity-30" aria-label="Geri al"><Undo2 size={12} className="inline mr-1"/>Geri al</button><button onClick={clearCatalog} className="px-3 py-2 border rounded text-[9px]">Kataloğu temizle</button><button disabled={exportingAll} onClick={exportPdf}');
 replace('<div className="catalog-page-scroll', '<div ref={areaRef} data-zoom={zoom} className="catalog-page-scroll');
 replace("style={{width:'min(760px,70vw)',aspectRatio:", "style={{...(stackedMobile&&!exportingAll&&zoom>1?{width:((areaRef.current?.clientWidth||390)-32)*zoom,minWidth:((areaRef.current?.clientWidth||390)-32)*zoom}:{}),width:stackedMobile&&!exportingAll&&zoom>1?((areaRef.current?.clientWidth||390)-32)*zoom:'min(760px,70vw)',aspectRatio:");
 replace('</header>{pdfMessage', '</header>{stackedMobile&&<div className="catalog-zoom-controls flex items-center justify-end gap-2 bg-white px-3 py-1 text-xs"><span>Yakınlaştır</span><button aria-label="Kataloğu uzaklaştır" className="px-3 py-1 border rounded" onClick={()=>setZoom(z=>Math.max(1,z-.25))}>−</button><button className="px-2" onClick={()=>setZoom(1)}>{Math.round(zoom*100)}%</button><button aria-label="Kataloğu yakınlaştır" className="px-3 py-1 border rounded" onClick={()=>setZoom(z=>Math.min(3,z+.25))}>+</button></div>}{pdfMessage');
 // Fixed image allocation and uniformly fitted captions keep metadata inside the frame.
 replace('className="w-full h-full bg-white flex flex-col items-center justify-center"', 'className="catalog-product-card w-full h-full bg-white flex flex-col items-center justify-end overflow-hidden"');
 replace('className="max-w-[92%] max-h-[80%] object-contain"','className="catalog-product-image w-[92%] flex-1 min-h-0 object-contain"');
 replace('{p&&<div className="leading-tight p-1 w-full">','{p&&<FittedProductInfo>');
 replace("Ürün: {p.properties||'—'}</div>}</div>}</div>", "Ürün: {p.properties||'—'}</div>}</FittedProductInfo>}</div>");
 replace('borderWidth:b.borderWidth??1,borderStyle:(b.borderWidth??1)>0?', "borderWidth:(page.style as any)?.productBorderWidth??(settings as any).productBorderWidth??b.borderWidth??1,borderStyle:((page.style as any)?.productBorderWidth??(settings as any).productBorderWidth??b.borderWidth??1)>0?");
 replace("borderColor:b.borderColor||'#d5dbe3'", "borderColor:(page.style as any)?.productBorderColor||(settings as any).productBorderColor||b.borderColor||'#d5dbe3'");
 replace("backgroundImage:'linear-gradient(#0f203a0b 1px, transparent 1px),linear-gradient(90deg,#0f203a0b 1px,transparent 1px)'", "backgroundImage:(page.style?.gridVisible??settings.gridVisible)!==false?'linear-gradient(#0f203a0b 1px, transparent 1px),linear-gradient(90deg,#0f203a0b 1px,transparent 1px)':undefined");
 replace('{page&&<>{(page.style?.showHeader', `{page&&<>{((page.style as any)?.showHeaderLogo??(settings as any).showHeaderLogo)!==false&&<div className="absolute pointer-events-none" data-catalog-logo style={{top:'1%',left:'4%',right:'4%',height:'4%',display:'flex',justifyContent:((page.style as any)?.headerLogoAlign||(settings as any).headerLogoAlign||'center')==='left'?'flex-start':((page.style as any)?.headerLogoAlign||(settings as any).headerLogoAlign||'center')==='right'?'flex-end':'center'}}><img alt="Venta logosu" src={(page.style as any)?.headerLogoUrl||(settings as any).headerLogoUrl||'/venta-catalog-logo.svg'} style={{height:'100%',maxWidth:'30%',objectFit:'contain'}}/></div>}{(page.style?.showHeader`);
 replace("style={{fontFamily:(page.style as any)?.headerFontFamily", "style={{top:((page.style as any)?.showHeaderLogo??(settings as any).showHeaderLogo)!==false?'6%':undefined,fontFamily:(page.style as any)?.headerFontFamily");
 const old='<details className="p-4"><summary className="text-sm">Diğer sayfa ve çerçeve ayarları</summary><PageSettingsPanel page={page} settings={settings} onSettings={updateSettings} onPageStyle={updatePageStyle} onUpdateInfo={updateProductInfo}/></details>';
 replace(old,'');
 // Logo controls also available on desktop without replacing its existing settings panel.
 replace("{panel==='page'&&page&&<>", "{panel==='page'&&page&&<>{!stackedMobile&&<div className=\"p-4\"><CatalogLogoControls settings={settings} onChange={updateSettings}/></div>}");
 replace('</aside></div>}', `</aside>{pendingProducts&&<div className="fixed inset-0 z-[450] bg-black/40 flex items-center justify-center p-5" role="dialog" aria-modal="true" aria-label="Ürünleri nereye ekleyelim?"><div className="bg-white p-5 rounded-xl w-full max-w-sm space-y-3"><h2 className="font-semibold">Ürünleri nereye ekleyelim?</h2><button className="field bg-[#0f203a] text-white" onClick={()=>{addIdsNow(pendingProducts);setPendingProducts(null)}}>Geçerli sayfaya ekle</button><button className="field" onClick={()=>addToNewPage(pendingProducts)}>Yeni sayfaya ekle</button><button className="field" onClick={()=>setPendingProducts(null)}>Vazgeç</button></div></div>}</div>}`);
 // Local grid spacing moves only this page's cards, global spacing retains the existing all-page behavior.
 replace("const updatePageStyle=(style:NonNullable<Page['style']>)=>save(sorted.map(p=>p.id===page.id?{...p,style}:p));", `const updatePageStyle=(style:NonNullable<Page['style']>&{productCardGap?:number})=>save(sorted.map(p=>{if(p.id!==page.id)return p;const c=cfg(p.layoutId);if(style.productCardGap===undefined||c.kind!=='grid')return {...p,style};const gap=Math.max(0,Math.min(8,style.productCardGap)),cols=c.cols||2,rows=c.rows||1,w=(90-gap*(cols-1))/cols,h=(82-gap*(rows-1))/rows;let i=0;return {...p,style,content:{...p.content,blocks:(p.content.blocks||[]).map(b=>{if(b.type==='text'||(b.frameKind!=='product'&&b.frameKind!=='empty'))return b;const n=i++;return {...b,x:5+(n%cols)*(w+gap),y:10+Math.floor(n/cols)*(h+gap),width:w,height:h}})}}}));`);
 fs.writeFileSync(file,marker+'\n'+s);
}

// Catalog menu shares the existing handlers; drafts are managed by the admin app.
s=fs.readFileSync(file,'utf8');
if(!s.includes("from './StudioActions'")){
 s="import { StudioActions } from './StudioActions';\n"+s;
 s=s.replace('type Props={', 'type Props={onSaveDraft?:()=>void;onLoadDraft?:()=>void;');
 s=s.replace('export function CatalogStudioV5({', 'export function CatalogStudioV5({onSaveDraft,onLoadDraft,');
 const start=s.indexOf('<header className="h-14');
 const actionStart=s.indexOf('<div className="flex gap-2"><button onClick={undo}',start);
 const end=s.indexOf('</header>',actionStart);
 if(start<0||actionStart<0||end<0)throw new Error('Studio menu action anchor missing');
 s=s.slice(0,actionStart)+'<StudioActions undo={undo} canUndo={!!history.length} clear={clearCatalog} pdf={exportPdf} exporting={exportingAll} preview={onPreview} saveDraft={onSaveDraft} loadDraft={onLoadDraft} publish={canPublish?onPublish:undefined}/>'+s.slice(end);
 fs.writeFileSync(file,s);
}

// Brand filtering and continuation are additive; Venta remains the initial source.
s=fs.readFileSync(file,'utf8');
if(!s.includes('// Brand and continuation controls')){
 s="// Brand and continuation controls\nimport { CatalogBrandSelect, CatalogBrand, matchesBrand } from '../shared/catalogBrands';\nimport { continueCatalogProducts } from '../shared/continueCatalogProducts';\n"+s;
 const start=s.indexOf('function ProductsPanel'),end=s.indexOf('function PageSettingsPanel',start);
 let panel=s.slice(start,end);
 panel=panel.replace("{const[sortOrder", "{const[brand,setBrand]=React.useState<CatalogBrand>('venta');const[sortOrder");
 panel=panel.replace('products.filter(p=>{const search=', 'products.filter(p=>{if(!matchesBrand(p,brand))return false;const search=');
 panel=panel.replace('[sortOrder,products,q,cat', '[brand,sortOrder,products,q,cat');
 panel=panel.replace('categories.map(c=>', 'categories.filter(c=>matchesBrand(c,brand)).map(c=>');
 panel=panel.replace('collections.filter(c=>!cat', 'collections.filter(c=>matchesBrand(c,brand)).filter(c=>!cat');
 panel=panel.replace('<input className="field" placeholder="Ürün adı / SKU / arama"', '<div className="w-[42%] shrink-0"><CatalogBrandSelect value={brand} onChange={value=>{setBrand(value);setCat(\'\');setCol(\'\')}}/></div><input className="field min-w-0 flex-1" placeholder="Ürün adı / SKU / arama"');
 if(!panel.includes('matchesBrand(p,brand)')||!panel.includes('value={brand}'))throw new Error('Brand filter anchor missing');
 s=s.slice(0,start)+panel+s.slice(end);
 s=s.replace('const addToNewPage=', "const continueIds=(ids:string[])=>{save(continueCatalogProducts(sorted,page?.id||'',ids,(base,chunk)=>applyWithSettings({...base,id:uid(),title:'Ürünler',style:undefined,content:{productIds:chunk}},'LAYOUT_C_PRODUCT_GRID')));setPendingProducts(null)};const addToNewPage=");
 const cancel='<button className="field" onClick={()=>setPendingProducts(null)}>Vazgeç</button>';
 if(!s.includes(cancel))throw new Error('Continue action anchor missing');
 s=s.replace(cancel,'<button className="field" onClick={()=>continueIds(pendingProducts)}>Devam et · boş kartları doldur</button>'+cancel);
 const local='<div className="text-[9px] mb-2">Geçerli sayfa</div>';
 if(!s.includes(local))throw new Error('Current page logo anchor missing');
 s=s.replace(local,local+'<CatalogLogoControls settings={{...settings,...page.style}} onChange={(patch:any)=>onPageStyle({...page.style,...patch})}/>');
 fs.writeFileSync(file,s);
}

// Product clicks select only; placement is requested by explicit add actions.
{
 let source=fs.readFileSync(file,'utf8');
 if(!source.includes('const[selectedProducts,setSelectedProducts]')){
  const start=source.indexOf('function ProductsPanel('),end=source.indexOf('function PageSettingsPanel(',start);
  let panel=source.slice(start,end);
  const replacePanel=(from,to)=>{if(!panel.includes(from))throw new Error('Product selection anchor missing: '+from);panel=panel.replace(from,to)};
  replacePanel("const[q,setQ]=React.useState('')","const[selectedProducts,setSelectedProducts]=React.useState<Set<string>>(new Set());const[q,setQ]=React.useState('')");
  replacePanel('checked={used.has(p.id)} onChange={e=>e.target.checked?onAddIds([p.id]):null}', 'checked={used.has(p.id)||selectedProducts.has(p.id)} onChange={()=>setSelectedProducts(current=>{const next=new Set(current);next.has(p.id)?next.delete(p.id):next.add(p.id);return next})}');
  replacePanel('<button onClick={()=>onReplaceIds(filtered.map(p=>p.id))}', '<button disabled={!selectedProducts.size} onClick={()=>{onAddIds(products.filter(p=>selectedProducts.has(p.id)&&!used.has(p.id)).map(p=>p.id));setSelectedProducts(new Set())}} className="px-3 h-8 border text-[8px] disabled:opacity-30">Seçilenleri ekle ({selectedProducts.size})</button><button onClick={()=>{onReplaceIds(filtered.map(p=>p.id));setSelectedProducts(new Set())}}');
  source=source.slice(0,start)+panel+source.slice(end);
  fs.writeFileSync(file,source);
 }
}

// Shared desktop/mobile settings, first insertion and per-card manual captions.
{
 let source=fs.readFileSync(file,'utf8');
 if(!source.includes('// Manual catalog captions')){
  const change=(from,to)=>{if(!source.includes(from))throw new Error('Manual caption anchor missing: '+from.slice(0,100));source=source.replace(from,to)};
  source="// Manual catalog captions\nimport { firstEmptyCatalogPage, resetCatalogFields, resolveCatalogProduct, CatalogField } from '../shared/catalogManualFields';\nimport { ManualProductFields } from './ManualProductFields';\n"+source;
  change('const replaceIds=(ids:string[])=>{',`const requestProducts=(ids:string[])=>{if(!ids.length)return;const empty=firstEmptyCatalogPage(sorted);if(empty){save(continueCatalogProducts(sorted.map(pg=>pg.id===empty.id?{...pg,content:{productIds:[],blocks:[]}}:pg),empty.id,ids,(base,chunk)=>applyWithSettings({...base,id:uid(),title:'Ürünler',content:{productIds:chunk}},'LAYOUT_C_PRODUCT_GRID',settings.productInfoDefaults)));setPageId(empty.id)}else setPendingProducts(ids)};
const resetFields=(local:boolean,field?:CatalogField,automatic=true)=>{if(!local)onUpdateCatalog({settings:{...settings,productInfoDefaults:{...settings.productInfoDefaults,automaticFields:field?{...settings.productInfoDefaults?.automaticFields,[field]:automatic}:{name:true,sku:true,price:true,color:true,clarity:true,stoneDetails:true,stone:true,properties:true}}}});save(resetCatalogFields(sorted,local?page?.id:undefined,field,automatic))};
const replaceIds=(ids:string[])=>{`);
  change('onAddIds={ids=>setPendingProducts(ids)} onReplaceIds={replaceIds}', 'onAddIds={requestProducts} onReplaceIds={requestProducts}');
  const from=source.indexOf("{panel==='page'&&page&&"),to=source.indexOf('</aside>',from);
  if(from<0||to<0)throw new Error('Shared settings panel missing');
  source=source.slice(0,from)+`{panel==='page'&&page&&<MobilePageSettings page={page} settings={settings} onSettings={updateSettings} onPageStyle={updatePageStyle} onUpdateInfo={updateProductInfo} onResetFields={resetFields}/>} `+source.slice(to);
  change('const p=b.productId?products.find(x=>x.id===b.productId):null;', 'let p=b.productId?products.find(x=>x.id===b.productId):null;');
  change('const styleFor=(part:', 'if(p)p=resolveCatalogProduct(p,b,productInfo);const styleFor=(part:');
  change('onRemove?:()=>void}){const prod=', 'onRemove?:()=>void;info:ProductInfoSettings}){const prod=');
  change('function Inspector({page,block,products,onPatch,onRemove}:', 'function Inspector({page,block,products,onPatch,onRemove,info}:');
  change('{prod&&<div className="border p-2 text-[8px]">', '{prod&&block.frameKind===\'product\'&&<ManualProductFields block={block} product={prod} info={info} onPatch={onPatch} onReset={()=>onPatch({manualFields:undefined,productInfo:{...info,automaticFields:{name:true,sku:true,price:true,color:true,clarity:true,stoneDetails:true,stone:true,properties:true}},})}/>} {prod&&<div className="border p-2 text-[8px]">');
  change('<Inspector page={page} block={b} products={products}', '<Inspector page={page} block={b} products={products} info={{...infoDefaults,...b.productInfo,...page.style?.productInfoOverrides,automaticFields:{...b.productInfo?.automaticFields,...page.style?.productInfoOverrides?.automaticFields}}}');
  change('const productInfo={...infoDefaults,...b.productInfo,...page?.style?.productInfoOverrides};', 'const productInfo={...infoDefaults,...b.productInfo,...page?.style?.productInfoOverrides,automaticFields:{...b.productInfo?.automaticFields,...page?.style?.productInfoOverrides?.automaticFields}};');
  fs.writeFileSync(file,source);
 }
}

// Gold color, colored gems and stone cuts share the same product-data predicates.
{
 let source=fs.readFileSync(file,'utf8');
 if(!source.includes('// Jewelry attribute filters')){
  source="// Jewelry attribute filters\nimport { JewelryFilterControls, JewelryFilters, jewelryOptions, matchesJewelryFilters } from '../shared/catalogJewelryFilters';\n"+source;
  const start=source.indexOf('function ProductsPanel('),end=source.indexOf('function PageSettingsPanel(',start);let panel=source.slice(start,end);
  const change=(from,to)=>{if(!panel.includes(from))throw new Error('Jewelry filter anchor missing: '+from.slice(0,100));panel=panel.replace(from,to)};
  change('const[selectedProducts,setSelectedProducts]', 'const[jewelry,setJewelry]=React.useState<JewelryFilters>({gold:[],gems:[],cuts:[]});const[selectedProducts,setSelectedProducts]');
  change('const filtered=React.useMemo(', 'const jewelryChoices=React.useMemo(()=>jewelryOptions(products.filter(p=>matchesBrand(p,brand))),[products,brand]);const filtered=React.useMemo(');
  change('if(!matchesBrand(p,brand))return false;', 'if(!matchesBrand(p,brand)||!matchesJewelryFilters(p,jewelry))return false;');
  change('[brand,sortOrder,products,q', '[jewelry,brand,sortOrder,products,q');
  change("setQ('');setCat('');", "setJewelry({gold:[],gems:[],cuts:[]});setQ('');setCat('');");
  change("setBrand(value);setCat('');", "setBrand(value);setJewelry({gold:[],gems:[],cuts:[]});setCat('');");
  change('<DiamondGradePicker label="Renk"', '<div className="col-span-2"><JewelryFilterControls options={jewelryChoices} value={jewelry} onChange={setJewelry}/></div><DiamondGradePicker label="Renk"');
  source=source.slice(0,start)+panel+source.slice(end);fs.writeFileSync(file,source);
 }
}
// Per-card product image controls
{
 const file='src/components/studio/CatalogStudioV5.tsx';
 let source=fs.readFileSync(file,'utf8');
 if(!source.includes('// Per-card product image controls')){
  source="// Per-card product image controls\nimport { ProductImageControls, productImageTransform } from './ProductImageControls';\n"+source;
  const replaceImage=(from,to)=>{if(!source.includes(from))throw new Error('Product image patch missing: '+from);source=source.replace(from,to)};
  replaceImage("{prod&&block.frameKind==='product'&&<ManualProductFields", "{prod&&block.frameKind==='product'&&<ProductImageControls block={block} onPatch={onPatch}/>} {prod&&block.frameKind==='product'&&<ManualProductFields");
  replaceImage('<img src={p.images[0]} className="catalog-product-image w-[92%] flex-1 min-h-0 object-contain"/>', '<div className="relative w-[92%] flex-1 min-h-0 overflow-hidden"><img draggable={false} src={p.images[0]} className="catalog-product-image absolute inset-0 w-full h-full object-contain pointer-events-none" style={{width:"100%",height:"100%",transform:productImageTransform(b),transformOrigin:"center center"}}/></div>');
  fs.writeFileSync(file,source);
 }
}

// Card automatic fields synced with current page
{
 const file='src/components/studio/CatalogStudioV5.tsx';
 let source=fs.readFileSync(file,'utf8');
 if(!source.includes('// Card automatic fields synced with current page')){
  const change=(from,to)=>{if(!source.includes(from))throw new Error('Card automatic patch missing: '+from);source=source.replace(from,to)};
  change('onRemove,info}:{page:Page;', 'onRemove,info,onAutomatic,onResetFields}:{page:Page;');
  change('info:ProductInfoSettings}){const prod=', 'info:ProductInfoSettings;onAutomatic:(field:CatalogField,automatic:boolean)=>void;onResetFields:()=>void}){const prod=');
  change('info={info} onPatch={onPatch} onReset={()=>onPatch({manualFields:undefined,productInfo:{...info,automaticFields:{name:true,sku:true,price:true,color:true,clarity:true,stoneDetails:true,stone:true,properties:true}},})}', 'info={info} onPatch={onPatch} onAutomatic={onAutomatic} onReset={onResetFields}');
  change('onPatch={p=>patch(b.id,p)} onRemove=', 'onPatch={p=>patch(b.id,p)} onAutomatic={(field,automatic)=>resetFields(true,field,automatic)} onResetFields={()=>resetFields(true)} onRemove=');
  fs.writeFileSync(file,'// Card automatic fields synced with current page\n'+source);
 }
}

// Immediate product selection and empty catalog start
{
 const file='src/components/studio/CatalogStudioV5.tsx';let source=fs.readFileSync(file,'utf8');
 if(!source.includes('// Immediate product selection and empty catalog start')){
  const change=(from,to)=>{if(!source.includes(from))throw new Error('Live selection patch missing: '+from);source=source.replace(from,to)};
  change("const sorted=[...pages].sort((a,b)=>a.order-b.order);const [stackedMobile", "const blank:Page={id:'catalog-empty-start',catalogId:catalog.id,order:0,title:'Ürünler',layoutId:'LAYOUT_C_PRODUCT_GRID',content:{productIds:[],blocks:[]}};const sorted=(pages.length?[...pages]:[blank]).sort((a,b)=>a.order-b.order);const [stackedMobile");
  change('{sorted.map((p,i)=><div key={p.id}', '{pages.length===0&&<p className="p-3 text-xs opacity-60">Ürün seçtikçe sayfalar oluşur.</p>}{pages.map((p,i)=><div key={p.id}');
  change('{(stackedMobile||exportingAll?sorted:page?[page]:[])', '{(pages.length===0?[]:stackedMobile||exportingAll?sorted:page?[page]:[])');
  change('const requestProducts=', "const liveProducts=(ids:string[],checked=true)=>{const next=selectCatalogProducts(pages,ids,checked,blank,(base,chunk)=>applyWithSettings({...base,id:uid(),title:'Ürünler',content:{productIds:chunk}},'LAYOUT_C_PRODUCT_GRID',settings.productInfoDefaults));save(next);if(!next.some(pg=>pg.id===pageId))setPageId(next[0]?.id||blank.id);setBlockId(null)};const requestProducts=");
  change('onAddIds={requestProducts} onReplaceIds={requestProducts}', 'catalogPages={pages} onToggle={(id,checked)=>liveProducts([id],checked)} onAddIds={liveProducts} onReplaceIds={liveProducts}');
  change('function ProductsPanel({page,products,', 'function ProductsPanel({catalogPages,onToggle,page,products,');
  change('onReplaceIds}:{page:Page;', 'onReplaceIds}:{catalogPages:Page[];onToggle:(id:string,checked:boolean)=>void;page:Page;');
  change('const used=new Set(page.content.productIds||[])', 'const used=new Set(selectedCatalogIds(catalogPages))');
  change('disabled={used.has(p.id)} checked={used.has(p.id)||selectedProducts.has(p.id)} onChange={()=>setSelectedProducts(current=>{const next=new Set(current);next.has(p.id)?next.delete(p.id):next.add(p.id);return next})}', 'checked={used.has(p.id)} onChange={event=>onToggle(p.id,event.target.checked)}');
  change('<button disabled={!selectedProducts.size}', '<button hidden disabled={!selectedProducts.size}');
  change("const clearCatalog=()=>{if(!window.confirm('Katalogdaki tüm sayfa ve ürünler temizlensin mi? Geri al ile geri dönebilirsiniz.'))return;const blank=emptyPage();save([blank]);setPageId(blank.id);setBlockId(null)}", "const clearCatalog=()=>{if(!window.confirm('Katalogdaki tüm sayfa ve ürünler temizlensin mi? Geri al ile geri dönebilirsiniz.'))return;save([]);setPageId(blank.id);setBlockId(null)}");
  source="// Immediate product selection and empty catalog start\nimport { selectedCatalogIds, selectCatalogProducts } from '../shared/catalogLiveSelection';\n"+source;fs.writeFileSync(file,source);
 }
}

// Desktop/tablet viewing controls do not change saved catalog geometry.
{
 let source=fs.readFileSync(file,'utf8');
 if(!source.includes('// Resizable studio viewport')){
 const change=(from,to)=>{if(!source.includes(from))throw new Error('Viewport anchor missing: '+from);source=source.replace(from,to)};
 source="// Resizable studio viewport\nimport { useStudioViewport, StudioViewControls, StudioPanelHandle, StudioViewportStyles } from './StudioViewport';\n"+source;
 change('const pageDrag=React.useRef', 'const viewport=useStudioViewport(areaRef,catalog.settings?.pageWidth||210,catalog.settings?.pageHeight||297);const stackedPages=true;const pageDrag=React.useRef');
 change('<aside className="w-56 bg-white border-r flex flex-col">','<aside style={!stackedMobile?{width:viewport.left,flexShrink:0}:undefined} className="w-56 bg-white border-r flex flex-col">');
 change('</aside><main','</aside><StudioPanelHandle side="left" onPointerDown={e=>viewport.drag(\'left\',e)}/><main');
 change('</main><aside className="w-[430px] bg-white border-l overflow-auto">','</main><StudioPanelHandle side="right" onPointerDown={e=>viewport.drag(\'right\',e)}/><aside style={!stackedMobile?{width:viewport.right,flexShrink:0}:undefined} className="w-[430px] bg-white border-l overflow-auto">');
 change('<StudioActions undo=', '<div className="flex items-center gap-2"><StudioViewportStyles/><StudioViewControls view={viewport}/><StudioActions undo=');
 change('publish={canPublish?onPublish:undefined}/></header>', 'publish={canPublish?onPublish:undefined}/></div></header>');
 change("style={exportingAll?{display:", "style={exportingAll?{display:");
 change('}:stackedMobile?{display:"block"}:undefined}', '}:stackedMobile?{display:"block"}:{display:"block"}}');
 change("*zoom:'min(760px,70vw)',aspectRatio:", "*zoom:exportingAll?'min(760px,70vw)':stackedMobile?'min(760px,70vw)':viewport.width,aspectRatio:");
 change('stackedMobile||exportingAll?sorted', 'stackedPages||exportingAll?sorted');
 change('if(!stackedMobile||exportingAll)return;const root=', 'if(!stackedPages||exportingAll)return;const root=');
 change('if(stackedMobile&&page.id!==pageId)', 'if(stackedPages&&page.id!==pageId)');
 change('if(stackedMobile){document.querySelector', 'if(stackedPages){document.querySelector');
 change('if(!stackedMobile)swipeEnd(e)', 'if(!stackedPages)swipeEnd(e)');
 fs.writeFileSync(file,source);
 }
}

// Model-only selection preserves the full source pool for saved cards and variants.
{
 let source=fs.readFileSync(file,'utf8');
 if(!source.includes('// Catalog model selection')){
 const change=(from,to)=>{if(!source.includes(from))throw new Error('Model selection anchor missing: '+from);source=source.replace(from,to)};
 source="// Catalog model selection\nimport { catalogSelectableProducts, catalogModelName } from '../shared/catalogModelSelection';\nimport { LarienVariantControls } from './LarienVariantControls';\n"+source;
 const start=source.indexOf('function ProductsPanel('),end=source.indexOf('function PageSettingsPanel(',start);
 let panel=source.slice(start,end);
 panel=panel.replace('products.filter(p=>{', 'catalogSelectableProducts(products,catalogPages).filter(p=>{');
 panel=panel.replace('[brand,sortOrder,products,q,cat', '[catalogPages,brand,sortOrder,products,q,cat');
 panel=panel.replace('{p.name}</div>', '{catalogModelName(p)}</div>');
 if(!panel.includes('catalogSelectableProducts(products,catalogPages)'))throw new Error('Model pool missing');
 source=source.slice(0,start)+panel+source.slice(end);
 change('{products.map(p=><option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}', '{catalogSelectableProducts(products,[page]).map(p=><option key={p.id} value={p.id}>{catalogModelName(p)} · {p.sku}</option>)}');
 change("{prod&&block.frameKind==='product'&&<ProductImageControls", "{prod&&block.frameKind==='product'&&<LarienVariantControls product={prod} products={products} onPatch={onPatch}/>} {prod&&block.frameKind==='product'&&<ProductImageControls");
 change('content:{...pg.content,blocks:(pg.content.blocks||[]).map(b=>b.id===id?{...b,...p}:b)}', 'content:{...pg.content,productIds:p.productId?(pg.content.productIds||[]).map(pid=>pid===current?.productId?p.productId!:pid):pg.content.productIds,blocks:(pg.content.blocks||[]).map(b=>b.id===id?{...b,...p}:b)}');
 fs.writeFileSync(file,source);
 }
}

// Explicit copies and per-card Venta grades stay inside the existing page grid.
{
 let source=fs.readFileSync(file,'utf8');
 if(!source.includes('// Catalog card variants')){
 const change=(from,to)=>{if(!source.includes(from))throw new Error('Card variant anchor missing: '+from);source=source.replace(from,to)};
 source="// Catalog card variants\nimport { duplicateVariantBlocks, duplicateCatalogCard } from '../shared/catalogModelSelection';\nimport { VentaVariantControls } from './VentaVariantControls';\n"+source;
 change('const pageDrag=React.useRef', 'const duplicateBlocks=React.useMemo(()=>duplicateVariantBlocks(products,pages),[products,pages]);const pageDrag=React.useRef');
 change('const patch=', "const duplicateCard=(id:string)=>{const result=duplicateCatalogCard(sorted,page.id,id,(base,pid)=>applyWithSettings({...base,id:uid(),title:'Ürünler',content:{productIds:[pid]}},'LAYOUT_C_PRODUCT_GRID'));if(result){save(result.pages);setPageId(result.pageId);setBlockId(result.blockId);setPanel('element')}};const patch=");
 change('onRemove,info,onAutomatic,onResetFields}:', 'onRemove,info,onAutomatic,onResetFields,onDuplicate}:');
 change('onResetFields:()=>void}){const prod=', 'onResetFields:()=>void;onDuplicate:()=>void}){const prod=');
 change('onResetFields={()=>resetFields(true)} onRemove=', 'onResetFields={()=>resetFields(true)} onDuplicate={()=>duplicateCard(b.id)} onRemove=');
 change('<LarienVariantControls product={prod} products={products} onPatch={onPatch}/>', '<LarienVariantControls product={prod} products={products} onPatch={onPatch} onDuplicate={onDuplicate}/>');
 change("{prod&&block.frameKind==='product'&&<LarienVariantControls", "{prod&&block.frameKind==='product'&&<VentaVariantControls product={prod} products={products} onPatch={onPatch} onDuplicate={onDuplicate}/>} {prod&&block.frameKind==='product'&&<LarienVariantControls");
 change('productIds:p.productId?(pg.content.productIds||[]).map(pid=>pid===current?.productId?p.productId!:pid):pg.content.productIds', "productIds:(pg.content.blocks||[]).map(b=>b.id===id?{...b,...p}:b).filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!)");
 change('borderColor:(page.style as any)?.productBorderColor', "outline:!exportingAll&&duplicateBlocks.has(page.id+':'+b.id)?'2px solid #dc2626':undefined,outlineOffset:-2,borderColor:(page.style as any)?.productBorderColor");
 change('onRemove={()=>b.productId&&removeProduct(b.productId)}', "onRemove={()=>{if(duplicateBlocks.has(page.id+':'+b.id))patch(b.id,{frameKind:'empty',productId:undefined});else b.productId&&removeProduct(b.productId)}}");
 fs.writeFileSync(file,source);
 }
}

// Catalog display currencies and rounding (shared by editor, preview and PDF).
{
 let source=fs.readFileSync(file,'utf8');
 if(!source.includes('// Catalog display currencies')) {
  const before="{productInfo.pricePrefix||'₺'}{(p.price*(1-(productInfo.discountPercent||0)/100)).toLocaleString('tr-TR')}";
  if(!source.includes(before))throw new Error('Catalog price rendering anchor missing');
  source="// Catalog display currencies\nimport { formatCatalogPrice } from '../shared/catalogPrice';\n"+source.replace(before,'{formatCatalogPrice(p.price,productInfo)}');
  fs.writeFileSync(file,source);
 }
}
