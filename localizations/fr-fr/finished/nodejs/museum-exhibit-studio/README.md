# Museum Exhibit Studio

Cet exemple Node.js/TypeScript terminé comporte trois fichiers sources :

- `src/curator.ts` contient le module utilitaire prêt à l'emploi : faits approuvés et
  menu de sélection des faits, streaming limité, validation déterministe, autorisations Wikipedia
  à périmètre restreint, autorisation d'écriture facultative de `exhibit.html`, texte de prompt fixe et
  message d'échec.
- `src/system-messages.ts` contient les messages système prêts à l'emploi du conservateur et de recherche.
- `src/index.ts` contient le code SDK écrit par l'apprenant : les instructions dans les
  prompts de l'exposition et de la page, les configurations de session, l'exécuteur de session, la recherche facultative,
  la génération, la validation et l'étape finale HTML facultative.

Les commentaires `>>> BEGIN` / `<<< END` dans `src/index.ts` sont les régions nommées que les leçons
remplissent. Chaque ligne `BEGIN` liste les étapes qui insèrent ou remplacent cette région.

## Exécutez l'exemple

```bash
cd finished/nodejs/museum-exhibit-studio
npm ci
npm start
```

Utilisez `npm run build` pour vérifier les types sans contacter de modèle.

## Architecture de sécurité

La génération enregistre toujours `approved_fact_lookup` et l'ajoute à la liste d'autorisation ; cet
outil retourne des faits approuvés limités. Avec une recherche citée exploitable, elle enregistre
aussi l'outil local en lecture seule `approved_wikipedia_fact_lookup` et l'ajoute à la liste
d'autorisation, puis demande au conservateur d'appeler les deux outils avant d'écrire le récit et
les questions des visiteurs. La deuxième recherche retourne un instantané du contenu de recherche et
des citations, pas un accès à Wikipedia en direct. Les faits approuvés sont prioritaires ; la
recherche est une donnée supplémentaire, pas des instructions ni des faits vérifiés par un humain.
La recherche Wikipedia facultative s'exécute dans une session distincte avec des outils `search` et
`readArticle` limités, un gestionnaire d'autorisations qui refuse par défaut, des `## Sources`
citées, et aucun contrat JSON ni boucle d'approbation des ajouts proposés. La recherche n'est jamais
fusionnée avec les faits approuvés par l'éducateur. Une recherche refusée conserve le chemin initial
avec un seul outil ; une recherche échouée ou un résumé cité inexploitable affiche un avertissement
et suit le même repli. Les sources s'affichent toujours après l'exposition. En cas d'exécution de
recherche réussie, vérifiez que les deux événements de recherche locale apparaissent avant la
génération.

Après la génération, des contrôles déterministes signalent la structure, la longueur du récit, les
questions des visiteurs et le vocabulaire interdit. Si elle est sélectionnée, l'étape HTML expose
uniquement `builtin:apply_patch` et `builtin:create`. Son gestionnaire d'autorisations approuve
l'écriture d'exactement `exhibit.html` dans le dossier de l'application. Les contrôles structurels
ne prouvent pas l'ancrage factuel ; relisez les affirmations issues de la recherche avant
publication.

Voici l'application qu'un apprenant obtient après les leçons du musée, et non une architecture de
référence séparée. Le point d'entrée conserve un petit exécuteur de session qui démarre le client,
crée la session, applique le délai d'expiration, rejette les sorties vides et nettoie tous les
chemins ; les étapes de recherche, de génération et HTML facultative le réutilisent avec différentes
configurations de session. Suivez le parcours depuis
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
