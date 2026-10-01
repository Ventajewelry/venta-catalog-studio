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
