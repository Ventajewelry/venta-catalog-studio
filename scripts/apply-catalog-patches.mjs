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
  s=s.replace("const[dragId,setDragId]=React.useState<string|null>(null);", "const[dragId,setDragId]=React.useState<string|null>(null);const[mergeIds,setMergeIds]=React.useState<string[]>([]);");
  s=s.replace("const updateSettings=(p:Partial<CatalogSettings>)=>", `const mergeSelection=()=>{if(!page)return false;const blocks=(page.content.blocks||[]).filter(b=>mergeIds.includes(b.id)&&b.type!=='text'&&(b.frameKind==='product'||b.frameKind==='empty'));if(blocks.length<2)return false;const row=blocks.every(b=>Math.abs((b.y||0)-(blocks[0].y||0))<0.3&&Math.abs((b.height||0)-(blocks[0].height||0))<0.3);const col=blocks.every(b=>Math.abs((b.x||0)-(blocks[0].x||0))<0.3&&Math.abs((b.width||0)-(blocks[0].width||0))<0.3);if(!row&&!col)return false;const axis=row?'x':'y',size=row?'width':'height',ordered=[...blocks].sort((a,b)=>(a[axis]||0)-(b[axis]||0));return ordered.every((b,i)=>i===0||Math.abs(((ordered[i-1][axis]||0)+(ordered[i-1][size]||0))-(b[axis]||0))<0.35)};const mergeCards=()=>{if(!page||!mergeSelection())return;const chosen=(page.content.blocks||[]).filter(b=>mergeIds.includes(b.id)&&b.type!=='text'&&(b.frameKind==='product'||b.frameKind==='empty'));const row=chosen.every(b=>Math.abs((b.y||0)-(chosen[0].y||0))<0.3);const ordered=[...chosen].sort((a,b)=>row?(a.x||0)-(b.x||0):(a.y||0)-(b.y||0));const leader=[...ordered].sort((a,b)=>(page.content.productIds||[]).indexOf(a.productId||'')-(page.content.productIds||[]).indexOf(b.productId||''))[0]||ordered[0];const displaced=ordered.filter(b=>b.id!==leader.id&&b.productId).map(b=>b.productId!);const empty=(page.content.blocks||[]).filter(b=>!mergeIds.includes(b.id)&&(b.frameKind==='empty'||(b.frameKind==='product'&&!b.productId)));if(displaced.length>empty.length)return;const minX=Math.min(...ordered.map(b=>b.x||0)),minY=Math.min(...ordered.map(b=>b.y||0)),maxX=Math.max(...ordered.map(b=>(b.x||0)+(b.width||0))),maxY=Math.max(...ordered.map(b=>(b.y||0)+(b.height||0)));let cursor=0;const rest=(page.content.blocks||[]).filter(b=>!mergeIds.includes(b.id)).map(b=>{if((b.frameKind==='empty'||(b.frameKind==='product'&&!b.productId))&&cursor<displaced.length)return {...b,frameKind:'product' as const,productId:displaced[cursor++]};return b});const merged:{[key:string]:any}={...leader,x:minX,y:minY,width:maxX-minX,height:maxY-minY,frameKind:'product'};save(sorted.map(pg=>pg.id===page.id?{...pg,content:{...pg.content,blocks:[...rest,merged]}}:pg));setMergeIds([]);setBlockId(merged.id)};const updateSettings=(p:Partial<CatalogSettings>)=>`);
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
