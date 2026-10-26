import {test} from 'node:test';import assert from 'node:assert/strict';
import {productionProxyRoute} from '../src/lib/production-proxy-routes.ts';
const id='00000000-0000-4000-8000-000000000001';
test('standalone BFF admits only documented method/path combinations',()=>{for(const method of ['GET','POST'])assert(productionProxyRoute('production/setup',method));assert(productionProxyRoute('production/orders','GET'));assert(!productionProxyRoute('production/orders','POST'));for(const path of ['catalog','stock','stores','projects','invitation-access']){assert(productionProxyRoute('production/'+path,'POST'));assert(!productionProxyRoute('production/'+path,'GET'))}assert(productionProxyRoute('merchant-bootstrap','POST'));for(const suffix of ['', '/billing']){assert(productionProxyRoute('production/orders/'+id+suffix,'GET'));assert(!productionProxyRoute('production/orders/'+id+suffix,'POST'))}for(const op of ['complete','cancel']){assert(productionProxyRoute('production/orders/'+id+'/'+op,'POST'));assert(!productionProxyRoute('production/orders/'+id+'/'+op,'GET'))}});
test('standalone BFF rejects arbitrary paths, methods and malformed order identifiers',()=>{for(const path of ['production/setup/extra','production/orders/bad','production/orders/'+id+'/delete','production/../setup','production//setup','catalog','merchant-bootstrap/extra','production/orders/'+id+'/billing/extra'])for(const method of ['GET','POST','DELETE'])assert(!productionProxyRoute(path,method));for(const method of ['DELETE','PATCH','PUT'])assert(!productionProxyRoute('production/setup',method))});

test('receivables transport admits exact read and payment methods only',()=>{
 assert(productionProxyRoute('production/orders/'+id+'/receivables','GET'));
 assert(!productionProxyRoute('production/orders/'+id+'/receivables','POST'));
 for(const suffix of ['/payments','/payments/reverse']){
  assert(productionProxyRoute('production/orders/'+id+suffix,'POST'));
  for(const method of ['GET','DELETE','PATCH','PUT'])assert(!productionProxyRoute('production/orders/'+id+suffix,method));
 }
 for(const suffix of ['/payments/extra','/payments/reverse/extra','/receivables/extra','/payments//reverse','/payments/../reverse'])for(const method of ['GET','POST'])assert(!productionProxyRoute('production/orders/'+id+suffix,method));
 assert(!productionProxyRoute('production/orders/bad/payments','POST'));
});
