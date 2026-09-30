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
 write(f,s);
}
