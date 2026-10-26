import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{return {id:'/',name:'Plockivo',short_name:'Plockivo',description:'Självskanning för företag',start_url:'/app',scope:'/',display:'standalone',background_color:'#f7f8f4',theme_color:'#244e3c',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]}}

