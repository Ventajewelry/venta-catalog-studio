import React from 'react';
export type JewelryProduct={id?:string;brand?:string;name?:string;material?:string;properties?:string;stone?:string;stoneDetails?:string};
export type JewelryFilters={gold:string[];gems:string[];cuts:string[]};
const normalize=(value:string)=>value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/\s+/g,' ').trim();
const unique=(values:string[])=>Array.from(new Set(values));
const gemAliases:Record<string,string>={'blue topaz':'Mavi Topaz','mavi topaz':'Mavi Topaz','morganite':'Morganit','morganit':'Morganit','citrine':'Sitrin','sitrin':'Sitrin','aqua marine':'Akuamarin','aquamarine':'Akuamarin','akuamarin':'Akuamarin','browni':'Brown','brown':'Brown'};
const cutAliases:Record<string,string>={'yuvarlak':'Yuvarlak','yuvarak':'Yuvarlak','round':'Yuvarlak','oval':'Oval','ovql':'Oval','damla':'Damla','pear':'Damla','markiz':'Markiz','marquise':'Markiz','emerald':'Emerald','prenses':'Prenses','princess':'Prenses','trapez':'Trapez','kalp':'Kalp','heart':'Kalp','cushion':'Cushion','radiant':'Radiant','baget':'Baget','baguette':'Baget','octagon':'Octagon','asscher':'Asscher'};
export function jewelryValues(product:JewelryProduct){
 const metal=normalize([product.properties,product.material].filter(Boolean).join(' '));
 const gold:string[]=[];for(const[label,pattern]of [['Beyaz Altın',/beyaz altin|white gold/],['Sarı Altın',/sari altin|yellow gold/],['Rose Altın',/rose altin|roze altin|pembe altin|rose gold/]] as const)if(pattern.test(metal))gold.push(label);
 const rows=(product.stoneDetails||'').split(/\r?\n/).map(line=>line.split(' · ')).filter(row=>row.length===6);
 const gems=unique([...(product.stone||'').split(/[,;]+/),...rows.map(row=>row[0])].map(value=>value.trim()).filter(Boolean).filter(value=>!['pirlanta','diamond','laboratuvar pirlanta','lab diamond'].includes(normalize(value))).map(value=>gemAliases[normalize(value)]||value));
 const cuts=unique(rows.flatMap(row=>row[5].split(/[-,;/]+/)).map(value=>cutAliases[normalize(value)]).filter(Boolean));
 // Larien's public variant snapshot has its cut in the product title.
 if(!cuts.length&&(product.brand==='larien'||product.id?.startsWith('larien:')||normalize(product.name||'').includes('kesim'))){const name=normalize(product.name||'');for(const[key,label]of Object.entries(cutAliases)){if(new RegExp('(?:^|[^a-z])'+key+'(?:$|[^a-z])').test(name)&&!cuts.includes(label))cuts.push(label)}}
 return {gold,gems,cuts};
}
export function jewelryOptions(products:JewelryProduct[]):JewelryFilters{const values=products.map(jewelryValues);const sorted=(key:keyof JewelryFilters)=>unique(values.flatMap(value=>value[key])).sort((a,b)=>a.localeCompare(b,'tr'));return{gold:sorted('gold'),gems:sorted('gems'),cuts:sorted('cuts')}}
export function matchesJewelryFilters(product:JewelryProduct,selected:JewelryFilters){if(!selected.gold.length&&!selected.gems.length&&!selected.cuts.length)return true;const values=jewelryValues(product);return(['gold','gems','cuts'] as const).every(key=>!selected[key].length||selected[key].some(value=>values[key].includes(value)))}
export function JewelryFilterControls({options,value,onChange}:{options:JewelryFilters;value:JewelryFilters;onChange:(value:JewelryFilters)=>void}){
 return <div className="grid grid-cols-1 gap-2">{([['gold','Altın rengi'],['gems','Renkli taş'],['cuts','Taş kesimi']] as const).map(([key,label])=><details key={key} className="border rounded-lg bg-white p-2"><summary className="cursor-pointer text-xs">{label} · {value[key].length?value[key].join(', '):'Tümü'}</summary><div className="flex flex-wrap gap-2 pt-2">{options[key].map(option=><label key={option} className="flex items-center gap-2 border rounded px-2 py-2 text-xs"><input aria-label={`${label}: ${option}`} type="checkbox" checked={value[key].includes(option)} onChange={()=>onChange({...value,[key]:value[key].includes(option)?value[key].filter(item=>item!==option):[...value[key],option]})}/>{option}</label>)}{!options[key].length&&<span className="text-xs opacity-60">Bu markanın ürünlerinde bilgi bulunamadı.</span>}</div></details>)}</div>
}
