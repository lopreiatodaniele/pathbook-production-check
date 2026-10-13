import fs from "node:fs/promises";import path from "node:path";import {root}from"./build.mjs";import{verifyArtifact}from"./artifact-check.mjs";
export async function promote(channel,id,stateRoot=path.join(root,"state")){
 if(!["staging","production"].includes(channel)||!/^[a-zA-Z0-9-]{1,64}$/.test(id))throw new Error("Invalid channel or ID");await verifyArtifact(path.join(root,"releases",id),id);
 await fs.mkdir(stateRoot,{recursive:true});const target=path.join(stateRoot,channel+".json"),pending=target+"."+crypto.randomUUID()+".tmp";await fs.writeFile(pending,JSON.stringify({id}));await fs.rename(pending,target);console.log("Promoted retained artifact "+id+" to "+channel);
}
if(import.meta.main)await promote(process.argv[2],process.argv[3]);
