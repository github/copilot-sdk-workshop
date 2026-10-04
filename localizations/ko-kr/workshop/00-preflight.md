# 사전 점검: 컴퓨터 준비

> **시간 제한 없음**  
> 115분 워크숍을 시작하기 전에 이 페이지를 완료합니다.

## 준비할 항목

사전 점검이 끝나면 리포지토리를 복제하고 Copilot CLI를 인증하며
스타터 프로젝트를 빌드하고 Playwright MCP를 다운로드하여 사용할 수 있습니다.

모델 선택과 대화형 HTML 보고서를 포함한 아홉 가지 실습 단계를 모두 진행한 후
축하와 추가 리소스로 마무리합니다.

:::language dotnet
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 |
|---|---|---|
| [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | 빌드 및 실행 the C# console application | `dotnet --version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | SDK에서 사용하는 Copilot 런타임을 제공합니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge (default) or Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다.

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

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 |
|---|---|---|
| [Node.js 22.12 이상](https://nodejs.org/) | TypeScript 워크숍 앱과 Playwright MCP를 실행합니다 | `node --version` |
| [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) | `@github/copilot-sdk`와 빌드 도구를 설치합니다 | `npm --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | SDK에서 사용하는 Copilot 런타임을 제공합니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge (default) or Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다.

```text
$ node --version
v22.12.x
$ npm --version
10.x.x
$ copilot --version
GitHub Copilot CLI ...
```

공식 문서는 다음을 참조합니다
[Node.js SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/nodejs).
:::

:::language python
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 |
|---|---|---|
| [Python 3.11 이상](https://www.python.org/downloads/) | 비동기 워크숍 애플리케이션을 실행합니다 | `python --version` |
| [pip](https://pip.pypa.io/en/stable/installation/) | 고정된 `github-copilot-sdk` 휠을 설치합니다 | `python -m pip --version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | `COPILOT_CLI_PATH`를 통한 선택적 로컬 런타임 재정의 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge (default) or Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다.

```text
$ python --version
Python 3.11.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Python SDK는 처음 사용할 때 고정된 런타임을 다운로드할 수 있습니다. 공식 문서는 다음을 참조합니다
[Python SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/python).
:::

:::language go
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 |
|---|---|---|
| [Go 1.24 이상](https://go.dev/dl/) | 빌드 및 실행 the Go workshop module | `go version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | SDK를 위해 `PATH`(또는 `COPILOT_CLI_PATH`)에 필요합니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge (default) or Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다.

```text
$ go version
go version go1.24.x ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

공식 문서는 다음을 참조합니다
[Go SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/go).
:::

:::language rust
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 |
|---|---|---|
| [Rust 1.94 이상](https://rustup.rs/) | 비동기 Rust 워크숍 크레이트를 빌드합니다 | `rustc --version` |
| [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) | 잠긴 종속성을 확인하고 앱을 실행합니다 | `cargo --version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | 번들 바이너리만 사용하지 않을 때 사용하는 런타임입니다 | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge (default) or Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다.

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

공식 문서는 다음을 참조합니다
[Rust SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/rust).
:::

:::language java
## 필요한 항목

| 요구 사항 | 워크숍에서 필요한 이유 | 확인 |
|---|---|---|
| [Java 17 이상](https://adoptium.net/) (JDK) | Compiles and runs the Maven workshop app | `java -version` |
| [Node.js 22 이상](https://nodejs.org/) | Playwright MCP 서버를 실행합니다 | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Required on `PATH` for the Java SDK runtime | `copilot --version` |
| [GitHub Copilot access](https://github.com/features/copilot) | Copilot 요청을 인증합니다 | `copilot login` |
| Microsoft Edge (default) or Google Chrome | Playwright가 대상 페이지를 검사할 수 있게 합니다 | 워크숍 전에 브라우저를 한 번 엽니다 |

명령은 다음과 같은 형식의 출력을 반환해야 합니다.

```text
$ java -version
openjdk version "17.x.x" ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

No separate Maven install is needed: each Java project includes the Maven Wrapper (`./mvnw`),
which downloads the right Maven version on first use. On Windows, run `mvnw.cmd` instead of
`./mvnw`. Use Maven for this track. Do not substitute JBang or Gradle. 공식 문서는 다음을 참조합니다
[Java SDK 설치 가이드](https://github.com/github/copilot-sdk/tree/main/java).
:::

## 1. 리포지토리 복제 및 스타터 선택

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

리포지토리 **안에서 직접 작업합니다**. 복사 단계는 없습니다. 스타터
directory for your language and stay there for the whole workshop. That means you are editing
추적되는 리포지토리 파일을 수정하므로 변경 사항이 `git status`에 표시됩니다. 이는 예상된 동작입니다. 깨끗한
스타터로 되돌리려면 리포지토리 루트에서 `git checkout -- .`을 실행하여 편집 내용을 삭제합니다.

## 2. Copilot 인증

공식 방법으로 CLI를 설치한 후
[official setup guide](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli), then run:

```bash
copilot login
```

브라우저 인증 흐름을 완료합니다 so later SDK calls can reach GitHub Copilot.

## 3. Playwright MCP 준비

다음 명령을 한 번 실행하여 다운로드합니다 the pinned package and print its options 서버를 시작하지 않고:

```bash
npx -y @playwright/mcp@0.0.78 --help
```

패키지 버전은 고정되어 있으므로 모두가 동일한 도구 이름과 동작을 확인합니다. 코드는
Microsoft Edge with `--browser=msedge`. Google Chrome을 준비한 경우, use
`--browser=chrome` when the argument appears in Step 4.

:::language dotnet
## 4. 스타터로 이동하여 빌드

나중에 `dotnet build`가 Copilot CLI를 찾지 못하면 현재 터미널에 경로를 설정합니다:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS or Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_BINARY_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

다음 디렉터리로 이동하여 .NET starter 빌드합니다. 이 디렉터리에서 계속 작업합니다 이후 모든 단계에서:

```bash
cd start-accessibility/dotnet
dotnet build
```

빌드에 성공하면 ends with:

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

다음 디렉터리에서 작업하므로 `start-accessibility/dotnet` for the rest of the workshop, so keep this terminal here. From
this folder, enter `code .` VS Code에서 열려면, 또는 선호하는 편집기에서 폴더를 엽니다.

접속할 수 있는지 확인하려면 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `copilot` is not recognized | 터미널을 다시 시작합니다 after installation, or set `COPILOT_CLI_BINARY_PATH` with the command above. |
| Copilot에서 인증을 요청합니다 | `copilot login`을 실행하고 브라우저 인증을 완료한 후 다시 시도합니다. |
| NuGet restore cannot reach the package source | Check proxy or package-source settings, then run `dotnet restore`. |
| `npx` is not recognized | Node.js를 설치합니다 22 이상 and restart the terminal. |
| 나중에 브라우저가 시작되지 않습니다 | Edge 또는 Chrome을 설치합니다, or follow the [Playwright MCP browser configuration](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **다음 조건을 충족하면 1단계를 시작합니다:** `dotnet build` 성공하고, `copilot login` 완료되고, and the target page
> opens.
:::

:::language nodejs
## 4. 스타터로 이동하여 빌드

나중에 SDK가 Copilot CLI를 찾지 못하면 현재 터미널에서 설치 경로를 지정합니다:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS or Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

다음 디렉터리로 이동하여 Node.js starter, install dependencies, and type-check. 이 디렉터리에서 계속 작업합니다 for
every later step:

```bash
cd start-accessibility/nodejs
npm install
npm run build
```

형식 검사가 성공하면 TypeScript 오류 없이 끝납니다(`tsc --noEmit`의 출력이 비어 있음).
`package.json` start script is `tsx src/index.ts`.

다음 디렉터리에서 작업하므로 `start-accessibility/nodejs` for the rest of the workshop, so keep this terminal here. From
this folder, enter `code .` VS Code에서 열려면, 또는 선호하는 편집기에서 폴더를 엽니다.

접속할 수 있는지 확인하려면 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `node` or `npm` is not recognized | Node.js를 설치합니다 22.12 이상 and restart the terminal. |
| Engine warning about Node version | Upgrade to Node.js 22.12+; the starter declares `"node": ">=22.12.0"`. |
| `npm install` fails on the lockfile | Stay in `start-accessibility/nodejs` and keep `package-lock.json`; do not delete it. |
| `copilot` is not recognized | 터미널을 다시 시작합니다 after installation, or set `COPILOT_CLI_PATH` with the command above. |
| Copilot에서 인증을 요청합니다 | `copilot login`을 실행하고 브라우저 인증을 완료한 후 다시 시도합니다. |
| `npx` cannot download Playwright MCP | Check network access, then rerun the warm-up command from section 3. |
| 나중에 브라우저가 시작되지 않습니다 | Edge 또는 Chrome을 설치합니다, or follow the [Playwright MCP browser configuration](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **다음 조건을 충족하면 1단계를 시작합니다:** `npm run build` 성공하고, `copilot login` 완료되고, and the target page
> opens.
:::

:::language python
## 4. 스타터로 이동하여 빌드

선택 사항: force the SDK to use your installed CLI instead of downloading a runtime:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS or Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

다음 디렉터리로 이동하여 Python starter, create a virtual environment, install pinned requirements, and
compile-check. 이 디렉터리에서 계속 작업합니다 이후 모든 단계에서:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Create the Python virtual environment">
    <button type="button" role="tab" aria-selected="true" data-tab="venv-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="venv-unix">macOS or Linux</button>
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

설치에 성공하면 `github-copilot-sdk==...`를 포함한 확인된 패키지가 출력됩니다. 성공적인
compile check prints no output. 가상 환경을 활성화한 상태로 유지합니다 for later steps.

다음 디렉터리에서 작업하므로 `start-accessibility/python` for the rest of the workshop, so keep this terminal here. From
this folder, enter `code .` VS Code에서 열려면, 또는 선호하는 편집기에서 폴더를 엽니다.

Optionally pre-download the runtime now so the first Step 1 run is faster:

```bash
python -m copilot download-runtime
```

접속할 수 있는지 확인하려면 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `python` points at Python 2 또는 없습니다 | Use Python 3.11+ (`python3` on macOS/Linux) and recreate the venv. |
| `pip install` cannot reach PyPI | Check proxy settings, then rerun `python -m pip install -r requirements.txt`. |
| 패키지 버전이 잘못됨 | 고정된 `requirements.txt`에서만 설치하고 `==` 고정을 완화하지 않습니다. |
| 나중에 런타임 다운로드 실패 | `python -m copilot download-runtime`을 실행하거나 작동하는 CLI로 `COPILOT_CLI_PATH`를 설정합니다. |
| Copilot에서 인증을 요청합니다 | `copilot login`을 실행하고 브라우저 인증을 완료한 후 다시 시도합니다. |
| `npx` is not recognized | Node.js를 설치합니다 22 이상 and restart the terminal. |
| 나중에 브라우저가 시작되지 않습니다 | Edge 또는 Chrome을 설치합니다, or follow the [Playwright MCP browser configuration](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **다음 조건을 충족하면 1단계를 시작합니다:** the pinned requirements install, `py_compile` 성공하고, `copilot login` is
> complete, 대상 페이지가 열립니다.
:::

:::language go
## 4. 스타터로 이동하여 빌드

Go SDK는 `PATH` 또는 `COPILOT_CLI_PATH`를 통해 Copilot CLI를 찾습니다:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS or Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

다음 디렉터리로 이동하여 Go starter and build with the lock enforced. 이 디렉터리에서 계속 작업합니다 for every later
step:

```bash
cd start-accessibility/go
go build -mod=readonly ./...
```

빌드에 성공하면 prints no errors and produces a binary in the starter directory. Keep `go.sum`
intact so module resolution stays deterministic.

다음 디렉터리에서 작업하므로 `start-accessibility/go` for the rest of the workshop, so keep this terminal here. From
this folder, enter `code .` VS Code에서 열려면, 또는 선호하는 편집기에서 폴더를 엽니다.

접속할 수 있는지 확인하려면 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `go: go.mod requires go >= 1.24` | Go 1.24 이상을 설치하고 터미널을 다시 엽니다. |
| `missing go.sum entry` | Restore the committed `go.sum`; build with `-mod=readonly` instead of rewriting the lock. |
| Module download blocked | Configure `GOPROXY`/proxy access, then retry the build from the starter directory. |
| `copilot`을 인식하지 못함 | CLI를 설치하고 터미널을 다시 시작하거나 `COPILOT_CLI_PATH`를 설정합니다. |
| Copilot에서 인증을 요청합니다 | `copilot login`을 실행하고 브라우저 인증을 완료한 후 다시 시도합니다. |
| `npx` is not recognized | Node.js를 설치합니다 22 이상 and restart the terminal. |
| 나중에 브라우저가 시작되지 않습니다 | Edge 또는 Chrome을 설치합니다, or follow the [Playwright MCP browser configuration](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **다음 조건을 충족하면 1단계를 시작합니다:** `go build -mod=readonly ./...` 성공하고, `copilot login` 완료되고, and
> the target page opens.

Compare with
[`finished/go/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/hello-copilot-sdk)
if you want a later 참조 point after Step 1.
:::

:::language rust
## 4. 스타터로 이동하여 빌드

나중에 런타임이 CLI를 찾지 못하면 `COPILOT_CLI_PATH`를 설정합니다:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS or Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

다음 디렉터리로 이동하여 Rust starter and check it against the lockfile. 이 디렉터리에서 계속 작업합니다 for every
later step:

```bash
cd start-accessibility/rust
cargo check --locked
```

검사에 성공하면 ends with a `Finished` line and no errors. Keep `Cargo.lock` committed so the
crate graph stays pinned.

다음 디렉터리에서 작업하므로 `start-accessibility/rust` for the rest of the workshop, so keep this terminal here. From
this folder, enter `code .` VS Code에서 열려면, 또는 선호하는 편집기에서 폴더를 엽니다.

접속할 수 있는지 확인하려면 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `rustc 1.xx is too old` | `rustup update`로 Rust 1.94 이상을 설치하고 터미널을 다시 엽니다. |
| Lockfile mismatch with `--locked` | Keep the starter `Cargo.lock`; do not run unconstrained `cargo update`. |
| Crate download blocked | Check network/proxy access to crates.io, then retry `cargo check`. |
| 나중에 런타임을 시작할 수 없음 | `copilot`을 설치하고 인증하거나 `COPILOT_CLI_PATH`를 설정합니다. |
| Copilot에서 인증을 요청합니다 | `copilot login`을 실행하고 브라우저 인증을 완료한 후 다시 시도합니다. |
| `npx` is not recognized | Node.js를 설치합니다 22 이상 and restart the terminal. |
| 나중에 브라우저가 시작되지 않습니다 | Edge 또는 Chrome을 설치합니다, or follow the [Playwright MCP browser configuration](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **다음 조건을 충족하면 1단계를 시작합니다:** `cargo check --locked` 성공하고, `copilot login` 완료되고, and the
> target page opens.

Compare with
[`finished/rust/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/hello-copilot-sdk)
if you want a later 참조 point after Step 1.
:::

:::language java
## 4. 스타터로 이동하여 빌드

Java SDK는 애플리케이션 시작 시 `PATH`에서 Copilot CLI를 찾습니다. 빌드 전에
다음으로 확인합니다:

```bash
copilot --version
```

다음 디렉터리로 이동하여 Java starter and compile with Maven. 이 디렉터리에서 계속 작업합니다 이후 모든 단계에서:

```bash
cd start-accessibility/java
./mvnw compile
```

컴파일에 성공하면 다음으로 끝납니다:

```text
[INFO] BUILD SUCCESS
```

`pom.xml`은 이미 `exec-maven-plugin`을 다음과 같이 구성합니다.
`mainClass` `workshop.AccessibilityReport`. Stay on Maven for this track.

다음 디렉터리에서 작업하므로 `start-accessibility/java` for the rest of the workshop, so keep this terminal here. From
this folder, enter `code .` VS Code에서 열려면, 또는 선호하는 편집기에서 폴더를 엽니다.

접속할 수 있는지 확인하려면 제어 대상 페이지를 한 번 엽니다.

```text
{{TARGET_APP_URL}}
```

<details>
<summary>사전 점검 문제 해결</summary>

| 증상 | 해결 방법 |
|---|---|
| `java`를 인식하지 못함 | JDK 17 이상을 설치한 후 터미널을 다시 시작합니다. |
| `./mvnw: Permission denied` | `chmod +x mvnw`를 실행하거나 `sh mvnw`를 사용합니다. Windows에서는 `mvnw.cmd`를 사용합니다. |
| Compiler release errors | Confirm `java -version` reports 17 이상; the POM sets `maven.compiler.release` to 17. |
| Dependency download fails | Check Maven Central / proxy settings, then rerun `./mvnw compile`. |
| Tempted to switch tools | Do not replace Maven with JBang or Gradle for this workshop. |
| `copilot`을 인식하지 못함 | CLI를 설치하고 터미널을 다시 시작한 후 `copilot --version`을 확인합니다. |
| Copilot에서 인증을 요청합니다 | `copilot login`을 실행하고 브라우저 인증을 완료한 후 다시 시도합니다. |
| `npx` is not recognized | Node.js를 설치합니다 22 이상 and restart the terminal. |
| 나중에 브라우저가 시작되지 않습니다 | Edge 또는 Chrome을 설치합니다, or follow the [Playwright MCP browser configuration](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **다음 조건을 충족하면 1단계를 시작합니다:** `./mvnw compile` prints `BUILD SUCCESS`, `copilot login` 완료되고, and the
> target page opens.

Compare with
[`finished/java/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/hello-copilot-sdk)
if you want a later 참조 point after Step 1.
:::

## 자세히 알아보기

설치할 SDK의 설명서는 이 워크숍 외부에 있습니다. 다음 페이지를
1단계 전에 북마크해 두면 좋습니다.

- [GitHub Copilot SDK how-tos](https://docs.github.com/en/copilot/how-tos/copilot-sdk): GitHub's
  own SDK 설명서, including the prerequisites this preflight mirrors.
- [Copilot SDK 설명서 map](https://github.com/github/copilot-sdk/blob/main/docs/README.md):
  the index for setup, authentication, features, and troubleshooting.
- [Default setup: the bundled CLI](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md):
  how the SDK locates and starts the Copilot CLI, and how to point it at a different binary.
- [Debugging guide](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md):
  가장 먼저 확인할 자료 실행이 출력 생성 전에 실패한 경우.

:::language dotnet
- [.NET SDK 참조](https://github.com/github/copilot-sdk/blob/main/dotnet/README.md):
  패키지 설치 방법과 최소 예제 for the .NET SDK.
:::

:::language nodejs
- [Node.js SDK 참조](https://github.com/github/copilot-sdk/blob/main/nodejs/README.md):
  패키지 설치 방법과 최소 예제 for the Node.js SDK.
:::

:::language python
- [Python SDK 참조](https://github.com/github/copilot-sdk/blob/main/python/README.md):
  패키지 설치 방법과 최소 예제 for the Python SDK.
:::

:::language go
- [Go SDK 참조](https://github.com/github/copilot-sdk/blob/main/go/README.md):
  모듈 설치 방법과 최소 예제 for the Go SDK.
:::

:::language rust
- [Rust SDK 참조](https://github.com/github/copilot-sdk/blob/main/rust/README.md):
  크레이트 설치 방법과 최소 예제 for the Rust SDK.
:::

:::language java
- [Java SDK 참조](https://github.com/github/copilot-sdk/blob/main/java/README.md):
  종속성 좌표와 최소 예제 for the Java SDK.
:::

[1단계: 첫 Copilot 세션 만들기]로 계속 진행합니다.(01-first-session.md).


