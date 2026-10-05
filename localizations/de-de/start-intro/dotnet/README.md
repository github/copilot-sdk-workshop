# SDK 101-Starterprojekt: .NET

Erfordert das [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) und authentifizierten
Copilot-Zugriff.

Aus dem Stamm des Workshop-Repositorys:

```shell
cd start-intro/dotnet
dotnet restore
```

Öffnen Sie diesen Ordner in Ihrem Editor (`code .`) und bearbeiten Sie `Program.cs`, indem Sie den
vier nummerierten Bearbeitungen in [LIVE_DEMO.md](LIVE_DEMO.md), Erster Akt, folgen. Führen Sie dann
Folgendes aus:

```shell
dotnet run
```

Der unveränderte Einstiegspunkt ist absichtlich unvollständig und kein funktionierendes Hello World.
Fahren Sie im selben Leitfaden mit dem zweiten Akt für den Podcast-Agenten fort. Verwenden Sie den
vorgefertigten Code in `Helpers/` und `Tools/` wieder, ohne ihn zu bearbeiten.

Das SDK bündelt eine kompatible Runtime. Wenn ihr Download blockiert wird oder die CLI nicht
gefunden werden kann, installieren und authentifizieren Sie zuerst die native Copilot CLI. Die
`Directory.Build.props` des Repositorys erkennt gängige CLI-Speicherorte. Für eine andere
Installation setzen Sie `COPILOT_CLI_BINARY_PATH` auf die native ausführbare Datei. Zum Beispiel in
Windows PowerShell:

```powershell
$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot.exe).Source
dotnet run
```

Siehe [Vorbereitung](../../workshop/intro-00-preflight.md) für Zugriffsprüfungen und
Problembehandlung sowie die
[offizielle .NET SDK-API](https://github.com/github/copilot-sdk/tree/main/dotnet) als Referenz.
