# Notice

DictateKit is a fork of [OpenWhispr](https://github.com/OpenWhispr/openwhispr)
(MIT License, Copyright OpenWhispr Team / Gizmo Labs).

This fork:

- Renames the product to **DictateKit** (`com.dictatekit.app`)
- Targets a free, local-first UX with **no advertising surfaces at all**: the
  post-dictation upgrade dialog, the "approaching limit" nag toasts, the trial
  CTA and every "Upgrade to Pro" button are gone. See `src/config/promotions.ts`.
- Keeps upstream OpenWhispr cloud hostnames where optional cloud features still call them
- Does **not** claim affiliation with VoiceInk or OpenWhispr beyond MIT attribution

VoiceInk (https://github.com/Beingpax/VoiceInk) inspired the product goals but
is **not** copied into this repository (VoiceInk is GPL-3.0 / Swift / macOS-only).
