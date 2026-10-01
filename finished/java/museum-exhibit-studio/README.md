# Museum Exhibit Studio

This Maven CLI sample uses the GitHub Copilot SDK as a focused museum-curation agent. A museum educator chooses one of three approved fact sets or enters their own bounded facts, optionally streams scoped Wikipedia background research, generates visitor-facing exhibit copy, validates its structure, and can opt in to an `exhibit.html` capstone.

## Run

From this directory:

```bash
mvn compile exec:java
```

Set `COPILOT_MODEL` to select a model; otherwise the Copilot runtime chooses its default. The sample requires an authenticated GitHub Copilot CLI.

Compile without contacting a model:

```bash
mvn compile
```

## What it demonstrates

The learner-authored `MuseumExhibitStudio` entrypoint builds sessions directly with `new CopilotClient()`. The pre-built `Curator*` helpers provide approved facts, streaming, validation, scoped permissions, source extraction, and terminal prompts.

Prompt guidance is not an authorization boundary, so the application also:

- limits generation to exactly one application-owned tool, `approved_fact_lookup`, which returns the bounded approved facts, backed by a reject-all permission handler for everything else;
- limits research to the configured Wikipedia MCP server and `wikipedia-search` / `wikipedia-readArticle` through a deny-by-default permission handler;
- treats Wikipedia output as background notes only, extracts cited sources from a trailing `## Sources` section, and never merges research into the approved facts;
- bounds input to 20 facts of at most 500 characters each before every model send;
- uses explicit timeouts, rejects blank exhibit output, and disconnects sessions / stops clients on success and failure;
- checks one H1, required sections, a 100-140-word narrative, exactly three numbered questions ending in `?`, and prohibited software vocabulary; and
- optionally allows `builtin:apply_patch` and `builtin:create` to write only `exhibit.html` in the application working directory.

The validator cannot prove semantic factual grounding. Generated claims still require human review or a separate evaluator.

## Optional HTML capstone

When prompted, answer yes to generate `exhibit.html`. The pinned Java SDK 1.0.11 preserves
permission fields such as `fileName`, so the strict permission handler approves a write only
when its normalized path is exactly `exhibit.html` in this directory. Missing path data,
other file paths, and non-write requests remain denied; there is no broad write fallback.

This is the application a learner ends up with after the museum lessons, not a separate reference
architecture. The entrypoint keeps one small session runner that starts the client, creates the
session, enforces the timeout, rejects blank output, and cleans up on every path; the research,
generation, and optional HTML steps reuse it with different session configurations. Follow the
track from
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
