define("discourse/plugins/discourse-yearly-review/discourse/components/yearly-review-admin-notice",["exports","@glimmer/component","@ember/template","discourse/helpers/replace-emoji","discourse-common/helpers/i18n","discourse-common/lib/get-url","discourse-i18n","@ember/component","@ember/template-factory"],(function(e,t,i,r,s,n,a,o,l){"use strict"
function d(){return new Date((new Date).getFullYear()+1,0,1)}Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0,e.janNextYear=d
class u extends t.default{get toBeCreatedDate(){return moment(d()).format(a.default.t("dates.full_with_year_no_time"))}get settingsUrl(){return(0,n.default)("/admin/site_settings/category/plugins?filter=plugin%3Adiscourse-yearly-review")}static#e=(()=>(0,o.setComponentTemplate)((0,l.createTemplateFactory)({id:"xvwlriwT",block:'[[[1,"\\n    "],[10,0],[14,0,"yearly-review-admin-notice alert alert-info"],[12],[1,"\\n      "],[1,[28,[32,0],[[28,[32,1],[[28,[32,2],["yearly_review.admin_notice"],[["to_be_created_date","settings_url"],[[30,0,["toBeCreatedDate"]],[30,0,["settingsUrl"]]]]]],null]],null]],[1,"\\n    "],[13],[1,"\\n  "]],[],false,[]]',moduleName:"/var/www/discourse/app/assets/javascripts/discourse/discourse/plugins/discourse-yearly-review/discourse/components/yearly-review-admin-notice.js",scope:()=>[r.default,i.htmlSafe,s.default],isStrictMode:!0}),this))()}e.default=u})),define("discourse/plugins/discourse-yearly-review/discourse/initializers/yearly-review-admin-notice",["exports","discourse/lib/plugin-api","discourse/plugins/discourse-yearly-review/discourse/components/yearly-review-admin-notice"],(function(e,t,i){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
e.default={name:"yearly-review-admin-notice",initialize(e){(0,t.withPluginApi)("1.18.0",(t=>{if(!e.lookup("service:site-settings").yearly_review_enabled)return
11===(new Date).getMonth()&&t.renderInOutlet("admin-dashboard-top",i.default)}))}}}))

//# sourceMappingURL=discourse-yearly-review-e30b3510bf1ae1d7ae6ae097db02cb060b70a14a8c0abf68f7ac8d55ec14a984.map
//!

;
