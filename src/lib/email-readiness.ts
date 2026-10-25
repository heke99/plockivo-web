import {z} from 'zod';
export const emailSenderConfig=z.object({AUTH_EMAIL_FROM:z.email(),AUTH_EMAIL_SENDER_DOMAIN:z.string().min(3),AUTH_EMAIL_DELIVERY_ENABLED:z.enum(['true','false']),AUTH_EMAIL_CONFIRMATIONS_VERIFIED:z.enum(['true','false'])}).strict().refine(e=>e.AUTH_EMAIL_FROM.split('@')[1].toLowerCase()===e.AUTH_EMAIL_SENDER_DOMAIN.toLowerCase(),'Sender must belong to verified domain');
export type EmailEvidence={senderDomain:string|null;senderVerified:boolean;smtpConfigured:boolean;confirmationsVerified:boolean;deliveryProbePassed:boolean};
// Operational evidence only; not authorization and never user metadata.
export function emailReadiness(e:EmailEvidence){const missing:string[]=[];if(!e.senderDomain||!e.senderVerified)missing.push('verified_sender');if(!e.smtpConfigured)missing.push('auth_transport');if(!e.confirmationsVerified)missing.push('email_confirmation');if(!e.deliveryProbePassed)missing.push('delivery_probe');return {ready:missing.length===0,missing};}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
export function authEmailTemplate(kind:'activation'|'recovery',confirmationUrl:string,allowedOrigin:string){
 const url=new URL(confirmationUrl);if(url.origin!==new URL(allowedOrigin).origin||url.protocol!=='https:'||url.username||url.password)throw Error('Untrusted auth link');
 const title=kind==='activation'?'Bekräfta din e-postadress':'Återställ ditt lösenord';const text=kind==='activation'?'Bekräfta ditt konto. Öppna sedan din ursprungliga inbjudan för att granska företagsmandatet.':'Du har begärt att återställa ditt lösenord. Ditt företagsmandat och krav på tvåstegsverifiering ändras inte.';
 return {subject:'Plockivo – '+title,text:title+'\n\n'+text+'\n\n'+url.href+'\n\nOm du inte begärde detta kan du bortse från mejlet.',html:'<!doctype html><html lang="sv"><body><h1>'+title+'</h1><p>'+text+'</p><p><a href="'+escapeHtml(url.href)+'">'+title+'</a></p><p>Om du inte begärde detta kan du bortse från mejlet.</p></body></html>'};
}
