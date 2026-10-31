import {useStore} from './store';
export const api=async(p:string,body?:unknown,method='POST')=>{const res=await fetch(p,{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const j=await res.json().catch(()=>({}));if(!res.ok)throw Object.assign(new Error(j.error||'Request failed'),{status:res.status});return j};
// New accounts start empty (sample data is local-only).
const EMPTY:Partial<ReturnType<typeof useStore.getState>>={wallets:[{id:'cash',name:'Cash',kind:'basic',balance:0}],txs:[],debts:[],budgets:[],bills:[],events:[],cats:[],defaultId:'cash',hide:false,travelId:undefined,pin:undefined};
let rev=0,timer:ReturnType<typeof setTimeout>,off:(()=>void)|undefined,applying=false;
const apply=(d:object)=>{applying=true;useStore.setState(d);applying=false};
// Server wins on load/conflict; local edits are debounced up to the server; offline edits stay in local storage and retry on next change or reconnect.
export const pull=async()=>{const j=await api('/api/data',undefined,'GET');rev=j.rev;apply(j.data??EMPTY);if(!j.data)await push()};
const push=async()=>{try{const j=await api('/api/data',{rev,data:JSON.parse(JSON.stringify(useStore.getState()))},'PUT');rev=j.rev}catch(e){if((e as {status?:number}).status===409)await pull();else console.error('[sync]',e)}};
export const start=()=>{stop();const un=useStore.subscribe(()=>{if(applying)return;clearTimeout(timer);timer=setTimeout(push,800)});addEventListener('online',push);off=()=>{un();removeEventListener('online',push)}};
export const stop=()=>{clearTimeout(timer);off?.();off=undefined};
export const wipe=()=>{localStorage.removeItem('money-manager');localStorage.removeItem('mm-user');apply(EMPTY)};
