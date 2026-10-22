import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {trustedRequestOrigin} from './origin';
const schema=z.object({SUPABASE_URL:z.url(),SUPABASE_PUBLISHABLE_KEY:z.string().min(20),APP_ORIGIN:z.url(),API_URL:z.url()});
export function env(){return schema.parse(process.env)}
export async function sessionClient(){
 const e=env(),jar=await cookies();
 return createServerClient(e.SUPABASE_URL,e.SUPABASE_PUBLISHABLE_KEY,{global:{fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})},cookieOptions:{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'},cookies:{getAll(){return jar.getAll()},setAll(values){for(const {name,value,options}of values)jar.set(name,value,{...options,httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'});}}});
}
export function sameOrigin(req:Request){return trustedRequestOrigin(req,env().APP_ORIGIN)}
