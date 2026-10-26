import {test} from 'node:test';import assert from 'node:assert/strict';
import {catalogJournal,readCatalogJournal,catalogJournalMaxBytes} from '../src/lib/catalog-journal.ts';
import {runCatalogBatch,catalogBatchResults} from '../src/lib/catalog-batch-client.ts';
const tenant='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
const item={tenant_id:tenant,id:null,version:0,sku:'A',name:'One',unit:'st',unit_price_minor:'100',vat_bps:2500,barcode:null,quantity_step:'1.000000',package_quantity:'2',active:true,self_scan:false};
function batch(){return {running:false,entries:[{row:2,body:{...item},key:'original-key-0001',status:'confirmed',error:null},{row:3,body:{...item,sku:'B',unit_price_minor:'123456789012'},key:'original-key-0002',status:'uncertain',error:'timeout'},{row:4,body:{...item,sku:'C'},key:'original-key-0003',status:'pending',error:null}]}}
function json(){return JSON.parse(JSON.stringify(catalogJournal(batch())))}
test('versioned journal recovers full original payload and keys across clients, skips confirmed and sends nothing on parse',async()=>{
 const original=batch(),loaded=readCatalogJournal(JSON.stringify(catalogBatchResults(original)),tenant);assert.deepEqual(loaded,original);
 const calls=[];assert.equal(calls.length,0);
 assert.equal(await runCatalogBatch(loaded,{send:async(body,key)=>{calls.push({body:structuredClone(body),key})},shouldStop:()=>false,onProgress:()=>{}}),'complete');
 assert.deepEqual(calls,original.entries.slice(1).map(e=>({body:e.body,key:e.key})));
 assert.equal(loaded.entries.every(e=>e.status==='confirmed'),true);
});
test('tenant mismatch including altered row tenant rejects entire journal before effects',()=>{
 assert.throws(()=>readCatalogJournal(JSON.stringify(json()),other),/annan handlare/);
 const changed=json();changed.entries[1].body.tenant_id=other;assert.throws(()=>readCatalogJournal(JSON.stringify(changed),tenant),/ogiltig/);
 assert.throws(()=>readCatalogJournal(JSON.stringify(json()),'not-a-tenant'),/giltig aktuell/);
});
test('id/version injection, unsupported versions, unknown fields, duplicate keys and invalid fields are refused atomically',()=>{
 for(const modify of [j=>j.version=2,j=>j.entries[0].body.id=other,j=>j.entries[0].body.version=1,j=>j.token='bearer',j=>j.entries[1].key=j.entries[0].key,j=>j.entries[0].key='invalid key 00001',j=>j.entries[0].key='invalid-key-0001\r\nHeader:value',j=>j.entries[0].key='short',j=>j.entries[0].key='x'.repeat(129),j=>j.entries[0].body.unit_price_minor='1e5',j=>j.entries[0].body.active='true',j=>j.entries[0].status='saved',j=>j.entries[0].body.self_scan=null,j=>j.entries[0].body.quantity_step='0',j=>j.entries[0].body.name='',j=>j.entries[0].row=3]){
  const value=json();modify(value);assert.throws(()=>readCatalogJournal(JSON.stringify(value),tenant),/ogiltig/);
 }
});
test('oversized, malformed and legacy reports cannot become runnable batches',()=>{
 assert.throws(()=>readCatalogJournal('x'.repeat(catalogJournalMaxBytes+1),tenant),/4 MiB/);
 assert.throws(()=>readCatalogJournal('{',tenant),/giltig JSON/);
 for(const entries of [[],Array.from({length:2001},()=>json().entries[0])]){const value=json();value.entries=entries;assert.throws(()=>readCatalogJournal(JSON.stringify(value),tenant))}
 assert.throws(()=>readCatalogJournal(JSON.stringify({kind:'plockivo-catalog-import',entries:[{row:2,sku:'A',idempotency_key:'original-key-0001',status:'pending'}]}),tenant));
});
