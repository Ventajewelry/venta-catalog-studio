import React from 'react';

export function fittedCatalogWidth(width:number,height:number,pageWidth:number,pageHeight:number){
 return Math.max(1,Math.min(Math.max(1,width-48),Math.max(1,height-48)*pageWidth/Math.max(1,pageHeight)));
}
export function useStudioViewport(area:React.RefObject<HTMLDivElement|null>,pageWidth:number,pageHeight:number){
 const [left,setLeft]=React.useState(()=>window.innerWidth<1100?160:224),[right,setRight]=React.useState(()=>window.innerWidth<1100?280:430);
 const [tablet,setTablet]=React.useState(()=>window.matchMedia('(min-width:768px) and (max-width:1366px) and (any-pointer:coarse)').matches||window.matchMedia('(min-width:768px) and (max-width:1024px)').matches);
 React.useEffect(()=>{const a=window.matchMedia('(min-width:768px) and (max-width:1366px) and (any-pointer:coarse)'),b=window.matchMedia('(min-width:768px) and (max-width:1024px)');const update=()=>setTablet(a.matches||b.matches);a.addEventListener('change',update);b.addEventListener('change',update);return()=>{a.removeEventListener('change',update);b.removeEventListener('change',update)}},[]);
 const [percent,setPercent]=React.useState(100),[fit,setFit]=React.useState(true),[available,setAvailable]=React.useState({width:760,height:1000});
 React.useLayoutEffect(()=>{const node=area.current;if(!node)return;const update=()=>setAvailable({width:node.clientWidth,height:node.clientHeight});const observer=new ResizeObserver(update);observer.observe(node);update();return()=>observer.disconnect()},[area]);
 const drag=(side:'left'|'right',e:React.PointerEvent<HTMLDivElement>)=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);const start=e.clientX,initial=side==='left'?left:right;const node=e.currentTarget;
 const move=(event:PointerEvent)=>{const total=node.parentElement?.clientWidth||window.innerWidth;const other=side==='left'?right:left;const max=Math.max(160,Math.min(650,total-other-180));const next=Math.max(160,Math.min(max,initial+(event.clientX-start)*(side==='left'?1:-1)));(side==='left'?setLeft:setRight)(next)};
 const end=()=>{node.removeEventListener('pointermove',move);node.removeEventListener('pointerup',end);node.removeEventListener('pointercancel',end);node.removeEventListener('lostpointercapture',end)};
 node.addEventListener('pointermove',move);node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);node.addEventListener('lostpointercapture',end);
 };
 return {tablet,left,right,percent,fit,setFit,setPercent,drag,width:fit?fittedCatalogWidth(available.width,available.height,pageWidth,pageHeight):760*Math.max(1,percent)/100};
}
export function StudioViewControls({view}:{view:ReturnType<typeof useStudioViewport>}){
 return <div className="studio-view-controls flex items-center gap-2 text-xs shrink-0"><span>Görünüm:</span><button aria-pressed={view.fit} onClick={()=>view.setFit(true)} className={`border rounded px-2 py-2 ${view.fit?'bg-[#0f203a] text-white':''}`}>Fit</button><label className="flex items-center gap-1"><span className="sr-only">Yakınlaştırma oranı</span><input aria-label="Yakınlaştırma oranı" type="range" min="0" max="100" value={view.percent} onChange={e=>{view.setPercent(Number(e.target.value));view.setFit(false)}} className="w-16 accent-[#0f203a]"/><input aria-label="Yakınlaştırma yüzdesi" type="number" min="0" max="100" value={view.percent} onChange={e=>{view.setPercent(Math.max(0,Math.min(100,Number(e.target.value))));view.setFit(false)}} className="w-12 border rounded p-1"/>%</label></div>;
}
export function StudioPanelHandle({side,onPointerDown}:{side:'left'|'right';onPointerDown:React.PointerEventHandler<HTMLDivElement>}){
 return <div role="separator" aria-label={side==='left'?'Sol panel genişliği':'Sağ panel genişliği'} aria-orientation="vertical" tabIndex={0} className="studio-panel-handle" onPointerDown={onPointerDown}><span/></div>;
}
export function StudioViewportStyles(){return <style>{`
.studio-panel-handle{width:10px;flex-shrink:0;cursor:col-resize;touch-action:none;background:#eef1f5;display:flex;align-items:center;justify-content:center}.studio-panel-handle span{height:44px;width:3px;border-radius:3px;background:#a4adba}.studio-panel-handle:hover{background:#dce4ef}
@media(min-width:768px){.catalog-shell:not(.catalog-mobile-preview) main{min-width:0;min-height:0}.catalog-shell:not(.catalog-mobile-preview) main>header{height:auto;min-height:56px;flex-wrap:wrap;gap:8px;padding-top:8px;padding-bottom:8px;flex-shrink:0}.catalog-shell:not(.catalog-mobile-preview) .catalog-page-scroll{min-height:0}.catalog-shell:not(.catalog-mobile-preview) .catalog-page-scroll>[data-catalog-page]{margin-bottom:24px;flex-shrink:0;margin-left:auto;margin-right:auto}}
@media(max-width:767px){.studio-panel-handle,.studio-view-controls{display:none}}
.catalog-mobile-preview .studio-panel-handle,.catalog-mobile-preview .studio-view-controls{display:none}
`}</style>}
