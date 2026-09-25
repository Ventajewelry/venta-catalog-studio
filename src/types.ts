export type LayoutId=
  |'LAYOUT_A_FULL_BLEED'|'LAYOUT_B_HERO_PRODUCT'|'LAYOUT_C_PRODUCT_GRID'|'LAYOUT_D_ASYMMETRIC'
  |'LAYOUT_E_HERO_DETAILS'|'LAYOUT_F_TWO_UP'|'LAYOUT_G_THREE_UP'|'LAYOUT_H_TYPOGRAPHIC'
  |'LAYOUT_I_IMAGE_TEXT'|'LAYOUT_J_PRODUCT_FEATURE'|'LAYOUT_K_LOOK_PAGE'|'LAYOUT_L_COLLECTION_INDEX'
  |'LAYOUT_M_PRODUCT_GRID_12'|'LAYOUT_N_PRODUCT_GRID_16'|'LAYOUT_O_EDITORIAL_COLLAGE'
  |'LAYOUT_P_IMAGE_4_PRODUCTS'|'LAYOUT_Q_SPLIT_EDITORIAL'|'LAYOUT_R_PRODUCT_WALL'
  |'LAYOUT_S_MAGAZINE'|'LAYOUT_T_PRODUCT_INDEX'|'COVER'|'BACK_COVER';
export type PageBlockType='image'|'product'|'text'|'frame';
export interface ProductInfoSettings{showName:boolean;showSku:boolean;showPrice:boolean;showMaterial:boolean;showCategory:boolean;showDescription:boolean;position:'below'|'overlay'|'left'|'right';align:'left'|'center'|'right';fontFamily?:string;fontSize?:number;color?:string;pricePrefix?:string;lineGap?:number;discountPercent?:number;}
export interface PageBlock{
  id:string; type:PageBlockType; url?:string; productId?:string; linkUrl?:string; showQr?:boolean; alt?:string;
  x?:number;y?:number;width?:number;height?:number;zIndex?:number;objectFit?:'cover'|'contain';
  imageScale?:number; imagePositionX?:number; imagePositionY?:number;
  fontFamily?:string;fontSize?:number;fontWeight?:number;fontStyle?:'normal'|'italic';textAlign?:'left'|'center'|'right';
  textColor?:string; frameKind?:'image'|'product'; borderWidth?:number;borderRadius?:number;borderColor?:string;productInfo?:ProductInfoSettings;
  locked?:boolean;fitMode?:'cover'|'contain';
}
export interface CatalogSettings{
  pageWidth:number;pageHeight:number;unit:'mm'|'px'|'in';showHeader:boolean;headerText:string;showPageNumbers:boolean;
  pageNumberPosition:'top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right';
  showFooter:boolean;footerText:string;footerPageNumbers:boolean;footerPosition:'left'|'center'|'right';
  marginTop:number;marginRight:number;marginBottom:number;marginLeft:number;showBorder:boolean;backgroundColor:string;
  gridSize?:number;gridVisible?:boolean;gridSnap?:boolean;headerPosition?:'left'|'center'|'right';productInfoDefaults?:ProductInfoSettings;
}
export interface Catalog{id:string;name:string;description:string;coverImage:string;logoUrl?:string;createdAt:string;updatedAt:string;
  status:'draft'|'published';theme:{primaryColor:string;secondaryColor:string;serifFont:string;sansFont:string};settings?:CatalogSettings}
export interface Product{id:string;name:string;description:string;price:number;sku:string;material:string;images:string[];karat?:number;category:string;categoryId?:string;categoryFullName?:string;
  collectionId:string;collectionIds?:string[];collectionNames?:string[];handle?:string;url?:string|null;tags?:string[];productType?:string;variants?:any[]}
export interface Collection{id:string;name:string;season:string;description:string;heroImage:string}
export interface Page{
  id:string;catalogId:string;order:number;layoutId:LayoutId;title:string;
  content:{images?:string[];productIds?:string[];blocks?:PageBlock[];headline?:string;subheadline?:string;body?:string;quote?:string;hotspots?:Hotspot[]};
  style?:{backgroundColor?:string;backgroundImage?:string;textColor?:string;customMargins?:string;overlayOpacity?:number;fontFamily?:string;fontSize?:number;lineHeight?:number;
    showHeader?:boolean;headerText?:string;showFooter?:boolean;footerText?:string;showPageNumber?:boolean;pageNumberPosition?:CatalogSettings['pageNumberPosition'];
    gridSize?:number;gridVisible?:boolean;gridSnap?:boolean;gridLocked?:boolean;}
}
export interface Hotspot{productId:string;x:number;y:number}
