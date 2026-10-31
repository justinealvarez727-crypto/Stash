import {describe,it,expect} from 'vitest';import {useStore} from './store';import {calc} from './lib';
const bal=(id:string)=>useStore.getState().wallets.find(w=>w.id===id)!.balance;
describe('money',()=>{
 it('transfer moves amount+fee and fully reverses on delete',()=>{const b0=bal('bank'),c0=bal('cash');
  useStore.getState().saveTx({id:'t',type:'transfer',walletId:'bank',toWalletId:'cash',amount:100,fee:10,category:'Transfer',note:'',date:'2026-01-01'});
  expect(bal('bank')).toBe(b0-110);expect(bal('cash')).toBe(c0+100);useStore.getState().delTx('t');expect(bal('bank')).toBe(b0);expect(bal('cash')).toBe(c0)});
 it('calc honours precedence',()=>{expect(calc('2+3×4')).toBe(14);expect(calc('10÷4')).toBe(2.5)})});
