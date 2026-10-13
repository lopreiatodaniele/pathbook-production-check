export function validSeats(value) { return Number.isInteger(value) && value >= 1 && value <= 3; }
export function decodeAvailability(value) {
  if (!value || typeof value !== "object" || !["ready", "unavailable"].includes(value.status) || value.capacity !== 3) throw new Error("Invalid availability contract");
  return { status: value.status, capacity: value.capacity };
}
export function safeEvent({release,operation,outcome,route,durationMs,requestId}) {
  if (!/^[a-zA-Z0-9-]{1,64}$/.test(release) || !["availability","runtime"].includes(operation) || !["success","unavailable","invalid_data","request_failed","runtime_error"].includes(outcome) || !["home","about"].includes(route) || !/^[a-f0-9-]{36}$/.test(requestId) || !Number.isFinite(durationMs) || durationMs<0) throw new Error("Invalid diagnostic event");
  return { release, operation, outcome, route, durationBucket:durationMs<1000?"under-1s":"at-least-1s", requestId };
}
export function eligibleRate({eligible,good}) { if(!Number.isInteger(eligible)||eligible<=0||!Number.isInteger(good)||good<0||good>eligible) return null; return good/eligible; }
