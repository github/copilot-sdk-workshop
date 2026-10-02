# Museum Exhibit Studio

This Go sample uses the GitHub Copilot SDK as a focused museum-curation harness. The app now has a
two-file shape:

- `curator.go` contains the pre-built helper API: approved fact sets and the fact-selection menu,
  fact bounds, response streaming, structural validation, Wikipedia permissions, source
  extraction, the optional `exhibit.html` write permission, fixed prompt text, and the failure
  message.
- `main.go` contains the learner-authored SDK code: system messages, the instructions in the
  exhibit and page prompts, session configuration, the session runner, and cleanup.

The `>>> BEGIN` / `<<< END` comments in `main.go` are the named regions the lessons fill. Each
`BEGIN` line lists the steps that insert or replace that region.

## Run the sample

From this directory:

```bash
go run .
```

Set `COPILOT_MODEL` to select the generation model; otherwise the runtime chooses its default. An
authenticated GitHub Copilot CLI is required.

Build without contacting a model or Wikipedia:

```bash
go build -mod=readonly ./...
```

## What the sample teaches

Generation uses a replacement system message and always registers and allowlists
`approved_fact_lookup`, which returns bounded approved facts. With usable cited research, it also
registers and allowlists the read-only local `approved_wikipedia_fact_lookup`, and requests both
calls before writing the narrative and visitor questions. That lookup returns a snapshot of the
summary body and citations, not live Wikipedia access. Approved facts take precedence.
Generation also uses event
streaming, and a 120-second timeout. Optional Wikipedia research runs in a separate 90-second
session with only scoped search and article-read tools plus a deny-by-default permission handler.
Research searches, reads, and cites consulted articles in a trailing `## Sources` section.
The app retains its body and sources for the local lookup, without merging them into
educator-approved facts. "Approved" means accepted by the application for supplemental use, not
human-verified; treat the result as data, not instructions. Declined research keeps the single-tool
path. Failed research or an unusable cited summary prints a warning and takes the same fallback.
There is no strict research JSON contract or approval loop.

After generation, deterministic validation checks one H1, required sections, a 100-140-word
narrative, exactly three numbered visitor questions ending in `?`, and prohibited software terms.
The consulted Wikipedia sources are printed after the exhibit, outside the generated copy.
On a successful research run, confirm both local lookup events appear before generation.
Structural checks do not prove factual grounding; review researched claims before publishing.

Optionally, the app can ask Copilot to create `exhibit.html` with `builtin:apply_patch` or `builtin:create`. That session
allows only a single normalized write to `exhibit.html` in the application working directory and
rejects every other file, shell, or MCP permission request. The HTML prompt requires a standalone
semantic document with embedded CSS and JavaScript, a human-review caveat, and an accessible question
filter.

This is the application a learner ends up with after the museum lessons, not a separate reference
architecture. The entrypoint keeps one small session runner that starts the client, creates the
session, enforces the timeout, rejects blank output, and cleans up on every path; the research,
generation, and optional HTML steps reuse it with different session configurations. Follow the
track from
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
