import React from 'react';
import type { PageBlock, Product, ProductInfoSettings } from '../../types';
import { detailFields, detailValues, DetailTemplate } from '../shared/catalogDetailFeatures';
import { formatCatalogCardPrice } from '../shared/catalogPrice';
import { productImageTransform } from './ProductImageControls';
function DetailText({children}:React.PropsWithChildren){
 const box=React.useRef<HTMLDivElement>(null),content=React.useRef<HTMLDivElement>(null),[scale,setScale]=React.useState(1);
 React.useLayoutEffect(()=>{const root=box.current,node=content.current;if(!root||!node)return;let frame=0;const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>setScale(Math.min(1,root.clientHeight/Math.max(1,node.scrollHeight),root.clientWidth/Math.max(1,node.scrollWidth))))};const observer=new ResizeObserver(update);observer.observe(root);observer.observe(node);update();return()=>{cancelAnimationFrame(frame);observer.disconnect()}},[children]);
 return <div ref={box} className="catalog-fitted-info relative w-full h-full overflow-hidden"><div ref={content} style={{transform:`scale(${scale})`,transformOrigin:'top left'}}>{children}</div></div>;
}
export function DetailProductCard({product,block,info,template}:{product:Product;block:PageBlock;info:ProductInfoSettings;template:DetailTemplate}){
 const values=detailValues(product,block),portrait=template==='portrait4',font=template==='wide3'?10:7.2;
 const rows=(fields:typeof detailFields[number][])=>fields.map(([key,label])=><tr key={key}><th style={{fontWeight:700,textAlign:'left',verticalAlign:'top',width:'62%',paddingRight:3}}>{label}</th><td style={{verticalAlign:'top',overflowWrap:'anywhere'}}> : {values[key]}</td></tr>);
 const table=(fields:typeof detailFields[number][])=><table style={{width:'100%',borderCollapse:'collapse',fontSize:`calc(${font}px * var(--catalog-page-scale,1))`,lineHeight:1.24}}><tbody>{rows(fields)}</tbody></table>;
 const image=<div className="relative flex-1 min-h-0 w-full overflow-hidden">{product.images?.[0]&&<img draggable={false} src={product.images[0]} alt="" className="catalog-product-image absolute inset-0 w-full h-full object-contain pointer-events-none" style={{transform:productImageTransform(block),transformOrigin:'center center'}}/>}</div>;
 const caption=<div className="catalog-fitted-info shrink-0 text-center w-full" style={{fontSize:`calc(${template==='wide3'?11:7.5}px * var(--catalog-page-scale,1))`,lineHeight:1.2,padding:'2px 0'}}><div className="break-words">{product.name||'xxx'}</div><div style={{fontWeight:700,fontSize:'1.15em'}}>Katalog Fiyatı : {formatCatalogCardPrice(product.price,block,info)}</div></div>;
 return <div data-detail-features={template} className="w-full h-full min-h-0 overflow-hidden" style={{display:'flex',flexDirection:portrait?'column':'row',gap:'2%',padding:'2%',color:info.color||'#111',fontFamily:info.fontFamily||'Arial, sans-serif'}}>{portrait?<><div className="flex flex-col min-h-0" style={{height:'68%'}}>{image}{caption}</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3%',height:'30%',minHeight:0}}><DetailText>{table(detailFields.slice(0,9))}</DetailText><DetailText>{table(detailFields.slice(9))}</DetailText></div></>:<><div className="min-h-0" style={{width:'47%',height:'100%'}}><DetailText>{table([...detailFields])}</DetailText></div><div className="flex flex-col min-h-0" style={{width:'51%',height:'100%'}}>{image}{caption}</div></>}</div>;
}
