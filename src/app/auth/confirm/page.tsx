'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {readEmailLink,invalidEmailLink,type EmailLinkInput} from '@/lib/email-link';
export default function ConfirmEmail(){
 const proof=useRef<EmailLinkInput|null>(null),initialized=useRef(false);
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
  if(initialized.current)return;initialized.current=true;
  proof.current=readEmailLink(location.hash);
  history.replaceState(null,'',location.pathname);
  setReady(true);if(!proof.current)setError(invalidEmailLink);
 },[]);
 async function confirm(){
  if(!proof.current||busy)return;
  setBusy(true);setError('');
  try{
   const response=await fetch('/api/auth/confirm',{method:'POST',headers:{'Content-Type':'application/json','X-Plockivo-Request':'1'},body:JSON.stringify(proof.current),cache:'no-store',signal:AbortSignal.timeout(15000)});
   const data=await response.json();
   if(!response.ok)throw Error(data.error??invalidEmailLink);
   // The server owns navigation. Never follow a provider or query-string redirect.
   if(data.redirect!=='/app?activated=1'&&data.redirect!=='/app?recovery=1')throw Error(invalidEmailLink);
   proof.current=null;location.replace(data.redirect);
  }catch(e){setError(e instanceof Error&&e.name==='TimeoutError'?'Bekräftelsen tog för lång tid. Om länken redan använts behöver du begära en ny.':e instanceof Error?e.message:invalidEmailLink);setBusy(false)}
 }
 const recovery=proof.current?.type==='recovery',invite=proof.current?.type==='invite';
 return <main className="content"><Link href="/">← Plockivo</Link><section className="panel login" style={{maxWidth:560,margin:'32px auto'}}><span className="step">SÄKER BEKRÄFTELSE</span><h1>{recovery?'Återställ ditt lösenord':invite?'Acceptera kontoinbjudan':'Bekräfta din e-postadress'}</h1><p>Du kan fortsätta i den här webbläsaren, även om du började på en annan enhet. Fortsätt bara om du känner igen begäran. Länken loggar in kontot som mejlet gäller i den här webbläsaren.</p>{!ready?<p role="status">Läser länken…</p>:proof.current&&<button className="primary wide" disabled={busy} onClick={()=>void confirm()}>{busy?'Bekräftar…':recovery?'Fortsätt till nytt lösenord':invite?'Fortsätt med inbjudan':'Bekräfta och fortsätt'}</button>}{error&&<p className="alert error" role="alert">{error}</p>}<p className="muted">Länken kan användas en gång. Dina företagsbehörigheter och krav på tvåstegsverifiering ändras inte.</p><p><Link href="/forgot-password">Begär ny återställningslänk</Link></p><Link href="/app">Till inloggningen</Link></section></main>
}
