# Talleres de GitHub Copilot SDK

Empieza hoy: http://github.github.com/copilot-sdk-workshop/

Elige uno de los tres talleres prácticos de GitHub Copilot SDK en .NET, Node.js/TypeScript, Python,
Go, Rust o Java:

- **SDK 101 (30 minutos):** empieza con un Hello World en streaming, luego crea un pequeño agente de pódcast
  usando herramientas RSS ya preparadas del
  [proyecto inicial introductorio incluido](start-intro/README.md).
- **Accessibility Reviewer:** crea una herramienta de desarrollo para SDLC que inspecciona una página web, consulta
  una guía WCAG propia de la aplicación y genera un informe basado en evidencias.
- **Museum Exhibit Studio:** crea un conservador ajeno al SDLC que transforma hechos aprobados por educadores en
  texto de exposición listo para visitantes, opcionalmente enriquecido con investigación citada de Wikipedia mediante una
  consulta local, con límites de capacidades deterministas.

Empieza por SDK 101 si es la primera vez que usas el SDK. A lo largo de los talleres introductorios y más avanzados, harás lo siguiente:

1. Crea un cliente de Copilot y una sesión de conversación.
2. Separa la política duradera del agente de los datos específicos de la tarea.
3. Elige entre herramientas locales y herramientas MCP con listas de permitidos de herramientas de ámbito estricto.
4. Impón límites de capacidad, entrada, tiempo de espera, validación y ciclo de vida en el código de la aplicación.
5. Explica qué puede inferir el modelo y qué debe demostrar la aplicación.

SDK 101 tiene exactamente 30 minutos de lecciones guiadas. Calcula unos 115 minutos para
Accessibility Reviewer o 90 minutos para Museum Exhibit Studio. La configuración del equipo, la
autenticación y las descargas de dependencias se realizan aparte en una preparación no cronometrada
para cada taller. Los dos talleres más avanzados incluyen sus lecciones HTML interactivas y terminan
con una celebración y recursos.

## Inicia el taller

Abre la URL de GitHub Pages que genera el flujo de trabajo **Deploy to GitHub Pages** del
repositorio. Elige un resultado del taller, elige un lenguaje y después inicia el taller
seleccionado. El sitio deriva su URL base de Pages en tiempo de ejecución, así que no hay ningún
nombre de host de Pages de organización o usuario codificado de forma rígida.

Para previsualizar el sitio desde un clon:

```bash
git clone https://github.com/github/copilot-sdk-workshop.git
cd copilot-sdk-workshop
python3 -m http.server 8000
```

Abre <http://localhost:8000/docs/>. No abras `step.html` con una URL `file://`; los navegadores
bloquean las solicitudes Markdown que usa el visor de lecciones.

## Taller en tu idioma

Este taller proporciona varios lenguajes en tu configuración regional:

[English](../../README.md) | [한국어](../ko-kr/README.md) | [日本語](../ja-jp/README.md) | [Português (Brasil)](../pt-br/README.md) | Español | [Français](../fr-fr/README.md) | [Deutsch](../de-de/README.md)

Si quieres añadir compatibilidad con más idiomas, añade más configuraciones regionales a
[`docs/locale-registry.js`](../../docs/locale-registry.js) y después añade documentos localizados en
el directorio `localizations/`.

## Requisitos previos

Instala el entorno de ejecución del lenguaje que elijas, no los seis. La preparación de cada
itinerario proporciona los requisitos aplicables; SDK 101 para Node.js requiere la versión 22.12 o
posterior, y su proyecto inicial de Java también requiere Maven 3.9 o posterior.

- [.NET 10 SDK](https://learn.microsoft.com/dotnet/core/install/)
- [Node.js 22 o posterior](https://nodejs.org/)
- [Python 3.11 o posterior](https://www.python.org/downloads/)
- [Go 1.24 o posterior](https://go.dev/dl/)
- [Rust 1.94 o posterior](https://rustup.rs/)
- [Java 17 o posterior](https://adoptium.net/)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- Suscripción o prueba de GitHub Copilot
- Microsoft Edge (predeterminado del taller) o Google Chrome para ejercicios basados en navegador

La preparación recorre las comprobaciones de instalación, la autenticación, los comandos específicos
del sistema operativo, la salida esperada y la solución de problemas.

## Estructura del repositorio

```text
copilot-sdk-workshop/
|-- docs/                         GitHub Pages site and controlled target page
|-- workshop/                     SDK 101, two deeper tracks, and completion resources
|-- start-intro/                  SDK 101 starters and podcast helpers in all six languages
|-- start-accessibility/          Accessibility Reviewer starters in all six languages
|-- start-museum/                 Museum Exhibit Studio starters in all six languages
|-- finished/dotnet/
|   |-- hello-copilot-sdk/        Completed local-tool example in every language
|   |-- accessibility-report/     Completed .NET local + MCP reporter
|   `-- museum-exhibit-studio/    Museum curator with application-owned fact and research lookups
|-- finished/nodejs/              Completed TypeScript projects
|-- finished/python/              Completed Python projects
|-- finished/go/                  Completed Go projects
|-- finished/rust/                Completed Rust projects
|-- finished/java/                Completed Maven Java projects
|-- src/BlazorApp/                Source counterpart of the deployed target
|-- localizations/<locale>/       Translated lessons mirroring the source layout
|-- scripts/                      Deterministic content and build validation
`-- .github/workflows/            Validation and Pages deployment
```

## Valida un cambio

```bash
bash scripts/validate-workshop.sh
```

El comando comprueba la estructura de las lecciones, los enlaces internos, los hooks de
comportamiento del sitio, la cobertura de proyectos y el presupuesto exacto de 30 minutos de las
lecciones del itinerario introductorio. También aplica las lecciones de museo a cada proyecto
inicial de museo y comprueba que el resultado sea el punto de entrada terminado. Después ejecuta
pruebas de selección de idioma, flujo del sitio y finalización independientes del navegador, y
restaura, compila o comprueba la sintaxis de cada proyecto inicial de introducción, accesibilidad y
museo, cada proyecto terminado y el destino de Blazor sin autenticar Copilot, iniciar un navegador
ni enviar un prompt. Los proyectos de museo no incluyen pruebas, mocks ni fixtures, por lo que sus
destinos solo se restauran y compilan.

Pasa un identificador de lenguaje para ejecutar un único destino de compilación de prueba de humo:

```bash
bash scripts/validate-workshop.sh nodejs
```

Las pull requests ejecutan la validación de contenido y las compilaciones de prueba de humo de los
seis lenguajes como trabajos de GitHub Actions separados, de modo que un fallo identifica el
itinerario del SDK afectado.

## Taller de SDK 101

Empieza en [`workshop/intro-00-preflight.md`](workshop/intro-00-preflight.md). Instala el entorno de
ejecución elegido, autentica Copilot y descarga las dependencias **antes** de la sesión
cronometrada. Las cuatro lecciones guiadas son conceptos básicos del SDK (5 minutos), Hello World en
streaming (10 minutos), un agente de pódcast (12 minutos) y resumen (3 minutos).

Los alumnos clonan este repositorio una vez y editan el punto de entrada en
[`start-intro/<language>`](start-intro/README.md). El proyecto inicial incluye todos los archivos
fuente, manifiestos de dependencias, archivos de bloqueo y auxiliares ya preparados para consultas
RSS, selección de modelo y episodio, y aprobación interactiva de herramientas. No se requiere clonar
un segundo repositorio ni un taller más largo.

Abre `LIVE_DEMO.md` junto al punto de entrada del proyecto inicial. El taller práctico sigue las
**cuatro ediciones de Hello World** de la demo de origen: inicia el cliente, comprueba la
autenticación, crea la sesión y envía un mensaje. Continúa con el **segundo acto** en la misma
aplicación para elegir un modelo y un episodio, conceder capacidades y reemplazar el prompt. El
sitio web representa esas secciones de la guía local directamente, así que la guía del editor y el
taller en línea enseñan el mismo código.

El itinerario cubre el ciclo de vida de cliente/sesión, streaming, registro de herramientas locales,
un mensaje del sistema centrado y permisos. MCP, la validación automatizada de salidas y los
proyectos finales HTML pertenecen a los talleres más avanzados. Revisa el texto de pódcast generado
con respecto a su fuente antes de publicarlo.

## Taller de Museum Exhibit Studio

Los proyectos iniciales de Museum Exhibit Studio están en `start-museum/<language>`, con referencias
completas en `finished/<language>/museum-exhibit-studio`. Cada proyecto inicial incluye un único
módulo auxiliar de conservador ya preparado que los alumnos nunca editan: conjuntos de hechos
aprobados, sus límites y el menú de selección de hechos, una utilidad de impresión en streaming,
validación determinista de exposiciones, el servidor MCP de Wikipedia con ámbito limitado y su
controlador de permisos que deniega de forma predeterminada, el permiso de escritura del archivo
único `exhibit.html`, los mensajes del sistema del conservador y de investigación (en su propio
archivo auxiliar), el texto fijo del prompt (estructura de la exposición, solicitud de
investigación, requisitos de página) y el mensaje de error que imprime el punto de entrada.

Los alumnos trabajan directamente en `start-museum/<language>` y hacen crecer ese único proyecto a
lo largo de las lecciones, ejecutándolo en cada paso. Escriben el código del SDK: la configuración
de sesión, el registro de herramientas y las tres configuraciones de sesión (cada una instala un
mensaje del sistema ya preparado en modo de reemplazo), las instrucciones de los prompts de
exposición y de página, y un ejecutor de sesión que controla el ciclo de vida y el tiempo de espera.
La muestra terminada es aquello con lo que acaba un alumno, no una arquitectura de referencia
aparte.

Cada lugar donde un alumno escribe código es una región con nombre en el punto de entrada del
proyecto inicial, delimitada por dos comentarios marcadores cuya línea `BEGIN` enumera los pasos que
la modifican:

```text
>>> BEGIN generation-config | Step 4: INSERT | Step 6: REPLACE
<<< END generation-config
```

Cada bloque de código de una lección se introduce con una línea como ``**REPLACE** region
`generation-config` in `Program.cs`:`` y contiene el contenido completo de esa región. INSERT
rellena una región vacía; REPLACE sobrescribe lo que un paso anterior puso ahí. Las líneas
marcadoras nunca se mueven, y ninguna lección reemplaza el archivo completo. La validación de
contenido aplica cada bloque de lección al proyecto inicial y exige que el resultado sea igual al
punto de entrada terminado, por lo que una lección no puede desviarse de la aplicación terminada.
Cuando cambies el código de una lección de museo, cambia el punto de entrada terminado para que
coincida, y a la inversa.

El itinerario orientado al alumno empieza en
[`workshop/museum-00-preflight.md`](workshop/museum-00-preflight.md), después recorre siete pasos —
primera sesión, streaming, voz del conservador, hechos aprobados, comprobaciones estructurales e
investigación con Wikipedia MCP, seguido de un proyecto final interactivo `exhibit.html` — y termina
con [celebración y recursos](workshop/museum-09-complete.md).

Cuando existe investigación citada utilizable, el conservador llama a `approved_fact_lookup` y a la
herramienta de solo lectura `approved_wikipedia_fact_lookup` antes de escribir la narrativa y las
preguntas para visitantes. La segunda herramienta devuelve investigación capturada, no acceso en
directo a Wikipedia ni hechos verificados por personas. Los hechos aprobados tienen prioridad, y la
investigación rechazada, fallida o sin citas mantiene la ruta de generación con una sola
herramienta. La validación estructural no demuestra la fundamentación factual; revisa las
afirmaciones investigadas antes de publicar.

Las comprobaciones de Rust comparten un único directorio de destino de Cargo en todos los proyectos
del taller, lo que evita recompilar repetidamente las dependencias del SDK.

## Despliegue

Cuando la validación pase, haz push a `main`. El
[flujo de trabajo de Pages](../../.github/workflows/deploy.yml) publica `docs/` junto con las
lecciones Markdown de `workshop/` y sus traducciones en `localizations/`. La validación de
compilación y contenido se ejecuta por separado en el flujo de trabajo de validación.

Habilita GitHub Pages en la configuración del repositorio y elige **GitHub Actions** como origen. El
trabajo de despliegue informa de la URL canónica del taller en su entorno.

El flujo de trabajo de despliegue comprueba cada página HTML publicada, recurso del sitio y lección
Markdown. Comprueba la URL que devuelve GitHub Pages de forma predeterminada. Para validar en su
lugar un dominio público futuro o personalizado, establece la variable de Actions del repositorio
`WORKSHOP_SITE_URL` en la URL base de ese sitio. Puedes ejecutar la misma comprobación manualmente:

```bash
WORKSHOP_SITE_URL=https://workshop.example.com/ python3 scripts/validate_deployment.py
```

## Referencias

- [GitHub Copilot SDK para .NET](https://github.com/github/copilot-sdk/tree/main/dotnet)
- [GitHub Copilot SDK para Node.js/TypeScript](https://github.com/github/copilot-sdk/tree/main/nodejs)
- [GitHub Copilot SDK para Python](https://github.com/github/copilot-sdk/tree/main/python)
- [GitHub Copilot SDK para Go](https://github.com/github/copilot-sdk/tree/main/go)
- [GitHub Copilot SDK para Rust](https://github.com/github/copilot-sdk/tree/main/rust)
- [GitHub Copilot SDK para Java](https://github.com/github/copilot-sdk/tree/main/java)
- [Recetario de Copilot SDK](https://github.com/github/copilot-sdk/tree/main/cookbook)
- [API y código fuente de Copilot SDK](https://github.com/github/copilot-sdk)
- [Instalar GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Licencia

Este proyecto se distribuye bajo la [licencia MIT](../../LICENSE).

Este taller se proporciona tal cual con fines educativos. Está pensado para demostrar conceptos y
patrones en lugar de servir como un servicio de producción completo.
