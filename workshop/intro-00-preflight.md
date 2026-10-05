# Preflight: Prepare for SDK 101

> **Time:** Untimed preparation, before the 30-minute workshop

## What you'll build

Start with a streaming hello world, then turn it into a small launch assistant for
The GitHub Podcast. You write the SDK connection and session configuration; the
starter already includes episode lookup tools and terminal selection helpers.

The four timed lessons total **30 minutes**: SDK basics (5), hello world (10),
podcast agent (12), and recap (3). Complete installation, authentication, and
dependency downloads beforehand so the session stays focused on the SDK.

## Check your access

You need Git, an editor, a terminal, network access, and an active GitHub Copilot
subscription or trial with access to a supported model. Install the
[Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli),
then run these commands in your terminal:

```shell
git --version
copilot --version
copilot auth login
```

Finish the browser sign-in if requested. Use the same account and terminal
environment for the workshop. Do not paste tokens into your source files.
The podcast example also needs access to the
[official RSS feed](https://feeds.simplecast.com/ioCY0vfY).

## Get the starter

All six SDK 101 starters and their prebuilt helpers are included in
`start-intro/` in **this workshop repository**. Clone it once:

```shell
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

If you already cloned this repository, use that checkout; do not clone another
repository or copy a starter project. Choose just one language below. All commands
start from this repository's root.
Install only that language's runtime. Keep the existing dependency versions;
you do not need to scaffold a project or install the SDK again.

Each language folder also contains **`LIVE_DEMO.md`**. Open it beside the
entrypoint. During the timed session, make Act One's four numbered edits,
run hello world, then continue with Act Two in the same file and application.

:::language dotnet
### Prepare .NET

Install the [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/).

```shell
dotnet --version
cd start-intro/dotnet
dotnet restore
```

Open `start-intro/dotnet` in your editor (`code .` for VS Code).
Your entrypoint is `Program.cs`. Later you will run `dotnet run` from this folder.

See the [starter README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md)
for CLI discovery, including `COPILOT_CLI_BINARY_PATH` if the bundled runtime
download is blocked.
:::

:::language nodejs
### Prepare Node.js

Install [Node.js 22.12 or newer](https://nodejs.org/).

```shell
node --version
cd start-intro/nodejs
npm ci
```

Open `start-intro/nodejs` in your editor (`code .` for VS Code).
Your entrypoint is `src/index.ts`. Later you will run `npm start` from this folder.

See the [starter README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md).
:::

:::language python
### Prepare Python

Install [Python 3.11 or newer](https://www.python.org/downloads/).
Use an isolated environment. On Windows PowerShell:

```powershell
python --version
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

On macOS/Linux:

```bash
python3 --version
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Open `start-intro/python` in your editor (`code .` for VS Code).
Your entrypoint is `main.py`. We use the environment's interpreter directly in
the lessons, so activation and PowerShell execution-policy changes are unnecessary.

See the [starter README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md).
:::

:::language go
### Prepare Go

Install [Go 1.24 or newer](https://go.dev/dl/).

```shell
go version
cd start-intro/go
go mod download
```

Open `start-intro/go` in your editor (`code .` for VS Code).
Your entrypoint is `main.go`. Later you will run `go run .` from this folder.

See the [starter README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md).
:::

:::language java
### Prepare Java

Install [Java 17 or newer](https://adoptium.net/).
No separate Maven install is needed: the starter includes the Maven Wrapper (`./mvnw`),
which downloads the right Maven version on first use. On Windows, run `mvnw.cmd` instead of
`./mvnw`.

```shell
java --version
cd start-intro/java
./mvnw dependency:go-offline
```

Open `start-intro/java` in your editor (`code .` for VS Code).
Your entrypoint is `src/main/java/demo/CopilotSdkLiveDemo.java`.
Later you will run `./mvnw compile exec:java` from this folder.

See the [starter README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md).
:::

:::language rust
### Prepare Rust

Install [Rust 1.94 or newer](https://rustup.rs/).
On Windows, the default MSVC toolchain also needs the C++ build tools and
Windows SDK described in the
[Rust installation guide](https://doc.rust-lang.org/book/ch01-01-installation.html).
Complete that setup before the session.

```shell
rustc --version
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Open `start-intro/rust` in your editor (`code .` for VS Code).
Your entrypoint is `src/main.rs`. Later you will run `cargo run --locked` from
this folder. The advance check warms the compilation cache; allow extra
preparation time for the first Rust dependency build.

See the [starter README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md).
:::

## Ready check

You are ready when authentication is complete, dependencies are downloaded, and
the selected entrypoint is open in your editor. The untouched entrypoint is
**deliberately incomplete**: placeholders may fail compilation or print an
authentication message without checking your real login. Do not treat that as
a working application. The hello-world lesson fills them in.

Keep the starter's helper files unchanged. You grow the project in place inside
`start-intro/`; your edits appear in `git status`, which is expected.

## Troubleshooting before the session

- **CLI not found:** finish CLI installation and reopen your terminal. Follow
  your language's starter README if the SDK cannot locate the native executable.
- **Sign-in fails:** check your subscription, organization policy, and browser
  account before the session. A successful login alone does not guarantee model access.
- **Dependency download fails:** resolve proxy or package-registry access now.
  Do not replace pinned dependencies with unrelated SDK versions.
- **RSS feed blocked:** resolve access to the official feed before the podcast
  lesson. Do not substitute invented episode facts.

Continue to [SDK basics](intro-01-sdk-basics.md).

## Learn more

- [Included intro starters](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
- [Official Copilot SDK](https://github.com/github/copilot-sdk)
