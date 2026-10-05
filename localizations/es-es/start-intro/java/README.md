# Proyecto inicial de SDK 101: Java

Requiere [Java 17 o una versión posterior](https://adoptium.net/) y acceso autenticado a Copilot. Se
incluye Maven Wrapper (`./mvnw`), así que no hace falta instalar Maven por separado. En Windows,
ejecuta `mvnw.cmd` en lugar de `./mvnw`.

Desde la raíz del repositorio del taller:

```shell
cd start-intro/java
./mvnw dependency:go-offline
```

Abre esta carpeta en tu editor (`code .`) y edita `src/main/java/demo/CopilotSdkLiveDemo.java`
siguiendo las cuatro ediciones numeradas de [LIVE_DEMO.md](LIVE_DEMO.md), Primer acto. Después
ejecuta:

```shell
./mvnw compile exec:java
```

El punto de entrada sin modificar está incompleto deliberadamente; no es un Hello World funcional.
Continúa con el Segundo acto de la misma guía para el agente de pódcast. Reutiliza las clases
auxiliares de herramienta, selección de modelo y permisos del paquete `demo`.

Ejecuta `./mvnw compile` para compilar sin enviar un prompt de Copilot. Consulta la
[preparación](../../workshop/intro-00-preflight.md) para las comprobaciones de acceso y la solución
de problemas, y la
[API oficial del SDK de Java](https://github.com/github/copilot-sdk/tree/main/java) como referencia.
