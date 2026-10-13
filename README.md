# Release Desk

An independent fictional frontend release and recovery workshop. Bun 1.4.2;
Playwright 1.64.0. No personal accounts, private APIs, telemetry vendor or database.
Do not copy books, Pathbook environment files or real credentials into a practice repo.

## Local release investigation

```sh
bun install --frozen-lockfile
bun run check
bunx playwright install chromium
bun run browser
bun run dev
```

Staging is http://127.0.0.1:4260/release-desk/ and production-like is
http://127.0.0.1:4261/release-desk/. These are local HTTP channels, not public
production or trusted TLS. Stop dev before browser commands; the test runner
owns both servers and refuses an existing server.

Build creates retained baseline/ready and exercise-fault/unavailable fixtures.
Release IDs cannot own different bytes. New authored source needs a new ID.
The provided build hashes JS/CSS and records exact artifact files/digests. It
deliberately exports only an allowlist of public configuration, not the process
environment. It does not claim universal secret detection, typechecking or lint.

```sh
bun run promote staging exercise-fault
bun run promote production exercise-fault
bun run promote production baseline
```

Keep dev running while these pointer changes happen in another terminal. Repeat
the three-seat task before, during and after the exercise. Compare release.json,
actual resource responses and diagnostic outcome. /health stays 200 even when
the task is unavailable. availability.json deliberately returns HTTP 200 with
a valid unavailable contract; this is a controlled dependency-state fixture,
not a real API outage. Existing hash-named assets remain available locally.

The frontend keeps only twenty allowlisted fictional events in page memory.
It reports outcomes and coarse durations, not form values, full URLs, raw
messages, stack traces or user identity. Its diagnostics do not establish
population RUM, backend traces, delivery reliability or privacy compliance.

## Your release and incident exercise

Complete RELEASE_REVIEW.md. Predict and inspect HTML/JSON/asset cache policies,
missing-resource status/type, prefix/hash navigation, current release and older
assets. Record stage/production differences and a useful alert/recovery rule.
Use the declared unavailable fixture, restore the retained baseline artifact
and repeat the exact task. Add one independently justified regression, demonstrate
a compiling red implementation against unchanged expectations in a disposable
copy, then restore green. Do not weaken expectations to approve a faulty release.

## Optional hosted HTTPS verification

Use only a new isolated repository you are authorized to publish. Push these
workshop files, enable Pages with GitHub Actions, inspect Verified delivery,
then test the actual HTTPS URL and its project-prefix resources. The workflow
checks models/HTTP/browser fixtures, retains the current source-SHA artifact,
publishes those same bytes, then runs the actual hosted task.

For an explicitly announced exercise, changing release-source.json serviceMode
to unavailable publishes the controlled fixture. The pre-release fixture tests
still verify their declared contracts; the post-publication user-task check
fails. This is not an instruction to release known failures to real users.
Use Recover retained release with the earlier successful delivery run ID and
its source SHA. Selection requires a completed successful main push in this
repository, an unexpired exact-named artifact and a verified manifest; the
recovery stages retained bytes without rebuilding and repeats the hosted task.

Artifact retention is seven days, not an indefinite recovery policy. Host
environment/permission controls still matter. Concurrency limits overlap but
is not a guarantee that every queued run survives. GitHub Pages is static:
no application API, arbitrary response-header configuration or database is
provided. Inspect actual host behavior rather than attributing the local
server's CSP/cache headers to Pages. A real service or VPS has additional
transport, routing, persistent-service, backup and operational owners.

## Verification scope

Thirteen model/artifact/actual HTTP groups and twelve desktop/narrow Chromium
cases use zero retries. Two browser cases intercept controlled response data
or delay an actual response; the other release/asset evidence uses the actual
receiver. This is not an all-engine, screen-reader, load, distributed-cache,
data-migration rollback, external telemetry or production penetration test.
