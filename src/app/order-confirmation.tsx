'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import type {components} from '@/generated/api';
import './order-confirmation-print.css';
type Confirmation=components['schemas']['OrderConfirmation'];
function money(value:string){const n=BigInt(value);return (n/100n).toLocaleString('sv-SE')+','+(n%100n).toString().padStart(2,'0')+' kr'}
function ConfirmationContent({document}:{document:NonNullable<Confirmation['document']>}){
 return <><h3>Köpbekräftelse · test</h3><p>Detta är ett testdokument. Det är ingen faktura, följesedel eller rätt till fysisk utlämning.</p><dl className="confirmation-details"><dt>Säljare</dt><dd>{document.content.seller.name}<small>{document.content.seller.organization_number}</small></dd><dt>Köpare</dt><dd>{document.content.buyer.name}<small>{document.content.buyer.organization_number}</small></dd><dt>Referens</dt><dd>{document.content.reference}</dd><dt>Skapad</dt><dd>{new Date(document.created_at).toLocaleString('sv-SE')}</dd></dl><ul className="confirmation-lines">{document.content.lines.map(line=><li key={line.product_id}><span><strong>{line.name}</strong><small>{line.quantity} {line.unit}</small></span><span>{money((BigInt(line.net_minor)+BigInt(line.vat_minor)).toString())}</span></li>)}</ul><div className="total"><span>Totalt inkl. moms</span><strong>{money(document.content.total_minor)}</strong></div></>;
}
export function OrderConfirmation({intentId}:{intentId:string}){
 const [confirmation,setConfirmation]=useState<Confirmation|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0),[printing,setPrinting]=useState(false);
 useEffect(()=>{let active=true;const controller=new AbortController();setConfirmation(null);setError('');setLoading(true);setPrinting(false);
  fetch('/api/backend/purchase-intents/'+encodeURIComponent(intentId)+'/confirmation',{cache:'no-store',signal:controller.signal}).then(async r=>{const body=await r.json();if(!r.ok)throw Error(body.error?.message??'Köpbekräftelsen kunde inte hämtas.');return body.data as Confirmation}).then(data=>{if(active)setConfirmation(data)}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Försök igen.');}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false;controller.abort()}
 },[intentId,revision]);
 const readyDocument=!loading&&!error&&confirmation?.status==='ready'?confirmation.document:null;
 useEffect(()=>{
  if(!printing||!readyDocument)return;
  const complete=()=>setPrinting(false);
  window.addEventListener('afterprint',complete);
  document.body.classList.add('plockivo-printing-confirmation');
  // Wait until React has mounted the isolated print document in the body.
  const frame=requestAnimationFrame(()=>{try{window.print()}catch{setPrinting(false);setError('Utskrift kunde inte öppnas. Försök igen i webbläsaren.')}});
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('afterprint',complete);document.body.classList.remove('plockivo-printing-confirmation')};
 },[printing,readyDocument]);
 return <section className="order-confirmation" aria-labelledby={'confirmation-'+intentId}><h3 id={'confirmation-'+intentId}>Köpbekräftelse · test</h3><p className="muted">Detta är ett testdokument. Det är ingen faktura, följesedel eller rätt till fysisk utlämning.</p>{loading?<p role="status">Hämtar köpbekräftelsen…</p>:error?<p role="alert" className="alert error">{error}</p>:confirmation?.status==='pending'?<p role="status">Köpbekräftelsen förbereds. Ordern är sparad. Kontrollera igen om en stund.</p>:readyDocument?<div className="confirmation-screen-document"><ConfirmationContent document={readyDocument}/></div>:null}<button className="text-button" disabled={loading||printing} onClick={()=>setRevision(v=>v+1)}>Hämta aktuell köpbekräftelse</button>{readyDocument&&<button className="text-button" disabled={printing} onClick={()=>setPrinting(true)}>Skriv ut köpbekräftelse</button>}{printing&&readyDocument&&createPortal(<div className="plockivo-confirmation-print"><p>Plockivo</p><p>Underlags-ID: {intentId}</p><ConfirmationContent document={readyDocument}/></div>,document.body)}</section>
}
