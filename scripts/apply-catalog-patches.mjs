import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const write=(f,s)=>fs.writeFileSync(path.join(root,f),s);

{
 const f='src/components/studio/CatalogStudioFinal.tsx'; let s=read(f);
 s=s.replace('export export function buildBlocks','export function buildBlocks');
 if(!s.includes('export function buildBlocks(layout:LayoutId,ids:string[],preset?:GridPreset):PageBlock[]'))s=s.replace('function buildBlocks(layout:LayoutId,ids:string[],preset?:GridPreset):PageBlock[]','export function buildBlocks(layout:LayoutId,ids:string[],preset?:GridPreset):PageBlock[]');

 const helper=` const buildPagesFromProducts=(sourcePages:Page[],pageIndex:number,ids:string[],layout:LayoutId,preset:GridPreset):Page[]=>{
  const result=sourcePages.map(p=>({...p,content:{...p.content,blocks:(p.content.blocks||[]).map(b=>({...b,productInfo:b.productInfo?{...b.productInfo}:undefined}))}}));
  if(pageIndex<0||pageIndex>=result.length)return result;
  const target=result[pageIndex];
  const cap=capacity(layout,preset);
  const head=ids.slice(0,cap);
  const overflow=ids.slice(cap);
  result[pageIndex]={...replaceProductIds(target,head,layout,preset),style:{...(target.style||{}),gridPreset:preset}};
  if(!overflow.length)return result.map((p,i)=>({...p,order:i}));
  const inserted:Page[]=[];
  for(let offset=0;offset<overflow.length;offset+=cap){
   const chunk=overflow.slice(offset,offset+cap);
   const source=target;
   const np={id:uid(),catalogId:source.catalogId,order:pageIndex+1+inserted.length,layoutId:layout,title:\`Page \${pageIndex+2+inserted.length}\`,style:{...(source.style||{}),gridPreset:preset},content:{...source.content,blocks:[],productIds:[]}} as Page;
   inserted.push(replaceProductIds(np,chunk,layout,preset));
  }
  result.splice(pageIndex+1,0,...inserted);
  return result.map((p,i)=>({...p,order:i}));
 };
`;
 const helperMarker=' const selectLayout=(layout:LayoutId)=>{';
 if(!s.includes('const buildPagesFromProducts='))s=s.replace(helperMarker,helper+helperMarker);

 const handlersStart=s.indexOf(' const makeChunkPage=');
 const handlersEnd=s.indexOf(' const removeSelected=',handlersStart);
 if(handlersStart>=0&&handlersEnd>handlersStart){
  const handlers=` const selectLayout=(layout:LayoutId)=>{
  const index=Math.max(0,pages.findIndex(p=>p.id===page.id));
  const next=buildPagesFromProducts(pages,index,currentIds,layout,gridPreset);
  updatePages(next);
  setSelectedPageId(page.id);
  setSelectedBlockId(undefined);
  setNotice(\`${'${layoutNames[layout]}'} yalnızca seçili sayfaya uygulandı\`);
  setTimeout(()=>setNotice(''),1800);
 };
 const applyClassic=()=>{
  const index=Math.max(0,pages.findIndex(p=>p.id===page.id));
  const next=buildPagesFromProducts(pages,index,currentIds,'LAYOUT_C_PRODUCT_GRID',gridPreset);
  updatePages(next);
  setSelectedPageId(page.id);
  setSelectedBlockId(undefined);
  setNotice(\`${'${gridPreset}'}’li klasik grid yalnızca seçili sayfaya uygulandı\`);
  setTimeout(()=>setNotice(''),1800);
 };
 const addMany=(items:Product[])=>{
  if(!items.length)return;
  const index=Math.max(0,pages.findIndex(p=>p.id===page.id));
  const layout=page.layoutId;
  const all=[...currentIds,...items.map(p=>p.id).filter(id=>!currentIds.includes(id))];
  const next=buildPagesFromProducts(pages,index,all,layout,gridPreset);
  updatePages(next);
  setSelectedPageId(page.id);
  setSelectedBlockId(undefined);
  setNotice(\`${'${items.length}'} ürün eklendi · mevcut sayfa düzeni korunuyor\`);
  setTimeout(()=>setNotice(''),1800);
 };
 const addProduct=(p:Product)=>{if(usedElsewhere.has(p.id)){setNotice('Bu ürün başka sayfada kullanılıyor.');return}addMany([p])};
`;
  s=s.slice(0,handlersStart)+handlers+s.slice(handlersEnd);
 }

 s=s.replace("const [search,setSearch]=React.useState(''),[category,setCategory]=React.useState(''),[collection,setCollection]=React.useState('');", "const [search,setSearch]=React.useState(''),[category,setCategory]=React.useState(''),[collection,setCollection]=React.useState(''); const [productListLimit,setProductListLimit]=React.useState(40);");
 s=s.replace("const available=products.filter(p=>!usedAll.has(p.id)&&", "const available=(Array.isArray(products)?products:[]).filter(p=>!usedAll.has(p.id)&&");
 if(!s.includes('const visibleProducts=available.slice(0,productListLimit)'))s=s.replace(" const pushHistory=()=>", " React.useEffect(()=>{setProductListLimit(40)},[search,category,collection]); const visibleProducts=available.slice(0,productListLimit);\n const pushHistory=()=>");
 s=s.replace("{available.map(p=><button", "{visibleProducts.map(p=><button");
 const productListMarker="</div>}\n {tab==='elements'&&";
 const productListReplacement="</div>{available.length>productListLimit&&<button onClick={()=>setProductListLimit(n=>n+40)} className=\"w-full mt-2 h-8 border border-[#0f203a]/20 text-[9px]\">Daha fazla ürün göster ({Math.min(40,available.length-productListLimit)})</button>}\n {tab==='elements'&&";
 s=s.replace(productListMarker,productListReplacement);

 // Products tab is isolated from the rest of the editor. Never mount hundreds of image-heavy cards at once.
 const safeProductsTab=`{tab==='products'&&<div className="space-y-3"><Label>SHOPIFY ÜRÜNLERİ</Label><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ürün adı, SKU, kategori veya koleksiyon ara..." className="field w-full"/><div className="grid grid-cols-2 gap-2"><Select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Tüm kategoriler</option>{categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select value={collection} onChange={e=>setCollection(e.target.value)}><option value="">Tüm koleksiyonlar</option>{collections.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</Select><Select value={karat} onChange={e=>setKarat(e.target.value)}><option value="">Tüm karatlar</option>{karats.map(k=><option key={k} value={k}>{k}K</option>)}</Select><button onClick={()=>{setSearch('');setCategory('');setCollection('');setKarat('')}} className="h-9 border text-[8px] uppercase">Filtreleri temizle</button></div><div className="flex items-center gap-2"><span className="text-[8px] opacity-50">{available.length} ürün bulundu</span><button onClick={()=>addMany(available)} disabled={!available.length} className="ml-auto h-9 px-3 border text-[9px] disabled:opacity-40">Filtrelenenleri ekle</button></div><div className="grid grid-cols-1 gap-2 max-h-[calc(100vh-330px)] overflow-auto pr-1">{visibleProducts.map(p=><button key={p.id} onClick={()=>addProduct(p)} className="w-full flex items-center gap-3 border border-[#0f203a]/10 bg-white p-2 text-left hover:border-[#0f203a]/30"><div className="w-12 h-12 shrink-0 bg-[#f7f8fa] overflow-hidden"><img src={Array.isArray(p.images)?p.images[0]:undefined} loading="lazy" decoding="async" draggable={false} className="w-full h-full object-contain" onError={e=>{e.currentTarget.style.display='none'}}/></div><div className="min-w-0 flex-1"><div className="text-[10px] font-semibold truncate">{p.name||'Ürün'}</div><div className="text-[9px] opacity-50 truncate">SKU {p.sku||'—'} · {p.karat?String(p.karat)+'K · ':''}{p.category||'—'}</div></div><span className="text-[9px] uppercase tracking-[.12em] opacity-50">Ekle</span></button>)}</div>{available.length>productListLimit&&<button onClick={()=>setProductListLimit(n=>n+40)} className="w-full h-9 border text-[9px]">Daha fazla ürün göster ({Math.min(40,available.length-productListLimit)})</button>}</div>}`;
 const productTabPattern=/\{tab==='products'&&[\s\S]*?\{tab==='elements'&&/;
 if(productTabPattern.test(s))s=s.replace(productTabPattern,safeProductsTab+'\n {tab===\'elements\'&&');

 write(f,s);
}

// Page-local card operations: keep the global catalog intact while allowing an editor
// to temporarily remove, restore, select and merge slots on the active page.
{
  const f='src/components/studio/CatalogStudioV5.tsx'; let s=read(f);
  s=s.replace("const[mergeIds,setMergeIds]=React.useState<string[]>([]);const[mergeIds,setMergeIds]=React.useState<string[]>([]);", "const[mergeIds,setMergeIds]=React.useState<string[]>([]);");
  if(!s.includes('const[mergeIds,setMergeIds]'))s=s.replace("const[dragId,setDragId]=React.useState<string|null>(null);", "const[dragId,setDragId]=React.useState<string|null>(null);const[mergeIds,setMergeIds]=React.useState<string[]>([]);");
  if(!s.includes('const mergeSelection=()=>'))s=s.replace("const updateSettings=(p:Partial<CatalogSettings>)=>", `const mergeSelection=()=>{if(!page)return false;const blocks=(page.content.blocks||[]).filter(b=>mergeIds.includes(b.id)&&b.type!=='text'&&(b.frameKind==='product'||b.frameKind==='empty'));if(blocks.length<2)return false;const row=blocks.every(b=>Math.abs((b.y||0)-(blocks[0].y||0))<0.3&&Math.abs((b.height||0)-(blocks[0].height||0))<0.3);const col=blocks.every(b=>Math.abs((b.x||0)-(blocks[0].x||0))<0.3&&Math.abs((b.width||0)-(blocks[0].width||0))<0.3);if(!row&&!col)return false;const axis=row?'x':'y',size=row?'width':'height',ordered=[...blocks].sort((a,b)=>(a[axis]||0)-(b[axis]||0));return ordered.every((b,i)=>i===0||Math.abs(((ordered[i-1][axis]||0)+(ordered[i-1][size]||0))-(b[axis]||0))<0.35)};const mergeCards=()=>{if(!page||!mergeSelection())return;const chosen=(page.content.blocks||[]).filter(b=>mergeIds.includes(b.id)&&b.type!=='text'&&(b.frameKind==='product'||b.frameKind==='empty'));const row=chosen.every(b=>Math.abs((b.y||0)-(chosen[0].y||0))<0.3);const ordered=[...chosen].sort((a,b)=>row?(a.x||0)-(b.x||0):(a.y||0)-(b.y||0));const leader=[...ordered].sort((a,b)=>(page.content.productIds||[]).indexOf(a.productId||'')-(page.content.productIds||[]).indexOf(b.productId||''))[0]||ordered[0];const displaced=ordered.filter(b=>b.id!==leader.id&&b.productId).map(b=>b.productId!);const empty=(page.content.blocks||[]).filter(b=>!mergeIds.includes(b.id)&&(b.frameKind==='empty'||(b.frameKind==='product'&&!b.productId)));if(displaced.length>empty.length)return;const minX=Math.min(...ordered.map(b=>b.x||0)),minY=Math.min(...ordered.map(b=>b.y||0)),maxX=Math.max(...ordered.map(b=>(b.x||0)+(b.width||0))),maxY=Math.max(...ordered.map(b=>(b.y||0)+(b.height||0)));let cursor=0;const rest=(page.content.blocks||[]).filter(b=>!mergeIds.includes(b.id)).map(b=>{if((b.frameKind==='empty'||(b.frameKind==='product'&&!b.productId))&&cursor<displaced.length)return {...b,frameKind:'product' as const,productId:displaced[cursor++]};return b});const merged:{[key:string]:any}={...leader,x:minX,y:minY,width:maxX-minX,height:maxY-minY,frameKind:'product'};save(sorted.map(pg=>pg.id===page.id?{...pg,content:{...pg.content,blocks:[...rest,merged]}}:pg));setMergeIds([]);setBlockId(merged.id)};const updateSettings=(p:Partial<CatalogSettings>)=>`);
  s=s.replace("onClick={e=>{e.stopPropagation();setBlockId(b.id);setPanel('element')}} onDoubleClick", "onClick={e=>{e.stopPropagation();if(e.ctrlKey||e.metaKey){setMergeIds(ids=>ids.includes(b.id)?ids.filter(id=>id!==b.id):[...ids,b.id]);return}setBlockId(b.id);setPanel('element')}} onDoubleClick");
  s=s.replace("blockId===b.id?'ring-2 ring-[#0f203a]':''", "blockId===b.id?'ring-2 ring-[#0f203a]':mergeIds.includes(b.id)?'ring-2 ring-amber-500':''");
  s=s.replace("</header><div className=\"flex-1 overflow-auto p-6 flex justify-center\">", "</header>{mergeSelection()&&<div className=\"bg-amber-50 border-b px-4 py-2 text-center\"><button className=\"smallbtn\" onClick={mergeCards}>Seçilen kartları birleştir ({mergeIds.length})</button><span className=\"ml-2 text-[9px] opacity-60\">Ctrl / Cmd + tıklama ile bitişik kart seçilir</span></div>}<div className=\"flex-1 overflow-auto p-6 flex justify-center\">");
  write(f,s);
}

{
 const f='src/components/studio/CatalogStudioEnhanced.tsx'; let s=read(f);
 const start=s.indexOf('function rebalancePages(');
 const end=s.indexOf('\nexport function CatalogStudioEnhanced',start);
 if(start>=0&&end>start){
  const fn=`function rebalancePages(previous:Page[],next:Page[]):Page[]{
   const changedIndex=next.findIndex(np=>{const pp=previous.find(p=>p.id===np.id);return !!pp&&(np.layoutId!==pp.layoutId||((np.style as any)?.gridPreset!==(pp.style as any)?.gridPreset));});
   if(changedIndex>=0)return next.map(cleanBlocks).map((p,i)=>({...p,order:i}));
   const prevAll=unique(previous.flatMap(productIdsOf));
   const nextAll=unique(next.flatMap(productIdsOf));
   if(nextAll.length<=prevAll.length)return next.map(cleanBlocks).map((p,i)=>({...p,order:i}));
   const result=next.map(cleanBlocks);
   const additions=nextAll.filter(id=>!prevAll.includes(id));
   for(const id of additions){
     let placed=false;
     for(let i=0;i<result.length;i++){
       const p=result[i];
       const preset=((p.style as any)?.gridPreset||12) as number;
       const cap=p.layoutId==='LAYOUT_C_PRODUCT_GRID'?preset:p.layoutId==='LAYOUT_M_PRODUCT_GRID_12'?12:p.layoutId==='LAYOUT_N_PRODUCT_GRID_16'?16:p.layoutId==='LAYOUT_D_ASYMMETRIC'?3:p.layoutId==='LAYOUT_O_EDITORIAL_COLLAGE'?4:p.layoutId==='LAYOUT_P_IMAGE_4_PRODUCTS'?5:p.layoutId==='LAYOUT_S_MAGAZINE'?2:p.layoutId==='LAYOUT_B_HERO_PRODUCT'||p.layoutId==='LAYOUT_Q_SPLIT_EDITORIAL'||p.layoutId==='COVER'?1:1;
       const ids=productIdsOf(p);
       if(ids.length<cap){const nextIds=[...ids,id];result[i]={...p,content:{...p.content,productIds:nextIds,blocks:buildBlocks(p.layoutId,nextIds,preset as any)}};placed=true;break;}
     }
     if(!placed){const template=result[result.length-1]||next[0];const layout=(template?.layoutId||'LAYOUT_C_PRODUCT_GRID') as LayoutId;const preset=((template?.style as any)?.gridPreset||12) as any;result.push({id:crypto.randomUUID(),catalogId:template?.catalogId||next[0]?.catalogId,order:result.length,layoutId:layout,title:'Page '+(result.length+1),style:{...(template?.style||{}),gridPreset:preset},content:{productIds:[id],blocks:buildBlocks(layout,[id],preset)}} as Page);}
   }
   return result.map((p,i)=>({...p,order:i}));
 }
`;
  s=s.slice(0,start)+fn+s.slice(end);
 }
 if(!s.includes("CatalogStudioFinal, buildBlocks"))s=s.replace("import { CatalogStudioFinal } from './CatalogStudioFinal';","import { CatalogStudioFinal, buildBlocks } from './CatalogStudioFinal';");
 write(f,s);
}

{
 const f='src/types.ts'; let s=read(f);
 if(!s.includes('headerWidth?:number'))s=s.replace('gridLocked?:boolean;}','gridLocked?:boolean;headerWidth?:number;headerHeight?:number;footerWidth?:number;footerHeight?:number;gridGapHorizontal?:number;gridGapVertical?:number;gridInsetLeft?:number;gridInsetRight?:number;gridInsetTop?:number;gridInsetBottom?:number;}');
 write(f,s);
}
console.log('VENTA Catalog Studio: product pool rendering guarded; Products tab isolated with lazy bounded cards; stable page-local layouts and non-destructive product pagination applied');

{
 const f='src/components/studio/CatalogStudioV5.tsx'; let s=read(f);
 s=s.replace("const productInfo={...infoDefaults,...b.productInfo};", "const productInfo={...infoDefaults,...b.productInfo,...page?.style?.productInfoOverrides};");
 s=s.replace("const isProductFrame=block.frameKind==='product'||block.frameKind==='image';", "const isProductFrame=block.frameKind==='product'||block.frameKind==='image'||block.frameKind==='empty';");
 s=s.replace("value={block.productId||''} onChange={e=>onPatch({productId:e.target.value})}", "value={block.productId||''} onChange={e=>onPatch(e.target.value?{frameKind:'product',productId:e.target.value}:{frameKind:'empty',productId:undefined})}");
 s=s.replace("{block.frameKind==='product'&&<button className=\"smallbtn text-red-700\" onClick={onRemove}>Ürünü kaldır ve sırayı kaydır</button>}", "{block.frameKind==='product'&&<div className=\"grid grid-cols-2 gap-2\"><button className=\"smallbtn\" onClick={()=>onPatch({frameKind:'empty',productId:undefined})}>Ürün kartını kaldır</button><button className=\"smallbtn text-red-700\" onClick={onRemove}>Ürünü kaldır · sırayı kaydır</button></div>}{block.frameKind==='empty'&&<button className=\"smallbtn\" onClick={()=>onPatch({frameKind:'product'})}>Ürün kartını ekle</button>}");
 s=s.replace("b.frameKind==='product'?<div className=\"w-full h-full bg-white flex flex-col items-center justify-center\"", "b.frameKind==='empty'?<div className=\"w-full h-full bg-white border border-dashed flex items-center justify-center text-[9px] opacity-40\">Ürün kartı ekle</div>:b.frameKind==='product'?<div className=\"w-full h-full bg-white flex flex-col items-center justify-center\"");
 s=s.replace("style={{textAlign:settings.headerPosition||'center',fontSize:settings.headerFontSize||8,fontWeight:settings.headerFontWeight||400,color:settings.headerColor||'#0f203a'}}", "style={{fontFamily:'Majesty, serif',textAlign:settings.headerPosition||'center',fontSize:page.style?.headerFontSize??settings.headerFontSize??8,fontWeight:page.style?.headerFontWeight??settings.headerFontWeight??400,color:page.style?.headerColor??settings.headerColor??'#0f203a'}}");
 s=s.replace("style={{textAlign:settings.footerPosition||'center',fontSize:settings.footerFontSize||8,fontWeight:settings.footerFontWeight||400,color:settings.footerColor||'#0f203a'}}", "style={{fontFamily:'Majesty, serif',textAlign:settings.footerPosition||'center',fontSize:page.style?.footerFontSize??settings.footerFontSize??8,fontWeight:page.style?.footerFontWeight??settings.footerFontWeight??400,color:page.style?.footerColor??settings.footerColor??'#0f203a'}}");
 const current="<div className=\"border-t pt-3\"><div className=\"text-[9px] mb-2\">Geçerli sayfa</div><div className=\"grid grid-cols-3 gap-2 text-[9px]\"><label><input type=\"checkbox\" checked={page.style?.showHeader!==false} onChange={e=>onPageStyle({...page.style,showHeader:e.target.checked})}/> Üst</label><label><input type=\"checkbox\" checked={page.style?.showFooter!==false} onChange={e=>onPageStyle({...page.style,showFooter:e.target.checked})}/> Alt</label><label><input type=\"checkbox\" checked={page.style?.showPageNumber!==false} onChange={e=>onPageStyle({...page.style,showPageNumber:e.target.checked})}/> No</label></div><button className=\"smallbtn w-full mt-3\" onClick={()=>onPageStyle({...page.style,showHeader:undefined,showFooter:undefined,showPageNumber:undefined})}>Güncelle · genel ayarlara dön</button></div>";
 const replacement="<div className=\"border-t pt-3 space-y-3\"><div className=\"text-[9px] mb-2\">Geçerli sayfa</div><div className=\"grid grid-cols-3 gap-2 text-[9px]\"><label><input type=\"checkbox\" checked={page.style?.showHeader!==false} onChange={e=>onPageStyle({...page.style,showHeader:e.target.checked})}/> Üst</label><label><input type=\"checkbox\" checked={page.style?.showFooter!==false} onChange={e=>onPageStyle({...page.style,showFooter:e.target.checked})}/> Alt</label><label><input type=\"checkbox\" checked={page.style?.showPageNumber!==false} onChange={e=>onPageStyle({...page.style,showPageNumber:e.target.checked})}/> No</label></div><div><div className=\"text-[8px] uppercase opacity-60 mb-1\">Ürün bilgileri · yalnızca bu sayfa</div><div className=\"grid grid-cols-3 gap-2 text-[9px]\">{(['showName','showSku','showPrice'] as const).map(k=><label key={k}><input type=\"checkbox\" checked={(page.style?.productInfoOverrides as any)?.[k]??info[k]} onChange={e=>onPageStyle({...page.style,productInfoOverrides:{...(page.style?.productInfoOverrides||{}),[k]:e.target.checked}})}/>{k==='showName'?' Başlık':k==='showSku'?' SKU':' Fiyat'}</label>)}</div></div><div className=\"grid grid-cols-3 gap-2\"><label className=\"text-[8px]\">Üst boyut<input className=\"field mt-1\" type=\"number\" value={page.style?.headerFontSize??settings.headerFontSize??8} onChange={e=>onPageStyle({...page.style,headerFontSize:Number(e.target.value)})}/></label><label className=\"text-[8px]\">Alt boyut<input className=\"field mt-1\" type=\"number\" value={page.style?.footerFontSize??settings.footerFontSize??8} onChange={e=>onPageStyle({...page.style,footerFontSize:Number(e.target.value)})}/></label><label className=\"text-[8px]\">Sayfa rengi<input className=\"field mt-1 h-8 p-1\" type=\"color\" value={page.style?.backgroundColor||settings.backgroundColor||'#ffffff'} onChange={e=>onPageStyle({...page.style,backgroundColor:e.target.value})}/></label></div><button className=\"smallbtn w-full\" onClick={()=>onPageStyle({})}>Tümüne uygula · genel ayarlara dön</button></div>";
 s=s.replace(current,replacement);
 write(f,s);
}

// Product-card gutter is a catalogue-wide visual setting. It changes grid geometry,
// never card count or the chosen layout.
{
 const f='src/components/studio/CatalogStudioV5.tsx'; let s=read(f);
 s=s.replace("const updateSettings=(p:Partial<CatalogSettings>)=>onUpdateCatalog({settings:{...settings,...p}})", "const updateSettings=(p:Partial<CatalogSettings>)=>{onUpdateCatalog({settings:{...settings,...p}});if(p.productCardGap===undefined)return;const gap=Math.max(0,Math.min(8,Number(p.productCardGap)));save(sorted.map(pg=>{const c=cfg(pg.layoutId);if(c.kind!=='grid')return pg;const cols=c.cols||2,rows=c.rows||1,totalW=90,totalH=82,w=(totalW-gap*(cols-1))/cols,h=(totalH-gap*(rows-1))/rows;let i=0;return {...pg,content:{...pg.content,blocks:(pg.content.blocks||[]).map(b=>{if(b.type==='text'||(b.frameKind!=='product'&&b.frameKind!=='empty'))return b;const n=i++;return {...b,x:5+(n%cols)*(w+gap),y:10+Math.floor(n/cols)*(h+gap),width:w,height:h}})}}}))}");
 const gap='<label className="text-[8px] uppercase block mt-3">Ürün kartı aralığı<input className="field mt-1" type="number" min="0" max="8" step="0.5" value={settings.productCardGap??2} onChange={e=>onSettings({productCardGap:Number(e.target.value)})}/></label>';
 while(s.includes(gap+gap))s=s.replace(gap+gap,gap);
 if(!s.includes('Ürün kartı aralığı'))s=s.replace("</label></div><div className=\"border-t pt-3\"><div className=\"text-[9px] mb-2\">Ürün yazıları · tüm katalog</div>", "</label>"+gap+"</div><div className=\"border-t pt-3\"><div className=\"text-[9px] mb-2\">Ürün yazıları · tüm katalog</div>");
 write(f,s);
}

// Keep a page-local layout local. The only action that may repaginate every page is
// the explicitly named "Tüm ürünleri yeniden yerleştir" action.
{
 const f='src/components/studio/CatalogStudioV5.tsx'; let s=read(f);
 const start=s.indexOf('const apply=(id:LayoutId,all:boolean)=>');
 const end=s.indexOf(';const undo=',start);
 if(start>=0&&end>start){
  const next=`const apply=(id:LayoutId,all:boolean)=>{if(!page)return;const cap=cfg(id).capacity;if(all){if(cap===0)return;if(!window.confirm(\`Tüm ürünler \${cap}’li \${cfg(id).name} layoutuna göre yeniden sayfalara dağıtılacak. Devam edilsin mi?\`))return;const allIds=Array.from(new Set(sorted.flatMap(p=>p.content.productIds||[])));const chunks=Array.from({length:Math.max(1,Math.ceil(allIds.length/cap))},(_,i)=>allIds.slice(i*cap,(i+1)*cap));const made=chunks.map((chunk,i)=>applyLayoutToPage({...page,id:i===0?page.id:uid(),title:i===0?page.title:\`\${page.title} \${i+1}\`,content:{...page.content,productIds:chunk}},id));save(made);return;}const start=sorted.findIndex(pg=>pg.id===page.id),before=sorted.slice(0,start),tail=sorted.slice(start),ids=tail.flatMap(pg=>pg.content.productIds||[]);let cursor=0;const rebuilt=tail.map((base,index)=>{const layout=index===0?id:base.layoutId,capacity=cfg(layout).capacity,chunk=capacity?ids.slice(cursor,cursor+capacity):[];cursor+=capacity;return applyLayoutToPage({...base,content:{...base.content,productIds:chunk}},layout)});while(cursor<ids.length){const base=rebuilt.at(-1)||page,layout=base.layoutId,capacity=Math.max(1,cfg(layout).capacity),chunk=ids.slice(cursor,cursor+capacity);cursor+=capacity;rebuilt.push(applyLayoutToPage({...base,id:uid(),title:\`\${base.title} \${rebuilt.length+1}\`,content:{...base.content,productIds:chunk}},layout))}save([...before,...rebuilt]);setBlockId(null);}`;
  s=s.slice(0,start)+next+s.slice(end);
 }
 // Grid cards intentionally have a small visual gutter. A selected group is consecutive
 // when no other card lies between them on that same row or column; it is not judged by pixel gap.
 const mergeStart=s.indexOf('const mergeSelection=()=>');
 const mergeEnd=s.indexOf('const updateSettings=',mergeStart);
 if(mergeStart>=0&&mergeEnd>mergeStart){
  const next=`const mergeSelection=()=>{if(!page)return false;const selected=(page.content.blocks||[]).filter(b=>mergeIds.includes(b.id)&&b.type!=='text'&&(b.frameKind==='product'||b.frameKind==='empty'));if(selected.length<2)return false;const frames=(page.content.blocks||[]).filter(b=>b.type!=='text'&&(b.frameKind==='product'||b.frameKind==='empty'));const isLine=(axis:'x'|'y',cross:'x'|'y',size:'width'|'height')=>{if(!selected.every(b=>Math.abs((b[cross]||0)-(selected[0][cross]||0))<.3))return false;const lane=frames.filter(b=>Math.abs((b[cross]||0)-(selected[0][cross]||0))<.3).sort((a,b)=>(a[axis]||0)-(b[axis]||0));const indexes=selected.map(b=>lane.findIndex(x=>x.id===b.id)).sort((a,b)=>a-b);return indexes.every((n,i)=>i===0||n===indexes[i-1]+1)};return isLine('x','y','height')||isLine('y','x','width')}`;
  const cards=s.slice(s.lastIndexOf('const mergeCards=()=>',mergeEnd),mergeEnd);
  s=s.slice(0,mergeStart)+next+';'+cards+s.slice(mergeEnd);
 }
 // Restoring an empty card pulls the next unused product from the following pages into it.
 const patchStart=s.indexOf('const patch=(id:string,p:Partial<PageBlock>)=>');
 const patchEnd=s.indexOf(';const removeProduct=',patchStart);
 if(patchStart>=0&&patchEnd>patchStart){
  const next=`const patch=(id:string,p:Partial<PageBlock>)=>{if(!page)return;const current=(page.content.blocks||[]).find(b=>b.id===id);if(p.frameKind==='product'&&!p.productId&&current?.frameKind==='empty'){const pageIndex=sorted.findIndex(pg=>pg.id===page.id);const assigned=new Set((page.content.blocks||[]).map(b=>b.productId).filter(Boolean));const source=sorted.slice(pageIndex+1).find(pg=>(pg.content.productIds||[]).some(pid=>!assigned.has(pid)));const productId=source?.content.productIds?.find(pid=>!assigned.has(pid));if(productId){save(sorted.map(pg=>{if(pg.id===page.id)return {...pg,content:{...pg.content,productIds:Array.from(new Set([...(pg.content.productIds||[]),productId])),blocks:(pg.content.blocks||[]).map(b=>b.id===id?{...b,...p,productId}:b)}};if(pg.id===source?.id)return {...pg,content:{...pg.content,productIds:(pg.content.productIds||[]).filter(pid=>pid!==productId),blocks:(pg.content.blocks||[]).map(b=>b.productId===productId?{...b,frameKind:'empty',productId:undefined}:b)}};return pg}));return}}save(sorted.map(pg=>pg.id===page.id?{...pg,content:{...pg.content,blocks:(pg.content.blocks||[]).map(b=>b.id===id?{...b,...p}:b)}}:pg))}`;
  s=s.slice(0,patchStart)+next+s.slice(patchEnd);
 }
 // Product labels: title may wrap, while SKU and price keep their fixed single-line rhythm.
 s=s.replace("{productInfo.showName!==false&&<div className=\"truncate\" style={styleFor('name')}>{p.name}</div>}{productInfo.showSku&&<div className=\"truncate\" style={styleFor('sku')}>{p.sku}</div>}{productInfo.showPrice&&<div style={styleFor('price')}>{productInfo.pricePrefix||'₺'}{(p.price*(1-(productInfo.discountPercent||0)/100)).toLocaleString('tr-TR')}</div>}", "{productInfo.showName!==false&&<div className=\"whitespace-normal break-words\" style={styleFor('name')}>{p.name}</div>}{productInfo.showSku&&<div className=\"truncate whitespace-nowrap\" style={styleFor('sku')}>{p.sku}</div>}{productInfo.showPrice&&<div className=\"truncate whitespace-nowrap\" style={styleFor('price')}>{productInfo.pricePrefix||'₺'}{(p.price*(1-(productInfo.discountPercent||0)/100)).toLocaleString('tr-TR')}</div>}{productInfo.showColor&&<div className=\"truncate whitespace-nowrap\" style={styleFor('sku')}>Renk: {p.color||'—'}</div>}{productInfo.showClarity&&<div className=\"truncate whitespace-nowrap\" style={styleFor('sku')}>Berraklık: {p.clarity||'—'}</div>}{productInfo.showCertificate&&<div className=\"truncate whitespace-nowrap\" style={styleFor('sku')}>Sertifika: {p.certificate||'—'}</div>}{productInfo.showStone&&<div className=\"truncate whitespace-nowrap\" style={styleFor('sku')}>Taş: {p.stone||'—'}</div>}");
 s=s.replace("{productInfo.showStone&&<div className=\"truncate whitespace-nowrap\" style={styleFor('sku')}>Taş: {p.stone||'—'}</div>}", "{productInfo.showStone&&<div className=\"truncate whitespace-nowrap\" style={styleFor('sku')}>Taş: {p.stone||'—'}</div>}{productInfo.showProperties&&<div className=\"truncate whitespace-nowrap\" style={styleFor('sku')}>Ürün: {p.properties||'—'}</div>}");
 // A color chooser belongs beside the already-existing width selector.
 s=s.replace("</select></label></div>}</>}</div>}", "</select></label><label className=\"text-[8px] uppercase\">Çerçeve rengi<input className=\"field mt-1 h-9 p-1\" type=\"color\" value={block.borderColor||'#d5dbe3'} onChange={e=>onPatch({borderColor:e.target.value})}/></label></div>}</>}</div>}");
 // Offer the additional metadata fields in the global product information group.
 s=s.replace("<label><input type=\"checkbox\" checked={info.showPrice} onChange={e=>onUpdateInfo({showPrice:e.target.checked})}/> Fiyat</label></div><div className=\"grid grid-cols-3 gap-2 mt-2\">", "<label><input type=\"checkbox\" checked={info.showPrice} onChange={e=>onUpdateInfo({showPrice:e.target.checked})}/> Fiyat</label></div><div className=\"grid grid-cols-2 gap-2 text-[9px] mt-2\"><label><input type=\"checkbox\" checked={!!info.showColor} onChange={e=>onUpdateInfo({showColor:e.target.checked})}/> Renk</label><label><input type=\"checkbox\" checked={!!info.showClarity} onChange={e=>onUpdateInfo({showClarity:e.target.checked})}/> Berraklık</label><label><input type=\"checkbox\" checked={!!info.showCertificate} onChange={e=>onUpdateInfo({showCertificate:e.target.checked})}/> Sertifika</label><label><input type=\"checkbox\" checked={!!info.showStone} onChange={e=>onUpdateInfo({showStone:e.target.checked})}/> Taş</label></div><div className=\"grid grid-cols-3 gap-2 mt-2\">");
 s=s.replace("<label><input type=\"checkbox\" checked={!!info.showStone} onChange={e=>onUpdateInfo({showStone:e.target.checked})}/> Taş</label></div><div className=\"grid grid-cols-3 gap-2 mt-2\">", "<label><input type=\"checkbox\" checked={!!info.showStone} onChange={e=>onUpdateInfo({showStone:e.target.checked})}/> Taş</label><label><input type=\"checkbox\" checked={!!info.showProperties} onChange={e=>onUpdateInfo({showProperties:e.target.checked})}/> Ürün özellikleri</label></div><div className=\"grid grid-cols-3 gap-2 mt-2\">");
 s=s.replace("{(['showName','showSku','showPrice'] as const).map(k=><label key={k}><input type=\"checkbox\" checked={(page.style?.productInfoOverrides as any)?.[k]??info[k]} onChange={e=>onPageStyle({...page.style,productInfoOverrides:{...(page.style?.productInfoOverrides||{}),[k]:e.target.checked}})}/>{k==='showName'?' Başlık':k==='showSku'?' SKU':' Fiyat'}</label>)}", "{(['showName','showSku','showPrice','showColor','showClarity','showCertificate','showStone','showProperties'] as const).map(k=><label key={k}><input type=\"checkbox\" checked={(page.style?.productInfoOverrides as any)?.[k]??(info as any)[k]??false} onChange={e=>onPageStyle({...page.style,productInfoOverrides:{...(page.style?.productInfoOverrides||{}),[k]:e.target.checked}})}/>{{showName:' Başlık',showSku:' SKU',showPrice:' Fiyat',showColor:' Renk',showClarity:' Berraklık',showCertificate:' Sertifika',showStone:' Taş',showProperties:' Ürün özellikleri'}[k]}</label>)}");
 // Remove accidental duplicated empty-state markup from repeated patch runs.
 s=s.replace("b.frameKind==='empty'?<div className=\"w-full h-full bg-white border border-dashed flex items-center justify-center text-[9px] opacity-40\">Ürün kartı ekle</div>:b.frameKind==='empty'?<div className=\"w-full h-full bg-white border border-dashed flex items-center justify-center text-[9px] opacity-40\">Ürün kartı ekle</div>:", "b.frameKind==='empty'?<div className=\"w-full h-full bg-white border border-dashed flex items-center justify-center text-[9px] opacity-40\">Ürün kartı ekle</div>:");
 write(f,s);
}

// The normal Products tab mirrors the quick filter: exact collection/category matching,
// genuine color/clarity values and a usable karat interval (instead of one fixed karat).
{
 const f='src/components/studio/CatalogStudioV5.tsx'; let s=read(f);
 const start=s.indexOf('function ProductsPanel('), end=s.indexOf('function PageSettingsPanel(',start);
 if(start>=0&&end>start){
  const next=`function ProductsPanel({page,products,collections=[],categories=[],onAddIds,onReplaceIds}:{page:Page;products:Product[];collections:{id:string;name:string;parentId?:string}[];categories:{id:string;name:string}[];onAddIds:(ids:string[])=>void;onReplaceIds:(ids:string[])=>void}){const[q,setQ]=React.useState(''),[cat,setCat]=React.useState(''),[col,setCol]=React.useState(''),[color,setColor]=React.useState(''),[clarity,setClarity]=React.useState(''),[minKarat,setMinKarat]=React.useState(''),[maxKarat,setMaxKarat]=React.useState(''),[minPrice,setMinPrice]=React.useState(''),[maxPrice,setMaxPrice]=React.useState('');const karatValue=(value:any)=>{const m=String(value??'').replace(',','.').match(/[0-9]+(?:\\.[0-9]+)?/);return m?Number(m[0]):NaN};const filtered=React.useMemo(()=>products.filter(p=>{const search=q.trim().toLocaleLowerCase('tr-TR'),k=karatValue(p.karat);if(search&&!([p.name,p.sku,p.category,p.categoryFullName||'',...(p.collectionNames||[])].join(' ')).toLocaleLowerCase('tr-TR').includes(search))return false;if(cat){const byCollection=cat.startsWith('collection:')?(p.collectionIds||[]).includes(cat.slice(11)):false;const byName=(p.collectionNames||[]).some(n=>n===cat);if(!(p as any).categoryIds?.includes(cat)&&!byCollection&&!byName&&p.categoryId!==cat&&p.category!==cat&&p.categoryFullName!==cat)return false}if(col&&p.collectionId!==col&&!(p.collectionIds||[]).includes(col)&&!(p.collectionNames||[]).includes(col))return false;if(color&&p.color!==color)return false;if(clarity&&p.clarity!==clarity)return false;if(minKarat&&(Number.isNaN(k)||k<Number(minKarat)))return false;if(maxKarat&&(Number.isNaN(k)||k>Number(maxKarat)))return false;if(minPrice&&p.price<Number(minPrice))return false;if(maxPrice&&p.price>Number(maxPrice))return false;return true}),[products,q,cat,col,color,clarity,minKarat,maxKarat,minPrice,maxPrice]);const used=new Set(page.content.productIds||[]),colors=Array.from(new Set(products.map(p=>p.color).filter(Boolean))).sort(),clarities=Array.from(new Set(products.map(p=>p.clarity).filter(Boolean))).sort();return <div className="p-4 flex flex-col h-full"><div className="flex gap-2 mb-2"><input className="field" placeholder="Ürün adı / SKU / arama" value={q} onChange={e=>setQ(e.target.value)}/><button className="smallbtn" onClick={()=>{setQ('');setCat('');setCol('');setColor('');setClarity('');setMinKarat('');setMaxKarat('');setMinPrice('');setMaxPrice('')}}>Temizle</button></div><div className="grid grid-cols-2 gap-2"><select className="field" value={cat} onChange={e=>{setCat(e.target.value);setCol('')}}><option value="">Tüm kategoriler</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select className="field" value={col} onChange={e=>setCol(e.target.value)}><option value="">Tüm koleksiyonlar</option>{collections.filter(c=>!cat||c.parentId===cat).filter((c,i,items)=>items.findIndex(item=>item.id===c.id)===i).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select className="field" value={color} onChange={e=>setColor(e.target.value)}><option value="">Tüm renkler</option>{colors.map(c=><option key={String(c)} value={String(c)}>{String(c)}</option>)}</select><select className="field" value={clarity} onChange={e=>setClarity(e.target.value)}><option value="">Tüm berraklıklar</option>{clarities.map(c=><option key={String(c)} value={String(c)}>{String(c)}</option>)}</select><input className="field" type="number" step="0.01" placeholder="Min. karat" value={minKarat} onChange={e=>setMinKarat(e.target.value)}/><input className="field" type="number" step="0.01" placeholder="Maks. karat" value={maxKarat} onChange={e=>setMaxKarat(e.target.value)}/><input className="field" type="number" placeholder="Min ₺" value={minPrice} onChange={e=>setMinPrice(e.target.value)}/><input className="field" type="number" placeholder="Maks. ₺" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/></div><div className="py-3 flex items-center gap-2"><span className="text-[9px] font-semibold">{filtered.length} filtrelenen</span><button onClick={()=>onReplaceIds(filtered.map(p=>p.id))} className="ml-auto px-3 h-8 bg-[#0f203a] text-white text-[8px] uppercase">Hepsini ekle</button></div><div className="flex-1 overflow-auto space-y-1">{filtered.slice(0,200).map(p=><label key={p.id} className={cn('flex items-center gap-2 p-2 border text-[8px]',used.has(p.id)?'bg-[#f5f7f9]':'')}><input type="checkbox" disabled={used.has(p.id)} checked={used.has(p.id)} onChange={e=>e.target.checked?onAddIds([p.id]):null}/>{p.images?.[0]?<img src={p.images[0]} className="w-10 h-10 object-contain"/>:<Package size={14}/>}<span className="truncate">{p.name}<span className="block opacity-40">{p.sku} · {p.karat??'—'}K · ₺{p.price.toLocaleString('tr-TR')}</span></span></label>)}</div></div>}`;
  s=s.slice(0,start)+next+s.slice(end);
  write(f,s);
 }
}


// Replace the former certificate control with the published stone-properties table.
{
 const f='src/components/studio/CatalogStudioV5.tsx'; let s=read(f);
 if(!s.includes("import { StonePropertiesTable, stonePropertiesHtml }")) {
  s="import { StonePropertiesTable, stonePropertiesHtml } from '../shared/StonePropertiesTable';\n"+s;
 }
 s=s.replaceAll('}/> Sertifika</label>', '}/> Taş özellikleri</label>');
 s=s.replaceAll("showCertificate:' Sertifika'", "showCertificate:' Taş özellikleri'");
 s=s.replace('{productInfo.showCertificate&&<div className="truncate whitespace-nowrap" style={styleFor(\'sku\')}>Sertifika: {p.certificate||\'—\'}</div>}', '{productInfo.showCertificate&&<StonePropertiesTable product={p} style={styleFor(\'sku\')}/>}');
 const oldPdf='<small>\${p?.name||\'\'}<br/>\${p?.sku||\'\'}</small></div>';
 const nextPdf='<small>\${p?.name||\'\'}<br/>\${p?.sku||\'\'}</small>\${({...settings.productInfo,...pg.style?.productInfoOverrides,...b.productInfo}).showCertificate?stonePropertiesHtml(p):\'\'}</div>';
 s=s.replace(oldPdf,nextPdf);
 write(f,s);
}
