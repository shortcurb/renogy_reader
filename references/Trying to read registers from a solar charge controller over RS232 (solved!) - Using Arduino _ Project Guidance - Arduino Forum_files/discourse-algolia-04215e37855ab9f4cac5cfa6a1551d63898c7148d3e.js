define("discourse/plugins/discourse-algolia/discourse/api-initializers/discourse-algolia",["exports","@ember/render-modifiers/modifiers/did-insert","rsvp","discourse/lib/api","discourse/lib/load-script","discourse/lib/url","discourse-common/config/environment","I18n","@ember/component","@ember/template-factory","@ember/component/template-only"],(function(e,t,a,s,i,l,o,r,n,c,u){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
e.default=(0,s.apiInitializer)("0.8",(e=>{const s=e.container.lookup("service:site-settings"),d=e.getCurrentUser(),p=()=>s.algolia_enabled&&s.algolia_autocomplete_enabled&&(!s.login_required||d)
let g
function m(){g?.destroy(),a.Promise.all([(0,i.default)("/plugins/discourse-algolia/javascripts/autocomplete.js"),(0,i.default)("/plugins/discourse-algolia/javascripts/algoliasearch.js")]).then((()=>{document.body.classList.add("algolia-enabled"),g=function(e){const t=window.algoliasearch,{autocomplete:a,getAlgoliaResults:s}=window["@algolia/autocomplete-js"]
if(document.getElementsByClassName("algolia-search")[0].getElementsByClassName("aa-Autocomplete").length>0)return
const i=t(e.algoliaApplicationId,e.algoliaSearchApiKey),o=a({container:".algolia-search",panelContainer:".algolia-autocomplete",debug:e.debug,detachedMediaQuery:"none",placeholder:r.default.t("discourse_algolia.search_box_placeholder"),getSources:()=>[{sourceId:"posts",getItemInputValue:e=>{let{item:t}=e
return t.query},getItems(e){let{query:t}=e
return s({searchClient:i,queries:[{indexName:"discourse-posts",query:t,params:{hitsPerPage:4}}]})},templates:{item(e){let{item:t,components:a,html:s}=e,i=[],n=t.topic.tags
return n&&n.forEach(((e,r)=>{i.push(s`<a
                    class="hit-post-tag"
                    onClick="${t=>{l.default.routeTo(`/tags/${e}`),o.setIsOpen(!1),t.preventDefault(),t.stopPropagation()}}"
                  >
                    ${a.Highlight({hit:t,attribute:["topic","tags",r]})}
                  </a>`)})),s` <div class="hit-post">
                <div class="hit-post-title-holder">
                  <span class="hit-post-topic-title">
                    ${a.Highlight({hit:t,attribute:["topic","title"]})}
                  </span>
                  <span
                    class="hit-post-topic-views"
                    title="${r.default.t("discourse_algolia.topic_views")}"
                  >
                    ${t.topic.views}
                  </span>
                </div>
                <div class="hit-post-category-tags">
                  <span class="hit-post-category">
                    <span class="badge-wrapper bullet">
                      <span
                        class="badge-category-bg"
                        style="background-color: #${t.category?.color};"
                      />
                      <a
                        class="badge-category hit-post-category-name"
                        onClick="${e=>{l.default.routeTo(t.category.url),o.setIsOpen(!1),e.preventDefault(),e.stopPropagation()}}"
                        >${t.category?.name}</a
                      >
                    </span>
                  </span>
                  <span class="hit-post-tags">${i}</span>
                </div>
                <div class="hit-post-content-holder">
                  <a
                    class="hit-post-username"
                    onClick="${e=>{l.default.routeTo(t.user.url),o.setIsOpen(!1),e.preventDefault(),e.stopPropagation()}}"
                    >@${t.user.username}</a
                  >:
                  <span class="hit-post-content">
                    ${a.Snippet({hit:t,attribute:"content"})}
                  </span>
                </div>
              </div>`},noResults(e){let{html:t}=e
return t`<div class="aa-empty">
                ${r.default.t("discourse_algolia.no_posts")}
              </div>`}},onSelect(e){let{item:t}=e
l.default.routeTo(t.url)}},{sourceId:"users",getItemInputValue:e=>{let{item:t}=e
return t.query},getItems(e){let{query:t}=e
return s({searchClient:i,queries:[{indexName:"discourse-users",query:t,params:{hitsPerPage:4}}]})},templates:{item(t){let{item:a,components:s,html:i}=t,l=""
a.likes_received>0&&(l=i`<span class="hit-user-like-heart">❤</span>
                  ${a.likes_received}`)
const o=s.Highlight({hit:a,attribute:a.name?"name":"username"})
return i`<div class="hit-user-left">
                  <img
                    class="hit-user-avatar"
                    src="${e.imageBaseURL}${a.avatar_template.replace("{size}",50)}"
                  />
                </div>
                <div class="hit-user-right">
                  <div class="hit-user-username-holder">
                    <span class="hit-user-username">
                      @${s.Highlight({hit:a,attribute:"username"})}
                    </span>
                    <span
                      class="hit-user-custom-ranking"
                      title="${r.default.t("discourse_algolia.user_likes")}"
                    >
                      ${l}
                    </span>
                  </div>
                  <div class="hit-user-name">${o}</div>
                </div>`}},onSelect(e){let{item:t}=e
l.default.routeTo(t.url)}},{sourceId:"tags",getItemInputValue:e=>{let{item:t}=e
return t.query},getItems(e){let{query:t}=e
return s({searchClient:i,queries:[{indexName:"discourse-tags",query:t,params:{hitsPerPage:4}}]})},templates:{item(e){let{item:t,components:a,html:s}=e
return s`<div class="hit-tag">
                #<span class="hit-tag-name">
                  ${a.Highlight({hit:t,attribute:"name"})}</span
                >
                <span
                  class="hit-tag-topic_count"
                  title="${r.default.t("discourse_algolia.topic_tags")}"
                  >${t.topic_count}</span
                >
              </div> `}},onSelect(e){let{item:t}=e
l.default.routeTo(t.url)}}],render(e,t){let{elements:a,render:s,html:i}=e
const{posts:n,users:c,tags:u}=a
s(i`<div class="aa-dropdown-menu">
          <div class="left-container">
            <div class="aa-dataset-posts">${n}</div>
          </div>
          <div class="right-container">
            <span class="aa-dataset-users">${c}</span>
            <span class="aa-dataset-tags">${u}</span>
          </div>
          <div class="aa-footer">
            <div class="left-container">
              <a
                class="advanced-search"
                onClick="${e=>{l.default.routeTo("/search"),o.setIsOpen(!1),e.preventDefault(),e.stopPropagation()}}"
                >${r.default.t("discourse_algolia.advanced_search")}</a
              >
            </div>
            <div class="right-container">
              <a
                target="_blank"
                class="algolia-logo"
                href="https://algolia.com/"
                title="${r.default.t("discourse_algolia.powered_by")}"
              ></a>
            </div>
          </div>
        </div>`,t)}})
return o}({algoliaApplicationId:s.algolia_application_id,algoliaSearchApiKey:s.algolia_search_api_key,imageBaseURL:"",debug:(0,o.isDevelopment)()})}))}e.headerIcons.add("algolia",(0,n.setComponentTemplate)((0,c.createTemplateFactory)({id:"xi8enSRY",block:'[[[1,"\\n"],[41,[28,[32,0],null,null],[[[1,"      "],[11,"li"],[24,0,"algolia-holder"],[4,[32,1],[[32,2]],null],[12],[1,"\\n        "],[10,0],[14,0,"algolia-search"],[12],[13],[1,"\\n        "],[10,0],[14,0,"algolia-autocomplete"],[12],[13],[1,"\\n      "],[13],[1,"\\n"]],[]],null],[1,"  "]],[],false,["if"]]',moduleName:"/var/www/discourse/app/assets/javascripts/discourse/discourse/plugins/discourse-algolia/discourse/api-initializers/discourse-algolia.js",scope:()=>[p,t.default,m],isStrictMode:!0}),(0,u.default)()))}))}))

//# sourceMappingURL=discourse-algolia-f45e3342aa98656dd9e7816d7b72fc70140b7a44e092987ddd2804dde5d4ec4b.map
//!

;
