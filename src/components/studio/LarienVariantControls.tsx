import React from 'react';
import {Product,PageBlock} from '../../types';
import {isLarienModel,larienVariants,variantKarat,chooseLarienVariant} from '../shared/catalogModelSelection';
export function LarienVariantControls({product,products,onPatch}:{product:Product;products:Product[];onPatch:(patch:Partial<PageBlock>)=>void}){
 const variants=React.useMemo(()=>larienVariants(products,product),[products,product]);
 if(!isLarienModel(product))return null;
 const karats=[...new Set(variants.map(variantKarat).filter(Number.isFinite))].sort((a,b)=>a-b);
 const materials=[...new Set(variants.filter(p=>variantKarat(p)===variantKarat(product)).map(p=>p.material))];
 const apply=(next:Product|undefined)=>{if(next)onPatch({productId:next.id,src:undefined})};
 return <section className="border rounded-lg p-3 space-y-3"><h3 className="text-xs font-semibold">Larien · bu kartın varyantı</h3><label className="block text-xs">Karat<select aria-label="Larien kart karatı" className="field mt-1" value={variantKarat(product)} onChange={e=>{const k=Number(e.target.value);apply(chooseLarienVariant(variants,product,k,product.material)||variants.find(p=>variantKarat(p)===k&&/beyaz/i.test(p.material))||variants.find(p=>variantKarat(p)===k))}}>{karats.map(k=><option key={k} value={k}>{k.toLocaleString('tr-TR',{minimumFractionDigits:2})} ct</option>)}</select></label><label className="block text-xs">Maden rengi<select aria-label="Larien kart maden rengi" className="field mt-1" value={product.material} onChange={e=>apply(chooseLarienVariant(variants,product,variantKarat(product),e.target.value))}>{materials.map(m=><option key={m} value={m}>{m}</option>)}</select></label><p className="text-[10px] opacity-60">{product.sku} · ₺{Number(product.price).toLocaleString('tr-TR')}</p></section>;
}
