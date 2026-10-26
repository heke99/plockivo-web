import type {components} from '../generated/api.ts';
type Item=components['schemas']['StandaloneCatalogItem'];
const headers=['sku','name','unit','price_sek','vat_percent','barcode','quantity_step','package_quantity'];
// Spreadsheet programs can interpret even quoted text as a formula. Prefix hazardous text
// with an apostrophe; intentionally retain that prefix if the file is reimported.
export function spreadsheetText(value:string){return /^[\s\p{Cc}\p{Cf}]*[=+\-@]/u.test(value)?"'"+value:value}
function quote(value:string){return '"'+value.replaceAll('"','""')+'"'}
function hundredths(value:bigint){const fraction=(value%100n).toString().padStart(2,'0');return (value/100n).toString()+','+fraction}
function quantity(value:string){if(!/^(0|[1-9]\d{0,5})(\.\d{1,6})?$/.test(value)||!/[1-9]/.test(value))throw Error('En artikel har en ogiltig mängd.');return value}
export function catalogPageCsv(items:readonly Item[]){
 const lines=items.map(item=>{
  if(!/^(0|[1-9]\d{0,11})$/.test(item.unit_price_minor))throw Error('En artikel har ett ogiltigt pris.');
  if(!Number.isInteger(item.vat_bps)||item.vat_bps<0||item.vat_bps>10000)throw Error('En artikel har en ogiltig momssats.');
  const vat=hundredths(BigInt(item.vat_bps)).replace(/,00$/,'').replace(/(,\d)0$/,'$1');
  return [spreadsheetText(item.sku),spreadsheetText(item.name),spreadsheetText(item.unit),hundredths(BigInt(item.unit_price_minor)),vat,spreadsheetText(item.barcode??''),quantity(item.quantity_step),quantity(item.package_quantity)].map(quote).join(';');
 });
 return '\uFEFF'+[headers.join(';'),...lines].join('\r\n')+'\r\n';
}
