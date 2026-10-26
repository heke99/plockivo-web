// Purchase IDs locate records only. The API remains responsible for identity,
// membership, tenant scope and permission checks on every read.
const purchaseId=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function normalizedId(value:string){return purchaseId.test(value)?value.toLowerCase():null}
/** Fixed local destination: no origin, redirect target or authorization token. */
export function purchaseLink(id:string):string{
 const normalized=normalizedId(id);
 if(!normalized)throw new Error('Invalid purchase ID');
 return '/app?purchase='+normalized;
}
/** Parse location.search, not an arbitrary URL. Invalid/ambiguous input is ignored. */
export function parsePurchaseLink(search:string):string|null{
 if(search.length>4096||(!search.startsWith('?')&&search!==''))return null;
 const params=new URLSearchParams(search);
 const values=params.getAll('purchase');
 return values.length===1?normalizedId(values[0]):null;
}
