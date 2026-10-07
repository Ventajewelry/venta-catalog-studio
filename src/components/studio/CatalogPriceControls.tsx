import React from 'react';
import { CatalogPriceSettings, formatCatalogPrice } from '../shared/catalogPrice';
export function CatalogPriceControls({value, onChange}: {value: CatalogPriceSettings; onChange: (patch: Partial<CatalogPriceSettings>) => void}) {
  const currency = value.currency || 'TRY';
  const rateKey = currency === 'USD' ? 'usdRate' : 'eurRate';
  return <div className="space-y-3 mt-3">
    <label className="block text-xs">Para birimi<select className="field mt-1" value={currency} onChange={e => onChange({currency: e.target.value as CatalogPriceSettings['currency']})}><option value="TRY">TL (₺)</option><option value="USD">Dolar ($)</option><option value="EUR">Euro (€)</option></select></label>
    {currency !== 'TRY' && <label className="block text-xs">{currency === 'USD' ? 'Dolar kuru' : 'Euro kuru'} · 1 {currency} kaç TL?<input className="field mt-1" type="number" inputMode="decimal" min="0.0001" step="any" value={value[rateKey] || ''} onChange={e => onChange({[rateKey]: Number(e.target.value)})}/>{(!value[rateKey] || value[rateKey]! <= 0) && <span className="block mt-1 text-amber-700">Fiyatı hesaplamak için pozitif bir kur girin.</span>}</label>}
    <label className="flex gap-2 items-center text-xs"><input type="checkbox" checked={value.roundPriceToHundred !== false} onChange={e => onChange({roundPriceToHundred: e.target.checked})}/>Sonraki 100'e yukarı yuvarla</label>
    <p className="text-xs opacity-70">Örnek · 32.126 TL → {formatCatalogPrice(32126, value)}</p>
  </div>;
}
