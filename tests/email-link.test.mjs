import {test} from 'node:test';import assert from 'node:assert/strict';
import {readEmailLink,confirmEmailLink,invalidEmailLink} from '../src/lib/email-link.ts';
const hash='a'.repeat(64);
test('email fragment is portable without PKCE state and reading it makes no verification call',()=>{
 for(const type of ['signup','recovery','invite'])assert.deepEqual(readEmailLink('#token_hash='+hash+'&type='+type),{token_hash:hash,type});
 for(const fragment of ['',`#token_hash=${hash}&type=recovery&type=signup`,`#token_hash=${hash}&type=recovery&next=https://evil.test`,`#token_hash=x&type=recovery`,`#token_hash=${hash}&type=magiclink`,`#token_hash=${hash}&type=email_change`])assert.equal(readEmailLink(fragment),null);
});
test('invalid email proof fails before provider, and fixed destinations ignore client redirects',async()=>{
 let calls=0;const verify=async()=>{calls++;return {error:false,session:true}};
 for(const input of [{token_hash:hash,type:'recovery',next:'https://evil.test'},{token_hash:'x',type:'invite'},{token_hash:hash,type:'email_change'}])assert.equal((await confirmEmailLink(input,verify)).status,400);
 assert.equal(calls,0);
 for(const [type,target] of [['signup','/app?activated=1'],['invite','/app?recovery=1'],['recovery','/app?recovery=1']])assert.deepEqual(await confirmEmailLink({type,token_hash:hash},verify),{status:200,body:{redirect:target}});
});
test('expired/replayed links and missing sessions never navigate; outages conceal provider details',async()=>{
 for(const result of [{error:true,session:false},{error:false,session:false}])assert.deepEqual(await confirmEmailLink({type:'recovery',token_hash:hash},async()=>result),{status:400,body:{error:invalidEmailLink}});
 const outage=await confirmEmailLink({type:'recovery',token_hash:hash},async()=>{throw Error('provider secret')});assert.equal(outage.status,503);assert.equal(JSON.stringify(outage).includes('provider secret'),false);
});
