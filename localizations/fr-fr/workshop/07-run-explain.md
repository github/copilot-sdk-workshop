# Étape 7 : Exécutez et expliquez l'application

> **Durée :** 10 minutes

## Ce que vous pourrez expliquer

Vous exécuterez l'application complète et expliquerez son état, les périmètres des outils, le
périmètre d'autorisation et les limites du rapport.

## Découvrez tout le système d'agent

:::language dotnet
L'application terminée est un hôte d'agent. Sa session coordonne un modèle, une fonction propre à
l'application et un navigateur exécuté dans un autre processus :

```text
Console application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language nodejs
L'application terminée est un hôte d'agent. Sa session coordonne un modèle, une fonction propre à
l'application et un navigateur exécuté dans un autre processus :

```text
Node.js application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- CopilotSession --- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

Le rapport terminé se trouve aussi dans [`finished/nodejs/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/nodejs/accessibility-report).
:::

:::language python
L'application terminée est un hôte d'agent. Sa session coordonne un modèle, une fonction propre à
l'application et un navigateur exécuté dans un autre processus :

```text
Python application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```

Le rapport terminé se trouve aussi dans [`finished/python/accessibility-report`](https://github.com/github/copilot-sdk-workshop/tree/main/finished/python/accessibility-report).
:::

:::language go
L'application terminée est un hôte d'agent. Sa session coordonne un modèle, une fonction propre à
l'application et un navigateur exécuté dans un autre processus :

```text
Go application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language rust
L'application terminée est un hôte d'agent. Sa session coordonne un modèle, une fonction propre à
l'application et un navigateur exécuté dans un autre processus :

```text
Rust application
  |
  +-- Client ---------------- runtime connection
       |
       `-- Session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

:::language java
L'application terminée est un hôte d'agent. Sa session coordonne un modèle, une fonction propre à
l'application et un navigateur exécuté dans un autre processus :

```text
Java application
  |
  +-- CopilotClient -------- runtime connection
       |
       `-- session ---------- one conversation and its context
            |
            +-- accessibility_rule_lookup
            |     same process, application-owned data
            |
            `-- Playwright MCP
                  separate process, scoped permission handler
                       |
                       `-- Browser target
```
:::

## Poussez la conception au-delà de cet atelier

Comprendre ces périmètres vous permet de réutiliser la conception dans une autre application au lieu
de seulement reproduire le code de l'atelier. Une recherche en base de données, un service de
déploiement ou un outil de suivi des problèmes peut utiliser des outils différents, mais les mêmes
questions de propriété et de confiance s'appliquent.

:::language dotnet
Le flux complet est
`URL -> Playwright inspection -> C# WCAG lookup -> structured accessibility report`.
:::

:::language nodejs
Le flux complet est
`URL -> Playwright inspection -> TypeScript WCAG lookup -> structured accessibility report`.
:::

:::language python
Le flux complet est
`URL -> Playwright inspection -> Python WCAG lookup -> structured accessibility report`.
:::

:::language go
Le flux complet est
`URL -> Playwright inspection -> Go WCAG lookup -> structured accessibility report`.
:::

:::language rust
Le flux complet est
`URL -> Playwright inspection -> Rust WCAG lookup -> structured accessibility report`.
:::

:::language java
Le flux complet est
`URL -> Playwright inspection -> Java WCAG lookup -> structured accessibility report`.
:::

## Savourez votre réussite

Il n'y a pas de code à modifier. Conservez l'implémentation de l'étape 6 en place afin que cette
exécution teste l'application que vous avez créée.

## Exécutez-le

:::language dotnet
```bash
dotnet run
```
:::
:::language nodejs
```bash
npm start -- "{{TARGET_APP_URL}}"
```
:::
:::language python
```bash
python main.py "{{TARGET_APP_URL}}"
```
:::
:::language go
```bash
go run . "{{TARGET_APP_URL}}"
```
:::
:::language rust
```bash
cargo run -- "{{TARGET_APP_URL}}"
```
:::
:::language java
```bash
./mvnw compile exec:java -Dexec.args="--allow-local-demo-mcp {{TARGET_APP_URL}}"
```

> **Avertissement Java local-demo :** Cette option explicite est une solution de contournement
> temporaire pour [github/copilot-sdk#2273](https://github.com/github/copilot-sdk/issues/2273). Sans elle,
> le callback refuse par défaut, sauf s'il peut vérifier l'URL exacte dans la charge utile d'autorisation. Avec elle,
> la session approuve uniquement le type d'autorisation `mcp`, une demande à la fois, dans le cadre de la liste
> d'autorisation Playwright `browser_navigate` configurée ; elle ne peut pas imposer la cible exacte. Utilisez-la uniquement pour la
> cible locale contrôlée de l'atelier, jamais pour des URL de production, partagées ou non fiables.
:::
Utilisez la cible de l'atelier :

```text
{{TARGET_APP_URL}}
```

Surveillez les cinq phases :

1. Le client se connecte et crée une session.
2. Playwright accède à la cible exacte et crée un instantané d'accessibilité.
3. Le lecteur local à périmètre étroit renvoie l'instantané de cette exécution.
4. Le catalogue local est appelé pour les constats pris en charge par le navigateur.
5. La réponse respecte le contrat de rapport et indique ses limites.

:::language dotnet
Votre transcription variera, mais elle doit avoir cette forme :

```text
=== Accessibility Report Generator ===

Enter URL to analyze: {{TARGET_APP_URL}}

Connected to the Copilot runtime: ...
Analyzing: {{TARGET_APP_URL}}

[tool:start] browser_navigate / playwright-browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```
:::

:::language nodejs
Votre transcription variera, mais elle doit avoir cette forme :

```text
[tool:start] browser_navigate
[tool:done] success=true
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=true
[tool:start] accessibility_rule_lookup
[tool:done] success=true
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`streamResponse` affiche des lignes de début et de fin d'outil et diffuse le texte de l'assistant en streaming vers stdout.
:::

:::language python
Votre transcription variera, mais elle doit avoir cette forme :

```text
[tool:start] browser_navigate
[tool:done] success=True
[tool:start] read_latest_accessibility_snapshot
[tool:done] success=True
[tool:start] accessibility_rule_lookup
[tool:done] success=True
...

# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

`main.py` lance `report.main`, qui attend `session.idle` après avoir diffusé les deltas en streaming.
:::

:::language go
Votre transcription variera, mais elle doit avoir cette forme :

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Expliquez que `Client` gère le cycle de vie du Copilot CLI, que `Session` gère une conversation et
que le gestionnaire d'autorisations contrôle la navigation externe. Le rapport attendu s'appuie sur
des preuves.
:::

:::language rust
Votre transcription variera, mais elle doit avoir cette forme :

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Expliquez que `Client` gère le runtime, que `Session` distribue les événements, que les outils typés
appartiennent à l'application et que le gestionnaire d'autorisations ne fait confiance qu'à la
navigation exacte.
:::

:::language java
Votre transcription variera, mais elle doit avoir cette forme :

```text
# Accessibility review
## Finding 1: ...
- Evidence: ...
- WCAG criterion: ...
- Recommended remediation: ...
## Review limits
...
```

Expliquez que Maven compile l'application Java 17, que `CopilotClient` gère le runtime et que les
outils restent limités à leur périmètre. Par défaut, le callback d'autorisation accepte uniquement
l'URL canonique ; avec l'option local-demo explicite, il est limité au type `mcp` configuré, mais ne
peut pas vérifier cette URL.
:::

La cible contrôlée inclut intentionnellement des problèmes observables par le navigateur : une
alternative textuelle manquante, l'absence de repère `main`, une séquence de titres illogique et une
zone de texte sans nom accessible. Comparez le rapport au
[HTML de la cible publiée](https://github.com/github/copilot-sdk-workshop/blob/main/docs/target-app/index.html)
; n'acceptez pas de constat absent à la fois de l'instantané et de la source.

<details>
<summary>Dépannage de l'exécution complète</summary>

| Symptôme | Correction |
|---|---|
| Un problème connu est omis | La sortie de l'agent peut varier. Réexécutez une fois, mais exigez des preuves plutôt que de forcer une réponse prédéterminée. |
| Un problème signalé n'est pas dans la page | Rejetez-le comme non fondé ; le prompt exige des preuves spécifiques du navigateur. |
| Un outil est refusé | Vérifiez que `browser_navigate` utilise la cible exacte saisie. |
| Le lecteur ne trouve aucun instantané | Conservez l'ordre du prompt : naviguez avant d'appeler `read_latest_accessibility_snapshot`. |
| Le runtime ne peut pas démarrer | Réauthentifiez-vous avec `copilot login`, confirmez que le CLI est sur `PATH`, puis réessayez la commande d'exécution pour votre langage. |

</details>

> **Cette étape est terminée lorsque :** le rapport est étayé par des preuves, les noms d'outils sont visibles,
> et vous pouvez répondre aux questions d'architecture ci-dessous sans lire le code.

## Vérifiez votre compréhension

1. Quel état appartient à la session ?
2. Pourquoi le catalogue WCAG est-il local ?
3. Pourquoi Playwright est-il externe ?
4. Où les autorisations sont-elles appliquées ?
5. Qu'est-ce qui change lorsqu'un autre serveur MCP est ajouté ?

<details>
<summary>Comparez votre explication</summary>

1. La session gère les messages d'une conversation, la réponse du modèle et les résultats des outils.
2. L'application possède les données du catalogue et la recherche déterministe, donc la fonction reste locale.
3. Playwright est une capacité de navigateur réutilisable avec son propre processus Node.js et ses dépendances.
4. La liste d'autorisation des outils MCP expose uniquement la navigation, et le gestionnaire d'autorisations approuve uniquement
   la cible exacte. Le lecteur local de confiance n'accepte aucun chemin et lit uniquement un instantané nouvellement
   généré ; le catalogue est également en lecture seule. Ces outils propres à l'application ne déclenchent pas d'autorisation.
5. Ajoutez la configuration du serveur, exposez uniquement les outils nécessaires, définissez sa politique de confiance et continuez
   à observer ses appels via le même flux d'événements de session.

</details>

## Étape suivante

Continuez avec [Étape 8 : Sélectionnez un modèle](08-model-selection.md), puis transformez vos
constats en rapport HTML interactif à l'étape 9.

## En savoir plus

L'application de l'atelier s'exécute sur votre machine. Ces pages expliquent ce qui change lorsque
la même conception est déplacée ailleurs.

- [Services backend](https://github.com/github/copilot-sdk/blob/main/docs/setup/backend-services.md) :
  exécuter le serveur SDK côté serveur avec un CLI headless plutôt qu'un CLI local.
- [Mise à l'échelle et architecture multi-tenant](https://github.com/github/copilot-sdk/blob/main/docs/setup/scaling.md) :
  mise à l'échelle horizontale et modèles d'isolation qui empêchent la session d'un utilisateur d'accéder à celle d'un autre.
- [Instrumentation OpenTelemetry](https://github.com/github/copilot-sdk/blob/main/docs/observability/opentelemetry.md) :
  tracer les appels d'outils et les tours de conversation une fois que l'agent s'exécute là où vous ne pouvez pas regarder le terminal.
- [Intégration Microsoft Agent Framework](https://github.com/github/copilot-sdk/blob/main/docs/integrations/microsoft-agent-framework.md) :
  placer une session Copilot dans un workflow multi-agent plus large.
