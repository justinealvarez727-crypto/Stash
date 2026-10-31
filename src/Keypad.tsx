import {useState} from 'react';import {calc} from './lib';
// Calculator keypad: type an expression (e.g. 1200+350), '=' resolves it; onChange always receives the live result.
export default function Keypad({value,onChange,label='Amount (PHP)'}:{value:number;onChange:(n:number)=>void;label?:string}){
 const [e,setE]=useState(value?String(value):'');
 const press=(k:string)=>{const n=k==='⌫'?e.slice(0,-1):k==='='?String(calc(e)):e+k;setE(n);onChange(calc(n))};
 return <div><p className="text-sm">{label}</p><output aria-live="polite" className="block rounded border border-zinc-700 bg-zinc-900 p-2 text-right text-2xl">{e||'0'}</output>
  <div className="mt-1 grid grid-cols-4 gap-1">{['7','8','9','÷','4','5','6','×','1','2','3','-','.','0','⌫','+'].map(k=><button type="button" key={k} onClick={()=>press(k)} aria-label={k==='⌫'?'Backspace':k} className="rounded bg-zinc-800 py-2">{k}</button>)}
  <button type="button" onClick={()=>press('=')} className="col-span-4 rounded bg-emerald-500 py-2 text-black">=</button></div></div>}
