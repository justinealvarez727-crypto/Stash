import {createRoot} from 'react-dom/client';import App from './App';import './index.css';
createRoot(document.getElementById('root')!).render(<App/>);
try{new PerformanceObserver(l=>l.getEntries().forEach(e=>console.info('[perf]',e.entryType,Math.round(e.startTime||e.duration)))).observe({entryTypes:['largest-contentful-paint','longtask']})}catch{} // lightweight perf monitoring
