/** Exact SEK decimal to minor units. No binary floating-point conversion. */
export function kronorToMinor(value:string):string|null{
 const match=value.trim().replace(',','.').match(/^(0|[1-9]\d{0,9})(?:\.(\d{1,2}))?$/);
 return match?String(BigInt(match[1])*100n+BigInt((match[2]??'').padEnd(2,'0'))):null;
}
export function minorToKronor(value:string):string{const n=BigInt(value);return `${n/100n},${(n%100n).toString().padStart(2,'0')}`}
