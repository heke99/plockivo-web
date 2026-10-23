import {NextResponse} from 'next/server';
import {sessionClient,env} from '@/lib/supabase';
export async function GET(req:Request){
 const code=new URL(req.url).searchParams.get('code');
 if(code){const db=await sessionClient();const {error}=await db.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/app?recovery=1',env().APP_ORIGIN));}
 return NextResponse.redirect(new URL('/app?auth_error=1',env().APP_ORIGIN));
}

