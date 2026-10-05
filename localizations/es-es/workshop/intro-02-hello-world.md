# Paso 2: Hello World en streaming

> **Tiempo:** 10 minutos

## Empieza con el proyecto inicial

Edita el punto de entrada de la carpeta `start-intro` que abriste durante la preparación. Abre su
**`LIVE_DEMO.md`** junto al código. Esta lección muestra **Primer acto: Hello World** desde ese
mismo archivo, no una implementación aparte.

Sigue sus cuatro ediciones numeradas en orden: **iniciar el cliente, comprobar la autenticación,
crear la sesión y enviar Hello World**. Conserva el control de eventos incluido en el proyecto
inicial; Java y Rust incluyen la suscripción que falta en la ubicación marcada. Completa las cuatro
ediciones antes de ejecutar.

:::language dotnet
Trabaja en `start-intro/dotnet`, editando `Program.cs`.
[Abre la guía de demostración local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md).
:::
:::language nodejs
Trabaja en `start-intro/nodejs`, editando `src/index.ts`.
[Abre la guía de demostración local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md).
:::
:::language python
Trabaja en `start-intro/python`, editando `main.py`.
[Abre la guía de demostración local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md).
:::
:::language go
Trabaja en `start-intro/go`, editando `main.go`. [Abre la guía de demostración local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md).
:::
:::language java
Trabaja en `start-intro/java`, editando `src/main/java/demo/CopilotSdkLiveDemo.java`.
[Abre la guía de demostración local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md).
:::
:::language rust
Trabaja en `start-intro/rust`, editando `src/main.rs`.
[Abre la guía de demostración local](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md).
:::

## Primer acto: Hello World

<!-- LIVE_DEMO -->

## Ejecútalo

Usa el comando de punto de control de la guía de demostración, desde la carpeta del lenguaje
seleccionado. Espera una respuesta real de una frase transmitida en streaming y después la salida
del programa. El banner del proyecto inicial o solo un mensaje de autenticación no son un Hello
World correcto.

La sesión usa una **lista de permitidos de herramientas vacía** con un controlador de permisos.
Aprobar todo no es por sí mismo un límite de seguridad; la lista de permitidos vacía elimina las
capacidades de herramientas para este primer ejercicio. El acto siguiente sustituye ambas opciones.

## Comprueba lo que has aprendido

Señala las cuatro ediciones que has hecho. Explica por qué el cliente y la sesión son diferentes, y
qué evento informa de que el turno se ha completado.

## Solución de problemas de esta ejecución

- **No hay una respuesta real:** guarda el punto de entrada y completa los cuatro pasos de la guía.
- **Error de autenticación:** ejecuta `copilot auth login` en el mismo entorno.
- **Modelo no disponible:** cambia el modelo preferido del proyecto inicial por un ID disponible
  para tu cuenta. El acto siguiente presenta el selector de modelos.
- **El turno se bloquea:** conserva el controlador de permisos y la lista de permitidos vacía; verifica la
  conectividad de la CLI y la espera de finalización.

Continúa con [Crea el agente de pódcast](intro-03-podcast-agent.md).

## Más información

- [API de lenguajes de Copilot SDK](https://github.com/github/copilot-sdk)
- [Proyectos iniciales y guías de demostración incluidos](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
