import {z} from 'zod';
import type {CatalogBatch} from './catalog-batch-client.ts';
export const catalogJournalMaxBytes=4*1024*1024;
const text=(max:number)=>z.string().min(1).max(max).refine(v=>v.trim().length>0);
const quantity=z.string().regex(/^(?:0|[1-9]\d{0,5})(?:\.\d{1,6})?$/).refine(v=>/[1-9]/.test(v));
const body=z.object({tenant_id:z.uuid(),id:z.null(),version:z.literal(0),sku:text(80),name:text(200),unit:text(30),unit_price_minor:z.string().regex(/^(0|[1-9]\d{0,11})$/),vat_bps:z.number().int().min(0).max(10000),barcode:text(100).nullable(),quantity_step:quantity,package_quantity:quantity,active:z.boolean(),self_scan:z.boolean()}).strict();
const entry=z.object({row:z.number().int().min(1).max(2001),body,key:z.string().min(16).max(128).regex(/^[a-zA-Z0-9:_-]+$/),status:z.enum(['pending','confirmed','uncertain']),error:z.string().max(4000).nullable()}).strict();
export const catalogJournalSchema=z.object({kind:z.literal('plockivo-catalog-import'),version:z.literal(1),tenant_id:z.uuid(),entries:z.array(entry).min(1).max(2000)}).strict().superRefine((journal,ctx)=>{
 const keys=new Set<string>(),rows=new Set<number>();
 for(const [i,value] of journal.entries.entries()){
  if(value.body.tenant_id!==journal.tenant_id)ctx.addIssue({code:'custom',path:['entries',i,'body','tenant_id'],message:'Alla poster måste tillhöra samma handlare.'});
  if(keys.has(value.key))ctx.addIssue({code:'custom',path:['entries',i,'key'],message:'Anropsnycklar måste vara unika.'});
  if(rows.has(value.row))ctx.addIssue({code:'custom',path:['entries',i,'row'],message:'Postnummer måste vara unika.'});
  keys.add(value.key);rows.add(value.row);
 }
});
/** A local recovery aid, never an authentication credential or evidence of server state. */
export function catalogJournal(batch:CatalogBatch){return {kind:'plockivo-catalog-import' as const,version:1 as const,tenant_id:batch.entries[0]?.body.tenant_id??'',entries:batch.entries.map(e=>({row:e.row,body:{...e.body},key:e.key,status:e.status,error:e.error}))}}
export function readCatalogJournal(source:string,currentTenant:string):CatalogBatch{
 if(new TextEncoder().encode(source).length>catalogJournalMaxBytes)throw Error('Journalfilen får vara högst 4 MiB.');
 if(!z.uuid().safeParse(currentTenant).success)throw Error('Välj en giltig aktuell handlare innan journalen läses in.');
 let input:unknown;try{input=JSON.parse(source)}catch{throw Error('Journalfilen innehåller inte giltig JSON.')}
 const parsed=catalogJournalSchema.safeParse(input);
 if(!parsed.success)throw Error('Journalfilen är ogiltig eller har en version som inte stöds. Inga artiklar har skickats.');
 if(parsed.data.tenant_id!==currentTenant)throw Error('Journalfilen tillhör en annan handlare. Välj rätt handlare innan du fortsätter.');
 return {entries:parsed.data.entries,running:false};
}
