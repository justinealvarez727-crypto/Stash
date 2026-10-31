import {useState} from 'react';import {useStore} from '../store';import {peso,today,catList} from '../lib';import Keypad from '../Keypad';import type {Tx,TxType} from '../types';
const TYPES:TxType[]=['expense','income','transfer','debt','loan'];
function Form({t,done}:{t?:Tx;done:()=>void}){const {wallets,saveTx}=useStore();
 const [f,setF]=useState<Tx>(t??{id:crypto.randomUUID(),type:'expense',walletId:useStore.getState().defaultId,amount:0,category:'Food & Beverage',note:'',date:today()});
 const [fee,setFee]=useState(!!t?.fee);const set=(p:Partial<Tx>)=>setF({...f,...p});const cu=useStore(s=>s.cats);const cats=catList(f.type==='income'?'income':'expense',cu);
 const cls='w-full rounded border border-zinc-700 bg-zinc-900 p-2';
 return <form onSubmit={e=>{e.preventDefault();if(f.amount>0&&(f.type!=='transfer'||(f.toWalletId&&f.toWalletId!==f.walletId))){saveTx({...f,eventId:f.eventId??useStore.getState().travelId,fee:f.type==='transfer'&&fee?f.fee??0:0});done()}}} className="space-y-3 rounded-lg border border-zinc-800 p-4">
  <div role="radiogroup" aria-label="Type" className="flex flex-wrap gap-2">{TYPES.map(x=><button type="button" role="radio" aria-checked={f.type===x} key={x} onClick={()=>set({type:x,category:x==='transfer'?'Transfer':x==='income'?catList('income',cu)[0]:x==='expense'?catList('expense',cu)[0]:x})} className={`rounded px-3 py-1 text-sm capitalize ${f.type===x?'bg-emerald-500 text-black':'bg-zinc-800'}`}>{x}</button>)}</div>
  <label className="block text-sm">Wallet<select className={cls} value={f.walletId} onChange={e=>set({walletId:e.target.value})}>{wallets.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
  {f.type==='transfer'&&<><label className="block text-sm">To wallet<select className={cls} value={f.toWalletId??''} onChange={e=>set({toWalletId:e.target.value})}><option value="">Select…</option>{wallets.filter(w=>w.id!==f.walletId).map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fee} onChange={e=>setFee(e.target.checked)}/>Add transfer fee</label>
   {fee&&<label className="block text-sm">Fee<input className={cls} type="number" min="0" step="0.01" value={f.fee??''} onChange={e=>set({fee:+e.target.value})}/></label>}</>}
  <Keypad value={f.amount} onChange={n=>set({amount:n})}/>
  {(f.type==='expense'||f.type==='income')&&<label className="block text-sm">Category<select className={cls} value={f.category} onChange={e=>set({category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select></label>}
  <label className="block text-sm">Note (use #tags)<input className={cls} value={f.note} onChange={e=>set({note:e.target.value})}/></label>
  <label className="block text-sm">Date<input className={cls} type="date" value={f.date} onChange={e=>set({date:e.target.value})}/></label>
  <div className="flex gap-2"><button className="rounded bg-emerald-500 px-4 py-2 font-medium text-black">Save</button><button type="button" onClick={done} className="rounded bg-zinc-800 px-4 py-2">Cancel</button></div></form>}
export default function Txs(){const {txs,wallets,delTx}=useStore();const [q,setQ]=useState('');const [ed,setEd]=useState<Tx|'new'|null>(null);
 const name=(id?:string)=>wallets.find(w=>w.id===id)?.name??'—';
 const list=txs.filter(t=>(t.note+t.category).toLowerCase().includes(q.toLowerCase())); // matches text and #tags
 if(ed)return <Form t={ed==='new'?undefined:ed} done={()=>setEd(null)}/>;
 return <div className="space-y-4"><div className="flex gap-2"><input aria-label="Search transactions or #tag" placeholder="Search or #tag" className="w-full rounded border border-zinc-700 bg-zinc-900 p-2" value={q} onChange={e=>setQ(e.target.value)}/><button onClick={()=>setEd('new')} className="whitespace-nowrap rounded bg-emerald-500 px-4 font-medium text-black">Add</button></div>
  <ul className="divide-y divide-zinc-800">{list.map(t=><li key={t.id} className="flex items-center justify-between py-3"><button onClick={()=>setEd(t)} className="text-left"><p>{t.category}</p><p className="text-xs text-zinc-500">{t.date} · {name(t.walletId)}{t.toWalletId&&` → ${name(t.toWalletId)}`} {t.note}</p></button>
   <div className="text-right"><p className={t.type==='income'||t.type==='debt'?'text-emerald-400':t.type==='transfer'?'text-zinc-300':'text-red-400'}>{peso(t.amount)}</p>{!!t.fee&&<p className="text-xs text-zinc-500">fee {peso(t.fee)}</p>}<button aria-label={`Delete ${t.category}`} onClick={()=>delTx(t.id)} className="text-xs text-zinc-500">Delete</button></div></li>)}</ul></div>}
