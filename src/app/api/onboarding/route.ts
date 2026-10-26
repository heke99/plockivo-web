import {createClient} from '@supabase/supabase-js';
import {sessionClient,sameOrigin,env} from '@/lib/supabase';
import {activateAccount} from '@/lib/onboarding';
import {verifiedEmailSignupPolicy} from '@/lib/auth-provider-policy';
export const dynamic='force-dynamic';
function json(body:unknown,status:number){return Response.json(body,{status,headers:{'Cache-Control':'no-store'}})}
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'Förfrågan kunde inte verifieras.'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'Kontrollera förfrågan.'},415);
 try{
  const raw=await req.text();if(new TextEncoder().encode(raw).length>4096)return json({error:'För stor förfrågan.'},413);
  const config=env();
  const anon=createClient(config.SUPABASE_URL,config.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})}});
  const db=await sessionClient();
  const {data:{session}}=await db.auth.getSession();if(session)return json({error:'Du är redan inloggad. Öppna inbjudningslänken för att fortsätta.'},409);
  const result=await activateAccount(JSON.parse(raw),{
   enabled:process.env.AUTH_EMAIL_DELIVERY_ENABLED==='true',confirmationsVerified:await verifiedEmailSignupPolicy(config.SUPABASE_URL,config.SUPABASE_PUBLISHABLE_KEY),
   allowed:async(token,email)=>{const {data,error}=await anon.rpc('invitation_signup_allowed',{p_token:token,p_email:email});if(error)throw Error('precheck');return data===true},
   signup:async(email,password)=>{const {data,error}=await db.auth.signUp({email,password,options:{emailRedirectTo:new URL('/auth/callback?mode=activation',config.APP_ORIGIN).href}});return {error:!!error,session:!!data.session}},
   clearSession:async()=>{await db.auth.signOut({scope:'local'})}
  });return json(result.body,result.status);
 }catch{return json({error:'Kontoaktiveringen kunde inte genomföras. Försök igen senare.'},503)}
}
