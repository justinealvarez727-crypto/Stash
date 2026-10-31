import {useState,type FormEvent} from 'react';import {api} from './sync';
const cls='mt-1 w-full rounded border border-zinc-700 bg-zinc-900 p-2';
export default function Auth({done}:{done:(u:string)=>Promise<void>}){const tok=new URLSearchParams(location.search).get('reset');
 const [m,setM]=useState<'login'|'signup'|'forgot'|'reset'>(tok?'reset':'login');const [f,setF]=useState({ident:'',username:'',email:'',pw:''});const [msg,setMsg]=useState('');const [busy,setBusy]=useState(false);
 const L=(l:string,k:keyof typeof f,type='text',ac?:string)=><label className="block text-sm">{l}<input required={k!=='email'} type={type} autoComplete={ac} className={cls} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}/></label>;
 const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setMsg('');
  try{if(m==='forgot'){await api('/api/auth?a=forgot',{ident:f.ident});setMsg('If that account has an email, a reset link is on its way.')}
   else{const j=await api(`/api/auth?a=${m}`,m==='login'?{ident:f.ident,password:f.pw}:m==='signup'?{username:f.username,email:f.email,password:f.pw}:{token:tok,password:f.pw});if(m==='reset')history.replaceState(null,'','/');await done(j.username)}
  }catch(x){setMsg((x as Error).message)}finally{setBusy(false)}};
 const link='text-sm text-emerald-400 underline';
 return <main className="mx-auto max-w-xs space-y-4 p-8"><h1 className="text-2xl font-semibold">{{login:'Log in',signup:'Create account',forgot:'Forgot password',reset:'New password'}[m]}</h1>
  <form onSubmit={submit} className="space-y-3">{m==='signup'&&<>{L('Username','username','text','username')}{L('Email (optional, for password reset)','email','email','email')}</>}{(m==='login'||m==='forgot')&&L('Email or username','ident','text','username')}
  {m!=='forgot'&&L(m==='reset'?'New password (min 8)':'Password'+(m==='signup'?' (min 8)':''),'pw','password',m==='login'?'current-password':'new-password')}
  <button disabled={busy} className="w-full rounded bg-emerald-500 py-2 font-medium text-black disabled:opacity-50">{busy?'Please wait…':m==='forgot'?'Send reset link':'Continue'}</button></form>
  {msg&&<p role="alert" className="text-sm text-orange-400">{msg}</p>}
  <div className="flex justify-between">{m==='login'?<><button className={link} onClick={()=>setM('signup')}>Create account</button><button className={link} onClick={()=>setM('forgot')}>Forgot password?</button></>:<button className={link} onClick={()=>setM('login')}>Back to log in</button>}</div></main>}
