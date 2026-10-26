'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';

type DetectorApi={getSupportedFormats?:()=>Promise<string[]>};
type Capabilities={secure:boolean;camera:boolean;detector:boolean;formats:string[]|null};
const scanFormats=['ean_13','ean_8','code_128','qr_code'];
export default function DeviceCheck(){
 const [capabilities,setCapabilities]=useState<Capabilities|null>(null),[checking,setChecking]=useState(false),[cameraBusy,setCameraBusy]=useState(false),[cameraMessage,setCameraMessage]=useState('');
 const mounted=useRef(false),activeStream=useRef<MediaStream|null>(null);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;activeStream.current?.getTracks().forEach(track=>track.stop());activeStream.current=null}},[]);
 async function check(){
  setChecking(true);
  const detector=(window as unknown as {BarcodeDetector?:DetectorApi}).BarcodeDetector;
  let formats:string[]|null=null;
  try{if(detector?.getSupportedFormats)formats=await detector.getSupportedFormats()}catch{/* Unsupported browsers retain the manual-entry fallback. */}
  if(mounted.current){setCapabilities({secure:window.isSecureContext,camera:!!navigator.mediaDevices?.getUserMedia,detector:!!detector,formats});setChecking(false)}
 }
 async function testCamera(){
  setCameraBusy(true);setCameraMessage('');
  let stream:MediaStream|null=null;
  try{
   if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){setCameraMessage('Kameran är inte tillgänglig här. Öppna Plockivo via HTTPS i telefonens vanliga webbläsare, eller ange artikelkoden manuellt.');return}
   stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
   if(mounted.current){activeStream.current=stream;setCameraMessage('Kameran kunde öppnas. Kameran har nu stängts av. Ingen bild har sparats eller skickats. Detta provar kameratillgången, inte avläsningen av en streckkod.');}
  }catch(error){
   if(mounted.current){const name=error instanceof Error?error.name:'';setCameraMessage(name==='NotAllowedError'?'Kameratillgång nekades. Tillåt kameran i webbläsarens webbplatsinställningar och prova igen, eller ange artikelkoden manuellt.':name==='NotFoundError'?'Ingen kamera hittades. Du kan fortfarande söka efter artiklar eller ange koden manuellt.':name==='NotReadableError'?'Kameran kunde inte öppnas. Stäng andra appar som använder den och prova igen.':'Kameratestet kunde inte genomföras. Prova telefonens vanliga webbläsare eller använd manuell inmatning.');}
  }finally{
   stream?.getTracks().forEach(track=>track.stop());activeStream.current=null;
   if(mounted.current)setCameraBusy(false);
  }
 }
 const readable=capabilities?.detector&&capabilities.formats?.some(format=>scanFormats.includes(format));
 return <main className="content"><Link href="/">← Plockivo</Link><section className="panel" style={{maxWidth:680,margin:'32px auto'}}><span className="step">DIN TELEFON OCH WEBBLÄSARE</span><h1>Kontrollera din enhet</h1><p>Öppna den här sidan på enheten du vill använda i butiken. Du kan kontrollera webbläsarstödet utan att logga in.</p><button className="primary" disabled={checking} onClick={()=>void check()}>{checking?'Kontrollerar…':'Kontrollera webbläsarstöd'}</button>{capabilities&&<div role="status"><dl><dt>Säker anslutning</dt><dd>{capabilities.secure?'Ja, webbläsaren tillåter säkra enhetsfunktioner.':'Nej. Öppna Plockivo med HTTPS.'}</dd><dt>Kamera-API</dt><dd>{capabilities.camera?'Finns. Prova kameratillgången med knappen nedan.':'Saknas. Använd en annan webbläsare eller manuell inmatning.'}</dd><dt>Inbyggd streckkodsläsning</dt><dd>{readable?'Webbläsaren rapporterar stöd för minst ett av appens kodformat. Prova även en riktig artikel i appen.':capabilities.detector&&capabilities.formats===null?'Stöd kunde inte fastställas. Använd manuell inmatning om skanningen inte fungerar.':'Inget bekräftat stöd för appens kodformat. Sök efter artikeln eller ange koden manuellt.'}</dd>{capabilities.formats&&<><dt>Kodformat som webbläsaren rapporterar</dt><dd style={{overflowWrap:'anywhere'}}>{capabilities.formats.filter(format=>scanFormats.includes(format)).join(', ')||'Inga av appens kodformat.'}</dd></>}</dl></div>}<h2>Prova kameratillgången</h2><p>Först när du trycker på knappen kan webbläsaren be om kameratillstånd. Kameran öppnas kort och stängs direkt. Ingen mikrofon används.</p><button disabled={cameraBusy} onClick={()=>void testCamera()}>{cameraBusy?'Väntar på kameran…':'Prova kameran'}</button>{cameraMessage&&<p className="alert notice" role="status">{cameraMessage}</p>}<p className="muted">Om kamerafrågan ligger kvar behöver du svara på den i webbläsaren. Funktionen fungerar också med manuell artikelkod när kameraskanning saknas.</p><h2>Öppnar du en länk från mejlen?</h2><p>Om mejlappen öppnar en inbyggd webbläsare kan du behöva välja ”Öppna i webbläsare”. Logga in med ditt eget konto på varje enhet. Företagets behörigheter gäller oavsett enhet.</p><p><Link href="/app">Öppna Plockivo →</Link></p><p><Link href="/forgot-password">Återställ ditt lösenord →</Link></p></section></main>
}
