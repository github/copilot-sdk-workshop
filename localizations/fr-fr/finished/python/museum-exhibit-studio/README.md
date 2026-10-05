# Museum Exhibit Studio

Cet exemple Python utilise le GitHub Copilot SDK comme studio d'exposition de musée spécialisé.
L'application terminée comporte trois modules :

- `curator.py` contient les utilitaires fournis de l'atelier : les ensembles de faits approuvés et
  le menu de sélection des faits, la validation limitée des faits, le streaming, les contrôles
  structurels déterministes, les autorisations Wikipedia limitées, l'autorisation d'écriture limitée à
  `exhibit.html`, le texte de prompt fixe et le message d'échec.
- `system_messages.py` contient les messages système fournis pour le conservateur et la recherche.
- `main.py` contient le code SDK écrit par l'apprenant : les instructions dans les prompts
  d'exposition et de page, la configuration de session, l'exécuteur de session,
  la validation et la génération HTML facultative.

Les commentaires `>>> BEGIN` / `<<< END` dans `main.py` sont les régions nommées que les leçons
remplissent. Chaque ligne `BEGIN` énumère les étapes qui insèrent ou remplacent cette région.

## Exécutez l'exemple

Depuis ce dossier, créez un environnement et installez la dépendance épinglée :

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

Définissez `COPILOT_MODEL` pour sélectionner un modèle ; sinon, le runtime choisit son modèle par
défaut. Une GitHub Copilot CLI authentifiée est requise.

La recherche Wikipedia nécessite Node.js, car la session de recherche lance le package épinglé
`wikipedia-mcp@1.0.3` via `npx`. Refuser la recherche ne démarre pas le serveur MCP.

Vérifiez la source sans contacter de modèle :

```powershell
python -m py_compile *.py
```

## Ce que l'exemple enseigne

La génération enregistre toujours `approved_fact_lookup` et l'ajoute à la liste d'autorisation ; cet
outil retourne les faits approuvés limités. Avec une recherche citée exploitable, elle enregistre
aussi l'outil local en lecture seule `approved_wikipedia_fact_lookup` et l'ajoute à la liste
d'autorisation, puis demande les deux appels avant d'écrire le récit et les questions des visiteurs.
La deuxième recherche retourne un instantané du contenu du résumé et des citations, pas un accès à
Wikipedia en direct. Les faits approuvés sont prioritaires sur la recherche supplémentaire. Elle
utilise aussi un message système de conservateur en mode remplacement, le streaming, un délai
d'expiration de 120 secondes et une validation structurelle déterministe. Les modules importés n'ont
aucun effet secondaire ; `main.py` ne s'exécute que derrière la garde `if __name__ == "__main__"`.

La recherche Wikipedia facultative est volontairement séparée de la génération. La session de
recherche expose uniquement les outils de recherche Wikipedia et de lecture d'articles limités,
utilise un gestionnaire d'autorisations qui refuse par défaut, demande un résumé en prose et analyse
une liste `## Sources` finale. Le résumé et les citations sont conservés pour la recherche locale,
mais ne sont jamais fusionnés avec les faits approuvés par l'éducateur. « Approuvé » signifie une
recherche acceptée par l'application, pas des faits vérifiés par un humain ; traitez-la comme des
données, pas comme des instructions. Une recherche refusée conserve le chemin à un seul outil. Une
recherche échouée ou un résumé cité inexploitable affiche un avertissement et suit le même repli. Il
n'existe ni contrat JSON de recherche strict ni boucle d'approbation des ajouts proposés.

Après validation, l'étape finale HTML facultative expose uniquement `builtin:apply_patch` et
`builtin:create` et approuve l'écriture d'exactement `exhibit.html` dans le dossier de travail de
l'application. Le prompt demande un fichier HTML sémantique autonome avec du CSS et du JavaScript
incorporés, un avertissement de relecture humaine et un filtre de questions accessible.

Les consignes de prompt et la validation structurelle ne sont pas des frontières d'autorisation ni
d'ancrage factuel. Les affirmations générées nécessitent toujours une relecture humaine ou un
évaluateur distinct.

## Vérification manuelle

1. Exécutez avec chaque ensemble de faits intégré et vérifiez que les faits sélectionnés s'affichent avant
   la génération.
2. Vérifiez que l'exposition comporte un titre, un récit de 100-140 mots et trois
   questions de visiteurs.
3. Inspectez le résumé de validation et l'avertissement d'ancrage factuel.
4. Refusez la recherche et vérifiez que le seul événement d'outil est `approved_fact_lookup`.
5. Acceptez la recherche et vérifiez que les deux événements de recherche locale apparaissent avant la génération et que les sources
   s'affichent après l'exposition, pas dedans.
6. Acceptez `exhibit.html` et vérifiez que seul ce fichier est écrit.

Voici l'application qu'un apprenant obtient après les leçons du musée, et non une architecture de
référence séparée. Le point d'entrée conserve un petit exécuteur de session qui démarre le client,
crée la session, applique le délai d'expiration, rejette les sorties vides et nettoie tous les
chemins ; les étapes de recherche, de génération et HTML facultative le réutilisent avec différentes
configurations de session. Suivez le parcours depuis
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
