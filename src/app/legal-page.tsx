import Link from 'next/link';
import {legalLinks,legalUpdated,legalVersion,platformOwner} from '@/lib/legal';
type ContentsItem={id:string;label:string};
type SummaryItem={label:string;text:string};
type LegalPageProps={title:string;intro:string;children:React.ReactNode;contents?:ContentsItem[];summary?:SummaryItem[];version?:string};
export default function LegalPage({title,intro,children,contents=[],summary=[],version=legalVersion}:LegalPageProps){
 const detailed=contents.length>0;
 return <main id="main" className={`legal-page${detailed?' legal-detailed':''}`}>
  <a className="skip-link" href="#legal-content">Hoppa till innehåll</a>
  <div className="legal-topline"><Link href="/" className="legal-back">← Till Plockivo</Link>{detailed&&<span>EN TJÄNST FRÅN TRAFEXA NORDIC AB</span>}</div>
  <header className={detailed?'legal-hero':undefined}><span className="marketing-kicker">TRYGGHET OCH INFORMATION</span><h1>{title}</h1><p className="legal-intro">{intro}</p><p className="legal-version">Version {version} <span aria-hidden="true">·</span> Uppdaterad {legalUpdated}</p>{detailed&&<a className="legal-hero-action" href="#kontakt">Frågor? Kontakta oss <span aria-hidden="true">↗</span></a>}</header>
  <nav className="legal-navigation" aria-label="Informationssidor">{legalLinks.map(link=><Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
  {summary.length>0&&<div className="legal-summary" aria-label="Överblick">{summary.map(item=><div key={item.label}><span>{item.label}</span><p>{item.text}</p></div>)}</div>}
  <div className={detailed?'legal-reading-layout':undefined}>
   {detailed&&<aside className="legal-index"><nav aria-label="Innehåll på sidan"><p>HITTA PÅ SIDAN</p><ol>{contents.map(item=><li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}<li><a href="#kontakt">Kontakt</a></li></ol></nav><div className="legal-index-note"><strong>Din kontakt i Plockivo</strong><a href={`mailto:${platformOwner.email}`}>{platformOwner.email}</a></div></aside>}
   <article id="legal-content" className="legal-content">{children}<section id="kontakt" className={detailed?'legal-contact-section':undefined}><h2>Kontakt</h2>{detailed&&<p>Frågor om denna information eller dina personuppgifter? Kontakta oss så hjälper vi dig vidare.</p>}<address><strong>{platformOwner.name}</strong><br/>Org.nr {platformOwner.organisationNumber}<br/><a href={`mailto:${platformOwner.email}`}>{platformOwner.email}</a></address></section></article>
  </div>
  <div className="legal-end"><Link href="/app" className="legal-back">Till inloggningen →</Link>{detailed&&<a href="#main">Till sidans början ↑</a>}</div>
 </main>
}
