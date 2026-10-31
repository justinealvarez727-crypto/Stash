import {useState} from 'react';import {useStore} from '../store';import {peso,periodStart,iso,today} from '../lib';
const top=(c:string)=>c.split(' › ')[0];
function Bars({rows,c}:{rows:[string,number][];c:string}){const m=rows[0]?.[1]||1;return <ul className="space-y-2">{rows.length===0&&<li className="text-sm text-zinc-500">No data</li>}{rows.map(([k,v])=><li key={k}><div className="flex justify-between text-sm"><span>{k}</span><span>{peso(v)}</span></div><div className="h-2 rounded bg-zinc-800"><div className={`h-2 rounded ${c}`} style={{width:`${v/m*100}%`}}/></div></li>)}</ul>}
export default function Reports(){const {txs,wallets}=useStore();const [p,setP]=useState('month');const [w,setW]=useState('all');
 const from=periodStart(p);const L=txs.filter(t=>t.date>=from&&(w==='all'||t.walletId===w));
 const sum=(ty:string)=>L.filter(t=>t.type===ty).reduce((a,t)=>a+t.amount,0);
 const by=(ty:string):[string,number][]=>{const m:Record<string,number>={};L.filter(t=>t.type===ty).forEach(t=>{m[top(t.category)]=(m[top(t.category)]??0)+t.amount});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
 const inc=sum('income'),exp=sum('expense');const days=Math.max(1,Math.round((+new Date(today()+'T00:00')-+new Date(from+'T00:00'))/864e5)+1);
 const wk:Record<string,{i:number;e:number}>={};
 L.forEach(t=>{const d=new Date(t.date+'T00:00');d.setDate(d.getDate()-((d.getDay()+6)%7));const k=iso(d).slice(5);const b=wk[k]??{i:0,e:0};if(t.type==='income')b.i+=t.amount;if(t.type==='expense')b.e+=t.amount;wk[k]=b});
 const mx=Math.max(1,...Object.values(wk).flatMap(b=>[b.i,b.e]));
 return <div className="space-y-6"><div className="flex gap-2"><select aria-label="Period" className="rounded border border-zinc-700 bg-zinc-900 p-2" value={p} onChange={e=>setP(e.target.value)}>{['week','month','quarter','year'].map(x=><option key={x}>{x}</option>)}</select>
  <select aria-label="Wallet" className="rounded border border-zinc-700 bg-zinc-900 p-2" value={w} onChange={e=>setW(e.target.value)}><option value="all">All wallets</option>{wallets.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
  <section aria-label="Net income"><p className="text-sm text-zinc-400">Net income</p><p className="text-3xl font-semibold">{peso(inc-exp)}</p><p className="text-sm text-zinc-400">Income {peso(inc)} · Expense {peso(exp)} · Daily avg spend {peso(exp/days)}</p></section>
  <section><h2 className="mb-2 font-medium">Expense by category</h2><Bars rows={by('expense')} c="bg-red-400"/></section>
  <section><h2 className="mb-2 font-medium">Income by category</h2><Bars rows={by('income')} c="bg-emerald-500"/></section>
  <section><h2 className="mb-2 font-medium">Weekly trend (week starting)</h2><ul className="space-y-3">{Object.entries(wk).sort().map(([k,b])=><li key={k}><div className="flex justify-between text-sm"><span>{k}</span><span>+{peso(b.i)} / −{peso(b.e)} = {peso(b.i-b.e)}</span></div>
   <div aria-hidden className="h-2 rounded bg-zinc-800"><div className="h-2 rounded bg-emerald-500" style={{width:`${b.i/mx*100}%`}}/></div><div aria-hidden className="mt-1 h-2 rounded bg-zinc-800"><div className="h-2 rounded bg-red-400" style={{width:`${b.e/mx*100}%`}}/></div></li>)}</ul></section></div>}
