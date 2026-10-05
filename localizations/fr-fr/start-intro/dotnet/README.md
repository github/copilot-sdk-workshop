# Projet de départ SDK 101 : .NET

Nécessite le [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) et un accès Copilot
authentifié.

Depuis la racine du dépôt de l'atelier :

```shell
cd start-intro/dotnet
dotnet restore
```

Ouvrez ce dossier dans votre éditeur (`code .`) et modifiez `Program.cs` en suivant les quatre
modifications numérotées de [LIVE_DEMO.md](LIVE_DEMO.md), acte un. Exécutez ensuite :

```shell
dotnet run
```

Le point d'entrée intact est volontairement incomplet, ce n'est pas un Hello World fonctionnel.
Continuez avec l'acte deux du même guide pour l'agent de podcast. Réutilisez le code `Helpers/` et
`Tools/` fourni sans le modifier.

Le SDK embarque un runtime compatible. Si son téléchargement est bloqué ou si la CLI est
introuvable, installez et authentifiez d'abord la Copilot CLI native. Le `Directory.Build.props` du
dépôt reconnaît les emplacements courants de la CLI. Pour une autre installation, définissez
`COPILOT_CLI_BINARY_PATH` sur son exécutable natif. Par exemple, dans Windows PowerShell :

```powershell
$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot.exe).Source
dotnet run
```

Consultez la [préparation](../../workshop/intro-00-preflight.md) pour les vérifications d'accès et
la résolution des problèmes, ainsi que
l'[API officielle .NET SDK](https://github.com/github/copilot-sdk/tree/main/dotnet) comme référence.
