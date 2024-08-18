"define"in window&&define("discourse/theme-40/discourse/initializers/theme-field-95-common-html-script-1",["exports","discourse/lib/plugin-api"],(function(e,t){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
require("discourse/lib/theme-settings-store").getObjectForTheme(40)
e.default={name:"theme-field-95-common-html-script-1",after:"inject-objects",initialize(){(0,t.withPluginApi)("0.11.0",(e=>{window.dataLayer=window.dataLayer||[],e.onAppEvent("page:bookmark-post-toggled",(e=>{e&&e.bookmarked&&window.dataLayer.push({event:"postBookmarked",postId:e.id})})),e.onAppEvent("post:created",(e=>{e&&window.dataLayer.push({event:"postCreated",postId:e.id})})),e.onAppEvent("topic:created",((e,t)=>{e&&window.dataLayer.push({event:"topicCreated",topicCategory:t.get("category.name")})})),e.onAppEvent("page:like-toggled",((e,t)=>{let i=e.topic
e&&i&&t&&t.acted&&window.dataLayer.push({event:"postLiked",postId:e.id})}))}))}}}))

//# sourceMappingURL=5c513fc961cd8c401fc52b9a1193e9ce8887e933.map?__ws=forum.arduino.cc
