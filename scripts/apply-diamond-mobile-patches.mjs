import fs from 'node:fs';
const read=f=>fs.readFileSync(f,'utf8');
const write=(f,s)=>fs.writeFileSync(f,s);
// Shared multi-select diamond grades and mobile-only swipe navigation.
{
 const f='src/components/studio/CatalogStudioV5.tsx'; let s=read(f);
 if(!s.includes("from '../shared/DiamondFilters'")) s="import { DiamondGradePicker, DIAMOND_COLORS, DIAMOND_CLARITIES, matchesDiamondGrades } from '../shared/DiamondFilters';\n"+s;
 s=s.replace("[color,setColor]=React.useState(''),[clarity,setClarity]=React.useState('')", "[color,setColor]=React.useState<string[]>([]),[clarity,setClarity]=React.useState<string[]>([])");
 s=s.replace("if(color&&p.color!==color)return false;if(clarity&&p.clarity!==clarity)return false;", "if(!matchesDiamondGrades(p.color,color)||!matchesDiamondGrades(p.clarity,clarity))return false;");
 s=s.replaceAll("setColor('');setClarity('')", "setColor([]);setClarity([])");
 const start=s.indexOf('<select className="field" value={color}');
 if(start>=0){const end=s.indexOf('</select>',s.indexOf('<select className="field" value={clarity}',start))+9;s=s.slice(0,start)+'<DiamondGradePicker label="Renk" options={DIAMOND_COLORS} value={color} onChange={setColor}/><DiamondGradePicker label="Berraklık" options={DIAMOND_CLARITIES} value={clarity} onChange={setClarity}/>'+s.slice(end);}
 if(!s.includes('const swipeStart=')){
 s=s.replace("const page=sorted.find(p=>p.id===pageId)||sorted[0];", "const page=sorted.find(p=>p.id===pageId)||sorted[0];const swipeStart=React.useRef<{x:number;y:number}|null>(null);const mobileMode=()=>window.matchMedia('(max-width:767px)').matches||document.querySelector('.catalog-mobile-preview')!==null;const swipeEnd=(e:React.PointerEvent)=>{const start=swipeStart.current;swipeStart.current=null;if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5)return;const index=sorted.findIndex(p=>p.id===page?.id),next=sorted[index+(dx<0?1:-1)];if(next){setPageId(next.id);setBlockId(null);setMergeIds([])}};");
 s=s.replace('<main className="flex-1 flex flex-col">', '<main className="flex-1 flex flex-col" onPointerDown={e=>{if(!mobileMode()||!e.isPrimary||(e.target as HTMLElement).closest(\'header,input,button,select,textarea\')){swipeStart.current=null;return}swipeStart.current={x:e.clientX,y:e.clientY}}} onPointerUp={swipeEnd} onPointerCancel={()=>{swipeStart.current=null}}>');
 }

 // Stack actual catalog pages only at mobile widths; desktop retains its single canvas.
 if(!s.includes('const [stackedMobile')){
 s=s.replace('const sorted=[...pages].sort', "const [stackedMobile,setStackedMobile]=React.useState(()=>window.matchMedia('(max-width:767px)').matches||new URLSearchParams(window.location.search).get('mobilePreview')==='1');React.useEffect(()=>{const mq=window.matchMedia('(max-width:767px)'),sync=()=>setStackedMobile(mq.matches||document.querySelector('.catalog-mobile-preview')!==null);mq.addEventListener('change',sync);return()=>mq.removeEventListener('change',sync)},[]);const sorted=[...pages].sort");
 const start=s.indexOf('<div className="flex-1 overflow-auto p-6 flex justify-center">');
 const end=s.indexOf('</main>',start);
 if(start<0||end<0)throw Error('Catalog canvas not found');
 const region=s.slice(start,end),outer='<div className="flex-1 overflow-auto p-6 flex justify-center">';
 let canvas=region.slice(outer.length,-6);
 canvas=canvas.replace('<div className="relative bg-white shadow-2xl"', '<div key={page.id} data-catalog-page={page.id} onClickCapture={()=>{if(stackedMobile&&page.id!==pageId){setPageId(page.id);setBlockId(null);setMergeIds([])}}} className="relative bg-white shadow-2xl"');
 const replacement='<div className="catalog-page-scroll flex-1 overflow-auto p-6 flex justify-center" style={stackedMobile?{display:"block"}:undefined} onScroll={e=>{if(!stackedMobile)return;const root=e.currentTarget,top=root.getBoundingClientRect().top;const cards=Array.from(root.querySelectorAll<HTMLElement>("[data-catalog-page]"));const nearest=cards.reduce<HTMLElement|null>((best,item)=>!best||Math.abs(item.getBoundingClientRect().top-top)<Math.abs(best.getBoundingClientRect().top-top)?item:best,null);const id=nearest?.dataset.catalogPage;if(id&&id!==pageId){setPageId(id);setBlockId(null);setMergeIds([])}}}>{(stackedMobile?sorted:page?[page]:[]).map(page=>('+canvas+'))}</div>';
 s=s.slice(0,start)+replacement+s.slice(end);
 s=s.replace('setPageId(p.id);', 'setPageId(p.id);if(stackedMobile){document.querySelector(`[data-catalog-page="${p.id}"]`)?.scrollIntoView({block:"start",behavior:"smooth"})}');
 // A vertical catalog does not need horizontal swipe navigation.
 s=s.replace('onPointerUp={swipeEnd}', 'onPointerUp={e=>{if(!stackedMobile)swipeEnd(e)}}');
 }
 write(f,s);
}

