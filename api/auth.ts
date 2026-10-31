import type {VercelRequest as Q,VercelResponse as P} from '@vercel/node';import {randomBytes} from 'node:crypto';
import {r,uid,hash,verify,login,logout,who,limited} from './_lib.js';
const bad=(s:P,c:number,e:string)=>s.status(c).json({error:e});
const find=async(ident:string)=>{const id=await r('GET',`ix:${ident.trim().toLowerCase()}`);if(!id)return null;const u=await r('GET',`u:${id}`);return u?JSON.parse(u):null};
// One endpoint, action in ?a= : signup | login | logout | me | forgot | reset
export default async function h(q:Q,s:P){const a=String(q.query.a),b=q.body??{};
 if(q.method!=='POST'&&a!=='me')return bad(s,405,'Method not allowed');
 try{
  if(a==='me'){const id=who(q);if(!id)return bad(s,401,'Not signed in');const u=await r('GET',`u:${id}`);if(!u)return bad(s,401,'Not signed in');return s.json({username:JSON.parse(u).username})}
  if(a==='logout'){logout(s);return s.json({ok:1})}
  if(await limited(q,a))return bad(s,429,'Too many attempts. Try again in 15 minutes.');
  const pw=String(b.password??'');
  if(a==='signup'){const un=String(b.username??'').trim(),em=String(b.email??'').trim().toLowerCase();
   if(!/^[\w.-]{3,30}$/.test(un))return bad(s,400,'Username: 3-30 letters, numbers, . _ -');
   if(em&&!/^\S+@\S+\.\S+$/.test(em))return bad(s,400,'Invalid email');
   if(pw.length<8)return bad(s,400,'Password must be at least 8 characters');
   const id=uid();if(!(await r('SETNX',`ix:${un.toLowerCase()}`,id)))return bad(s,409,'Username taken');
   if(em&&!(await r('SETNX',`ix:${em}`,id))){await r('DEL',`ix:${un.toLowerCase()}`);return bad(s,409,'Email already registered')}
   const {salt,h:ph}=hash(pw);await r('SET',`u:${id}`,JSON.stringify({id,username:un,email:em,salt,h:ph}));login(s,id);return s.json({username:un})}
  if(a==='login'){const u=await find(String(b.ident??''));if(!u||!verify(pw,u))return bad(s,401,'Invalid credentials');login(s,u.id);return s.json({username:u.username})}
  if(a==='forgot'){const u=await find(String(b.ident??'')); // always answers ok: no account enumeration
   if(u?.email&&process.env.RESEND_API_KEY){const t=randomBytes(24).toString('hex');await r('SET',`rs:${t}`,u.id,'EX',3600);
    await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.MAIL_FROM,to:u.email,subject:'Reset your password',html:`<p>Reset link (valid 1 hour): <a href="${process.env.APP_URL}/?reset=${t}">Reset password</a></p>`})})}
   return s.json({ok:1})}
  if(a==='reset'){if(pw.length<8)return bad(s,400,'Password must be at least 8 characters');const t=String(b.token??'');const id=await r('GET',`rs:${t}`);if(!id)return bad(s,400,'Link expired or already used');
   const u=JSON.parse(await r('GET',`u:${id}`));const {salt,h:ph}=hash(pw);await r('SET',`u:${id}`,JSON.stringify({...u,salt,h:ph}));await r('DEL',`rs:${t}`);login(s,id);return s.json({username:u.username})}
  return bad(s,404,'Unknown action');
 }catch(e){console.error(e);return bad(s,500,'Server error')}}
