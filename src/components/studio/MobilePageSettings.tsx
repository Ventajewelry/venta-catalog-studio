import React from 'react';
import { CatalogLogoControls } from './CatalogInteractionHelpers';

const fields = [
  ['showName', 'Başlık', 'nameStyle', 'Ürün başlığı'], ['showSku', 'SKU', 'skuStyle', 'V0039918'],
  ['showPrice', 'Fiyat', 'priceStyle', '₺24.900'], ['showColor', 'Renk', 'colorStyle', 'D-E'],
  ['showClarity', 'Berraklık', 'clarityStyle', 'SI1'], ['showCertificate', 'Taş özellikleri', 'certificateStyle', 'Pırlanta · 0,19 · 11 · F · SI · Yuvarlak'],
  ['showStone', 'Taş', 'stoneStyle', 'Pırlanta'], ['showProperties', 'Ürün özellikleri', 'propertiesStyle', 'Ürün özellikleri'],
];

function TextControls({ value, change, sample, font = 'Arial, sans-serif', previewScale = 1 }: { value: any; change: (value: any) => void; sample: string; font?: string; previewScale?: number }) {
  const size = value.fontSize ?? 10;
  return <div className="mobile-text-controls space-y-3 pt-3">
    <label className="block text-xs">Yazı boyutu · {size} px<div className="flex items-center gap-3 mt-2"><input aria-label="Yazı boyutu sürgüsü" type="range" min="6" max="40" step="1" value={size} onChange={e => change({ fontSize: Number(e.target.value) })}/><input aria-label="Yazı boyutu" className="field w-20" type="number" min="6" max="80" value={size} onChange={e => change({ fontSize: Math.max(6, Math.min(80, Number(e.target.value))) })}/></div></label>
    <label className="block text-xs">Yazı tipi<select className="field mt-1" value={value.fontFamily || font} onChange={e => change({ fontFamily: e.target.value })}><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="Majesty, serif">Majesty</option></select></label>
    <label className="block text-xs">Kalınlık<select className="field mt-1" value={value.fontWeight ?? 400} onChange={e => change({ fontWeight: Number(e.target.value) })}><option value="300">İnce</option><option value="400">Normal</option><option value="500">Orta</option><option value="600">Kalın</option></select></label>
    <label className="block text-xs">Renk<div className="flex gap-2 mt-1"><input aria-label="Yazı rengi" type="color" value={value.color || '#0f203a'} onChange={e => change({ color: e.target.value })} className="field h-11 p-1 w-16"/><span className="flex items-center text-xs">{value.color || '#0f203a'}</span></div></label>
    <label className="block text-xs">Hizalama<select className="field mt-1" value={value.align || 'left'} onChange={e => change({ align: e.target.value })}><option value="left">Sola yaslı</option><option value="center">Ortalı</option><option value="right">Sağa yaslı</option></select></label>
    <div className="rounded-lg bg-[#f4f6f9] p-3 border border-black/5"><div className="text-[10px] opacity-50 mb-2">KATALOG İLE AYNI ÖLÇEK · {size} px</div><div className="break-words" style={{ ...value, fontSize: size * previewScale, fontWeight: value.fontWeight ?? 400, textAlign: value.align || 'left', fontFamily: value.fontFamily || font, color: value.color || '#0f203a', lineHeight: 1.25 }}>{sample}</div></div>
  </div>;
}

export function MobilePageSettings({ page, settings, onSettings, onPageStyle, onUpdateInfo }: any) {
  const [previewScale, setPreviewScale] = React.useState(1);
  React.useLayoutEffect(() => {
    const canvas = Array.from(document.querySelectorAll<HTMLElement>('[data-catalog-page]')).find(node => node.dataset.catalogPage === page.id);
    if (!canvas) return;
    const update = () => setPreviewScale(canvas.getBoundingClientRect().width / 760);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [page.id]);
  const defaults = { showName: true, showSku: true, fontSize: 10, color: '#0f203a', ...settings.productInfoDefaults };
  const section = (local: boolean) => {
    const info = { ...defaults, ...(local ? page.style?.productInfoOverrides : {}) };
    const style = local ? { ...settings, ...page.style } : settings;
    const patchInfo = (patch: any) => local ? onPageStyle({ ...page.style, productInfoOverrides: { ...page.style?.productInfoOverrides, ...patch } }) : onUpdateInfo(patch);
    const patchStyle = (patch: any) => local ? onPageStyle({ ...page.style, ...patch }) : onSettings(patch);
    return <div className="space-y-3">
      {fields.map(([flag, label, key, sample]) => <div key={flag} className="border rounded-lg p-3"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={!!info[flag]} onChange={e => patchInfo({ [flag]: e.target.checked })}/>{label}</label>{info[flag] && <details className="mt-2" open><summary className="text-xs cursor-pointer">Yazı ayarları</summary><TextControls previewScale={previewScale} value={{ fontSize: info.fontSize, color: info.color, align: info.align, fontFamily: info.fontFamily, ...info[key] }} sample={sample} change={p => patchInfo({ [key]: { ...info[key], ...p } })}/>{flag === 'showPrice' && <label className="block text-xs mt-3">İndirim %<input className="field mt-1" type="number" min="0" max="100" value={info.discountPercent || 0} onChange={e => patchInfo({ discountPercent: Math.max(0, Math.min(100, Number(e.target.value))) })}/></label>}</details>}</div>)}
      {['header', 'footer'].map(part => { const upper = part === 'header', flag = upper ? 'showHeader' : 'showFooter', textKey = part + 'Text'; return <div key={part} className="border rounded-lg p-3"><label className="flex gap-2 items-center text-sm font-medium"><input type="checkbox" checked={!!style[flag]} onChange={e => patchStyle({ [flag]: e.target.checked })}/>{upper ? 'Üst bilgi' : 'Alt bilgi'}</label>{style[flag] && <details open className="mt-2"><summary className="text-xs">Yazı ayarları</summary><input aria-label={upper ? 'Üst bilgi metni' : 'Alt bilgi metni'} className="field mt-3" value={style[textKey] || ''} onChange={e => patchStyle({ [textKey]: e.target.value })}/><TextControls previewScale={previewScale} font="Majesty, serif" value={{ fontSize: style[part + 'FontSize'] ?? 8, fontWeight: style[part + 'FontWeight'] ?? 400, color: style[part + 'Color'], fontFamily: style[part + 'FontFamily'], align: style[part + 'Position'] || 'center' }} sample={style[textKey] || (upper ? 'Üst bilgi örneği' : 'Alt bilgi örneği')} change={p => { const out: any = {}; for (const [k, v] of Object.entries(p)) out[part + ({ fontSize: 'FontSize', fontWeight: 'FontWeight', color: 'Color', fontFamily: 'FontFamily', align: 'Position' } as any)[k]] = v; patchStyle(out); }}/></details>}</div>; })}
      <div className="border rounded-lg p-3"><label className="flex gap-2 text-sm items-center"><input type="checkbox" checked={local ? (page.style?.showPageNumber ?? settings.showPageNumbers) : settings.showPageNumbers} onChange={e => patchStyle({ [local ? 'showPageNumber' : 'showPageNumbers']: e.target.checked })}/>Sayfa numarası</label>{(local ? (page.style?.showPageNumber ?? settings.showPageNumbers) : settings.showPageNumbers) && <details open className="mt-2"><summary className="text-xs">Yazı ayarları</summary><TextControls previewScale={previewScale} value={style.pageNumberStyle || { fontSize: 9, align: 'center' }} sample={String(page.order + 1)} change={p => patchStyle({ pageNumberStyle: { ...style.pageNumberStyle, ...p } })}/><label className="block text-xs mt-3">Konum<select className="field mt-1" value={style.pageNumberPosition || 'bottom-center'} onChange={e => patchStyle({ pageNumberPosition: e.target.value })}>{[['top-left','Üst · Sol'],['top-center','Üst · Orta'],['top-right','Üst · Sağ'],['bottom-left','Alt · Sol'],['bottom-center','Alt · Orta'],['bottom-right','Alt · Sağ']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label></details>}</div>
      <div className="border rounded-lg p-3 space-y-3"><h3 className="text-sm font-medium">Çerçeve ve sayfa düzeni</h3><label className="block text-xs">Kart arası boşluk<input className="field mt-1" type="number" min="0" max="8" step="0.5" value={style.productCardGap??2} onChange={e=>patchStyle({productCardGap:Math.max(0,Math.min(8,Number(e.target.value)))})}/></label><label className="block text-xs">Çerçeve kalınlığı<input className="field mt-1" type="number" min="0" max="10" value={style.productBorderWidth??1} onChange={e=>patchStyle({productBorderWidth:Math.max(0,Math.min(10,Number(e.target.value)))})}/></label><label className="block text-xs">Çerçeve rengi<input className="field mt-1" type="color" value={style.productBorderColor||'#d5dbe3'} onChange={e=>patchStyle({productBorderColor:e.target.value})}/></label><label className="flex gap-2 text-sm"><input type="checkbox" checked={style.gridVisible!==false} onChange={e=>patchStyle({gridVisible:e.target.checked})}/>Izgarayı göster</label></div>
      <CatalogLogoControls settings={style} onChange={patchStyle}/>
      <label className="block text-xs border rounded-lg p-3">Arka plan rengi<input type="color" className="field h-11 mt-2 p-1" value={style.backgroundColor || '#ffffff'} onChange={e => patchStyle({ backgroundColor: e.target.value })}/></label>
    </div>;
  };
  return <div className="mobile-page-settings p-4 space-y-5"><h2 className="text-base font-semibold">Sayfa özellikleri</h2><details open><summary className="font-semibold text-sm mb-3">Tüm katalog · genel ayarlar</summary>{section(false)}</details><details open><summary className="font-semibold text-sm mb-3">Geçerli sayfa · {page.order + 1}</summary>{section(true)}</details><button className="field bg-[#0f203a] text-white" onClick={() => { onPageStyle({}); onUpdateInfo(defaults); }}>Bu sayfayı genel ayarlara döndür</button></div>;
}
