#!/usr/bin/env python3

from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("check_localization_updates.py")
SPEC = importlib.util.spec_from_file_location("check_localization_updates", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class StaleLocalizationSourcesTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.root = Path(self.temp_dir.name)
        (self.root / "workshop").mkdir()
        (self.root / "localizations" / "ko-kr").mkdir(parents=True)
        (self.root / ".github" / "skills" / "localizations" / "rules").mkdir(
            parents=True
        )
        (self.root / ".github" / "skills" / "localizations" / "rules" / "ko-kr.md").write_text(
            "Korean rules\n",
            encoding="utf-8",
        )

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def write_state(self, files: dict[str, dict[str, str]]) -> None:
        state = {"version": 1, "files": files}
        (self.root / "localizations" / "ko-kr" / ".localization-state.json").write_text(
            json.dumps(state),
            encoding="utf-8",
        )

    def source_hash(self, path: str) -> str:
        return MODULE.normalized_sha256(self.root / path)

    def test_later_batch_keeps_earlier_unlocalized_source(self) -> None:
        source_a = self.root / "workshop" / "a.md"
        source_b = self.root / "workshop" / "b.md"
        source_a.write_text("A baseline\n", encoding="utf-8")
        source_b.write_text("B baseline\n", encoding="utf-8")
        self.write_state(
            {
                "workshop/a.md": {"source_sha256": self.source_hash("workshop/a.md")},
                "workshop/b.md": {"source_sha256": self.source_hash("workshop/b.md")},
            }
        )

        source_a.write_text("A changed by push A\n", encoding="utf-8")
        self.assertEqual(
            MODULE.stale_localization_sources(self.root),
            ["workshop/a.md"],
        )

        source_b.write_text("B changed by push B\n", encoding="utf-8")
        self.assertEqual(
            MODULE.stale_localization_sources(self.root),
            ["workshop/a.md", "workshop/b.md"],
        )

    def test_new_and_deleted_sources_are_stale(self) -> None:
        deleted = self.root / "workshop" / "deleted.md"
        deleted.write_text("old\n", encoding="utf-8")
        deleted_hash = self.source_hash("workshop/deleted.md")
        deleted.unlink()
        (self.root / "workshop" / "new.md").write_text("new\n", encoding="utf-8")
        self.write_state(
            {"workshop/deleted.md": {"source_sha256": deleted_hash}}
        )

        self.assertEqual(
            MODULE.stale_localization_sources(self.root),
            ["workshop/deleted.md", "workshop/new.md"],
        )


if __name__ == "__main__":
    unittest.main()
