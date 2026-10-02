# GitHub Copilot SDK Workshops

Start today: http://github.github.com/copilot-sdk-workshop/

Choose one of three hands-on GitHub Copilot SDK workshops in .NET, Node.js/TypeScript, Python, Go,
Rust, or Java:

- **SDK 101 (30 minutes):** start with a streaming hello world, then build a small podcast
  agent using prebuilt RSS tools from the
  [included intro starter](start-intro/README.md).
- **Accessibility Reviewer:** build an SDLC developer tool that inspects a web page, consults
  application-owned WCAG guidance, and produces an evidence-based report.
- **Museum Exhibit Studio:** build a non-SDLC curator that transforms educator-approved facts into
  visitor-ready exhibit copy, optionally enriched by cited Wikipedia research through a local
  lookup, behind deterministic capability boundaries.

Start with SDK 101 if you are new to the SDK. Across the introductory and deeper workshops, you'll:

1. Create a Copilot client and conversation session.
2. Separate durable agent policy from task-specific data.
3. Choose between local tools and MCP tools with tightly scoped tool allowlists.
4. Enforce capability, input, timeout, validation, and lifecycle boundaries in application code.
5. Explain what the model can infer and what the application must prove.

SDK 101 has exactly 30 minutes of guided lessons.
Plan on about 115 minutes for Accessibility Reviewer or 90 minutes for Museum Exhibit Studio.
Machine setup, authentication, and dependency
downloads happen separately in an untimed preflight for each workshop.
The two deeper workshops include their interactive HTML lessons and end with a celebration and resources.

## Start the workshop

Open the GitHub Pages URL produced by the repository's **Deploy to GitHub Pages** workflow. Choose a
workshop outcome, choose a language, then start the selected workshop. The site derives its Pages
base URL at runtime, so there is no hardcoded organization or user Pages hostname.

To preview the site from a clone:

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
python3 -m http.server 8000
```

Open <http://localhost:8000/docs/>. Do not open `step.html` with a `file://` URL; browsers block
the Markdown requests used by the lesson viewer.

## Prerequisites

Install the runtime for your chosen language, not all six. Each track's preflight provides
the applicable requirements; Node.js SDK 101 requires version 22.12 or newer, and its Java
starter also requires Maven 3.9 or newer.

- [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/)
- [Node.js 22 or newer](https://nodejs.org/)
- [Python 3.11 or newer](https://www.python.org/downloads/)
- [Go 1.24 or newer](https://go.dev/dl/)
- [Rust 1.94 or newer](https://rustup.rs/)
- [Java 17 or newer](https://adoptium.net/)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- GitHub Copilot subscription or trial
- Microsoft Edge (the workshop default) or Google Chrome for browser-based exercises

Preflight walks through installation checks, authentication, OS-specific commands, expected
output, and troubleshooting.

## Repository layout

```text
copilot-sdk-workshop/
|-- docs/                         GitHub Pages site and controlled target page
|-- workshop/                     SDK 101, two deeper tracks, and completion resources
|-- start-intro/                  SDK 101 starters and podcast helpers in all six languages
|-- start-accessibility/          Accessibility Reviewer starters in all six languages
|-- start-museum/                 Museum Exhibit Studio starters in all six languages
|-- finished/dotnet/
|   |-- hello-copilot-sdk/        Completed local-tool example in every language
|   |-- accessibility-report/     Completed .NET local + MCP reporter
|   `-- museum-exhibit-studio/    Museum curator with application-owned fact and research lookups
|-- finished/nodejs/              Completed TypeScript projects
|-- finished/python/              Completed Python projects
|-- finished/go/                  Completed Go projects
|-- finished/rust/                Completed Rust projects
|-- finished/java/                Completed Maven Java projects
|-- src/BlazorApp/                Source counterpart of the deployed target
|-- scripts/                      Deterministic content and build validation
`-- .github/workflows/            Validation and Pages deployment
```

## Validate a change

```bash
bash scripts/validate-workshop.sh
```

The command checks lesson structure, internal links, site behavior hooks, project coverage,
and the introductory track's exact 30-minute lesson budget. It also applies the museum lessons to
each museum starter and checks that the result is the finished entrypoint.
It then runs browser-independent language-selection, site-flow, and completion tests and restores, builds, or syntax-checks every
intro, accessibility, and museum starter, every finished project, and the Blazor target without authenticating
Copilot, launching a browser, or sending a prompt. The museum projects ship no tests, mocks, or
fixtures, so their targets only restore and build.

Pass a language ID to run one smoke-build target:

```bash
bash scripts/validate-workshop.sh nodejs
```

Pull requests run content validation and all six language smoke builds as separate GitHub Actions
jobs, so a failure identifies the affected SDK track.

## SDK 101 workshop

Begin at [`workshop/intro-00-preflight.md`](workshop/intro-00-preflight.md). Install your
chosen runtime, authenticate Copilot, and download dependencies **before** the timed session.
The four guided lessons are SDK basics (5 minutes), streaming hello world (10 minutes),
a podcast agent (12 minutes), and recap (3 minutes).

Learners clone this repository once and edit the entrypoint in
[`start-intro/<language>`](start-intro/README.md). The starter includes all source files,
dependency manifests, lockfiles, and prebuilt helpers for RSS lookups, model and episode
selection, and interactive tool approval. No second repository clone or longer workshop
is required.

Open `LIVE_DEMO.md` beside the starter's entrypoint. The hands-on workshop follows
the source demo's **four hello-world edits**: start the client, check authentication,
create the session, and send a message. Continue with **Act Two** in the same
application to choose a model and episode, grant capabilities, and replace the
prompt. The website renders those local guide sections directly, so the editor
guide and online workshop teach the same code.

The track covers client/session lifecycle, streaming, local tool registration, a focused
system message, and permissions. MCP, automated output validation, and HTML capstones belong
to the deeper workshops. Review the generated podcast copy against its source before publishing.

## Museum Exhibit Studio workshop

Museum Exhibit Studio starters live under `start-museum/<language>`, with completed references under
`finished/<language>/museum-exhibit-studio`. Each starter ships one pre-built curator helper module
that learners never edit: approved fact sets, their bounds, and the fact-selection menu, a
streaming printer, deterministic exhibit validation, the scoped Wikipedia MCP server with its
deny-by-default permission handler, the single-file `exhibit.html` write permission, the fixed
prompt text (exhibit structure, research request, page requirements), and the failure message the
entrypoint prints.

Learners work directly in `start-museum/<language>` and grow that one project across the
lessons, running it at every step. They write the SDK code: the session setup, the curator and
research system messages, tool registration and the three session configurations, the
instructions in the exhibit and page prompts, and one session runner that owns the lifecycle and
timeout. The finished sample is what a learner ends up with, not a separate reference architecture.

Every place a learner writes code is a named region in the starter entrypoint, delimited by two
marker comments whose `BEGIN` line lists the steps that touch it:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Each lesson code block is introduced by a line such as
``**REPLACE** region `generation-config` in `Program.cs`:`` and holds the complete contents of that
region. INSERT fills an empty region; REPLACE overwrites what an earlier step put there. Marker
lines never move, and no lesson replaces the whole file. Content validation applies every lesson
block to the starter and requires the result to equal the finished entrypoint, so a lesson cannot
drift from the finished app. When you change museum lesson code, change the finished entrypoint to
match, and the reverse.

The learner-facing track begins at
[`workshop/museum-00-preflight.md`](workshop/museum-00-preflight.md), then runs through seven
steps — first session, streaming, curator voice, approved facts, structural checks, and
Wikipedia MCP research, followed by an interactive `exhibit.html` capstone — and finishes with
[celebration and resources](workshop/museum-09-complete.md).

When usable cited research exists, the curator calls `approved_fact_lookup` and the read-only
`approved_wikipedia_fact_lookup` before writing the narrative and visitor questions. The second
tool returns captured research, not live Wikipedia access or human-verified facts. Approved facts
take precedence, and declined, failed, or uncited research keeps the single-tool generation path.
Structural validation does not prove factual grounding; review researched claims before publishing.

Rust checks share one Cargo target directory across all workshop projects, avoiding repeated SDK
dependency compilation.

## Deployment

After validation passes, push to `main`. The
[Pages workflow](.github/workflows/deploy.yml) publishes `docs/` plus the Markdown lessons in
`workshop/`. Build and content validation run separately in the validation workflow.

Enable GitHub Pages in repository settings and choose **GitHub Actions** as the source. The
deployment job reports the canonical workshop URL in its environment.

The deployment workflow verifies every published HTML page, site asset, and Markdown lesson. It
checks the URL returned by GitHub Pages by default. To validate a future public or custom domain
instead, set the repository Actions variable `WORKSHOP_SITE_URL` to that site's base URL. You can
run the same check manually:

```bash
WORKSHOP_SITE_URL=https://workshop.example.com/ python3 scripts/validate_deployment.py
```

## References

- [GitHub Copilot SDK for .NET](https://github.com/github/copilot-sdk/tree/main/dotnet)
- [GitHub Copilot SDK for Node.js/TypeScript](https://github.com/github/copilot-sdk/tree/main/nodejs)
- [GitHub Copilot SDK for Python](https://github.com/github/copilot-sdk/tree/main/python)
- [GitHub Copilot SDK for Go](https://github.com/github/copilot-sdk/tree/main/go)
- [GitHub Copilot SDK for Rust](https://github.com/github/copilot-sdk/tree/main/rust)
- [GitHub Copilot SDK for Java](https://github.com/github/copilot-sdk/tree/main/java)
- [Copilot SDK cookbook](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [Copilot SDK API and source](https://github.com/github/copilot-sdk)
- [Install the GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

This project is licensed under the [MIT License](LICENSE).

This workshop is provided as-is for educational purposes. It is intended to
demonstrate concepts and patterns rather than serve as a complete production
service.
