'use client';
import {useEffect,useRef,useState} from 'react';
import {readCatalogCsv,catalogCsvExample,type ImportRow,type ImportItem} from '@/lib/catalog-import';
import {createCatalogBatch,runCatalogBatch,catalogBatchResults,type CatalogBatch} from '@/lib/catalog-batch-client';
import {readCatalogJournal,catalogJournalMaxBytes} from '@/lib/catalog-journal';
import {minorToKronor} from '@/lib/standalone-money';
import {standaloneRequest} from './standalone-request';
export function CatalogImport({tenantId,disabled,onSelect,onChanged,onBusyChange}:{tenantId:string;disabled:boolean;onSelect:(item:ImportItem)=>void;onChanged:()=>void|Promise<void>;onBusyChange:(busy:boolean)=>void}){
 const [restored,setRestored]=useState(false);
 const [rows,setRows]=useState<ImportRow[]>([]),[error,setError]=useState(''),[reading,setReading]=useState(false),[running,setRunning]=useState(false),[notice,setNotice]=useState(''),[,redraw]=useState(0);
 const request=useRef(0),batch=useRef<CatalogBatch|null>(null),stop=useRef(false),mounted=useRef(false),currentTenant=useRef(tenantId),downloadUrl=useRef<string|null>(null);
 currentTenant.current=tenantId;
 const callbacks=useRef({onChanged,onBusyChange});callbacks.current={onChanged,onBusyChange};
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;request.current++;stop.current=true;if(downloadUrl.current)URL.revokeObjectURL(downloadUrl.current)}},[]);
 useEffect(()=>{request.current++;stop.current=true;batch.current=null;setRestored(false);setRows([]);setError('');setNotice('');setReading(false)},[tenantId]);
 const complete=!!batch.current&&batch.current.entries.every(entry=>entry.status==='confirmed');
 const pending=!!batch.current&&!complete;
 useEffect(()=>{if(!running&&!pending)return;function warn(event:BeforeUnloadEvent){event.preventDefault();event.returnValue=''}window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[running,pending]);
 async function read(file:File|undefined){if(disabled||reading||running||pending)return;setRestored(false);const id=++request.current;setRows([]);setError('');setNotice('');batch.current=null;if(!file)return;setReading(true);try{if(file.size>2097152)throw Error('Filen får vara högst 2 MiB.');const data=readCatalogCsv(await file.text());if(request.current===id)setRows(data)}catch(e){if(request.current===id)setError(e instanceof Error?e.message:'Filen kunde inte läsas.')}finally{if(request.current===id)setReading(false)}}
 async function restore(file:File|undefined){
  if(!file||disabled||reading||running||batch.current?.running||pending)return;
  const id=++request.current,tenant=tenantId;setReading(true);setError('');setNotice('');
  try{
   if(file.size>catalogJournalMaxBytes)throw Error('Journalfilen får vara högst 4 MiB.');
   const restoredBatch=readCatalogJournal(await file.text(),tenant);
   if(request.current!==id||currentTenant.current!==tenant)return;
   batch.current=restoredBatch;setRestored(true);
   setRows(restoredBatch.entries.map(entry=>{const {tenant_id:ignoredTenant,id:ignoredId,version:ignoredVersion,...item}=entry.body;return {row:entry.row,item,errors:[]}}));
   setNotice('Journalen är inläst lokalt. Inget har skickats. Kontrollera handlaren och posterna och välj sedan att fortsätta. Bekräftade rader hoppas över enligt filens uppgifter; kontrollera artikelregistret vid tveksamhet.');
  }catch(e){if(request.current===id)setError(e instanceof Error?e.message:'Journalfilen kunde inte läsas.')}
  finally{if(request.current===id)setReading(false)}
 }
 async function saveAll(){
  if(running||reading||batch.current?.running||disabled||!rows.length||rows.some(row=>!row.item||row.errors.length))return;
  if(!batch.current&&!window.confirm(`Spara ${rows.length} nya artiklar? Befintliga artiklar uppdateras inte. Importen stannar vid första felet.`))return;
  if(restored&&!window.confirm('Fortsätt med journalens obekräftade poster för den aktuella handlaren? Använd samma personliga konto som vid importstart och rätt behörighet. Journalen är inte ett behörighetsbevis. Samma artikeluppgifter och anropsnycklar återanvänds; rader märkta bekräftade hoppas över.'))return;
  const tenant=tenantId;const selected=batch.current??createCatalogBatch(rows,tenant,()=>crypto.randomUUID());batch.current=selected;stop.current=false;setRunning(true);setError('');setNotice('');callbacks.current.onBusyChange(true);
  try{
   const result=await runCatalogBatch(selected,{
    shouldStop:()=>stop.current||!mounted.current||currentTenant.current!==tenant,
    send:async(body,key)=>{const saved=await standaloneRequest<{id:string;tenant_id:string;sku:string}>('standalone-catalog',body,key);if(!saved||!saved.id||saved.tenant_id!==tenant||saved.sku!==body.sku)throw Error('Sparandet kunde inte bekräftas. Fortsätt i samma flik för att återanvända samma anropsnyckel.')},
    onProgress:()=>{if(mounted.current&&currentTenant.current===tenant)redraw(n=>n+1)}
   });
   if(mounted.current&&currentTenant.current===tenant){if(result==='error')setError('Importen stannade. Den aktuella raden kan redan vara sparad om svaret försvann. Fortsätt med samma fil i den här fliken för att prova samma rad och anropsnyckel igen.');else setNotice(result==='complete'?'Alla artiklar är bekräftat sparade.':'Importen är pausad efter det senaste svaret. Du kan fortsätta från nästa obekräftade rad.');}
  }catch(e){if(mounted.current&&currentTenant.current===tenant)setError(e instanceof Error?e.message:'Importen kunde inte genomföras.');}
  finally{
   if(mounted.current){setRunning(false);callbacks.current.onBusyChange(false);if(currentTenant.current===tenant&&selected.entries.some(entry=>entry.status==='confirmed')){try{await callbacks.current.onChanged()}catch{setError('Artiklar sparades men listan kunde inte uppdateras. Hämta aktuell lista.')}}}
  }
 }
 function finishImport(){
  if(running||batch.current?.running)return;
  if(!window.confirm('Avsluta importen? Redan sparade artiklar finns kvar. En rad utan bekräftat svar kan också vara sparad. Återförsöksnycklarna försvinner från den här fliken och inga artiklar tas bort. Hämta gärna återställningsjournalen först och kontrollera artikelregistret innan du läser in filen igen.'))return;
  request.current++;stop.current=true;batch.current=null;setRows([]);setError('');setNotice('Importen är avslutad. Redan sparade artiklar finns kvar i artikelregistret.');
 }
 function downloadResults(){if(!batch.current)return;if(downloadUrl.current)URL.revokeObjectURL(downloadUrl.current);const url=URL.createObjectURL(new Blob([JSON.stringify(catalogBatchResults(batch.current))],{type:'application/json'}));downloadUrl.current=url;const anchor=document.createElement('a');anchor.href=url;anchor.download='plockivo-importjournal-v1.json';document.body.appendChild(anchor);anchor.click();anchor.remove()}
 const confirmed=batch.current?.entries.filter(entry=>entry.status==='confirmed').length??0;
 const invalid=rows.filter(row=>!row.item||row.errors.length).length;
 const stoppedEntry=batch.current?.entries.find(entry=>entry.status==='uncertain');
 return <details><summary>Läs in artiklar från CSV</summary><p><a href="/import-guide" target="_blank" rel="noopener noreferrer">Instruktioner för filer och API ↗</a></p><p>Semikolonseparerad UTF-8, högst 2000 artiklar och 2 MiB. Filen granskas lokalt. Du väljer själv när artiklarna ska sparas.</p><p className="muted">Importen skapar nya artiklar en i taget. Befintliga artiklar uppdateras inte. Servern kontrollerar artikelnummer och streckkoder. Vid fel stoppas importen före nästa rad.</p><p><a href="/templates/plockivo-artiklar-tom.csv" download>Hämta tom CSV-mall</a> · <a href="/templates/plockivo-artiklar-exempel.csv" download>Hämta exempel</a></p><details><summary>Visa kolumnrubriker och exempel</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{catalogCsvExample}</pre></details><label>CSV-fil<input type="file" accept=".csv,text/csv" disabled={disabled||reading||running||pending} onChange={e=>{const file=e.target.files?.[0];e.target.value='';void read(file)}}/></label><label>Återställ import från journal (JSON)<input type="file" accept=".json,application/json" disabled={disabled||reading||running||pending} onChange={e=>{const file=e.target.files?.[0];e.target.value='';void restore(file)}}/></label><p className="muted">Högst 4 MiB och 2000 poster. Journalen innehåller artikeluppgifter och återförsöksnycklar, inga inloggningstoken. Använd samma personliga konto och samma handlare som när importen startades. Servern kontrollerar alltid dina behörigheter. Inläsning skickar inga artiklar.</p>{reading&&<p role="status">Läser filen…</p>}{error&&<p role="alert" className="alert error">{error}</p>}{notice&&<p role="status">{notice}</p>}{stoppedEntry&&<p role="alert">Stopp vid post {stoppedEntry.row} · {stoppedEntry.body.sku}: {stoppedEntry.error}</p>}{rows.length>0&&<><p role="status">{rows.length-invalid} godkända rader · {invalid} rader med fel · {confirmed} av {rows.length} {restored?'markerade som bekräftade i journalen':'bekräftat sparade'}.</p>{invalid>0&&<div className="alert error"><p>Rätta samtliga fel i filen och läs in den igen innan du sparar hela filen.</p><ul>{rows.filter(row=>!row.item||row.errors.length).slice(0,100).map(row=><li key={row.row}>Post {row.row}: {row.errors.join(' ')}</li>)}</ul>{invalid>100&&<p>De första 100 felaktiga posterna visas. Rätta dessa och läs in filen igen för nästa kontroll.</p>}</div>}<button className="primary" disabled={disabled||running||reading||invalid>0||complete} onClick={()=>void saveAll()}>{running?'Sparar artiklar…':pending?(restored?'Bekräfta och fortsätt från journal':'Fortsätt från stoppad rad'):'Spara alla godkända artiklar'}</button>{running&&<button onClick={()=>{stop.current=true;setNotice('Paus begärd. Väntar på svaret för den aktuella raden innan importen stannar.')}}>Pausa efter aktuell rad</button>}{batch.current&&<button onClick={downloadResults}>Hämta återställningsjournal (JSON)</button>}{!running&&pending&&<button disabled={disabled} onClick={finishImport}>Avsluta importen</button>}{pending&&<p className="muted">Hämta återställningsjournalen innan du lämnar sidan. Efter omladdning eller byte av enhet kan filen läsas in igen med samma personliga konto och för samma handlare och återanvända ursprungliga artikeluppgifter och anropsnycklar. Ingen journal sparas automatiskt.</p>}<p className="muted">Förhandsgranskningen visar högst de första 100 av {rows.length} rader. Sparandet behandlar samtliga godkända rader i filen.</p><ul className="invitation-list">{rows.slice(0,100).map(r=><li key={r.row}><div><strong>Post {r.row}{r.item?' · '+r.item.sku:''}</strong>{r.item?<small>{r.item.name} · {minorToKronor(r.item.unit_price_minor)} kr exkl. moms/{r.item.unit}</small>:<small>{r.errors.join(' ')}</small>}</div>{r.item&&<button disabled={disabled||running||!!batch.current} onClick={()=>onSelect(r.item!)}>Granska {r.item.sku}</button>}</li>)}</ul><button disabled={disabled||running||pending} onClick={()=>{setRows([]);batch.current=null;setError('');setNotice('')}}>Töm förhandsgranskningen</button></>}</details>
}
