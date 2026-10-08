import { cleanCatalogPages } from './catalogPageCleanup';
import type { Page, PageBlock } from '../../types';
import { continueCatalogProducts } from './continueCatalogProducts';

export function selectedCatalogIds(pages: Page[]): string[] {
  return [...new Set([...pages].sort((a,b)=>a.order-b.order).flatMap(page =>
    page.content.blocks?.some(block=>block.frameKind==='product'&&block.productId)
      ? page.content.blocks.filter(block=>block.frameKind==='product'&&block.productId).map(block=>block.productId!)
      : page.content.productIds || []))];
}

export function selectCatalogProducts(pages: Page[], requested: string[], selected: boolean, blank: Page, makePage: (base: Page, ids: string[])=>Page): Page[] {
  const ordered=cleanCatalogPages(pages,true).sort((a,b)=>a.order-b.order);
  if(selected){
    const firstProduct=ordered.findIndex(p=>(p.content.productIds||[]).length||(p.content.blocks||[]).some(b=>b.productId));
    const cleaned=firstProduct>0?ordered.filter((p,i)=>i>=firstProduct||(p.content.blocks||[]).some(b=>b.frameKind==='product'||(b.frameKind==='image'&&b.url)||(b.type==='text'&&b.alt?.trim()))):ordered;
    const base=cleaned.length?cleaned:[blank];
    return continueCatalogProducts(base,base[0].id,requested,makePage);
  }
  const removed=new Set(requested),queue=selectedCatalogIds(ordered).filter(id=>!removed.has(id));
  const originals=new Map<string,PageBlock>();
  ordered.forEach(page=>page.content.blocks?.forEach(block=>{if(block.productId)originals.set(block.productId,block)}));
  return ordered.map(page=>{
    const blocks=page.content.blocks?.map(block=>{
      if(block.frameKind!=='product')return block;
      const productId=queue.shift(),original=productId?originals.get(productId):undefined;
      return {...block,productId,manualFields:original?.manualFields,imageScale:original?.imageScale??1,imagePositionX:original?.imagePositionX??50,imagePositionY:original?.imagePositionY??50};
    });
    return {...page,content:{...page.content,blocks,productIds:blocks?.filter(block=>block.frameKind==='product'&&block.productId).map(block=>block.productId!)||[]}};
  }).filter(page=>page.content.productIds?.length||page.content.blocks?.some(block=>block.frameKind!=='product'&&block.frameKind!=='empty'))
    .map((page,order)=>({...page,order}));
}
