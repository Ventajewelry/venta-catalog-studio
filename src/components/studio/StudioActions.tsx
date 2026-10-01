import React from 'react';
import { Menu, X } from 'lucide-react';
export function StudioActions({ undo, canUndo, clear, pdf, exporting, preview, saveDraft, loadDraft, publish }: { undo:()=>void; canUndo:boolean; clear:()=>void; pdf:()=>void; exporting:boolean; preview?:()=>void; saveDraft?:()=>void; loadDraft?:()=>void; publish?:()=>void }) {
 const [open,setOpen]=React.useState(false);
 const root=React.useRef<HTMLDivElement>(null);
 React.useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false)};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}},[open]);
 const action=(fn?:()=>void)=>{setOpen(false);fn?.()};
 return <div ref={root} className="relative shrink-0"><button aria-label="Katalog menüsü" aria-expanded={open} aria-haspopup="true" onClick={()=>setOpen(v=>!v)} className="inline-flex items-center gap-2 border rounded-lg px-3 py-2 text-xs">{open?<X size={16}/>:<Menu size={16}/>}Menü</button>{open&&<div aria-label="Katalog işlemleri" className="absolute right-0 top-full mt-2 w-56 max-w-[85vw] bg-white border rounded-xl shadow-xl p-2 z-[600] text-xs text-[#0f203a]">{[
 ['Geri al',undo,!canUndo],['Kataloğu temizle',clear,false],[exporting?'PDF hazırlanıyor…':'PDF indir',pdf,exporting],['Önizle',preview,!preview],['Taslağa kayıt et',saveDraft,!saveDraft],['Taslaktan çağır',loadDraft,!loadDraft]
 ].map(([label,fn,disabled])=><button key={String(label)} disabled={Boolean(disabled)} onClick={()=>action(fn as ()=>void)} className="block w-full text-left px-3 py-3 rounded-lg hover:bg-[#f1f4f8] disabled:opacity-30">{String(label)}</button>)}</div>}</div>;
}
