import './polyfills.server.mjs';
import{a as j}from"./chunk-MYRRTMDS.mjs";import{t as D}from"./chunk-7Q4IHH5Z.mjs";import{a as R}from"./chunk-NEDADJCY.mjs";import{a as w,c as M,r as h}from"./chunk-ZW4IHJJG.mjs";import{B as x,Dc as l,Gb as f,Ja as b,U as S,V as r,Z as C,ca as a,da as s,fb as m,gb as p,yb as c}from"./chunk-EC3LRZMX.mjs";import"./chunk-5XUXGTUW.mjs";var d=class t{constructor(o,e){this.http=o;this.renewService=e}apiUrl=R.apiUrl;getAllinformations(){let o=localStorage.getItem("accessToken"),e=new w({Authorization:`Bearer ${o}`});return this.http.get(`${this.apiUrl}informations/informations`,{headers:e}).pipe(x(i=>this.renewService.handleTokenError(i,()=>this.getAllinformations())))}static \u0275fac=function(e){return new(e||t)(C(M),C(j))};static \u0275prov=S({token:t,factory:t.\u0275fac,providedIn:"root"})};var g=class t{constructor(o){this.informationService=o}ngOnInit(){this.informationService.getAllinformations().subscribe(o=>{console.log("hola estas son mis categorias: ",o.informations)},o=>{console.error("Error al obtener los usuarios:",o)})}hasPermission(o,e){let i=localStorage.getItem("userDetails");if(i){let y=JSON.parse(i).permissionsDetails;return e?y.some(n=>n.id_permission===o&&n.faq_category?.id_faq_category===e||n.id_permission===1||n.id_permission===9):y.some(n=>n.id_permission===o||n.id_permission===1||n.id_permission===9)}return!1}static \u0275fac=function(e){return new(e||t)(b(d))};static \u0275cmp=a({type:t,selectors:[["app-information-categories"]],standalone:!0,features:[f],decls:2,vars:0,template:function(e,i){e&1&&(m(0,"p"),c(1,"information-categories works!"),p())},dependencies:[D,l]})};var v=class t{static \u0275fac=function(e){return new(e||t)};static \u0275cmp=a({type:t,selectors:[["app-information-index"]],standalone:!0,features:[f],decls:2,vars:0,template:function(e,i){e&1&&(m(0,"p"),c(1,"information-index works!"),p())}})};var E=[{path:"",component:g},{path:"page/:id_info",component:v}],I=class t{static \u0275fac=function(e){return new(e||t)};static \u0275mod=s({type:t});static \u0275inj=r({imports:[h.forChild(E),h]})};var N=class t{static \u0275fac=function(e){return new(e||t)};static \u0275mod=s({type:t});static \u0275inj=r({imports:[l,I]})};export{N as InformationModule};
