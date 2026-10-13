import fs from "node:fs/promises";import path from "node:path";import {root}from"../scripts/build.mjs";
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
export function handler(channel,stateRoot){return async request=>{
 const url=new URL(request.url);if(request.method!=="GET"&&request.method!=="HEAD")return new Response("Method not allowed",{status:405});
 if(url.pathname==="/")return new Response(null,{status:302,headers:{Location:"/release-desk/"}});
 if(url.pathname==="/health")return Response.json({receiver:"running"},{headers:{"Cache-Control":"no-store"}});
 const current=JSON.parse(await fs.readFile(path.join(stateRoot,channel+".json"),"utf8")),folder=path.join(root,"releases",current.id);
 if(!url.pathname.startsWith("/release-desk/"))return new Response("Not found",{status:404});
 const name=url.pathname.slice("/release-desk/".length)||"index.html";let bytes;
 if(/^assets\/(client|style)-[a-f0-9]{16}\.(js|css)$/.test(name)){
  for(const id of await fs.readdir(path.join(root,"releases"))){try{bytes=await fs.readFile(path.join(root,"releases",id,name));break;}catch(error){if(error.code!=="ENOENT")throw error;}}
 }else if(["index.html","release.json","availability.json","public-config.json"].includes(name))bytes=await fs.readFile(path.join(folder,name));
 if(!bytes)return new Response("Not found",{status:404,headers:{"Cache-Control":"no-store"}});
 const headers={"Content-Type":types[path.extname(name)],"X-Content-Type-Options":"nosniff","Cache-Control":name.startsWith("assets/")?"public, max-age=31536000, immutable":name==="index.html"?"no-cache":"no-store"};
 if(name==="index.html")headers["Content-Security-Policy"]="default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'";
 return new Response(request.method==="HEAD"?null:bytes,{headers});
};}
