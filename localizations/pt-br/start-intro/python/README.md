# Projeto inicial do SDK 101: Python

Requer [Python 3.11 ou mais recente](https://www.python.org/downloads/) e acesso autenticado ao Copilot.

A partir da raiz do repositório do workshop, no Windows PowerShell:

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

No macOS/Linux:

```bash
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Abra esta pasta no seu editor (`code .`) e edite `main.py` seguindo as quatro edições numeradas em
[LIVE_DEMO.md](LIVE_DEMO.md), Ato um. Execute `.\.venv\Scripts\python.exe main.py` no Windows ou
`.venv/bin/python main.py` no macOS/Linux. Usar o interpretador diretamente evita alterações de
ativação e política de execução.

O ponto de entrada intacto está deliberadamente incompleto, não é um Hello World funcional. Continue
com o Ato dois no mesmo guia para o agente de podcast. Reutilize `github_podcast_tools.py`,
`model_selector.py` e `permission_prompt.py` sem editá-los.

Consulte a [preparação](../../workshop/intro-00-preflight.md) para verificações de acesso e solução
de problemas, e a
[API oficial do SDK Python](https://github.com/github/copilot-sdk/tree/main/python) para referência.
