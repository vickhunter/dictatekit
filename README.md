# DictateKit

<p align="center">
  <img src="docs/brand/dictatekit-icon-1024.png" alt="DictateKit" width="128" height="128" />
</p>

Privacy-first voice dictation for **macOS, Windows, and Linux**.

Press a hotkey, speak, and your words paste into whichever app is focused. Transcription runs locally with Whisper / NVIDIA Parakeet — your audio never has to leave your machine.

## Why DictateKit?

DictateKit is a fork of [OpenWhispr](https://github.com/OpenWhispr/openwhispr), rebranded for a **free, local-first** experience without Pro upsells in the UI.

| Goal                   | Approach                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| Cross-platform         | Electron + React (not a VoiceInk Swift port)                      |
| No trial / license nag | Local dictation works without buying anything                     |
| No advertising         | Every upsell surface is removed — see [Advertising](#advertising) |
| Custom brand           | DictateKit naming, app id `com.dictatekit.app`                    |

## Advertising

There is none. Upstream OpenWhispr ships a paid cloud tier, and this fork strips
the promotion of it:

- The upgrade dialog that popped up after a dictation is **deleted**, along with
  its `limit-reached` IPC channel
- "Approaching your weekly limit" nag toasts are **removed**
- The "Try Pro free for 7 days" card and the plan-comparison grid are **gone**
- "Upgrade to Pro" / "View plans" buttons are stripped from notes upload, the
  realtime banner, and the API/MCP/CLI integration cards

`src/config/promotions.ts` holds the `PROMOTIONS_ENABLED = false` switch that
gates the few surfaces that were kept in place rather than deleted, so upstream
merges stay easy to audit.

Two things are deliberately **kept**, because removing them would hurt you:

- **Manage Billing / Manage Subscription** — anyone who already pays for
  DictateKit Cloud must be able to review or cancel from inside the app
- **The factual usage meter** for signed-in cloud accounts — stating how many
  words remain is information, not an ad

Note that this changes the _interface_, not the _server_. Word limits on
DictateKit Cloud are enforced by the remote API, so hiding a button cannot lift
one. Local transcription (Whisper / Parakeet) has never been limited, is the
default here, and never contacts a server at all.

> **Name note:** `OpenDictation` already exists as another Mac project, so this fork uses **DictateKit**.

## Features

- Global hotkey dictation into any app
- Local Whisper (whisper.cpp) and Parakeet (sherpa-onnx)
- Optional cloud / BYOK providers if you want them
- Dictionary, notes, agent cleanup prompts
- macOS, Windows, and Linux builds

## Requirements

- Node.js **24+** (see `.nvmrc`)
- Platform build tools for native helpers (Xcode CLT on macOS, etc.)

## Download (macOS Apple Silicon)

- [DictateKit-0.1.0-arm64.dmg](https://github.com/vickhunter/dictatekit/releases/download/v0.1.0/DictateKit-0.1.0-arm64.dmg)
- [All releases](https://github.com/vickhunter/dictatekit/releases)

First launch may need right-click → **Open** (unsigned build).

## Quick start (development)

```bash
git clone https://github.com/vickhunter/dictatekit.git
cd dictatekit
nvm use 24
npm install
npm run dev
```

First run compiles native helpers and may download local model runtimes (whisper.cpp, sherpa-onnx, etc.). That can take a while.

### Useful scripts

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run dev`         | Dev mode (Vite renderer + Electron) |
| `npm start`           | Run packaged electron entry         |
| `npm run build:mac`   | macOS build                         |
| `npm run build:win`   | Windows build                       |
| `npm run build:linux` | Linux build                         |
| `npm test`            | Unit tests                          |
| `npm run typecheck`   | TypeScript check                    |

## Config / cache locations

After rebranding, local caches use `~/.cache/dictatekit/` (models, qdrant, etc.). Electron `userData` follows the DictateKit app id.

## Attribution

Based on **OpenWhispr** by the OpenWhispr / Gizmo Labs team — MIT licensed. See [LICENSE](LICENSE).

Upstream: https://github.com/OpenWhispr/openwhispr

## Roadmap (this fork)

1. Polish DictateKit branding (icons, colors, copy)
2. Keep local dictation as the default path with zero paywall UX
3. Optionally simplify onboarding (skip cloud account)
4. VoiceInk-inspired extras later: stronger per-app modes, dictionary UX

## License

MIT — see [LICENSE](LICENSE).
