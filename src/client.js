import {validSeats,decodeAvailability,safeEvent} from "./model.js";
const release=RELEASE_ID,events=[];let epoch=0,abort;
const form=document.getElementById("availability"),result=document.getElementById("result"),retry=document.getElementById("retry"),submit=form.querySelector("button");
document.getElementById("release").textContent="Release: "+release;
function report(operation,outcome,durationMs=0) {
  const event=safeEvent({release,operation,outcome,route:location.hash==="#about"?"about":"home",durationMs,requestId:crypto.randomUUID()});
  events.push(event);if(events.length>20)events.shift();document.getElementById("events").textContent=JSON.stringify(events,null,2);
}
function navigate() { epoch++;abort?.abort();submit.disabled=false;retry.hidden=true;result.textContent="";const about=location.hash==="#about";document.getElementById("home").hidden=about;document.getElementById("about").hidden=!about; }
addEventListener("hashchange",navigate);navigate();
async function check() {
  if(!form.reportValidity()||!validSeats(Number(form.elements.seats.value)))return;
  const owned=++epoch;abort?.abort();abort=new AbortController();submit.disabled=true;retry.hidden=true;result.textContent="Checking…";const started=performance.now();
  let outcome;
  try {
    const response=await fetch(new URL("availability.json",document.baseURI),{signal:abort.signal,cache:"no-store"});
    if(!response.ok)throw new Error("Request failed");
    let data;try{data=decodeAvailability(await response.json());}catch{outcome="invalid_data";throw new Error("Invalid data");}
    if(owned!==epoch)return;outcome=data.status==="ready"?"success":"unavailable";
    result.textContent=data.status==="ready"?"Available: "+form.elements.seats.value+" seats":"Availability is temporarily unavailable. Try again later.";retry.hidden=data.status==="ready";
  } catch(error) { if(owned!==epoch||error.name==="AbortError")return;outcome??="request_failed";result.textContent="Cannot check availability. Try again later.";retry.hidden=false; }
  finally { if(owned===epoch){submit.disabled=false;if(outcome)report("availability",outcome,performance.now()-started);} }
}
form.addEventListener("submit",event=>{event.preventDefault();void check();});retry.addEventListener("click",()=>void check());
addEventListener("error",()=>report("runtime","runtime_error"));addEventListener("unhandledrejection",()=>report("runtime","runtime_error"));
document.getElementById("error-probe").addEventListener("click",()=>{setTimeout(()=>{throw new Error("Fictional probe; never collect raw messages or stacks by default");},0);});
