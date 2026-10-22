/** Origin is authoritative when present; Fetch Metadata covers browsers that omit it for same-origin POST. */
export function trustedRequestOrigin(req:Request,configuredOrigin:string){
 const expected=new URL(configuredOrigin).origin;
 const origin=req.headers.get('origin');
 if(origin!==null)return origin===expected;
 const trustedUrl=new URL(req.url).origin===expected;
 const metadata=req.headers.get('sec-fetch-site')==='same-origin';
 // A cross-origin site cannot add this non-simple header without a successful CORS preflight.
 // No cross-origin access is enabled on these routes. Explicit foreign/null Origin is always denied above.
 const customHeader=req.headers.get('x-plockivo-request')==='1'&&req.headers.get('content-type')?.startsWith('application/json');
 return trustedUrl&&(metadata||!!customHeader);
}
