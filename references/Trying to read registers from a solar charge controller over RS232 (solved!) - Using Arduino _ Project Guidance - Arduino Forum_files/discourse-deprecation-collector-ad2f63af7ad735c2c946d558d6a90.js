define("discourse/plugins/discourse-deprecation-collector/discourse/api-initializers/init-deprecation-collector",["exports","discourse/lib/api"],(function(e,t){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
e.default=(0,t.apiInitializer)("0.8",(e=>{e.container.lookup("service:deprecation-collector")}))})),define("discourse/plugins/discourse-deprecation-collector/discourse/services/deprecation-collector",["exports","@ember/debug","@ember/runloop","@ember/service","discourse/lib/source-identifier","discourse-common/lib/debounce","discourse-common/lib/deprecated","discourse-common/lib/get-url","discourse-common/utils/decorators"],(function(e,t,i,o,r,s,n,c,d){"use strict"
let l
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0,(0,t.registerDeprecationHandler)(((e,t,i)=>(l?.(e,t),i(e,t)))),(0,n.registerDeprecationHandler)(((e,t)=>l?.(e,t)))
class a extends o.default{static#e=(()=>dt7948.g(this.prototype,"router",[o.inject]))()
#t=(()=>{dt7948.i(this,"router")})()
#i=(()=>new Map)()
#o=(()=>new Map)()
#r
constructor(){super(...arguments),l=this.track
const e=window.deprecationWorkflow?.config?.workflow||{}
for(const t of e)this.#i.set(t.matchId,t.handler)
document.addEventListener("visibilitychange",this.handleVisibilityChanged),this.router.on("routeWillChange",this.debouncedReport)}willDestroy(){l=null,window.removeEventListener("visibilitychange",this.handleVisibilityChanged),this.router.off("routeWillChange",this.debouncedReport),(0,i.cancel)(this.#r),super.willDestroy()}handleVisibilityChanged(){"visible"!==document.visibilityState&&this.report()}static#s=(()=>dt7948.n(this.prototype,"handleVisibilityChanged",[d.bind]))()
track(e,t){if("silence"===this.#i.get(t.id))return
if("browser-extension"===(0,r.default)()?.type)return
let i=this.#o.get(t.id)||0
i+=1,this.#o.set(t.id,i)}static#n=(()=>dt7948.n(this.prototype,"track",[d.bind]))()
debouncedReport(){this.#r=(0,s.default)(this.report,1e4)}static#c=(()=>dt7948.n(this.prototype,"debouncedReport",[d.bind]))()
report(){if((0,i.cancel)(this.#r),0===this.#o.size)return
const e=Object.fromEntries(this.#o.entries())
this.#o.clear()
const t=new FormData
t.append("data",JSON.stringify(e)),navigator.sendBeacon((0,c.default)("/deprecation-collector/log"),t)}static#d=(()=>dt7948.n(this.prototype,"report",[d.bind]))()}e.default=a}))

//# sourceMappingURL=discourse-deprecation-collector-f01482a182d176ca683433b4117e833dd55ff90515857d7fe45f27809882b92d.map
//!

;
