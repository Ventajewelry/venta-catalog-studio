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
