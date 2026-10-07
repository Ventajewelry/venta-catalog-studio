// html2canvas paints glyph baselines slightly below Chrome's text boxes.
// Remove per-line ellipsis clipping, then refit the complete caption inside the card.
export function preservePdfCaptionText(doc: Document) {
  doc.querySelectorAll<HTMLElement>('.catalog-fitted-info').forEach(box => {
    const content = box.firstElementChild as HTMLElement | null;
    const card = box.parentElement;
    if (!content || !card) return;
    content.querySelectorAll<HTMLElement>('.whitespace-nowrap, td, th').forEach(line => {
      line.style.overflow = 'visible';
      line.style.textOverflow = 'clip';
      line.style.lineHeight = '1.5';
      line.style.paddingBottom = '.25em';
    });
    // Recompute instead of retaining the old height after changing line metrics.
    content.style.transform = 'none';
    const naturalHeight = content.scrollHeight;
    const width = box.clientWidth;
    if (!naturalHeight || !width || !card.clientHeight) return;
    const scale = Math.min(1, card.clientHeight * .45 / naturalHeight, width / Math.max(width, content.scrollWidth));
    content.style.transform = `scale(${scale})`;
    content.style.transformOrigin = 'top left';
    box.style.height = `${Math.ceil(naturalHeight * scale)}px`;
    box.style.maxHeight = '45%';
  });
}
