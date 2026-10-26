import {z} from 'zod';
/** Public Auth settings are provider-owned. Strings, absent flags and outages fail closed. */
export function permitsVerifiedEmailSignup(value:unknown):boolean{
 if(!value||typeof value!=='object')return false;
 const policy=value as {external?:{email?:unknown};disable_signup?:unknown;mailer_autoconfirm?:unknown};
 return policy.external?.email===true&&policy.disable_signup===false&&policy.mailer_autoconfirm===false;
}
export async function verifiedEmailSignupPolicy(url:string,publishableKey:string,fetcher:typeof fetch=fetch):Promise<boolean>{
 try{
  const endpoint=new URL('/auth/v1/settings',url);
  const response=await fetcher(endpoint,{headers:{apikey:publishableKey},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(7000)});
  return response.ok&&permitsVerifiedEmailSignup(await response.json());
 }catch{return false}
}
export const personalRegistrationInput=z.object({email:z.email().max(254).transform(s=>s.toLowerCase()),password:z.string().min(12).max(128)}).strict();
type RegistrationDeps={enabled:boolean;policy:()=>Promise<boolean>;signup:(email:string,password:string)=>Promise<{error:boolean;session:boolean}>;clearSession:()=>Promise<void>};
export async function registerPersonalAccount(input:unknown,deps:RegistrationDeps){
 const parsed=personalRegistrationInput.safeParse(input);
 if(!parsed.success)return {status:400,body:{error:'Kontrollera e-postadressen och välj ett lösenord med 12–128 tecken.'}};
 try{
  if(!deps.enabled||!await deps.policy())return {status:503,body:{error:'Registrering är tillfälligt otillgänglig. Försök igen senare.'}};
  const result=await deps.signup(parsed.data.email,parsed.data.password);
  if(result.session){await deps.clearSession();return {status:503,body:{error:'Registreringen kunde inte verifieras. Försök igen senare.'}}}
  if(result.error)return {status:503,body:{error:'Registreringen kunde inte genomföras. Försök igen senare.'}};
  return {status:202,body:{message:'Om adressen kan registreras skickas en verifieringslänk. Har du redan ett konto kan du logga in. Ett personligt konto ger inga företagsmandat automatiskt.'}};
 }catch{return {status:503,body:{error:'Registreringen kunde inte genomföras. Försök igen senare.'}}}
}
