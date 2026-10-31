export const peso=(n:number)=>new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP'}).format(n);
export const iso=(d:Date)=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10); // local date, not UTC
export const today=()=>iso(new Date());
export const EXPENSE=['Bills & Utilities','Education','Entertainment','Family','Food & Beverage','Gifts & Donations','Health & Fitness','Insurances','Investment','Shopping','Transportation','Other Expense'];
export const INCOME=['Salary','Collect Interest','Other Income'];
export const periodStart=(p:string)=>{const d=new Date();d.setHours(0,0,0,0);
 if(p==='week')d.setDate(d.getDate()-((d.getDay()+6)%7));else if(p==='month')d.setDate(1);
 else if(p==='quarter'){d.setDate(1);d.setMonth(Math.floor(d.getMonth()/3)*3)}else{d.setDate(1);d.setMonth(0)}
 return iso(d)};
// Gauge colour rule: green <60%, orange 60-<100%, red >=100%.
export const gauge=(r:number)=>r>=1?'bg-red-500':r>=.6?'bg-orange-400':'bg-emerald-500';
import type {Cat} from './types';
export const SUBS:Record<string,string[]>={'Bills & Utilities':['Electricity','Water','Internet','Phone','Rentals'],'Food & Beverage':['Groceries','Dining Out'],Transportation:['Fuel','Vehicle Maintenance'],Family:['Pets','Home Maintenance']};
// Sub-categories are 'Parent › Sub'; budgets and reports roll them up to the parent.
export const catList=(ty:'expense'|'income',cu:Cat[])=>[...(ty==='income'?INCOME:EXPENSE.flatMap(c=>[c,...(SUBS[c]??[]).map(s=>`${c} › ${s}`)])),...cu.filter(c=>c.type===ty).map(c=>c.parent?`${c.parent} › ${c.name}`:c.name)];
export const addPeriod=(s:string,r:string)=>{const d=new Date(s+'T00:00');if(r==='daily')d.setDate(d.getDate()+1);else if(r==='weekly')d.setDate(d.getDate()+7);else if(r==='monthly')d.setMonth(d.getMonth()+1);else if(r==='yearly')d.setFullYear(d.getFullYear()+1);return iso(d)};
export const sha=async(s:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
// Calculator: no eval(); × ÷ bind to the previous term, + - are signed terms.
export const calc=(s:string):number=>{const t=s.match(/\d*\.?\d+|[+\-×÷]/g)??[];const st:number[]=[];let op='+';
 for(const x of t){if(/^[+\-×÷]$/.test(x)){op=x;continue}const n=+x;if(op==='+')st.push(n);else if(op==='-')st.push(-n);else if(op==='×')st.push((st.pop()??0)*n);else st.push((st.pop()??0)/(n||1))}
 return Math.round(st.reduce((a,b)=>a+b,0)*100)/100};
