import{b as k,d as F,e as E,f as T,g as R,h as V,p as N,q as de,t as L}from"./chunk-DQGBAIQE.js";import{a as K,c as ce,i as me,k as M,m as Y,n as $}from"./chunk-X2DCTIRQ.js";import{$a as ie,Ab as a,B as ne,Bb as X,Cb as D,Ea as U,Eb as b,F as B,Fb as h,Gb as C,Ib as O,Ka as m,La as u,Lb as ae,V as W,Y as re,Ya as P,Z as q,ab as f,ba as H,d as oe,ga as y,ha as z,hb as r,ib as i,mb as S,ob as p,p as j,pa as d,qa as g,qb as w,qc as le,sc as I,wc as _,yc as x,zb as se}from"./chunk-INDI3DVQ.js";var v=class n{constructor(e,t,o){this.http=e;this.platformId=t;this.router=o}apiUrl=$.apiUrl;apiKey=$.apiKey;login(e,t){let o=new K({"x-api-key":this.apiKey}),s={username:e,password:t};return this.http.post(`${this.apiUrl}administrator/auth/login`,s,{headers:o}).pipe(W(c=>{c.success&&this.saveTokens(c.accessToken,c.accountToken,c.userDetails)}),B(this.handleError))}saveTokens(e,t,o){x(this.platformId)&&typeof localStorage<"u"&&(localStorage.setItem("accessToken",e),localStorage.setItem("accountToken",t),localStorage.setItem("userDetails",JSON.stringify({id_user:o.id_user,username:o.username,is_blocked:o.is_blocked,failed_attempts:o.failed_attempts,permissionsDetails:o.permissionsDetails})),localStorage.setItem("isLoggedIn","true"),localStorage.setItem("lastAccessTime",new Date().getTime().toString()))}forgotPassword(e){let t=new K({"x-api-key":this.apiKey}),o={username:e};return this.http.post(`${this.apiUrl}administrator/auth/forgot-password`,o,{headers:t}).pipe(W(s=>s),B(s=>j(()=>s.error)))}resetPassword(e,t){let o=new K({"x-api-key":this.apiKey}),s={token:e,newPassword:t};return this.http.post(`${this.apiUrl}administrator/auth/forgot-password/reset-password`,s,{headers:o}).pipe(W(c=>c),B(c=>j(()=>new Error("Error al restablecer la contrase\xF1a."))))}handleError(e){let t="Ocurri\xF3 un error desconocido.";return e.error&&e.error.message&&(t=e.error.message),j(()=>new Error(t))}static \u0275fac=function(t){return new(t||n)(H(ce),H(U),H(M))};static \u0275prov=re({token:n,factory:n.\u0275fac,providedIn:"root"})};function we(n,e){if(n&1&&(r(0,"div",12),a(1),i()),n&2){let t=w();m(),X(t.errorMessage)}}function be(n,e){if(n&1&&(r(0,"div",13),a(1),i()),n&2){let t=w();m(),X(t.successMessage)}}var G=class n{constructor(e,t){this.authService=e;this.router=t}username="";password="";errorMessage="";successMessage="";isButtonDisabled=!0;isSubmitting=!1;ngOnInit(){}onInputChange(){let e=this.username.includes("@")&&this.username.includes("."),t=this.password.length>=8;this.isButtonDisabled=!(e&&t)}onLogin(e){return oe(this,null,function*(){if(e.invalid){this.errorMessage="Se requiere un nombre de usuario y contrase\xF1a v\xE1lidos.";return}this.isButtonDisabled=!0,this.isSubmitting=!0;try{let t=yield this.authService.login(this.username,this.password).toPromise();t.success?(this.successMessage=t.message,this.errorMessage="",this.router.navigate(["/menu"])):(this.errorMessage=t.message,this.successMessage="")}catch(t){this.errorMessage=t instanceof Error?t.message:"Ocurri\xF3 un error desconocido.",this.successMessage="",console.error("Login failed",t)}setTimeout(()=>{this.isSubmitting=!1,this.onInputChange()},3e3)})}onForgotPassword(){this.router.navigate(["/login/forgot-password"])}static \u0275fac=function(t){return new(t||n)(u(v),u(M))};static \u0275cmp=y({type:n,selectors:[["app-login"]],standalone:!0,features:[O],decls:20,vars:5,consts:[["loginForm","ngForm"],[1,"login-container"],[3,"ngSubmit"],["for","username"],["type","email","id","username","name","username","required","",3,"ngModelChange","input","ngModel"],["for","password"],["type","password","id","password","name","password","required","","minlength","8",3,"ngModelChange","input","ngModel"],["type","submit",1,"login-button"],["class","error-message",4,"ngIf"],["class","success-message",4,"ngIf"],[1,"forgot-password-link"],[1,"forgot-button",3,"click"],[1,"error-message"],[1,"success-message"]],template:function(t,o){if(t&1){let s=S();r(0,"div",1)(1,"h1"),a(2,"Iniciar Sesi\xF3n"),i(),r(3,"form",2,0),p("ngSubmit",function(){d(s);let l=se(4);return g(o.onLogin(l))}),r(5,"div")(6,"label",3),a(7,"Correo"),i(),r(8,"input",4),C("ngModelChange",function(l){return d(s),h(o.username,l)||(o.username=l),g(l)}),p("input",function(){return d(s),g(o.onInputChange())}),i()(),r(9,"div")(10,"label",5),a(11,"Contrase\xF1a"),i(),r(12,"input",6),C("ngModelChange",function(l){return d(s),h(o.password,l)||(o.password=l),g(l)}),p("input",function(){return d(s),g(o.onInputChange())}),i()(),r(13,"button",7),a(14," Iniciar Sesi\xF3n "),i()(),P(15,we,2,1,"div",8)(16,be,2,1,"div",9),r(17,"div",10)(18,"button",11),p("click",function(){return d(s),g(o.onForgotPassword())}),a(19,"\xBFOlvidaste tu contrase\xF1a?"),i()()()}t&2&&(m(8),b("ngModel",o.username),m(4),b("ngModel",o.password),m(),ie("disabled",o.isButtonDisabled?!0:null),m(2),f("ngIf",o.errorMessage),m(),f("ngIf",o.successMessage))},dependencies:[_,I,L,V,k,F,E,N,de,R,T],styles:['@font-face{font-family:Merriweather;src:url(/assets/Merriweather/Merriweather-Regular.woff2) format("woff2"),url(/assets/Merriweather/Merriweather-Regular.woff) format("woff");font-weight:400;font-style:normal}@font-face{font-family:Merriweather;src:url(/assets/Merriweather/Merriweather-Bold.woff2) format("woff2"),url(/assets/Merriweather/Merriweather-Bold.woff) format("woff");font-weight:700;font-style:normal}@font-face{font-family:Merriweather;src:url(/assets/Merriweather/Merriweather-Italic.woff2) format("woff2"),url(/assets/Merriweather/Merriweather-Italic.woff) format("woff");font-weight:400;font-style:italic}*[_ngcontent-%COMP%]{font-family:Merriweather}i[_ngcontent-%COMP%]{font-family:"Font Awesome 5 Free";font-weight:900}.login-container[_ngcontent-%COMP%]{max-width:400px;margin:100px auto 0;padding:20px;border:1px solid #ccc;border-radius:5px;box-shadow:0 0 10px #0000001a;background-color:#fff}.login-container[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{text-align:center;margin-bottom:20px}.login-container[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]{margin-bottom:15px}.login-container[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{display:block;margin-bottom:5px}.login-container[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{width:100%;padding:8px;box-sizing:border-box}.login-container[_ngcontent-%COMP%]   input.is-invalid[_ngcontent-%COMP%]{border-color:red}.login-container[_ngcontent-%COMP%]   input.is-valid[_ngcontent-%COMP%]{border-color:green}.login-button[_ngcontent-%COMP%]{width:100%;padding:10px;background-color:#ffb800;color:#000;border:none;border-radius:5px;cursor:pointer}.login-button[_ngcontent-%COMP%]:disabled{background-color:#ccc;cursor:not-allowed}.login-button[_ngcontent-%COMP%]:hover:enabled{background-color:#ffb800}.forgot-button[_ngcontent-%COMP%]{width:100%;padding:10px;background-color:#fff0;border:none;border-radius:5px;cursor:pointer}.error-message[_ngcontent-%COMP%]{color:red;font-size:.875em;margin-top:5px;text-align:center}.success-message[_ngcontent-%COMP%]{color:green;margin-top:10px;text-align:center}.forgot-password-link[_ngcontent-%COMP%]{text-align:center;margin-top:10px}.forgot-password-link[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{background:transparent;border:none;color:#000;text-decoration:none;cursor:pointer;font-size:1em;padding:0}.forgot-password-link[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover, .forgot-password-link[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:focus, .forgot-password-link[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:active{text-decoration:underline;outline:none;background:transparent}']})};var he=(n,e)=>({"success-message":n,"error-message":e});function Ce(n,e){if(n&1&&(r(0,"div",8),a(1),i()),n&2){let t=w();f("ngClass",ae(2,he,t.success,!t.success)),m(),D(" ",t.message," ")}}var J=class n{constructor(e,t,o){this.authService=e;this.router=t;this.platformId=o}email="";isButtonDisabled=!0;message="";success=!1;remainingTime=0;countdownSubscription=null;ngOnInit(){if(x(this.platformId)){let e=sessionStorage.getItem("remainingTime");e&&(this.remainingTime=parseInt(e,10),this.remainingTime>0&&(this.isButtonDisabled=!0,this.startCountdown()))}}ngOnDestroy(){this.stopCountdown()}forgotPassword(){this.email.includes("@")&&this.authService.forgotPassword(this.email).subscribe(e=>{e.success&&(this.success=!0,this.stopCountdown(),this.message=e.message,this.isButtonDisabled=!0)},e=>{console.log("Este es el error completo:",e),this.success=!1,e&&e.message?this.message=e.message:this.message="Error inesperado en la solicitud.",this.isWaitMessage(e.message)&&this.startCountdown(e.message)})}isWaitMessage(e){return console.log("este es el mensaje",e),/Debes esperar (\d+) minutos y (\d+) segundos/.test(e)}startCountdown(e){if(e){let t=/Debes esperar (\d+) minutos y (\d+) segundos/.exec(e);if(t){let o=parseInt(t[1],10),s=parseInt(t[2],10);this.remainingTime=o*60+s,x(this.platformId)&&sessionStorage.setItem("remainingTime",this.remainingTime.toString())}}this.isButtonDisabled=!0,this.updateMessage(),this.countdownSubscription=ne(1e3).subscribe(()=>{this.remainingTime>0?(this.remainingTime--,this.updateMessage(),x(this.platformId)&&sessionStorage.setItem("remainingTime",this.remainingTime.toString())):this.stopCountdown()})}updateMessage(){let e=Math.floor(this.remainingTime/60),t=this.remainingTime%60;this.message=`Debes esperar ${e} minutos y ${t} segundos antes de solicitar un nuevo token.`}stopCountdown(){this.countdownSubscription&&(this.countdownSubscription.unsubscribe(),this.countdownSubscription=null),this.isButtonDisabled=!1,this.message="",x(this.platformId)&&sessionStorage.removeItem("remainingTime")}checkFormValidity(){this.remainingTime<=0&&(this.isButtonDisabled=!this.email.includes("@"))}goToLogin(){this.router.navigate(["/login"])}static \u0275fac=function(t){return new(t||n)(u(v),u(M),u(U))};static \u0275cmp=y({type:n,selectors:[["app-forgot-password"]],standalone:!0,features:[O],decls:13,vars:3,consts:[["forgotPasswordForm","ngForm"],[1,"forgot-password-container"],[3,"ngSubmit"],["for","email"],["type","email","id","email","name","email","required","",3,"ngModelChange","input","ngModel"],["type","submit",1,"submit-button",3,"disabled"],[3,"ngClass",4,"ngIf"],[1,"back-to-login-button",3,"click"],[3,"ngClass"]],template:function(t,o){if(t&1){let s=S();r(0,"div",1)(1,"h2"),a(2,"Recuperar Contrase\xF1a"),i(),r(3,"form",2,0),p("ngSubmit",function(){return d(s),g(o.forgotPassword())}),r(5,"label",3),a(6,"Correo:"),i(),r(7,"input",4),C("ngModelChange",function(l){return d(s),h(o.email,l)||(o.email=l),g(l)}),p("input",function(){return d(s),g(o.checkFormValidity())}),i(),r(8,"button",5),a(9," Enviar Enlace de Recuperaci\xF3n "),i()(),P(10,Ce,2,5,"div",6),r(11,"button",7),p("click",function(){return d(s),g(o.goToLogin())}),a(12," Volver al Inicio de Sesi\xF3n "),i()()}t&2&&(m(7),b("ngModel",o.email),m(),f("disabled",o.isButtonDisabled),m(2),f("ngIf",o.message))},dependencies:[_,le,I,L,V,k,F,E,N,R,T],styles:[".forgot-password-container[_ngcontent-%COMP%]{max-width:400px;margin:100px auto;padding:20px;background-color:#fff;border-radius:10px;box-shadow:0 0 15px #0000001a;text-align:center}.forgot-password-container[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin-bottom:20px}.forgot-password-container[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]{margin-bottom:15px}.forgot-password-container[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{display:block;margin-bottom:5px;text-align:left}.forgot-password-container[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{width:100%;padding:10px;margin-bottom:15px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box}.submit-button[_ngcontent-%COMP%]{width:100%;padding:10px;background-color:#007bff;color:#fff;border:none;border-radius:5px;cursor:pointer}.submit-button[_ngcontent-%COMP%]:disabled{background-color:#ccc;cursor:not-allowed}.submit-button[_ngcontent-%COMP%]:disabled:hover{background-color:#bbb}.submit-button[_ngcontent-%COMP%]:hover{background-color:#0056b3}.back-to-login-button[_ngcontent-%COMP%]{margin-top:10px;background:none;color:#007bff;border:none;cursor:pointer;font-size:1em;padding:0;text-decoration:underline}.back-to-login-button[_ngcontent-%COMP%]:hover{color:#0056b3}.success-message[_ngcontent-%COMP%]{margin-top:15px;color:#28a745}.error-message[_ngcontent-%COMP%]{margin-top:15px;color:#dc3545}"]})};function _e(n,e){if(n&1&&(r(0,"div",11),a(1),i()),n&2){let t=w();m(),D(" ",t.passwordError," ")}}function Me(n,e){if(n&1&&(r(0,"div",12),a(1),i()),n&2){let t=w();m(),D(" ",t.successMessage," ")}}var Z=class n{constructor(e,t,o){this.route=e;this.authService=t;this.router=o}token="";newPassword="";confirmPassword="";passwordError="";successMessage="";ngOnInit(){this.route.queryParams.subscribe(e=>{this.token=e.token})}validatePassword(){let e=/[A-Z]/.test(this.newPassword),t=/[a-z]/.test(this.newPassword),o=/\d/.test(this.newPassword);return this.newPassword.length>=8?this.newPassword!==this.confirmPassword?(this.passwordError="Las contrase\xF1as no coinciden.",!1):!e||!t||!o?(this.passwordError="La contrase\xF1a debe incluir al menos una letra may\xFAscula, una letra min\xFAscula y un n\xFAmero.",!1):(this.passwordError="",!0):(this.passwordError="La contrase\xF1a debe tener al menos 8 caracteres.",!1)}resetPassword(){this.validatePassword()&&this.authService.resetPassword(this.token,this.newPassword).subscribe(e=>{e.success?(this.clearSession(),this.successMessage="La contrase\xF1a se ha restablecido correctamente. Redirigiendo al inicio de sesi\xF3n...",setTimeout(()=>{this.router.navigate(["/login"])},3e3)):this.passwordError=e.message||"Ocurri\xF3 un error al restablecer la contrase\xF1a."},e=>{console.error("Error al restablecer la contrase\xF1a",e),e==="Token no encontrado o inv\xE1lido."?(this.clearSession(),this.passwordError="Este link ya no es v\xE1lido. Redirigiendo al inicio de sesi\xF3n...",setTimeout(()=>{this.router.navigate(["/login"])},3e3)):this.passwordError=e||"Ocurri\xF3 un error al restablecer la contrase\xF1a. Intente nuevamente."})}clearSession(){localStorage.removeItem("accessToken"),localStorage.removeItem("accountToken"),localStorage.removeItem("userDetails"),localStorage.removeItem("isLoggedIn"),localStorage.removeItem("loginTime")}static \u0275fac=function(t){return new(t||n)(u(me),u(v),u(M))};static \u0275cmp=y({type:n,selectors:[["app-reset-password"]],standalone:!0,features:[O],decls:27,vars:4,consts:[["resetPasswordForm","ngForm"],[1,"reset-password-container"],[3,"ngSubmit"],["for","newPassword"],["type","password","id","newPassword","name","newPassword","required","",3,"ngModelChange","ngModel"],["for","confirmPassword"],["type","password","id","confirmPassword","name","confirmPassword","required","",3,"ngModelChange","ngModel"],["class","error-message",4,"ngIf"],[1,"password-guidelines"],["type","submit",1,"submit-button"],["class","success-message",4,"ngIf"],[1,"error-message"],[1,"success-message"]],template:function(t,o){if(t&1){let s=S();r(0,"div",1)(1,"h2"),a(2,"Restablecer Contrase\xF1a"),i(),r(3,"form",2,0),p("ngSubmit",function(){return d(s),g(o.resetPassword())}),r(5,"label",3),a(6,"Nueva Contrase\xF1a:"),i(),r(7,"input",4),C("ngModelChange",function(l){return d(s),h(o.newPassword,l)||(o.newPassword=l),g(l)}),i(),r(8,"label",5),a(9,"Confirmar Contrase\xF1a:"),i(),r(10,"input",6),C("ngModelChange",function(l){return d(s),h(o.confirmPassword,l)||(o.confirmPassword=l),g(l)}),i(),P(11,_e,2,1,"div",7),r(12,"div",8)(13,"small"),a(14,"Recuerde que la contrase\xF1a debe contener:"),i(),r(15,"ul")(16,"li"),a(17,"Al menos 8 caracteres"),i(),r(18,"li"),a(19,"Al menos una letra may\xFAscula"),i(),r(20,"li"),a(21,"Al menos una letra min\xFAscula"),i(),r(22,"li"),a(23,"Al menos un n\xFAmero"),i()()(),r(24,"button",9),a(25,"Restablecer Contrase\xF1a"),i(),P(26,Me,2,1,"div",10),i()()}t&2&&(m(7),b("ngModel",o.newPassword),m(3),b("ngModel",o.confirmPassword),m(),f("ngIf",o.passwordError),m(15),f("ngIf",o.successMessage))},dependencies:[_,I,L,V,k,F,E,N,R,T],styles:[".reset-password-container[_ngcontent-%COMP%]{max-width:400px;margin:100px auto;padding:20px;background-color:#fff;border-radius:10px;box-shadow:0 0 15px #0000001a;text-align:center}.reset-password-container[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin-bottom:20px}.reset-password-container[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]{margin-bottom:15px}.reset-password-container[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{display:block;margin-bottom:5px;text-align:left}.reset-password-container[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{width:100%;padding:10px;margin-bottom:15px;border:1px solid #ccc;border-radius:5px;box-sizing:border-box}.submit-button[_ngcontent-%COMP%]{width:100%;padding:10px;background-color:#007bff;color:#fff;border:none;border-radius:5px;cursor:pointer}.submit-button[_ngcontent-%COMP%]:hover{background-color:#0056b3}.password-guidelines[_ngcontent-%COMP%]{text-align:left;margin-bottom:15px}.password-guidelines[_ngcontent-%COMP%]   small[_ngcontent-%COMP%]{display:block;margin-bottom:5px;color:#6c757d}.password-guidelines[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]{list-style-type:disc;padding-left:20px;margin:0}.success-message[_ngcontent-%COMP%]{margin-top:15px;color:#28a745}.error-message[_ngcontent-%COMP%]{margin-bottom:20px;color:#dc3545}"]})};var ve=[{path:"",component:G},{path:"forgot-password",component:J},{path:"reset-password",component:Z}],Q=class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=z({type:n});static \u0275inj=q({imports:[Y.forChild(ve),Y]})};var fe=class n{static \u0275fac=function(t){return new(t||n)};static \u0275mod=z({type:n});static \u0275inj=q({imports:[_,Q]})};export{fe as AuthModule};
