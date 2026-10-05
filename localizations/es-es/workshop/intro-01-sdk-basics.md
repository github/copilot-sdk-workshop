# Paso 1: Conceptos básicos del SDK

> **Tiempo:** 5 minutos

## El SDK en una frase

El GitHub Copilot SDK permite que tu aplicación inicie una conversación de Copilot, transmita sus
respuestas en streaming y exponga funciones específicas de la aplicación como herramientas.

El SDK no es un modelo que alojes tú mismo. Tu aplicación se conecta al **runtime de Copilot**, que
coordina las solicitudes al modelo y las llamadas a herramientas.

| Término | Qué hace en este taller |
| --- | --- |
| Cliente | Inicia el runtime y se conecta a él; comprueba la autenticación. |
| Sesión | Contiene una conversación, su configuración, los mensajes y los resultados de herramientas. |
| Prompt | Asigna una tarea para este turno, como escribir una frase. |
| Evento | Notifica un fragmento de texto, actividad de herramientas, un error o un turno completado. |
| Herramienta | Una función con nombre de la aplicación que el modelo puede solicitar, como una búsqueda RSS. |

El bucle básico es:

```text
Your app -> client -> session -> prompt
                              <- response events
Your app <- permission request <- tool request
Your app -> tool result        -> next model response
```

Un cliente puede atender varias sesiones. Para esta introducción, crea un cliente y una sesión por
cada ejecución del programa y después cierra ambos. No necesitas un servidor web, un framework de
agentes ni una base de datos.

## Abre la aplicación

Abre **`LIVE_DEMO.md`** junto al punto de entrada siguiente. Su **primer acto** es la secuencia
práctica de este taller:

1. Inicia el cliente.
2. Comprueba la autenticación.
3. Crea la sesión.
4. Envía Hello World.

El comentario `Step 4` del proyecto inicial marca el control de eventos, que se proporciona o se
muestra en la guía; el envío se marca como `Step 5` en el código. Son ubicaciones en el andamiaje,
no ejercicios adicionales más allá de las cuatro ediciones de la guía.

:::language dotnet
En la carpeta `start-intro/dotnet`, abre `Program.cs`. Busca los marcadores de posición del cliente,
la autenticación y la sesión. El controlador de eventos ya imprime texto transmitido en streaming y
hace seguimiento de la finalización del turno.
:::
:::language nodejs
En la carpeta `start-intro/nodejs`, abre `src/index.ts`. Busca los marcadores de posición del
cliente, la autenticación y la sesión. El controlador de eventos ya muestra qué eventos puede
observar la aplicación.
:::
:::language python
En la carpeta `start-intro/python`, abre `main.py`. Busca los marcadores de posición del cliente, la
autenticación y la sesión. El controlador de eventos ya imprime texto transmitido en streaming e
indica cuándo termina el turno.
:::
:::language go
En la carpeta `start-intro/go`, abre `main.go`. Busca los marcadores de posición del cliente, la
autenticación y la sesión. El controlador de eventos ya imprime texto transmitido en streaming y la
actividad de herramientas.
:::
:::language java
En la carpeta `start-intro/java`, abre `src/main/java/demo/CopilotSdkLiveDemo.java`. Busca los
marcadores de posición del cliente, la autenticación y la sesión. La lección siguiente muestra dónde
añadir las suscripciones que faltan mientras sigues la guía de demostración.
:::
:::language rust
En la carpeta `start-intro/rust`, abre `src/main.rs`. Busca los marcadores de posición del cliente,
la autenticación y la sesión. La lección siguiente muestra dónde añadir la suscripción que falta
mientras sigues la guía de demostración.
:::

## Qué controlas

La **aplicación** elige el modelo, la identidad de la sesión, las herramientas expuestas y la
directiva de permisos. El **modelo** propone texto y llamadas a herramientas dentro de esa
configuración. El controlador de permisos responde si se puede ejecutar una capacidad solicitada.

El streaming cambia cómo muestras una respuesta, no su fiabilidad. Un mensaje del sistema guía el
comportamiento; no es un mecanismo de control de acceso ni una prueba de exactitud factual. Una
herramienta permite que la aplicación proporcione datos reales de origen, pero aun así debes revisar
el texto resultante.

En la primera ejecución, la tarea es solo un Hello World de una frase. En la segunda ejecución, la
aplicación concede dos herramientas RSS ya preparadas y de solo lectura, y te pide que apruebes su
uso. En esta ruta no escribiremos un analizador de canales ni configuraremos MCP.

## Comprueba lo que has aprendido

Señala dónde se iniciará el cliente y dónde se creará la sesión. Explica la diferencia en una frase:
el cliente se conecta al runtime; la sesión es la conversación.

Continúa con [Hello World en streaming](intro-02-hello-world.md).

## Más información

- [Información general de Copilot SDK y API de lenguajes](https://github.com/github/copilot-sdk)
- [El bucle de agente del runtime](https://github.com/github/copilot-sdk/blob/main/docs/features/agent-loop.md)
