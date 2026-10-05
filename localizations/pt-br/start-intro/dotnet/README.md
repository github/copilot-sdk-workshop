# Projeto inicial do SDK 101: .NET

Requer o [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) e acesso autenticado ao
Copilot.

A partir da raiz do repositório do workshop:

```shell
cd start-intro/dotnet
dotnet restore
```

Abra esta pasta no editor (`code .`) e edite `Program.cs` seguindo as quatro edições numeradas em
[LIVE_DEMO.md](LIVE_DEMO.md), Ato um. Depois execute:

```shell
dotnet run
```

O ponto de entrada intacto é deliberadamente incompleto, não um Hello World funcional. Continue com
o Ato dois no mesmo guia para o agente de podcast. Reutilize o código `Helpers/` e `Tools/` pronto
sem editá-lo.

O SDK inclui um runtime compatível. Se o download dele for bloqueado ou o CLI não for encontrado,
instale e autentique primeiro o Copilot CLI nativo. O `Directory.Build.props` do repositório
reconhece locais comuns do CLI. Para outra instalação, defina `COPILOT_CLI_BINARY_PATH` como o
executável nativo dessa instalação. Por exemplo, no Windows PowerShell:

```powershell
$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot.exe).Source
dotnet run
```

Consulte a [preparação](../../workshop/intro-00-preflight.md) para verificações de acesso e solução
de problemas, e a
[API oficial do SDK para .NET](https://github.com/github/copilot-sdk/tree/main/dotnet) como
referência.
