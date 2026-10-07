import React from 'react';
import {Product,PageBlock} from '../../types';
import {ventaVariants,ventaGrades} from '../shared/catalogModelSelection';
export function VentaVariantControls({product,products,onPatch,onDuplicate,priceLabel}:{product:Product;products:Product[];onPatch:(patch:Partial<PageBlock>)=>void;onDuplicate:()=>void;priceLabel?:string}){
 const variants=React.useMemo(()=>ventaVariants(products,product),[products,product]);
 if(!variants.length)return null;
 const [color,clarity]=ventaGrades(product),colors=[...new Set(variants.map(p=>ventaGrades(p)[0]))].sort();
 const clarities=[...new Set(variants.map(p=>ventaGrades(p)[1]))].sort();
 const choose=(c:string,cl:string)=>{const next=variants.find(p=>ventaGrades(p)[0]===c&&ventaGrades(p)[1]===cl);if(next)onPatch({productId:next.id,src:undefined,manualFields:undefined} as Partial<PageBlock>)};
 return <section className="border rounded-lg p-3 space-y-3"><h3 className="text-xs font-semibold">Varyantlar · Venta tektaş</h3><label className="block text-xs">Renk<select aria-label="Venta kart rengi" className="field mt-1" value={color} onChange={e=>{const c=e.target.value;choose(c,variants.some(p=>ventaGrades(p)[0]===c&&ventaGrades(p)[1]===clarity)?clarity:ventaGrades(variants.find(p=>ventaGrades(p)[0]===c)!)[1])}}>{colors.map(c=><option key={c}>{c}</option>)}</select></label><label className="block text-xs">Berraklık<select aria-label="Venta kart berraklığı" className="field mt-1" value={clarity} onChange={e=>choose(color,e.target.value)}>{clarities.map(cl=><option key={cl} disabled={!variants.some(p=>ventaGrades(p)[0]===color&&ventaGrades(p)[1]===cl)}>{cl}</option>)}</select></label><p className="text-[10px] opacity-60">{product.sku} · {priceLabel??`₺${Number(product.price).toLocaleString('tr-TR')}`}</p><button className="field" onClick={onDuplicate}>Aynı modelden bir kart daha ekle</button></section>;
}
