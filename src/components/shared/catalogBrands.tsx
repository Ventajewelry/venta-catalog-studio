import React from 'react';
export type CatalogBrand='venta'|'larien'|'all';
export const brandOf=(item:{id:string;brand?:string})=>item.brand||(item.id.startsWith('larien:')?'larien':'venta');
export const matchesBrand=(item:{id:string;brand?:string},brand:CatalogBrand)=>brand==='all'||brandOf(item)===brand;
export function CatalogBrandSelect({value,onChange}:{value:CatalogBrand;onChange:(value:CatalogBrand)=>void}){return <select aria-label="Marka seçiniz" className="field min-w-0" value={value} onChange={e=>onChange(e.target.value as CatalogBrand)}><option value="venta">Venta Jewelry</option><option value="larien">Larien Lab Diamond</option><option value="all">Tüm markalar</option></select>}
