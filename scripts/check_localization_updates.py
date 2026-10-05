#!/usr/bin/env python3
"""List English documentation sources that require localization updates."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
MARKDOWN_ROOTS = (
    "finished",
    "start-intro",
    "start-museum",
    "start-accessibility",
    "workshop",
)
EXACT_SOURCES = {"README.md", "docs/locale-registry.js"}
STATE_TRACKED_EXACT_SOURCES = {"README.md"}
ALLOWED_OUTPUTS = {"docs/locale-registry.js"}


def git_output(*args: str) -> str:
    result = subprocess.run(
        ["git", "--no-pager", *args],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"git {' '.join(args)} failed")
    return result.stdout


def normalize(path: str) -> str:
    return path.strip().replace("\\", "/")


def is_watched(path: str) -> bool:
    path = normalize(path)
    if path in EXACT_SOURCES:
        return True
    if not path.lower().endswith(".md"):
        return False
    return any(path.startswith(f"{root}/") for root in MARKDOWN_ROOTS)


def resolve_base(base: str | None, head: str) -> str:
    if base and set(base) != {"0"}:
        return base
    return f"{head}^"


def changed_files(base: str, head: str) -> list[str]:
    output = git_output("diff", "--name-only", "--diff-filter=ACDMRT", base, head)
    return sorted({normalize(path) for path in output.splitlines() if is_watched(path)})


def normalized_sha256(path: Path) -> str:
    data = path.read_bytes().replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    return hashlib.sha256(data).hexdigest()


def watched_source_paths(root: Path = ROOT) -> set[str]:
    paths = {
        normalize(str(path.relative_to(root)))
        for markdown_root in MARKDOWN_ROOTS
        if (root / markdown_root).is_dir()
        for path in (root / markdown_root).rglob("*.md")
        if path.is_file()
    }
    paths.update(path for path in STATE_TRACKED_EXACT_SOURCES if (root / path).is_file())
    return paths


def locale_states(root: Path = ROOT) -> list[tuple[str, dict[str, Any]]]:
    states: list[tuple[str, dict[str, Any]]] = []
    localizations = root / "localizations"
    if not localizations.is_dir():
        return states

    for state_path in sorted(localizations.glob("*/.localization-state.json")):
        locale = state_path.parent.name
        rule_path = root / ".github" / "skills" / "localizations" / "rules" / f"{locale}.md"
        if not rule_path.is_file():
            continue

        try:
            state = json.loads(state_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise RuntimeError(f"Invalid localization state {state_path}: {error}") from error

        if state.get("version") != 1 or not isinstance(state.get("files"), dict):
            raise RuntimeError(
                f"Unsupported localization state format in {state_path}; "
                "expected version 1 with a files object."
            )
        states.append((locale, state["files"]))

    return states


def stale_localization_sources(root: Path = ROOT) -> list[str]:
    sources = watched_source_paths(root)
    stale: set[str] = set()

    for _locale, files in locale_states(root):
        tracked_sources = sources | {
            normalize(path)
            for path in files
            if isinstance(path, str) and is_watched(path)
        }
        for source in tracked_sources:
            entry = files.get(source)
            source_path = root / source
            if not source_path.is_file():
                stale.add(source)
                continue
            if not isinstance(entry, dict):
                stale.add(source)
                continue
            recorded_hash = entry.get("source_sha256")
            if not isinstance(recorded_hash, str) or normalized_sha256(source_path) != recorded_hash:
                stale.add(source)

    return sorted(stale)


def working_tree_paths() -> list[str]:
    result = subprocess.run(
        ["git", "status", "--porcelain=v1", "-z", "--untracked-files=all"],
        cwd=ROOT,
        capture_output=True,
        check=True,
    )
    entries = result.stdout.decode("utf-8", errors="surrogateescape").split("\0")
    paths: list[str] = []
    index = 0

    while index < len(entries):
        entry = entries[index]
        index += 1
        if not entry:
            continue

        status = entry[:2]
        paths.append(normalize(entry[3:]))
        if "R" in status or "C" in status:
            if index < len(entries) and entries[index]:
                paths.append(normalize(entries[index]))
                index += 1

    return sorted(set(paths))


def is_allowed_output(path: str) -> bool:
    return path in ALLOWED_OUTPUTS or path.startswith("localizations/")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", help="Base Git revision. Defaults to HEAD^.")
    parser.add_argument("--head", default="HEAD", help="Head Git revision.")
    parser.add_argument("--write-list", type=Path, help="Write changed paths to this file.")
    parser.add_argument(
        "--include-stale-localizations",
        action="store_true",
        help=(
            "Also include every source whose current content differs from an existing "
            "locale baseline, is missing a baseline, or has been deleted."
        ),
    )
    parser.add_argument(
        "--validate-outputs",
        action="store_true",
        help="Validate that all working-tree changes are localization outputs.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if args.validate_outputs:
        files = working_tree_paths()
        invalid = [path for path in files if not is_allowed_output(path)]
        if args.write_list:
            args.write_list.write_text(
                "".join(f"{path}\n" for path in files),
                encoding="utf-8",
            )
        if invalid:
            for path in invalid:
                print(
                    f"::error file={path}::Copilot changed a path outside "
                    "the permitted localization outputs."
                )
            return 1
        print(f"Validated {len(files)} localization output path(s).")
        return 0

    base = resolve_base(args.base, args.head)
    changed = changed_files(base, args.head)
    stale = stale_localization_sources() if args.include_stale_localizations else []
    files = sorted(set(changed) | set(stale))

    if args.write_list:
        args.write_list.write_text(
            "".join(f"{path}\n" for path in files),
            encoding="utf-8",
        )

    if files:
        print(f"English documentation requiring localization between {base} and {args.head}:")
        for path in files:
            print(f"- {path}")
    else:
        print(f"No English documentation requires localization between {base} and {args.head}.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
