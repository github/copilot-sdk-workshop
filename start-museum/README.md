# Museum Exhibit Studio starters

Choose the directory for your workshop language and work directly inside it. After you change into
it, open that same folder in your editor (`code .` from inside it, or any other editor's open-folder
command) and keep your terminal there. These starters contain pinned dependencies, an entrypoint
laid out as named regions, a pre-built curator helper module, and a pre-built file holding the
system messages. The helpers hold the plumbing you never have to write: the approved fact sets,
their bounds, and the menu that lets an educator choose or type them, the pre-built
`approved_fact_lookup` local tool that hands those facts to the curator, the pre-built
`approved_wikipedia_fact_lookup` local tool that returns captured research and citations when
usable research exists, a streaming printer, deterministic exhibit validation, the scoped Wikipedia
MCP server and its deny-by-default permission handler, the single-file `exhibit.html` write
permission, the fixed prompt text (exhibit structure, research request, and page requirements), the
`COPILOT_MODEL` lookup, and the failure message. The system messages file holds the three long
messages the sessions run under: the curator's, the curator's once research is available, and the
research assistant's. You never edit the helpers.

The starters do **not** include the exhibit prompt's instructions, session configuration, tool
registration, or the session runner. You write those during the lessons: one session, then
streaming, then the curator voice (installing the pre-built system message), the fact tool
registration and its prompt with a bounded session runner, the validation report, scoped Wikipedia
research, and an interactive `exhibit.html` page. Start at
[`workshop/museum-00-preflight.md`](../workshop/museum-00-preflight.md).

## How the entrypoint is laid out

The starter entrypoint ships the fixed shape of the program (entry function, error handler,
cleanup) and a set of empty named regions. A region is two marker comments, and its `BEGIN` line
lists every step that touches it:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Each lesson code block names its region and one of two actions. **INSERT** means the region is
empty: paste the block between the marker lines. **REPLACE** means the region holds code from an
earlier step: delete everything between the marker lines, then paste the block. A block is always
the complete contents of its region. Never edit a marker line or the code outside the regions.

| Region | Holds | Steps |
|---|---|---|
| `imports` | Imports | 1, then whenever a step needs new names |
| `banner` | Program banner | 1 |
| `choose-facts` | Fact selection call | 4 |
| `research` | Optional Wikipedia research pass | 6 |
| `generate` | The exhibit generation call | 1 to 6 |
| `validate` | Validation report | 5 |
| `sources` | Consulted sources | 6 |
| `exhibit-page` | Optional `exhibit.html` session | 7 |
| `exhibit-prompt` | Exhibit prompt builder | 4, 6 |
| `html-prompt` | Page prompt builder | 7 |
| `generation-config` | Generation session configuration | 4, 6 |
| `research-config` | Research session configuration | 6 |
| `html-config` | Page session configuration | 7 |
| `session-runner` | Session runner | 4 |

Step 6 conditionally registers the Wikipedia lookup alongside the approved-fact lookup and asks
the curator to call both before writing the narrative and visitor questions. Research remains
supplemental, not educator-verified; approved facts take precedence. Declining research or receiving
no usable cited summary leaves generation with only `approved_fact_lookup`.

| Language | Helper module | System messages | Change directory, build, and run |
|---|---|---|---|
| .NET | `Helpers/Curator*.cs` | `Helpers/CuratorSystemMessages.cs` | `cd start-museum/dotnet && dotnet build && dotnet run` |
| Node.js | `src/curator.ts` | `src/system-messages.ts` | `cd start-museum/nodejs && npm ci && npm run build && npm start` |
| Python | `curator.py` | `system_messages.py` | `cd start-museum/python && python -m venv .venv && .venv/bin/python -m pip install -r requirements.txt && .venv/bin/python main.py` |
| Go | `curator.go` | `system_messages.go` | `cd start-museum/go && go build -mod=readonly ./... && go run .` |
| Rust | `src/lib.rs` | `src/system_messages.rs` | `cd start-museum/rust && cargo check --locked && cargo run --locked` |
| Java | `src/main/java/workshop/Curator*.java` | `CuratorSystemMessages.java` | `cd start-museum/java && ./mvnw compile && ./mvnw exec:java` |

Running the starter prints its identity and does not start Copilot or require authentication.
Because you edit these files in place, your work shows up in `git status`. That is expected. Run
`git checkout -- .` from the repository root to restore a clean starter.

Every starter already pins the dependencies the finished application needs, so you never edit a
project manifest during the workshop. The Rust starter builds the `museum_exhibit_studio` library
crate from `src/lib.rs`; import the helpers from it in `src/main.rs`.
