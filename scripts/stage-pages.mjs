import fs from"node:fs/promises";import path from"node:path";import{root}from"./build.mjs";import{verifyArtifact}from"./artifact-check.mjs";
const id=process.argv[2]??process.env.GITHUB_SHA,folder=process.argv[3]??path.join(root,"releases",id);const manifest=await verifyArtifact(folder,id);
for(const name of [...Object.keys(manifest.files),"release.json"]){const target=path.join(root,"dist",name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(folder,name),target);}
await verifyArtifact(path.join(root,"dist"),id);console.log("Staged already verified bytes without rebuilding: "+id);
