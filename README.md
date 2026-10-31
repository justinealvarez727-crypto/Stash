# Money Manager
Local: `npm i && npx vercel dev` (needs the env vars below; `npm run dev` runs the UI only, no API).
Deploy: push to GitHub > import in Vercel (Vite, `npm run build`, output `dist`) > add Upstash Redis from Storage > set env vars from `.env.example` > redeploy.
Data model: one JSON blob + revision per user (`d:<id>`), users at `u:<id>`, login lookups at `ix:<username|email>`, reset tokens `rs:<token>` (1h).
