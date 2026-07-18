#!/usr/bin/env python3
"""One-shot rebrand OpenWhispr -> DictateKit. Safe to re-run."""

from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {
    ".git",
    "node_modules",
    "dist",
    ".local-build",
    "__pycache__",
}

SKIP_FILES = {
    "package-lock.json",
    "CHANGELOG.md",
    "Assets.car",
    "rebrand-dictatekit.py",
}

SKIP_SUFFIXES = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".icns",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".bin",
    ".dylib",
    ".so",
    ".dll",
    ".exe",
    ".zip",
    ".wasm",
    ".car",
    ".mp3",
    ".wav",
    ".onnx",
    ".gguf",
}

# Protect upstream URLs / GitHub paths during rename.
PROTECT = [
    ("https://auth.openwhispr.com", "__URL_AUTH_OW__"),
    ("https://www.openwhispr.com", "__URL_WWW_OW__"),
    ("https://openwhispr.com", "__URL_SITE_OW__"),
    ("http://openwhispr.com", "__URL_SITE_OW_HTTP__"),
    ("github.com/OpenWhispr/openwhispr", "__GH_OW_REPO__"),
    ("github.com/OpenWhispr", "__GH_OW_ORG__"),
    ('"CFBundleIconName": "openwhispr"', '"CFBundleIconName": "__KEEP_ICON_NAME__"'),
]

REPLACEMENTS = [
    ("com.gizmolabs.openwhispr", "com.dictatekit.app"),
    ("com.openwhispr.App", "com.dictatekit.App"),
    ("/com/openwhispr/App", "/com/dictatekit/App"),
    ("Open Whispr", "DictateKit"),
    ("OpenWhispr", "DictateKit"),
    ("open-whispr", "dictatekit"),
    ("OPENWHISPR", "DICTATEKIT"),
    ("openwhispr", "dictatekit"),
]

UNPROTECT = [
    ("__URL_AUTH_OW__", "https://auth.openwhispr.com"),
    ("__URL_WWW_OW__", "https://www.openwhispr.com"),
    ("__URL_SITE_OW__", "https://openwhispr.com"),
    ("__URL_SITE_OW_HTTP__", "http://openwhispr.com"),
    ("__GH_OW_REPO__", "github.com/OpenWhispr/openwhispr"),
    ("__GH_OW_ORG__", "github.com/OpenWhispr"),
    ('"CFBundleIconName": "__KEEP_ICON_NAME__"', '"CFBundleIconName": "openwhispr"'),
]


def should_skip(path: Path) -> bool:
    rel_parts = path.relative_to(ROOT).parts
    if any(part in SKIP_DIRS for part in rel_parts):
        return True
    if path.name in SKIP_FILES:
        return True
    if path.suffix.lower() in SKIP_SUFFIXES:
        return True
    return False


def transform(text: str) -> str:
    for old, new in PROTECT:
        text = text.replace(old, new)
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    for old, new in UNPROTECT:
        text = text.replace(old, new)
    return text


def main() -> None:
    changed = 0
    scanned = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            path = Path(dirpath) / name
            if should_skip(path):
                continue
            scanned += 1
            try:
                original = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            updated = transform(original)
            if updated != original:
                path.write_text(updated, encoding="utf-8")
                changed += 1
                print(f"updated: {path.relative_to(ROOT)}")
    print(f"done. scanned={scanned} changed={changed}")


if __name__ == "__main__":
    main()
