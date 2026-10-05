#!/usr/bin/env python3
"""Safely copy generated localization outputs into a trusted checkout."""

from __future__ import annotations

import argparse
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = Path("docs/locale-registry.js")


def validate_artifact(artifact_root: Path) -> None:
    localization_root = artifact_root / "localizations"
    registry_path = artifact_root / REGISTRY_PATH

    if not localization_root.is_dir() or localization_root.is_symlink():
        raise RuntimeError("Artifact must contain a regular localizations directory.")
    if not registry_path.is_file() or registry_path.is_symlink():
        raise RuntimeError(f"Artifact must contain a regular {REGISTRY_PATH} file.")

    for directory, directory_names, file_names in os.walk(
        artifact_root,
        followlinks=False,
    ):
        directory_path = Path(directory)
        for name in directory_names:
            path = directory_path / name
            if path.is_symlink():
                raise RuntimeError(f"Artifact contains a symbolic link: {path}")
            relative_path = path.relative_to(artifact_root)
            if (
                relative_path != Path("docs")
                and relative_path.parts[0] != "localizations"
            ):
                raise RuntimeError(f"Artifact contains an unexpected path: {relative_path}")
        for name in file_names:
            path = directory_path / name
            if path.is_symlink() or not path.is_file():
                raise RuntimeError(f"Artifact contains a non-regular file: {path}")

            relative_path = path.relative_to(artifact_root)
            if (
                relative_path != REGISTRY_PATH
                and relative_path.parts[0] != "localizations"
            ):
                raise RuntimeError(f"Artifact contains an unexpected path: {relative_path}")


def materialize(artifact_root: Path, repository_root: Path = ROOT) -> None:
    artifact_root = artifact_root.resolve()
    repository_root = repository_root.resolve()
    validate_artifact(artifact_root)

    target_localizations = repository_root / "localizations"
    if target_localizations.exists():
        shutil.rmtree(target_localizations)
    shutil.copytree(artifact_root / "localizations", target_localizations)

    target_registry = repository_root / REGISTRY_PATH
    target_registry.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(artifact_root / REGISTRY_PATH, target_registry)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "artifact_root",
        type=Path,
        help="Directory containing localizations/ and docs/locale-registry.js.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    materialize(args.artifact_root)
    print("Materialized trusted localization output paths.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
