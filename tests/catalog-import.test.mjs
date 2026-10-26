import {test} from 'node:test';import assert from 'node:assert/strict';
import {readCatalogCsv,catalogCsvExample} from '../src/lib/catalog-import.ts';
const header=catalogCsvExample.split('\n')[0]+'\n';
test('CSV exact price, BOM, CRLF, leading-zero barcode, quoting and no auto-scan',()=>{
 const r=readCatalogCsv('\uFEFF'+header+'A;"Skruv; extra ""stark""";st;0,01;25;001234;0.25;1\r\n')[0];assert.deepEqual(r.errors,[]);assert.equal(r.item.name,'Skruv; extra "stark"');assert.equal(r.item.unit_price_minor,'1');assert.equal(r.item.barcode,'001234');assert.equal(r.item.self_scan,false);
 assert.equal(readCatalogCsv(header+'A;"Rad\nnamn";st;1;6;;1;1')[0].item.name,'Rad\nnamn');
});
test('duplicates mark every affected row; invalid money and quantities cannot stage',()=>{
 const r=readCatalogCsv(header+'A;One;st;1;25;123;1;1\nA;Two;st;1;25;123;1;1');assert(r.every(x=>x.item===null&&x.errors.length===2));
 for(const row of ['B;N;st;1e3;25;;1;1','B;N;st;1;13;;1;1','B;N;st;1;25;;0;1','B;N;st;1;25;;1,5;1'])assert.equal(readCatalogCsv(header+row)[0].item,null);
});
test('invalid structure and oversized files fail explicitly',()=>{for(const input of ['',header,header+'A;"broken',header+'"A"x;N;st;1;25;;1;1','x'.repeat(2097153),header+Array.from({length:2001},(_,i)=>`${i};N;st;1;25;;1;1`).join('\n')])assert.throws(()=>readCatalogCsv(input))});

test('all 2000 valid rows are retained for sequential import',()=>{const rows=readCatalogCsv(header+Array.from({length:2000},(_,i)=>`${i};N;st;1;25;;1;1`).join('\n'));assert.equal(rows.length,2000);assert(rows.every(row=>row.item))});
