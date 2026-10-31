// Domain model. Money is stored as plain pesos (number); PHP-only by design.
export type WalletKind='basic'|'credit'|'goal';
export interface Wallet{id:string;name:string;kind:WalletKind;balance:number;excluded?:boolean;archived?:boolean;goal?:number;endDate?:string;limit?:number;stmtDay?:number;dueDay?:number}
// debt = money I borrowed (in), loan = money I lent (out)
export type TxType='expense'|'income'|'transfer'|'debt'|'loan';
export interface Tx{id:string;type:TxType;walletId:string;toWalletId?:string;amount:number;fee?:number;category:string;note:string;date:string;eventId?:string}
// payable = I owe; receivable = owed to me. affectsWallet=false means track-only.
export interface Debt{id:string;kind:'payable'|'receivable';who:string;total:number;paid:number;affectsWallet:boolean;walletId:string}
export interface Budget{id:string;category:string;limit:number;period:'week'|'month'|'quarter'|'year'}
export interface Bill{id:string;walletId:string;amount:number;category:string;note:string;next:string;repeat:'none'|'daily'|'weekly'|'monthly'|'yearly';end?:string;done?:boolean}
export interface Ev{id:string;name:string;end:string;walletId:string;finished?:boolean}
// Custom categories only; built-ins live in lib.ts and are not editable.
export interface Cat{name:string;type:'expense'|'income';parent?:string}
