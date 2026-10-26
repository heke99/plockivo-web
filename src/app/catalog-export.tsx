'use client';
import {useEffect,useRef,useState} from 'react';
import type {components} from '@/generated/api';
import {catalogPageCsv} from '@/lib/catalog-export';
type Item=components['schemas']['StandaloneCatalogItem'];
export function CatalogExport({items,disabled=false}:{items:readonly Item[];disabled?:boolean}){
 const downloads=useRef(new Map<string,ReturnType<typeof setTimeout>>()),[error,setError]=useState('');
 useEffect(()=>()=>{for(const [url,timer]of downloads.current){clearTimeout(timer);URL.revokeObjectURL(url)}downloads.current.clear()},[]);
 function download(){
  if(disabled||!items.length)return;
  setError('');let url:string|null=null;
  try{
   const content=catalogPageCsv(items);
   url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
   const anchor=document.createElement('a');anchor.href=url;anchor.download='plockivo-artiklar-aktuell-sida.csv';anchor.hidden=true;document.body.append(anchor);
   try{anchor.click()}finally{anchor.remove()}
   const pendingUrl=url;
   downloads.current.set(pendingUrl,setTimeout(()=>{URL.revokeObjectURL(pendingUrl);downloads.current.delete(pendingUrl)},5000));
  }catch(e){if(url)URL.revokeObjectURL(url);setError(e instanceof Error?e.message:'Exporten kunde inte skapas. Försök igen.');}
 }
 return <div><button type="button" disabled={disabled||!items.length} onClick={download}>Exportera aktuell sida som CSV ({items.length})</button><p className="muted">Exporten innehåller endast artiklarna på den aktuella sidan, inte hela registret. Text som kan tolkas som en kalkylbladsformel får en inledande apostrof; den behålls vid återimport. Aktivering, självskanningsval och artikel-ID ingår inte. Andra momssatser än 0, 6, 12 och 25 % behöver anpassas för CSV-importen.</p>{error&&<p role="alert">{error}</p>}</div>;
}
