import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogPageCsv,spreadsheetText} from '../src/lib/catalog-export.ts';
import {readCatalogCsv} from '../src/lib/catalog-import.ts';
const base={tenant_id:'tenant',id:'item',version:1,sku:'SKU-1',name:'Skruv',unit:'st',unit_price_minor:'12345',vat_bps:2500,barcode:null,quantity_step:'0.125',package_quantity:'2.5',active:true,self_scan:false};
test('CSV exports only provided page with exact money, supported tax and quantities',()=>{
 const csv=catalogPageCsv([base,{...base,id:'other',sku:'SKU-2',unit_price_minor:'999999999999'}]);
 assert(csv.startsWith('\uFEFFsku;name;unit;price_sek;vat_percent;barcode;quantity_step;package_quantity\r\n'));
 const rows=readCatalogCsv(csv);assert.equal(rows.length,2);assert.deepEqual(rows.map(r=>r.errors),[[],[]]);assert.equal(rows[0].item.unit_price_minor,'12345');assert.equal(rows[1].item.unit_price_minor,'999999999999');assert.equal(rows[0].item.quantity_step,'0.125');assert.equal(rows[0].item.package_quantity,'2.5');
 assert(!csv.includes('tenant'));assert(!csv.includes('self_scan'));assert.equal(readCatalogCsv(catalogPageCsv([{...base,unit_price_minor:'0',vat_bps:0}]))[0].item.unit_price_minor,'0');
});
test('CSV preserves semicolons, quotes, newlines and UTF-8 text',()=>{const name='Skruv; "rostfri"\nÅÄÖ';const row=readCatalogCsv(catalogPageCsv([{...base,name}]))[0];assert.equal(row.item.name,name)});
test('formula-looking text is neutralized even after whitespace and controls',()=>{
 for(const prefix of ['',' ','\t','\r\n','\u0001','\u0085','\uFEFF','\u200B'])for(const sign of ['=','+','-','@']){const value=prefix+sign+'SUM(1)';assert.equal(spreadsheetText(value),"'"+value)}
 for(const value of ['SKU-1','Ordinary text','1+2',"'=SUM(1)"])assert.equal(spreadsheetText(value),value);
 const csv=catalogPageCsv([{...base,sku:'=1',name:'\t+1',unit:'-1',barcode:'@SUM(1)'}]);const row=readCatalogCsv(csv)[0];assert.deepEqual(row.errors,[]);assert.equal(row.item.sku,"'=1");assert.equal(row.item.name,"'\t+1");assert.equal(row.item.unit,"'-1");assert.equal(row.item.barcode,"'@SUM(1)");
});
test('nonstandard tax is preserved exactly and clearly rejected by existing import rules',()=>{const csv=catalogPageCsv([{...base,vat_bps:1234}]);assert(csv.includes('"12,34"'));assert(readCatalogCsv(csv)[0].errors.some(e=>e.includes('Moms')))});
test('invalid numeric fields cannot produce spreadsheet formulas or silent rounding',()=>{
 for(const patch of [{unit_price_minor:'=1'},{unit_price_minor:'1.2'},{unit_price_minor:'1000000000000'},{vat_bps:1.5},{vat_bps:10001},{quantity_step:'-1'},{package_quantity:'\t=1'},{quantity_step:'0'}])assert.throws(()=>catalogPageCsv([{...base,...patch}]));
});
