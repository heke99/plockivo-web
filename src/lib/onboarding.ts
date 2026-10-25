import {z} from 'zod';
export const activationInput=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),email:z.email().max(254).transform(s=>s.toLowerCase()),password:z.string().min(12).max(128)}).strict();
type Dependencies={enabled:boolean;confirmationsVerified:boolean;allowed:(token:string,email:string)=>Promise<boolean>;signup:(email:string,password:string)=>Promise<{error:boolean;session:boolean}>;clearSession:()=>Promise<void>};
export async function activateAccount(input:unknown,deps:Dependencies):Promise<{status:number;body:{message?:string;error?:string}}>{
 if(!deps.enabled||!deps.confirmationsVerified)return {status:503,body:{error:'Kontoaktivering är inte tillgänglig ännu. Kontakta din handlare.'}};
 const parsed=activationInput.safeParse(input);if(!parsed.success)return {status:400,body:{error:'Kontrollera inbjudan, e-postadressen och lösenordet.'}};
 const {token,email,password}=parsed.data;
 if(!await deps.allowed(token,email))return {status:400,body:{error:'Inbjudan kan inte användas för kontoaktivering. Be handlaren om hjälp.'}};
 const result=await deps.signup(email,password);
 if(result.session){await deps.clearSession();return {status:503,body:{error:'Kontoaktiveringen kunde inte verifieras. Kontakta din handlare.'}}}
 if(result.error)return {status:503,body:{error:'Kontoaktiveringen kunde inte genomföras. Försök igen senare eller kontakta din handlare.'}};
 return {status:202,body:{message:'Om adressen kan registreras skickas en verifieringslänk. Har du redan ett konto, logga in. Öppna sedan den ursprungliga inbjudningslänken för att granska och acceptera mandatet.'}};
}
