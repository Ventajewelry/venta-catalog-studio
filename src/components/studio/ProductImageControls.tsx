import React from 'react';
import type { PageBlock } from '../../types';

export function productImageTransform(block: PageBlock) {
  const clamp = (value: number | undefined, fallback: number, min: number, max: number) =>
    Number.isFinite(value) ? Math.max(min, Math.min(max, value!)) : fallback;
  return `translate(${clamp(block.imagePositionX, 50, 0, 100) - 50}%, ${clamp(block.imagePositionY, 50, 0, 100) - 50}%) scale(${clamp(block.imageScale, 1, .25, 3)})`;
}

export function ProductImageControls({ block, onPatch }: {
  block: PageBlock; onPatch: (patch: Partial<PageBlock>) => void;
}) {
  return <section className="border rounded-lg p-3 space-y-4">
    <h3 className="font-semibold text-sm">Kart içindeki ürün görseli</h3>
    <p className="text-xs opacity-60">Yalnızca bu kartın görselini düzenler.</p>
    {([
      ['imageScale', 'Boyut', .25, 3, .05, 1],
      ['imagePositionX', 'Yatay konum · sol / sağ', 0, 100, 1, 50],
      ['imagePositionY', 'Dikey konum · yukarı / aşağı', 0, 100, 1, 50],
    ] as const).map(([key, label, min, max, step, fallback]) => <label key={key} className="block text-xs space-y-2">
      <span className="flex justify-between gap-2"><span>{label}</span><output>{key === 'imageScale' ? `${Math.round((block[key] ?? fallback) * 100)}%` : `${block[key] ?? fallback}%`}</output></span>
      <input aria-label={label} className="w-full accent-[#0f203a]" type="range" min={min} max={max} step={step} value={block[key] ?? fallback} onChange={event => onPatch({ [key]: Number(event.target.value) })}/>
    </label>)}
    <button className="field" onClick={() => onPatch({ imageScale: 1, imagePositionX: 50, imagePositionY: 50 })}>Ortala ve sıfırla</button>
  </section>;
}
