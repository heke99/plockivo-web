import {sessionClient,env,sameOrigin} from '@/lib/supabase';
export const dynamic='force-dynamic';
const routes=/^(context|catalog|merchant-profile|merchant-domains(?:\/[a-f0-9-]{36}\/remove)?|invitations(?:\/(?:options|preview|accept|[a-f0-9-]{36}\/revoke))?|carts\/(?:current|save|[a-f0-9-]{36}\/submit)|purchase-intents(?:\/[a-f0-9-]{36}(?:\/(?:confirm|approval))?)?)$/;
async function proxy(req:Request,ctx:{params:Promise<{path:string[]}>}){
 const path=(await ctx.params).path.join('/');if(!routes.test(path))return new Response(null,{status:404});
 if(req.method==='POST'&&!sameOrigin(req))return new Response(null,{status:403});
 // Transport only. API independently validates this token with getUser before any business read or write.
 const db=await sessionClient();
 const {data:{session}}=await db.auth.getSession();
 if(!session)return new Response(null,{status:401});
 const body=req.method==='POST'?await req.text():undefined;
 if(body&&new TextEncoder().encode(body).length>32768)return new Response(null,{status:413});
 const url=new URL('v1/'+path,env().API_URL.replace(/\/?$/,'/'));
 const query=new URL(req.url).searchParams;
 for(const key of ['membership_id','tenant_id','customer_account_id','store_id','project_id','q'])if(query.has(key))url.searchParams.set(key,query.get(key)!);
 try{
  const protection=process.env.API_AUTOMATION_BYPASS_SECRET;
  const result=await fetch(url,{method:req.method,headers:{...(protection?{'x-vercel-protection-bypass':protection}:{}),Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json','Idempotency-Key':req.headers.get('idempotency-key')??''},body,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(40000)});
  return new Response(result.body,{status:result.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Correlation-ID':result.headers.get('x-correlation-id')??''}});
 }catch{return Response.json({error:{code:'OUTCOME_UNKNOWN',message:'Svaret kunde inte hämtas. Kontrollera samma köp innan du försöker igen.'}},{status:503,headers:{'Cache-Control':'no-store'}})}
}
export const GET=proxy;export const POST=proxy;

