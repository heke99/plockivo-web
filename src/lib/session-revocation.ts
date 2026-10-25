export type SessionClient={auth:{getUser:()=>Promise<{data:{user:unknown};error:{status?:number}|null}>;signOut:(options:{scope:'global'})=>Promise<{error:unknown}>};rpc:(name:'revoke_my_sessions')=>PromiseLike<{data:unknown;error:{message?:string}|null}>};
export async function revokeOwnSessions(db:SessionClient){
 const identity=await db.auth.getUser();
 if(identity.error||!identity.data.user)return {status:identity.error&&![400,401,403,404].includes(identity.error.status??0)?503:401,body:{error:'Logga in igen för att hantera dina inloggningar.'}};
 const revoked=await db.rpc('revoke_my_sessions');
 if(revoked.error){const denied=/MFA_REQUIRED|PERMISSION_DENIED/.test(revoked.error.message??'');return {status:denied?403:503,body:{error:denied?'Verifiera din inloggning med en engångskod först.':'Inloggningarna kunde inte spärras. Försök igen.'}}}
 // SQL revocation is authoritative for business access, even during Auth outage.
 const signedOut=await db.auth.signOut({scope:'global'}).catch(()=>({error:true}));
 return {status:200,body:{ok:true,provider_revoked:!signedOut.error,message:signedOut.error?'Dina befintliga inloggningar är spärrade i Plockivo. Inloggningstjänstens utloggning kunde inte bekräftas.':'Du är utloggad från alla enheter.'}};
}
