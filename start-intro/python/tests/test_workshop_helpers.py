import threading
import time
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from types import SimpleNamespace
from unittest.mock import patch

from copilot.rpc import PermissionDecisionApproveOnce, PermissionDecisionReject
from copilot.generated.session_events import PermissionRequestCustomTool

import github_podcast_tools
from permission_prompt import permission_prompt


class PermissionPromptTests(unittest.TestCase):
    def test_custom_tools_prompt_and_approve_once(self):
        for tool in ("get_github_podcast_episode", "get_latest_github_podcast_episodes"):
            with self.subTest(tool=tool), patch("builtins.input", return_value="y") as prompt:
                request = PermissionRequestCustomTool(tool_description="Read podcast RSS", tool_name=tool)
                decision = permission_prompt(request, None)
                self.assertIsInstance(decision, PermissionDecisionApproveOnce)
                prompt.assert_called_once_with(f"Approve {tool}? [y/N] ")

    def test_declined_custom_tools_are_rejected(self):
        with patch("builtins.input", return_value="n"):
            request = PermissionRequestCustomTool(
                tool_description="Read podcast RSS", tool_name="get_github_podcast_episode"
            )
            decision = permission_prompt(request, None)
        self.assertIsInstance(decision, PermissionDecisionReject)

    def test_other_permission_kinds_never_prompt(self):
        for kind in ("tool", "shell", "write", "mcp", None):
            with self.subTest(kind=kind), patch("builtins.input") as prompt:
                decision = permission_prompt(SimpleNamespace(kind=kind), None)
                self.assertIsInstance(decision, PermissionDecisionReject)
                prompt.assert_not_called()


class FeedTimeoutTests(unittest.TestCase):
    def test_feed_uses_finite_network_timeout(self):
        with patch("urllib.request.urlopen") as request:
            request.return_value.__enter__.return_value.read.return_value = b"<rss><channel/></rss>"
            self.assertEqual(github_podcast_tools.get_items(), [])
            request.assert_called_once_with(github_podcast_tools.FEED_URL, timeout=10)

    def test_stalled_body_times_out(self):
        release = threading.Event()

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200)
                self.end_headers()
                self.wfile.flush()
                release.wait(2)

            def log_message(self, *_args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            with patch.object(github_podcast_tools, "FEED_URL",
                              f"http://127.0.0.1:{server.server_port}/"), \
                    patch.object(github_podcast_tools, "FEED_TIMEOUT_SECONDS", 0.1):
                start = time.monotonic()
                with self.assertRaises(TimeoutError):
                    github_podcast_tools.get_items()
                self.assertLess(time.monotonic() - start, 1)
        finally:
            release.set()
            server.shutdown()
            server.server_close()
            thread.join()
