# Preparación: prepárate para SDK 101

> **Tiempo:** Preparación sin límite de tiempo, antes del taller de 30 minutos

## Qué vas a crear

Empieza con un Hello World en streaming y conviértelo después en un pequeño asistente de lanzamiento
para The GitHub Podcast. Tú escribes la conexión del SDK y la configuración de sesión; el proyecto
inicial ya incluye herramientas de búsqueda de episodios y auxiliares de selección en terminal.

Las cuatro lecciones cronometradas suman **30 minutos**: conceptos básicos del SDK (5), Hello World
en streaming (10), agente de pódcast (12) y resumen (3). Completa la instalación, la autenticación y
las descargas de dependencias de antemano para que la sesión siga centrada en el SDK.

## Comprueba tu acceso

Necesitas Git, un editor, un terminal, acceso a la red y una suscripción o prueba activa de GitHub
Copilot con acceso a un modelo compatible. Instala
[Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli), y luego
ejecuta estos comandos en el terminal:

```shell
git --version
copilot --version
copilot auth login
```

Completa el inicio de sesión en el navegador si se solicita. Usa la misma cuenta y el mismo entorno
de terminal para el taller. No pegues tokens en los archivos de código fuente. El ejemplo de pódcast
también necesita acceso al [feed RSS oficial](https://feeds.simplecast.com/ioCY0vfY).

## Obtén el proyecto inicial

Los seis proyectos iniciales de SDK 101 y sus auxiliares ya preparados están incluidos en
`start-intro/` en **este repositorio del taller**. Clónalo una vez:

```shell
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
```

Si ya clonaste este repositorio, usa esa copia local; no clones otro repositorio ni copies un
proyecto inicial. Elige solo un lenguaje a continuación. Todos los comandos empiezan desde la raíz
de este repositorio. Instala solo el entorno de ejecución de ese lenguaje. Mantén las versiones de
las dependencias existentes; no necesitas generar la estructura de un proyecto ni instalar el SDK de
nuevo.

Cada carpeta de lenguaje también contiene **`LIVE_DEMO.md`**. Ábrelo junto al punto de entrada.
Durante la sesión cronometrada, haz las cuatro ediciones numeradas del primer acto, ejecuta Hello
World y continúa con el segundo acto en el mismo archivo y la misma aplicación.

:::language dotnet
### Prepara .NET

Instala el [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/).

```shell
dotnet --version
cd start-intro/dotnet
dotnet restore
```

Abre `start-intro/dotnet` en el editor (`code .` para VS Code). El punto de entrada es `Program.cs`.
Más adelante ejecutarás `dotnet run` desde esta carpeta.

Consulta el [README del proyecto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/README.md)
para descubrir la CLI, incluido `COPILOT_CLI_BINARY_PATH` si se bloquea la descarga del runtime
incluido.
:::

:::language nodejs
### Prepara Node.js

Instala [Node.js 22.12 o una versión posterior](https://nodejs.org/).

```shell
node --version
cd start-intro/nodejs
npm ci
```

Abre `start-intro/nodejs` en el editor (`code .` para VS Code). El punto de entrada es
`src/index.ts`. Más adelante ejecutarás `npm start` desde esta carpeta.

Consulta el [README del proyecto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/README.md).
:::

:::language python
### Prepara Python

Instala [Python 3.11 o una versión posterior](https://www.python.org/downloads/). Usa un entorno
aislado. En Windows PowerShell:

```powershell
python --version
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

En macOS/Linux:

```bash
python3 --version
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Abre `start-intro/python` en el editor (`code .` para VS Code). El punto de entrada es `main.py`. En
las lecciones usamos directamente el intérprete del entorno, así que no hace falta activar nada ni
cambiar la directiva de ejecución de PowerShell.

Consulta el [README del proyecto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/README.md).
:::

:::language go
### Prepara Go

Instala [Go 1.24 o una versión posterior](https://go.dev/dl/).

```shell
go version
cd start-intro/go
go mod download
```

Abre `start-intro/go` en el editor (`code .` para VS Code). El punto de entrada es `main.go`. Más
adelante ejecutarás `go run .` desde esta carpeta.

Consulta el [README del proyecto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/README.md).
:::

:::language java
### Prepara Java

Instala [Java 17 o una versión posterior](https://adoptium.net/). No hace falta instalar Maven por
separado: el proyecto inicial incluye Maven Wrapper (`./mvnw`), que descarga la versión correcta de
Maven en el primer uso. En Windows, ejecuta `mvnw.cmd` en lugar de `./mvnw`.

```shell
java --version
cd start-intro/java
./mvnw dependency:go-offline
```

Abre `start-intro/java` en el editor (`code .` para VS Code). El punto de entrada es
`src/main/java/demo/CopilotSdkLiveDemo.java`. Más adelante ejecutarás `./mvnw compile exec:java`
desde esta carpeta.

Consulta el [README del proyecto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/README.md).
:::

:::language rust
### Prepara Rust

Instala [Rust 1.94 o una versión posterior](https://rustup.rs/). En Windows, la cadena de
herramientas MSVC predeterminada también necesita las herramientas de compilación de C++ y el
Windows SDK que se describen en la
[guía de instalación de Rust](https://doc.rust-lang.org/book/ch01-01-installation.html). Completa
esa configuración antes de la sesión.

```shell
rustc --version
cd start-intro/rust
cargo fetch --locked
cargo check --locked
```

Abre `start-intro/rust` en el editor (`code .` para VS Code). El punto de entrada es `src/main.rs`.
Más adelante ejecutarás `cargo run --locked` desde esta carpeta. La comprobación previa calienta la
caché de compilación; reserva tiempo de preparación adicional para la primera compilación de
dependencias de Rust.

Consulta el [README del proyecto inicial](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/README.md).
:::

## Comprobación de preparación

Estás listo cuando la autenticación se haya completado, las dependencias se hayan descargado y el
punto de entrada seleccionado esté abierto en el editor. El punto de entrada sin tocar está
**incompleto a propósito**: los marcadores de posición pueden no compilar o imprimir un mensaje de
autenticación sin comprobar tu inicio de sesión real. No lo consideres una aplicación que funcione.
La lección de Hello World los completa.

Deja sin cambios los archivos auxiliares del proyecto inicial. Harás crecer el proyecto directamente
dentro de `start-intro/`; tus ediciones aparecerán en `git status`, lo cual es lo esperado.

## Solución de problemas antes de la sesión

- **No se encuentra la CLI:** termina la instalación de la CLI y vuelve a abrir el terminal. Sigue
  el README del proyecto inicial de tu lenguaje si el SDK no puede localizar el ejecutable nativo.
- **El inicio de sesión falla:** comprueba tu suscripción, la directiva de la organización y la cuenta
  del navegador antes de la sesión. Un inicio de sesión correcto por sí solo no garantiza el acceso al modelo.
- **La descarga de dependencias falla:** resuelve ahora el acceso al proxy o al registro de paquetes.
  No sustituyas dependencias ancladas por versiones del SDK no relacionadas.
- **El canal RSS está bloqueado:** resuelve el acceso al canal oficial antes de la lección
  del pódcast. No sustituyas los datos de episodio por datos inventados.

Continúa con [Conceptos básicos del SDK](intro-01-sdk-basics.md).

## Más información

- [Proyectos iniciales de introducción incluidos](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
- [Copilot SDK oficial](https://github.com/github/copilot-sdk)
