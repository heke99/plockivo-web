import { z } from 'zod';
import {sessionClient,sameOrigin,env} from '@/lib/supabase';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Förfrågan kunde inte verifieras.'},{status:403});
 if(Number(req.headers.get('content-length')??0)>4096)return new Response(null,{status:413});
 try{
  const raw=await req.text();if(raw.length>4096)return new Response(null,{status:413});
  const body=z.object({action:z.enum(['signin','signout','reset','password']),email:z.email().max(254).optional(),password:z.string().min(12).max(128).optional()}).strict().parse(JSON.parse(raw));
  const db=await sessionClient();
  if(body.action==='signout'){await db.auth.signOut({scope:'local'});return Response.json({ok:true})}
  if(body.action==='reset'){
   if(!body.email)throw Error();
   await db.auth.resetPasswordForEmail(body.email,{redirectTo:new URL('/auth/callback',env().APP_ORIGIN).href});
   return Response.json({ok:true,message:'Om adressen har ett konto skickas instruktioner.'});
  }
  if(body.action==='password'){
   const {data:{user}}=await db.auth.getUser();if(!user||!body.password)throw Error();
   const {error}=await db.auth.updateUser({password:body.password});if(error)throw Error();
   await db.auth.signOut({scope:'global'});return Response.json({ok:true});
  }
  if(!body.email||!body.password)throw Error();
  const {error}=await db.auth.signInWithPassword({email:body.email,password:body.password});
  if(error)return Response.json({error:error.status&&error.status>=500?'Inloggningstjänsten är tillfälligt otillgänglig. Försök igen.':'Inloggningen kunde inte genomföras. Kontrollera uppgifterna.'},{status:error.status&&error.status>=500?503:401});
  return Response.json({ok:true});
 }catch{return Response.json({error:'Kontrollera uppgifterna och försök igen.'},{status:400})}
}
