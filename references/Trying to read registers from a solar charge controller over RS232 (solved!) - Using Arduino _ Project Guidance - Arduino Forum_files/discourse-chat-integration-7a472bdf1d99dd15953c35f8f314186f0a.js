define("discourse/plugins/discourse-chat-integration/discourse/public-route-map",["exports"],(function(t){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(){this.route("transcript",{path:"/chat-transcript/:secret"})}})),define("discourse/plugins/discourse-chat-integration/discourse/routes/transcript",["exports","@ember/service","discourse/lib/ajax","discourse/lib/ajax-error","discourse/routes/discourse"],(function(t,e,r,s,i){"use strict"
Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0
class o extends i.default{static#t=(()=>dt7948.g(this.prototype,"currentUser",[e.inject]))()
#e=(()=>{dt7948.i(this,"currentUser")})()
static#r=(()=>dt7948.g(this.prototype,"composer",[e.inject]))()
#s=(()=>{dt7948.i(this,"composer")})()
static#i=(()=>dt7948.g(this.prototype,"router",[e.inject]))()
#o=(()=>{dt7948.i(this,"router")})()
async model(t){if(!this.currentUser)return this.session.set("shouldRedirectToUrl",window.location.href),void this.router.replaceWith("login")
await this.router.replaceWith("discovery.latest").followRedirects()
try{const e=await(0,r.ajax)(`/chat-transcript/${t.secret}`)
this.composer.openNewTopic({body:e.content})}catch(e){(0,s.popupAjaxError)(e)}}}t.default=o}))

//# sourceMappingURL=discourse-chat-integration-0c11a9c58b6ba21a6fab944b4f91ce0a5b20c28245d30e7acc8d1bddb55bc04f.map
//!

;
