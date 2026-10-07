import type { PageBlock, ProductInfoSettings } from '../../types';
export interface CatalogPriceSettings {
  currency?: 'TRY' | 'USD' | 'EUR';
  usdRate?: number;
  eurRate?: number;
  discountPercent?: number;
  roundPriceToHundred?: boolean;
}
// Product prices remain in TL. Conversion is applied only to the displayed value.
export function catalogPriceValue(tlPrice: number, settings: CatalogPriceSettings): number | null {
  if (!Number.isFinite(tlPrice) || tlPrice < 0) return null;
  const currency = settings.currency || 'TRY';
  const rate = currency === 'USD' ? settings.usdRate : settings.eurRate;
  if (currency !== 'TRY' && (!Number.isFinite(rate) || !rate || rate <= 0)) return null;
  const discount = Math.max(0, Math.min(100, settings.discountPercent || 0));
  const converted = tlPrice * (1 - discount / 100) / (currency === 'TRY' ? 1 : rate!);
  return settings.roundPriceToHundred === false ? converted : Math.ceil(Number((converted / 100).toFixed(10))) * 100;
}
export function formatCatalogPrice(tlPrice: number, settings: CatalogPriceSettings): string {
  const value = catalogPriceValue(tlPrice, settings);
  if (value === null) return '—';
  const symbol = settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : '₺';
  return symbol + value.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
}

// Explicit card prices are already in the selected currency and must not be converted twice.
export function catalogCardPriceValue(tlPrice: number, block: PageBlock, settings: Partial<ProductInfoSettings>): number | null {
  const currency = settings.currency || 'TRY';
  const manual = settings.automaticFields?.price === false ? block.manualFields?.priceByCurrency?.[currency] : undefined;
  if (typeof manual === 'number' && Number.isFinite(manual) && manual >= 0) return manual;
  return catalogPriceValue(tlPrice, settings);
}
export function formatCatalogCardPrice(tlPrice: number, block: PageBlock, settings: Partial<ProductInfoSettings>): string {
  const value = catalogCardPriceValue(tlPrice, block, settings);
  if (value === null) return '—';
  const symbol = settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : '₺';
  return symbol + value.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
}
