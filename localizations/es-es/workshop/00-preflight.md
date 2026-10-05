# Preparación: prepara tu equipo

> **Preparación sin límite de tiempo**  
> Completa esta página antes de iniciar el taller de 115 minutos.

## Qué tendrás listo

Al terminar la preparación, tendrás el repositorio clonado, Copilot CLI autenticado, el proyecto
inicial compilado y Playwright MCP descargado y listo.

Sigue los nueve pasos prácticos, incluida la selección del modelo y el informe HTML interactivo, y
termina con una celebración y recursos para seguir creando.

:::language dotnet
## Qué necesitas

| Requisito | Por qué lo necesita el taller | Comprueba |
|---|---|---|
| [SDK de .NET 10](https://learn.microsoft.com/dotnet/core/install/) | Compila y ejecuta la aplicación de consola de C# | `dotnet --version` |
| [Node.js 22 o una versión posterior](https://nodejs.org/) | Ejecuta el servidor MCP de Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Proporciona el runtime de Copilot que usa el SDK | `copilot --version` |
| [Acceso a GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitudes de Copilot | `copilot login` |
| Microsoft Edge (predeterminado) o Google Chrome | Permite a Playwright inspeccionar la página de destino | Abre el navegador una vez antes del taller |

Tus comandos deberían devolver una salida con esta forma:

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
## Qué necesitas

| Requisito | Por qué lo necesita el taller | Comprueba |
|---|---|---|
| [Node.js 22.12 o una versión posterior](https://nodejs.org/) | Ejecuta la aplicación TypeScript del taller y Playwright MCP | `node --version` |
| [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) | Instala `@github/copilot-sdk` y herramientas de compilación | `npm --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Proporciona el runtime de Copilot que usa el SDK | `copilot --version` |
| [Acceso a GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitudes de Copilot | `copilot login` |
| Microsoft Edge (predeterminado) o Google Chrome | Permite a Playwright inspeccionar la página de destino | Abre el navegador una vez antes del taller |

Tus comandos deberían devolver una salida con esta forma:

```text
$ node --version
v22.12.x
$ npm --version
10.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Consulta la [guía oficial de instalación del SDK de Node.js](https://github.com/github/copilot-sdk/tree/main/nodejs).
:::

:::language python
## Qué necesitas

| Requisito | Por qué lo necesita el taller | Comprueba |
|---|---|---|
| [Python 3.11 o una versión posterior](https://www.python.org/downloads/) | Ejecuta la aplicación asíncrona del taller | `python --version` |
| [pip](https://pip.pypa.io/en/stable/installation/) | Instala el wheel fijado `github-copilot-sdk` | `python -m pip --version` |
| [Node.js 22 o una versión posterior](https://nodejs.org/) | Ejecuta el servidor MCP de Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Sustitución opcional del runtime local mediante `COPILOT_CLI_PATH` | `copilot --version` |
| [Acceso a GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitudes de Copilot | `copilot login` |
| Microsoft Edge (predeterminado) o Google Chrome | Permite a Playwright inspeccionar la página de destino | Abre el navegador una vez antes del taller |

Tus comandos deberían devolver una salida con esta forma:

```text
$ python --version
Python 3.11.x
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

El SDK de Python puede descargar un runtime fijado en el primer uso. Consulta la
[guía oficial de instalación del SDK de Python](https://github.com/github/copilot-sdk/tree/main/python).
:::

:::language go
## Qué necesitas

| Requisito | Por qué lo necesita el taller | Comprueba |
|---|---|---|
| [Go 1.24 o una versión posterior](https://go.dev/dl/) | Compila y ejecuta el módulo Go del taller | `go version` |
| [Node.js 22 o una versión posterior](https://nodejs.org/) | Ejecuta el servidor MCP de Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Necesario en `PATH` (o `COPILOT_CLI_PATH`) para el SDK | `copilot --version` |
| [Acceso a GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitudes de Copilot | `copilot login` |
| Microsoft Edge (predeterminado) o Google Chrome | Permite a Playwright inspeccionar la página de destino | Abre el navegador una vez antes del taller |

Tus comandos deberían devolver una salida con esta forma:

```text
$ go version
go version go1.24.x ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

Consulta la
[guía oficial de instalación del SDK de Go](https://github.com/github/copilot-sdk/tree/main/go).
:::

:::language rust
## Qué necesitas

| Requisito | Por qué lo necesita el taller | Comprueba |
|---|---|---|
| [Rust 1.94 o una versión posterior](https://rustup.rs/) | Compila el crate Rust asíncrono del taller | `rustc --version` |
| [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) | Resuelve dependencias bloqueadas y ejecuta la aplicación | `cargo --version` |
| [Node.js 22 o una versión posterior](https://nodejs.org/) | Ejecuta el servidor MCP de Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Runtime usado cuando no se depende solo de un binario incluido | `copilot --version` |
| [Acceso a GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitudes de Copilot | `copilot login` |
| Microsoft Edge (predeterminado) o Google Chrome | Permite a Playwright inspeccionar la página de destino | Abre el navegador una vez antes del taller |

Tus comandos deberían devolver una salida con esta forma:

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

Consulta la
[guía oficial de instalación del SDK de Rust](https://github.com/github/copilot-sdk/tree/main/rust).
:::

:::language java
## Qué necesitas

| Requisito | Por qué lo necesita el taller | Comprueba |
|---|---|---|
| [Java 17 o una versión posterior](https://adoptium.net/) (JDK) | Compila y ejecuta la aplicación Maven del taller | `java -version` |
| [Node.js 22 o una versión posterior](https://nodejs.org/) | Ejecuta el servidor MCP de Playwright | `node --version` |
| [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) | Necesario en `PATH` para el runtime del SDK de Java | `copilot --version` |
| [Acceso a GitHub Copilot](https://github.com/features/copilot) | Autoriza solicitudes de Copilot | `copilot login` |
| Microsoft Edge (predeterminado) o Google Chrome | Permite a Playwright inspeccionar la página de destino | Abre el navegador una vez antes del taller |

Tus comandos deberían devolver una salida con esta forma:

```text
$ java -version
openjdk version "17.x.x" ...
$ node --version
v22.x.x
$ copilot --version
GitHub Copilot CLI ...
```

No hace falta instalar Maven por separado: cada proyecto Java incluye Maven Wrapper (`./mvnw`), que
descarga la versión correcta de Maven en el primer uso. En Windows, ejecuta `mvnw.cmd` en lugar de
`./mvnw`. Usa Maven para esta ruta. No lo sustituyas por JBang ni Gradle. Consulta la
[guía oficial de instalación del SDK de Java](https://github.com/github/copilot-sdk/tree/main/java).
:::

## 1. Clona el repositorio y elige tu proyecto inicial

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Trabajas **directamente dentro del repositorio**. No hay paso de copia: cambias al directorio del
proyecto inicial de tu lenguaje y permaneces allí durante todo el taller. Eso significa que estás
editando archivos del repositorio con seguimiento, así que los cambios aparecen en `git status`. Es
lo esperado. Si quieres volver a tener un proyecto inicial limpio, ejecuta `git checkout -- .` desde
la raíz del repositorio para descartar tus cambios.

## 2. Autentica Copilot

Instala la CLI con el método de la [guía oficial de configuración](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
y, después, ejecuta:

```bash
copilot login
```

Completa el flujo del navegador para que las llamadas posteriores del SDK puedan llegar a GitHub Copilot.

## 3. Prepara Playwright MCP

Ejecuta esto una vez para descargar el paquete fijado y mostrar sus opciones sin iniciar un servidor:

```bash
npx -y @playwright/mcp@0.0.78 --help
```

La versión del paquete está fijada para que todo el mundo vea los mismos nombres de herramientas y
el mismo comportamiento. El código usa Microsoft Edge con `--browser=msedge`. Si has preparado
Google Chrome en su lugar, usa `--browser=chrome` cuando el argumento aparezca en el Paso 4.

:::language dotnet
## 4. Entra en el proyecto inicial y compílalo

Si `dotnet build` no puede encontrar Copilot CLI más adelante, define su ruta para el terminal actual:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS o Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_BINARY_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_BINARY_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Cambia al proyecto inicial de .NET y compílalo. Mantente en este directorio en todos los pasos posteriores:

```bash
cd start-accessibility/dotnet
dotnet build
```

Una compilación correcta termina con:

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

Trabajarás en `start-accessibility/dotnet` durante el resto del taller, así que mantén este terminal
aquí. Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Abre una vez la página de destino controlada para asegurarte de que puedes acceder a ella:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solución de problemas de la preparación</summary>

| Síntoma | Solución |
|---|---|
| `copilot` no se reconoce | Reinicia el terminal después de la instalación, o define `COPILOT_CLI_BINARY_PATH` con el comando anterior. |
| Copilot te pide que te autentiques | Ejecuta `copilot login`, completa el flujo en el navegador y vuelve a intentarlo. |
| La restauración de NuGet no puede acceder al origen del paquete | Comprueba la configuración del proxy o del origen de paquetes y ejecuta `dotnet restore`. |
| `npx` no se reconoce | Instala Node.js 22 o posterior y reinicia el terminal. |
| El navegador no puede iniciarse más adelante | Instala Edge o Chrome, o sigue la [configuración del navegador de Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicia el Paso 1 cuando:** `dotnet build` se complete correctamente, `copilot login` se haya completado y la página de destino
> se abra.
:::

:::language nodejs
## 4. Entra en el proyecto inicial y compílalo

Si el SDK no puede encontrar Copilot CLI más adelante, indícale la ubicación de tu instalación en el terminal actual:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS o Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Cambia al proyecto inicial de Node.js, instala las dependencias y ejecuta la comprobación de tipos.
Mantente en este directorio en todos los pasos posteriores:

```bash
cd start-accessibility/nodejs
npm install
npm run build
```

Una comprobación de tipos correcta termina sin errores de TypeScript (salida vacía de
`tsc --noEmit`). El script de inicio de `package.json` es `tsx src/index.ts`.

Trabajarás en `start-accessibility/nodejs` durante el resto del taller, así que mantén este terminal
aquí. Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Abre una vez la página de destino controlada para asegurarte de que puedes acceder a ella:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solución de problemas de la preparación</summary>

| Síntoma | Solución |
|---|---|
| `node` o `npm` no se reconocen | Instala Node.js 22.12 o posterior y reinicia el terminal. |
| Advertencia del motor sobre la versión de Node | Actualiza a Node.js 22.12+; el proyecto inicial declara `"node": ">=22.12.0"`. |
| `npm install` falla con el archivo de bloqueo | Quédate en `start-accessibility/nodejs` y conserva `package-lock.json`; no lo elimines. |
| `copilot` no se reconoce | Reinicia el terminal después de la instalación, o define `COPILOT_CLI_PATH` con el comando anterior. |
| Copilot te pide que te autentiques | Ejecuta `copilot login`, completa el flujo en el navegador y vuelve a intentarlo. |
| `npx` no puede descargar Playwright MCP | Comprueba el acceso de red y vuelve a ejecutar el comando de preparación de la sección 3. |
| El navegador no puede iniciarse más adelante | Instala Edge o Chrome, o sigue la [configuración del navegador de Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicia el Paso 1 cuando:** `npm run build` se complete correctamente, `copilot login` se haya completado y la página de destino
> se abra.
:::

:::language python
## 4. Entra en el proyecto inicial y compílalo

Opcional: fuerza al SDK a usar la CLI que tienes instalada en lugar de descargar un runtime:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS o Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Cambia al proyecto inicial de Python, crea un entorno virtual, instala los requisitos fijados y
ejecuta la comprobación de compilación. Mantente en este directorio en todos los pasos posteriores:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Create the Python virtual environment">
    <button type="button" role="tab" aria-selected="true" data-tab="venv-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="venv-unix">macOS o Linux</button>
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

Una instalación correcta muestra los paquetes resueltos, incluido `github-copilot-sdk==...`. Una
comprobación de compilación correcta no muestra ninguna salida. Mantén activado el entorno virtual
para los pasos posteriores.

Trabajarás en `start-accessibility/python` durante el resto del taller, así que mantén este terminal
aquí. Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Opcionalmente, descarga previamente el runtime ahora para que la primera ejecución del Paso 1 sea más rápida:

```bash
python -m copilot download-runtime
```

Abre una vez la página de destino controlada para asegurarte de que puedes acceder a ella:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solución de problemas de la preparación</summary>

| Síntoma | Solución |
|---|---|
| `python` apunta a Python 2 o falta | Usa Python 3.11+ (`python3` en macOS/Linux) y vuelve a crear el venv. |
| `pip install` no puede acceder a PyPI | Comprueba la configuración del proxy y vuelve a ejecutar `python -m pip install -r requirements.txt`. |
| Versiones de paquete incorrectas | Instala solo desde el `requirements.txt` fijado; no flexibilices las fijaciones `==`. |
| La descarga del runtime falla más adelante | Ejecuta `python -m copilot download-runtime`, o define `COPILOT_CLI_PATH` con una CLI funcional. |
| Copilot te pide que te autentiques | Ejecuta `copilot login`, completa el flujo en el navegador y vuelve a intentarlo. |
| `npx` no se reconoce | Instala Node.js 22 o posterior y reinicia el terminal. |
| El navegador no puede iniciarse más adelante | Instala Edge o Chrome, o sigue la [configuración del navegador de Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicia el Paso 1 cuando:** los requisitos fijados se instalen, `py_compile` se complete correctamente, `copilot login` se haya
> completado y la página de destino se abra.
:::

:::language go
## 4. Entra en el proyecto inicial y compílalo

El SDK de Go espera encontrar Copilot CLI en `PATH`, o mediante `COPILOT_CLI_PATH`:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS o Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Cambia al proyecto inicial de Go y compílalo con el bloqueo aplicado. Mantente en este directorio en
todos los pasos posteriores:

```bash
cd start-accessibility/go
go build -mod=readonly ./...
```

Una compilación correcta no muestra errores y genera un binario en el directorio del proyecto
inicial. Mantén `go.sum` intacto para que la resolución de módulos siga siendo determinista.

Trabajarás en `start-accessibility/go` durante el resto del taller, así que mantén este terminal
aquí. Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Abre una vez la página de destino controlada para asegurarte de que puedes acceder a ella:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solución de problemas de la preparación</summary>

| Síntoma | Solución |
|---|---|
| `go: go.mod requires go >= 1.24` | Instala Go 1.24 o posterior y vuelve a abrir el terminal. |
| `missing go.sum entry` | Restaura el `go.sum` incluido en el repositorio; compila con `-mod=readonly` en lugar de reescribir el bloqueo. |
| Descarga de módulos bloqueada | Configura `GOPROXY`/el acceso mediante proxy y vuelve a intentar la compilación desde el directorio del proyecto inicial. |
| `copilot` no se reconoce | Instala la CLI, reinicia el terminal o define `COPILOT_CLI_PATH`. |
| Copilot te pide que te autentiques | Ejecuta `copilot login`, completa el flujo en el navegador y vuelve a intentarlo. |
| `npx` no se reconoce | Instala Node.js 22 o posterior y reinicia el terminal. |
| El navegador no puede iniciarse más adelante | Instala Edge o Chrome, o sigue la [configuración del navegador de Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicia el Paso 1 cuando:** `go build -mod=readonly ./...` se complete correctamente, `copilot login` se haya completado y
> la página de destino se abra.

Compara con [`finished/go/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/go/hello-copilot-sdk)
si quieres tener un punto de referencia posterior después del Paso 1.
:::

:::language rust
## 4. Entra en el proyecto inicial y compílalo

Si el inicio del runtime no puede encontrar la CLI más adelante, define `COPILOT_CLI_PATH`:

<div class="workshop-tabs" data-tabs>
  <div role="tablist" aria-label="Set the Copilot CLI path">
    <button type="button" role="tab" aria-selected="true" data-tab="cli-windows">Windows</button>
    <button type="button" role="tab" aria-selected="false" data-tab="cli-unix">macOS o Linux</button>
  </div>
  <div role="tabpanel" data-panel="cli-windows">
    <pre><code class="language-powershell">$env:COPILOT_CLI_PATH = (Get-Command copilot).Source</code></pre>
  </div>
  <div role="tabpanel" data-panel="cli-unix" hidden>
    <pre><code class="language-bash">export COPILOT_CLI_PATH="$(command -v copilot)"</code></pre>
  </div>
</div>

Cambia al proyecto inicial de Rust y compruébalo con el archivo de bloqueo. Mantente en este
directorio para todos los pasos posteriores:

```bash
cd start-accessibility/rust
cargo check --locked
```

Una comprobación correcta termina con una línea `Finished` y sin errores. Mantén `Cargo.lock` en el
repositorio para que el grafo de crates siga fijado.

Trabajarás en `start-accessibility/rust` durante el resto del taller, así que mantén este terminal
aquí. Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Abre una vez la página de destino controlada para asegurarte de que puedes acceder a ella:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solución de problemas de la preparación</summary>

| Síntoma | Solución |
|---|---|
| `rustc 1.xx is too old` | Instala Rust 1.94+ con `rustup update` y vuelve a abrir el terminal. |
| El archivo de bloqueo no coincide con `--locked` | Conserva el `Cargo.lock` del proyecto inicial; no ejecutes `cargo update` sin restricciones. |
| Descarga de crates bloqueada | Comprueba el acceso de red/proxy a crates.io y vuelve a intentar `cargo check`. |
| El runtime no puede iniciarse más adelante | Instala y autentica `copilot`, o define `COPILOT_CLI_PATH`. |
| Copilot te pide que te autentiques | Ejecuta `copilot login`, completa el flujo en el navegador y vuelve a intentarlo. |
| `npx` no se reconoce | Instala Node.js 22 o posterior y reinicia el terminal. |
| El navegador no puede iniciarse más adelante | Instala Edge o Chrome, o sigue la [configuración del navegador de Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicia el Paso 1 cuando:** `cargo check --locked` se complete correctamente, `copilot login` se haya completado y la
> página de destino se abra.

Compara con [`finished/rust/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/rust/hello-copilot-sdk)
si quieres tener un punto de referencia posterior después del Paso 1.
:::

:::language java
## 4. Entra en el proyecto inicial y compílalo

El SDK de Java espera encontrar Copilot CLI en `PATH` cuando se inicia la aplicación. Confírmalo
antes de compilar:

```bash
copilot --version
```

Cambia al proyecto inicial de Java y compílalo con Maven. Mantente en este directorio en todos los pasos posteriores:

```bash
cd start-accessibility/java
./mvnw compile
```

Una compilación correcta termina con:

```text
[INFO] BUILD SUCCESS
```

El `pom.xml` ya configura `exec-maven-plugin` con `mainClass` `workshop.AccessibilityReport`.
Mantente con Maven en este recorrido.

Trabajarás en `start-accessibility/java` durante el resto del taller, así que mantén este terminal
aquí. Desde esta carpeta, escribe `code .` para abrirla en VS Code, o abre la carpeta en tu editor
favorito.

Abre una vez la página de destino controlada para asegurarte de que puedes acceder a ella:

```text
{{TARGET_APP_URL}}
```

<details>
<summary>Solución de problemas de la preparación</summary>

| Síntoma | Solución |
|---|---|
| `java` no se reconoce | Instala JDK 17+ y reinicia el terminal. |
| `./mvnw: Permission denied` | Ejecuta `chmod +x mvnw`, o usa `sh mvnw` en su lugar. En Windows, usa `mvnw.cmd`. |
| Errores de versión de destino del compilador | Confirma que `java -version` informa de 17 o posterior; el POM establece `maven.compiler.release` en 17. |
| Falla la descarga de dependencias | Comprueba Maven Central/la configuración del proxy y vuelve a ejecutar `./mvnw compile`. |
| Tentación de cambiar de herramienta | No sustituyas Maven por JBang ni Gradle para este taller. |
| `copilot` no se reconoce | Instala la CLI, reinicia el terminal y verifica `copilot --version`. |
| Copilot te pide que te autentiques | Ejecuta `copilot login`, completa el flujo en el navegador y vuelve a intentarlo. |
| `npx` no se reconoce | Instala Node.js 22 o posterior y reinicia el terminal. |
| El navegador no puede iniciarse más adelante | Instala Edge o Chrome, o sigue la [configuración del navegador de Playwright MCP](https://github.com/microsoft/playwright-mcp#configuration). |

</details>

> **Inicia el Paso 1 cuando:** `./mvnw compile` imprima `BUILD SUCCESS`, `copilot login` se haya completado y la
> página de destino se abra.

Compara con [`finished/java/hello-copilot-sdk`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/java/hello-copilot-sdk)
si quieres tener un punto de referencia posterior después del Paso 1.
:::

## Más información

El SDK que vas a instalar está documentado fuera de este taller. Estas páginas son las que merece la
pena guardar en marcadores antes del Paso 1.

- [Procedimientos del GitHub Copilot SDK](https://docs.github.com/en/copilot/how-tos/copilot-sdk): documentación del SDK
  propia de GitHub, incluidos los requisitos previos que replica esta preparación.
- [Mapa de documentación de Copilot SDK](https://github.com/github/copilot-sdk/blob/main/docs/README.md):
  el índice de configuración, autenticación, características y solución de problemas.
- [Configuración predeterminada: la CLI incluida](https://github.com/github/copilot-sdk/blob/main/docs/setup/bundled-cli.md):
  cómo el SDK localiza e inicia Copilot CLI, y cómo apuntarlo a un binario diferente.
- [Guía de depuración](https://github.com/github/copilot-sdk/blob/main/docs/troubleshooting/debugging.md):
  el primer lugar donde mirar cuando una ejecución falla antes de producir ninguna salida.

:::language dotnet
- [Referencia del SDK de .NET](https://github.com/github/copilot-sdk/blob/main/dotnet/README.md):
  instalación del paquete y un ejemplo mínimo para el SDK de .NET.
:::

:::language nodejs
- [Referencia del SDK de Node.js](https://github.com/github/copilot-sdk/blob/main/nodejs/README.md):
  instalación del paquete y un ejemplo mínimo para el SDK de Node.js.
:::

:::language python
- [Referencia del SDK de Python](https://github.com/github/copilot-sdk/blob/main/python/README.md):
  instalación del paquete y un ejemplo mínimo para el SDK de Python.
:::

:::language go
- [Referencia del SDK de Go](https://github.com/github/copilot-sdk/blob/main/go/README.md):
  instalación del módulo y un ejemplo mínimo para el SDK de Go.
:::

:::language rust
- [Referencia del SDK de Rust](https://github.com/github/copilot-sdk/blob/main/rust/README.md):
  instalación del crate y un ejemplo mínimo para el SDK de Rust.
:::

:::language java
- [Referencia del SDK de Java](https://github.com/github/copilot-sdk/blob/main/java/README.md):
  coordenadas de dependencia y un ejemplo mínimo para el SDK de Java.
:::

Continúa con [Paso 1: Crea tu primera sesión de Copilot](01-first-session.md).
