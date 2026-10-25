import {test} from 'node:test';import assert from 'node:assert/strict';
import {callbackDestination,requestPasswordReset} from '../src/lib/recovery.ts';
test('callback fixes destination to configured origin, isolates activation and rejects invalid modes/errors',()=>{
 const origin='https://app.example.test';
 const r=callbackDestination('https://attacker.test/auth/callback?code=proof&next=https://attacker.test&mode=recovery',origin);
 assert.equal(r.success,origin+'/app?recovery=1');assert.equal(r.failure,origin+'/app?auth_error=1');assert.equal(r.code,'proof');
 assert.equal(callbackDestination('https://attacker.test/?code=x&mode=activation',origin).success,origin+'/app?activated=1');
 for(const query of ['code=x&mode=https://evil.test','code=x&error=expired','code=',''])assert.equal(callbackDestination('https://a.test/?'+query,origin).code,null);
});
test('disabled email never calls provider or claims an email was sent',async()=>{let calls=0;const r=await requestPasswordReset('a@example.test','https://app.test',false,async()=>{calls++;return {error:null}});assert.equal(r.status,503);assert.equal(calls,0);assert.equal('ok'in r.body,false)});
test('reset provider receives fixed callback, and account-specific failures are indistinguishable',async()=>{
 let target;const run=error=>requestPasswordReset('a@example.test','https://app.test',true,async(email,redirectTo)=>{assert.equal(email,'a@example.test');target=redirectTo;return {error}});
 const good=await run(null);assert.equal(target,'https://app.test/auth/callback?mode=recovery');for(const status of [400,401,403,404,422,429])assert.deepEqual(await run({status}),good);
});
test('reset outage is recoverable and does not expose provider payload',async()=>{for(const send of [async()=>({error:{status:503,code:'private provider detail'}}),async()=>{throw Error('private')}]){const r=await requestPasswordReset('a@example.test','https://app.test',true,send);assert.equal(r.status,503);assert.equal(JSON.stringify(r).includes('private'),false)}});
import {changeAccountPassword} from '../src/lib/recovery.ts';
function client({user={},identityError=null,state={satisfied:true},stateError=null,updateError=null,logoutError=null,revokeError=null}={}){const events=[];return {events,db:{auth:{getUser:async()=>{events.push('identity');return {data:{user},error:identityError}},updateUser:async()=>{events.push('change');return {error:updateError}},signOut:async()=>{events.push('global-logout');return {error:logoutError}}},rpc:async name=>{if(name==='revoke_my_sessions'){events.push('revoke');return {data:{},error:revokeError}}events.push('security');return {data:state,error:stateError}}}}}
test('password recovery cannot mutate without verified identity and authoritative MFA state',async()=>{
 for(const config of [{user:null},{identityError:{status:401}},{state:{satisfied:false}},{stateError:{code:'outage'}}]){const c=client(config);const r=await changeAccountPassword(c.db,'long-enough-password');assert(r.status>=400);assert.equal(c.events.includes('change'),false);}
});
test('password change only logs out after successful persistence and reports incomplete logout',async()=>{
 const good=client();assert.equal((await changeAccountPassword(good.db,'long-enough-password')).status,200);assert.deepEqual(good.events,['identity','security','change','revoke','global-logout']);
 const failed=client({updateError:{status:400}});assert.equal((await changeAccountPassword(failed.db,'long-enough-password')).status,400);assert.equal(failed.events.includes('global-logout'),false);
 const partial=client({logoutError:{status:503}});const r=await changeAccountPassword(partial.db,'long-enough-password');assert.equal(r.status,503);assert.match(r.body.error,/Lösenordet är ändrat/);
});

test('password persistence precedes authoritative old-session revocation; revocation failure is partial outcome',async()=>{const c=client({revokeError:{message:'outage'}});const r=await changeAccountPassword(c.db,'long-enough-password');assert.equal(r.status,503);assert.match(r.body.error,/Lösenordet är ändrat/);assert.deepEqual(c.events,['identity','security','change','revoke','global-logout'])});
