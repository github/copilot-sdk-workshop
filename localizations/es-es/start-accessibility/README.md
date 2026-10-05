# Proyectos iniciales del taller

Elige el directorio del lenguaje seleccionado en la página principal del taller y trabaja
directamente dentro de él. No hay ningún paso de copia. Cambia a ese directorio, abre la misma
carpeta en tu editor (`code .` desde dentro de ella, o el comando de abrir carpeta de cualquier otro
editor) y quédate ahí para todos los comandos. Los proyectos iniciales son andamiajes mínimos de
forma intencionada. El catálogo de Web Content Accessibility Guidelines (WCAG) propio de la
aplicación y los auxiliares de permisos y lector de instantáneas con ámbito pueden estar presentes
para lecciones posteriores, pero sus puntos de entrada ejecutables no conectan un cliente de
Copilot, una sesión, un flujo de streaming, una herramienta local, un servidor MCP ni un informe
hasta el paso correspondiente.

| Lenguaje | Requisito previo | Cambia de directorio y verifica |
|---|---|---|
| .NET | [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/) | `cd start-accessibility/dotnet && dotnet build` |
| Node.js | [Node.js 22+](https://nodejs.org/) | `cd start-accessibility/nodejs && npm install && npm run build` |
| Python | [Python 3.11+](https://www.python.org/downloads/) | `cd start-accessibility/python && python -m pip install -r requirements.txt && python -m py_compile *.py` |
| Go | [Go 1.24+](https://go.dev/dl/) | `cd start-accessibility/go && go build -mod=readonly ./...` |
| Rust | [Rust 1.94+](https://rustup.rs/) | `cd start-accessibility/rust && cargo check --locked` |
| Java | [Java 17+](https://adoptium.net/) (Maven Wrapper incluido) | `cd start-accessibility/java && ./mvnw compile` |

Como editas estos archivos en su ubicación, tu trabajo aparece en `git status`. Es lo esperado.
Ejecuta `git checkout -- .` desde la raíz del repositorio para restaurar un proyecto inicial limpio.
Las rutas de Go, Rust y Java requieren
[GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli) en
`PATH` cuando ejecutes la aplicación más adelante. La configuración del SDK y las referencias de API
están disponibles en el [repositorio oficial de Copilot SDK](https://github.com/github/copilot-sdk)
y el [cookbook](https://github.com/github/copilot-sdk/tree/main/cookbook).

Permanece en el directorio de tu proyecto inicial durante todo el taller. Vuelve al visor
interactivo desde la [página principal del taller](../README.md#inicia-el-taller); no abras
directamente el Markdown de la lección.
