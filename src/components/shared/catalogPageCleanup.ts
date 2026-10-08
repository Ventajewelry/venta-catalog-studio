import type { Page } from '../../types';
const starterPages:Record<string,string>={
 'page-cover':'Cover','page-opening':'Opening Spread','page-intro':'Collection Introduction',
 'page-feature':'Featured Product','page-grid':'Product Selection','page-editorial':'Editorial Spread',
 'page-look':'Lookbook','page-index':'Index'
};
// Old autosaved demo pages must not become real catalog pages on the next login.
// Keep actual products and custom editorial content; never touch named draft files.
export function cleanCatalogPages(pages:Page[],keepEmptyLayouts=false):Page[]{
 return pages.filter(page=>{
  const blocks=page.content.blocks||[];
  if(page.content.productIds?.length||blocks.some(block=>block.productId))return true;
  if(starterPages[page.id]===page.title)return false;
  if(keepEmptyLayouts&&blocks.some(block=>block.frameKind==='product'))return true;
  return blocks.some(block=>(block.frameKind==='image'&&!!block.url)||(block.type==='text'&&!!block.alt?.trim()));
 }).map((page,order)=>({...page,order}));
}
