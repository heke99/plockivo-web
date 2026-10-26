'use client';
import Link from 'next/link';
import {useState} from 'react';
export default function ForgotPassword(){
 const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 async function submit(){
  setBusy(true);setError('');setMessage('');
  try{
   const response=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reset',email:email.trim()}),cache:'no-store',signal:AbortSignal.timeout(15000)});
   const data=await response.json();
   if(!response.ok)throw Error(data.error??'Försök igen senare.');
   setMessage(data.message);
  }catch(e){setError(e instanceof Error&&e.name==='TimeoutError'?'Förfrågan tog för lång tid. Vänta en stund innan du försöker igen.':e instanceof Error?e.message:'Försök igen senare.');}
  finally{setBusy(false)}
 }
 return <main className="content"><Link href="/">← Plockivo</Link><section className="panel login" style={{maxWidth:520,margin:'32px auto'}}><span className="step">DITT PERSONLIGA KONTO</span><h1>Glömt lösenordet?</h1><p>Ange e-postadressen till ditt konto så kan du begära en länk för att välja ett nytt lösenord.</p><form onSubmit={e=>{e.preventDefault();void submit()}}><label>E-postadress<input type="email" autoComplete="email" maxLength={254} required value={email} disabled={busy} onChange={e=>{setEmail(e.target.value);setMessage('');setError('')}}/></label><button className="primary wide" type="submit" disabled={busy||!!message}>{busy?'Skickar förfrågan…':'Skicka återställningslänk'}</button></form>{error&&<p className="alert error" role="alert">{error}</p>}{message&&<p className="alert notice" role="status">{message}</p>}<p className="muted">Länken ändrar inte ditt lösenord förrän du väljer ett nytt. Tvåstegsverifiering och företagsbehörigheter gäller fortfarande.</p><Link href="/app">Tillbaka till inloggningen</Link></section></main>
}
