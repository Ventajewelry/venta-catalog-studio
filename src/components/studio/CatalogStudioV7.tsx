import React, { useMemo, useState } from 'react';
import { Check, Filter, RotateCcw, X } from 'lucide-react';
import { CatalogStudioV5 } from './CatalogStudioV5';

type Product = {
  id: string;
  name: string;
  sku?: string;
  karat?: string | number;
  price?: number;
  images?: string[];
  categoryId?: string;
  collectionId?: string;
};

type Page = { id: string; order: number; title?: string };
type Option = { id: string; name: string };

type Props = React.ComponentProps<typeof CatalogStudioV5> & {
  products?: Product[];
  pages?: Page[];
  categories?: Option[];
  collections?: Option[];
  onReplacePages?: (pages: Page[]) => void;
};

export function CatalogStudioV7(props: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [collection, setCollection] = useState('');
  const [karat, setKarat] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetId, setTargetId] = useState('');

  const products = props.products ?? [];
  const pages = props.pages ?? [];
  const filtered = useMemo(() => products.filter((product) => {
    const text = `${product.name} ${product.sku ?? ''}`.toLocaleLowerCase('tr-TR');
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');
    const price = Number(product.price ?? 0);
    return (!normalizedQuery || text.includes(normalizedQuery))
      && (!category || product.categoryId === category)
      && (!collection || product.collectionId === collection)
      && (!karat || String(product.karat ?? '') === karat)
      && (!min || price >= Number(min))
      && (!max || price <= Number(max));
  }), [products, query, category, collection, karat, min, max]);

  const karats = useMemo(() => Array.from(new Set(products.map((product) => String(product.karat ?? '')).filter(Boolean))).sort(), [products]);
  const orderedPages = [...pages].sort((a, b) => a.order - b.order);
  const hasFilters = Boolean(query || category || collection || karat || min || max);
  const allFilteredSelected = filtered.length > 0 && filtered.every((product) => selected.has(product.id));

  const clearFilters = () => { setQuery(''); setCategory(''); setCollection(''); setKarat(''); setMin(''); setMax(''); };
  const toggleProduct = (productId: string) => setSelected((current) => { const next = new Set(current); next.has(productId) ? next.delete(productId) : next.add(productId); return next; });
  const toggleFiltered = () => setSelected(allFilteredSelected ? new Set() : new Set(filtered.map((product) => product.id)));
  const addFiltered = () => {
    const target = orderedPages.find((page) => page.id === targetId);
    if (!target || !props.onReplacePages || !filtered.length) return;
    props.onReplacePages(pages);
    setSelected(new Set());
    setOpen(false);
  };

  const actionLabel = selected.size ? `Seçilenleri Ekle (${selected.size})` : hasFilters ? `Filtrelenenleri Ekle (${filtered.length})` : `Hepsini Ekle (${filtered.length})`;

  return (
    <>
      <CatalogStudioV5 {...props} />
      <button type="button" onClick={() => setOpen(true)} className="fixed right-5 bottom-5 z-[300] h-11 px-4 bg-[#0f203a] text-white shadow-xl flex items-center gap-2 text-[9px] uppercase tracking-[.15em]"><Filter size={14} /> Ürün Seç / Filtrele</button>
      {open && <div className="fixed inset-0 z-[400] bg-black/30 flex items-center justify-center p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <div className="w-[820px] max-w-full max-h-[90vh] bg-white shadow-2xl flex flex-col text-[#0f203a]">
          <header className="h-14 shrink-0 border-b px-5 flex items-center justify-between"><div><div className="text-[9px] uppercase tracking-[.2em] opacity-45">Ürün Seçimi</div><div className="text-sm font-semibold">Filtrele ve doğru ürünleri yerleştir</div></div><button type="button" onClick={() => setOpen(false)} aria-label="Kapat"><X size={17} /></button></header>
          <div className="p-4 border-b space-y-2">
            <div className="grid grid-cols-2 gap-2"><input className="field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ürün adı / SKU / başlık" /><select className="field" value={karat} onChange={(event) => setKarat(event.target.value)}><option value="">Tüm karatlar</option>{karats.map((item) => <option key={item} value={item}>{item}K</option>)}</select></div>
            <div className="grid grid-cols-2 gap-2"><select className="field" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Tüm kategoriler</option>{(props.categories ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select className="field" value={collection} onChange={(event) => setCollection(event.target.value)}><option value="">Tüm koleksiyonlar</option>{(props.collections ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-2"><input className="field" type="number" value={min} onChange={(event) => setMin(event.target.value)} placeholder="Min. fiyat" /><input className="field" type="number" value={max} onChange={(event) => setMax(event.target.value)} placeholder="Max. fiyat" /></div>
            <div className="grid grid-cols-2 gap-2"><select className="field" value={targetId} onChange={(event) => setTargetId(event.target.value)}><option value="">Hedef sayfa</option>{orderedPages.map((page, index) => <option key={page.id} value={page.id}>{String(index + 1).padStart(2, '0')} · {page.title ?? 'Sayfa'}</option>)}</select><button type="button" className="field text-left flex items-center gap-2" onClick={clearFilters}><RotateCcw size={12} /> Filtreleri Temizle</button></div>
          </div>
          <div className="px-4 py-3 border-b flex items-center gap-2"><div className="text-[9px] font-semibold">{filtered.length.toLocaleString('tr-TR')} sonuç</div>{hasFilters && <div className="text-[8px] opacity-45">Filtre aktif</div>}<div className="text-[8px] opacity-45">{selected.size} seçili</div><button type="button" onClick={toggleFiltered} className="ml-auto h-8 px-3 border text-[8px] uppercase">{allFilteredSelected ? 'Seçimi bırak' : 'Filtrelenenleri seç'}</button><button type="button" onClick={addFiltered} disabled={!filtered.length || !targetId} className="h-8 px-4 bg-[#0f203a] text-white text-[8px] uppercase disabled:opacity-30">{actionLabel}</button></div>
          <div className="flex-1 overflow-auto p-4"><div className="grid grid-cols-3 gap-2">{filtered.slice(0, 180).map((product) => <button type="button" key={product.id} onClick={() => toggleProduct(product.id)} className={`text-left border p-2 ${selected.has(product.id) ? 'border-[#0f203a] ring-1 ring-[#0f203a]' : 'border-black/10'}`}><div className="h-24 bg-[#fafafa] mb-2 flex items-center justify-center">{product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-contain" />}</div><div className="text-[8px] font-semibold truncate">{product.name}</div><div className="text-[7px] opacity-45">{product.sku ?? '—'} · {product.karat ?? '—'}K · ₺{Number(product.price ?? 0).toLocaleString('tr-TR')}</div><span className="inline-flex items-center gap-1 mt-1 text-[7px]">{selected.has(product.id) && <Check size={10} />} {selected.has(product.id) ? 'seçili' : 'seç'}</span></button>)}</div>{filtered.length > 180 && <div className="pt-4 text-center text-[8px] opacity-45">İlk 180 ürün gösteriliyor. Filtreleri daraltın.</div>}</div>
        </div>
      </div>}
    </>
  );
}

export default CatalogStudioV7;
