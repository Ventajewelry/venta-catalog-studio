export async function downloadCatalogPdf(name: string, widthMm: number, heightMm: number, container: HTMLElement) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const pdf = new jsPDF({ unit: 'mm', format: [widthMm, heightMm], orientation: widthMm > heightMm ? 'landscape' : 'portrait', compress: true });
  const pages = Array.from(container.querySelectorAll<HTMLElement>('[data-catalog-page]'));
  if (!pages.length) throw new Error('PDF için sayfa bulunamadı.');
  await document.fonts.ready;
  const colorCanvas = document.createElement('canvas'); colorCanvas.width = colorCanvas.height = 1;
  const colorContext = colorCanvas.getContext('2d')!;
  const rgb = (value: string) => { colorContext.clearRect(0, 0, 1, 1); colorContext.fillStyle = value; colorContext.fillRect(0, 0, 1, 1); const c = colorContext.getImageData(0, 0, 1, 1).data; return `rgba(${c[0]},${c[1]},${c[2]},${c[3] / 255})`; };
  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    await Promise.all(Array.from(page.querySelectorAll('img')).map(img => img.decode().catch(() => undefined)));
    const logoImages = new Map<string,string>();
    for(const logo of Array.from(page.querySelectorAll<HTMLImageElement>('[data-catalog-logo] img'))){if(!logo.naturalWidth)continue;const raster=document.createElement('canvas');raster.width=Math.max(1,logo.naturalWidth*4);raster.height=Math.max(1,logo.naturalHeight*4);try{raster.getContext('2d')!.drawImage(logo,0,0,raster.width,raster.height);logoImages.set(logo.src,raster.toDataURL('image/png'));}catch{/* Cross-origin custom logos are handled by html2canvas's CORS loader. */}}
    const canvas = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: '#ffffff', imageTimeout: 20000, logging: false,
      onclone: async doc => { const logos=Array.from(doc.querySelectorAll<HTMLImageElement>('[data-catalog-logo] img'));for(const logo of logos){const raster=logoImages.get(logo.src);if(raster)logo.src=raster;}await Promise.all(logos.map(logo=>logo.decode().catch(()=>undefined)));  doc.querySelectorAll<HTMLElement>('[data-catalog-page]').forEach(el => el.style.setProperty('--catalog-page-scale', '1')); doc.querySelectorAll<HTMLElement>('[data-catalog-page], [data-catalog-page] *').forEach(el => { const style = doc.defaultView!.getComputedStyle(el); if (el.classList.contains('whitespace-nowrap')) { el.style.lineHeight = '1.5'; el.style.paddingBottom = '.6em'; el.style.overflow = 'visible'; } if (el.tagName === 'TD' || el.tagName === 'TH') { el.style.lineHeight = '1.5'; el.style.paddingBottom = '.7em'; } for (const property of ['color','background-color','border-top-color','border-right-color','border-bottom-color','border-left-color']) { const value = style.getPropertyValue(property); if (/oklch|oklab|color-mix|color\(/.test(value)) el.style.setProperty(property, rgb(value)); } }); doc.querySelectorAll<HTMLElement>('[data-mobile-product-block]').forEach(card => { const info = card.querySelector<HTMLElement>('.leading-tight'), image = card.querySelector<HTMLImageElement>('img'); if (info && image) { info.style.flexShrink = '0'; const fitted = card.querySelector<HTMLElement>('.catalog-fitted-info'); if(fitted){const ratio=Math.min(1,card.clientHeight*.45/Math.max(1,info.scrollHeight),fitted.clientWidth/Math.max(fitted.clientWidth,info.scrollWidth));info.style.transform=`scale(${ratio})`;fitted.style.height=`${Math.ceil(info.scrollHeight*ratio)}px`;image.style.maxHeight=`${Math.max(1,card.clientHeight-info.scrollHeight*ratio-10)}px`;}else{image.style.maxHeight = `${Math.max(1, card.clientHeight - info.scrollHeight - 10)}px`;} } }); }
    });
    if (index) pdf.addPage([widthMm, heightMm], widthMm > heightMm ? 'landscape' : 'portrait');
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, widthMm, heightMm);
    canvas.width = canvas.height = 1;
  }
  pdf.save(`${name.replace(/[<>:"/\\|?*]/g, '').trim() || 'katalog'}.pdf`);
  return pages.length;
}
