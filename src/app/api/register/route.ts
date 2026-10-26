import {sessionClient,sameOrigin,env} from '@/lib/supabase';
import {registerPersonalAccount,verifiedEmailSignupPolicy} from '@/lib/auth-provider-policy';
export const dynamic='force-dynamic';
function json(body:unknown,status:number){return Response.json(body,{status,headers:{'Cache-Control':'no-store'}})}
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'Förfrågan kunde inte verifieras.'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'Kontrollera förfrågan.'},415);
 if(Number(req.headers.get('content-length')??0)>4096)return json({error:'För stor förfrågan.'},413);
 try{
  const raw=await req.text();if(new TextEncoder().encode(raw).length>4096)return json({error:'För stor förfrågan.'},413);
  let input:unknown;try{input=JSON.parse(raw)}catch{return json({error:'Kontrollera förfrågan.'},400)}
  const config=env(),db=await sessionClient();
  const {data:{session}}=await db.auth.getSession();if(session)return json({error:'Du är redan inloggad. Fortsätt till ditt konto.'},409);
  const result=await registerPersonalAccount(input,{
   enabled:process.env.AUTH_EMAIL_DELIVERY_ENABLED==='true',
   policy:()=>verifiedEmailSignupPolicy(config.SUPABASE_URL,config.SUPABASE_PUBLISHABLE_KEY),
   signup:async(email,password)=>{const {data,error}=await db.auth.signUp({email,password,options:{emailRedirectTo:new URL('/auth/callback?mode=activation',config.APP_ORIGIN).href}});return {error:!!error,session:!!data.session}},
   clearSession:async()=>{await db.auth.signOut({scope:'local'})}
  });return json(result.body,result.status);
 }catch{return json({error:'Registrering är tillfälligt otillgänglig. Försök igen senare.'},503)}
}
