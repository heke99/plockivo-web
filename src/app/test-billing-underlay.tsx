'use client';
import {useEffect,useState} from 'react';
import type {components} from '@/generated/api';
type Underlay=components['schemas']['TestBillingUnderlay'];
function money(value:string){const n=BigInt(value);return (n/100n).toLocaleString('sv-SE')+','+(n%100n).toString().padStart(2,'0')+' kr'}
export function TestBillingUnderlay({orderId}:{orderId:string}){
 const [data,setData]=useState<Underlay|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);
 useEffect(()=>{let active=true;const controller=new AbortController();setData(null);setError('');setLoading(true);fetch('/api/backend/fulfillment/'+encodeURIComponent(orderId)+'/billing-underlay',{cache:'no-store',signal:controller.signal}).then(async r=>{const b=await r.json();if(!r.ok)throw Error(b.error?.message??'Testunderlaget är inte tillgängligt.');return b.data as Underlay}).then(d=>{if(active)setData(d)}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false;controller.abort()}},[orderId,revision]);
 return <section className="panel"><h3>Faktureringsunderlag · test</h3><p>Beräknat från bekräftat utlämnad mängd och orderns frysta belopp. Inte bokfört och ingen faktura skapad. Mottagen retur ger ingen automatisk kreditering.</p>{loading?<p role="status">Hämtar underlaget…</p>:error?<p role="alert">{error}</p>:data?<><ul className="invitation-list">{data.lines.map(l=><li key={l.order_line_id}><div><strong>{l.name}</strong><small>Utlämnat {l.fulfilled_quantity} av {l.ordered_quantity} · Mottagen retur {l.returned_quantity}</small></div><span>{money((BigInt(l.net_minor)+BigInt(l.vat_minor)).toString())}</span></li>)}</ul><p>Totalt inkl. moms: <strong>{money(data.total_minor)}</strong></p></>:null}<button disabled={loading} onClick={()=>setRevision(n=>n+1)}>Uppdatera testunderlag</button></section>
}
