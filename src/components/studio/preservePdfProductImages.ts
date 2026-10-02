export function containedImageSize(width: number, height: number, naturalWidth: number, naturalHeight: number) {
  const scale=Math.min(width/naturalWidth,height/naturalHeight);
  return {width:naturalWidth*scale,height:naturalHeight*scale};
}

// html2canvas does not implement object-fit. Give the cloned image explicit,
// proportional dimensions while preserving its original transformed viewport.
export function preservePdfProductImages(doc: Document) {
  doc.querySelectorAll<HTMLImageElement>('.catalog-product-image').forEach(image=>{
    if(!image.naturalWidth||!image.naturalHeight)return;
    const style=doc.defaultView!.getComputedStyle(image);
    const width=parseFloat(style.width),height=parseFloat(style.height);
    if(!(width>0&&height>0))return;
    const fitted=containedImageSize(width,height,image.naturalWidth,image.naturalHeight);
    const viewport=doc.createElement('div');
    viewport.className=image.className;
    viewport.style.cssText=image.style.cssText;
    Object.assign(viewport.style,{width:`${width}px`,height:`${height}px`});
    image.replaceWith(viewport);
    viewport.append(image);
    image.className='';
    image.style.cssText='';
    Object.assign(image.style,{position:'absolute',width:`${fitted.width}px`,height:`${fitted.height}px`,left:`${(width-fitted.width)/2}px`,top:`${(height-fitted.height)/2}px`,maxWidth:'none',maxHeight:'none',transform:'none'});
  });
}
