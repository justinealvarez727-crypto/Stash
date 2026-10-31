import {create} from 'zustand';import {persist} from 'zustand/middleware';
import type {Wallet,Tx,Debt,Budget,Bill,Ev,Cat} from './types';import {today,addPeriod} from './lib';
const uid=()=>crypto.randomUUID();
// Single source of truth for how a tx moves money; saveTx reverses the old effect then applies the new one, so edits/deletes never drift.
const delta=(t:Tx)=>{const d:Record<string,number>={};const a=(k:string,v:number)=>{d[k]=(d[k]??0)+v};
 if(t.type==='expense'||t.type==='loan')a(t.walletId,-t.amount);
 else if(t.type==='income'||t.type==='debt')a(t.walletId,t.amount);
 else{a(t.walletId,-(t.amount+(t.fee??0)));a(t.toWalletId!,t.amount)}return d};
const shift=(w:Wallet[],t:Tx,s:1|-1)=>{const d=delta(t);return w.map(x=>d[x.id]?{...x,balance:x.balance+s*d[x.id]}:x)};
interface S{wallets:Wallet[];txs:Tx[];debts:Debt[];budgets:Budget[];hide:boolean;bills:Bill[];events:Ev[];cats:Cat[];travelId?:string;defaultId:string;pin?:string;
 saveTx:(t:Tx)=>void;delTx:(id:string)=>void;addWallet:(w:Omit<Wallet,'id'>)=>void;adjust:(id:string,b:number)=>void;
 addDebt:(d:Omit<Debt,'id'|'paid'>)=>void;payDebt:(id:string,amt:number)=>void;addBudget:(b:Omit<Budget,'id'>)=>void;toggleHide:()=>void;archive:(id:string)=>void;setDefault:(id:string)=>void;toggleExcl:(id:string)=>void;delBudget:(id:string)=>void;addBill:(b:Omit<Bill,'id'>)=>void;payBill:(id:string)=>void;addEvent:(e:Omit<Ev,'id'>)=>void;finishEvent:(id:string)=>void;setTravel:(id?:string)=>void;addCat:(c:Cat)=>void;delCat:(n:string)=>void;setPin:(p?:string)=>void;importAll:(j:string)=>void}
const w=(id:string,name:string,kind:Wallet['kind'],balance:number,x:Partial<Wallet>={}):Wallet=>({id,name,kind,balance,...x});
const tx=(id:string,type:Tx['type'],amount:number,category:string,note:string,date:string,x:Partial<Tx>={}):Tx=>({id,type,walletId:'cash',amount,category,note,date,...x});
const d0=today(),m=d0.slice(0,8);
export const useStore=create<S>()(persist((set,get)=>({
 // Sample data (replace/clear in production); balances here are already net of the sample txs.
 wallets:[w('cash','Cash','basic',8200),w('bank','Bank','basic',41500),w('cc','Credit Card','credit',-6400,{limit:50000}),w('trip','Japan Fund','goal',12000,{goal:80000,endDate:'2027-06-30'})],
 txs:[tx('1','income',35000,'Salary','#payday',m+'01',{walletId:'bank'}),tx('2','expense',1850,'Food & Beverage › Groceries','#weekly',m+'03'),tx('3','expense',2400,'Bills & Utilities › Electricity','',m+'05',{walletId:'bank'}),tx('4','transfer',5000,'Transfer','savings',m+'06',{walletId:'bank',toWalletId:'trip',fee:15})],
 debts:[{id:'d1',kind:'payable',who:'Carlo',total:10000,paid:4000,affectsWallet:true,walletId:'cash'},{id:'d2',kind:'receivable',who:'Maya',total:6000,paid:1500,affectsWallet:false,walletId:'cash'}],
 budgets:[{id:'b1',category:'Food & Beverage',limit:8000,period:'month'},{id:'b2',category:'Bills & Utilities',limit:4000,period:'month'}],hide:false,defaultId:'cash',cats:[],events:[],bills:[{id:'bl1',walletId:'bank',amount:2400,category:'Bills & Utilities › Electricity',note:'Electricity',next:m+'28',repeat:'monthly'}],
 saveTx:t=>set(s=>{const o=s.txs.find(x=>x.id===t.id);const base=o?shift(s.wallets,o,-1):s.wallets;
  return{wallets:shift(base,t,1),txs:[t,...s.txs.filter(x=>x.id!==t.id)].sort((a,b)=>b.date.localeCompare(a.date))}}),
 delTx:id=>set(s=>{const o=s.txs.find(x=>x.id===id);return o?{wallets:shift(s.wallets,o,-1),txs:s.txs.filter(x=>x.id!==id)}:s}),
 addWallet:x=>set(s=>({wallets:[...s.wallets,{...x,id:uid()}]})),
 adjust:(id,b)=>set(s=>({wallets:s.wallets.map(x=>x.id===id?{...x,balance:b}:x)})),
 addDebt:x=>set(s=>({debts:[...s.debts,{...x,id:uid(),paid:0}]})),
 payDebt:(id,amt)=>{const d=get().debts.find(x=>x.id===id);if(!d)return;const a=Math.min(amt,d.total-d.paid);if(a<=0)return;
  set(s=>({debts:s.debts.map(x=>x.id===id?{...x,paid:x.paid+a}:x)}));
  if(d.affectsWallet)get().saveTx({id:uid(),type:d.kind==='payable'?'expense':'income',walletId:d.walletId,amount:a,category:d.kind==='payable'?'Repayment':'Debt Collection',note:d.who,date:today()})},
 addBudget:b=>set(s=>({budgets:[...s.budgets,{...b,id:uid()}]})),toggleHide:()=>set(s=>({hide:!s.hide})),
 archive:id=>set(s=>({wallets:s.wallets.map(x=>x.id===id?{...x,archived:!x.archived}:x)})),setDefault:id=>set({defaultId:id}),
 toggleExcl:id=>set(s=>({wallets:s.wallets.map(x=>x.id===id?{...x,excluded:!x.excluded}:x)})),delBudget:id=>set(s=>({budgets:s.budgets.filter(x=>x.id!==id)})),
 addBill:b=>set(s=>({bills:[...s.bills,{...b,id:uid()}]})),
 // Paying a bill logs an expense, then advances the due date; one-off or past-end bills move to Finished.
 payBill:id=>{const b=get().bills.find(x=>x.id===id);if(!b)return;get().saveTx({id:uid(),type:'expense',walletId:b.walletId,amount:b.amount,category:b.category,note:b.note+' #bill',date:today()});
  const n=addPeriod(b.next,b.repeat);set(s=>({bills:s.bills.map(x=>x.id===id?{...x,next:n,done:b.repeat==='none'||(!!b.end&&n>b.end)}:x)}))},
 addEvent:e=>set(s=>({events:[...s.events,{...e,id:uid()}]})),finishEvent:id=>set(s=>({events:s.events.map(x=>x.id===id?{...x,finished:true}:x),travelId:s.travelId===id?undefined:s.travelId})),
 setTravel:id=>set({travelId:id}),addCat:c=>set(s=>({cats:[...s.cats,c]})),delCat:n=>set(s=>({cats:s.cats.filter(c=>c.name!==n)})),setPin:p=>set({pin:p}),
 importAll:j=>{const o=JSON.parse(j);if(!Array.isArray(o.wallets)||!Array.isArray(o.txs))throw new Error('Invalid backup');set(o)}}),
 {name:'money-manager',version:2,merge:(p,c)=>({...c,...(p as object)}) /* new keys fall back to initial state */})); // bump version + migrate when the schema changes
