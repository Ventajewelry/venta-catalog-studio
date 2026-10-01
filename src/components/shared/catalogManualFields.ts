import type { Page, PageBlock, Product, ProductInfoSettings } from '../../types';
export const catalogFields = [
 { key:'name', flag:'showName', label:'Başlık' }, { key:'sku', flag:'showSku', label:'SKU' },
 { key:'price', flag:'showPrice', label:'Fiyat' }, { key:'color', flag:'showColor', label:'Renk' },
 { key:'clarity', flag:'showClarity', label:'Berraklık' }, { key:'stoneDetails', flag:'showCertificate', label:'Taş özellikleri' },
 { key:'stone', flag:'showStone', label:'Taş' }, { key:'properties', flag:'showProperties', label:'Ürün özellikleri' },
] as const;
export type CatalogField = typeof catalogFields[number]['key'];
export type AutomaticFields = Partial<Record<CatalogField,boolean>>;
export type ManualFields = Partial<Record<Exclude<CatalogField,'price'>,string>> & {price?:number};
export function automaticField(info:Partial<ProductInfoSettings>,key:CatalogField){return info.automaticFields?.[key]!==false}
export function resolveCatalogProduct<T extends Product>(product:T,block:PageBlock,info:Partial<ProductInfoSettings>):T {
 const result={...product};
 for(const {key} of catalogFields){const value=block.manualFields?.[key];if(!automaticField(info,key)&&value!==undefined&&(key!=='price'||(typeof value==='number'&&Number.isFinite(value)&&value>=0)))(result as any)[key]=value;}
 return result;
}
export function resetCatalogFields(pages:Page[],pageId?:string,field?:CatalogField,automatic=true):Page[]{
 return pages.map(page=>{if(pageId&&page.id!==pageId)return page;
 const clear=(value:ManualFields|undefined)=>{if(!automatic)return value;if(!field)return undefined;const next={...value};delete next[field];return next};
 const reset=(info:Partial<ProductInfoSettings>|undefined)=>({...info,automaticFields:field?{...info?.automaticFields,[field]:automatic}:Object.fromEntries(catalogFields.map(f=>[f.key,true]))});
 return {...page,style:{...page.style,productInfoOverrides:reset(page.style?.productInfoOverrides)},content:{...page.content,blocks:page.content.blocks?.map(block=>({...block,manualFields:clear(block.manualFields),productInfo:reset(block.productInfo) as ProductInfoSettings}))}};
 });
}
export function firstEmptyCatalogPage(pages:Page[]):Page|undefined{
 if(pages.some(page=>(page.content.productIds||[]).length||page.content.blocks?.some(block=>!!block.productId)))return undefined;
 const ordered=[...pages].sort((a,b)=>a.order-b.order);return ordered.find(page=>!page.content.blocks?.length||page.content.blocks.some(block=>block.frameKind==='product'))||ordered[0];
}
