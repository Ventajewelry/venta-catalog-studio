export interface PdfCaptionImage { data: string; x: number; y: number; width: number; height: number }
// Draw the actual DOM text positions directly. SVG foreignObject and html2canvas
// both re-layout fitted captions, which can lose the final (price) row.
export async function rasterizePdfCaptions(page: HTMLElement): Promise<PdfCaptionImage[]> {
  const pageRect = page.getBoundingClientRect();
  const results: PdfCaptionImage[] = [];
  for (const box of Array.from(page.querySelectorAll<HTMLElement>('.catalog-fitted-info'))) {
    const rect = box.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    const runs: {text:string;rect:DOMRect;font:string;color:string;size:number}[] = [];
    const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    let bottom = rect.bottom;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim()) continue;
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const parentRect = parent.getBoundingClientRect();
      const scale = parent.offsetWidth ? parentRect.width / parent.offsetWidth : 1;
      const size = parseFloat(style.fontSize) * scale;
      const font = `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;
      // Range positions already include every ancestor transform and wrapping.
      let offset = 0;
      for (const char of node.textContent) {
        const range = document.createRange();
        range.setStart(node, offset); offset += char.length; range.setEnd(node, offset);
        const bounds = range.getBoundingClientRect();
        if (!char.trim() || !bounds.width || !bounds.height) continue;
        bottom = Math.max(bottom, bounds.bottom);
        runs.push({text:char,rect:bounds,font,color:style.color,size});
      }
    }
    if (!runs.length) continue;
    const height = Math.max(rect.height, bottom - rect.top);
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(rect.width * 3); canvas.height = Math.ceil(height * 3);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Ürün yazıları PDF için çizilemedi.');
    context.scale(3,3);
    context.textBaseline = 'alphabetic';
    for (const run of runs) {
      context.font = run.font; context.fillStyle = run.color;
      const metrics = context.measureText(run.text);
      const ascent = metrics.fontBoundingBoxAscent ?? run.size * .8;
      const descent = metrics.fontBoundingBoxDescent ?? run.size * .2;
      const baseline = run.rect.top - rect.top + (run.rect.height - ascent - descent) / 2 + ascent;
      context.fillText(run.text, run.rect.left - rect.left, baseline);
    }
    results.push({data:canvas.toDataURL('image/png'),x:(rect.left-pageRect.left)/pageRect.width,y:(rect.top-pageRect.top)/pageRect.height,width:rect.width/pageRect.width,height:height/pageRect.height});
    canvas.width = canvas.height = 1;
  }
  return results;
}
