"require"in window&&require("discourse/lib/theme-settings-store").registerSettings(38,{emoji_icon:"👩🏽‍💻",disable_at_trust_level:3,sensitivity:.5,min_post_length_to_check:50,max_post_length_to_check:-1,include_html:!0}),"define"in window&&define("discourse/theme-38/discourse/components/modal/ucd-warning",["exports","@ember/component","@glimmer/component","@ember/object","@ember/service","@ember/template","pretty-text/sanitizer","discourse/lib/text","I18n","../../lib/emoji-diversity","@ember/template-factory"],(function(e,t,o,n,i,s,r,d,c,l,a){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
const u=require("discourse/lib/theme-settings-store").getObjectForTheme(38),m=(0,a.createTemplateFactory)({id:null,block:'[[[8,[39,0],[[24,0,"modal-ucd-warning"]],[["@closeModal","@title","@inline"],[[30,0,["closeModal"]],[30,0,["title"]],[30,1]]],[["default"],[[[[1,"\\n  "],[8,[39,1],null,[["@onClose"],[[30,0,["closeModal"]]]],null],[1,"\\n"]],[]]]]]],["@inline"],false,["d-modal","ucd/warning"]]',moduleName:"discourse/components/modal/ucd-warning.hbs",isStrictMode:!1})
class g extends o.default{static#e=(()=>dt7948.g(this.prototype,"ucdState",[i.service]))()
#t=(()=>{dt7948.i(this,"ucdState")})()
get title(){return(0,s.htmlSafe)([(0,d.emojiUnescape)((0,r.escape)((0,l.randomizeEmojiDiversity)(u.emoji_icon))),(0,r.escape)(c.default.t((e="warning_modal.title",`theme_translations.38.${e}`)))].join(" "))
var e}closeModal(){this.args.model.ucd_shouldPermanentlyDismiss&&this.ucdState.permanentlyDismiss(),this.args.closeModal()}static#o=(()=>dt7948.n(this.prototype,"closeModal",[n.action]))()}e.default=g,(0,t.setComponentTemplate)(m,g)})),"define"in window&&define("discourse/theme-38/discourse/components/ucd-warning",["exports","@ember/component","@glimmer/component","@ember/controller","@ember/object","@ember/service","@ember/template-factory"],(function(e,t,o,n,i,s,r){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
require("discourse/lib/theme-settings-store").getObjectForTheme(38)
const d=(0,r.createTemplateFactory)({id:null,block:'[[[8,[39,0],null,[["@rawText"],[[28,[37,1],[38,"warning_modal.content"],null]]],null],[1,"\\n"],[10,"label"],[14,"for","ucd_do-not-show-again"],[14,0,"checkbox-label"],[12],[1,"\\n  "],[8,[39,2],[[24,1,"ucd_do-not-show-again"],[24,3,"ucd_do-not-show-again"],[4,[38,4],["change",[30,0,["toggleShouldPermanentlyDismiss"]]],null]],[["@type","@checked"],["checkbox",[28,[37,3],[[30,0,["shouldPermanentlyDismiss"]]],null]]],null],[1,"\\n  "],[1,[28,[35,1],[38,"warning_modal.do_not_show_again"],null]],[1,"\\n"],[13],[1,"\\n"],[10,0],[14,0,"action-buttons"],[12],[1,"\\n  "],[8,[39,5],[[24,0,"btn-primary"]],[["@action","@icon","@label"],[[30,0,["goBackAndFix"]],"pencil-alt",[28,[37,6],[38,"warning_modal.fix_post"],null]]],null],[1,"\\n  "],[8,[39,5],null,[["@action","@label"],[[30,0,["ignoreAndProceed"]],[28,[37,6],[38,"warning_modal.ignore_and_post_anyway"],null]]],null],[1,"\\n"],[13]],[],false,["cook-text","theme-i18n","input","readonly","on","d-button","theme-prefix"]]',moduleName:"discourse/components/ucd-warning.hbs",isStrictMode:!1})
class c extends o.default{static#e=(()=>dt7948.g(this.prototype,"modal",[s.service]))()
#n=(()=>{dt7948.i(this,"modal")})()
static#o=(()=>dt7948.g(this.prototype,"ucdState",[s.service]))()
#t=(()=>{dt7948.i(this,"ucdState")})()
static#i=(()=>dt7948.g(this.prototype,"composer",[n.inject]))()
#s=(()=>{dt7948.i(this,"composer")})()
get shouldPermanentlyDismiss(){return this.ucdState.permanentlyDismissed??!1}toggleShouldPermanentlyDismiss(){this.ucdState.toggle()}static#r=(()=>dt7948.n(this.prototype,"toggleShouldPermanentlyDismiss",[i.action]))()
goBackAndFix(){this.modal.close()}static#d=(()=>dt7948.n(this.prototype,"goBackAndFix",[i.action]))()
ignoreAndProceed(){this.modal.close(),this.composer.model.ucd_previousWarningIgnored=!0,this.composer.save()}static#c=(()=>dt7948.n(this.prototype,"ignoreAndProceed",[i.action]))()}e.default=c,(0,t.setComponentTemplate)(d,c)})),"define"in window&&define("discourse/theme-38/discourse/core/code-energy",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.getCodeEnergyIndicators=e.codeEnergyValues=e.CodeEnergyLevels=void 0
const t=require("discourse/lib/theme-settings-store").getObjectForTheme(38),o="[$_a-zA-Z0-9]*",n=`[$_a-zA-Z]${o}`,i=`[$a-zA-Z]${o}`,s="[a-zA-Z-]+",r=`(?:${n}|(?:"(?:[^\\n"\\\\]|\\\\[^\\n])*"|'(?:[^\\n'\\\\]|\\\\[^\\n])*')|-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)`,d=`(?:\\s*${r}\\s*(?:,\\s*${r}\\s*)*|\\s*)`,c=e.CodeEnergyLevels={Complex:"Complex",High:"High",Medium:"Medium",Low:"Low"},l=e.codeEnergyValues={[c.Complex]:1,[c.High]:.7,[c.Medium]:.3,[c.Low]:.1},a=[`\\$${n}`,`^\\s*\\.${s}`,`:${n}`,`${i}(?:_${i})+`,"(?:^|\\s+)(?:\\/\\/|;)","\\/\\*[\\s\\S]+?\\*\\/","('''|\"\"\")[\\s\\S]+?\\1",";\\s*$",`(?:${n})?[$_a-z]\\(${d}\\)`,`${n}\\[\\s*${r}?\\s*\\]`,"^\\s*[{}]\\s*$","\\{\\{.+\\}\\}","[\\$#]\\{.+\\}","&&|!=|>>|<<|::|\\+=|-=|\\*=|\\/=|\\|\\|=|\\?=|\\.\\?","\\\\['\"ntr0\\\\]","<\\?[^>]*\\?>","<%[^>]*%>","0000-00-00T00:00:00".split("0").join("\\d"),"^\\s*at .+(.+)",'^\\s*{\\s*"[^"]*"\\s*:'],u=["\x3c!--[\\s\\S]*?--\x3e",`<${s}[^>]*\\/?>`,`</${s}>`,"&[0-9a-zA-Z]+;","&#[0-9]{1,7};","&#x[0-9a-fA-F]{1,6};"],m={[c.Complex]:{get indicators(){return[a,t.include_html&&u].filter(Boolean).flat()}},[c.High]:{indicators:[]},[c.Medium]:{indicators:[]},[c.Low]:{value:.1,indicators:[]}}
e.getCodeEnergyIndicators=()=>Object.entries(m).map((e=>{let[t,{indicators:o}]=e
return o.map((e=>({value:l[t],matcher:new RegExp(e,"gm")})))})).flat()})),"define"in window&&define("discourse/theme-38/discourse/core/detect-code",["exports","../lib/boundaries","./code-energy","./sensitivity","./strip-ignored-content"],(function(e,t,o,n,i){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.printDebugInfo=e.numSequentialLinesWithThresholdCodeEnergy=e.getCodeEnergy=e.detectUnformattedCode=void 0
const s=require("discourse/lib/theme-settings-store").getObjectForTheme(38),r=e=>{let n=0,i=0
const s=(0,t.getLineBoundaries)(e)
s.forEach((e=>{e.matches=0,e.matched_patterns=[]}))
for(const{matcher:r,value:d}of(0,o.getCodeEnergyIndicators)()){const c=[...e.matchAll(r)]
n+=c.length*d,d===o.codeEnergyValues[o.CodeEnergyLevels.Complex]&&(i+=c.length)
for(const e of c){const o=e.index,n=o+e[0].length
for(const e of s){const i=(0,t.isBetween)(e.start,e.end);(i(o)||i(n)||e.start>=o&&e.end<=n)&&(++e.matches,e.matched_patterns.push({matcher:r,value:d}))}}}return{totalCodeEnergy:n,totalComplexMatches:i,lines:s}}
e.getCodeEnergy=r
const d=e=>t=>{let o=0,n=0
for(const i of t)i.content.trim().length&&(i.matches>=e?++n:(o=Math.max(o,n),n=0))
return Math.max(o,n)}
e.numSequentialLinesWithThresholdCodeEnergy=d
e.printDebugInfo=e=>{e=(0,i.stripIgnoredContent)(e)
const{complexMatchesToIgnore:t,minSequentialLinesToMatch:o,minTotalCodeEnergy:s}=n.sensitivityConfig,{totalCodeEnergy:d,totalComplexMatches:c,lines:l}=r(e),a=[]
let u=0
l.forEach((e=>{e.content.trim()&&(e.matches?u++:u=0,a.push([e.matches?String(e.matches):"",u?String(u):"",e.matched_patterns.length?`\`${e.matched_patterns.map((e=>e.matcher)).join("`, `")}\``:"",e.content]))}))
const m=["matches","cumulative","matched patterns","content"],g=m.map((()=>""))
m.forEach(((e,t)=>{const o=Math.max(e.length,...a.map((e=>e[t].length)))
a.forEach((e=>e[t]=e[t].padEnd(o))),m[t]=e.padEnd(o),g[t]=g[t].padEnd(o,"-")})),a.unshift(m,g),console.log(a.map((e=>`| ${e.join(" | ")} |`)).join("\n")),console.log("Result is ",{totalCodeEnergy:d,totalComplexMatches:c,lines:l}),console.log("Sensitivity Config is ",{complexMatchesToIgnore:t,minSequentialLinesToMatch:o,minTotalCodeEnergy:s})}
e.detectUnformattedCode=e=>{const c=(0,i.stripIgnoredContent)(e)
return!!(0,t.isBetween)(s.min_post_length_to_check,-1===s.max_post_length_to_check?1/0:s.max_post_length_to_check)(e.length)&&(e=>{const{complexMatchesToIgnore:t,minSequentialLinesToMatch:i,minTotalCodeEnergy:s}=n.sensitivityConfig,{totalCodeEnergy:c,totalComplexMatches:l,lines:a}=r(e)
return!(l<=t||c<s||d(o.codeEnergyValues[o.CodeEnergyLevels.Complex])(a)<i)})(c)}})),"define"in window&&define("discourse/theme-38/discourse/core/sensitivity",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.sensitivityConfig=e.applySensitivity=void 0
const t=require("discourse/lib/theme-settings-store").getObjectForTheme(38),o=e=>(t,o)=>t+e*(o-t)
e.applySensitivity=o
e.sensitivityConfig={get complexMatchesToIgnore(){return Math.round(o(t.sensitivity)(4,0))},get minSequentialLinesToMatch(){return Math.round(o(t.sensitivity)(5,1))},get minTotalCodeEnergy(){return Math.round(o(t.sensitivity)(5,1))}}})),"define"in window&&define("discourse/theme-38/discourse/core/strip-ignored-content",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.stripIgnoredContent=void 0
require("discourse/lib/theme-settings-store").getObjectForTheme(38)
const t=[/(^([`~])\2{2,})[^`~\n]*\n[\s\S]*?\n\1\2*\s*(?:\n|$)/gm,/(?:^|(?:\n{2,}))\s*(?:(?: {4}|\t).*(?:\n|$))/g,/`[^`\n]+`/g,/\[([a-z]+).*?\][\s\S]*?\[\/\1\]/gim,/https?:\/\/(_\([^() \n\t]+\)|[^() \n\t])+/g,/:[a-z_+-][a-z_0-9+-]*:/g,/:D|:-D|:\)|:-\)|;\)|;-\)|:\(|:-\(|:o|:-o|:\?|:-\?|:\?\?\?:|8\)|8-\)|:x|:-x|:P|:-P|:!:|:\?:|:\||:-\||^_^|^__^|:'\(|:'-\(|:-'\(|:p|:O|:-O|:\/|;P|;-P|:\$|:-\$/g,/\((?:c|tm|r)\)/gi,/!?\[[^\]]+\]\([[^\)]+\)/g,/\B@[\w][\w.-]{0,58}\b/g]
e.stripIgnoredContent=e=>t.reduce(((e,t)=>e.replace(t,"")),e)})),"define"in window&&define("discourse/theme-38/discourse/initializers/init",["exports","@ember/service","discourse/lib/plugin-api","../components/modal/ucd-warning","../core/detect-code"],(function(e,t,o,n,i){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
const s=require("discourse/lib/theme-settings-store").getObjectForTheme(38)
e.default={name:"unformatted-code-detector",initialize(){(0,o.withPluginApi)("0.8.8",(e=>{window.debugUnformattedCodeDetector=()=>{const e=document.querySelector("#reply-control textarea.d-editor-input")?.value
e?(0,i.printDebugInfo)(e):console.log("No content found")},e.modifyClass("model:composer",{ucdState:(0,t.service)("ucd-state"),pluginId:"unformatted-code-detector",ucd_previousWarningIgnored:!1,ucd_checkShouldIgnoreWarning(){return this.ucd_previousWarningIgnored||this.ucdState.permanentlyDismissed||e.getCurrentUser()?.trust_level>=(-1===s.disable_at_trust_level?1/0:s.disable_at_trust_level)},ucd_checkUnformattedCodeDetected(){return(0,i.detectUnformattedCode)(this.reply)}}),e.modifyClass("controller:composer",{pluginId:"unformatted-code-detector",save(){this.model.ucd_checkUnformattedCodeDetected()&&!this.model.ucd_checkShouldIgnoreWarning()?this.modal.show(n.default,{model:this.model}):this._super(...arguments)}})}))}}})),"define"in window&&define("discourse/theme-38/discourse/lib/boundaries",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.isBetween=e.getLineBoundaries=void 0
require("discourse/lib/theme-settings-store").getObjectForTheme(38)
e.getLineBoundaries=e=>{const t=[]
let o=-1
do{t.push({start:o+1}),o=e.indexOf("\n",o+1),t[t.length-1].end=-1===o?e.length:o,t[t.length-1].content=e.slice(t[t.length-1].start,t[t.length-1].end)}while(o>-1)
return t}
e.isBetween=(e,t)=>o=>o>=e&&o<=t})),"define"in window&&define("discourse/theme-38/discourse/lib/emoji-diversity",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.randomizeEmojiSkinTone=e.randomizeEmojiGender=e.randomizeEmojiDiversity=void 0
require("discourse/lib/theme-settings-store").getObjectForTheme(38)
const t={masc:{adult:"👨",child:"👦",modifier:"‍♂"},fem:{adult:"👩",child:"👧",modifier:"‍♀"}},o=Object.keys(Object.values(t)[0]).reduce(((e,o)=>(e[o]=new RegExp(Object.values(t).map((e=>e[o])).filter(Boolean).join("|"),"g"),e)),{}),n=e=>Object.entries(o).reduce(((e,o)=>{let[n,i]=o
return e.replace(i,(()=>(()=>{const e=Object.values(t)
return e[Math.floor(Math.random()*e.length)]})()[n]))}),e)
e.randomizeEmojiGender=n
const i=127995,s=e=>e.replace(/[\u{1f3fb}-\u{1f3ff}]/gu,(()=>String.fromCodePoint(i+Math.floor(5*Math.random()))))
e.randomizeEmojiSkinTone=s
e.randomizeEmojiDiversity=e=>s(n(e))})),"define"in window&&define("discourse/theme-38/discourse/services/ucd-state",["exports","@ember/service","discourse/lib/key-value-store"],(function(e,t,o){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
require("discourse/lib/theme-settings-store").getObjectForTheme(38)
const n="permanently_dismissed"
class i extends t.default{store=(()=>new o.default("ucd_"))()
get permanentlyDismissed(){return this.store.getObject(n)||!1}toggle(){this.store.setObject({key:n,value:!this.permanentlyDismissed})}}e.default=i}))

//# sourceMappingURL=bf89cdc78d3b6ad20cc441f01d3b86426c3ddf23.map?__ws=forum.arduino.cc
