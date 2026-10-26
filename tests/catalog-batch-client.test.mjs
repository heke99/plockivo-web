import {test} from 'node:test';import assert from 'node:assert/strict';
import {createCatalogBatch,runCatalogBatch,catalogBatchResults} from '../src/lib/catalog-batch-client.ts';
const item={sku:'A',name:'One',unit:'st',unit_price_minor:'100',vat_bps:2500,barcode:null,quantity_step:'1',package_quantity:'1',active:true,self_scan:false};
function make(){let i=0;return createCatalogBatch([{row:2,item,errors:[]},{row:3,item:{...item,sku:'B'},errors:[]}],'tenant',()=>`key-${++i}`)}
test('commit then timeout stops; retry repeats same body/key and no later row until confirmation',async()=>{
 const batch=make(),calls=[],committed=new Set();let fail=true;
 const send=async(body,key)=>{calls.push([body.sku,key]);committed.add(key);if(fail){fail=false;throw Error('timeout')}};
 const opts={send,shouldStop:()=>false,onProgress:()=>{}};
 assert.equal(await runCatalogBatch(batch,opts),'error');assert.deepEqual(calls,[['A','key-1']]);assert.equal(batch.entries[0].status,'uncertain');
 assert.equal(await runCatalogBatch(batch,opts),'complete');assert.deepEqual(calls,[['A','key-1'],['A','key-1'],['B','key-2']]);assert.equal(committed.size,2);
 assert.equal(await runCatalogBatch(batch,opts),'complete');assert.equal(calls.length,3);assert.deepEqual(catalogBatchResults(batch).entries.map(x=>x.status),['confirmed','confirmed']);
});
test('cancel waits for in-flight confirmation, stops before next request and resumes first pending',async()=>{
 const batch=make(),calls=[];let stop=false,resolve;
 const first=new Promise(r=>{resolve=r});const opts={send:async(body,key)=>{calls.push(key);if(calls.length===1)await first},shouldStop:()=>stop,onProgress:()=>{}};
 const active=runCatalogBatch(batch,opts);stop=true;assert.deepEqual(calls,['key-1']);assert.equal(batch.entries[0].status,'pending');
 await assert.rejects(()=>runCatalogBatch(batch,opts),/redan/);resolve();assert.equal(await active,'stopped');assert.equal(batch.entries[0].status,'confirmed');assert.equal(batch.entries[1].status,'pending');
 stop=false;assert.equal(await runCatalogBatch(batch,opts),'complete');assert.deepEqual(calls,['key-1','key-2']);
});
test('any invalid row blocks creation of batch and cannot partially import valid rows',()=>{
 assert.throws(()=>createCatalogBatch([{row:2,item,errors:[]},{row:3,item:null,errors:['bad']}],'t',()=>''));
 assert.throws(()=>createCatalogBatch([],'t',()=>''));assert.throws(()=>createCatalogBatch([{row:2,item,errors:['bad']}],'t',()=>''));
});
