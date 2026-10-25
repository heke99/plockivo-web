export type Branding={display_name:string;primary_color:string;logo_data_url:string|null};
// Defensive display validation; authorization remains in get_context/RLS.
export function displayBranding(value:unknown,fallback:string):Branding{
 const p=value&&typeof value==='object'?value as Partial<Branding>:{};
 return {display_name:typeof p.display_name==='string'&&p.display_name.trim()?p.display_name.trim().slice(0,80):fallback,
 primary_color:typeof p.primary_color==='string'&&/^#[0-9a-fA-F]{6}$/.test(p.primary_color)?p.primary_color:'#244e3c',
 logo_data_url:typeof p.logo_data_url==='string'&&p.logo_data_url.length<=22000&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(p.logo_data_url)?p.logo_data_url:null};
}
