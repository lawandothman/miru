if(!self.define){let e,s={};const a=(a,c)=>(a=new URL(a+".js",c).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(c,n)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let r={};const _=e=>a(e,i),t={module:{uri:i},exports:r,require:_};s[i]=Promise.all(c.map((e=>t[e]||_(e)))).then((e=>(n(...e),r)))}}define(["./workbox-c5ed321c"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/chunks/39-49002b7077800435.js",revision:"49002b7077800435"},{url:"/_next/static/chunks/39-49002b7077800435.js.map",revision:"eca712e2a6a9b4d1ecc19e847b4081c9"},{url:"/_next/static/chunks/4c744e84-5680d3ec54ef16bc.js",revision:"5680d3ec54ef16bc"},{url:"/_next/static/chunks/4c744e84-5680d3ec54ef16bc.js.map",revision:"732a079d7443147e877f6c5de7b5f07e"},{url:"/_next/static/chunks/581-dce43f1a83ce5f79.js",revision:"dce43f1a83ce5f79"},{url:"/_next/static/chunks/581-dce43f1a83ce5f79.js.map",revision:"6ee752d3de298b9f334d5d00e1b9c56b"},{url:"/_next/static/chunks/606-09b54b9aeb7f83ee.js",revision:"09b54b9aeb7f83ee"},{url:"/_next/static/chunks/606-09b54b9aeb7f83ee.js.map",revision:"060034d5ceb9cf231a4f76076fbedc25"},{url:"/_next/static/chunks/794-e951c218986f1765.js",revision:"e951c218986f1765"},{url:"/_next/static/chunks/794-e951c218986f1765.js.map",revision:"c527baedd7157f300b84d0f6bb62ba11"},{url:"/_next/static/chunks/807-b55d6d5556cc57c3.js",revision:"b55d6d5556cc57c3"},{url:"/_next/static/chunks/807-b55d6d5556cc57c3.js.map",revision:"8cc3c5a4f47664014187ecfd1e9979e9"},{url:"/_next/static/chunks/842-67e50fa3d6c0c95c.js",revision:"67e50fa3d6c0c95c"},{url:"/_next/static/chunks/842-67e50fa3d6c0c95c.js.map",revision:"375b9ec243576f97467d3f38606791e7"},{url:"/_next/static/chunks/framework-93435e5523790c31.js",revision:"93435e5523790c31"},{url:"/_next/static/chunks/framework-93435e5523790c31.js.map",revision:"700fc88a35819cd086384be5720f31cf"},{url:"/_next/static/chunks/main-2a98fc610b7cad66.js",revision:"2a98fc610b7cad66"},{url:"/_next/static/chunks/main-2a98fc610b7cad66.js.map",revision:"2a642f0ca19173c375b53a99d7b26b56"},{url:"/_next/static/chunks/pages/404-fe4b92f1d30535f6.js",revision:"fe4b92f1d30535f6"},{url:"/_next/static/chunks/pages/404-fe4b92f1d30535f6.js.map",revision:"a51edfb84ee00c2973d038567a0a693e"},{url:"/_next/static/chunks/pages/500-0369b3d2735b6758.js",revision:"0369b3d2735b6758"},{url:"/_next/static/chunks/pages/500-0369b3d2735b6758.js.map",revision:"ed2b334dd9c0086f6cac348a72994b0a"},{url:"/_next/static/chunks/pages/_app-f511f2308498ee10.js",revision:"f511f2308498ee10"},{url:"/_next/static/chunks/pages/_error-3817fd3d158e7b26.js",revision:"3817fd3d158e7b26"},{url:"/_next/static/chunks/pages/_error-3817fd3d158e7b26.js.map",revision:"bdde06f3e7922372d4d38d585f4d34a6"},{url:"/_next/static/chunks/pages/about-bf0fe1d423ea8078.js",revision:"bf0fe1d423ea8078"},{url:"/_next/static/chunks/pages/about-bf0fe1d423ea8078.js.map",revision:"343a0e4250574c0b1e334e269c94cccb"},{url:"/_next/static/chunks/pages/auth/signin-7020f5dd93490d36.js",revision:"7020f5dd93490d36"},{url:"/_next/static/chunks/pages/auth/signin-7020f5dd93490d36.js.map",revision:"4a010e46c466199d895c46948f9feb36"},{url:"/_next/static/chunks/pages/explore-acb46e472fdd0873.js",revision:"acb46e472fdd0873"},{url:"/_next/static/chunks/pages/explore-acb46e472fdd0873.js.map",revision:"508bec35e01f4f81d82dd100b1b3782b"},{url:"/_next/static/chunks/pages/for-you-ac7d2c9a9e964569.js",revision:"ac7d2c9a9e964569"},{url:"/_next/static/chunks/pages/for-you-ac7d2c9a9e964569.js.map",revision:"962cf2b2bab21580b9a3b7813ac9a9e9"},{url:"/_next/static/chunks/pages/genre/%5Bid%5D-c381d3eff220d941.js",revision:"c381d3eff220d941"},{url:"/_next/static/chunks/pages/genre/%5Bid%5D-c381d3eff220d941.js.map",revision:"ce20b94bb418fc0de25ae2bbf3856fc7"},{url:"/_next/static/chunks/pages/index-3bc5e3584d7cec18.js",revision:"3bc5e3584d7cec18"},{url:"/_next/static/chunks/pages/index-3bc5e3584d7cec18.js.map",revision:"621666463760c5502febcb65be3f0c26"},{url:"/_next/static/chunks/pages/movie/%5Bid%5D-ceccbdf0aa39e49d.js",revision:"ceccbdf0aa39e49d"},{url:"/_next/static/chunks/pages/movie/%5Bid%5D-ceccbdf0aa39e49d.js.map",revision:"2d9568dee48b71350ce4660d835a52ab"},{url:"/_next/static/chunks/pages/popular-c082dcceb1c461a3.js",revision:"c082dcceb1c461a3"},{url:"/_next/static/chunks/pages/popular-c082dcceb1c461a3.js.map",revision:"37f55c69dacfaaa452bd1d99c4ecf451"},{url:"/_next/static/chunks/pages/privacy-5c66fca725774533.js",revision:"5c66fca725774533"},{url:"/_next/static/chunks/pages/privacy-5c66fca725774533.js.map",revision:"1c724ea9869e27ed70b7335649669921"},{url:"/_next/static/chunks/pages/terms-and-conditions-5a07b3258230dabf.js",revision:"5a07b3258230dabf"},{url:"/_next/static/chunks/pages/terms-and-conditions-5a07b3258230dabf.js.map",revision:"010d4b2f8bd176f2b4054d3d3b96ffe3"},{url:"/_next/static/chunks/pages/user/%5Bid%5D-10152c9fe2da31fe.js",revision:"10152c9fe2da31fe"},{url:"/_next/static/chunks/pages/user/%5Bid%5D-10152c9fe2da31fe.js.map",revision:"d73a27cb42b9dffaf3d5e1cb3eaaebfc"},{url:"/_next/static/chunks/pages/watchlist-4d1a3e683046ce9e.js",revision:"4d1a3e683046ce9e"},{url:"/_next/static/chunks/pages/watchlist-4d1a3e683046ce9e.js.map",revision:"2dc33f18bbbc1f852ce2a3e2ff1019f1"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-2f903acb0cccbf9e.js",revision:"2f903acb0cccbf9e"},{url:"/_next/static/chunks/webpack-2f903acb0cccbf9e.js.map",revision:"787c4fc7f1ae252b6903a34db67bcbd0"},{url:"/_next/static/css/e2d73dd95635bc8f.css",revision:"e2d73dd95635bc8f"},{url:"/_next/static/css/e2d73dd95635bc8f.css.map",revision:"344257cb2834a33f99437bc7d36f3dc4"},{url:"/_next/static/media/phone.6b64740d.png",revision:"ae51a5299d86e29b67a9a317f4d15f84"},{url:"/_next/static/media/phone.bad47c84.png",revision:"8a5546b3832c0ecf6fc4badcb2de3de9"},{url:"/_next/static/media/photo.998b896b.png",revision:"e72fa5211a4625a176b9abd08e89d5a6"},{url:"/_next/static/media/photo.b183ea6e.png",revision:"b909d38c31f81bd84f67a31ce8a08764"},{url:"/_next/static/media/talk.53b5e406.png",revision:"383b01d688c68b50a590ca8185f87367"},{url:"/_next/static/media/talk.8ae67618.png",revision:"a044003cb7938773fd1baffccc97b93b"},{url:"/_next/static/vL9J1SkqYGSktb054ESQg/_buildManifest.js",revision:"7685df2a5900717250971d50e2d3c2c4"},{url:"/_next/static/vL9J1SkqYGSktb054ESQg/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/android-chrome-192x192.png",revision:"1c1f8f1354af8aa6ba9c8ff5e8b4224a"},{url:"/android-chrome-512x512.png",revision:"f7c2d3dfa096007267729e51a5342575"},{url:"/apple-touch-icon.png",revision:"06434c4eb3d0e95952c71859b68b6b99"},{url:"/favicon-16x16.png",revision:"a2a622c9eb51e267810d1683df1c1197"},{url:"/favicon-32x32.png",revision:"d71893b56c016f2bb7a4d1b6b182ab2f"},{url:"/favicon.ico",revision:"d45740c6e61aa9b3c08bdf1e3fa047c7"},{url:"/illustration/dark/phone.png",revision:"ae51a5299d86e29b67a9a317f4d15f84"},{url:"/illustration/dark/photo.png",revision:"b909d38c31f81bd84f67a31ce8a08764"},{url:"/illustration/dark/talk.png",revision:"a044003cb7938773fd1baffccc97b93b"},{url:"/illustration/light/phone.png",revision:"8a5546b3832c0ecf6fc4badcb2de3de9"},{url:"/illustration/light/photo.png",revision:"e72fa5211a4625a176b9abd08e89d5a6"},{url:"/illustration/light/talk.png",revision:"383b01d688c68b50a590ca8185f87367"},{url:"/robots.txt",revision:"dad26fa6c69c1b1ca20718bab5009bcd"},{url:"/site.webmanifest",revision:"4e976c233f273394da8f334c21f0fdcf"},{url:"/sitemap-0.xml",revision:"75a24cc029f4718afb6f73670079eb02"},{url:"/sitemap.xml",revision:"b7282f9c973ffb94c8830da26c2ac124"},{url:"/splash_screens/10.2__iPad_landscape.png",revision:"e1bd883d31834b32050034886f2abb79"},{url:"/splash_screens/10.2__iPad_portrait.png",revision:"77380c904b83e834da4cb50a63402a5c"},{url:"/splash_screens/10.5__iPad_Air_landscape.png",revision:"567021f17b0126fe359ad6fa590ddfe9"},{url:"/splash_screens/10.5__iPad_Air_portrait.png",revision:"53abc1cfb9eecfbac66a1cb613172c62"},{url:"/splash_screens/10.9__iPad_Air_landscape.png",revision:"8982bfd36d24d9d92c17db29fc0180cb"},{url:"/splash_screens/10.9__iPad_Air_portrait.png",revision:"ce8bf3f2b5ea3ed4c8e3c5d9f6c18032"},{url:"/splash_screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png",revision:"0023a31a0e7152612cbc1fe4f4f56b27"},{url:"/splash_screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png",revision:"25d4a1f31c87641c28055db93c08b1b8"},{url:"/splash_screens/12.9__iPad_Pro_landscape.png",revision:"9966f43b77a183f648bcc041dab035cb"},{url:"/splash_screens/12.9__iPad_Pro_portrait.png",revision:"03de62bce8fe0b03bc4f0efa1641f865"},{url:"/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png",revision:"2403d564e88e429ddabbbb6758edae2e"},{url:"/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png",revision:"3a680f11c5a7b051d00086283f81d5cf"},{url:"/splash_screens/8.3__iPad_Mini_landscape.png",revision:"8a8c770f62c589c17243cdc6daa68f0c"},{url:"/splash_screens/8.3__iPad_Mini_portrait.png",revision:"ba4bb4fdb366502aa6723eadc1b7fc5f"},{url:"/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png",revision:"2148401e28361af440fbdfd4e3bab4c7"},{url:"/splash_screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png",revision:"505388c7c2fcb5570c158422bb2f8f91"},{url:"/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png",revision:"da40b2ef7025d7d2d87f8e3bb6c6e873"},{url:"/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png",revision:"d39c5ab58fb3099dba70fdb3852b8885"},{url:"/splash_screens/iPhone_11__iPhone_XR_landscape.png",revision:"aeede3691cfc2955b4d9c4ffd57a2288"},{url:"/splash_screens/iPhone_11__iPhone_XR_portrait.png",revision:"88050d2a41e8e444cfeb7ff00cf70094"},{url:"/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png",revision:"e193370105306b59eb46c02ca4dff909"},{url:"/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png",revision:"9d3b3dfa086ba00312327c13adc96bd9"},{url:"/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png",revision:"422ddd34e7e0e80f105cc666e71237dc"},{url:"/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png",revision:"312064ec98bbf67fa80dacbd6976077e"},{url:"/splash_screens/iPhone_14_Pro_Max_landscape.png",revision:"4724951a07de7c63edb543aed468e894"},{url:"/splash_screens/iPhone_14_Pro_Max_portrait.png",revision:"17820c7f0f2bcf11863825a3af82205f"},{url:"/splash_screens/iPhone_14_Pro_landscape.png",revision:"dbd7a55f05ef7e37733edb2f19545033"},{url:"/splash_screens/iPhone_14_Pro_portrait.png",revision:"f070a8d48dabc269dfcff071ab38f57f"},{url:"/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png",revision:"37553433e6bf317bdc993d8fb2f7426e"},{url:"/splash_screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png",revision:"583bd5f9c46b3b1abb3586baa75470a9"},{url:"/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png",revision:"9e43a61585dda246aeac7b2c30d481a0"},{url:"/splash_screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png",revision:"5d9143672f6a2b600613eb2c0dcfadf8"},{url:"/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png",revision:"5b0f10f23b027fcdc2152ba09732653a"},{url:"/splash_screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png",revision:"3a6e0d0137e76d5f06234e7df5f6922b"},{url:"/splash_screens/icon.png",revision:"327c9c064a3f91d868ded4bd47e1c126"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:c})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
//# sourceMappingURL=sw.js.map
