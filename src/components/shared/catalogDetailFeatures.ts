import { cleanCatalogPages } from './catalogPageCleanup';
import type { Page, PageBlock, Product } from '../../types';
export type DetailTemplate='compact8'|'wide3'|'portrait4';
export type DetailFeatures={enabled:boolean;template:DetailTemplate};
export const detailTemplates=[
 {id:'compact8' as const,name:'1 · 8’li yatay detay',capacity:8,layout:'DETAIL_COMPACT_8'},
 {id:'wide3' as const,name:'2 · 3’lü geniş detay',capacity:3,layout:'DETAIL_WIDE_3'},
 {id:'portrait4' as const,name:'3 · 4’lü görsel üstte, detay altta',capacity:4,layout:'DETAIL_PORTRAIT_4'}
];
export const detailFields=[
 ['sku','Ürün No'],['cut','Kesim'],['fineness','Ayar'],['goldColor','Altın Rengi'],
 ['weight','Toplam Gram'],['dimensions','Ölçüler'],['hallmark','Ayar Damgası var mı'],
 ['centerCarat','Merkez Taş (ct)'],['totalCarat','Toplam Taş ct'],['color','Renk'],
 ['clarity','Berraklık'],['cutGrade','Kesim Derecesi'],['production','Üretim Yöntemi'],
 ['certificate','Sertifika Kuruluşu'],['certificateNumber','Sertifika Numarası'],
 ['laser','Lazer Yazısı var mı?'],['sideLab','Yan Taşlar Lab mı?'],['allLab','Ürün Tamamen Lab mı?']
] as const;
const present=(value:unknown)=>value!==undefined&&value!==null&&String(value).trim()!=='';
const carat=(value:unknown)=>present(value)&&Number.isFinite(Number(value))?Number(value).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ct':'';
export function detailValues(product:Product,block:PageBlock):Record<string,string>{
 const p=product as Product & Record<string,any>;
 const cut=p.cut||p.stoneCut||p.name.match(/Zümrüt|Emerald|Radiant|Prenses|Princess|Yuvarlak|Round|Oval|Markiz|Marquise|Damla|Pear|Cushion|Asscher/i)?.[0];
 const material=p.material||'';
 const values:Record<string,unknown>={sku:p.sku,cut,fineness:p.fineness||p.goldFineness||material.match(/(?:14|18|22|24)\s*K/i)?.[0],goldColor:p.goldColor||material.match(/Beyaz Altın|Sarı Altın|Rose Altın|Pembe Altın/i)?.[0],weight:p.weight,dimensions:p.dimensions,hallmark:p.hallmark,centerCarat:carat(p.centerCarat??p.karat),totalCarat:carat(p.totalCarat),color:p.color,clarity:p.clarity,cutGrade:p.cutGrade,production:p.productionMethod,certificate:p.certificate,certificateNumber:p.certificateNumber,laser:p.laserInscription,sideLab:p.sideStonesLab,allLab:p.allLab};
 return Object.fromEntries(detailFields.map(([key])=>[key,Object.prototype.hasOwnProperty.call(block.detailFields||{},key)?(block.detailFields![key].trim()||'xxx'):(present(values[key])?String(values[key]):'xxx')]));
}
// Rebuild only product pages, keeping manual values with their individual cards.
export function applyDetailPages(pages:Page[],targetId:string,template:DetailTemplate,all:boolean,rebuild:(base:Page,ids:string[],layout:string)=>Page,capacity:(page:Page)=>number,enabled=true):Page[]{
 const ordered=cleanCatalogPages(pages).sort((a,b)=>a.order-b.order),start=all?0:ordered.findIndex(p=>p.id===targetId);
 if(start<0)return pages;
 const config=detailTemplates.find(t=>t.id===template)!;
 const cards=ordered.slice(start).flatMap(p=>{const blocks=p.content.blocks?.filter(b=>b.frameKind==='product'&&b.productId)||[];return blocks.length?blocks:(p.content.productIds||[]).map(productId=>({productId} as PageBlock))});
 if(!cards.length)return pages;
 const queue=[...cards],next=ordered.slice(0,start),used=new Set(ordered.map(p=>p.id));
 const make=(base:Page,chunk:PageBlock[],layout:string,detail:boolean)=>{
  const made=rebuild(base,chunk.map(b=>b.productId!),layout);let index=0;
  return {...made,style:detail?{...base.style,detailFeatures:{enabled,template},detailPreviousLayout:enabled?(base.style?.detailPreviousLayout||(String(base.layoutId).startsWith('DETAIL_')?'LAYOUT_C_PRODUCT_GRID':base.layoutId)):undefined}:base.style,content:{...made.content,blocks:made.content.blocks?.map(b=>{if(b.frameKind!=='product')return b;const original=chunk[index++];return original?{...original,...b,manualFields:original.manualFields,detailFields:original.detailFields,imageScale:original.imageScale??1,imagePositionX:original.imagePositionX??50,imagePositionY:original.imagePositionY??50,productInfo:{...b.productInfo,...original.productInfo}}:b})}};
 };
 for(let i=start;i<ordered.length;i++){
  const base=ordered[i],isTarget=base.id===targetId;
  if(!isTarget&&!base.content.productIds?.length&&!base.content.blocks?.some(b=>b.frameKind==='product')){next.push(base);continue;}
  if(!queue.length)continue;
  const detail=all||isTarget,layout=detail?(enabled?config.layout:(base.style?.detailPreviousLayout||'LAYOUT_C_PRODUCT_GRID')):base.layoutId,count=detail&&enabled?config.capacity:Math.max(1,capacity({...base,layoutId:layout as Page['layoutId']}));
  next.push(make(base,queue.splice(0,count),layout,detail));
 }
 while(queue.length){const base=next.at(-1)||ordered[start];let id=crypto.randomUUID();while(used.has(id))id=crypto.randomUUID();used.add(id);const layout=enabled?config.layout:(String(base.layoutId).startsWith('DETAIL_')?'LAYOUT_C_PRODUCT_GRID':base.layoutId),count=enabled?config.capacity:Math.max(1,capacity({...base,layoutId:layout as Page['layoutId']}));next.push(make({...base,id,title:'Ürünler'},queue.splice(0,count),layout,true));}
 return next.map((p,order)=>({...p,order}));
}
