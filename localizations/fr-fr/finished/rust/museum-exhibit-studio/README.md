# Museum Exhibit Studio

Cet exemple Rust utilise le GitHub Copilot SDK comme harnais d'agent spécialisé, hors génie logiciel. Les utilitaires fournis se trouvent dans `src/lib.rs` : ensembles de faits approuvés et menu de sélection des faits, streaming, validation, autorisations limitées, texte de prompt fixe et message d'échec. Les messages système du conservateur et de recherche sont fournis dans `src/system_messages.rs`. Le code SDK écrit par l'apprenant se trouve dans `src/main.rs` : les instructions dans les prompts d'exposition et de page, la configuration de session et l'exécuteur de session.

Les commentaires `>>> BEGIN` / `<<< END` dans `src/main.rs` sont les régions nommées que les leçons remplissent. Chaque ligne `BEGIN` énumère les étapes qui insèrent ou remplacent cette région.

## Exécutez l'exemple

```bash
cargo run --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml --locked
```

Définissez `COPILOT_MODEL` pour sélectionner un modèle de génération. L'exemple nécessite une GitHub Copilot CLI authentifiée.

Vérifiez sans contacter de modèle :

```bash
cargo check --locked --manifest-path finished/rust/museum-exhibit-studio/Cargo.toml
```

## Ce que l'exemple enseigne

La session de génération utilise un message système de conservateur de remplacement, valide les
faits approuvés, diffuse en streaming avec un délai d'expiration de 120 secondes, enregistre
toujours `approved_fact_lookup` et l'ajoute à la liste d'autorisation, rejette les sorties vides et
affiche une validation structurelle déterministe. Avec une recherche citée exploitable, elle
enregistre aussi `approved_wikipedia_fact_lookup` local en lecture seule et l'ajoute à la liste
d'autorisation, puis demande les deux appels avant d'écrire le récit et les questions des visiteurs.

La recherche Wikipedia facultative est séparée : elle expose uniquement les outils MCP `search` et
`readArticle` limités, utilise un gestionnaire d'autorisations qui refuse par défaut et produit un
résumé et des sources citées. La nouvelle recherche locale retourne un instantané de ce corps et des
citations, sans accès à Wikipedia en direct ni fusion de la recherche avec les faits approuvés par
l'éducateur. Les faits approuvés sont prioritaires ; la recherche « approuvée » est une donnée
supplémentaire acceptée par l'application, pas des faits vérifiés par un humain ni des instructions.
Une recherche refusée conserve le chemin à un seul outil. Une recherche échouée ou un résumé cité
inexploitable affiche un avertissement et suit le même repli. Les sources s'affichent après
l'exposition ; une recherche réussie doit montrer les deux événements de recherche locale avant la
génération. Les contrôles structurels ne prouvent pas l'ancrage factuel ; relisez donc les
affirmations issues de la recherche avant publication.

La génération HTML facultative utilise `builtin:apply_patch` ou `builtin:create` avec un gestionnaire d'autorisations limité à un seul fichier qui peut écrire uniquement `exhibit.html` dans le dossier de travail de l'application.

Voici l'application qu'un apprenant obtient après les leçons du musée, et non une architecture de
référence séparée. Le point d'entrée conserve un petit exécuteur de session qui démarre le client,
crée la session, applique le délai d'expiration, rejette les sorties vides et nettoie tous les
chemins ; les étapes de recherche, de génération et HTML facultative le réutilisent avec différentes
configurations de session. Suivez le parcours depuis
[`workshop/museum-00-preflight.md`](https://github.com/github/copilot-sdk-workshop/blob/main/workshop/museum-00-preflight.md).
