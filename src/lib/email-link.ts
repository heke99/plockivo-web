import {z} from 'zod';
export const emailLinkInput=z.object({token_hash:z.string().regex(/^[a-f0-9]{32,128}$/i),type:z.enum(['signup','recovery','invite'])}).strict();
export type EmailLinkInput=z.infer<typeof emailLinkInput>;
export const invalidEmailLink='Länken är ogiltig, har gått ut eller har redan använts. Begär en ny länk eller be din kontaktperson om hjälp.';
/** Fragment proof stays out of server access logs. Reading the link never consumes it. */
export function readEmailLink(fragment:string):EmailLinkInput|null{
 const values=new URLSearchParams(fragment.replace(/^#/,''));
 if(values.getAll('token_hash').length!==1||values.getAll('type').length!==1||[...values.keys()].some(k=>k!=='token_hash'&&k!=='type'))return null;
 const parsed=emailLinkInput.safeParse({token_hash:values.get('token_hash'),type:values.get('type')});
 return parsed.success?parsed.data:null;
}
export async function confirmEmailLink(input:unknown,verify:(proof:EmailLinkInput)=>Promise<{error:boolean;session:boolean}>){
 const parsed=emailLinkInput.safeParse(input);
 if(!parsed.success)return {status:400,body:{error:invalidEmailLink}};
 try{
  const result=await verify(parsed.data);
  if(result.error||!result.session)return {status:400,body:{error:invalidEmailLink}};
  return {status:200,body:{redirect:parsed.data.type==='signup'?'/app?activated=1':'/app?recovery=1'}};
 }catch{return {status:503,body:{error:'Bekräftelsen kunde inte slutföras. Försök igen senare.'}}}
}
