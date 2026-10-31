import {useStore} from '../store';import {peso,periodStart,gauge} from '../lib';
export default function Home(){const {wallets,txs,budgets,hide,toggleHide}=useStore();
 const total=wallets.filter(w=>w.kind!=='credit'&&!w.excluded&&!w.archived).reduce((a,w)=>a+w.balance,0); // credit wallets never count toward Total
 const ms=periodStart('month');const mt=txs.filter(t=>t.date>=ms);const sum=(ty:string)=>mt.filter(t=>t.type===ty).reduce((a,t)=>a+t.amount,0);
 const show=(n:number)=>hide?'••••••':peso(n);
 return <div className="space-y-6"><section aria-label="Total balance"><p className="text-sm text-zinc-400">Total balance</p>
  <p className="text-4xl font-semibold">{show(total)} <button aria-label={hide?'Show balance':'Hide balance'} aria-pressed={hide} onClick={toggleHide} className="ml-2 text-base text-zinc-400">{hide?'Show':'Hide'}</button></p>
  <p className="mt-1 text-sm text-zinc-400">This month: <span className="text-emerald-400">+{show(sum('income'))}</span> · <span className="text-red-400">−{show(sum('expense'))}</span></p></section>
  <section aria-label="Wallets"><h2 className="mb-2 font-medium">Wallets</h2><ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
  {wallets.filter(w=>!w.archived).map(w=><li key={w.id} className="flex justify-between p-3"><span>{w.name} <span className="text-xs text-zinc-500">{w.kind}</span></span><span>{show(w.balance)}</span></li>)}</ul></section>
  <section aria-label="Budgets"><h2 className="mb-2 font-medium">Budgets</h2><ul className="space-y-3">{budgets.map(b=>{
   const s=txs.filter(t=>t.type==='expense'&&t.date>=periodStart(b.period)&&(b.category==='All'||t.category.split(' › ')[0]===b.category)).reduce((a,t)=>a+t.amount,0);const r=s/b.limit;
   return <li key={b.id}><div className="flex justify-between text-sm"><span>{b.category} <span className="text-zinc-500">/ {b.period}</span></span><span>{peso(s)} / {peso(b.limit)}</span></div>
   <div role="progressbar" aria-label={b.category} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(r,1)*100)} className="mt-1 h-2 rounded bg-zinc-800"><div className={`h-2 rounded transition-all ${gauge(r)}`} style={{width:`${Math.min(r,1)*100}%`}}/></div></li>})}</ul></section></div>}
