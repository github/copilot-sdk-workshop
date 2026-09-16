#!/usr/bin/env python3

from __future__ import annotations

import argparse
import os
from pathlib import Path
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit, urlunsplit
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
WORKSHOP = ROOT / "workshop"


def public_paths() -> list[str]:
    site_files = (
        path.relative_to(DOCS).as_posix()
        for path in DOCS.rglob("*")
        if path.is_file() and "tests" not in path.relative_to(DOCS).parts
    )
    lessons = (
        f"workshop/{path.name}"
        for path in WORKSHOP.glob("*.md")
    )
    return ["", *sorted(site_files), *sorted(lessons)]


def normalize_base_url(value: str) -> str:
    parsed = urlsplit(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError("site URL must be an absolute HTTP or HTTPS URL")
    if parsed.query or parsed.fragment:
        raise ValueError("site URL must not contain a query string or fragment")
    path = parsed.path if parsed.path.endswith("/") else f"{parsed.path}/"
    return urlunsplit((parsed.scheme, parsed.netloc, path, "", ""))


def check_url(url: str, timeout: float) -> str | None:
    request = Request(url, headers={"User-Agent": "copilot-sdk-workshop-deployment-validator"})
    try:
        with urlopen(request, timeout=timeout) as response:
            if response.status != 200:
                return f"HTTP {response.status}"
            if not response.read(1):
                return "empty response"
    except HTTPError as error:
        return f"HTTP {error.code}"
    except URLError as error:
        return str(error.reason)
    except TimeoutError as error:
        return str(error) or "timed out"
    return None


def validate(base_url: str, attempts: int, delay: float, timeout: float) -> list[str]:
    paths = public_paths()
    failures = {path: "not checked" for path in paths}

    for attempt in range(1, attempts + 1):
        for path in list(failures):
            url = f"{base_url}{quote(path, safe='/')}"
            error = check_url(url, timeout)
            if error is None:
                del failures[path]
            else:
                failures[path] = error

        if not failures:
            return []
        if attempt < attempts:
            print(
                f"Attempt {attempt}/{attempts}: {len(failures)} URL(s) unavailable; retrying...",
                file=sys.stderr,
            )
            time.sleep(delay)

    return [
        f"{base_url}{quote(path, safe='/')}: {error}"
        for path, error in failures.items()
    ]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Verify every file expected in the deployed workshop site."
    )
    parser.add_argument(
        "--base-url",
        default=os.environ.get("WORKSHOP_SITE_URL"),
        help="deployed site root (defaults to WORKSHOP_SITE_URL)",
    )
    parser.add_argument("--attempts", type=int, default=6)
    parser.add_argument("--delay", type=float, default=5)
    parser.add_argument("--timeout", type=float, default=10)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.base_url:
        print(
            "Provide --base-url or set WORKSHOP_SITE_URL.",
            file=sys.stderr,
        )
        return 2
    if args.attempts < 1 or args.delay < 0 or args.timeout <= 0:
        print("Attempts must be positive, delay non-negative, and timeout positive.", file=sys.stderr)
        return 2

    try:
        base_url = normalize_base_url(args.base_url)
    except ValueError as error:
        print(error, file=sys.stderr)
        return 2

    failures = validate(base_url, args.attempts, args.delay, args.timeout)
    if failures:
        print("Deployment validation failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(f"Validated {len(public_paths())} deployed URLs at {base_url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
