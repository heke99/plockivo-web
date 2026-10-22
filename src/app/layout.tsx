import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Plockivo — Handla för företaget',description:'Självskanning för företag. Skanna, bekräfta och hämta i butik.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="sv"><body>{children}</body></html>}
