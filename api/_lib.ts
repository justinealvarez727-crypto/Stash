// Shared server helpers. Files starting with "_" are not exposed as routes by Vercel.
import {scryptSync,randomBytes,timingSafeEqual,createHmac} from 'node:crypto';import type {VercelRequest as Q,VercelResponse as P} from '@vercel/node';
const U=process.env.UPSTASH_REDIS_REST_URL??process.env.KV_REST_API_URL!,T=process.env.UPSTASH_REDIS_REST_TOKEN??process.env.KV_REST_API_TOKEN!,K=process.env.SESSION_SECRET!;
// Upstash Redis over REST: one command per call, e.g. r('GET','key'). No client library needed.
export const r=async(...c:(string|number)[])=>(await(await fetch(U,{method:'POST',headers:{Authorization:`Bearer ${T}`},body:JSON.stringify(c)})).json()).result as any;
export const uid=()=>randomBytes(12).toString('hex');
export const hash=(pw:string,salt=randomBytes(16).toString('hex'))=>({salt,h:scryptSync(pw,salt,64).toString('hex')}); // scrypt: salted, memory-hard
export const verify=(pw:string,u:{salt:string;h:string})=>timingSafeEqual(Buffer.from(hash(pw,u.salt).h,'hex'),Buffer.from(u.h,'hex'));
const mac=(x:string)=>createHmac('sha256',K).update(x).digest('hex');
const ck=(v:string,age:number)=>`sid=${v}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${age}`;
// Stateless signed session cookie: id.expiry.hmac (30 days). Rotate SESSION_SECRET to sign everyone out.
export const login=(s:P,id:string)=>{const v=`${id}.${Date.now()+30*864e5}`;s.setHeader('Set-Cookie',ck(`${v}.${mac(v)}`,30*86400))};
export const logout=(s:P)=>s.setHeader('Set-Cookie',ck('',0));
export const who=(q:Q)=>{const c=/sid=([^;]+)/.exec(q.headers.cookie??'')?.[1];if(!c)return null;const [id,e,m]=c.split('.');
 return m&&m.length===64&&timingSafeEqual(Buffer.from(m),Buffer.from(mac(`${id}.${e}`)))&&+e>Date.now()?id:null};
// Crude brute-force guard: 20 attempts per action per IP per 15 min.
export const limited=async(q:Q,k:string)=>{const key=`rl:${k}:${String(q.headers['x-forwarded-for']??'').split(',')[0]}`;const n=await r('INCR',key);if(n===1)await r('EXPIRE',key,900);return n>20};
