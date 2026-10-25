import {cookies} from 'next/headers';
import {sessionClient,sameOrigin} from '@/lib/supabase';
import {revokeOwnSessions} from '@/lib/session-revocation';
export const dynamic='force-dynamic';
function reply(body:unknown,status:number){return Response.json(body,{status,headers:{'Cache-Control':'no-store','Pragma':'no-cache'}})}
export async function POST(req:Request){
 if(!sameOrigin(req))return reply({error:'Förfrågan kunde inte verifieras.'},403);
 if(!req.headers.get('content-type')?.startsWith('application/json'))return reply({error:'Ogiltig förfrågan.'},415);
 try{
  const raw=await req.text();if(raw.length>128)return reply({error:'För stor förfrågan.'},413);
  const body=JSON.parse(raw);if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==1||body.confirm!==true)return reply({error:'Bekräfta utloggningen.'},400);
  const result=await revokeOwnSessions(await sessionClient());
  if(result.status===200){const jar=await cookies();for(const c of jar.getAll())if(/^sb-.+-auth-token(?:\.\d+)?$/.test(c.name))jar.set(c.name,'',{maxAge:0,path:'/',httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax'});}
  return reply(result.body,result.status);
 }catch{return reply({error:'Åtgärden kunde inte slutföras. Försök igen.'},503)}
}
