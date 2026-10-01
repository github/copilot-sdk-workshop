# SDK 101 starters

The complete starter projects for the 30-minute SDK 101 workshop live here.
Clone **this workshop repository once**, choose one language, and edit its
entrypoint in place. There is no separate repository to clone or project to copy.

| Language | Prerequisite | Starter notes | Demo guide | Entrypoint |
| --- | --- | --- | --- | --- |
| .NET | .NET 10 SDK | [Setup](dotnet/README.md) | [LIVE_DEMO](dotnet/LIVE_DEMO.md) | `dotnet/Program.cs` |
| Node.js | Node.js 22.12+ | [Setup](nodejs/README.md) | [LIVE_DEMO](nodejs/LIVE_DEMO.md) | `nodejs/src/index.ts` |
| Python | Python 3.11+ | [Setup](python/README.md) | [LIVE_DEMO](python/LIVE_DEMO.md) | `python/main.py` |
| Go | Go 1.24+ | [Setup](go/README.md) | [LIVE_DEMO](go/LIVE_DEMO.md) | `go/main.go` |
| Java | Java 17+, Maven 3.9+ | [Setup](java/README.md) | [LIVE_DEMO](java/LIVE_DEMO.md) | `java/src/main/java/demo/CopilotSdkLiveDemo.java` |
| Rust | Rust 1.94+ | [Setup](rust/README.md) | [LIVE_DEMO](rust/LIVE_DEMO.md) | `rust/src/main.rs` |

Complete [preflight](../workshop/intro-00-preflight.md) before the timed session.
Authenticate with `copilot auth login`, change into `start-intro/<language>`,
and open that folder in your editor (`code .` for VS Code). Stay in that folder
for dependency and run commands.

The entrypoints intentionally contain placeholders. Open **`LIVE_DEMO.md`**
beside your chosen entrypoint. Follow **Act One's four edits**: start the client,
check authentication, create the session, and send hello world. Then follow
**Act Two** to choose a model and episode, grant the session its capabilities,
and replace the prompt.

The workshop website displays these same guide sections in its
[hello-world lesson](../workshop/intro-02-hello-world.md) and
[podcast lesson](../workshop/intro-03-podcast-agent.md); it does not teach a
different implementation.
Those helpers include model and episode selection, typed RSS lookup tools, and
interactive tool approval. Keep them unchanged during the workshop.

Dependencies and the available lockfiles are included. Smoke builds do not need
Copilot authentication or a live prompt. Running the completed application needs
Copilot access; the podcast workflow also needs access to the official RSS feed.
Your in-place edits appear in `git status`, which is expected.

## Source

These starter sources and `LIVE_DEMO.md` guides were imported from
[jamesmontemagno/copilot-sdk-intro](https://github.com/jamesmontemagno/copilot-sdk-intro)
at revision
[`f744ec6`](https://github.com/jamesmontemagno/copilot-sdk-intro/tree/f744ec66b6429df876c18f443bd6b1c3144d4e97).
The guides retain the source's two-act progression and four numbered
hello-world edits. Local adaptations use this repository's paths, bound the
completion waits, close SDK resources, restrict hello world to an empty tool
allowlist, and supply the missing Java/Rust streaming subscriptions. Go keeps
one subscription instead of printing each text fragment twice. Node.js lets
the bounded send propagate session errors instead of throwing from a callback.
The upstream repository is attribution, not a setup requirement.
