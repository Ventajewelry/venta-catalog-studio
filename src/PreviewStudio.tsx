import React from 'react';
import { CatalogStudioV7 } from './components/studio/CatalogStudioV7';
import { mockCatalog, mockPages, mockProducts } from './mockData';
import type { Catalog, Page, Product } from './types';

const previewSettings = { pageWidth:210,pageHeight:297,unit:'mm' as const,showHeader:false,headerText:'VENTA JEWELRY',showFooter:false,footerText:'VENTA JEWELRY',showPageNumbers:true,pageNumberPosition:'bottom-center' as const,backgroundColor:'#ffffff' };

export function PreviewStudio() {
  const [catalog,setCatalog]=React.useState<Catalog>({...mockCatalog,settings:previewSettings});
  const [pages,setPages]=React.useState<Page[]>(mockPages);
  const [products,setProducts]=React.useState<Product[]>(mockProducts);
  const [collections,setCollections]=React.useState<{id:string;name:string;parentId?:string}[]>([]);
  const [categories,setCategories]=React.useState<{id:string;name:string}[]>([]);
  React.useEffect(()=>{fetch('/preview-products.json').then(r=>r.ok?r.json():null).then(data=>{if(data?.products){setProducts(data.products);setCategories(data.categories||[]);setCollections(data.collections||[])}}).catch(()=>undefined)},[]);
  return <CatalogStudioV7 catalog={catalog} pages={pages} products={products} categories={categories} collections={collections} onUpdateCatalog={update=>setCatalog(current=>({...current,...update}))} onUpdatePage={page=>setPages(current=>current.map(item=>item.id===page.id?page:item))} onReplacePages={setPages} onAddPage={()=>setPages(current=>[...current,{id:crypto.randomUUID(),catalogId:catalog.id,order:current.length,layoutId:'LAYOUT_C_PRODUCT_GRID',title:`Page ${current.length+1}`,content:{blocks:[],productIds:[]}}])} onDeletePage={id=>setPages(current=>current.filter(page=>page.id!==id).map((page,order)=>({...page,order})))} onExit={()=>undefined} canPublish={false} onPreview={()=>undefined}/>;
}