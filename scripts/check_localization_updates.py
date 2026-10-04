#!/usr/bin/env python3
"""Detect English docs changes and prepare a localization review report.

This script intentionally stays conservative: it records which tracked English
source files changed and which Korean locale targets need review, without guessing
translation content. The repo-level localization skill remains the human/AI
translation step; this automation captures the change set and opens a PR for
review.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET_LOCALE = "ko-kr"
WATCHED_PATHS = (
    "README.md",
    "docs/locale-registry.js",
    "finished",
    "start-intro",
    "start-museum",
    "start-accessibility",
    "workshop",
)
REPORT_PATH = ROOT / ".github" / "localization-update-report.md"


def git_output(*args: str) -> str:
    result = subprocess.run(
        ["git", "--no-pager", *args],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return ""
    return result.stdout.strip()


def changed_files() -> list[str]:
    event_name = os.environ.get("GITHUB_EVENT_NAME")
    ref_name = os.environ.get("GITHUB_BASE_REF")

    if event_name == "pull_request" and ref_name:
        base_ref = f"origin/{ref_name}"
        output = git_output("diff", "--name-only", f"{base_ref}...HEAD")
    elif event_name in {"push", "workflow_dispatch"}:
        output = git_output("diff", "--name-only", "HEAD~1", "HEAD")
    else:
        output = git_output("status", "--porcelain")
        if output:
            lines = []
            for line in output.splitlines():
                if not line.strip():
                    continue
                path = line[3:].strip()
                if path.startswith("\"") and path.endswith("\""):
                    path = path[1:-1]
                lines.append(path)
            output = "\n".join(lines)

    files = []
    for path in output.splitlines():
        path = path.strip()
        if not path:
            continue
        if path.startswith("::"):
            continue
        files.append(path)

    return files


def is_watched(path: str) -> bool:
    normalized = path.strip().replace("\\", "/")
    if normalized == "README.md":
        return True
    if normalized == "docs/locale-registry.js":
        return True
    for root in WATCHED_PATHS[2:]:
        if normalized == root:
            return True
        if normalized.startswith(f"{root}/"):
            return True
    return False


def localized_target_for(path: str) -> str:
    normalized = path.strip().replace("\\", "/")
    return str((ROOT / "localizations" / TARGET_LOCALE / normalized).resolve())


def write_report(changed: list[str]) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    entries = [
        "# Localization update review",
        "",
        "This review was generated because the English source files below changed and may require a matching refresh under `localizations/ko-kr/`.",
        "",
        "## Changed English source files",
        "",
    ]

    if not changed:
        entries.append("No watched English source files changed.")
    else:
        for path in changed:
            entries.append(f"- `{path}`")

    entries.extend(["", "## Localized targets to review", ""])
    if not changed:
        entries.append("None.")
    else:
        for path in changed:
            localized = (ROOT / "localizations" / TARGET_LOCALE / path)
            status = "present" if localized.exists() else "missing"
            entries.append(f"- `{path}` -> `localizations/{TARGET_LOCALE}/{path}` ({status})")

    entries.extend([
        "",
        "The repo-local localization skill in `.github/skills/localizations/` remains the source-of-truth for translation quality. This report is intended to trigger a review PR when the source English docs change.",
        "",
    ])

    REPORT_PATH.write_text("\n".join(entries) + "\n", encoding="utf-8")


def main() -> int:
    files = [path for path in changed_files() if is_watched(path)]
    files = sorted(dict.fromkeys(files))

    if os.environ.get("WRITE_REPORT") == "1" or "--write-report" in sys.argv:
        write_report(files)

    if not files:
        print("No watched English source files changed. No localization update required.")
        return 0

    print("Changed English source files:")
    for path in files:
        print(f"- {path}")

    print("\nLocalized review targets:")
    for path in files:
        target = ROOT / "localizations" / TARGET_LOCALE / path
        status = "present" if target.exists() else "missing"
        print(f"- {path} -> localizations/{TARGET_LOCALE}/{path} [{status}]")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
