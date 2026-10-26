import {test} from 'node:test';import assert from 'node:assert/strict';
import {kronorToMinor,minorToKronor} from '../src/lib/standalone-money.ts';
test('standalone prices preserve exact decimal amounts without floating point rounding',()=>{assert.equal(kronorToMinor('12,30'),'1230');assert.equal(kronorToMinor('0.01'),'1');assert.equal(kronorToMinor('9999999999.99'),'999999999999');assert.equal(minorToKronor('1230'),'12,30')});
test('standalone price entry rejects truncation, signs and exponent input',()=>{for(const value of ['1.001','1e3','-1','01','1,2,3','Infinity',''])assert.equal(kronorToMinor(value),null)});
