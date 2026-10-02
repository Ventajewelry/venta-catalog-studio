import type { Page } from '../../types';
type Item={id:string;name:string;sku?:string;handle?:string;brand?:string;material?:string;karat?:number|string;collectionIds?:string[];category?:string};
export const isLarienModel=(p:Item)=>p.brand==='larien'||p.id.startsWith('larien:');
export const larienModelKey=(p:Item)=>p.handle||p.id;
export const catalogModelName=(p:Item)=>isLarienModel(p)?p.name.split(' · ')[0]:p.name;
export const variantKarat=(p:Item)=>Number(String(p.karat??'').replace(',','.'));
export function ventaModelKey(p:Item){
 if(isLarienModel(p))return null;
 const text=[p.name,p.category,...(p.collectionIds||[])].join(' ').toLocaleLowerCase('tr-TR');
 if(!/tektaş|tektas/.test(text))return null;
 const match=String(p.sku||'').toUpperCase().match(/^(.+)-([\d.,]+)([DEFG])(SI1|SI2|VS2)?$/);
 if(!match)return null;
 const number=Number(match[2].replace(',','.')),karat=/[.,]/.test(match[2])?number:number/100;
 if(karat<.3||karat>1)return null;
 return {key:match[1]+'-'+karat,canonical:match[3]==='F'&&(match[4]||String((p as Item&{clarity?:string}).clarity||'').toUpperCase())==='SI1'};
}
export function defaultLarienVariant<T extends Item>(variants:T[]):T{
 return variants.find(p=>variantKarat(p)===1&&/beyaz/i.test(p.material||''))||variants.find(p=>/beyaz/i.test(p.material||''))||variants[0];
}
export function catalogSelectableProducts<T extends Item>(products:T[],pages:Page[]=[]):T[]{
 const selected=new Set(pages.flatMap(p=>[...(p.content.productIds||[]),...(p.content.blocks||[]).map(b=>b.productId).filter((id):id is string=>!!id)]));
 const groups=new Map<string,T[]>();for(const p of products)if(isLarienModel(p)){const key=larienModelKey(p);groups.set(key,[...(groups.get(key)||[]),p])}
 const preferred=new Map<string,T>();for(const p of products){const model=ventaModelKey(p);if(model?.canonical){const old=preferred.get(model.key);if(!old||(!/FSI1$/i.test(old.sku||'')&&/FSI1$/i.test(p.sku||'')))preferred.set(model.key,p)}}
 const seen=new Set<string>(),result:T[]=[];
 for(const p of products){if(isLarienModel(p)){const key='larien:'+larienModelKey(p);if(seen.has(key))continue;seen.add(key);const variants=groups.get(larienModelKey(p))!;result.push(variants.find(v=>selected.has(v.id))||defaultLarienVariant(variants));continue}
 const model=ventaModelKey(p);if(model){if(!model.canonical||preferred.get(model.key)?.id!==p.id||seen.has('venta:'+model.key))continue;seen.add('venta:'+model.key)}result.push(p)}
 return result;
}
export function larienVariants<T extends Item>(products:T[],product:T){return products.filter(p=>isLarienModel(p)&&larienModelKey(p)===larienModelKey(product))}
export function chooseLarienVariant<T extends Item>(variants:T[],current:T,karat:number,material:string){return variants.find(p=>p.id===current.id&&variantKarat(p)===karat&&p.material===material)||variants.find(p=>variantKarat(p)===karat&&p.material===material)}
export function ventaVariants<T extends Item>(products:T[],product:T){const key=ventaModelKey(product)?.key;return key?products.filter(p=>ventaModelKey(p)?.key===key):[]}
export const ventaGrades=(p:Item)=>{const match=String(p.sku||'').toUpperCase().match(/([DEFG])(SI1|SI2|VS2)?$/);return match?[match[1],match[2]||String((p as Item&{clarity?:string}).clarity||'').toUpperCase()]:[]};
export function duplicateVariantBlocks(products:Item[],pages:Page[]){
 const byId=new Map(products.map(p=>[p.id,p])),groups=new Map<string,string[]>();
 for(const page of pages)for(const block of page.content.blocks||[]){if(block.frameKind!=='product'||!block.productId)continue;const product=byId.get(block.productId);if(!product||(!ventaModelKey(product)&&!isLarienModel(product)))continue;const key=isLarienModel(product)?'larien:'+product.id:'venta:'+ventaModelKey(product)!.key+'-'+ventaGrades(product).join('');groups.set(key,[...(groups.get(key)||[]),page.id+':'+block.id])}
 return new Set([...groups.values()].filter(ids=>ids.length>1).flat());
}
export function duplicateCatalogCard(pages:Page[],pageId:string,blockId:string,makePage:(base:Page,id:string)=>Page){
 const ordered=[...pages].sort((a,b)=>a.order-b.order),start=ordered.findIndex(p=>p.id===pageId),base=ordered[start];
 const source=base?.content.blocks?.find(b=>b.id===blockId);if(!source?.productId)return null;
 for(let i=start;i<ordered.length;i++){const target=ordered[i],slot=target.content.blocks?.find(b=>(b.frameKind==='empty'||b.frameKind==='product')&&!b.productId&&b.type!=='text');if(!slot)continue;
 const blocks=target.content.blocks!.map(b=>b.id===slot.id?{...source,id:b.id,x:b.x,y:b.y,width:b.width,height:b.height}:b);
 ordered[i]={...target,content:{...target.content,blocks,productIds:blocks.filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!)}};
 return {pages:ordered,pageId:target.id,blockId:slot.id};
 }
 const next=makePage(base,source.productId),slot=next.content.blocks?.find(b=>b.productId===source.productId);if(!slot)return null;
 ordered.push({...next,order:ordered.length});return {pages:ordered,pageId:next.id,blockId:slot.id};
}
