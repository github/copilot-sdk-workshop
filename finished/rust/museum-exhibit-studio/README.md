# Museum Exhibit Studio

This Rust sample uses the GitHub Copilot SDK as a focused, non-software-engineering agent harness. Pre-built helpers live in `src/lib.rs`; the learner-authored orchestration lives in `src/main.rs`.

## Run the sample

```bash
cargo run --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml --locked
```

Set `COPILOT_MODEL` to select a generation model. The sample requires an authenticated GitHub Copilot CLI.

Check without contacting a model:

```bash
cargo check --locked --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml
```

## What the sample teaches

The generation session uses a replacement curator system message, validates approved facts,
streams with a 120-second timeout, always registers and allowlists `approved_fact_lookup`, rejects
blank output, and prints deterministic structural validation. With usable cited research, it also
registers and allowlists the read-only local `approved_wikipedia_fact_lookup`, and requests both
calls before writing the narrative and visitor questions.

Optional Wikipedia research is separate: it exposes only scoped `search` and `readArticle` MCP
tools, uses a deny-by-default permission handler, and produces a summary and cited sources. The new
local lookup returns a snapshot of that body and citations, without live Wikipedia access or
merging research into educator-approved facts. Approved facts take precedence; "approved" research
is application-accepted supplemental data, not human-verified facts or instructions. Declined
research keeps the single-tool path. Failed research or an unusable cited summary prints a warning
and takes the same fallback. Sources print after the exhibit; successful research should show both
local lookup events before generation. Structural checks do not prove factual grounding, so review
researched claims before publishing.

Optional HTML generation uses `builtin:apply_patch` with a single-file permission handler that can write only `exhibit.html` in the application working directory.

This is the application a learner ends up with after the museum lessons, not a separate reference
architecture. The entrypoint keeps one small session runner that starts the client, creates the
session, enforces the timeout, rejects blank output, and cleans up on every path; the research,
generation, and optional HTML steps reuse it with different session configurations. Follow the
track from
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
