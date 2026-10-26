import {test} from 'node:test';
import assert from 'node:assert/strict';
import {purchaseLink,parsePurchaseLink} from '../src/lib/purchase-link.ts';
const id='A1234567-89AB-4CDE-8123-0123456789AB';
test('purchase links have a fixed local destination and canonical identifier',()=>{
 assert.equal(purchaseLink(id),'/app?purchase='+id.toLowerCase());
 assert.equal(parsePurchaseLink('?purchase='+id),id.toLowerCase());
 assert.equal(parsePurchaseLink('?purchase='+id+'&next=https://other.test'),id.toLowerCase());
});
test('purchase links reject external paths, tokens and malformed identifiers',()=>{
 for(const value of ['https://evil.test','//evil.test','../app','x','',id+' ',id+'?token=secret'])assert.throws(()=>purchaseLink(value));
 for(const query of ['', '?purchase=', '?purchase=x', '?purchase='+id+'&purchase='+id, '?purchase='+id+'%20','https://evil.test/app?purchase='+id,'purchase='+id,'?purchase='+id+'#secret','?purchase='+id+'&x='+'x'.repeat(4096)])assert.equal(parsePurchaseLink(query),null);
});
test('unrelated authentication query parameters do not become purchase IDs',()=>{
 assert.equal(parsePurchaseLink('?recovery=1&token_hash=proof&next=/app'),null);
 assert.equal(parsePurchaseLink('?purchase=%61'+id.slice(1)),id.toLowerCase());
});
