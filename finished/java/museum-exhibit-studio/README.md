# Museum Exhibit Studio

This Maven CLI sample uses the GitHub Copilot SDK as a focused museum-curation agent. A museum educator chooses one of three approved fact sets or enters their own bounded facts, optionally streams scoped Wikipedia background research, generates visitor-facing exhibit copy, validates its structure, and can opt in to an `exhibit.html` capstone.

## Run

From this directory:

```bash
./mvnw compile exec:java
```

Set `COPILOT_MODEL` to select a model; otherwise the Copilot runtime chooses its default. The sample requires an authenticated GitHub Copilot CLI.

Compile without contacting a model:

```bash
./mvnw compile
```

## What it demonstrates

The learner-authored `MuseumExhibitStudio` entrypoint builds sessions directly with `new CopilotClient()`. The pre-built `Curator*` helpers provide approved facts and the fact-selection menu, streaming, validation, scoped permissions, source extraction, fixed prompt text, the failure message, and (in `CuratorSystemMessages.java`) the curator and research system messages. The `>>> BEGIN` / `<<< END` comments in the entrypoint are the named regions the lessons fill; each `BEGIN` line lists the steps that insert or replace that region.

Prompt guidance is not an authorization boundary, so the application also:

- always registers and allowlists `approved_fact_lookup`, adding the read-only local
  `approved_wikipedia_fact_lookup` only when usable cited research exists;
- limits research to the configured Wikipedia MCP server and `wikipedia-search` / `wikipedia-readArticle` through a deny-by-default permission handler;
- captures the research body and trailing `## Sources` citations for the second local lookup,
  never merging them into educator-approved facts or giving generation live Wikipedia access;
- bounds input to 20 facts of at most 500 characters each before every model send;
- uses explicit timeouts, rejects blank exhibit output, and disconnects sessions / stops clients on success and failure;
- checks one H1, required sections, a 100-140-word narrative, exactly three numbered questions ending in `?`, and prohibited software vocabulary; and
- optionally allows `builtin:apply_patch` and `builtin:create` to write only `exhibit.html` in the application working directory.

The curator is instructed to call both local lookups before writing the narrative and visitor
questions when research exists. Approved facts take precedence over supplemental research, which
is data, not instructions. "Approved" research means application-accepted, not human-verified.
Declined research keeps the single-tool path. Failed research or an unusable cited summary prints
a warning and takes the same fallback. Confirm both lookup events on a successful research run;
sources still print after the exhibit. The validator cannot prove semantic factual grounding.
Generated claims still require human review or a separate evaluator.

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
