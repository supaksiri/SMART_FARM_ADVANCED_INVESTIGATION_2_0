import {evidence,domains,questions,challenges} from './data.js';
export const fresh=()=>({version:2,name:'DETECTIVE',found:[],links:{},simulations:[],repairs:{},network:{},answers:{},completed:false});
export function simulate({moisture,threshold,flow,minutes,sensor,pipe}){
 const valid=sensor==='ok',command=valid&&moisture<threshold;
 const flowing=command&&pipe==='clear';
 const liters=flowing?flow*minutes:0;
 let message=!valid?'เซนเซอร์ขัดข้อง: หยุดปั๊มตามโหมดปลอดภัย':!command?'ดินชื้นถึงเกณฑ์: ไม่สั่งเปิดปั๊ม':!flowing?'ปั๊มได้รับคำสั่ง แต่ท่ออุดตัน: น้ำไม่ถึงแปลงผัก':`ระบบส่งน้ำ ${liters.toFixed(1)} ลิตร จาก ${flow} ลิตร/นาที × ${minutes} นาที`;
 return {valid,command,flowing,liters,message};
}
export function score(s){
 const investigation=s.found.length*4;
 const knowledge=evidence.reduce((a,e)=>{const chosen=s.links[e.id]||[];return a+(chosen.length===e.domains.length && chosen.every(x=>e.domains.includes(x))?6:0)},0);
 const simulation=Math.min(20,(s.simulations.length?8:0)+challenges.reduce((a,c)=>a+(s.repairs[c.id]?.correct?4:0),0));
 const network=domains.reduce((a,d)=>{const picked=s.network[d.id];return a+(picked && evidence.find(e=>e.id===picked)?.domains.includes(d.id)?4:0)},0);
 const trial=questions.reduce((a,q)=>a+(s.answers[q.id]===q.correct?1:0),0);
 return {investigation,knowledge,simulation,network,trial,total:investigation+knowledge+simulation+network+trial};
}
export function unlocked(s,lab){if(lab===1)return true;if(lab===2)return s.found.length===5;if(lab===3)return s.found.length===5 && evidence.every(e=>(s.links[e.id]||[]).length>0);if(lab===4)return s.simulations.length>0 && challenges.every(c=>s.repairs[c.id]);if(lab===5)return domains.every(d=>s.network[d.id]);return false;}
export function safeLoad(){try{const raw=JSON.parse(localStorage.getItem('smart-farm-advanced-v2')||'null');return raw?.version===2?{...fresh(),...raw}:fresh()}catch{return fresh()}}
export function save(s){try{localStorage.setItem('smart-farm-advanced-v2',JSON.stringify(s))}catch{}}
export function csv(s){const scores=score(s);return '\uFEFFชื่อ,คะแนนรวม,สำรวจ,เชื่อมศาสตร์,จำลองและซ่อม,แผนผัง,แบบทดสอบ\n'+`"${s.name.replaceAll('"','""')}",${scores.total},${scores.investigation},${scores.knowledge},${scores.simulation},${scores.network},${scores.trial}\n`;}
export function report(s){const x=score(s);return `TECHNOLOGY DETECTIVE LAB — SMART FARM 2.0\nผู้เล่น: ${s.name}\nคะแนน: ${x.total}/100\nหลักฐานที่เก็บ: ${s.found.join(', ')}\n\nเชื่อมโยงศาสตร์:\n${evidence.map(e=>`${e.id} ${e.name}: ${(s.links[e.id]||[]).map(id=>domains.find(d=>d.id===id)?.name).join(', ')}`).join('\n')}\n\nผลทดลองล่าสุด: ${s.simulations.at(-1)?.message||'ยังไม่ได้ทดลอง'}\n\nสถานการณ์ซ่อม: ${challenges.map(c=>`${c.title}: ${s.repairs[c.id]?.correct?'ถูกต้อง':s.repairs[c.id]?'ทบทวน':'ยังไม่ได้ทำ'}`).join(' / ')}\n\nMind Map: ${domains.map(d=>`${d.name} — ${s.network[d.id]||'ยังไม่เลือก'}`).join(' / ')}\n`;}
