# Proyecto inicial de SDK 101: .NET

Requiere [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) y acceso autenticado a
Copilot.

Desde la raíz del repositorio del taller:

```shell
cd start-intro/dotnet
dotnet restore
```

Abre esta carpeta en tu editor (`code .`) y edita `Program.cs` siguiendo las cuatro ediciones
numeradas de [LIVE_DEMO.md](LIVE_DEMO.md), primer acto. Después, ejecuta:

```shell
dotnet run
```

El punto de entrada sin tocar está incompleto de forma deliberada, no es un Hello World funcional.
Continúa con el segundo acto de la misma guía para el agente de pódcast. Reutiliza el código ya
preparado de `Helpers/` y `Tools/` sin editarlo.

El SDK agrupa un runtime compatible. Si su descarga está bloqueada o no se encuentra la CLI, instala
y autentica primero la Copilot CLI nativa. El archivo `Directory.Build.props` del repositorio
reconoce ubicaciones comunes de la CLI. Para otra instalación, establece `COPILOT_CLI_BINARY_PATH`
en su ejecutable nativo. Por ejemplo, en Windows PowerShell:

```powershell
$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot.exe).Source
dotnet run
```

Consulta la [preparación](../../workshop/intro-00-preflight.md) para comprobaciones de acceso y
solución de problemas, y la
[API oficial del SDK de .NET](https://github.com/github/copilot-sdk/tree/main/dotnet) como
referencia.
