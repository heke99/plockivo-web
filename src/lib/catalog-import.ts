import {kronorToMinor} from './standalone-money.ts';
export type ImportItem={sku:string;name:string;unit:string;unit_price_minor:string;vat_bps:number;barcode:string|null;quantity_step:string;package_quantity:string;active:boolean;self_scan:boolean};
export type ImportRow={row:number;item:ImportItem|null;errors:string[]};
export const catalogCsvExample='sku;name;unit;price_sek;vat_percent;barcode;quantity_step;package_quantity\nSKU-001;Montageskruv;fp;129,90;25;735000000001;1;1\n';
const columns=['sku','name','unit','price_sek','vat_percent','barcode','quantity_step','package_quantity'];
// Strict semicolon CSV: quotes, escaped quotes and embedded newlines supported.
function parse(text:string){
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else{quoted=false;closed=true}}else cell+=c;continue}
  if(c==='"'){if(cell||closed)throw Error('Felaktiga citattecken i CSV-filen.');quoted=true;continue}
  if(c===';'||c==='\n'||c==='\r'){row.push(cell);cell='';closed=false;if(c!==';'){if(c==='\r'&&text[i+1]==='\n')i++;rows.push(row);row=[]}continue}
  if(closed)throw Error('Oväntad text efter avslutat citat.');cell+=c;
 }
 if(quoted)throw Error('Ett citat i CSV-filen är inte avslutat.');
 if(cell||row.length||closed){row.push(cell);rows.push(row)}
 return rows;
}
function quantity(s:string){return /^(0|[1-9]\d{0,5})(\.\d{1,6})?$/.test(s)&&/[1-9]/.test(s)}
export function readCatalogCsv(text:string):ImportRow[]{
 if(new TextEncoder().encode(text).length>262144)throw Error('Filen får vara högst 256 kB.');
 const data=parse(text.replace(/^\uFEFF/,''));const header=data.shift();
 if(!header||header.length!==columns.length||header.some((c,i)=>c.trim()!==columns[i]))throw Error('Kolumnrubrikerna måste följa CSV-exemplet i samma ordning.');
 const rows=data.map((cells,i)=>({cells,row:i+2})).filter(r=>r.cells.some(c=>c.trim()));
 if(!rows.length)throw Error('Filen innehåller inga artiklar.');if(rows.length>200)throw Error('Läs in högst 200 artiklar åt gången.');
 const skuCounts=new Map<string,number>(),barcodeCounts=new Map<string,number>();
 for(const {cells}of rows){const sku=cells[0]?.trim(),barcode=cells[5]?.trim();if(sku)skuCounts.set(sku,(skuCounts.get(sku)??0)+1);if(barcode)barcodeCounts.set(barcode,(barcodeCounts.get(barcode)??0)+1)}
 return rows.map(({cells,row})=>{
  const errors:string[]=[];if(cells.length!==columns.length)errors.push('Fel antal kolumner.');
  const [sku='',name='',unit='',price='',vat='',barcode='',step='',pack='']=cells.map(c=>c.trim());
  if(!sku||sku.length>80)errors.push('Artikelnummer krävs, högst 80 tecken.');
  if(!name||name.length>200)errors.push('Artikelnamn krävs, högst 200 tecken.');
  if(!unit||unit.length>30)errors.push('Enhet krävs, högst 30 tecken.');
  const minor=kronorToMinor(price);if(minor===null)errors.push('Ogiltigt pris; använd kronor med högst två decimaler.');
  if(!['0','6','12','25'].includes(vat))errors.push('Moms måste vara 0, 6, 12 eller 25.');
  if(barcode.length>100)errors.push('Streckkod får vara högst 100 tecken.');
  if(!quantity(step)||!quantity(pack))errors.push('Mängder måste vara positiva tal med punkt och högst sex decimaler.');
  if((skuCounts.get(sku)??0)>1)errors.push('Artikelnumret förekommer flera gånger i filen.');
  if(barcode&&(barcodeCounts.get(barcode)??0)>1)errors.push('Streckkoden förekommer flera gånger i filen.');
  return {row,errors,item:errors.length?null:{sku,name,unit,unit_price_minor:minor!,vat_bps:Number(vat)*100,barcode:barcode||null,quantity_step:step,package_quantity:pack,active:true,self_scan:false}};
 });
}
