// Real Auth + BFF + API + DB. Synthetic fixture only; never print setup keys/cookies/passwords.
const {readFileSync,writeFileSync}=require('node:fs');
const {spawn}=require('node:child_process');
const {createHmac}=require('node:crypto');
const assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const access=JSON.parse(readFileSync(process.env.MFA_TEST_ACCESS_FILE??'/tmp/plockivo-mfa-test.json','utf8'));
const root=path.resolve(__dirname,'../..'),origin=process.env.MFA_TEST_ORIGIN??'http://127.0.0.1:3000';
const children=[];const errors=[];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const used=new Map();
async function code(secret){
 let step=Math.floor(Date.now()/30000);
 if(used.get(secret)===step){await delay(30050-Date.now()%30000);step=Math.floor(Date.now()/30000)}
 used.set(secret,step);
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';
 for(const c of secret.toUpperCase().replace(/=+$/,''))bits+=alphabet.indexOf(c).toString(2).padStart(5,'0');
 const key=Buffer.from(bits.match(/.{8}/g).map(b=>parseInt(b,2))),counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(step));
 const h=createHmac('sha1',key).update(counter).digest(),offset=h[19]&15;
 return ((h.readUInt32BE(offset)&0x7fffffff)%1000000).toString().padStart(6,'0');
}
function serve(cwd,port,env={}){
 const p=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd,env:{...process.env,...env},stdio:['ignore','pipe','pipe']});
 p.stdout.on('data',()=>{});p.stderr.on('data',()=>{});children.push(p);
}
async function ready(url){for(let i=0;i<40;i++){try{if((await fetch(url)).ok)return}catch{}await delay(250)}throw Error('Server unavailable')}
let browser,activePage;
(async()=>{
 if(!process.env.MFA_TEST_ORIGIN){serve(path.resolve(root,'../plockivo'),3001);serve(root,3000,{APP_ORIGIN:origin,API_URL:'http://127.0.0.1:3001'});await ready('http://127.0.0.1:3001/v1/health');await ready(origin);console.log('Local servers ready')}
 const proxyUrl=process.env.MFA_TEST_ORIGIN&&process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
 browser=await chromium.launch({headless:true,...(proxyUrl?{proxy:{server:proxyUrl.protocol+'//'+proxyUrl.host,...(proxyUrl.username?{username:decodeURIComponent(proxyUrl.username),password:decodeURIComponent(proxyUrl.password)}:{})}}:{}),executablePath:process.env.MFA_BROWSER_PATH??'/tmp/plockivo-browser/chrome-linux64/chrome',args:['--no-sandbox']});
 console.log('Browser launched');
 const context=await browser.newContext({viewport:{width:1440,height:1000},...(access.bypass?{extraHTTPHeaders:{'x-vercel-protection-bypass':access.bypass}}:{})}),page=await context.newPage();
 activePage=page;page.setDefaultTimeout(60000);page.setDefaultNavigationTimeout(30000);
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin);console.log('Page loaded');
 async function api(url,body){return page.evaluate(async({url,body})=>{const r=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json','X-Plockivo-Request':'1','Idempotency-Key':crypto.randomUUID()}:undefined,body:body?JSON.stringify(body):undefined});const text=await r.text();return {status:r.status,cache:r.headers.get('cache-control'),data:text?JSON.parse(text):null}},{url,body})}
 async function state(){const r=await api('/api/mfa');assert.equal(r.status,200);assert.equal(r.cache,'no-store');return r.data}
 async function login(){await page.getByLabel('E-postadress').fill(access.email);await page.getByLabel('Lösenord',{exact:true}).fill(access.password);const response=page.waitForResponse(r=>r.url().endsWith('/api/session')&&r.request().method()==='POST');await page.getByRole('button',{name:/^Logga in/}).click();const result=await response;if(result.status()!==200)throw Error('Login HTTP '+result.status()+' '+(await result.json()).error)}
 async function enter(value,button){await page.getByLabel('Engångskod',{exact:true}).fill(value);await page.getByRole('button',{name:button,exact:true}).click()}
 if(process.env.MFA_SMOKE==='1'){
  await login();await page.getByRole('heading',{name:'Bekräfta din inloggning'}).waitFor();
  assert.equal((await api('/api/backend/context')).status,403);
  await delay(30050-Date.now()%30000);
  await enter(await code(access.factorSecret),'Bekräfta och fortsätt');
  await page.getByRole('heading',{name:'Plocka. Skanna. Klart.'}).waitFor();
  assert.equal((await api('/api/backend/context')).status,200);
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Kontosäkerhet',exact:true}).click();
  await page.getByRole('heading',{name:'Säkerhet & autentiseringsappar'}).waitFor();await page.screenshot({path:'/tmp/plockivo-mfa-mobile.png',fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const cookies=await context.cookies();const sessionCookies=cookies.filter(c=>c.name.includes('auth-token'));assert(sessionCookies.length>0);assert(sessionCookies.every(c=>c.httpOnly&&c.secure&&!c.domain.startsWith('.')));
  await page.getByRole('button',{name:/Logga ut/}).click();assert.equal((await api('/api/backend/context')).status,401);
  assert.deepEqual(errors,[]);console.log('PASS: deployed MFA login challenge, protected API 403→200, mobile labels, Secure HttpOnly host-only session and logout/401');return;
 }
 assert.equal((await api('/api/mfa')).status,401);
 assert.equal((await api('/api/mfa',{action:'enroll'})).status,401);
 const foreign=await fetch(origin+'/api/mfa',{method:'POST',headers:{Origin:'https://foreign.invalid','Content-Type':'application/json',...(access.bypass?{'x-vercel-protection-bypass':access.bypass}:{})},body:'{"action":"enroll"}'});assert.equal(foreign.status,403);
 console.log('Anonymous and Origin checks passed');await login();const a=await api('/api/mfa'),b=await api('/api/backend/context');console.log('Login readback',{mfaStatus:a.status,state:a.data?.state,apiStatus:b.status,error:b.data?.error?.code});await page.getByRole('heading',{name:'Plocka. Skanna. Klart.'}).waitFor();console.log('Password login passed');
 assert.equal((await state()).state.satisfied,true);
 await page.getByRole('button',{name:/Kontosäkerhet/}).click();
 await page.getByRole('button',{name:'Aktivera tvåstegsverifiering',exact:true}).click();
 console.log('Enrollment requested');const first=await page.getByLabel('Manuell nyckel',{exact:true}).inputValue();
 writeFileSync(process.env.MFA_TEST_ACCESS_FILE??'/tmp/plockivo-mfa-test.json',JSON.stringify({...access,factorSecret:first}),{mode:0o600});
 const id1=(await state()).factors.find(f=>f.status==='unverified').id;
 const wrong=await api('/api/mfa',{action:'verify',factorId:id1,code:'abcdef'});assert.equal(wrong.status,400);
 const valid=await code(first),bad=String((Number(valid)+1)%1000000).padStart(6,'0');
 assert.equal((await api('/api/mfa',{action:'verify',factorId:id1,code:bad})).status,400);
 await enter(valid,'Aktivera tvåstegsverifiering');
 await page.getByText('Din inloggning är verifierad.',{exact:true}).waitFor();assert.equal((await state()).state.satisfied,true);
 await page.reload();await page.getByRole('heading',{name:'Plocka. Skanna. Klart.'}).waitFor();console.log('Enrollment survived reload');await page.getByRole('button',{name:/Kontosäkerhet/}).click();
 assert.equal((await state()).state.enrolled,true);
 assert.equal((await api('/api/mfa',{action:'cancel',factorId:id1})).status,403);
 assert.equal((await api('/api/mfa',{action:'remove',factorId:id1,proofFactorId:id1,code:valid})).status,409);
 assert.equal((await api('/api/mfa',{action:'verify',factorId:'00000000-0000-4000-8000-000000000099',code:valid})).status,400);
 await page.getByRole('button',{name:/Logga ut/}).click();await page.getByRole('button',{name:/^Logga in/}).waitFor();
 await login();await page.getByRole('heading',{name:'Bekräfta din inloggning'}).waitFor();
 assert.equal((await api('/api/backend/context')).status,403);
 assert.equal((await api('/api/session',{action:'password',password:access.password})).status,403);
 await page.reload();await page.getByRole('heading',{name:'Bekräfta din inloggning'}).waitFor();
 await enter(await code(first),'Bekräfta och fortsätt');await page.getByRole('heading',{name:'Plocka. Skanna. Klart.'}).waitFor();
 console.log('PASS: browser enrollment, invalid code/factor, persistence, mandatory login challenge, API/password bypass denied');
 await page.getByRole('button',{name:/Kontosäkerhet/}).click();
 await page.getByLabel('Engångskod',{exact:true}).fill(await code(first));
 await page.getByRole('button',{name:'Lägg till ytterligare en app',exact:true}).click();
 const second=await page.getByLabel('Manuell nyckel',{exact:true}).inputValue();
 await enter(await code(second),'Aktivera tvåstegsverifiering');await page.getByText('Din inloggning är verifierad.',{exact:true}).waitFor();
 let current=await state();assert.equal(current.factors.filter(f=>f.status==='verified').length,2);
 const id2=current.factors.find(f=>f.id!==id1&&f.status==='verified').id;
 assert.equal((await api('/api/mfa',{action:'remove',factorId:id1,proofFactorId:id2,code:await code(second)})).status,200);
 current=await state();assert.equal(current.factors.filter(f=>f.status==='verified').length,1);assert.equal(current.factors[0].id,id2);
 // Pending activation survives reload and can be cancelled without changing membership.
 const pending=await api('/api/mfa',{action:'enroll',proofFactorId:id2,code:await code(second)});assert.equal(pending.status,200);
 assert.equal((await api('/api/mfa',{action:'cancel',factorId:pending.data.id})).status,200);
 assert.equal((await state()).factors.length,1);
 console.log('PASS: second app verified, old app removed with retained factor, pending enrollment cancelled');
 await page.getByRole('button',{name:/Skanna & handla/}).click();
 await page.getByLabel('Streckkod, artikelnummer eller namn').fill('7350000000001');await page.getByRole('button',{name:'Sök →',exact:true}).click();
 await page.getByRole('button',{name:'Lägg till E2E Skruv Test'}).click();
 await page.getByLabel('Mängd E2E Skruv Test').fill('2');await page.getByLabel('Kundreferens').fill('MFA-005');
 await page.getByText('Varukorgen är sparad',{exact:true}).waitFor();await page.reload();
 assert.equal(await page.getByLabel('Kundreferens').inputValue(),'MFA-005');
 await page.getByRole('button',{name:'Granska pris & fortsätt ↗',exact:true}).click();await page.getByRole('button',{name:'Bekräfta testköp ↗',exact:true}).click();
 await page.getByText('Testordern är accepterad. Detta är inte ett klartecken för fysisk utlämning.',{exact:true}).waitFor();
 console.log('PASS: post-MFA saved cart and test order');await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:/Kontosäkerhet/}).click();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const cookies=await context.cookies();assert(cookies.filter(c=>c.name.includes('auth-token')).every(c=>c.httpOnly&&!c.domain.startsWith('.')&&(!origin.startsWith('https:')||c.secure)));
 await page.getByRole('button',{name:/Logga ut/}).click();assert.equal((await api('/api/backend/context')).status,401);
 writeFileSync(process.env.MFA_TEST_ACCESS_FILE??'/tmp/plockivo-mfa-test.json',JSON.stringify({...access,factorSecret:second}),{mode:0o600});
 assert.deepEqual(errors,[]);console.log('PASS: post-MFA saved cart/reload/order, mobile security page, HttpOnly host-only cookies, logout and no pageerrors');
})().catch(async e=>{console.error(e.stack);if(activePage)console.log('UI failure state',await activePage.evaluate(()=>({headings:[...document.querySelectorAll('h1,h2')].map(x=>x.textContent),buttons:[...document.querySelectorAll('button')].map(x=>({label:x.textContent,disabled:x.disabled,visible:!!x.getClientRects().length}))})));process.exitCode=1}).finally(async()=>{await browser?.close();for(const p of children)p.kill('SIGTERM')});
