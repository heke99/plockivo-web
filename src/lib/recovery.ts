type AuthError={status?:number;code?:string}|null;
export const resetMessage='Om adressen har ett konto och kan ta emot mejl skickas instruktioner. Kontrollera även skräpposten.';
export function callbackDestination(requestUrl:string,configuredOrigin:string){
 const u=new URL(requestUrl),mode=u.searchParams.get('mode');
 const validMode=mode===null||mode==='recovery'||mode==='activation';
 const code=u.searchParams.get('code');
 return {code:validMode&&code&&code.length<=2048&&!u.searchParams.has('error')?code:null,
 success:new URL(mode==='activation'?'/app?activated=1':'/app?recovery=1',configuredOrigin).href,
 failure:new URL('/app?auth_error=1',configuredOrigin).href};
}
export async function requestPasswordReset(email:string,origin:string,enabled:boolean,send:(email:string,redirectTo:string)=>Promise<{error:AuthError}>){
 if(!enabled)return {status:503,body:{error:'Återställning via mejl är ännu inte aktiverad. Kontakta din kontaktperson för hjälp.'}};
 try{
  const {error}=await send(email,new URL('/auth/callback?mode=recovery',origin).href);
  // Do not distinguish invalid/unknown/SSO-only/rate-limited accounts in this public endpoint.
  if(error&&(!error.status||error.status>=500))return {status:503,body:{error:'Återställningstjänsten är tillfälligt otillgänglig. Försök igen senare.'}};
  return {status:200,body:{ok:true,message:resetMessage}};
 }catch{return {status:503,body:{error:'Återställningstjänsten är tillfälligt otillgänglig. Försök igen senare.'}}}
}
type PasswordClient={auth:{getUser:()=>Promise<{data:{user:unknown};error?:AuthError}>;updateUser:(input:{password:string})=>Promise<{error:AuthError}>;signOut:(input:{scope:'global'})=>Promise<{error:AuthError}>};rpc:(name:'get_security_state'|'revoke_my_sessions')=>PromiseLike<{data:unknown;error:unknown}>};
export async function changeAccountPassword(db:PasswordClient,password:string){
 const identity=await db.auth.getUser();
 if(identity.error||!identity.data.user)return {status:401,body:{error:'Logga in via en giltig återställningslänk eller ditt personliga konto.'}};
 const state=await db.rpc('get_security_state');
 if(state.error)return {status:503,body:{error:'Säkerhetskontrollen kunde inte genomföras. Försök igen.'}};
 if(!state.data||typeof state.data!=='object'||!('satisfied'in state.data)||state.data.satisfied!==true)return {status:403,body:{error:'Bekräfta din inloggning med en engångskod först.'}};
 const updated=await db.auth.updateUser({password});
 if(updated.error)return {status:400,body:{error:'Lösenordet kunde inte ändras. Kontrollera att det uppfyller kraven och försök igen.'}};
 const revoked=await db.rpc('revoke_my_sessions');
 if(revoked.error){await db.auth.signOut({scope:'global'}).catch(()=>({error:true}));return {status:503,body:{error:'Lösenordet är ändrat, men spärren av tidigare inloggningar kunde inte bekräftas. Logga in igen och återkalla dina inloggningar under Kontosäkerhet.'}};}
 const signedOut=await db.auth.signOut({scope:'global'});
 if(signedOut.error)return {status:503,body:{error:'Lösenordet är ändrat, men utloggningen kunde inte bekräftas. Logga ut och kontakta support om du misstänker obehörig åtkomst.'}};
 return {status:200,body:{ok:true}};
}
