import {NextResponse} from 'next/server';
import {sessionClient,env} from '@/lib/supabase';
import {callbackDestination} from '@/lib/recovery';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const destination=callbackDestination(req.url,env().APP_ORIGIN);
 let target=destination.failure;
 try{if(destination.code){const db=await sessionClient();const {error}=await db.auth.exchangeCodeForSession(destination.code);if(!error)target=destination.success;}}catch{/* No provider details or bearer proof in redirects. */}
 const response=NextResponse.redirect(target,303);
 response.headers.set('Cache-Control','no-store');response.headers.set('Pragma','no-cache');response.headers.set('Referrer-Policy','no-referrer');
 return response;
}
