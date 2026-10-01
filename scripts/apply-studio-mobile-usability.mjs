import fs from 'node:fs';
const file = 'src/components/studio/CatalogStudioV5.tsx';
let s = fs.readFileSync(file, 'utf8');
if (!s.includes("from './MobilePageSettings'")) {
  s = "import { MobilePageSettings } from './MobilePageSettings';\nimport { downloadCatalogPdf } from './downloadCatalogPdf';\nimport { measureCatalogPage } from './catalogPageScale';\n" + s;
  s = s.replace('type Props={', "type Props={mobileStudioRequest?:{panel:'layout'|'page'|'element';nonce:number};onMobileElementSelect?:()=>void;");
  s = s.replace('export function CatalogStudioV5({catalog,', 'export function CatalogStudioV5({mobileStudioRequest,onMobileElementSelect,catalog,');
  s = s.replace('const[pageId,setPageId]=React.useState', 'const[exportingAll,setExportingAll]=React.useState(false);const[pdfMessage,setPdfMessage]=React.useState(\'\');const[pageId,setPageId]=React.useState');
  s = s.replace("const[blockId,setBlockId]=React.useState<string|null>(null);", "React.useEffect(()=>{if(stackedMobile&&mobileStudioRequest?.nonce)setPanel(mobileStudioRequest.panel)},[mobileStudioRequest,stackedMobile]);const[blockId,setBlockId]=React.useState<string|null>(null);");
  const from = s.indexOf('const exportPdf='); const to = s.indexOf('return <div', from);
  if (from < 0 || to < 0) throw new Error('PDF action not found');
  s = s.slice(0,from) + `const exportPdf=async()=>{if(exportingAll)return;setPdfMessage('PDF hazırlanıyor…');setExportingAll(true);try{await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));const area=document.querySelector<HTMLElement>('.catalog-page-scroll');if(!area)throw new Error('Katalog alanı bulunamadı');const count=await downloadCatalogPdf(catalog.name,settings.pageWidth,settings.pageHeight,area);setPdfMessage(count+' sayfalık PDF indirildi')}catch(error){setPdfMessage('PDF indirilemedi: '+(error instanceof Error?error.message:'Tekrar deneyin'))}finally{setExportingAll(false)}};
const mobileSwap=(sourcePage:string,sourceBlock:string,targetPage:string,targetBlock:string)=>{if(sourcePage===targetPage&&sourceBlock===targetBlock)return;const first=sorted.find(p=>p.id===sourcePage)?.content.blocks?.find(b=>b.id===sourceBlock),second=sorted.find(p=>p.id===targetPage)?.content.blocks?.find(b=>b.id===targetBlock);if(!first?.productId||second?.frameKind!=='product')return;save(sorted.map(pg=>{if(pg.id!==sourcePage&&pg.id!==targetPage)return pg;const blocks=(pg.content.blocks||[]).map(b=>pg.id===sourcePage&&b.id===sourceBlock?{...b,productId:second.productId}:pg.id===targetPage&&b.id===targetBlock?{...b,productId:first.productId}:b);return {...pg,content:{...pg.content,blocks,productIds:blocks.filter(b=>b.frameKind==='product'&&b.productId).map(b=>b.productId!)}}}));};const touchMove=React.useRef<{page:string;block:string}|null>(null);
` + s.slice(to);
  s = s.replace('<button onClick={exportPdf}', '<button disabled={exportingAll} onClick={exportPdf}');
  s = s.replace('>PDF indir</button>', ">{exportingAll?'PDF hazırlanıyor…':'PDF indir'}</button>");
  s = s.replace('</header>{mergeSelection()', '</header>{pdfMessage&&<div role="status" className="px-4 py-2 text-xs bg-white border-b">{pdfMessage}</div>}{mergeSelection()');
  s = s.replace('style={stackedMobile?{display:"block"}:undefined}', 'data-exporting={exportingAll?"true":undefined} style={exportingAll?{display:"block",position:"fixed",left:-10000,top:0,width:760,height:"auto",overflow:"visible",padding:0}:stackedMobile?{display:"block"}:undefined}');
  s = s.replace('if(!stackedMobile)return;const root=', 'if(!stackedMobile||exportingAll)return;const root=');
  s = s.replace('(stackedMobile?sorted:page?[page]:[])', '(stackedMobile||exportingAll?sorted:page?[page]:[])');
  s = s.replace('<div key={page.id} data-catalog-page=', '<div ref={measureCatalogPage} key={page.id} data-catalog-page=');
  s = s.replace('backgroundColor:settings.backgroundColor||', 'backgroundColor:page.style?.backgroundColor||settings.backgroundColor||');
  // Per-field typography is shared between mobile, desktop and PDF.
  s = s.replace("part:'name'|'sku'|'price'", "part:'name'|'sku'|'price'|'color'|'clarity'|'certificate'|'stone'|'properties'");
  s = s.replace('price:productInfo.priceStyle}', 'price:productInfo.priceStyle,color:(productInfo as any).colorStyle,clarity:(productInfo as any).clarityStyle,certificate:(productInfo as any).certificateStyle,stone:(productInfo as any).stoneStyle,properties:(productInfo as any).propertiesStyle}');
  s = s.replace('fontSize:style.fontSize??productInfo.fontSize??10,', "fontSize:`calc(${style.fontSize??productInfo.fontSize??10}px * var(--catalog-page-scale,1))`,fontFamily:style.fontFamily??productInfo.fontFamily??'Arial, sans-serif',");
  for (const [field, part] of [['showColor','color'],['showClarity','clarity'],['showStone','stone'],['showProperties','properties']]) {
    const regex = new RegExp('('+field+'&&<div[^>]*style=\\{)styleFor\\(\\\'sku\\\'\\)(\\})','g'); s=s.replace(regex, '$1styleFor(\''+part+'\')$2');
  }
  s=s.replace("<StonePropertiesTable product={p} style={styleFor('sku')}/>", "<StonePropertiesTable product={p} style={styleFor('certificate')}/>");
  s=s.replace("fontSize:`${Math.max(8,b.fontSize||20)}px`", "fontSize:`calc(${Math.max(8,b.fontSize||20)}px * var(--catalog-page-scale,1))`");
  for (const part of ['header','footer']) {
    s=s.replace('fontSize:page.style?.'+part+'FontSize??settings.'+part+'FontSize??8,', 'fontSize:`calc(${page.style?.'+part+'FontSize??settings.'+part+'FontSize??8}px * var(--catalog-page-scale,1))`,');
    s=s.replace("fontFamily:'Majesty, serif',textAlign:settings."+part+'Position', "fontFamily:(page.style as any)?."+part+"FontFamily||(settings as any)."+part+"FontFamily||'Majesty, serif',textAlign:(page.style as any)?."+part+'Position||settings.'+part+'Position');
  }
  s=s.replace("style={{top:settings.pageNumberPosition", "style={{fontSize:`calc(${(page.style as any)?.pageNumberStyle?.fontSize||(settings as any).pageNumberStyle?.fontSize||9}px * var(--catalog-page-scale,1))`,fontWeight:(page.style as any)?.pageNumberStyle?.fontWeight||(settings as any).pageNumberStyle?.fontWeight||400,color:(page.style as any)?.pageNumberStyle?.color||(settings as any).pageNumberStyle?.color||'#0f203a',fontFamily:(page.style as any)?.pageNumberStyle?.fontFamily||(settings as any).pageNumberStyle?.fontFamily||'Arial, sans-serif',top:settings.pageNumberPosition");
  s=s.replaceAll('settings.pageNumberPosition.startsWith', '((page.style as any)?.pageNumberPosition||settings.pageNumberPosition).startsWith');
  s=s.replaceAll('settings.pageNumberPosition.endsWith', '((page.style as any)?.pageNumberPosition||settings.pageNumberPosition).endsWith');
  // Direct element access, with a dedicated touch handle that leaves vertical scrolling usable.
  s=s.replace('<button key={b.id} draggable=', '<button key={b.id} data-mobile-product-block={b.frameKind===\'product\'?b.id:undefined} data-mobile-product-page={page.id} draggable=');
  s=s.replaceAll("setBlockId(b.id);setPanel('element')", "setBlockId(b.id);setPanel('element');if(stackedMobile)onMobileElementSelect?.()");
  s=s.replace("{b.type==='text'?", "{stackedMobile&&!exportingAll&&b.frameKind==='product'&&p&&<span role=\"button\" aria-label=\"Ürünü taşı\" className=\"catalog-touch-move\" onClick={e=>e.stopPropagation()} onPointerDown={e=>{e.stopPropagation();e.preventDefault();touchMove.current={page:page.id,block:b.id};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.closest('[data-mobile-product-block]')?.classList.add('catalog-product-moving')}} onPointerMove={e=>{if(!touchMove.current)return;document.querySelectorAll('.catalog-drop-target').forEach(node=>node.classList.remove('catalog-drop-target'));document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-mobile-product-block]')?.classList.add('catalog-drop-target')}} onPointerCancel={()=>{touchMove.current=null;document.querySelectorAll('.catalog-product-moving,.catalog-drop-target').forEach(node=>node.classList.remove('catalog-product-moving','catalog-drop-target'))}} onPointerUp={e=>{e.stopPropagation();const source=touchMove.current,target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-mobile-product-block]');if(source&&target)mobileSwap(source.page,source.block,target.dataset.mobileProductPage!,target.dataset.mobileProductBlock!);touchMove.current=null;document.querySelectorAll('.catalog-product-moving,.catalog-drop-target').forEach(node=>node.classList.remove('catalog-product-moving','catalog-drop-target'))}}>↔</span>}{b.type==='text'?");
  const old='<PageSettingsPanel page={page} settings={settings} onSettings={updateSettings} onPageStyle={updatePageStyle} onUpdateInfo={updateProductInfo}/>';
  s=s.replace(old, '<>{stackedMobile?<><MobilePageSettings page={page} settings={settings} onSettings={updateSettings} onPageStyle={updatePageStyle} onUpdateInfo={updateProductInfo}/><details className="p-4"><summary className="text-sm">Diğer sayfa ve çerçeve ayarları</summary>'+old+'</details></>:'+old+'}</>');
  s=s.replace("{panel==='element'&&page&&blockId&&", "{panel==='element'&&!blockId&&<div className=\"p-4 text-sm\">Katalogdaki bir ürün kartına dokunarak seçin.</div>}{panel==='element'&&page&&blockId&&");
  fs.writeFileSync(file,s);
}
