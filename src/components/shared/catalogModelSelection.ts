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
 const match=String(p.sku||'').toUpperCase().match(/^(.+)-([\d.,]+)([DEFG])(SI1|SI2|VS2)$/);
 if(!match)return null;
 const number=Number(match[2].replace(',','.')),karat=/[.,]/.test(match[2])?number:number/100;
 if(karat<.3||karat>1)return null;
 return {key:match[1]+'-'+karat,canonical:match[3]==='F'&&match[4]==='SI1'};
}
export function defaultLarienVariant<T extends Item>(variants:T[]):T{
 return variants.find(p=>variantKarat(p)===1&&/beyaz/i.test(p.material||''))||variants.find(p=>/beyaz/i.test(p.material||''))||variants[0];
}
export function catalogSelectableProducts<T extends Item>(products:T[],pages:Page[]=[]):T[]{
 const selected=new Set(pages.flatMap(p=>[...(p.content.productIds||[]),...(p.content.blocks||[]).map(b=>b.productId).filter((id):id is string=>!!id)]));
 const groups=new Map<string,T[]>();for(const p of products)if(isLarienModel(p)){const key=larienModelKey(p);groups.set(key,[...(groups.get(key)||[]),p])}
 const seen=new Set<string>(),result:T[]=[];
 for(const p of products){if(isLarienModel(p)){const key='larien:'+larienModelKey(p);if(seen.has(key))continue;seen.add(key);const variants=groups.get(larienModelKey(p))!;result.push(variants.find(v=>selected.has(v.id))||defaultLarienVariant(variants));continue}
 const model=ventaModelKey(p);if(model){if(!model.canonical||seen.has('venta:'+model.key))continue;seen.add('venta:'+model.key)}result.push(p)}
 return result;
}
export function larienVariants<T extends Item>(products:T[],product:T){return products.filter(p=>isLarienModel(p)&&larienModelKey(p)===larienModelKey(product))}
export function chooseLarienVariant<T extends Item>(variants:T[],current:T,karat:number,material:string){return variants.find(p=>p.id===current.id&&variantKarat(p)===karat&&p.material===material)||variants.find(p=>variantKarat(p)===karat&&p.material===material)}
