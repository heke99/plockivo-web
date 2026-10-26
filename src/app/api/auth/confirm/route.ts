import {sessionClient,sameOrigin} from '@/lib/supabase';
import {confirmEmailLink} from '@/lib/email-link';
export const dynamic='force-dynamic';
function json(body:unknown,status:number){return Response.json(body,{status,headers:{'Cache-Control':'no-store','Pragma':'no-cache','Referrer-Policy':'no-referrer'}})}
// No GET verification: link scanners must not consume single-use credentials.
export async function POST(req:Request){
 if(!sameOrigin(req))return json({error:'Förfrågan kunde inte verifieras.'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'Kontrollera förfrågan.'},415);
 try{
  if(Number(req.headers.get('content-length')??0)>1024)return json({error:'För stor förfrågan.'},413);
  const raw=await req.text();if(new TextEncoder().encode(raw).length>1024)return json({error:'För stor förfrågan.'},413);
  const result=await confirmEmailLink(JSON.parse(raw),async proof=>{
   const db=await sessionClient();
   const {data,error}=await db.auth.verifyOtp(proof);
   return {error:!!error,session:!!data.session};
  });
  return json(result.body,result.status);
 }catch{return json({error:'Bekräftelsen kunde inte slutföras. Öppna länken igen eller begär en ny.'},400)}
}
