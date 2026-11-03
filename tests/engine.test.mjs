import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,simulate,score,unlocked} from '../src/engine.js';
import {evidence,domains,questions,challenges} from '../src/data.js';
test('base progress and score',()=>{const s=fresh();assert.equal(score(s).total,0);assert.equal(unlocked(s,1),true);assert.equal(unlocked(s,2),false)});
test('simulation flow arithmetic',()=>{let r=simulate({moisture:20,threshold:40,flow:2,minutes:4,sensor:'ok',pipe:'clear'});assert.equal(r.liters,8);assert.equal(r.flowing,true)});
test('sensor fault uses safe stop',()=>{let r=simulate({moisture:20,threshold:40,flow:2,minutes:4,sensor:'broken',pipe:'clear'});assert.equal(r.command,false);assert.equal(r.liters,0)});
test('blocked pipe delivers zero water',()=>{let r=simulate({moisture:20,threshold:40,flow:2,minutes:4,sensor:'ok',pipe:'blocked'});assert.equal(r.command,true);assert.equal(r.liters,0)});
test('correct complete progress scores 100 and unlocks',()=>{const s=fresh();s.found=evidence.map(e=>e.id);for(const e of evidence)s.links[e.id]=[...e.domains];s.simulations=[{message:'test'}];for(const c of challenges)s.repairs[c.id]={correct:true};for(const d of domains)s.network[d.id]=evidence.find(e=>e.domains.includes(d.id)).id;for(const q of questions)s.answers[q.id]=q.correct;assert.equal(score(s).total,100);for(let i=1;i<=5;i++)assert.equal(unlocked(s,i),true)});
test('incorrect knowledge mapping never gets full points',()=>{const s=fresh();s.found=evidence.map(e=>e.id);for(const e of evidence)s.links[e.id]=['science'];assert.ok(score(s).knowledge<30)});
