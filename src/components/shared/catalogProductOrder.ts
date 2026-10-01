export type CatalogProductOrder = 'default' | 'oldest' | 'newest';
export function compareCatalogProducts(a:{createdAt?:string},b:{createdAt?:string},order:CatalogProductOrder):number {
 if(order==='default')return 0;
 const first=Date.parse(a.createdAt||''),second=Date.parse(b.createdAt||'');
 if(Number.isNaN(first)||Number.isNaN(second))return Number.isNaN(first)?Number.isNaN(second)?0:1:-1;
 return order==='oldest'?first-second:second-first;
}
