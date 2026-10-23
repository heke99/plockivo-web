import {randomUUID} from 'node:crypto';
import {sessionClient,sameOrigin} from '@/lib/supabase';
import {mfaInput} from '@/lib/mfa-input';
export const dynamic='force-dynamic';
function reply(body:unknown,status=200){return Response.json(body,{status,headers:{'Cache-Control':'no-store','Pragma':'no-cache'}})}
function identityFailure(error:{status?:number}|null,user:unknown){
 if(!error&&user)return null;
 if(error&&![400,401,403,404].includes(error.status??0))return reply({code:'AUTH_UNAVAILABLE',error:'Inloggningstjänsten är tillfälligt otillgänglig. Försök igen.'},503);
 return reply({error:'Logga in för att fortsätta.'},401);
}
export async function GET(){
 try{
  const db=await sessionClient();
  const {data:{user},error}=await db.auth.getUser();const denied=identityFailure(error,user);if(denied)return denied;
  const [factors,state]=await Promise.all([db.auth.mfa.listFactors(),db.rpc('get_security_state')]);
  if(factors.error||state.error)return reply({error:'Säkerhetsinställningarna kunde inte hämtas. Försök igen.'},503);
  return reply({state:state.data,factors:factors.data.all.filter(f=>f.factor_type==='totp').map(f=>({id:f.id,status:f.status,name:f.friendly_name??'Autentiseringsapp'}))});
 }catch{return reply({error:'Säkerhetsinställningarna kunde inte hämtas. Försök igen.'},503)}
}
export async function POST(req:Request){
 if(!sameOrigin(req))return reply({error:'Förfrågan kunde inte verifieras.'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({error:'Ogiltig förfrågan.'},415);
 try{
  const raw=await req.text();if(raw.length>2048)return reply({error:'För stor förfrågan.'},413);
  const body=mfaInput.parse(JSON.parse(raw));const db=await sessionClient();
  const {data:{user},error}=await db.auth.getUser();const denied=identityFailure(error,user);if(denied)return denied;
  const {data:factors,error:factorError}=await db.auth.mfa.listFactors();if(factorError)throw Error();
  const all=factors.all.filter(f=>f.factor_type==='totp'),verified=all.filter(f=>f.status==='verified');
  async function prove(id:string,code:string){
   if(!all.some(f=>f.id===id))return false;
   const {error}=await db.auth.mfa.challengeAndVerify({factorId:id,code});return !error;
  }
  const invalid=()=>reply({error:'Koden kunde inte verifieras. Kontrollera appens aktuella kod och försök igen.'},400);
  if(body.action==='verify'){
   if(!await prove(body.factorId,body.code))return invalid();
   return reply({ok:true});
  }
  if(body.action==='enroll'){
   if(verified.length&&(!body.proofFactorId||!body.code||!verified.some(f=>f.id===body.proofFactorId)||!await prove(body.proofFactorId,body.code)))return invalid();
   if(all.length>=5)return reply({error:'Avsluta en påbörjad aktivering eller ta bort en gammal app först.'},409);
   const {data,error}=await db.auth.mfa.enroll({factorType:'totp',friendlyName:'Plockivo '+randomUUID().slice(0,8),issuer:'Plockivo'});
   if(error)throw Error();
   // The setup secret is shown only to this authenticated person; never stored by our app or logged.
   return reply({id:data.id,qr:data.totp.qr_code,secret:data.totp.secret});
  }
  const target=all.find(f=>f.id===body.factorId);if(!target)return reply({error:'Autentiseringsappen kunde inte hittas.'},404);
  if(body.action==='cancel'&&target.status!=='unverified')return reply({error:'En aktiverad app kan bara tas bort med en annan verifierad app.'},403);
  if(body.action==='remove'){
   if(target.status!=='verified'||body.proofFactorId===target.id||!verified.some(f=>f.id===body.proofFactorId))return reply({error:'Lägg till och verifiera en annan autentiseringsapp innan du tar bort denna.'},409);
   if(!await prove(body.proofFactorId,body.code))return invalid();
  }
  const {error:removeError}=await db.auth.mfa.unenroll({factorId:target.id});if(removeError)throw Error();
  const {error:refreshError}=await db.auth.refreshSession();if(refreshError)throw Error();
  return reply({ok:true});
 }catch{return reply({error:'Åtgärden kunde inte genomföras. Kontrollera uppgifterna och försök igen.'},400)}
}
