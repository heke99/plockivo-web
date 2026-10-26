const uuid='[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';
const productionOrder=new RegExp('^production/orders/'+uuid+'$');
const productionBilling=new RegExp('^production/orders/'+uuid+'/billing$');
const productionReceivables=new RegExp('^production/orders/'+uuid+'/receivables$');
const productionPayment=new RegExp('^production/orders/'+uuid+'/payments(?:/reverse)?$');
const productionOrderMutation=new RegExp('^production/orders/'+uuid+'/(?:complete|cancel)$');
/** Transport allowlist only. API independently verifies identity, scope and operation. */
export function productionProxyRoute(path:string,method:string):boolean{
 if(path==='production/setup')return method==='GET'||method==='POST';
 if(path==='production/orders')return method==='GET';
 if(/^production\/(?:catalog|stock|stores|projects|invitation-access)$/.test(path)||path==='merchant-bootstrap')return method==='POST';
 if(productionOrder.test(path)||productionBilling.test(path)||productionReceivables.test(path))return method==='GET';
 if(productionOrderMutation.test(path)||productionPayment.test(path))return method==='POST';
 return false;
}
