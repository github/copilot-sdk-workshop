# SDK 101 시작 프로젝트: .NET

[.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/)와
인증된 Copilot 액세스가 필요합니다.

워크숍 리포지토리 루트에서 다음을 실행합니다.

```shell
cd start-intro/dotnet
dotnet restore
```

이 폴더를 편집기에서 열고(`code .`) [LIVE_DEMO.md](../../../../start-intro/dotnet/LIVE_DEMO.md)의 1막에 나오는
네 가지 번호가 매겨진 수정 단계를 따라 `Program.cs`를 편집합니다. 그런 다음 다음을 실행합니다.

```shell
dotnet run
```

수정하지 않은 엔트리 포인트(Entrypoint)는 의도적으로 완성되지 않은 상태이며, 작동하는 hello world가 아닙니다.
팟캐스트 에이전트를 만들려면 같은 가이드의 2막을 계속 진행합니다. 미리 빌드된
`Helpers/` 및 `Tools/` 코드는 편집하지 않고 재사용합니다.

SDK에는 호환되는 런타임(Runtime)이 포함되어 있습니다. 런타임 다운로드가 차단되거나 CLI를
찾을 수 없으면 먼저 네이티브 Copilot CLI를 설치하고 인증합니다. 리포지토리의
`Directory.Build.props`는 일반적인 CLI 위치를 인식합니다. 다른 위치에 설치한 경우
`COPILOT_CLI_BINARY_PATH`를 해당 네이티브 실행 파일로 설정합니다.
예를 들어 Windows PowerShell에서는 다음과 같이 실행합니다.

```powershell
$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot.exe).Source
dotnet run
```

액세스 확인 및 문제 해결 방법은 [사전 점검](../../../../workshop/intro-00-preflight.md)을 참조하고,
API는 [공식 .NET SDK API](https://github.com/github/copilot-sdk/tree/main/dotnet)를 참조합니다.
