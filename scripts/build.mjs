import fs from "node:fs/promises";import path from "node:path";import {createHash} from "node:crypto";
export const root=path.resolve(import.meta.dir,"..");
export const digest=bytes=>createHash("sha256").update(bytes).digest("hex");
export async function buildRelease(id="baseline",mode) {
  if(!/^[a-zA-Z0-9-]{1,64}$/.test(id))throw new Error("Invalid release ID");
  const config=JSON.parse(await fs.readFile(path.join(root,"release-source.json"),"utf8"));mode??=config.serviceMode;
  if(typeof config.label!=="string"||config.label.length>80||!["ready","unavailable"].includes(mode))throw new Error("Invalid public release configuration");
  const result=await Bun.build({entrypoints:[path.join(root,"src/client.js")],target:"browser",format:"esm",minify:true,define:{RELEASE_ID:JSON.stringify(id)}});
  if(!result.success)throw new Error("Build failed");const js=Buffer.from(await result.outputs[0].arrayBuffer()),css=await fs.readFile(path.join(root,"style.css"));
  const jsName="assets/client-"+digest(js).slice(0,16)+".js",cssName="assets/style-"+digest(css).slice(0,16)+".css";
  const html=(await fs.readFile(path.join(root,"index.html"),"utf8")).replace("{{JS}}",jsName).replace("{{CSS}}",cssName);
  const entries=new Map([["index.html",Buffer.from(html)],[jsName,js],[cssName,css],["availability.json",Buffer.from(JSON.stringify({status:mode,capacity:3}))],["public-config.json",Buffer.from(JSON.stringify({label:config.label}))]]);
  const manifest={id,toolchain:"bun@1.4.2",serviceMode:mode,files:Object.fromEntries([...entries].map(([name,bytes])=>[name,digest(bytes)]))};
  entries.set("release.json",Buffer.from(JSON.stringify(manifest,null,2)+"\n"));
  const folder=path.join(root,"releases",id);await fs.mkdir(folder,{recursive:true});
  const existing=await fs.readdir(folder);if(existing.length){for(const [name,bytes]of entries){if(!Buffer.from(await fs.readFile(path.join(folder,name))).equals(bytes))throw new Error("Release ID already owns different bytes: use a new ID");}if(existing.some(name=>!['assets','index.html','availability.json','public-config.json','release.json'].includes(name)))throw new Error("Unexpected release file");return manifest;}
  for(const[name,bytes]of entries){await fs.mkdir(path.dirname(path.join(folder,name)),{recursive:true});await fs.writeFile(path.join(folder,name),bytes);}
  console.log("Built "+id+" ("+mode+") with fingerprinted public assets");return manifest;
}
if(import.meta.main)await buildRelease(process.argv[2]??process.env.GITHUB_SHA??"baseline",process.argv[3]);
