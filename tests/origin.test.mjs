import {test} from 'node:test';import assert from 'node:assert/strict';
import {trustedRequestOrigin} from '../src/lib/origin.ts';
const expected='https://app.plockivo.com';
const request=headers=>new Request(expected+'/api/session',{method:'POST',headers});
test('explicit Origin must match exactly, including null Origin rejection',()=>{assert(trustedRequestOrigin(request({Origin:expected}),expected));for(const Origin of ['null','https://evil.invalid','https://app.plockivo.com.evil.invalid'])assert(!trustedRequestOrigin(request({Origin,'Sec-Fetch-Site':'same-origin'}),expected))});
test('omitted Origin requires both same-origin Fetch Metadata and configured request origin',()=>{assert(trustedRequestOrigin(request({'Sec-Fetch-Site':'same-origin'}),expected));for(const value of ['cross-site','same-site','none'])assert(!trustedRequestOrigin(request({'Sec-Fetch-Site':value}),expected));assert(!trustedRequestOrigin(request({}),expected));assert(!trustedRequestOrigin(new Request('https://evil.invalid/api/session',{method:'POST',headers:{'Sec-Fetch-Site':'same-origin'}}),expected))});

test('non-simple same-origin JSON header fallback; foreign Origin still denied',()=>{const h={'X-Plockivo-Request':'1','Content-Type':'application/json'};assert(trustedRequestOrigin(request(h),expected));assert(!trustedRequestOrigin(request({...h,Origin:'https://evil.invalid'}),expected));assert(!trustedRequestOrigin(request({'X-Plockivo-Request':'1','Content-Type':'text/plain'}),expected))});
