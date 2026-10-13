import React from 'react';
export function SettingsSection({label,enabled=true,onToggle,children}:{label:string;enabled?:boolean;onToggle?:(enabled:boolean)=>void;children?:React.ReactNode}){
 const [open,setOpen]=React.useState(false);
 return <section className="border rounded-lg p-3"><div className="flex items-center gap-2">{onToggle&&<input aria-label={label+' göster'} type="checkbox" checked={enabled} onChange={e=>{onToggle(e.target.checked);if(!e.target.checked)setOpen(false)}}/>}<button type="button" aria-expanded={open} aria-label={label+' ayarlarını '+(open?'kapat':'aç')} onClick={()=>setOpen(value=>!value)} className="flex-1 flex items-center justify-between text-left text-sm font-medium"><span>{label}</span><span aria-hidden="true">{open?'▴':'▾'}</span></button></div>{enabled&&open&&<div className="mt-3">{children}</div>}</section>;
}
