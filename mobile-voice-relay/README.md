# mobile-voice-relay

Mobile → Computer voice path. **Windows is kept out of the real-time audio path** —
the phone captures the mic and runs STT (Web Speech API, in-browser), then POSTs
transcript *text* to the computer. The computer relays it to the agent/MCP bus.

## Why
Windows was bottlenecking voice (latency + CPU on live audio buffers). Offloading
capture+STT to the phone removes that. Computer does only text I/O.

## Run (computer / Windows box)
```
cd mobile-voice-relay
node server.js          # listens on :3007
```
- `POST /voice`        { text, lang, device } -> { ok, id, action }
- `GET  /voice/health` -> { ok:true }
- `GET  /`             -> serves the phone PWA

Transcripts are written to `./inbox/t-<ts>.json` (audit trail).

## Phone
1. Open `http://<computer-ip>:3007` in Chrome/Edge (same LAN: `192.168.20.2`).
2. Enter host, tap **Hold to talk**, then **Send**.
3. Transcript text arrives at the computer relay — no audio ever leaves the phone
   except as text.

Off-LAN: expose `:3007` via the ngrok Docker extension (CLI not installed).

## Hook into the control room
In `server.js`, the `POST /voice` handler has a marked hook point to forward
`rec` to the MCP bus (e.g. `localhost:4000`) or any agent endpoint.
