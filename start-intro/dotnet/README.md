# SDK 101 starter: .NET

Requires the [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/)
and authenticated Copilot access.

From the workshop repository root:

```shell
cd start-intro/dotnet
dotnet restore
```

Open this folder in your editor (`code .`) and edit `Program.cs` by following the
four numbered edits in [LIVE_DEMO.md](LIVE_DEMO.md), Act One. Then run:

```shell
dotnet run
```

The untouched entrypoint is deliberately incomplete, not a working hello world.
Continue with Act Two in the same guide for the podcast agent. Reuse the
prebuilt `Helpers/` and `Tools/` code without editing it.

The SDK bundles a compatible runtime. If its download is blocked or the CLI
cannot be found, install and authenticate the native Copilot CLI first. The
repository's `Directory.Build.props` recognizes common CLI locations. For
another installation, set `COPILOT_CLI_BINARY_PATH` to its native executable.
For example, on Windows PowerShell:

```powershell
$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot.exe).Source
dotnet run
```

See [preflight](../../workshop/intro-00-preflight.md) for access checks and
troubleshooting, and the [official .NET SDK API](https://github.com/github/copilot-sdk/tree/main/dotnet)
for reference.
