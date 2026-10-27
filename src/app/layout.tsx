import './globals.css';
import SiteFooter from './site-footer';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Plockivo — Självskanning för företagsbutiker',description:'En enklare köpresa för företagsbutiker. Personliga inköpsmandat, projekt och granskning före bekräftelse.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="sv"><body>{children}<SiteFooter/></body></html>}

