#!/usr/bin/env python3

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("materialize_localization_artifact.py")
SPEC = importlib.util.spec_from_file_location("materialize_localization_artifact", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class MaterializeLocalizationArtifactTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        self.artifact = self.root / "artifact"
        self.repository = self.root / "repository"
        (self.artifact / "localizations" / "ko-kr").mkdir(parents=True)
        (self.artifact / "docs").mkdir()
        self.repository.mkdir()

        (self.artifact / "localizations" / "ko-kr" / ".localization-state.json").write_text(
            '{"version": 1, "files": {}}\n',
            encoding="utf-8",
        )
        (self.artifact / "localizations" / "ko-kr" / "README.md").write_text(
            "새 문서\n",
            encoding="utf-8",
        )
        (self.artifact / "docs" / "locale-registry.js").write_text(
            "const locale = 'ko-kr';\n",
            encoding="utf-8",
        )

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_materializes_only_expected_outputs(self) -> None:
        (self.repository / "localizations" / "old").mkdir(parents=True)
        (self.repository / "localizations" / "old" / "README.md").write_text(
            "obsolete\n",
            encoding="utf-8",
        )

        MODULE.materialize(self.artifact, self.repository)

        self.assertFalse((self.repository / "localizations" / "old").exists())
        self.assertEqual(
            (self.repository / "localizations" / "ko-kr" / "README.md").read_text(
                encoding="utf-8"
            ),
            "새 문서\n",
        )
        self.assertEqual(
            (self.repository / "docs" / "locale-registry.js").read_text(
                encoding="utf-8"
            ),
            "const locale = 'ko-kr';\n",
        )

    def test_rejects_unexpected_files_before_modifying_checkout(self) -> None:
        unexpected = self.artifact / "scripts" / "validate_workshop.py"
        unexpected.parent.mkdir()
        unexpected.write_text("malicious\n", encoding="utf-8")
        existing = self.repository / "localizations" / "ko-kr" / "README.md"
        existing.parent.mkdir(parents=True)
        existing.write_text("keep\n", encoding="utf-8")

        with self.assertRaisesRegex(RuntimeError, "unexpected path"):
            MODULE.materialize(self.artifact, self.repository)

        self.assertEqual(existing.read_text(encoding="utf-8"), "keep\n")

    def test_rejects_symbolic_links(self) -> None:
        link = self.artifact / "localizations" / "ko-kr" / "linked.md"
        try:
            link.symlink_to(self.artifact / "docs" / "locale-registry.js")
        except OSError as error:
            self.skipTest(f"Symbolic links are unavailable: {error}")

        with self.assertRaisesRegex(RuntimeError, "symbolic link|non-regular file"):
            MODULE.materialize(self.artifact, self.repository)


if __name__ == "__main__":
    unittest.main()
