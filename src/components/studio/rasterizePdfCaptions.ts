export interface PdfCaptionImage { data: string; x: number; y: number; width: number; height: number }
// Use the browser's native text renderer. html2canvas's glyph metrics can clip
// fitted captions even when their DOM height and visibility are correct.
export async function rasterizePdfCaptions(page: HTMLElement): Promise<PdfCaptionImage[]> {
  const pageRect = page.getBoundingClientRect();
  const results: PdfCaptionImage[] = [];
  for (const box of Array.from(page.querySelectorAll<HTMLElement>('.catalog-fitted-info'))) {
    const rect = box.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const clone = box.cloneNode(true) as HTMLElement;
    const originals = [box, ...Array.from(box.querySelectorAll<HTMLElement>('*'))];
    const clones = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))];
    originals.forEach((node, index) => {
      const computed = getComputedStyle(node);
      const target = clones[index];
      for (let i = 0; i < computed.length; i++) {
        const property = computed.item(i);
        target.style.setProperty(property, computed.getPropertyValue(property));
      }
    });
    Object.assign(clone.style, { width: `${rect.width}px`, height: `${rect.height}px`, maxHeight: 'none', position: 'relative', margin: '0', transform: 'none' });
    clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    const html = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}"><foreignObject width="100%" height="100%">${html}</foreignObject></svg>`;
    const image = new Image();
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(rect.width * 3); canvas.height = Math.ceil(rect.height * 3);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Ürün yazıları PDF için çizilemedi.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    results.push({data: canvas.toDataURL('image/png'), x: (rect.left-pageRect.left)/pageRect.width, y: (rect.top-pageRect.top)/pageRect.height, width: rect.width/pageRect.width, height: rect.height/pageRect.height});
    canvas.width = canvas.height = 1;
  }
  return results;
}
