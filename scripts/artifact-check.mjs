import fs from "node:fs/promises";import path from "node:path";import assert from "node:assert/strict";import {root,digest} from "./build.mjs";
export async function verifyArtifact(folder,expectedId) {
 const manifest=JSON.parse(await fs.readFile(path.join(folder,"release.json"),"utf8"));assert.equal(manifest.id,expectedId);assert.equal(manifest.toolchain,"bun@1.4.2");assert(["ready","unavailable"].includes(manifest.serviceMode));
 const names=Object.keys(manifest.files);assert.equal(names.length,5);assert(names.includes("index.html")&&names.includes("availability.json")&&names.includes("public-config.json"));assert.equal(names.filter(name=>/^assets\/(client|style)-[a-f0-9]{16}\.(js|css)$/.test(name)).length,2);
 const actual=await fs.readdir(folder,{recursive:true});assert.deepEqual(actual.filter(name=>name!=="assets").map(name=>name.replaceAll("\\","/")).sort(),[...names,"release.json"].sort());
 for(const [name,expected]of Object.entries(manifest.files)){const bytes=await fs.readFile(path.join(folder,name));assert.equal(digest(bytes),expected,name);assert(!bytes.includes("FICTIONAL_SERVER_ONLY_SENTINEL"));}
 assert.equal(JSON.parse(await fs.readFile(path.join(folder,"availability.json"),"utf8")).status,manifest.serviceMode);return manifest;
}
if(import.meta.main){const id=process.argv[2]??process.env.GITHUB_SHA??"baseline";await verifyArtifact(process.argv[3]??path.join(root,"releases",id),id);console.log("Verified exact artifact files and SHA-256 bytes for "+id);}
