export type HistoryItem={id:string;tenant_id:string;status:string;created_at:string;total_minor:string};
export function historyPage<T extends HistoryItem>(items:T[],tenant:string,query:string,status:string,page:number){
 const q=query.trim().toLocaleLowerCase('sv-SE').slice(0,100);
 const filtered=items.filter(h=>h.tenant_id===tenant&&(status==='all'||h.status===status)&&(!q||h.id.toLowerCase().includes(q)));
 const pages=Math.max(1,Math.ceil(filtered.length/10)),current=Math.min(Math.max(1,Math.trunc(page)||1),pages);
 return {items:filtered.slice((current-1)*10,current*10),count:filtered.length,pages,current};
}
