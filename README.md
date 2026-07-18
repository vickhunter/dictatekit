# DictateKit

<p align="center">
  <img src="docs/brand/dictatekit-icon-1024.png" alt="DictateKit" width="128" height="128" />
</p>

Privacy-first voice dictation for **macOS, Windows, and Linux**.

Press a hotkey, speak, and your words paste into whichever app is focused. Transcription runs locally with Whisper / NVIDIA Parakeet — your audio never has to leave your machine.

## Why DictateKit?

DictateKit is a fork of [OpenWhispr](https://github.com/OpenWhispr/openwhispr), rebranded for a **free, local-first** experience without Pro upsells in the UI.

| Goal | Approach |
|------|----------|
| Cross-platform | Electron + React (not a VoiceInk Swift port) |
| No trial / license nag | Local dictation works without buying anything |
| Custom brand | DictateKit naming, app id `com.dictatekit.app` |

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

## Quick start (development)

```bash
git clone <your-fork-url> dictatekit
cd dictatekit
npm install
npm run dev
```

First run compiles native helpers and may download local model runtimes (whisper.cpp, sherpa-onnx, etc.). That can take a while.

### Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev mode (Vite renderer + Electron) |
| `npm start` | Run packaged electron entry |
| `npm run build:mac` | macOS build |
| `npm run build:win` | Windows build |
| `npm run build:linux` | Linux build |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript check |

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
