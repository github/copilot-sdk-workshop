# Proyecto inicial de SDK 101: Python

Requiere [Python 3.11 o una versión posterior](https://www.python.org/downloads/) y acceso autenticado a Copilot.

Desde la raíz del repositorio del taller, en Windows PowerShell:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

En macOS/Linux:

```bash
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Abre esta carpeta en tu editor (`code .`) y edita `main.py` siguiendo las cuatro ediciones numeradas
de [LIVE_DEMO.md](LIVE_DEMO.md), Primer acto. Ejecuta `.\.venv\Scripts\python.exe main.py` en
Windows o `.venv/bin/python main.py` en macOS/Linux. Usar directamente el intérprete evita la
activación y los cambios de directiva de ejecución.

El punto de entrada sin modificar está incompleto deliberadamente; no es un Hello World funcional.
Continúa con el Segundo acto de la misma guía para el agente de pódcast. Reutiliza
`github_podcast_tools.py`, `model_selector.py` y `permission_prompt.py` sin editarlos.

Consulta la [preparación](../../workshop/intro-00-preflight.md) para las comprobaciones de acceso y
la solución de problemas, y la
[API oficial del SDK de Python](https://github.com/github/copilot-sdk/tree/main/python) como
referencia.
