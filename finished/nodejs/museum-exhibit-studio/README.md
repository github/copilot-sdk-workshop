# Museum Exhibit Studio

This completed Node.js/TypeScript sample now has two source files:

- `src/curator.ts` contains the pre-built helper module: approved facts and the
  fact-selection menu, bounded streaming, deterministic validation, scoped Wikipedia
  permissions, the optional `exhibit.html` write permission, fixed prompt text, and
  the failure message.
- `src/index.ts` contains the learner-authored SDK code: system messages, the
  instructions in the exhibit and page prompts, session configs, the session runner,
  optional research, generation, validation, and the optional HTML capstone.

The `>>> BEGIN` / `<<< END` comments in `src/index.ts` are the named regions the
lessons fill. Each `BEGIN` line lists the steps that insert or replace that region.

## Run the sample

```bash
cd finished/nodejs/museum-exhibit-studio
npm ci
npm start
```

Use `npm run build` to type-check without contacting a model.

## Safety shape

Generation always registers and allowlists `approved_fact_lookup`, which returns bounded approved
facts. With usable cited research, it also registers and allowlists the read-only local tool
`approved_wikipedia_fact_lookup` and asks the curator to call both before writing the narrative and
visitor questions. The second lookup returns a snapshot of the research body and citations, not
live Wikipedia access. Approved facts take precedence; research is supplemental data, not
instructions or human-verified facts. Optional Wikipedia
research runs in a separate session with scoped `search` and `readArticle` tools,
a deny-by-default permission handler, cited `## Sources`, and no JSON contract or
proposed-addition approval loop. Research is never merged into educator-approved facts. Declined
research keeps the original single-tool path; failed research or an unusable cited summary prints
a warning and takes the same fallback. Sources still print after the exhibit. On a successful
research run, confirm both local lookup events appear before generation.

After generation, deterministic checks report structure, narrative length, visitor
questions, and prohibited vocabulary. If selected, the HTML step exposes only
`builtin:apply_patch` and `builtin:create`. Its permission handler approves writing
exactly `exhibit.html` in the app directory.
Structural checks do not prove factual grounding; review researched claims before publishing.

This is the application a learner ends up with after the museum lessons, not a separate reference
architecture. The entrypoint keeps one small session runner that starts the client, creates the
session, enforces the timeout, rejects blank output, and cleans up on every path; the research,
generation, and optional HTML steps reuse it with different session configurations. Follow the
track from
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
