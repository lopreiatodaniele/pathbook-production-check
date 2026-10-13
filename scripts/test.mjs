import assert from"node:assert/strict";import fs from"node:fs/promises";import os from"node:os";import path from"node:path";import{validSeats,decodeAvailability,safeEvent,eligibleRate}from"../src/model.js";import{buildRelease,root}from"./build.mjs";import{verifyArtifact}from"./artifact-check.mjs";import{promote}from"./promote.mjs";import{handler}from"../src/server.mjs";
let count=0;async function test(name,fn){await fn();count++;console.log("PASS "+name);}
await test("legitimate seat boundary",()=>{assert(validSeats(1)&&validSeats(3));assert(!validSeats(0)&&!validSeats(4)&&!validSeats(1.5));});
await test("data validity is not service success",()=>{assert.equal(decodeAvailability({status:"unavailable",capacity:3}).status,"unavailable");assert.throws(()=>decodeAvailability({status:"ready",capacity:30}));});
await test("telemetry allowlist",()=>{const event=safeEvent({release:"baseline",operation:"availability",outcome:"success",route:"home",durationMs:90,requestId:crypto.randomUUID(),email:"PRIVATE",url:"PRIVATE",stack:"PRIVATE"});assert.deepEqual(Object.keys(event),["release","operation","outcome","route","durationBucket","requestId"]);assert(!JSON.stringify(event).includes("PRIVATE"));});
await test("missing eligible denominator is not zero failure",()=>{assert.equal(eligibleRate({eligible:0,good:0}),null);assert.equal(eligibleRate({eligible:100,good:99}),.99);});
await buildRelease("baseline","ready");await buildRelease("exercise-fault","unavailable");
await test("immutable release ID",async()=>{await assert.rejects(buildRelease("baseline","unavailable"),/different bytes/);});
const stateRoot=await fs.mkdtemp(path.join(os.tmpdir(),"pathbook-release-state-"));await promote("production","baseline",stateRoot);const server=Bun.serve({hostname:"127.0.0.1",port:0,fetch:handler("production",stateRoot)});const base="http://127.0.0.1:"+server.port+"/release-desk/";
try{
 await test("actual HTML and public release",async()=>{const r=await fetch(base);assert.equal(r.status,200);assert.equal(r.headers.get("cache-control"),"no-cache");assert((await r.text()).includes("assets/client-"));assert.equal((await fetch(base+"release.json")).headers.get("cache-control"),"no-store");});
 const manifest=await verifyArtifact(path.join(root,"releases/baseline"),"baseline"),asset=Object.keys(manifest.files).find(name=>name.endsWith(".js"));
 await test("actual hashed asset policy",async()=>{const r=await fetch(base+asset);assert.equal(r.status,200);assert.equal(r.headers.get("cache-control"),"public, max-age=31536000, immutable");assert.match(r.headers.get("content-type"),/javascript/);});
 await test("missing resource is not HTML success",async()=>{for(const name of["assets/missing.js","api/private","some-route"]){const r=await fetch(base+name);assert.equal(r.status,404);assert(!(await r.text()).includes("<html"));}});
 await test("no authored sources delivered",async()=>{assert.equal((await fetch(base+"src/client.js")).status,404);assert.equal((await fetch(base+".env")).status,404);});
 await test("health response is not the user outcome",async()=>{await promote("production","exercise-fault",stateRoot);assert.equal((await fetch(new URL("/health",base))).status,200);assert.equal((await(await fetch(base+"availability.json")).json()).status,"unavailable");});
 await test("old hashed assets remain reachable",async()=>{assert.equal((await fetch(base+asset)).status,200);});
 await test("rollback restores exact release and task data",async()=>{await promote("production","baseline",stateRoot);assert.deepEqual(await(await fetch(base+"release.json")).json(),manifest);assert.equal((await(await fetch(base+"availability.json")).json()).status,"ready");});
 await test("wrong target cannot be promoted",async()=>{await assert.rejects(promote("production","../outside",stateRoot));});
}finally{server.stop(true);}
console.log(count+" actual model/artifact/HTTP groups passed; local HTTP is not public TLS or population telemetry.");
