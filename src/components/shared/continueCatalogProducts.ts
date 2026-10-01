import type { Page } from '../../types';
// Existing cards and occupied slots stay in place; only vacant product slots are filled.
export function continueCatalogProducts(pages:Page[],targetId:string,requested:string[],makePage:(base:Page,ids:string[])=>Page):Page[]{
 const ordered=[...pages].sort((a,b)=>a.order-b.order),start=ordered.findIndex(p=>p.id===targetId);
 if(start<0)return pages;
 const used=new Set(ordered.flatMap(p=>[...(p.content.productIds||[]),...(p.content.blocks||[]).map(b=>b.productId).filter(Boolean)]));
 const queue=[...new Set(requested)].filter(id=>!used.has(id));
 if(!queue.length)return pages;
 const next=ordered.map((p,i)=>{
  if(i<start||!queue.length)return p;
  if(!(p.content.blocks||[]).length&&!(p.content.productIds||[]).length){const made=makePage(p,queue.splice(0,4));return {...made,id:p.id,order:p.order,title:p.title};}
  let changed=false;
  const blocks=(p.content.blocks||[]).map(b=>{
   if(b.frameKind!=='product'||b.productId||!queue.length)return b;
   changed=true;return {...b,productId:queue.shift()!};
  });
  return changed?{...p,content:{...p.content,blocks,productIds:blocks.filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!)}}:p;
 });
 const pageIds=new Set(next.map(page=>page.id));
 while(queue.length){const made=makePage(ordered[start],queue.splice(0,4));let id=made.id;while(pageIds.has(id))id=crypto.randomUUID();pageIds.add(id);next.push({...made,id});}
 return next.map((p,order)=>({...p,order}));
}
