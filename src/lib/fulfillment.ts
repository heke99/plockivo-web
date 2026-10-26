export type FulfillmentLine={order_line_id:string;product_id:string;name:string;quantity:string;claimed_quantity:string;fulfilled_quantity:string;cancelled_quantity:string;returned_quantity:string;remaining_quantity:string};
export type FulfillmentClaim={id:string;status:'pending'|'confirmed';lines:{product_id:string;quantity:string}[];recipient_reference:string;created_at:string;confirmed_at:string|null};
export type FulfillmentState={order_id:string;tenant_id:string;version:number;inspection_status:'pending'|'passed'|'blocked';lines:FulfillmentLine[];claims:FulfillmentClaim[]};
export function selectedFulfillmentLines(lines:FulfillmentLine[],quantities:Record<string,string>){return lines.filter(l=>(quantities[l.product_id]??'').trim()!=='').map(l=>({product_id:l.product_id,quantity:quantities[l.product_id].trim()}))}
export function validTestQuantity(value:string){return /^(?:0|[1-9][0-9]{0,5})(?:\.[0-9]{1,6})?$/.test(value)&&/[1-9]/.test(value)}
