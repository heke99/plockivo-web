export async function standaloneRequest<T>(path:string,body?:unknown,key?:string):Promise<T>{
 const r=await fetch('/api/backend/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json','X-Plockivo-Request':'1','Idempotency-Key':key!}:undefined,body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(30000)}).catch(()=>{throw Error('Svaret kunde inte hämtas. Hämta aktuell lista eller försök igen med samma uppgifter.')});
 const payload=await r.json().catch(()=>null);if(!r.ok){const error=new Error(payload?.error?.message??'Åtgärden kunde inte slutföras.') as Error&{conflict?:boolean};error.conflict=r.status===409;throw error}return payload.data;
}
