# 사전 준비: SDK 101 준비

> **시간:** 30분 워크숍 전에 진행하는 시간 제한 없는 준비

## 만들 내용

스트리밍 hello world로 시작한 다음 The GitHub Podcast를 위한 작은 출시 도우미로
발전시킵니다. SDK 연결과 세션 구성을 작성합니다. 스타터에는 에피소드 조회 도구와
터미널 선택 도우미가 이미 포함되어 있습니다.

시간 제한이 있는 네 수업은 총 **30분**으로, SDK 기본 사항(5분), hello world(10분),
팟캐스트 에이전트(12분), 요약(3분)으로 구성됩니다. 세션에서 SDK에 집중할 수 있도록
설치, 인증 및 종속성 다운로드를 미리 완료합니다.

## 접근 권한 확인

Git, 편집기, 터미널, 네트워크 접근 권한 및 지원되는 모델을 사용할 수 있는 활성
GitHub Copilot 구독 또는 평가판이 필요합니다.
[Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)를
설치한 다음 터미널에서 다음 명령을 실행합니다.

```shell
git --version
copilot --version
copilot auth login
```

요청이 표시되면 브라우저 로그인을 완료합니다. 워크숍에서는 같은 계정과 터미널 환경을
사용합니다. 토큰을 소스 파일에 붙여 넣지 않습니다.
팟캐스트 예제에서는
[공식 RSS 피드](https://feeds.simplecast.com/ioCY0vfY)에 대한 접근 권한도 필요합니다.

## 스타터 가져오기

SDK 101 스타터 6개와 미리 빌드된 도우미가 모두 **이 워크숍 리포지토리**의
`start-intro/`에 포함되어 있습니다. 한 번만 복제합니다.

```shell
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

이 리포지토리를 이미 복제했다면 해당 체크아웃을 사용합니다. 다른 리포지토리를 복제하거나
스타터 프로젝트를 복사하지 않습니다. 아래에서 언어 하나만 선택합니다. 모든 명령은 이
리포지토리의 루트에서 시작합니다.
선택한 언어의 런타임만 설치합니다. 기존 종속성 버전을 유지합니다. 프로젝트를 스캐폴딩하거나
SDK를 다시 설치할 필요가 없습니다.

각 언어 폴더에는 **`LIVE_DEMO.md`** 파일도 있습니다. 진입점 옆에 이 파일을 엽니다.
시간 제한이 있는 세션에서는 Act One의 번호가 지정된 편집 네 단계를 수행하고 hello world를
실행한 다음, 같은 파일과 애플리케이션에서 Act Two를 계속 진행합니다.

:::language dotnet
### .NET 준비

[.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/)를 설치합니다.

```shell
dotnet --version
cd start-intro/dotnet
dotnet restore
```

편집기에서 `start-intro/dotnet`을 엽니다(VS Code에서는 `code .` 사용).
진입점은 `Program.cs`입니다. 나중에 이 폴더에서 `dotnet run`을 실행합니다.

번들 런타임 다운로드가 차단된 경우 사용하는 `COPILOT_CLI_BINARY_PATH`를 비롯한 CLI 검색
방법은 [스타터 README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md)를
참조합니다.
:::

:::language nodejs
### Node.js 준비

[Node.js 22.12 이상](https://nodejs.org/)을 설치합니다.

```shell
node --version
cd start-intro/nodejs
npm ci
```

편집기에서 `start-intro/nodejs`를 엽니다(VS Code에서는 `code .` 사용).
진입점은 `src/index.ts`입니다. 나중에 이 폴더에서 `npm start`를 실행합니다.

[스타터 README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md)를
참조합니다.
:::

:::language python
### Python 준비

[Python 3.11 이상](https://www.python.org/downloads/)을 설치합니다.
격리된 환경을 사용합니다. Windows PowerShell에서는 다음 명령을 실행합니다.

```powershell
python --version
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

macOS/Linux에서는 다음 명령을 실행합니다.

```bash
python3 --version
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

편집기에서 `start-intro/python`을 엽니다(VS Code에서는 `code .` 사용).
진입점은 `main.py`입니다. 수업에서는 환경의 인터프리터를 직접 사용하므로 활성화하거나
PowerShell 실행 정책을 변경할 필요가 없습니다.

[스타터 README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md)를
참조합니다.
:::

:::language go
### Go 준비

[Go 1.24 이상](https://go.dev/dl/)을 설치합니다.

```shell
go version
cd start-intro/go
go mod download
```

편집기에서 `start-intro/go`를 엽니다(VS Code에서는 `code .` 사용).
진입점은 `main.go`입니다. 나중에 이 폴더에서 `go run .`을 실행합니다.

[스타터 README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md)를
참조합니다.
:::

:::language java
### Java 준비

[Java 17 이상](https://adoptium.net/)을 설치합니다.
Maven을 별도로 설치할 필요는 없습니다. 스타터에 Maven Wrapper(`./mvnw`)가 포함되어 있으며
처음 사용할 때 올바른 Maven 버전을 다운로드합니다. Windows에서는 `mvnw.cmd`를
`./mvnw` 대신 실행합니다.

```shell
java --version
cd start-intro/java
./mvnw dependency:go-offline
```

편집기에서 `start-intro/java`를 엽니다(VS Code에서는 `code .` 사용).
진입점은 `src/main/java/demo/CopilotSdkLiveDemo.java`입니다.
나중에 이 폴더에서 `./mvnw compile exec:java`를 실행합니다.

[스타터 README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md)를
참조합니다.
:::

:::language rust
### Rust 준비

[Rust 1.94 이상](https://rustup.rs/)을 설치합니다.
Windows에서 기본 MSVC 도구 체인을 사용하려면
[Rust 설치 가이드](https://doc.rust-lang.org/book/ch01-01-installation.html)에 설명된
C++ 빌드 도구와 Windows SDK도 필요합니다.
세션 전에 이 설정을 완료합니다.

```shell
rustc --version
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

편집기에서 `start-intro/rust`를 엽니다(VS Code에서는 `code .` 사용).
진입점은 `src/main.rs`입니다. 나중에 이 폴더에서 `cargo run --locked`를 실행합니다.
사전 검사는 컴파일 캐시를 준비합니다. Rust 종속성을 처음 빌드할 때는 준비 시간을 더
확보합니다.

[스타터 README](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md)를
참조합니다.
:::

## 준비 상태 확인

인증을 완료하고 종속성을 다운로드했으며 선택한 진입점을 편집기에서 열었다면 준비가 끝난
것입니다. 수정하지 않은 진입점은 **의도적으로 미완성 상태**입니다. 자리 표시자 때문에
컴파일에 실패하거나 실제 로그인 상태를 확인하지 않고 인증 메시지를 출력할 수 있습니다.
이를 작동하는 애플리케이션으로 간주하지 않습니다. hello world 수업에서 완성합니다.

스타터의 도우미 파일은 변경하지 않습니다. `start-intro/` 안에서 기존 프로젝트를 확장합니다.
편집 내용이 `git status`에 표시되는 것은 정상입니다.

## 세션 전 문제 해결

- **CLI를 찾을 수 없음:** CLI 설치를 완료하고 터미널을 다시 엽니다. SDK에서 네이티브
  실행 파일을 찾을 수 없다면 해당 언어의 스타터 README를 따릅니다.
- **로그인 실패:** 세션 전에 구독, 조직 정책 및 브라우저 계정을 확인합니다.
  로그인에 성공했더라도 모델 접근이 보장되지는 않습니다.
- **종속성 다운로드 실패:** 프록시 또는 패키지 레지스트리 접근 문제를 지금 해결합니다.
  고정된 종속성을 관련 없는 SDK 버전으로 바꾸지 않습니다.
- **RSS 피드 차단:** 팟캐스트 수업 전에 공식 피드 접근 문제를 해결합니다.
  만들어 낸 에피소드 정보로 대체하지 않습니다.

[SDK 기본 사항](intro-01-sdk-basics.md)으로 계속 진행합니다.

## 자세히 알아보기

- [포함된 입문용 스타터](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
- [공식 Copilot SDK](https://github.com/github/copilot-sdk)
