'use client';
import {useEffect,useRef,useState} from 'react';
import {standaloneRequest} from './standalone-request';
import {minorToKronor} from '@/lib/standalone-money';
import type {components} from '@/generated/api';
type Item=components['schemas']['StandaloneCatalogItem'];
type Customer={id:string;tenant_id:string;name:string;organization_number:string;status:string;purchase_blocked:boolean};
type Publication={product_id:string;customer_account_id:string;source_item_id:string;source_version:number;mode:'test'};
export function CatalogTestPublication({item,tenantId,disabled,onBusyChange}:{item:Item;tenantId:string;disabled:boolean;onBusyChange?:(busy:boolean)=>void}){
 const [customers,setCustomers]=useState<Customer[]>([]),[prepared,setPrepared]=useState(false),[customerId,setCustomerId]=useState(''),[busy,setBusy]=useState<'loading'|'publishing'|null>(null),[error,setError]=useState(''),[result,setResult]=useState<Publication|null>(null),[retry,setRetry]=useState(false);
 const source=tenantId+':'+item.id+':'+item.version;
 const current=useRef(source);current.current=source;
 const mounted=useRef(false),locked=useRef(false),pending=useRef<{body:string;key:string}|null>(null),callback=useRef(onBusyChange);callback.current=onBusyChange;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;if(locked.current)callback.current?.(false)}},[]);
 useEffect(()=>{setCustomers([]);setPrepared(false);setCustomerId('');setError('');setResult(null);setRetry(false);pending.current=null},[source]);
 const active=()=>mounted.current&&current.current===source;
 const allowed=item.tenant_id===tenantId&&item.active&&item.self_scan&&item.version>0;
 function begin(kind:'loading'|'publishing'){locked.current=true;setBusy(kind);setError('');callback.current?.(true)}
 function finish(){locked.current=false;if(mounted.current){setBusy(null);callback.current?.(false)}}
 async function prepare(){
  if(disabled||locked.current||!allowed||pending.current)return;
  begin('loading');setCustomers([]);setCustomerId('');setPrepared(false);
  try{
   const data=await standaloneRequest<Customer[]>('merchant-customers?tenant_id='+encodeURIComponent(tenantId));
   if(active()){setCustomers(data.filter(customer=>customer.tenant_id===tenantId&&customer.status==='active'&&!customer.purchase_blocked));setPrepared(true)}
  }catch(e){if(active())setError(e instanceof Error?e.message:'Kundkontona kunde inte hämtas.')}
  finally{finish()}
 }
 async function publish(){
  if(disabled||locked.current||!allowed||result||!customerId||!customers.some(customer=>customer.id===customerId))return;
  const body={tenant_id:tenantId,version:item.version,customer_account_id:customerId};const serialized=JSON.stringify(body);
  if(pending.current&&pending.current.body!==serialized){setError('Den tidigare begäran måste bekräftas med samma kund och artikelversion.');return}
  if(!pending.current&&!window.confirm('Skapa en separat testartikel för valt kundkonto? Artikelns sparade pris och uppgifter kopieras en gång. Ingen verklig försäljning eller faktura skapas.'))return;
  if(!pending.current)pending.current={body:serialized,key:crypto.randomUUID()};
  begin('publishing');setRetry(true);
  try{
   const data=await standaloneRequest<Publication>('standalone-catalog/'+encodeURIComponent(item.id)+'/test-publication',body,pending.current.key);
   if(!data||!data.product_id||data.mode!=='test'||data.customer_account_id!==customerId||data.source_item_id!==item.id||data.source_version!==item.version)throw Error('Publiceringens svar kunde inte bekräftas. Försök igen med samma kund och artikelversion.');
   if(active()){setResult(data);setRetry(false)}
  }catch(e){if(active())setError(e instanceof Error?e.message:'Publiceringen kunde inte bekräftas.')}
  finally{finish()}
 }
 return <section className="panel" aria-labelledby={'test-publication-'+item.id}><span className="step">TESTKATALOG</span><h3 id={'test-publication-'+item.id}>Prova den sparade artikeln i ett testköp</h3><p><strong>{item.sku} · {item.name}</strong><br/>Sparad version {item.version} · {minorToKronor(item.unit_price_minor)} kr exkl. moms/{item.unit}</p><p>Skapa en separat testartikel med ett testpris för ett valt kundkonto. Det påverkar inte kredit, verkligt lager, fakturering eller fysisk utlämning. Testköpet kräver fortfarande ett giltigt inköpsmandat.</p><p className="muted">Varje källartikel kan publiceras en gång totalt, till ett enda kundkonto. Senare ändringar i förberedelseregistret uppdaterar inte testartikeln automatiskt. Ingen användare eller kund skapas här.</p>{!allowed&&<p role="status">Spara artikeln som aktiv och förberedd för självskanning innan du publicerar den till testkatalogen.</p>}{!result&&<button disabled={disabled||!!busy||!allowed||!!pending.current} onClick={()=>void prepare()}>{busy==='loading'?'Hämtar kundkonton…':prepared?'Uppdatera tillgängliga kundkonton':'Förbered testartikel'}</button>}{prepared&&!result&&<><p className="muted">Endast aktiva kundkonton utan köpspärr visas, bland de högst 200 konton som kundlistan returnerar.</p>{customers.length?<><label>Kundkonto för testpriset<select value={customerId} disabled={disabled||!!busy||!!pending.current} onChange={e=>setCustomerId(e.target.value)}><option value="">Välj kundkonto</option>{customers.map(customer=><option key={customer.id} value={customer.id}>{customer.name} · {customer.organization_number}</option>)}</select></label><button className="primary" disabled={disabled||!!busy||!customerId||!allowed} onClick={()=>void publish()}>{busy==='publishing'?'Publicerar testartikel…':retry?'Försök igen med samma uppgifter':'Skapa testartikel för valt kundkonto'}</button></>:<p>Inga aktiva kundkonton utan köpspärr finns i den hämtade listan. Kundens status och inköpsmandat hanteras separat.</p>}</>}{error&&<p role="alert" className="alert error">{error}</p>}{retry&&!result&&<p className="muted">Om svaret försvann kan testartikeln redan finnas. Behåll samma artikelversion och kundkonto och försök igen i den här fliken; samma anropsnyckel återanvänds.</p>}{result&&<p className="alert notice" role="status">Testartikeln är publicerad för valt kundkonto. Produkt-ID: <span style={{overflowWrap:'anywhere'}}>{result.product_id}</span>. Använd artikelnummer eller streckkod i testköpet.</p>}</section>
}
