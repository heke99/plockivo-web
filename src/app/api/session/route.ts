import { z } from 'zod';
import {requestPasswordReset,changeAccountPassword} from '@/lib/recovery';
import {sessionClient,sameOrigin,env} from '@/lib/supabase';
export const dynamic='force-dynamic';
function json(body:unknown,init?:ResponseInit){return Response.json(body,{...init,headers:{'Cache-Control':'no-store'}})}
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'Förfrågan kunde inte verifieras.'},{status:403});
 if(Number(req.headers.get('content-length')??0)>4096)return new Response(null,{status:413});
 try{
  const raw=await req.text();if(raw.length>4096)return new Response(null,{status:413});
  const body=z.object({action:z.enum(['signin','signout','reset','password']),email:z.email().max(254).optional(),password:z.string().min(12).max(128).optional()}).strict().parse(JSON.parse(raw));
  const db=await sessionClient();
  if(body.action==='signout'){const {error}=await db.auth.signOut({scope:'local'});if(error)return json({error:'Utloggningen kunde inte bekräftas. Försök igen.'},{status:503});return json({ok:true})}
  if(body.action==='reset'){
   if(!body.email)throw Error();
   const result=await requestPasswordReset(body.email,env().APP_ORIGIN,process.env.AUTH_EMAIL_DELIVERY_ENABLED==='true',(email,redirectTo)=>db.auth.resetPasswordForEmail(email,{redirectTo}));
   return json(result.body,{status:result.status});
  }
  if(body.action==='password'){
   if(!body.password)throw Error();
   const result=await changeAccountPassword(db,body.password);return json(result.body,{status:result.status});
  }
  if(!body.email||!body.password)throw Error();
  const {error}=await db.auth.signInWithPassword({email:body.email,password:body.password});
  if(error)return json({error:error.status&&error.status>=500?'Inloggningstjänsten är tillfälligt otillgänglig. Försök igen.':'Inloggningen kunde inte genomföras. Kontrollera uppgifterna.'},{status:error.status&&error.status>=500?503:401});
  return json({ok:true});
 }catch{return json({error:'Kontrollera uppgifterna och försök igen.'},{status:400})}
}

