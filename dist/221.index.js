"use strict";
exports.id = 221;
exports.ids = [221];
exports.modules = {

/***/ 221:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "parse": () => (/* binding */ b)
/* harmony export */ });
function f(e,t=0){return m(e,t,2).getUint16(0,!0)}function c(e,t=0){return m(e,t,4).getUint32(0,!0)}function s(e,t=0,x=e.byteLength){let n=e.slice(t,t+x);return U.decode(new Uint8Array(n))}function l(e,t,x=0){if(e.length<t.length+x)return!1;for(let[n,i]of t.entries())if(i!==null&&i!==e[n+x])return!1;return!0}function m(e,t,x){let n=e.slice(t,t+x);return new DataView(new Uint8Array(n).buffer)}var U=new TextDecoder("utf8");var u=[["db","application/vnd.sqlite3",[83,81,76,105,116,101,32,102,111,114,109,97,116,32,51,0]],["woff","font/woff",[119,79,70,70]],["woff2","font/woff2",[119,79,70,50]],["bmp","image/bmp",[66,77]],["gif","image/gif",[71,73,70,56,55,97]],["gif","image/gif",[71,73,70,56,57,97]],["heic","image/heic",[102,116,121,112,104,101,105],{offset:4}],["heic","image/heic",[102,116,121,112,109],{offset:4}],["ico","image/x-icon",[0,0,1,0]],["jpg","image/jpeg",[255,216,255]],["pdf","application/pdf",[37,80,68,70,45]],["png","image/png",[137,80,78,71,13,10,26,10]],["7z","application/x-7z-compressed",[55,122,188,175,39,28]],["rar","application/x-rar-compressed",[82,97,114,33,26,7,0]],["rar","application/x-rar-compressed",[82,97,114,33,26,7,1,0]],["rtf","application/rtf",[123,92,114,116,102,49]],["bz2","application/x-bzip2",[66,90,104]],["gz","application/gzip",[31,139]],["tar","application/x-tar",[117,115,116,97,114,0,48,48],{offset:257}],["tar","application/x-tar",[117,115,116,97,114,32,32,0],{offset:257}],["tif","image/tiff",[73,73,42,0]],["tiff","image/tiff",[77,77,0,42]],["zip","application/zip",[80,75,3,4],{exact:!1}],["zip","application/zip",[80,75,5,6]],["mp3","audio/mp3",[255,251]],["mp3","audio/mp3",[255,243]],["mp3","audio/mp3",[255,242]],["mp3","audio/mp3",[73,68,51]],["mp4","video/mp4",[102,116,121,112,105,115,111,109],{offset:4}],["avi","video/x-msvideo",[82,73,70,70,null,null,null,null,65,86,73,32]],["wav","audio/wav",[82,73,70,70,null,null,null,null,87,65,86,69]],["ogx","application/ogg",[79,103,103,83],{exact:!1},[["oga","audio/ogg",[127,70,76,65,67],{offset:28}],["ogg","audio/ogg",[1,118,111,114,98,105,115],{offset:28}],["ogm","video/ogg",[1,118,105,100,101,111,0],{offset:28}],["ogv","video/ogg",[128,116,104,101,111,114,97],{offset:28}]]],["webp","image/webp",[82,73,70,70,null,null,null,null,87,69,66,80]],["psd","image/vnd.adobe.photoshop",[56,66,80,83]],["flac","audio/x-flac",[102,76,97,67]],["wasm","application/wasm",[0,97,115,109]],["deb","application/x-deb",[33,60,97,114,99,104,62,10]],["exe","application/x-msdownload",[77,90]],["exe","application/x-msdownload",[90,77]],["class","application/java-vm",[202,254,186,190]],["parquet","application/vnd.apache.parquet",[80,65,82,49]]];function L(e){for(let t=0;t<e.length;t++)try{let x=e.charCodeAt(t);if(x===65533||x<=8)return!1}catch{return!1}return!0}function d(e){try{let t=s(e);if(!L(t))return;try{return JSON.parse(t),{ext:"json",mime:"application/json"}}catch{return{ext:"txt",mime:"text/plain"}}}catch{return}}function g(e){return y(e).map(([t,x,n,{offset:i=0}={}])=>n.length+i).reduce((t,x)=>x>t?x:t,0)}function y(e){return e.flatMap(([t,x,n,i={},r=[]])=>[[t,x,n,i],...r])}function h(e,{ext:t,mime:x}){return t||x?y(e).filter(n=>n[0]===t||n[1]===x):[]}function w(e,t){let x=0;for(;x+30<e.byteLength;){let n=f(e,x+18),i=f(e,x+26),r=f(e,x+28),p=s(e,x+30,i),[o]=p.split("/"),a=p.endsWith(".xml");if(o==="META-INF")return{ext:"jar",mime:"application/java-archive"};if(o==="ppt"&&a)return{ext:"pptx",mime:"application/vnd.openxmlformats-officedocument.presentationml.presentation"};if(o==="word"&&a)return{ext:"docx",mime:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"};if(o==="xl"&&a)return{ext:"xlsx",mime:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"};if(o==="mimetype")return j(e,i)??t;x=x+30+i+r+n}return t}function j(e,t){let x=c(e,18),n=c(e,22),i=f(e,28);if(x===n){let r=s(e,30+t+i,x);if(r==="application/vnd.oasis.opendocument.presentation")return{ext:"odp",mime:r};if(r==="application/vnd.oasis.opendocument.spreadsheet")return{ext:"ods",mime:r};if(r==="application/vnd.oasis.opendocument.text")return{ext:"odt",mime:r};if(r==="application/epub+zip")return{ext:"epub",mime:r}}}var F=g(u);function b(e,{extra:t=!1,hint:x}={}){if(x){let i=h(u,x);if(i.length>0){let r=v(e,i);if(r!==void 0)return r}}let n=v(e,u);if(n)return n;if(t)return R(e)}function v(e,t){let x=new Uint8Array(e.slice(0,F));for(let[n,i,r,{exact:p=!0,offset:o=0}={},a=[]]of t)if(l(x,r,o)){if(n==="zip"&&!p)return w(e,{ext:n,mime:i});if(!p&&a.length){for(let[S,B,A,{offset:z=0}={}]of a)if(l(x,A,z))return{ext:S,mime:B}}return{ext:n,mime:i}}}function R(e){return d(e)}


/***/ })

};
;
//# sourceMappingURL=221.index.js.map