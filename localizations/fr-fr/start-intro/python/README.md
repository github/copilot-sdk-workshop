# Projet de départ SDK 101 : Python

Nécessite [Python 3.11 ou version ultérieure](https://www.python.org/downloads/) et un accès Copilot authentifié.

Depuis la racine du dépôt de l'atelier, dans Windows PowerShell :

```powershell
cd start-intro/python
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Sur macOS/Linux :

```bash
cd start-intro/python
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

Ouvrez ce dossier dans votre éditeur (`code .`) et modifiez `main.py` en suivant les quatre
modifications numérotées dans [LIVE_DEMO.md](LIVE_DEMO.md), Acte un. Exécutez
`.\.venv\Scripts\python.exe main.py` sous Windows ou `.venv/bin/python main.py` sur macOS/Linux.
Utiliser directement l'interpréteur évite l'activation et les modifications de stratégie
d'exécution.

Le point d'entrée non modifié est délibérément incomplet : ce n'est pas un Hello World fonctionnel.
Poursuivez avec l'Acte deux dans le même guide pour l'agent de podcast. Réutilisez
`github_podcast_tools.py`, `model_selector.py` et `permission_prompt.py` sans les modifier.

Consultez la [préparation](../../workshop/intro-00-preflight.md) pour les vérifications d'accès et
le dépannage, ainsi que la [documentation officielle de l'API du SDK Python](https://github.com/github/copilot-sdk/tree/main/python)
comme référence.
