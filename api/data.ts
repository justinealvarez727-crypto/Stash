import type {VercelRequest as Q,VercelResponse as P} from '@vercel/node';import {r,who} from './_lib.js';
// One JSON document per user with a revision counter. PUT must carry the rev it was based on, else 409 (optimistic concurrency).
export default async function h(q:Q,s:P){const id=who(q);if(!id)return s.status(401).json({error:'Not signed in'});
 try{const key=`d:${id}`,cur=await r('GET',key),o=cur?JSON.parse(cur):{rev:0,data:null};
  if(q.method==='GET')return s.json(o);
  if(q.method==='PUT'){const {rev,data}=q.body??{};if(rev!==o.rev)return s.status(409).json({error:'Out of date'});
   const str=JSON.stringify({rev:o.rev+1,data});if(str.length>900_000)return s.status(413).json({error:'Data too large'});await r('SET',key,str);return s.json({rev:o.rev+1})}
  return s.status(405).json({error:'Method not allowed'})}catch(e){console.error(e);return s.status(500).json({error:'Server error'})}}
