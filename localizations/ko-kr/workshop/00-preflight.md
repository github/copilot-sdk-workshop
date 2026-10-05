# 사전 점검: 작업 환경 준비

> **시간 제한 없는 준비**  
> 115분 워크숍을 시작하기 전에 이 페이지를 완료합니다.

## 준비 완료 상태

사전 점검이 끝나면 리포지토리를 복제하고, Copilot CLI 인증을 완료하고, 시작 프로젝트를
빌드하고, Playwright MCP를 다운로드하여 사용할 준비를 마치게 됩니다.

모델 선택과 대화형 HTML 보고서를 포함해 아홉 개의 실습 단계를 모두 따라 한 뒤,
마지막으로 축하와 다음 학습 리소스로 마무리합니다.

:::language dotnet
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 방법 |
|---|---|---|
| [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | C# 콘솔 애플리케이션을 빌드하고 실행합니다 | `dotnet --version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | SDK가 사용하는 Copilot 런타임을 제공합니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge(기본값) 또는 Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다:

```text
$ dotnet --version
10.0.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```
:::

:::language nodejs
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 방법 |
|---|---|---|
| [Node.js 22.12 이상](https://nodejs.org/) | TypeScript 워크숍 앱과 Playwright MCP를 실행합니다 | `node --version` |
| [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) | `@github/copilot-sdk` 및 빌드 도구를 설치합니다 | `npm --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | SDK가 사용하는 Copilot 런타임을 제공합니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge(기본값) 또는 Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다:

```text
$ node --version
v22.12.x
$ npm --version
10.x.x
$ copilot --version
GitHub Copilot CLI ...
```

공식
[Node.js SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/nodejs)를 참조하십시오.
:::

:::language python
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 방법 |
|---|---|---|
| [Python 3.11 이상](https://www.python.org/downloads/) | 비동기 워크숍 애플리케이션을 실행합니다 | `python --version` |
| [pip](https://pip.pypa.io/en/stable/installation/) | 고정된 `github-copilot-sdk` wheel을 설치합니다 | `python -m pip --version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | `COPILOT_CLI_PATH`를 통한 선택적 로컬 런타임 재정의를 제공합니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge(기본값) 또는 Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다:

```text
$ python --version
Python 3.11.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Python SDK는 처음 사용할 때 고정된 런타임을 다운로드할 수 있습니다. 공식
[Python SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/python)를 참조하십시오.
:::

:::language go
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 방법 |
|---|---|---|
| [Go 1.24 이상](https://go.dev/dl/) | Go 워크숍 모듈을 빌드하고 실행합니다 | `go version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | SDK가 사용하려면 `PATH` 또는 `COPILOT_CLI_PATH`에 있어야 합니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge(기본값) 또는 Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다:

```text
$ go version
go version go1.24.x ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

공식
[Go SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/go)를 참조하십시오.
:::

:::language rust
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 방법 |
|---|---|---|
| [Rust 1.94 이상](https://rustup.rs/) | 비동기 Rust 워크숍 크레이트를 빌드합니다 | `rustc --version` |
| [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) | 잠긴 종속성을 해석하고 앱을 실행합니다 | `cargo --version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | 번들된 바이너리에만 의존하지 않을 때 사용하는 런타임입니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge(기본값) 또는 Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다:

```text
$ rustc --version
rustc 1.94.x
$ cargo --version
cargo 1.94.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

공식
[Rust SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/rust)를 참조하십시오.
:::

:::language java
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 방법 |
|---|---|---|
| [Java 17 이상](https://adoptium.net/) (JDK) | Maven 워크숍 앱을 컴파일하고 실행합니다 | `java -version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Java SDK 런타임이 사용하려면 `PATH`에 있어야 합니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge(기본값) 또는 Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다:

```text
$ java -version
openjdk version "17.x.x" ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

별도의 Maven 설치는 필요하지 않습니다. 각 Java 프로젝트에는 Maven Wrapper(`./mvnw`)가 포함되어
있어 처음 사용할 때 올바른 Maven 버전을 다운로드합니다. Windows에서는 `./mvnw` 대신
`mvnw.cmd`를 실행합니다. 이 트랙에서는 Maven을 사용합니다. JBang이나 Gradle로 대체하지
마십시오. 공식
[Java SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/java)를 참조하십시오.
:::

## 1. 리포지토리를 복제하고 시작 프로젝트를 선택합니다

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

작업은 **리포지토리 안에서 직접** 진행합니다. 복사 단계는 없습니다. 사용할 언어의 시작
디렉터리로 이동한 뒤 워크숍 내내 그 위치에서 작업합니다. 즉, 추적되는 리포지토리 파일을
편집하게 되므로 변경 사항이 `git status`에 표시됩니다. 이는 예상된 동작입니다. 다시
깨끗한 시작 상태가 필요하면 리포지토리 루트에서 `git checkout -- .`을 실행하여 편집한
내용을 버립니다.

## 2. Copilot을 인증합니다

[공식 설정 가이드](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)의
방법으로 CLI를 설치한 다음 다음 명령을 실행합니다.

```bash
copilot login
```

이후 SDK 호출이 GitHub Copilot에 연결될 수 있도록 브라우저 인증 흐름을 완료합니다.

## 3. Playwright MCP를 미리 준비합니다

고정된 패키지를 다운로드하고 서버를 시작하지 않은 채 옵션만 출력하려면 이 명령을 한 번
실행합니다.

```bash
npx -y @playwright/mcp@0.0.78 --help
```

패키지 버전은 모두가 동일한 도구 이름과 동작을 보도록 고정되어 있습니다. 코드에서는
`--browser=msedge`와 함께 Microsoft Edge를 사용합니다. 대신 Google Chrome을 준비했다면
4단계에서 해당 인수가 나올 때 `--browser=chrome`을 사용합니다.

:::language dotnet
## 4. 시작 프로젝트로 이동하고 빌드합니다

나중에 `dotnet build`가 Copilot CLI를 찾지 못하면 현재 터미널에 대해 해당 경로를 설정합니다.

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS 또는 Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_BINARY_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

.NET 시작 프로젝트로 이동해 빌드합니다. 이후 모든 단계에서도 이 디렉터리에 머뭅니다.

```bash
cd start-accessibility/dotnet
dotnet build
```

성공적으로 빌드되면 마지막에 다음과 같이 표시됩니다.

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

워크숍의 나머지 과정에서는 `start-accessibility/dotnet`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력해 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

접근 가능한지 확인하기 위해 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `copilot`이 인식되지 않음 | 설치 후 터미널을 다시 시작하거나 위 명령으로 `COPILOT_CLI_BINARY_PATH`를 설정합니다. |
| Copilot이 인증을 요청함 | `copilot login`을 실행하고 브라우저 흐름을 완료한 뒤 다시 시도합니다. |
| NuGet 복원이 패키지 소스에 연결할 수 없음 | 프록시 또는 패키지 소스 설정을 확인한 뒤 `dotnet restore`를 실행합니다. |
| `npx`가 인식되지 않음 | Node.js 22 이상을 설치하고 터미널을 다시 시작합니다. |
| 나중에 브라우저를 시작할 수 없음 | Edge 또는 Chrome을 설치하거나 [Playwright MCP 브라우저 구성](https://github.com/microsoft/playwright-mcp#configuration)을 따릅니다. |

</details>

> **1단계를 시작하는 시점:** `dotnet build`가 성공하고, `copilot login`이 완료되었으며,
> 대상 페이지가 열립니다.
:::

:::language nodejs
## 4. 시작 프로젝트로 이동하고 빌드합니다

나중에 SDK가 Copilot CLI를 찾지 못하면 현재 터미널에서 설치 위치를 직접 지정합니다.

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS 또는 Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Node.js 시작 프로젝트로 이동한 뒤 종속성을 설치하고 타입 검사를 수행합니다. 이후 모든
단계에서도 이 디렉터리에 머뭅니다.

```bash
cd start-accessibility/nodejs
npm install
npm run build
```

타입 검사가 성공하면 TypeScript 오류 없이 종료되며(`tsc --noEmit`의 출력이 비어 있음),
`package.json`의 시작 스크립트는 `tsx src/index.ts`입니다.

워크숍의 나머지 과정에서는 `start-accessibility/nodejs`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력해 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

접근 가능한지 확인하기 위해 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `node` 또는 `npm`이 인식되지 않음 | Node.js 22.12 이상을 설치하고 터미널을 다시 시작합니다. |
| Node 버전에 대한 엔진 경고 | Node.js 22.12+로 업그레이드합니다. 시작 프로젝트는 `"node": ">=22.12.0"`을 선언합니다. |
| `npm install`이 잠금 파일에서 실패함 | `start-accessibility/nodejs` 디렉터리에 머물고 `package-lock.json`을 유지합니다. 삭제하지 마십시오. |
| `copilot`이 인식되지 않음 | 설치 후 터미널을 다시 시작하거나 위 명령으로 `COPILOT_CLI_PATH`를 설정합니다. |
| Copilot이 인증을 요청함 | `copilot login`을 실행하고 브라우저 흐름을 완료한 뒤 다시 시도합니다. |
| `npx`가 Playwright MCP를 다운로드하지 못함 | 네트워크 연결을 확인한 뒤 3단계의 준비 명령을 다시 실행합니다. |
| 나중에 브라우저를 시작할 수 없음 | Edge 또는 Chrome을 설치하거나 [Playwright MCP 브라우저 구성](https://github.com/microsoft/playwright-mcp#configuration)을 따릅니다. |

</details>

> **1단계를 시작하는 시점:** `npm run build`가 성공하고, `copilot login`이 완료되었으며,
> 대상 페이지가 열립니다.
:::

:::language python
## 4. 시작 프로젝트로 이동하고 빌드합니다

선택 사항: 런타임을 다운로드하는 대신 SDK가 설치된 CLI를 사용하도록 강제할 수 있습니다.

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS 또는 Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Python 시작 프로젝트로 이동한 뒤 가상 환경을 만들고, 고정된 요구 사항을 설치하고,
컴파일 검사를 수행합니다. 이후 모든 단계에서도 이 디렉터리에 머뭅니다.

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Create the Python virtual environment">
    <button type="button" role="tab" aria-selected="true" data-tab="venv-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="venv-unix">macOS 또는 Linux</button>
  </div>
  <div role="tabpanel" data-panel="venv-windows">
    <pre><code class="language-powershell">cd start-accessibility/python
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
  <div role="tabpanel" data-panel="venv-unix" hidden>
    <pre><code class="language-bash">cd start-accessibility/python
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m py_compile main.py workshop.py report.py accessibility_rule_catalog.py</code></pre>
  </div>
</div>

설치가 성공하면 `github-copilot-sdk==...`를 포함한 해결된 패키지가 출력됩니다. 컴파일
검사가 성공하면 출력이 없습니다. 이후 단계에서도 가상 환경을 활성화한 상태로 유지합니다.

워크숍의 나머지 과정에서는 `start-accessibility/python`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력해 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

선택 사항: 1단계를 처음 실행할 때 더 빠르게 시작하도록 런타임을 지금 미리 다운로드할 수 있습니다.

```bash
python -m copilot download-runtime
```

접근 가능한지 확인하기 위해 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `python`이 Python 2를 가리키거나 없음 | Python 3.11+(`macOS/Linux`에서는 `python3`)을 사용하고 venv를 다시 만듭니다. |
| `pip install`이 PyPI에 연결할 수 없음 | 프록시 설정을 확인한 뒤 `python -m pip install -r requirements.txt`를 다시 실행합니다. |
| 잘못된 패키지 버전이 설치됨 | 고정된 `requirements.txt`로만 설치합니다. `==` 고정을 완화하지 마십시오. |
| 나중에 런타임 다운로드가 실패함 | `python -m copilot download-runtime`을 실행하거나 `COPILOT_CLI_PATH`를 작동하는 CLI로 설정합니다. |
| Copilot이 인증을 요청함 | `copilot login`을 실행하고 브라우저 흐름을 완료한 뒤 다시 시도합니다. |
| `npx`가 인식되지 않음 | Node.js 22 이상을 설치하고 터미널을 다시 시작합니다. |
| 나중에 브라우저를 시작할 수 없음 | Edge 또는 Chrome을 설치하거나 [Playwright MCP 브라우저 구성](https://github.com/microsoft/playwright-mcp#configuration)을 따릅니다. |

</details>

> **1단계를 시작하는 시점:** 고정된 요구 사항이 설치되고, `py_compile`이 성공하고,
> `copilot login`이 완료되었으며, 대상 페이지가 열립니다.
:::

:::language go
## 4. 시작 프로젝트로 이동하고 빌드합니다

Go SDK는 `PATH` 또는 `COPILOT_CLI_PATH`를 통해 Copilot CLI를 찾습니다.

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS 또는 Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Go 시작 프로젝트로 이동한 뒤 잠금이 강제된 상태로 빌드합니다. 이후 모든 단계에서도 이
디렉터리에 머뭅니다.

```bash
cd start-accessibility/go
go build -mod=readonly ./...
```

빌드가 성공하면 오류 없이 종료되고 시작 프로젝트 디렉터리에 바이너리가 생성됩니다.
모듈 해석이 결정론적으로 유지되도록 `go.sum`을 그대로 유지합니다.

워크숍의 나머지 과정에서는 `start-accessibility/go`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력해 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

접근 가능한지 확인하기 위해 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `go: go.mod requires go >= 1.24` | Go 1.24 이상을 설치하고 터미널을 다시 엽니다. |
| `missing go.sum entry` | 커밋된 `go.sum`을 복원하고 잠금을 다시 쓰지 말고 `-mod=readonly`로 빌드합니다. |
| 모듈 다운로드가 차단됨 | `GOPROXY`/프록시 접근을 구성한 뒤 시작 프로젝트 디렉터리에서 다시 빌드합니다. |
| `copilot`이 인식되지 않음 | CLI를 설치하고 터미널을 다시 시작하거나 `COPILOT_CLI_PATH`를 설정합니다. |
| Copilot이 인증을 요청함 | `copilot login`을 실행하고 브라우저 흐름을 완료한 뒤 다시 시도합니다. |
| `npx`가 인식되지 않음 | Node.js 22 이상을 설치하고 터미널을 다시 시작합니다. |
| 나중에 브라우저를 시작할 수 없음 | Edge 또는 Chrome을 설치하거나 [Playwright MCP 브라우저 구성](https://github.com/microsoft/playwright-mcp#configuration)을 따릅니다. |

</details>

> **1단계를 시작하는 시점:** `go build -mod=readonly ./...`가 성공하고,
> `copilot login`이 완료되었으며, 대상 페이지가 열립니다.

1단계 후에 나중 참고할 기준점이 필요하면
[`finished/go/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/hello-copilot-sdk)와
비교해 보십시오.
:::

:::language rust
## 4. 시작 프로젝트로 이동하고 빌드합니다

나중에 런타임 시작 시 CLI를 확인하지 못하면 `COPILOT_CLI_PATH`를 설정합니다.

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS 또는 Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Rust 시작 프로젝트로 이동한 뒤 잠금 파일 기준으로 검사합니다. 이후 모든 단계에서도 이
디렉터리에 머뭅니다.

```bash
cd start-accessibility/rust
cargo check --locked
```

검사가 성공하면 `Finished` 줄과 함께 오류 없이 끝납니다. 크레이트 그래프가 고정된 상태를
유지하도록 `Cargo.lock`을 커밋된 상태로 유지합니다.

워크숍의 나머지 과정에서는 `start-accessibility/rust`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력해 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

접근 가능한지 확인하기 위해 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `rustc 1.xx is too old` | `rustup update`로 Rust 1.94+를 설치하고 터미널을 다시 엽니다. |
| `--locked`와 잠금 파일이 맞지 않음 | 시작 프로젝트의 `Cargo.lock`을 유지하고 제한 없이 `cargo update`를 실행하지 마십시오. |
| 크레이트 다운로드가 차단됨 | crates.io에 대한 네트워크/프록시 접근을 확인한 뒤 `cargo check`를 다시 실행합니다. |
| 나중에 런타임을 시작할 수 없음 | `copilot`을 설치하고 인증하거나 `COPILOT_CLI_PATH`를 설정합니다. |
| Copilot이 인증을 요청함 | `copilot login`을 실행하고 브라우저 흐름을 완료한 뒤 다시 시도합니다. |
| `npx`가 인식되지 않음 | Node.js 22 이상을 설치하고 터미널을 다시 시작합니다. |
| 나중에 브라우저를 시작할 수 없음 | Edge 또는 Chrome을 설치하거나 [Playwright MCP 브라우저 구성](https://github.com/microsoft/playwright-mcp#configuration)을 따릅니다. |

</details>

> **1단계를 시작하는 시점:** `cargo check --locked`가 성공하고, `copilot login`이
> 완료되었으며, 대상 페이지가 열립니다.

1단계 후에 나중 참고할 기준점이 필요하면
[`finished/rust/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/hello-copilot-sdk)와
비교해 보십시오.
:::

:::language java
## 4. 시작 프로젝트로 이동하고 빌드합니다

Java SDK는 애플리케이션이 시작될 때 `PATH`에서 Copilot CLI를 찾습니다. 빌드 전에 먼저
확인합니다.

```bash
copilot --version
```

Java 시작 프로젝트로 이동한 뒤 Maven으로 컴파일합니다. 이후 모든 단계에서도 이
디렉터리에 머뭅니다.

```bash
cd start-accessibility/java
./mvnw compile
```

컴파일이 성공하면 마지막에 다음이 표시됩니다.

```text
[INFO] BUILD SUCCESS
```

`pom.xml`은 이미 `exec-maven-plugin`에 `mainClass`
`workshop.AccessibilityReport`를 구성하고 있습니다. 이 트랙에서는 Maven을 계속 사용합니다.

워크숍의 나머지 과정에서는 `start-accessibility/java`에서 작업하므로 터미널을 이 위치에
유지합니다. 이 폴더에서 `code .`을 입력해 VS Code로 열거나 선호하는 편집기에서 폴더를
엽니다.

접근 가능한지 확인하기 위해 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `java`가 인식되지 않음 | JDK 17+를 설치한 뒤 터미널을 다시 시작합니다. |
| `./mvnw: Permission denied` | `chmod +x mvnw`를 실행하거나 `sh mvnw`를 대신 사용합니다. Windows에서는 `mvnw.cmd`를 사용합니다. |
| 컴파일러 release 오류 | `java -version`이 17 이상을 보고하는지 확인합니다. POM은 `maven.compiler.release`를 17로 설정합니다. |
| 종속성 다운로드 실패 | Maven Central / 프록시 설정을 확인한 뒤 `./mvnw compile`을 다시 실행합니다. |
| 다른 도구로 바꾸고 싶어짐 | 이 워크숍에서는 Maven을 JBang이나 Gradle로 대체하지 마십시오. |
| `copilot`이 인식되지 않음 | CLI를 설치하고 터미널을 다시 시작한 뒤 `copilot --version`으로 확인합니다. |
| Copilot이 인증을 요청함 | `copilot login`을 실행하고 브라우저 흐름을 완료한 뒤 다시 시도합니다. |
| `npx`가 인식되지 않음 | Node.js 22 이상을 설치하고 터미널을 다시 시작합니다. |
| 나중에 브라우저를 시작할 수 없음 | Edge 또는 Chrome을 설치하거나 [Playwright MCP 브라우저 구성](https://github.com/microsoft/playwright-mcp#configuration)을 따릅니다. |

</details>

> **1단계를 시작하는 시점:** `./mvnw compile`이 `BUILD SUCCESS`를 출력하고,
> `copilot login`이 완료되었으며, 대상 페이지가 열립니다.

1단계 후에 나중 참고할 기준점이 필요하면
[`finished/java/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/hello-copilot-sdk)와
비교해 보십시오.
:::

## 더 알아보기

이제 설치하려는 SDK에 대한 문서는 이 워크숍 외부에도 제공됩니다. 다음 페이지는 1단계를
시작하기 전에 북마크해 둘 가치가 있습니다.

- [GitHub Copilot SDK 방법 가이드](https://docs.github.com/en/copilot/how-tos/copilot-sdk):
  GitHub의 공식 SDK 문서로, 이 사전 점검에서 반영한 필수 조건도 포함합니다.
- [Copilot SDK 문서 맵](https://github.com/github/copilot-sdk/blob/main/docs/README.md):
  설정, 인증, 기능, 문제 해결에 대한 색인입니다.
- [기본 설정: 번들된 CLI](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md):
  SDK가 Copilot CLI를 찾고 시작하는 방법과 다른 바이너리를 지정하는 방법을 설명합니다.
- [디버깅 가이드](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md):
  실행이 어떤 출력도 만들기 전에 실패할 때 가장 먼저 확인할 곳입니다.

:::language dotnet
- [.NET SDK 참조](https://github.com/github/copilot-sdk/blob/main/dotnet/README.md):
  .NET SDK용 패키지 설치와 최소 예제를 제공합니다.
:::

:::language nodejs
- [Node.js SDK 참조](https://github.com/github/copilot-sdk/blob/main/nodejs/README.md):
  Node.js SDK용 패키지 설치와 최소 예제를 제공합니다.
:::

:::language python
- [Python SDK 참조](https://github.com/github/copilot-sdk/blob/main/python/README.md):
  Python SDK용 패키지 설치와 최소 예제를 제공합니다.
:::

:::language go
- [Go SDK 참조](https://github.com/github/copilot-sdk/blob/main/go/README.md):
  Go SDK용 모듈 설치와 최소 예제를 제공합니다.
:::

:::language rust
- [Rust SDK 참조](https://github.com/github/copilot-sdk/blob/main/rust/README.md):
  Rust SDK용 크레이트 설치와 최소 예제를 제공합니다.
:::

:::language java
- [Java SDK 참조](https://github.com/github/copilot-sdk/blob/main/java/README.md):
  Java SDK용 종속성 좌표와 최소 예제를 제공합니다.
:::

[1단계: 첫 번째 Copilot 세션 만들기](01-first-session.md)로 계속합니다.
