# Proyectos iniciales de SDK 101

Aquí están los proyectos iniciales completos para el taller SDK 101 de 30 minutos. Clona **este
repositorio del taller una sola vez**, elige un lenguaje y edita su punto de entrada en su
ubicación. No hay ningún repositorio aparte que clonar ni proyecto que copiar.

| Lenguaje | Requisito previo | Notas del proyecto inicial | Guía de demostración | Punto de entrada |
| --- | --- | --- | --- | --- |
| .NET | .NET 10 SDK | [Configuración](dotnet/README.md) | [LIVE_DEMO](dotnet/LIVE_DEMO.md) | `dotnet/Program.cs` |
| Node.js | Node.js 22.12+ | [Configuración](nodejs/README.md) | [LIVE_DEMO](nodejs/LIVE_DEMO.md) | `nodejs/src/index.ts` |
| Python | Python 3.11+ | [Configuración](python/README.md) | [LIVE_DEMO](python/LIVE_DEMO.md) | `python/main.py` |
| Go | Go 1.24+ | [Configuración](go/README.md) | [LIVE_DEMO](go/LIVE_DEMO.md) | `go/main.go` |
| Java | Java 17+, Maven 3.9+ | [Configuración](java/README.md) | [LIVE_DEMO](java/LIVE_DEMO.md) | `java/src/main/java/demo/CopilotSdkLiveDemo.java` |
| Rust | Rust 1.94+ | [Configuración](rust/README.md) | [LIVE_DEMO](rust/LIVE_DEMO.md) | `rust/src/main.rs` |

Completa la [preparación](../workshop/intro-00-preflight.md) antes de la sesión cronometrada.
Autentícate con `copilot auth login`, cambia a `start-intro/<language>` y abre esa carpeta en tu
editor (`code .` para VS Code). Permanece en esa carpeta para los comandos de dependencias y
ejecución.

Los puntos de entrada contienen marcadores de posición de forma intencionada. Abre
**`LIVE_DEMO.md`** junto al punto de entrada elegido. Sigue **las cuatro ediciones del primer
acto**: iniciar el cliente, comprobar la autenticación, crear la sesión y enviar Hello World.
Después, sigue el **segundo acto** para elegir un modelo y un episodio, conceder sus capacidades a
la sesión y sustituir el prompt.

El sitio web del taller muestra estas mismas secciones de guía en la
[lección de Hello World](../workshop/intro-02-hello-world.md) y la
[lección de pódcast](../workshop/intro-03-podcast-agent.md); no enseña una implementación diferente.
Estos auxiliares incluyen selección de modelo y episodio, herramientas tipadas de búsqueda RSS y
aprobación interactiva de herramientas. Mantenlos sin cambios durante el taller.

Se incluyen las dependencias y los lockfiles disponibles. Las compilaciones de comprobación básica
no necesitan autenticación de Copilot ni un prompt en vivo. Ejecutar la aplicación completada
necesita acceso a Copilot; el flujo de trabajo de pódcast también necesita acceso al feed RSS
oficial. Tus ediciones en la ubicación aparecen en `git status`, que es lo esperado.

## Origen

Estos códigos fuente de proyecto inicial y las guías `LIVE_DEMO.md` se importaron desde
[jamesmontemagno/copilot-sdk-intro](https://github.com/jamesmontemagno/copilot-sdk-intro) en la
revisión [`f744ec6`](https://github.com/jamesmontemagno/copilot-sdk-intro/tree/f744ec66b6429df876c18f443bd6b1c3144d4e97).
Las guías conservan la progresión en dos actos del origen y las cuatro ediciones numeradas de Hello
World. Las adaptaciones locales usan las rutas de este repositorio, acotan las esperas de
finalización, cierran los recursos del SDK, restringen Hello World a una lista de permitidos de
herramientas vacía y aportan las suscripciones de streaming que faltaban en Java/Rust. Go conserva
una suscripción en lugar de imprimir dos veces cada fragmento de texto. Node.js deja que el envío
acotado propague los errores de sesión en lugar de producir una excepción desde una devolución de
llamada. Su auxiliar RSS usa descodificación XML basada en analizador y extracción de HTML a texto
sin formato, con pruebas de regresión para CDATA, descodificación de entidades y exclusión de
script/style. Los seis auxiliares RSS usan tiempos de espera de red finitos de diez segundos. Java
rechaza declaraciones XML DOCTYPE y recursos externos al leer metadatos de duración con espacios de
nombres. Python y Rust reconocen las cargas de permisos de herramientas personalizadas del SDK; Rust
lee las aprobaciones en un hilo de entrada desacoplado para que un tiempo de espera de turno pueda
seguir cerrando el runtime. El repositorio ascendente es una atribución, no un requisito de
configuración.
