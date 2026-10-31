import {Component,lazy,Suspense,useEffect,useState,type ReactNode} from 'react';import Auth from './Auth';import {api,pull,start,stop,wipe} from './sync';import {AnimatePresence,motion} from 'framer-motion';import {useStore} from './store';import {sha} from './lib';
// Each view is its own chunk (code splitting); the error boundary keeps one broken view from blanking the app.
const V={Home:lazy(()=>import('./views/Home')),Transactions:lazy(()=>import('./views/Txs')),Reports:lazy(()=>import('./views/Reports')),Plan:lazy(()=>import('./views/Plan')),More:lazy(()=>import('./views/More'))};
class EB extends Component<{children:ReactNode},{e?:Error}>{state:{e?:Error}={};static getDerivedStateFromError(e:Error){return{e}}
 componentDidCatch(e:Error){console.error('[perf/err]',e)}
 render(){return this.state.e?<div role="alert" className="p-6"><p>Something went wrong.</p><button className="mt-3 rounded bg-emerald-500 px-3 py-2 text-black" onClick={()=>this.setState({e:undefined})}>Retry</button></div>:this.props.children}}
// Convenience lock only: the hash lives in the same browser storage as the data.
function Lock({pin,open}:{pin:string;open:()=>void}){const [v,setV]=useState('');const [bad,setBad]=useState(false);
 return <form className="mx-auto max-w-xs space-y-3 p-8" onSubmit={async e=>{e.preventDefault();if(await sha(v)===pin)open();else setBad(true)}}><label className="block">PIN<input autoFocus type="password" inputMode="numeric" className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 p-2" value={v} onChange={e=>setV(e.target.value)}/></label>{bad&&<p role="alert" className="text-red-400">Wrong PIN</p>}<button className="rounded bg-emerald-500 px-4 py-2 text-black">Unlock</button></form>}
function Shell({user,out}:{user:string;out:()=>void}){const [t,setT]=useState<keyof typeof V>('Home');const C=V[t];const pin=useStore(s=>s.pin);const [ok,setOk]=useState(false);
 if(pin&&!ok)return <Lock pin={pin} open={()=>setOk(true)}/>;
 return <div className="mx-auto min-h-dvh max-w-xl pb-24"><header className="flex justify-between p-4 pb-0 text-xs text-zinc-500"><span>{user}</span><button onClick={out}>Log out</button></header><main id="main" className="p-4"><EB><Suspense fallback={<p role="status" className="animate-pulse text-zinc-500">Loading…</p>}>
  <AnimatePresence mode="wait"><motion.div key={t} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.15}}><C/></motion.div></AnimatePresence></Suspense></EB></main>
  <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 pb-[env(safe-area-inset-bottom)]"><ul className="mx-auto flex max-w-xl">
  {(Object.keys(V) as (keyof typeof V)[]).map(k=><li key={k} className="flex-1"><button aria-current={k===t?'page':undefined} onClick={()=>setT(k)} className={`w-full py-4 text-sm ${k===t?'text-emerald-400':'text-zinc-400'}`}>{k}</button></li>)}</ul></nav></div>}

// Auth gate: ask the server who we are; offline with a cached login we fall back to local data and sync later.
export default function App(){const [u,setU]=useState<string|null|undefined>(undefined);
 const done=async(n:string)=>{await pull();start();localStorage.setItem('mm-user',n);setU(n)};
 useEffect(()=>{api('/api/auth?a=me',undefined,'GET').then(j=>done(j.username)).catch((e:{status?:number})=>{const c=localStorage.getItem('mm-user');if(e.status===undefined&&c){start();setU(c)}else setU(null)})},[]);
 if(u===undefined)return <p role="status" className="p-6 text-zinc-500">Loading…</p>;
 if(u===null)return <Auth done={done}/>;
 return <Shell user={u} out={async()=>{stop();try{await api('/api/auth?a=logout',{})}catch{}wipe();setU(null)}}/>}
