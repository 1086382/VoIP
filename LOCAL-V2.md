# VoIP V2 local checkout

This checkout starts from Render's deployed revision `e4a3885e0c5891de126c5f0c1dde759b713666e8`. The supplied fork was at `d614369`. V2 uses Node 22 and includes both npm lockfiles and rebuilt frontend assets.

## Install and build

From the V2 directory, with Node 22 and a local MongoDB server installed:

```sh
npm ci
npm --prefix frontend ci
npm --prefix frontend run build
```

The frontend uses Vue 3.5.45 and Vite. Use Node 22.12 or later in the Node 22 series for frontend builds. Express serves the built files from `frontend/dist`.

## Run the local smoke test

Start MongoDB bound to `127.0.0.1:27039` with a new data directory. The smoke test writes synthetic records to a disposable database called `voip_smoke`. Start the app from the V2 directory with:

```sh
export DB=mongodb://127.0.0.1:27039/voip_smoke
export HOST=127.0.0.1 PORT=3319 BASE_URL=http://127.0.0.1:3319/
export HTTPS=false SIGNUPS=on
export COOKIE_KEY="$(openssl rand -hex 32)"
export COOKIE_KEY2="$(openssl rand -hex 32)"
export CREDENTIALS_ENCRYPTION_KEY="$(openssl rand -hex 32)"
npm start &
app_pid=$!
```

Once the server reports its MongoDB connection, use the same shell to run:

```sh
node scripts/local-smoke.cjs
npm --prefix frontend run unit
kill "$app_pid"
```

For a separate backup restore check, use an empty local namespace. The supplied `test` database contains the records. The `voipsuite` dump contains an empty collection.

```sh
mongorestore --uri mongodb://127.0.0.1:27039 \
  --nsInclude 'test.*' --nsFrom 'test.*' --nsTo 'voip_backup_check.*' \
  ../MongoDB/backup
```

The local restore with MongoDB 8.0.38 recovered 818 documents with zero failures. The app smoke test used synthetic users and messages in a separate database. It covered registration, login, TOTP, authorized inbox reads, WebSocket authentication and delivery, signed inbound SMS persistence, and a signed delivery status callback. The test did not require the backup's original encryption key or a real Telnyx account.

After the Vue 3 migration, a Chromium test against the locally running app verified sign-in, the dashboard, opening settings, saving a contact, adding a recipient to a draft, and opening the dialer. Both frontend unit tests passed. Provider delivery and calls were outside that browser test.

## Dependency audit

[Audit reports](../Render/audits/) contain the package names, dependency paths and advisory URLs. The historical Render log counted 190 findings without listing packages. The baseline below was audited from a fresh resolution of the deployed backend manifest and the deployed frontend's lockfile.

| Audit | Baseline | V2 |
| --- | ---: | ---: |
| Backend | 28 | 0 |
| Frontend, including build and test tooling | 259 | 3 |
| Frontend, production dependencies | | 3 |

The current full and production-only frontend audits each report three moderate entries and zero high or critical entries. All three trace to the Telnyx WebRTC SDK dependency tree and its UUID package. The browser calling paths still use the existing Telnyx and Twilio SDKs.

## Changes affecting existing accounts and hosting

- Existing users need to sign in again. TOTP-enabled accounts receive an access token after the code is verified, and authenticated WebSockets join the account room automatically.
- Legacy hardware-key login and enrollment are disabled. The saved records contain credential IDs without signing public keys, so a verified WebAuthn replacement will require re-enrollment. Accounts with TOTP can sign in with TOTP. Accounts with only a hardware key need a recovery path before rollout.
- Outbound browser uploads accept one JPEG, PNG, or GIF per request, with a 10 MiB limit. The server assigns the filename extension, so an uploaded filename cannot determine how the browser interprets it. JSON requests are capped at 8 MiB and form-encoded requests at 1 MiB.
- Inbound MMS downloads require a signed webhook for a configured number. Downloads are limited to 5 MiB per file from HTTPS URLs and redirects are blocked. Verify this against actual Telnyx and Twilio media delivery before rollout.
- For a future deployment, set Render to Node 22, use `npm ci` for the backend and `npm start` to launch. Set `NODE_ENV=production`, `HTTPS=true`, and `BASE_URL` to the deployed HTTPS URL. Preserve the existing database encryption key and configure each Telnyx profile's public signing key.
- Live Render/Telnyx delivery, outbound SMS, provider calls, and broader browser coverage are pending. No GitHub push or live service change was made.
