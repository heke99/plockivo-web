import {catalogJournal} from './catalog-journal.ts';
import type {ImportItem,ImportRow} from './catalog-import.ts';
export type BatchBody=ImportItem&{tenant_id:string;id:null;version:0};
export type BatchEntry={row:number;body:BatchBody;key:string;status:'pending'|'confirmed'|'uncertain';error:string|null};
export type CatalogBatch={entries:BatchEntry[];running:boolean};
export function createCatalogBatch(rows:ImportRow[],tenantId:string,key:()=>string):CatalogBatch{
 if(!tenantId||!rows.length||rows.some(row=>!row.item||row.errors.length))throw Error('Alla rader måste vara godkända innan filen kan sparas.');
 return {running:false,entries:rows.map(row=>({row:row.row,body:{...row.item!,tenant_id:tenantId,id:null,version:0},key:key(),status:'pending',error:null}))};
}
export async function runCatalogBatch(batch:CatalogBatch,options:{send:(body:BatchBody,key:string)=>Promise<void>;shouldStop:()=>boolean;onProgress:()=>void}):Promise<'complete'|'stopped'|'error'>{
 if(batch.running)throw Error('En import körs redan.');
 batch.running=true;
 try{
  for(const entry of batch.entries){
   if(entry.status==='confirmed')continue;
   if(options.shouldStop())return 'stopped';
   entry.error=null;
   try{await options.send(entry.body,entry.key)}catch(error){entry.status='uncertain';entry.error=error instanceof Error?error.message.slice(0,4000):'Svaret kunde inte bekräftas.';options.onProgress();return 'error'}
   entry.status='confirmed';options.onProgress();
  }
  return 'complete';
 }finally{batch.running=false}
}
export function catalogBatchResults(batch:CatalogBatch){return catalogJournal(batch)}
