# DictateKit for iPhone

DictateKit's desktop app is Electron, and **Electron does not run on iOS** — there
is no port path. The iPhone version is a separate native Swift app. Rather than
building one from scratch (months of work), the plan is to **fork an existing
MIT-licensed app that already does almost everything DictateKit does** and
rebrand it.

## The base: VivaDicta

[VivaDicta](https://github.com/n0an/VivaDicta) (MIT, actively maintained) is the
closest thing to an iOS twin of DictateKit that exists:

- **On-device transcription** with WhisperKit _and_ NVIDIA Parakeet — the same
  two engines DictateKit uses on desktop
- **System-wide voice keyboard**: dictate into Messages, WhatsApp, Slack, Mail —
  the iOS equivalent of DictateKit's paste-into-any-app hotkey
- Notes with on-device semantic search, optional cloud providers (BYOK),
  Apple Watch app, iCloud sync
- Swift 6, Xcode 26+, iOS 18+

Forking it skips the two hardest problems (keyboard extension architecture and
on-device inference) entirely.

### The design

The **iPhone page of the design canvas** holds the target screens (Home,
Recording, Voice Keyboard states) in DictateKit's visual language. Color
mapping from the desktop theme:

| Token         | Hex       | Use                                   |
| ------------- | --------- | ------------------------------------- |
| Paper         | `#f7f4ed` | Backgrounds                           |
| Paper raised  | `#f1ece1` | Keyboard panel, cards, tab bar        |
| Ink           | `#2b2118` | Text, primary buttons, record button  |
| Espresso dark | `#241c14` | Recording screen / listening keyboard |
| Brass         | `#c8ab77` | Waveform bars, record-button ring     |
| Brass deep    | `#8a6f42` | Links, accents on paper               |
| Sage          | `#e4ead9` | Latest-dictation highlight            |
| Live red      | `#d95c40` | Recording indicator, stop control     |

Fonts: system SF (body) is fine on iOS; Newsreader for the Home title and
Spline Sans Mono for timestamps/metadata if you want full parity (both are on
Google Fonts; bundle as app resources).

App icon: reuse the Signal mark — `docs/brand/dictatekit-icon-1024.png` is the
1024×1024 master Xcode wants for the AppIcon asset.

## iOS constraints to design around (not bugs, platform rules)

1. **Keyboard extensions cannot access the microphone.** The keyboard is a
   trigger: recording and transcription happen in the main app / via the shared
   container, and the keyboard inserts the resulting text. VivaDicta already
   implements this dance — don't restructure it.
2. **Keyboard extensions get roughly 50 MB of memory.** No model ever loads in
   the keyboard process.
3. **Model sizes on the phone** (jetsam kills over-budget apps instantly):
   - Whisper tiny/base (75–142 MB disk): safe on every supported iPhone —
     sensible default
   - Whisper small / large-v3-turbo (CoreML): iPhone 13 Pro and later
   - **Parakeet v3 int8: ~1.2 GB RAM measured on iOS** — only offer it on
     8 GB devices (iPhone 15 Pro and later), never as the mobile default
   - Apple's built-in on-device speech is free, instant, and needs no
     download — good zero-setup tier
4. **"Full Access"** must be enabled by the user for the keyboard
   (Settings → General → Keyboard → Keyboards) so it can reach the shared
   App Group container.

## Step by step

### 1. Fork and clone

1. Open https://github.com/n0an/VivaDicta → **Fork** → name it
   `dictatekit-ios` under your account.
2. `git clone https://github.com/vickhunter/dictatekit-ios && open` the
   `.xcodeproj`/`.xcworkspace` in **Xcode 26 or newer** (macOS with Xcode
   required — iOS apps only build on a Mac).
3. Build & run on the simulator first, unmodified, to confirm the baseline
   works before touching anything.

### 2. Rebrand to DictateKit

Work through this checklist in Xcode:

- [ ] **Display name**: target → General → Display Name → `DictateKit`
- [ ] **Bundle identifiers**: main app → `com.dictatekit.ios`, keyboard
      extension → `com.dictatekit.ios.keyboard`, watch app if kept →
      `com.dictatekit.ios.watch`
- [ ] **App Group**: rename to `group.com.dictatekit.ios` in _every_ target's
      Signing & Capabilities, and update the group string constant in code
      (search the source for the old `group.` identifier)
- [ ] **App icon**: replace the AppIcon asset with
      `docs/brand/dictatekit-icon-1024.png`
- [ ] **Accent/theme colors**: replace the asset-catalog colors with the
      parchment palette above (start with accent → brass deep `#8a6f42`,
      backgrounds → paper)
- [ ] **User-facing strings**: search for the upstream product name and
      replace with DictateKit
- [ ] **Keep the MIT license and attribution**: retain VivaDicta's LICENSE and
      add a NOTICE line, exactly as DictateKit's desktop repo credits
      OpenWhispr
- [ ] **Default model**: set Whisper base (or Apple speech) as the default;
      expose Parakeet v3 as the "best quality" option gated to 8 GB devices

### 3. Install on your iPhone

**Free Apple ID (fastest, for personal testing):**

1. Xcode → Settings → Accounts → add your Apple ID (a free "Personal Team").
2. Select each target → Signing & Capabilities → Team → your personal team;
   let Xcode fix the provisioning.
3. Plug in your iPhone (or same-Wi-Fi), select it as the run destination, ⌘R.
4. On the phone: Settings → Privacy & Security → **Developer Mode** → on
   (reboots once), then Settings → General → VPN & Device Management → trust
   your certificate.
5. Enable the keyboard: Settings → General → Keyboard → Keyboards → Add New
   Keyboard → DictateKit → **Allow Full Access**.

Caveats of the free path: apps expire after **7 days** (re-run from Xcode to
refresh), max 3 sideloaded apps, and some restricted capabilities can be
unavailable on personal teams — if Xcode flags the **App Groups** capability,
the keyboard↔app handoff needs the paid program.

**Apple Developer Program ($99/yr — the real path):**

- No 7-day expiry, all capabilities, and **TestFlight**: push a build once,
  install over the air on your phone (and up to 10,000 testers'), update like
  a normal app.
- It's also the same account that would let the _desktop_ DMGs be signed and
  notarized — one membership fixes the Gatekeeper "damaged" warning on macOS
  and unlocks iOS distribution simultaneously.

## What stays shared with desktop

Nothing at the code level (Swift vs Electron/TypeScript) — the shared surface
is **brand and behavior**: the Signal mark, the parchment palette, the same
two local engines, local-first/no-account defaults, and the "speak anywhere,
text lands where you were typing" interaction. Treat the design canvas as the
contract between the two apps.
