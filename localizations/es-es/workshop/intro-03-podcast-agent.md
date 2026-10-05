# Paso 3: Crea el agente de pódcast

> **Tiempo:** 12 minutos

## Continúa la misma demostración

Conserva la aplicación de Hello World que acabas de completar. Sigue **Segundo acto: conviértelo en
un agente de pódcast** en el mismo **`LIVE_DEMO.md`**. Esta lección muestra ese acto directamente.

Haz los tres cambios de la guía: elige un modelo y un episodio real, da a la sesión sus capacidades
e identidad y, después, sustituye el prompt. Reutiliza los auxiliares ya preparados en lugar de
escribir un analizador de canales o iniciar otro proyecto.

:::language dotnet
Continúa en `start-intro/dotnet/Program.cs`. [Segundo acto en la guía de demostración](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/dotnet/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language nodejs
Continúa en `start-intro/nodejs/src/index.ts`. [Segundo acto en la guía de demostración](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/nodejs/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language python
Continúa en `start-intro/python/main.py`. [Segundo acto en la guía de demostración](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/python/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language go
Continúa en `start-intro/go/main.go`. [Segundo acto en la guía de demostración](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/go/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language java
Continúa en `start-intro/java/src/main/java/demo/CopilotSdkLiveDemo.java`.
[Segundo acto en la guía de demostración](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/java/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::
:::language rust
Continúa en `start-intro/rust/src/main.rs`. [Segundo acto en la guía de demostración](https://github.com/github/copilot-sdk-workshop/blob/main/start-intro/rust/LIVE_DEMO.md#act-two-turn-it-into-a-podcast-agent).
:::

## Segundo acto: conviértelo en un agente de pódcast

<!-- LIVE_DEMO -->

## Ejecútalo

Usa la misma carpeta y el mismo comando de ejecución que en Hello World. Selecciona un modelo y uno
de los episodios reales. Lee el nombre de herramienta solicitado antes de aprobarlo con `y`. Pulsar
Entrar rechaza la solicitud; un rechazo no es una búsqueda correcta.

Espera una selección de modelo, una selección de episodio, un evento de inicio de herramienta, un
prompt de aprobación, un evento de herramienta completada y, después, texto de lanzamiento
transmitido en streaming.

La aplicación obtiene la lista de episodios antes de una llamada a herramienta solicitada por el
modelo. El controlador de permisos gobierna las herramientas solicitadas por el modelo, no todas las
solicitudes de red que hace la aplicación. Conserva el control de eventos y la limpieza existentes.

## Comprueba lo que has aprendido

Busca los dos registros de herramientas, su lista de permitidos, el controlador de permisos y el
mensaje del sistema. Explica qué ha cambiado respecto a Hello World.

Compara el resultado con los metadatos RSS del episodio seleccionado. Pedir una publicación de menos
de 280 caracteres **no impone el límite en el código**. Un mensaje del sistema no demuestra
exactitud factual ni seguridad sobre patrocinadores. Revisa las afirmaciones y la longitud **antes
de publicar**; no publiques nada durante este taller.

## Solución de problemas de esta ejecución

- **No hay lista de episodios:** comprueba el acceso al canal RSS oficial; no sustituyas
  una búsqueda fallida por datos inventados.
- **No hay prompt de aprobación:** comprueba los nombres de ambas herramientas, su lista de permitidos y el
  controlador de permisos de sustitución.
- **Esperando entrada:** usa un terminal interactivo y responde a su prompt.
- **Búsqueda denegada:** vuelve a ejecutar y aprueba la herramienta esperada de solo lectura si corresponde.
  No quites el controlador para eludir un rechazo.

Continúa con [Resumen y siguientes pasos](intro-04-wrap-up.md).

## Más información

- [API de herramientas y Copilot SDK](https://github.com/github/copilot-sdk)
- [Proyectos iniciales y guías de demostración incluidos](https://github.com/github/copilot-sdk-workshop/tree/main/start-intro)
